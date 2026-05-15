import os
import sys
sys.path.insert(0, os.path.expanduser("~/ben435"))
from core.engine import CoreEngine

class Agent:
    def __init__(self, agent_id: str, nome: str, instrucoes: str):
        self.agent_id = agent_id
        self.nome = nome
        self.instrucoes = instrucoes
        self.engine = CoreEngine(agent_id=agent_id)

    def responder(self, message: str, user_id: str) -> str:
        self.engine.system_prompt = self.instrucoes
        return self.engine.process(message, user_id)
