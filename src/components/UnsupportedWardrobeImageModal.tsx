import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { MouseEvent } from 'react'
import './UnsupportedWardrobeImageModal.css'

export interface UnsupportedWardrobeImageModalProps {
  open: boolean
  onClose: () => void
}

export function UnsupportedWardrobeImageModal({ open, onClose }: UnsupportedWardrobeImageModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const stop = (e: MouseEvent) => e.stopPropagation()

  const content = (
    <div
      className="unsupported-wardrobe-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsupported-wardrobe-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="unsupported-wardrobe-phone-wrap"
        onMouseDown={stop}
      >
        <div className="unsupported-wardrobe-phone-body" aria-hidden />
        <div className="unsupported-wardrobe-side-l" aria-hidden />
        <div className="unsupported-wardrobe-side-r" aria-hidden />

        <div className="unsupported-wardrobe-brand">RETRO</div>
        <div className="unsupported-wardrobe-speakers" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <div className="unsupported-wardrobe-bezel">
          <div className="unsupported-wardrobe-screen">
            <div className="unsupported-wardrobe-screen-inner">
              <div className="unsupported-wardrobe-status">
                <span>11:11</span>
                <div className="unsupported-wardrobe-status-icons">
                  <div className="unsupported-wardrobe-bars" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <svg className="unsupported-wardrobe-wifi" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M6 10 L6 10 M2 5.5 Q4 3.5 6 3.5 Q8 3.5 10 5.5 M3.5 7 Q5 5.5 6 5.5 Q7 5.5 8.5 7"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  <div className="unsupported-wardrobe-batt" aria-hidden>
                    <div className="unsupported-wardrobe-batt-shell" />
                    <div className="unsupported-wardrobe-batt-nub" />
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="unsupported-wardrobe-msg-wrap"
              >
                <p className="unsupported-wardrobe-msg" id="unsupported-wardrobe-title">
                  Unsupported image,
                  <br />
                  try again.
                </p>
              </motion.div>

              <div className="unsupported-wardrobe-softkeys">
                <span>Options</span>
                <button type="button" onClick={onClose}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="unsupported-wardrobe-dpad" aria-hidden>
          <div className="unsupported-wardrobe-dpad-up" />
          <div className="unsupported-wardrobe-dpad-down" />
          <div className="unsupported-wardrobe-dpad-left" />
          <div className="unsupported-wardrobe-dpad-right" />
          <div className="unsupported-wardrobe-dpad-center" />
        </div>

        <div className="unsupported-wardrobe-bottom-btns">
          <motion.button
            type="button"
            aria-label="Dismiss"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          />
          <motion.button
            type="button"
            aria-label="Dismiss"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          />
        </div>
      </motion.div>
    </div>
  )

  return content
}
