"use strict";

// Tags to look over: 
//  -> DIRECTCASE
//  -> URGENT TASK

// Uses external js file ./state.js
// Uses external js file ./graph.js
// Uses external js file ./svgHandler.js
// Uses external js file ./values.js

///////////////////////////////////////////////////// 
///////////////// Click interpreter /////////////////
/////////////////////////////////////////////////////
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

        if (state.mode === "algorithm") {
            return;
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
                state.isComponentSelected = false;
                addEdge(state.selectedNodeId, addedNode.id);
            
                var circleId = arrayToString(["circle", state.selectedNodeId]);
                setSVGCircleFill(circleId, colors.unselectedNode);
            }
        }
        state.svg.innerHTML = state.svg.innerHTML;
    }
}

function addNode(x, y) {
    var intersectsNode = state.graph.intersectsNode(x, y);
    if (intersectsNode !== false) {
        runForbiddenCircle(state.svg, "forbiddenCircle", intersectsNode.x, intersectsNode.y, 200);

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

    disableButton("algorithm", false);

    return node;
}

function addEdge(nodeId1, nodeId2) {
    if (state.graph.directed === true) {

        if (state.graph.addEdge(nodeId1, nodeId2)) {
            var p1 = getSVGCirclePoint(nodeId1);
            var p2 = getSVGCirclePoint(nodeId2);

            var edge = createSVGDirectedEdge(nodeId1, nodeId2, p1, p2, state.graph.weighted, 
                            state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2)));

            var groupZero = state.svg.getElementById("groupZero");
            state.svg.insertBefore(edge, groupZero);
        }
        else {
            var d = document.getElementById(arrayToString(["line", nodeId1, "-", nodeId2])).getAttribute("d");
            runForbiddenPath(state.svg, "forbiddenPath", d);
            return false;    
        }
    }
    else {
        var p1 = getSVGCirclePoint(nodeId1);
        var p2 = getSVGCirclePoint(nodeId2);

        if (state.graph.addEdge(nodeId1, nodeId2)) {

            var edge = createSVGUndirectedEdge(nodeId1, nodeId2, p1, p2, state.graph.weighted, 
                            state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2)));

            var groupZero = state.svg.getElementById("groupZero");
            state.svg.insertBefore(edge, groupZero);
        }
        else {
            runForbiddenLine(state.svg, "forbiddenLine", p1.x, p1.y, p2.x, p2.y);

            return false;
        }
    }

    return true;
}

// Refactored - Needs logic check
function handleSelect(node) {
    
    state.isComponentSelected = !state.isComponentSelected;

    if (state.isComponentSelected == true) {

        var circleId = arrayToString(["circle", node.id]);
        setSVGCircleFill(circleId, colors.selectedNode);

        var p = getSVGCirclePoint(circleId);
        setSVGLineP1("previewLine", p);

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
            var circleId = arrayToString(["circle" + state.selectedNodeId]);
            setSVGCircleFill(circleId, colors.unselectedNode);
        }
        else {
            state.isComponentSelected = !state.isComponentSelected;
        }

        state.svg.innerHTML = state.svg.innerHTML;
    }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// UNDER CONSTRUCTION //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function switchMode(mode) {

    // Logic:
    // if mode is BUILD
    //     asda
    // else (if mode is ALGORITHMS)
    //     update state.mode
    //     update graph colors
    //     generate options for algorithms.
    //     generate options for starting nodes.
    //     update options in menu
    //     update buttons css

    if (mode === "build") {

        if (state.runsContinuously) {
            state.runsContinuously = false;
            stop();
        }

        document.getElementById("algMode").style.display = "none";
        document.getElementById("code").style.display = "none";
        document.getElementById("buildMode").style.display = "block";

        turnButton("build", "on");
        updateSVGEdgesColor(state.svg, colors.buildEdge);
        updateSVGNodesBorderColor(state.svg, colors.unselectedNodeOutline);

        if (state.graph.allNodes.length === 0) {
            document.getElementById("algorithm").classList.add("off");
            return;
        }
        turnButton("algorithm", "off");

        document.getElementById("file").style.display = "block";

        state.mode = "build";
    }
    else {
        if (state.graph.allNodes.length === 0) {
            return;
        }
        
        // Changing the state mode
        state.mode = "algorithm";

        updateSVGEdgesColor(state.svg, colors.unvisitedEdge);
        updateSVGNodesBorderColor(state.svg, colors.unvisitedNodeBorder);

        // Generating algorithm options:
        var algorithmsOptions = document.getElementById("algorithmsOptions");
        var optionsHTML = algorithmOptionsHTML(state);

        algorithmsOptions.innerHTML = optionsHTML;
        
        // Generating options for starting node: 
        var len = state.graph.allNodes.length;
        var nodes = [];
        for (var it = 0; it < len; ++it) {
            nodes.push({"id": state.graph.allNodes[it].id, 
                        "name": state.graph.allNodes[it].name});
        }
        var options = createSVGOptions("", nodes);
        document.getElementById("nodeOptions"). innerHTML = options.innerHTML;

        // Display Algorithms menu instead of build one:
        document.getElementById("algMode").style.display = "block";
        document.getElementById("code").style.display = "block";
        document.getElementById("buttons").style.display = "block";

        document.getElementById("buildMode").style.display = "none";
        document.getElementById("file").style.display = "none";

        // Turn buttons off-on
        turnButton("build", "off");
        turnButton("algorithm", "on");

        // Triggering initial steps for algorithm:
        triggerAlgorithm();
    }
}

////////////////////////////////////
/// CODE REFACTORING STARTS HERE ///
////////////////////////////////////

function triggerAlgorithm() {
    // More steps: stop()
    // Something else which I can't remember...


    var algorithm = document.getElementById("algorithmsOptions").value;
    var algorithmId = state.algorithms.algorithmId(algorithm);
    
    // Steps: 
    // 1. Update startData HTML div: updateStartData(algorithm)
    updateStartData(algorithmId);

    // 2. Collect startData
    var startData = getStartData(algorithmId);

    // 3. Run the algorithm on Data Structures:
    runDTAlgorithm(algorithmId, state.graph, startData);

    // 4. reset CSS for buttons
    // TODO: PAY ATTENTION HERE: NEEDS TO STOP IF CONTINUOUS MENU PLAYS.
    // Take a look at the stop function before using it
    // stop();
    var noEdge = state.graph.noEdge();
    var nodesNo = state.graph.allNodes.length;
    playerMenuDefaultCSS(noEdge, nodesNo);

    // 5. reset SVG to default
    updateSVGEdgesColor(state.svg, colors.unvisitedEdge);
    updateSVGNodesBorderColor(state.svg, colors.unvisitedNodeBorder);

    // 6. Set up necessary flags
    state.algorithmFinished = false;

    // 7. run first step
    runNextStep(false);
}

function triggerStartNode() {

    triggerAlgorithm();
}


function updateStartData(algorithmId) {

    var startNodeDiv = document.getElementById("startNode");

    switch(algorithmId) {
        case "Kruskal":
            startNodeDiv.style.display = "none";
            break;
        case "MaxFlow":
            startNodeDiv.style.display = "none";
            break;
        default:
            startNodeDiv.style.display = "block";
            break;
    }

}

