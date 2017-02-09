"use strict";

// ASSUMPTION: The list of nodes is going to be monotonic both by id and index.
//             That is, allNodes[i].id < allNodes[j].id <=> i < j
//             This assumption is needed because nodes can be deleted or edited.
//             But the order should stay the same.
function Graph() {
    this.allNodes = []; 
    this.adjacencyLists = []; 
    this.directed = false;
    this.selfLoops = false;
    this.weighted = false;


    this.addNode = function(node1) {
        var nodeExists = this.nodeIndexFromId(node1.id);
        
        if (nodeExists >= 0) {
            return false;
        }

        this.allNodes.push(node1);
        this.adjacencyLists.push({id: node1.id, neighbours: []});
        
        return true;
    };

    // FUNCTION REVISED
    this.existsEdge = function(nodeId1, nodeId2) { // NEEDS TO BE COMPLETED

        var nodeAdjList = this.getNodeAdjacencyList(nodeId1);
        
        if (nodeAdjList !== null) {
            var neighboursNo = nodeAdjList.neighbours.length;

            for (var ind = 0; ind < neighboursNo; ++ind) {
                if (parseInt(nodeAdjList.neighbours[ind]) === parseInt(nodeId2)) {
                    return true;
                }
            }
        }
        return false;
    };

    // FUNCTION REVISED
    // TODO: UPDATE FOR DIRECTED GRAPH
    this.addEdge = function(nodeId1, nodeId2) { // NEEDS TO BE COMPLETED
        var edgeExists = this.existsEdge(nodeId1, nodeId2);

        if (edgeExists === true) {
            return false;
        }
        if (this.directed) {
            console.log("TODO: UPDATE THE ADD EDGE FOR DIRECTED GRAHPS");
            this.getNodeAdjacencyList(nodeId1).neighbours.push(nodeId2);
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

    this.removeNodeFromNeighbours = function(id1, id2) {
        var neighbours = this.getNodeAdjacencyList(id2).neighbours;
        neighbours.splice(neighbours.indexOf(id1), 1);
    }

    this.remove = function(object, id1, id2) {
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
                    // TODO: IMPLEMENT DELETE NODE FOR DIRECTED GRAPHS:
                    // Involves the use of inEdges and outEdges
                    console.log("For directed edges, delet edges");
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
                    // TODO: HERE I NEED TO CHANGE THE ADJACENCY LISTS
                    // THEY NEED TO HAVE inNeighbours and outNeighbours
                    console.log("TO IMPLEMENT: REMOVE EDGE FOR DIRECTED");

                    console.log(this.nodeIndexFromId(id1));
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
};