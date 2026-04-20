# News Preference Article Generator Backend

This backend provides a simple Flask API that uses the existing `news_fetcher.py` and `news_summarizer.py` files to generate preference-based article summaries using multiple news sources.

## Endpoint

POST `/api/v1/news-summary`

### Request JSON

{
  "preferences": [
    "technology",
    "sports",
    {"topic": "politics", "frequency": 3}
  ]
}

### Response JSON

{
  "preferences": [
    {"preference": "politics", "count": 3},
    {"preference": "technology", "count": 1},
    {"preference": "sports", "count": 1}
  ],
  "preference_summaries": [
    {
      "preference": "politics",
      "articles": [ ... ],
      "summary": {
        "preference": "politics",
        "article_summaries": [
          {
            "title": "...",
            "source": "...",
            "summary": "...",
            "url": "..."
          }
        ]
      }
    }
  ]
}

## Run locally

1. Install dependencies from the existing requirements file:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the service:
   ```bash
   python app.py
   ```

Or start with uvicorn directly:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

The service will start on port `5000`.
