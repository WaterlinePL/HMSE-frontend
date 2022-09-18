async function submitLocalConfig() {

    var modflowExe = document.getElementById("modflowFile").value;
    modflowExe = modflowExe ? modflowExe : null;
    var hydrusExe = document.getElementById("hydrusFile").value;
    hydrusExe = hydrusExe ? hydrusExe : null;

    if (modflowExe || hydrusExe) {
        var currentHydrus = document.getElementById("hydrusCurrentConfig");
        var currentModflow = document.getElementById("modflowCurrentConfig");

        if (!hydrusExe && currentHydrus.textContent.trim() !== "None") {
            hydrusExe = currentHydrus.textContent.trim();
        }
        if (!modflowExe && currentModflow.textContent.trim() !== "None") {
            modflowExe = currentModflow.textContent.trim();
        }

        removeInvalid(jQuery, 'modflowFile');
        removeInvalid(jQuery, 'hydrusFile');

        const url = Config.configuration;
        const formData = {"modflow_program_path": modflowExe, "hydrus_program_path": hydrusExe};
        await fetch(url, {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        }).then(response => {
            if (response.status === 200) {
                if (modflowExe) {
                    currentModflow.textContent = modflowExe;
                }
                if (hydrusExe) {
                    currentHydrus.textContent = hydrusExe;
                }
                showSuccessToast(jQuery, "Configuration successfully saved!");
            } else {
                response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
            }
        });
    } else {
        showErrorToast(jQuery, "Error: No configuration to send!");
        addInvalid(jQuery, "modflowFile");
        addInvalid(jQuery, "hydrusFile");
    }
}

function removeInvalid($, elementId) {
    if ( $(`#${elementId}`).hasClass('is-invalid') ) {
        $(`#${elementId}`).removeClass('is-invalid');
    }
}

function addInvalid($, elementId) {
    if ( !$(`#${elementId}`).hasClass('is-invalid') ) {
            $(`#${elementId}`).addClass('is-invalid');
    }
}
