from typing import List

MAX_LENGTH = 20


def __words_without_spaces(id_to_parse: str) -> List[str]:
    return [word.lower().strip() for word in id_to_parse.split(' ')]

# TODO: probably to delete
def decode_name_from_id(resource_id: str):
    words = resource_id.split('-')
    words[0] = f"{words[0].upper()}{words[0][1:]}"  # First word starting from big letter
    return ' '.join(words)


def validate_id(id_to_parse: str):
    id_without_spaces = '-'.join(__words_without_spaces(id_to_parse))
    return id_without_spaces.replace('_', '-')
