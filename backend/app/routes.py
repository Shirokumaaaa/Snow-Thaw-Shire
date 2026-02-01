import re
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase

from .auth import authenticate_admin, create_access_token, get_current_admin
from .db import get_db
from .schemas import CardCreate, CardOut, SearchResponse, SearchHit, UploadSummary

router = APIRouter()


@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> dict:
    if not authenticate_admin(form_data.username, form_data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(form_data.username, role="admin")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/admin/cards", response_model=CardOut)
async def create_card(
    payload: CardCreate,
    _admin: str = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> CardOut:
    doc = {
        "type": "思念",
        "name": payload.name,
        "story": payload.story,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.cards.insert_one(doc)
    return CardOut(id=str(result.inserted_id), **doc)


@router.post("/admin/cards/upload", response_model=UploadSummary)
async def upload_cards(
    files: list[UploadFile] = File(...),
    _admin: str = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UploadSummary:
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded")

    docs: list[dict] = []
    names: list[str] = []

    for file in files:
        filename = file.filename or "untitled.txt"
        name = Path(filename).stem or "untitled"
        raw = await file.read()
        story = raw.decode("utf-8", errors="ignore").strip()
        doc = {
            "type": "思念",
            "name": name,
            "story": story,
            "created_at": datetime.now(timezone.utc),
        }
        docs.append(doc)
        names.append(name)

    if not docs:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid files")

    result = await db.cards.insert_many(docs)
    return UploadSummary(inserted=len(result.inserted_ids), names=names)


@router.get("/articles/search", response_model=SearchResponse)
async def search_articles(
    q: str,
    types: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SearchResponse:
    query = q.strip()
    if not query:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query is required")

    regex = re.compile(re.escape(query), re.IGNORECASE)
    filter_query: dict = {"$or": [{"name": {"$regex": regex}}, {"story": {"$regex": regex}}]}
    if types:
        type_list = [item.strip() for item in types.split(",") if item.strip()]
        if type_list:
            filter_query["type"] = {"$in": type_list}

    cursor = db.cards.find(filter_query).limit(50)

    results: list[SearchHit] = []
    async for doc in cursor:
        snippets = _extract_snippets(doc.get("story", ""), regex, 40, 99)
        for snippet in snippets:
            results.append(
                SearchHit(
                    id=str(doc["_id"]),
                    type=doc.get("type", ""),
                    name=doc.get("name", ""),
                    snippet=snippet,
                )
            )

    return SearchResponse(query=query, total=len(results), results=results)


def _extract_snippets(text: str, regex: re.Pattern, window: int, max_snippets: int) -> list[str]:
    snippets: list[str] = []
    for match in regex.finditer(text):
        start = max(match.start() - window, 0)
        end = min(match.end() + window, len(text))
        snippet = text[start:end].replace("\n", " ").strip()
        if snippet:
            snippets.append(snippet)
        if len(snippets) >= max_snippets:
            break
    return snippets
