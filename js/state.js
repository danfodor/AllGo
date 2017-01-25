"use strict";

function State() {
    this.svg = document.getElementById("vis-svg");
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
}

var state;

// var state = {
//     svg: document.getElementById("vis-svg"),
//     isComponentSelected: false,
//     selectedNodeId: null,
//     mode: document.getElementById("mode"),
//     graph: new Graph(),
//     reset: function() {
//         this.svg.innerHTML = newSVGInnerHTML;
//         this.isComponentSelected = false;
//         this.selectedNodeId = false;

//         if (this.mode.checked == false) {
//             $('#mode').bootstrapToggle('on');
//         }
//         this.graph = new Graph();
//     }
// }