from fastapi import Request, HTTPException


def get_user_id_from_request(request: Request) -> str:
    user_id = request.headers.get("x-user-id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user_id
