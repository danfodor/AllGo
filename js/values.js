"use strict";

var colors = {
    unselectedNode: "#FFFF99", //"#EA7CC4", //"#800000",
    unselectedNodeOutline: "#5F9EA0", //"#8422FF",
    selectedNode: "#B22222", //"#20B2AA", // "#2e9cd3",
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
 	stdFontSize: "18px"
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