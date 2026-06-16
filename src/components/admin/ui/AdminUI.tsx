'use client';

import { ReactNode, useEffect, forwardRef } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

/* ─── Loading ─────────────────────────────────────────────────────────────── */

export function AdminLoading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-600/30 border-t-amber-500" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function AdminProgressRing({
  progress,
  size = 40,
  strokeWidth = 3,
  showLabel = true,
  className = '',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const labelSize = size <= 24 ? 'text-[7px]' : size <= 36 ? 'text-[9px]' : 'text-[10px]';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700/80"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-400 transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      {showLabel && (
        <span className={`absolute font-semibold text-emerald-400 ${labelSize}`}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}

/* ─── Page shell ─────────────────────────────────────────────────────────── */

export function AdminPage({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full ${className}`}>{children}</div>;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-100 tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ─── Alerts ─────────────────────────────────────────────────────────────── */

export function AdminAlert({
  type,
  message,
  onDismiss,
}: {
  type: 'error' | 'success';
  message: string;
  onDismiss?: () => void;
}) {
  const styles =
    type === 'error'
      ? 'bg-red-950/50 border-red-800/60 text-red-200'
      : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200';

  return (
    <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${styles}`}>
      {type === 'error' ? (
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */

export function AdminCard({
  children,
  className = '',
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`bg-gray-900/80 border border-gray-800 rounded-xl shadow-sm overflow-hidden ${
        padding ? 'p-4 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────── */

export function AdminTableWrapper({ children }: { children: ReactNode }) {
  return (
    <AdminCard padding={false}>
      <div className="overflow-x-auto admin-scrollbar">{children}</div>
    </AdminCard>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return <table className="w-full min-w-[640px]">{children}</table>;
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-800/80 border-b border-gray-700/80">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-800">{children}</tbody>;
}

export function AdminTr({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return (
    <tr className={`hover:bg-gray-800/40 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className = '',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td className={`px-4 sm:px-6 py-4 text-sm text-stone-200 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────── */

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
  paid: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
  processing: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
  shipped: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
  delivered: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
  cancelled: 'bg-red-950/60 text-red-300 border-red-800/50',
  failed: 'bg-red-950/60 text-red-300 border-red-800/50',
  featured: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
  regular: 'bg-gray-800 text-gray-400 border-gray-700',
  published: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
  draft: 'bg-gray-800 text-gray-400 border-gray-700',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const key = status.toLowerCase();
  const style = statusStyles[key] || 'bg-gray-800 text-gray-400 border-gray-700';
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${style}`}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-900/20 disabled:opacity-50',
  secondary:
    'bg-gray-800 hover:bg-gray-700 text-stone-200 border border-gray-700 disabled:opacity-50',
  danger:
    'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50 disabled:opacity-50',
  ghost: 'hover:bg-gray-800 text-gray-400 hover:text-stone-200 disabled:opacity-50',
};

export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-gray-950 ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function AdminIconButton({
  children,
  label,
  variant = 'ghost',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'ghost' | 'danger' | 'primary';
}) {
  const variantClass =
    variant === 'danger'
      ? 'text-red-400 hover:bg-red-950/50 hover:text-red-300'
      : variant === 'primary'
        ? 'text-amber-400 hover:bg-amber-950/50 hover:text-amber-300'
        : 'text-gray-400 hover:bg-gray-800 hover:text-stone-200';

  return (
    <button
      title={label}
      aria-label={label}
      className={`p-2 rounded-lg transition-colors ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── Form fields ────────────────────────────────────────────────────────── */

export function AdminLabel({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1.5">
      {children}
      {required && <span className="text-amber-500 ml-0.5">*</span>}
    </label>
  );
}

const fieldClass =
  'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-stone-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600/50 disabled:opacity-50 transition-colors';

export const AdminInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function AdminInput({ className = '', ...props }, ref) {
    return <input ref={ref} className={`${fieldClass} ${className}`} {...props} />;
  }
);

export function AdminSelect({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}

export function AdminTextarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} resize-y ${className}`} {...props} />;
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */

export function AdminModal({
  title,
  children,
  onClose,
  size = 'md',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sizeClass = { md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="admin-modal-title"
        className={`relative bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full ${sizeClass} max-h-[calc(100vh-2rem)] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 id="admin-modal-title" className="text-lg font-semibold text-stone-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-stone-200 hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto admin-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AdminModalBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 space-y-4 ${className}`}>{children}</div>;
}

export function AdminModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">{children}</div>
  );
}

/* ─── Slide-over panel ───────────────────────────────────────────────────── */

export function AdminSlideOver({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  busy = false,
  size = 'xl',
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  busy?: boolean;
  size?: 'lg' | 'xl' | '2xl';
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  const sizeClass = { lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-5xl' }[size];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in"
        onClick={() => !busy && onClose()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="admin-slideover-title"
        className={`absolute inset-y-0 right-0 w-full ${sizeClass} bg-gray-950 border-l border-gray-800/90 shadow-2xl flex flex-col animate-slide-in-right`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-800/90 flex-shrink-0">
          <div className="min-w-0">
            <h2 id="admin-slideover-title" className="text-lg font-semibold text-stone-100 tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-2 rounded-lg text-gray-400 hover:text-stone-200 hover:bg-gray-800 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto admin-scrollbar">{children}</div>
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800/90 bg-gray-950/95 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-100">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <AdminCard className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-semibold text-stone-100 truncate">{value}</p>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </div>
      <div className="flex-shrink-0 p-3 rounded-xl bg-amber-950/40 border border-amber-800/30">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
      </div>
    </AdminCard>
  );
}
