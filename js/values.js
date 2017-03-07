"use strict";

var colors = {
    unselectedNode: "#FFFF99", //"#EA7CC4", //"#800000",
    unselectedNodeOutline: "#5F9EA0", //"#8422FF",
    selectedNode: "#80ffff", // "#bf80ff", // "#0059b3", // "#80ffff", // "#ff3333", //"#20B2AA", // "#2e9cd3", // "#B22222"
    unusedEdge: "#5d6663",
    unselectedEdge: "#f91616",
    selectedEdge: "#08770d"
};

var sizes = {
    radius: 17,
    edgeWidth: 3,
    nodeOutlineWidth: 3,
 	stdPolygonPoints: "-4,0 -8,-4 -1,0 -8,4",
 	defPolygonPoints: "-2,0 -5,5 5,0 -5,-5",
 	weightDistance: 12,
 	stdFontSize: "18px",
 	angleDev: 12
};

var newSVGInnerHTML = "";
var active = "contextMenu--active";
var activeItem = "contextMenuItem--active";
var contextMenuClass = "customContextMenu";
var contextMenu = "contextMenu";
var contextMenuLink = "contextMenuLink";
var graphComponent = "graphComponent";
var nodeClass = "node";
var nodeComponent = "nodeComponent";
var edgeClass = "edge";
var edgeComponent = "edgeComponent";

var undirectedAlgorithms = ["BFS", "DFS", "Dijkstra", "Kruskal", "Prim", "Bridges", "ArtPoints"];
var directedAlgorithms = ["BFS", "DFS", "Dijkstra", "Kruskal", "Prim", "Bridges", "ArtPoints", "MaxFlow"];

var graphExamples = {
	BFS: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: ['{"allNodes":[{"id":1,"name":"1","x":557.328125,"y":338,"r":17,"outlineWidth":3},{"id":2,"name":"2","x":497.98200799711014,"y":501.0521163977519,"r":17,"outlineWidth":3},{"id":3,"name":"3","x":347.71236469271537,"y":587.8103354105733,"r":17,"outlineWidth":3},{"id":4,"name":"4","x":176.83203125000006,"y":557.6795221521636,"r":17,"outlineWidth":3},{"id":5,"name":"5","x":65.29781481017454,"y":424.7582190128214,"r":17,"outlineWidth":3},{"id":6,"name":"6","x":65.29781481017451,"y":251.24178098717863,"r":17,"outlineWidth":3},{"id":7,"name":"7","x":176.8320312499999,"y":118.32047784783646,"r":17,"outlineWidth":3},{"id":8,"name":"8","x":347.71236469271525,"y":88.18966458942668,"r":17,"outlineWidth":3},{"id":9,"name":"9","x":497.9820079971101,"y":174.94788360224803,"r":17,"outlineWidth":3}],"adjacencyLists":[{"id":1,"neighbours":[2,9],"weights":[0,0]},{"id":2,"neighbours":[1,3],"weights":[0,0]},{"id":3,"neighbours":[2,4],"weights":[0,0]},{"id":4,"neighbours":[3,5],"weights":[0,0]},{"id":5,"neighbours":[4,6],"weights":[0,0]},{"id":6,"neighbours":[5,7],"weights":[0,0]},{"id":7,"neighbours":[6,8],"weights":[0,0]},{"id":8,"neighbours":[7,9],"weights":[0,0]},{"id":9,"neighbours":[8,1],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}']
		}
	},
	DFS: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	Bridges: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	ArtPoints: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	Prim: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	Kruskal: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	Dijkstra: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	},
	MaxFlow: {
		directed: {
			weighted: [],
			unweighted: []
		},
		undirected: {
			weighted: [],
			unweighted: []
		}
	}
}