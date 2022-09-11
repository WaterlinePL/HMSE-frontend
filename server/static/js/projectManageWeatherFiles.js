function getWeatherListEntryId(weatherId) {
    return `weather_${weatherId}`
}

function addWeatherEntryToSimulation(projectId, weatherId) {
    const weatherList = document.getElementById("weatherFileList");
    const uploadButtonListElement = document.getElementById("weatherUpload");
    const deleteLambda = () => deleteWeatherFile(projectId, weatherId);
    weatherList.insertBefore(createProjectListElement(weatherId, deleteLambda), uploadButtonListElement);
}


// model removal
async function deleteWeatherFile(projectId, weatherId) {
    const url = getEndpointForProjectId(Config.projectManageWeatherFile, projectId);
    await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'weatherId': weatherId})
    }).then(response => {
        if (response.status === 200) {
            removeWeatherFile(weatherId);
            showSuccessToast(jQuery, "Weather file successfully deleted");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


async function openWeatherFileDialog() {
    const input = document.getElementById('weatherFileUploadInput');
    input.click();
}

async function sendWeatherFileAfterSelected(projectId) {
    const elem = document.getElementById('weatherFileUploadInput');
    if (!elem.files) {
        return;
    }

    const url = getEndpointForProjectId(Config.projectManageWeatherFile, projectId);
    const formData = new FormData();
    const weatherFile = elem.files[0];
    formData.append('weatherFile', weatherFile);
    await fetch(url, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (response.status === 200) {
            // TODO: const weatherId = ...
            addWeatherFile(projectId, weatherFile.name);
            showSuccessToast(jQuery, "Weather file successfully uploaded");
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
}


function getWeatherSelectId(hydrusId) {
    return `${hydrusId}SelectWeather`;
}


function setWeatherSelectOptions(hydrusId) {
    const weatherSelect = document.getElementById(getWeatherSelectId(hydrusId));
    const options = [MappingsConsts.NO_WEATHER_FILE].concat(ProjectConfig.weatherFiles);
    const currentSelectedOpt = document.getElementById(getWeatherSelectId(hydrusId)).value;

    const htmlOptions = [];
    options.forEach(opt => htmlOptions.push(createOption(opt, opt === currentSelectedOpt)));


    var child = weatherSelect.lastElementChild;
    while (child) {
        weatherSelect.removeChild(child);
        child = weatherSelect.lastElementChild;
    }

    htmlOptions.forEach(opt => weatherSelect.appendChild(opt));
    currentOptions = options;
}