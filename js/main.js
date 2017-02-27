"use strict";

// Tags to look over: 
//  -> DIRECTCASE
//  -> URGENT TASK

// Uses external js file ./state.js
// Uses external js file ./graph.js
// Uses external js file ./svgHandler.js
// Uses external js file ./values.js

// REFACTOR
function clickInterpret(e) {
    
    var button = e.which || e.button;
    if (button === 1 && state.contextMenuOn === true) {
        state.contextMenuOn = false;
        return;
    }
    if (button !== 1) {
        return;
    }

    var clickedElement = e.srcElement || e.target;
    var clickedTag = clickedElement.nodeName;

    if (clickedInsideElement(e, "canvas")) {
        
        var notSVG = true;
        var notNode = true;

        // TODO: MAKE EVENT PROPER EVENT
        while (clickedElement.id === "previewCircle" || clickedElement.id === "previewLine"
            || clickedElement.id === "previewPath") {
            clickedElement = clickedElement.parentNode;
            clickedTag = clickedElement.nodeName;
        }

        switch(clickedTag){
            case "svg": 
                notSVG = false;
                break;
            case "circle":
                notNode = false;
                handleSelect(document.getElementById(clickedElement.id.split("circle")[1]));
                break;
            case "text":
                if (clickedElement.parentNode.classList.contains(nodeClass)) {
                    notNode = false;
                    
                    var nodeElement = document.getElementById(clickedElement.id.split("name")[1]);

                    handleSelect(nodeElement);
                }
                // TODO: Else edge weight probably
                break;
            default: 
                break;
        }

        if (notSVG) {
            return;
        }

        var clientX = e.clientX;
        var clientY = e.clientY;
        
        var dim = state.svg.getBoundingClientRect();
        
        var x = clientX - dim.left;
        var y = clientY - dim.top;

        var addedNode = false;
        var itOverlapsMargins = overlapsMargins(clientX, clientY, sizes.radius, 0, dim.right, dim.bottom, 0);
        if (itOverlapsMargins === false) {
            addedNode = addNode(x, y);
        }

        if (state.isComponentSelected === true) {
            
            if (addedNode !== false) {
                var svgCircle = document.getElementById(state.nodeIdToCircleId());
                state.isComponentSelected = false;
                addEdge(state.selectedNodeId, addedNode.id);
                svgCircle.style.fill = colors.unselectedNode;
            }
        }        
        state.svg.innerHTML = state.svg.innerHTML;
    }
}

// REFACTOR
function addNode(x, y) {
    var intersectsNode = state.graph.intersectsNode(x, y);
    if (intersectsNode !== false) {
        runForbiddenCircle(state.svg, "forbiddenCircle", intersectsNode.x, intersectsNode.y, 200)

        return false;
    }
    
    state.maxIdValue++;
    var nodeId = state.maxIdValue;
  
    var circle = createSVGCirlce(nodeId, x, y);
    var text = createSVGText(nodeId, x, y);
    var node = createSVGNode(nodeId, circle, text);

    state.graph.addNode({id: nodeId, name: text.innerHTML, 
                         x: x, y: y, r: parseFloat(circle.getAttribute("r")), 
                         outlineWidth: parseFloat(circle.style.strokeWidth)});
    
    state.svg.appendChild(node);   
    state.svg.innerHTML = state.svg.innerHTML;

    buttonNotAllowed("algorithm", false);

    return node;
}

// CONTINUEHERE: TODO: REFACTOR handleSelect
function handleSelect(node) {
    
    state.isComponentSelected = !state.isComponentSelected;

    if (state.isComponentSelected == true) {
        var circleId = "circle" + node.id;
        var svgCircle = document.getElementById(circleId);
        
        var previewLine = document.getElementById("previewLine");
        previewLine.setAttribute("x1", svgCircle.getAttribute("cx"));
        previewLine.setAttribute("y1", svgCircle.getAttribute("cy"));

        svgCircle.style.fill = colors.selectedNode;

        state.svg.innerHTML = state.svg.innerHTML;
        state.selectedNodeId = node.id;
    }
    else {

        var addedEdge;

        if (state.selectedNodeId !== node.id)
        {
            addedEdge = addEdge(state.selectedNodeId, node.id);
        }

        if (addedEdge !== false) {
            var svgCircle = document.getElementById(state.nodeIdToCircleId());
            svgCircle.style.fill = colors.unselectedNode;
        }
        else {
            state.isComponentSelected = !state.isComponentSelected;
        }

        state.svg.innerHTML = state.svg.innerHTML;
    }
}

