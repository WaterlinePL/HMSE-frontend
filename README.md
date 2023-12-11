# HMSE-frontend

This is the branch of Hydrus-Modflow-Synergy-Engine frontend related to the desktop deployment.

## Installation
This deployment is dedicated for the Windows OS (tested on Windows 10), as it requires hydrological software to be 
already installed and HYDRUS-1D is distributed by default only under Windows OS.
  1. Find latest version of desktop version in the Github [releases](https://github.com/WaterlinePL/HMSE-frontend/releases). 
Currently, the newest software release is version [1.0.0](https://github.com/WaterlinePL/HMSE-frontend/releases/tag/desktop-1.0.0)
  2. Download the .zip archive `hmse-desktop-<version>.zip` (available [here](https://github.com/WaterlinePL/HMSE-frontend/releases/download/desktop-1.0.0/hmse-desktop-1.0.0.zip))
  3. Unpack .zip archive
  4. Launch `hmse.exe` (in archive: `hmse/hmse.exe`)
  5. Complete configuration from the next section

### Application configuration
In order to run a simulation in the application, the user must download following two programs:
* [MODFLOW-2005](https://www.usgs.gov/software/modflow-2005-usgs-three-dimensional-finite-difference-ground-water-model)
* [HYDRUS-1D](https://www.pc-progress.com/en/Default.aspx?H1d-downloads) (requires registration)

When accessing simulation, the application will redirect to the configuration page and will prompt for the paths to 
executables for the programs mentioned above. Currently, there is no other way of providing the path to executables due 
to local storage access policy of web browsers (web browser cannot access local file system).

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


