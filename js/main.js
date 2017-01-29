"use strict";

// Uses external js file ./state.js
// Uses external js file ./graph.js
// Uses external js file ./values.js

// REFACTOR
function clickInterpret(e) {
    
    var button = e.which || e.button;
    if (button === 1 && state.fromRightClick === true) {
        state.fromRightClick = false;
        return;
    }

    if (button !== 1) {
        return;
    }


    var clickedElement = e.srcElement || e.target;
    var clickedTag = clickedElement.nodeName;

    if (clickedInsideElement(e, "canvas")) {

        // TODO: REFACTOR. Implement to get the class that was clicked;
        // code comes here...
        
        var notSVG = true;
        var notCircle = true;

        // TODO: MAKE EVENT PROPER EVENT
        switch(clickedTag){
            case "svg": 
                notSVG = false;
                break;
            case "circle":
                notCircle = false;
                handleSelect(document.getElementById(clickedElement.id.split("circle")[1]));
                break;
            case "text":
                //console.log("hurray");
                if (clickedElement.parentNode.classList.contains(nodeClass)) {
                    notCircle = false;
                    
                    var nodeElement = document.getElementById(clickedElement.id.split("name")[1]);
                    //console.log(nodeElement);
                    handleSelect(nodeElement);
                }
                // TODO: Else edge weight probably
                break;
            default: 
                break;
        }

        // TODO: ADD PREVIEW CHECK 
        if (!notSVG) {
            if (state.isComponentSelected == true) {
                state.isComponentSelected = false;
                
                var htmlCircle = document.getElementById(state.nodeIdToCircleId());
                htmlCircle.style.fill = colors.unselectedNode;

                state.svg.innerHTML = state.svg.innerHTML;
                return;
            }
        }
        // ENDS HERE

        if (notSVG) {
            return;
        }

        var clientX = e.clientX;
        var clientY = e.clientY;
        
        var dim = state.svg.getBoundingClientRect();
        
        var x = clientX - dim.left;
        var y = clientY - dim.top;

        
        var itOverlapsMargins = overlapsMargins(clientX, clientY, sizes.radius, 0, dim.right, dim.bottom, 0);
        if (itOverlapsMargins === false) {
            addNode(x, y);
        }
    }
}

function mouseInterpret(e) {
    console.log("maybe change the cursor?");
}

function overlapsMargins(x, y, radius, top, right, bottom, left) {
    var leftX = x - radius;
    var rightX = x + radius;

    var topY = y - radius;
    var bottomY = y + radius;

    if ((rightX + 2) >= right || (bottomY + 2) >= bottom) {
        return true;
    }

    if ((leftX - 2) <= left || (topY - 2) <= top) {
        return true;
    }

    return false;
}

// REFACTOR
function addNode(x, y) {
    if (state.graph.intersectsNode(x, y)) {
        return;
    }
    
    state.maxIdValue++;
    
    // The Node stored as a group tag within SVG
    var node = document.createElement("g");
    node.id = state.maxIdValue;

    // CIRCLE for the node
    var circle = document.createElement("circle");
    
    circle.id = "circle";
    circle.id += node.id;

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", sizes.radius);

    circle.style.fill = colors.unselectedNode;
    circle.style.stroke = colors.unselectedNodeOutline;
    circle.style.strokeWidth = sizes.nodeOutlineWidth;
    
    circle.classList.add(nodeComponent);
    circle.classList.add("circle");
    
    // TEXT for the node
    var text = document.createElement("text");
    
    text.id = "name" + state.maxIdValue;
    text.style.fontSize = "18px";
    text.style.alignmentBaseline = "central";
    text.style.textAnchor = "middle";
    text.style.fontWeight = "bold";

    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.style.cursor = "default";
    text.innerHTML = state.maxIdValue;
    
    text.classList.add(nodeComponent);
    text.classList.add("name");
    // TODO: Text size problem needs to be handeled.

    var node = document.createElement("g");
    node.id = state.maxIdValue;
    
    node.appendChild(circle);
    node.appendChild(text);
    
    node.classList.add("node" + node.id);
    
    node.classList.add(nodeClass);
    node.classList.add(graphComponent);


    state.graph.addNode({id: node.id, name: text.innerHTML, 
                         x: x, y: y, r: parseInt(circle.getAttribute("r")), 
                         outlineWidth: parseInt(circle.style.strokeWidth)});
    
    state.svg.appendChild(node);   
    state.svg.innerHTML = state.svg.innerHTML;
}

