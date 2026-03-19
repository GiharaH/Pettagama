import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWardrobe, saveWardrobe } from '@/lib/storage'
import { CATEGORY_LABELS, ALL_CATEGORIES, COLOUR_GROUPS, SEASONS } from '@/lib/constants'
import type { WardrobeItem, WardrobeCategory, ColourGroup, SeasonSuitability } from '@/types'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

export function EditItem() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<WardrobeItem | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory | null>(null)
  const [colourGroup, setColourGroup] = useState<ColourGroup>('neutral')
  const [season, setSeason] = useState<SeasonSuitability>('all_season')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    const wardrobe = getWardrobe()
    const found = wardrobe.find((i) => i.id === id) ?? null
    setItem(found)
    if (found) {
      setName(found.name)
      setCategory(found.category)
      setColourGroup(found.colourGroup)
      setSeason(found.season)
    }
  }, [id])

  const handleSave = () => {
    if (!item || category === null) return
    setSaving(true)
    const wardrobe = getWardrobe()
    const updated: WardrobeItem = {
      ...item,
      name: name.trim() || 'Untitled',
      category,
      colourGroup,
      season,
    }
    saveWardrobe(wardrobe.map((i) => (i.id === item.id ? updated : i)))
    setSaving(false)
    navigate('/wardrobe')
  }

  const handleRemove = () => {
    if (!item || !window.confirm('Remove this item from your wardrobe?')) return
    setDeleting(true)
    const wardrobe = getWardrobe().filter((i) => i.id !== item.id)
    saveWardrobe(wardrobe)
    setDeleting(false)
    navigate('/wardrobe')
  }

  if (item === undefined || (id && !item)) {
    return (
      <div className="page page--wardrobe">
        <BrandHeader eyebrow="Wardrobe" title="Item not found" tagline="Let your wardrobe think for you." />
        <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />
        <p style={{ marginBottom: '1rem' }}>This item may have been removed.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/wardrobe')}>
          Back to Wardrobe
        </button>
      </div>
    )
  }

  if (!item || category === null) {
    return (
      <div className="page page--wardrobe">
        <BrandHeader eyebrow="Wardrobe" title="Loading…" tagline="Let your wardrobe think for you." />
      </div>
    )
  }

  return (
    <div className="page page--wardrobe">
      <BrandHeader eyebrow="Edit item" title={item.name || 'Edit'} tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      <div className="clothing-img-wrap" style={{ marginBottom: '1.25rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: 280, aspectRatio: '3/4' }}>
        <img src={item.imageUrl} alt="" />
      </div>

      <label className="field-label">Name (optional)</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Blue kurtha"
        className="field-control"
        style={{ marginBottom: '1rem' }}
      />

      <label className="field-label">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
        className="field-control"
        style={{ marginBottom: '1rem' }}
      >
        {ALL_CATEGORIES.map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </select>

      <label className="field-label">Colour group</label>
      <select
        value={colourGroup}
        onChange={(e) => setColourGroup(e.target.value as ColourGroup)}
        className="field-control"
        style={{ marginBottom: '1rem' }}
      >
        {COLOUR_GROUPS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <label className="field-label">Season</label>
      <select
        value={season}
        onChange={(e) => setSeason(e.target.value as SeasonSuitability)}
        className="field-control"
        style={{ marginBottom: '1.25rem' }}
      >
        {SEASONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/wardrobe')}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ color: 'var(--brown-mid)' }}
        onClick={handleRemove}
        disabled={deleting}
      >
        {deleting ? 'Removing…' : 'Remove from wardrobe'}
      </button>
    </div>
  )
}
