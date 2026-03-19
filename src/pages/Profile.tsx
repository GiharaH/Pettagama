import { useState, useRef } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { getUserDetails, saveUserDetails, getProfile, saveProfile } from '@/lib/storage'
import { BODY_SHAPES } from '@/lib/constants'
import type { UserDetails, Gender, BodyShape } from '@/types'
import '@/styles/theme.css'

export function Profile() {
  const saved = getUserDetails()
  const profile = getProfile()
  const [name, setName] = useState(saved.name)
  const [gender, setGender] = useState<Gender | ''>(saved.gender)
  const [age, setAge] = useState<number | ''>(saved.age)
  const [heightCm, setHeightCm] = useState<number | ''>(saved.heightCm)
  const [weightKg, setWeightKg] = useState<number | ''>(saved.weightKg)
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(profile?.bodyShape ?? null)
  const [profilePictureUrl, setProfilePictureUrl] = useState(saved.profilePictureUrl)
  const [savedMessage, setSavedMessage] = useState(false)
  const [locating, setLocating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requestLocation = () => {
    if (!profile || !navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveProfile({
          ...profile,
          locationGranted: true,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const details: UserDetails = {
      name: name.trim(),
      gender,
      age: age === '' ? '' : Number(age),
      heightCm: heightCm === '' ? '' : Number(heightCm),
      weightKg: weightKg === '' ? '' : Number(weightKg),
      profilePictureUrl,
    }
    saveUserDetails(details)
    if (profile) {
      saveProfile({ ...profile, bodyShape })
    }
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2500)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfilePictureUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="page">
      <BrandHeader eyebrow="Profile" title="Profile" tagline="Let your wardrobe think for you." />
      <div className="divider" style={{ marginLeft: 'auto', marginRight: 'auto' }} />

      <p className="card card-accent-mid" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
        Your basic information helps us customize outfit suggestions for you. All fields are optional.
      </p>

      <form onSubmit={handleSubmit} className="card card-accent-teal" style={{ marginBottom: '1.5rem' }}>
        {/* Profile picture */}
        <label className="field-label">Profile picture</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--cream)',
              border: '2px solid rgba(84,49,26,0.2)',
              flexShrink: 0,
            }}
          >
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-mid)', fontSize: '2rem' }} aria-hidden>👤</div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
              aria-label="Choose profile picture from gallery"
            />
            <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
              Choose from gallery
            </button>
            {profilePictureUrl && (
              <button type="button" className="btn btn-ghost" style={{ marginLeft: '0.5rem' }} onClick={() => setProfilePictureUrl('')}>
                Remove
              </button>
            )}
          </div>
        </div>

        <label className="field-label" htmlFor="profile-name">Name</label>
        <input
          id="profile-name"
          type="text"
          className="field-control"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <label className="field-label" htmlFor="profile-body-shape">Body type</label>
        <select
          id="profile-body-shape"
          className="field-control"
          value={bodyShape ?? ''}
          onChange={(e) => setBodyShape((e.target.value || null) as BodyShape | null)}
          style={{ marginBottom: '1rem' }}
        >
          <option value="">Prefer not to say</option>
          {BODY_SHAPES.filter((s) => s.value !== 'prefer_not_to_say').map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>

        <label className="field-label" htmlFor="profile-gender">Gender</label>
        <select
          id="profile-gender"
          className="field-control"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender | '')}
          style={{ marginBottom: '1rem' }}
        >
          <option value="">Prefer not to say</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non_binary">Non-binary</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>

        <label className="field-label" htmlFor="profile-age">Age</label>
        <input
          id="profile-age"
          type="number"
          min={1}
          max={120}
          className="field-control"
          placeholder="Age"
          value={age === '' ? '' : age}
          onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10) || '')}
          style={{ marginBottom: '1rem' }}
        />

        <label className="field-label" htmlFor="profile-height">Height (cm)</label>
        <input
          id="profile-height"
          type="number"
          min={50}
          max={250}
          className="field-control"
          placeholder="e.g. 165"
          value={heightCm === '' ? '' : heightCm}
          onChange={(e) => setHeightCm(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
          style={{ marginBottom: '1rem' }}
        />

        <label className="field-label" htmlFor="profile-weight">Weight (kg)</label>
        <input
          id="profile-weight"
          type="number"
          min={20}
          max={300}
          step={0.1}
          className="field-control"
          placeholder="e.g. 65"
          value={weightKg === '' ? '' : weightKg}
          onChange={(e) => setWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
          style={{ marginBottom: '1.25rem' }}
        />

        <button type="submit" className="btn btn-primary btn-block">
          {savedMessage ? 'Saved' : 'Save profile'}
        </button>
      </form>

      <div className="card card-accent-teal" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--brown-dark)', marginBottom: '0.5rem' }}>
          Weather location
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--brown-mid)', marginBottom: '0.75rem' }}>
          Allow location to see today&apos;s weather on the home page and get weather-based outfit suggestions.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={requestLocation}
          disabled={locating || profile?.locationGranted}
        >
          {locating ? 'Getting location…' : profile?.locationGranted ? '✓ Location allowed' : 'Allow location'}
        </button>
      </div>
    </div>
  )
}
