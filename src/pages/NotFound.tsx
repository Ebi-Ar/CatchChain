import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'

export default function NotFound({ standalone }: { standalone?: boolean }) {
  const body = (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-teal-50 text-teal-600">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-4 text-[22px] font-bold text-navy-900">Off the chart</h1>
      <p className="mt-1 max-w-sm text-[14px] text-ink-3">This page doesn’t exist. Let’s get you back to port.</p>
      <Link to="/app" className="mt-6">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  )
  if (!standalone) return body
  return (
    <div className="min-h-dvh bg-surface">
      <div className="p-5">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      {body}
    </div>
  )
}
