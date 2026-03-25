import { Link, Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import '@/styles/theme.css'

export function Layout() {
  return (
    <div className="app-layout">
      <main className="app-main">
        <Outlet />
      </main>
      <Nav />
      <Link to="/design-room" className="design-room-fab" aria-label="Open design room" title="Design room">
        <img src="/logo-key.png" alt="" width={28} height={28} />
      </Link>
    </div>
  )
}
