import { useState } from 'react'
import { Link } from 'react-router-dom'
import { outfitSignature } from '@/lib/outfitSignature'
import {
  clearSuggestedOutfits,
  getFavourites,
  getSuggestedOutfits,
  saveFavouriteBySignature,
  saveSuggestedOutfits,
  type SuggestedOutfitEntry,
} from '@/lib/storage'
import { OutfitCard } from '@/components/OutfitCard'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function SuggestedOutfits() {
  const [entries, setEntries] = useState<SuggestedOutfitEntry[]>(() => getSuggestedOutfits())
  const [favSigs, setFavSigs] = useState(() => new Set(getFavourites().map((f) => outfitSignature(f.outfit))))

  const handleDeleteAll = () => {
    clearSuggestedOutfits()
    setEntries([])
  }

  const handleSaveLook = (entry: SuggestedOutfitEntry) => {
    if (saveFavouriteBySignature(entry.outfit)) {
      setFavSigs((prev) => new Set([...prev, outfitSignature(entry.outfit)]))
    }
  }

  const handleRemoveOne = (outfitId: string) => {
    const next = getSuggestedOutfits().filter((e) => e.outfit.id !== outfitId)
    saveSuggestedOutfits(next)
    setEntries(next)
  }

  return (
    <div className="page page--suggested">
      <BrandHeader
        eyebrow="Your picks"
        title="Suggested outfits"
        tagline="Looks stay here until you clear them. Save any look to Favourites."
      />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {entries.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <button type="button" className="btn btn-primary btn-block" onClick={handleDeleteAll}>
            Delete all suggested outfits
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="card card-accent-mid" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ margin: 0 }}>
            No suggestions saved yet. On <Link to="/">Home</Link>, choose an occasion and tap &quot;Suggest 3 outfits&quot; — they&apos;ll appear here and stay until you delete them.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {entries.map((entry) => (
            <div key={entry.outfit.id}>
              <OutfitCard
                outfit={entry.outfit}
                improvements={entry.improvements}
                onSave={() => handleSaveLook(entry)}
                savedToFavourites={favSigs.has(outfitSignature(entry.outfit))}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: '0.5rem', width: '100%' }}
                onClick={() => handleRemoveOne(entry.outfit.id)}
              >
                Remove this outfit
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/favourites">Open Favourites</Link>
        {' · '}
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  )
}
