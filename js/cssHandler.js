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

function changeElementDisplay(elementId, display = "block") {
	var element = document.getElementById(elementId);

	if (element) {
		element.style.display = display;
	}
}

function buttonNotAllowed(elementId, notAllowed = true) {

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
    buttonNotAllowed("algorithm");
    
    state.graph.weighted = false;
    switchWeighted(false);
    
    resetButtonSetUp();
}