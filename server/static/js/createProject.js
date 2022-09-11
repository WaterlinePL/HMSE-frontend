const createNewProject = async function() {
    const projectId = document.getElementById("formCreateProject").elements.newProjectId.value;
    await fetch(Config.createProject, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            projectId: projectId,
            projectName: projectId
        })
    }).then(response => {
        if (response.status === 200) {
            location.replace(response.url);
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
};
