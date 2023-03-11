async function requestRechargeShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "PUT"
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                for (const [shapeId, color] of Object.entries(data["shapeIds"])) {
                    addNewShape(projectId, shapeId, color, data["shapeMasks"][shapeId])
                }
            });
            showSuccessToast(jQuery, "Successfully added RCH shapes from Modflow model");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}