import json
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from news_fetcher import get_news
from news_summarizer import summarize_news_article

app = FastAPI()


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
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        return {"raw_summary": raw_text}


def summarize_preference_articles(preference):
    articles = get_news(preference)
    if not articles:
        return {"preference": preference, "summary": None, "articles": []}

    summary_text = summarize_news_article(preference, articles)
    return {
        "preference": preference,
        "articles": articles,
        "summary": parse_summary(summary_text),
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

