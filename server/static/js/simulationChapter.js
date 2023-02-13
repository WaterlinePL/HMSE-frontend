function prepareSimulationChapter(chapterEntry, chapterNum, totalChapters) {
    const chapterId = chapterEntry["chapter_id"];
    const chapterName = chapterEntry["chapter_name"];
    const stageStatuses = chapterEntry["stage_statuses"];

    const chapterDiv = createElement("div", ["row", "justify-content-center", "text-primary"], chapterId);
    chapterDiv.innerHTML = totalChapters === 1 ?
        `<h3>${chapterName}</h3>` : `<h3>Step ${chapterNum}: ${chapterName}</h3>`;

    const simInfoDiv = document.getElementById("simulationInfo");
    simInfoDiv.appendChild(chapterDiv);

    for (const status of stageStatuses) {
        const plainStageId = status["id"];
        const stageName = status["name"];

        const stageDiv = prepareSingleStage(chapterId, plainStageId, stageName);
        simInfoDiv.appendChild(stageDiv);
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
