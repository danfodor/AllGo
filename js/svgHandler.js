"use strict";

function euclideanDistance(p1, p2) {

    var dist = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + 
                     (p2.y - p1.y) * (p2.y - p1.y));
    return dist;
}

function abs(value) {
    if (value < 0) {
        return -value;
    }

    return value;
}

function trianglePerimeter(triangle) {
    var t = triangle;
    var perimeter = 0;

    perimeter += euclideanDistance({"x": t.x1, "y": t.y1}, {"x": t.x2, "y": t.y2});
    perimeter += euclideanDistance({"x": t.x2, "y": t.y2}, {"x": t.x3, "y": t.y3});
    perimeter += euclideanDistance({"x": t.x3, "y": t.y3}, {"x": t.x1, "y": t.y1});

    return perimeter;
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

    return {"x1": x1, "y1": y1, "xp": controlX, "yp": controlY,
            "x2": x2, "y2": y2};
}

function quadBezierPointsToSVG(quadBezier) {
    var d = "";

    d += "M " + quadBezier.x1 + " " + quadBezier.y1 + " ";
    d += "Q " + quadBezier.xp + " " + quadBezier.yp + ", ";   
    d += quadBezier.x2 + " " + quadBezier.y2;   

    return d;
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

    return pt;
}

function lineFromPoints(x1, y1, x2, y2) {

    return {"x1": x1, "y1": y1, "x2": x2, "y2": y2};
}

function lineToSVGPath(line) {
    var d = "";

    d += "M " + line.x1 + " " + line.y1 + " ";
    d += "L " + line.x2 + " " + line.y2;

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

function rightAnglePoint(node1Id, node2Id, p1, p2, sorted = true, dist = sizes.weightDistance, distFromP1 = 0.5) {
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

function createSVGCirlce (id, x, y, radius = sizes.radius, strokeWidth = sizes.nodeOutlineWidth,
                        fill = colors.unselectedNode, stroke = colors.unselectedNodeOutline) {
    var circle = document.createElement("circle");
    
    circle.id = "circle";
    circle.id += id;

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);

    circle.style.fill = fill;
    circle.style.stroke = stroke;
    circle.style.strokeWidth = strokeWidth;
    
    circle.classList.add(nodeComponent);
    circle.classList.add("circle");

    return circle;
}

function createSVGText (id, x, y, fontSize = sizes.stdFontSize, name = null) {
    var text = document.createElement("text");
    
    text.id = "name" + id;
    text.style.fontSize = fontSize;
    text.style.alignmentBaseline = "central";
    text.style.textAnchor = "middle";
    text.style.fontWeight = "bold";

    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.style.cursor = "default";
    if (name === null) {
        text.innerHTML = id;
    }
    else {
        text.innerHTML = name;
    }
    
    text.classList.add(nodeComponent);
    text.classList.add("name");

    return text;
}

function createSVGNode (id, circle, text) {
    var node = document.createElement("g");
    node.id = id;
    
    node.appendChild(circle);
    node.appendChild(text);
    
    node.classList.add("node" + node.id);
    
    node.classList.add(nodeClass);
    node.classList.add(graphComponent);

    return node;
}


function createSVGLine(id1, id2, x1, y1, x2, y2, 
                        stroke = colors.buildModeEdge, 
                        strokeWidth = sizes.edgeWidth) {

    var line = document.createElement("line");

    line.id = "line" + id1 + "-" + id2;
    
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    
    line.style.stroke = stroke;
    line.style.strokeWidth = strokeWidth;
    line.classList.add(edgeComponent);
    line.classList.add("line");

    return line;
}

function createSVGWeight(nodeId1, nodeId2, p1, p2, weight, sorted = true, 
                         fontSize = sizes.stdFontSize) {
    var text = document.createElement("text");
    
    text.id = "weight" + nodeId1 + "-" + nodeId2;

    text.style.fontSize = fontSize;
    text.style.alignmentBaseline = "central";
    text.style.textAnchor = "middle";
    text.style.fontWeight = "bold";

    var p = rightAnglePoint(nodeId1, nodeId2, {"x": p1.x, "y": p1.y}, {"x": p2.x, "y": p2.y}, sorted);

    text.setAttribute("x", p.x);
    text.setAttribute("y", p.y);
    text.style.cursor = "text";

    text.innerHTML = weight;
    
    text.classList.add(edgeComponent);
    text.classList.add("weight");

    return text;
}

function createSVGUndirectedEdge(nodeId1, nodeId2, line, text) {

    var edge = document.createElement("g");
    edge.id = nodeId1 + "-" + nodeId2;

    edge.appendChild(line);

    if (text) {
        edge.appendChild(text);  
    }
    
    edge.classList.add("node" + nodeId1);      
    edge.classList.add("node" + nodeId2);   

    edge.classList.add(edgeClass);
    edge.classList.add(graphComponent);

    return edge;
}


function computeD(nodeId1, nodeId2, x1, y1, x2, y2, r = sizes.radius + sizes.edgeWidth, 
                    dev = sizes.angleDev, directedBezier = false) {

    x1 = parseFloat(x1);
    y1 = parseFloat(y1);
    x2 = parseFloat(x2);
    y2 = parseFloat(y2);

    var d;

    var p1 = pointOnCircle(x1, y1, x2, y2, r, -dev);
    var p2 = pointOnCircle(x2, y2, x1, y1, r, dev);
    var dir = computeDir(nodeId1, nodeId2, p1, p2);
    
    if (directedBezier === true) {
        var pts = quadBezierPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                  parseFloat(p2.x), parseFloat(p2.y), dir);
        d = quadBezierPointsToSVG(pts);           
    }
    else {
        var line = lineFromPoints(parseFloat(p1.x), parseFloat(p1.y), 
                                  parseFloat(p2.x), parseFloat(p2.y));
        d = lineToSVGPath(line);        
    }

    return d;
}

