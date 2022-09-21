async function manualShape(projectId, shapeId, newShapeId, color, shapeMask) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: oldShapeId,
            newShapeId: newShapeId,
            color: color,
            shapeMask: shapeMask
        })
    }).then(response => {
        if (response.status === 200) {
            // TODO: Extract to another function
            applyNewValues(projectId, newShapeId);
            deactivateShapeEditMode(jQuery, newShapeId);
            showSuccessToast(jQuery, "Shape successfully submitted")
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
    const shapeMask = getShapeMask(getCssClassNameForShape(shapeId));
    await manualShape(projectId, shapeId, newShapeId, color, shapeMask);
    sendShapeMapping(projectId, newShapeId ? newShapeId : shapeId);     // TODO: edge cases?
}

// COLOR ACCESS:
// document.getElementById("shape1ColorPicker").children[0].children[0].children[0].style.background

var oldShapeId = null, oldShapeColor = null;
var oldMask = null, oldMapping = [];

function applyNewValues(projectId, newShapeId) {
    document.getElementById(getNameDivId(oldShapeId)).id = getNameDivId(newShapeId);

    const oldClassName = getCssClassNameForShape(oldShapeId), newClassName = getCssClassNameForShape(newShapeId);
    var colorClass = document.getElementById(oldClassName);
    const color = getNewColorForShape(oldShapeId);
    const oldMask = getShapeMask(oldClassName);
    applyMask(oldMask, oldClassName, false);

    colorClass.id = newClassName;
    colorClass.innerHTML = `.${newClassName} { background: ${color}}`
    document.getElementById(getShapeColorPickerName(oldShapeId)).children[0].children[0].children[0].style.background = color;
    applyMask(oldMask, newClassName, true);

    var colorInputField = document.getElementById(getColorInputFieldId(oldShapeId));
    colorInputField.id = getColorInputFieldId(newShapeId);
    colorInputField.setAttribute("onchange", `changeShapeColor('${newShapeId}')`);

    var hydrusSelect = document.getElementById(getHydrusSelectId(oldShapeId));
    hydrusSelect.id = getHydrusSelectId(newShapeId);
    hydrusSelect.onclick = () => setSelectOptions(newShapeId);
    hydrusSelect.onchange = () => checkForManualOption(newShapeId);

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
    document.getElementById(getManualInputId(oldShapeId)).id = getManualInputId(newShapeId);

    delete ProjectConfig.shapes[oldShapeId];
    ProjectConfig.shapes[newShapeId] = getNewColorForShape(newShapeId);
}

function resetToOldValues(shapeId) {
    const shapeClass = getCssClassNameForShape(oldShapeId);
    document.getElementById(getNameDivId(oldShapeId)).textContent = oldShapeId;
    setColorForShape(jQuery, shapeId, oldShapeColor);

    restoreOldMapping(oldShapeId);
    cancelGridModification(oldMask, shapeClass);
}

function setColorForShape($, shapeId, color) {
    // Color picker input
    document.getElementById(getShapeColorPickerName(shapeId)).children[0].children[0].children[0].style.background = color;

    // Color on grid
    document.getElementById(getCssClassNameForShape(shapeId)).innerHTML = `.${getCssClassNameForShape(shapeId)} { background: ${color}}`

    // Color in color picker
    var colorPicker = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    colorPicker.setValue(color);
    colorPicker.update();
}

function getMappingValue(shapeId) {
    const mapping = document.getElementById(getHydrusSelectId(shapeId)).value;
    var value = null;
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
    oldMask = getShapeMask(getCssClassNameForShape(shapeId));
    oldMapping = getMappingValue(shapeId);
    removeEditModeForOtherShapes();

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
    setupGridSettings(jQuery, getCssClassNameForShape(shapeId));
}

function deactivateShapeEditMode($, shapeId, resetValues = false) {
    showAllEditButtons();
    document.getElementById(getListEntryName(shapeId)).classList.toggle("edited-shape", false);
    document.getElementById(getRemoveButtonName(shapeId)).hidden = false;
    document.getElementById(getSubmitButtonName(shapeId)).hidden = true;
    document.getElementById(getCancelButtonName(shapeId)).hidden = true;
    document.getElementById(getNameDivId(shapeId)).contentEditable = false;
    document.getElementById(getHydrusSelectId(shapeId)).disabled = true;
    document.getElementById(getManualInputId(shapeId)).disabled = true;

    if (resetValues){
        resetToOldValues(shapeId);
    }

    var cp = $(`#${getShapeColorPickerName(shapeId)}`).colorpicker('colorpicker');
    cp.disable();

    oldShapeId = oldShapeColor = null;
    oldMask = null;
    setGridEditMode(false);
}

function getNewColorForShape(shapeId) {
    return document.getElementById(getShapeColorPickerName(shapeId))
                    .children[0].children[0].children[0]
                    .style.background;
}


async function changeShapeColor(shapeId) {
    // TODO: This looks terrible, but currently works
    setTimeout(() => {
        var style = document.getElementById(getCssClassNameForShape(shapeId));
        const color = getNewColorForShape(shapeId);
        if (color) {
            style.innerHTML = `.${getCssClassNameForShape(shapeId)} { background: ${color}}`
        }
    }, 50);
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

function getColorInputFieldId(shapeId) {
    return `${shapeId}ColorInputField`;
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
            removeShape(shapeId);
            showSuccessToast(jQuery, "Shape successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


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
    createCssClassForShape(shapeId, shapeColor);
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
    var currentOptions = [];
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

    var child = hydrusSelect.lastElementChild;
    while (child) {
        hydrusSelect.removeChild(child);
        child = hydrusSelect.lastElementChild;
    }

    htmlOptions.forEach(opt => hydrusSelect.appendChild(opt));
    currentOptions = options;
}

function checkForManualOption(shapeId) {
    const select = document.getElementById(getHydrusSelectId(shapeId));

    if (select.value === MappingsConsts.MANUAL_RECHARGE_VALUE) {
        document.getElementById(getManualInputId(shapeId)).hidden = false;
    } else {
        document.getElementById(getManualInputId(shapeId)).hidden = true;
    }
}