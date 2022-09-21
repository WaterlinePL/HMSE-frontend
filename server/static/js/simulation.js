function resetStep(elemId) {
    document.getElementById(elemId).hidden = true;
    document.getElementById(`${elemId}Spinner`).hidden = false;
    document.getElementById(`${elemId}Tick`).setAttribute("hidden", "hidden");
    document.getElementById(`${elemId}X`).setAttribute("hidden", "hidden");
}

function resetSimulationSteps() {
    AllStagesInSimulation.forEach(stepId => resetStep(stepId));
}


function markStepSuccess(elemId) {
    showStep(elemId);
    document.getElementById(`${elemId}Spinner`).hidden = true;
    document.getElementById(`${elemId}Tick`).removeAttribute("hidden");
    document.getElementById(`${elemId}X`).setAttribute("hidden", "hidden");
}

function markStepFailed(elemId) {
    showStep(elemId);
    document.getElementById(`${elemId}Spinner`).hidden = true;
    document.getElementById(`${elemId}Tick`).setAttribute("hidden", "hidden");
    document.getElementById(`${elemId}X`).removeAttribute("hidden");
}

function showStep(elemId) {
    document.getElementById(elemId).hidden = false;
    document.getElementById(`${elemId}Spinner`).hidden = true;
}

function showRunningStep(elemId) {
    document.getElementById(elemId).hidden = false;
    document.getElementById(`${elemId}Spinner`).hidden = false;
}

function updateStatus(statusResponse) {
    var isFinished = true;
    for (const [stepId, status] of Object.entries(statusResponse)) {
        if (status === "PENDING") {
            showStep(stepId);
            isFinished = false;
        } else if (status === "RUNNING") {
            showRunningStep(stepId);
            isFinished = false;
        } else if (status === "SUCCESS") {
            markStepSuccess(stepId);
        } else if (status === "ERROR") {
            markStepFailed(stepId);
            return true;
        }
    }
    return isFinished;
}

async function getSimulationStatus(projectId) {
    const url = getEndpointForProjectId(Config.simulation, projectId);
    return await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(statusResponse => {
                return updateStatus(statusResponse);
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function monitorStatus(projectId) {
    const isFinished = await getSimulationStatus(projectId);
    if (!isFinished) {
        setTimeout(() => monitorStatus(projectId), 2000);
    } else {
        document.getElementById("downloadProjectBtn").hidden = false;
    }
}

async function runSimulation(projectId) {
    document.getElementById("downloadProjectBtn").hidden = true;
    const url = getEndpointForProjectId(Config.simulation, projectId);
    await fetch(url, {
        method: "POST"
    }).then(response => {
        if (response.status === 200) {
            showSuccessToast(jQuery, "Simulation started");
            resetSimulationSteps();
            setTimeout(() => monitorStatus(projectId), 2000);   // Avoid race condition
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


const AllStagesInSimulation = [];   // Set by Jinja2