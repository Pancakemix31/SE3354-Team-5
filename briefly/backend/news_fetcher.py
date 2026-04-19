from newsapi import NewsApiClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from typing import List, Dict

load_dotenv()

newsapi = NewsApiClient(api_key=os.getenv("NewsAPI_KEY"))


def get_news(query: str) -> List[Dict]:

    response = newsapi.get_everything(
        q=query,
        language="en",
        sort_by="publishedAt",
        page_size=100
    )

    articles = response.get("articles", [])

    if (len(articles) >= 10):
        articles = articles[:10]
    return articles