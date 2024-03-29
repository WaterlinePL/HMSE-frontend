from __future__ import annotations

from collections import defaultdict
from typing import Dict, Optional

from hmse_simulations.hmse_projects.typing_help import ProjectID
from server.typing_help import UserID

COOKIE_NAME = 'user_id'
COOKIE_AGE = 60 * 60 * 24 * 365
__user_projects: Dict[UserID, ProjectID] = defaultdict()


def set_project_id_for_user(user_id: str, project_id: str):
    __user_projects[user_id] = project_id


def get_project_id_by_cookie(cookie: str) -> Optional[ProjectID]:
    return __user_projects.get(cookie)


def is_project_in_use(project_id: ProjectID):
    return project_id in __user_projects.values()