function createSVGDirectedPath(nodeId1, nodeId2, d, markerId = null, 
                               stroke = colors.buildModeEdge, 
                               strokeWidth = sizes.edgeWidth) {
    var path = document.createElement("path");

    path.id = "line" + nodeId1 + "-" + nodeId2;

    path.setAttribute("d", d);
    
    path.style.stroke = stroke;

    path.style.strokeWidth = strokeWidth;
    path.style.fill= "transparent";

    path.classList.add(edgeComponent);
    path.classList.add("line");
    
    if (markerId !== null) {
        path.setAttribute("marker-end", 'url(#' + markerId + ')');
    }

    return path;
}

function createSVGMarker(nodeId1, nodeId2, w = 5, h = 5, vb = "-10 -4 12 12", x = -2, y = 0,
                        pts = sizes.stdPolygonPoints, fill = colors.buildModeEdge, 
                        stroke = colors.buildModeEdge, strokeWidth = "1px") {
    var marker = document.createElement("marker");

    marker.id = "arrow" + nodeId1 + "-" + nodeId2;
    marker.setAttribute("markerWidth", w);
    marker.setAttribute("markerHeight", h);
    marker.setAttribute("viewBox", vb);
    marker.setAttribute("refX", x);
    marker.setAttribute("refY", y);
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");
    
    var polygon = document.createElement("polygon");
    polygon.id = "polygon" + nodeId1 + "-" + nodeId2;
    polygon.setAttribute("points", pts);
    polygon.setAttribute("fill", fill);
    polygon.setAttribute("stroke", stroke);
    polygon.setAttribute("stroke-width", strokeWidth);
    polygon.classList.add("line");

    marker.innerHTML = polygon.outerHTML;

    return marker;
}

function createSVGArrow(marker) {
    var arrow = document.createElement("defs");

    arrow.appendChild(marker);

    return arrow;
}

// CONTINUEHERE:
function createSVGDirectedEdge(nodeId1, nodeId2, path, arrow, text) {
    var edge = document.createElement("g");
    edge.id = nodeId1 + "-" + nodeId2;

    edge.appendChild(arrow);
    edge.appendChild(path);

    if (text) {
        edge.appendChild(text);
    }
            
    edge.classList.add("node" + nodeId1);      
    edge.classList.add("node" + nodeId2);   

    edge.classList.add(edgeClass);
    edge.classList.add(graphComponent);

    return edge;
}

function createSVGOption(name, value) {
    var option = document.createElement("option");
    
    option.setAttribute("value", value);
    option.innerHTML = name;

    return option
}

function createSVGOptions(id, nodes) {

    var options = document.createElement("select");
    options.id = id;
    var optionsHTML = "";
    var option;
    for (var it = 0; it < nodes.length; ++it) {

        option = createSVGOption(nodes[it].name, nodes[it].id)

        optionsHTML += option.outerHTML + "\n";
	}
	options.innerHTML = optionsHTML;
    return options;
}


