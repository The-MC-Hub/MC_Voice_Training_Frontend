import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptLoadingPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Renders Google's native "Sign in with Google" button. Calls onCredential(idToken)
 * when the user completes the Google flow — the caller sends that token to
 * POST /auth/google and handles the login/pending-registration response.
 */
export default function GoogleSignInButton({ onCredential, onError, text = "continue_with", disabled = false }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onCredential(response.credential);
            } else {
              onError?.(new Error("Google did not return a credential"));
            }
          },
        });
        setReady(true);
      })
      .catch((err) => onError?.(err));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google?.accounts?.id) return;
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      width: containerRef.current.offsetWidth || 320,
    });
  }, [ready, text]);

  if (!clientId) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}
    />
  );
}
