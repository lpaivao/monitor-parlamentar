# Deploy

Esta pasta contem apenas a orquestracao Docker do monorepo.

## Arquivos

- docker-compose.yml: sobe db, api, frontend e crawler.
- .env.example: variaveis necessarias para o compose.

## Uso

```bash
cd deploy
cp .env.example .env
# preencha APP_KEY e senha do banco

docker compose up -d --build
```

Com o compose ativo, o crawler executa:

1. carga historica inicial (2022..2026)
2. agendamento APScheduler as 10h, 16h e 22h para atualizacao diaria via API (somente despesas do dia)

Para executar o crawler sob demanda com ano especifico:

```bash
docker compose run --rm crawler python main.py --ano 2024
```
