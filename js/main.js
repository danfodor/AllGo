"use strict";

// Tags to look over: 
//  -> DIRECTCASE
//  -> URGENT TASK

// Uses external js file ./state.js
// Uses external js file ./graph.js
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
        // console.log("ID: " + clickedElement.id);
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
    var intersectsNode = state.graph.intersectsNode(x, y);
    if (intersectsNode !== false) {

        var forbiddenCircle = state.svg.getElementById("forbiddenCircle");
        forbiddenCircle.setAttribute("cx", intersectsNode.x);
        forbiddenCircle.setAttribute("cy", intersectsNode.y);
        forbiddenCircle.setAttribute("visibility", "visible");
        // timeout 100ms 
        setTimeout(function() {
            var forbiddenCircle = state.svg.getElementById("forbiddenCircle");
            forbiddenCircle.setAttribute("visibility", "hidden");
            state.svg.innerHTML = state.svg.innerHTML;
        }, 200);
        
        return false;
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
    text.style.fontSize = sizes.stdFontSize;
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

    return node;
}

// REFACTORING
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

// TODO: IMPLEMENT THIS;
function addEdge(nodeId1, nodeId2) {
    if (state.graph.directed === true) {

        var circle1 = document.getElementById("circle" + nodeId1);
        var circle2 = document.getElementById("circle" + nodeId2);

        var x1 = circle1.cx.baseVal.value;
        var y1 = circle1.cy.baseVal.value;

        var x2 = circle2.cx.baseVal.value;
        var y2 = circle2.cy.baseVal.value;

        var p1 = pointOnCircle(x1, y1, x2, y2, sizes.radius + sizes.edgeWidth, -10);
        var p2 = pointOnCircle(x2, y2, x1, y1, sizes.radius + sizes.edgeWidth, 10);
        var dir = computeDir(nodeId1, nodeId2, p1, p2);
        
        var pt = quadBezierPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                  parseFloat(p2.x), parseFloat(p2.y), dir);
        var pathD = quadBezierPointsToSVG(pt);        

        // DEAL WITH THIS svgHandler
        if (state.graph.addEdge(nodeId1, nodeId2)) {

            var edge = document.createElement("g");
            edge.id = nodeId1 + "-" + nodeId2;

            var path = document.createElement("path");

            path.id = "line" + nodeId1 + "-" + nodeId2;

            path.setAttribute("d", pathD);
            
            path.style.stroke = colors.unusedEdge;

            path.style.strokeWidth = sizes.edgeWidth;
            path.style.fill= "transparent";
            path.classList.add(edgeComponent);
            path.classList.add("line");
        
            var defs = document.createElement("defs");
            var marker = document.createElement("marker");

            marker.id = "arrow" + nodeId1 + "-" + nodeId2;
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
            
            edge.classList.add("node" + nodeId1);      
            edge.classList.add("node" + nodeId2);   

            edge.classList.add(edgeClass);
            edge.classList.add(graphComponent);


            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            var forbiddenPath = state.svg.getElementById("forbiddenPath");

            forbiddenPath.setAttribute("d", pathD);
            forbiddenPath.setAttribute("visibility", "visible");
            
            setTimeout(function() {
                var forbiddenPath = state.svg.getElementById("forbiddenPath");
                forbiddenPath.setAttribute("visibility", "hidden");
                state.svg.innerHTML = state.svg.innerHTML;
            }, 200);
            return false;
        }
    }
    else {
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

            if (state.graph.weighted === true) {
                var text = document.createElement("text");
                
                text.id = "weight" + nodeId1 + "-" + nodeId2;
                text.style.fontSize = sizes.stdFontSize;
                text.style.alignmentBaseline = "central";
                text.style.textAnchor = "middle";
                text.style.fontWeight = "bold";

                var p = rightAnglePoint(nodeId1, nodeId2, {"x": x1, "y": y1}, {"x": x2, "y": y2});

                text.setAttribute("x", p.x);
                text.setAttribute("y", p.y);
                text.style.cursor = "text";
                // GET THE WEIGHT FROM graph
                var weight = state.graph.getEdgeWeight(parseInt(nodeId1), parseInt(nodeId2));
                text.innerHTML = weight;
                
                text.classList.add(edgeComponent);
                text.classList.add("weight");

                edge.appendChild(text);  
            }
            
            edge.classList.add("node" + nodeId1);      
            edge.classList.add("node" + nodeId2);   

            edge.classList.add(edgeClass);
            edge.classList.add(graphComponent);

            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            var forbiddenLine = state.svg.getElementById("forbiddenLine");

            var nodeInd1 = state.graph.nodeIndexFromId(nodeId1);
            var nodeInd2 = state.graph.nodeIndexFromId(nodeId2);

            forbiddenLine.setAttribute("x1", state.graph.allNodes[nodeInd1].x);
            forbiddenLine.setAttribute("y1", state.graph.allNodes[nodeInd1].y);
            forbiddenLine.setAttribute("x2", state.graph.allNodes[nodeInd2].x);
            forbiddenLine.setAttribute("y2", state.graph.allNodes[nodeInd2].y);
            forbiddenLine.setAttribute("visibility", "visible");

            setTimeout(function() {
                var forbiddenLine = state.svg.getElementById("forbiddenLine");
                forbiddenLine.setAttribute("visibility", "hidden");
                state.svg.innerHTML = state.svg.innerHTML;
            }, 200);
            return false;
        }
    }

    return true;
}

