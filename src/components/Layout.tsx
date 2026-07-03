import { Outlet, Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function Layout() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-tight text-black">
          Setty
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/app"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            {t('nav.marketplace')}
          </Link>
          <Link
            to="/bounties"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            {t('nav.bounties')}
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
          >
            {t('nav.dashboard')}
          </Link>

          <div className="flex items-center border border-black">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                language === 'en' ? 'bg-black text-white' : 'bg-white text-black hover:text-[#0000FF]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-3 py-1.5 text-xs font-medium border-l border-black transition-colors ${
                language === 'ru' ? 'bg-black text-white' : 'bg-white text-black hover:text-[#0000FF]'
              }`}
            >
              RU
            </button>
          </div>

          <Link
            to="/auth"
            className="rounded-none border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
