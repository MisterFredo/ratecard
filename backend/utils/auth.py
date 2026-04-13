import jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "CHANGE_ME_SUPER_SECRET"  # 🔥 à mettre en env plus tard
ALGORITHM = "HS256"


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=1),
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return token


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
