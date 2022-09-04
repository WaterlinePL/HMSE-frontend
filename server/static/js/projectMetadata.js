var ProjectConfig = {
    "projectId": undefined,
    "projectName": undefined,
    "hydrusModels": [],
    "weatherFiles": [],
    "shapes": {},
    "shapesToHydrus": {},
    "hydrusToWeather": {}
}

function removeShape(shapeId) {
    delete ProjectConfig.shapes[shapeId];
}

function removeWeatherFile(weatherId) {
    removeFromArray(ProjectConfig.weatherFiles, weatherId);
}

function removeHydrusModel(hydrusId) {
    removeFromArray(ProjectConfig.hydrusModels, hydrusId);
}

function removeFromArray(arr, elem) {
    const index = arr.indexOf(elem);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

// Template needs to call it
async function fillProjectConfig(projectId) {
    const url = getEndpointForProjectId(Config.projectMetadata, projectId);
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
            });
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}