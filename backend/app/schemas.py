from datetime import datetime

from pydantic import BaseModel, Field


class CardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    story: str = Field(..., min_length=1)


class CardOut(BaseModel):
    id: str
    type: str
    name: str
    story: str
    created_at: datetime


class SearchHit(BaseModel):
    id: str
    type: str
    name: str
    snippet: str


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchHit]


class UploadSummary(BaseModel):
    inserted: int
    names: list[str]
