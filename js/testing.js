// This is a testing module

// 

function TestModule () {

    // This method tests for the state graph and the svg graph
    // to have the same blueprint
    this.graphMapsSVG = function(graph, svg) {
        var goodMapping = true;

        var graphNodesNo = graph.allNodes.length;
        var graphEdgesNo = graph.adjacencyLists.length;
        
        if (graphNodesNo === svg.querySelectorAll(".node").length) {
            
            var svgCircle, svgName, svgLine, svgWeight;
            var node, edge;
            
            for (var it = 0; it < graphNodesNo; ++it) {
                node = graph.allNodes[it];

                svgCircle = svg.getElementById("circle" + node.id);
                svgName = svg.getElementById("name" + node.id);
                

                if (("circle" + node.id) !== svgCircle.id || node.x !== parseInt(svgCircle.getAttribute("cx")) || 
                    node.y !== parseInt(svgCircle.getAttribute("cy")) || node.r !== parseInt(svgCircle.getAttribute("r"))
                    || node.outlineWidth !== parseInt(svgCircle.style.strokeWidth)) {
                    
                    goodMapping = false;
                }

                if (("name" + node.id) !== svgName.id || node.x !== parseInt(svgName.getAttribute("x")) || 
                    node.y !== parseInt(svgName.getAttribute("y"))) {
                    goodMapping = false;
                }

            }
            
            // TODO: Implement on WEIGHT: Add weight check
            if (graph.directed === false) {
                var edge1, edge2;
                var circle1, circle2;
                var edgeNeighbours, edgeNeighboursNo;

                var edgesInAdjLists = 0;

                for (var it = 0; it < graphEdgesNo; ++it) {
                    edge = graph.adjacencyLists[it];
                    edgeNeighboursNo = edge.neighbours.length;
                    edgeNeighbours = edge.neighbours;

                    for (var it2 = 0; it2 < edgeNeighboursNo; ++it2) {
                        svgCircle = svg.getElementById("circle" + edge.id);
                        edge1 = svg.getElementById("line" + edge.id + "-" + edgeNeighbours[it2]);
                        edge2 = svg.getElementById("line" + edgeNeighbours[it2] + "-" + edge.id);
                        
                        ++edgesInAdjLists;
                        
                        if (edge1 !== null && edge2 !== null) {
                            goodMapping = false;
                            break;
                        }
                        if (edge1 === null && edge2 === null) {
                            goodMapping = false;
                            break;
                        }
                        svgEdge = edge1;
                        if (edge1 === null) {
                            svgEdge = edge2;
                        }

                        // This part checks if the edge are having the right coordinates
                        // OBS! This may not apply for directed graph exactly like this. Gonna see

                        circle1 = svg.getElementById("circle" + svgEdge.id.split("line")[1].split("-")[0]);
                        circle2 = svg.getElementById("circle" + svgEdge.id.split("line")[1].split("-")[1]);
                        
                        if (svgEdge.getAttribute("x1") !== circle1.getAttribute("cx") || 
                            svgEdge.getAttribute("y1") !== circle1.getAttribute("cy")) {
                            goodMapping = false;
                        }
                        if (svgEdge.getAttribute("x2") !== circle2.getAttribute("cx") || 
                            svgEdge.getAttribute("y2") !== circle2.getAttribute("cy")) {
                            goodMapping = false;
                        }
                    }
                }
                // Checks if twice the number of edges in the svg graph corresponds to the number of edges 
                // in the back-graph. This is because the adjacency list of the back-graph is symmetric.
                if (svg.querySelectorAll(".edge").length * 2 !== edgesInAdjLists) {
                    goodMapping = false;
                }
            }   
            else {
                // TODO: Implement later, make it test for directed graphs as well.
            } 
        }
        else {
            goodMapping = false;
        }

        return goodMapping;
    }
}

var test = new TestModule();