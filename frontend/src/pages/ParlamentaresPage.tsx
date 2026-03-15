import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getParlamentares } from '../services/api'
import type { Paginated, Parlamentar } from '../types'
import { ANOS, formatBRL, UFS } from '../utils'

export default function ParlamentaresPage() {
  const [result, setResult] = useState<Paginated<Parlamentar> | null>(null)
  const [loading, setLoading] = useState(true)

  const [nome, setNome] = useState('')
  const [partido, setPartido] = useState('')
  const [uf, setUf] = useState('')
  const [casa, setCasa] = useState('')
  const [ano, setAno] = useState(ANOS[0])
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getParlamentares({ nome, partido, uf, casa, ano, page, perPage: 50 } as any)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }, [nome, partido, uf, casa, ano, page])

  useEffect(() => { setPage(1) }, [nome, partido, uf, casa, ano])
  useEffect(() => { load() }, [load])

  const meta = result?.meta
  const data = result?.data ?? []

  return (
    <div className="page">
      <div className="page-header">
        <h1>Parlamentares</h1>
        <p>Busque e filtre por nome, partido, estado ou casa</p>
      </div>

      <div className="filter-bar">
        <input
          name="nome"
          placeholder="Buscar por nome..."
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={e => setPartido(e.target.value.toUpperCase())}
          style={{ width: 120 }}
          maxLength={10}
        />

        <select value={uf} onChange={e => setUf(e.target.value)}>
          <option value="">Todos os estados</option>
          {UFS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <select value={casa} onChange={e => setCasa(e.target.value)}>
          <option value="">Câmara + Senado</option>
          <option value="camara">Câmara</option>
          <option value="senado">Senado</option>
        </select>

        <select value={ano} onChange={e => setAno(Number(e.target.value))}>
          {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parlamentar</th>
                <th>Partido</th>
                <th>UF</th>
                <th>Casa</th>
                <th>Total gasto em {ano}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={6}><span className="spinner" /></td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">Nenhum parlamentar encontrado.</td>
                </tr>
              )}
              {!loading && data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="parlamentar-cell">
                      <Avatar nome={p.nome} foto={p.foto_url} />
                      <span>{p.nome}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-partido">{p.sigla_partido ?? '—'}</span></td>
                  <td>{p.sigla_uf ?? '—'}</td>
                  <td>
                    <span className={`badge badge-${p.casa}`}>
                      {p.casa === 'camara' ? 'Câmara' : 'Senado'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {p.total_gasto !== undefined ? formatBRL(p.total_gasto) : '—'}
                  </td>
                  <td>
                    <Link to={`/parlamentares/${p.id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>
                      Ver detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Anterior
            </button>
            <span>Página {meta.current_page} de {meta.last_page}</span>
            <button
              className="btn btn-ghost"
              disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Avatar({ nome, foto }: { nome: string; foto: string | null }) {
  if (foto) return <img src={foto} alt={nome} className="avatar" />
  return <div className="avatar-placeholder">{nome[0]}</div>
}