function addEdge(nodeId1, nodeId2) {
    if (state.graph.directed === true) {

        var circle1 = document.getElementById("circle" + nodeId1);
        var circle2 = document.getElementById("circle" + nodeId2);

        var x1 = circle1.cx.baseVal.value;
        var y1 = circle1.cy.baseVal.value;

        var x2 = circle2.cx.baseVal.value;
        var y2 = circle2.cy.baseVal.value;


        var d = computeD(nodeId1, nodeId2, x1, y1, x2, y2);

        if (state.graph.addEdge(nodeId1, nodeId2)) {

            var marker = createSVGMarker(nodeId1, nodeId2);
            var arrow = createSVGArrow(marker);
            var path = createSVGDirectedPath(nodeId1, nodeId2, d, marker.id);
            var edge = createSVGDirectedEdge(nodeId1, nodeId2, path, arrow);

            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            runForbiddenPath(state.svg, "forbiddenPath", d);
            return false;
        }
    }
    else {
        var circle1 = document.getElementById("circle" + nodeId1);
        var circle2 = document.getElementById("circle" + nodeId2);

        var x1 = circle1.cx.baseVal.value;
        var y1 = circle1.cy.baseVal.value;

        var x2 = circle2.cx.baseVal.value;
        var y2 = circle2.cy.baseVal.value;

        if (state.graph.addEdge(nodeId1, nodeId2)) {

            var line = createSVGLine(nodeId1, nodeId2, x1, y1, x2, y2);
            var text = undefined;
            if (state.graph.weighted === true) {
                var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));

                text = createSVGUndirectedWeight(nodeId1, nodeId2, x1, y1, x2, y2, weight);
            }
            
            var edge = createSVGUndirectedEdge(nodeId1, nodeId2, line, text);

            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            runForbiddenLine(state.svg, "forbiddenLine", x1, y1, x2, y2);

            return false;
        }
    }

    return true;
}

function switchMode(mode) {

    if (mode === "build") {
        // TODO: CLEAN UP. 
        cleanUp();
        document.getElementById("algMode").style.display = "none";
        document.getElementById("buildMode").style.display = "block";

        document.getElementById("build").classList.remove("off");
        document.getElementById("build").classList.add("on");
        document.getElementById("build").classList.remove("hoverShadow");
        document.getElementById("algorithm").classList.add("hoverShadow");
        document.getElementById("algorithm").classList.remove("on");
        document.getElementById("algorithm").classList.add("off");
    }
    else {
        if (!(state.graph.allNodes.length > 0) === true) {
            return;
        }
        // TODO: ADD-UTILS - Replace this with a function from a new js file called utils that has a 
        // generate-html part
        var algorithmsOptions = document.getElementById("algorithmsOptions");
        
        var algs = state.algorithms.algorithms; 
        var len = algs.length;
        var optionsHTML = "";
        var option;
        
        // DIRECTCASE: DONE - NEEDS CHECK
        if (state.graph.directed === true) {
            for (var it = 0; it < len; ++it) {
                if (algs[it].worksOn.directed === true) {
                    option = document.createElement("option");
                    option.setAttribute("value", algs[it].name);
                    option.innerHTML = algs[it].name;
                    
                    optionsHTML += option.outerHTML + "\n";
                }
            }
        }
        else {
            for (var it = 0; it < len; ++it) {
                if (algs[it].worksOn.undirected === true) {
                    option = document.createElement("option");
                    option.setAttribute("value", algs[it].name);
                    option.innerHTML = algs[it].name;
                    
                    optionsHTML += option.outerHTML + "\n";
                }
            }
        }

        algorithmsOptions.innerHTML = optionsHTML;


        document.getElementById("algMode").style.display = "block";
        document.getElementById("buildMode").style.display = "none";

        document.getElementById("build").classList.remove("on");
        document.getElementById("build").classList.add("off");
        document.getElementById("build").classList.add("hoverShadow");
        document.getElementById("algorithm").classList.remove("hoverShadow");
        document.getElementById("algorithm").classList.remove("off");
        document.getElementById("algorithm").classList.add("on");

        algorithmSelect();
        selectStartNode();
    }
}

function setCursor(id, cursor) {
    document.getElementById(id).style.cursor = cursor;
}

