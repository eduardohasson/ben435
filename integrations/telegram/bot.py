import os
import sys
sys.path.insert(0, os.path.expanduser("~/ben435"))
from dotenv import load_dotenv
from telegram.ext import Updater, MessageHandler, Filters, CommandHandler
from agents.template.agent import Agent
from agents.clube_football.config import AGENT_ID, NOME, INSTRUCOES

load_dotenv()

agente = Agent(agent_id=AGENT_ID, nome=NOME, instrucoes=INSTRUCOES)

def start(update, context):
    update.message.reply_text(f"Ola! Sou o {agente.nome}. Como posso ajudar?")

def responder(update, context):
    user_id = str(update.message.from_user.id)
    message = update.message.text
    print(f"[{user_id}]: {message}")
    response = agente.responder(message, user_id)
    update.message.reply_text(response)

def main():
    token = os.getenv("TELEGRAM_TOKEN")
    updater = Updater(token=token, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, responder))
    print(f"Ben435 — {agente.nome} rodando...")
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
