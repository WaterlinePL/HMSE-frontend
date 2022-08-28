function isProjectFinished(projectId, obj) {
    const url = getEndpointForProjectId(Config.projectFinished, projectId);
    console.log(projectId);
    ($).ajax({
        url: url,
        type: "GET",
//                dataType: "json",
        context: obj,
        success: function (data, textStatus, jqXHR) {
            if (textStatus === "success") {
                $(obj).removeAttr('hidden');
            }
        },
        error: function(data, textStatus, jqXHR) {
            // TODO: Alert in toast
        }
    });
}