function buttonNotAllowed(id, notAllowed = true) {
    if (notAllowed === true) {
        setCursor(id, "not-allowed");
        document.getElementById(id).classList.remove("hoverShadow");
        document.getElementById(id).classList.add("disabled");
    }
    else {
        setCursor(id, "pointer");
        document.getElementById(id).classList.add("hoverShadow");
        document.getElementById(id).classList.remove("disabled");
    }
}

function algorithmSelect() {

    var algorithm = state.algorithms.getAlgorithmByName(document.getElementById("algorithmsOptions").value);
    if (algorithm !== null) {
        
        // TODO: ADD-UTILS - Replace this with a function from a new js file called utils that has a 
        // generate-html part
        var nodes = [];
        var len = state.graph.allNodes.length;
        if (len <= 0) {
            // TODO: Think of what should happen if no node
            alert("Nodes should be in. Handler for this case under construction.");
        }
        else {    
            for (var it = 0; it < len; ++it) {
                nodes.push({"id": state.graph.allNodes[it].id, 
                            "name": state.graph.allNodes[it].name});
            }
            // Generate options.
            var options = document.getElementById("nodeOptions");
            var optionsHTML = "";
            var option;
            for (var it = 0; it < len; ++it) {
                option = document.createElement("option");
                option.setAttribute("value", nodes[it].id);
                
                option.innerHTML = nodes[it].name;

                optionsHTML += option.outerHTML + "\n";
            }
            options.innerHTML = optionsHTML;


            document.getElementById("buttons").style.display = "block";
        }

    }
    else {
        // Remove algorithm
        document.getElementById("buttons").style.display = "none";
    }
}

function selectStartNode() {
    if (state.algorithmRuns === true) {
        // TOOD: Add confirm box.
        restart();
    }
    var nodeName = document.getElementById("nodeOptions").value; 
    var nodeId = state.graph.nodeIdFromName(nodeName);
    
    var pastNode;
    if (state.pastStartingNode !== null && state.algorithmRuns === false) {
        pastNode = document.getElementById(state.pastStartingNode)
        if (pastNode !== null) {
            pastNode.style.stroke = colors.unselectedNodeOutline;
        }
    }

    state.pastStartingNode = "circle" + nodeId;
    var circle = document.getElementById("circle" + nodeId);
    circle.style.stroke = "green";
}

function nextStep() {
    var algorithm = document.getElementById("algorithmsOptions").value;
    if (state.algorithmRuns === false) {

        state.startNode = document.getElementById("nodeOptions").value;
        state.nextSteps = state.algorithms.run(algorithm, state.graph, state.startNode, true);
        console.log(state.nextSteps);
        state.runningAlgorithm = algorithm;

        // TODO: CONSIDER THIS LATER: Optimisation when nothing changed fromprevious run.
        // if (state.runningAlgorithm !== algorithm || parseInt(state.startNode) !== parseInt(startNode)) {
        //     state.runningAlgorithm = algorithm;
        //     state.startNode = startNode;
        //     state.nextSteps = state.algorithms.run(algorithm, state.graph, state.startNode, true);
        // }
        state.algorithmRuns = true;
        state.executedSteps = [];
    }

    if (state.nextSteps.length > 0) {
        var executeStep = state.nextSteps.shift();

        // EXECUTE IT
        // console.log("On edge: " + executeStep.edge);
        switch(executeStep.type) {
            case "edge":
                var node = executeStep.id.split('-')[1];
                var edge = document.getElementById("line" + executeStep.id);
                if (edge === null) {
                    edge = document.getElementById("line" + executeStep.id.split('-')[1] + "-" + 
                                                    executeStep.id.split('-')[0]);
                }
                
                node = document.getElementById("circle" + node);
                var color = "green";
                if (executeStep.extended === false) {
                    color = "red";
                }
                console.log(edge);
                edge.style.stroke = color;
                node.style.stroke = "green";

                state.executedSteps.push(executeStep);
                break;
            case "node": 
                var nodeId = executeStep.id;
                
                document.getElementById("circle" + nodeId).style.stroke = "green";
                
                state.executedSteps.push(executeStep);
                break; 
            default:
                break;
        }
    }
    else {
        // console.log(state.nextSteps);
        console.log(state.executedSteps);
        // document.getElementById("next").disabled = true;
        alert("Stop the next button when in this case");
    }
}

