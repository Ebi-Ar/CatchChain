import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CameraOff, QrCode } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { TAG_RE, normalizeTag } from '@/lib/tags'

const DEMO_TAG = 'CC-25-0412-SHD'

/** Camera QR scanner (html5-qrcode, loaded on demand). Falls back to opening the demo tag. */
export function ScanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [state, setState] = useState<'starting' | 'scanning' | 'error'>('starting')
  const scanner = useRef<{ stop: () => Promise<void>; isScanning: boolean } | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setState('starting')

    const handle = (text: string) => {
      try {
        const u = new URL(text)
        if (u.pathname.startsWith('/trace/')) return navigate(u.pathname + u.search)
      } catch {
        /* not a URL */
      }
      const t = normalizeTag(text)
      if (TAG_RE.test(t)) navigate(`/trace/${t}`)
    }

    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const s = new Html5Qrcode('cc-qr-reader', { verbose: false })
        scanner.current = s as unknown as typeof scanner.current
        await s.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (text) => {
            s.stop().finally(() => {
              onClose()
              handle(text)
            })
          },
          () => {},
        )
        if (!cancelled) setState('scanning')
        else s.stop().catch(() => {})
      } catch {
        if (!cancelled) setState('error')
      }
    })()

    return () => {
      cancelled = true
      const s = scanner.current
      if (s?.isScanning) s.stop().catch(() => {})
      scanner.current = null
    }
  }, [open, navigate, onClose])

  return (
    <Modal open={open} onClose={onClose} width={420}>
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-teal-50 text-teal-600">
            <QrCode className="size-4.5" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-navy-900">Scan a CatchChain tag</h2>
            <p className="text-[12.5px] text-ink-3">Point your camera at the QR code on the crate.</p>
          </div>
        </div>
        <div className="relative mt-4 aspect-square overflow-hidden rounded-xl bg-navy-950">
          <div id="cc-qr-reader" className="h-full w-full [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover" />
          {state !== 'scanning' && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-white/80">
              {state === 'starting' ? (
                <div className="flex flex-col items-center gap-2 text-[13px]">
                  <Camera className="size-7 animate-pulse" /> Starting camera…
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[13px]">
                  <CameraOff className="size-7" />
                  Camera not available here. On a phone, you can also scan with the regular camera app.
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => {
            onClose()
            navigate(`/trace/${DEMO_TAG}`)
          }}
        >
          Open demo tag {DEMO_TAG}
        </Button>
      </div>
    </Modal>
  )
}
