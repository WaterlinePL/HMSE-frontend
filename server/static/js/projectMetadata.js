const ProjectConfig = {
    "projectId": undefined,
    "projectName": undefined,
    "hydrusModels": [],
    "weatherFiles": [],
    "shapes": {},
    "shapesToHydrus": {},
    "hydrusToWeather": {}
};

function addShapeToHydrusMapping(shapeId, hydrusIdOrRechargeValue) {
    ProjectConfig.shapesToHydrus[shapeId] = hydrusIdOrRechargeValue;
}

function addHydrusToWeatherMapping(hydrusId, weatherId) {
    ProjectConfig.hydrusToWeather[hydrusId] = weatherId;
}

function removeShape(shapeId) {
    redrawShape(shapeId, "white", 3);
    document.getElementById(getListEntryName(shapeId)).remove();
    delete ProjectConfig.shapes[shapeId];
    delete ProjectConfig.shapesToHydrus[shapeId];
}

function addNewShape(projectId, shapeId, color, polygonArr) {
    ProjectConfig.shapes[shapeId] = color;
    addNewListEntry(jQuery, projectId, false, color, shapeId);
    addShapePolygon(shapeId, polygonArr);
    redrawShape(shapeId, color);
}

function unselectHydrusModelForAllShapes(hydrusIdToDelete) {
    for (const [shapeId, hydrusId] of Object.entries(ProjectConfig.shapesToHydrus)) {
        if (hydrusId === hydrusIdToDelete) {
            const hydrusSelect = document.getElementById(getHydrusSelectId(shapeId));
            unselectDeletedOption(hydrusSelect, hydrusIdToDelete, 0);
        }
    }
}

function unselectWeatherFileForAllHydrusModels(weatherIdToDelete) {
    for (const [hydrusId, weatherId] of Object.entries(ProjectConfig.hydrusToWeather)) {
        if (weatherId === weatherIdToDelete) {
            const weatherSelect = document.getElementById(getWeatherSelectId(hydrusId));
            unselectDeletedOption(weatherSelect, weatherIdToDelete, 0);
        }
    }
}


function addWeatherFile(projectId, weatherId) {
    addWeatherEntryToSimulation(projectId, weatherId);
    ProjectConfig.weatherFiles.push(weatherId);
}

function addHydrusModel(projectId, hydrusId) {
    addHydrusEntryToSimulation(projectId, hydrusId);
    ProjectConfig.hydrusModels.push(hydrusId);
}

function removeWeatherFile(weatherId) {
    unselectWeatherFileForAllHydrusModels(weatherId);
    document.getElementById(getWeatherListEntryId(weatherId)).remove();
    removeFromArray(ProjectConfig.weatherFiles, weatherId);
}

function removeHydrusModel(hydrusId) {
    unselectHydrusModelForAllShapes(hydrusId);
    document.getElementById(getHydrusListEntryId(hydrusId)).remove();
    removeFromArray(ProjectConfig.hydrusModels, hydrusId);
    delete ProjectConfig.hydrusToWeather[hydrusId];
}

function removeFromArray(arr, elem) {
    const index = arr.indexOf(elem);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

// Template needs to call it
async function fillProjectConfig(projectId) {
    const url = getEndpointForProjectId(Config.project, projectId);
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                ProjectConfig.projectId = data["project_id"];
                ProjectConfig.projectName = data["project_name"];
                ProjectConfig.hydrusModels = data["hydrus_models"];
                ProjectConfig.weatherFiles = data["weather_files"];
                ProjectConfig.shapes = data["shapes"];
                ProjectConfig.shapesToHydrus = data["shapes_to_hydrus"];
                ProjectConfig.hydrusToWeather = data["hydrus_to_weather"];
                fillMappings();
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}