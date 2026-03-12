import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProfile, getProfile } from '@/lib/storage'
import type { UserProfile, BodyShape, StylePreference } from '@/types'
import { BODY_SHAPES } from '@/lib/constants'
import { BrandHeader } from '@/components/BrandHeader'
import '@/styles/theme.css'

function BodyShapeVisual({ shape }: { shape: BodyShape }) {
  const stroke = 'rgba(84,49,26,0.55)'
  const fill = 'rgba(3,94,123,0.10)'

  const common = {
    width: 44,
    height: 44,
    viewBox: '0 0 44 44',
    role: 'img' as const,
    'aria-hidden': true as const,
    style: { flexShrink: 0, borderRadius: 8, background: 'rgba(245,231,222,0.55)', border: '1px solid rgba(84,49,26,0.12)' },
  }

  // Minimal, non-anatomical silhouettes: abstract torso lines only.
  // (Avoids overly literal body depiction while still giving a helpful visual cue.)
  const paths: Record<BodyShape, string> = {
    hourglass: 'M22 8 C16 8, 16 14, 18 18 C19 20, 19 24, 18 26 C16 30, 16 36, 22 36 C28 36, 28 30, 26 26 C25 24, 25 20, 26 18 C28 14, 28 8, 22 8 Z',
    pear: 'M22 9 C17 9, 17 16, 19 19 C20 21, 20 24, 19 26 C17 30, 16 36, 22 36 C28 36, 27 31, 25 26 C24 24, 24 21, 25 19 C27 16, 27 9, 22 9 Z',
    apple: 'M22 9 C16 9, 15 18, 17 22 C18 24, 18 26, 17 28 C15 32, 16 36, 22 36 C28 36, 29 32, 27 28 C26 26, 26 24, 27 22 C29 18, 28 9, 22 9 Z',
    rectangle: 'M18 9 H26 C27.5 9, 29 10.5, 29 12 V32 C29 33.5, 27.5 35, 26 35 H18 C16.5 35, 15 33.5, 15 32 V12 C15 10.5, 16.5 9, 18 9 Z',
    inverted_triangle: 'M22 9 C14 9, 14 16, 16 20 C18 24, 18 28, 16.5 31 C15 34, 17 36, 22 36 C27 36, 29 34, 27.5 31 C26 28, 26 24, 28 20 C30 16, 30 9, 22 9 Z',
    prefer_not_to_say: 'M14 14 H30 V30 H14 Z',
  }

  return (
    <svg {...common}>
      <path d={paths[shape]} fill={fill} stroke={stroke} strokeWidth="1.4" />
      <path d="M22 12 V34" stroke="rgba(132,79,57,0.35)" strokeWidth="1" />
    </svg>
  )
}

const defaultProfile: UserProfile = {
  bodyShape: null,
  stylePreference: 'casual',
  locationGranted: false,
  onboardingComplete: false,
}

export function Onboarding() {
  const existing = getProfile()
  const [step, setStep] = useState(1)
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(existing?.bodyShape ?? null)
  const [stylePreference, setStylePreference] = useState<StylePreference>(existing?.stylePreference ?? 'casual')
  const [locationGranted, setLocationGranted] = useState(existing?.locationGranted ?? false)
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()

  const requestLocation = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      setLocationGranted(false)
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationGranted(true)
        setLocating(false)
      },
      () => {
        setLocationGranted(false)
        setLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const finish = () => {
    const profile: UserProfile = {
      ...defaultProfile,
      bodyShape,
      stylePreference,
      locationGranted,
      onboardingComplete: true,
    }
    if (locationGranted && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          profile.lat = pos.coords.latitude
          profile.lon = pos.coords.longitude
          saveProfile(profile)
          navigate('/', { replace: true })
        },
        () => {
          saveProfile(profile)
          navigate('/', { replace: true })
        }
      )
    } else {
      saveProfile(profile)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="page">
      <BrandHeader eyebrow="Welcome" title="" tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      {step === 1 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
            Body shape (optional)
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#3a2010', marginBottom: '1.25rem' }}>
            This helps us suggest silhouettes that flatter. You can change or hide this anytime in settings.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {BODY_SHAPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setBodyShape(s.value)}
                className="card"
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderColor: bodyShape === s.value ? 'var(--brown-dark)' : undefined,
                  borderWidth: bodyShape === s.value ? 2 : 1,
                }}
              >
                <BodyShapeVisual shape={s.value} />
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-serif)', color: 'var(--brown-dark)' }}>{s.label}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--brown-mid)', marginTop: '0.25rem' }}>{s.short}</div>
                </div>
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-block" style={{ marginTop: '2rem' }} onClick={() => setStep(2)}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
            Style preference
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#3a2010', marginBottom: '1.25rem' }}>
            We&apos;ll default to this when suggesting outfits.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['casual', 'formal', 'mixed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStylePreference(s)}
                className="btn btn-ghost"
                style={{
                  background: stylePreference === s ? 'var(--brown-dark)' : undefined,
                  color: stylePreference === s ? 'var(--cream)' : undefined,
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-block" style={{ marginTop: '2rem' }} onClick={() => setStep(3)}>
            Continue
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
            Weather for outfit suggestions
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#3a2010', marginBottom: '1.25rem' }}>
            Allow location so we can show today&apos;s weather and suggest suitable outfits.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={requestLocation}
            disabled={locating}
          >
            {locating ? 'Getting location…' : locationGranted ? '✓ Location allowed' : 'Allow location'}
          </button>
          {!locationGranted && !locating && (
            <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: '0.5rem' }} onClick={() => setStep(4)}>
              Skip for now
            </button>
          )}
          {locationGranted && (
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={() => setStep(4)}>
              Continue
            </button>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
            You&apos;re all set
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#3a2010', marginBottom: '1.5rem' }}>
            Add items to your wardrobe, then we&apos;ll suggest three outfits every day based on the weather and your style.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={finish}>
            Go to Pettagama
          </button>
        </>
      )}
    </div>
  )
}
