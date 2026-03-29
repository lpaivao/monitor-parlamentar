import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ParlamentaresPage from './pages/ParlamentaresPage'
import ParlamentarPage from './pages/ParlamentarPage'
import PartidosPage from './pages/PartidosPage'
import RankingPage from './pages/RankingPage'
import './styles/index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RankingPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/parlamentares" element={<ParlamentaresPage />} />
          <Route path="/parlamentares/:id" element={<ParlamentarPage />} />
          <Route path="/partidos" element={<PartidosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
