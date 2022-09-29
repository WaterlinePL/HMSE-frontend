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
