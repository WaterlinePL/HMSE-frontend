import json

from flask import Flask
from werkzeug.exceptions import HTTPException

from server.api.base.base_router import base
from server.api.projects.projects_router import projects

app = Flask("App")
app.register_blueprint(base)
app.register_blueprint(projects)


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
    app.run(debug=True, host="0.0.0.0", port=8079)