function backStep() {
    if (state.algorithmRuns === true) {
        if (state.executedSteps.length > 0) {
            var backStep = state.executedSteps.splice(-1,1)[0];
            // NICIUN PUSH
            state.nextSteps.unshift(backStep);
            // EXECUTE IT
            console.log(backStep);
            switch(backStep.type) {
                case "edge":
                    var node = document.getElementById("circle" + backStep.id.split('-')[1]);

                    var edge = document.getElementById("line" + backStep.id);
                    if (edge === null) {
                        edge = document.getElementById("line" + backStep.id.split('-')[1] + "-" + 
                                                        backStep.id.split('-')[0]);
                    }
                    
                    if (backStep.extended === true) {
                        node.style.stroke = colors.unselectedNodeOutline;
                    }

                    edge.style.stroke = colors.unusedEdge;

                    break;
                case "node": 
                    var nodeId = backStep.id;
                    
                    document.getElementById("circle" + nodeId).style.stroke = colors.unselectedNodeOutline;
                    break; 
                default:
                    break;
            }
        }
        else {
            // console.log(state.nextSteps);
            console.log(state.executedSteps);
            // document.getElementById("next").disabled = true;
            alert("Stop the next button when in this case");
        }
    } 
    else {
        console.log("Bai");
    }

    // if (state.algorithmRuns === false) {
    //     // disable button.
    // }
}

function cleanUp(argument) {
    state.startNode = document.getElementById("nodeOptions").value;
    state.algorithmRuns = false;

    // color back:
    var node, nodes = state.graph.allNodes, len = nodes.length;
    var circle;

    for (var i = 0; i < len; ++i) {
        node = nodes[i];
        circle = document.getElementById("circle" + node.id);

        // TODO: Use node colour instead of default colour
        circle.style.stroke = colors.unselectedNodeOutline;
    }

    if (state.executedSteps) {
        var edgeType = "line", line, step;
        var len = state.executedSteps.length;

        for (var i = 0; i < len; ++i) {
            step = state.executedSteps[i];
            if (step.type === "edge") {

                line = document.getElementById(edgeType + step.id);
                if (line === null) {
                    line = document.getElementById("line" + step.id.split('-')[1] + "-" + 
                                                    step.id.split('-')[0]);
                }

                line.style.stroke = colors.unusedEdge;
            }
        }
    }
}

function restart() {
    // // --- Pseudocode ---
    // clean all the colouring
    // make select algorithm available again
    // make select starting node available again
    // color the starting node 
    // consider that algorithm does not run
    
    cleanUp();

    state.nextSteps = state.executedSteps;
    state.executedSteps = [];
    
    selectStartNode();
}

function switchDirection(directed) {

    if (directed === true) {

        document.getElementById("undirected").classList.add("off");
        document.getElementById("undirected").classList.remove("on");
        document.getElementById("undirected").classList.add("hoverShadow");
        document.getElementById("directed").classList.remove("hoverShadow");
        document.getElementById("directed").classList.add("on");
        document.getElementById("directed").classList.remove("off");

    }
    else {

        document.getElementById("directed").classList.add("off");
        document.getElementById("directed").classList.remove("on");
        document.getElementById("undirected").classList.remove("hoverShadow");
        document.getElementById("directed").classList.add("hoverShadow");
        document.getElementById("undirected").classList.add("on");
        document.getElementById("undirected").classList.remove("off");
    }
}

function openDirModal(directed) {
    var dirModal = document.getElementById('directionModal');
    var dirSVG = document.getElementById('dirSVG');
    
    state.newDirection = directed;

    state.newGraph = state.graph;
    if (directed === true) {
        state.newGraph = makeGraphDirected(state.newGraph); // if this is the case
    }
    else {
        state.newGraph = makeGraphUndirected(state.newGraph);
        console.log("Implement makeGraphUndirected");
    }
    dirSVG.innerHTML = graphToSVG(state.newGraph).innerHTML;

    dirModal.style.display = "block";
}

function applyDirChanges() {
    var modal = document.getElementById('directionModal');
    var dirSVG = document.getElementById('dirSVG');

    state.svg.innerHTML = "";
    state = updateGraphToState(state.newGraph, state);

    modal.style.display = "none";

    state.svg.innerHTML = state.svg.innerHTML;
    switchDirection(state.newDirection);
}