function getStartData(algorithmId) {
    var startData = null;

    switch(algorithmId) {
        case "Kruskal":
            break;
        case "MaxFlow":
            break;
        default:
            var startNode = document.getElementById("nodeOptions").value;
            startData = {startNode: startNode};
            break;
    }

    return startData;
}

function runDTAlgorithm(algorithmId, graph, startData, fullExecution = true) {

    state.runningAlgorithm = algorithmId;
    
    state.nextSteps = state.algorithms.run(algorithmId, graph, startData, fullExecution);
    state.executedSteps = [];
}


function runNextStep(buttonPressed = true) {

    // The code should follow the steps: 
    // 1. Run next step if possible.
    if (state.nextSteps.length > 0) {
        var updates = [];
        var executeStep = state.nextSteps.shift();

        // 1.1 Make next button pressed
        if (buttonPressed === true) {
            pressButton("next");
        }
        // 1.2 Make back button available
        disableButton("back", false);

        // 1.3 Color next step
        // TODO: decide: perhabs add a switch here??

        var node, nodeInfo, colorNodes = executeStep.nodes;
        var len = colorNodes.length;
        for (var i = 0; i < len; ++i) {
            var oldColor, newColor, id;

            nodeInfo = colorNodes[i];
            
            id = arrayToString(["circle", nodeInfo.id]);
            newColor = {fill: null, stroke: null};
            oldColor = {fill: null, stroke: null};
            
            node = document.getElementById(id);

            if (nodeInfo.fill) {
                oldColor.fill = node.style.fill;
                newColor.fill = nodeInfo.fill;

                node.style.fill = nodeInfo.fill;
            }
            if (nodeInfo.stroke) {
                oldColor.stroke = node.style.stroke;
                newColor.stroke = nodeInfo.stroke;

                node.style.stroke = nodeInfo.stroke;
            }
            updates.push({id: id, oldColor: oldColor, newColor: newColor, type: "node"});
        }

        var edgeId, edgeInfo, colorEdges = executeStep.edges;
        len = colorEdges.length;
        
        for (var i = 0; i < len; ++i) {
            var oldColor, newColor, id; 

            edgeInfo = colorEdges[i];

            if (edgeInfo.stroke) {
                if (state.graph.directed) {
                    id = edgeInfo.id;
                    oldColor = getSVGEdgeColor(id);
                    newColor = edgeInfo.stroke;

                    setSVGEdgeColor(state.svg, edgeInfo.id, edgeInfo.stroke);
                }
                else {
                    edgeId = edgeInfo.id;
                    if (!state.svg.getElementById(edgeId)) {
                        edgeId = arrayToString([edgeId.split("-")[1], "-", edgeId.split("-")[0]]);
                    }

                    id = edgeId;
                    oldColor = getSVGEdgeColor(id);
                    newColor = edgeInfo.stroke;

                    setSVGEdgeColor(state.svg, edgeId, edgeInfo.stroke);
                }

                updates.push({id: id, newColor: newColor, oldColor: oldColor, type: "edge"});
            }
        }

        // 1.4 Store the back step. TODO: WILL NEED REFACTORING:
        // Should have smarter updates, talking about how things have changed.
        state.executedSteps.push({step: executeStep, updates: updates});
    }

    // 2. If runned out of next steps:
    if (state.nextSteps.length === 0) {
        state.algorithmFinished = true;
        // 2.1 stop() -- TODO : CHECK AFTER REFACTORING stop()
        stop(false);
        
        // 2.2 turn buttons disabled
        disableButton("next", true);
        turnButton("start", "off");
        disableButton("start", true);
        disableButton("stop");

        // 2.3 Make sure that, after pressed, this will not become hoverable again.
        setTimeout(function() {
            document.getElementById("next").classList.remove("hoverShadow"); 
        }, 120); 
    }
}

// THIS DOES NOT stop(). It is just the tool to move back one step.
function runBackStep(buttonPressed = true) {

    // CONTINUEHERE: Look at runNextStep as a model for this.
    // The code should follow the steps: 
    // 1. This works only when there is at least one step to revert.
    if (state.executedSteps.length > 0) {
        // 1.1 Button pressed
        if (buttonPressed === true) {
            pressButton("back");
        }
        // 1.2 Make next button available.
        disableButton("next", false);
        
        // 1.2.1 Update other buttons CSS. Not sure if this should be here or inside buttonPressed
        turnButton("start", "off");
        disableButton("start", false);
        turnButton("stop", "off");
        disableButton("stop", true);


        // 1.3 Undo the execution step. 
        var backStep = state.executedSteps.splice(-1,1)[0]; 
        var updates= backStep.updates;

        backStep = backStep.step;
        state.nextSteps.unshift(backStep);
        
        // 1.4 Color back all the changes nodes and edges .
        var update, len = updates.length;

        for (var i = 0; i < len; ++i) {
            update = updates[i];
            switch (update.type) {
                case "node":
                    var node = document.getElementById(update.id);

                    if (update.newColor.fill) {
                        node.style.fill = update.oldColor.fill;
                    }
                    if (update.newColor.stroke) {
                        node.style.stroke = update.oldColor.stroke;
                    }
                    break;
                case "edge":
                    if (update.newColor) {
                        setSVGEdgeColor(state.svg, update.id, update.oldColor);
                    }
                    break;
                default: 
                    break;
            }
        }

        // 1.5 Set up necessary flags
        state.algorithmFinished = false;
    }

    if (state.executedSteps.length === 0) { 
        disableButton("back");

        setTimeout(function() {
            disableButton("back");
        }, 120);             
    }
}

function loopNextStep(argument) {

    if (state.nextSteps.length > 0) {
        runNextStep(false);
    }
    else {
        stop();
    }
}


//////////////////////////////////
/// CODE REFACTORING ENDS HERE ///
//////////////////////////////////


// #REFACTORED
function restart(buttonPressed = true) {
    // // --- Pseudocode ---
    // clean all the colouring
    // make select algorithm available again
    // make select starting node available again
    // color the starting node 
    // consider that algorithm does not run

    // 1.1 stop
    stop(false);

    var delay = 0;
    if (buttonPressed) {
        pressButton("restart", 80);
        delay = 85;
    }

    setTimeout(function() {
        triggerAlgorithm();
    }, delay);
}


// #REFACTORED - will need recheck though
function next() {
    if (state.runsContinuously) {
        stop();
    }
    runNextStep();
}

function back(argument) {
    if (state.runsContinuously) {
        stop();
    }
    runBackStep();
}

function start(buttonPressed = true) {

    if (!state.algorithmFinished) {
        var timeInterval = document.getElementById("range").value;
        timeInterval = parseFloat(timeInterval) * 1000;
        
        runNextStep(false);
        state.runsContinuously = true;

        if (buttonPressed) {
            if (!state.algorithmFinished) {
                turnButton("start", "on");
            }

            turnButton("stop", "off");
            disableButton("stop", false);
        }

        if (!state.algorithmFinished) {
            state.intervalIds.push(window.setInterval(loopNextStep, timeInterval));
        }
        else {
            turnButton("stop", "off");
            disableButton("stop", true);
        }
    }
}

