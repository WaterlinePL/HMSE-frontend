# Base
from hmse_simulations.hmse_projects.typing_help import ProjectID

HELP = '/home'
CONFIGURATION = '/configuration'

# Projects
CREATE_PROJECT = '/new-project'
PROJECT_LIST = '/project-list'
PROJECT_LIST_SEARCH = '/project-list/<search>'

PROJECT_DOWNLOAD = '/project/<project_id>/download'
PROJECT = '/project/<project_id>'
PROJECT_FINISHED = '/project/<project_id>/is-finished'
PROJECT_IN_USE = '/project/<project_id>/in-use'  # TODO

EDIT_PROJECT = '/project/<project_id>/edit'
PROJECT_MANAGE_HYDRUS = '/project/<project_id>/hydrus'
PROJECT_MANAGE_MODFLOW = '/project/<project_id>/modflow'
PROJECT_MANAGE_WEATHER_FILE = '/project/<project_id>/weather'
MANUAL_SHAPE = '/project/<project_id>/manual-shape'
RCH_SHAPES = '/project/<project_id>/rch-shape'
ZB_SHAPES = '/project/<project_id>/zb-shape'
SIMULATION_MODE = '/project/<project_id>/simulation-mode'

MAP_SHAPE_RECHARGE = '/project/<project_id>/map-shape-to-hydrus'
MAP_WEATHER_FILE_TO_HYDRUS = '/project/<project_id>/map-weather'

# Simulation
SIMULATION = '/simulation/<project_id>'
