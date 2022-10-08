import json
import os
from dataclasses import dataclass

CONFIG_FILENAME = "config.json"


@dataclass
class AppConfig:
    ...

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


def update_config(config: AppConfig):
    global __app_config
    __app_config = config
    __app_config.save()


def get_config() -> AppConfig:
    return __app_config


__app_config = AppConfig.setup()