function stop(buttonPressed = true) {

    state.runsContinuously = false;
    for (var i = 0; i < state.intervalIds.length; ++i) {
        window.clearInterval(state.intervalIds[i]);
    }
    state.intervalIds = [];
    for (var i = 0; i < state.timeoutIds.length; ++i) {
        window.clearTimeout(state.timeoutIds[i]);
    }
    state.timeoutIds = [];

    if (state.algorithmFinished) {

        turnButton("start", "off");
        removeClassesFromId("start", ["hoverShadow", "on"]);
       
        addClassesToId("stop", ["disabled", "off"]);
        removeClassesFromId("stop", ["on", "hoverShadow"]);
    }

    var disabled = document.getElementById("stop").classList.contains("disabled")
    if (buttonPressed && !disabled) {
        turnButton("start", "off");

        addClassesToId("stop", ["disabled", "on"]);
        removeClassesFromId("stop", ["off", "hoverShadow"]);
    }
}


function rangeInput() {
    var value = parseFloat(document.getElementById("range").value).toFixed(2);
    document.getElementById("speed").value = value;
    
    if (state.runsContinuously) {
        stop(false);

        state.timeoutIds.push(setTimeout(start, 1000));
    }
}

function speedInput() {

    var value = parseFloat(document.getElementById("speed").value).toFixed(2);
    document.getElementById("range").value = value;
    document.getElementById("speed").value = value;

    if (state.runsContinuously) {
        stop(false);

        state.timeoutIds.push(setTimeout(start, 1000));

    }
}

////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// RECONSTRUCTION ENDS HERE ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


// TODO: Use cssHandler.js!!!
function switchDirButtons(directed) {

    if (directed === true) {
        turnButton("directed", "on");
        turnButton("undirected", "off");
    }
    else {
        turnButton("directed", "off");
        turnButton("undirected", "on");
    }
}

function switchDirected(directed) {
    if (directed !== state.graph.directed) {
        if (state.graph.noEdge() === false) {
            openDirModal(directed);
        }
        else {
            if (directed === true) {
                state.graph = makeGraphDirected(state.graph);
                switchDirButtons(directed);
            }
            else {
                state.graph = makeGraphUndirected(state.graph);
                switchDirButtons(directed);
            }
        }
    }    
}

function switchWeighted(weighted) {

    if (weighted !== state.graph.weighted) {
        if (weighted === true) {
            state.graph.setWeighted(true);
            addWeights();

            switchWeightButtons(true);
        }
        else {
            state.graph.setWeighted(false);
            removeWeights();

            switchWeightButtons(false);
        }
    }
}

// TODO: Use cssHandler.js instead of manually doing this:
function switchWeightButtons(weighted) {

    if (weighted === true) {
        turnButton("weighted", "on");
        turnButton("unweighted", "off");
    }
    else {
        turnButton("unweighted", "on");
        turnButton("weighted", "off");
    }
}

function openSettingsModal() {
    var settingsModal = document.getElementById('settingsModal');

    document.getElementById("radiusSize").value = sizes.radius;
    state.currentRadius = sizes.radius;

    document.getElementById("defaultNodeColor").value = colors.unselectedNode;
    document.getElementById("defaultNodeBorderColor").value = colors.unselectedNodeOutline;
    state.currentNodeColor = colors.unselectedNode;
    state.currentNodeBorderColor = colors.unselectedNodeOutline;

    document.getElementById("selectedNodeColor").value = colors.selectedNode;
    state.currentSelectedNodeColor = colors.selectedNode;

    document.getElementById("buildEdgeColor").value = colors.buildEdge;
    state.currentBuildEdgeColor = colors.buildEdge;

    document.getElementById("unvisitedNodeBorderColor").value = colors.unvisitedNodeBorder;
    state.currentUnvisitedNodeBorderColor = colors.unvisitedNodeBorder;

    document.getElementById("visitedNodeBorderColor").value = colors.visitedNodeBorder;
    state.currentVisitedNodeBorderColor = colors.visitedNodeBorder;

    document.getElementById("activeNodeBorderColor").value = colors.activeNodeBorder;
    state.currentActiveNodeBorderColor = colors.activeNodeBorder;


    document.getElementById("unvisitedEdgeColor").value = colors.unvisitedEdge;
    state.currentUnvisitedEdgeColor = colors.unvisitedEdge;

    document.getElementById("extendedEdgeColor").value = colors.extendedEdge;
    state.currentExtendedEdgeColor = colors.extendedEdge;

    document.getElementById("unextendedEdgeColor").value = colors.unextendedEdge;
    state.currentUnextendedEdgeColor = colors.unextendedEdge;


    turnButton('settings', 'on');
    settingsModal.style.display = "block";
}

function applySettingsModal() {

    var wrongRadiusSize = true;
    var defaultNodeColorsModified = false;

    var radiusSize = parseFloat(document.getElementById("radiusSize").value);
    if (radiusSize >= 12 && radiusSize <= 60) {
        wrongRadiusSize = false;
        if (radiusSize !== parseFloat(state.currentRadius)) {

            if (state.keepSizeRatios === true) {
                var newRadius = radiusSize, newStroke, newEdgeSize, newFontSize;
                newStroke = newRadius / sizes.ratios.radiusStroke;
                newEdgeSize = newRadius / sizes.ratios.radiusLine;
                newFontSize = newRadius / sizes.ratios.radiusFont + "px";

                updateSVGGraphSizes(state.svg, newRadius, newStroke, newEdgeSize, newFontSize);
                state.graph = updateGraphSizes(state.graph, newRadius, newStroke);

                sizes.radius = newRadius;
                sizes.edgeWidth = newStroke;
                sizes.nodeOutlineWidth = newEdgeSize;
                sizes.stdFontSize = newFontSize;
            }
            else {
                // TODO: Implement later - for advanced options.
            }
        }

        var settingsModal = document.getElementById('settingsModal');
        settingsModal.style.display = "none";
        turnButton('settings', 'off');
    }

    var newDefaultNodeColor = document.getElementById("defaultNodeColor").value;
    if (state.currentNodeColor.toLowerCase() !== newDefaultNodeColor.toLowerCase()) {
        colors.unselectedNode = newDefaultNodeColor;
        defaultNodeColorsModified = true;

        var previewCircle = document.getElementById("previewCircle");
        previewCircle.style.fill = colors.unselectedNode;
    }

    var newDefaultBorderNodeColor = document.getElementById("defaultNodeBorderColor").value;
    if (state.currentNodeBorderColor.toLowerCase() !== newDefaultBorderNodeColor.toLowerCase()) {
        colors.unselectedNodeOutline = newDefaultBorderNodeColor;
        defaultNodeColorsModified = true; 

        var previewCircle = document.getElementById("previewCircle");
        previewCircle.style.stroke = colors.unselectedNodeOutline;
    }

    var newSelectedNodeColor = document.getElementById("selectedNodeColor").value;
    if (state.currentSelectedNodeColor.toLowerCase() !== newSelectedNodeColor.toLowerCase()) {
        colors.selectedNode = newSelectedNodeColor;

        if (state.isComponentSelected) {
            var selectedCircle = document.getElementById("circle" + state.selectedNodeId);
            if (selectedCircle) {
                selectedCircle.style.fill = colors.selectedNode;
            }
        }
    }

    var newBuildEdgeColor = document.getElementById("buildEdgeColor").value;
    if (state.currentBuildEdgeColor.toLowerCase() !== newBuildEdgeColor.toLowerCase()) {
        colors.buildEdge = newBuildEdgeColor;

        updateSVGEdgesColor(state.svg);
        updatePolygonColor("previewPolygon", colors.buildEdge);
        updatePolygonColor("previewPath", colors.buildEdge);
        updateLineColor("previewLine", colors.buildEdge);
    }

    var newVisitedNodeBorderColor = document.getElementById("visitedNodeBorderColor").value;
    if (state.currentVisitedNodeBorderColor.toLowerCase() !== newVisitedNodeBorderColor.toLowerCase()) {
        colors.visitedNodeBorder = newVisitedNodeBorderColor;
    }

    var newUnvisitedNodeBorderColor = document.getElementById("unvisitedNodeBorderColor").value;
    if (state.currentUnvisitedNodeBorderColor.toLowerCase() !== newUnvisitedNodeBorderColor.toLowerCase()) {
        colors.unvisitedNodeBorder = newUnvisitedNodeBorderColor;
    }

    var newActiveNodeBorderColor = document.getElementById("activeNodeBorderColor").value;
    if (state.currentActiveNodeBorderColor.toLowerCase() !== newActiveNodeBorderColor.toLowerCase()) {
        colors.activeNodeBorder = newActiveNodeBorderColor;
    }

    var newUnvisitedEdgeColor = document.getElementById("unvisitedEdgeColor").value;
    if (state.currentUnvisitedEdgeColor.toLowerCase() !== newUnvisitedEdgeColor.toLowerCase()) {
        colors.unvisitedEdge = newUnvisitedEdgeColor;
    }

    var newExtendedEdgeColor = document.getElementById("extendedEdgeColor").value;
    if (state.currentExtendedEdgeColor.toLowerCase() !== newExtendedEdgeColor.toLowerCase()) {
        colors.extendedEdge = newExtendedEdgeColor;
    }

    var newUnextendedEdgeColor = document.getElementById("unextendedEdgeColor").value;
    if (state.currentUnextendedEdgeColor.toLowerCase() !== newUnextendedEdgeColor.toLowerCase()) {
        colors.unextendedEdge = newUnextendedEdgeColor;
    }

    if (defaultNodeColorsModified) {
        updateSVGGraphNodesColor(state.svg);
    }

    if (wrongRadiusSize) {
        alert("Maybe make alert message.");
    }
}


