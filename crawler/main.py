"""
Orquestrador do crawler.

Uso:
    python main.py                          # coleta Câmara (padrão)
    python main.py --casa camara
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

DEFAULT_START_YEAR = 2022
DEFAULT_END_YEAR = 2026

def main():
    parser = argparse.ArgumentParser(description="Monitor Parlamentar - Crawler")
    parser.add_argument("--casa", choices=["camara"], default="camara")
    parser.add_argument("--ano", type=int)
    parser.add_argument("--legislatura", type=int, default=int(os.getenv("LEGISLATURA", 57)))
    args = parser.parse_args()

    import camara_crawler

    if args.ano is not None:
        anos = [args.ano]
    else:
        anos = list(range(DEFAULT_START_YEAR, DEFAULT_END_YEAR + 1))

    if args.casa == "camara":
        for ano in anos:
            camara_crawler.run(args.legislatura, ano)

if __name__ == "__main__":
    main()
