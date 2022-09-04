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
    var is_finished = true;
    for (const [stepId, status] of Object.entries(statusResponse)) {
        if (status === "PENDING") {
            showStep(stepId);
            is_finished = false;
        } else if (status === "RUNNING") {
            showRunningStep(stepId);
            is_finished = false;
        } else if (status === "SUCCESS") {
            markStepSuccess(stepId);
        } else if (status === "ERROR") {
            markStepFailed(stepId);
            return true;
        }
    }
    return is_finished;
}

async function getSimulationStatus(projectId) {
    const url = getEndpointForProjectId(Config.simulation, projectId);
    var is_finished = false;
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            response.json().then(statusResponse => {
                is_finished = updateStatus(statusResponse);
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
    return is_finished;
}

async function monitorStatus(projectId) {
    const is_finished = await getSimulationStatus();
    if (!is_finished) {
        setTimeout(() => monitorStatus(projectId), 2000);
    }
}

async function runSimulation(projectId) {
    const url = getEndpointForProjectId(Config.simulation, projectId);
    await fetch(url, {
        method: "POST"
    }).then(response => {
        if (response.status === 200) {
            showSuccessToast(jQuery, "Simulation started");
            resetSimulationSteps();
            monitorStatus(projectId);
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


const AllStagesInSimulation = [];   // Set by Jinja2