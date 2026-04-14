import os
import jwt
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Request

from core.user.user_service import get_user_by_id

# 🔥 récupéré depuis Render
SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = "HS256"


# =========================================================
# CREATE TOKEN
# =========================================================

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=1),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# =========================================================
# DECODE TOKEN
# =========================================================

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


# =========================================================
# EXTRACT TOKEN FROM REQUEST
# =========================================================

def get_token_from_request(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization")

    if not auth:
        return None

    try:
        scheme, token = auth.split(" ")

        if scheme.lower() != "bearer":
            return None

        return token

    except Exception:
        return None


# =========================================================
# GET USER ID FROM REQUEST (🔥 VERSION SÉCURISÉE)
# =========================================================

def get_user_id_from_request(request: Request) -> Optional[str]:

    token = get_token_from_request(request)

    if not token:
        return None

    payload = decode_token(token)

    if not payload:
        return None

    user_id = payload.get("user_id")

    if not user_id:
        return None

    # 🔥 CHECK ACTIVE TOKEN (SESSION UNIQUE)
    user = get_user_by_id(user_id)

    if not user:
        return None

    if user.get("ACTIVE_TOKEN") != token:
        return None

    return user_id
