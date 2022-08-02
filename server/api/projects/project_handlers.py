import json

from flask import request, render_template, jsonify
from flask_paginate import get_page_args, Pagination
from werkzeug.utils import redirect, send_file

from hmse_projects.project_dao import project_dao
from hmse_projects.project_exceptions import ProjectNotSelected, ProjectNotFound
from hmse_projects.project_metadata import ProjectMetadata
from metadata import project_metadata_loader
from server import cookie_utils, endpoints, template


def create_project_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    name = request.json['name']
    lat = request.json['lat']
    long = request.json["long"]
    start_date = request.json["start_date"]
    end_date = request.json["end_date"]
    spin_up = request.json["spin_up"]

    # Check for name collision
    lowercase_project_names = [name.lower() for name in project_dao.read_all_names()]
    if name.lower() in lowercase_project_names:
        return jsonify(error=str("A project with this name already exists (names are case-insensitive)")), 404

    project = ProjectMetadata(
        project_id=name,
        lat=lat,
        long=long,
        start_date=start_date,
        end_date=end_date,
        spin_up=spin_up)
    # # everything below here will be populated once modflow and hydrus models are loaded
    # "rows": None,
    # "cols": None,
    # "grid_unit": None,
    # "row_cells": [],
    # "col_cells": [],
    # "modflow_model": None,
    # "hydrus_models": []

    project_dao.save_or_update(project)
    state.reset_project_data()
    state.loaded_project = project
    return json.dumps({'status': 'OK'})


def get_projects(projects, offset=0, per_page=10):
    return projects[offset: offset + per_page]


def project_list_handler(search):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    project_names = project_dao.read_all_names()

    if search:
        project_names = [name for name in project_names if search.lower() in name.lower()]

    page, per_page, offset = get_page_args(page_parameter='page', per_page_parameter='per_page')
    pagination_projects = get_projects(projects=project_names, offset=offset, per_page=per_page)
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
                           pagination=pagination,
                           error_project_name=state.get_error_flag())


def remove_project_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    body = json.loads(request.data)

    if body['projectName']:
        project_name = body['projectName']
        project_dao.delete(project_name)

        if state.loaded_project == project_name:
            state.reset_project_data()

    return redirect(endpoints.PROJECT_LIST, code=303)


# TODO: function doing everything, bit big
def project_handler(project_name):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if project_name is None:
        # case 1 - there is already a project loaded and we just want to see it
        if state.loaded_project is not None:
            return render_template(template.PROJECT, project=state.loaded_project)
        # case 2 - there is no project loaded, the user should be redirected to the project list to select a project
        else:
            state.activate_error_flag()
            return redirect(endpoints.PROJECT_LIST)

    # case 3 - we're selecting a new project
    else:
        try:
            chosen_project = project_dao.read_metadata(project_name)
            project_metadata_loader.load_metadata_to_state(state, chosen_project)
            return render_template(template.PROJECT, project=chosen_project)

        # case 3a - the project does not exist
        except ProjectNotFound:
            state.activate_error_flag()
            return redirect(endpoints.PROJECT_LIST)


def project_is_finished_handler(project_name):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if project_name is not None:
        try:
            # Check if project exists
            project_dao.read_metadata(project_name)
        except ProjectNotFound:  # the project does not exist
            state.error_flag = True
            return redirect(endpoints.PROJECT_LIST)

        if project_dao.is_project_finished(project_id=project_name):
            return json.dumps({'status': 'OK'})

    elif state.loaded_project is not None:
        if project_dao.is_project_finished(project_id=state.loaded_project.project_id):
            return json.dumps({'status': 'OK'})

    return json.dumps({'status': 'No Content'})


def project_download_handler(project_name):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if project_name is not None:
        try:
            project = project_dao.read_metadata(project_name)
        except ProjectNotFound:  # the project does not exist
            state.error_flag = True
            return redirect(endpoints.PROJECT_LIST)
    else:
        project = state.loaded_project

    if project is not None:
        # project_dir = os.path.join(deployment_config.WORKSPACE_DIR, project.name)
        # zip_file = shutil.make_archive(project_dir, 'zip', project_dir)
        zip_file = project_dao.download_project(project_name)
        return send_file(zip_file,
                         as_attachment=True,
                         mimetype='application/zip')
    return '', 204


def edit_project_handler(project_name):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    try:
        project = project_dao.read_metadata(project_name)
        return render_template(
            template.CREATE_PROJECT,
            name=project_name,
            prev_lat=project.lat,
            prev_long=project.long,
            prev_start=project.start_date,
            prev_end=project.end_date,
            prev_spin_up=project.spin_up
        )
    except ProjectNotSelected:
        state.activate_error_flag()
        return redirect(endpoints.PROJECT_LIST)


def update_project_settings():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    project_id = request.json['name']
    try:
        project_metadata = project_dao.read_metadata(project_id)

        # Update metadata
        project_metadata.project_id = project_id
        project_metadata.lat = request.json['lat']
        project_metadata.long = request.json["long"]
        project_metadata.start_date = request.json["start_date"]
        project_metadata.end_date = request.json["end_date"]
        project_metadata.spin_up = request.json['spin_up']

        project_dao.save_or_update(project_metadata)
        return json.dumps({'status': 'OK'})

    except ProjectNotFound:
        state.activate_error_flag()
        return redirect(endpoints.PROJECT_LIST)