import { useId } from 'react'
import { NavLink } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg className="nav-svg-icon" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M100.5 40.75V96.5H66V68.5V65H62.5H43H39.5V68.5V96.5H3.5V40.75L52 4.375L100.5 40.75Z" stroke="currentColor" strokeWidth="7" />
    </svg>
  )
}

/* Person icon (head + shoulders) — used for Profile */
function ProfilePersonIcon() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="nav-svg-icon" width="104" height="100" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="21.5" y="3.5" width="60" height="60" rx="30" stroke="currentColor" strokeWidth="7" />
      <g clipPath={`url(#${id}-clip)`}>
        <mask id={`${id}-mask`} style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="61" width="104" height="52">
          <path d="M0 113C0 84.2812 23.4071 61 52.1259 61C80.706 61 104 84.4199 104 113H0Z" fill="white" />
        </mask>
        <g mask={`url(#${id}-mask)`}>
          <path d="M-7 113C-7 80.4152 19.4152 54 52 54H52.2512C84.6973 54 111 80.3027 111 112.749H97C97 88.0347 76.9653 68 52.2512 68H52C27.1472 68 7 88.1472 7 113H-7ZM-7 113C-7 80.4152 19.4152 54 52 54V68C27.1472 68 7 88.1472 7 113H-7ZM52.2512 54C84.6973 54 111 80.3027 111 112.749V113H97V112.749C97 88.0347 76.9653 68 52.2512 68V54Z" fill="currentColor" />
        </g>
      </g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width="104" height="39" fill="white" transform="translate(0 61)" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* Circle + line icon — used for Wardrobe */
function WardrobeCircleIcon() {
  return (
    <svg className="nav-svg-icon" width="101" height="114" viewBox="0 0 101 114" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="46.1726" cy="46.1727" r="29.5497" transform="rotate(36.0692 46.1726 46.1727)" stroke="currentColor" strokeWidth="7" />
      <line x1="61.7089" y1="67.7837" x2="97.7088" y2="111.784" stroke="currentColor" strokeWidth="7" />
    </svg>
  )
}

function FavouritesIcon() {
  return (
    <svg className="nav-svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

function WishlistIcon() {
  return (
    <svg className="nav-svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const navItems = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/wardrobe', label: 'Wardrobe', icon: <WardrobeCircleIcon /> },
  { to: '/capsule', label: 'Capsule', icon: <FavouritesIcon /> },
  { to: '/wishlist', label: 'Wishlist', icon: <WishlistIcon /> },
  { to: '/profile', label: 'Profile', icon: <ProfilePersonIcon /> },
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
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
