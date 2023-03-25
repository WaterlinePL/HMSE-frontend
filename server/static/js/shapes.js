function editCompleteSuccessfully(projectId, newShapeId) {
    applyNewValues(projectId, newShapeId);
    deactivateShapeEditMode(jQuery, newShapeId);
    showSuccessToast(jQuery, "Shape successfully submitted");
}

async function editShape(projectId, shapeId, newShapeId, color) {
    const url = getEndpointForProjectId(Config.editShapes, projectId);
    await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: oldShapeId,
            newShapeId: newShapeId,
            color: color
        })
    }).then(response => {
        if (response.status === 200) {
            editCompleteSuccessfully(projectId, newShapeId);
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
    await editShape(projectId, shapeId, newShapeId, color);
    await sendShapeMapping(projectId, newShapeId ?? shapeId);     // TODO: edge cases?
}

// COLOR ACCESS:
// document.getElementById("shape1ColorPicker").children[0].children[0].children[0].style.background
let oldShapeId = null;
let oldShapeColor = null;
let oldMapping = [];

function applyNewValues(projectId, newShapeId) {
    document.getElementById(getNameDivId(oldShapeId)).id = getNameDivId(newShapeId);
    document.getElementById(getShapeColorPickerName(oldShapeId)).children[0].children[0].children[0]
        .style.background = getNewColorForShape(oldShapeId);

    const colorInputField = document.getElementById(getColorInputFieldId(oldShapeId));
    colorInputField.id = getColorInputFieldId(newShapeId);
    colorInputField.setAttribute("onchange", `changeShapeColor('${newShapeId}')`);

    const hydrusSelect = document.getElementById(getHydrusSelectId(oldShapeId));
    hydrusSelect.id = getHydrusSelectId(newShapeId);
    hydrusSelect.onclick = () => setSelectOptions(newShapeId);
    hydrusSelect.onchange = () => checkForManualOption(newShapeId);

    const editButton = document.getElementById(getEditButtonName(oldShapeId));
    editButton.id = getEditButtonName(newShapeId);
    editButton.onclick = () => activateShapeEditMode(jQuery, newShapeId);

    const cancelButton = document.getElementById(getCancelButtonName(oldShapeId));
    cancelButton.id = getCancelButtonName(newShapeId);
    cancelButton.onclick = () => deactivateShapeEditMode(jQuery, newShapeId, true);

    const submitButton = document.getElementById(getSubmitButtonName(oldShapeId));
    submitButton.id = getSubmitButtonName(newShapeId);
    submitButton.onclick = () => sendShape(projectId, newShapeId);

    const removeButton = document.getElementById(getRemoveButtonName(oldShapeId));
    removeButton.id = getRemoveButtonName(newShapeId);
    removeButton.onclick = () => deleteShape(projectId, newShapeId);

    document.getElementById(getShapeColorPickerName(oldShapeId)).id = getShapeColorPickerName(newShapeId);
    document.getElementById(getListEntryName(oldShapeId)).id = getListEntryName(newShapeId);
    document.getElementById(getManualInputId(oldShapeId)).id = getManualInputId(newShapeId);

    delete ProjectConfig.shapes[oldShapeId];
    ProjectConfig.shapes[newShapeId] = getNewColorForShape(newShapeId);
}

function resetToOldValues(shapeId) {
    document.getElementById(getNameDivId(oldShapeId)).textContent = oldShapeId;
    setColorForShape(jQuery, shapeId, oldShapeColor);

    restoreOldMapping(oldShapeId);
}

function setColorForShape($, shapeId, color) {
    // Color picker input
    document.getElementById(getShapeColorPickerName(shapeId)).children[0].children[0].children[0].style.background = color;

    // Color on grid
    redrawShape(shapeId, color);

    // Color in color picker
    const colorPicker = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    colorPicker.setValue(color);
    colorPicker.update();
}

function getMappingValue(shapeId) {
    const mapping = document.getElementById(getHydrusSelectId(shapeId)).value;
    let value = null;
    if (mapping === MappingsConsts.MANUAL_RECHARGE_VALUE) {
        value = document.getElementById(getManualInputId(shapeId)).value;
    }
    return [mapping, value];
}

function restoreOldMapping(shapeId) {
    const oldSelect = oldMapping[0];
    document.getElementById(getHydrusSelectId(shapeId)).value = oldSelect;
    const manualValueInput = document.getElementById(getManualInputId(shapeId));
    if (oldSelect === MappingsConsts.MANUAL_RECHARGE_VALUE) {
        manualValueInput.value = oldMapping[1];
        manualValueInput.hidden = false;
    } else {
        manualValueInput.hidden = true;
    }
    oldMapping = [];
}

function activateShapeEditMode($, shapeId) {
    oldShapeId = shapeId;
    oldShapeColor = getNewColorForShape(shapeId);
    oldMapping = getMappingValue(shapeId);
    removeEditModeForOtherShapes();

    const cp = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    cp.enable();

    document.getElementById(getListEntryName(shapeId)).classList.toggle("edited-shape", true);
    document.getElementById(getRemoveButtonName(shapeId)).hidden = true;
    document.getElementById(getSubmitButtonName(shapeId)).hidden = false;
    document.getElementById(getCancelButtonName(shapeId)).hidden = false;
    document.getElementById(getNameDivId(shapeId)).contentEditable = "true";
    document.getElementById(getHydrusSelectId(shapeId)).disabled = false;
    document.getElementById(getManualInputId(shapeId)).disabled = false;

    setGridEditMode(true);
}

function deactivateShapeEditMode($, shapeId, resetValues = false) {
    showAllEditButtons();
    document.getElementById(getListEntryName(shapeId)).classList.toggle("edited-shape", false);
    document.getElementById(getRemoveButtonName(shapeId)).hidden = false;
    document.getElementById(getSubmitButtonName(shapeId)).hidden = true;
    document.getElementById(getCancelButtonName(shapeId)).hidden = true;
    document.getElementById(getNameDivId(shapeId)).contentEditable = "false";
    document.getElementById(getHydrusSelectId(shapeId)).disabled = true;
    document.getElementById(getManualInputId(shapeId)).disabled = true;

    if (resetValues){
        resetToOldValues(shapeId);
    }

    const cp = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    cp.disable();

    oldShapeId = oldShapeColor = null;
    setGridEditMode(false);
}

function getNewColorForShape(shapeId) {
    return document.getElementById(getShapeColorPickerName(shapeId))
                    ?.children[0].children[0].children[0]
                    .style.background;
}


async function changeShapeColor(shapeId) {
    setTimeout(() => {
        const color = getNewColorForShape(shapeId);
        if (color && shapeId in shapeIdsToMasks) {
            redrawShape(shapeId, color);
        }
    }, 50);
}


function getShapeColorPickerName(shapeId) {
    return `colorPicker${shapeId}`;
}


function getListEntryName(shapeId) {
    return `shape${shapeId}`;
}

function getCancelButtonName(shapeId) {
    return `cancelShapeEditButton${shapeId}`;
}

function getSubmitButtonName(shapeId) {
    return `submitShapeEditButton${shapeId}`;
}

function getEditButtonName(shapeId) {
    return `editShapeButton${shapeId}`;
}

function getRemoveButtonName(shapeId) {
    return `removeShapeButton${shapeId}`;
}

function getNameDivId(shapeId) {
    return `shapeName${shapeId}`;
}

function getHydrusSelectId(shapeId) {
    return `selectHydrus${shapeId}`;
}

function getManualInputId(shapeId) {
    return `manualValue${shapeId}`;
}

function getColorInputFieldId(shapeId) {
    return `colorInputField${shapeId}`;
}

function removeEditModeForOtherShapes() {
    for (const shapeId of Object.keys(ProjectConfig.shapes)) {
        document.getElementById(getEditButtonName(shapeId)).hidden = true;
    }
}

function showAllEditButtons() {
    for (const shapeId of Object.keys(ProjectConfig.shapes)) {
        const editButton = document.getElementById(getEditButtonName(shapeId));
        if (editButton) {
            editButton.hidden = false;
        }
    }
}


async function deleteShape(projectId, shapeId) {
    const url = getEndpointForProjectId(Config.editShapes, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: shapeId
        })
    }).then(response => {
        if (response.status === 200) {
            removeShape(shapeId);
            showSuccessToast(jQuery, "Shape successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

// TODO: probably not needed
function addNewListEntry($, projectId, edit = true, shapeColor = "blue", shapeId = null) {
    if (!shapeId) {
        const enterShapeName = "EnterShapeName";
        shapeId = enterShapeName;
        for (let i = 1; document.getElementById(getListEntryName(shapeId)); ++i) {
            shapeId = `${enterShapeName}${i}`;
        }
    }

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
    input.id = getColorInputFieldId(shapeId);
    input.type = "text";
    input.hidden = true;
    // createCssClassForShape(shapeId, shapeColor);
    input.setAttribute("onchange", `changeShapeColor('${shapeId}')`);
    colorPickerInputSpan.appendChild(italic);
    colorPickerInputSpan.appendChild(input);

    // Right content
    const hydrusSelectSpan = createElement("span", ["slice-column", "left"]);
    rightContent.appendChild(hydrusSelectSpan);

    const select = createElement("select", ["custom-select"], getHydrusSelectId(shapeId));
    select.onclick = () => setSelectOptions(shapeId);
    select.onchange = () => checkForManualOption(shapeId);
    select.disabled = true;
    hydrusSelectSpan.appendChild(select);

    const noValOpt = createOption(MappingsConsts.NO_RECHARGE_VALUE);
    noValOpt.selected = true;
    select.appendChild(noValOpt);

    const manualValInput = createElement("input", ["form-control", "input-lg"], getManualInputId(shapeId));
    manualValInput.type = "number";
    manualValInput.hidden = true;
    manualValInput.disabled = true;
    manualValInput.value = 0;
    hydrusSelectSpan.appendChild(manualValInput);

    // Right buttons
    const removeButton = createButtonWithoutFunction(getRemoveButtonName(shapeId), "btn-danger", "Remove");
    removeButton.onclick = () => deleteShape(projectId, shapeId);
    rightContent.appendChild(removeButton);

    const editButton = createButtonWithoutFunction(getEditButtonName(shapeId), "btn-secondary", "Edit");
    editButton.onclick = () => activateShapeEditMode(jQuery, shapeId);
    rightContent.appendChild(editButton);

    const cancelButton = createButtonWithoutFunction(getCancelButtonName(shapeId), "btn-danger", "Cancel");
    if (edit) {
        cancelButton.onclick = () => removeTemporaryShape(shapeId);
    } else {
        cancelButton.onclick = () => deactivateShapeEditMode(jQuery, shapeId, true);
    }
    cancelButton.hidden = true;
    rightContent.appendChild(cancelButton);

    const submitButton = createButtonWithoutFunction(getSubmitButtonName(shapeId), "btn-success", "Submit");
    submitButton.onclick = () => sendShape(projectId, shapeId);
    submitButton.hidden = true;
    rightContent.appendChild(submitButton);

    const shapeList = document.getElementById("shapeList");
    const newShapeListEntry = document.getElementById("newShape");
    shapeList.insertBefore(listEntry, newShapeListEntry);

    $(`#${getShapeColorPickerName(shapeId)}`).colorpicker({"color": shapeColor,
                                                            useAlpha: false});
    deactivateShapeEditMode(jQuery, shapeId);
    if (edit) {
        editButton.hidden = true;
        activateShapeEditMode(jQuery, shapeId);
    }
}

function removeTemporaryShape(shapeId) {
    deactivateShapeEditMode(jQuery, shapeId, true);
    document.getElementById(getListEntryName(shapeId)).remove();
}


function setSelectOptions(shapeId) {
    const hydrusSelect = document.getElementById(getHydrusSelectId(shapeId));
    const currentOptions = [];
    for (const child of hydrusSelect.children) {
        currentOptions.push(child.value);
    }

    const options = [MappingsConsts.NO_RECHARGE_VALUE, MappingsConsts.MANUAL_RECHARGE_VALUE].concat(ProjectConfig.hydrusModels);
    if (arrayEquals(currentOptions, options)) {
        return;
    }
    [options[0], options[1]] = [options[1], options[0]];

    const htmlOptions = [];
    options.forEach(opt => htmlOptions.push(createOption(opt)));
    htmlOptions[0].selected = true;

    let child = hydrusSelect.lastElementChild;
    while (child) {
        hydrusSelect.removeChild(child);
        child = hydrusSelect.lastElementChild;
    }

    htmlOptions.forEach(opt => hydrusSelect.appendChild(opt));
}

function checkForManualOption(shapeId) {
    const select = document.getElementById(getHydrusSelectId(shapeId));
    document.getElementById(getManualInputId(shapeId)).hidden = select.value !== MappingsConsts.MANUAL_RECHARGE_VALUE;
}