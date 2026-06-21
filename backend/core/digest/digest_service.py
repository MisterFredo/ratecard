from typing import (
    Dict,
    Any,
    List,
)

from uuid import uuid4

from utils.bigquery_utils import (
    query_bq,
)

from config import (
    BQ_PROJECT,
    BQ_DATASET,
)

from core.digest.content_service import (
    get_digest_contents,
    load_user_context,
)

TABLE_DIGEST = (
    f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_DIGEST"
)

TABLE_DIGEST_CONTENT = (
    f"{BQ_PROJECT}.{BQ_DATASET}.RATECARD_DIGEST_CONTENT"
)

# ============================================================
# CREATE DIGEST
# ============================================================

def create_digest(
    user_id: str,
    digest_name: str,
    period_start: str,
    period_end: str,
) -> Dict[str, Any]:

    pass


# ============================================================
# LIST DIGESTS
# ============================================================

def list_digests(
    user_id: str,
) -> List[Dict[str, Any]]:

    pass


# ============================================================
# GET DIGEST
# ============================================================

def get_digest(
    digest_id: str,
) -> Dict[str, Any]:

    pass


# ============================================================
# DELETE DIGEST
# ============================================================

def delete_digest(
    digest_id: str,
) -> Dict[str, Any]:

    pass


# ============================================================
# GENERATE SUMMARY
# ============================================================

def generate_summary(
    digest_id: str,
) -> Dict[str, Any]:

    pass


# ============================================================
# SEND DIGEST
# ============================================================

def send_digest(
    digest_id: str,
) -> Dict[str, Any]:

    pass
