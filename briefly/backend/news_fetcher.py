from newsapi import NewsApiClient
import os
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

newsapi = NewsApiClient(api_key=os.getenv("NewsAPI_KEY"))

REGION_HINTS = {
    "north america": '"United States" OR Canada OR Mexico',
    "europe": "Europe OR EU OR UK",
    "middle east": '"Middle East" OR UAE OR Saudi OR Qatar OR Israel',
    "asia pacific": '"Asia Pacific" OR Asia OR Australia OR Japan OR India',
    "latin america": '"Latin America" OR Brazil OR Mexico OR Argentina OR Chile',
    "africa": "Africa OR Nigeria OR Kenya OR Egypt OR South Africa",
}

def get_news(query: str, region: str = "Global") -> List[Dict]:
    normalized_region = str(region or "Global").strip().lower()
    region_hint = REGION_HINTS.get(normalized_region)
    scoped_query = query if not region_hint else f"({query}) AND ({region_hint})"

    articles = []
    query_candidates = []
    if scoped_query:
        query_candidates.append(scoped_query)
    if query and scoped_query != query:
        # Retry without strict region AND clause if scoped search is too narrow.
        query_candidates.append(query)
    if region_hint:
        # Region-only fallback catches broad regional headlines when topic query is sparse.
        query_candidates.append(region_hint)

    for candidate in query_candidates:
        response = newsapi.get_everything(
            q=candidate,
            language="en",
            sort_by="publishedAt",
            page_size=100
        )
        candidate_articles = response.get("articles", [])
        if candidate_articles:
            articles = candidate_articles
            break

    if (len(articles) >= 10):
        articles = articles[:10]
    return articles