ProjectConfig = {
    "projectId": undefined,
    "projectName": undefined,
    "hydrusModels": {},
    "weatherFiles": {},
    "shapes": {},
    "shapesToHydrus": {},
    "hydrusToWeather": {}
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
            response.json().then(() => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


//console.log(ProjectConfig);