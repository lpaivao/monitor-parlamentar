# Deploy

Esta pasta contem apenas a orquestracao Docker do monorepo.

## Arquivos

- docker-compose.yml: sobe db, api, frontend e crawler (em profile separado).
- .env.example: variaveis necessarias para o compose.

## Uso

```bash
cd deploy
cp .env.example .env
# preencha APP_KEY e senha do banco

docker compose up -d --build
```

Para executar o crawler sob demanda:

```bash
docker compose --profile crawler run --rm crawler
```
