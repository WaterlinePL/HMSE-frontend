import uuid
from http import HTTPStatus

import flask
from flask import make_response, render_template, request, Blueprint
from werkzeug.utils import redirect

from config import app_config
from config.app_config import AppConfig
from server import endpoints, cookie_utils, template, path_checker

base = Blueprint('base', __name__)


@base.route('/')
def start():
    res = make_response(redirect(endpoints.PROJECT_LIST))
    if not request.cookies.get(cookie_utils.COOKIE_NAME):
        cookie = str(uuid.uuid4())
        res.set_cookie(cookie_utils.COOKIE_NAME, cookie, max_age=cookie_utils.COOKIE_AGE)
    return res


@base.route(endpoints.CONFIGURATION, methods=['GET', 'PUT'])
def configuration():
    check_previous_steps = path_checker.path_check_cookie(request.cookies.get(cookie_utils.COOKIE_NAME))
    if check_previous_steps:
        return check_previous_steps
    if request.method == 'PUT':
        app_config.app_config = AppConfig(**request.json)
        app_config.app_config.save()
        return flask.Response(status=HTTPStatus.OK)

    return render_template(template.CONFIGURATION, app_config=app_config.app_config)