// REFACTORING
function handleSelect(node) {
    
    state.isComponentSelected = !state.isComponentSelected;

    if (state.isComponentSelected == true) {
        var circleId = "circle" + node.id;
        var htmlCircle = document.getElementById(circleId);
        
        htmlCircle.style.fill = colors.selectedNode;

        state.svg.innerHTML = state.svg.innerHTML;
        state.selectedNodeId = node.id;
    }
    else {
        var htmlCircle = document.getElementById(state.nodeIdToCircleId());
        htmlCircle.style.fill = colors.unselectedNode;

        if (state.selectedNodeId !== node.id)
        {
            addEdge(state.selectedNodeId, node.id);
        }

        state.svg.innerHTML = state.svg.innerHTML;
    }
}

// TODO: IMPLEMENT THIS;
function addEdge(nodeId1, nodeId2) {

    if (state.graph.addEdge(nodeId1, nodeId2)) {
        var circle1 = document.getElementById("circle" + nodeId1);
        var circle2 = document.getElementById("circle" + nodeId2);

        var x1 = circle1.cx.baseVal.value;
        var y1 = circle1.cy.baseVal.value;

        var x2 = circle2.cx.baseVal.value;
        var y2 = circle2.cy.baseVal.value;

        var edge = document.createElement("g");
        edge.id = nodeId1 + "-" + nodeId2;

        var line = document.createElement("line");
        line.id = "line" + nodeId1 + "-" + nodeId2;
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        
        line.style.stroke = colors.unusedEdge;
        line.style.strokeWidth = sizes.edgeWidth;
        line.classList.add(edgeComponent);
        line.classList.add("line");
        
        edge.appendChild(line);
        
        edge.classList.add("node" + nodeId1);      
        edge.classList.add("node" + nodeId2);   

        edge.classList.add(edgeClass);
        edge.classList.add(graphComponent);

        state.svg.insertBefore(edge, state.svg.firstChild);
    }
    else {
        return false;
    }

    return true;
}

function modeChange() {
    if (state.mode.checked === true) {
        console.log("nemahh");

    }
    else {
        console.log("buaia");
    }
}

function switchMove() {
    if (state.move.checked) {
        console.log("Good life");
        
        var nodeComponents = document.querySelectorAll("." + nodeComponent);
        var componentsNumber = nodeComponents.length;
        var it;

        for (it = 0; it < componentsNumber; ++it) {
            nodeComponents[it].style.cursor = "pointer";
        }

        onmousemoveListener(true);
    }
    else {
        var nodeComponents = document.querySelectorAll("." + nodeComponent);
        var componentsNumber = nodeComponents.length;
        var it;

        for (it = 0; it < componentsNumber; ++it) {
            nodeComponents[it].style.cursor = "default";
        }

        onmousemoveListener(false);
    }
}

function switchDir(argument) {
    if (document.getElementById("dir").checked) {
        state.graph.directed = true;
    }
    else {
        state.graph.directed = false;
    }
}

function reset() {
    state.reset();
    //console.log("haha"); // IMPLEMENT TOMORROW
}

// The Code for the context menu, starting here, has been done with the help of the 
// "Building a Custom Right-Click (Context) Menu with JavaScript" tutorial from
// https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

