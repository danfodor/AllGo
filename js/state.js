"use strict";

function State() {
    this.svg = document.getElementById("svg");
    this.modeMenu = document.getElementById("modeMenu");
    this.isComponentSelected = false;
    this.selectedNodeId = null;
    this.mode = document.getElementById("mode");
    this.graph = new Graph();
    this.contextMenuState = false;
    this.contextMenu = document.querySelector("#contextMenu");
    this.contextMenuPosition;
    this.contextMenuWidth;
    this.contextMenuHeight;
    this.contextMenuOn = false;
    this.windowWidth;
    this.windowHeight;
    this.elementInContext = null;
    this.contextElementId;
    this.maxIdValue = 0;
    this.lock = false;

    this.modifiedWeightId;
    this.modifiedNameId;
    this.rearrangeSelectedId = null;

    // This is for contiuous run
    // TODO: CHECK IF REALLY NEEDING intervalId and runsContinuously.
    this.runsContinuously = false;
    this.intervalId = null;
    this.intervalIds = [];
    this.timeoutIds = [];

    this.allowMove = true;

    this.left = this.svg.getBoundingClientRect().left;
    this.top = this.svg.getBoundingClientRect().top;

    this.directedBezier = false;

    this.loadGraphs = [];
    this.savedGraphs = [];

    this.newDirection = null;
    this.newGraph = null;
    this.modalTransform = null;
    
    this.algorithms = new Algorithms();
    this.algorithmRuns = false;
    this.runningAlgorithm = null;
    this.startNode = null;
    this.nextSteps = [];
    this.executedSteps = [];
    this.pastStartingNode = null;
    this.algorithmFinished = false;
    this.visitedNodes = [];

    this.mode = "build";

    this.mouse = {"downInsideSVG": null, "downX": -1, "downY": -1, "moved": false,
                  "movedX": -1, "movedY": -1, "upX": -1, "upY": -1, "down": false, 
                  "selectedNode": false, "elem": null, "dragOnMove": false, "moveElements": [],
                  "fromOutsideSVG": false};


    this.previewMode = false;


    this.nodeIdToCircleId = function() {

    	if (this.selectedNodeId !== false) {
        	return "circle" + this.selectedNodeId;
    	}
    	return false;
    }

    // TODO: REVIEW THE FUNCTION
    this.reset = function(directed = false) {
        this.svg.innerHTML = newSVGInnerHTML;
        this.isComponentSelected = false;
        this.selectedNodeId = false;
    	this.maxIdValue = 0;
        this.directedBezier = false;

        this.newDirection = null;
        this.modalTransform = null;
        this.rearrangeSelectedId = null;

        this.algorithms = new Algorithms();
        this.algorithmRuns = false;
        this.runningAlgorithm = null;
        this.nextSteps = [];
        this.executedSteps = [];
        this.pastStartingNode = null;
        this.algorithmFinished = false;
        this.visitedNodes = [];

        this.loadGraphs = [];

        this.allowMove = true;

        this.runsContinuously = false;
        this.intervalId;

        this.mode = "build";

        for (var i = 0; i < this.intervalIds.length; ++i) {
            window.clearInterval(this.intervalIds[i]);
        }
        this.intervalIds = [];
        for (var i = 0; i < this.timeoutIds.length; ++i) {
            window.clearInterval(this.timeoutIds[i]);
        }
        this.timeoutIds = [];

        this.left = this.svg.getBoundingClientRect().left;
        this.top = this.svg.getBoundingClientRect().top;

        this.createPreviewCircle();
        this.createForbiddenCircle();
        this.createPreviewLine();
        this.createForbiddenLine();
        this.createPreviewPath();
        this.createForbiddenPath();

        if (this.mode === "algorithm") {
            alert("go back build");
            //this.mode.checked = true;
            //$('#mode').bootstrapToggle('on');
        }

        this.lock = false;

        this.graph = new Graph(directed);
    }

    // TODO: REVIEW THE FUNCTION
    this.remove = function(object, id) {
        // CONTINUEHERE
        switch(object) {
            case "edge": 
                var id1 = parseInt(id.split('-')[0]);
                var id2 = parseInt(id.split('-')[1]);
                
                var edge = this.svg.getElementById(id);

                this.graph.remove("edge", id1, id2);
                this.svg.removeChild(edge);
                break;
            case "node": 
                var node = document.getElementById(id);
                var edges = this.svg.querySelectorAll(".node" + id + ".edge");
                var edgesNo = edges.length;
                var id1;
                var id2;

                this.graph.remove("node", id);

                var edge;

                this.svg.removeChild(node); 
                for (var it = 0; it < edgesNo; ++it) {
                    edge = this.svg.getElementById(edges[it].id);

                    this.svg.removeChild(edge); 
                }                
                break;
            case "weight": 
                var gId = id.split("weight")[1];
                var g = this.svg.getElementById(gId);
                // console.log(g);
                var weight = this.svg.getElementById(id);

                this.graph.remove("weight", id);
                g.removeChild(weight);
                break;
            default:
                break;
        }
    }

    this.createPreviewCircle = function(x = 0, y = 0, r = sizes.radius, fill = colors.unselectedNode, opacity = 0.4,
                                stroke = colors.unselectedNodeOutline, strokeWidth = sizes.nodeOutlineWidth) {
        var circle = document.createElement("circle");
        
        circle.id = "previewCircle";

        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
        circle.setAttribute("visibility", "hidden");
        circle.setAttribute("opacity", opacity);

        circle.style.fill = fill;
        circle.style.stroke = stroke;
        circle.style.strokeWidth = strokeWidth;

        this.svg.appendChild(circle);

        this.svg.innerHTML = this.svg.innerHTML;
    }

    this.createForbiddenCircle = function(x = 0, y = 0, r = sizes.radius + 5, fill = colors.unselectedNode, fillOpacity = 0,
                                stroke = "red", strokeWidth = sizes.nodeOutlineWidth) {
        var circle = document.createElement("circle");
        
        circle.id = "forbiddenCircle";

        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
        circle.setAttribute("visibility", "hidden");
        circle.setAttribute("fill-opacity", fillOpacity);

        circle.style.fill = fill;
        circle.style.stroke = stroke;
        circle.style.strokeWidth = strokeWidth;

        this.svg.appendChild(circle);

        this.svg.innerHTML = this.svg.innerHTML;
    }

    this.createPreviewLine = function(x1 = 0, y1 = 0, x2 = 0, y2 = 0, opacity = 0.25,
                                stroke = colors.unusedEdge, strokeWidth = sizes.edgeWidth) {
        
        var line = document.createElement("line");
        line.id = "previewLine";

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);

        line.setAttribute("opacity", opacity);
        
        line.style.stroke = stroke;
        line.style.strokeWidth = strokeWidth; 

        line.setAttribute("visibility", "hidden");
 
        this.svg.appendChild(line);

        this.svg.innerHTML = this.svg.innerHTML;
    }

    this.createForbiddenLine = function(x1 = 0, y1 = 0, x2 = 0, y2 = 0, opacity = 1,
                                stroke = "red", strokeWidth = sizes.edgeWidth + 1) {
        
        var line = document.createElement("line");
        line.id = "forbiddenLine";

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);

        line.setAttribute("opacity", opacity);
        
        line.style.stroke = stroke;
        line.style.strokeWidth = strokeWidth; 

        line.setAttribute("visibility", "hidden");
 
        this.svg.appendChild(line);

        this.svg.innerHTML = this.svg.innerHTML;
    }

    this.createPreviewPath = function(d = "M 0 0 Q 0 0, 0 0", opacity = 0.4, stroke = colors.unusedEdge, 
                                        strokeWidth = sizes.edgeWidth) {
        var edge = document.createElement("g");
        edge.id = "previewEdge";

        var path = document.createElement("path");

        path.id = "previewPath";

        path.setAttribute("d", d);
        
        path.style.stroke = stroke;

        path.style.strokeWidth = strokeWidth;
        path.style.fill= "transparent";
        path.setAttribute("opacity", opacity);

        path.setAttribute("visibility", "hidden");
    
        var defs = document.createElement("defs");
        var marker = document.createElement("marker");

        marker.id = "previewArrow";
        marker.setAttribute("markerWidth", 5);
        marker.setAttribute("markerHeight", 5);
        marker.setAttribute("viewBox", "-10 -4 12 12");
        marker.setAttribute("refX", -2);
        marker.setAttribute("refY", 0);
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");
        
        var polygon = document.createElement("polygon");
        polygon.setAttribute("points", sizes.stdPolygonPoints);
        polygon.setAttribute("fill", colors.unusedEdge);
        polygon.setAttribute("stroke", colors.unusedEdge);
        polygon.setAttribute("stroke-width", "1px");

        marker.innerHTML = polygon.outerHTML;

        defs.appendChild(marker);
        path.setAttribute("marker-end", 'url(#' + marker.id + ')');

        edge.appendChild(defs);
        edge.appendChild(path);    
 
        this.svg.appendChild(edge);

        this.svg.innerHTML = this.svg.innerHTML;        
    }

    this.createForbiddenPath = function(d = "M 0 0 Q 0 0, 0 0", opacity = 1, stroke = "red", 
                                        strokeWidth = sizes.edgeWidth) {
        var edge = document.createElement("g");
        edge.id = "forbiddenEdge";

        var path = document.createElement("path");
        path.id = "forbiddenPath";

        path.setAttribute("d", d);
        path.setAttribute("opacity", opacity);
        
        path.style.stroke = stroke;
        path.style.strokeWidth = strokeWidth; 
        path.style.fill= "transparent";

        path.setAttribute("visibility", "hidden");
 

        var defs = document.createElement("defs");
        var marker = document.createElement("marker");

        marker.id = "forbiddenArrow";
        marker.setAttribute("markerWidth", 5);
        marker.setAttribute("markerHeight", 5);
        marker.setAttribute("viewBox", "-10 -4 12 12");
        marker.setAttribute("refX", -2);
        marker.setAttribute("refY", 0);
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");
        
        var polygon = document.createElement("polygon");
        polygon.setAttribute("points", sizes.stdPolygonPoints);
        polygon.setAttribute("fill", stroke);
        polygon.setAttribute("stroke", stroke);
        polygon.setAttribute("stroke-width", "1px");

        marker.innerHTML = polygon.outerHTML;

        defs.appendChild(marker);
        path.setAttribute("marker-end", 'url(#' + marker.id + ')');

        edge.appendChild(defs);
        edge.appendChild(path);    


        this.svg.appendChild(edge);

        this.svg.innerHTML = this.svg.innerHTML;        
    }

    this.createPreviewCircle();
    this.createForbiddenCircle();
    this.createPreviewLine();
    this.createForbiddenLine();
    this.createPreviewPath();
    this.createForbiddenPath();    
   
}

var state;