import jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "CHANGE_ME_SUPER_SECRET"
ALGORITHM = "HS256"


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=1),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None


# 🔥 NEW
def get_user_id_from_request(request) -> Optional[str]:
    auth = request.headers.get("Authorization")

    if not auth:
        return None

    try:
        scheme, token = auth.split(" ")
        if scheme.lower() != "bearer":
            return None

        payload = decode_token(token)
        if not payload:
            return None

        return payload.get("user_id")
    except Exception:
        return None
