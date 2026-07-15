/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import {
  KEYS,
  WALK_SCENE,
  TABLE_SCENE,
  TWO_PI,
  walkerElems,
  tableElems,
  evalElem,
  assignSlots,
  buildTargets,
  easeOutCubic,
  clamp01,
  makeGradientMap,
  ANIM_SCENES,
  SHAPE_W,
  SHAPE_H,
} from "./shapes";
import { BEHAVIORS, sweepStats } from "./behaviors";
import { bordersPoint } from "./primitives";
import {
  initRegistry,
  sectionAt,
  getRect,
  getHovered,
  setHovered,
  consume,
} from "./registry";

// The site-wide particle system: one fixed, transparent, full-viewport
// canvas with a single instanced pool that lives for the whole visit.
// A per-frame director hands the flock to whichever section owns the
// viewport center — the hero plays its particle movie, other sections run
// their target-generator behaviors (see behaviors.js) — and unclaimed
// particles ride a scroll-velocity-driven vertical stream between them.

// Debug hooks: ?heroT=12 starts the movie clock at 12s; ?pstate=<section>
// pins ownership to one behavior; ?phover=<id> forces a hover target.
function param(name) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}
function initialTime() {
  const v = parseFloat(param("heroT"));
  return Number.isFinite(v) ? v : 0;
}

const MOVIE_END = KEYS[KEYS.length - 1].at + KEYS[KEYS.length - 1].dur + 1.3;

const bOut = [0, 0]; // scratch for bordersPoint targets

