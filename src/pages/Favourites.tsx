import { getFavourites } from '@/lib/storage'
import { OutfitCard } from '@/components/OutfitCard'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function Favourites() {
  const favourites = getFavourites()

  return (
    <div className="page">
      <BrandHeader eyebrow="Saved" title="Favourites" tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {favourites.length === 0 ? (
        <div className="card card-accent-mid" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No saved outfits yet. Suggest outfits on the Today screen and tap &quot;Save to favourites&quot; on any you like.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {favourites.map((fav) => (
            <OutfitCard key={fav.outfit.id} outfit={fav.outfit} />
          ))}
        </div>
      )}
    </div>
  )
}
