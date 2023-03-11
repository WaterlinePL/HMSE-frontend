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

function countAllFeedbackIterations(allChaptersInfo) {
    let allIterCounter = 0;
    for (const chapterEntry of allChaptersInfo) {
        if (chapterEntry["chapter_name"].includes("Feedback Iteration")) {
            ++allIterCounter;
        }
    }
    return allIterCounter;
}

function shouldShowIteration(stageStatuses) {
    for (const status of stageStatuses) {
        const stageStatus = status["status"];
        if (["RUNNING", "SUCCESS", "ERROR"].includes(stageStatus)) {
            return true;
        }
    }
    return false;
}

function showOnlyLatestIteration(allChaptersInfo) {
    let prevIterationChapterId = null, iterCounter = 0;
    for (const chapterEntry of allChaptersInfo) {
        if (chapterEntry["chapter_name"].includes("Feedback Iteration")) {
            ++iterCounter;
            const chapterId = chapterEntry["chapter_id"];
            if (shouldShowIteration(chapterEntry["stage_statuses"]) || iterCounter === 1) {
                document.getElementById(chapterId).removeAttribute("hidden");
            } else {
                return;
            }
            if (prevIterationChapterId !== null) {
                document.getElementById(prevIterationChapterId).setAttribute("hidden", "hidden");
            }
            prevIterationChapterId = chapterId;
        }
    }
}

function updateStatus(allChaptersInfo) {
    let feedbackIterCounter = 0;
    const allFeedbackIterations = countAllFeedbackIterations(allChaptersInfo);

    for (const chapterEntry of allChaptersInfo) {
        const chapterId = chapterEntry["chapter_id"];
        if (chapterEntry["chapter_name"].includes("Feedback Iteration")) {
            ++feedbackIterCounter;
        }

        if (isRenderNeeded(chapterId)) {
            prepareSimulationChapter(chapterEntry, feedbackIterCounter, allFeedbackIterations);
        }
        updateSimulationChapter(chapterEntry);
    }

    if (allFeedbackIterations > 0) {
        showOnlyLatestIteration(allChaptersInfo);
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
            // resetSimulationSteps();
            setTimeout(() => monitorStatus(projectId), 2000);   // Avoid race condition
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function updateSimulationMode(projectId) {
    const url = getEndpointForProjectId(Config.simulationMode, projectId);
    await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            simulationMode: document.getElementById("simulationMode").value
        })
    }).then(response => {
        if (response.status === 200) {
            showSuccessToast(jQuery, "Simulation mode updated");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

// const AllStagesInSimulation = [];   // Set by Jinja2