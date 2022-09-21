from http import HTTPStatus

import flask
from flask import request, Blueprint
from werkzeug.exceptions import abort

from hmse_simulations.hmse_projects import project_service
from hmse_simulations.simulation_service import simulation_service
from server import endpoints, cookie_utils, path_checker

simulations = Blueprint('simulations', __name__)


@simulations.route(endpoints.SIMULATION, methods=['GET', 'POST'])
def simulation(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    prev_check_failed = path_checker.path_check_for_modflow_model(cookie, project_id)
    if prev_check_failed:
        return prev_check_failed

    if request.method == 'GET':
        status = simulation_service.check_simulation_status(project_id)
        if status is None:
            abort(404)
        return status.to_json()
    else:
        metadata = project_service.get(project_id)
        simulation_service.run_simulation(metadata)
        return flask.Response(status=HTTPStatus.OK)
