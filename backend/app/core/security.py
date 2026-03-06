from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

# Hackathon Speed: Hardcoding the secret key here for now. 
# (In a real production app, this goes in the .env file)
SECRET_KEY = "hkjuoUujwjhqwioqiwwqoid5ohhlVK876"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # Keep them logged in for 1 week

# Context for bcrypt password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt