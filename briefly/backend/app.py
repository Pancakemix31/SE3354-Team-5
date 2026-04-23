import json
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from news_fetcher import get_news
from news_summarizer import summarize_news_article, answer_news_question, summarize_single_article

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PreferencesRequest(BaseModel):
    preferences: list[Any]
    region: str | None = "Global"
    summary_depth: str | None = "concise"


class NewsChatRequest(BaseModel):
    question: str
    preferences: list[Any]
    region: str | None = "Global"


class ArticleSummaryRequest(BaseModel):
    article: dict[str, Any]
    preference: str | None = "general"
    region: str | None = "Global"
    summary_depth: str | None = "concise"


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


def normalize_region(region):
    text = str(region or "Global").strip()
    return text if text else "Global"


def normalize_summary_depth(value):
    text = str(value or "concise").strip().lower()
    return "deep" if text == "deep" else "concise"


def summarize_preference_articles(preference, region, summary_depth):
    articles = []
    try:
        articles = get_news(preference, region)
        if not articles:
            return {"preference": preference, "region": region, "summary": None, "articles": []}

        summary_text = summarize_news_article(preference, articles, summary_depth)
        return {
            "preference": preference,
            "region": region,
            "summary_depth": summary_depth,
            "articles": articles,
            "summary": parse_summary(summary_text),
        }
    except Exception as error:
        return {
            "preference": preference,
            "region": region,
            "summary_depth": summary_depth,
            "articles": articles,
            "summary": {"error": str(error)},
        }


@app.post("/api/v1/news-summary")
def news_summary(body: PreferencesRequest):
    preferences = body.preferences
    region = normalize_region(body.region)
    summary_depth = normalize_summary_depth(body.summary_depth)
    normalized_preferences = normalize_preferences(preferences)
    if not normalized_preferences:
        raise HTTPException(status_code=400, detail="No valid preferences were provided.")

    unique_preferences = list(set(normalized_preferences))

    preference_summaries = [summarize_preference_articles(pref, region, summary_depth) for pref in unique_preferences]

    return {
        "preferences": [
            {"preference": pref, "count": 1}
            for pref in unique_preferences
        ],
        "region": region,
        "summary_depth": summary_depth,
        "preference_summaries": preference_summaries,
    }


@app.post("/api/v1/article-summary")
def article_summary(body: ArticleSummaryRequest):
    article = body.article or {}
    if not article.get("title") and not article.get("description") and not article.get("content"):
        raise HTTPException(status_code=400, detail="Article payload is required.")

    preference = str(body.preference or "general")
    region = normalize_region(body.region)
    summary_depth = normalize_summary_depth(body.summary_depth)

    try:
        raw = summarize_single_article(article, preference, region, summary_depth)
        parsed = parse_summary(raw)
    except Exception:
        # Deterministic fallback when Gemini is unavailable.
        base_text = str(article.get("description") or article.get("content") or "").strip()
        if not base_text:
            base_text = "No article body was available for summarization."
        if summary_depth == "concise":
            summary = base_text[:320] + ("..." if len(base_text) > 320 else "")
            key_points = ["Concise mode active.", "Switch to Deep mode for more context."]
        else:
            summary = (
                f"{article.get('title') or 'This story'} focuses on developments related to {preference} in {region}. "
                f"{base_text[:650]}{'...' if len(base_text) > 650 else ''} "
                "Broader implications should be monitored as updates unfold."
            )
            key_points = [
                "Deep mode active with added context and implications.",
                "Open the original source for full details and timeline.",
            ]
        parsed = {"summary": summary, "key_points": key_points}

    return {
        "summary_depth": summary_depth,
        "preference": preference,
        "region": region,
        "response": parsed,
    }


@app.post("/api/v1/news-chat")
def news_chat(body: NewsChatRequest):
    question = str(body.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="A question is required.")

    normalized_preferences = normalize_preferences(body.preferences)
    if not normalized_preferences:
        raise HTTPException(status_code=400, detail="No valid preferences were provided.")

    region = normalize_region(body.region)
    unique_preferences = list(dict.fromkeys(normalized_preferences))

    preference_articles = []
    for pref in unique_preferences[:5]:
        articles = get_news(pref, region)
        compact_articles = [
            {
                "title": article.get("title"),
                "source": (article.get("source") or {}).get("name"),
                "url": article.get("url"),
                "description": article.get("description"),
                "publishedAt": article.get("publishedAt"),
            }
            for article in (articles or [])[:6]
        ]
        preference_articles.append({
            "preference": pref,
            "articles": compact_articles,
        })

    try:
        raw = answer_news_question(question, region, preference_articles)
        parsed = parse_summary(raw)
    except Exception:
        # Fallback when Gemini is unavailable: return an evidence-only response.
        tokens = [
            t for t in str(question).lower().replace("?", " ").replace(",", " ").split()
            if len(t) > 2
        ]

        def score_article(article_obj):
            haystack = " ".join([
                str(article_obj.get("title") or ""),
                str(article_obj.get("description") or ""),
                str(article_obj.get("source") or ""),
            ]).lower()
            return sum(1 for token in tokens if token in haystack)

        citation_pool = []
        for bucket in preference_articles:
            for article in bucket.get("articles", []):
                citation_pool.append({
                    "title": article.get("title") or "Untitled",
                    "source": article.get("source") or "Source",
                    "url": article.get("url") or "",
                    "description": article.get("description") or "",
                    "preference": bucket.get("preference") or "",
                    "_score": score_article(article),
                })

        citation_pool.sort(key=lambda item: (item.get("_score", 0), item.get("title", "")), reverse=True)
        top = citation_pool[:6]
        preview_titles = ", ".join([c["title"] for c in top[:3]])
        preference_set = sorted({c.get("preference") for c in top if c.get("preference")})
        pref_line = ", ".join(preference_set) if preference_set else ", ".join(unique_preferences[:3])

        parsed = {
            "answer": (
                f"Briefly is currently in evidence mode, so this answer is built from recent headlines in "
                f"{region} across your selected topics ({pref_line}). "
                f"The most relevant stories right now include: {preview_titles}."
            ),
            "key_points": [
                "Ranked by relevance to your question and your active preferences.",
                "Open the linked sources for full article details.",
            ],
            "citations": [{"title": c["title"], "source": c["source"], "url": c["url"]} for c in top],
        }

    return {
        "question": question,
        "region": region,
        "preferences": unique_preferences,
        "response": parsed,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")

