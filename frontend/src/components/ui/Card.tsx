interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
}

export function Card({ children, className = '', title, icon }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-ipax-dark mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