function openRearrangeModal() {
    var rearrangeModal = document.getElementById('rearrangeModal');

    turnButton('rearrange', 'on');

    rearrangeModal.style.display = "block";
}

function applyRearrangeModal() {

    var rearranged = false;

    if (state.rearrangeSelectedId) {
        var option = document.getElementById(state.rearrangeSelectedId);
        if (option && option.classList.contains("rearrangeSelected")) {
            switch(option.id) {
                case "rearrangeCircular":
                    rearrangeCircular();
                    break;
                case "rearrangeRandomCircular":
                    rearrangeCircular(true);
                    break;
                default:
                    break; 
            }

            option.classList.remove("rearrangeSelected");
            state.rearrangeSelectedId = null;
            

            rearranged = true;
        }
    }

    if (rearranged === true) {
        var rearrangeModal = document.getElementById('rearrangeModal');
        turnButton('rearrange', 'off');
        rearrangeModal.style.display = "none";
    }
    else {
        alert("No option selected");
    }
}

function openSaveModal() {
    var saveModal = document.getElementById('saveModal');

    // DELETE THIS LINE AND CHECK CONTINUE HERE. FIX BUTTONS FOR SAVE DIV
    // state.savedGraphs = [{id: "id1", graphJSON: "none"}, {id: "id2", graphJSON: "none2"}]
    var len = state.savedGraphs.length;

    var savedGraphs = document.getElementById("savedGraphs");

    savedGraphs.innerHTML = "";

    var savedGraphsHTML = "";
    var graphDiv, graphSpan, rowDiv;
    for (var i = 0; i < len; ++i) {
        rowDiv = document.createElement("div");
        graphDiv = document.createElement("div");
        graphSpan = document.createElement("span");
        graphSpan.id = state.savedGraphs[i].id;

        rowDiv.classList.add("row");
        graphDiv.classList.add("12-col-sm");
        graphDiv.classList.add("savedGraph");

        graphSpan.innerHTML = state.savedGraphs[i].id;
        graphDiv.appendChild(graphSpan);

        rowDiv.appendChild(graphDiv);

        savedGraphs.appendChild(rowDiv);
    }

    document.getElementById("saveGraphName").value = "";

    saveModal.style.display = "block";
}

function applySaveModal() {
    var name = document.getElementById("saveGraphName");
    var id = name.value;

    var graphNameExists = false;

    var len = state.savedGraphs.length;
    for (var i = 0; i < len; ++i) {
        if (id === state.savedGraphs[i].id) {

            state.savedGraphs[i].graphJSON = graphToJSON(state.graph);
            
            graphNameExists = true;
            break;
        }
    }
    if (!graphNameExists) {
        state.savedGraphs.push({id: id, graphJSON: graphToJSON(state.graph)});
    }

    var saveModal = document.getElementById('saveModal');
    saveModal.style.display = "none";
}

function savedOnInputCheck(shouldWork = true) {
    console.log("shout");
    if (shouldWork) {
        var input = document.getElementById("saveGraphName");
        var value = input.value;

        var len = state.savedGraphs.length;

        if (state.savedInputJustMatched === true) {
            state.savedInputJustMatched = false;

            var graphSpan = document.getElementById(state.savedInputJustMatchedId);
            graphSpan.style.backgroundColor = "rgba(135, 206, 235, 0)";
        }

        for (var i = 0; i < len; ++i) {
            if (value === state.savedGraphs[i].id) {
                state.savedInputJustMatched = true;
                state.savedInputJustMatchedId = state.savedGraphs[i].id;

                var graphSpan = document.getElementById(state.savedGraphs[i].id);
                graphSpan.style.backgroundColor = "rgba(135, 206, 235, 0.5)";
                // alert("Shout");
            }
        }
    }
}

function openLoadModal() {
    var loadModal = document.getElementById('loadModal');

    // TODO: MAKE IT MORE FORMAL -- Temporary solution to make it work
    var def = document.getElementById("defaultGraphsButton");
    def.classList.add("off");
    displayGraphs('default');

    turnButton('load', 'on');

    loadModal.style.display = "block";
}

