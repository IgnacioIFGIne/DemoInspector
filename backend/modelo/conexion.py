import mysql.connector

def conectar():
    conexion = mysql.connector.connect(
        host = "localhost",
        user = "root",
        passwd = "",
        database = "ineco_inspector_db"
    )

    if conexion:
        print("conexion con la base de datos OK")
        return conexion
    else:
        print("error al conectar con la db, comprueba los datos de la conexion")