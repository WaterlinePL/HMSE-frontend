import json
import logging
import os
import shutil
from typing import Tuple
from zipfile import ZipFile

import numpy as np
from flask import request, render_template
from werkzeug.exceptions import abort
from werkzeug.utils import redirect

from hmse_hydrological_models import model_utils
from hmse_hydrological_models.modflow import modflow_utils
from hmse_hydrological_models.modflow.modflow_dao import modflow_model_dao
from hmse_simulations.hmse_projects import mask_dao
from hmse_simulations.hmse_projects.project_dao import project_dao
from server import cookie_utils, endpoints, template, path_formatter


def upload_modflow_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    # if there is no active project, we cannot upload a model TODO: change that
    if state.loaded_project is None:
        return redirect(endpoints.PROJECT_LIST)

    model = request.files['archive-input']  # matches HTML input name
    filename = path_formatter.fix_model_name(model.filename)  # TODO: Closer look at that

    if model_utils.type_allowed(model.filename):
        # TODO: Make temporary file and extract
        archive_path = ""  # TODO: Temporary file
        with ZipFile(archive_path, 'r') as archive:
            # get the model name and remember it
            model_name = __separate_model_name(filename)[0]

            # TODO: Put Modflow model somewhere: model storage or project - maybe split into 2 endpoints
            model_path = ""  # TODO

            # validate model
            invalid_model = not modflow_utils.validate_model(model_path)

        os.remove(archive_path)
        if invalid_model:
            shutil.rmtree(model_path, ignore_errors=True)  # remove invalid model dir
            return abort(500)

        # if model is valid, read its parameters and store them
        model_data = modflow_model_dao.get_model_data_from_model(model_name)

        model_shape = (model_data.rows, model_data.cols)
        state.recharge_masks = modflow_utils.get_shapes_from_rch(model_path, model_shape)

        # update project JSON
        project_metadata = state.loaded_project
        project_metadata.modflow_model = model_name
        project_metadata.rows = model_data.rows
        project_metadata.cols = model_data.cols
        project_metadata.grid_unit = model_data.grid_unit
        project_metadata.row_cells = model_data.row_cells
        project_metadata.col_cells = model_data.col_cells

        project_dao.save_or_update(project_metadata)

        logging.log(logging.INFO, "Modflow model uploaded successfully")
        return redirect(endpoints.UPLOAD_MODFLOW)

    else:
        logging.log(logging.WARN, f"Invalid archive format, must be a .zip file")
        return abort(500)


def upload_weather_file_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    # TODO: storage weather data without applying it (so that Hydrus model is not destroyed forever)

    return "Success", 200


def remove_modflow_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    model_name = request.json['modelName']
    if model_name:
        project_dao.delete_modflow_model(state.loaded_project.project_id, model_name)
    return redirect(endpoints.UPLOAD_MODFLOW, code=303)


# FIXME: Way too long, needs to be in submodule
def upload_hydrus_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    models = request.files.getlist('archive-input')

    error = None
    error_idx = 0
    start_count = len(state.loaded_project.hydrus_models)

    for i, model in enumerate(models):

        filename = path_formatter.fix_model_name(model.filename)
        if model_utils.type_allowed(filename):
            # TODO: Put Modflow model somewhere: model storage or project - maybe split into 2 endpoints
            pass

    logging.log(logging.INFO, "Hydrus model uploaded successfully")
    return redirect(endpoints.UPLOAD_HYDRUS)


def __separate_model_name(filename: str) -> Tuple[str, str]:
    """
    Separates filename and its extension
    @param filename: name of the file including the extension
    @return: Tuple of 2 strings: (name of the file, extension)
    """
    split = filename.split('.')
    return '.'.join(split[:-1]), split[-1]


def remove_hydrus_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    hydrus_model_name = request.json['modelName']

    logging.log(logging.INFO, "received call")
    logging.log(logging.INFO, hydrus_model_name)

    if hydrus_model_name:
        # also deletes mask
        project_dao.delete_hydrus_model(state.loaded_project.project_id, hydrus_model_name)
        if hydrus_model_name in state.loaded_shapes.keys():
            del state.loaded_shapes[hydrus_model_name]
        if hydrus_model_name in state.models_masks_ids.keys():
            del state.models_masks_ids[hydrus_model_name]
    return redirect(endpoints.UPLOAD_HYDRUS, code=303)