function ParticleEngine({ started, count, isMobile }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const elapsed = useRef(0);
  const movieT = useRef(initialTime());
  const heroState = useRef({ abandoned: false });
  const activeRef = useRef({ id: "hero", since: 0 });
  const pointer = useRef(new THREE.Vector2(999, 999));
  const pointerPrev = useRef(new THREE.Vector2(999, 999));
  const pointerVel = useRef(new THREE.Vector2(0, 0));
  const pointerTarget = useRef(new THREE.Vector2(999, 999));
  const pointerNdc = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();
  const [built, setBuilt] = useState(null);
  const pstate = useMemo(() => param("pstate"), []);
  const phover = useMemo(() => param("phover"), []);

  useEffect(() => {
    initRegistry();
    let alive = true;
    buildTargets(count).then((t) => alive && setBuilt(t));
    return () => {
      alive = false;
    };
  }, [count]);

  // Per-instance state: scatter start, randomness, animated-scene slots,
  // current position, wake spring state, claim buffers
  const inst = useMemo(() => {
    const starts = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    // independent random streams — deriving several "randoms" from one
    // value via fract(r * k) correlates x/y and collapses scatter onto
    // visible diagonal lines
    const rands2 = new Float32Array(count);
    const rands3 = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * TWO_PI;
      const rad = 4 + Math.random() * 7;
      starts[i * 3] = Math.cos(th) * rad;
      starts[i * 3 + 1] = (Math.random() - 0.5) * 8;
      starts[i * 3 + 2] = Math.sin(th) * rad - 3;
      rands[i] = Math.random();
      rands2[i] = Math.random();
      rands3[i] = Math.random();
    }
    const slots = {};
    for (const name of Object.keys(ANIM_SCENES)) {
      slots[name] = assignSlots(ANIM_SCENES[name](0), count);
    }
    return {
      starts,
      rands,
      rands2,
      rands3,
      slots,
      cur: starts.slice(),
      offsets: new Float32Array(count * 2),
      vels: new Float32Array(count * 2),
      claimK: new Float32Array(count),
      claimT: new Float32Array(count * 3),
      claimS: new Float32Array(count),
      scaleCur: new Float32Array(count).fill(1),
      dummy: new THREE.Object3D(),
    };
  }, [count]);

  const gradientMap = useMemo(makeGradientMap, []);

  // Per-instance flat colors: moss → lime range, a few near-white accents.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !built) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const moss = new THREE.Color("#3d5c0a");
    const lime = new THREE.Color("#C8FF00");
    const hot = new THREE.Color("#f2ffd0");
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = inst.rands[i];
      if (r > 0.94) c.copy(hot);
      else c.copy(moss).lerp(lime, Math.min(1, r * 1.4));
      mesh.setColorAt(i, c);
    }
    mesh.instanceColor.needsUpdate = true;
  }, [built, count, inst]);

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerNdc.current.set(nx, ny);
      pointerTarget.current.set(
        nx * (viewport.width / 2),
        ny * (viewport.height / 2)
      );
    };
    const onLeave = () => pointerTarget.current.set(999, 999);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !built) return;
    const { shapes, dotCount: dotN } = built;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const t = elapsed.current;

    const sy = window.scrollY;

    const pointerActive = pointerTarget.current.x < 900;
    if (pointerActive && pointer.current.x > 900) {
      pointer.current.copy(pointerTarget.current);
      pointerPrev.current.copy(pointerTarget.current);
    }
    pointerPrev.current.copy(pointer.current);
    pointer.current.lerp(pointerTarget.current, 0.14);
    const px = pointer.current.x;
    const py = pointer.current.y;
    if (pointerActive) {
      pointerVel.current
        .copy(pointer.current)
        .sub(pointerPrev.current)
        .divideScalar(Math.max(dt, 1e-3));
      const vmag = pointerVel.current.length();
      if (vmag > 26) pointerVel.current.multiplyScalar(26 / vmag);
    } else {
      pointerVel.current.set(0, 0);
    }
    const pvx = pointerVel.current.x;
    const pvy = pointerVel.current.y;

    // gentle parallax tilt of the whole scene toward the cursor
    if (groupRef.current) {
      const tx = pointerActive ? pointerNdc.current.x : 0;
      const ty = pointerActive ? pointerNdc.current.y : 0;
      groupRef.current.rotation.y += (tx * 0.09 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-ty * 0.06 - groupRef.current.rotation.x) * 0.03;
    }

    const vw = viewport.width;
    const vh = viewport.height;
    const wppX = vw / window.innerWidth;
    const wppY = vh / window.innerHeight;
    const rectW = (id) => {
      const r = getRect(id);
      if (!r) return null;
      const sx = r.left + r.width / 2;
      const sYc = r.top - sy + r.height / 2;
      return {
        cx: (sx - window.innerWidth / 2) * wppX,
        cy: -(sYc - window.innerHeight / 2) * wppY,
        w: r.width * wppX,
        h: r.height * wppY,
      };
    };

    // ---- director -------------------------------------------------------
    if (phover) setHovered(phover);
    let act = pstate || sectionAt(sy + window.innerHeight / 2);
    // short final sections (the footer) can never contain the viewport
    // center — at the bottom of the page, the last section wins
    const docH = document.documentElement.scrollHeight;
    if (!pstate && sy + window.innerHeight >= docH - 8) {
      act = sectionAt(docH - 10) || act;
    }
    if (isMobile && act !== "hero") act = null;
    if (!started) act = "hero";
    if (act !== activeRef.current.id) activeRef.current = { id: act, since: t };
    const at = t - activeRef.current.since;

    const hs = heroState.current;
    const heroOwns = act === "hero";
    if (heroOwns && started && !hs.abandoned && movieT.current < MOVIE_END) {
      movieT.current += dt;
    }
    if (
      (!heroOwns || sy > 40) &&
      movieT.current > 0.1 &&
      movieT.current < MOVIE_END
    ) {
      hs.abandoned = true; // any real scroll mid-movie dissolves it, no resume
    }
    const movieActive = heroOwns && !hs.abandoned && movieT.current < MOVIE_END;

    const {
      starts,
      rands,
      rands2,
      rands3,
      slots,
      cur,
      offsets,
      vels,
      claimK,
      claimT,
      claimS,
      scaleCur,
      dummy,
    } = inst;
    const scale = Math.min(vw * 0.92, 17);
    const baseSize = scale * 0.0055;
    const wakeR = scale * 0.14;
    const wobAmp = scale * 0.0045;
    const heroRect = rectW("section:hero");
    const heroOff = heroRect ? heroRect.cy : 0;

    claimK.fill(0);
    let wind = 0;

    if (movieActive) {
      // ---- the hero particle movie, verbatim choreography ---------------
      const mt = movieT.current;
      const shrink = 1 - Math.min(mt / 4, 1) * 0.5;
      const animEls = {
        walk: mt > KEYS[WALK_SCENE].at ? walkerElems(mt - KEYS[WALK_SCENE].at) : null,
        table: mt > KEYS[TABLE_SCENE].at ? tableElems(mt - KEYS[TABLE_SCENE].at) : null,
      };
      const segOut = [0, 0];
      for (let i = 0; i < count; i++) {
        const r = rands[i];
        const p0 = easeOutCubic(clamp01((mt - KEYS[0].at - r * 1.2) / KEYS[0].dur));

        const ang = mt * (0.18 + r * 0.25) + r * TWO_PI;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const sx0 = starts[i * 3];
        const sy0 = starts[i * 3 + 1];
        const sz0 = starts[i * 3 + 2];
        const sx = (ca * sx0 + sa * sz0) * shrink;
        const syv = (sy0 + Math.sin(mt * 0.6 + r * 12) * 0.4 * (1 - p0)) * shrink;
        const sz = (-sa * sx0 + ca * sz0) * shrink;

        let x = sx + (shapes[0][i * 2] * scale - sx) * p0;
        let y = syv + (shapes[0][i * 2 + 1] * scale - syv) * p0;
        let z = sz * (1 - p0);

        for (let k = 1; k < KEYS.length; k++) {
          const pk = easeOutCubic(clamp01((mt - KEYS[k].at - r) / KEYS[k].dur));
          if (pk <= 0) break;
          const s = shapes[k];
          let tx;
          let ty;
          if (s.anim) {
            const slot = slots[s.anim];
            evalElem(animEls[s.anim][slot.idx[i]], slot.u[i], slot.v[i], segOut);
            tx = (segOut[0] - SHAPE_W / 2) / SHAPE_W;
            ty = -(segOut[1] - SHAPE_H / 2) / SHAPE_W;
          } else {
            tx = s[i * 2];
            ty = s[i * 2 + 1];
          }
          x += (tx * scale - x) * pk;
          y += (ty * scale - y) * pk;
        }

        claimK[i] = 99;
        claimT[i * 3] = x;
        claimT[i * 3 + 1] = y + heroOff;
        claimT[i * 3 + 2] = z;
        claimS[i] = p0;
      }
    } else {
      const s6 = shapes[6];
      // The dot swarm's journey is a pure function of scroll, never a
      // trigger. Leg 1 (hero -> sponsors): u1 runs 0 -> 1 as the card group
      // centers in the viewport, detouring down a right-side stream lane.
      // The swarm then dwells behind the sponsor cards until the sponsors
      // section is 70% scrolled; leg 2 (sponsors -> videocards) carries it
      // down the LEFT edge, behind the "We took notes…" heading, out its
      // bottom-right corner, and onto the video card borders, arriving as
      // the video grid reaches mid-screen. Scrolling back reverses it all.
      const groupDoc = getRect("sponsor-group");
      let u1 = 1;
      if (groupDoc) {
        const targetScroll = groupDoc.top + groupDoc.height / 2 - window.innerHeight / 2;
        if (targetScroll > 1) u1 = Math.min(1, sy / targetScroll);
      }
      const spDoc = getRect("section:sponsors");
      const vgDoc = getRect("vc-grid");
      let u2 = 0;
      if (spDoc && vgDoc && vgDoc.width > 2) {
        // ScrollTrigger-style progress: 0 when the section top enters the
        // viewport bottom, 1 when its bottom leaves the top — depart at 70%
        const dep =
          spDoc.top + 0.7 * (spDoc.height + window.innerHeight) - window.innerHeight;
        const arr = vgDoc.top - window.innerHeight * 0.5;
        if (arr > dep + 1) u2 = clamp01((sy - dep) / (arr - dep));
        else if (sy >= dep) u2 = 1;
      }
      // leg 3 (videocards -> stats): departs when the "What is Startathon?"
      // block enters the viewport, arrives as the stats row centers; the
      // last stretch is the left-to-right row sweep
      const introDoc = getRect("intro-grid");
      const statsDoc = getRect("stats-row");
      let u3 = 0;
      if (introDoc && statsDoc && statsDoc.width > 2) {
        const dep = introDoc.top - window.innerHeight;
        const arr =
          statsDoc.top + statsDoc.height / 2 - window.innerHeight * 0.5;
        if (arr > dep + 1) u3 = clamp01((sy - dep) / (arr - dep));
        else if (sy >= dep) u3 = 1;
      }
      // leg 4 (stats -> studenthook): departs a beat after the rail sweep
      // completes (never before — the counters must have fired), then swarms
      // down the right side into the next section's scatter
      const hvDoc = getRect("hook-video");
      let u4 = 0;
      if (statsDoc && hvDoc && hvDoc.width > 2) {
        const sweepDone =
          statsDoc.top + statsDoc.height / 2 - window.innerHeight * 0.5;
        const dep = sweepDone + window.innerHeight * 0.35;
        const arr = hvDoc.top + hvDoc.height / 2 - window.innerHeight / 2;
        if (arr > dep + 1) u4 = clamp01((sy - dep) / (arr - dep));
        else if (sy >= dep) u4 = 1;
      }
      // A movie abandoned mid-flight departs from its frozen last frame —
      // the flock never regroups into the wordmark before streaming away.
      // The frozen shape relaxes into the parked wordmark only when the
      // morph can't be seen: hero off-screen, or the user at rest.
      if (hs.abandoned && !hs.freeze) {
        const f = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          f[i * 2] = cur[i * 3];
          f[i * 2 + 1] = cur[i * 3 + 1] - heroOff;
        }
        hs.freeze = f;
        hs.u0 = Math.min(u1, 0.99);
      }
      const fz = hs.freeze;
      const svel = (sy - (hs.prevSy ?? sy)) / dt;
      hs.prevSy = sy;
      if (fz) {
        const heroGone = heroRect
          ? heroRect.cy - heroRect.h / 2 > vh / 2
          : sy > window.innerHeight;
        const relK = heroGone ? 3 : Math.abs(svel) < 60 ? 2 : 0;
        if (relK) {
          const rel = 1 - Math.exp(-relK * dt);
          for (let i = 0; i < count; i++) {
            fz[i * 2] += (s6[i * 2] * scale - fz[i * 2]) * rel;
            fz[i * 2 + 1] += (s6[i * 2 + 1] * scale - fz[i * 2 + 1]) * rel;
          }
        }
      }
      const ur = fz ? clamp01((u1 - hs.u0) / Math.max(0.01, 1 - hs.u0)) : u1;
      // letters: parked on the (frozen or settled) hero-anchored wordmark —
      // they scroll away with the section like ordinary content and are
      // back in place whenever the user returns
      for (let i = dotN; i < count; i++) {
        claimK[i] = 4;
        claimT[i * 3] = fz ? fz[i * 2] : s6[i * 2] * scale;
        claimT[i * 3 + 1] =
          (fz ? fz[i * 2 + 1] : s6[i * 2 + 1] * scale) + heroOff;
        claimT[i * 3 + 2] = 0;
      }
      const hovering = u2 <= 0 && getHovered()?.startsWith("sponsor-");
      const g = rectW("sponsor-group");
      const ctx = {
        t,
        at,
        dt,
        count: dotN, // behaviors pose only the dot swarm
        rands,
        rands2,
        rands3,
        scale,
        vw,
        vh,
        heroOff,
        hovered: getHovered(),
        rect: rectW,
        consume,
        claim: (i, x, y, z, k) => {
          claimK[i] = k;
          claimT[i * 3] = x;
          claimT[i * 3 + 1] = y;
          claimT[i * 3 + 2] = z;
        },
      };
      if (u1 < 1 && !hovering) {
        for (let i = 0; i < dotN; i++) {
          const r = rands[i];
          const pi = clamp01(ur * 1.35 - r * 0.35);
          const e = pi * pi * (3 - 2 * pi);
          const sx0 = fz ? fz[i * 2] : s6[i * 2] * scale;
          const sy0 =
            (fz ? fz[i * 2 + 1] : s6[i * 2 + 1] * scale) + heroOff;
          let ex = vw * 0.42;
          let ey = -vh * 0.2;
          if (g) {
            ex = g.cx + (rands2[i] - 0.5) * (g.w + 1);
            ey = g.cy + (rands3[i] - 0.5) * (g.h + 1);
          }
          let bx = sx0 + (ex - sx0) * e;
          const w = Math.sin(e * Math.PI);
          const by =
            sy0 + (ey - sy0) * e + Math.sin(pi * 5 + r * 12) * 0.25 * w;
          bx += (vw * (0.38 + r * 0.07) - bx) * w;
          claimK[i] = 12;
          claimT[i * 3] = bx;
          claimT[i * 3 + 1] = by;
          claimT[i * 3 + 2] = (rands3[i] - 0.5) * 0.8 * e;
        }
      } else if (u2 <= 0 || hovering) {
        wind = BEHAVIORS.sponsors(ctx)?.wind ?? 0;
      } else if (u2 < 1) {
        // leg 2 waypoints: w0 sponsor-group scatter -> w1 left lane ->
        // w2 behind the heading -> w3 its bottom-right -> w4 card borders
        const h = rectW("vc-heading");
        const vcRects = [];
        for (let k2 = 0; k2 < 5; k2++) {
          const cr = rectW(`vc-card-${k2}`);
          if (cr && cr.w > 0.05) vcRects.push(cr);
        }
        for (let i = 0; i < dotN; i++) {
          const r = rands[i];
          const pi = clamp01(u2 * 1.35 - r * 0.35);
          const e = pi * pi * (3 - 2 * pi);
          let x0 = vw * 0.42;
          let y0 = vh * 1.2;
          if (g) {
            x0 = g.cx + (rands2[i] - 0.5) * (g.w + 1);
            y0 = g.cy + (rands3[i] - 0.5) * (g.h + 1);
          }
          let x2 = -vw * 0.2;
          let y2 = 0;
          let x3 = 0;
          let y3 = -vh * 0.2;
          if (h) {
            x2 = h.cx + (rands2[i] - 0.5) * h.w * 0.9;
            y2 = h.cy + (rands3[i] - 0.5) * h.h * 0.85;
            x3 = h.cx + h.w / 2 + 0.2 + (rands2[i] - 0.5) * 0.5;
            y3 = h.cy - h.h / 2 - 0.15 + (rands3[i] - 0.5) * 0.35;
          }
          const x1 = -vw * (0.38 + r * 0.07);
          const y1 = (y0 + y2) * 0.5;
          let tx;
          let ty;
          if (e < 0.3) {
            const s = e / 0.3;
            tx = x0 + (x1 - x0) * s;
            ty = y0 + (y1 - y0) * s;
          } else if (e < 0.55) {
            const s = (e - 0.3) / 0.25;
            tx = x1 + (x2 - x1) * s;
            ty = y1 + (y2 - y1) * s;
          } else if (e < 0.75) {
            const s = (e - 0.55) / 0.2;
            tx = x2 + (x3 - x2) * s;
            ty = y2 + (y3 - y2) * s;
          } else if (vcRects.length) {
            const s = (e - 0.75) / 0.25;
            bordersPoint(vcRects, rands2[i], rands3[i], 0.06, bOut);
            tx = x3 + (bOut[0] - x3) * s;
            ty = y3 + (bOut[1] - y3) * s;
          } else {
            tx = x3;
            ty = y3;
          }
          const w = Math.sin(e * Math.PI);
          claimK[i] = 12;
          claimT[i * 3] = tx;
          claimT[i * 3 + 1] = ty + Math.sin(pi * 5 + r * 12) * 0.25 * w;
          claimT[i * 3 + 2] = (rands3[i] - 0.5) * 0.8 * w;
        }
      } else if (u3 <= 0) {
        wind = BEHAVIORS.videocards(ctx)?.wind ?? 0;
        sweepStats(ctx, -0.1); // approaching from above: stats start unlit
      } else if (u3 < 1) {
        // leg 3 waypoints: w0 video card borders -> w1 right lane ->
        // w2 intro description -> w3 "What is Startathon?" heading ->
        // w4 the stats row sweep (tip-weighted tail, lights cells it passes)
        const dsc = rectW("intro-desc");
        const ttl = rectW("intro-title");
        const row = rectW("stats-row");
        const vcRects = [];
        for (let k2 = 0; k2 < 5; k2++) {
          const cr = rectW(`vc-card-${k2}`);
          if (cr && cr.w > 0.05) vcRects.push(cr);
        }
        const Wt = clamp01((u3 - 0.7) / 0.3);
        const W = Wt * Wt * (3 - 2 * Wt);
        const tipX = row ? sweepStats(ctx, W) : 0;
        for (let i = 0; i < dotN; i++) {
          const r = rands[i];
          const pi = clamp01(u3 * 1.35 - r * 0.35);
          const e = pi * pi * (3 - 2 * pi);
          let x0 = vw * 0.42;
          let y0 = vh * 1.2;
          if (vcRects.length) {
            bordersPoint(vcRects, rands2[i], rands3[i], 0.06, bOut);
            x0 = bOut[0];
            y0 = bOut[1];
          }
          let x2 = vw * 0.25;
          let y2 = 0;
          if (dsc) {
            x2 = dsc.cx + (rands2[i] - 0.5) * dsc.w * 0.9;
            y2 = dsc.cy + (rands3[i] - 0.5) * dsc.h * 0.85;
          }
          let x3 = -vw * 0.25;
          let y3 = -vh * 0.2;
          if (ttl) {
            x3 = ttl.cx + (rands2[i] - 0.5) * ttl.w * 0.9;
            y3 = ttl.cy + (rands3[i] - 0.5) * ttl.h * 0.85;
          }
          const x1 = vw * (0.38 + r * 0.07);
          const y1 = (y0 + y2) * 0.5;
          let tx;
          let ty;
          if (e < 0.25) {
            const s = e / 0.25;
            tx = x0 + (x1 - x0) * s;
            ty = y0 + (y1 - y0) * s;
          } else if (e < 0.5) {
            const s = (e - 0.25) / 0.25;
            tx = x1 + (x2 - x1) * s;
            ty = y1 + (y2 - y1) * s;
          } else if (e < 0.7) {
            const s = (e - 0.5) / 0.2;
            tx = x2 + (x3 - x2) * s;
            ty = y2 + (y3 - y2) * s;
          } else if (row) {
            const s = (e - 0.7) / 0.3;
            const q = rands2[i];
            const rx = Math.max(
              tipX - q * q * row.w * 0.38,
              row.cx - row.w / 2 - 0.2
            );
            const ry = row.cy + (rands3[i] - 0.5) * row.h * 0.12;
            tx = x3 + (rx - x3) * s;
            ty = y3 + (ry - y3) * s;
          } else {
            tx = x3;
            ty = y3;
          }
          const w = Math.sin(e * Math.PI);
          claimK[i] = 12;
          claimT[i * 3] = tx;
          claimT[i * 3 + 1] = ty + Math.sin(pi * 5 + r * 12) * 0.25 * w;
          claimT[i * 3 + 2] = (rands3[i] - 0.5) * 0.8 * w;
        }
      } else if (u4 <= 0) {
        wind = BEHAVIORS.stats(ctx)?.wind ?? 0;
      } else if (u4 < 1 && getHovered() !== "hook-apply") {
        // leg 4 waypoints: w0 the resting stats trail -> w1 right lane ->
        // w2 scattered across the headline block (matching the idle pose).
        // Hovering the Apply button overrides the scrub from the first
        // departing pixel — the swarm rushes straight to the button.
        const row = rectW("stats-row");
        const sec = rectW("hook-scatter");
        for (let i = 0; i < dotN; i++) {
          const r = rands[i];
          const pi = clamp01(u4 * 1.35 - r * 0.35);
          const e = pi * pi * (3 - 2 * pi);
          let x0 = vw * 0.3;
          let y0 = vh * 1.2;
          if (row) {
            const q = rands2[i];
            x0 = Math.max(
              row.cx + row.w / 2 - q * q * row.w * 0.5,
              row.cx - row.w / 2
            );
            y0 = row.cy + (rands3[i] - 0.5) * row.h * 0.6;
          }
          let x2 = vw * 0.3;
          let y2 = -vh * 0.2;
          if (sec) {
            x2 = sec.cx + (rands2[i] - 0.5) * sec.w;
            y2 = sec.cy + (rands3[i] - 0.5) * sec.h;
          }
          const x1 = vw * (0.38 + r * 0.07);
          const y1 = (y0 + y2) * 0.5;
          let tx;
          let ty;
          if (e < 0.45) {
            const s = e / 0.45;
            tx = x0 + (x1 - x0) * s;
            ty = y0 + (y1 - y0) * s;
          } else {
            const s = (e - 0.45) / 0.55;
            tx = x1 + (x2 - x1) * s;
            ty = y1 + (y2 - y1) * s;
          }
          const w = Math.sin(e * Math.PI);
          claimK[i] = 12;
          claimT[i * 3] = tx;
          claimT[i * 3 + 1] = ty + Math.sin(pi * 5 + r * 12) * 0.25 * w;
          claimT[i * 3 + 2] = (rands3[i] - 0.5) * 0.8 * w;
        }
      } else {
        wind = BEHAVIORS.studenthook(ctx)?.wind ?? 0;
      }
    }

    // ---- integrate ------------------------------------------------------
    // Letters live at the hero and simply seek their parked wordmark spots.
    // Dot-swarm particles additionally get the migration stream: on a
    // section handoff their targets pinch into a right-side lane with
    // capped travel speed, so the swarm pours down the right edge of the
    // page before fanning into the new section's pose.
    for (let i = 0; i < count; i++) {
      const r = rands[i];
      const r2 = rands2[i];
      const r3 = rands3[i];
      const i3 = i * 3;
      let x = cur[i3];
      let y = cur[i3 + 1];
      let z = cur[i3 + 2];
      const k = claimK[i];
      let settle = 1;
      let scTarget;
      if (k >= 90) {
        x = claimT[i3];
        y = claimT[i3 + 1];
        z = claimT[i3 + 2];
        settle = claimS[i];
        scTarget = 1;
      } else {
        let tx;
        let ty;
        let tz;
        let kk;
        if (k > 0) {
          tx = claimT[i3];
          ty = claimT[i3 + 1];
          tz = claimT[i3 + 2];
          kk = k;
          scTarget = 1;
        } else {
          // unclaimed dots wait in the right-side gutter, small and quiet
          tx = vw * (0.4 + 0.08 * r3) + Math.sin(t * (0.2 + r * 0.3) + r * 21) * 0.3;
          ty = (r2 - 0.5) * vh * 0.9 + Math.cos(t * (0.15 + r * 0.2) + r * 17) * 0.5;
          tz = (r3 - 0.5) * 1.5;
          kk = 1.1;
          scTarget = 0.6;
        }
        const a = 1 - Math.exp(-kk * dt);
        x += (tx - x) * a + wind * (0.5 + r) * dt;
        y += (ty - y) * a;
        z += (tz - z) * a;
      }
      const sc = scaleCur[i] + (scTarget - scaleCur[i]) * Math.min(1, dt * 2.2);
      scaleCur[i] = sc;
      cur[i3] = x;
      cur[i3 + 1] = y;
      cur[i3 + 2] = z;

      let spin = t * (0.3 + r * 0.7) + r * 10;

      // ambient breathing so settled silhouettes shimmer instead of freezing
      x += Math.sin(t * (0.7 + r * 0.9) + r * 40.0) * wobAmp * settle;
      y += Math.cos(t * (0.9 + r * 0.7) + r * 27.0) * wobAmp * settle;

      // cursor wake: spheres near the pointer get dragged along with its
      // motion, then spring back into place
      let ox = offsets[i * 2];
      let oy = offsets[i * 2 + 1];
      let vx = vels[i * 2];
      let vy = vels[i * 2 + 1];
      if (pointerActive && settle > 0.5) {
        const ddx = x + ox - px;
        const ddy = y + oy - py;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < wakeR) {
          const fall = 1 - dist / wakeR;
          const drag = fall * fall * 1.1 * dt;
          vx += pvx * drag;
          vy += pvy * drag;
        }
      }
      vx += -ox * 11 * dt;
      vy += -oy * 11 * dt;
      const dmp = 1 - Math.min(3.4 * dt, 0.85);
      vx *= dmp;
      vy *= dmp;
      ox += vx * dt;
      oy += vy * dt;
      offsets[i * 2] = ox;
      offsets[i * 2 + 1] = oy;
      vels[i * 2] = vx;
      vels[i * 2 + 1] = vy;
      x += ox;
      y += oy;
      spin += Math.sqrt(vx * vx + vy * vy) * 0.4;

      dummy.position.set(x, y, z);
      dummy.rotation.set(spin, spin * 0.8, 0);
      dummy.scale.setScalar(baseSize * (0.8 + r * 0.4) * sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // fade the whole system in over the first 1.2s, then drop transparency
    // entirely so the material renders in the cheaper opaque pass
    if (t < 1.5) {
      mesh.material.opacity = Math.min(t * 0.85, 1);
    } else if (mesh.material.transparent) {
      mesh.material.opacity = 1;
      mesh.material.transparent = false;
      mesh.material.needsUpdate = true;
    }
  });

  if (!built) return null;

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
        {/* 10x8 segments ≈ 60% fewer triangles; toon banding hides the
            low-poly silhouette at these sphere sizes */}
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshToonMaterial gradientMap={gradientMap} transparent opacity={0} />
      </instancedMesh>
    </group>
  );
}

export function canUseParticles() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

const GlobalParticles = ({ started = true }) => {
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 767px)").matches,
    []
  );

  // Adaptive resolution: start at full DPR, step down when the frame rate
  // sags and back up when it recovers.
  const maxDpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  const minDpr = isMobile ? 0.7 : 0.85;
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      <CanvasErrorBoundary fallback={null}>
        <Canvas
          flat
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          dpr={dpr}
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            // r3f re-enables pointer events on its container; without this
            // the canvas eats every hover/click on the page beneath it
            pointerEvents: "none",
          }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(minDpr)}
            onIncline={() => setDpr(maxDpr)}
            flipflops={3}
            onFallback={() => setDpr(minDpr)}
          />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 8]} intensity={1.3} />
          <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#C8FF00" />
          <ParticleEngine
            started={started}
            count={isMobile ? 1400 : 3200}
            isMobile={isMobile}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default GlobalParticles;
