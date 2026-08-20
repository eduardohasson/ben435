# Ben435

Análise operacional de risco em contratos de atletas. **Não é escritório de advocacia e não emite parecer jurídico.** A compra só avança depois do aceite dos Termos.

Site atual estático: [eduardohasson.github.io/ben435](https://eduardohasson.github.io/ben435/).

## O que mudou

- Landing reposicionada: risco contratual, não “gestão completa do clube”
- Conta (Google, X ou e-mail)
- Aceite obrigatório dos Termos, com versão gravada
- Checkout em **USD e BRL** via Stripe (ou modo demonstração sem chave)
- Painel: colar contrato → relatório de cláusulas de risco
- Pronto para GitHub + Supabase + Railway

## Vale a pena ter app nativo?

**Agora, não.** Quem lê contrato de atleta está no computador. Um app iOS/Android duplica custo (lojas, revisão, dois códigos) sem aumentar conversão. Esta versão já é um **PWA** — o dirigente instala no celular e abre os relatórios.

App nativo só faz sentido depois de receita recorrente e um fluxo móvel claro (ex.: alerta de vencimento no campo).

## Stack

React + TanStack Start + Postgres. Em preview local o banco é PGLite. Em produção, aponte `DATABASE_URL` para o **Supabase**.

## Variáveis no Railway

| Variável | Função |
| --- | --- |
| `DATABASE_URL` | Connection string do Supabase (porta **5432**, sessão direta — Railway é processo longo) |
| `BETTER_AUTH_SECRET` | Segredo longo e aleatório |
| `BETTER_AUTH_URL` | URL pública do app (`https://seu-servico.up.railway.app`) |
| `APP_URL` | Mesma URL pública (redirect do Stripe) |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | Endpoint `/api/stripe/webhook` |
| `XAI_API_KEY` | Opcional — análise com modelo; sem ela usam-se marcadores Ben435 |

Não commitar `.env`. Sem `STRIPE_SECRET_KEY` o checkout libera crédito em modo demonstração.

## Supabase

1. Crie um projeto
2. SQL Editor: rode `migrations/0001_auth.sql` e depois `migrations/0002_ben435.sql`
3. Settings → Database → URI (direct, 5432) → `DATABASE_URL`
4. Authentication do Supabase **não** é usada — o login é Better Auth nesta aplicação

## Stripe (USD + BRL)

1. Ative as duas moedas no Dashboard
2. Webhook: `https://SEU_DOMINIO/api/stripe/webhook`  
   Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
3. Os preços são criados na hora (`price_data`) — não precisa cadastrar Product à mão

Valores atuais:

- Avulsa: **USD 35** / **R$ 189**
- Mensal: **USD 119** / **R$ 649** / mês

## Railway

1. New Project → Deploy from GitHub (`eduardohasson/ben435`, branch `plataforma`)
2. Cole as variáveis
3. Deploy. O `railway.toml` já define build `NITRO_PRESET=node-server`

## Desenvolvimento

```sh
npm install
npm run dev
```

## Aviso legal

Todo relatório inclui o aviso: leitura operacional de risco, não parecer jurídico, não substitui advogado.
