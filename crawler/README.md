# Crawler - Monitor Parlamentar

Coleta dados oficiais da Camara e persiste no PostgreSQL.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

## Execucao

```bash
python main.py
python main.py --casa camara --ano 2024
```
