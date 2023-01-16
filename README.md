# HMSE-frontend

This is the `docker` branch that contains docker version of the HMSE application.

## Building image
Before building image please make sure that submodules are initialized.

```bash
docker build -t watermodelling/hmse-docker:<tag> .
```

## Running image
Image can be easily run using docker-in-docker and `docker-compose.yml` in the main directory .

```bash
docker compose up
```
