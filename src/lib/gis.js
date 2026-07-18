let gisScriptPromise = null;

export function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("failed to load Google Sign-In"));
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
}
