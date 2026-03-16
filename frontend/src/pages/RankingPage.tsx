import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
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
    <div className="page">
      <div className="page-header">
        <h1>Ranking de Gastos</h1>
        <p>Top parlamentares por total da cota parlamentar utilizada</p>
      </div>

      <div className="filter-bar">
        <SelectField
          value={String(ano)}
          onValueChange={(value) => setAno(Number(value))}
          options={anoOptions}
          className="w-120"
        />
        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          style={{ width: 140 }}
          maxLength={10}
        />
        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-160" />
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="label">Parlamentares</div>
          <div className="value">{loading ? "—" : items.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total gasto em {ano}</div>
          <div className="value" style={{ fontSize: 22 }}>{loading ? "—" : formatBRL(totalGeral)}</div>
          <div className="sub">{!loading && formatBRL(totalGeral)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maior gasto individual</div>
          <div className="value" style={{ fontSize: 20 }}>{!loading && items[0] ? formatBRL(items[0].total_gasto) : "—"}</div>
          <div className="sub">{items[0]?.nome ?? ""}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>Parlamentar</th>
                <th>Partido / UF</th>
                <th>Despesas</th>
                <th>Total gasto (R$)</th>
                <th style={{ width: 180 }}>Proporção</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={6}><span className="spinner" /></td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">Nenhum resultado encontrado.</td>
                </tr>
              )}
              {!loading && currentItems.map((item) => {
                const medal = getRankMedal(item.posicao);
                const pct = (item.total_gasto / max) * 100;
                return (
                  <tr key={item.id}>
                    <td>
                      {medal ? (
                        <span style={{ fontSize: 18 }} title={`#${item.posicao}`}>{medal.icon}</span>
                      ) : (
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-dim)',
                        }}>
                          {item.posicao}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="parlamentar-cell">
                        <ParlamentarAvatar nome={item.nome} foto={item.foto_url} />
                        <Link to={`/parlamentares/${item.id}`}>{item.nome}</Link>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="badge badge-partido">{item.sigla_partido ?? "-"}</span>
                        <span className="badge badge-partido">{item.sigla_uf ?? "-"}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        {item.qtd_despesas.toLocaleString("pt-BR")}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>
                        {formatBRL(item.total_gasto)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="gasto-bar-bg" style={{ flex: 1, height: 6 }}>
                          <div className="gasto-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', width: 36, textAlign: 'right' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />}
      </div>
    </div>
  );
}
