import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getRankingCategorias, getRankingPartidos } from "../services/api";
import type { RankingCategoria, RankingPartido } from "../types";
import { ANOS, formatBRL } from "../utils";

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
    <div className="px-8 py-10 pb-16 max-w-full animate-[fadeUp_0.35s_ease_both]">
      <div className="mb-8">
        <h1 className="page-title-gradient text-[42px] font-extrabold tracking-[-0.04em] mb-2">Gastos por Partido</h1>
        <p className="text-[var(--text-muted)] text-sm tracking-wide">Comparativo do uso da cota parlamentar entre partidos e categorias</p>
      </div>

      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <SelectField
          value={String(ano)}
          onValueChange={(v) => setAno(Number(v))}
          options={anoOptions}
          className="w-[120px]"
        />
      </div>

      {loading && (
        <div className="py-14 text-center">
          <span className="inline-block w-[22px] h-[22px] border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden p-6">
              {partidos.length === 0 ? (
                <p className="py-14 text-center text-[var(--text-muted)] text-sm">Sem dados para o período selecionado.</p>
              ) : (
                <>
                  <div className="grid items-center gap-4 pb-3 mb-1 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest" style={{ gridTemplateColumns: '80px 1fr 110px 100px 140px' }}>
                    <span>Partido</span>
                    <span />
                    <span className="text-right">Total (R$)</span>
                    <span className="text-right">Deputados</span>
                    <span className="text-right">Média/dep. (R$)</span>
                  </div>

                  <div className="flex flex-col">
                    {partidosCurrent.map((p, i) => (
                      <div
                        key={p.partido}
                        className="grid items-center gap-4 py-2.5 px-1.5 border-b border-[var(--border)] last:border-b-0 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors"
                        style={{ gridTemplateColumns: '80px 1fr 110px 100px 140px', animationDelay: `${i * 25}ms`, animation: 'fadeUp 0.3s ease both' }}
                      >
                        <span className="font-sans font-extrabold text-[15px] text-[var(--text-h)] tracking-[-0.01em]">
                          {p.partido}
                        </span>
                        <div className="h-1.5 bg-[var(--bg-raised)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div className="gasto-bar-fill" style={{ width: `${(p.total / maxPartido) * 100}%` }} />
                        </div>
                        <span className="text-right font-mono font-semibold text-[12px] text-[var(--accent)]">
                          {formatBRL(p.total)}
                        </span>
                        <span className="text-right font-mono text-[12px] text-[var(--text-muted)]">
                          {p.qtd_parlamentares}
                        </span>
                        <span className="text-right font-mono text-[12px] text-[var(--text-strong)]">
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden p-6">
              {categorias.length === 0 ? (
                <p className="py-14 text-center text-[var(--text-muted)] text-sm">Sem dados para o período selecionado.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3.5">
                    {categoriasCurrent.map((cat, i) => (
                      <div
                        key={cat.categoria}
                        className="grid items-center gap-3.5"
                        style={{ gridTemplateColumns: '200px 1fr 110px', animationDelay: `${i * 25}ms`, animation: 'fadeUp 0.3s ease both' }}
                      >
                        <span className="text-[12px] font-medium text-[var(--text)] overflow-hidden text-ellipsis whitespace-nowrap" title={cat.categoria}>
                          {cat.categoria}
                        </span>
                        <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div className="gasto-bar-fill" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[12px] font-semibold text-[var(--text-strong)] text-right whitespace-nowrap">{formatBRL(cat.total)}</span>
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
