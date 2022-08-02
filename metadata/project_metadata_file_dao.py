from __future__ import annotations

import json
import os
import shutil

from metadata.hydrological_model_enum import HydrologicalModelEnum
from metadata.project_metadata import ProjectMetadata
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from server.user_state import UserState

ProjectName = str


# TODO: stuff below goes to another file
#  ----- weather file data keys -----