// This function is used by directed graphs so that 
// no matter the id of the edge is, the output is the 
// same all the time (1-2 and 2-1 will both be considered
// as 1-2)
function computeSortedDir(node1Id, node2Id, p1, p2) {
    var dir = null;

    if (parseInt(node1Id) < parseInt(node2Id)) {
        dir = computeDir(node1Id, node2Id, p1, p2);
    } 
    else {
        dir = computeDir(node2Id, node1Id, p2, p1);
    }

    return dir;
}

// Computes the direction for placing 
function computeDir(node1Id, node2Id, p1, p2) {
    var dir = 1;
    if (parseInt(node1Id) > parseInt(node2Id)) {
        dir = -1;
    }

    if (parseFloat(p1.y) === parseFloat(p2.y)) {
        if ((parseFloat(p1.x) < parseFloat(p2.x) && parseInt(dir) === 1) || 
            (parseFloat(p2.x) < parseFloat(p1.x) && parseInt(dir) === -1)) {
            dir = -dir;
        }
    }
    else {
        if (parseInt(dir) === 1) {
            if (parseFloat(p2.y) < parseFloat(p1.y)) {
                dir = -dir;
            }
        }
        else {
            if (parseFloat(p1.y) < parseFloat(p2.y)) {
                dir = -dir;
            }
        }
    } 
    return dir;   
}

function pointOnCircle(x1, y1, x2, y2, r = 1, deviate = 0) {
    var dx = x2 - x1;
    var dy = y2 - y1; // top-right is the (0,0) point
    
    var a = Math.atan2(dy, dx);
    var angle = a * 180 / Math.PI;
    angle += deviate;

    if (angle < 0) {
        angle += 360;
    }  

    var newX = x1 + r * Math.cos(angle * Math.PI / 180);
    var newY = y1 + r * Math.sin(angle * Math.PI / 180);

    var pt = {"x": newX, "y": newY};


    // var circle = document.createElement("circle");
    
    // circle.id = "circle";

    // circle.setAttribute("cx", newX);
    // circle.setAttribute("cy", newY);
    // circle.setAttribute("r", 1);

    // circle.style.fill = "red";

    // state.svg.appendChild(circle);   


    return pt;
}

