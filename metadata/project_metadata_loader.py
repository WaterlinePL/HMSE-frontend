import os


from hmse_hydrological_models import modflow_utils
from hmse_projects import mask_dao
from hmse_projects.project_metadata import ProjectMetadata
from server.user_state import UserState


def load_metadata_to_state(state: UserState, chosen_project: ProjectMetadata) -> None:
    # clear old data and load new project
    state.reset_project_data()
    state.loaded_project = chosen_project

    _try_load_modflow_data(state)
    _try_load_hydrus_masks(state, chosen_project)


def _try_load_modflow_data(state: UserState):
    if state.loaded_project.modflow_model:
        nam_file_name = modflow_utils.get_nam_file(state.loaded_project.project_id)
        model_data = modflow_utils.get_model_data(state.loaded_project.project_id, nam_file_name)
        model_shape = (model_data.rows, model_data.cols)
        state.recharge_masks = modflow_utils.get_shapes_from_rch(nam_file_name, model_shape)


def _try_load_hydrus_masks(state: UserState, project_metadata: ProjectMetadata):
    if state.loaded_project.hydrus_models:
        state.loaded_shapes = mask_dao.read_all_for_project(project_metadata.project_id)
