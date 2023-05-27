# HMSE-frontend

This is the Kubernetes branch of Hydrus-Modflow-Synergy-Engine frontend.

## Building Docker image
```
docker build -t watermodelling/hmse-k8s:<tag> .
```

## Installation/Deploying HMSE
In order to deploy the Kubernetes deployment of HMSE:
1. Deploy NFS provisioner (such as [nfs-ganesha-server-and-external-provisioner](https://github.com/kubernetes-sigs/nfs-ganesha-server-and-external-provisioner/tree/master/charts/nfs-server-provisioner)).
It is important to configure NFS provisioning with ReadWriteMany access mode and set it as default StorageClass. For the 
referenced provisioner desired setup can be achieved as follows:
---
./values.yaml
```yaml
persistence:
  accessMode: ReadWriteMany
  size: 10Gi    # suggested not going below 2Gi
storageClass:
  defaultClass: true
```
bash:
```
helm repo add nfs-ganesha-server-and-external-provisioner https://kubernetes-sigs.github.io/nfs-ganesha-server-and-external-provisioner/
helm install nfs-provisioner nfs-ganesha-server-and-external-provisioner/nfs-server-provisioner --values ./values.yaml
```
---
2. Create a S3 secret in the desired namespace according to the template, which can be found 
[here](https://github.com/WaterlinePL/HMSE-frontend/tree/k8s/helm/s3-secret.yaml).
3. Configure values present in the [values.yaml](https://github.com/WaterlinePL/HMSE-frontend/tree/k8s/helm/hmse/values.yaml): 

**Required:**
* airflow.airflow.variables:
  * update preprocessing value `s3-secret-name` (if created S3 secret from previous point under different name)
  * hmse-webserver.s3:
    * region - S3 region 
    * bucket - S3 bucket for storing project data

**Optional:**
* airflow.airflow.users:
  * username (for security reasons)
  * password (for security reasons)

For more configuration options reference values.yaml files present in charts and charts 
[here](https://github.com/WaterlinePL/HMSE-frontend/tree/k8s/helm/).
4. Deploy HMSE in the cluster:
```
cd helm
helm install hmse hmse -n <desired namespace with S3 secret>
```

**Important!**
Note that this setup is simplified, as Airflow should be configured with secrets for its components and may not be safe 
in production environment. 