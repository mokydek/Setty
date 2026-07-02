import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './landing/LandingPage'
import Marketplace from './frontend/Marketplace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Marketplace />} />
      </Routes>
    </BrowserRouter>
  )
}
