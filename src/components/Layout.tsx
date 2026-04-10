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
        <img
          src="/design-room-fab-icon.png"
          alt=""
          className="design-room-fab__img"
          width={576}
          height={1024}
          decoding="async"
        />
      </Link>
    </div>
  )
}
