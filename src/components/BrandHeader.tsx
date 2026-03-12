import '@/styles/theme.css'

export function BrandHeader({
  eyebrow = 'Welcome',
  title = '',
  tagline = 'Let your wardrobe think for you.',
}: {
  eyebrow?: string
  title?: string
  tagline?: string
}) {
  return (
    <header className="brand-header">
      <div className="brand-header__top">
        <img className="brand-header__logo" src="/logo-key.png" alt="" role="presentation" />
        <div className="brand-header__wordmark">Pettagama</div>
      </div>
      <div className="brand-header__meta">
        <div className="page-eyebrow">{eyebrow}</div>
        {title ? (
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {title}
          </h1>
        ) : null}
        <p className="brand-tagline">{tagline}</p>
      </div>
    </header>
  )
}

