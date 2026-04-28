"""
Orquestrador do crawler.

Uso:
    python main.py                          # historico: 2022..2026
    python main.py --ano 2023              # historico: ano especifico
    python main.py --modo diario           # atualizacao diaria (data de hoje)
    python main.py --modo servico          # historico + agendamento 10h/16h/22h
"""

import os
import sys
import argparse
import logging
from datetime import date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("crawler.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ]
)
log = logging.getLogger(__name__)

DEFAULT_START_YEAR = 2022
DEFAULT_END_YEAR = 2026


def run_historico(camara_crawler, legislatura: int, ano: int | None):
    if ano is not None:
        anos = [ano]
    else:
        anos = list(range(DEFAULT_START_YEAR, DEFAULT_END_YEAR + 1))

    for ano_item in anos:
        camara_crawler.run(legislatura, ano_item)


def run_servico(camara_crawler, legislatura: int):
    run_historico(camara_crawler, legislatura, None)

    tz_name = os.getenv("TZ", "America/Sao_Paulo")
    try:
        tz = ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        log.warning(f"Timezone '{tz_name}' não encontrada; usando UTC")
        tz = ZoneInfo("UTC")

    scheduler = BlockingScheduler(timezone=tz)

    def job_atualizacao_diaria():
        alvo = datetime.now(tz).date()
        camara_crawler.run_atualizacao_diaria(legislatura, alvo)

    scheduler.add_job(
        job_atualizacao_diaria,
        CronTrigger(hour="10,16,22", minute=0, timezone=tz),
        id="camara_atualizacao_diaria",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=60 * 60,
    )

    log.info(
        "[Câmara] Agendador ativo (APScheduler): atualizações diárias "
        f"às 10h, 16h e 22h ({tz.key})"
    )

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("[Câmara] Encerrando serviço do agendador")

def main():
    parser = argparse.ArgumentParser(description="Monitor Parlamentar - Crawler")
    parser.add_argument("--casa", choices=["camara"], default="camara")
    parser.add_argument("--ano", type=int)
    parser.add_argument("--legislatura", type=int, default=int(os.getenv("LEGISLATURA", 57)))
    parser.add_argument(
        "--modo",
        choices=["historico", "diario", "servico"],
        default="historico",
        help="historico: carga por ZIP; diario: API do dia atual; servico: historico + agenda",
    )
    args = parser.parse_args()

    import camara_crawler

    if args.casa == "camara":
        if args.modo == "diario":
            camara_crawler.run_atualizacao_diaria(args.legislatura, date.today())
            return

        if args.modo == "servico":
            run_servico(camara_crawler, args.legislatura)
            return

        run_historico(camara_crawler, args.legislatura, args.ano)

if __name__ == "__main__":
    main()
