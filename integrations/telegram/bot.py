import os
import sys
sys.path.insert(0, os.path.expanduser("~/ben435"))
from dotenv import load_dotenv
from telegram.ext import Updater, MessageHandler, Filters, CommandHandler
from core.engine import CoreEngine

load_dotenv()

engine = CoreEngine(agent_id="ben435_main")

def start(update, context):
    update.message.reply_text("Ola! Sou o agente Ben435. Como posso ajudar?")

def responder(update, context):
    user_id = str(update.message.from_user.id)
    message = update.message.text
    print(f"[{user_id}]: {message}")
    response = engine.process(message, user_id)
    update.message.reply_text(response)

def main():
    token = os.getenv("TELEGRAM_TOKEN")
    updater = Updater(token=token, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, responder))
    print("Ben435 Bot rodando...")
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
