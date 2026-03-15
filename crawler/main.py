"""
Orquestrador do crawler.

Uso:
    python main.py                          # coleta tudo (Câmara + Senado)
    python main.py --casa camara
    python main.py --casa senado
    python main.py --ano 2023
"""

import os
import sys
import argparse
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("crawler.log"),
        logging.StreamHandler(sys.stdout),
    ]
)

def main():
    parser = argparse.ArgumentParser(description="Monitor Parlamentar - Crawler")
    parser.add_argument("--casa", choices=["camara", "senado", "todas"], default="todas")
    parser.add_argument("--ano", type=int, default=int(os.getenv("ANO", 2024)))
    parser.add_argument("--legislatura", type=int, default=int(os.getenv("LEGISLATURA", 57)))
    args = parser.parse_args()

    import camara_crawler
    import senado_crawler

    if args.casa in ("camara", "todas"):
        camara_crawler.run(args.legislatura, args.ano)

    if args.casa in ("senado", "todas"):
        senado_crawler.run(args.legislatura, args.ano)

if __name__ == "__main__":
    main()
