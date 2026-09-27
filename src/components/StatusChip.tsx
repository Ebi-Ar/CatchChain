import { BadgeCheck, Clock } from 'lucide-react'
import { Badge } from './ui/Badge'
import type { CatchStatus } from '@/lib/types'

export function StatusChip({ status }: { status: CatchStatus }) {
  return status === 'verified' ? (
    <Badge tone="verified">
      <BadgeCheck /> Verified
    </Badge>
  ) : (
    <Badge tone="pending">
      <Clock /> Pending
    </Badge>
  )
}
