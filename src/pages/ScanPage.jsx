import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import AuthShell from "../components/apply/AuthShell";
import {
  Panel,
  Eyebrow,
  Title,
  ErrorLine,
  NoticeLine,
  PrimaryButton,
  GhostButton,
} from "../components/apply/ui";
import TerminalInput from "../components/apply/inputs/TerminalInput";
import { usePageMeta } from "../lib/seo";
import { mealsApi, MEAL_KEYS } from "../lib/meals";
import { getMealToken, saveMealToken, clearMealToken, getMarker, saveMarker } from "../lib/mealAuth";

// Camera frames arrive far faster than a person can present a new badge —
// throttling jsQR to this cadence keeps a phone from cooking itself.
const SCAN_INTERVAL_MS = 200;

const ScanPage = () => {
  usePageMeta({
    title: "Scan",
    description: "Meal check-in scanner for Startathon staff.",
    path: "/scan",
    noindex: true,
  });

  // gate: enter the staff token once per device | pickMeal: choose a serving
  // | scan: camera is live for the chosen serving
  const [stage, setStage] = useState(() => (getMealToken() && getMarker() ? "pickMeal" : "gate"));
  const [marker, setMarker] = useState(() => getMarker());
  const [mealKey, setMealKey] = useState(null);

  const [tokenInput, setTokenInput] = useState("");
  const [markerInput, setMarkerInput] = useState("");
  const [gateError, setGateError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const lastScanRef = useRef(0);

  // starting | scanning | submitting | result | error (camera, not API)
  const [camStatus, setCamStatus] = useState("starting");
  const [camError, setCamError] = useState("");
  const [outcome, setOutcome] = useState(null); // { kind: "success"|"duplicate"|"error", person?, message? }
  const [undoBusy, setUndoBusy] = useState(false);
  const [undone, setUndone] = useState(false);

  const submitGate = (e) => {
    e.preventDefault();
    if (!tokenInput.trim() || !markerInput.trim()) {
      setGateError("Enter both the staff token and your counter label.");
      return;
    }
    saveMealToken(tokenInput.trim());
    saveMarker(markerInput.trim());
    setMarker(markerInput.trim());
    setGateError("");
    setStage("pickMeal");
  };

  const switchStaff = () => {
    clearMealToken();
    saveMarker("");
    setMarker("");
    setTokenInput("");
    setMarkerInput("");
    setStage("gate");
  };

  const pickMeal = (key) => {
    setMealKey(key);
    setOutcome(null);
    setUndone(false);
    setStage("scan");
  };

  const changeMeal = () => {
    setStage("pickMeal");
    setOutcome(null);
  };

  const submitMark = useCallback(
    async (rawText) => {
      setCamStatus("submitting");
      try {
        const data = await mealsApi.mark(mealKey, { userId: rawText.trim(), markedBy: marker });
        setOutcome({ kind: data.newly_marked ? "success" : "duplicate", person: data.person });
      } catch (err) {
        setOutcome({ kind: "error", message: err.message });
      }
      setUndoBusy(false);
      setUndone(false);
      setCamStatus("result");
    },
    [mealKey, marker],
  );

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    if (now - lastScanRef.current < SCAN_INTERVAL_MS) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }
    lastScanRef.current = now;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(frame.data, frame.width, frame.height);

    if (code?.data) {
      submitMark(code.data);
      return; // loop resumes only when "Scan next" is pressed
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [submitMark]);

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamStatus("starting");
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamStatus("scanning");
      lastScanRef.current = 0;
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCamError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser settings and retry."
          : "Couldn't reach a camera on this device.",
      );
      setCamStatus("error");
    }
  }, [tick]);

  useEffect(() => {
    if (stage !== "scan") return undefined;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("This browser can't access the camera. Try Chrome on Android, or Safari on iOS.");
      setCamStatus("error");
      return undefined;
    }
    startCamera();
    return stopCamera;
    // Camera lifecycle is owned by the scan/pickMeal transition, not by
    // every callback identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const scanNext = () => {
    setOutcome(null);
    setUndone(false);
    setCamStatus("scanning");
    lastScanRef.current = 0;
    frameRef.current = requestAnimationFrame(tick);
  };

  const undoMark = async () => {
    if (!outcome?.person) return;
    setUndoBusy(true);
    try {
      await mealsApi.unmark(mealKey, outcome.person.user_id);
      setUndone(true);
    } catch (err) {
      setOutcome((prev) => ({ ...prev, message: err.message }));
    } finally {
      setUndoBusy(false);
    }
  };

  const mealLabel = MEAL_KEYS.find((m) => m.key === mealKey)?.label ?? "";

  const title = (() => {
    if (camStatus === "error") return "Camera unavailable";
    if (camStatus === "submitting") return "Marking…";
    if (camStatus === "result" && outcome) {
      if (outcome.kind === "error") return "Not marked";
      return outcome.kind === "success" ? "Served" : "Already served";
    }
    return "Point at a badge";
  })();

  return (
    <AuthShell label="SCAN">
      <Panel maxWidth="480px">
        {stage === "gate" && (
          <>
            <Eyebrow>MEAL CHECK-IN</Eyebrow>
            <Title>Staff sign-in</Title>
            <form onSubmit={submitGate} noValidate>
              <TerminalInput
                label="Staff token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoComplete="off"
              />
              <TerminalInput
                label="Counter label (e.g. counter-2)"
                value={markerInput}
                onChange={(e) => setMarkerInput(e.target.value)}
                autoComplete="off"
              />
              <ErrorLine>{gateError}</ErrorLine>
              <PrimaryButton type="submit">Continue</PrimaryButton>
            </form>
          </>
        )}

        {stage === "pickMeal" && (
          <>
            <Eyebrow>MEAL CHECK-IN</Eyebrow>
            <Title>Pick a serving</Title>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_KEYS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => pickMeal(m.key)}
                  className="rounded-md border-[0.5px] border-lime/[0.14] bg-white/5 px-4 py-5 text-center font-mono text-[0.8rem] uppercase tracking-widest text-white transition-colors duration-200 hover:border-lime/40 hover:bg-lime/[0.06]"
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <GhostButton onClick={switchStaff}>Switch staff token</GhostButton>
            </div>
          </>
        )}

        {stage === "scan" && (
          <>
            <div className="mb-1 flex items-center justify-between gap-3">
              <Eyebrow>{mealLabel}</Eyebrow>
              <GhostButton onClick={changeMeal}>Change meal</GhostButton>
            </div>
            <Title>{title}</Title>

            {camStatus === "error" ? (
              <>
                <ErrorLine>{camError}</ErrorLine>
                <PrimaryButton onClick={startCamera}>Retry</PrimaryButton>
              </>
            ) : (
              <div className="relative aspect-square w-full overflow-hidden rounded-md border-[0.5px] border-lime/[0.14] bg-black">
                <video ref={videoRef} muted playsInline className="size-full object-cover" />
                {camStatus === "scanning" && (
                  <div className="pointer-events-none absolute inset-8 rounded-md border-2 border-lime/50" />
                )}
                {(camStatus === "starting" || camStatus === "submitting") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <p className="font-mono text-[0.8rem] text-lime/80">
                      {camStatus === "starting" ? "Starting camera…" : "Marking…"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {camStatus === "result" && outcome && (
              <div className="mt-5 flex flex-col gap-3">
                {outcome.kind === "error" ? (
                  <ErrorLine>{outcome.message}</ErrorLine>
                ) : (
                  <div className="rounded-md border-[0.5px] border-lime/[0.14] bg-black/40 p-4">
                    <p className="font-general text-[1.05rem] font-bold text-white">
                      {outcome.person.name}
                    </p>
                    <p className="font-mono text-[0.8rem] text-white/60">
                      {outcome.person.team_name}
                    </p>
                    <p className="mt-2 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-lime/80">
                      {outcome.person.food_preference ?? "preference unknown"}
                    </p>
                    {outcome.person.dietary_notes && (
                      <ErrorLine>{`Note: ${outcome.person.dietary_notes}`}</ErrorLine>
                    )}
                    <NoticeLine>
                      {outcome.kind === "success"
                        ? "Marked served."
                        : `Already served at ${new Date(outcome.person.marked_at).toLocaleTimeString()}${
                            outcome.person.marked_by ? ` by ${outcome.person.marked_by}` : ""
                          }.`}
                    </NoticeLine>
                    {undone ? (
                      <NoticeLine>Mark undone.</NoticeLine>
                    ) : (
                      <GhostButton danger disabled={undoBusy} onClick={undoMark}>
                        {undoBusy ? "Undoing…" : "Wrong person? Undo"}
                      </GhostButton>
                    )}
                  </div>
                )}
                <PrimaryButton onClick={scanNext}>Scan next</PrimaryButton>
              </div>
            )}
          </>
        )}
      </Panel>
    </AuthShell>
  );
};

export default ScanPage;
