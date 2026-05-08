# Crawler - Monitor Parlamentar

Coleta dados oficiais da Camara e persiste no PostgreSQL.

## Resumo da Etapa 1 (Crawler)

Esta primeira etapa do projeto implementa somente o processo de coleta e persistencia dos dados de gastos parlamentares da Camara dos Deputados.

Fontes utilizadas para a coleta:

1. API de Dados Abertos da Camara: https://dadosabertos.camara.leg.br/api/v2
2. Arquivo anual de cotas parlamentares (JSON compactado em ZIP): https://www.camara.leg.br/cotas/

Fluxo resumido:

1. Coletar deputados da legislatura informada pela API.
2. Coletar despesas anuais via arquivo ZIP (2022..2026) e usar API por deputado como fallback.
3. Salvar/atualizar parlamentares e inserir despesas sem duplicacao.
4. Registrar logs de sincronizacao no banco.

## Descritor dos Dados (Tabelas)

Os dados coletados sao armazenados nas seguintes tabelas:

| Tabela          | Descricao                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `parlamentares` | Dados de identificacao do parlamentar (id da API, nome, partido, UF, foto, casa e legislatura).                  |
| `despesas`      | Gastos parlamentares por documento (ano, mes, tipo de despesa, fornecedor, CNPJ/CPF, valores e data de emissao). |
| `sync_logs`     | Historico das execucoes do crawler (ano, status e detalhes da sincronizacao).                                    |

## Armazenamento dos Dados

O local de armazenamento e um banco PostgreSQL.

Configuracao padrao no `.env`:

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=monitor_parlamentar`
- `DB_USER=postgres`
- `DB_PASSWORD=`

No ambiente Docker Compose, os dados do banco ficam persistidos no volume `pgdata`.

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

1. Carga histórica por ZIP (2022..2026)
2. Inicia agendamento com APScheduler para atualização diária.
   - Nota: Recomenda-se rodar `python main.py --ano 2026` (via ZIP) em vez do `--modo diario` (via API) se a velocidade for prioridade, pois o ZIP anual é mais rápido que centenas de chamadas à API REST.

