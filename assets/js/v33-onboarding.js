/* Nexo V33 — flujo exacto de creación: bienvenida, nivel, preguntas y plan. */
(function(){
  const originalStart=window.NX && window.NX.start;
  if(!originalStart) return;
  let chosenLevel='r', timerIds=[];
  const clearTimers=()=>{timerIds.forEach(clearTimeout);timerIds=[];};
  const later=(fn,ms)=>timerIds.push(setTimeout(fn,ms));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function showSplash(){
    clearTimers();
    const old=document.getElementById('nx-v33-flow'); if(old)old.remove();
    const overlay=document.createElement('div');overlay.id='nx-v33-flow';overlay.className='nx-v33-overlay';
    overlay.innerHTML='<div class="nx-v33-splash"><div class="nx-v33-mark">N</div><div class="nx-v33-kicker">TU NEGOCIO, A TU MANERA</div><h1 id="nx-v33-title">Bienvenido a Nexo</h1><p id="nx-v33-sub">Preparando tu espacio de gestión…</p><div class="nx-v33-loader"><i></i></div></div>';
    document.body.appendChild(overlay);
    later(()=>{const title=document.getElementById('nx-v33-title'),sub=document.getElementById('nx-v33-sub');if(title)title.textContent='Donde creamos tu mejor espacio de gestión de negocios';if(sub)sub.textContent='Tu espacio de gestión, diseñado para tu negocio.';overlay.classList.add('message');},1600);
    later(()=>{renderLevels(overlay);},3400);
  }
  function renderLevels(overlay){
    overlay.classList.remove('message');overlay.classList.add('nx-v33-choose');
    overlay.innerHTML=`<div class="nx-v33-choice-wrap">
      <div class="nx-v33-brand"><span class="nx-v33-mark small">N</span><span>Nexo</span></div>
      <span class="nx-v33-kicker">VAMOS A DISEÑAR TU ESPACIO</span>
      <h1>¿Qué nivel de personalización necesitas?</h1>
      <p class="nx-v33-lead">Primero elegimos cuánto quieres configurar. Después te haremos preguntas sobre tu negocio, sucursales, operación y estilo visual.</p>
      <div class="nx-v33-levels">
        <button class="nx-v33-level" onclick="NXV33.pick('q')"><span class="nx-v33-level-icon">✦</span><span class="nx-v33-level-title">Básica</span><span class="nx-v33-level-desc">Lo esencial para empezar rápido, con una configuración sencilla.</span><span class="nx-v33-level-meta">Configuración rápida</span><b>Elegir básica →</b></button>
        <button class="nx-v33-level featured" onclick="NXV33.pick('r')"><span class="nx-v33-recommended">RECOMENDADA</span><span class="nx-v33-level-icon">◈</span><span class="nx-v33-level-title">Estándar</span><span class="nx-v33-level-desc">Preguntas adaptadas a tu giro, equipo, sucursales y procesos.</span><span class="nx-v33-level-meta">Equilibrio entre facilidad y control</span><b>Elegir estándar →</b></button>
        <button class="nx-v33-level nx-v33-ai" onclick="NXV33.pick('ai')"><span class="nx-v33-level-icon">✦</span><span class="nx-v33-level-title">Personalización con IA</span><span class="nx-v33-level-desc">Nexo te hará preguntas paso a paso y adaptará tu espacio a tu negocio y a la pantalla que estés usando.</span><span class="nx-v33-level-meta">Guía inteligente · Diseño adaptable</span><b>Configurar con IA →</b></button>
      </div><button class="nx-v33-cancel" onclick="NXV33.cancel()">Cancelar</button>
    </div>`;
  }
  window.NXV33={
    pick(level){
      chosenLevel=level==='ai'?'m':level;
      const overlay=document.getElementById('nx-v33-flow');if(overlay)overlay.remove();
      clearTimers();
      originalStart();
      const w=window.NX_T && window.NX_T.W();
      if(w){w.lv=chosenLevel;w.aiGuided=level==='ai';w.step='type';w.qi=0;}
      window.NX.go('type');
    },
    cancel(){clearTimers();const o=document.getElementById('nx-v33-flow');if(o)o.remove();},
  };
  window.NX.start=function(){showSplash();};
  // The wizard should be a single focused screen, not a two-column page with nested scrollbars.
  window.addEventListener('load',()=>{window.scrollTo(0,0);});
})();
