import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()  # reads .env and populates os.environ

client = Groq(api_key=os.environ["GROQ_API_KEY"])


def call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=4096,
        timeout=30,
    )
    return response.choices[0].message.content