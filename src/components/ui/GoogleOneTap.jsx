import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadGis } from "../../lib/gis";
import { api } from "../../lib/startathon";
import { saveAuth, isAuthed } from "../../lib/auth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Google One Tap — the small corner prompt Google renders on its own,
 * no button on the page. Silent no-op if the visitor is already
 * signed in, dismisses it, or isn't signed into a Google account.
 */
const GoogleOneTap = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!CLIENT_ID || isAuthed()) return;
    let cancelled = false;

    const handleCredential = async (response) => {
      try {
        const data = await api.googleCredential(response.credential);
        saveAuth(data);
        navigate("/apply", { replace: true });
      } catch {
        // One Tap failing quietly is fine — /login is still there.
      }
    };

    loadGis().then(() => {
      if (cancelled || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.prompt();
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return null;
};

export default GoogleOneTap;