// Check if clicked element is inside an element with class className
function clickedInsideElement(e, className) {
    var element = e.srcElement || e.target;
    
    if (element.classList && element.classList.contains(className)) {
        return element;
    }
    else {
        while (element = element.parentNode) {
            if (element.classList && element.classList.contains(className)) {
                return element;
            }
        }
    }

    return false;
}

// Check if clicked element is inside an element with class className
function clickedInsideClass(element, className) {
    if (element.classList && element.classList.contains(className)) {
        return element;
    }
    else {
        while (element = element.parentNode) {
            if (element.classList && element.classList.contains(className)) {
                return element;
            }
        }
    }

    return false;
}

function getPosition(e) {
    var posX = 0;
    var posY = 0;

    if (!e){  
        var e = window.event;
    }

    if (e.pageX || e.pageY) {
        posX = e.pageX;
        posY = e.pageY;
    } 
    else if (e.clientX || e.clientY) {
        posX = e.clientX + document.body.scrollLeft + 
                           document.documentElement.scrollLeft;
        posY = e.clientY + document.body.scrollTop + 
                           document.documentElement.scrollTop;
    }

    return {
        x: posX,
        y: posY
    }
}

// Sets the position of the meny to where it has been clicked
function positionMenu(e) {
    var clickedPosition = getPosition(e);
    
    // TODO: CHECK IF THIS IS FINE OR NOT (windowWIDTH)
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    windowWidth = state.svg.width.baseVal.value;
    windowHeight = state.svg.height.baseVal.value;

    var contextMenuWidth = state.contextMenu.offsetWidth;
    var contextMenuHeight = state.contextMenu.offsetHeight;

    if ((windowWidth - clickedPosition.x) < contextMenuWidth) {
        clickedPosition.x -= contextMenuWidth;
    }
    if ((windowHeight - clickedPosition.y) < contextMenuHeight) {
        clickedPosition.y -= contextMenuHeight;
    } 

    state.contextMenuPosition = clickedPosition;
    state.contextMenuPosition.xpx = state.contextMenuPosition.x + "px";
    state.contextMenuPosition.ypx = state.contextMenuPosition.y + "px";

    state.contextMenu.style.left = state.contextMenuPosition.xpx;
    state.contextMenu.style.top = state.contextMenuPosition.ypx;

}

// Deploys context menus
function contextListener() {
    document.addEventListener("contextmenu", function(e) {
        var contextMenuArea = clickedInsideElement(e, contextMenuClass);
        var isInsideMenu = clickedInsideElement(e, contextMenu);

        state.fromRightClick = true;        
        
        state.elementInContext = clickedInsideElement(e, graphComponent);
        if (state.elementInContext === false) {
            state.elementInContext = e.srcElement || e.target;
        }

        if (isInsideMenu === false) {
            state.contextElementId = state.elementInContext.id;
        }

        if (contextMenuArea) {
            e.preventDefault();

            // create the custom context menu
            customContextMenu(state.elementInContext);

            toggleMenuOn();
            positionMenu(e);
        }
        else {
            var isLinkElement = clickedInsideElement(e, contextMenuLink);
            var isInsideMenu = clickedInsideElement(e, contextMenu);

            if (isInsideMenu !== false) {
                e.preventDefault();
                
                if (isLinkElement !== false) {
                    menuItemListener(isLinkElement);
                }
            }
            else {
                state.elementInContext = null; // TODO: Investigate for what is this used!!
                toggleMenuOff();
            }
        }

        // Eliminates element
        if (state.isComponentSelected === true) {
            state.isComponentSelected = false;

            var htmlCircle = document.getElementById(state.nodeIdToCircleId());
            htmlCircle.style.fill = colors.unselectedNode;
            state.svg.innerHTML = state.svg.innerHTML;
        }
    });
}

