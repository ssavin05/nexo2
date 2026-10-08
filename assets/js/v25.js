/* Nexo v25 — personalización visual por empresa */
(()=>{
  const applyBrand=()=>{
    const c=typeof currentCompany==='function'?currentCompany():null;
    const color=c?.brandColor||c?.appearance?.primary||'#2f6df6';
    document.documentElement.style.setProperty('--blue',color);
    document.documentElement.style.setProperty('--blue2',color);
    document.documentElement.style.setProperty('--nexo-brand',color);
    document.documentElement.dataset.nexoDensity=c?.appearance?.density||'comfortable';
  };
  const ra=renderApp;
  renderApp=function(){applyBrand();ra();applyBrand()};
  const oldPreview=window.NX?.fresh;
  if(window.NX){
    const oldStart=NX.start;
    NX.start=()=>{oldStart();};
  }
})();

/* v26.1 — navegación de planes realmente accesible y resistente a rebuilds del menú */
(()=>{
  const ensurePlansInNav=()=>{
    const emp=NAV.find(x=>x[0]==='Empresa');
    if(!emp)return;
    if(!emp[1].some(i=>i[0]==='plans')) emp[1].push(['plans','Planes y facturación','◈']);
  };
  const oldBuildNav=buildNav;
  buildNav=function(){
    oldBuildNav();
    ensurePlansInNav();
  };

  /* El selector de empresa abre un menú; dentro de ese menú dejamos una entrada
     inequívoca para cambiar de plan, sin depender del scroll lateral. */
  const oldCoMenu=coMenu;
  coMenu=function(){
    oldCoMenu();
    const menu=document.querySelector('.nx-co');
    if(menu && !menu.querySelector('.nx-plan-direct')){
      const b=document.createElement('button');
      b.className='nx-plan-direct';
      b.type='button';
      b.innerHTML='<strong>◈ Planes y facturación</strong><small>Cambiar Free, Plus, Pro o Max</small>';
      b.onclick=(e)=>{e.stopPropagation();ui.coMenu=false;go('plans')};
      menu.appendChild(b);
    }
    const switcher=document.querySelector('.company-switch');
    const planLabel=switcher?.querySelector('small');
    if(planLabel && !planLabel.dataset.planBound){
      planLabel.dataset.planBound='1';
      planLabel.style.cursor='pointer';
      planLabel.title='Abrir planes';
      planLabel.onclick=(e)=>{e.stopPropagation();ui.coMenu=false;go('plans')};
    }
  };

  /* Si el usuario entra a planes por cualquier botón, nunca lo redirigimos a Inicio. */
  const oldGo=window.go;
  if(typeof oldGo==='function'){
    window.go=function(route){
      if(route==='plans'){
        ui.route='plans';
        ui.command=false;ui.notifs=false;ui.modal=null;ui.coMenu=false;
        renderApp();
        return;
      }
      return oldGo(route);
    };
  }

  /* Atajo: el cuadro del plan actual abre directamente Planes con doble clic,
     y conserva el selector de empresa con un clic. */
  document.addEventListener('dblclick',e=>{
    const el=e.target.closest?.('.company-switch');
    if(el && currentCompany()){e.preventDefault();go('plans');}
  });
})();
