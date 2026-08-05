import os
import urllib.request
import urllib.parse
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

def test_gemini(key):
    print("\n[+] Testing Gemini Flash API Connection (AQ Header Format)...")
    if not key or key.startswith("your-"):
        print("[-] Gemini API Key is missing or placeholders used.")
        return False
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": key
    }
    data = json.dumps({
        "contents": [{"parts": [{"text": "Hello, write one word: Success"}]}]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            text = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"[x] Gemini API Success! Response: '{text}'")
            return True
    except Exception as e:
        print(f"[-] Gemini API Failed: {e}")
        return False

def test_federal_job_api():
    print("\n[+] Testing German Federal Job Agency API Connection...")
    url = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs?was=Softwareentwickler&zeile=1"
    headers = {
        "X-API-Key": "jobboerse-jobsuche",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            total = res_data.get("valideTreffer", 0) or len(res_data.get("stellenangebote", []))
            print(f"[x] Federal Job Agency API Success! Found: {total} matching listings.")
            return True
    except Exception as e:
        print(f"[-] Federal Job Agency API Failed: {e}")
        return False

def test_telegram(token, chat_id):
    print("\n[+] Testing Telegram Bot API Connection...")
    if not token or token.startswith("your-"):
        print("[-] Telegram Bot Token is missing or placeholders used.")
        return False
    
    url = f"https://api.telegram.org/bot{token}/getMe"
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            bot_username = res_data.get("result", {}).get("username", "Unknown")
            print(f"[x] Telegram Bot Validated: @{bot_username}")
    except Exception as e:
        print(f"[-] Telegram Bot Validation Failed: {e}")
        return False
    
    if not chat_id or chat_id.startswith("your-"):
        print("[-] Telegram Chat ID is missing. Skipping notification test.")
        return True
    
    msg_url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": "🚀 Workhunt AI Link Verification Handshake SUCCESS! All APIs connected."
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(msg_url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            print("[x] Telegram Notification Dispatch Success!")
            return True
    except Exception as e:
        print(f"[-] Telegram Message Dispatch Failed: {e}")
        return False

def test_supabase(url, key, key_name="Anon"):
    print(f"\n[+] Testing Supabase {key_name} Connection...")
    if not url or not key or "your-" in url:
        print(f"[-] Supabase URL or {key_name} Key is missing.")
        return False
    
    base_url = url
    if "/rest/v1" in base_url:
        base_url = base_url.split("/rest/v1")[0]
    
    test_url = f"{base_url.rstrip('/')}/rest/v1/"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    req = urllib.request.Request(test_url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            print(f"[x] Supabase {key_name} API & Connection Success!")
            return True
    except Exception as e:
        print(f"[-] Supabase {key_name} Connection Failed: {e}")
        return False

if __name__ == "__main__":
    print("=== WORKHUNT AI: LINK VERIFICATION HANDSHAKE ===")
    env = load_env()
    
    supabase_secret_ok = test_supabase(env.get("NEXT_PUBLIC_SUPABASE_URL"), env.get("SUPABASE_SERVICE_ROLE_KEY"), "Service Role")
    gemini_ok = test_gemini(env.get("GEMINI_API_KEY"))
    job_api_ok = test_federal_job_api()
    telegram_ok = test_telegram(env.get("TELEGRAM_BOT_TOKEN"), env.get("TELEGRAM_CHAT_ID"))
    
    print("\n=== VERIFICATION SUMMARY ===")
    print(f"Supabase DB Connection:     {'SUCCESS' if supabase_secret_ok else 'FAILED'}")
    print(f"Gemini API (AQ Header):     {'SUCCESS' if gemini_ok else 'FAILED'}")
    print(f"Federal Job API Connection: {'SUCCESS' if job_api_ok else 'FAILED'}")
    print(f"Telegram Bot Connection:    {'SUCCESS' if telegram_ok else 'FAILED'}")
