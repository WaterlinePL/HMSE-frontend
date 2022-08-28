// project removal
async function doDelete(projectId, wasWarned) {
    if (wasWarned) {
        var url = getEndpointForProjectId(Config.project, projectId);
        await fetch(url, {
            method: "DELETE",
        }).then(response => {
            if (response.status === 200) {
                // TODO: Is this needed?
                location.replace(response.url)
            } else {
                // Alert toast
            }
        });
    } else {
        document.getElementById("projectNameModal").innerText = projectName;
        document.getElementById("confirmDelete").onclick = function() {
            doDelete(projectName, true);
        };
    }
};

const createNewProject = async function() {
    const projectId = document.getElementById("form-create-project").elements.newProjectId.value;
    await fetch(Config.createProject, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            projectId: projectId,
            projectName: projectId
        })
    }).then(response => {
        console.log(response);
        if (response.status === 200) {
            location.replace(response.url);
        }
    });
};

(function ($) {
    'use strict'

    document.getElementById("form-search").onsubmit = function (e) {
        e.preventDefault();

        const search = this.elements.search.value;
//        console.log(this.elements.search.value);
        if (search !== null && search !== undefined && search.trim() !== "") {
            window.location.href = `${Config.projectList}/${search}`;
        } else {
            window.location.href = Config.projectList;
        }
    }

    // TODO: Does this always show toast no matter what happens?
    $('#error').toast('show');

    $(document).ready(function () {
        $(".download").each(function (i, obj) {
            isProjectFinished(obj.id, obj);
//            const url = getEndpointForProjectId(Config.projectFinished, obj.id);
//            console.log(obj.id);
//            ($).ajax({
//                url: url,
//                type: "GET",
////                dataType: "json",
//                context: this,
//                success: function (data, textStatus, jqXHR) {
//                    if (textStatus === "success") {
//                        $(this).removeAttr('hidden');
//                    }
//                },
//                error: function(data, textStatus, jqXHR) {
//                    // TODO: Alert in toast
//                }
//            });
        });
    });

})(jQuery);
