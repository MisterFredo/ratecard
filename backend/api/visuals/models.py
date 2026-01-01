from pydantic import BaseModel

class VisualUploadResponse(BaseModel):
    media_id_original: str
    media_id_rect: str
    media_id_square: str
    url_original: str
    url_rect: str
    url_square: str
