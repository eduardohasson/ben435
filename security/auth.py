import os
import uuid
import sys
sys.path.insert(0, os.path.expanduser("~/ben435"))
from dotenv import load_dotenv

load_dotenv()

def gerar_api_key() -> str:
    return f"ben435-{uuid.uuid4().hex}"

def verificar_api_key(api_key: str) -> dict:
    try:
        from supabase import create_client
        client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        result = client.table("ben435_clientes").select("*").eq("api_key", api_key).eq("ativo", True).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Erro auth: {e}")
        return None

def criar_cliente(nome: str, agent_id: str) -> dict:
    try:
        from supabase import create_client
        client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        api_key = gerar_api_key()
        result = client.table("ben435_clientes").insert({
            "nome": nome,
            "api_key": api_key,
            "agent_id": agent_id
        }).execute()
        print(f"Cliente criado: {nome}")
        print(f"API Key: {api_key}")
        return result.data[0]
    except Exception as e:
        print(f"Erro ao criar cliente: {e}")
        return None
