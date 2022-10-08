# HMSE-frontend

This is the main branch of Hydrus-Modflow-Synergy-Engine frontend. It contains common compontents shared between all the deployments:
* desktop deployment (branch [`desktop`](https://github.com/WaterlinePL/HMSE-frontend/tree/desktop))
* docker deployment (branch [`docker`](https://github.com/WaterlinePL/HMSE-frontend/tree/docker)) - work in progress
* Kubernetes deployment (branch `k8s`) - TODO

In order to maintain more easily the code, frontend uses submodules that are dedicated for each deployment. 
Currently used submodules:
* [`hmse_simulations`](https://github.com/WaterlinePL/hmse_simulations/tree/main)
* [`hmse_projects`](https://github.com/WaterlinePL/hmse_projects/tree/main)
* [`hmse_hydrological_models`](https://github.com/WaterlinePL/hmse_hydrological_models/tree/main)

Each submodule is checked-out on the latest branch related to the deployment branch.


### Deploying
Each deployment has its own README on the related branch that describes how to launch particular 
version of the application.

### Development
Features that should be applied to all the deployments are developed on the `main` branch. 
After merging the pull request, synchronizing the deployment branches is carried out by creating branch 
`sync/<desktop|docker|k8s>` from the deployment branch and performing there merge with the `main` branch. 

Features that should be present only on a particular branch should be added as PRs to that branch.

If a feature should be applied only to two out of three deployments, it is advised to create a PR to one branch 
and cherry-pick to the other branch that same feature.

