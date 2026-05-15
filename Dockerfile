# Frontend build 
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build


# Downloading the official and super-light image with Python pre-installed
FROM  python:3.12-slim

# Env variable to avoid store .pyc cache
ENV PYTHONDONTWRITEBYTECODE=1

# Env var to make sure the logs are shown in real time
ENV PYTHONUNBUFFERED=1

# Env var to normalize the timezone
ENV TZ=UTC

# Create the workspace in the container
WORKDIR /code

# Copy the reqs file into the current directory
COPY requirements.txt .

# Install requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app content in a new created folder inside /code
COPY ./app /code/app

# Create and reference the dist folder
RUN mkdir -p /code/frontend/dist
COPY --from=frontend-build /frontend/dist /code/frontend/dist

# Create a user named aduser, no pass, no additional questions
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /code 

# Change to the just created user
USER appuser


# Inform that the port we will be using is: 8000
EXPOSE 8000

# Execute the initialization command in "Exec form" to avoid crashes
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

