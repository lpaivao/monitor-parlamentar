const brNumberFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number | string | null | undefined): string {
  const parsed = typeof value === "string" ? Number(value) : value;
  const normalized = Number.isFinite(parsed) ? Number(parsed) : 0;

  return brNumberFormatter.format(normalized);
}

export function formatCompact(
  value: number | string | null | undefined,
): string {
  return formatBRL(value);
}

export const UFS = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];

export const ANOS = Array.from(
  { length: 6 },
  (_, i) => new Date().getFullYear() - i,
);

export const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
