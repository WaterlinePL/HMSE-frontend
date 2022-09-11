// project removal
async function createHydrusShapeMapping(projectId, shapeId, hydrusId = null, rechargeValue = null) {
    const url = getEndpointForProjectId(Config.mapShapeRecharge, projectId);
    await fetch(url, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            shapeId: shapeId,
            hydrusId: hydrusId,
            rechargeValue: rechargeValue
        })
    }).then(response => {
        if (response.status === 200) {
            if (hydrusId) {
                addShapeToHydrusMapping(shapeId, hydrusId);
            } else {
                addShapeToHydrusMapping(shapeId, rechargeValue);
            }
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
};

async function createWeatherMapping(projectId, hydrusId, weatherId) {
    var url = getEndpointForProjectId(Config.mapWeatherFile, projectId);
    await fetch(url, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            hydrusId: hydrusId,
            weatherId: weatherId
        })
    }).then(response => {
        if (response.status === 200) {
            addHydrusToWeatherMapping(hydrusId, weatherId);
        } else {
            response.json().then(data => {
                showErrorToast(jQuery, `Error: ${data.description}`);
            });
        }
    });
};


async function sendShapeMapping(projectId, shapeId) {
    const selectValue = document.getElementById(getHydrusSelectId(shapeId)).value;
    var hydrusId = null, rechargeValue = null;
    if (selectValue === MappingsConsts.MANUAL_RECHARGE_VALUE) {
        rechargeValue = document.getElementById(getManualInputId(shapeId)).value;
    } else if (selectValue !== MappingsConsts.NO_RECHARGE_VALUE) {
        hydrusId = selectValue;
    }
    createHydrusShapeMapping(projectId, shapeId, hydrusId, rechargeValue);
}


async function sendWeatherMapping(projectId, hydrusId) {
    var weatherId = document.getElementById(getWeatherSelectId(hydrusId)).value;
    if (weatherId === MappingsConsts.NO_WEATHER_FILE) {
        weatherId = null;
    }
    createWeatherMapping(projectId, hydrusId, weatherId);
}


const MappingsConsts = {
    "MANUAL_RECHARGE_VALUE": "[Manual recharge value]",
    "NO_RECHARGE_VALUE": "[Recharge from Modflow]",
    "NO_WEATHER_FILE": "[No weather file]"
}
