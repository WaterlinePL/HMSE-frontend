function prepareCanvas() {
    let canvas = document.getElementById('shape-grid');
    let context = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    // begin custom shape
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, height);
    context.lineTo(width, height);
    context.lineTo(width, 0);
    context.lineTo(0, 0);
    context.closePath();
    context.lineWidth = 1;
    context.fillStyle = "white";
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
}

function drawShape(shapeArr, color, lineWidth) {
    let canvas = document.getElementById('shape-grid');
    let context = canvas.getContext('2d');

    context.beginPath();
    if (shapeArr) {
        const lastPoint = shapeArr[shapeArr.length - 1];
        context.moveTo(lastPoint[0], lastPoint[1]);
    }

    for (const point of shapeArr) {
        context.lineTo(point[0], point[1]);
    }
    context.closePath();

    context.lineWidth = lineWidth;
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = color;
    context.stroke();
}

function redrawShape(shapeId, color, lineWidth = 1) {
    const shape = shapeIdsToMasks[shapeId];
    drawShape(shape, color, lineWidth);
}

function redrawGrid() {
    prepareCanvas();
    redrawShape(inactiveShapeId, ProjectConfig.shapes[inactiveShapeId]);
    for (const [shapeId, color] of Object.entries(ProjectConfig.shapes)) {
        if (shapeId !== inactiveShapeId) {
            redrawShape(shapeId, color);
        }
    }
}

function addShapePolygon(shapeId, polygonArr) {
    shapeIdsToMasks[shapeId] = polygonArr;
}

// ShapeId -> Polygon
shapeIdsToMasks = {}