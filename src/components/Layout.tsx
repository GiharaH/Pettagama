import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import '@/styles/theme.css'

export function Layout() {
  return (
    <div className="app-layout">
      <main className="app-main">
        <Outlet />
      </main>
      <Nav />
    </div>
  )
}
