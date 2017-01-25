"use strict";

var colors = {
    unselectedNode: "#800000",
    unselectedNodeOutline: "#8422FF",
    selectedNode: "#20B2AA", // "#2e9cd3",
    unusedEdge: "#5d6663",
    unselectedEdge: "#f91616",
    selectedEdge: "#08770d"
};

var sizes = {
    radius: 15,
    edgeWidth: 3,
    nodeOutlineWidth: 2
};

var newSVGInnerHTML = "";
var active = "contextMenu--active";
var contextMenuClass = "customContextMenu";
var contextMenu = "contextMenu";
var contextMenuLink = "contextMenuLink";
var graphComponent = "graphComponent";
var nodeClass = "node";
var nodeComponent = "nodeComponent";
var edgeClass = "edge";
var edgeComponent = "edgeComponent";