function switchWeighted(weighted) {

    if (weighted === true) {
        state.graph.setWeighted(true);
        addSVGWeights();

        document.getElementById("unweighted").classList.add("off");
        document.getElementById("unweighted").classList.remove("on");
        document.getElementById("unweighted").classList.add("hoverShadow");
        document.getElementById("weighted").classList.remove("hoverShadow");
        document.getElementById("weighted").classList.add("on");
        document.getElementById("weighted").classList.remove("off");
    }
    else {
        state.graph.setWeighted(false);
        removeSVGWeights();

        document.getElementById("unweighted").classList.add("on");
        document.getElementById("unweighted").classList.remove("off");
        document.getElementById("unweighted").classList.remove("hoverShadow");
        document.getElementById("weighted").classList.add("hoverShadow");
        document.getElementById("weighted").classList.add("off");
        document.getElementById("weighted").classList.remove("on");
    }
}

// CONTINUEHERE: Move to SVG
function addSVGWeights() {

    if (state.graph.directed === true) {
        // Implement after undirected.   
    }
    else {
        var svgLine, svgEdge, svgEdges = document.querySelectorAll(".edge");
        var len = svgEdges.length;
        var gId, lineId, x1, y1, x2, y2;

        for (var i = 0; i < len; ++i) {
            svgEdge = svgEdges[i];
            gId = svgEdge.id;
            lineId = "line" + gId;
            svgLine = document.getElementById(lineId);

            x1 = parseFloat(svgLine.getAttribute("x1"));
            y1 = parseFloat(svgLine.getAttribute("y1"));
            x2 = parseFloat(svgLine.getAttribute("x2"));
            y2 = parseFloat(svgLine.getAttribute("y2"));

            var p1 = {"x": x1, "y": y1};
            var p2 = {"x": x2, "y": y2};
            var node1Id = gId.split("-")[0];
            var node2Id = gId.split("-")[1];

            var p = rightAnglePoint(node1Id, node2Id, p1, p2);

            var text = document.createElement("text");
            
            text.id = "weight" + gId;
            text.style.fontSize = sizes.stdFontSize;
            text.style.alignmentBaseline = "central";
            text.style.textAnchor = "middle";
            text.style.fontWeight = "bold";

            text.setAttribute("x", p.x);
            text.setAttribute("y", p.y);
            text.style.cursor = "text";
            // GET THE WEIGHT FROM graph
            var weight = state.graph.getEdgeWeight(parseInt(node1Id), parseInt(node2Id));
            text.innerHTML = weight;
            
            text.classList.add(edgeComponent);
            text.classList.add("weight");

            svgEdge.appendChild(text);     

        }
    }
    state.svg.innerHTML = state.svg.innerHTML; 
}

function removeSVGWeights(argument) {

    if (state.graph.directed === true) {
        // Implement after undirected.   
    }
    else {
        var svgWeight, svgWeights = document.querySelectorAll(".weight");
        var len = svgWeights.length;

        for (var i = 0; i < len; ++i) {
            svgWeight = svgWeights[i];
            state.remove("weight", svgWeight.id);   
        }
    }
    state.svg.innerHTML = state.svg.innerHTML; 
}

