# Descargamos imagen oficial super ligera que contiene Python
FROM  python:3.12-slim

# Variable de entorno para evitar almacenar caché .pyc
ENV PYTHONDONTWRITEBYTECODE=1

# Variable de entrno para asegurarnos que los logs se muestren en tiempo real
ENV PYTHONUNBUFFERED=1

# Variable de entorno para normalizar el timezone
ENV TZ=UTC

# Creamos el directorio de trabajo en el contenedor
WORKDIR /code

# Copiamos el archivo de requerimientos en el directorio actual
COPY requirements.txt .

# Instalamoslos requerimientos
RUN pip install --no-cache-dir -r requirements.txt

#Copiamos el contenido de la app en la nueva carpeta que creamos
COPY ./app /code/app

# Creamos un usuario llamado appuser, sin contrasena ni datos adicionales 
RUN adduser --disabled-password --gecos '' appuser

# Cambiamos al usuario recien creado
USER appuser

# Informamos que el puerto a utilizar es el 8000
EXPOSE 8000

# Ejecutamos el comando de inicialización del backend en Exec form para evitar crasheos
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]