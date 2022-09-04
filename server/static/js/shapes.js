async function manualShape(projectId, shapeId, newShapeId, color, shapeMask) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "put",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: oldShapeId,
            newShapeId: newShapeId,
            color: color,
            shapeMask: shapeMask
        })
    }).then(response => {
        if (response.status === 200) {
            // TODO: add shape to grid and list
            applyNewValues(projectId, newShapeId);
            deactivateShapeEditMode(jQuery, newShapeId);
            showSuccessToast(jQuery, "Shape successfully created")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function sendShape(projectId, shapeId) {
    const newShapeId = document.getElementById(getNameDivId(oldShapeId)).textContent;
    const color = getNewColorForShape(shapeId);
    const shapeMask = {};   // TODO: when drawing to sth with that
    // TODO: apply mapping in another request?
    manualShape(projectId, shapeId, newShapeId, color, shapeMask);
}

// COLOR ACCESS:
// document.getElementById("shape1ColorPicker").children[0].children[0].children[0].style.background

var oldShapeId = null, oldShapeColor = null;

function applyNewValues(projectId, newShapeId) {
    document.getElementById(getNameDivId(oldShapeId)).id = getNameDivId(newShapeId);
    document.getElementById(getHydrusSelectId(oldShapeId)).id = getHydrusSelectId(newShapeId);

    var editButton = document.getElementById(getEditButtonName(oldShapeId));
    editButton.id = getEditButtonName(newShapeId);
    editButton.onclick = () => activateShapeEditMode(jQuery, newShapeId);

    var cancelButton = document.getElementById(getCancelButtonName(oldShapeId));
    cancelButton.id = getCancelButtonName(newShapeId);
    cancelButton.onclick = () => deactivateShapeEditMode(jQuery, newShapeId, true);

    var submitButton = document.getElementById(getSubmitButtonName(oldShapeId));
    submitButton.id = getSubmitButtonName(newShapeId);
    submitButton.onclick = () => sendShape(projectId, newShapeId);

    var removeButton = document.getElementById(getRemoveButtonName(oldShapeId));
    removeButton.id = getRemoveButtonName(newShapeId);
    removeButton.onclick = () => deleteShape(projectId, newShapeId);

    document.getElementById(getShapeColorPickerName(oldShapeId)).id = getShapeColorPickerName(newShapeId);
    document.getElementById(getListEntryName(oldShapeId)).id = getListEntryName(newShapeId);

    delete ProjectConfig.shapes[oldShapeId];
    ProjectConfig.shapes[newShapeId] = getNewColorForShape(newShapeId);
}

function resetToOldValues() {
    console.log(oldShapeId);
    console.log(oldShapeColor);
    document.getElementById(getNameDivId(oldShapeId)).textContent = oldShapeId;
    document.getElementById(getShapeColorPickerName(oldShapeId)).children[0].children[0].children[0].style.background = oldShapeColor;
}

function activateShapeEditMode($, shapeId) {
    oldShapeId = shapeId;
    oldShapeColor = getNewColorForShape(shapeId);
    removeEditModeForOtherShapes(shapeId);

    var cp = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    cp.enable();

    document.getElementById(getListEntryName(shapeId)).classList.toggle("edited-shape", true);
    document.getElementById(getRemoveButtonName(shapeId)).hidden = true;
    document.getElementById(getSubmitButtonName(shapeId)).hidden = false;
    document.getElementById(getCancelButtonName(shapeId)).hidden = false;
    document.getElementById(getNameDivId(shapeId)).contentEditable = true;
    document.getElementById(getHydrusSelectId(shapeId)).disabled = false;
    document.getElementById(getManualInputId(shapeId)).disabled = false;
    setGridEditMode(true);
}

function deactivateShapeEditMode($, shapeId, resetValues = false) {
    showAllEditButtons();
    var cp = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    cp.disable();

    document.getElementById(getListEntryName(shapeId)).classList.toggle("edited-shape", false);
    document.getElementById(getRemoveButtonName(shapeId)).hidden = false;
    document.getElementById(getSubmitButtonName(shapeId)).hidden = true;
    document.getElementById(getCancelButtonName(shapeId)).hidden = true;
    document.getElementById(getNameDivId(shapeId)).contentEditable = false;
    document.getElementById(getHydrusSelectId(shapeId)).disabled = true;
    document.getElementById(getManualInputId(shapeId)).disabled = true;


    if (resetValues){
        resetToOldValues()
    }
    oldShapeId = oldShapeColor = null;
    setGridEditMode(false);
}

function getNewColorForShape(shapeId) {
    return document.getElementById(getShapeColorPickerName(shapeId))
                    .children[0].children[0].children[0]
                    .style.background;
}


function changeShapeColor(shapeId) {
    var style = document.getElementById(getCssClassNameForShape(shapeId));
    const color = getNewColorForShape(shapeId);
    if (color) {
        style.innerHTML = `.${getCssClassNameForShape(shapeId)} { background: ${color}}`
    }
}


function createCssClassForShape(shapeId, color) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = getCssClassNameForShape(shapeId);
    style.innerHTML = `.${getCssClassNameForShape(shapeId)} { background: ${color}}`
    document.getElementsByTagName('head')[0].appendChild(style);
}

function getCssClassNameForShape(shapeId) {
    return `${shapeId}ColorCls`
}

function getShapeColorPickerName(shapeId) {
    return `${shapeId}ColorPicker`;
}


function getListEntryName(shapeId) {
    return `shape${shapeId}`;
}

function getCancelButtonName(shapeId) {
    return `${shapeId}CancelShapeEditButton`;
}

function getSubmitButtonName(shapeId) {
    return `${shapeId}SubmitShapeEditButton`;
}

function getEditButtonName(shapeId) {
    return `${shapeId}EditShapeButton`;
}

function getRemoveButtonName(shapeId) {
    return `${shapeId}RemoveShapeButton`;
}

function getNameDivId(shapeId) {
    return `${shapeId}ShapeName`;
}

function getHydrusSelectId(shapeId) {
    return `${shapeId}SelectHydrus`;
}

function getManualInputId(shapeId) {
    return `${shapeId}ManualValue`;
}

function removeEditModeForOtherShapes() {
    for (const shapeId of Object.keys(ProjectConfig.shapes)) {
        document.getElementById(getEditButtonName(shapeId)).hidden = true;
    }
    document.getElementById("newShape").hidden = true;
}

function showAllEditButtons() {
    for (const shapeId of Object.keys(ProjectConfig.shapes)) {
        const editButton = document.getElementById(getEditButtonName(shapeId));
        if (editButton) {
            editButton.hidden = false;
        }
    }
    const newShapeSection = document.getElementById("newShape");
    if (newShapeSection) {
        newShapeSection.hidden = false;
    }
}


async function deleteShape(projectId, shapeId) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: shapeId
        })
    }).then(response => {
        if (response.status === 200) {
            // TODO: remove shape from grid
            document.getElementById(getListEntryName(shapeId)).remove();
            showSuccessToast(jQuery, "Shape successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function deleteAllRchShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "DELETE"
    }).then(response => {
        if (response.status === 200) {
            // TODO: remove RCH shapes from grid and list
            showSuccessToast(jQuery, "All RCH shapes successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

async function rchShapes(projectId) {
    const url = getEndpointForProjectId(Config.rchShapes, projectId);
    await fetch(url, {
        method: "PUT"
    }).then(response => {
        if (response.status === 200) {
            // TODO: add new shapes to grid and list
            showSuccessToast(jQuery, "RCH shapes successfully generated")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


function addNewListEntry($, projectId) {
    const shapeId = "EnterShapeName";
    const listEntry = createEmptyListEntry(getListEntryName(shapeId));
    const leftContent = createElement("div", ["slice-column", "left"]);
    const rightContent = createElement("span", ["slice-column", "right"]);
    listEntry.appendChild(leftContent);
    listEntry.appendChild(rightContent);

    // Left content
    const shapeNameDiv = createElement("div", ["slice-column", "left"], getNameDivId(shapeId));
    shapeNameDiv.textContent = shapeId;
    const outerColorDiv = createElement("div", ["slice-column", "left"]);
    leftContent.appendChild(shapeNameDiv);
    leftContent.appendChild(outerColorDiv);

    const colorPickerDiv = createElement("div", ["slice-column", "left"], getShapeColorPickerName(shapeId));
    outerColorDiv.appendChild(colorPickerDiv);

    const inputGroupSpan = createElement("span", ["input-group-append"]);
    colorPickerDiv.appendChild(inputGroupSpan);

    const colorPickerInputSpan = createElement("span", ["input-group-text", "colorpicker-input-addon"]);
    inputGroupSpan.appendChild(colorPickerInputSpan);

    const italic = document.createElement("i");
    const input = createElement("input", ["form-control", "input-lg"]);
    input.type = "text";
    input.hidden = true;
    createCssClassForShape(shapeId, "blue");
    input.onchange = () => changeShapeColor(shapeId);
    colorPickerInputSpan.appendChild(italic);
    colorPickerInputSpan.appendChild(input);

    // Right content
    const hydrusSelectSpan = createElement("span", ["slice-column", "left"]);
    rightContent.appendChild(hydrusSelectSpan);

    const select = createElement("select", ["custom-select"], getHydrusSelectId(shapeId));
    select.onclick = () => setSelectOptions(shapeId);
    select.disabled = true;
    hydrusSelectSpan.appendChild(select);

    const noValOpt = createOption("[No value]");
    noValOpt.selected = true;
    select.appendChild(noValOpt);

    // Right buttons
    const removeButton = createButtonWithoutFunction(getRemoveButtonName(shapeId), "btn-danger", "Remove");
    removeButton.onclick = () => deleteShape(projectId, shapeId);
    rightContent.appendChild(removeButton);

    const editButton = createButtonWithoutFunction(getEditButtonName(shapeId), "btn-secondary", "Edit");
    editButton.onclick = () => activateShapeEditMode(jQuery, shapeId);
    editButton.hidden = true;
    rightContent.appendChild(editButton);

    const cancelButton = createButtonWithoutFunction(getCancelButtonName(shapeId), "btn-danger", "Cancel");
    cancelButton.onclick = () => removeTemporaryShape(shapeId);
    cancelButton.hidden = true;
    rightContent.appendChild(cancelButton);

    const submitButton = createButtonWithoutFunction(getSubmitButtonName(shapeId), "btn-success", "Submit");
    submitButton.onclick = () => sendShape(projectId, shapeId);
    submitButton.hidden = true;
    rightContent.appendChild(submitButton);

    const shapeList = document.getElementById("shapeList");
    const newShapeListEntry = document.getElementById("newShape");
    shapeList.insertBefore(listEntry, newShapeListEntry);

    $(`#${getShapeColorPickerName(shapeId)}`).colorpicker({"color": "blue",
                                                            useAlpha: false});
    deactivateShapeEditMode(jQuery, shapeId);
    activateShapeEditMode(jQuery, shapeId);
}

function removeTemporaryShape(shapeId) {
    deactivateShapeEditMode(jQuery, shapeId, true);
    document.getElementById(getListEntryName(shapeId)).remove();
}

function setSelectOptions(shapeId) {
    const options = ["[No value]", "[Manual value]"].concat(ProjectConfig.hydrusModels);
    const htmlOptions = [];
    options.forEach(opt => htmlOptions.push(createOption(opt)));
    htmlOptions[0].selected = true;

    const hydrusSelect = document.getElementById(getHydrusSelectId(shapeId));
    var child = hydrusSelect.lastElementChild;
    while (child) {
        hydrusSelect.removeChild(child);
        child = hydrusSelect.lastElementChild;
    }

    htmlOptions.forEach(opt => hydrusSelect.appendChild(opt));
}

function checkForManualOption(shapeId) {
    const select = document.getElementById(getHydrusSelectId(shapeId));

    if (select.value === "[Manual value]") {
        document.getElementById(getManualInputId(shapeId)).hidden = false;
    }
}