function displayGraphs(type = "default") {
    var def = document.getElementById("defaultGraphsButton");
    var saved = document.getElementById("savedGraphsButton");

    if (type === "default" && def.classList.contains("off")) {
        state.graphsType = "suggested";
        def.classList.add("on");
        def.classList.remove("off");
        saved.classList.remove("on");
        saved.classList.add("off");

        var algorithms = state.algorithms.getAvailableAlgorithms(state.graph);
        var len = algorithms.length;
        var newHTML = "";
        var graphs, graphsNo;
        var graphDisplay = document.getElementById("graphsDisplay");
        graphDisplay.innerHTML = "";
        state.loadGraphs = [];

        for (var i = 0; i < len; ++i) {
            newHTML += '<p style="text-decoration: underline; text-align: left; font-size: 21px;">' 
                    + algorithms[i].name + "<p> <br>\n"; 
            graphs = getGraphsForAlgorithm(algorithms[i].id, state.graph.directed, state.graph.weighted);
            graphsNo = graphs.length;
            

            var rowDiv;
            var iterations = Math.floor(graphsNo / 4);
            var k;
            var option, options;
            options = document.createElement("div");

            for (var j = 0; j < iterations; ++j) {
                rowDiv = document.createElement("div");
                rowDiv.classList.add("row");
                rowDiv.classList.add("graphOptions");
                k = j * 4 - 1;

                for (var l = 0; l < 4; ++l) {
                    ++k;
                    option = document.createElement("div");

                    option.id = graphs[k].id;
                    option.innerHTML = graphs[k].name;

                    option.classList.add("col-sm-3");
                    option.classList.add("graphOption");
                    option.classList.add("off");
                    option.classList.add("hoverShadow");
                    option.classList.add("lightBlue");
                    
                    rowDiv.appendChild(option);
                    state.loadGraphs.push({id: graphs[k].id, graphJSON: graphs[k].graph});
                }
                options.appendChild(rowDiv);
            }

            var last4 = (graphsNo - 1) % 4 + 1;
            rowDiv = document.createElement("div");
            rowDiv.classList.add("row");
            rowDiv.classList.add("graphOptions");
            k = iterations * 4 - 1;

            for (var j = 0; j < last4; ++j) {
                ++k;

                option = document.createElement("div");

                option.id = graphs[k].id;
                option.innerHTML = graphs[k].name;

                option.classList.add("col-sm-3");
                option.classList.add("graphOption");
                option.classList.add("off");
                option.classList.add("hoverShadow");
                option.classList.add("lightBlue");

                rowDiv.appendChild(option);
                state.loadGraphs.push({id: graphs[k].id, graphJSON: graphs[k].graph});
            }

            last4 = 4 - last4;
            for (var j = 0; j < last4; ++j) {

                option = document.createElement("div");
                option.classList.add("col-sm-3");
                rowDiv.appendChild(option);
            }
            options.appendChild(rowDiv);

            newHTML += options.outerHTML + "\n";
        }
        graphDisplay.innerHTML = newHTML;

        var opt, allOptions = document.getElementsByClassName("graphOption");
        var optsLen = allOptions.length;

        for (var i = 0; i < optsLen; ++i) {
            opt = allOptions[i];
            opt.onclick = selectGraph;
        }

        return;   
    }
    if (type === "saved" && saved.classList.contains("off")) {
        state.graphsType = "saved";
        saved.classList.add("on");
        saved.classList.remove("off");
        def.classList.remove("on");
        def.classList.add("off");

        var len = state.savedGraphs.length;

        var graphDisplay = document.getElementById("graphsDisplay");
        graphDisplay.innerHTML = "";

        var option, options;
        options = document.createElement("div");
        options.classList.add("row");
        options.classList.add("graphOptions");

        for (var i = 0; i < len; ++i) {
            option = document.createElement("div");

            option.id = state.savedGraphs[i].id;
            option.innerHTML = state.savedGraphs[i].id;
        
            option.classList.add("col-sm-3");
            option.classList.add("graphOption");
            option.classList.add("off");
            option.classList.add("hoverShadow");
            option.classList.add("lightBlue");

            options.appendChild(option);
        }

        var complete = (len - 1) % 4 + 1;
        complete = 4 - complete;

        for (var j = 0; j < complete; ++j) {

            option = document.createElement("div");

            option.classList.add("col-sm-3");
            
            options.appendChild(option);
        }

        graphDisplay.innerHTML = options.outerHTML;

        var opt, allOptions = document.getElementsByClassName("graphOption");
        var optsLen = allOptions.length;

        for (var i = 0; i < optsLen; ++i) {
            opt = allOptions[i];
            opt.onclick = selectGraph;
        }

        return;
    }

}

function selectGraph(e) {

    var oldId = state.selectedGraphId;
    if (oldId) {
        turnButton(oldId, "off");
    }
    var elem = e.srcElement || e.target;
    state.selectedGraphId = elem.id;
    turnButton(state.selectedGraphId, "on");
}

function applyLoadModal() {

    var directed = state.graph.directed;
    var weighted = state.graph.weighted;

    if (state.selectedGraphId) {

        var graph = null, graphs;
        if (state.graphsType === "suggested") {
            graphs = state.loadGraphs;
        } 
        else {
            graphs = state.savedGraphs;
        }
        
        var len = graphs.length;
        for (var i = 0; i < len; ++i) {
            console.log(graphs[i].id);
            if (state.selectedGraphId === graphs[i].id) {

                graph = jsonToGraph(graphs[i].graphJSON);
                break;
            }
        }
        if (graph) {

            // CONTINUEHERE
            var y = -(graphMinY(graph) - (sizes.radius + sizes.nodeOutlineWidth * 2 + 6));
            var x = -(graphMinX(graph) - (sizes.radius + sizes.nodeOutlineWidth * 2 + 6));

            var graphWidth = graphMaxX(graph) - graphMinX(graph) + 
                            2 * (sizes.radius + sizes.nodeOutlineWidth + 6);
            var graphHeight = graphMaxY(graph) - graphMinY(graph) + 
                            2 * (sizes.radius + sizes.nodeOutlineWidth + 6);

            var modalSVGWidth = state.svg.getClientRects()[0].width;
            var modalSVGHeight = state.svg.getClientRects()[0].height;

            var xRatio = min([parseFloat(modalSVGWidth) / parseFloat(graphWidth), 1]);
            var yRatio = min([parseFloat(modalSVGHeight) / parseFloat(graphHeight), 1]);
            
            graph = transposeGraphCoordinates(graph, x, y, xRatio, yRatio);

            x = graphMaxX(graph) - graphMinX(graph);
            x = modalSVGWidth - x;
            x /= 2;

            x -= (sizes.radius + 2 * sizes.edgeWidth);

            y = graphMaxY(graph) - graphMinY(graph);
            y = modalSVGHeight - y;
            y /= 2;
            y -= (sizes.radius + 2 * sizes.edgeWidth);

            graph = transposeGraphCoordinates(graph, x, y, 1, 1);

            state = updateGraphToState(graph, state);

            if (state.graph.directed !== directed) {
                switchDirButtons(state.graph.directed)
            }
            if (state.graph.weighted !== weighted) {
                switchWeightButtons(state.graph.weighted)
            }

            state.svg.innerHTML = state.svg.innerHTML;
        }
    }

    state.maxIdValue = state.graph.getMaxId();

    var loadModal = document.getElementById('loadModal');
    loadModal.style.display = "none";

    turnButton('load', 'off');
    disableButton("algorithm", false);
}

function rearrangeCircular(random = false) {
    var r = min([state.svg.width.baseVal.value, 
                 state.svg.height.baseVal.value]);
    var x = state.svg.width.baseVal.value / 2;
    var y = state.svg.height.baseVal.value / 2;
    r = r / 2 - 50;

    state.graph.makeCoordinatesCircular(x, y, r, 0, 0, random);

    state = updateGraphToState(state.graph, state);

    state.svg.innerHTML = state.svg.innerHTML;
}

