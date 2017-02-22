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
            this.adjacencyLists.push({id: node1.id, neighbours: []});
        }
        else {
            this.adjacencyLists.push({id: node1.id, 
                                      inNeighbours: [],
                                      outNeighbours: []});
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
            this.getNodeAdjacencyList(nodeId1).outNeighbours.push(nodeId2);
            this.getNodeAdjacencyList(nodeId2).inNeighbours.push(nodeId1);
        }
        else {
            this.getNodeAdjacencyList(nodeId1).neighbours.push(nodeId2);
            this.getNodeAdjacencyList(nodeId2).neighbours.push(nodeId1);
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
                return true;
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

    // Updated for directed. Slightly checked
    this.removeNodeFromNeighbours = function(id1, id2, edgeType = "none") {
        if (this.directed === false) {
            if(edgeType === "none") {
                var neighbours = this.getNodeAdjacencyList(id2).neighbours;
                neighbours.splice(neighbours.indexOf(id1), 1);
                return true;
            }
        }
        else {
            // removeNodeFromNeighbours(1,2,"in") means
            // remove node 1 from the in neighbours of node 2 (so, there's a 1->2 edge)
            if (edgeType === "in") {
                var inNeighbours = this.getNodeAdjacencyList(id2).inNeighbours;
                inNeighbours.splice(inNeighbours.indexOf(id1), 1);
                return true;
            }
            else {
                if (edgeType === "out") {
                    var outNeighbours = this.getNodeAdjacencyList(id2).outNeighbours;
                    outNeighbours.splice(outNeighbours.indexOf(id1), 1);
                    return true;
                }
            }
        }
        return false;
    }

    // Updated for directed. To be checked
    this.remove = function(object, id1, id2 = null) {
        switch(object) {
            case "node":
                if (this.directed === false) {

                    var adjList = this.getNodeAdjacencyList(id1).neighbours;
                    var edgesNo = adjList.length;
                    
                    for (var it = 0; it < edgesNo; ++it) {
                        this.removeNodeFromNeighbours(id1, adjList[it]);
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
};