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
} from "../components/apply/ui";
import { usePageMeta } from "../lib/seo";

// Camera frames arrive far faster than a person can present a new badge —
// throttling jsQR to this cadence keeps a phone from cooking itself.
const SCAN_INTERVAL_MS = 200;

const ScanPage = () => {
  usePageMeta({
    title: "Scan",
    description: "Check-in scanner for Startathon staff.",
    path: "/scan",
    noindex: true,
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const lastScanRef = useRef(0);

  const [status, setStatus] = useState("starting"); // starting | scanning | found | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { text, at }

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
      setResult({ text: code.data, at: new Date() });
      setStatus("found");
      return; // loop resumes only when "Scan next" is pressed
    }

    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("starting");
    setError("");
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
      setStatus("scanning");
      lastScanRef.current = 0;
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser settings and retry."
          : "Couldn't reach a camera on this device.",
      );
      setStatus("error");
    }
  }, [tick]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't access the camera. Try Chrome on Android, or Safari on iOS.");
      setStatus("error");
      return undefined;
    }
    startCamera();
    return stopCamera;
    // Camera lifecycle is owned by this page; deliberately runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanNext = () => {
    setResult(null);
    setStatus("scanning");
    lastScanRef.current = 0;
    frameRef.current = requestAnimationFrame(tick);
  };

  return (
    <AuthShell label="SCAN">
      <Panel maxWidth="480px">
        <Eyebrow>CHECK-IN SCANNER</Eyebrow>
        <Title>{status === "found" ? "Code scanned" : "Point at a badge"}</Title>

        {status === "error" && (
          <>
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton onClick={startCamera}>Retry</PrimaryButton>
          </>
        )}

        {(status === "starting" || status === "scanning") && (
          <div className="relative aspect-square w-full overflow-hidden rounded-md border-[0.5px] border-lime/[0.14] bg-black">
            <video ref={videoRef} muted playsInline className="size-full object-cover" />
            <div className="pointer-events-none absolute inset-8 rounded-md border-2 border-lime/50" />
            {status === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <p className="font-mono text-[0.8rem] text-lime/80">Starting camera…</p>
              </div>
            )}
          </div>
        )}

        {status === "found" && result && (
          <>
            <div className="break-all rounded-md border-[0.5px] border-lime/[0.14] bg-black/40 p-4 font-mono text-[0.95rem] text-lime">
              {result.text}
            </div>
            <NoticeLine>{`Scanned at ${result.at.toLocaleTimeString()}`}</NoticeLine>
            <PrimaryButton onClick={scanNext}>Scan next</PrimaryButton>
          </>
        )}
      </Panel>
    </AuthShell>
  );
};

export default ScanPage;
