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

            var text = undefined;
            if (state.graph.weighted === true) {
                var xp1 = parseFloat(d.split('M')[1].split(' ')[1]);
                var yp1 = parseFloat(d.split('M')[1].split(' ')[2]);

                var l = d.split(' ').length;
                var xp2 = parseFloat(d.split(' ')[l - 2]);
                var yp2 = parseFloat(d.split(' ')[l - 1]);

                var p1 = {"x": xp1, "y": yp1};
                var p2 = {"x": xp2, "y": yp2};

                var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));

                text = createSVGWeight(nodeId1, nodeId2, p1, p2, weight, false);
            }

            var edge = createSVGDirectedEdge(nodeId1, nodeId2, path, arrow, text);

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

        var p1 = {"x": x1, "y": y1};
        var p2 = {"x": x2, "y": y2};

        if (state.graph.addEdge(nodeId1, nodeId2)) {

            var line = createSVGLine(nodeId1, nodeId2, x1, y1, x2, y2);
            var text = undefined;
            if (state.graph.weighted === true) {
                var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));

                text = createSVGWeight(nodeId1, nodeId2, p1, p2, weight);
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

function min(array) {
    var minVal = null;

    if (array.length > 0) {
        minVal = array[0];

        for (var i = 1; i < array.length; ++i) {
            if (minVal > array[i]) {
                minVal = array[i];
            }
        }
    }

    return minVal;
}

function switchMode(mode) {

    if (mode === "build") {
        // TODO: CLEAN UP. 
        cleanSVGGraphColors();
        document.getElementById("algMode").style.display = "none";
        document.getElementById("buildMode").style.display = "block";

        document.getElementById("build").classList.remove("off");
        document.getElementById("build").classList.add("on");
        document.getElementById("build").classList.remove("hoverShadow");
        // if (state.graph.allNodes.length > 0) {
            document.getElementById("algorithm").classList.add("hoverShadow");
            document.getElementById("algorithm").classList.remove("on");
            document.getElementById("algorithm").classList.add("off");
        // }
    }
    else {
        if (!(state.graph.allNodes.length > 0) === true) {
            return;
        }

        var algorithmsOptions = document.getElementById("algorithmsOptions");
        var optionsHTML = algorithmOptionsHTML(state);

        algorithmsOptions.innerHTML = optionsHTML;


        document.getElementById("algMode").style.display = "block";
        document.getElementById("buildMode").style.display = "none";

        document.getElementById("build").classList.remove("on");
        document.getElementById("build").classList.add("off");
        document.getElementById("build").classList.add("hoverShadow");
        document.getElementById("algorithm").classList.remove("hoverShadow");
        document.getElementById("algorithm").classList.remove("off");
        document.getElementById("algorithm").classList.add("on");

        seqControlMenuSetUp();

        algorithmSelect();
        selectStartNode();
    }
}

