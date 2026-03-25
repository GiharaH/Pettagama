import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Onboarding } from '@/pages/Onboarding'
import { Home } from '@/pages/Home'
import { Wardrobe } from '@/pages/Wardrobe'
import { AddItem } from '@/pages/AddItem'
import { EditItem } from '@/pages/EditItem'
import { CapsuleListPage } from '@/pages/CapsuleListPage'
import { CapsuleDetailPage } from '@/pages/CapsuleDetailPage'
import { Wishlist } from '@/pages/Wishlist'
import { Profile } from '@/pages/Profile'
import { getProfile } from '@/lib/storage'

const DesignRoom = lazy(() => import('@/pages/DesignRoom').then((m) => ({ default: m.DesignRoom })))

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const profile = getProfile()
  if (!profile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <RequireOnboarding>
              <Layout />
            </RequireOnboarding>
          }
        >
          <Route index element={<Home />} />
          <Route path="suggested" element={<Navigate to="/" replace />} />
          <Route path="wardrobe" element={<Wardrobe />} />
          <Route path="wardrobe/add" element={<AddItem />} />
          <Route path="wardrobe/edit/:id" element={<EditItem />} />
          <Route path="capsule" element={<CapsuleListPage />} />
          <Route path="capsule/:capsuleId" element={<CapsuleDetailPage />} />
          <Route path="favourites" element={<Navigate to="/capsule" replace />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route
          path="/design-room"
          element={
            <RequireOnboarding>
              <Suspense
                fallback={
                  <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading design room…
                  </div>
                }
              >
                <DesignRoom />
              </Suspense>
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
