"use strict";

function State() {
    this.svg = document.getElementById("svg");
    this.isComponentSelected = false;
    this.selectedNodeId = null;
    this.mode = document.getElementById("mode");
    this.graph = new Graph();
    this.contextMenuState = false;
    this.contextMenu = document.querySelector("#contextMenu");
    this.contextMenuPosition;
    this.contextMenuWidth;
    this.contextMenuHeight;
    this.fromRightClick = false;
    this.windowWidth;
    this.windowHeight;
    this.elementInContext = null;
    this.contextElementId;
    this.maxIdValue = 0;

    this.move = document.getElementById("move");
    this.moveMode = false;
    this.posX;
    this.posY;
    this.draggedElem;
    this.elementsToDrag = [];
    this.mouseDownDrag;


    this.previewMode = false;

    this.nodeIdToCircleId = function() {
    	if (this.selectedNodeId !== false) {
        	return "circle" + this.selectedNodeId;
    	}

    	return false;
    }

    // TODO: REVIEW THE FUNCTION
    this.reset = function() {
        this.svg.innerHTML = newSVGInnerHTML;
        this.isComponentSelected = false;
        this.selectedNodeId = false;
    	this.maxIdValue = 0;
        this.elementsToDrag = [];

        if (this.mode.checked === false) {
            //this.mode.checked = true;
            $('#mode').bootstrapToggle('on');
        }

        if (this.move.checked === true) {
            //this.moveMode.checked = true;
            $('#move').bootstrapToggle('off');
        }

        this.graph = new Graph();
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
                
                // TODO: DETELE THIS CODE
                // for (var it = 0; it < edgesNo; ++it) {

                //     id1 = parseInt(edges[it].id.split('-')[0]);
                //     id2 = parseInt(edges[it].id.split('-')[1]);
                    
                //     this.graph.remove("edge", id1, id2);
                // }

                this.graph.remove("node", id);

                var edge;

                this.svg.removeChild(node); 
                for (var it = 0; it < edgesNo; ++it) {
                    edge = this.svg.getElementById(edges[it].id);

                    this.svg.removeChild(edge); 
                }                
                break;
            default:
                break;
        }
    }
}

var state;