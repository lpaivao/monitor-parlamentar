export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(1)}K`
  return formatBRL(value)
}

export const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO',
  'MA','MG','MS','MT','PA','PB','PE','PI','PR',
  'RJ','RN','RO','RR','RS','SC','SE','SP','TO',
]

export const ANOS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

export const MESES = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
]
