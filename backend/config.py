# backend/config.py
import os

# ---------------------------------------------------------
# BigQuery configuration
# ---------------------------------------------------------
# Les deux variables doivent être définies dans Render :
# - GOOGLE_CREDENTIALS_FILE -> /etc/secrets/bq.json
# - BQ_PROJECT -> "adex-5555"
# - BQ_DATASET -> "RATECARD"

BQ_PROJECT = os.getenv("BQ_PROJECT", "adex-5555")
BQ_DATASET = os.getenv("BQ_DATASET", "RATECARD")

# ---------------------------------------------------------
# Mode environnement
# ---------------------------------------------------------
ENV = os.getenv("ENV", "local")

