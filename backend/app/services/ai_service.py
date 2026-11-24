import os
import json
import re
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_document(text):

    prompt = f"""
You are an expert professor preparing high-quality study material.

Read the entire document carefully.

Return ONLY valid JSON.

{{
    "summary":"",
    "notes":"",
    "key_points":"",
    "viva_questions":"",
    "mcqs":"",
    "category":"",
    "subject":"",
    "tags":[]
}}

Instructions:

SUMMARY:
Write a detailed summary (300-500 words).

NOTES:
Create complete study notes.
Explain every topic.
Include:
- definitions
- explanations
- examples
- advantages
- disadvantages
- formulas (if any)
- important exam points

KEY_POINTS:
Generate important bullet points.

VIVA_QUESTIONS:
Generate 10 viva questions with answers.

MCQS:
Generate 10 MCQs with four options and correct answer.

CATEGORY:
Predict category.

SUBJECT:
Predict subject.

TAGS:
Generate 10 meaningful tags.

Document:

{text[:18000]}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        result = response.text

        print("\n========== GEMINI RAW RESPONSE ==========\n")
        print(result)

        # Remove markdown code fences if present
        result = re.sub(r"```json", "", result)
        result = re.sub(r"```", "", result)

        result = result.strip()

        data = json.loads(result)

        return data

    except Exception as e:

        print("\nGemini Parsing Error:\n", e)

        return {
            "summary": "AI could not generate a summary.",
            "notes": "AI could not generate notes.",
            "key_points": "No key points available.",
            "viva_questions": "No viva questions generated.",
            "mcqs": "No MCQs generated.",
            "category": "Education",
            "subject": "Unknown",
            "tags": [],
            "ai_status": "offline"
        }
