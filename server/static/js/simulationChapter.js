function prepareSimulationChapter(chapterEntry, iterationCounter, totalIterations) {
    const chapterId = chapterEntry["chapter_id"];
    const chapterName = chapterEntry["chapter_name"];
    const stageStatuses = chapterEntry["stage_statuses"];

    const chapterDiv = createElement("div", ["col", "justify-content-center", "text-primary"], chapterId);

    let chapterDescription = `<h3>${chapterName}</h3>`
    if (chapterName.includes("Feedback Iteration")) {
        chapterDescription = `<h3>${chapterName} (${iterationCounter}/${totalIterations})</h3>`;
        chapterDiv.setAttribute("hidden", "hidden");
    }
    chapterDiv.innerHTML = `<div class="row justify-content-center col-7-auto">${chapterDescription}</div>`;

    const simInfoDiv = document.getElementById("simulationInfo");
    simInfoDiv.appendChild(chapterDiv);

    for (const status of stageStatuses) {
        const plainStageId = status["id"];
        const stageName = status["name"];

        const stageDiv = prepareSingleStage(chapterId, plainStageId, stageName);
        chapterDiv.appendChild(stageDiv);
    }
}

function updateSimulationChapter(chapterEntry) {
    const chapterId = chapterEntry["chapter_id"];
    const stageStatuses = chapterEntry["stage_statuses"];

    let isFinished = true;
    for (const status of stageStatuses) {
        const plainStageId = status["id"];
        const stageStatus = status["status"];
        const stageId = getStageId(chapterId, plainStageId);

        if (stageStatus === "PENDING") {
            showStep(stageId);
            isFinished = false;
        } else if (stageStatus === "RUNNING") {
            showRunningStep(stageId);
            isFinished = false;
        } else if (stageStatus === "SUCCESS") {
            markStepSuccess(stageId);
        } else if (stageStatus === "ERROR") {
            markStepFailed(stageId);
            return true;
        }
    }
    return isFinished;
}

function isRenderNeeded(chapterId) {
    return !document.getElementById(chapterId);
}
