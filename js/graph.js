/* graph.js — retina-aware floating node graph for hero background */

(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NODE_COUNT = 60;
  const MAX_DIST   = 170;
  const SPEED      = 0.32;

  let W, H, dpr, nodes = [];

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
      r:  Math.random() * 1.5 + 0.8,   
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* draw edges between existing nodes */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.20;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    /* nodes */
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();

      /* update position */
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
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