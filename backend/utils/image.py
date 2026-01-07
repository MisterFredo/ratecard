from io import BytesIO
from PIL import Image


def to_rectangle_16_9(
    img_bytes: bytes,
    width: int = 1200,
    height: int = 675,
) -> bytes:
    """
    Normalise une image en rectangle 16:9 (par défaut 1200x675)
    avec crop centré intelligent.
    """
    img = Image.open(BytesIO(img_bytes)).convert("RGB")

    target_ratio = width / height
    img_ratio = img.width / img.height

    if img_ratio > target_ratio:
        # trop large → crop horizontal
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        img = img.crop((left, 0, left + new_width, img.height))
    else:
        # trop haut → crop vertical
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        img = img.crop((0, top, img.width, top + new_height))

    img = img.resize((width, height), Image.LANCZOS)

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=90)

    return buf.getvalue()