function cubicBezierPoints(x1, y1, x2, y2, dir = 1, dfp = 0.2, ratio = 0.8) {
    var X1 = x1; 
    var Y1 = y1;
    var X2 = x2; 
    var Y2 = y2;

    if (dir === 1) {
        if (y1 > y2) {
            dir = -dir;
        }
    }
    else {
        if (y1 < y2) {
            dir = -dir;
        }
    }

    var xp1 = (1 - dfp) * x1 + dfp * x2;  
    var yp1 = (1 - dfp) * y1 + dfp * y2;
    var d1 = Math.sqrt((xp1 - x1) * (xp1 - x1) + (yp1 - y1) * (yp1 - y1));

    var m;
    var mp, rx, ry;
    if (xp1 === x1) {
        rx = 1;
        ry = 0;
    } 
    else {
        if (yp1 === y1) {
            rx = 0;
            ry = 1;
        }
        else {
            m = (y1 - yp1) / (x1 - xp1);
            mp = -1 / m;
            rx = 1 / Math.sqrt(1 + mp * mp);
            ry = mp / Math.sqrt(1 + mp * mp);            
        }
    }

    xp1 = xp1 + dir * ratio * d1 * rx;
    yp1 = yp1 + dir * ratio * d1 * ry;

    var xp2 = dfp * x1 + (1 - dfp) * x2;  
    var yp2 = dfp * y1 + (1 - dfp) * y2;
    var d2 = Math.sqrt((xp2 - x2) * (xp2 - x2) + (yp2 - y2) * (yp2 - y2));

    xp2 = xp2 + dir * ratio * d2 * rx;
    yp2 = yp2 + dir * ratio * d2 * ry;

    return {"x1": x1, "y1": y1, "xp1": xp1, "yp1": yp1, 
            "xp2": xp2, "yp2": yp2, "x2": x2, "y2": y2};
}

function cubicBezierPointsToSVG(points) {
    var d = "";

    d += "M " + points.x1 + " " + points.y1 + " ";
    d += "C " + points.xp1 + " " + points.yp1 + ", ";
    d += points.xp2 + " " + points.yp2 + ", ";   
    d += points.x2 + " " + points.y2;   

    return d;
}

function quadBezierPoints(x1, y1, x2, y2, dir = 1, distFromP1 = 0.5, height = 0.3, dist = null) {

    var xp = (1 - distFromP1) * x1 + distFromP1 * x2;  
    var yp = (1 - distFromP1) * y1 + distFromP1 * y2;
    var dist = Math.sqrt((xp - x1) * (xp - x1) + (yp - y1) * (yp - y1));

    var p1 = {"x": xp, "y": yp};
    var p2 = {"x": x1, "y": y1};


    var v = orthogonalVector(p1, p2);

    var controlX = xp + dir * height * dist * v.x;
    var controlY = yp + dir * height * dist * v.y;


    // var controlX = xp + dir * height * dist * rx;
    // var controlY = yp + dir * height * dist * ry;


    // console.log("xp: " + xp + ", controlX: " + controlX);
    // console.log("yp: " + yp + ", controlY: " + controlY);

    // var cir = document.createElement("circle");
    // var cir2 = document.createElement("circle");

    // cir.setAttribute("cx", xp);
    // cir.setAttribute("cy", yp);
    // cir.setAttribute("r", 3);
    // cir2.setAttribute("cx", (x1+x2)/2);
    // cir2.setAttribute("cy", (y1+y2)/2);
    // cir2.setAttribute("r", 3);

    // cir.style.fill = "RED";
    // cir2.style.fill = "BLUE";

    // state.svg.insertBefore(cir, state.svg.firstChild);
    // state.svg.insertBefore(cir2, state.svg.firstChild);


    return {"x1": x1, "y1": y1, "xp": controlX, "yp": controlY,
            "x2": x2, "y2": y2};
}

function quadBezierPointsToSVG(points) {
    var d = "";

    d += "M " + points.x1 + " " + points.y1 + " ";
    d += "Q " + points.xp + " " + points.yp + ", ";   
    d += points.x2 + " " + points.y2;   

    return d;
}

function pointOnBezierCurve(curve, t = 0.5) {
    var x = (1 - t) * (1 - t) * curve.x1 + 2 * (1 - t) * t * curve.xp + t * t * curve.x2;
    var y = (1 - t) * (1 - t) * curve.y1 + 2 * (1 - t) * t * curve.yp + t * t * curve.y2;

    return {"x": x, "y": y};
}

