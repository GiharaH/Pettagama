import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWardrobe, saveWardrobe } from '@/lib/storage'
import { CATEGORY_LABELS, ALL_CATEGORIES, COLOUR_GROUPS, SEASONS } from '@/lib/constants'
import type { WardrobeItem, WardrobeCategory, ColourGroup, SeasonSuitability } from '@/types'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function AddItem() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'details'>('upload')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory>(ALL_CATEGORIES[0])
  const [colourGroup, setColourGroup] = useState<ColourGroup>('neutral')
  const [season, setSeason] = useState<SeasonSuitability>('all_season')
  const [saving, setSaving] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStep('details')
  }

  const handleSave = () => {
    if (!previewUrl) return
    setSaving(true)
    const wardrobe = getWardrobe()
    const item: WardrobeItem = {
      id: generateId(),
      name: name.trim() || 'Untitled',
      imageUrl: previewUrl,
      category,
      colourGroup,
      season,
      occasionTags: [],
      createdAt: new Date().toISOString(),
    }
    saveWardrobe([...wardrobe, item])
    setSaving(false)
    navigate('/wardrobe')
  }

  const handleBack = () => {
    if (step === 'details') {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setStep('upload')
    } else {
      navigate('/wardrobe')
    }
  }

  return (
    <div className="page">
      <BrandHeader
        eyebrow="Add to wardrobe"
        title={step === 'upload' ? 'New item' : 'Details'}
        tagline="Let your wardrobe think for you."
      />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {step === 'upload' && (
        <>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#3a2010' }}>
            Photograph or upload a clear image of the item. We&apos;ll use it in your catalogue and outfit suggestions.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="sr-only"
            aria-label="Choose photo"
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => fileInput.current?.click()}
          >
            Choose photo
          </button>
        </>
      )}

      {step === 'details' && previewUrl && (
        <>
          <div style={{ marginBottom: '1.25rem', borderRadius: 4, overflow: 'hidden', background: 'var(--cream)', border: '1px solid rgba(84,49,26,0.12)', aspectRatio: '1', maxWidth: 280, margin: '0 auto' }}>
            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={handleBack}>
              Back
            </button>
            <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save to wardrobe'}
            </button>
          </div>
        </>
      )}

      {step === 'upload' && (
        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: '1rem' }} onClick={() => navigate('/wardrobe')}>
          Cancel
        </button>
      )}
    </div>
  )
}
