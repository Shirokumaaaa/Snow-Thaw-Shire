import os

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None


def get_db() -> AsyncIOMotorDatabase:
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        _client = AsyncIOMotorClient(mongo_uri)
    db_name = os.getenv("MONGO_DB", "snow_thaw")
    return _client[db_name]