function pointOnLine(line, t = 0.5) {
    var x = (1 - t) * line.x1 + t * line.x2;
    var y = (1 - t) * line.y1 + t * line.y2;

    return {"x": x, "y": y};
}

function pointBetweenPoints(p1, p2, t = 0.5) {
    var x = (1 - t) * p1.x + t * p2.x;
    var y = (1 - t) * p1.y + t * p2.y;

    return {"x": x, "y": y};
}

function lineGradient(line) {
    var m;
    if (line.x1 === line.x2) {
        m = "Infinity";
    } 
    else {
        if (line.y1 === line.y2) {
            m = 0;
        }
        else {
            m = (line.y2 - line.y1) / (line.x2 - line.x1);            
        }
    }

    return m;
}

function pointsGradient(p1, p2) {
    var m;
    if (p1.x === p2.x) {
        m = "Infinity";
    } 
    else {
        if (p1.y === p2.y) {
            m = 0;
        }
        else {
            m = (p2.y - p1.y) / (p2.x - p1.x);            
        }
    }

    return m;
}

function inverseGradient(m) {
    var invM;

    if (m === 0) {
        invM = "Infinity";
    } 
    else {
        if (m === "Infinity") {
            invM = 0;
        }
        else {
            invM = -1 / m;            
        }
    }

    return invM;
}


function orthogonalVector(p1, p2) {
    var v = {"x": 0, "y": 0};

    var slope = pointsGradient(p1, p2);
    var invSlope = inverseGradient(slope);

    if (invSlope === "Infinity") {
        v.x = 0;
        v.y = 1;
    } 
    else {
        if (invSlope === 0) {
            v.x = 1;
            v.y = 0;
        }
        else {
            v.x = 1 / Math.sqrt(1 + invSlope * invSlope);
            v.y = invSlope / Math.sqrt(1 + invSlope * invSlope);            
        }
    }
    return v;
}

function rightAnglePoint(node1Id, node2Id, p1, p2, dist = sizes.weightDistance, distFromP1 = 0.5, sorted = true) {
    var midPoint = pointBetweenPoints(p1, p2, distFromP1);
    var v = orthogonalVector(p1, p2);
    var dir;
    if (sorted === true) {
        dir = computeSortedDir(node1Id, node2Id, p1, p2);
    }
    else {
        dir = computeDir(node1Id, node2Id, p1, p2);
    }
    var p = {"x": midPoint.x, "y": midPoint.y};

    p.x = p.x + dir * dist * v.x;
    p.y = p.y + dir * dist * v.y;

    return p;
}

