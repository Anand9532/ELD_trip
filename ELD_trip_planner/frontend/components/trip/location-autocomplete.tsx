'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlaceSuggestions } from '@/hooks/use-place-suggestions';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'City, State',
  icon,
}: LocationAutocompleteProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, loading } = usePlaceSuggestions(value, open);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const showList = open && value.trim().length >= 2;

  const selectSuggestion = (displayName: string) => {
    onChange(displayName);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex].display_name);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors z-10">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          className={cn(
            'flex h-14 w-full rounded-xl bg-bg-secondary/80 border border-white/10 px-4 text-text text-base',
            'placeholder:text-text-secondary/50 transition-all duration-200',
            'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20',
            'hover:border-white/20',
            icon && 'pl-12',
            loading && 'pr-12'
          )}
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-accent animate-spin" />
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-xl glass-strong border border-white/10 shadow-2xl scrollbar-thin"
        >
          {suggestions.length === 0 && !loading && (
            <li className="px-4 py-3 text-sm text-text-secondary">
              No locations found. Try &quot;New York, NY&quot; or a city name.
            </li>
          )}
          {suggestions.map((place, i) => (
            <li key={`${place.lat}-${place.lng}-${i}`} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(place.display_name)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors',
                  i === activeIndex
                    ? 'bg-accent/15 text-text'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text'
                )}
              >
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <span className="line-clamp-2">{place.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
