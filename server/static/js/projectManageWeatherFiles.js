function addWeatherEntryToSimulation(projectId, weatherId) {
    const weatherList = document.getElementById("weatherFileList");
    const uploadButtonListElement = document.getElementById("weatherUpload");
    const deleteLambda = () => deleteWeatherFile(projectId, weatherId);
    weatherList.insertBefore(createProjectListElement(weatherId, deleteLambda), uploadButtonListElement);
}


// model removal
async function deleteWeatherFile(projectId, weatherId) {
    const url = getEndpointForProjectId(Config.projectManageWeatherFile, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'weatherId': weatherId})
    }).then(response => {
        if (response.status === 200) {
            document.getElementById(weatherId).remove();
            // TODO: Activate toast
        }
    });
}


async function openWeatherFileDialog() {
    const input = document.getElementById('weatherFileUploadInput');
    input.click();
}

async function sendWeatherFileAfterSelected(projectId) {
    const elem = document.getElementById('weatherFileUploadInput');
    if (!elem.files) {
        return;
    }

    const url = getEndpointForProjectId(Config.projectManageWeatherFile, projectId);
    const formData = new FormData();
    const weatherFile = elem.files[0];
    formData.append('weatherFile', weatherFile);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            // Reload?
            addWeatherEntryToSimulation(projectId, weatherFile.name);
        } else {
            // TODO: Show error toast
        }
    });
}

(function ($) {
    'use strict';

    // UPLOAD CLASS DEFINITION
    // ======================

    var dropZone = document.getElementById('drop-zone-modflow');

    $('#model-select').on('change', function() {
      var value = $(this).val();
      removeInvalid('model-select');
    });

    async function startUploadWeatherFile(files, model_name) {
        const formData = new FormData();
        const file = files[0];
        formData.append('file', file);
        formData.append('model_name', model_name)
        var url = Config.uploadWeatherFile;
        await fetch(url, {
            method: "POST",
            body: formData
        }).then(response => {
            if (response.status !== 200) {
                response.json().then(function(data) {
                    if (data && data.error) $('#error-toast-message').html(data.error);
                    else $('#error-toast-message').html('An unknown error occurred');
                    $("#error-toast").toast('show');
                })
                .catch(function(error) {
                    $('#error-toast-message').html('An unknown error occurred');
                    $("#error-toast").toast('show');
                });
            } else {
                $("#success-toast").toast('show');
            }
        });
    }

    dropZone.ondrop = function (e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';
        const model_name = document.getElementById("model-select").value;
        if( model_name !== undefined && model_name !== null && model_name !== ""){
            startUploadWeatherFile(e.dataTransfer.files, model_name)
        } else {
            addInvalid("model-select", "Choose model from list")
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

    function removeInvalid(elementId) {
        if ($(`#${elementId}`).hasClass('is-invalid')) {
            $(`#${elementId}`).removeClass('is-invalid');
        }
    }

    function addInvalid(elementId, errorText) {
        if (!$(`#${elementId}`).hasClass('is-invalid')) {
            $(`#${elementId}`).addClass('is-invalid');
        }

        $('#error-toast-message').text(errorText)
        $('#error-toast').toast('show');
    }

})(jQuery);