interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critico' | 'alto' | 'medio' | 'baixo' | 'default';
  className?: string;
}

const variantClasses: Record<string, string> = {
  critico: 'bg-red-100 text-red-800 border border-red-300',
  alto: 'bg-orange-100 text-orange-800 border border-orange-300',
  medio: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  baixo: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  default: 'bg-gray-100 text-gray-700 border border-gray-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
