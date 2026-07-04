import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Mountain,
  UserRound,
  Package,
  Sparkles,
  LayoutGrid,
  Triangle,
  Zap,
  Paintbrush,
  Camera,
  ArrowRight,
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { supabase } from '../backend/supabase'

const CATEGORY_ICONS = [
  { key: 'environment', icon: Mountain },
  { key: 'character', icon: UserRound },
  { key: 'prop', icon: Package },
  { key: 'vfx', icon: Sparkles },
  { key: 'uiKit', icon: LayoutGrid },
]

const STYLE_ICONS = [
  { key: 'lowPoly', icon: Triangle },
  { key: 'cyberpunk', icon: Zap },
  { key: 'handPainted', icon: Paintbrush },
  { key: 'realistic', icon: Camera },
]

export default function Layout() {
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const { items } = useCart()
  const { assetIds: wishlistIds } = useWishlist()
  const navigate = useNavigate()
  const [browseOpen, setBrowseOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/app')
    setQuery('')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMobileOpen(false)
    navigate('/')
  }

  const handleSellClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault()
      navigate('/auth')
    }
  }

  const handlePostBountyClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault()
      navigate('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white">
        <div className="hidden md:flex items-center justify-between border-b border-gray-200 bg-black text-white px-8 py-2">
          <span className="text-xs tracking-wide">{t('nav.tagline')}</span>
          <div className="flex items-center gap-6">
            <Link
              to="/sell"
              onClick={handleSellClick}
              className="text-xs font-medium hover:text-[#0000FF] transition-colors"
            >
              {t('nav.sellOnSetty')}
            </Link>
            <Link
              to="/bounties"
              onClick={handlePostBountyClick}
              className="text-xs font-medium hover:text-[#0000FF] transition-colors"
            >
              {t('landing.hero.postBounty')}
            </Link>
            <div className="flex items-center border border-white/30">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  language === 'en' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2.5 py-1 text-xs font-medium border-l border-white/30 transition-colors ${
                  language === 'ru' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                RU
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white px-4 md:px-8 py-4">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="font-bold text-xl tracking-tight text-black shrink-0">
              Setty
            </Link>

            <div className="hidden md:block relative">
              <button
                onClick={() => setBrowseOpen((prev) => !prev)}
                onBlur={() => setTimeout(() => setBrowseOpen(false), 150)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-colors ${
                  browseOpen ? 'bg-black text-white border-black' : 'text-black border-black hover:bg-black hover:text-white'
                }`}
              >
                {t('nav.browse')}
                <ChevronDown size={14} strokeWidth={2} className={`transition-transform ${browseOpen ? 'rotate-180' : ''}`} />
              </button>

              {browseOpen && (
                <div className="absolute top-full left-0 mt-2 w-[640px] border border-black bg-white z-50 flex">
                  <div className="flex-1 p-6 border-r border-gray-200">
                    <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-4 block">
                      {t('nav.categories')}
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {CATEGORY_ICONS.map(({ key, icon: Icon }) => (
                        <Link
                          key={key}
                          to="/app"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-black hover:bg-gray-100 transition-colors"
                        >
                          <Icon size={16} strokeWidth={1.5} className="text-[#0000FF]" />
                          {t(`marketplace.categories.${key}`)}
                        </Link>
                      ))}
                    </div>

                    <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-4 mt-6 block">
                      {t('nav.visualStyles')}
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {STYLE_ICONS.map(({ key, icon: Icon }) => (
                        <Link
                          key={key}
                          to="/app"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-black hover:bg-gray-100 transition-colors"
                        >
                          <Icon size={16} strokeWidth={1.5} className="text-black" />
                          {t(`marketplace.styles.${key}`)}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="w-56 p-6 bg-black text-white flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-medium text-white/50 uppercase tracking-widest mb-3 block">
                        {t('nav.featured')}
                      </span>
                      <p className="text-sm leading-relaxed text-white/80">{t('nav.featuredText')}</p>
                    </div>
                    <Link
                      to="/app"
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-[#0000FF] transition-colors mt-6"
                    >
                      {t('nav.viewAllAssets')}
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex items-center border border-black px-3 py-2.5 gap-2 flex-1 max-w-xl">
              <Search size={16} strokeWidth={1.5} className="text-black/40 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="text-sm outline-none bg-transparent w-full placeholder:text-black/30"
              />
            </form>

            <div className="hidden md:flex items-center gap-1 ml-auto">
              <Link
                to="/wishlist"
                className="relative p-2.5 text-black hover:text-[#0000FF] transition-colors"
                aria-label={t('nav.wishlist')}
              >
                <Heart size={20} strokeWidth={1.5} />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 rounded-none bg-[#0000FF] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative p-2.5 text-black hover:text-[#0000FF] transition-colors"
                aria-label={t('nav.cart')}
              >
                <ShoppingCart size={20} strokeWidth={1.5} />
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 rounded-none bg-[#0000FF] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>

              {!user && (
                <Link
                  to="/auth"
                  className="rounded-none border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors ml-2"
                >
                  {t('nav.signIn')}
                </Link>
              )}

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors ml-2"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors ml-2"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-none border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors ml-2"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden ml-auto p-2 text-black"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 border-b border-gray-200 bg-white px-8 py-3">
          <Link to="/app" className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors">
            {t('nav.marketplace')}
          </Link>
          <Link to="/bounties" className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors">
            {t('nav.bounties')}
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors">
              {t('nav.dashboard')}
            </Link>
          )}
          {user && (
            <Link to="/profile" className="text-sm font-medium text-black hover:text-[#0000FF] transition-colors">
              Profile
            </Link>
          )}
          <span className="w-px h-4 bg-gray-200" />
          {CATEGORY_ICONS.map(({ key }) => (
            <Link
              key={key}
              to="/app"
              className="text-sm text-black/50 hover:text-[#0000FF] transition-colors"
            >
              {t(`marketplace.categories.${key}`)}
            </Link>
          ))}
        </div>

        {mobileOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 flex flex-col gap-1">
            <form onSubmit={handleSearch} className="flex items-center border border-black px-3 py-2.5 gap-2 mb-3">
              <Search size={16} strokeWidth={1.5} className="text-black/40 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="text-sm outline-none bg-transparent w-full placeholder:text-black/30"
              />
            </form>
            <Link to="/app" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100">
              {t('nav.marketplace')}
            </Link>
            <Link to="/bounties" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100">
              {t('nav.bounties')}
            </Link>
            <Link
              to="/sell"
              onClick={(event) => {
                handleSellClick(event)
                setMobileOpen(false)
              }}
              className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100"
            >
              {t('nav.sellOnSetty')}
            </Link>
            <Link
              to="/bounties"
              onClick={(event) => {
                handlePostBountyClick(event)
                setMobileOpen(false)
              }}
              className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100"
            >
              {t('landing.hero.postBounty')}
            </Link>
            {user && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100">
                {t('nav.dashboard')}
              </Link>
            )}
            {user && (
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-medium text-black border-b border-gray-100">
                Profile
              </Link>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-3 rounded-none border border-black text-black px-4 py-3 text-sm font-medium text-center"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="mt-3 rounded-none bg-black text-white px-4 py-3 text-sm font-medium text-center">
                {t('nav.signIn')}
              </Link>
            )}
            <div className="flex items-center border border-black mt-3 w-fit">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-medium ${language === 'en' ? 'bg-black text-white' : 'text-black'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-3 py-1.5 text-xs font-medium border-l border-black ${language === 'ru' ? 'bg-black text-white' : 'text-black'}`}
              >
                RU
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
