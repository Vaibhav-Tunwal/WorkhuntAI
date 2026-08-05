import os
import urllib.request
import urllib.error
import json

def load_env(filepath=".env"):
    env_vars = {}
    if not os.path.exists(filepath):
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

env_key = load_env().get("GEMINI_API_KEY", "")

print(f"ENV KEY:       {repr(env_key)}")

def test_url_param(k, label):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={k}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({"contents": [{"parts": [{"text": "Hi"}]}]}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            print(f"[{label}] URL Param SUCCESS:", res.read().decode()[:100])
    except urllib.error.HTTPError as e:
        print(f"[{label}] URL Param FAILED with {e.code}:", e.read().decode())

def test_header_param(k, label):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": k}
    data = json.dumps({"contents": [{"parts": [{"text": "Hi"}]}]}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            print(f"[{label}] Header SUCCESS:", res.read().decode()[:100])
    except urllib.error.HTTPError as e:
        print(f"[{label}] Header FAILED with {e.code}:", e.read().decode())

test_url_param(env_key, "ENV")
test_header_param(env_key, "ENV")

