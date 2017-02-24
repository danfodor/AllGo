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
        var nodeExists = this.nodeIndexFromId(node1.id);
        
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
                     
            // this.getNodeAdjacencyList(nodeId1).neighbours.push({"id": nodeId2, "weight": 0});
            // this.getNodeAdjacencyList(nodeId2).neighbours.push({"id": nodeId1, "weight": 0});
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
    this.nodeIndexFromId = function(nodeId) {
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
        if (this.directed === false) {
            if(edgeType === "none") {
                var id2AdjList = this.getNodeAdjacencyList(id2);
                var neighbours = id2AdjList.neighbours;
                var weights = id2AdjList.weights;

                var ind = neighbours.indexOf(id1);

                neighbours.splice(ind, 1);
                weights.splice(ind, 1);
            }
        }
        // Should normally work. Worth checking.
        else {
            // removeNodeFromNeighbours(1,2,"in") means
            // remove node 1 from the in neighbours of node 2 (so, there's a 1->2 edge)

            var done = false;
            if (edgeType === "in") {
                var node2AdjList = this.getNodeAdjacencyList(id2);
                var inNeighbours = node2AdjList.inNeighbours;
                var inWeights = node2AdjList.inWeights;

                var ind = inNeighbours.indexOf(id1);

                inNeighbours.splice(ind, 1);
                inWeights.splice(ind, 1);
            }
            else {
                if (edgeType === "out") {
                    var node2AdjList = this.getNodeAdjacencyList(id2);
                    var outNeighbours = node2AdjList.outNeighbours;
                    var outWeights = node2AdjList.outWeights;

                    var ind = outNeighbours.indexOf(id1);

                    outNeighbours.splice(ind, 1);
                    outWeights.splice(ind, 1);
                }
            }
        }
        return done;
    }

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
                this.adjacencyLists.splice(this.nodeIndexFromId(id1), 1);
                this.allNodes.splice(this.nodeIndexFromId(id1), 1);

                break;
            case "edge":
                if (this.directed === false) {
                    
                    this.removeNodeFromNeighbours(id1, id2);
                    this.removeNodeFromNeighbours(id2, id1);
                }
                else {
                    this.removeNodeFromNeighbours(id1, id2, "in");
                    this.removeNodeFromNeighbours(id2, id1, "out");
                }
                break;
            case "wieght":
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

        var ind = this.getIndexFromIdInAdjList(nodeId2, node1AdjList);
        if (ind >= 0) {
            weight = node1AdjList.weights[ind];
        }

        return weight;
    }

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
    }

};