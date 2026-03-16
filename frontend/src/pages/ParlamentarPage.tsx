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

  useEffect(() => {
    setPage(1);
  }, [ano]);

  if (loadingParlamentar) {
    return (
      <div className="page">
        <div className="empty">
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="page">
        <div className="empty">
          Parlamentar nao encontrado. <Link to="/parlamentares">Voltar</Link>
        </div>
      </div>
    );
  }

  const maxCategoria = Math.max(...(parlamentar.por_categoria?.map((item) => item.total) ?? [1]), 1);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link to="/parlamentares" style={{ color: "var(--muted)", fontSize: 14 }}>
          Voltar para parlamentares
        </Link>
      </div>

      <div className="card card-body" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <ParlamentarAvatar nome={parlamentar.nome} foto={parlamentar.foto_url} size="lg" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{parlamentar.nome}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span className="badge badge-partido">{parlamentar.sigla_partido ?? "-"}</span>
              <span className="badge badge-partido">{parlamentar.sigla_uf ?? "-"}</span>
              <span className="badge badge-camara">Camara dos Deputados</span>
            </div>
          </div>

          <SelectField
            value={String(ano)}
            onValueChange={(value) => setAno(Number(value))}
            options={anoOptions}
            className="w-120"
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total gasto em {ano}</div>
          <div className="value" style={{ fontSize: 20 }}>
            {formatBRL(parlamentar.total_gasto)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Categorias utilizadas</div>
          <div className="value">{parlamentar.por_categoria?.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maior categoria</div>
          <div className="value" style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
            {parlamentar.por_categoria?.[0]?.tipo_despesa ?? "-"}
          </div>
          <div className="sub">{parlamentar.por_categoria?.[0] ? formatBRL(parlamentar.por_categoria[0].total) : ""}</div>
        </div>
        <div className="stat-card">
          <div className="label">Media mensal</div>
          <div className="value" style={{ fontSize: 20 }}>
            {formatBRL(parlamentar.total_gasto / Math.max(parlamentar.por_mes?.length ?? 1, 1))}
          </div>
        </div>
      </div>

      {parlamentar.por_mes && parlamentar.por_mes.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Gasto mensal</h3>
          <MesChart data={parlamentar.por_mes} />
        </div>
      )}

      <TabsField
        value={tab}
        onValueChange={(value) => setTab(value as "categorias" | "despesas")}
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
                {parlamentar.por_categoria.map((categoria) => (
                  <div key={categoria.tipo_despesa} className="bar-row">
                    <span className="bar-label" title={categoria.tipo_despesa ?? "-"}>
                      {categoria.tipo_despesa ?? "-"}
                    </span>
                    <div className="gasto-bar-bg" style={{ height: 8 }}>
                      <div className="gasto-bar-fill" style={{ width: `${(categoria.total / maxCategoria) * 100}%` }} />
                    </div>
                    <span className="bar-amount">{formatBRL(categoria.total)}</span>
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
                      <td colSpan={5}>
                        <span className="spinner" />
                      </td>
                    </tr>
                  )}
                  {!loadingDespesas && (despesas?.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nenhuma despesa encontrada.
                      </td>
                    </tr>
                  )}
                  {!loadingDespesas &&
                    (despesas?.data ?? []).map((despesa) => (
                      <tr key={despesa.id}>
                        <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {despesa.data_emissao
                            ? new Date(despesa.data_emissao).toLocaleDateString("pt-BR")
                            : `${MESES[(despesa.mes ?? 1) - 1]}/${ano}`}
                        </td>
                        <td style={{ fontSize: 13 }}>{despesa.tipo_despesa ?? "-"}</td>
                        <td style={{ fontSize: 13 }}>{despesa.fornecedor ?? "-"}</td>
                        <td style={{ fontSize: 12, color: "var(--muted)" }}>
                          {despesa.url_documento ? (
                            <a href={despesa.url_documento} target="_blank" rel="noreferrer">
                              Ver nota
                            </a>
                          ) : (
                            despesa.numero_documento ?? "-"
                          )}
                        </td>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatBRL(despesa.valor_liquido)}</td>
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
  const max = Math.max(...data.map((item) => item.total), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {Array.from({ length: 12 }, (_, index) => {
        const found = data.find((item) => item.mes === index + 1);
        const pct = found ? (found.total / max) * 100 : 0;

        return (
          <div
            key={index}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <div
              title={found ? formatBRL(found.total) : "Sem dados"}
              style={{
                width: "100%",
                height: `${Math.max(pct, 2)}%`,
                background: pct > 0 ? "var(--brand)" : "var(--border)",
                borderRadius: "3px 3px 0 0",
                minHeight: 3,
                transition: "height .3s",
                cursor: found ? "pointer" : "default",
              }}
            />
            <span style={{ fontSize: 10, color: "var(--muted)" }}>{MESES[index]}</span>
          </div>
        );
      })}
    </div>
  );
}