function runForbiddenCircle(svg, forbiddenCircleId, x, y, ms = 200) {

    var forbiddenCircle = svg.getElementById(forbiddenCircleId);
    forbiddenCircle.setAttribute("cx", x);
    forbiddenCircle.setAttribute("cy", y);
    forbiddenCircle.setAttribute("visibility", "visible");

    setTimeout(function() {
        var forbiddenCircle = svg.getElementById(forbiddenCircleId);
        forbiddenCircle.setAttribute("visibility", "hidden");
        svg.innerHTML = svg.innerHTML;
    }, ms);
}

function runForbiddenLine(svg, forbiddenLineId, x1, y1, x2, y2, ms = 200) {

    var forbiddenLine = svg.getElementById(forbiddenLineId);
    forbiddenLine.setAttribute("x1", x1);
    forbiddenLine.setAttribute("y1", y1);
    forbiddenLine.setAttribute("x2", x2);
    forbiddenLine.setAttribute("y2", y2);
    forbiddenLine.setAttribute("visibility", "visible");

    setTimeout(function() {
        var forbiddenLine = svg.getElementById(forbiddenLineId);
        forbiddenLine.setAttribute("visibility", "hidden");
        svg.innerHTML = svg.innerHTML;
    }, ms);
}

function runForbiddenPath(svg, forbiddenPathId, d, ms = 200) {

    var forbiddenPath = svg.getElementById(forbiddenPathId);

    forbiddenPath.setAttribute("d", d);
    forbiddenPath.setAttribute("visibility", "visible");
    
    setTimeout(function() {
        var forbiddenPath = svg.getElementById(forbiddenPathId);
        forbiddenPath.setAttribute("visibility", "hidden");
        svg.innerHTML = svg.innerHTML;
    }, ms);
}

function graphToSVG(graph) {
    var svg = document.createElement("svg");

    var circle, text, node;
    var nodeId, node, x, y, r, w; 
    var nodesNo = graph.allNodes.length;

    for (var i = 0; i < nodesNo; ++i) {
        node = graph.allNodes[i];

        nodeId = node.id;
        x = node.x;
        y = node.y;
        r = node.r;
        w = node.outlineWidth;
      
        circle = createSVGCirlce(nodeId, x, y, r, w);
        text = createSVGText(nodeId, x, y);
        node = createSVGNode(nodeId, circle, text);

        svg.appendChild(node);      
    }

    if (graph.directed === true) {
        var adjList;
        var outNeighbours, outNeighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var d, path, marker, arrow, edge;
        // TODO: Consider weight.

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            outNeighbours = adjList.outNeighbours;
            outNeighboursNo = outNeighbours.length;
            nodeId = adjList.id;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < outNeighboursNo; ++j) {
                neighbourId = outNeighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                x1 = graph.allNodes[nodeIndex].x;
                y1 = graph.allNodes[nodeIndex].y;
                x2 = graph.allNodes[neighbourIndex].x;
                y2 = graph.allNodes[neighbourIndex].y;

                d = computeD(nodeId, neighbourId, x1, y1, x2, y2);

                marker = createSVGMarker(nodeId, neighbourId);
                arrow = createSVGArrow(marker);
                path = createSVGDirectedPath(nodeId, neighbourId, d, marker.id);
                edge = createSVGDirectedEdge(nodeId, neighbourId, path, arrow);

                svg.insertBefore(edge, svg.firstChild);
            }
        }
    }
    else {
        var adjList;
        var neighbours, neighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var line, edge;
        // TODO: Consider weight.

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            neighbours = adjList.neighbours;
            neighboursNo = neighbours.length;
            nodeId = adjList.id;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < neighboursNo; ++j) {
                neighbourId = neighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                if (parseInt(nodeId) < parseInt(neighbourId)) {

                    x1 = graph.allNodes[nodeIndex].x;
                    y1 = graph.allNodes[nodeIndex].y;
                    x2 = graph.allNodes[neighbourIndex].x;
                    y2 = graph.allNodes[neighbourIndex].y;

                    line = createSVGLine(nodeId, neighbourId, x1, y1, x2, y2);
                    edge = createSVGUndirectedEdge(nodeId, neighbourId, line);

                    svg.insertBefore(edge, svg.firstChild);
                }
            }
        }
    }
    return svg;
}

