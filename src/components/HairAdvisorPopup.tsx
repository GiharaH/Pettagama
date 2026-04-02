import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { HairNecklineKey, Outfit } from '@/types'
import {
  HAIR_ADVISOR_BY_NECKLINE,
  HAIR_ADVISOR_NECKLINE_ORDER,
  type HairStyleCardData,
} from '@/lib/hairAdvisorData'
import { inferNecklineTypeForTop } from '@/lib/necklineInference'
import {
  HAIR_ADVISOR_INFOGRAPHIC_SRC,
  INFOGRAPHIC_IMG,
  PORTRAIT_CELL,
  infographicRowForNeckline,
} from '@/lib/hairAdvisorInfographic'
import {
  LONG_GUIDE,
  SHORT_GUIDE,
  TEXTURE_GUIDE,
  type HairLengthChoice,
  type HairTextureIndex,
  HAIR_TEXTURE_LABELS,
  guideRowForNeckline,
  shortLongStyleName,
  textureRowCol,
} from '@/lib/hairAdvisorGuides'
import './HairAdvisorPopup.css'

type SpriteAsset = { src: string; w: number; h: number; rows: number; cols: number }

/** Uniform grid sprite crop (ResizeObserver + pixel background). */
function SpriteCropPortrait({
  asset,
  row,
  col,
  alt,
  lightBorder,
  className = '',
}: {
  asset: SpriteAsset
  row: number
  col: number
  alt: string
  lightBorder?: boolean
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [frameW, setFrameW] = useState(0)
  const cellW = asset.w / asset.cols
  const cellH = asset.h / asset.rows

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setFrameW(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(el)
    setFrameW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const scale = frameW > 0 ? frameW / cellW : 0
  const bgW = asset.w * scale
  const bgH = asset.h * scale
  const posX = -(col * cellW) * scale
  const posY = -(row * cellH) * scale

  const cls = [
    'hair-advisor-portrait',
    className,
    lightBorder ? 'hair-advisor-portrait--light-border' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={wrapRef}
      className={cls}
      style={{ aspectRatio: `${cellW} / ${cellH}` }}
      role="img"
      aria-label={alt}
    >
      {scale > 0 && (
        <div
          className="hair-advisor-portrait__bg"
          style={{
            backgroundImage: `url(${asset.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${bgW}px ${bgH}px`,
            backgroundPosition: `${posX}px ${posY}px`,
          }}
        />
      )}
    </div>
  )
}

/** Original 7×3 shoulder-length infographic (medium). */
function MediumInfographicPortrait({
  row,
  col,
  alt,
  lightBorder,
}: {
  row: number
  col: number
  alt: string
  lightBorder?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [frameW, setFrameW] = useState(0)
  const { w: imgW, h: imgH } = INFOGRAPHIC_IMG
  const { w: cellW, h: cellH, offX } = PORTRAIT_CELL

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setFrameW(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(el)
    setFrameW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const scale = frameW > 0 ? frameW / cellW : 0
  const bgW = imgW * scale
  const bgH = imgH * scale
  const posX = -(offX + col * cellW) * scale
  const posY = -(row * cellH) * scale

  return (
    <div
      ref={wrapRef}
      className={`hair-advisor-portrait${lightBorder ? ' hair-advisor-portrait--light-border' : ''}`}
      style={{ aspectRatio: `${cellW} / ${cellH}` }}
      role="img"
      aria-label={alt}
    >
      {scale > 0 && (
        <div
          className="hair-advisor-portrait__bg"
          style={{
            backgroundImage: `url(${HAIR_ADVISOR_INFOGRAPHIC_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${bgW}px ${bgH}px`,
            backgroundPosition: `${posX}px ${posY}px`,
          }}
        />
      )}
    </div>
  )
}

function HairCardMedium({
  data,
  isTopPick,
  necklineKey,
  col,
}: {
  data: HairStyleCardData
  isTopPick: boolean
  necklineKey: HairNecklineKey
  col: number
}) {
  const row = infographicRowForNeckline(necklineKey)
  return (
    <div className={`hair-advisor-card${isTopPick ? ' hair-advisor-card--toppick' : ''}`}>
      {isTopPick && <span className="hair-advisor-card__badge">★ TOP PICK</span>}
      <MediumInfographicPortrait row={row} col={col} alt={data.name} lightBorder={isTopPick} />
      <div className="hair-advisor-card__name">{data.name}</div>
      <div className="hair-advisor-card__reason">{data.reason}</div>
    </div>
  )
}

const LENGTH_LABELS: Record<HairLengthChoice, string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
}

export interface HairAdvisorPopupProps {
  open: boolean
  onClose: () => void
  outfit: Outfit
  initialNecklineKey?: HairNecklineKey
}

export function HairAdvisorPopup({ open, onClose, outfit, initialNecklineKey }: HairAdvisorPopupProps) {
  const derivedKey = outfit.top?.necklineType ?? inferNecklineTypeForTop(outfit.top)
  const [selected, setSelected] = useState<HairNecklineKey>(initialNecklineKey ?? derivedKey)
  const [length, setLength] = useState<HairLengthChoice>('medium')
  const [textureIndex, setTextureIndex] = useState<HairTextureIndex>(5)

  useEffect(() => {
    if (!open) return
    setSelected(outfit.top?.necklineType ?? initialNecklineKey ?? inferNecklineTypeForTop(outfit.top))
  }, [open, outfit.top, initialNecklineKey])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const content = HAIR_ADVISOR_BY_NECKLINE[selected]
  const statusTop = outfit.top?.name ?? '—'
  const statusOcc = String(outfit.occasion ?? 'casual')
  const guideRow = guideRowForNeckline(selected)
  const guideAsset = length === 'short' ? SHORT_GUIDE : LONG_GUIDE
  const { row: texRow, col: texCol } = textureRowCol(textureIndex)
  const guideTitle =
    length === 'short' || length === 'long' ? shortLongStyleName(length, guideRow) : null

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const dialog = (
    <div className="hair-advisor-overlay" role="presentation" onMouseDown={handleBackdrop}>
      <div
        className="hair-advisor-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hair-advisor-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="hair-advisor-outer">
          <div className="hair-advisor-window">
            <div className="hair-advisor-titlebar">
              <div className="hair-advisor-titlebar__controls">
                <button type="button" className="hair-advisor-winbtn" aria-label="Close" onClick={onClose} />
                <button type="button" className="hair-advisor-winbtn" aria-label="Minimise" />
                <button type="button" className="hair-advisor-winbtn" aria-label="Maximise" />
              </div>
              <div className="hair-advisor-titlebar__title" id="hair-advisor-title">
                Hair Advisor
              </div>
            </div>

            <div className="hair-advisor-menubar">
              <span>File</span>
              <span className="hair-advisor-menubar__sep">·</span>
              <span>Neckline</span>
              <span className="hair-advisor-menubar__sep">·</span>
              <span>Style</span>
              <span className="hair-advisor-menubar__sep">·</span>
              <span>Help</span>
            </div>

            <div className="hair-advisor-body">
              <aside className="hair-advisor-sidebar" aria-label="Length and neckline">
                <div className="hair-advisor-sidebar__label">Hair length</div>
                <div className="hair-advisor-length-row">
                  {(['short', 'medium', 'long'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      className={length === len ? 'is-active' : ''}
                      onClick={() => setLength(len)}
                    >
                      {LENGTH_LABELS[len]}
                    </button>
                  ))}
                </div>
                <div className="hair-advisor-sidebar__label" style={{ marginTop: '8px' }}>
                  Neckline
                </div>
                <div className="hair-advisor-neckline-list">
                  {HAIR_ADVISOR_NECKLINE_ORDER.map(({ key, sidebarLabel }) => (
                    <button
                      key={key}
                      type="button"
                      className={selected === key ? 'is-active' : ''}
                      onClick={() => setSelected(key)}
                    >
                      {sidebarLabel}
                    </button>
                  ))}
                </div>
              </aside>

              <main className="hair-advisor-main">
                <div className="hair-advisor-texture-section">
                  <div className="hair-advisor-sidebar__label">Hair texture (chart)</div>
                  <p className="hair-advisor-texture-hint">
                    Straight → Coily (1A–4C). Shown as back view next to short/long picks.
                  </p>
                  <div className="hair-advisor-texture-grid" role="listbox" aria-label="Hair texture type">
                    {HAIR_TEXTURE_LABELS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        role="option"
                        aria-selected={textureIndex === i}
                        className={`hair-advisor-texture-pill${textureIndex === i ? ' is-active' : ''}`}
                        onClick={() => setTextureIndex(i as HairTextureIndex)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hair-advisor-detected">Detected neckline: {content.displayLabel}</div>

                {length === 'medium' ? (
                  <div className="hair-advisor-grid">
                    <HairCardMedium data={content.topPick} isTopPick necklineKey={selected} col={0} />
                    <HairCardMedium data={content.also[0]} isTopPick={false} necklineKey={selected} col={1} />
                    <HairCardMedium data={content.also[1]} isTopPick={false} necklineKey={selected} col={2} />
                  </div>
                ) : (
                  <div className="hair-advisor-guide-hero">
                    <div className="hair-advisor-guide-hero__main">
                      <div className="hair-advisor-hero-badge">★ Guide pick</div>
                      <SpriteCropPortrait
                        asset={guideAsset}
                        row={guideRow}
                        col={1}
                        alt={`${guideTitle ?? 'Hairstyle'} for ${content.displayLabel}`}
                        lightBorder={false}
                      />
                      <div className="hair-advisor-hero-title">{guideTitle}</div>
                      <p className="hair-advisor-hero-blurb">{content.topPick.reason}</p>
                      <p className="hair-advisor-hero-meta">
                        {length === 'short' ? 'Short hair & necklines guide' : 'Long hair & necklines guide'} · row{' '}
                        {guideRow + 1} of 8
                      </p>
                    </div>
                    <div className="hair-advisor-guide-hero__texture">
                      <div className="hair-advisor-sidebar__label">Your texture</div>
                      <SpriteCropPortrait
                        asset={TEXTURE_GUIDE}
                        row={texRow}
                        col={texCol}
                        alt={`Hair texture ${HAIR_TEXTURE_LABELS[textureIndex]}`}
                        className="hair-advisor-portrait--texture-thumb"
                      />
                      <div className="hair-advisor-texture-id">{HAIR_TEXTURE_LABELS[textureIndex]}</div>
                    </div>
                  </div>
                )}

                <div className="hair-advisor-avoid">
                  <strong>Avoid:</strong> {content.avoid}
                </div>
              </main>
            </div>

            <footer className="hair-advisor-footer">
              <div className="hair-advisor-status" title={`Top: ${statusTop} · ${statusOcc}`}>
                <span className="hair-advisor-status__line">
                  Top: {statusTop} · {statusOcc}
                </span>
                <span className="hair-advisor-status__line hair-advisor-status__meta">
                  {LENGTH_LABELS[length]} · texture {HAIR_TEXTURE_LABELS[textureIndex]}
                </span>
              </div>
              <div className="hair-advisor-footer__actions">
                <button type="button" className="hair-advisor-retrobtn" onClick={onClose}>
                  Done
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

export function HairAdvisorTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="hair-advisor-trigger" onClick={onClick}>
      Style your hair ↗
    </button>
  )
}
