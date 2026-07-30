import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2"


def call_ollama(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama model and returns the raw text response.
    """
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,   # we want the full response at once, not streamed chunks
        "options": {
            "temperature": 0.2   # low temperature = more consistent, less creative/random output
        }
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()

    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Could not connect to Ollama. Make sure Ollama is running "
            "(try running 'ollama run llama3.2' in a terminal first)."
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Ollama took too long to respond (timeout).")


# ---- Quick manual test ----
if __name__ == "__main__":
    test_prompt = "Reply with just the word: hello"
    result = call_ollama(test_prompt)
    print("Ollama replied:", result)