function graphToDirSVG(graph) {
    var svg = document.createElement("svg");

    var circle, text, node;
    var nodeId, node, x, y, r, w; 
    var nodesNo = graph.allNodes.length;

    for (var i = 0; i < nodesNo; ++i) {
        node = graph.allNodes[i];

        nodeId = node.id;
        nodeId = "0" + nodeId;
        x = node.x;
        y = node.y;
        r = node.r;
        w = node.outlineWidth;
      
        circle = createSVGCirlce(nodeId, x, y, r, w);
        text = createSVGText(node.id, x, y);
        node = createSVGNode(nodeId, circle, text);

        svg.appendChild(node);      
    }

    if (graph.directed === true) {
        var adjList;
        var outNeighbours, outNeighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var d, path, marker, arrow, edge;

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            outNeighbours = adjList.outNeighbours;
            outNeighboursNo = outNeighbours.length;
            nodeId = adjList.id;
            nodeId = "0" + nodeId;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < outNeighboursNo; ++j) {
                neighbourId = outNeighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                x1 = graph.allNodes[nodeIndex].x;
                y1 = graph.allNodes[nodeIndex].y;
                x2 = graph.allNodes[neighbourIndex].x;
                y2 = graph.allNodes[neighbourIndex].y;

                d = computeD(nodeId, neighbourId, x1, y1, x2, y2);

                marker = createSVGMarker(nodeId, neighbourId);
                
                arrow = createSVGArrow(marker);
                
                path = createSVGDirectedPath(nodeId, neighbourId, d, marker.id);
                path.classList.add("edgeOff");
                
                edge = createSVGDirectedEdge(nodeId, neighbourId, path, arrow);

                svg.insertBefore(edge, svg.firstChild);
            }
        }
    }
    else {
        var adjList;
        var neighbours, neighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var line, edge;
        // TODO: Consider weight.

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            neighbours = adjList.neighbours;
            neighboursNo = neighbours.length;
            nodeId = adjList.id;
            nodeId = "0" + nodeId;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < neighboursNo; ++j) {
                neighbourId = neighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                if (parseInt(nodeId) < parseInt(neighbourId)) {

                    x1 = graph.allNodes[nodeIndex].x;
                    y1 = graph.allNodes[nodeIndex].y;
                    x2 = graph.allNodes[neighbourIndex].x;
                    y2 = graph.allNodes[neighbourIndex].y;

                    line = createSVGLine(nodeId, neighbourId, x1, y1, x2, y2);
                    line.classList.add("edgeOff");
                    edge = createSVGUndirectedEdge(nodeId, neighbourId, line);

                    svg.insertBefore(edge, svg.firstChild);
                }
            }
        }
    }

    return svg;
}


