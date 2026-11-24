import json
import os
import re

from openai import OpenAI

import app.config  # noqa: F401  (loads backend/.env)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


def generate(prompt):

    try:

        response = client.chat.completions.create(

            model="openrouter/free",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.3

        )

        return (response.choices[0].message.content or "").strip()

    except Exception as e:

        print("\n========== OPENROUTER ERROR ==========\n")
        print(e)

        return ""


def generate_summary(text):

    prompt = f"""
Return ONLY valid JSON.

{{
    "summary":"",
    "category":"",
    "subject":"",
    "tags":[]
}}

Summarize this document clearly.

{text[:12000]}
"""

    fallback = {
        "summary": "",
        "category": "Education",
        "subject": "Unknown",
        "tags": []
    }

    data = parse_json(generate(prompt))

    if not isinstance(data, dict):
        return fallback

    tags = data.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    return {
        "summary": str(data.get("summary") or ""),
        "category": str(data.get("category") or "Education"),
        "subject": str(data.get("subject") or "Unknown"),
        "tags": [str(t) for t in tags][:10],
    }


def parse_json(raw):
    """Models often wrap JSON in ```json fences or add chatter around it."""

    if not raw:
        return None

    cleaned = re.sub(r"```(?:json)?", "", raw).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    return None


def generate_key_points(text):

    prompt = f"""
Generate the 10 most important revision points.

Return them as bullet points.

Document:

{text[:12000]}
"""

    return generate(prompt)


def generate_notes(text):

    prompt = f"""
Generate detailed study notes.

Include:

- headings
- definitions
- examples
- formulas
- explanations

Document:

{text[:12000]}
"""

    return generate(prompt)


def generate_mcqs(text):

    prompt = f"""
Generate 10 MCQs.

Each question should contain:

Question

A)

B)

C)

D)

Correct Answer:

Document:

{text[:12000]}
"""

    return generate(prompt)


def generate_viva(text):

    prompt = f"""
Generate 10 viva questions with short answers.

Document:

{text[:12000]}
"""

    return generate(prompt)


def ask_document(document, question, history):

    prompt = f"""
You are IntelliDocs AI.

You are helping a student understand an uploaded document.

Rules:

- Answer primarily using the uploaded document.
- Use the previous conversation to understand follow-up questions.
- If the user asks "Explain more", "Give an example", "Compare them", etc., use the conversation history to understand what "them" refers to.
- If the answer isn't in the document, clearly say that.
- Keep explanations student-friendly.
- Use headings and bullet points whenever useful.

DOCUMENT:

{document[:50000]}

CONVERSATION HISTORY:

{history}

CURRENT QUESTION:

{question}
"""

    try:

        response = client.chat.completions.create(

            model="openrouter/free",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.3

        )

        return response.choices[0].message.content or (
            "Sorry, I couldn't come up with an answer. Please rephrase your question."
        )

    except Exception as e:

        print("\n========== CHAT ERROR ==========\n")
        print(e)

        return "Sorry, I couldn't process your question right now."
