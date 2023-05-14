# HMSE-frontend

This is the `docker` branch that contains docker version of the HMSE application.

## Installation
The 

## Installation/Running image
Image can be easily run using docker-in-docker and `docker-compose.yml` in the main directory. The manifest launches the latest version, but it can be customized by selecting other tag from [watermodelling/hmse-docker](https://hub.docker.com/repository/docker/watermodelling/hmse-docker) Dockerhub Repoistory. Launch application is as follows:
  1. Download `docker-compose.yml` manifest (or copy it)
  2. Inside the directory with the manifest run:
  ```bash
  docker compose up
  ```


## Building image
Before building image please make sure that submodules are initialized.

```bash
docker build -t watermodelling/hmse-docker:<tag> .
```

