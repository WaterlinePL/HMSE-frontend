import json

from flask import Flask
from werkzeug.exceptions import HTTPException

from config.app_config import URL_PREFIX
from server.api.base.base_router import base
from server.api.projects.projects_router import projects
from server.api.simulation.simulation_router import simulations

app = Flask("App")
app.register_blueprint(base, url_prefix=URL_PREFIX)
app.register_blueprint(projects, url_prefix=URL_PREFIX)
app.register_blueprint(simulations, url_prefix=URL_PREFIX)


@app.errorhandler(HTTPException)
def api_error_handler(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response


if __name__ == '__main__':
    # run flask app
    app.run(debug=True, host="0.0.0.0", port=8080)
