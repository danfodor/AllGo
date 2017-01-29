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
    nodeOutlineWidth: 3
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