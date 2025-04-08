from flask import Flask, render_template, redirect, url_for, request, session
from flask_session import Session  # Importación corregida
import os

app = Flask(__name__)

# Configuración de sesiones
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)  

#fuera del deployd
from flask_app_rest import app as rest_app
# from .flask_app_rest import app as rest_app
app.register_blueprint(rest_app)

# @app.route("/")
# def inicio():
#     return render_template("index.html")


# Iniciar la aplicación en modo debug
if __name__ == "__main__":
    app.config['DEBUG'] = True
    app.run(port=5000)