function updateGraphToState(graph, state) {

    state.svg.innerHTML = "";

    state.createPreviewCircle();
    state.createForbiddenCircle();
    state.createPreviewLine();
    state.createForbiddenLine();
    state.createPreviewPath();
    state.createForbiddenPath();

    var circle, text, node;
    var nodeId, node, x, y, r, w; 
    var nodesNo = graph.allNodes.length;

    for (var i = 0; i < nodesNo; ++i) {
        node = graph.allNodes[i];

        nodeId = node.id;
        x = node.x;
        y = node.y;
        r = node.r;
        w = node.outlineWidth;
      
        circle = createSVGCirlce(nodeId, x, y, r, w);
        text = createSVGText(nodeId, x, y);
        node = createSVGNode(nodeId, circle, text);

        state.svg.appendChild(node);      
    }

    if (graph.directed === true) {
        var adjList;
        var outNeighbours, outNeighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var d, path, marker, arrow, edge;
        // TODO: Consider weight.

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            outNeighbours = adjList.outNeighbours;
            outNeighboursNo = outNeighbours.length;
            nodeId = adjList.id;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < outNeighboursNo; ++j) {
                neighbourId = outNeighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                x1 = graph.allNodes[nodeIndex].x;
                y1 = graph.allNodes[nodeIndex].y;
                x2 = graph.allNodes[neighbourIndex].x;
                y2 = graph.allNodes[neighbourIndex].y;

                d = computeD(nodeId, neighbourId, x1, y1, x2, y2);

                marker = createSVGMarker(nodeId, neighbourId);
                arrow = createSVGArrow(marker);
                path = createSVGDirectedPath(nodeId, neighbourId, d, marker.id);


                var text = undefined;
                if (graph.weighted === true) {
                    var xp1 = parseFloat(d.split('M')[1].split(' ')[1]);
                    var yp1 = parseFloat(d.split('M')[1].split(' ')[2]);

                    var l = d.split(' ').length;
                    var xp2 = parseFloat(d.split(' ')[l - 2]);
                    var yp2 = parseFloat(d.split(' ')[l - 1]);

                    var p1 = {"x": xp1, "y": yp1};
                    var p2 = {"x": xp2, "y": yp2};

                    var weight = graph.getEdgeWeight(parseInt(nodeId), parseInt(neighbourId));

                    text = createSVGWeight(nodeId, neighbourId, p1, p2, weight, false);
                }

                edge = createSVGDirectedEdge(nodeId, neighbourId, path, arrow, text);

                state.svg.insertBefore(edge, state.svg.firstChild);
            }
        }
    }
    else {
        var adjList;
        var neighbours, neighboursNo, neighbourId;
        var nodeIndex, neighbourIndex;
        var x1, y1, x2, y2;

        var line, edge;

        for (var i = 0; i < nodesNo; ++i) {
            adjList = graph.adjacencyLists[i];

            neighbours = adjList.neighbours;
            neighboursNo = neighbours.length;
            nodeId = adjList.id;
            nodeIndex = graph.getNodeIndexFromId(nodeId);

            for (var j = 0; j < neighboursNo; ++j) {
                neighbourId = neighbours[j];
                neighbourIndex = graph.getNodeIndexFromId(neighbourId);

                if (parseInt(nodeId) < parseInt(neighbourId)) {

                    x1 = graph.allNodes[nodeIndex].x;
                    y1 = graph.allNodes[nodeIndex].y;
                    x2 = graph.allNodes[neighbourIndex].x;
                    y2 = graph.allNodes[neighbourIndex].y;

                    line = createSVGLine(nodeId, neighbourId, x1, y1, x2, y2);

                    var text = undefined;
                    if (graph.weighted === true) {
                        var weight = graph.getEdgeWeight(parseInt(nodeId), parseInt(neighbourId));

                        text = createSVGWeight(nodeId, neighbourId, {x: x1, y: y1}, {x: x2, y: y2}, weight);
                    }

                    edge = createSVGUndirectedEdge(nodeId, neighbourId, line, text);

                    state.svg.insertBefore(edge, state.svg.firstChild);
                }
            }
        }
    }

    state.graph = graph;
    return state;
}

function pointIntersectsLine(point, line) {
    var intersects = false;
    if ((line.x1 === point.x && line.y1 === point.y) || 
        (line.x2 === point.x && line.y2 === point.y)) {
        intersects = true;
        return intersects;
    }
    if ((point.x < line.x1 && point.x < line.x2) ||
        (point.x > line.x1 && point.x > line.x2)) {
        return intersects;
    }
    if ((point.y < line.y1 && point.y < line.y2) ||
        (point.y > line.y1 && point.y > line.y2)) {
        return intersects;
    }

    var lpX = point.x - line.x1;
    var lpY = point.y - line.y1;

    var lX = line.x2 - line.x1;
    var lY = line.y2 - line.y1;

    var product = lpX * lY - lpY * lX;

    if (abs(product) < 0.000001) {
        intersects = true;
    }

    return intersects;
}

function pointInsideRectangle(point, rect) {
    var insideRect = false;

    var rectArea = rectangleArea(rect);
    var triangleTotalArea = 0;

    var rectPoints = rectangleToPoints(rect);

    triangleTotalArea += triangleArea(pointsToTriangle(point, rectPoints.p1, rectPoints.p2));
    triangleTotalArea += triangleArea(pointsToTriangle(point, rectPoints.p2, rectPoints.p3));
    triangleTotalArea += triangleArea(pointsToTriangle(point, rectPoints.p3, rectPoints.p4));
    triangleTotalArea += triangleArea(pointsToTriangle(point, rectPoints.p4, rectPoints.p1));

    if (abs(triangleTotalArea - rectArea) < 0.000001) {
        insideRect = true;
    }

    return insideRect;
}


function rectangleToPoints(rect) {
    var points = {"p1": {"x": rect.x1, "y": rect.y1}, "p2": {"x": rect.x2, "y": rect.y2}, 
                "p3": {"x": rect.x3, "y": rect.y3}, "p4": {"x": rect.x4, "y": rect.y4}};

    return points;
}

