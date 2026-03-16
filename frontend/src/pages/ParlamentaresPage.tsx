import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { getParlamentares } from "../services/api";
import type { Paginated, Parlamentar } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

export default function ParlamentaresPage() {
  const [result, setResult] = useState<Paginated<Parlamentar> | null>(null);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [ano, setAno] = useState(ANOS[0]);
  const [page, setPage] = useState(1);

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((u) => ({ label: u, value: u }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((a) => ({ label: String(a), value: String(a) })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getParlamentares({ nome, partido, uf, ano, page, perPage: 20 });
      setResult(response);
    } finally {
      setLoading(false);
    }
  }, [nome, partido, uf, ano, page]);

  useEffect(() => {
    setPage(1);
  }, [nome, partido, uf, ano]);

  useEffect(() => {
    load();
  }, [load]);

  const meta = result?.meta;
  const data = result?.data ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Parlamentares</h1>
        <p>Busque e filtre por nome, partido e estado</p>
      </div>

      <div className="filter-bar">
        <input
          name="nome"
          placeholder="Buscar por nome..."
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(event) => setPartido(event.target.value.toUpperCase())}
          style={{ width: 120 }}
          maxLength={10}
        />

        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-160" />

        <SelectField
          value={String(ano)}
          onValueChange={(value) => setAno(Number(value))}
          options={anoOptions}
          className="w-120"
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parlamentar</th>
                <th>Partido</th>
                <th>UF</th>
                <th>Total gasto em {ano}</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={5}>
                    <span className="spinner" />
                  </td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    Nenhum parlamentar encontrado.
                  </td>
                </tr>
              )}
              {!loading &&
                data.map((parlamentar) => (
                  <tr key={parlamentar.id}>
                    <td>
                      <div className="parlamentar-cell">
                        <ParlamentarAvatar nome={parlamentar.nome} foto={parlamentar.foto_url} />
                        <span>{parlamentar.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-partido">{parlamentar.sigla_partido ?? "-"}</span>
                    </td>
                    <td>{parlamentar.sigla_uf ?? "-"}</td>
                    <td style={{ fontWeight: 600 }}>
                      {parlamentar.total_gasto !== undefined ? formatBRL(parlamentar.total_gasto) : "-"}
                    </td>
                    <td>
                      <Link to={`/parlamentares/${parlamentar.id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <Pagination currentPage={meta.currentPage} lastPage={meta.lastPage} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
