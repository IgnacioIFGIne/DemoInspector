import psycopg2
import os

def conectar():
    # Obtener las credenciales de las variables de entorno configuradas en Render
    host = os.environ.get('DB_HOST')  # El host de la base de datos de Render
    user = os.environ.get('DB_USER')  # El usuario de la base de datos de Render
    password = os.environ.get('DB_PASSWORD')  # La contraseña de la base de datos de Render
    dbname = os.environ.get('DB_NAME')  # El nombre de la base de datos de Render

    try:
        # Conexión a PostgreSQL usando psycopg2
        conexion = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            dbname=dbname
        )
        print("Conexión con la base de datos PostgreSQL OK")
        return conexion
    except Exception as e:
        print(f"Error al conectar con la base de datos: {e}")
        return None
