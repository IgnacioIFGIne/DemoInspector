from flask import Flask
from flask_session import Session
from backend.flask_app_rest import app as rest_app  
import os

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
