import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getDespesasParlamentar, getParlamentar } from "../services/api";
import type { Despesa, Paginated, ParlamentarDetalhe } from "../types";
import { ANOS, formatBRL, MESES } from "../utils";

export default function ParlamentarPage() {
  const { id } = useParams<{ id: string }>();
  const [ano, setAno] = useState(ANOS[0]);
  const [tab, setTab] = useState<"categorias" | "despesas">("categorias");

  const [parlamentar, setParlamentar] = useState<ParlamentarDetalhe | null>(null);
  const [loadingParlamentar, setLoadingParlamentar] = useState(true);

  const [despesas, setDespesas] = useState<Paginated<Despesa> | null>(null);
  const [loadingDespesas, setLoadingDespesas] = useState(false);
  const [page, setPage] = useState(1);

  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  useEffect(() => {
    if (!id) return;
    setLoadingParlamentar(true);
    getParlamentar(Number(id), ano)
      .then(setParlamentar)
      .finally(() => setLoadingParlamentar(false));
  }, [id, ano]);

  useEffect(() => {
    if (!id || tab !== "despesas") return;
    setLoadingDespesas(true);
    getDespesasParlamentar(Number(id), { ano, page, perPage: 15 })
      .then(setDespesas)
      .finally(() => setLoadingDespesas(false));
  }, [id, tab, ano, page]);

  useEffect(() => { setPage(1); }, [ano]);

  if (loadingParlamentar) {
    return (
      <div className="page">
        <div className="empty"><span className="spinner" /></div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="page">
        <div className="empty">
          Parlamentar não encontrado.{" "}
          <Link to="/parlamentares">← Voltar</Link>
        </div>
      </div>
    );
  }

  const maxCategoria = Math.max(...(parlamentar.por_categoria?.map((c) => c.total) ?? [1]), 1);
  const mediaMensal = formatBRL(parlamentar.total_gasto / Math.max(parlamentar.por_mes?.length ?? 1, 1));

  return (
    <div className="page">
      {/* Back link */}
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/parlamentares"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          ← Parlamentares
        </Link>
      </div>

      {/* Hero card */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <ParlamentarAvatar nome={parlamentar.nome} foto={parlamentar.foto_url} size="lg" />
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
                {parlamentar.nome}
              </h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-partido">{parlamentar.sigla_partido ?? "-"}</span>
                <span className="badge badge-partido">{parlamentar.sigla_uf ?? "-"}</span>
                <span className="badge badge-camara">Câmara dos Deputados</span>
              </div>
            </div>
          </div>

          <SelectField
            value={String(ano)}
            onValueChange={(v) => setAno(Number(v))}
            options={anoOptions}
            className="w-120"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Total gasto em {ano}</div>
          <div className="value" style={{ fontSize: 20, color: 'var(--accent)' }}>
            {formatBRL(parlamentar.total_gasto)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Categorias utilizadas</div>
          <div className="value">{parlamentar.por_categoria?.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maior categoria</div>
          <div className="value" style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>
            {parlamentar.por_categoria?.[0]?.tipo_despesa ?? "-"}
          </div>
          <div className="sub">
            {parlamentar.por_categoria?.[0] ? formatBRL(parlamentar.por_categoria[0].total) : ""}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Média mensal</div>
          <div className="value" style={{ fontSize: 20 }}>{mediaMensal}</div>
        </div>
      </div>

      {/* Monthly chart */}
      {parlamentar.por_mes && parlamentar.por_mes.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--heading)', fontWeight: 700, marginBottom: 20, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Gasto mensal — {ano}
          </h3>
          <MesChart data={parlamentar.por_mes} />
        </div>
      )}

      {/* Tabs */}
      <TabsField
        value={tab}
        onValueChange={(v) => setTab(v as "categorias" | "despesas")}
        items={[
          { value: "categorias", label: "Por categoria" },
          { value: "despesas", label: "Notas individuais" },
        ]}
      >
        <TabPanel value="categorias">
          <div className="card card-body">
            {!parlamentar.por_categoria?.length ? (
              <p className="empty">Nenhuma despesa encontrada para {ano}.</p>
            ) : (
              <div className="bar-chart">
                {parlamentar.por_categoria.map((cat, i) => (
                  <div key={cat.tipo_despesa} className="bar-row" style={{
                    animationDelay: `${i * 30}ms`,
                    animation: 'fadeUp 0.3s ease both',
                  }}>
                    <span className="bar-label" title={cat.tipo_despesa ?? "-"}>
                      {cat.tipo_despesa ?? "-"}
                    </span>
                    <div className="gasto-bar-bg" style={{ height: 8 }}>
                      <div className="gasto-bar-fill" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                    </div>
                    <span className="bar-amount">{formatBRL(cat.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="despesas">
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Fornecedor</th>
                    <th>Documento</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDespesas && (
                    <tr className="loading-row">
                      <td colSpan={5}><span className="spinner" /></td>
                    </tr>
                  )}
                  {!loadingDespesas && (despesas?.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty">Nenhuma despesa encontrada.</td>
                    </tr>
                  )}
                  {!loadingDespesas && (despesas?.data ?? []).map((d) => (
                    <tr key={d.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                          {d.data_emissao
                            ? new Date(d.data_emissao).toLocaleDateString("pt-BR")
                            : `${MESES[(d.mes ?? 1) - 1]}/${ano}`}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{d.tipo_despesa ?? "-"}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-strong)' }}>{d.fornecedor ?? "-"}</td>
                      <td>
                        {d.url_documento ? (
                          <a href={d.url_documento} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                            Ver nota ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.numero_documento ?? "-"}</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>
                          {formatBRL(d.valor_liquido)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {despesas?.meta && (
              <Pagination
                currentPage={despesas.meta.currentPage}
                lastPage={despesas.meta.lastPage}
                onPageChange={setPage}
              />
            )}
          </div>
        </TabPanel>
      </TabsField>
    </div>
  );
}

function MesChart({ data }: { data: { mes: number; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, padding: '0 4px' }}>
      {Array.from({ length: 12 }, (_, i) => {
        const found = data.find((d) => d.mes === i + 1);
        const pct = found ? (found.total / max) * 100 : 0;

        return (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: '100%', justifyContent: 'flex-end' }}
          >
            <div
              title={found ? formatBRL(found.total) : "Sem dados"}
              style={{
                width: "100%",
                height: `${Math.max(pct, 3)}%`,
                background: pct > 0
                  ? 'linear-gradient(180deg, rgba(34,211,160,0.9) 0%, rgba(34,211,160,0.5) 100%)'
                  : 'var(--border)',
                borderRadius: "4px 4px 0 0",
                minHeight: 3,
                transition: "height 0.5s cubic-bezier(0.4,0,0.2,1)",
                cursor: found ? "pointer" : "default",
                border: pct > 0 ? '1px solid rgba(34,211,160,0.3)' : '1px solid var(--border)',
                borderBottom: 'none',
              }}
            />
            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              {MESES[i].slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
