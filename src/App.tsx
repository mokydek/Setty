import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './landing/Landing'
import Marketplace from './frontend/Marketplace'
import Auth from './frontend/Auth'
import Bounties from './frontend/Bounties'
import BountyDetail from './frontend/BountyDetail'
import Dashboard from './frontend/Dashboard'
import Cart from './frontend/Cart'
import SellAsset from './frontend/SellAsset'
import Profile from './frontend/Profile'
import PublicProfile from './frontend/PublicProfile'
import AssetDetail from './frontend/AssetDetail'
import EditAsset from './frontend/EditAsset'
import Wishlist from './frontend/Wishlist'
import CheckoutSuccess from './frontend/CheckoutSuccess'
import NotFound from './frontend/NotFound'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/app" element={<Marketplace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/bounties" element={<Bounties />} />
                  <Route path="/bounty/:id" element={<BountyDetail />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sell"
                    element={
                      <ProtectedRoute>
                        <SellAsset />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/success"
                    element={
                      <ProtectedRoute>
                        <CheckoutSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/profile/:id" element={<PublicProfile />} />
                  <Route path="/asset/:id" element={<AssetDetail />} />
                  <Route
                    path="/edit-asset/:id"
                    element={
                      <ProtectedRoute>
                        <EditAsset />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