function customContextMenu(clickedElement) {
    
    switch(clickedElement.nodeName) {
        case "g":
            if(clickedElement.classList.contains("node")) {
                document.getElementById("edit").style.display = "block"; 
                document.getElementById("delete").style.display = "block"; 
                document.getElementById("resetItem").style.display = "none"; 
            }
            else {
                if (clickedElement.classList.contains("edge")) {
                    document.getElementById("edit").style.display = "none"; 
                    document.getElementById("delete").style.display = "block"; 
                    document.getElementById("resetItem").style.display = "none";                     
                }
            }
            break;
        case "svg":
            document.getElementById("edit").style.display = "none"; 
            document.getElementById("delete").style.display = "none"; 
            document.getElementById("resetItem").style.display = "block";
            break;
        default:
            return false;
            break;
    }
    return true;
}

// Checks for click events
function clickListener() {
    document.addEventListener("click", function(e) {
        var isLinkElement = clickedInsideElement(e, contextMenuLink);
        var isInsideMenu = clickedInsideElement(e, contextMenu);
        var isInsideSVG = clickedInsideElement(e, "canvas");

        if (isInsideMenu !== false) {
            e.preventDefault();
            
            if (isLinkElement !== false) {
                menuItemListener(isLinkElement);
            }
        }
        else {
            var button = e.which || e.button;
            if (button === 1) {
                toggleMenuOff();
            }
        }
    });
}



function menuItemListener(linkElement) {
    state.fromRightClick = false;
    var element = document.getElementById(state.contextElementId);

    var action = linkElement.getAttribute("data-action");
    switch(action) {
        case "Delete": 
            switch(element.nodeName){
                case "g":
                    if (element.classList.contains("node")) {
                        state.remove("node", element.id);
                    }
                    else if (element.classList.contains("edge")) {
                        state.remove("edge", element.id);
                    }
                    break;
                case "svg":
                    console.log("hello");
                    break;
                default:
                    console.log("nemsobot");
                    break;
            }
            break;
        case "Reset":
            reset();
            break;
        default:
            break;
    }

    console.log("Task id: " + state.contextElementId + 
                ", Task action: " + linkElement.getAttribute("data-action"));
    toggleMenuOff();
}

function keyupListener() {
    window.onkeyup = function(e) {
        if ( e.keyCode === 27 ) {
            toggleMenuOff();
        }
    }
}

function toggleMenuOn() {
    if (state.contextMenuState !== true) {
        state.contextMenuState = true;
        state.contextMenu.classList.add(active);
    }
}

function toggleMenuOff() {
    if (state.contextMenuState !== false) {
        state.contextMenuState = false;
        state.contextMenu.classList.remove(active);
    }
}

function resizeListener() {
    window.onresize = function(e) {
        toggleMenuOff();
    };
}

// Checks for click events
function onmousedownListener() {
    document.addEventListener("mousedown", function(e) {
        if (clickedInsideElement(e, "canvas")) {
            if (state.move.checked === false) {
                console.log("What should I do? (I'm [mousedown,move=fasle])");
            }
            else {
                state.posX = e.clientX; // TODO: Check here if the position is the right one
                state.posY = e.clientY;
                state.draggedElem = e.srcElement || e.target;
                console.log("ElementToBeDragged: " + state.draggedElem.id);
                if (clickedInsideClass(state.draggedElem, nodeComponent)) {
                    state.mouseDownDrag = true;

                    var auxArray = [];

                    if (state.draggedElem.nodeName == "circle") {
                        auxArray = state.svg.querySelectorAll(".node" + 
                                    state.draggedElem.id.split("circle")[1]);
                    }
                    else {
                        if (state.draggedElem.nodeName == "text") {
                            auxArray = state.svg.querySelectorAll(".node" + 
                                        state.draggedElem.id.split("name")[1]);
                        }
                    }
                    
                    var elemsLength = auxArray.length;
                    state.elementsToDrag = [];

                    for (var it = 0; it < elemsLength; ++it) {
                        var child;
                        var childrenNumber = auxArray[it].childNodes.length;
                        
                        for (var it2 = 0; it2 < childrenNumber; ++it2) {
                            child = auxArray[it].childNodes[it2];
                            if (child.tagName === "circle" || child.tagName === "text" || 
                                child.tagName === "line" || child.tagName === "path") {
                                state.elementsToDrag.push(child);
                                console.log(child.id);
                            }
                        }
                    }
                }
                else { 
                    state.mouseDownDrag = false;
                    state.elementsToDrag = [];

                }
            }
        }
    });
}

