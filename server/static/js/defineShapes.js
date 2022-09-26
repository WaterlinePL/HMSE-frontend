function initializeArray(rows, cols) {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

function initGrid() {
    rows_all =  document.getElementsByClassName("cell-row");
    rows_total = rows_all.length;
    columns_total = rows_all[0].children.length;
    addCellInDirection = 0;
}

var rows_all, rows_total, columns_total, addCellInDirection;
var editMode = false, isMouseDown = false;


function getShapeMask(cls) {
    var shapeArray = initializeArray(rows_total, columns_total);
    for (let i = 0; i < rows_total; i++) {
        for (let j = 0; j < columns_total; j++) {
            shapeArray[i][j] = document.getElementById(`cell_${i}_${j}`).classList.contains(cls) ? 1 : 0;
        }
    }
    return shapeArray;
}

function applyMask(maskArray, cls, show) {
    for (let i = 0; i < rows_total; i++) {
        for (let j = 0; j < columns_total; j++) {
            if (maskArray[i][j]) {
                document.getElementById(`cell_${i}_${j}`).classList.toggle(cls, show);
            }
        }
    }
}

function getRowColFromId(cellId) {
    let cell = cellId.split('_');
    return {"row": parseInt(cell[1]), "col": parseInt(cell[2])}
}

function updateCursorCoords(cellId) {
    const currentCords = getRowColFromId(cellId);
    const row = currentCords.row;
    const col = currentCords.col;
    document.getElementById("cursorGridCoords").textContent = `Cursor coordinates: (${row}, ${col})`;
}

function unsetCursorCoords() {
    document.getElementById("cursorGridCoords").textContent = `Cursor outside the grid`;
}

function onMouseOver(id, isHighlighted, shapeClass) {
    const currentCords = getRowColFromId(id);
    const row = currentCords.row;
    const col = currentCords.col;

    prevCellsCleanup();
    for (let i = row - addCellInDirection; i <= row + addCellInDirection; i++) {
        for (let j = col - addCellInDirection; j <= col + addCellInDirection; j++) {
            if (i < 0 || i >= rows_total || j < 0 || j >= columns_total) {
                continue;
            }
            const elem = document.getElementById(`cell_${i}_${j}`);
            if (!hasColor(elem, shapeClass)) {
                elem.classList.toggle(shapeClass, isHighlighted)
            }
        }
    }
}


let prevCells = [];
let isHighlighted = false;


function cancelGridModification(prevMask, cls) {
    removeClassFromGrid(cls);
    applyMask(prevMask, cls, true);
}

function prevCellsCleanup() {
    prevCells.forEach(cellId => {
        var classes = document.getElementById(cellId).classList;
        classes.toggle("bg-secondary", false);
        classes.toggle("bg-light", false);
    });
}

function hasColor(gridElement, skipColor = null) {
    for (const cls of gridElement.classList) {
        if (cls.includes("ColorCls") && cls !== skipColor) {
            return true;
        }
    }
    return false;
}


function previewPaintedCells(id, shapeClass) {
    const grid = getRowColFromId(id);
    const row = grid.row;
    const col = grid.col;
    const willErase = document.getElementById(`cell_${row}_${col}`).classList.contains(shapeClass);

    prevCellsCleanup();
    for (let i = row - addCellInDirection; i <= row + addCellInDirection; i++) {
        for (let j = col - addCellInDirection; j <= col + addCellInDirection; j++) {
            if (i < 0 || i >= rows_total || j < 0 || j >= columns_total) {
                continue;
            }

            const cellId = `cell_${i}_${j}`;
            let elem = document.getElementById(cellId);

            if (willErase) {
                elem.classList.toggle("bg-secondary", true);
            } else if (!hasColor(elem)) {
                elem.classList.toggle("bg-light", true);
            }

            prevCells.push(cellId);
        }
    }
}

function setGridEditMode(state) {
    editMode = state;
}

function setupGridSettings($, shapeClass) {
    $("#modelGridTable td")
        .unbind('mousedown')
        .unbind('mouseover')
        .unbind('mouseup')
        .unbind('mouseleave')
        .mousedown(function () {
            updateCursorCoords(this.id);
            if (editMode) {
                isMouseDown = true;
                isHighlighted = !$(this).hasClass(shapeClass);
                onMouseOver(this.id, isHighlighted, shapeClass);
            }
            return false; // prevent text selection
        })
        .mouseover(function () {
            updateCursorCoords(this.id);
            if (editMode) {
                if (isMouseDown) {
                    onMouseOver(this.id, isHighlighted, shapeClass);
                } else {
                    previewPaintedCells(this.id, shapeClass);
                }
            }
        })
        .mouseup(function () {
            if (editMode) {
                prevCellsCleanup();
            }
        })
        .mouseleave(() => {
            if (editMode) {
                prevCellsCleanup();
            }
         })
        .bind("selectstart", function () {
            return false;
        })

        $("#modelGridTable").unbind('mouseleave')
            .mouseleave(() => unsetCursorCoords());
}

function removeClassFromGrid(cls) {
    for (let i = 0; i < rows_total; i++) {
        for (let j = 0; j < columns_total; j++) {
            const elem = document.getElementById(`cell_${i}_${j}`);
            if (elem.classList.contains(cls)) {
                elem.classList.toggle(cls, false);
            }
        }
    }
}


async function initCurrentShapes(projectId) {
    const url = getEndpointForProjectId(Config.manualShapes, projectId);
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status == 200) {
            response.json().then(data => {
                for (const [shapeId, shapeMask] of Object.entries(data)) {
                    const cls = getCssClassNameForShape(shapeId);
                    applyMask(shapeMask, cls, true);
                }
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


$(function () {
    $(document).mouseup(function () {
        isMouseDown = false;
    });

    $("#brush-size").ready(function() {
        addCellInDirection = parseInt($("#brush-size").val());
        $("#brush-size").change(function() {
            addCellInDirection = parseInt($("#brush-size").val());
        });
    });
});