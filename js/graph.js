"use strict";

function Graph() {
    this.allNodes = []; 
    this.adjacencyLists = []; 
    this.directed = false;
    this.selfLoops = false;
    this.weighted = false;

    this.checkIfNodeExists = function(nodeId) {
        for (var node in this.allNodes) {
            if (nodeId === node.id) {
                return true;
            }
        }
        return false;
    };

    this.addNode = function(node1) {
        var nodeExists = this.checkIfNodeExists(node1.id);
        
        if (nodeExists) {
            return false;
        }

        this.allNodes.push(node1);
        this.adjacencyLists.push({id:node1.id, neighbours:[]});

        return true;
    };

    // FUNCTION REVISED
    this.existsEdge = function(nodeId1, nodeId2) { // NEEDS TO BE COMPLETED

        var nodeAdjList = this.getNodeAdjacencyList(nodeId1);

        for (var ind in nodeAdjList.neighbours) {
        	if (nodeAdjList.neighbours[ind] === nodeId2) {
        		return true;
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

        this.getNodeAdjacencyList(nodeId1).neighbours.push(nodeId2);
        this.getNodeAdjacencyList(nodeId2).neighbours.push(nodeId1);

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

            if (distance < (nodeRadius + node.outlineWidth) * 2) {
            	return true;
            }
        }
        return false;
    };

    this.getNodeAdjacencyList = function (circleId) {
    	var nodeId = circleId;

		var adjList = null;
    	for (var ind in this.adjacencyLists) {

        	if (this.adjacencyLists[ind].id == nodeId) {
        		adjList = this.adjacencyLists[ind];
        	}
        }

        return adjList;
    };
};


// var graph = {
//     allNodes: [], 
//     adjacencyLists: [], 
//     directed: false,
//     selfLoops: false,
//     weighted: false,
//     checkIfNodeExists: function(nodeId) {
//         for (var node in this.allNodes) {
//             if (nodeId === node.id) {
//                 return true;
//             }
//         }
//         return false;
//     },
//     addNode: function(node1) {
//         var nodeExists = this.checkIfNodeExists(node1.id);
        
//         if (nodeExists) {
//             return false;
//         }

//         this.allNodes.push(node1);
//         this.adjacencyLists.push({id:node1.id, neighbours:[]});

//         return true;
//     },
//     existsEdge: function(circleId1, circleId2) { // NEEDS TO BE COMPLETED
//         var nodeId1 = circleId1;
//         var nodeId2 = circleId2;

//         var nodeAdjList = this.getNodeAdjacencyList(circleId1);
        
//         for (var ind in nodeAdjList.neighbours) {
//         	if (nodeAdjList.neighbours[ind] === nodeId2) {
//         		return true;
//         	}
//         }
//         return false;
//     },
//     addEdge: function(circleId1, circleId2) { // NEEDS TO BE COMPLETED
//         var edgeExists = this.existsEdge(circleId1, circleId2);
        
//         if (edgeExists === true) {
//         	return false;
//         }

//         this.getNodeAdjacencyList(circleId1).neighbours.push(circleId2);
//         this.getNodeAdjacencyList(circleId2).neighbours.push(circleId1);

//         return true;
//     },
//     intersectsNode: function (x, y) {
//         var node;

//         for (var i in this.allNodes) {
//             node = this.allNodes[i];
            
//             var nodeX = node.x;
//             var nodeY = node.y;
//             var nodeRadius = node.r;

//             var distance = Math.sqrt((nodeX - x) * (nodeX - x) + (nodeY - y) * (nodeY - y));

//             if (distance < (nodeRadius + node.outlineWidth) * 2) {
//                 return true;
//             }
//         }
//         return false;
//     },
//     getNodeAdjacencyList: function (circleId) {
//     	var nodeId = circleId;

// 		var adjList = null;
//     	for (var ind in this.adjacencyLists) {

//         	if (this.adjacencyLists[ind].id == nodeId) {
//         		adjList = this.adjacencyLists[ind];
//         	}
//         }

//         return adjList;
//     }
// };