import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { api } from "../../../lib/startathon";

// Advisory sharing check for the deck and video links.
//
// Three rules from the API docs shape everything below:
//   1. Never block on a failed check. Nothing here gates Next or Submit. A
//      team hitting a Google outage at the deadline must still be able to
//      submit, which is why this is a separate route from PUT /team/application.
//   2. `upstream_error` is not the team's fault. It means retry, and it must
//      never be styled as "your link is broken". Drive returns it for every
//      link until the Drive API is enabled on the Cloud project, so today it
//      is the common case there, not the rare one.
//   3. A 400 (not a URL at all) and a 200 + unrecognized_url (a valid URL from
//      an unsupported provider) are different failures with different copy.

const IDLE_MS = 800;

const isProbablyUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const Row = ({ tone, icon: Icon, spin = false, children }) => (
  <div
    className={`-mt-4 mb-7 flex items-start gap-2 font-general text-[0.85rem] leading-relaxed ${
      tone === "ok"
        ? "text-lime/90"
        : tone === "warn"
          ? "text-[rgba(255,120,120,0.95)]"
          : "text-white/45"
    }`}
  >
    <Icon
      size={14}
      strokeWidth={2}
      aria-hidden="true"
      className={`mt-[0.25em] shrink-0 ${spin ? "animate-spin" : ""}`}
    />
    <span className="min-w-0">{children}</span>
  </div>
);

const LinkCheck = ({ url, kind, disabled = false }) => {
  const [state, setState] = useState({ status: "idle" });
  // Guards against a slow check for an old URL landing after a fast one for
  // the current URL and overwriting it.
  const runIdRef = useRef(0);
  const [attempt, setAttempt] = useState(0);

  const check = useCallback(
    async (value) => {
      const runId = ++runIdRef.current;
      setState({ status: "checking" });
      try {
        const verify = kind === "drive" ? api.verifyDriveLink : api.verifyYoutubeLink;
        const data = await verify(value);
        if (runId !== runIdRef.current) return;
        setState({ status: "done", data });
      } catch (err) {
        if (runId !== runIdRef.current) return;
        // 400 means it isn't a URL at all; anything else (401, 500, network)
        // is our problem to retry, not something the team can fix by editing.
        setState({ status: err.status === 400 ? "invalid" : "unavailable" });
      }
    },
    [kind]
  );

  useEffect(() => {
    const value = url?.trim();
    if (disabled || !value || !isProbablyUrl(value)) {
      runIdRef.current += 1; // cancel any in-flight check
      setState({ status: "idle" });
      return undefined;
    }
    const timer = setTimeout(() => check(value), IDLE_MS);
    return () => clearTimeout(timer);
  }, [url, disabled, attempt, check]);

  if (state.status === "idle") return null;

  if (state.status === "checking") {
    return (
      <Row tone="muted" icon={Loader2} spin>
        Checking the link…
      </Row>
    );
  }

  if (state.status === "invalid") {
    return (
      <Row tone="warn" icon={TriangleAlert}>
        That isn&rsquo;t a link we can read. Paste the URL from your browser&rsquo;s address bar.
      </Row>
    );
  }

  const retry = (
    <button
      type="button"
      onClick={() => setAttempt((a) => a + 1)}
      className="ml-[0.4rem] inline-flex items-center gap-1 font-mono text-[0.78rem] text-white/70 underline underline-offset-[3px] transition-colors duration-200 hover:text-white"
    >
      <RefreshCw size={11} strokeWidth={2} aria-hidden="true" />
      Retry
    </button>
  );

  if (state.status === "unavailable") {
    return (
      <Row tone="muted" icon={TriangleAlert}>
        Couldn&rsquo;t check this link right now. Your link may well be fine, and you can
        submit either way.{retry}
      </Row>
    );
  }

  const { ok, reason, message, name, title, author_name, thumbnail_url, is_folder } =
    state.data ?? {};

  // Same treatment as a failed request: the team has nothing to fix.
  if (reason === "upstream_error") {
    return (
      <Row tone="muted" icon={TriangleAlert}>
        Couldn&rsquo;t check this link right now. Your link may well be fine, and you can
        submit either way.{retry}
      </Row>
    );
  }

  if (!ok) {
    return (
      <Row tone="warn" icon={TriangleAlert}>
        {message}
        <span className="mt-1 block text-white/45">
          You can still submit, but judges will see what we saw.
        </span>
      </Row>
    );
  }

  // A confirmed video shows its thumbnail and title, which is the fastest way
  // for someone to spot that they pasted the wrong video entirely.
  if (kind === "youtube" && thumbnail_url) {
    return (
      <div className="-mt-4 mb-7 flex items-center gap-3 rounded-md border-[0.5px] border-lime/25 bg-lime/[0.04] p-[0.6rem]">
        <img
          src={thumbnail_url}
          alt=""
          width={96}
          height={54}
          loading="lazy"
          className="h-[54px] w-[96px] shrink-0 rounded object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-general text-[0.88rem] font-bold text-white">{title}</p>
          {author_name && (
            <p className="truncate font-general text-[0.8rem] text-white/50">{author_name}</p>
          )}
          <p className="mt-[0.15rem] font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lime/80">
            Playable
          </p>
        </div>
      </div>
    );
  }

  return (
    <Row tone="ok" icon={CheckCircle2}>
      {message}
      {/* mime_type catches the common mistake of sharing the folder instead
          of the deck inside it. */}
      {is_folder && (
        <span className="mt-1 block text-white/45">
          That&rsquo;s a folder, not a file. Link the deck itself if you meant to.
        </span>
      )}
      {!is_folder && name && !message?.includes(name) && (
        <span className="mt-1 block text-white/45">{name}</span>
      )}
    </Row>
  );
};

export default LinkCheck;
