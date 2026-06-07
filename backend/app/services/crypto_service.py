from cryptography.fernet import Fernet
import os

# For a production system, this key should be loaded securely from an environment variable.
# We'll generate one and keep it static for demonstration purposes, or load from ENV if available.
SECRET_KEY = os.environ.get("AES_SECRET_KEY", Fernet.generate_key())
cipher = Fernet(SECRET_KEY)

def encrypt_pdf(file_bytes: bytes) -> bytes:
    """Encrypts raw PDF bytes using AES-256 (Fernet)."""
    return cipher.encrypt(file_bytes)

def decrypt_pdf(encrypted_bytes: bytes) -> bytes:
    """Decrypts encrypted PDF bytes."""
    return cipher.decrypt(encrypted_bytes)
