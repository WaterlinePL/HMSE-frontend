function getHydrusListEntryId(hydrusId) {
    return `hydrus_${hydrusId}`
}

function getWeatherSelectId(hydrusId) {
    return `${hydrusId}SelectWeather`;
}

function addHydrusEntryToSimulation(projectId, hydrusId) {
    const hydrusList = document.getElementById("hydrusModelList");
    const uploadButtonListElement = document.getElementById("hydrusUpload");
    const deleteLambda = () => deleteHydrus(projectId, hydrusId);

    const listEntry = createProjectListElement(hydrusId, deleteLambda);
    const weatherSelectSpan = createElement("span", ["slice-column", "left"]);
    const rightContent = listEntry.children[1];
    rightContent.appendChild(weatherSelectSpan);

    const select = createElement("select", ["custom-select"], getWeatherSelectId(hydrusId));
    select.onclick = () => setWeatherSelectOptions(hydrusId);
    select.onchange = () => sendWeatherMapping(projectId, hydrusId);
    weatherSelectSpan.appendChild(select);

    const noValOpt = createOption(MappingsConsts.NO_WEATHER_FILE);
    noValOpt.selected = true;
    select.appendChild(noValOpt);

    hydrusList.insertBefore(listEntry, uploadButtonListElement);
}

// model removal
async function deleteHydrus(projectId, hydrusId) {
    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'hydrusId': hydrusId})
    }).then(response => {
        if (response.status === 200) {
            removeHydrusModel(hydrusId);
            showSuccessToast(jQuery, "Hydrus model successfully deleted")
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


async function openHydrusDialog() {
    const input = document.getElementById('hydrusUploadInput');
    input.click();
}

async function sendHydrusModelAfterSelected(projectId) {
    const elem = document.getElementById('hydrusUploadInput');
    if (elem.files.length <= 0) {
        return;
    }

    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);
    const formData = new FormData();
    const hydrusModel = elem.files[0];
    formData.append('modelArchive', hydrusModel);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            const hydrusId = hydrusModel.name;
            addHydrusModel(projectId, hydrusId);
            showSuccessToast(jQuery, `Hydrus model ${hydrusId} successfully uploaded`)
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    })
}

// TODO: multifile upload? - already unused
async function startUpload(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++)
        formData.append('archive-input', files[i]);
    const url = getEndpointForProjectId(Config.projectManageHydrus, projectId);

    await fetch(url, {
        method : "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            location.reload();  // TODO: poor solution or create with JS
            // Activate success toast
        }
    });
}