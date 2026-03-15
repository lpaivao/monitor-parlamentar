import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import ParlamentaresPage from './pages/ParlamentaresPage'
import ParlamentarPage from './pages/ParlamentarPage'
import PartidosPage from './pages/PartidosPage'
import RankingPage from './pages/RankingPage'
import './styles/index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <span className="topbar-brand">🏛 Monitor Parlamentar</span>
          <nav>
            <NavLink to="/" end>Ranking</NavLink>
            <NavLink to="/parlamentares">Parlamentares</NavLink>
            <NavLink to="/partidos">Partidos</NavLink>
          </nav>
        </header>

        <main>
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
