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
            run: function(graph, startNode, fullList = true) {
                
                var nodes = graph.allNodes;
                var adjLists = graph.adjacencyLists;
                
                var sequenceExec = [];
                var fullSequenceExec = [];
                var len = graph.allNodes.length;
                var visitedEdges = [];
                var visitedNodes = [];

                for (var it = 0; it < len; ++it) {
                    visitedEdges.push([]);
                    visitedNodes.push(false);
                }
                var visitedNodesNo = 0;

                if (graph.getNodeIndexFromId(startNode) >= 0) {
                    visitedNodes[graph.getNodeIndexFromId(startNode)] = true;
                    ++visitedNodesNo;
                                        
                    var queue = [startNode + "-" + startNode];

                    if (graph.directed === false) {
                        var currentNode;
                        var currentNodeIndex;

                        while (visitedNodesNo < len) {

                            while (queue.length > 0) {
                                currentNode = queue.shift().split("-")[1];
                                currentNodeIndex = graph.getNodeIndexFromId(currentNode);
                            
                                var neighbours = graph.adjacencyLists[currentNodeIndex].neighbours;
                                
                                var nLen = neighbours.length;

                                // CONTINUEHERE: CHECK FOR ID VS INDEX
                                // STILL DOES A WRONG CHECK. INVESTIGATE WHY.
                                for (var it = 0; it < nLen; ++it) {
                                    // ADD ALL EDGES THAT HAVE NOT YET BEEN VISITED
                                    var ind = graph.getNodeIndexFromId(neighbours[it]);

                                    if (visitedEdges[currentNodeIndex].includes(parseInt(ind)) === false) {

                                        visitedEdges[currentNodeIndex].push(parseInt(ind));
                                        // BECAUSE IT IS UNDIRECTED
                                        visitedEdges[ind].push(currentNodeIndex);
                                        queue.push(currentNode + "-" + graph.allNodes[ind].id);
                                        //sequenceExec.push(graph.allNodes[ind].id);

                                        if (visitedNodes[ind] !== true) {
                                            ++visitedNodesNo;
                                            fullSequenceExec.push({"type": "edge", "id": currentNode + "-" + graph.allNodes[ind].id, "extended": true})
                                        }
                                        else {
                                            fullSequenceExec.push({"type": "edge", "id": currentNode + "-" + graph.allNodes[ind].id, "extended": false})
                                        }
                                        visitedNodes[ind] = true;

                                    }
                                    else {
                                        //if (extended[graph.allNodes[ind].id] === false) {
                                            // fullSequenceExec.push({"edge": currentNode + "-" + graph.allNodes[ind].id, "extended": false})
                                        //} 
                                    }
                                }
                            }

                            if (visitedNodesNo < len) {
                                for (var it = 0; it < len; ++it) {
                                    if (visitedNodes[it] === false) {
                                        queue.push(graph.allNodes[it].id + "-" + graph.allNodes[it].id);
                                        fullSequenceExec.push({"type": "node", 
                                                               "id": graph.allNodes[it].id, 
                                                               "extended": true});
                                        visitedNodes[it] = true;
                                        ++visitedNodesNo;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.log("Needs some thought");
                    }
                    // RECONSIDER THIS
                    console.log(visitedNodesNo);
                    if (fullList === false) {
                        return sequenceExec;
                    }
                    else {
                        return fullSequenceExec;
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
            }
        },
        {
            id: "Bridges",
            dataValue: "Bridges",
            name: "Bridges in Connected Graph",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: false
            }
        },
        {
            id: "ArtPoints",
            dataValue: "ArtPoints",
            name: "Articulation Points in Connected Graph",
            worksOn: {
                directed: true,
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
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: false
            }
        },
        {
            id: "Prim",
            dataValue: "Prim",
            name: "Prim's MSP (Minimum Spanning Tree)",
            worksOn: {
                directed: true,
                undirected: true,
                weighted: true,
                unweighted: false
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
                unweighted: true
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
    }

    this.run = function(algorithm, graph, startNode, fullList = true) {

        var len = this.algorithms.length;
        for (var it = 0; it < len; ++it) {
            var alg = this.algorithms[it];
            
            if (alg.id === algorithm || alg.dataValue === algorithm || alg.name === algorithm) {
                return alg.run(graph, startNode, fullList);
            }
        }
    }
}

// var testMe = new Algorithms();

// function run(graph, st) {
//     return testMe.algorithms[0].run(graph, st, true);
// }