from typing import Optional

from flask import Response, redirect

from hmse_projects.project_dao import project_dao
from server import endpoints, cookie_utils
from server.cookie_utils import did_user_select_project
from server.typing_help import UserID, ProjectID


def path_check_cookie(cookie: UserID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @return: Optional redirect to main page with getting cookie.
    """

    if cookie is not None:
        return redirect(endpoints.HOME)
    return None


def path_check_simulate_access(cookie: UserID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @return: Optional redirect to configuration if no paths for Hydrus and Modflow are specified.
    """

    check_previous = path_check_cookie(cookie)
    if check_previous:
        return check_previous

    # Here carry out check for local executables or delete for other deployments
    pass

    return None


# TODO: Probably to delete
def path_check_for_selected_project(cookie: UserID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @return: Optional redirect to first incorrect step up to upload_modflow (first step).
    """

    check_previous = path_check_simulate_access(cookie)
    if check_previous:
        return check_previous

    if not did_user_select_project(cookie):
        return redirect(endpoints.PROJECT_LIST)

    return None


def path_check_for_modflow_model(cookie: UserID, project_id: ProjectID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @param project_id: Projects ID from url.
    @return: Optional redirect to first incorrect step up to upload_hydrus.
    """

    # check_previous = path_check_for_selected_project(cookie)
    check_previous = path_check_simulate_access(cookie)
    if check_previous:
        return check_previous

    project_id = cookie_utils.get_project_id_by_cookie(cookie)
    metadata = project_dao.read_metadata(project_id)
    if not metadata.modflow_model:
        # TODO: error
        # state.activate_error_flag()
        return redirect(endpoints.UPLOAD_HYDRUS)

    return None



# TODO: Move elsewhere
# used in url_for(), requires base address of endpoint (for future)
def _format_endpoint_to_url(endpoint: str):
    return endpoint[1:].replace('-', '_')
