export function SpotterLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const text = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-5 w-5 shrink-0">
        <span
          className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-full ${dot} bg-accent-coral`}
        />
        <span
          className={`absolute bottom-0 left-0 rounded-full ${dot} bg-accent`}
        />
        <span
          className={`absolute bottom-0 right-0 rounded-full ${dot} bg-white`}
        />
      </div>
      <span className={`${text} font-semibold tracking-tight text-white lowercase`}>
        spotter
      </span>
    </div>
  );
}