function openDirModal(directed) {
    var dirModal = document.getElementById('directionModal');
    var dirSVG = document.getElementById('dirSVG');
    
    dirModal.style.visibility = "hidden";
    dirModal.style.display = "block";

    state.newDirection = directed;
    state.newGraph = clone(state.graph);

    if (directed === true) {
        state.newGraph = makeGraphDirected(state.newGraph); // if this is the case
    }
    else {
        state.newGraph = makeGraphUndirected(state.newGraph);
    }

    var y = -(graphMinY(state.graph) - (sizes.radius + sizes.nodeOutlineWidth + 6));

    var graphWidth = graphMaxX(state.graph) - graphMinX(state.graph) + 
                    2 * (sizes.radius + sizes.nodeOutlineWidth + 6);
    var graphHeight = graphMaxY(state.graph) - graphMinY(state.graph) + 
                    2 * (sizes.radius + sizes.nodeOutlineWidth + 6);

    var modalSVGWidth = dirSVG.getClientRects()[0].width;
    var modalSVGHeight = dirSVG.getClientRects()[0].height;

    var xRatio = min([parseFloat(modalSVGWidth) / parseFloat(graphWidth), 1]);
    var yRatio = min([parseFloat(modalSVGHeight) / parseFloat(graphHeight), 1]);
    
    state.modalTransform = {"x": 0, "y": y, "xRatio": xRatio, "yRatio": yRatio};
    state.newGraph = transposeGraphCoordinates(state.newGraph, 0, y, xRatio, yRatio);

    dirSVG.innerHTML = graphToDirSVG(state.newGraph).innerHTML;
    dirModal.style.visibility = "visible";
}

function applyDirChanges() {
    var modal = document.getElementById('directionModal');
    var dirSVG = document.getElementById('dirSVG');

    var weighted = false;
    if (state.graph.weighted) {
        weighted = true;
    }

    state.svg.innerHTML = "";

    state.newGraph = transposeGraphCoordinates(state.newGraph, 0, 
                    -state.modalTransform.y, 1 / state.modalTransform.xRatio, 
                    1 / state.modalTransform.yRatio);

    // remove all removed edges.
    var removedEdges = dirSVG.querySelectorAll(".edgeRemoved");
    var len = removedEdges.length, id, nodeId1, nodeId2;

    for (var i = 0; i < len; ++i) {
        id = removedEdges[i].id.split("line0")[1];

        nodeId1 = id.split("-")[0];
        nodeId2 = id.split("-")[1];

        state.newGraph.remove("edge", nodeId1, nodeId2);
    }

    state = updateGraphToState(state.newGraph, state);

    
    modal.style.display = "none";
    dirSVG.innerHTML = "";

    state.svg.innerHTML = state.svg.innerHTML;

    switchDirButtons(state.newDirection);

    if (weighted) {
        switchWeighted(false);
        switchWeighted(true);
    }
}

function openWeightModal(e) {
    var weightModal = document.getElementById('weightModal');
    var weightInput = document.getElementById('weightInput');
    var element = e.srcElement || e.target;

    state.modifiedWeightId = element.id;
    console.log(state.modifiedWeightId);

    weightInput.value = parseFloat(element.innerHTML);

    weightModal.style.display = "block";
}

function applyWeightChange() {
    var modal = document.getElementById('weightModal');
    var weightInput = document.getElementById('weightInput');

    var newValue = parseFloat(weightInput.value);

    if (newValue !== 0) {
        if (!newValue) {
            // CONTINUE HERE BY ADDING ALERT MESSAGE
            alert("Not a number. Please enter a number");
            return;
        }
    }
    
    var weight = state.svg.getElementById(state.modifiedWeightId);
    weight.innerHTML = newValue;

    var edgeId = state.modifiedWeightId.split('weight')[1];
    var nodeId1 = edgeId.split("-")[0], nodeId2 = edgeId.split("-")[1];
    state.graph.updateWeight(parseInt(nodeId1), parseInt(nodeId2), parseFloat(newValue));

    modal.style.display = "none";

    state.svg.innerHTML = state.svg.innerHTML;
}

function openNameModal(element) {
    var nameModal = document.getElementById('nameModal');
    var nameInput = document.getElementById('nameInput');
    // var element = e.srcElement || e.target;

    var name = document.getElementById("name" + element.id).innerHTML;

    nameInput.value = name;

    nameModal.style.display = "block";
}

function applyNameChange() {
    var modal = document.getElementById('nameModal');
    var nameInput = document.getElementById('nameInput');

    var newValue = nameInput.value;

    if (newValue.length > 10) {
        alert("Not a number. Please enter a number");
        return;
    }
    
    var name = state.svg.getElementById("name" + state.modifiedNameId);
    name.innerHTML = newValue;

    state.graph.updateName(parseInt(state.modifiedNameId), newValue);

    modal.style.display = "none";

    state.svg.innerHTML = state.svg.innerHTML;
}

// CONTINUEHERE: Move to SVG
function addWeights() {

    if (state.graph.directed === true) {
        var d, svgPath, svgEdge, svgEdges = state.svg.querySelectorAll(".edge");
        var len = svgEdges.length;
        var gId, lineId, x1, y1, x2, y2;

        // REMAKE THIS PART.
        for (var i = 0; i < len; ++i) {
            svgEdge = svgEdges[i];

            gId = svgEdge.id;
            lineId = "line" + gId;
            svgPath = document.getElementById(lineId);

            d = svgPath.getAttribute("d");
            var size = d.split(' ').length;

            x1 = parseFloat(d.split('M')[1].split(' ')[1]);
            y1 = parseFloat(d.split('M')[1].split(' ')[2]);
            x2 = parseFloat(d.split(' ')[size - 2]);
            y2 = parseFloat(d.split(' ')[size - 1]);

            var p1 = {"x": x1, "y": y1};
            var p2 = {"x": x2, "y": y2};
            var nodeId1 = gId.split("-")[0];
            var nodeId2 = gId.split("-")[1];

            var p = rightAnglePoint(nodeId1, nodeId2, p1, p2, false);
            var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));

            var text = createSVGWeight(nodeId1, nodeId2, p1, p2, weight, false);

            svgEdge.appendChild(text);     
        }
    }
    else {
        var svgLine, svgEdge, svgEdges = state.svg.querySelectorAll(".edge");
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
            var nodeId1 = gId.split("-")[0];
            var nodeId2 = gId.split("-")[1];
            var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));

            var text = createSVGWeight(nodeId1, nodeId2, p1, p2, weight);

            svgEdge.appendChild(text);     
        }
    }

    state.svg.innerHTML = state.svg.innerHTML; 
}

function removeWeights(argument) {

    var svgWeight, svgWeights = state.svg.querySelectorAll(".weight");
    var len = svgWeights.length;


    for (var i = 0; i < len; ++i) {
        svgWeight = svgWeights[i];

        state.remove("weight", svgWeight.id);   
    }

    state.svg.innerHTML = state.svg.innerHTML; 
}

function resetButtonSetUp() {
    document.getElementById("reset").classList.remove("on");
    document.getElementById("reset").classList.add("off");
    document.getElementById("reset").classList.add("hoverShadow");
}

function reset(orientation = false) {
    cssSetUp();
    state.reset(orientation);
    disableButton("algorithm");

    pressButton("reset", 100)
};

