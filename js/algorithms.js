function Algorithms() {
    this.algorithms = [
        {
            id: "BFS",
            dataValue: "BFS",
            name: "Breadth First Search (BFS)",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: true
            },
            run: function(graph, startData, full = true) {
                
                var startNode = startData.startNode;

                var nodes = graph.allNodes;
                var adjLists = graph.adjacencyLists;
                var len = graph.allNodes.length;
                
                var briefSteps = [];
                var fullSteps = [];
                
                var queue = [];
                var visitedEdges = [];
                var visitedNodes = [];
                var visitedNodesNo = 0;

                for (var it = 0; it < len; ++it) {
                    visitedEdges.push([]);
                    visitedNodes.push(false);
                }

                if (graph.getNodeIndexFromId(startNode) >= 0) {
                    visitedNodes[graph.getNodeIndexFromId(startNode)] = true;
                    ++visitedNodesNo;
                                        
                    queue = [startNode + "-" + startNode];

                    var currentNode, currentNodeIndex;
                    var neighbours, nLen;

                    briefSteps.push({type: "nodeVisited", nodes: [{id: startNode, fill: null, 
                                     stroke: colors.visitedNodeBorder}], 
                                     edges: [], updates: []});
                    fullSteps.push({type: "nodeActive", nodes: [{id: startNode, fill: null, 
                                    stroke: colors.activeNodeBorder}], 
                                    edges: [], updates: []});


                    while (visitedNodesNo < len) {

                        while (queue.length > 0) {

                            currentNode = queue.shift().split("-")[1];
                            currentNodeIndex = graph.getNodeIndexFromId(currentNode);

                            // If making current node "currently active", this would be needed:
                            // fullSteps.push({nodes: [{id: currentNode, fill: null, 
                            //                 stroke: CURRENTLY_ACTIVE_COLOR}], 
                            //                 edges: [], updates: []});
                        
                            if (graph.directed === true) {
                                neighbours = graph.adjacencyLists[currentNodeIndex].outNeighbours;
                            }
                            else {
                                neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
                            }
                            nLen = neighbours.length;

                            for (var it = 0; it < nLen; ++it) {
                                var ind = graph.getNodeIndexFromId(neighbours[it]);

                                if (!visitedNodes[ind]) {

                                    visitedEdges[currentNodeIndex].push(parseInt(ind));
                                    if (!graph.directed) {
                                        visitedEdges[ind].push(currentNodeIndex);
                                    }
                                    
                                    queue.push(currentNode + "-" + graph.allNodes[ind].id);

                                    ++visitedNodesNo;
                                    visitedNodes[ind] = true;

                                    briefSteps.push({type: "edge", nodes: [{id: graph.allNodes[ind].id, 
                                                    fill: null, stroke: colors.visitedNodeBorder}], 
                                                    edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
                                                            stroke: colors.extendedEdge}], 
                                                    updates: []});
                                    fullSteps.push({type: "edge", nodes: [{id: graph.allNodes[ind].id, 
                                                    fill: null, stroke: colors.activeNodeBorder}], 
                                                    edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
                                                            stroke: colors.extendedEdge}], 
                                                    updates: []});

                                }
                                else {
                                    if (!visitedEdges[currentNodeIndex].includes(parseInt(ind))) {

                                        visitedEdges[currentNodeIndex].push(parseInt(ind));
                                        if (!graph.directed) {
                                            visitedEdges[ind].push(currentNodeIndex);
                                        }
                                        
                                        briefSteps.push({type: "edge", nodes: [], 
                                                        edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
                                                                stroke: colors.unextendedEdge}], 
                                                        updates: []});
                                        fullSteps.push({type: "edge", nodes: [], 
                                                        edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
                                                                stroke: colors.unextendedEdge}], 
                                                        updates: []});
                                    }
                                }
                            }

                            fullSteps.push({type: "nodeVisited", nodes: [{id: currentNode, fill: null, 
                                            stroke: colors.visitedNodeBorder}], 
                                            edges: [], updates: []});
                        }

                        if (visitedNodesNo < len) {
                            for (var it = 0; it < len; ++it) {
                                if (visitedNodes[it] === false) {
                                    var nodeId = graph.allNodes[it].id; 
                                    queue.push(nodeId + "-" + nodeId);

                                    briefSteps.push({type: "nodeVisited", nodes: [{id: nodeId, fill: null, 
                                                     stroke: colors.visitedNodeBorder}], 
                                                     edges: [], updates: []});
                                    fullSteps.push({type: "nodeActive", nodes: [{id: nodeId, fill: null, 
                                                    stroke: colors.activeNodeBorder}], 
                                                    edges: [], updates: []});


                                    visitedNodes[it] = true;
                                    ++visitedNodesNo;
                                    break;
                                }
                            }
                        }
                    }

                    if (full) {
                        return fullSteps;
                    }
                    else {
                        return briefSteps;
                    }

                }
                return null;
            }
        },
        {
            id: "DFS",
            dataValue: "DFS",
            name: "Depth First Search (DFS)",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: true
            },
            // run: function(graph, startData, full = true) {
                
            //     var startNode = startData.startNode;

            //     var nodes = graph.allNodes;
            //     var adjLists = graph.adjacencyLists;
            //     var len = graph.allNodes.length;
                
            //     var briefSteps = [];
            //     var fullSteps = [];
                
            //     var queue = [];
            //     var visitedEdges = [];
            //     var visitedNodes = [];
            //     var visitedNodesNo = 0;

            //     for (var it = 0; it < len; ++it) {
            //         visitedEdges.push([]);
            //         visitedNodes.push(false);
            //     }

            //     function DFS(currentEdge)

            //     if (graph.getNodeIndexFromId(startNode) >= 0) {
            //         visitedNodes[graph.getNodeIndexFromId(startNode)] = true;
            //         ++visitedNodesNo;
                                        
            //         queue = [startNode + "-" + startNode];

            //         var currentNode, currentNodeIndex;
            //         var neighbours, nLen;

            //         briefSteps.push({type: "nodeVisited", nodes: [{id: startNode, fill: null, 
            //                          stroke: colors.visitedNodeBorder}], 
            //                          edges: [], updates: []});
            //         fullSteps.push({type: "nodeActive", nodes: [{id: startNode, fill: null, 
            //                         stroke: colors.activeNodeBorder}], 
            //                         edges: [], updates: []});


            //         while (visitedNodesNo < len) {

            //             while (queue.length > 0) {

            //                 currentNode = queue.shift().split("-")[1];
            //                 currentNodeIndex = graph.getNodeIndexFromId(currentNode);

            //                 // If making current node "currently active", this would be needed:
            //                 // fullSteps.push({nodes: [{id: currentNode, fill: null, 
            //                 //                 stroke: CURRENTLY_ACTIVE_COLOR}], 
            //                 //                 edges: [], updates: []});
                        
            //                 if (graph.directed === true) {
            //                     neighbours = graph.adjacencyLists[currentNodeIndex].outNeighbours;
            //                 }
            //                 else {
            //                     neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
            //                 }
            //                 nLen = neighbours.length;

            //                 for (var it = 0; it < nLen; ++it) {
            //                     var ind = graph.getNodeIndexFromId(neighbours[it]);

            //                     if (!visitedNodes[ind]) {

            //                         visitedEdges[currentNodeIndex].push(parseInt(ind));
            //                         if (!graph.directed) {
            //                             visitedEdges[ind].push(currentNodeIndex);
            //                         }
                                    
            //                         queue.push(currentNode + "-" + graph.allNodes[ind].id);

            //                         ++visitedNodesNo;
            //                         visitedNodes[ind] = true;

            //                         briefSteps.push({type: "edge", nodes: [{id: graph.allNodes[ind].id, 
            //                                         fill: null, stroke: colors.visitedNodeBorder}], 
            //                                         edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
            //                                                 stroke: colors.extendedEdge}], 
            //                                         updates: []});
            //                         fullSteps.push({type: "edge", nodes: [{id: graph.allNodes[ind].id, 
            //                                         fill: null, stroke: colors.activeNodeBorder}], 
            //                                         edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
            //                                                 stroke: colors.extendedEdge}], 
            //                                         updates: []});

            //                     }
            //                     else {
            //                         if (!visitedEdges[currentNodeIndex].includes(parseInt(ind))) {

            //                             visitedEdges[currentNodeIndex].push(parseInt(ind));
            //                             if (!graph.directed) {
            //                                 visitedEdges[ind].push(currentNodeIndex);
            //                             }
                                        
            //                             briefSteps.push({type: "edge", nodes: [], 
            //                                             edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
            //                                                     stroke: colors.unextendedEdge}], 
            //                                             updates: []});
            //                             fullSteps.push({type: "edge", nodes: [], 
            //                                             edges: [{id: currentNode + "-" + graph.allNodes[ind].id, 
            //                                                     stroke: colors.unextendedEdge}], 
            //                                             updates: []});
            //                         }
            //                     }
            //                 }

            //                 fullSteps.push({type: "nodeVisited", nodes: [{id: currentNode, fill: null, 
            //                                 stroke: colors.visitedNodeBorder}], 
            //                                 edges: [], updates: []});
            //             }

            //             if (visitedNodesNo < len) {
            //                 for (var it = 0; it < len; ++it) {
            //                     if (visitedNodes[it] === false) {
            //                         var nodeId = graph.allNodes[it].id; 
            //                         queue.push(nodeId + "-" + nodeId);

            //                         briefSteps.push({type: "nodeVisited", nodes: [{id: nodeId, fill: null, 
            //                                          stroke: colors.visitedNodeBorder}], 
            //                                          edges: [], updates: []});
            //                         fullSteps.push({type: "nodeActive", nodes: [{id: nodeId, fill: null, 
            //                                         stroke: colors.activeNodeBorder}], 
            //                                         edges: [], updates: []});


            //                         visitedNodes[it] = true;
            //                         ++visitedNodesNo;
            //                         break;
            //                     }
            //                 }
            //             }
            //         }

            //         if (full) {
            //             return fullSteps;
            //         }
            //         else {
            //             return briefSteps;
            //         }

            //     }
            //     return null;
            // }
            run: function(graph, startData, fullList = true) {
                
                var startNode = startData.startNode;

                var visitedNodes = [];
                var visitedEdges = [];
                var visitedNodesNo = 0;
                var nodesNo = graph.allNodes.length;

                var briefSteps = [];
                var fullSteps = [];

                for (var i = 0; i < nodesNo; ++i) {
                    visitedEdges.push([]);
                    visitedNodes.push(false);
                }

                briefSteps.push({type: "nodeVisited", nodes: [{id: startNode, 
                                 fill: null, stroke: colors.visitedNodeBorder}], 
                                 edges: [], updates: []});
                fullSteps.push({type: "nodeActive", nodes: [{id: startNode, 
                                fill: null, stroke: colors.activeNodeBorder}], 
                                edges: [], updates: []});

                recursiveDFS(startNode + "-" + startNode);

                // CONTINUEHERE ALL NODES SHOULD BE VISITED
                while (visitedNodesNo < nodesNo) {
                    for (var i = 0; i < nodesNo; ++i) {
                        if (visitedNodes[i] === false) {

                            briefSteps.push({type: "nodeVisited", nodes: [{id: graph.allNodes[i].id, 
                                             fill: null, stroke: colors.visitedNodeBorder}], 
                                             edges: [], updates: []});
                            fullSteps.push({type: "nodeActive", nodes: [{id: graph.allNodes[i].id, 
                                            fill: null, stroke: colors.activeNodeBorder}], 
                                            edges: [], updates: []});

                            recursiveDFS(graph.allNodes[i].id + "-" + graph.allNodes[i].id)
                            break;
                        }
                    }
                }

                function recursiveDFS(currentEdge) {

                    var previousNode = currentEdge.split('-')[0]; 
                    var currentNode = currentEdge.split('-')[1];
                    var currentNodeIndex = graph.getNodeIndexFromId(currentNode);

                    if (visitedNodes[currentNodeIndex] === false) {
                        visitedNodes[currentNodeIndex] = true;
                        visitedNodesNo++;

                        var neighbours, len;
                        if (graph.directed === true) {
                            neighbours = graph.adjacencyLists[currentNodeIndex].outNeighbours;
                        }
                        else {
                            neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
                        }
                        len = neighbours.length;

                        var goAhead;
                        var edgeId, nextNodeIndex;
                        for (var i = 0; i < len; ++i) {
                            goAhead = true;
                            edgeId = currentNode + "-" + neighbours[i];
                            nextNodeIndex = graph.getNodeIndexFromId(neighbours[i]);

                            if (graph.directed === false) {
                                if (visitedEdges[currentNodeIndex].includes(parseInt(neighbours[i])) || 
                                    visitedEdges[nextNodeIndex].includes(parseInt(currentNode))) {

                                    goAhead = false;
                                }
                                else {
                                    visitedEdges[currentNodeIndex].push(parseInt(neighbours[i])); 
                                    visitedEdges[nextNodeIndex].push(parseInt(currentNode));
                                }
                            }

                            if (goAhead) {
                                if (visitedNodes[graph.getNodeIndexFromId(neighbours[i])]) {
                                    briefSteps.push({type: "edge", nodes: [], 
                                                    edges: [{id: edgeId, 
                                                            stroke: colors.unextendedEdge}], 
                                                    updates: []});
                                    fullSteps.push({type: "edge", nodes: [], 
                                                    edges: [{id: edgeId, 
                                                            stroke: colors.unextendedEdge}], 
                                                    updates: []});
                                }
                                else {
                                    briefSteps.push({type: "edge", nodes: [{id: graph.allNodes[nextNodeIndex].id, 
                                                    fill: null, stroke: colors.visitedNodeBorder}], 
                                                    edges: [{id: edgeId, stroke: colors.extendedEdge}], 
                                                    updates: []});
                                    fullSteps.push({type: "edge", nodes: [{id: graph.allNodes[nextNodeIndex].id, 
                                                    fill: null, stroke: colors.activeNodeBorder}], 
                                                    edges: [{id: edgeId, stroke: colors.extendedEdge}], 
                                                    updates: []});
                                    console.log("here", edgeId);
                                    recursiveDFS(edgeId);
                                }
                            }
                        }

                        var visitedNeighboursNo = visitedEdges[currentNodeIndex].length;
                        if (len - visitedNeighboursNo === 0) {
                            fullSteps.push({type: "nodeVisited", nodes: [{id: currentNode, 
                                            fill: null, stroke: colors.visitedNodeBorder}], 
                                            edges: [], updates: []});
                        }
                    }
                    else {
                        // Think about bridges
                    }

                }

                if (!fullList) {
                    return briefSteps;
                }

                return fullSteps;
            }
        },
        {
            id: "Bridges",
            dataValue: "Bridges",
            name: "Bridges in Connected Graph",
            worksOn: {
                directed: false,
                undirected: true,
                weighted: true,
                unweighted: true
            }
        },
        {
            id: "ArtPoints",
            dataValue: "ArtPoints",
            name: "Articulation Points in Connected Graph",
            worksOn: {
                directed: false,
                undirected: true,
                weighted: true,
                unweighted: true
            }
        },
        {
            id: "Dijkstra",
            dataValue: "Dijkstra",
            name: "Dijkstra (Shortest Path)",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: false
            }
        },
        {
            id: "Kruskal",
            dataValue: "Kruskal",
            name: "Kruskal's MSP (Minimum Spanning Tree)",
            worksOn: {
                directed: false,
                undirected: true,
                weighted: true,
                unweighted: false
            },
            run: function(graph, startData, fullList = true) {

                function min(a, b) {
                    if (parseFloat(a) < parseFloat(b)) {
                        return a;
                    }
                    else {
                        return b;
                    }
                }

                function max(a, b) {
                    if (parseFloat(a) > parseFloat(b)) {
                        return a;
                    }
                    else {
                        return b;
                    }
                }

                var steps = [];
                if (graph.directed === false && graph.weighted === true) {

                    function compare(a, b) {
                        if (parseFloat(a.weight) < parseFloat(b.weight))
                            return -1;
                        if (parseFloat(a.weight) > parseFloat(b.weight))
                            return 1;
                        return 0;
                    }

                    var weight, edge, edges = graph.getAllEdges();
                    edges.sort(compare);
                    var id1, id2, total = 0, index1, index2;
                    var nodeGroup = [];

                    for (var i = 0; i < graph.allNodes.length; ++i) {
                        nodeGroup.push(-1);
                    } 

                    while (edges.length > 0) {
                        edge = edges.shift();
                        weight = edge.weight;
                        edge = edge.edge;
                        id1 = parseInt(edge.split("-")[0]);
                        id2 = parseInt(edge.split("-")[1]);

                        index1 = graph.getNodeIndexFromId(id1);
                        index2 = graph.getNodeIndexFromId(id2);

                        if (nodeGroup[index1] === -1 && nodeGroup[index2] === -1) {
                            nodeGroup[index1] = min(id1, id2);
                            nodeGroup[index2] = min(id1, id2);
                            
                            total += parseFloat(weight);
                            steps.push({id: id1 + "-" + id2, type: "edge", extended: true});
                        }
                        else {
                            if (nodeGroup[index1] === -1 || nodeGroup[index2] === -1) {
                                nodeGroup[index1] = max(nodeGroup[index1], nodeGroup[index2]);
                                nodeGroup[index2] = max(nodeGroup[index1], nodeGroup[index2]);
                                
                                total += parseFloat(weight);
                                steps.push({id: id1 + "-" + id2, type: "edge", extended: true});
                            }
                            else {
                                if (nodeGroup[index1] === nodeGroup[index2]) {
                                    steps.push({id: id1 + "-" + id2, type: "edge", extended: false});
                                }
                                else {
                                    var mini = min(nodeGroup[index1], nodeGroup[index2]);
                                    var maxi = max(nodeGroup[index1], nodeGroup[index2]);
                                    for (var i = 0; i < graph.allNodes.length; ++i) {
                                        if (nodeGroup[i] === maxi) {
                                            nodeGroup[i] = mini;
                                        }
                                    }
                                    total += parseFloat(weight);
                                    steps.push({id: id1 + "-" + id2, type: "edge", extended: true});
                                }
                            }
                        }
                    }
                }

                var workedFine = true;
                for (var i = 0; i < graph.allNodes.length; ++i) {
                    if (nodeGroup[i] === -1) {
                        workedFine = false;
                        break;
                    }
                }

                if (workedFine) {
                    // return steps;

                    return {steps: steps, value: total};
                }
                
                return [];

            }
        },
        {
            id: "Prim",
            dataValue: "Prim",
            name: "Prim's MSP (Minimum Spanning Tree)",
            worksOn: {
                directed: false,
                undirected: true,
                weighted: true,
                unweighted: false
            },
            run: function(graph, startNode, fullList = true) {

                var steps = [];
                if (graph.directed === false && graph.weighted === true) {

                    function compare(a,b) {
                        if (parseFloat(a.value) < parseFloat(b.value))
                            return -1;
                        if (parseFloat(a.value) > parseFloat(b.value))
                            return 1;
                        return 0;
                    }

                    var nodesNo = graph.allNodes.length;
                    var visitedNodesNo = 0;
                    var currentNodeIndex = graph.getNodeIndexFromId(startNode);
                    var neighbours, neighboursNo, neighbourIndex, weights;
                    var edge, edges = [];
                    var visitedNodes = [];
                    var pushedNeighbours = [];
                    var node;

                    neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
                    weights = graph.adjacencyLists[currentNodeIndex].weights;
                    neighboursNo = neighbours.length;
                    var total = 0;

                    for (var i = 0; i < nodesNo; ++i) {
                        visitedNodes.push(false);
                        pushedNeighbours.push([]);
                    }

                    for (var i = 0; i < neighboursNo; ++i) {
                        edges.push({id: neighbours[i], edgeId: startNode + "-" + neighbours[i], value: weights[i]});

                        var ind = graph.getNodeIndexFromId(neighbours[i]);
                        pushedNeighbours[currentNodeIndex].push(parseFloat(neighbours[i]));
                        pushedNeighbours[ind].push(parseFloat(startNode));
                    }

                    visitedNodes[currentNodeIndex] = true;
                    visitedNodesNo++;

                    var sorted = false;

                    while (visitedNodesNo < nodesNo && edges.length > 0) {
                        if (sorted === false) {
                            sorted = true;
                            edges.sort(compare);
                        }

                        edge = edges.shift();
                        node = edge.id;
                        currentNodeIndex = graph.getNodeIndexFromId(node);


                        if (visitedNodes[parseFloat(currentNodeIndex)] === true) {
                            console.log("reached");
                            steps.push({id: edge.edgeId, extended: false, type: "edge"});
                        }
                        else {
                            console.log("here should i be");
                            steps.push({id: edge.edgeId, extended: true, type: "edge"});

                            total += parseFloat(edge.value);
                            visitedNodesNo++;
                            visitedNodes[currentNodeIndex] = true;

                            neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
                            weights = graph.adjacencyLists[currentNodeIndex].weights;
                            neighboursNo = neighbours.length;

                            for (var i = 0; i < neighboursNo; ++i) {
                                if (!pushedNeighbours[currentNodeIndex].includes(parseFloat(neighbours[i]))) {
                                    edges.push({id: neighbours[i], edgeId: node + "-" + neighbours[i], value: weights[i]});
                                    sorted = false;

                                    neighbourIndex = graph.getNodeIndexFromId(neighbours[i]);
                                    pushedNeighbours[currentNodeIndex].push(parseFloat(neighbours[i]));
                                    pushedNeighbours[neighbourIndex].push(parseFloat(node));
                                }
                            }
                        }
                    }

                    edges.sort(compare);
                    while (edges.length > 0) {
                        edge = edges.shift();
                        steps.push({id: edge.edgeId, extended: false, type: "edge"});
                    }
                }

                if (visitedNodesNo >= nodesNo) {
                    return {steps: steps, value: total};
                }
                
                return [];
            }
        },
        {
            id: "MaxFlow",
            dataValue: "MaxFlow",
            name: "Maximum Flow",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: false
            }
        }
    ];

    this.getOption = function(algorithmName) {
        var ind = this._getIndexByAgloId(algorithmName);
        
        if (ind >= 0) {
            var algorithm = this.algorithms[ind];

            var option = document.createElement("option");
            
            option.id = algorithm.id;
            option.setAttribute("data-value", algorithm.dataValue);
            option.innerHTML = algorithm.name;

            return option;
        }
        return null;
    };

    this.getOptions = function(algorithmsNames) {
        var len = algorithmsNames.length;
        var options = [];
        for (var it = 0; it < len; ++it) {
            
            var option = this.getOption(algorithmsNames[it]);

            if (option !== null) {
                options.push(option);
            }

        }
        return options;
    };

    this.getOptionsHTML = function(algorithmsNames) {
        var options = this.getOptions(algorithmsNames);
        var len = options.length;

        var html = "";
        for (var i = 0; i < len; ++i) {
            html += options[i].outerHTML + "\n";
        }

        return html;
    };

    this._getIndexByAgloId = function (algorithmName) {
        var ind = -1;

        var len = this.algorithms.length;
        for (var it = 0; it < len; ++it) {
            if (algorithmName.toLowerCase() === this.algorithms[it].id.toLowerCase()) {
                ind = it;
            }
        }

        return ind;
    };

    this.getAlgorithmByName = function (algorithmName) {
        var algorithm = null;

        var len = this.algorithms.length;
        for (var it = 0; it < len; ++it) {
            // CONSIDER IMPLEMENT DISJUNCTION
            if (algorithmName.toLowerCase() === this.algorithms[it].name.toLowerCase()) {
                algorithm = this.algorithms[it];
            }
        }

        return algorithm;
    };

    this.getAvailableAlgorithms = function(graph) {
        var algs = this.algorithms; 
        var len = algs.length;
        var options = [];
        
        // DIRECTCASE: DONE - NEEDS CHECK
        if (graph.directed === true) {
            for (var it = 0; it < len; ++it) {
                if (algs[it].worksOn.directed === true) {
                    if ((algs[it].worksOn.weighted === true && graph.weighted === true) ||
                        (algs[it].worksOn.unweighted === true && graph.weighted === false)) {

                        options.push({"name": algs[it].name, "id": algs[it].id});
                    }
                }
            }
        }
        else {
            for (var it = 0; it < len; ++it) {
                if (algs[it].worksOn.undirected === true) {
                    if ((algs[it].worksOn.weighted === true && graph.weighted === true) ||
                        (algs[it].worksOn.unweighted === true && graph.weighted === false)) {

                        options.push({"name": algs[it].name, "id": algs[it].id});
                    }
                }
            }
        }

        return options;
    };

    this.run = function(algorithm, graph, startData, fullList = true) {

        var len = this.algorithms.length;
        for (var it = 0; it < len; ++it) {
            var alg = this.algorithms[it];
            
            if (alg.id === algorithm || alg.dataValue === algorithm || alg.name === algorithm) {
                return alg.run(graph, startData, fullList);
            }
        }
    };


    this.algorithmId = function(algorithmName) {

        var len = this.algorithms.length;
        for (var it = 0; it < len; ++it) {
            var alg = this.algorithms[it];
            
            if (alg.id === algorithmName || alg.dataValue === algorithmName || alg.name === algorithmName) {
                return alg.id;
            }
        }

        return "";
    };    

}


function run(graph, st = 1, algNo = 0) {
    var testMe = new Algorithms();
    return testMe.algorithms[algNo].run(graph, st, true);
}

