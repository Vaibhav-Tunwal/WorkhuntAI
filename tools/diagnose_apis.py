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

def test_generation(model_name):
    print(f"\nTesting generation with model: {model_name}...")
    key = load_gemini_key()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": key}
    data = json.dumps({
        "contents": [{"parts": [{"text": "Hello, write one word: Success"}]}]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            text = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"[x] Success! Response: '{text}'")
            return True
    except urllib.error.HTTPError as e:
        print(f"[-] Failed with HTTP {e.code}")
        try:
            print("Response:", e.read().decode())
        except Exception:
            pass
    except Exception as e:
        print("[-] Other Error:", e)
    return False

if __name__ == "__main__":
    test_generation("gemini-2.0-flash")
    test_generation("gemini-3.5-flash")
    test_generation("gemini-3.6-flash")