function edit(element) {

    if (element.classList.contains(graphComponent)) {
        state.modifiedNameId = element.id;

        openNameModal(element);
    }
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

                var circleId = arrayToString(["circle", state.selectedNodeId]);
                setSVGCircleFill(circleId, colors.unselectedNode);

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

        // TODOSOON: Do testing to make sure this is not really needed...
        // // Eliminates element
        // if (state.isComponentSelected === true) {
        //     state.isComponentSelected = false;

        //     var circleId = arrayToString(["circle", state.selectedNodeId]);
        //     setSVGCircleFill(circleId, colors.unselectedNode);

        //     state.svg.innerHTML = state.svg.innerHTML;
        // }
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
                            disableButton("algorithm");
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
        case "Edit":
            edit(element);
            break;
        default:
            break;
    }

    // console.log("Task id: " + state.contextElementId + 
    //             ", Task action: " + linkElement.getAttribute("data-action"));
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
    if (clickedInsideElement(e, "isModal")) {
        return;
    }
    // TEST HOW USEFUL THIS CODE IS:
    state.allowMove = false;
    setTimeout(function() {
        state.allowMove = true;
    }, 50);    


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
    if (clickedInsideElement(e, "isModal")) {
        return;
    }

    if (clickedInsideElement(e, "canvas")) {
        
        var currentX = e.clientX - state.left;
        var currentY = e.clientY - state.top;

        if (state.allowMove == false) {
            return;
        }

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

                var nodeIndex = state.graph.getNodeIndexFromId(nodeId);
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

                            var nodeId1 = lineId.split("-")[0];
                            var nodeId2 = lineId.split("-")[1];

                            var d;
                            var dir = null; 

                            if (parseInt(nodeId) === parseInt(nodeId1)) {          

                                var node2 = state.graph.allNodes[state.graph.getNodeIndexFromId(nodeId2)];

                                var p1 = pointOnCircle(newX, newY, node2.x, node2.y, sizes.radius + sizes.edgeWidth, -sizes.angleDev);
                                var p2 = pointOnCircle(node2.x, node2.y, newX, newY, sizes.radius + sizes.edgeWidth, sizes.angleDev);
                            }
                            else {

                                var node1 = state.graph.allNodes[state.graph.getNodeIndexFromId(nodeId1)];

                                var p1 = pointOnCircle(node1.x, node1.y, newX, newY, sizes.radius + sizes.edgeWidth, -sizes.angleDev);
                                var p2 = pointOnCircle(newX, newY, node1.x, node1.y, sizes.radius + sizes.edgeWidth, sizes.angleDev);
                            }                    
                            dir = computeDir(parseInt(nodeId1), parseInt(nodeId2), p1, p2);


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
                                var nodeId1 = lineId.split("-")[0];
                                var nodeId2 = lineId.split("-")[1];
                                var p1, p2;
                                var node1, node2;

                                if (state.graph.directed === true) {
                                    var d;

                                    if (parseInt(nodeId) === parseInt(nodeId1)) {
                                        node2 = document.getElementById("circle" + nodeId2);

                                        p1 = {"x": newX, "y": newY};
                                        p2 = {"x": node2.getAttribute("cx"), "y": node2.getAttribute("cy")};
                                    }
                                    else {
                                        node1 = document.getElementById("circle" + nodeId1);

                                        p1 = {"x": node1.getAttribute("cx"), "y": node1.getAttribute("cy")};
                                        p2 = {"x": newX, "y": newY};
                                    }

                                    d = computeD(nodeId1, nodeId2, p1.x, p1.y, p2.x, p2.y);

                                    p1.x = parseFloat(d.split('M')[1].split(' ')[1]);
                                    p1.y = parseFloat(d.split('M')[1].split(' ')[2]);

                                    var l = d.split(' ').length;
                                    p2.x = parseFloat(d.split(' ')[l - 2]);
                                    p2.y = parseFloat(d.split(' ')[l - 1]);

                                    var p = rightAnglePoint(nodeId1, nodeId2, p1, p2, false);
                                    elem.setAttribute("x", p.x);
                                    elem.setAttribute("y", p.y);
                                }
                                else {
                                    if (parseInt(nodeId) === parseInt(nodeId1)) {
                                        node2 = document.getElementById("circle" + nodeId2);

                                        p1 = {"x": newX, "y": newY};
                                        p2 = {"x": node2.getAttribute("cx"), "y": node2.getAttribute("cy")};
                                    }
                                    else {
                                        node1 = document.getElementById("circle" + nodeId1);

                                        p1 = {"x": node1.getAttribute("cx"), "y": node1.getAttribute("cy")};
                                        p2 = {"x": newX, "y": newY};
                                    }
                                    var p = rightAnglePoint(nodeId1, nodeId2, p1, p2);
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

                state.lock = false;
            }
        }
        else {

            if (state.mode === "algorithm") {
                return;
            }

            var circle = state.svg.getElementById("previewCircle");
            circle.setAttribute("cx", currentX);
            circle.setAttribute("cy", currentY);
            
            var line = state.svg.getElementById("previewLine");
            line.setAttribute("x2", currentX);
            line.setAttribute("y2", currentY);
            
            var path = state.svg.getElementById("previewPath");

            if (state.contextMenuOn === false) {

                var insideNode = false;
                var insideEdge = false;
                var clickedElement = e.srcElement || e.target;
                var clickedTag = clickedElement.nodeName;

                while (clickedElement.id === "previewCircle" || clickedElement.id === "previewLine" || 
                       clickedElement.id === "previewPath") {
                    clickedElement = clickedElement.parentNode;
                    clickedTag = clickedElement.nodeName;
                }
                // console.log(clickedTag);
                switch(clickedTag){
                    case "circle":
                        insideNode = true;
                        break;
                    case "text":
                        if (clickedElement.parentNode.classList.contains(nodeClass)) {
                            insideNode = true;
                        }
                        if (clickedElement.parentNode.classList.contains(edgeClass)) {
                            insideEdge = true;
                        }
                        break;
                    case "line":
                        if (clickedElement.parentNode.classList.contains(edgeClass)) {
                            insideEdge = true;
                        }
                        break;
                    case "path":
                        if (clickedElement.parentNode.classList.contains(edgeClass)) {
                            insideEdge = true;
                        }
                        break;
                    default: 
                        break;
                }


                var point = {"x": currentX, "y": currentY};
                var checkEdgeIntersection = insideNode;

                // if (!insideNode && pointIntersectsEdge(point, state.graph, state.svg)) {
                //     path.setAttribute("visibility", "hidden"); 
                //     circle.setAttribute("visibility", "hidden"); 
                //     line.setAttribute("visibility", "hidden");
                // }
                // else {
                    
                if (insideNode === false && insideEdge === false) {
                    circle.setAttribute("visibility", "visible");
                }
                else {
                    circle.setAttribute("visibility", "hidden");
                    if (insideEdge === true) {
                        state.svg.getElementById("previewLine").setAttribute("visibility", "hidden");
                        state.svg.getElementById("previewPath").setAttribute("visibility", "hidden");
                    }

                    switch(clickedTag){
                        case "circle":
                            line.setAttribute("x2", clickedElement.getAttribute("cx"));
                            line.setAttribute("y2", clickedElement.getAttribute("cy"));
                            break;
                        case "text":
                            if (insideNode) {
                                line.setAttribute("x2", clickedElement.getAttribute("x"));
                                line.setAttribute("y2", clickedElement.getAttribute("y"));
                            }
                            break;
                        default: 
                            break;
                    }
                }

                if (state.isComponentSelected) {
                    if (state.graph.directed === true) {
                        var node = state.svg.getElementById("circle" + state.selectedNodeId);

                        var pt1 = {"x": parseFloat(node.getAttribute("cx")), 
                                   "y": parseFloat(node.getAttribute("cy"))};
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

                        var clickedElementId = clickedElement.id;
                        
                        if (clickedElementId.indexOf("circle") >= 0) {
                            clickedElementId = clickedElementId.split("circle")[1];
                        }
                        if (clickedElementId.indexOf("name") >= 0) {
                            clickedElementId = clickedElementId.split("name")[1];
                        }

                        if (parseInt(clickedElementId) !== parseInt(state.selectedNodeId)) {
                            if (insideEdge === false) {
                                path.setAttribute("visibility", "visible");
                            }
                        }
                        else {
                            path.setAttribute("visibility", "hidden"); 
                        }
                    }
                    else {
                        if (insideEdge === false) {
                            line.setAttribute("visibility", "visible");
                        }
                    }
                }
                // }
            }
        }
    }
    else {
        // TODO: Use Pointer Lock API to hide previewCircle when outside canvas.
        state.svg.getElementById("previewCircle").setAttribute("visibility", "hidden");
        state.svg.getElementById("previewLine").setAttribute("visibility", "hidden");
        state.svg.getElementById("previewPath").setAttribute("visibility", "hidden");
    }
}

