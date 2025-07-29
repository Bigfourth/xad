
export function checkGPTExists() {
  const scripts = document.head.querySelectorAll('script[src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"]');
  if (scripts.length > 0) {
    return true;
  } else {
    const gpt_script = document.createElement("script");
    gpt_script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    gpt_script.async = true;
    document.head.appendChild(gpt_script);
    return false;
  }
}

export const ar = [];
export function randomID() {
  let r = Math.random().toString().substring(2);
  while (ar.includes(r)) {
    r = Math.random().toString().substring(2);
  }
  ar.push(r);
  return "xad-gpt-ad-" + r + "-0";
}

export function checkAdsenseJSExists(client_id) {
  const scripts = document.head.querySelectorAll(`script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client_id}"]`);
  if (scripts.length > 0) {
    return true;
  } else {
    const adsense_script = document.createElement("script");
    adsense_script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client_id}`;
    adsense_script.async = true;
    adsense_script.crossOrigin = "anonymous";
    document.head.appendChild(adsense_script);
    return false;
  }
}
