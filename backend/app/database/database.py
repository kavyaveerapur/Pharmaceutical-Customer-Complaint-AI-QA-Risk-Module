import logging
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

MYSQL_URL = (
    f"mysql+pymysql://{settings.DB_USER}:"
    f"{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}:"
    f"{settings.DB_PORT}/"
    f"{settings.DB_NAME}"
)

SQLITE_URL = "sqlite:///./complaints.db"

try:
    engine = create_engine(MYSQL_URL, echo=False)
    # Test connection
    with engine.connect() as conn:
        logger.info("Connected to MySQL database successfully.")
except Exception as e:
    logger.warning(f"Could not connect to MySQL ({e}). Falling back to SQLite database at {SQLITE_URL}")
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)