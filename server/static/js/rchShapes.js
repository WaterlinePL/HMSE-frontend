async function requestRechargeShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
    }).then(response => {
        if (response.status == 200) {
            response.json().then(data => {
                data["shapeData"].forEach(shape => {
                    addShapeToList(shape['shapeId'], shape['color']);
                    drawShape(shape['mask'], 0, shape['color']);
                })
            });
        } else {
            // TODO: toast with error
        }
    });
}