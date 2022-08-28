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
        oldValues[elementId] = element.textContent;
        element.contentEditable = true;
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
        "projectName": document.getElementById("metadataProjectName").textContent.trim(),
        "startDate": document.getElementById("metadataStartDate").textContent.trim(),
        "endDate": document.getElementById("metadataEndDate").textContent.trim(),
        "lat": document.getElementById("metadataLat").textContent.trim(),
        "long": document.getElementById("metadataLong").textContent.trim(),
        "spinUp": document.getElementById("metadataSpinUp").textContent.trim()
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
            } else {
                // Alert with toast
            }
        });
}


async function setFields(valuesDict) {
    for (const [i, newValue] of Object.entries(Object.values(valuesDict))) {
        const elemId = configElementIds[i];
        const oldVal = Object.values(oldValues)[i];
        var elem = document.getElementById(elemId);
        elem.textContent = newValue;

        if (oldVal == newValue) {
            resetSingleElement(elemId);
        } else {
            elem.classList.replace("text-edited", "text-updated");
            setTimeout(() => document.getElementById(elemId).classList.replace("text-updated", "text-standard"), 1500);
        }
        elem.contentEditable = false;
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