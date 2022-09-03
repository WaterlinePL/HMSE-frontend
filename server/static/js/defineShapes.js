
function initializeArray(rows, cols) {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

let rows_all =  document.getElementsByClassName("cell-row");
let rows_total = rows_all.length
let columns_total = rows_all[0].children.length
console.log("rows: " + rows_total);
console.log("columns: " + columns_total);

let shapeArray = initializeArray(rows_total, columns_total);
let addCellInDirection = 0;

if ( $('#error-shapes') && $('#error-shapes').length ){
    showToast('error-shapes');
}

function handleSubmit(modelIdx) {
    for (let i = 0; i < rows_total; i++) {
        for (let j = 0; j < columns_total; j++) {
            shapeArray[i][j] = document.getElementById(`cell_${i}_${j}`).classList.contains("bg-primary") ? 1 : 0;
        }
    }

    let request = new XMLHttpRequest();
    request.open("POST", Config.manualShapes + `${modelIdx}`, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    request.onload = function () {
        let response = JSON.parse(this.responseText);
        if (response && response.status === "OK") {
            showToast('successMessage');
            let nextModelId = parseInt(modelIdx) + 1;
            setTimeout(function () {
                window.location.href = Config.manualShapes + nextModelId;
            }, 500);

        }
    }

    request.send(JSON.stringify(shapeArray));
}

function handleBackButton(modelIdx) {
    console.log(`redirect to last page`);
    let lastModelId = parseInt(modelIdx) - 1;
    if (lastModelId === -1) {
        window.location.href = Config.defineMethod;
    } else {
        window.location.href = Config.manualShapes + lastModelId;
    }
}

function showToast(elementId) {
    let myAlert = document.getElementById(elementId);
    let bsAlert = new bootstrap.Toast(myAlert);
    bsAlert.show();
}

function getRowColFromId(cellId) {
    let cell = cellId.split('_');
    return {"row": parseInt(cell[1]), "col": parseInt(cell[2])}
}

function onMouseOver(id, isHighlighted) {
    const grid = getRowColFromId(id);
    const row = grid.row;
    const col = grid.col;

    prevCellsCleanup();
    for (let i = row - addCellInDirection; i <= row + addCellInDirection; i++) {
        for (let j = col - addCellInDirection; j <= col + addCellInDirection; j++) {
            if (i < 0 || i >= rows_total || j < 0 || j >= columns_total) {
                continue;
            }
//            document.getElementById(`cell_${i}_${j}`).classList.toggle("bg-primary", isHighlighted);
            document.getElementById(`cell_${i}_${j}`).classList.toggle("bg-warning", true);
        }
    }
}


let prevCells = [];
let isHighlighted = false;

function removePreviousTrail(id) {
    const grid = getRowColFromId(id);
    const row = grid.row;
    const col = grid.col;

    prevCellsCleanup();
    for (let i = row - addCellInDirection; i <= row + addCellInDirection; i++) {
        for (let j = col - addCellInDirection; j <= col + addCellInDirection; j++) {
            if (i < 0 || i >= rows_total || j < 0 || j >= columns_total) {
                continue;
            }
            document.getElementById(`cell_${i}_${j}`).classList.toggle("bg-warning", false);
        }
    }
}

function prevCellsCleanup() {
    prevCells.forEach(cellId => {

        var classes = document.getElementById(cellId).classList;
        classes.toggle("bg-light", false);
        classes.toggle("bg-secondary", false);

        if (classes.contains("bg-warning")) {
            classes.toggle("bg-warning", false);
            classes.toggle("bg-primary", isHighlighted);
        }
    });
}

function previewPaintedCells(id) {
    const grid = getRowColFromId(id);
    const row = grid.row;
    const col = grid.col;
    const willErase = document.getElementById(`cell_${row}_${col}`).classList.contains("bg-primary");

    prevCellsCleanup();
    for (let i = row - addCellInDirection; i <= row + addCellInDirection; i++) {
        for (let j = col - addCellInDirection; j <= col + addCellInDirection; j++) {
            if (i < 0 || i >= rows_total || j < 0 || j >= columns_total) {
                continue;
            }
            const cellId = `cell_${i}_${j}`;
            let elem = document.getElementById(cellId);
            if (willErase && elem.classList.contains("bg-primary")) {
                elem.classList.toggle("bg-secondary", true);
            } else if (!willErase && !elem.classList.contains("bg-primary")) {
                elem.classList.toggle("bg-light", true);
            }
            prevCells.push(cellId);
        }
    }
}

$(function () {

    let isMouseDown = false;
    $("#model-mesh td")
        .mousedown(function () {
            isMouseDown = true;
            isHighlighted = !$(this).hasClass("bg-primary");
            onMouseOver(this.id, isHighlighted);
            return false; // prevent text selection
        })
        .mouseover(function () {
            if (isMouseDown) {
                onMouseOver(this.id, isHighlighted);
            } else {
                previewPaintedCells(this.id);
            }
        })
        .mouseup(function () {
            removePreviousTrail(this.id);
        })
        .mouseleave(() => prevCellsCleanup())
        .bind("selectstart", function () {
            return false;
        })

    $(document)
        .mouseup(function () {
            isMouseDown = false;
        });

    $("#brush-size").ready(function(){
        addCellInDirection = parseInt($("#brush-size").val());
        $("#brush-size").change(function (){
            addCellInDirection = parseInt($("#brush-size").val());
        })
    })
});