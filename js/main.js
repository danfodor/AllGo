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
    if (state.graph.directed === true) {

        // DEAL WITH THIS svgHandler
        if (state.graph.addEdge(nodeId1, nodeId2)) {
            var circle1 = document.getElementById("circle" + nodeId1);
            var circle2 = document.getElementById("circle" + nodeId2);

            var dir = 1;
            if (parseInt(nodeId1) > parseInt(nodeId2)) {
                dir = -1;
            }

            var x1 = circle1.cx.baseVal.value;
            var y1 = circle1.cy.baseVal.value;

            var x2 = circle2.cx.baseVal.value;
            var y2 = circle2.cy.baseVal.value;

            var p1 = pointOnCircle(x1, y1, x2, y2, sizes.radius + sizes.edgeWidth, -10);
            var p2 = pointOnCircle(x2, y2, x1, y1, sizes.radius + sizes.edgeWidth, 10);

            var edge = document.createElement("g");
            edge.id = nodeId1 + "-" + nodeId2;

            var path = document.createElement("path");

            path.id = "line" + nodeId1 + "-" + nodeId2;
            var pt = quadBezierPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                      parseFloat(p2.x), parseFloat(p2.y), dir);
            var pathD = quadBezierPointsToSVG(pt);

            path.setAttribute("d", pathD);
            
            path.style.stroke = colors.unusedEdge;
            if (dir === -1) {
                path.style.stroke = "#1234F6";
            }
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


            // var t = 0.5; // given example value
            // var wx = (1 - t) * (1 - t) * pt.x1 + 2 * (1 - t) * t * pt.xp + t * t * pt.x2;
            // var wy = (1 - t) * (1 - t) * pt.y1 + 2 * (1 - t) * t * pt.yp + t * t * pt.y2;
            // var cir = document.createElement("circle");

            // cir.setAttribute("cx", wx);
            // cir.setAttribute("cy", wy);
            // cir.setAttribute("r", 5);

            // cir.style.fill = "red";

            // state.svg.insertBefore(cir, state.svg.firstChild);


            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            return false;
        }
    }
    // if (state.graph.directed === true) {

    //     // DEAL WITH THIS svgHandler
    //     if (state.graph.addEdge(nodeId1, nodeId2)) {
    //         var circle1 = document.getElementById("circle" + nodeId1);
    //         var circle2 = document.getElementById("circle" + nodeId2);

    //         var dir = 1;
    //         if (parseInt(nodeId1) > parseInt(nodeId2)) {
    //             dir = -1;
    //         }

    //         var x1 = circle1.cx.baseVal.value;
    //         var y1 = circle1.cy.baseVal.value;

    //         var x2 = circle2.cx.baseVal.value;
    //         var y2 = circle2.cy.baseVal.value;

    //         // var p1 = pointOnCircle(x1, y1, x2, y2, sizes.radius + sizes.edgeWidth, -10);
    //         // var p2 = pointOnCircle(x2, y2, x1, y1, sizes.radius + sizes.edgeWidth, 10);

    //         var edge = document.createElement("g");
    //         edge.id = nodeId1 + "-" + nodeId2;

    //         var path = document.createElement("path");

    //         path.id = "line" + nodeId1 + "-" + nodeId2;

    //         var pathD = quadBezierPointsToSVG(quadBezierPoints(x1, y1, x2, y2, dir));

    //         path.setAttribute("d", pathD);
            
    //         path.style.stroke = colors.unusedEdge;
    //         if (dir === -1) {
    //             path.style.stroke = "#1234F6";
    //         }
    //         path.style.strokeWidth = sizes.edgeWidth;
    //         path.style.fill= "transparent";
    //         path.classList.add(edgeComponent);
    //         path.classList.add("line");
            
    //         edge.appendChild(path);
            
    //         edge.classList.add("node" + nodeId1);      
    //         edge.classList.add("node" + nodeId2);   

    //         edge.classList.add(edgeClass);
    //         edge.classList.add(graphComponent);

    //         state.svg.insertBefore(edge, state.svg.firstChild);
    //     }
    //     else {
    //         return false;
    //     }
    // }
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
            
            edge.classList.add("node" + nodeId1);      
            edge.classList.add("node" + nodeId2);   

            edge.classList.add(edgeClass);
            edge.classList.add(graphComponent);

            //pointOnLine({"x1": x1, "y1": y1, "x2": x2, "y2": y2}, 0.6);

            state.svg.insertBefore(edge, state.svg.firstChild);
        }
        else {
            return false;
        }
    }

    return true;
}

