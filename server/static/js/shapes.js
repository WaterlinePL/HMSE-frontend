async function manualShape(projectId, shapeId, color, shapeMask, hydrusMapping, manualValue) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "put",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: shapeId,
            color: color,
            shapeMask: shapeMask,
            hydrusMapping: hydrusMapping,
            manualValue: manualValue
        })
    }).then(response => {
        if (response.status === 200) {
            // TODO: add shape to grid and list
            showSuccessToast(jQuery, "Shape successfully created")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

// COLOR ACCESS:
// document.getElementById("shape1ColorPicker").children[0].children[0].children[0].style.background

function activateShapeEditMode(shapeId) {
    // TODO: add that + css to indicate
}

function deactivateShapeEditMode(shapeId) {
    // TODO
}

async function deleteShape(projectId, shapeId) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: shapeId
        })
    }).then(response => {
        if (response.status === 200) {
            // TODO: remove shape from grid and list
            showSuccessToast(jQuery, "Shape successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function deleteAllRchShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "DELETE"
    }).then(response => {
        if (response.status === 200) {
            // TODO: remove RCH shapes from grid and list
            showSuccessToast(jQuery, "All RCH shapes successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function rchShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "PUT"
    }).then(response => {
        if (response.status === 200) {
            // TODO: add new shapes to grid and list
            showSuccessToast(jQuery, "RCH shapes successfully generated")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}