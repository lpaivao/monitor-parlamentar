import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRanking } from '../services/api'
import type { RankingItem } from '../types'
import { ANOS, formatBRL, formatCompact, UFS } from '../utils'

export default function RankingPage() {
  const [items, setItems] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)

  const [ano, setAno] = useState(ANOS[0])
  const [casa, setCasa] = useState('')
  const [partido, setPartido] = useState('')
  const [uf, setUf] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRanking({ ano, casa, partido, uf, limit: 100 })
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }, [ano, casa, partido, uf])

  useEffect(() => { load() }, [load])

  const max = items[0]?.total_gasto ?? 1

  const totalGeral = items.reduce((s, i) => s + i.total_gasto, 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ranking de Gastos</h1>
        <p>Top parlamentares por total da cota parlamentar utilizada</p>
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        <select value={ano} onChange={e => setAno(Number(e.target.value))}>
          {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={casa} onChange={e => setCasa(e.target.value)}>
          <option value="">Câmara + Senado</option>
          <option value="camara">Câmara</option>
          <option value="senado">Senado</option>
        </select>

        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={e => setPartido(e.target.value.toUpperCase())}
          style={{ width: 140 }}
          maxLength={10}
        />

        <select value={uf} onChange={e => setUf(e.target.value)}>
          <option value="">Todos os estados</option>
          {UFS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Stat */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Parlamentares</div>
          <div className="value">{items.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total gasto em {ano}</div>
          <div className="value">{formatCompact(totalGeral)}</div>
          <div className="sub">{formatBRL(totalGeral)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maior gasto individual</div>
          <div className="value">{items[0] ? formatCompact(items[0].total_gasto) : '—'}</div>
          <div className="sub">{items[0]?.nome ?? ''}</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Parlamentar</th>
                <th>Partido / UF</th>
                <th>Casa</th>
                <th>Despesas</th>
                <th>Total gasto</th>
                <th style={{ width: 160 }}>Proporção</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={7}><span className="spinner" /></td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">Nenhum resultado encontrado.</td>
                </tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{item.posicao}</td>
                  <td>
                    <div className="parlamentar-cell">
                      <Avatar nome={item.nome} foto={item.foto_url} />
                      <Link to={`/parlamentares/${item.id}`}>{item.nome}</Link>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-partido">
                      {item.sigla_partido ?? '—'} / {item.sigla_uf ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${item.casa}`}>
                      {item.casa === 'camara' ? 'Câmara' : 'Senado'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{item.qtd_despesas.toLocaleString('pt-BR')}</td>
                  <td style={{ fontWeight: 600 }}>{formatBRL(item.total_gasto)}</td>
                  <td>
                    <div className="gasto-bar-wrap">
                      <div className="gasto-bar-bg">
                        <div
                          className="gasto-bar-fill"
                          style={{ width: `${(item.total_gasto / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Avatar({ nome, foto }: { nome: string; foto: string | null }) {
  if (foto) {
    return <img src={foto} alt={nome} className="avatar" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  }
  return <div className="avatar-placeholder">{nome[0]}</div>
}
