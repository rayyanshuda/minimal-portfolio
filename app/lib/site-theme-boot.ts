// Inline script for app/layout.tsx (a server component, so this file must not be "use client").
// Sets <html data-site-theme> before first paint so visitors don't see a flash of the wrong theme.
// Keys and the default (record store, "music") must match app/lib/site-theme.ts.
export const SITE_THEME_BOOT_SCRIPT = `try{var q=new URLSearchParams(location.search).get('look');var t=q||localStorage.getItem('rh-site-theme')||localStorage.getItem('rh-dev-look');if(!t||!/^(classic|newspaper|music)$/.test(t))t='music';if(t!=='classic')document.documentElement.setAttribute('data-site-theme',t);}catch(e){document.documentElement.setAttribute('data-site-theme','music');}`;
