var Config = {
    // Used
    "createProject": "/new-project",
    "project": "/project/<project_id>",
    "projectManageHydrus": "/project/<project_id>/hydrus",
    "projectManageModflow": "/project/<project_id>/modflow",
    "projectManageWeatherFile": "/project/<project_id>/weather",
    "projectFinished": '/project/<project_id>/is-finished',
    "rchShapes": "/project/<project_id>/rch-shape",
    "manualShapes": "/project/<project_id>/manual-shape",
    "projectMetadata": "/project/<project_id>/metadata",
    "simulation": "/simulation/<project_id>",

     // Unused
    "defineMethod": "/define-method",
    "editProject": "/edit-project/",
    "projectList": '/project-list',
    "projectDownload": '/project-download',
}

function getEndpointForProjectId(endpoint, projectId) {
    return endpoint.replace("<project_id>", projectId);
}
