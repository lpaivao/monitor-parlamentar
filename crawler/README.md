# Crawler - Monitor Parlamentar

Coleta dados oficiais da Camara e persiste no PostgreSQL.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

## Execucao

```bash
python main.py                                      # modo historico: 2022..2026
python main.py --casa camara --ano 2024            # modo historico: somente 2024
python main.py --modo diario                       # atualizacao diaria via API (data de hoje)
python main.py --modo servico                      # historico + agenda 10h/16h/22h
```

## Com Docker Compose

Ao subir o compose, o container do crawler faz:

1. Carga historica por ZIP (2022..2026)
2. Inicia agendamento com APScheduler para atualizacao diaria via API as 10h, 16h e 22h

As execucoes agendadas consultam somente despesas do dia da execucao e inserem sem duplicar.
