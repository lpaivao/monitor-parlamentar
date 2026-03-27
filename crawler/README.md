# Crawler - Monitor Parlamentar

Coleta dados oficiais da Camara e persiste no PostgreSQL.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

## Execucao

```bash
python main.py                           # executa 2022..2026
python main.py --casa camara --ano 2024 # executa somente 2024
```
