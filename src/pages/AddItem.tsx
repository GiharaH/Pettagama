import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWardrobe, saveWardrobe } from '@/lib/storage'
import { suggestCategoryForImage } from '@/lib/ai'
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
  const [suggestingCategory, setSuggestingCategory] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStep('details')
  }

  useEffect(() => {
    if (!previewUrl || step !== 'details') return
    setSuggestingCategory(true)
    suggestCategoryForImage(previewUrl)
      .then((suggested) => {
        if (suggested) setCategory(suggested)
      })
      .finally(() => setSuggestingCategory(false))
  }, [previewUrl, step])

  const handleSuggestCategory = () => {
    if (!previewUrl) return
    setSuggestingCategory(true)
    suggestCategoryForImage(previewUrl)
      .then((suggested) => {
        if (suggested) setCategory(suggested)
      })
      .finally(() => setSuggestingCategory(false))
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
    <div className="page page--wardrobe">
      <BrandHeader
        eyebrow="Add to wardrobe"
        title={step === 'upload' ? 'New item' : 'Details'}
        tagline="Let your wardrobe think for you."
      />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {step === 'upload' && (
        <>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Photograph or upload a clear image of the item. We&apos;ll use it in your catalogue and outfit suggestions.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--brown-mid)', fontStyle: 'italic' }}>
            For best results, use a photo on a <strong>white background</strong> with the item <strong>hanging on a hanger</strong>.
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
          <div className="clothing-img-wrap" style={{ marginBottom: '1.25rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: 280, aspectRatio: '3/4' }}>
            <img src={previewUrl} alt="Preview" />
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Category</label>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem' }}
              onClick={handleSuggestCategory}
              disabled={suggestingCategory}
            >
              {suggestingCategory ? 'Suggesting…' : 'Suggest with AI'}
            </button>
          </div>
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
