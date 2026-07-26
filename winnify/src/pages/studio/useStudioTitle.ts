// Per-screen document title for the studio. Installed as a PWA the title is
// the app-switcher label and the browser-tab text, so every studio screen
// showing the marketing string ("Winnify — AI-Powered Learning for Developers")
// made the installed app look like the wrong product. Restores the previous
// title on unmount so non-studio routes are unaffected.
import { useEffect } from 'react';

const SUFFIX = 'WinTeach Studio';

export function useStudioTitle(title?: string | null) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
    return () => { document.title = prev; };
  }, [title]);
}
