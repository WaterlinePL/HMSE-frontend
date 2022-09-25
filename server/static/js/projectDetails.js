// MODFLOW
var oldModflowValues = {};

const modflowConfigElementIds = [
    "metadataStartDate",
    "metadataEndDate",
    "metadataLat",
    "metadataLong"
];

const modflowEditModeBtnIds = [
    "modflowSubmitConfigDetails",
    "modflowCancelConfigDetails"
]

const modflowDefaultModeBtnIds = [
    "modflowEditConfigDetails",
    "modflowUploadBtn",
    "modflowRemoveBtn"
]

async function submitModflowConfigDetails(projectId) {
    const requestData = {
        "startDate": document.getElementById("metadataStartDate").value.trim(),
        "endDate": document.getElementById("metadataEndDate").value.trim(),
        "lat": document.getElementById("metadataLat").value.trim(),
        "long": document.getElementById("metadataLong").value.trim()
    }

    const url = getEndpointForProjectId(Config.projectManageModflow, projectId);
    await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestData)
    }).then(response => {
        if (response.status === 200) {
            setFields(requestData, modflowConfigElementIds, oldModflowValues);
            switchButtonsVisibility(modflowEditModeBtnIds, modflowDefaultModeBtnIds)
            showSuccessToast(jQuery, "Project configuration successfully updated");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

function enterModflowEditMode() {
    console.log("MEWO");
    enterEditMode(modflowConfigElementIds, oldModflowValues, modflowDefaultModeBtnIds, modflowEditModeBtnIds);
}

function cancelModflowConfigEdit() {
    cancelConfigEdit(oldModflowValues, modflowConfigElementIds, modflowEditModeBtnIds, modflowDefaultModeBtnIds);
}


// HYDRUS

var oldHydrusValues = {};

const hydrusConfigElementIds = [
    "metadataSpinUp"
];

const hydrusEditModeBtnIds = [
    "hydrusSubmitConfigDetails",
    "hydrusCancelConfigDetails"
]

const hydrusDefaultModeBtnIds = [
    "hydrusEditConfigDetails"
]

async function submitHydrusConfigDetails(projectId) {
    const requestData = {
        "spinUp": document.getElementById("metadataSpinUp").value.trim()
    }

    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);
    await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestData)
    }).then(response => {
        if (response.status === 200) {
            setFields(requestData, hydrusConfigElementIds, oldHydrusValues);
            switchButtonsVisibility(hydrusEditModeBtnIds, hydrusDefaultModeBtnIds)
            showSuccessToast(jQuery, "Project configuration successfully updated");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


function enterHydrusEditMode() {
    enterEditMode(hydrusConfigElementIds, oldHydrusValues, hydrusDefaultModeBtnIds, hydrusEditModeBtnIds);
}

function cancelHydrusConfigEdit() {
    cancelConfigEdit(oldHydrusValues, hydrusConfigElementIds, hydrusEditModeBtnIds, hydrusDefaultModeBtnIds);
}



// PRIVATE

// TODO: Validation
function enterEditMode(configElementIds, oldValuesContainer, hideBtnIds, showBtnIds) {
    this.hidden = true;
    configElementIds.forEach(elementId => {
        var element = document.getElementById(elementId);
        oldValuesContainer[elementId] = element.value;
        element.disabled = false;
        element.classList.replace("text-standard", "text-old");
    });
    switchButtonsVisibility(hideBtnIds, showBtnIds);
}

function changeColorToUpdated(id) {
    document.getElementById(id).classList.replace("text-old", "text-edited");
}

function setFields(valuesDict, configElementIds, oldValuesContainer) {
    for (const [i, newValue] of Object.entries(Object.values(valuesDict))) {
        const elemId = configElementIds[i];
        const oldVal = Object.values(oldValuesContainer)[i];
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
    oldValuesContainer = {};
}

function switchButtonsVisibility(hideBtnIds, showBtnIds) {
    hideBtnIds.forEach(btnId => {
        document.getElementById(btnId).hidden = true;
    });
    showBtnIds.forEach(btnId => {
        document.getElementById(btnId).hidden = false;
    });
}

function returnToOriginalTextStyle(configElementIds) {
    configElementIds.forEach(elemId => resetSingleElement(elemId));
}


function resetSingleElement(elemId) {
    document.getElementById(elemId).classList.replace("text-old", "text-standard");
    document.getElementById(elemId).classList.replace("text-edited", "text-standard");
}

function cancelConfigEdit(oldValuesContainer, configElementIds, hideBtnIds, showBtnIds) {
    setFields(oldValuesContainer, configElementIds, oldValuesContainer);
    switchButtonsVisibility(hideBtnIds, showBtnIds);
    returnToOriginalTextStyle(configElementIds);
}