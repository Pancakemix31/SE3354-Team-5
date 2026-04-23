import json
import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.getenv("GeminiAPI_KEY"))

def summarize_news_article(preference, articles, summary_depth="concise"):
    depth_instruction = (
        "Use concise summaries: 1-2 sentences focused on key update and impact."
        if summary_depth == "concise"
        else "Use deeper summaries: include context, why it matters, and likely implications in 3-5 sentences."
    )
    prompt = f"""
You are a professional news summarization assistant.

The user preference is: {preference}
Summary depth mode: {summary_depth}

You will be given a list of news articles.
For each article, produce a summary entry containing:
- title:
- source:
- summary:
- url:

DEPTH RULE:
{depth_instruction}

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


def summarize_single_article(article, preference, region, summary_depth="concise"):
    title = article.get("title") or "Untitled"
    source = (article.get("source") or {}).get("name") if isinstance(article.get("source"), dict) else article.get("source")
    description = article.get("description") or ""
    content = article.get("content") or ""
    url = article.get("url") or ""

    depth_instruction = (
        "Return a concise summary with 2-3 short sentences."
        if summary_depth == "concise"
        else "Return a deeper summary with context, key risk/opportunity, and implications in 5-8 sentences."
    )

    prompt = f"""
You are a professional news analyst.

User preference topic: {preference}
User region focus: {region}
Summary depth: {summary_depth}

Article:
- title: {title}
- source: {source}
- description: {description}
- content: {content}
- url: {url}

TASK:
{depth_instruction}
Use neutral tone, avoid hype, and avoid repeating the headline verbatim.

Output valid JSON only:
{{
  "summary": "",
  "key_points": ["", ""]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text


def answer_news_question(question, region, preference_articles):
    prompt = f"""
You are a concise and factual news assistant.

User question: {question}
User preferred region: {region}

You are given recent news grouped by preference topic.
Answer only using the provided news evidence. If evidence is insufficient, clearly say so.
Keep answer helpful and short (around 4-8 sentences), then provide bullet key points.

Output valid JSON only in this format:
{{
  "answer": "",
  "key_points": ["", ""],
  "citations": [
    {{"title": "", "source": "", "url": ""}}
  ]
}}

EVIDENCE:
{json.dumps(preference_articles, ensure_ascii=False, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text