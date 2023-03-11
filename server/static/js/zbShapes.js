function openZbShapesUploadDialog() {
    const input = document.getElementById('zbZonesInput');
    input.click();
}

async function sendZbZonesAfterSelected(projectId) {
    const elem = document.getElementById('zbZonesInput');
    if (!elem.files) {
        return;
    }

    const url = getEndpointForProjectId(Config.zbShapes, projectId);
    const formData = new FormData();
    const zbShapes = elem.files[0];
    formData.append('zbZones', zbShapes);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                for (const [shapeId, color] of Object.entries(data["shapeIds"])) {
                    addNewShape(projectId, shapeId, color, data["shapeMasks"][shapeId])
                }
            });
            showSuccessToast(jQuery, "Successfully added ZoneBudget shapes for Modflow model");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}