def upload_shape_handler(hydrus_model_index):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    # TODO: Not here, unexpected place
    # if not yet done, initialize the shape arrays list to the amount of models
    if len(state.loaded_shapes) < len(state.loaded_project.hydrus_models):
        for hydrus_model in state.loaded_project.hydrus_models:
            state.loaded_shapes[hydrus_model] = None

    # read the array from the request and store it
    hydrus_model = state.loaded_project.hydrus_models[hydrus_model_index]
    shape_array = np.array(request.json)
    state.loaded_shapes[hydrus_model] = shape_array

    mask_dao.save_or_update(state.loaded_project.project_id, hydrus_model, shape_array)
    return json.dumps({'status': 'OK'})


def next_model_redirect_handler(hydrus_model_index, error_flag):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    # check if we still have models to go, if not, redirect to next section
    if hydrus_model_index >= len(state.loaded_project.hydrus_models):
        for key in state.loaded_shapes:
            logging.log(logging.INFO, key, '->\n', state.loaded_shapes[key])
        return redirect(endpoints.SIMULATION)

    else:
        rows_height, cols_width = modflow_utils.scale_cells_size(state.loaded_project.row_cells,
                                                                 state.loaded_project.col_cells,
                                                                 max_width=500)
        return render_template(
            template.DEFINE_SHAPES,
            rowAmount=state.loaded_project.rows,
            colAmount=state.loaded_project.cols,
            rows=[str(x) for x in range(state.loaded_project.rows)],
            cols=[str(x) for x in range(state.loaded_project.cols)],
            cols_width=cols_width,
            rows_height=rows_height,
            modelIndex=hydrus_model_index,
            modelName=state.loaded_project.hydrus_models[hydrus_model_index],
            upload_error=error_flag
        )


def next_shape_redirect_handler(rch_shape_index: int):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    if rch_shape_index >= len(state.recharge_masks):
        state.get_shapes_from_masks_ids()
        for key in state.loaded_shapes:
            logging.log(logging.INFO, f"{key} ->\n', state.loaded_shapes[key].shape_mask")
        return redirect(endpoints.SIMULATION)
    else:
        current_model = state.get_current_model_by_id(rch_shape_index)
        rows_height, cols_width = modflow_utils.scale_cells_size(state.loaded_project.row_cells,
                                                                 state.loaded_project.col_cells,
                                                                 max_width=500)
        return render_template(template.RCH_SHAPES,
                               hydrus_models=state.loaded_project.hydrus_models,
                               shape_mask=state.recharge_masks[rch_shape_index],
                               rch_shape_index=rch_shape_index,
                               rows_height=rows_height,
                               cols_width=cols_width,
                               current_model=current_model)


def assign_model_to_shape(req, rch_shape_index):
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    hydrus_model_name = req.json["hydrusModel"]
    previous_hydrus_model_name = req.json["previousModel"]

    if previous_hydrus_model_name:
        state.models_masks_ids[previous_hydrus_model_name].remove(rch_shape_index)

    if hydrus_model_name == "":
        return json.dumps({'status': 'OK'})

    if hydrus_model_name not in state.models_masks_ids or state.models_masks_ids[hydrus_model_name] is None:
        state.loaded_shapes[hydrus_model_name] = None   # FIXME
        state.models_masks_ids[hydrus_model_name] = [rch_shape_index]
    else:
        state.models_masks_ids[hydrus_model_name].append(rch_shape_index)

    return json.dumps({'status': 'OK'})


def simulation_summary_handler():
    state = cookie_utils.get_user_by_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))

    rows_height, cols_width = modflow_utils.scale_cells_size(state.loaded_project.row_cells,
                                                             state.loaded_project.col_cells,
                                                             max_width=500)

    return render_template(
        template.SIMULATION,
        modflow_proj=state.loaded_project.modflow_model,
        shapes=state.loaded_shapes,
        cols_width=cols_width,
        rows_height=rows_height,
    )
