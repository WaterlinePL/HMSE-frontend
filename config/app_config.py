import json
import os
from dataclasses import dataclass
from typing import Optional

CONFIG_FILENAME = "config.json"


@dataclass
class AppConfig:
    # modflow_program_path: Optional[str] = None
    # hydrus_program_path: Optional[str] = None

    def to_json(self):
        return self.__dict__

    def save(self):
        with open(CONFIG_FILENAME, 'w') as handle:
            json.dump(self.to_json(), handle, indent=2)

    @staticmethod
    def setup():
        if not os.path.exists(CONFIG_FILENAME):
            with open(CONFIG_FILENAME, 'w') as handle:
                json.dump(AppConfig().to_json(), handle, indent=2)

        with open(CONFIG_FILENAME, 'r') as handle:
            return AppConfig(**json.load(handle))


def get_config() -> AppConfig:
    return app_config


app_config = AppConfig.setup()
