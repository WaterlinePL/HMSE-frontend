// model removal
async function deleteHydrus(projectId, hydrusId) {
    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({hydrusId: hydrusId})
    }).then(response => {
        if (response.status === 200) {
            document.getElementById(hydrusId).remove();
            // TODO: Activate toast
        }
    });
}


async function openHydrusDialog() {
    const input = document.getElementById('hydrusUploadInput');
    input.click();
}

async function sendHydrusModelAfterSelected(projectId) {
    const elem = document.getElementById('hydrusUploadInput');
    if (!elem.files) {
        return;
    }

    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);
    const formData = new FormData();
    const hydrusModel = elem.files[0];
    formData.append('modelArchive', hydrusModel);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            // TODO: Reload?
        } else {
            // TODO: Show error toast
        }
    })
}


async function startUpload(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++)
            formData.append('archive-input', files[i]);
        const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);

//        console.log(formData);
        await fetch(url, {
            method : "PUT",
            body: formData
        }).then(response => {
            if (response.status === 200) {
//                console.log(response)
                location.reload();  // TODO: poor solution or create with JS
                // Activate success toast
            }
        });
    }

(function($) {
    'use strict';

    // UPLOAD CLASS DEFINITION
    // ======================
    var models = Array.from($('#models-list').children());
    models = models.map(item => item.innerText);


    var dropZone = document.getElementById('drop-zone');

    dropZone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        var flag = false;
        // TODO: is this needed
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            if (models.includes(e.dataTransfer.files[i].name.split(".")[0])) {
                flag = true;
            }
        }

        if (flag === true) {
            $('#toast-message').html('Upload Hydrus model with different name');
            $('#error-wrong-hydrus').toast('show');
        } else {
            startUpload(e.dataTransfer.files);
        }
    }

    dropZone.ondragover = function () {
        this.className = 'upload-drop-zone drop';
        return false;
    }

    dropZone.ondragleave = function () {
        this.className = 'upload-drop-zone';
        return false;
    }

    if ( $('#error-hydrus').length ){
        $('#error-hydrus').toast('show');
    }
})(jQuery);