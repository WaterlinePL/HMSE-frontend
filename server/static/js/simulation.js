function resetStep(elemId) {
    document.getElementById(elemId).hidden = true;
    document.getElementById(getSpinnerName(elemId)).hidden = false;
    document.getElementById(getSuccessfulTickName(elemId)).setAttribute("hidden", "hidden");
    document.getElementById(getFailedXMarkName(elemId)).setAttribute("hidden", "hidden");
}

function resetSimulationSteps() {
    AllStagesInSimulation.forEach(stepId => resetStep(stepId));
}

function getSpinnerName(stageId) {
    return `spinner${stageId}`;
}

function getSuccessfulTickName(stageId) {
    return `tick${stageId}`;
}


function getFailedXMarkName(stageId) {
    return `X${stageId}`;
}



function markStepSuccess(elemId) {
    showStep(elemId);
    document.getElementById(getSpinnerName(elemId)).hidden = true;
    document.getElementById(getSuccessfulTickName(elemId)).removeAttribute("hidden");
    document.getElementById(getFailedXMarkName(elemId)).setAttribute("hidden", "hidden");
}

function markStepFailed(elemId) {
    showStep(elemId);
    document.getElementById(getSpinnerName(elemId)).hidden = true;
    document.getElementById(getSuccessfulTickName(elemId)).setAttribute("hidden", "hidden");
    document.getElementById(getFailedXMarkName(elemId)).removeAttribute("hidden");
}

function showStep(elemId) {
    document.getElementById(elemId).hidden = false;
    document.getElementById(getSpinnerName(elemId)).hidden = true;
}

function showRunningStep(elemId) {
    document.getElementById(elemId).hidden = false;
    document.getElementById(getSpinnerName(elemId)).hidden = false;
}

function updateStatus(allChaptersInfo) {
    let i = 1;
    for (const chapterEntry of allChaptersInfo) {
        const chapterId = chapterEntry["chapter_id"];
        if (isRenderNeeded(chapterId)) {
            prepareSimulationChapter(chapterEntry, i++, allChaptersInfo.length);
        }
        updateSimulationChapter(chapterEntry);
    }
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