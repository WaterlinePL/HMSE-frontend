async function isProjectFinished(projectId, obj) {
    const url = getEndpointForProjectId(Config.projectFinished, projectId);
    console.log(projectId);
    await fetch(url, {
        method: "GET"
    }).then(response => {
        if (response.status === 200) {
            $(obj).removeAttr('hidden');
        } else {
            response.json().then(() => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}