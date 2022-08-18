from flask import Flask

from server.api.base.base_router import base
from server.api.projects.projects_router import projects

app = Flask("App")
app.register_blueprint(base)
app.register_blueprint(projects)

if __name__ == '__main__':
    # run flask app
    app.run(debug=True, host="0.0.0.0", port=8080)