function mouseUp(e) {
    if (clickedInsideElement(e, "dirModal")) {
        // animation. 

        var clickedElement = e.srcElement || e.target;
        // console.log(clickedElement);

        if (clickedElement.classList.contains(edgeComponent)) {

            if (clickedElement.classList.contains("edgeOff")) {
                console.log("should be added");
                clickedElement.classList.remove('edgeOff');
                clickedElement.classList.add('edgeRemoved');

                // CONTINUEHERE: TODO: ADD ANIMATION.
            }
            else {
                console.log("Or not?");
                clickedElement.classList.add('edgeOff');
                clickedElement.classList.remove('edgeRemoved');

                // TODO: ADD ANIMATION.
            }
        }

        return;
    }
    if (clickedInsideElement(e, "rearrangeModal")) {
        // animation. 

        var clickedElement = e.srcElement || e.target;
        if (clickedElement.classList.contains("rearrangeOption")) {
            // remove old.
            console.log(state.rearrangeSelectedId);
            if (state.rearrangeSelectedId && state.rearrangeSelectedId !== null) {
                console.log(state.rearrangeSelectedId);

                document.getElementById(state.rearrangeSelectedId).classList.remove("rearrangeSelected");
            }

            clickedElement.classList.add("rearrangeSelected");
            state.rearrangeSelectedId = clickedElement.id;
        }

        return;
    }

    state.mouse.down = false;
    state.mouse.downInsideSVG = false;

    var dragged = false;
    if (state.mouse.dragOnMove === true) {
        dragged = true;
    }
    state.mouse.dragOnMove = false;

    // NEEDS TO BE CONTINUED
    if (clickedInsideElement(e, "canvas")) {
        if (state.mouse.moved === false) {     
            clickInterpret(e);
        }
        else {      
            if (dragged) {

                if (state.isComponentSelected) {

                    var node = state.graph.allNodes[state.graph.getNodeIndexFromId(state.selectedNodeId)];
                    
                    if (state.graph.directed === true) {
                        
                        var node = state.graph.allNodes[state.graph.getNodeIndexFromId(state.selectedNodeId)];

                        var newPath = computeD(node.id, parseInt(node.id) + 1, node.x, node.y, node.x + 100, node.y + 100);
                        console.log(newPath);

                        state.svg.getElementById("previewPath").setAttribute("d", newPath);

                    }
                    else {
                        state.svg.getElementById("previewLine").setAttribute("x1", node.x);
                        state.svg.getElementById("previewLine").setAttribute("y1", node.y);
                    }

                } 
            }   
            console.log("MOUSE UP. SHOULD I DO ANYTHING HERE? MAYBE SOME CLEAN UP ON state.mouse?");
        }
        // else {
        //     state.mouse.moveElements = [];
        // }
    }
    else {
        if (state.isComponentSelected === true) {

            var circleId = arrayToString(["circle", state.selectedNodeId]);
            setSVGCircleFill(circleId, colors.unselectedNode);
            
            state.isComponentSelected = !state.isComponentSelected;
        } 
        var button = e.which || e.button;
        if (button === 1 && state.contextMenuOn === true) {
            state.contextMenuOn = false;
            return;
        }
    }
}

function dblClick(e) {

    var clickedElement = e.srcElement || e.target;

    if (clickedElement.id.indexOf("weight") >= 0 && clickedElement.classList.contains(edgeComponent)) {
        openWeightModal(e);
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

function ondblclickListener() {
    document.addEventListener("dblclick", dblClick)
}

function scroll(e) {
    
    var dim = state.svg.getBoundingClientRect();
    
    state.left = dim.left;
    state.top = dim.top;
}

function onscrollListener() {
    document.addEventListener("scroll", scroll);
}

function windowClickListener() {
    window.onclick = handleClick;
}

function handleClick(e) {

    if (event.target.id === "directionModal" || event.target.id === "cancelDirModal") {
        var dirModal = document.getElementById('directionModal');
        var dirSVG = document.getElementById('dirSVG');

        dirSVG.innerHTML = "";
        dirModal.style.display = "none";
    }

    if (event.target.id === "weightModal" || event.target.id === "cancelWeightModal") {
        var weightModal = document.getElementById('weightModal');

        weightModal.style.display = "none";
    }

    if (event.target.id === "settingsModal" || event.target.id === "cancelSettingsModal") {
        var settingsModal = document.getElementById('settingsModal');
        
        turnButton('settings', 'off');

        settingsModal.style.display = "none";
    }

    if (event.target.id === "loadModal" || event.target.id === "cancelLoadModal") {
        var loadModal = document.getElementById('loadModal');

        turnButton('load', 'off');
        loadModal.style.display = "none";
    }

    if (event.target.id === "saveModal" || event.target.id === "cancelSaveModal") {
        var saveModal = document.getElementById('saveModal');

        saveModal.style.display = "none";
    }

    if (event.target.id === "rearrangeModal" || event.target.id === "cancelRearrangeModal") {
        var rearrangeModal = document.getElementById('rearrangeModal');

        if (state.rearrangeSelectedId && state.rearrangeSelectedId !== null) {

            document.getElementById(state.rearrangeSelectedId).classList.remove("rearrangeSelected");
            state.rearrangeSelectedId = null;        
        }

        turnButton('rearrange', 'off');
        rearrangeModal.style.display = "none";
    }

    if (event.target.id === "nameModal" || event.target.id === "cancelNameModal") {
        var nameModal = document.getElementById('nameModal');

        nameModal.style.display = "none";
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
    ondblclickListener();

    windowClickListener();
}

// Event managing 
window.onload = function() {

    state = new State();
    createSVGGroupZero(state.svg);
    hireListeners();

    cssSetUp();

}