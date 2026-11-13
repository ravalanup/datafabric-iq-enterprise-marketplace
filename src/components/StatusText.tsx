import { AlertTriangle, CheckCircle2, Clock, Lock, ShieldCheck, XCircle } from 'lucide-react';
import {
  AccessOutcome,
  CertificationStatus,
  FreshnessStatus,
  SuitabilityVerdict,
} from '../types/marketplace.ts';

export function CertificationLabel({ status }: { status: CertificationStatus }) {
  if (status === 'Certified') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D] whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        Certified
      </span>
    );
  }
  if (status === 'In Review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309] whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        In Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      Draft
    </span>
  );
}

export function FreshnessLabel({ status, text }: { status: FreshnessStatus; text: string }) {
  const color =
    status === 'Within SLA'
      ? 'text-[#15803D]'
      : status === 'Approaching SLA'
        ? 'text-[#B45309]'
        : 'text-slate-600';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums whitespace-nowrap ${color}`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      {text}
    </span>
  );
}

export function SuitabilityStatusLabel({ status }: { status: SuitabilityVerdict }) {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        Approved
      </span>
    );
  }
  if (status === 'Conditional') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005EB8] whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Conditional
      </span>
    );
  }
  if (status === 'Requires Review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        Requires Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] whitespace-nowrap">
      <XCircle className="w-3.5 h-3.5 shrink-0" />
      Not Approved
    </span>
  );
}

export function AccessOutcomeLabel({ outcome }: { outcome: AccessOutcome }) {
  if (outcome === 'Automatically approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        Automatically approved
      </span>
    );
  }
  if (outcome === 'Pending governance review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        Pending governance review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] whitespace-nowrap">
      <Lock className="w-3.5 h-3.5 shrink-0" />
      Not eligible
    </span>
  );
}