// Checks for click events
function onmouseupListener() {
    document.addEventListener("mouseup", function(e) {
        if (clickedInsideElement(e, "canvas")) {
            if (state.move.checked === false) {
                clickInterpret(e);
            }
            else {
                // PAY SOME MORE ATTENTION HERE 
                console.log("What to do?");
                state.draggedElem = null;
                state.elementsToDrag = [];
                state.mouseDownDrag = false;
                mouseInterpret(e);
            }
        }
        else {
            var button = e.which || e.button;
            if (button === 1 && state.fromRightClick === true) {
                state.fromRightClick = false;
                return;
            }
        }
    });
}

function moveNode(e) {

    if (state.mouseDownDrag === true) { 

        var elemId = state.draggedElem.id;
        var nodeId = elemId;
        if (nodeId.indexOf("circle") >= 0) {
            nodeId = nodeId.split("circle")[1];
        }
        if (nodeId.indexOf("name") >= 0) {
            nodeId = nodeId.split("name")[1];
        }

        var currentX = e.clientX;
        var currentY = e.clientY;
        
        var dx = currentX - state.posX;
        var dy = currentY - state.posY;
        
        // console.log("Polisia!");
        // console.log(state.elementsToDrag);
        var elemsNumber = state.elementsToDrag.length;
        var elem;

        // TODO: MARGIN CHECKS
        for (var it = 0; it < elemsNumber; ++it) {
            elem = state.elementsToDrag[it];

            switch(elem.nodeName) {
                case "circle":
                    elem.setAttribute("cx", parseInt(elem.getAttribute("cx")) + dx);
                    elem.setAttribute("cy", parseInt(elem.getAttribute("cy")) + dy);

                    var ind = state.graph.nodeIndexFromId((elem.id.split("circle")[1]));
                    state.graph.allNodes[ind].x += dx;
                    state.graph.allNodes[ind].y += dy;

                    break;
                case "text":
                    elem.setAttribute("x", parseInt(elem.getAttribute("x")) + dx);
                    elem.setAttribute("y", parseInt(elem.getAttribute("y")) + dy);
                    break;
                case "line":
                    var lineId = elem.id.split("line")[1];

                    if (nodeId === lineId.split("-")[0]) {
                        elem.setAttribute("x1", parseInt(elem.getAttribute("x1")) + dx);
                        elem.setAttribute("y1", parseInt(elem.getAttribute("y1")) + dy);
                    }
                    else {
                        elem.setAttribute("x2", parseInt(elem.getAttribute("x2")) + dx);
                        elem.setAttribute("y2", parseInt(elem.getAttribute("y2")) + dy);
                    }
                    break;
                default:
                    break;
            }           
        }

        state.posX = currentX; 
        state.posY = currentY;
    }
}

function onmousemoveListener(on) {
    if (on) {
        document.getElementById("svg").addEventListener("mousemove", moveNode);

    }
    else {
        console.log("Track mouse off");

        document.getElementById("svg").removeEventListener("mousemove", moveNode);
    }
}

function hireListeners() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
    onmousedownListener();
    onmouseupListener();
}

// Event managing 
window.onload = function() {
    state = new State();

    //window.onmouseup = function(e) {};
    hireListeners();
}

//state.svg.onmousedown = function(e){checkClicked(e)};
