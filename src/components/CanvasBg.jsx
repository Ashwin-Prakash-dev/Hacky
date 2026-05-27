import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   Effect 01 — Circuit Grid  (About.jsx white section)
   Blue nodes + edges illuminate outward from cursor.
   ───────────────────────────────────────────────────────────────── */
export const CircuitGridBg = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const GRID = 38;

    let W, H, cols, rows, nodes;

    const build = () => {
      W = canvas.parentElement.clientWidth;
      H = canvas.parentElement.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);

      cols = Math.ceil(W / GRID) + 1;
      rows = Math.ceil(H / GRID) + 1;
      nodes = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          nodes.push({ x: c * GRID, y: r * GRID, b: 0 });
        }
      }
    };

    build();

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      build();
    };
    window.addEventListener("resize", onResize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };

    canvas.parentElement.addEventListener("mousemove", onMove);
    canvas.parentElement.addEventListener("mouseleave", onLeave);

    const frame = () => {
      ctx.clearRect(0, 0, W, H);

      const { x: mx, y: my } = mouseRef.current;
      const stride = cols + 1;

      nodes.forEach((n) => {
        const dx = n.x - mx, dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = Math.max(0, 1 - dist / 160);
        n.b += (target - n.b) * 0.1;
      });

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const n = nodes[r * stride + c];
          const right = c < cols ? nodes[r * stride + (c + 1)] : null;
          const down  = r < rows ? nodes[(r + 1) * stride + c] : null;

          if (right) {
            const b = (n.b + right.b) / 2;
            if (b > 0.02) {
              // Blue tones on white: dark blue for strong hits, mid-blue for dim
              ctx.strokeStyle = `rgba(30,80,200,${b * 0.55})`;
              ctx.lineWidth = b > 0.2 ? 1.2 : 0.4;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(right.x, right.y);
              ctx.stroke();
            }
          }

          if (down) {
            const b = (n.b + down.b) / 2;
            if (b > 0.02) {
              ctx.strokeStyle = `rgba(30,80,200,${b * 0.55})`;
              ctx.lineWidth = b > 0.2 ? 1.2 : 0.4;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(down.x, down.y);
              ctx.stroke();
            }
          }

          // Node dot
          if (n.b > 0.04) {
            // Bright core: royal blue; soft halo: lighter blue
            const radius = n.b * 4;
            ctx.fillStyle = `rgba(20,60,180,${n.b * 0.9})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Resting dot — very faint
            ctx.fillStyle = "rgba(100,140,220,0.08)";
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener("mousemove", onMove);
        canvas.parentElement.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
};


/* ─────────────────────────────────────────────────────────────────
   Effect 02 — Signal Pulse Traces  (Features.jsx black section)
   White orthogonal pulses radiate from cursor like data packets.
   ───────────────────────────────────────────────────────────────── */
export const SignalPulseBg = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const stateRef = useRef({ pulses: [], lastPulse: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let W, H;

    const build = () => {
      W = canvas.parentElement.clientWidth;
      H = canvas.parentElement.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
    };

    build();
    window.addEventListener("resize", () => { ctx.setTransform(1, 0, 0, 1, 0, 0); build(); });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };

    canvas.parentElement.addEventListener("mousemove", onMove);
    canvas.parentElement.addEventListener("mouseleave", onLeave);

    const spawn = () => {
      const { x, y } = mouseRef.current;
      if (x < 0) return;
      const angle = (Math.random() < 0.5 ? 0 : Math.PI / 2) + (Math.random() < 0.5 ? 0 : Math.PI);
      const speed = 2.5 + Math.random() * 3.5;
      stateRef.current.pulses.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        trail: [],
        turns: 0,
        axis: Math.abs(Math.cos(angle)) > 0.5 ? "h" : "v",
      });
    };

    const frame = (ts) => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, W, H);

      const s = stateRef.current;

      if (mouseRef.current.x > 0 && ts - s.lastPulse > 90) {
        spawn();
        s.lastPulse = ts;
      }

      s.pulses = s.pulses.filter((p) => p.life > 0.015);

      s.pulses.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 28) p.trail.shift();

        if (p.axis === "h") {
          p.x += p.vx;
          if (p.turns < 3 && Math.random() > 0.97) {
            p.axis = "v";
            p.vy = (Math.random() - 0.5) * 6;
            p.vx *= 0.25;
            p.turns++;
          }
        } else {
          p.y += p.vy;
          if (p.turns < 3 && Math.random() > 0.97) {
            p.axis = "h";
            p.vx = (Math.random() - 0.5) * 6;
            p.vy *= 0.25;
            p.turns++;
          }
        }

        p.life -= 0.014;

        // Draw trail
        for (let i = 1; i < p.trail.length; i++) {
          const frac = i / p.trail.length;
          ctx.strokeStyle = `rgba(255,255,255,${frac * p.life * 0.75})`;
          ctx.lineWidth = frac * 1.8;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.stroke();
        }

        // Head dot
        ctx.fillStyle = `rgba(255,255,255,${p.life * 0.95})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener("mousemove", onMove);
        canvas.parentElement.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
};
