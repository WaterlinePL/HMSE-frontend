import threading

from flask import request, jsonify

from server import endpoints, cookie_utils, path_checker
from server.main import app


@app.route(endpoints.SIMULATION, methods=['GET', 'POST'])
def simulation(project_id: str):
    if request.method == 'GET':
        state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
        hydrus_stage_status, passing_stage_status, modflow_stage_status = state.simulation_service.check_simulation_status(
            int(simulation_id))

        response = {
            'hydrus': {
                'finished': hydrus_stage_status.has_ended(),
                'errors': [str(sim_error) for sim_error in hydrus_stage_status.get_errors()]
            },
            'passing': {
                'finished': passing_stage_status.has_ended(),
                'errors': [str(sim_error) for sim_error in passing_stage_status.get_errors()]
            },
            'modflow': {
                'finished': modflow_stage_status.has_ended(),
                'errors': [str(sim_error) for sim_error in modflow_stage_status.get_errors()]
            }
        }

        return jsonify(response)
    # elif request.method == 'POST':
    else:
        state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
        check_previous_steps = path_checker.path_check_define_shapes_method(state)
        if check_previous_steps:
            return check_previous_steps

        # TODO:
        simulation_service = SimulationService(state.get_hydrus_dir(), state.get_modflow_dir())
        state.set_simulation_service(simulation_service)
        sim = state.simulation_service.prepare_simulation()

        sim.set_modflow_project(modflow_project=state.loaded_project.modflow_model)
        sim.set_loaded_shapes(loaded_shapes=state.loaded_shapes)
        sim.set_spin_up(spin_up=int(state.loaded_project.spin_up))

        sim_id = sim.get_id()

        thread = threading.Thread(target=state.simulation_service.run_simulation, args=[sim_id])
        thread.start()
        return jsonify(id=sim_id)
