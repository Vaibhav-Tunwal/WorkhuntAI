import os
import urllib.request
import urllib.error
import json

def load_env(filepath=".env"):
    env_vars = {}
    if not os.path.exists(filepath):
        print(f"Error: {filepath} file not found.")
        return env_vars
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

def test_loaded_key():
    env = load_env()
    key = env.get("GEMINI_API_KEY")
    print(f"Loaded key length: {len(key) if key else 0}")
    print(f"Loaded key value representation: {repr(key)}")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({
        "contents": [{"parts": [{"text": "Hello"}]}]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            print("Success:", res.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP Status Code:", e.code)
        print("Response:", e.read().decode())
    except Exception as e:
        print("Other Error:", e)

if __name__ == "__main__":
    test_loaded_key()
