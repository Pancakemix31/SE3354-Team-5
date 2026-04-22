import json
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from news_fetcher import get_news
from news_summarizer import summarize_news_article

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PreferencesRequest(BaseModel):
    preferences: list[Any]


def normalize_preferences(preferences):
    normalized = []
    for item in preferences:
        if isinstance(item, dict):
            value = item.get("topic") or item.get("preference") or item.get("name")
            count = item.get("frequency") or item.get("count") or 1
            if value:
                normalized.extend([str(value).strip().lower()] * int(count))
        else:
            normalized.append(str(item).strip().lower())
    return [item for item in normalized if item]


def parse_summary(raw_text):
    if raw_text is None:
        return {}
    text = str(raw_text).strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw_summary": text}


def summarize_preference_articles(preference):
    articles = []
    try:
        articles = get_news(preference)
        if not articles:
            return {"preference": preference, "summary": None, "articles": []}

        summary_text = summarize_news_article(preference, articles)
        return {
            "preference": preference,
            "articles": articles,
            "summary": parse_summary(summary_text),
        }
    except Exception as error:
        return {
            "preference": preference,
            "articles": articles,
            "summary": {"error": str(error)},
        }


@app.post("/api/v1/news-summary")
def news_summary(body: PreferencesRequest):
    preferences = body.preferences
    normalized_preferences = normalize_preferences(preferences)
    if not normalized_preferences:
        raise HTTPException(status_code=400, detail="No valid preferences were provided.")

    unique_preferences = list(set(normalized_preferences))

    preference_summaries = [summarize_preference_articles(pref) for pref in unique_preferences]

    return {
        "preferences": [
            {"preference": pref, "count": 1}
            for pref in unique_preferences
        ],
        "preference_summaries": preference_summaries,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")

