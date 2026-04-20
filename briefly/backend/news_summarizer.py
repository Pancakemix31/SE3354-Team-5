import json
import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.getenv("GeminiAPI_KEY"))

def summarize_news_article(preference, articles):
    prompt = f"""
You are a professional news summarization assistant.

The user preference is: {preference}

You will be given a list of news articles.
For each article, produce a summary entry containing:
- title:
- source:
- summary:
- url:

Only output valid JSON with the exact format shown below.
Do not invent articles, and do not output any extra text.

FORMAT:
{{
  "preference": "{preference}",
  "article_summaries": [
    {{
      "title": "",
      "source": "",
      "summary": "",
      "url": ""
    }}
  ]
}}

ARTICLES:
{json.dumps(articles, ensure_ascii=False, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    print(response)
    print("Response text: " + response.text)
    return response.text