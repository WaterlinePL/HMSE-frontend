var Config = {
    // Used
    "createProject": "/new-project",
    "project": "/project/<project_id>",
    "projectManageHydrus": "/project/<project_id>/hydrus",
    "projectManageModflow": "/project/<project_id>/modflow",
    "projectManageWeatherFile": "/project/<project_id>/weather",
    "projectFinished": '/project/<project_id>/is-finished',

     // Unused
    "manualShapes": "/manual-shapes/",
    "defineMethod": "/define-method",
    "editProject": "/edit-project/",
    "projectList": '/project-list',
    "projectDownload": '/project-download',
    "rchShapes": "/rch-shapes/",
    "simulation": "/simulation",
    "simulationCheck": "/simulation-check/",
    "simulationRun": "/simulation-run",
}

function getEndpointForProjectId(endpoint, projectId) {
    return endpoint.replace("<project_id>", projectId);
}
