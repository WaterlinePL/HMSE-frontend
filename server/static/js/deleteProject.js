async function deleteProject() {
    const projectId = projectToDelete;
    const url = getEndpointForProjectId(Config.project, projectId);
    await fetch(url, {
        method: "DELETE"
    }).then(response => {
        if (response.status === 200) {
            document.getElementById(`project${projectId}`).remove();
            showSuccessToast(jQuery, `Project ${projectId} successfully deleted`);
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}

function setProjectToDelete(projectId) {
    projectToDelete = projectId;
}

var projectToDelete = null;