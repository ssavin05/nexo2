/* Nexo v24 — Navegación sin recargas + animaciones
 *
 * 1) El prototipo reconstruía todo #app con innerHTML en cada clic (parpadeo, scroll perdido,
 *    foco perdido). Aquí se intercepta esa asignación y, en lugar de reemplazar, se "morfea"
 *    el DOM: solo cambian los nodos que realmente cambiaron.
 * 2) Se añaden animaciones: entrada de vistas, escalonado de tarjetas/filas, contadores,
 *    gráficas, scroll-reveal en la landing, salida de modales/paneles, ripple en botones.
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  var app = document.getElementById('app');
  if (!app) return;

  /* ---------- utilidades de animación ---------- */
  function anim(el, frames, opts) {
    if (REDUCED || !el || !el.animate) return null;
    try { return el.animate(frames, Object.assign({ duration: 420, easing: EASE, fill: 'backwards' }, opts)); }
    catch (e) { return null; }
  }
  function fadeUp(el, delay, dist, dur) {
    return anim(el, [{ opacity: 0, transform: 'translateY(' + (dist == null ? 14 : dist) + 'px)' }, { opacity: 1, transform: 'none' }], { delay: delay || 0, duration: dur || 420 });
  }

  /* ---------- morph del DOM ---------- */
  var LEAVE_SEL = '.modal-back,.drawer-back,.command-back,.toast';
  var NO_ENTER_SEL = '.modal-back,.drawer-back,.command-back,.toast,.mobile-backdrop';
  var inserted = [];

  function isLeaving(n) { return n.nodeType === 1 && n._nxLeaving; }
  function liveChildren(p) { return Array.prototype.filter.call(p.childNodes, function (n) { return !isLeaving(n); }); }

  function syncAttrs(o, n) {
    var i, a;
    for (i = o.attributes.length - 1; i >= 0; i--) {
      a = o.attributes[i];
      if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
    }
    for (i = 0; i < n.attributes.length; i++) {
      a = n.attributes[i];
      if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
    }
  }

  function syncFormState(o, n) {
    var tag = o.nodeName;
    if (tag === 'INPUT') {
      if (o.type === 'checkbox' || o.type === 'radio') o.checked = n.hasAttribute('checked');
      else if (o !== document.activeElement) { var v = n.getAttribute('value'); o.value = v == null ? '' : v; }
    } else if (tag === 'TEXTAREA') {
      if (o !== document.activeElement) o.value = n.textContent;
    } else if (tag === 'SELECT') {
      var idx = 0, opts = n.options || n.querySelectorAll('option');
      for (var k = 0; k < opts.length; k++) if (opts[k].hasAttribute('selected')) { idx = k; break; }
      if (o !== document.activeElement) o.selectedIndex = idx;
    }
  }

  function leave(el) {
    el._nxLeaving = true;
    el.style.pointerEvents = 'none';
    var panel = el.firstElementChild;
    var a = anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    if (panel) anim(panel, [{ transform: 'none' }, { transform: 'translateY(8px) scale(.98)' }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    if (a) a.onfinish = function () { el.remove(); };
    else el.remove();
  }

  function morphChildren(oldP, newP) {
    var oc = liveChildren(oldP), nc = Array.prototype.slice.call(newP.childNodes);
    var i, o, n, len = Math.max(oc.length, nc.length);
    for (i = 0; i < len; i++) {
      o = oc[i]; n = nc[i];
      if (!n) { // sobra en el DOM viejo
        if (o.nodeType === 1 && o.matches(LEAVE_SEL)) leave(o); else oldP.removeChild(o);
        continue;
      }
      if (!o) { // falta en el DOM viejo
        oldP.appendChild(n);
        if (n.nodeType === 1) inserted.push(n);
        continue;
      }
      if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) {
        oldP.replaceChild(n, o);
        if (n.nodeType === 1) inserted.push(n);
        continue;
      }
      if (o.nodeType === 3 || o.nodeType === 8) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; continue; }
      morphEl(o, n);
    }
  }

  function morphEl(o, n) {
    syncAttrs(o, n);
    if (o.nodeName === 'TEXTAREA') { syncFormState(o, n); return; }
    morphChildren(o, n);
    syncFormState(o, n);
  }

  /* ---------- animaciones de vista ---------- */
  var lastKey = null;

  function viewKey() {
    if (app.querySelector(':scope > .shell')) return 'app:' + (window.ui && ui.route);
    var nx = app.querySelector('.nx-main');
    if (nx) { var h = nx.querySelector('h1,h2'); return 'nx:' + (h ? h.textContent : ''); }
    return 'pub:' + location.hash;
  }

  function countUp(el) {
    if (REDUCED || el._nxCounted) return;
    var node = null, i;
    for (i = 0; i < el.childNodes.length; i++) if (el.childNodes[i].nodeType === 3 && /\d/.test(el.childNodes[i].nodeValue)) { node = el.childNodes[i]; break; }
    if (!node) return;
    var txt = node.nodeValue, m = txt.match(/-?\d[\d,]*\.?\d*/);
    if (!m) return;
    var raw = m[0], num = parseFloat(raw.replace(/,/g, ''));
    if (!isFinite(num) || num === 0) return;
    var dec = (raw.split('.')[1] || '').length, thousands = raw.indexOf(',') > -1;
    var pre = txt.slice(0, m.index), post = txt.slice(m.index + raw.length);
    var start = performance.now(), dur = 900;
    el._nxCounted = true;
    (function tick(now) {
      if (!node.parentNode) return;
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3), v = num * e;
      var s = v.toFixed(dec);
      if (thousands) { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
      node.nodeValue = p >= 1 ? txt : pre + s + post;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  function decorate(root, base) {
    // Contadores
    root.querySelectorAll('.kpi strong,.mock-kpis strong,.summary-strip strong,.detail-kpis strong,.finance-kpis strong').forEach(function (el) { el._nxCounted = false; countUp(el); });
    // Barras de progreso
    root.querySelectorAll('.progress i').forEach(function (el, i) {
      anim(el, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { delay: base + 150 + i * 40, duration: 800 }); el.style.transformOrigin = 'left';
    });
    // Gráfica de línea: barrido de izquierda a derecha
    root.querySelectorAll('.line-chart svg').forEach(function (el) {
      anim(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { delay: base + 150, duration: 1100, easing: 'cubic-bezier(.3,.7,.2,1)' });
    });
    // Barras (mockup de la landing)
    root.querySelectorAll('.mock-chart > span').forEach(function (el, i) {
      el.style.transformOrigin = 'bottom';
      anim(el, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { delay: base + 250 + i * 70, duration: 700 });
    });
    // Donut
    root.querySelectorAll('.donut').forEach(function (el) {
      anim(el, [{ transform: 'rotate(-90deg) scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { delay: base + 150, duration: 800 });
    });
  }

  function enterApp(shell) {
    var page = shell.querySelector('.page');
    if (!page) return;
    var t = 0, kids = Array.prototype.slice.call(page.children);
    kids.forEach(function (k, i) {
      var d = i * 60;
      fadeUp(k, d, 16, 480);
      // escalonar elementos dentro de rejillas
      var grid = k.matches('[class*="grid"],[class*="kpis"],[class*="cards"],.summary-strip,.kanban,.timeline') ? k : k.querySelector('[class*="grid"],[class*="kpis"],.kanban');
      if (grid && grid.children.length > 1 && grid.children.length < 24) {
        Array.prototype.forEach.call(grid.children, function (c, j) { fadeUp(c, d + 80 + j * 55, 14, 450); });
      }
      t = d;
    });
    page.querySelectorAll('tbody tr').forEach(function (tr, i) {
      if (i < 14) anim(tr, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { delay: 140 + i * 32, duration: 380 });
    });
    decorate(page, 60);
    var head = shell.querySelector('.appbar');
    if (head && !shell._nxHeadDone) { shell._nxHeadDone = true; anim(head, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420 }); }
  }

  function enterPublic(root) {
    var hero = root.querySelector('.hero-copy');
    if (hero) Array.prototype.forEach.call(hero.children, function (c, i) { fadeUp(c, 80 + i * 90, 18, 600); });
    var nav = root.querySelector('.landing-nav');
    if (nav) anim(nav, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
    var mk = root.querySelector('.hero-product');
    if (mk) {
      var parts = mk.querySelectorAll('.mock-top,.mock-kpis > div,.mock-row');
      parts.forEach(function (p, i) { fadeUp(p, 300 + i * 90, 12, 500); });
      decorate(mk, 200);
    }
    // Scroll-reveal de secciones inferiores
    var targets = root.querySelectorAll('.landing-features .section-head,.feature-grid article');
    if (!REDUCED && 'IntersectionObserver' in window && targets.length) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          var el = e.target, idx = Array.prototype.indexOf.call(el.parentNode.children, el);
          var a = anim(el, [{ opacity: 0, transform: 'translateY(28px) scale(.97)' }, { opacity: 1, transform: 'none' }], { delay: (idx % 3) * 90, duration: 650 });
          el.style.opacity = '';
        });
      }, { threshold: .18 });
      targets.forEach(function (el) { el.style.opacity = '0'; io.observe(el); });
    }
  }

  function enterWizard(root) {
    var main = root.querySelector('.nx-main');
    if (!main) return;
    Array.prototype.forEach.call(main.children, function (c, i) { fadeUp(c, i * 50, 14, 420); });
    var bar = root.querySelector('.nx-bar i');
    if (bar) { /* la barra ya transiciona por CSS al cambiar el width inline */ }
  }

  function enterAuth(root) {
    var side = root.querySelector('.auth-side');
    if (side) anim(side, [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 600 });
    var card = root.querySelector('.auth-card');
    if (card) Array.prototype.forEach.call(card.children, function (c, i) { fadeUp(c, 120 + i * 60, 12, 450); });
  }

  /* ---------- reemplazo de innerHTML en #app ---------- */
  var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

  function rootKind(el) {
    if (!el) return null;
    if (el.classList.contains('shell')) return 'shell';
    if (el.classList.contains('nx')) return 'nx';
    return null;
  }

  function setApp(html) {
    var prevScrollTop = window.scrollY;
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var newRoot = tpl.content.firstElementChild, oldRoot = app.firstElementChild;
    var kind = rootKind(newRoot);
    var canMorph = kind && oldRoot && rootKind(oldRoot) === kind && app.children.length === 1 && tpl.content.children.length === 1;
    inserted = [];

    var sc = [];
    if (canMorph) {
      // conservar scroll de contenedores internos
      app.querySelectorAll('.sidebar,.sidebar nav,.main,.page,.drawer,.modal,.command,#commandResults').forEach(function (el) { sc.push([el, el.scrollTop, el.scrollLeft]); });
      var active = document.activeElement, selS, selE;
      try { selS = active && active.selectionStart; selE = active && active.selectionEnd; } catch (e) {}
      morphEl(oldRoot, newRoot);
      sc.forEach(function (r) { if (r[0].isConnected) { r[0].scrollTop = r[1]; r[0].scrollLeft = r[2]; } });
      if (active && active.isConnected && document.activeElement !== active) { try { active.focus({ preventScroll: true }); if (selS != null) active.setSelectionRange(selS, selE); } catch (e) {} }
      window.scrollTo(0, prevScrollTop);
      // autofocus en nodos nuevos (p. ej. buscador Ctrl+K)
      inserted.forEach(function (n) { var f = n.matches('[autofocus]') ? n : n.querySelector('[autofocus]'); if (f) try { f.focus(); } catch (e) {} });
      // animar nodos nuevos que no son overlays (filas nuevas, tarjetas nuevas…)
      inserted.forEach(function (n) {
        if (n.matches(NO_ENTER_SEL) || n.closest(NO_ENTER_SEL) || n.nodeName === 'OPTION') return;
        fadeUp(n, 0, 10, 380);
      });
    } else {
      desc.set.call(app, '');
      while (tpl.content.firstChild) app.appendChild(tpl.content.firstChild);
      window.scrollTo(0, 0);
    }

    var key = viewKey(), changed = key !== lastKey;
    if (changed) {
      lastKey = key;
      var shell = app.querySelector(':scope > .shell');
      if (shell) {
        if (!canMorph) shell._nxHeadDone = false;
        enterApp(shell);
        var m = shell.querySelector('.main'); if (m) m.scrollTop = 0;
        window.scrollTo(0, 0);
      } else if (app.querySelector('.landing')) enterPublic(app);
      else if (app.querySelector('.nx')) enterWizard(app);
      else if (app.querySelector('.auth')) enterAuth(app);
    }
  }

  Object.defineProperty(app, 'innerHTML', {
    configurable: true,
    get: function () { return desc.get.call(app); },
    set: function (v) { setApp(String(v)); }
  });

  /* ---------- red de seguridad: ningún <form> recarga la página ---------- */
  document.addEventListener('submit', function (e) { if (!e.defaultPrevented) e.preventDefault(); });

  /* ---------- enlaces con href="#" o vacíos no deben saltar/recargar ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a && (a.getAttribute('href') === '#' || a.getAttribute('href') === '')) e.preventDefault();
  });

  /* ---------- ripple en botones ---------- */
  document.addEventListener('pointerdown', function (e) {
    if (REDUCED) return;
    var b = e.target.closest && e.target.closest('.btn,.icon-btn,.nav-item,.demo-link');
    if (!b || b.disabled) return;
    var r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'nx-ripple';
    s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
    b.appendChild(s);
    var a = anim(s, [{ transform: 'scale(0)', opacity: .35 }, { transform: 'scale(1)', opacity: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
    if (a) a.onfinish = function () { s.remove(); }; else s.remove();
  }, { passive: true });

  /* ---------- cambio de tema suave ---------- */
  var themeTimer;
  new MutationObserver(function () {
    document.documentElement.classList.add('nx-theme-anim');
    clearTimeout(themeTimer);
    themeTimer = setTimeout(function () { document.documentElement.classList.remove('nx-theme-anim'); }, 450);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- render inicial ya con el interceptor activo ---------- */
  // Los scripts anteriores ya hicieron el primer render con innerHTML directo; lo repetimos
  // para que la entrada inicial tenga animaciones (no hay estado que perder todavía).
  try { if (typeof render === 'function') render(); } catch (e) { /* noop */ }
})();
