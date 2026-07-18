import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/startathon";
import { saveAuth } from "../../lib/auth";
import { loadGis } from "../../lib/gis";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Google Identity Services sign-in, styled to match the site instead
 * of Google's fixed button chrome: we render our own button for looks
 * and stack Google's real (official, required-by-their-ToS) button
 * invisibly on top so the click still hits their real popup flow.
 * Sends the resulting ID token to /auth/google/credential.
 */
const GoogleSignInPanel = ({ onError, disabled = false }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || disabled) return;
    let cancelled = false;

    const handleCredential = async (response) => {
      try {
        const data = await api.googleCredential(response.credential);
        saveAuth(data);
        navigate("/apply", { replace: true });
      } catch (err) {
        onError?.(err.message);
      }
    };

    const render = () => {
      if (cancelled || !googleBtnRef.current || !wrapperRef.current || !window.google) return;
      googleBtnRef.current.innerHTML = "";
      const width = Math.round(wrapperRef.current.getBoundingClientRect().width) || 320;
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        width,
      });
    };

    loadGis().then(() => {
      if (cancelled || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
      });
      render();
      window.google.accounts.id.prompt();
    });

    const onResize = () => render();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [navigate, onError, disabled]);

  if (!CLIENT_ID) return null;

  return (
    <div
      ref={wrapperRef}
      className={`group relative h-12 w-full ${disabled ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`}
    >
      {/* Real Google button: invisible, but the actual click target */}
      <div
        ref={googleBtnRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0"
      />

      {/* Decorative button: matches the site, never receives clicks */}
      <div className="pointer-events-none absolute inset-0 flex w-full items-center justify-center gap-[0.6rem] rounded border-[0.5px] border-white/[0.16] bg-white/[0.04] font-general text-[0.85rem] font-medium text-white transition-[border-color,background] duration-200 group-hover:border-white/35 group-hover:bg-white/[0.07]">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
        </svg>
        Continue with Google
      </div>
    </div>
  );
};

export default GoogleSignInPanel;
