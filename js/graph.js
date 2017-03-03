"use strict";

// ASSUMPTION: The list of nodes is going to be monotonic both by id and index.
//             That is, allNodes[i].id < allNodes[j].id <=> i < j
//             This assumption is needed because nodes can be deleted or edited.
//             But the order should stay the same.
function Graph(directed = false) {
    this.allNodes = []; 
    this.adjacencyLists = []; 
    this.directed = directed;
    this.selfLoops = false;
    this.weighted = false;

    // TO BE CHECKED
    this.addNode = function(node1) {
        var nodeExists = this.getNodeIndexFromId(node1.id);
        
        if (nodeExists >= 0) {
            return false;
        }

        this.allNodes.push(node1);
        if(this.directed === false) {
            this.adjacencyLists.push({id: node1.id, neighbours: [], weights: []});
        }
        else {
            this.adjacencyLists.push({id: node1.id, 
                                      inNeighbours: [],
                                      inWeights: [],
                                      outNeighbours: [],
                                      outWeights: []});
        }
        
        return true;
    };

    // TO BE CHECKED 
    this.existsEdge = function(nodeId1, nodeId2) { // NEEDS TO BE COMPLETED

        var nodeAdjList = this.getNodeAdjacencyList(nodeId1);
        
        if (this.directed === false) {
            if (nodeAdjList !== null) {
                var neighbours = nodeAdjList.neighbours;
                var neighboursNo = neighbours.length;

                for (var ind = 0; ind < neighboursNo; ++ind) {
                    if (parseInt(neighbours[ind]) === parseInt(nodeId2)) {
                        return true;
                    }
                }
            }    
        }
        else {
            if (nodeAdjList !== null) {
                var outNeighbours = nodeAdjList.outNeighbours;
                var neighboursNo = outNeighbours.length;

                for (var ind = 0; ind < neighboursNo; ++ind) {
                    if (parseInt(outNeighbours[ind]) === parseInt(nodeId2)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // TO BE CHECKED
    this.addEdge = function(nodeId1, nodeId2) { // NEEDS TO BE COMPLETED
        var edgeExists = this.existsEdge(nodeId1, nodeId2);

        nodeId1 = parseInt(nodeId1);
        nodeId2 = parseInt(nodeId2);

        if (edgeExists === true) {
            return false;
        }
        if (this.directed) {
            var node1AdjList = this.getNodeAdjacencyList(nodeId1);
            node1AdjList.outNeighbours.push(nodeId2);
            node1AdjList.outWeights.push(0);

            var node1AdjList = this.getNodeAdjacencyList(nodeId2);
            node1AdjList.inNeighbours.push(nodeId1);
            node1AdjList.inWeights.push(0);
        }
        else {
            var node1AdjList = this.getNodeAdjacencyList(nodeId1);
            node1AdjList.neighbours.push(nodeId2);
            node1AdjList.weights.push(0);   

            var node1AdjList = this.getNodeAdjacencyList(nodeId2);
            node1AdjList.neighbours.push(nodeId1);
            node1AdjList.weights.push(0);
        }

        return true;
    };

    // THIS WORKS FINE
    this.intersectsNode = function (x, y) {
        var node;

        for (var i in this.allNodes) {
            node = this.allNodes[i];

            var nodeX = parseInt(node.x);
            var nodeY = parseInt(node.y);
            var nodeRadius = parseInt(node.r);

            var distance = Math.sqrt((nodeX - x) * (nodeX - x) + (nodeY - y) * (nodeY - y));

            if (distance < (nodeRadius + node.outlineWidth + sizes.radius + sizes.nodeOutlineWidth)) {
                return {"x": nodeX, "y": nodeY};
            }
        }
        return false;
    };

    // TOCHECK: THIS SHOULD WORK
    this.getNodeAdjacencyList = function (nodeId) {
        var adjList = null;
        
        var adjListsNo = this.adjacencyLists.length;

        for (var ind = 0; ind < adjListsNo; ++ind) {

            if (parseInt(this.adjacencyLists[ind].id) == parseInt(nodeId)) {
                adjList = this.adjacencyLists[ind];
            }
        }
        
        return adjList;
    };

    // TODO: Implement binary search
    this.getNodeIndexFromId = function(nodeId) {
        var len = this.allNodes.length;

        for (var ind = 0; ind < len; ++ind) {            
            if (parseInt(nodeId) === parseInt(this.allNodes[ind].id)) {
                return ind;
            }
        }
        return -1;
    };

    // TODO: Implement binary search
    this.nodeIndexFromName = function(nodeName) {
        var len = this.allNodes.length;

        for (var ind = 0; ind < len; ++ind) {            
            if ("" + nodeName === "" + this.allNodes[ind].name) {
                return ind;
            }
        }
        return -1;
    };

    // TODO: Implement binary search
    this.nodeIdFromName = function(nodeName) {
        var len = this.allNodes.length;

        for (var ind = 0; ind < len; ++ind) {            
            if ("" + nodeName === "" + this.allNodes[ind].name) {
                return this.allNodes[ind].id;
            }
        }
        return null;
    };

    // CHECKNEEDED:
    this.removeNodeFromNeighbours = function(id1, id2, edgeType = "none") {
        // console.log(id1, " <-->", id2);
        if (this.directed === false) {
            if(edgeType === "none") {
                var id2AdjList = this.getNodeAdjacencyList(id2);
                var neighbours = id2AdjList.neighbours;
                var weights = id2AdjList.weights;

                var ind = neighbours.indexOf(parseInt(id1));

                if (ind >= 0) {
                    neighbours.splice(ind, 1);
                    weights.splice(ind, 1);
                }
            }
        }
        // Should normally work. Worth checking.
        else {
            // removeNodeFromNeighbours(1, 2, "in") means
            // remove node 1 from the in neighbours of node 2 (so, there's a 1->2 edge)

            var done = false;
            if (edgeType === "in") {
                var node2AdjList = this.getNodeAdjacencyList(id2);
                console.log("id (in): " + node2AdjList.id);
                var inNeighbours = node2AdjList.inNeighbours;
                var inWeights = node2AdjList.inWeights;

                var ind = inNeighbours.indexOf(parseInt(id1));

                if (ind >= 0) {
                    inNeighbours.splice(ind, 1);
                    inWeights.splice(ind, 1);
                }
            }
            else {
                if (edgeType === "out") {
                    var node2AdjList = this.getNodeAdjacencyList(id2);
                    console.log("id (out): " + node2AdjList.id);
                    var outNeighbours = node2AdjList.outNeighbours;
                    var outWeights = node2AdjList.outWeights;

                    var ind = outNeighbours.indexOf(parseInt(id1));

                    if (ind >= 0) {
                        outNeighbours.splice(ind, 1);
                        outWeights.splice(ind, 1);
                    }
                }
            }
        }
        return done;
    };

    this.remove = function(object, id1, id2 = null) {
        switch(object) {
            case "node":
                if (this.directed === false) {

                    var neighbours = this.getNodeAdjacencyList(id1).neighbours;
                    var edgesNo = neighbours.length;
                    
                    for (var it = 0; it < edgesNo; ++it) {
                        this.removeNodeFromNeighbours(id1, neighbours[it]);
                    }
                }
                else {
                    var adjList = this.getNodeAdjacencyList(id1);
                    var inEdgesNo = adjList.inNeighbours.length;
                    var outEdgesNo = adjList.outNeighbours.length;
                    
                    for (var it = 0; it < inEdgesNo; ++it) {
                        this.removeNodeFromNeighbours(id1, adjList.inNeighbours[it], "out");
                    }
                    for (var it = 0; it < outEdgesNo; ++it) {
                        this.removeNodeFromNeighbours(id1, adjList.outNeighbours[it], "in");
                    }
                }
                this.adjacencyLists.splice(this.getNodeIndexFromId(id1), 1);
                this.allNodes.splice(this.getNodeIndexFromId(id1), 1);

                break;
            case "edge":
                if (this.directed === false) {
                    console.log(id1, id2);
                    this.removeNodeFromNeighbours(id1, id2);
                    this.removeNodeFromNeighbours(id2, id1);
                }
                else {
                    this.removeNodeFromNeighbours(id1, id2, "in");
                    this.removeNodeFromNeighbours(id2, id1, "out");
                }
                break;
            case "weight":
                if (this.directed === false) {
                    // TODO: LATER, SET WEIGHT TO 0.
                }
                else {
                    // TODO: LATER, SET WEIGHT TO 0.
                }
                break;
            default:
                break;
        }
    };

    this.orientation = function() {
        if (this.directed === true) {
            return "directed";
        }   
        else {
            return "undirected";
        }
    };

    this.setDirected = function(directed) {
        this.directed = directed
        if (directed === true) {
            return "directed";
        }   
        else {
            return "undirected";
        }
        return true;
    };

    this.setWeighted = function(weighted) {
        this.weighted = weighted
        if (weighted === true) {
            // Add weights
        }   
        else {
            // Remove weights
        }
        return true;
    };

    this.getEdgeWeight = function(nodeId1, nodeId2) {

        var weight = null;
        var node1AdjList = this.getNodeAdjacencyList(nodeId1);

        var ind;
        if (this.directed === true) {
            ind = this.getIndexFromIdInAdjList(nodeId2, node1AdjList, "out");
          
            if (ind >= 0) {
                weight = node1AdjList.outWeights[ind];
            }
        }
        else {
            ind = this.getIndexFromIdInAdjList(nodeId2, node1AdjList, "out");
          
            if (ind >= 0) {
                weight = node1AdjList.weights[ind];
            }
        }

        return weight;
    };

    this.getIndexFromIdInAdjList = function(nodeId, adjList, dir="none") {
        var ind = -1;

        // DOUBLECHECK THE CASE FOR DIRECTED GRAPHS
        if (this.directed === true) {
            switch(dir) {
                case "in":
                    var inNeighbours = adjList.inNeighbours;
                    var len = inNeighbours.length;

                    for (var i = 0; i < len; ++i) {
                        if (parseInt(inNeighbours[i]) === parseInt(nodeId)) {
                            ind = i;
                            break;
                        }
                    }
                    break;
                case "out":
                    var outNeighbours = adjList.outNeighbours;
                    var len = outNeighbours.length;

                    for (var i = 0; i < len; ++i) {
                        if (parseInt(outNeighbours[i]) === parseInt(nodeId)) {
                            ind = i;
                            break;
                        }
                    }

                    break;
                default:
                    break;
            }
        }
        else {
            var neighbours = adjList.neighbours;
            var len = neighbours.length;

            for (var i = 0; i < len; ++i) {
                if (parseInt(neighbours[i]) === parseInt(nodeId)) {
                    ind = i;
                    break;
                }
            }
        }
        return ind;
    };

    this.noEdge = function() {
        var noEdge = true;

        var len = this.adjacencyLists.length;
        var neighbours;

        if (this.directed === true) {
            for (var i = 0; i < len; ++i) {
                neighbours = this.adjacencyLists[i].outNeighbours;
                if (neighbours.length !== 0) {
                    noEdge = false;
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < len; ++i) {
                neighbours = this.adjacencyLists[i].neighbours;
                if (neighbours.length !== 0) {
                    noEdge = false;
                    break;
                }
            }
        }

        return noEdge;
    };

    this.getNodePointsForEdges = function() {
        var pointsPairs = [];

        var len = this.allNodes.length;
        var neighbours, neighboursNo, id, p1, p2, ind;

        for (var i = 0; i < len; ++i) {

            id = this.adjacencyLists[i].id;
            if (this.directed === true) {
                neighbours = this.adjacencyLists[i].outNeighbours;
            }
            else {
                neighbours = this.adjacencyLists[i].neighbours;                
            }
            neighboursNo = neighbours.length;

            for (var j = 0; j < neighboursNo; ++j) {
                if (parseInt(id) < parseInt(neighbours[j])) {

                    ind = this.getNodeIndexFromId(neighbours[j]);

                    p1 = {"x": this.allNodes[i].x, y: this.allNodes[i].y};
                    p2 = {"x": this.allNodes[ind].x, y: this.allNodes[ind].y};
                    
                    pointsPairs.push({"p1": p1, "p2": p2});
                }
            }
        }

        return pointsPairs;
    };

    this.updateWeight = function(nodeId1, nodeId2, weight) {

        var done = false;

        nodeId1 = parseInt(nodeId1);
        nodeId2 = parseInt(nodeId2);
        weight = parseFloat(weight);

        if (this.directed === true) {
            var adjList1, adjList2, ind1, ind2;

            adjList1 = this.getNodeAdjacencyList(nodeId1);
            adjList2 = this.getNodeAdjacencyList(nodeId2);

            if (adjList1 && adjList2) {
                
                ind1 = this.getIndexFromIdInAdjList(nodeId2, adjList1, "out");
                ind2 = this.getIndexFromIdInAdjList(nodeId1, adjList2, "in");

                if (ind1 >= 0 && ind2 >= 0) {
                    adjList1.outWeights[ind1] = weight;
                    adjList2.inWeights[ind2] = weight;
                    done = true;
                }
            }
        }
        else {
            var adjList1, adjList2, ind1, ind2;

            adjList1 = this.getNodeAdjacencyList(nodeId1);
            adjList2 = this.getNodeAdjacencyList(nodeId2);

            if (adjList1 && adjList2) {

                ind1 = this.getIndexFromIdInAdjList(nodeId2, adjList1);
                ind2 = this.getIndexFromIdInAdjList(nodeId1, adjList2);

                if (ind1 >= 0 && ind2 >= 0) {
                    adjList1.weights[ind1] = weight;
                    adjList2.weights[ind2] = weight;
                    done = true;
                }
            }
        }

        return done;
    };

    this.makeCoordinatesCircular = function(x, y, r, left = 0, top = 0) {

        var nodesNo = this.allNodes.length;

        if (nodesNo <= 1) {
            if (nodesNo === 1) {

                this.allNodes[0].x = x;
                this.allNodes[0].y = y; 
            }
            return;
        }

        var delta = 360 / nodesNo;
        var angle = 0;
        var newX, newY;

        for (var i = 0; i < nodesNo; ++i) {

            this.allNodes[i].x = left + x + r * Math.cos(angle * Math.PI / 180);
            this.allNodes[i].y = top + y + r * Math.sin(angle * Math.PI / 180); 

            angle += delta;
        }
    };

};

function cloneGraph(graph) {
    var newGraph = new Graph(); 

    newGraph.allNodes = graph.allNodes;
    newGraph.adjacencyLists = graph.adjacencyLists;
    newGraph.directed = graph.directed;
    newGraph.weighted = graph.weighted;
    newGraph.selfLoops = graph.selfLoops;

    return newGraph;
}

// This mehtod has been taken from: 
// http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function clone(obj) {
    var copy;

    if (null == obj || "object" != typeof obj) {
        return obj;
    }

    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Object) {
        console.log("here bay");
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


// function modifyGraphNodesIds(graph, action, backWord = "") {
//     if (graph.allNodes.length > 0) {
//         var nodes, len;
//         switch(action) {
//             case "remove":
//                 len = graph.allNodes.length;
//                 for (var i = 0; i < len; ++i) {
//                     var id = "";
//                     var words = graph.allNodes[i].id.split(backWord);
//                     for (var j = 0; j < words.length; ++j) {
//                         id += words[j]
//                     }
//                     graph.allNodes[i].id = id;
//                 }
//                 break;
//             case "add":
//                 len = graph.allNodes.length;
//                 for (var i = 0; i < len; ++i) {
//                     graph.allNodes[i].id = graph.allNodes[i].id + backWord;
//                 }
//                 break;
//             default:
//                 break;
//         }
//     }
//     return graph;
// }

// TEST THIS METHOD MORE.
function makeGraphDirected(graph) {
    var newAdjLists = [], newAdjList, oldAdjList;
    var nodesNo, neighbours, neighboursNo, newNeighbours;

    if (graph.directed === false) {

        graph.directed = true;
        nodesNo = graph.adjacencyLists.length;

        for (var i = 0; i < nodesNo; ++i) {
            oldAdjList = graph.adjacencyLists[i];
            newAdjList = {"id": oldAdjList.id, "inNeighbours": [], "inWeights": [], 
                          "outNeighbours": [], "outWeights": []};
            neighboursNo = oldAdjList.neighbours.length;

            for (var j = 0; j < neighboursNo; ++j) {
                newAdjList.inNeighbours.push(oldAdjList.neighbours[j]);
                newAdjList.inWeights.push(oldAdjList.weights[j]);
                newAdjList.outNeighbours.push(oldAdjList.neighbours[j]);
                newAdjList.outWeights.push(oldAdjList.weights[j]);
            }
            newAdjLists.push(newAdjList);
        }

        graph.adjacencyLists = newAdjLists;
    }

    return graph;
}

// TEST THIS METHOD MORE.
function makeGraphUndirected(graph) {
    var newGraph = new Graph(false);
    var newAdjLists = [], newAdjList, oldAdjList;
    var node, nodesNo, neighbours, neighboursNo, newNeighbours;
    var nodeId1, nodeId2;

    if (graph.directed === true) {

        nodesNo = graph.adjacencyLists.length;

        for (var i = 0; i < nodesNo; ++i) {

            node = graph.allNodes[i];
            newGraph.addNode({id: node.id, name: node.name, 
                         x: node.x, y: node.y, r: node.r, 
                         outlineWidth: node.outlineWidth});            
        }

        for (var i = 0; i < nodesNo; ++i) {

            oldAdjList = graph.adjacencyLists[i].outNeighbours;
            nodeId1 = graph.adjacencyLists[i].id;
            newGraph.adjacencyLists[i].id = nodeId1;
            neighboursNo = oldAdjList.length;


            for (var j = 0; j < neighboursNo; ++j) {
                nodeId2 = oldAdjList[j];
                // console.log(nodeId1, nodeId2)
                newGraph.addEdge(nodeId1, nodeId2);
            }
        }
    }
    else {
        newGraph = graph;
    }

    return newGraph;
}


function graphMinY(graph) {
    var minY = null;
        
        var len = graph.allNodes.length;
        for (var i = 0; i < len; ++i) {
            if (minY > graph.allNodes[i].y) {
                minY = graph.allNodes[i].y;
            }
        }
    if (graph.allNodes.length > 0) {
        minY = graph.allNodes[0].y;
        
        var len = graph.allNodes.length;
        for (var i = 0; i < len; ++i) {
            if (minY > graph.allNodes[i].y) {
                minY = graph.allNodes[i].y;
            }
        }
    }

    return minY;
} 

function graphMinX(graph) {
    var minX = null;
    if (graph.allNodes.length > 0) {
        minX = graph.allNodes[0].x;
        
        var len = graph.allNodes.length;
        for (var i = 0; i < len; ++i) {
            if (minX > graph.allNodes[i].x) {
                minX = graph.allNodes[i].x;
            }
        }
    }

    return minX;
} 

function graphMaxY(graph) {
    var maxY = null;
    if (graph.allNodes.length > 0) {
        maxY = graph.allNodes[0].y;
        
        var len = graph.allNodes.length;
        for (var i = 0; i < len; ++i) {
            if (maxY < graph.allNodes[i].y) {
                maxY = graph.allNodes[i].y;
            }
        }
    }

    return maxY;
} 

function graphMaxX(graph) {
    var maxX = null;
    if (graph.allNodes.length > 0) {
        maxX = graph.allNodes[0].x;
        
        var len = graph.allNodes.length;
        for (var i = 0; i < len; ++i) {
            if (maxX < graph.allNodes[i].x) {
                maxX = graph.allNodes[i].x;
            }
        }
    }

    return maxX;
}

function transposeGraphCoordinates(graph, x = 0, y = 0, xRatio = 1, yRatio = 1) {
    var node, nodes = graph.allNodes;
    var len = nodes.length;

    for (var i = 0; i < len; ++i) {
        node = nodes[i];
        node.x += x;
        node.x *= xRatio;
        node.y += y;
        node.y *= yRatio;
    }

    graph.allNodes = nodes;

    return graph;
}