import getpass
import json
import urllib.request

token = getpass.getpass("Token de Telegram: ")

url = f"https://api.telegram.org/bot{token}/getUpdates"

with urllib.request.urlopen(url, timeout=15) as response:
    data = json.load(response)

for update in data.get("result", []):
    message = update.get("message")
    if message:
        chat = message["chat"]
        print("Chat ID:", chat["id"])
        print("Tipo:", chat["type"])
