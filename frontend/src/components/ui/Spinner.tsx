export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className={`${dims} animate-spin rounded-full border-4 border-ipax-light border-t-ipax-teal`} />
  );
}
