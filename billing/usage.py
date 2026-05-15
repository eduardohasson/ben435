import os, sys
sys.path.insert(0, os.path.expanduser("~/ben435"))
from dotenv import load_dotenv
load_dotenv()
MARKUP = 5.0
PRECO_INPUT = 0.000001
PRECO_OUTPUT = 0.000005
def registrar_uso(cliente_id, agent_id, input_tokens, output_tokens):
    try:
        from supabase import create_client
        client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        custo = (input_tokens * PRECO_INPUT) + (output_tokens * PRECO_OUTPUT)
        cobrado = custo * MARKUP
        client.table("ben435_billing").insert({"cliente_id": cliente_id, "agent_id": agent_id, "input_tokens": input_tokens, "output_tokens": output_tokens, "custo_usd": custo, "cobrado_usd": cobrado}).execute()
        result = client.table("ben435_clientes").select("saldo_usd").eq("id", cliente_id).execute()
        if result.data:
            novo_saldo = float(result.data[0]["saldo_usd"]) - cobrado
            client.table("ben435_clientes").update({"saldo_usd": novo_saldo}).eq("id", cliente_id).execute()
        return {"custo": custo, "cobrado": cobrado, "tokens": input_tokens + output_tokens}
    except Exception as e:
        print(f"Erro billing: {e}")
        return None
def verificar_saldo(cliente_id):
    try:
        from supabase import create_client
        client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        result = client.table("ben435_clientes").select("saldo_usd").eq("id", cliente_id).execute()
        if result.data: return float(result.data[0]["saldo_usd"])
        return 0.0
    except:
        return 0.0