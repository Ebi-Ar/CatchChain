import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Sparkles } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Field'
import { useApp } from '@/lib/store'
import { storage } from '@/lib/storage'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** One global modal: "Coming soon: [feature]" with a pilot sign-up. Open it via useApp().openComingSoon(). */
export function ComingSoonModal() {
  const { comingSoon, closeComingSoon } = useApp()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (comingSoon) {
      setEmail('')
      setError('')
      setDone(false)
    }
  }, [comingSoon])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email so we can reach you.')
    storage.addPilotSignup(email.trim(), comingSoon?.feature ?? '')
    setDone(true)
  }

  return (
    <Modal open={!!comingSoon} onClose={closeComingSoon}>
      <div className="p-6 sm:p-7">
        {!done ? (
          <form onSubmit={submit} noValidate>
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-navy-900 text-teal-200">
              <Lock className="size-5" />
            </div>
            <p className="text-[12px] font-semibold tracking-wide text-teal-600 uppercase">In development</p>
            <h2 className="mt-1 text-[20px] font-bold tracking-[-0.02em] text-navy-900">Coming soon: {comingSoon?.feature}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-3">
              {comingSoon?.description ?? 'This module is planned for the pilot phase.'} Join the pilot and we’ll reach out when it opens in your port.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                autoFocus
                placeholder="you@harbour.ca"
                value={email}
                invalid={!!error}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                aria-label="Email"
              />
              <Button type="submit" size="lg" className="h-11 sm:w-auto">
                <Sparkles /> Join the pilot
              </Button>
            </div>
            {error && <p className="mt-2 text-[12.5px] font-medium text-flag">{error}</p>}
            <p className="mt-3 text-[12px] text-ink-4">Demo only: your email is stored in this browser, nowhere else.</p>
          </form>
        ) : (
          <div className="py-4 text-center">
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }} className="mx-auto grid size-14 place-items-center rounded-full bg-verified-50 text-verified">
              <Check className="size-7" strokeWidth={2.6} />
            </motion.div>
            <h2 className="mt-4 text-[20px] font-bold tracking-[-0.02em] text-navy-900">You’re on the list</h2>
            <p className="mx-auto mt-2 max-w-xs text-[14px] text-ink-3">
              Thanks! We’ll be in touch about the <span className="font-semibold text-ink">{comingSoon?.feature}</span> pilot.
            </p>
            <Button className="mt-6" variant="secondary" onClick={closeComingSoon}>
              Back to CatchChain
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
