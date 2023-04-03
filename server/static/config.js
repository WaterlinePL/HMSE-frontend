const URL_PREFIX = "";

const __config = {
    // Used
    "createProject": "/new-project",
    "project": "/project/<project_id>",
    "projectManageHydrus": "/project/<project_id>/hydrus",
    "projectManageModflow": "/project/<project_id>/modflow",
    "projectManageWeatherFile": "/project/<project_id>/weather",
    "projectFinished": "/project/<project_id>/is-finished",
    "rchShapes": "/project/<project_id>/rch-shape",
    "zbShapes": "/project/<project_id>/zb-shape",
    "editShapes": "/project/<project_id>/edit-shape",
    "simulation": "/simulation/<project_id>",
    "mapShapeRecharge": "/project/<project_id>/map-shape-to-hydrus",
    "mapWeatherFile": "/project/<project_id>/map-weather",
    "configuration": "/configuration",
    "simulationMode": "/project/<project_id>/simulation-mode",

     // Unused
    "defineMethod": "/define-method",
    "editProject": "/edit-project/",
    "projectList": '/project-list',
    "projectDownload": '/project-download',
};

const Config = {};

for ([name, plain_endpoint] of Object.entries(__config)) {
    Config[name] = URL_PREFIX + plain_endpoint;
}


function getEndpointForProjectId(endpoint, projectId) {
    return endpoint.replace("<project_id>", projectId);
}
