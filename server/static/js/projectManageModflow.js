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
            // TODO: Set model details
            response.json().then(data => {
                document.getElementById('modflowRemoveBtn').hidden = false;
                document.getElementById('modflowUploadBtn').textContent = "Upload";
                document.getElementById('modflowModelId').textContent = data['modflow_id'];
                document.getElementById('modflowModelGridSize').hidden = false;
                document.getElementById('modflowModelGridSizeContent').textContent = `${data['rows']} cells x ${data['cols']} cells`
                document.getElementById('modflowModelGridUnit').hidden = false;
                document.getElementById('modflowModelGridUnitContent').textContent = data['grid_unit'];
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


//(function ($) {
//    'use strict';
//
//    // UPLOAD CLASS DEFINITION
//    // ======================
//
//    var dropZone = document.getElementById('drop-zone-modflow');
//
//    async function startUploadModflow(files) {
//        const formData = new FormData();
//        const file = files[0];
//        formData.append('archive-input', file);
//        var url = Config.uploadModflow;
//        await fetch(url, {
//            method: "POST",
//            body: formData
//        }).then(response => {
//            if (response.status !== 200) {
//                $('#toast-message').html('Invalid modflow project');
//                $("#error-wrong-modflow").toast('show');
//            } else {
//                location.replace(response.url)
//            }
//        });
//    }
//
//    dropZone.ondrop = function (e) {
//        e.preventDefault();
//        this.className = 'upload-drop-zone';
//        startUploadModflow(e.dataTransfer.files)
//    }
//
//    dropZone.ondragover = function () {
//        this.className = 'upload-drop-zone drop';
//        return false;
//    }
//
//    dropZone.ondragleave = function () {
//        this.className = 'upload-drop-zone';
//        return false;
//    }
//
//    if ( $('#error-modflow').length ){
//        $('#error-modflow').toast('show');
//    }
//
//})(jQuery);