import urllib.request
import urllib.error
import json

import os

def load_gemini_key():
    if "GEMINI_API_KEY" in os.environ:
        return os.environ["GEMINI_API_KEY"]
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

def test_gemini_generation():
    key = load_gemini_key()
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    
    headers = {"Content-Type": "application/json", "x-goog-api-key": key}
    data = json.dumps({
        "contents": [{"parts": [{"text": "Hello, write one word: Success"}]}]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            text = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"[x] Gemini 2.5 Flash API Success! Response: '{text}'")
            return True
    except urllib.error.HTTPError as e:
        print("Gemini HTTP Status Code:", e.code)
        print("Gemini Body:", e.read().decode())
    except Exception as e:
        print("Gemini Other Error:", e)
    return False

if __name__ == "__main__":
    test_gemini_generation()
