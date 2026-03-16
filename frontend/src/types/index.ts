export interface Parlamentar {
  id: number;
  api_id: number;
  nome: string;
  sigla_partido: string | null;
  sigla_uf: string | null;
  foto_url: string | null;
  casa: "camara";
  legislatura: number;
  total_gasto?: number;
}

export interface ParlamentarDetalhe extends Parlamentar {
  ano: number;
  total_gasto: number;
  por_categoria: { tipo_despesa: string; total: number; qtd: number }[];
  por_mes: { mes: number; total: number }[];
}

export interface Despesa {
  id: number;
  parlamentar_id: number;
  parlamentar_nome: string;
  sigla_partido: string | null;
  sigla_uf: string | null;
  casa: "camara";
  ano: number;
  mes: number | null;
  tipo_despesa: string | null;
  fornecedor: string | null;
  cnpj_cpf: string | null;
  valor_documento: number;
  valor_liquido: number;
  numero_documento: string | null;
  url_documento: string | null;
  data_emissao: string | null;
}

export interface RankingItem {
  posicao: number;
  id: number;
  nome: string;
  sigla_partido: string | null;
  sigla_uf: string | null;
  foto_url: string | null;
  total_gasto: number;
  qtd_despesas: number;
}

export interface RankingPartido {
  partido: string;
  total: number;
  qtd_parlamentares: number;
  media_por_parlamentar: number;
}

export interface RankingCategoria {
  categoria: string;
  total: number;
  qtd_despesas: number;
}

export interface Paginated<T> {
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    first_page: number;
  };
  data: T[];
}

export interface Filters {
  nome?: string;
  partido?: string;
  uf?: string;
  ano?: number;
  page?: number;
}
