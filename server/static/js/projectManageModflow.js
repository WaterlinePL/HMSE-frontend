// model removal
async function deleteModflowModel(projectId) {
    var url = getEndpointForProjectId(Config.projectManageModflow, projectId);
    await fetch(url, {
        method: "DELETE"
    }).then(response => {
        if (response.status === 200) {
            document.getElementById('modflowRemoveBtn').hidden = true;
            document.getElementById('modflowUploadBtn').textContent = "Upload";
            document.getElementById('modflowModelId').textContent = "None";
            document.getElementById('modflowModelGridSize').hidden = true;
            document.getElementById('modflowModelGridUnit').hidden = true;
            document.getElementById('modflowModelDuration').hidden = true;
            document.getElementById('modflowModelDuration').hidden = true;
            document.getElementById('metadataEndDate').textContent = "None";
            showSuccessToast(jQuery, "Modflow model successfully deleted");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function openModflowDialog() {
    const input = document.getElementById('modflowUploadInput');
    input.click();
}

async function sendModflowModelAfterSelected(projectId) {
    const elem = document.getElementById('modflowUploadInput');
    if (!elem.files) {
        return;
    }

    const url = getEndpointForProjectId(Config.projectManageModflow, projectId);
    const formData = new FormData();
    const modflowModel = elem.files[0];
    formData.append('modelArchive', modflowModel);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        document.getElementById('modflowUploadInput').value = "";
        if (response.status === 200) {
            response.json().then(data => {
                document.getElementById('modflowRemoveBtn').hidden = false;
                document.getElementById('modflowUploadBtn').textContent = "Change";
                document.getElementById('modflowModelId').textContent = data['modflow_id'];
                document.getElementById('modflowModelGridSize').hidden = false;
                document.getElementById('modflowModelGridSizeContent').textContent = `${data['total_width']} x ${data['total_height']}`
                document.getElementById('modflowModelGridUnit').hidden = false;
                document.getElementById('modflowModelGridUnitContent').textContent = data['grid_unit'];
                document.getElementById('modflowModelDuration').hidden = false;
                document.getElementById('modflowModelDurationContent').textContent = data['duration'];

                if (document.getElementById('metadataStartDate').textContent !== "None") {
                    document.getElementById('metadataEndDate').textContent = data['end_date'];
                }

                // TODO: prepare grid
                showSuccessToast(jQuery, "Modflow model successfully uploaded");
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    })
}