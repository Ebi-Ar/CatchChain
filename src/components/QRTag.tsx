import { forwardRef, useImperativeHandle, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { speciesById, portById } from '@/lib/data'
import { fmtNum } from '@/lib/utils'
import type { Catch } from '@/lib/types'

export interface QRTagHandle {
  download: () => void
}

/** QR code for a catch, plus a printable PNG tag (QR + tag ID + details). */
export const QRTag = forwardRef<QRTagHandle, { c: Catch; url: string; size?: number }>(({ c, url, size = 200 }, ref) => {
  const hiRes = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    download() {
      const qr = hiRes.current
      if (!qr) return
      const W = 720
      const H = 980
      const cv = document.createElement('canvas')
      cv.width = W
      cv.height = H
      const x = cv.getContext('2d')!
      x.fillStyle = '#ffffff'
      x.fillRect(0, 0, W, H)
      // header band
      x.fillStyle = '#0B2545'
      x.fillRect(0, 0, W, 120)
      x.fillStyle = '#13A89E'
      x.beginPath()
      x.roundRect(48, 36, 48, 48, 12)
      x.fill()
      x.strokeStyle = '#fff'
      x.lineWidth = 4
      x.lineCap = 'round'
      x.beginPath()
      x.moveTo(58, 56)
      x.bezierCurveTo(64, 49, 70, 49, 76, 56)
      x.bezierCurveTo(82, 63, 88, 63, 90, 58)
      x.stroke()
      x.font = '700 34px Inter, system-ui, sans-serif'
      x.fillStyle = '#ffffff'
      x.fillText('CatchChain', 112, 72)
      x.font = '500 20px Inter, system-ui, sans-serif'
      x.fillStyle = 'rgba(255,255,255,0.6)'
      x.textAlign = 'right'
      x.fillText('Verified seafood tag', W - 48, 70)
      x.textAlign = 'left'
      // QR
      x.drawImage(qr, 110, 160, 500, 500)
      // tag id
      x.textAlign = 'center'
      x.fillStyle = '#0B2545'
      x.font = '800 54px Inter, system-ui, sans-serif'
      x.fillText(c.tag, W / 2, 745)
      x.font = '500 26px Inter, system-ui, sans-serif'
      x.fillStyle = '#3E5470'
      x.fillText(`${speciesById[c.species]?.name} · ${fmtNum(c.weight)} lb · ${c.area}`, W / 2, 800)
      x.fillText(`${c.vessel} · ${portById[c.port]?.name}`, W / 2, 840)
      x.font = '500 20px Inter, system-ui, sans-serif'
      x.fillStyle = '#9AAABB'
      x.fillText('Scan to trace this catch · sample data', W / 2, 920)
      const a = document.createElement('a')
      a.download = `${c.tag}.png`
      a.href = cv.toDataURL('image/png')
      a.click()
    },
  }))

  return (
    <>
      <QRCodeCanvas value={url} size={size} level="M" marginSize={0} fgColor="#0B2545" bgColor="#ffffff" />
      <div className="hidden">
        <QRCodeCanvas ref={hiRes} value={url} size={1000} level="M" marginSize={2} fgColor="#0B2545" bgColor="#ffffff" />
      </div>
    </>
  )
})
QRTag.displayName = 'QRTag'
