from typing import Optional

from flask import Response, redirect

from hmse_simulations.hmse_projects.project_dao import project_dao
from hmse_simulations.hmse_projects.project_exceptions import UnsetModflowModelError
from server import endpoints, cookie_utils
from server.typing_help import UserID, ProjectID


def path_check_cookie(cookie: UserID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @return: Optional redirect to main page with getting cookie.
    """

    if cookie is None:
        return redirect('/')
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

    return None


def path_check_for_accessing_selected_project(cookie: UserID, project_id: ProjectID):
    check_previous = path_check_simulate_access(cookie)
    if check_previous:
        return check_previous

    true_user_project_id = cookie_utils.get_project_id_by_cookie(cookie)
    if cookie_utils.is_project_in_use(project_id) and true_user_project_id != project_id:
        # TODO: message that project is used by someone else?
        if true_user_project_id is not None:
            return redirect(endpoints.edit_project_endpoint(project_id))
        return redirect(endpoints.PROJECT_LIST)

    return None


def path_check_for_modflow_model(cookie: UserID, project_id: ProjectID) -> Optional[Response]:
    """
    @param cookie: Cookie with user ID.
    @param project_id: Projects ID from url.
    @return: Optional redirect to first incorrect step up to upload_hydrus.
    """

    check_previous = path_check_for_accessing_selected_project(cookie, project_id)
    if check_previous:
        return check_previous

    metadata = project_dao.read_metadata(project_id)

    if not metadata.modflow_metadata:
        raise UnsetModflowModelError()

    return None


# TODO: Move elsewhere
# used in url_for(), requires base address of endpoint (for future)
def _format_endpoint_to_url(endpoint: str):
    return endpoint[1:].replace('-', '_')
