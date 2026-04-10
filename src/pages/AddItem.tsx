import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWardrobe, saveWardrobe } from '@/lib/storage'
import { readFileAsDataUrl, shouldBlockWardrobeImageUpload, suggestCategoryForImage } from '@/lib/ai'
import { UnsupportedWardrobeImageModal } from '@/components/UnsupportedWardrobeImageModal'
import { processWardrobeUpload } from '@/lib/wardrobeCatalogImage'
import { CATEGORY_LABELS, ALL_CATEGORIES, COLOUR_GROUPS, SEASONS, IMAGE_FILE_ACCEPT } from '@/lib/constants'
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
  const [dominantColour, setDominantColour] = useState<string | null>(null)
  /** Set as soon as the catalog image is written to localStorage; details edits update the same row. */
  const [draftItemId, setDraftItemId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<WardrobeCategory>(ALL_CATEGORIES[0])
  const [colourGroup, setColourGroup] = useState<ColourGroup>('neutral')
  const [season, setSeason] = useState<SeasonSuitability>('all_season')
  const [saving, setSaving] = useState(false)
  const [suggestingCategory, setSuggestingCategory] = useState(false)
  const [processingPhoto, setProcessingPhoto] = useState(false)
  const [unsupportedModalOpen, setUnsupportedModalOpen] = useState(false)
  const pendingFileRef = useRef<File | null>(null)

  const applyWardrobeFile = useCallback(async (file: File) => {
    const { catalogUrl, dominantColour: dom } = await processWardrobeUpload(file)
    const id = generateId()
    const wardrobe = getWardrobe()
    const item: WardrobeItem = {
      id,
      name: 'Untitled',
      imageUrl: catalogUrl,
      ...(dom ? { dominantColour: dom } : {}),
      category: ALL_CATEGORIES[0],
      colourGroup: 'neutral',
      season: 'all_season',
      occasionTags: [],
      createdAt: new Date().toISOString(),
    }
    saveWardrobe([...wardrobe, item])
    setDraftItemId(id)
    setPreviewUrl(catalogUrl)
    setDominantColour(dom ?? null)
    setName('')
    setCategory(ALL_CATEGORIES[0])
    setColourGroup('neutral')
    setSeason('all_season')
    setStep('details')
  }, [])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const input = e.target
    pendingFileRef.current = null
    setProcessingPhoto(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (await shouldBlockWardrobeImageUpload(dataUrl)) {
        pendingFileRef.current = file
        setUnsupportedModalOpen(true)
        return
      }
      await applyWardrobeFile(file)
    } finally {
      setProcessingPhoto(false)
      input.value = ''
    }
  }

  const handleProceedWithBlockedImage = async () => {
    const file = pendingFileRef.current
    pendingFileRef.current = null
    setUnsupportedModalOpen(false)
    if (!file) return
    setProcessingPhoto(true)
    try {
      await applyWardrobeFile(file)
    } finally {
      setProcessingPhoto(false)
    }
  }

  useEffect(() => {
    if (!previewUrl || step !== 'details' || !draftItemId) return
    setSuggestingCategory(true)
    suggestCategoryForImage(previewUrl)
      .then((suggested) => {
        if (!suggested) return
        setCategory(suggested)
        const w = getWardrobe()
        const next = w.map((i) => (i.id === draftItemId ? { ...i, category: suggested } : i))
        saveWardrobe(next)
      })
      .finally(() => setSuggestingCategory(false))
  }, [previewUrl, step, draftItemId])

  const handleSuggestCategory = () => {
    if (!previewUrl || !draftItemId) return
    setSuggestingCategory(true)
    suggestCategoryForImage(previewUrl)
      .then((suggested) => {
        if (!suggested) return
        setCategory(suggested)
        const w = getWardrobe()
        saveWardrobe(w.map((i) => (i.id === draftItemId ? { ...i, category: suggested } : i)))
      })
      .finally(() => setSuggestingCategory(false))
  }

  const syncDraftToWardrobe = useCallback(() => {
    if (!draftItemId || !previewUrl) return
    const wardrobe = getWardrobe()
    const base = wardrobe.find((i) => i.id === draftItemId)
    if (!base) return
    const updated: WardrobeItem = {
      ...base,
      name: name.trim() || 'Untitled',
      imageUrl: previewUrl,
      ...(dominantColour ? { dominantColour } : {}),
      category,
      colourGroup,
      season,
    }
    saveWardrobe(wardrobe.map((i) => (i.id === draftItemId ? updated : i)))
  }, [draftItemId, previewUrl, name, dominantColour, category, colourGroup, season])

  const handleSave = () => {
    if (!previewUrl || !draftItemId) return
    setSaving(true)
    try {
      syncDraftToWardrobe()
      setDraftItemId(null)
      navigate('/wardrobe')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (step === 'details') {
      syncDraftToWardrobe()
      setPreviewUrl(null)
      setDraftItemId(null)
      setDominantColour(null)
      setStep('upload')
    } else {
      navigate('/wardrobe')
    }
  }

  return (
    <div className="page page--wardrobe add-item-page">
      <BrandHeader
        eyebrow="Add to wardrobe"
        title={step === 'upload' ? 'New item' : 'Details'}
        tagline="Let your wardrobe think for you."
      />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {step === 'upload' && (
        <>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Photograph or upload a clear shot of the item. As soon as it&apos;s processed, it&apos;s saved in your
            wardrobe—you can refine details below or later in Edit. We remove the background onto a baby-blue catalog
            surface and, when an API key is set, optionally polish with AI.
          </p>
          <p
            style={{
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#d4b896',
              fontStyle: 'italic',
            }}
          >
            Plain backgrounds and good lighting help; processing may take a few seconds on first use while models load.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_FILE_ACCEPT}
            onChange={handleFile}
            className="sr-only"
            aria-label="Choose photo"
            disabled={processingPhoto}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => fileInput.current?.click()}
            disabled={processingPhoto}
          >
            {processingPhoto ? 'Preparing catalog photo…' : 'Choose photo'}
          </button>
        </>
      )}

      {step === 'details' && previewUrl && (
        <>
          <p style={{ fontSize: '0.82rem', color: 'var(--brown-mid)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            This piece is already in your wardrobe. Update details here, then use Done—or go Back to add another photo.
            To remove it, open the item from Wardrobe and choose Remove.
          </p>
          <div className="wardrobe-catalog-preview-wrap">
            <img src={previewUrl} alt="Preview" className="wardrobe-catalog-preview-img" />
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
              {saving ? 'Saving…' : 'Done'}
            </button>
          </div>
        </>
      )}

      {step === 'upload' && (
        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: '1rem' }} onClick={() => navigate('/wardrobe')}>
          Cancel
        </button>
      )}

      <UnsupportedWardrobeImageModal
        open={unsupportedModalOpen}
        onClose={() => {
          pendingFileRef.current = null
          setUnsupportedModalOpen(false)
        }}
        onProceedAnyway={handleProceedWithBlockedImage}
      />
    </div>
  )
}
