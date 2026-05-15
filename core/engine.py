import os
from dotenv import load_dotenv

load_dotenv()

class CoreEngine:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.llm = os.getenv("LLM_PROVIDER", "claude")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.grok_key = os.getenv("GROK_API_KEY")

    def process(self, message: str, user_id: str) -> str:
        memory = self.get_memory(user_id)
        context = self.build_context(memory)
        if self.llm == "claude":
            response = self.ask_claude(message, context)
        elif self.llm == "grok":
            response = self.ask_grok(message, context)
        else:
            response = "LLM nao configurado."
        self.save_memory(user_id, message, response)
        return response

    def ask_claude(self, message: str, context: str) -> str:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_key)
            result = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                system=context,
                messages=[{"role": "user", "content": message}]
            )
            return result.content[0].text
        except Exception as e:
            return f"Erro Claude: {str(e)}"

    def ask_grok(self, message: str, context: str) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.grok_key, base_url="https://api.x.ai/v1")
            result = client.chat.completions.create(
                model="grok-3",
                messages=[
                    {"role": "system", "content": context},
                    {"role": "user", "content": message}
                ]
            )
            return result.choices[0].message.content
        except Exception as e:
            return f"Erro Grok: {str(e)}"

    def build_context(self, memory: list) -> str:
        base = f"Voce e um agente inteligente da plataforma Ben435. ID: {self.agent_id}. Responda de forma clara e util."
        if memory:
            base += "\n\nMemoria recente:\n"
            for m in memory[-5:]:
                base += f"- {m['tipo']}: {m['mensagem']}\n"
        return base

    def get_memory(self, user_id: str) -> list:
        try:
            from supabase import create_client
            client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
            result = client.table("ben435_memory").select("*").eq("user_id", user_id).eq("agent_id", self.agent_id).order("timestamp", desc=True).limit(10).execute()
            return result.data
        except:
            return []

    def save_memory(self, user_id: str, message: str, response: str):
        try:
            from supabase import create_client
            client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
            client.table("ben435_memory").insert([
                {"user_id": user_id, "agent_id": self.agent_id, "mensagem": message, "tipo": "user"},
                {"user_id": user_id, "agent_id": self.agent_id, "mensagem": response, "tipo": "assistant"}
            ]).execute()
        except:
            pass
