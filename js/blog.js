/* blog.js — fetch posts from GitHub, render markdown, handle post view */

(function () {
    
  const GITHUB_USER = 'SebaCape';
  const GITHUB_REPO = 'SebaCape.github.io'; 
  const INDEX_URL   = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/blog/index.json`;
  const RAW_BASE    = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/blog/`;

  /* ── DOM refs ── */
  const postList    = document.getElementById('post-list');
  const sidebarTags = document.getElementById('sidebar-tags');
  const setupNote   = document.getElementById('setup-note');
  const listView    = document.getElementById('list-view');
  const postView    = document.getElementById('post-view');
  const backBtn     = document.getElementById('back-btn');
  const postTitle   = document.getElementById('post-full-title');
  const postDate    = document.getElementById('post-full-date');
  const postContent = document.getElementById('post-full-content');

  let allPosts = [];

  /* ── MINIMAL MARKDOWN → HTML ── */
  function renderMd(md) {
    // strip frontmatter fences
    md = md.replace(/^---[\s\S]*?---\n?/, '');

    // fenced code blocks first (before inline code)
    md = md.replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // headings
    md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    md = md.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
    md = md.replace(/^# (.+)$/gm,   '<h2>$1</h2>');

    // inline
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.+?)\*/g,     '<em>$1</em>');
    md = md.replace(/`([^`]+)`/g,     '<code>$1</code>');

    // blockquote
    md = md.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // unordered list items
    md = md.replace(/(^- .+\n?)+/gm, match => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    });

    // links & images
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;margin:16px 0;">');
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2">$1</a>');

    // paragraphs — split on blank lines, skip block elements
    const blocks = md.split(/\n{2,}/);
    return blocks.map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|img)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
  }

  /* ── RENDER POST LIST ── */
  function renderList(posts) {
    if (!posts.length) {
      if (setupNote) setupNote.style.display = 'block';
      postList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-glyph">_</div>
          <h3>No posts yet.</h3>
          <p>Add <code>.md</code> files to <code>/blog</code> and a <code>/blog/index.json</code> manifest to start publishing.</p>
        </div>`;
      return;
    }

    /* build sidebar tags */
    const tagSet = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    if (sidebarTags) {
      sidebarTags.innerHTML = [...tagSet]
        .map(t => `<span class="sidebar-tag" data-tag="${t}">${t}</span>`)
        .join('');
      sidebarTags.querySelectorAll('.sidebar-tag').forEach(btn => {
        btn.addEventListener('click', () => {
          const active = btn.classList.toggle('active');
          const tag    = btn.dataset.tag;
          filterByTag(active ? tag : null);
          /* deactivate other tags */
          if (active) sidebarTags.querySelectorAll('.sidebar-tag').forEach(b => { if (b !== btn) b.classList.remove('active'); });
        });
      });
    }

    renderPostCards(posts);
  }

  function renderPostCards(posts) {
    postList.innerHTML = posts.map((p, i) => `
      <div class="post-item" style="transition-delay:${(i * 0.07).toFixed(2)}s" data-file="${p.file}">
        <div class="post-meta">
          <span class="post-date">${p.date}</span>
          ${(p.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('')}
        </div>
        <h2 class="post-title">${p.title}</h2>
        <p class="post-excerpt">${p.excerpt}</p>
        <span class="post-read">Read More →</span>
      </div>
    `).join('');

    /* scroll reveal */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    postList.querySelectorAll('.post-item').forEach(el => {
      io.observe(el);
      el.addEventListener('click', () => {
        const meta = allPosts.find(p => p.file === el.dataset.file);
        if (meta) openPost(meta);
      });
    });
  }

  function filterByTag(tag) {
    const filtered = tag ? allPosts.filter(p => (p.tags || []).includes(tag)) : allPosts;
    renderPostCards(filtered);
  }

  /* ── OPEN SINGLE POST ── */
  async function openPost(meta) {
    listView.classList.add('hidden');
    postView.classList.add('active');
    postTitle.textContent   = meta.title;
    postDate.textContent    = meta.date;
    postContent.innerHTML   = '<p style="color:var(--muted)">Loading…</p>';
    window.scrollTo({ top: 0 });

    try {
      const res = await fetch(RAW_BASE + meta.file);
      if (!res.ok) throw new Error('fetch failed');
      const md = await res.text();
      postContent.innerHTML = renderMd(md);
    } catch {
      postContent.innerHTML = '<p style="color:var(--muted)">Could not load post. Check that the file exists in your /blog folder.</p>';
    }
  }

  /* ── BACK BUTTON ── */
  if (backBtn) {
    backBtn.addEventListener('click', e => {
      e.preventDefault();
      postView.classList.remove('active');
      listView.classList.remove('hidden');
      window.scrollTo({ top: 0 });
    });
  }

  /* ── FETCH INDEX ── */
  async function init() {
    try {
      const res = await fetch(INDEX_URL);
      if (!res.ok) throw new Error('no index');
      allPosts = await res.json();
    } catch {
      allPosts = [];
    }
    renderList(allPosts);
  }

  init();

})();