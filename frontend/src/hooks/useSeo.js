import { useEffect } from 'react';

export function useSeo({ title, description }) {
  useEffect(() => {
    const full = title ? `${title} | EA Fitness Clothing` : 'EA Fitness Clothing';
    document.title = full;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
}
