# HMSE-frontend

This is the Kubernetes branch of Hydrus-Modflow-Synergy-Engine frontend.

## Installation/Deploying HMSE
HMSE software makes use of Airflow scheduler and a webserver deployment. The whole software installation process is
implemented as a Helm chart in [this repository](https://github.com/WaterlinePL/hmse-helm-chart) and instruction for its
deployment can be found [here](https://github.com/WaterlinePL/hmse-helm-chart/tree/1.0.0#installationdeploying-hmse).

## Development

### Building Docker image
```
docker build -t watermodelling/hmse-k8s:<tag> .
```


