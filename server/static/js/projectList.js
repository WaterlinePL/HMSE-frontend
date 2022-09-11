// project removal
async function doDelete(projectId, wasWarned) {
    if (wasWarned) {
        var url = getEndpointForProjectId(Config.project, projectId);
        await fetch(url, {
            method: "DELETE",
        }).then(response => {
            if (response.status === 200) {
                showSuccessToast(jQuery, `Project ${projectId} successfully deleted`);
                // TODO: Is this needed? - reload seems the best
                //location.replace(response.url)
            } else {
                response.json().then(data => {
                    showErrorToast(jQuery, `Error: ${data.description}`);
                });
            }
        });
    } else {
        document.getElementById("projectNameModal").innerText = projectName;
        document.getElementById("confirmDelete").onclick = function() {
            doDelete(projectName, true);
        };
    }
}



(function ($) {
    'use strict'

    document.getElementById("form-search").onsubmit = function (e) {
        e.preventDefault();
        const search = this.elements.search.value;
        if (search !== null && search !== undefined && search.trim() !== "") {
            window.location.href = `${Config.projectList}/${search}`;
        } else {
            window.location.href = Config.projectList;
        }
    }

    $(document).ready(function () {
        $(".download").each(function (i, obj) {
            isProjectFinished(obj.id, obj);
        });
    });

})(jQuery);
