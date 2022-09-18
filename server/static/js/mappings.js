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

function setMappings(mapping, selectFindingFunction, optionSetter) {
    for (const [key, value] of Object.entries(mapping)) {
        optionSetter(key);
        var select = document.getElementById(selectFindingFunction(key));
        const isNumber = typeof value == 'number';

        for (var option of select.children) {
            const selectNumber = isNumber && option.value === MappingsConsts.MANUAL_RECHARGE_VALUE;
            if (option.value === value || selectNumber) {
                option.selected = true;
                if (selectNumber) {
                    document.getElementById(getManualInputId(key)).value = value;
                    document.getElementById(getManualInputId(key)).hidden = false;
                }
            } else {
                option.selected = false;
            }
        }
    }
}

function fillMappings() {
    setMappings(ProjectConfig.shapesToHydrus, getHydrusSelectId, setSelectOptions);
    setMappings(ProjectConfig.hydrusToWeather, getWeatherSelectId, setWeatherSelectOptions);
}


const MappingsConsts = {
    "MANUAL_RECHARGE_VALUE": "[Manual recharge value]",
    "NO_RECHARGE_VALUE": "[Recharge from Modflow]",
    "NO_WEATHER_FILE": "[No weather file]"
}
