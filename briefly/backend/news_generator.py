import json
import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.getenv("GeminiAPI_KEY"))

def generate_news_article(preference, articles):
    sanitized_articles = [
        {
            "title": article.get("title"),
            "source": article.get("source", {}).get("name"),
            "publishedAt": article.get("publishedAt"),
            "description": article.get("description"),
            "url": article.get("url"),
            "content": article.get("content"),
        }
        for article in articles[:10]
    ]

    prompt = f"""
You are a professional news writer.

Use the following user preference to write a brand-new news article that is based on the reported facts in these source articles.

Preference: {preference}

TASK:
1. Synthesize the key information from the source articles.
2. Write a new, original news article in a neutral journalistic tone.
3. Include a headline and 4-5 paragraphs.
4. Do not copy entire source text; instead, summarize and combine the facts.
5. Output valid JSON ONLY.

FORMAT:
{{
  "preference": "",
  "generated_article": {{
    "headline": "",
    "body": "",
    "summary": ""
  }},
  "sources": [
    {{"title": "", "source": "", "url": ""}}
  ]
}}

SOURCES:
{json.dumps(sanitized_articles, ensure_ascii=False, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    print(response)
    print("Response text: " + response.text)
    return response.text
