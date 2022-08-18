from __future__ import annotations

from typing import TYPE_CHECKING, Optional, Dict, List

import numpy as np
from datapassing.shape_data import ShapeMetadata

if TYPE_CHECKING:
    from simulation.simulation_service import SimulationService
    from hmse_simulations.hmse_projects.project_metadata import ProjectMetadata


#############
#############
######## TODO: refactor the old version
#############
#############


HydrusModelName = str
HydrusModelIndices = List[int]


class UserState:

    def __init__(self):
        self.loaded_project: Optional[ProjectMetadata] = None
        self.simulation_service: Optional[SimulationService] = None
        self.current_method = None
        self.recharge_masks: List[np.ndarray] = []  # masks from .rch file
        self.models_masks_ids: Dict[HydrusModelName, HydrusModelIndices] = {}
        self.loaded_shapes: Dict[HydrusModelName, np.ndarray] = {}
        self._error_flag = False

    # TODO: get rid of stateful approach
    def setup(self) -> None:
        self.reset_project_data()

    # TODO: get rid of stateful approach
    def reset_project_data(self) -> None:
        self.loaded_project = None
        self.simulation_service = None
        self.current_method = None
        self.recharge_masks = []
        self.models_masks_ids = {}
        self.loaded_shapes = {}
        self._error_flag = False

    def get_error_flag(self) -> bool:
        error_flag = self._error_flag
        self._error_flag = False
        return error_flag

    def activate_error_flag(self):
        self._error_flag = True

    def set_simulation_service(self, simulation_service: SimulationService):
        self.simulation_service = simulation_service

    def set_method(self, method):
        if self.current_method != method:
            self.reset_shaping()
            self.current_method = method

    def reset_shaping(self):
        self.models_masks_ids = {}
        self.loaded_shapes = {}

    def get_current_model_by_id(self, rch_shape_index: int):
        current_model = None

        for hydrus_model in self.loaded_shapes:
            if self.models_masks_ids[hydrus_model] and rch_shape_index in self.models_masks_ids[hydrus_model]:
                current_model = hydrus_model

        return current_model

    # TODO: throw it elsewhere (shape related)
    def get_shapes_from_masks_ids(self):
        """
        models_masks_ids dictionary contains hydrus models names as a key and array of indexes as values.
        Array stores indexes of shapes in the recharge_mask array.
        This method for each hydrus model evaluates array of indexes to the shape mask and creates
        ShapeFileData object.
        :return: None
        """

        for hydrus_model in self.loaded_shapes:
            shapes_count = -1
            if self.models_masks_ids[hydrus_model]:
                shapes_count = len(self.models_masks_ids[hydrus_model])

            if shapes_count == 1:
                shape_mask = self.recharge_masks[self.models_masks_ids[hydrus_model][0]]

            elif shapes_count > 1:
                shape_mask = self.recharge_masks[self.models_masks_ids[hydrus_model][0]]
                for idx in range(1, shapes_count):
                    another_mask = self.recharge_masks[self.models_masks_ids[hydrus_model][idx]]
                    shape_mask = np.logical_or(shape_mask, another_mask)

            else:
                shape_mask = self.create_empty_mask()

            shape_metadata = ShapeMetadata(shape_mask, self.loaded_project.project_id, hydrus_model)
            self.loaded_shapes[hydrus_model] = shape_metadata
            daos.mask_dao.save_or_update(shape_metadata)

    # TODO: Probably move elsewhere
    def create_empty_mask(self) -> Optional[np.ndarray]:
        """
        Creates an empty shape mask as an NumPy array

        @return: a ShapeFileData instance with an empty mask the size of the currently loaded model,
            or None if no project is loaded
        """
        if not self.loaded_project:
            raise NoLoadedProjectException("Tried to create empty mask without loading a project!")
        else:
            return np.zeros((self.loaded_project.rows, self.loaded_project.cols))
