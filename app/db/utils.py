import hashlib

def hash_username(username: str) -> str:
    return hashlib.sha256(username.encode())