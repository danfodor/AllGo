"use strict";

var colors = {
    unselectedNode: "#FFFF99", //"#EA7CC4", //"#800000",
    unselectedNodeOutline: "#5F9EA0", //"#8422FF",
    selectedNode: "#80ffff", // "#bf80ff", // "#0059b3", // "#80ffff", // "#ff3333", //"#20B2AA", // "#2e9cd3", // "#B22222"
    buildEdge: "black",

    activeNode: "#eff5ff",
    activeNodeBorder: "#4286f4",
    unvisitedNode: "#eff5ff",
    unvisitedNodeBorder: "#4286f4",
    visitedNode: "#eff5ff",
    visitedNodeBorder: "#008e17",

    unvisitedEdge: "#5d6663",
    unextendedEdge: "#f91616",
    extendedEdge: "#008706"
};

var sizes = {
    radius: 18,
    edgeWidth: 3,
    nodeOutlineWidth: 3,
    ratios: {radiusStroke: 6, radiusLine: 6, radiusFont: 1},
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
            unweighted: [{id: "circular9",  name: "Circular-9-edges", graph:'{"allNodes":[{"id":1,"name":"1","x":557.328125,"y":338,"r":17,"outlineWidth":3},{"id":2,"name":"2","x":497.98200799711014,"y":501.0521163977519,"r":17,"outlineWidth":3},{"id":3,"name":"3","x":347.71236469271537,"y":587.8103354105733,"r":17,"outlineWidth":3},{"id":4,"name":"4","x":176.83203125000006,"y":557.6795221521636,"r":17,"outlineWidth":3},{"id":5,"name":"5","x":65.29781481017454,"y":424.7582190128214,"r":17,"outlineWidth":3},{"id":6,"name":"6","x":65.29781481017451,"y":251.24178098717863,"r":17,"outlineWidth":3},{"id":7,"name":"7","x":176.8320312499999,"y":118.32047784783646,"r":17,"outlineWidth":3},{"id":8,"name":"8","x":347.71236469271525,"y":88.18966458942668,"r":17,"outlineWidth":3},{"id":9,"name":"9","x":497.9820079971101,"y":174.94788360224803,"r":17,"outlineWidth":3}],"adjacencyLists":[{"id":1,"neighbours":[2,9],"weights":[0,0]},{"id":2,"neighbours":[1,3],"weights":[0,0]},{"id":3,"neighbours":[2,4],"weights":[0,0]},{"id":4,"neighbours":[3,5],"weights":[0,0]},{"id":5,"neighbours":[4,6],"weights":[0,0]},{"id":6,"neighbours":[5,7],"weights":[0,0]},{"id":7,"neighbours":[6,8],"weights":[0,0]},{"id":8,"neighbours":[7,9],"weights":[0,0]},{"id":9,"neighbours":[8,1],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'},
                         {id: "k33", name: "K-3,3", graph:'{"allNodes":[{"id":1,"name":"1","x":263,"y":196,"r":17,"outlineWidth":3},{"id":2,"name":"2","x":416,"y":187,"r":17,"outlineWidth":3},{"id":3,"name":"3","x":264,"y":300,"r":17,"outlineWidth":3},{"id":4,"name":"4","x":407,"y":302,"r":17,"outlineWidth":3},{"id":5,"name":"5","x":263,"y":399,"r":17,"outlineWidth":3},{"id":6,"name":"6","x":405,"y":387,"r":17,"outlineWidth":3}],"adjacencyLists":[{"id":1,"neighbours":[4,2,6],"weights":[0,0,0]},{"id":2,"neighbours":[1,3,5],"weights":[0,0,0]},{"id":3,"neighbours":[2,4,6],"weights":[0,0,0]},{"id":4,"neighbours":[1,3,5],"weights":[0,0,0]},{"id":5,"neighbours":[6,4,2],"weights":[0,0,0]},{"id":6,"neighbours":[1,3,5],"weights":[0,0,0]}],"directed":false,"selfLoops":false,"weighted":false}'},
                         {id: "2nodes", name: "2-nodes-graph", graph: '{"allNodes":[{"id":1,"name":"1","x":301,"y":263,"r":17,"outlineWidth":3},{"id":2,"name":"2","x":800,"y":800,"r":17,"outlineWidth":3}],"adjacencyLists":[{"id":1,"neighbours":[2],"weights":[0]},{"id":2,"neighbours":[1],"weights":[0]}],"directed":false,"selfLoops":false,"weighted":false}'}]

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
            weighted: [{id: 'square9', name: 'Square-9', graph: '{"allNodes":[{"id":1,"name":"1","x":121,"y":179,"r":17,"outlineWidth":3},{"id":2,"name":"2","x":274,"y":177,"r":17,"outlineWidth":3},{"id":3,"name":"3","x":416,"y":177,"r":17,"outlineWidth":3},{"id":4,"name":"4","x":416,"y":288,"r":17,"outlineWidth":3},{"id":5,"name":"5","x":273,"y":289,"r":17,"outlineWidth":3},{"id":6,"name":"6","x":119,"y":289,"r":17,"outlineWidth":3},{"id":7,"name":"7","x":118,"y":397,"r":17,"outlineWidth":3},{"id":8,"name":"8","x":272,"y":396,"r":17,"outlineWidth":3},{"id":9,"name":"9","x":416,"y":396,"r":17,"outlineWidth":3}],"adjacencyLists":[{"id":1,"neighbours":[2,6],"weights":[1,7]},{"id":2,"neighbours":[1,3,5],"weights":[1,5,7]},{"id":3,"neighbours":[2,4],"weights":[5,7]},{"id":4,"neighbours":[3,5,9],"weights":[7,3,5]},{"id":5,"neighbours":[4,6,2,8],"weights":[3,1,7,5]},{"id":6,"neighbours":[5,7,1],"weights":[1,5,7]},{"id":7,"neighbours":[6,8],"weights":[5,1]},{"id":8,"neighbours":[7,9,5],"weights":[1,10,5]},{"id":9,"neighbours":[8,4],"weights":[10,5]}],"directed":false,"selfLoops":false,"weighted":true}'}],
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

var graphExamplesForPresentation = {
    BFS: {
        directed: {
            weighted: [],
            unweighted: []
        },
        undirected: {
            weighted: [],
            unweighted: [{id: "circular8",  name: "Circular-8", graph:'{"allNodes":[{"id":1,"name":"1","x":783.6640625,"y":384,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":685.8377274163068,"y":620.1736649163068,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":449.6640625,"y":718,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":213.49039758369315,"y":620.1736649163068,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":115.6640625,"y":384.00000000000006,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":213.49039758369307,"y":147.82633508369315,"r":30,"outlineWidth":6},{"id":7,"name":"7","x":449.66406249999994,"y":50,"r":30,"outlineWidth":6},{"id":8,"name":"8","x":685.8377274163068,"y":147.82633508369307,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,8],"weights":[0,0]},{"id":2,"neighbours":[1,3],"weights":[0,0]},{"id":3,"neighbours":[2,4],"weights":[0,0]},{"id":4,"neighbours":[3,5],"weights":[0,0]},{"id":5,"neighbours":[4,6],"weights":[0,0]},{"id":6,"neighbours":[5,7],"weights":[0,0]},{"id":7,"neighbours":[6,8],"weights":[0,0]},{"id":8,"neighbours":[7,1],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'},
                         {id: "k33", name: "K-3,3", graph:'{"allNodes":[{"id":1,"name":"1","x":240,"y":227,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":479,"y":227,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":240,"y":370,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":479,"y":370,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":479,"y":506,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":240,"y":506,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,4,5],"weights":[0,0,0]},{"id":2,"neighbours":[1,3,6],"weights":[0,0,0]},{"id":3,"neighbours":[4,2,5],"weights":[0,0,0]},{"id":4,"neighbours":[3,1,6],"weights":[0,0,0]},{"id":5,"neighbours":[6,1,3],"weights":[0,0,0]},{"id":6,"neighbours":[5,4,2],"weights":[0,0,0]}],"directed":false,"selfLoops":false,"weighted":false}'},
                         {id: "2components", name: "2-Components", graph: '{"allNodes":[{"id":1,"name":"1","x":156,"y":248,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":313,"y":431,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":403,"y":372,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":251,"y":196,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":490,"y":172,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2],"weights":[0]},{"id":2,"neighbours":[1],"weights":[0]},{"id":3,"neighbours":[4,5],"weights":[0,0]},{"id":4,"neighbours":[3,5],"weights":[0,0]},{"id":5,"neighbours":[4,3],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'}]
        }
    },
    DFS: {
        directed: {
            weighted: [],
            unweighted: [{id: "dPacman9",  name: "Directed-Pacman-9", graph:'{"allNodes":[{"id":1,"name":"1","x":457.6640625,"y":331,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":670.2848621182657,"y":523.1228315897233,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":499.674737668076,"y":621.6246328675159,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":305.66406250000006,"y":587.4153162899183,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":179.03258771365842,"y":436.50180127779265,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":179.03258771365836,"y":239.49819872220743,"r":30,"outlineWidth":6},{"id":7,"name":"7","x":305.6640624999999,"y":88.58468371008172,"r":30,"outlineWidth":6},{"id":8,"name":"8","x":499.67473766807586,"y":54.37536713248403,"r":30,"outlineWidth":6},{"id":9,"name":"9","x":670.2848621182657,"y":152.8771684102766,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"inNeighbours":[2,9],"inWeights":[0,0],"outNeighbours":[],"outWeights":[]},{"id":2,"inNeighbours":[3],"inWeights":[0],"outNeighbours":[1,3],"outWeights":[0,0]},{"id":3,"inNeighbours":[2,4],"inWeights":[0,0],"outNeighbours":[2,4],"outWeights":[0,0]},{"id":4,"inNeighbours":[3,5],"inWeights":[0,0],"outNeighbours":[3,5],"outWeights":[0,0]},{"id":5,"inNeighbours":[4,6],"inWeights":[0,0],"outNeighbours":[4,6],"outWeights":[0,0]},{"id":6,"inNeighbours":[5,7],"inWeights":[0,0],"outNeighbours":[5,7],"outWeights":[0,0]},{"id":7,"inNeighbours":[6,8],"inWeights":[0,0],"outNeighbours":[6,8],"outWeights":[0,0]},{"id":8,"inNeighbours":[7,9],"inWeights":[0,0],"outNeighbours":[7,9],"outWeights":[0,0]},{"id":9,"inNeighbours":[8],"inWeights":[0],"outNeighbours":[8,1],"outWeights":[0,0]}],"directed":true,"selfLoops":false,"weighted":false}'}]
        },
        undirected: {
            weighted: [],
            unweighted: [{id: "pacman9",  name: "Pacman-9", graph:'{"allNodes":[{"id":1,"name":"1","x":431.6640625,"y":324,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":670.2848621182657,"y":523.1228315897233,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":499.674737668076,"y":621.6246328675159,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":305.66406250000006,"y":587.4153162899183,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":179.03258771365842,"y":436.50180127779265,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":179.03258771365836,"y":239.49819872220743,"r":30,"outlineWidth":6},{"id":7,"name":"7","x":305.6640624999999,"y":88.58468371008172,"r":30,"outlineWidth":6},{"id":8,"name":"8","x":499.67473766807586,"y":54.37536713248403,"r":30,"outlineWidth":6},{"id":9,"name":"9","x":670.2848621182657,"y":152.8771684102766,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,9],"weights":[0,0]},{"id":2,"neighbours":[1,3],"weights":[0,0]},{"id":3,"neighbours":[2,4],"weights":[0,0]},{"id":4,"neighbours":[3,5],"weights":[0,0]},{"id":5,"neighbours":[4,6],"weights":[0,0]},{"id":6,"neighbours":[5,7],"weights":[0,0]},{"id":7,"neighbours":[6,8],"weights":[0,0]},{"id":8,"neighbours":[7,9],"weights":[0,0]},{"id":9,"neighbours":[8,1],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'}]
        }
    },
    Bridges: {
        directed: {
            weighted: [],
            unweighted: []
        },
        undirected: {
            weighted: [],
            unweighted: [{id: "1Bridge", name: "1-Bridge", graph: '{"allNodes":[{"id":1,"name":"1","x":146,"y":188,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":324,"y":353,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":152,"y":485,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":498,"y":348,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":624,"y":165,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":639,"y":475,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,3],"weights":[0,0]},{"id":2,"neighbours":[1,3,4],"weights":[0,0,0]},{"id":3,"neighbours":[2,1],"weights":[0,0]},{"id":4,"neighbours":[2,5,6],"weights":[0,0,0]},{"id":5,"neighbours":[4,6],"weights":[0,0]},{"id":6,"neighbours":[5,4],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'}]
        }
    },
    ArtPoints: {
        directed: {
            weighted: [],
            unweighted: []
        },
        undirected: {
            weighted: [],
            unweighted: [{id: "1artPoint",  name: "1-Articulation-Point", graph:'{"allNodes":[{"id":1,"name":"1","x":114,"y":167,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":289,"y":301,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":115,"y":405,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":463,"y":169,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":456,"y":425,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,3],"weights":[0,0]},{"id":2,"neighbours":[1,3,4,5],"weights":[0,0,0,0]},{"id":3,"neighbours":[2,1],"weights":[0,0]},{"id":4,"neighbours":[2,5],"weights":[0,0]},{"id":5,"neighbours":[4,2],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'}, 
            			 {id: "2artPoints", name: "2-Articulation-Points", graph: '{"allNodes":[{"id":1,"name":"1","x":80,"y":224,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":75,"y":423,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":178,"y":334,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":292,"y":235,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":288,"y":427,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":404,"y":331,"r":30,"outlineWidth":6},{"id":7,"name":"7","x":508,"y":230,"r":30,"outlineWidth":6},{"id":8,"name":"8","x":502,"y":433,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,3],"weights":[0,0]},{"id":2,"neighbours":[1,3],"weights":[0,0]},{"id":3,"neighbours":[2,1,4,5],"weights":[0,0,0,0]},{"id":4,"neighbours":[3,5,6],"weights":[0,0,0]},{"id":5,"neighbours":[4,3,6],"weights":[0,0,0]},{"id":6,"neighbours":[4,5,7,8],"weights":[0,0,0,0]},{"id":7,"neighbours":[6,8],"weights":[0,0]},{"id":8,"neighbours":[7,6],"weights":[0,0]}],"directed":false,"selfLoops":false,"weighted":false}'}]
        }
    },
    Prim: {
        directed: {
            weighted: [],
            unweighted: []
        },
        undirected: {
            weighted: [{id: 'square9', name: 'Square-9', graph: '{"allNodes":[{"id":1,"name":"1","x":173,"y":225,"r":30,"outlineWidth":6},{"id":2,"name":"2","x":349,"y":227,"r":30,"outlineWidth":6},{"id":3,"name":"3","x":547,"y":223,"r":30,"outlineWidth":6},{"id":4,"name":"4","x":548,"y":382,"r":30,"outlineWidth":6},{"id":5,"name":"5","x":548,"y":538,"r":30,"outlineWidth":6},{"id":6,"name":"6","x":353,"y":546,"r":30,"outlineWidth":6},{"id":7,"name":"7","x":352,"y":389,"r":30,"outlineWidth":6},{"id":8,"name":"8","x":173,"y":390,"r":30,"outlineWidth":6},{"id":9,"name":"9","x":169,"y":547,"r":30,"outlineWidth":6}],"adjacencyLists":[{"id":1,"neighbours":[2,8],"weights":[4,7]},{"id":2,"neighbours":[1,3,7],"weights":[4,2,7]},{"id":3,"neighbours":[2,4],"weights":[2,7]},{"id":4,"neighbours":[3,5,7],"weights":[7,5,1]},{"id":5,"neighbours":[4,6],"weights":[5,7]},{"id":6,"neighbours":[5,7,9],"weights":[7,9,1]},{"id":7,"neighbours":[6,8,4,2],"weights":[9,7,1,7]},{"id":8,"neighbours":[7,1,9],"weights":[7,7,2]},{"id":9,"neighbours":[8,6],"weights":[2,1]}],"directed":false,"selfLoops":false,"weighted":true}'}],
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