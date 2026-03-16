import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getRankingCategorias, getRankingPartidos } from "../services/api";
import type { RankingCategoria, RankingPartido } from "../types";
import { ANOS, formatBRL, formatCompact } from "../utils";

const CLIENT_PER_PAGE = 12;

function getSlice<T>(items: T[], page: number) {
  const start = (page - 1) * CLIENT_PER_PAGE;
  return items.slice(start, start + CLIENT_PER_PAGE);
}

export default function PartidosPage() {
  const [ano, setAno] = useState(ANOS[0]);
  const [tab, setTab] = useState<"partidos" | "categorias">("partidos");

  const [partidos, setPartidos] = useState<RankingPartido[]>([]);
  const [categorias, setCategorias] = useState<RankingCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [partidosPage, setPartidosPage] = useState(1);
  const [categoriasPage, setCategoriasPage] = useState(1);

  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  useEffect(() => {
    setLoading(true);
    setPartidosPage(1);
    setCategoriasPage(1);

    Promise.all([getRankingPartidos({ ano }), getRankingCategorias({ ano })])
      .then(([rp, rc]) => {
        setPartidos(rp.data);
        setCategorias(rc.data);
      })
      .finally(() => setLoading(false));
  }, [ano]);

  const maxPartido = Math.max(...partidos.map((p) => p.total), 1);
  const maxCategoria = Math.max(...categorias.map((c) => c.total), 1);

  const partidosLastPage = Math.max(1, Math.ceil(partidos.length / CLIENT_PER_PAGE));
  const categoriasLastPage = Math.max(1, Math.ceil(categorias.length / CLIENT_PER_PAGE));

  const partidosCurrent = getSlice(partidos, partidosPage);
  const categoriasCurrent = getSlice(categorias, categoriasPage);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gastos por Partido</h1>
        <p>Comparativo do uso da cota parlamentar entre partidos e categorias</p>
      </div>

      <div className="filter-bar">
        <SelectField
          value={String(ano)}
          onValueChange={(v) => setAno(Number(v))}
          options={anoOptions}
          className="w-120"
        />
      </div>

      {loading && (
        <div className="empty"><span className="spinner" /></div>
      )}

      {!loading && (
        <TabsField
          value={tab}
          onValueChange={(v) => setTab(v as "partidos" | "categorias")}
          items={[
            { value: "partidos", label: "Por partido" },
            { value: "categorias", label: "Por categoria de gasto" },
          ]}
        >
          <TabPanel value="partidos">
            <div className="card card-body">
              {partidos.length === 0 ? (
                <p className="empty">Sem dados para o período selecionado.</p>
              ) : (
                <>
                  <div className="partidos-grid-header">
                    <span>Partido</span>
                    <span />
                    <span style={{ textAlign: "right" }}>Total (R$)</span>
                    <span style={{ textAlign: "right" }}>Deputados</span>
                    <span style={{ textAlign: "right" }}>Média/dep. (R$)</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {partidosCurrent.map((p, i) => (
                      <div key={p.partido} className="partidos-grid-row" style={{
                        animationDelay: `${i * 25}ms`,
                        animation: 'fadeUp 0.3s ease both',
                      }}>
                        <span style={{
                          fontFamily: 'var(--heading)',
                          fontWeight: 800,
                          fontSize: 15,
                          color: 'var(--text-h)',
                          letterSpacing: '-0.01em',
                        }}>
                          {p.partido}
                        </span>
                        <div className="gasto-bar-bg" style={{ height: 6 }}>
                          <div className="gasto-bar-fill" style={{ width: `${(p.total / maxPartido) * 100}%` }} />
                        </div>
                        <span style={{ textAlign: "right", fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 12, color: 'var(--accent)' }}>
                          {formatCompact(p.total)}
                        </span>
                        <span style={{ textAlign: "right", fontFamily: 'var(--mono)', color: 'var(--text-muted)', fontSize: 12 }}>
                          {p.qtd_parlamentares}
                        </span>
                        <span style={{ textAlign: "right", fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-strong)' }}>
                          {formatBRL(p.media_por_parlamentar)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Pagination currentPage={partidosPage} lastPage={partidosLastPage} onPageChange={setPartidosPage} />
                </>
              )}
            </div>
          </TabPanel>

          <TabPanel value="categorias">
            <div className="card card-body">
              {categorias.length === 0 ? (
                <p className="empty">Sem dados para o período selecionado.</p>
              ) : (
                <>
                  <div className="bar-chart">
                    {categoriasCurrent.map((cat, i) => (
                      <div key={cat.categoria} className="bar-row" style={{
                        animationDelay: `${i * 25}ms`,
                        animation: 'fadeUp 0.3s ease both',
                      }}>
                        <span className="bar-label" title={cat.categoria}>
                          {cat.categoria}
                        </span>
                        <div className="gasto-bar-bg" style={{ height: 8 }}>
                          <div className="gasto-bar-fill" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                        </div>
                        <span className="bar-amount">{formatCompact(cat.total)}</span>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={categoriasPage}
                    lastPage={categoriasLastPage}
                    onPageChange={setCategoriasPage}
                  />
                </>
              )}
            </div>
          </TabPanel>
        </TabsField>
      )}
    </div>
  );
}
