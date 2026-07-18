import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import CuratorRoute from './components/CuratorRoute'
import { RouteFallback } from './components/Skeletons'

// Route-level code splitting: each page loads on demand.
const CurationQueue = lazy(() => import('./frontend/CurationQueue'))
const Landing = lazy(() => import('./landing/Landing'))
const Marketplace = lazy(() => import('./frontend/Marketplace'))
const Auth = lazy(() => import('./frontend/Auth'))
const Bounties = lazy(() => import('./frontend/Bounties'))
const BountyDetail = lazy(() => import('./frontend/BountyDetail'))
const CollectionPage = lazy(() => import('./frontend/CollectionPage'))
const License = lazy(() => import('./frontend/License'))
const Dashboard = lazy(() => import('./frontend/Dashboard'))
const Cart = lazy(() => import('./frontend/Cart'))
const SellAsset = lazy(() => import('./frontend/SellAsset'))
const Profile = lazy(() => import('./frontend/Profile'))
const PublicProfile = lazy(() => import('./frontend/PublicProfile'))
const AssetDetail = lazy(() => import('./frontend/AssetDetail'))
const EditAsset = lazy(() => import('./frontend/EditAsset'))
const Wishlist = lazy(() => import('./frontend/Wishlist'))
const CheckoutSuccess = lazy(() => import('./frontend/CheckoutSuccess'))
const NotFound = lazy(() => import('./frontend/NotFound'))

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/app" element={<Marketplace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/bounties" element={<Bounties />} />
                  <Route path="/bounty/:id" element={<BountyDetail />} />
                  <Route path="/collection/:slug" element={<CollectionPage />} />
                  <Route path="/license" element={<License />} />
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
                  <Route
                    path="/curation"
                    element={
                      <CuratorRoute>
                        <CurationQueue />
                      </CuratorRoute>
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
              </Suspense>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
