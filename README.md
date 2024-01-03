# HMSE-frontend


## Installation/deployment
Each deployment has its own installation guide in the README on the deployment-related branch:
* [desktop version installation guide](https://github.com/WaterlinePL/HMSE-frontend/tree/desktop#installation)
* [docker version installation guide](https://github.com/WaterlinePL/HMSE-frontend/tree/docker#installationrunning-image)
* [Kubernetes version installation guide](https://github.com/WaterlinePL/HMSE-frontend/tree/k8s#installationdeploying-hmse)

## Repository structure
This is the main branch of Hydrus-Modflow-Synergy-Engine frontend. It contains common components shared between all the deployments:
* desktop deployment (branch [`desktop`](https://github.com/WaterlinePL/HMSE-frontend/tree/desktop))
* docker deployment (branch [`docker`](https://github.com/WaterlinePL/HMSE-frontend/tree/docker))
* Kubernetes deployment (branch [`k8s`](https://github.com/WaterlinePL/HMSE-frontend/tree/k8s))

The installation manual can be found in the README on each of the deployments' branches.

In order to facilitate code maintenance, the frontend uses submodules that are dedicated for each deployment. 
Currently used submodules are as follows:
* [`hmse_simulations`](https://github.com/WaterlinePL/hmse_simulations/tree/main)
* [`hmse_projects`](https://github.com/WaterlinePL/hmse_projects/tree/main)
* [`hmse_hydrological_models`](https://github.com/WaterlinePL/hmse_hydrological_models/tree/main)

Each submodule is checked-out on the latest branch related to the deployment branch.

## Development
Features that should be applied to all the deployments are developed on the `main` branch. 
After merging the pull request, synchronizing the deployment branches is carried out by creating branch 
`sync/<desktop|docker|k8s>` from the deployment branch and performing there merge with the `main` branch. 

Features that should be present only on a particular branch should be added as PRs to that branch.

If a feature should be applied only to two out of three deployments, it is advised to create a PR to one branch 
and cherry-pick to the other branch that same feature.

