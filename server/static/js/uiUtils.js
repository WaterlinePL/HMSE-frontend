function createProjectListElement(elemId, deleteFunction) {
    const listEntry = document.createElement("li");
    listEntry.id = elemId;
    listEntry.classList.add("list-group-item");

    listEntry.appendChild(createLeftIdSpan(elemId));
    listEntry.appendChild(createDeleteButton(deleteFunction));
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



function testPing() {
    console.log("Ping!");
}