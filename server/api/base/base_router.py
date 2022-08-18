import uuid

from flask import make_response, render_template, request, Blueprint
from werkzeug.utils import redirect

from server import endpoints, cookie_utils, template

base = Blueprint('base', __name__)


@base.route('/')
def start():
    return redirect(endpoints.HOME)
    # return render_template('editProjectAlpha.html')


@base.route(endpoints.HOME, methods=['GET'])
def home():
    res = make_response(render_template(template.HOME))
    if not request.cookies.get(cookie_utils.COOKIE_NAME):
        cookie = str(uuid.uuid4())
        res.set_cookie(cookie_utils.COOKIE_NAME, cookie, max_age=cookie_utils.COOKIE_AGE)
    return res
