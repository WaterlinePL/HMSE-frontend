let rows_all, rows_total, columns_total, addCellInDirection;
let editMode = false, isMouseDown = false;


function updateCursorCoords(cellId) {
    // TODO?
    // const currentCords = getRowColFromId(cellId);
    // const row = currentCords.row;
    // const col = currentCords.col;
    // document.getElementById("cursorGridCoords").textContent = `Cursor coordinates: (${row}, ${col})`;
}

function unsetCursorCoords() {
    document.getElementById("cursorGridCoords").textContent = `Cursor outside the grid`;
}


function setGridEditMode(state) {
    editMode = state;
}

async function initCurrentShapes(projectId) {
    const url = getEndpointForProjectId(Config.editShapes, projectId);
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                for (const [shapeId, polygonArr] of Object.entries(data)) {
                    // const cls = getCssClassNameForShape(shapeId);
                    // applyMask(shapeMask, cls, true);
                    addShapePolygon(shapeId, polygonArr);
                    redrawShape(shapeId, ProjectConfig.shapes[shapeId]);
                }
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}