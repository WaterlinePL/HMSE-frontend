# HMSE-frontend

This is the Kubernetes branch of Hydrus-Modflow-Synergy-Engine frontend.

## Building Docker image
```
docker build -t watermodelling/hmse-k8s:<tag> .
```

## Installation/Deploying HMSE
In order to deploy the Kubernetes deployment of HMSE:
1. Deploy MinIO in the cluster
2. Deploy Airflow in the cluster
3. Create secret for MinIO and Airflow in the cluster (their names are defined in `web-app-deployment.yaml` 
but you can change them if you want)
4. Deploy HMSE in the cluster (`hydros-apps-ns.yaml` and `web-app-deployment.yaml`)
