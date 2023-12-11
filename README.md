# HMSE-frontend

This is the `docker` branch that contains docker version of the HMSE application.

## Installation/Running image
Image can be easily run using docker-in-docker and `docker-compose.yml` in the main directory. 
The manifest launches the latest version, but it can be customized by selecting other tag 
from [watermodelling/hmse-docker](https://hub.docker.com/repository/docker/watermodelling/hmse-docker) Dockerhub Repository. 

Link to the newest docker release can be found [here](https://github.com/WaterlinePL/HMSE-frontend/releases/tag/docker-1.0.0). 
To launch application, do as follows:
  1. Download [docker-compose.yml](https://github.com/WaterlinePL/HMSE-frontend/blob/docker/docker-compose.yml) manifest from repository (or copy it)
  2. Inside the directory with the `docker-compose.yml` run:
  ```bash
  docker compose up
  ```

## Development

### Building image
Before building image please make sure that submodules are initialized.

```bash
docker build -t watermodelling/hmse-docker:<tag> .
```