// TODO: RESTRCUTURE THIS CODE. Think of utils for generating html
function changeMode() {

    if (state.mode.checked === true) {
        // TODO: CLEAN UP. 
        document.getElementById("algMode").style.display = "none";
        document.getElementById("buildMode").style.display = "block";
    }
    else {

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
        algorithmSelect();
        selectStartNode();
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
    
    if (state.pastSelectedId !== null && state.algorithmRuns === false) {
        document.getElementById(state.pastSelectedId).style.stroke = colors.unselectedNodeOutline;
    }

    state.pastSelectedId = "circle" + nodeId;
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
                console.log("Hulla");
                
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

    // if (state.algorithmRuns === false) {
    //     // disable button.
    // }
}

function restart() {
    // // --- Pseudocode ---
    // clean all the colouring
    // make select algorithm available again
    // make select starting node available again
    // color the starting node 
    // consider that algorithm does not run
    
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


    var edgeType = "line", line, step;
    var len = state.executedSteps.length;
    console.log(state.executedSteps);
    for (var i = 0; i < len; ++i) {
        step = state.executedSteps[i];
        if (step.type === "edge") {
            console.log(edgeType + step.id);
            line = document.getElementById(edgeType + step.id);
            if (line === null) {
                line = document.getElementById("line" + step.id.split('-')[1] + "-" + 
                                                step.id.split('-')[0]);
            }
            // console.log(line);
            line.style.stroke = colors.unusedEdge;
        }
    }


    // color back:
    // var adjacencyLists = state.graph.adjacencyLists;
    // var adjListsLen = adjacencyLists.length;
    // var adjacencyList, nodeId, neighbours, neighboursLen;
    // var line;

    // if (state.graph.directed === true) {

    // }
    // else {
    //     for (var i = 0; i < adjListsLen; ++i) {
    //         nodeId = adjacencyLists[i].id;
    //         neighbours = adjacencyLists[i].neighbours;
    //         neighboursLen = neighbours.length;

    //         for (var j = 0; j < neighboursLen; ++j) {
    //             line = document.getElementById("line" + nodeId + "-" + neighbours[j]);
    //             if (line !== null) {
    //                 line.style.stroke = colors.unusedEdge;
    //             }
    //         }
    //     }
    // }
    // state.svg.innerHTML = state.svg.innerHTML;

    state.nextSteps = state.executedSteps;

    for (var i = 0; i < len; ++i) {

    }
    state.executedSteps = [];
    
    selectStartNode();

    console.log("restart() called. Is this really useful???");
}

function switchDir(argument) {
    // URGENT TASK: DO A CHANGER FROM DIRECTED TO UNDIRECTED 
    // AND THE OTHER WAY AROUND!!!!!
    if (document.getElementById("dir").checked) {
        state.graph.directed = true;
    }
    else {
        state.graph.directed = false;
    }
    state.reset(state.graph.directed);
    console.log("Graph directed: " + state.graph.directed);
}

function switchWeighted(argument) {

    if (document.getElementById("weight").checked) {
        state.graph.setWeighted(true);
        addSVGWeights();
    }
    else {
        state.graph.setWeighted(false);
        removeSVGWeights();
    }
}

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

function reset() {
    state.reset();
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

        state.mouse.downX = e.clientX;
        state.mouse.downY = e.clientY;
        state.mouse.movedX = e.clientX;
        state.mouse.movedY = e.clientY;
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

                                var p1 = pointOnCircle(newX, newY, node2.x, node2.y, sizes.radius + sizes.edgeWidth, -10);
                                var p2 = pointOnCircle(node2.x, node2.y, newX, newY, sizes.radius + sizes.edgeWidth, 10);
                            }
                            else {

                                var node1 = state.graph.allNodes[state.graph.nodeIndexFromId(node1Id)];

                                var p1 = pointOnCircle(node1.x, node1.y, newX, newY, sizes.radius + sizes.edgeWidth, -10);
                                var p2 = pointOnCircle(newX, newY, node1.x, node1.y, sizes.radius + sizes.edgeWidth, 10);
                            }                    
                            dir = computeDir(parseInt(node1Id), parseInt(node2Id), p1, p2);

                            d = quadBezierPointsToSVG(quadBezierPoints(p1.x, p1.y, p2.x, p2.y, dir));
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


                        var p1 = pointOnCircle(pt1.x, pt1.y, pt2.x, pt2.y, sizes.radius + sizes.edgeWidth, -10);
                        var p2 = pointOnCircle(pt2.x, pt2.y, pt1.x, pt1.y, sizes.radius + sizes.edgeWidth, 10);

                        var dir = computeDir(state.selectedNodeId, state.maxIdValue, p1, p2);
                        var pt = quadBezierPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                                  parseFloat(p2.x), parseFloat(p2.y), dir);
                        var d = quadBezierPointsToSVG(pt);         

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
        //     // PAY SOME MORE ATTENTION HERE 
        //     console.log("What to do?");
        //     state.mouse.moveElements = [];
        //     mouseInterpret(e);
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

function hireListeners() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();

    onmousedownListener();
    onmousemoveListener();
    onmouseupListener();
    onscrollListener();
}

// Event managing 
window.onload = function() {
    state = new State();

    hireListeners();
}
