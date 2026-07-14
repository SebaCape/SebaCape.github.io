/* graph.js — retina-aware floating node graph for hero background */

(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NODE_COUNT   = 60;
  const MAX_DIST     = 170;
  const SPEED        = 0.32;
  const MAX_PULSES   = 10;
  const PULSE_CHANCE = 0.05;   // per-frame odds of firing a new pulse

  let W, H, dpr, nodes = [], pulses = [];

  /* ── sizing: account for device pixel ratio ── */
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W   = canvas.offsetWidth;
    H   = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);   // reset before rescale
    ctx.scale(dpr, dpr);
  }

  function makeNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  Math.random() * 2.5 + 2.5,
    };
  }

  function init() {
    resize();
    nodes  = Array.from({ length: NODE_COUNT }, makeNode);
    pulses = [];
  }

  /* endpoints of the segment connecting a's and b's perimeters, not their centers */
  function perimeterEdge(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    const ux = dx / d, uy = dy / d;
    return {
      ax: a.x + ux * a.r, ay: a.y + uy * a.r,
      bx: b.x - ux * b.r, by: b.y - uy * b.r,
      d,
    };
  }

  /* pick a random node pair currently within edge range and fire a pulse along it */
  function spawnPulse(edges) {
    if (!edges.length || pulses.length >= MAX_PULSES) return;
    const e = edges[(Math.random() * edges.length) | 0];
    pulses.push({ i: e.i, j: e.j, t: 0, speed: 0.015 + Math.random() * 0.02 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* draw edges between existing nodes, collecting them for pulse spawning */
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const { ax, ay, bx, by, d } = perimeterEdge(nodes[i], nodes[j]);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.40;
          edges.push({ i, j, alpha });
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    /* hollow nodes — lecture-hall "O" style */
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      /* update position */
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    /* fire off new energy pulses, but only along edges strong enough to actually see (alpha >= 0.20) */
    if (Math.random() < PULSE_CHANCE) {
      spawnPulse(edges.filter(e => e.alpha >= 0.20));
    }

    /* update + draw traveling energy pulses as short jolts of light */
    pulses = pulses.filter(p => {
      const { ax, ay, bx, by, d } = perimeterEdge(nodes[p.i], nodes[p.j]);
      if (d > MAX_DIST * 1.2) return false; // edge broke

      p.t += p.speed;
      if (p.t >= 1) return false;

      const tailT = Math.max(0, p.t - 0.15);
      const hx = ax + (bx - ax) * p.t;
      const hy = ay + (by - ay) * p.t;
      const tx = ax + (bx - ax) * tailT;
      const ty = ay + (by - ay) * tailT;

      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, 'rgba(160, 210, 255, 0)');
      grad.addColorStop(1, 'rgba(200, 230, 255, 0.95)');

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.8;
      ctx.shadowColor = 'rgba(160, 210, 255, 0.9)';
      ctx.shadowBlur  = 8;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      return true;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    /* redistribute nodes so they stay in bounds after resize */
    nodes.forEach(n => {
      n.x = Math.min(n.x, W);
      n.y = Math.min(n.y, H);
    });
  });

  init();
  draw();
})();