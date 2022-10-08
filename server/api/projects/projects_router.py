from http import HTTPStatus

import flask
from flask import request, render_template, jsonify, Blueprint, send_file
from flask_paginate import get_page_args, Pagination
from werkzeug.exceptions import abort
from werkzeug.utils import redirect

from hmse_simulations.hmse_projects import project_service
from hmse_simulations.hmse_projects.hmse_hydrological_models.modflow import modflow_utils
from hmse_simulations.hmse_projects.project_metadata import ProjectMetadata
from hmse_simulations.simulation.simulation import Simulation
from server import endpoints, cookie_utils, path_checker, template, naming_utils

projects = Blueprint('projects', __name__)


@projects.route(endpoints.EDIT_PROJECT, methods=['GET'])
def edit_project(project_id: str):
    check_previous_steps = path_checker.path_check_simulate_access(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps

    metadata = project_service.get(project_id)
    width, height, metadata.modflow_metadata = modflow_utils.adapt_model_to_display(metadata.modflow_metadata)
    return render_template(template.EDIT_PROJECT, metadata=metadata,
                           modflow_model_width=width, modflow_model_height=height,
                           end_date=metadata.calculate_end_date(),
                           simulation_stages=[stage.to_id_and_name() for stage in Simulation.all_stages()])


@projects.route(endpoints.PROJECT_LIST, methods=['GET'], defaults={'search': None})
@projects.route(endpoints.PROJECT_LIST_SEARCH)
def project_list(search):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps

    project_names = project_service.get_all_project_names()
    if search:
        project_names = [name for name in project_names if search.lower() in name.lower()]

    page, per_page, offset = get_page_args(page_parameter='page', per_page_parameter='per_page')
    pagination_projects = project_names[offset:offset + per_page]
    pagination = Pagination(page=page,
                            per_page=per_page,
                            total=len(project_names),
                            record_name="projects",
                            css_framework='bootstrap4')

    return render_template(template.PROJECT_LIST,
                           search_value=search,
                           projects=pagination_projects,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)


@projects.route(endpoints.PROJECT, methods=['GET', 'DELETE', 'PATCH'])
def project(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps

    if request.method == 'GET':
        metadata = project_service.get(project_id)
        return jsonify(metadata.to_json_response())
    elif request.method == 'PATCH':
        metadata = project_service.get(project_id)
        patch = request.json
        metadata.project_name = patch['projectName']
        project_service.save_or_update_metadata(metadata)
        return flask.Response(status=HTTPStatus.OK)
    else:
        project_service.delete(project_id)
        return flask.Response(status=HTTPStatus.OK)


@projects.route(endpoints.CREATE_PROJECT, methods=['POST'])
def create_project():
    check_previous_steps = path_checker.path_check_simulate_access(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps

    project_id = naming_utils.validate_id(request.json['projectId'])
    project_name = request.json['projectName']
    project_service.save_or_update_metadata(ProjectMetadata(project_id, project_name))
    return redirect(endpoints.EDIT_PROJECT.replace('<project_id>', project_id))


# API
@projects.route(endpoints.PROJECT_FINISHED, methods=['GET'])
def project_is_finished(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps

    if project_service.is_finished(project_id):
        return flask.Response(status=HTTPStatus.OK)
    return flask.Response(status=HTTPStatus.NO_CONTENT)


@projects.route(endpoints.PROJECT_IN_USE, methods=['GET'])
def project_in_use(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps
    return jsonify(finished=cookie_utils.is_project_in_use(project_id))


@projects.route(endpoints.PROJECT_DOWNLOAD, methods=['GET'])
def project_download(project_id: str):
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps
    return send_file(project_service.download_project(project_id), as_attachment=True)


@projects.route(endpoints.PROJECT_MANAGE_MODFLOW, methods=['PUT', 'DELETE', 'PATCH'])
def manage_modflow(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_accessing_selected_project(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    if request.method == 'PATCH':
        metadata = project_service.get(project_id)
        patch = request.json
        metadata.start_date = patch['startDate']
        metadata.lat = patch['lat']
        metadata.long = patch['long']
        patch['endDate'] = metadata.calculate_end_date()
        project_service.save_or_update_metadata(metadata)
        return patch
    elif request.method == 'PUT' and request.files:
        model = request.files['modelArchive']
        modflow_metadata = project_service.set_modflow_model(project_id, model)
        total_width, total_height, _ = modflow_utils.adapt_model_to_display(modflow_metadata)
        end_date = project_service.get(project_id).calculate_end_date()
        return jsonify(total_width=total_width, total_height=total_height, end_date=end_date,
                       **modflow_metadata.to_json())
    elif request.method == 'DELETE':
        project_service.delete_modflow_model(project_id)
        return flask.Response(status=HTTPStatus.OK)
    else:
        abort(400)


@projects.route(endpoints.PROJECT_MANAGE_WEATHER_FILE, methods=['PUT', 'DELETE'])
def upload_weather_file(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_accessing_selected_project(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    if request.method == 'PUT' and request.files:
        weather_file = request.files['weatherFile']
        weather_id = project_service.add_weather_file(project_id, weather_file)
        return jsonify(weather_id=weather_id)
    elif request.method == 'DELETE':
        weather_id = request.json['weatherId']
        project_service.delete_weather_file(project_id, weather_id)
        return flask.Response(status=HTTPStatus.OK)
    else:
        abort(400)


@projects.route(endpoints.PROJECT_MANAGE_HYDRUS, methods=['PUT', 'DELETE', 'PATCH'])
def manage_hydrus(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_accessing_selected_project(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    if request.method == 'PATCH':
        metadata = project_service.get(project_id)
        patch = request.json
        metadata.spin_up = int(patch['spinUp'])
        project_service.save_or_update_metadata(metadata)
        return flask.Response(status=HTTPStatus.OK)
    elif request.method == 'PUT' and request.files:
        archive = request.files['modelArchive']
        hydrus_id = project_service.add_hydrus_model(project_id, archive)
        return jsonify(hydrus_id=hydrus_id)
    elif request.method == 'DELETE':
        hydrus_id = request.json['hydrusId']
        project_service.delete_hydrus_model(project_id, hydrus_id)
        return flask.Response(status=HTTPStatus.OK)
    else:
        abort(400)


@projects.route(endpoints.MANUAL_SHAPE, methods=['GET', 'PUT', 'DELETE'])
def manual_shapes(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_modflow_model(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    if request.method == 'PUT':
        shape_id = request.json['shapeId']
        new_shape_id = request.json.get('newShapeId') or shape_id
        shape_mask = request.json.get('shapeMask')
        color = request.json.get('color')
        project_service.save_or_update_shape(project_id, shape_id, shape_mask, color, new_shape_id)
        return flask.Response(status=HTTPStatus.OK)
    elif request.method == 'GET':
        return project_service.get_all_shapes(project_id)
    else:
        shape_id = request.json['shapeId']
        project_service.delete_shape(project_id, shape_id)
        return flask.Response(status=HTTPStatus.OK)


@projects.route(endpoints.RCH_SHAPES, methods=['PUT'])
def rch_shapes(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_modflow_model(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps
    return project_service.add_rch_shapes(project_id)


@projects.route(endpoints.MAP_SHAPE_RECHARGE, methods=['PUT'])
def map_shape_to_hydrus(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_modflow_model(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    shape_id = request.json['shapeId']
    hydrus_id = request.json.get('hydrusId')
    recharge_value = request.json.get('rechargeValue')
    if hydrus_id is not None:
        project_service.map_shape_to_hydrus(project_id, shape_id, hydrus_id)
        return flask.Response(status=HTTPStatus.OK)
    elif recharge_value is not None:
        project_service.map_shape_to_manual_value(project_id, shape_id, float(recharge_value))
        return flask.Response(status=HTTPStatus.OK)
    else:
        project_service.remove_shape_mapping(project_id, shape_id)
        return flask.Response(status=HTTPStatus.OK)


@projects.route(endpoints.MAP_WEATHER_FILE_TO_HYDRUS, methods=['PUT'])
def map_weather_to_hydrus(project_id: str):
    cookie = request.cookies.get(cookie_utils.COOKIE_NAME)
    check_previous_steps = path_checker.path_check_for_modflow_model(cookie, project_id)
    if check_previous_steps:
        return check_previous_steps

    hydrus_id = request.json['hydrusId']
    weather_id = request.json.get('weatherId')
    if weather_id is not None:
        project_service.map_hydrus_to_weather_file(project_id, hydrus_id, weather_id)
        return flask.Response(status=HTTPStatus.OK)
    else:
        project_service.remove_weather_hydrus_mapping(project_id, hydrus_id)
        return flask.Response(status=HTTPStatus.OK)