function seqControlMenuSetUp() {        
    document.getElementById("restart").classList.add("off");
    document.getElementById("restart").classList.add("hoverShadow");
    document.getElementById("back").classList.add("off");
    document.getElementById("back").classList.add("disabled");
    document.getElementById("back").classList.remove("on");
    document.getElementById("back").classList.remove("hoverShadow");

    document.getElementById("next").classList.add("off");
    document.getElementById("next").classList.add("hoverShadow");
    document.getElementById("next").classList.remove("disabled");
    document.getElementById("next").classList.remove("on");

    if (state.graph.noEdge() === true) {
        if (state.graph.allNodes.length <= 1) {
            console.log("baai");
            document.getElementById("next").classList.remove("hoverShadow");
            document.getElementById("next").classList.add("disabled");

        }
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
            // console.log(algorithm)
            var algorithmId = algorithm.id;

            cleanSVGGraphColors();
            if (algorithmId !== "Kruskal") {
                selectStartNode();                
            }


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

    state.algorithmRuns = false;
    state.pastStartingNode = "circle" + nodeId;
    var circle = document.getElementById("circle" + nodeId);
    circle.style.stroke = "green";
}

function nextStep(withNextButtonPress = true) {
    var algorithm = document.getElementById("algorithmsOptions").value;

    if (state.algorithmRuns === false) {

        state.startNode = document.getElementById("nodeOptions").value;

        state.nextSteps = state.algorithms.run(algorithm, state.graph, state.startNode, true);
        
        var algorithmId = state.algorithms.algorithmId(algorithm);
        console.log(algorithm);
        console.log(algorithmId);
        switch (algorithmId) {
            case "Prim": 
                // console.log("Entered");
                state.nextSteps = state.nextSteps.steps;
                break;
            case "Kruskal": 
                console.log("Entered");
                state.nextSteps = state.nextSteps.steps;
                break;
            default:
                break;
        }
        console.log(state.nextSteps);

        state.runningAlgorithm = algorithm;

        state.algorithmRuns = true;
        state.executedSteps = [];
    }

    if (state.nextSteps.length > 0) {
        var executeStep = state.nextSteps.shift();

        document.getElementById("back").classList.remove("disabled");
        document.getElementById("back").classList.add("hoverShadow");

        if (withNextButtonPress === true) {
            nextButtonPress();
        }

        // EXECUTE IT
        switch(executeStep.type) {
            case "edge":
                var node = executeStep.id.split('-')[1];
                var edgeId = executeStep.id;
                var edge = document.getElementById("line" + executeStep.id);
                if (edge === null) {
                    edgeId = executeStep.id.split('-')[1] + "-" + executeStep.id.split('-')[0];
                    edge = document.getElementById("line" + edgeId);
                }
                
                node = document.getElementById("circle" + node);
                var color = "green";
                if (executeStep.extended === false) {
                    color = "red";
                }
                
                edge.style.stroke = color;
                node.style.stroke = "green";

                if (state.graph.directed === true) {
                    updatePolygonColor("polygon" + edgeId, color);
                }

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

    if (state.nextSteps.length === 0) {
        document.getElementById("next").classList.add("disabled");
        setTimeout(function() {
            document.getElementById("next").classList.remove("hoverShadow"); 
        }, 120); 
    }
}

function nextButtonPress() {
    document.getElementById("next").classList.add("on");
    document.getElementById("next").classList.remove("off");
    document.getElementById("next").classList.remove("hoverShadow");

    setTimeout(function() {
        document.getElementById("next").classList.remove("on");
        document.getElementById("next").classList.add("off");
        document.getElementById("next").classList.add("hoverShadow"); 
    }, 100); 
}

function backStep() {
    if (state.algorithmRuns === true) {
        if (state.nextSteps.length === 0 && state.executedSteps.length > 0) {
            document.getElementById("next").classList.add("hoverShadow");        
            document.getElementById("next").classList.remove("disabled");
        }
        if (state.executedSteps.length > 0) {

            document.getElementById("back").classList.add("on");
            document.getElementById("back").classList.remove("off");
            document.getElementById("back").classList.remove("hoverShadow");

            setTimeout(function() {
                document.getElementById("back").classList.remove("on");
                document.getElementById("back").classList.add("off");
                document.getElementById("back").classList.add("hoverShadow"); 
            }, 100);             

            var backStep = state.executedSteps.splice(-1,1)[0];
            // NICIUN PUSH
            state.nextSteps.unshift(backStep);
            // EXECUTE IT
            console.log(backStep);
            switch(backStep.type) {
                case "edge":
                    var node = document.getElementById("circle" + backStep.id.split('-')[1]);

                    var edgeId = backStep.id;
                    var edge = document.getElementById("line" + edgeId);
                    if (edge === null) {
                        edgeId = backStep.id.split('-')[1] + "-" + backStep.id.split('-')[0]
                        edge = document.getElementById("line" + edgeId);
                    }

                    if (state.graph.directed === true) {
                        updatePolygonColor("polygon" + edgeId, colors.unusedEdge);
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
            document.getElementById("back").classList.remove("hoverShadow");
            document.getElementById("back").classList.add("disabled");
        }
        if (state.executedSteps.length === 0) { 
            setTimeout(function() {
                document.getElementById("back").classList.remove("hoverShadow"); 
            }, 120);             
            
            document.getElementById("back").classList.add("disabled");

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

    cleanSVGGraphColors();
    seqControlMenuSetUp();

    document.getElementById("restart").classList.add("on");
    document.getElementById("restart").classList.remove("off");
    document.getElementById("restart").classList.remove("hoverShadow");

    setTimeout(function() {
        document.getElementById("restart").classList.remove("on");
        document.getElementById("restart").classList.add("off");
        document.getElementById("restart").classList.add("hoverShadow"); 
    }, 100); 
    // document.getElementById; 

    state.nextSteps = state.executedSteps;
    state.executedSteps = [];

    selectStartNode();
}

function start() {

    var timeInterval = document.getElementById("range").value;
    timeInterval = parseFloat(timeInterval);
    timeInterval =timeInterval * 1000;
    // console.log(timeInterval);
    nextStep(false);
    state.runsContinuously = true;

    state.intervalId = window.setInterval(runNextStep, timeInterval);
    console.log("Interval Id: ", state.intervalId);
}

var runNextStep = function() {
    if (state.nextSteps.length > 0) {
        nextStep(false);
    }
    else {
        stop();
    }
}

function stop() {

    state.runsContinuously = false;
    window.clearInterval(state.intervalId);

}

function rangeInput() {

    document.getElementById("speed").value = parseFloat(document.getElementById("range").value).toFixed(1);
}

function speedInput() {
    console.log(document.getElementById("speed").value);
    document.getElementById("range").value = document.getElementById("speed").value;
}

function cleanSVGGraphColors() {
    var nodes = state.graph.allNodes, len = nodes.length;
    if (len > 0) {

        state.startNode = document.getElementById("nodeOptions").value;
        state.algorithmRuns = false;

        // color back:
        var node;
        var circle;

        for (var i = 0; i < len; ++i) {
            node = nodes[i];
            circle = document.getElementById("circle" + node.id);

            // TODO: Use node colour instead of default colour
            circle.style.stroke = colors.unselectedNodeOutline;
        }
        console.log(state.executedSteps);
        if (state.executedSteps) {
            var edgeType = "line", line, step;
            var len = state.executedSteps.length, edgeId;

            for (var i = 0; i < len; ++i) {
                step = state.executedSteps[i];
                if (step.type === "edge") {

                    edgeId = step.id;
                    line = document.getElementById(edgeType + edgeId);
                    if (line === null) {
                        edgeId = step.id.split('-')[1] + "-" + step.id.split('-')[0];
                        line = document.getElementById("line" + edgeId);
                    }

                    line.style.stroke = colors.unusedEdge;
                    if (state.graph.directed) {
                        updatePolygonColor("polygon" + edgeId, colors.unusedEdge);
                    }
                }
            }
        }
    }
}

function switchDirButtons(directed) {

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

            document.getElementById("unweighted").classList.add("off");
            document.getElementById("unweighted").classList.remove("on");
            document.getElementById("unweighted").classList.add("hoverShadow");
            document.getElementById("weighted").classList.remove("hoverShadow");
            document.getElementById("weighted").classList.add("on");
            document.getElementById("weighted").classList.remove("off");
        }
        else {
            state.graph.setWeighted(false);
            removeWeights();

            document.getElementById("unweighted").classList.add("on");
            document.getElementById("unweighted").classList.remove("off");
            document.getElementById("unweighted").classList.remove("hoverShadow");
            document.getElementById("weighted").classList.add("hoverShadow");
            document.getElementById("weighted").classList.add("off");
            document.getElementById("weighted").classList.remove("on");
        }
    }
}


function openRearrangeModal() {
    var rearrangeModal = document.getElementById('rearrangeModal');

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
        rearrangeModal.style.display = "none";
    }
    else {
        alert("No option selected");
    }
}

function openSaveModal() {
    var saveModal = document.getElementById('saveModal');

    saveModal.style.display = "block";
}

function applySaveModal() {
    console.log("here");
    // GET SELECTED.
}

function openLoadModal() {
    var loadModal = document.getElementById('loadModal');

    loadModal.style.display = "block";
}

function displayGraphs(type = "default") {
    var def = document.getElementById("defaultGraphsButton");
    var saved = document.getElementById("savedGraphsButton");

    if (type === "default" && def.classList.contains("off")) {
        def.classList.add("on");
        def.classList.remove("off");
        saved.classList.remove("on");
        saved.classList.add("off");

        var algorithms = state.algorithms.getAvailableAlgorithms(state.graph);
        var len = algorithms.length;
        var newHTML = "";
        var graphs;
        var graphDisplay = document.getElementById("graphsDisplay");
        graphDisplay.innerHTML = "";

        for (var i = 0; i < len; ++i) {
            newHTML += '<p style="text-decoration: underline; text-align: left; font-size: 21px;">' 
                    + algorithms[i].name + "<p> <br>\n"; 
            graphs = getGraphsForAlgorithm(algorithms[i].id);
        }
        graphDisplay.innerHTML = newHTML;

        return;   
    }
    if (type === "saved" && saved.classList.contains("off")) {
        saved.classList.add("on");
        saved.classList.remove("off");
        def.classList.remove("on");
        def.classList.add("off");
        
        return;
    }

}

function applyLoadModal() {
    console.log("I should load.");

    var loadModal = document.getElementById('loadModal');
    loadModal.style.display = "none";
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
    buttonNotAllowed("algorithm");

    document.getElementById("reset").classList.add("on");
    document.getElementById("reset").classList.remove("off");
    document.getElementById("reset").classList.remove("hoverShadow");

    setTimeout(function() {
        document.getElementById("reset").classList.remove("on");
        document.getElementById("reset").classList.add("off");
        document.getElementById("reset").classList.add("hoverShadow"); 
    }, 100);     
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

                while (clickedElement.id === "previewCircle" || clickedElement.id === "previewLine" || 
                       clickedElement.id === "previewPath") {
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


                var point = {"x": currentX, "y": currentY};
                var checkEdgeIntersection = insideNode;

                if (!insideNode && pointIntersectsEdge(point, state.graph, state.svg)) {
                    path.setAttribute("visibility", "hidden"); 
                    circle.setAttribute("visibility", "hidden"); 
                    line.setAttribute("visibility", "hidden");
                }
                else {
                    
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
                                path.setAttribute("visibility", "visible");
                            }
                            else {
                                path.setAttribute("visibility", "hidden"); 
                            }
                        }
                        else {
                            line.setAttribute("visibility", "visible");
                        }
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

function cssSetUp() {

    switchMode("build");
    
    state.graph.directed = false;
    switchDirButtons(false);
    buttonNotAllowed("algorithm");
    
    state.graph.weighted = false;
    switchWeighted(false);
    
    resetButtonSetUp();
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

    if (event.target.id === "loadModal" || event.target.id === "cancelLoadModal") {
        var loadModal = document.getElementById('loadModal');

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

    hireListeners();

    cssSetUp();
}
