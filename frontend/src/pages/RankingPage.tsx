import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { Table } from "../components/ui/Table";
import { getRanking } from "../services/api";
import type { RankingItem } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

const CLIENT_PER_PAGE = 20;

function getSlice<T>(items: T[], page: number) {
  const start = (page - 1) * CLIENT_PER_PAGE;
  return items.slice(start, start + CLIENT_PER_PAGE);
}

function getRankMedal(pos: number) {
  if (pos === 1) return { icon: "🥇", color: "#fbbf24" };
  if (pos === 2) return { icon: "🥈", color: "#94a3b8" };
  if (pos === 3) return { icon: "🥉", color: "#cd7c4e" };
  return null;
}

export default function RankingPage() {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [ano, setAno] = useState(ANOS[0]);
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [page, setPage] = useState(1);

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((item) => ({ label: item, value: item }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRanking({ ano, partido, uf, limit: 100 });
      setItems(response.data);
    } finally {
      setLoading(false);
    }
  }, [ano, partido, uf]);

  useEffect(() => { setPage(1); }, [ano, partido, uf]);
  useEffect(() => { load(); }, [load]);

  const max = items[0]?.total_gasto ?? 1;
  const totalGeral = items.reduce((sum, item) => sum + item.total_gasto, 0);
  const lastPage = Math.max(1, Math.ceil(items.length / CLIENT_PER_PAGE));
  const currentItems = getSlice(items, page);

  return (
    <div className="px-8 pt-10 pb-4 max-w-full animate-[fadeUp_0.35s_ease_both] flex flex-col flex-1 min-h-0">
      <div className="mb-8">
        <h1 className="page-title-gradient text-[42px] font-extrabold tracking-[-0.04em] mb-2">Ranking de Gastos</h1>
        <p className="text-[var(--text-muted)] text-sm tracking-wide">Top parlamentares por total da cota parlamentar utilizada</p>
      </div>

      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <SelectField
          value={String(ano)}
          onValueChange={(value) => setAno(Number(value))}
          options={anoOptions}
          className="w-[120px]"
        />
        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          className="font-sans text-[13px] font-medium text-[var(--text-strong)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3.5 py-2 outline-none transition-all placeholder:text-[var(--text-dim)] focus:border-[var(--accent-border)] focus:bg-[var(--bg-raised)] focus:shadow-[0_0_0_3px_var(--accent-dim)] w-[140px]"
          maxLength={10}
        />
        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-[160px]" />
      </div>

      <div className="grid gap-3.5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-5 py-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-[0.1em] mb-2.5">Parlamentares</div>
          <div className="font-sans text-[28px] font-extrabold text-[var(--text-h)] tracking-[-0.03em] leading-none">{loading ? "—" : items.length}</div>
        </div>
        <div className="stat-card bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-5 py-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-[0.1em] mb-2.5">Total gasto em {ano}</div>
          <div className="font-sans text-[22px] font-extrabold text-[var(--text-h)] tracking-[-0.03em] leading-none">{loading ? "—" : formatBRL(totalGeral)}</div>
        </div>
        <div className="stat-card bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-5 py-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-[0.1em] mb-2.5">Maior gasto individual</div>
          <div className="font-sans text-[20px] font-extrabold text-[var(--text-h)] tracking-[-0.03em] leading-none">{!loading && items[0] ? formatBRL(items[0].total_gasto) : "—"}</div>
          <div className="font-mono text-[11px] text-[var(--text-muted)] mt-1.5">{items[0]?.nome ?? ""}</div>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden transition-colors duration-300 hover:border-[var(--border-strong)] flex flex-col flex-1 min-h-0">
        <Table.Root containerClassName="flex-1 min-h-0">
          <Table.Header>
            <Table.Row className="hover:bg-transparent">
              <Table.ColumnHeaderCell className="w-14">#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Parlamentar</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Partido / UF</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Despesas</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total gasto (R$)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-[180px]">Proporcao</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={6} className="py-12 text-center">
                  <span className="inline-block w-[22px] h-[22px] border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                </Table.Cell>
              </Table.Row>
            )}
            {!loading && items.length === 0 && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={6} className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhum resultado encontrado.</Table.Cell>
              </Table.Row>
            )}
            {!loading && currentItems.map((item) => {
              const medal = getRankMedal(item.posicao);
              const pct = (item.total_gasto / max) * 100;
              return (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    {medal ? (
                      <span className="text-[18px]" title={`#${item.posicao}`}>{medal.icon}</span>
                    ) : (
                      <span className="font-mono text-[12px] font-semibold text-[var(--text-dim)]">
                        {item.posicao}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2.5 text-[var(--text-strong)] font-medium">
                      <ParlamentarAvatar nome={item.nome} foto={item.foto_url} />
                      <Link to={`/parlamentares/${item.id}`} className="text-[var(--text-strong)] font-medium hover:text-[var(--accent)] transition-colors">{item.nome}</Link>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="inline-flex items-center font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-[0.04em] text-[var(--text-strong)] bg-[var(--bg-raised)] border border-[var(--border-strong)]">{item.sigla_partido ?? "-"}</span>
                      <span className="inline-flex items-center font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-[0.04em] text-[var(--text-strong)] bg-[var(--bg-raised)] border border-[var(--border-strong)]">{item.sigla_uf ?? "-"}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-[12px] text-[var(--text-muted)]">
                      {item.qtd_despesas.toLocaleString("pt-BR")}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-[13px] font-semibold text-[var(--text-h)]">
                      {formatBRL(item.total_gasto)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--bg-raised)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div className="gasto-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-dim)] w-9 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        {!loading && <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />}
      </div>
    </div>
  );
}
