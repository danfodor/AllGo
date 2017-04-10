function addClassesToId(id, classes = []) {
    var element = document.getElementById(id);

    if (element && classes) {
        for (var i = 0; i < classes.length; ++i) {
            element.classList.add(classes[i]);
        }
    }
}

function removeClassesFromId(id, classes = []) {
    var element = document.getElementById(id);

    if (element && classes) {
        for (var i = 0; i < classes.length; ++i) {
            element.classList.remove(classes[i]);
        }
    }
}

function setDisplay(elementId, display = "block") {
	var element = document.getElementById(elementId);

	if (element) {
		element.style.display = display;
	}
}


function turnButton(buttonId, on = 'on', onClasses = ['on'], offClasses = ['off', 'hoverShadow']) {

    switch(on) {
        case 'on':
            addClassesToId(buttonId, onClasses);
            removeClassesFromId(buttonId, offClasses);
             break;
        case 'off':
            removeClassesFromId(buttonId, onClasses);
            addClassesToId(buttonId, offClasses);
            break;
        default:
            break;
    }
    addClassesToId(buttonId)
}

function pressButton(buttonId, msTime = 100) {
    turnButton(buttonId, "on");

    setTimeout(function() {
        turnButton(buttonId, "off");
    }, msTime);
}

function disableButton(elementId, notAllowed = true) {

    if (notAllowed === true) {
        removeClassesFromId(elementId, ['hoverShadow']);
        addClassesToId(elementId, ['disabled']);
    }
    else {
        addClassesToId(elementId, ['hoverShadow']);
        removeClassesFromId(elementId, ['disabled']);
    }
}


function cssSetUp() {
       
    switchMode("build");
    
    state.graph.directed = false;
    switchDirButtons(false);
    disableButton("algorithm");
    
    state.graph.weighted = false;
    switchWeighted(false);
    
    resetButtonSetUp();
}

function playerMenuDefaultCSS(noEdge, nodesNo) {

    turnButton("restart", "off");
    turnButton("next", "off");
    turnButton("start", "off");
    disableButton("restart", false);
    disableButton("next", false);
    disableButton("start", false);

    turnButton("back", "off");
    turnButton("stop", "off");
    disableButton("back", true);
    disableButton("stop");

    if (noEdge) {
        if (nodesNo < 1) {
            disableButton("next");
            disableButton("start");
        }
    }
}