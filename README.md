# HMSE-frontend

This is the branch of Hydrus-Modflow-Synergy-Engine frontend related to the desktop deployment.

### Creating build using PyInstaller
Require software for building:
* Python 3.8
* pip
* pyinstaller

In order to create an executable from sources perform following commands in the root of the repository (on Windows OS):
```commandline
pip install -r requirements.txt
pyinstaller.exe --onedir -n hmse --paths ".\server" \
                --add-data ".\server\templates;templates" \
                --add-data ".\server\static;static"  \
                .\server\main.py
```

After creating a build with PyInstaller, the executable is located in the `dist` folder (`hmse.exe`).

### Running the application
In order to run a simulation in the application, the user must download following two programs:
* [MODFLOW-2005](https://www.usgs.gov/software/modflow-2005-usgs-three-dimensional-finite-difference-ground-water-model)
* [HYDRUS-1D](https://www.pc-progress.com/en/Default.aspx?H1d-downloads) (requires registration)

When accessing simulation, the application will redirect to the configuration page and will prompt for the paths to executables for the programs metioned above. Currently there is no other way of providing the path to executables due to local storage access policy of web browsers (web browser cannot access file system).
