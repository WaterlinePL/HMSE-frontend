function createProjectListElement(elemId, deleteFunction) {
    const listEntry = createEmptyListEntry(elemId);

    listEntry.appendChild(createLeftIdSpan(elemId));
    listEntry.appendChild(createDeleteButton(deleteFunction));
    return listEntry;
}

function createEmptyListEntry(elemId) {
    const listEntry = document.createElement("li");
    listEntry.id = elemId;
    listEntry.classList.add("list-group-item");
    return listEntry;
}

function createLeftIdSpan(elemId) {
    const leftIdSpan = document.createElement("span");
    leftIdSpan.classList.add("slice-column");
    leftIdSpan.classList.add("left");
    leftIdSpan.textContent = elemId;
    return leftIdSpan;
}

function createRightSpan() {
    const leftIdSpan = document.createElement("span");
    leftIdSpan.classList.add("slice-column");
    leftIdSpan.classList.add("right");
    return leftIdSpan;
}

function createDeleteButton(deleteFunction) {
    const rightSpan = createRightSpan();

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-danger");
    deleteButton.classList.add("right");
    deleteButton.onclick = deleteFunction;
    deleteButton.textContent = "Remove";

    rightSpan.appendChild(deleteButton);
    return rightSpan;
}

function createButtonWithoutFunction(id, colorClass, text) {
    const button = createElement("button", ["btn", colorClass, "right"], id);
    button.type = "button";
    button.textContent = text;
    return button;      // Needs to have set 'onclick'
}


function createElement(element, classes, id = null) {
    const div = document.createElement(element);
    classes.forEach(cls => div.classList.add(cls));
    if (id) {
        div.id = id;
    }
    return div;
}

function createOption(text, selected = false) {
    const option = document.createElement("option");
    option.value = text;
    option.textContent = text;
    option.selected = selected;
    return option;
}

function arrayEquals(a, b) {
    const sortedA = a.sort();
    const sortedB = b.sort();
    return a.length === b.length &&
        sortedA.every((val, index) => val === sortedB[index]);
}

function unselectDeletedOption(selectElement, optToRemove, defaultOptIndex) {
    for (const option of selectElement.children) {
        if (option.value === optToRemove) {
            option.selected = false;
            selectElement.children[defaultOptIndex].selected = true;
        }
    }
}

function testPing() {
    console.log("Ping!");
}