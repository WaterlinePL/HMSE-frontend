function prepareSingleStage(chapterId, plainStageId, stageDescription) {
    const stageId = getStageId(chapterId, plainStageId);
    const mainDiv = createElement("div", ["row", "justify-content-center", "text-secondary"], stageId);
    mainDiv.hidden = true;

    const subDiv = createElement("div", ["col-7-auto"]);
    subDiv.innerHTML = stageDescription;
    subDiv.appendChild(spinnerElement(stageId));
    subDiv.appendChild(tickElement(stageId));
    subDiv.appendChild(xMarkElement(stageId));
    mainDiv.appendChild(subDiv);
    return mainDiv;
}

function getStageId(chapterId, plainStageId) {
    return `${chapterId}_${plainStageId}`;
}


function spinnerElement(stageId) {
    const spinnerDiv = createElement("div", ["spinner-border"], getSpinnerName(stageId));
    spinnerDiv.role = "status";

    const spinnerSpan = createElement("span", ["sr-only"]);
    spinnerSpan.text = "Loading...";
    spinnerDiv.appendChild(spinnerSpan);
    return spinnerDiv;
}

function tickElement(stageId) {
    const svg = createSVGElem("svg", ["bi", "bi-check"], getSuccessfulTickName(stageId));
    svg.setAttribute("hidden", "hidden");
    svg.setAttribute("height", "25");
    svg.setAttribute("width", "25");
    svg.setAttribute("fill", "green");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = createSVGElem("path", []);
    path.setAttribute("d", "M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z");

    svg.appendChild(path);
    return svg;
}

function xMarkElement(stageId) {
    const svg = createSVGElem("svg", [], getFailedXMarkName(stageId));
    svg.setAttribute("hidden", "hidden");
    svg.setAttribute("height", "25");
    svg.setAttribute("width", "25");

    const line1 = createSVGElem("line", []);
    line1.setAttribute("x1", "7");
    line1.setAttribute("y1", "7");
    line1.setAttribute("x2", "18");
    line1.setAttribute("y2", "18");
    line1.setAttribute("style", "stroke:rgb(255,0,0); stroke-width:2");
    svg.appendChild(line1);

    const line2 = createSVGElem("line", []);
    line2.setAttribute("x1", "18");
    line2.setAttribute("y1", "7");
    line2.setAttribute("x2", "7");
    line2.setAttribute("y2", "18");
    line2.setAttribute("style", "stroke:rgb(255,0,0); stroke-width:2");
    svg.appendChild(line2);

    return svg;
}
