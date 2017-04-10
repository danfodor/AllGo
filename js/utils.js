

// Returns the minimum value in an array
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

function arrayToString(array = []) {
    var str = "";
    var len = array.length;

    for (var i = 0; i < len; ++i) {
        str = str + array[i];
    }

    return str;
}