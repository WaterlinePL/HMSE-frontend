from flask import Flask

app = Flask("App")

if __name__ == '__main__':
    # run flask app
    app.run(debug=True, host="0.0.0.0", port=8080)
