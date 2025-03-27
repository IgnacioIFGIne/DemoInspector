from flask import Flask
from flask_session import Session
from backend.flask_app_rest import app as rest_app  # Importación correcta

app = Flask(__name__)

# Configuración de sesiones
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Registrar el Blueprint del servicio REST
app.register_blueprint(rest_app)

if __name__ == "__main__":
    app.config['DEBUG'] = True
    app.run(port=5000)
