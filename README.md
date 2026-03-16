# Monitor Parlamentar

Plataforma para visualização de gastos parlamentares brasileiros usando dados públicos oficiais.

```
monitor-parlamentar/
├── crawler/        Python — coleta da API da Câmara
├── api/            AdonisJS V6 — REST API
└── frontend/       React + Vite + TypeScript
```

---

## 1. Banco de dados (PostgreSQL)

```sql
CREATE DATABASE monitor_parlamentar;
```

---

## 2. Crawler (Python)

```bash
cd crawler
pip install -r requirements.txt
cp .env.example .env   # configure DB_HOST, DB_PASSWORD etc.
```

Rodar a migration do banco **antes** do primeiro crawl — veja passo 3.

```bash
# Coleta da Câmara (ano atual)
python main.py

# Só Câmara, ano específico
python main.py --casa camara --ano 2024
```

Recomendado: agendar via cron para execução diária.

```cron
0 4 * * * cd /path/to/crawler && python main.py >> /var/log/crawler.log 2>&1
```

---

## 3. API — AdonisJS V6

```bash
cd api
npm install
cp .env.example .env   # configure DB_* e gere APP_KEY

# Gerar APP_KEY
node ace generate:key

# Rodar migrations (cria as tabelas)
node ace migration:run

# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

A API sobe em `http://localhost:3333`.

### Endpoints

| Método | Rota                           | Descrição                                                 |
| ------ | ------------------------------ | --------------------------------------------------------- |
| GET    | `/api/parlamentares`           | Lista com filtros: `nome`, `partido`, `uf`, `ano`, `page` |
| GET    | `/api/parlamentares/:id`       | Detalhes + gastos por categoria e por mês                 |
| GET    | `/api/despesas`                | Lista de despesas com filtros                             |
| GET    | `/api/despesas/:parlamentarId` | Despesas de um parlamentar                                |
| GET    | `/api/ranking`                 | Top gastadores. Params: `ano`, `partido`, `uf`, `limit`   |
| GET    | `/api/ranking/categorias`      | Total por categoria de despesa                            |
| GET    | `/api/ranking/partidos`        | Total por partido                                         |

---

## 4. Frontend — React + Vite

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3333/api

npm run dev   # http://localhost:5173
```

### Páginas

| Rota                 | Descrição                                                       |
| -------------------- | --------------------------------------------------------------- |
| `/`                  | Ranking dos maiores gastadores com filtros e barra proporcional |
| `/parlamentares`     | Lista completa com busca por nome, partido e UF                 |
| `/parlamentares/:id` | Perfil individual: gasto total, por categoria, por mês e notas  |
| `/partidos`          | Comparativo por partido e por categoria de despesa              |

---

## Fontes de dados

| Fonte                | URL                                       |
| -------------------- | ----------------------------------------- |
| Câmara dos Deputados | https://dadosabertos.camara.leg.br/api/v2 |
