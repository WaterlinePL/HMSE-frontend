async function isProjectFinished(projectId, obj) {
    const url = getEndpointForProjectId(Config.projectFinished, projectId);
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            $(obj).removeAttr('hidden');
        } else if (response.status !== 204) {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}