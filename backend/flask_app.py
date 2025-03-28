from flask import Flask, send_from_directory
from flask_session import Session
from flask_app_rest import app as rest_app  
import os

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))


app = Flask(__name__, static_folder="../frontend/dist/fronted/browser/browser")


# Configuración de sesiones
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Registrar el Blueprint del servicio REST
app.register_blueprint(rest_app)

# Ruta principal para servir el archivo index.html
@app.route('/')
def index():
    return send_from_directory(os.path.join(app.static_folder, 'index.html'))

# Ruta para servir los archivos estáticos de Angular
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


if __name__ == "__main__":
    app.config['DEBUG'] = True
    app.run(port=5000)
