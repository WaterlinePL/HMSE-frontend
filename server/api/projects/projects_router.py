from flask import request, render_template

from server import endpoints, cookie_utils, path_checker, template
from server.api.projects import project_handlers
from server.main import app


# TODO: maybe initiate new project and redirect to edit endpoint?
@app.route(endpoints.CREATE_PROJECT, methods=['POST'])
def create_project():
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST':
        return project_handlers.create_project_handler()
    else:
        return render_template(template.CREATE_PROJECT)


@app.route(endpoints.EDIT_PROJECT, methods=['GET', 'POST'])
def edit_project(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST':
        return project_handlers.update_project_settings()
    else:
        return project_handlers.edit_project_handler(project_name)


@app.route(endpoints.PROJECT_LIST, methods=['GET', 'DELETE'], defaults={'search': None})
@app.route(endpoints.PROJECT_LIST_SEARCH)
def project_list(search):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST':
        return project_handlers.remove_project_handler()
    else:
        return project_handlers.project_list_handler(search)


@app.route(endpoints.PROJECT, methods=['GET'])
def project(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    return project_handlers.project_handler(project_name)


@app.route(endpoints.PROJECT_FINISHED, methods=['GET'])
def project_is_finished(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    return project_handlers.project_is_finished_handler(project_name)


@app.route(endpoints.PROJECT_DOWNLOAD, methods=['GET'])
def project_download(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    return project_handlers.project_download_handler(project_name)

@app.route(endpoints.UPLOAD_MODFLOW, methods=['POST', 'DELETE'])
def upload_modflow(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST' and request.files:
        return endpoint_handlers.upload_modflow_handler()
    elif request.method == 'DELETE':
        return endpoint_handlers.remove_modflow_handler()
    else:
        if state.loaded_project is None:
            state.activate_error_flag()
            return redirect(endpoints.PROJECT_LIST)
        else:
            check_previous_steps = path_checker.path_check_simulate_access(state)
            if check_previous_steps:
                return check_previous_steps

            return render_template(
                template.UPLOAD_MODFLOW,
                model_name=state.loaded_project.modflow_model,
                upload_error=state.get_error_flag()
            )


@app.route(endpoints.UPLOAD_WEATHER_FILE, methods=['POST', 'DELETE'])
def upload_weather_file(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(state)

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST' and request.files:
        return endpoint_handlers.upload_weather_file_handler()
    else:  # GET
        if state.loaded_project is not None:
            return render_template(
                template.UPLOAD_WEATHER_FILE,
                hydrus_models=state.loaded_project.hydrus_models,
                upload_error=False
            )
        else:
            state.activate_error_flag()
            return redirect(endpoints.PROJECT_LIST)


@app.route(endpoints.UPLOAD_HYDRUS, methods=['POST', 'DELETE'])
def upload_hydrus(project_id: str):
    check_previous_steps = path_checker.path_check_modflow_step(state)

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST' and request.files:
        return endpoint_handlers.upload_hydrus_handler()
    elif request.method == 'DELETE':
        return endpoint_handlers.remove_hydrus_handler()
    else:
        return render_template(template.UPLOAD_HYDRUS,
                               model_names=state.loaded_project.hydrus_models,
                               upload_error=state.get_error_flag())


@app.route(endpoints.MANUAL_SHAPES, methods=['PUT', 'DELETE'])
def manual_shapes(project_id: str):
    check_previous_steps = path_checker.path_check_for_modflow_model(state)

    if check_previous_steps:
        return check_previous_steps

    if request.method == 'POST':
        return endpoint_handlers.upload_shape_handler()
    else:
        return endpoint_handlers.next_model_redirect_handler(state.get_error_flag())


@app.route(endpoints.RCH_SHAPES, methods=['PUT', 'DELETE'])
def rch_shapes(project_id: str):
    if request.method == 'PUT':
        pass
    elif request.method == 'DELETE':
        pass
    # return 404

    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    check_previous_steps = path_checker.path_check_for_modflow_model(state)

    if check_previous_steps:
        return check_previous_steps

    state.set_method(endpoints.RCH_SHAPES)

    if request.method == 'POST':
        return endpoint_handlers.assign_model_to_shape(request, int(rch_shape_index))
    else:
        return endpoint_handlers.next_shape_redirect_handler(int(rch_shape_index))

# TODO: Mapping endpoints

