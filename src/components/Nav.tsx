import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Today', icon: '🌦️' },
  { to: '/wardrobe', label: 'Wardrobe', icon: '👗' },
  { to: '/favourites', label: 'Favourites', icon: '❤️' },
]

export function Nav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end={to === '/'}
        >
          <span className="nav-icon" aria-hidden>{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
