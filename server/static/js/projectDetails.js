const configElementIds = [
    "metadataProjectName",
    "metadataStartDate",
    "metadataEndDate",
    "metadataLat",
    "metadataLong",
    "metadataSpinUp"
]

var oldValues = {}


// TODO: Validation
async function enterEditMode() {
    this.hidden = true;
    configElementIds.forEach(elementId => {
        var element = document.getElementById(elementId);
        oldValues[elementId] = element.value;
        element.disabled = false;
        element.classList.replace("text-standard", "text-old");
    });
    // Hide this button, show submit button
    document.getElementById("editConfigButton").hidden = true;
    document.getElementById("cancelEditConfigButton").hidden = false;
    document.getElementById("submitConfigButton").hidden = false;
}

async function changeColorToUpdated(id) {
    document.getElementById(id).classList.replace("text-old", "text-edited");
}

async function submitConfig(projectId) {
    const requestData = {
        "projectName": document.getElementById("metadataProjectName").value.trim(),
        "startDate": document.getElementById("metadataStartDate").value.trim(),
        "endDate": document.getElementById("metadataEndDate").value.trim(),
        "lat": document.getElementById("metadataLat").value.trim(),
        "long": document.getElementById("metadataLong").value.trim(),
        "spinUp": document.getElementById("metadataSpinUp").value.trim()
    }

    const url = getEndpointForProjectId(Config.project, projectId);
    await fetch(url, {
            method: "PATCH",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData)
        }).then(response => {
            if (response.status === 200) {
                setFields(requestData);
                turnOffButtons();
                showSuccessToast(jQuery, "Project configuration successfully updated");
            } else {
                response.json().then(data => {
                    showErrorToast(jQuery, `Error: ${data.description}`);
                });
            }
        });
}


async function setFields(valuesDict) {
    for (const [i, newValue] of Object.entries(Object.values(valuesDict))) {
        const elemId = configElementIds[i];
        const oldVal = Object.values(oldValues)[i];
        var elem = document.getElementById(elemId);
        elem.value = newValue;

        if (oldVal == newValue) {
            resetSingleElement(elemId);
        } else {
            elem.classList.replace("text-edited", "text-updated");
            setTimeout(() => document.getElementById(elemId).classList.replace("text-updated", "text-standard"), 1500);
        }
        elem.disabled = true;
    }
    oldValues = {};
}

async function turnOffButtons() {
    document.getElementById("editConfigButton").hidden = false;
    document.getElementById("cancelEditConfigButton").hidden = true;
    document.getElementById("submitConfigButton").hidden = true;
}

async function returnToOriginalTextStyle() {
    configElementIds.forEach(elemId => resetSingleElement(elemId));
}


async function resetSingleElement(elemId) {
    document.getElementById(elemId).classList.replace("text-old", "text-standard");
    document.getElementById(elemId).classList.replace("text-edited", "text-standard");
}

async function cancelConfigEdit() {
    setFields(oldValues);
    turnOffButtons();
    returnToOriginalTextStyle();
}