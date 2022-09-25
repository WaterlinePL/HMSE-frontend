// MODFLOW
var oldModflowValues = {};

const modflowConfigElementIdMapping = {
    "startDate": "metadataStartDate",
    "lat": "metadataLat",
    "long": "metadataLong",
    "endDate": "metadataEndDate"
};

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
            response.json().then(data => {
                setFields(data, modflowConfigElementIdMapping, oldModflowValues);
                switchButtonsVisibility(modflowEditModeBtnIds, modflowDefaultModeBtnIds)
                showSuccessToast(jQuery, "Project configuration successfully updated");
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

function enterModflowEditMode() {
    enterEditMode(modflowConfigElementIdMapping, oldModflowValues, modflowDefaultModeBtnIds, modflowEditModeBtnIds);
}

function cancelModflowConfigEdit() {
    cancelConfigEdit(oldModflowValues, modflowConfigElementIdMapping, modflowEditModeBtnIds, modflowDefaultModeBtnIds);
}


// HYDRUS

var oldHydrusValues = {};

const hydrusConfigElementIdMapping = {
    "spinUp": "metadataSpinUp"
};

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
            setFields(requestData, hydrusConfigElementIdMapping, oldHydrusValues);
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
    enterEditMode(hydrusConfigElementIdMapping, oldHydrusValues, hydrusDefaultModeBtnIds, hydrusEditModeBtnIds);
}

function cancelHydrusConfigEdit() {
    cancelConfigEdit(oldHydrusValues, hydrusConfigElementIdMapping, hydrusEditModeBtnIds, hydrusDefaultModeBtnIds);
}


// PROJECT
async function submitNewProjectName(projectId) {
    const requestData = {
        "projectName": document.getElementById("renameProjectField").value.trim()
    }

    const url = getEndpointForProjectId(Config.project, projectId);
    await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestData)
    }).then(response => {
        if (response.status === 200) {
            updateProjectName(requestData["projectName"]);
            showSuccessToast(jQuery, "Project configuration successfully updated");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

function updateProjectName(newProjectName) {
    document.getElementById("projectNameDisplay").textContent = `Simulation for project: ${newProjectName}`;
}

// PRIVATE

// TODO: Validation
function enterEditMode(configElementIdMapping, oldValuesContainer, hideBtnIds, showBtnIds) {
    this.hidden = true;
    Object.entries(configElementIdMapping).forEach(mapping => {
        [fieldName, elementId] = mapping;
        var element = document.getElementById(elementId);
        if (fieldName !== "endDate") {
            oldValuesContainer[fieldName] = element.value;
        } else {
            oldValuesContainer[fieldName] = element.textContent;
        }
        element.disabled = false;
        element.classList.replace("text-standard", "text-old");
    });
    switchButtonsVisibility(hideBtnIds, showBtnIds);
}

function changeColorToUpdated(id) {
    document.getElementById(id).classList.replace("text-old", "text-edited");
}

function setFields(valuesDict, configElementIdMapping, oldValuesContainer) {
    for (const [fieldName, newValue] of Object.entries(valuesDict)) {
        const elemId = configElementIdMapping[fieldName];
        const oldVal = oldValuesContainer[fieldName];
        var elem = document.getElementById(elemId);
        elem.value = newValue;

        if (fieldName === "endDate") {
            elem.textContent = newValue;
        }

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

function returnToOriginalTextStyle(configElementIdMapping) {
    Object.values(configElementIdMapping).forEach(elemId => resetSingleElement(elemId));
}


function resetSingleElement(elemId) {
    document.getElementById(elemId).classList.replace("text-old", "text-standard");
    document.getElementById(elemId).classList.replace("text-edited", "text-standard");
}

function cancelConfigEdit(oldValuesContainer, configElementIdMapping, hideBtnIds, showBtnIds) {
    setFields(oldValuesContainer, configElementIdMapping, oldValuesContainer);
    switchButtonsVisibility(hideBtnIds, showBtnIds);
    returnToOriginalTextStyle(configElementIdMapping);
}