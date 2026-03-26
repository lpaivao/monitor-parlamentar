import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import ParlamentaresPage from './pages/ParlamentaresPage'
import ParlamentarPage from './pages/ParlamentarPage'
import PartidosPage from './pages/PartidosPage'
import RankingPage from './pages/RankingPage'
import './styles/index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-svh flex-1">
        <header className="sticky top-0 z-100 flex items-center justify-between px-8 h-15 gap-6 border-b border-[var(--border)] bg-[rgba(8,11,20,0.85)] backdrop-blur-xl">
          <span className="topbar-brand font-sans text-[17px] font-extrabold text-[var(--text-h)] tracking-tight flex items-center gap-2.5 whitespace-nowrap">Monitor Parlamentar</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => `font-sans text-[13px] font-medium px-3.5 py-1.5 rounded-[var(--radius-sm)] border transition-all tracking-wide uppercase ${isActive ? 'text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--accent-border)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border)]'}`}>Ranking</NavLink>
            <NavLink to="/parlamentares" className={({ isActive }) => `font-sans text-[13px] font-medium px-3.5 py-1.5 rounded-[var(--radius-sm)] border transition-all tracking-wide uppercase ${isActive ? 'text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--accent-border)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border)]'}`}>Parlamentares</NavLink>
            <NavLink to="/partidos" className={({ isActive }) => `font-sans text-[13px] font-medium px-3.5 py-1.5 rounded-[var(--radius-sm)] border transition-all tracking-wide uppercase ${isActive ? 'text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--accent-border)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border)]'}`}>Partidos</NavLink>
          </nav>
        </header>

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<RankingPage />} />
            <Route path="/parlamentares" element={<ParlamentaresPage />} />
            <Route path="/parlamentares/:id" element={<ParlamentarPage />} />
            <Route path="/partidos" element={<PartidosPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