function reset(orientation = false) {
    state.reset(orientation);
    buttonNotAllowed("algorithm");
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

        state.contextMenuOn = true;        
        
        state.elementInContext = clickedInsideElement(e, graphComponent);
        if (state.elementInContext === false) {
            state.elementInContext = e.srcElement || e.target;
        }

        if (isInsideMenu === false) {
            state.contextElementId = state.elementInContext.id;
        }

        if (contextMenuArea) {
            e.preventDefault();

            if (state.isComponentSelected === true) {
                state.isComponentSelected = false;         
                state.contextMenuOn = false;  

                var svgCircle = document.getElementById(state.nodeIdToCircleId());
                svgCircle.style.fill = colors.unselectedNode;
                state.svg.innerHTML = state.svg.innerHTML;
            }
            else {
                customContextMenu(state.elementInContext);
                toggleMenuOn();
                positionMenu(e);
            }
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

            var svgCircle = document.getElementById(state.nodeIdToCircleId());
            svgCircle.style.fill = colors.unselectedNode;
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
    state.contextMenuOn = false;
    var element = document.getElementById(state.contextElementId);

    var action = linkElement.getAttribute("data-action");
    switch(action) {
        case "Delete": 
            switch(element.nodeName){
                case "g":
                    if (element.classList.contains("node")) {
                        state.remove("node", element.id);
                        if (state.graph.allNodes.length === 0) {
                            buttonNotAllowed("algorithm");
                        }
                    }
                    else if (element.classList.contains("edge")) {
                        state.remove("edge", element.id);
                    }
                    break;
                case "svg":
                    console.log("This should never happen");
                    break;
                default:
                    console.log("What should the default behaviour be? Probably none.");
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

// Mouse action
function mouseDown(e) {
    state.mouse.down = true;
    if (clickedInsideElement(e, "canvas")) {
        state.mouse.downInsideSVG = true;

        var circle = state.svg.getElementById("previewCircle");
        circle.setAttribute("visibility", "hidden");      
        var line = state.svg.getElementById("previewLine");
        line.setAttribute("visibility", "hidden");    
        var path = state.svg.getElementById("previewPath");
        path.setAttribute("visibility", "hidden");        

        state.mouse.downX = e.clientX - state.left;
        state.mouse.downY = e.clientY - state.top;
        state.mouse.movedX = e.clientX - state.left;
        state.mouse.movedY = e.clientY - state.top;
        state.mouse.moved = false;
        
        state.mouse.elem = e.srcElement || e.target;

        if (clickedInsideClass(state.mouse.elem, nodeComponent)) {
            state.mouse.dragOnMove = true;
            // state.mouse.dragOnMove = true;


            var auxArray;

            if (state.mouse.elem.nodeName == "circle") {
                auxArray = state.svg.querySelectorAll(".node" + 
                            state.mouse.elem.id.split("circle")[1]);
            }
            else {
                if (state.mouse.elem.nodeName == "text") {
                    auxArray = state.svg.querySelectorAll(".node" + 
                                state.mouse.elem.id.split("name")[1]);
                }
            }
            
            var elemsLength = auxArray.length;          
            state.mouse.moveElements = [];

            for (var it = 0; it < elemsLength; ++it) {
                var child;
                var childrenNumber = auxArray[it].childNodes.length;
                
                for (var it2 = 0; it2 < childrenNumber; ++it2) {
                    child = auxArray[it].childNodes[it2];
                    if (child.tagName === "circle" || child.tagName === "text" || 
                        child.tagName === "line" || child.tagName === "path") {
                        state.mouse.moveElements.push(child);
                    }
                }
            }
        }
        else { 
            state.mouse.dragOnMove = false;
            state.mouse.moveElements = []; // <-- ALSO THIS NEEDS REFACTORING

        }
    }
    else { 
        state.mouse.downInsideSVG = false;
        console.log("Think about what should happen when clicked outside canvas");
    }
}


function mouseMove(e) {
    if (clickedInsideElement(e, "canvas")) {
        
        var currentX = e.clientX - state.left;
        var currentY = e.clientY - state.top;

        if (state.mouse.downInsideSVG === true) {

            if (parseFloat(currentX) !== parseFloat(state.mouse.downX) || 
                parseFloat(currentY) !== parseFloat(state.mouse.downY)) {
                state.mouse.moved = true;
            }
            if (state.mouse.dragOnMove === true) {
                if (state.lock === false) {
                    state.lock = true;
                }
                e.stopPropagation();

                state.svg.getElementById("previewCircle").setAttribute("visibility", "hidden");
                state.svg.getElementById("previewLine").setAttribute("visibility", "hidden");
                state.svg.getElementById("previewPath").setAttribute("visibility", "hidden");


                var nodeId, elemId = state.mouse.elem.id;
                // console.log("-----");
                // console.log(elemId);

                if (elemId.indexOf("circle") >= 0) {
                    nodeId = elemId.split("circle")[1];
                }
                if (elemId.indexOf("name") >= 0) {
                    nodeId = elemId.split("name")[1];
                }
                
                var dx = currentX - state.mouse.movedX;
                var dy = currentY - state.mouse.movedY;

                var elemsNumber = state.mouse.moveElements.length;
                var elem;

                var nodeIndex = state.graph.nodeIndexFromId(nodeId);
                state.graph.allNodes[nodeIndex].x += dx;
                state.graph.allNodes[nodeIndex].y += dy;

                var newX = state.graph.allNodes[nodeIndex].x;
                var newY = state.graph.allNodes[nodeIndex].y;

                elem = document.getElementById("circle" + nodeId);

                elem.setAttribute("cx", newX);
                elem.setAttribute("cy", newY);

                elem = document.getElementById("name" + nodeId);
                elem.setAttribute("x", newX);
                elem.setAttribute("y", newY);         

                // TODO: MARGIN CHECKS
                for (var it = elemsNumber - 1; it >= 0; --it) {
                    elem = state.mouse.moveElements[it];

                    switch(elem.nodeName) {
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
                        case "path":
                            var lineId = elem.id.split("line")[1];

                            var node1Id = lineId.split("-")[0];
                            var node2Id = lineId.split("-")[1];

                            var d;
                            var dir = null; 

                            if (parseInt(nodeId) === parseInt(node1Id)) {          

                                var node2 = state.graph.allNodes[state.graph.nodeIndexFromId(node2Id)];

                                var p1 = pointOnCircle(newX, newY, node2.x, node2.y, sizes.radius + sizes.edgeWidth, -sizes.angleDev);
                                var p2 = pointOnCircle(node2.x, node2.y, newX, newY, sizes.radius + sizes.edgeWidth, sizes.angleDev);
                            }
                            else {

                                var node1 = state.graph.allNodes[state.graph.nodeIndexFromId(node1Id)];

                                var p1 = pointOnCircle(node1.x, node1.y, newX, newY, sizes.radius + sizes.edgeWidth, -sizes.angleDev);
                                var p2 = pointOnCircle(newX, newY, node1.x, node1.y, sizes.radius + sizes.edgeWidth, sizes.angleDev);
                            }                    
                            dir = computeDir(parseInt(node1Id), parseInt(node2Id), p1, p2);


                            if (state.directedBezier === true) {
                                d = quadBezierPointsToSVG(quadBezierPoints(p1.x, p1.y, p2.x, p2.y, dir));
                            }
                            else {
                                var line = lineFromPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                                          parseFloat(p2.x), parseFloat(p2.y));
                                d = lineToSVGPath(line);  
                            }
                            elem.setAttribute("d", d);
                            break;
                        case "text":
                            if (elem.id.indexOf("weight") >= 0) {
                                var weightId = elem.id;
                                var lineId = weightId.split("weight")[1];
                                var node1Id = lineId.split("-")[0];
                                var node2Id = lineId.split("-")[1];

                                if (state.graph.directed === true) {
                                    // TODO: LATER, AFTER CHOOSING THE SHAPES FOR THE DIRECTED EDGES (CASE STUDY)
                                }
                                else {
                                    var p1, p2;
                                    if (parseInt(nodeId) === parseInt(node1Id)) {
                                        var node2 = document.getElementById("circle" + node2Id);

                                        p1 = {"x": newX, "y": newY};
                                        p2 = {"x": node2.getAttribute("cx"), "y": node2.getAttribute("cy")};
                                    }
                                    else {
                                        var node1 = document.getElementById("circle" + node1Id);

                                        p1 = {"x": node1.getAttribute("cx"), "y": node1.getAttribute("cy")};
                                        p2 = {"x": newX, "y": newY};
                                    }
                                    var p = rightAnglePoint(node1Id, node2Id, p1, p2);
                                    elem.setAttribute("x", p.x);
                                    elem.setAttribute("y", p.y);
                                }
                            } 
                            break;
                        default:
                            break;
                    }           
                }

                state.mouse.movedX = currentX; 
                state.mouse.movedY = currentY;

                if (nodeId === state.selectedNodeId && state.graph.directed === false) {
                    var node = state.graph.allNodes[state.graph.nodeIndexFromId(state.selectedNodeId)];
                    state.svg.getElementById("previewLine").setAttribute("x1", node.x);
                    state.svg.getElementById("previewLine").setAttribute("y1", node.y);
                }

                state.lock = false;
            }
        }
        else {

            var circle = state.svg.getElementById("previewCircle");
            circle.setAttribute("cx", currentX);
            circle.setAttribute("cy", currentY);
            
            var line = state.svg.getElementById("previewLine");
            line.setAttribute("x2", currentX);
            line.setAttribute("y2", currentY);
            
            var path = state.svg.getElementById("previewPath");

            if (state.contextMenuOn === false) {

                var insideNode = false;
                var clickedElement = e.srcElement || e.target;
                var clickedTag = clickedElement.nodeName;

                while (clickedElement.id === "previewCircle" || clickedElement.id === "previewLine"
                    || clickedElement.id === "previewPath") {
                    clickedElement = clickedElement.parentNode;
                    clickedTag = clickedElement.nodeName;
                }
                switch(clickedTag){
                    case "circle":
                        insideNode = true;
                        break;
                    case "text":
                        if (clickedElement.parentNode.classList.contains(nodeClass)) {
                            insideNode = true;
                        }
                        break;
                    default: 
                        break;
                }
                // CONTINUEHERE: How to make it know it's going over a line
                // console.log(clickedTag);
                if (insideNode === false) {
                    circle.setAttribute("visibility", "visible");
                }
                else {
                    circle.setAttribute("visibility", "hidden");

                    switch(clickedTag){
                        case "circle":
                            line.setAttribute("x2", clickedElement.getAttribute("cx"));
                            line.setAttribute("y2", clickedElement.getAttribute("cy"));
                            break;
                        case "text":
                            line.setAttribute("x2", clickedElement.getAttribute("x"));
                            line.setAttribute("y2", clickedElement.getAttribute("y"));
                            break;
                        default: 
                            break;
                    }
                }
                if (state.isComponentSelected) {
                    if (state.graph.directed === true) {
                        var pt1 = {"x": parseFloat(line.getAttribute("x1")), 
                                   "y": parseFloat(line.getAttribute("y1"))};
                        var pt2 = {"x": parseFloat(line.getAttribute("x2")), 
                                   "y": parseFloat(line.getAttribute("y2"))};


                        var p1 = pointOnCircle(pt1.x, pt1.y, pt2.x, pt2.y, sizes.radius + sizes.edgeWidth, -sizes.angleDev);
                        var p2 = pointOnCircle(pt2.x, pt2.y, pt1.x, pt1.y, sizes.radius + sizes.edgeWidth, sizes.angleDev);

                        var dir = computeDir(state.selectedNodeId, state.maxIdValue, p1, p2);
                        var d;
                        if (state.directedBezier === true) {
                            var pt = quadBezierPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                                      parseFloat(p2.x), parseFloat(p2.y), dir);
                            d = quadBezierPointsToSVG(pt);         
                        }
                        else {
                            var line = lineFromPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                                      parseFloat(p2.x), parseFloat(p2.y), dir);
                            d = lineToSVGPath(line);
                        }

                        path.setAttribute("d", d);

                        path.setAttribute("visibility", "visible");
                    }
                    else {
                        line.setAttribute("visibility", "visible");
                    }
                }
            }

        }
    }
    else {

        // TODO: Use Pointer Lock API to hide previewCircle when outside canvas.
        state.svg.getElementById("previewCircle").setAttribute("visibility", "hidden");
        state.svg.getElementById("previewLine").setAttribute("visibility", "hidden");
        state.svg.getElementById("previewPath").setAttribute("visibility", "hidden");
        // console.log("I moved the mouse outside the canvas. What should happen?");
    }
}

function mouseUp(e) {
    state.mouse.down = false;
    state.mouse.downInsideSVG = false;
    state.mouse.dragOnMove = false;

    // NEEDS TO BE CONTINUED
    if (clickedInsideElement(e, "canvas")) {
        if (state.mouse.moved === false) {     
            clickInterpret(e);
        }
        else {         
            console.log("MOUSE UP. SHOULD I DO ANYTHING HERE? MAYBE SOME CLEAN UP ON state.mouse?");
        }
        // else {
        //     state.mouse.moveElements = [];
        // }
    }
    else {
        if (state.isComponentSelected === true) {
            var svgCircle = document.getElementById(state.nodeIdToCircleId());
            svgCircle.style.fill = colors.unselectedNode;
            state.isComponentSelected = !state.isComponentSelected;
        } 
        var button = e.which || e.button;
        if (button === 1 && state.contextMenuOn === true) {
            state.contextMenuOn = false;
            return;
        }
    }
}

// Checks for click events
function onmousedownListener() {
    document.addEventListener("mousedown", mouseDown);
}

function onmousemoveListener() {
    document.addEventListener("mousemove", mouseMove);

}

function onmouseupListener() {
    document.addEventListener("mouseup", mouseUp);
}

function scroll(e) {
    
    var dim = state.svg.getBoundingClientRect();
    
    state.left = dim.left;
    state.top = dim.top;
}

function onscrollListener() {
    document.addEventListener("scroll", scroll);
}

function cssSetUp() {

    switchMode("build");
    state.graph.directed = false;
    switchDirection(false);
    buttonNotAllowed("algorithm");
    state.graph.weighted = false;
    switchWeighted(false);
}

function windowClickListener() {
    window.onclick = handleClick;
}

function handleClick(e) {
    var modal = document.getElementById('directionModal');
    if (event.target == modal || event.target.id === "cancelDirModal") {
        modal.style.display = "none";
    }
}

function hireListeners() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();

    onmousedownListener();
    onmousemoveListener();
    onmouseupListener();
    onscrollListener();

    windowClickListener();
}

// Event managing 
window.onload = function() {
    state = new State();

    hireListeners();

    cssSetUp();
}


