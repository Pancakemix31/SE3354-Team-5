from google import genai
import os
from dotenv import load_dotenv
from news_fetcher import get_news
load_dotenv()

client = genai.Client(api_key=os.getenv("GeminiAPI_KEY"))

def summarize_news_article(articles):
    prompt = f"""
You are a strict news ranking and summarization assistant.

You will be given a JSON-like list of news articles.

TASK:
1. Deduplicate similar stories
2. Rank by recency, importance, impact
3. Select top 10
4. Summarize each in 2–3 sentences
5. Output STRICT JSON

FORMAT:
{{
  "top_articles": [
    {{
      "title": "",
      "source": "",
      "summary": "",
      "URL": ""
    }}
  ]
}}

ARTICLES:
{articles}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    print(response)
    print("Response text: " + response.text)
    return response.text