function pointsToRectangle(p1, p2, p3, p4) {
    var rect = {"x1": p1.x, "y1": p1.y, "x2": p2.x, "y2": p2.y, 
                "x3": p3.x, "y3": p3.y, "x4": p4.x, "y4": p4.y};

    return rect;
}

function pointsToTriangle(p1, p2, p3) {
    var triangle = {"x1": p1.x, "y1": p1.y, "x2": p2.x, "y2": p2.y, 
                    "x3": p3.x, "y3": p3.y};

    return triangle;
}

function rectangleArea(rect) {
    var rectArea;

    var p1p2 = Math.sqrt((rect.x2 - rect.x1) * (rect.x2 - rect.x1) + 
                         (rect.y2 - rect.y1) * (rect.y2 - rect.y1));
    var p2p3 = Math.sqrt((rect.x3 - rect.x2) * (rect.x3 - rect.x2) + 
                         (rect.y3 - rect.y2) * (rect.y3 - rect.y2));
    rectArea = p1p2 * p2p3;

    // var rectArea = 0.5 * abs((rect.y1 - rect.y3) * (rect.x4 - rect.x2) + 
    //                         (rect.y2 - rect.y4) * (rect.x1 - rect.x3));

    return rectArea;
}

function triangleArea(triangle) {
    var t = triangle;
    var area = 0.5 * abs((t.x1 * (t.y2 - t.y3)) + 
            t.x2 * (t.y3 - t.y1) + t.x3 * (t.y1 - t.y2));

    // var t = triangle;

    // var perimeter = trianglePerimeter(t);
    // var a = euclideanDistance({"x": t.x1, "y": t.y1}, {"x": t.x2, "y": t.y2});
    // var b = euclideanDistance({"x": t.x2, "y": t.y2}, {"x": t.x3, "y": t.y3});
    // var c = euclideanDistance({"x": t.x3, "y": t.y3}, {"x": t.x1, "y": t.y1});

    // var sp = perimeter / 2;
    // var area = Math.sqrt(sp * (sp - a) * (sp - b) * (sp - c));

    return area;
}

function pointIntersectsEdge(point, graph, svg, r = sizes.radius + sizes.nodeOutlineWidth) {
    var intersects = false;

    var edge, edges = graph.getNodePointsForEdges();
    var len = edges.length;

    var pt1, pt2, pt3, pt4, rect;

    for (var i = 0; i < len; ++i) {
        edge = edges[i];

        pt1 = pointOnCircle(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, r,  90);
        pt2 = pointOnCircle(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, r,  -90);
        pt3 = pointOnCircle(edge.p2.x, edge.p2.y, edge.p1.x, edge.p1.y, r,  90);
        pt4 = pointOnCircle(edge.p2.x, edge.p2.y, edge.p1.x, edge.p1.y, r,  -90);


        rect = pointsToRectangle(pt1, pt2, pt3, pt4);

        if (pointInsideRectangle(point, rect) === true) {
            intersects = true;
            break;
        }
    }
    return intersects;
}

function updatePolygonColor(polygonId, color) {
    var polygon = document.getElementById(polygonId);

    polygon.style.stroke = color;
    polygon.style.fill = color;
}

function updateSVGEdgesColor(svg, newColor = "black", lineClass = "line") {
	var lines = svg.getElementsByClassName(lineClass);

	var line, len = lines.length;
	for (var i = 0; i < len; ++i) {
		line = lines[i];
		if (line.nodeName === "polygon") {
    		line.style.stroke = newColor;
    		line.style.fill = newColor;
		}
		else {
    		line.style.stroke = newColor;
		}
	}
}


//////////////////////////////////////////////////////// 
/////////////////// CREATE HTML HERE ///////////////////
////////////////////////////////////////////////////////

function algorithmOptionsHTML(state) {
    var algorithms = state.algorithms.getAvailableAlgorithms(state.graph); 
    var len = algorithms.length;
    var optionsHTML = "";
    var option;

    for (var it = 0; it < len; ++it) {

        option = document.createElement("option");
        option.setAttribute("value", algorithms[it].name);
        option.innerHTML = algorithms[it].name;
        
        optionsHTML += option.outerHTML + "\n";
    }

    return optionsHTML;
}