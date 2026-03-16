/* typer.js — typewriter cycling effect for hero role line */

(function () {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const ROLES = [
    'Software Engineer',
    'Research Scientist',
    'Systems Programmer',
    'Mathematician',
    'OSS Contributor',
    'Game Developer',
  ];

  const TYPE_MS   = 75;
  const DELETE_MS = 38;
  const PAUSE_MS  = 1900;
  const START_DELAY = 1400;

  let roleIdx  = 0;
  let charIdx  = 0;
  let deleting = false;

  function tick() {
    const current = ROLES[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_MS);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % ROLES.length;
      }
    }

    setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
  }

  setTimeout(tick, START_DELAY);
})();