function pointOnCircle(x1, y1, x2, y2, r = 1, deviate = 0) {
    var dx = x2 - x1;
    var dy = y2 - y1; // top-right is the (0,0) point

    // console.log("dx: " + dx + ", dy: " + dy);
    
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

function quadBezierPoints(x1, y1, x2, y2, dir = 1, distFromP1 = 0.5, height = 0.3) {
    if (y1 === y2) {
        if ((x1 < x2 && dir === 1) || (x2 < x1 && dir === -1)) {
            dir = -dir;
        }
    }
    else {
        if (dir === 1) {
            if (y2 < y1) {
                dir = -dir;
            }
        }
        else {
            if (y1 < y2) {
                dir = -dir;
            }
        }
    }

    var xp = (1 - distFromP1) * x1 + distFromP1 * x2;  
    var yp = (1 - distFromP1) * y1 + distFromP1 * y2;
    var dist = Math.sqrt((xp - x1) * (xp - x1) + (yp - y1) * (yp - y1));


    var m = lineGradient({"x": xp, "y": yp}, {"x": x1, "y": y1});
    var mp = inverseGradient(m);
    var rx, ry;
    if (mp === "Infinity") {
        rx = 1;
        ry = 0;
    } 
    else {
        if (mp === 0) {
            rx = 0;
            ry = 1;
        }
        else {
            rx = 1 / Math.sqrt(1 + mp * mp);
            ry = mp / Math.sqrt(1 + mp * mp);            
        }
    }

    xp = xp + dir * height * dist * rx;
    yp = yp + dir * height * dist * ry;

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

    return {"x1": x1, "y1": y1, "xp": xp, "yp": yp,
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

    // var cir = document.createElement("circle");

    // cir.setAttribute("cx", x);
    // cir.setAttribute("cy", y);
    // cir.setAttribute("r", 3);

    // cir.style.fill = "red";

    // state.svg.insertBefore(cir, state.svg.firstChild);

    return {"x": x, "y": y};
}

function lineGradient(p1, p2) {
    var m;
    if (p1.x === p2.x) {
        m = 0;
    } 
    else {
        if (p1.y === p2.y) {
            m = "Infinity";
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

// TODO: RESTRCUTURE THIS CODE. Think of utils for generating html
function changeMode() {

    if (state.mode.checked === true) {

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
        startNodeSelect();
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
            // TODO: Think of what should happend if no node
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

function startNodeSelect() {
    var nodeName = document.getElementById("nodeOptions").value; 
    var nodeId = state.graph.nodeIdFromName(nodeName);
    
    if (state.pastSelectedId !== null && state.algorithmRuns === false) {
        document.getElementById(state.pastSelectedId).style.stroke = colors.unselectedNodeOutline;
    }

    state.pastSelectedId = "circle" + nodeId;
    var circle = document.getElementById("circle" + nodeId);
    circle.style.stroke = "green";
}

function restart() {
    console.log("tati");
}

function nextStep() {
    if (state.algorithmRuns === false) {
        state.startNode = document.getElementById("nodeOptions").value;
        var algorithm = document.getElementById("algorithmsOptions").value;
        
        state.algorithmRuns = true;

        state.nextSteps = state.algorithms.run(algorithm, state.graph, state.startNode, true)// perform algorithm
        state.executedSteps = [];

        //console.log(state.nextSteps);
    }

    if (state.nextSteps.length > 0) {
        var executeStep = state.nextSteps.shift();

        // EXECUTE IT
        console.log("On edge: " + executeStep.edge);
        var node = executeStep.edge.split('-')[1];
        var edge = document.getElementById("line" + executeStep.edge);
        if (edge === null) {
            edge = document.getElementById("line" + executeStep.edge.split('-')[1] + "-" + 
                                            executeStep.edge.split('-')[0]);
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
    }
    else {
        alert("Stop the next button when in this case");
    }
}

function backStep() {
    console.log("Not yet implmented");
    alert("Not yet implmented");
}

function switchMove() {
    if (state.move.checked) {
        
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

    if (document.getElementById("dir").checked) {
        state.graph.setWeighted(true);
        // addWeights();
    }
    else {
        state.graph.setWeighted(false);
        // removeWeights();
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
                    console.log("What should the default behaviour be?");
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
                                //console.log(child.id);
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
        if (state.lock === false) {
            state.lock = true;
        }
        console.log("===================");
        console.log("===================");
        e.stopPropagation();

        var nodeId, elemId = state.draggedElem.id;

        // console.log(elemId);
        if (elemId.indexOf("circle") >= 0) {
            nodeId = elemId.split("circle")[1];
        }
        if (elemId.indexOf("name") >= 0) {
            nodeId = elemId.split("name")[1];
        }
        // console.log(nodeId);

        var currentX = e.clientX;
        var currentY = e.clientY;
        
        var dx = currentX - state.posX;
        var dy = currentY - state.posY;
        
        var elemsNumber = state.elementsToDrag.length;
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
            elem = state.elementsToDrag[it];

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
                    console.log(lineId);

                    var node1Id = lineId.split("-")[0];
                    var node2Id = lineId.split("-")[1];

                    // TODO: TRANSPOSE THIS WITH THE CIRCLE MOVE FUNCTION.

                    var d;
                    var dir = 1;

                    if (parseInt(node1Id) > parseInt(node2Id)) {
                        dir = -1;
                    }
                    else {
                        dir = 1;
                    }

                    if (parseInt(nodeId) === parseInt(node1Id)) {          

                        var node2 = state.graph.allNodes[state.graph.nodeIndexFromId(node2Id)];

                        var p1 = pointOnCircle(newX, newY, node2.x, node2.y, sizes.radius + sizes.edgeWidth, -10);
                        var p2 = pointOnCircle(node2.x, node2.y, newX, newY, sizes.radius + sizes.edgeWidth, 10);

                        d = quadBezierPointsToSVG(quadBezierPoints(p1.x, p1.y, p2.x, p2.y, dir));
                    }
                    else {

                        var node1 = state.graph.allNodes[state.graph.nodeIndexFromId(node1Id)];

                        var p1 = pointOnCircle(node1.x, node1.y, newX, newY, sizes.radius + sizes.edgeWidth, -10);
                        var p2 = pointOnCircle(newX, newY, node1.x, node1.y, sizes.radius + sizes.edgeWidth, 10);

                        d = quadBezierPointsToSVG(quadBezierPoints(p1.x, p1.y, p2.x, p2.y, dir));
                    }

                    elem.setAttribute("d", d);
                    break;
                default:
                    break;
            }           
        }

        state.posX = currentX; 
        state.posY = currentY;

        state.lock = false;
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
    hireListeners();
}
