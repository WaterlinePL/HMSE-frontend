from typing import List

MAX_LENGTH = 20


def __words_without_spaces(id_to_parse: str) -> List[str]:
    return [word.lower().strip() for word in id_to_parse.split(' ')]


def validate_id(id_to_parse: str):
    id_without_spaces = '-'.join(__words_without_spaces(id_to_parse))
    return id_without_spaces.replace('_', '-')
