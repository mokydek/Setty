import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Landing from './landing/Landing'
import Marketplace from './frontend/Marketplace'
import Auth from './frontend/Auth'
import Bounties from './frontend/Bounties'
import Dashboard from './frontend/Dashboard'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Marketplace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bounties" element={<Bounties />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
