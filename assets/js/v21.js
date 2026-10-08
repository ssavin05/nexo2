/* Nexo v21 — personalización automática completa, 100% en memoria */
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const yn=v=>String(v)==='yes'||String(v)==='true'||String(v)==='on';
  const vals=n=>qa(`[name="${n}"]:checked`).map(x=>x.value);
  const PALETTES={
    nexo:{name:'Nexo Azul',primary:'#2F6DF6',accent:'#0EA5A4',nav:'#0C1728',bg:'#F4F7FB'},
    oceano:{name:'Océano',primary:'#1261A0',accent:'#10B3A3',nav:'#08223B',bg:'#F3F8FC'},
    grafito:{name:'Grafito',primary:'#334155',accent:'#0EA5A4',nav:'#111827',bg:'#F6F7F9'},
    violeta:{name:'Violeta',primary:'#6D5CE7',accent:'#14B8A6',nav:'#17152B',bg:'#F7F6FC'},
    esmeralda:{name:'Esmeralda',primary:'#0F8A72',accent:'#2563EB',nav:'#0A2623',bg:'#F3F8F7'},
    vino:{name:'Vino',primary:'#9B3654',accent:'#C78B3B',nav:'#2B1420',bg:'#FAF6F7'},
    naranja:{name:'Energía',primary:'#EA6A2A',accent:'#2563EB',nav:'#24160F',bg:'#FBF7F4'},
    personalizado:{name:'Personalizado',primary:'#2F6DF6',accent:'#0EA5A4',nav:'#0C1728',bg:'#F4F7FB'}
  };
  const INDUSTRY_PRESETS={
    'Comercio':{offering:'products',inventory:'yes',purchasing:'yes',credit:'no',supplierCredit:'yes',sales:['pos'],priorities:['sales','inventory','finance']},
    'Distribución':{offering:'products',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['sales','inventory','finance','reports']},
    'Servicios':{offering:'services',inventory:'no',purchasing:'no',credit:'yes',supplierCredit:'no',sales:['quotes','online'],priorities:['sales','finance','team']},
    'Profesional':{offering:'services',inventory:'no',purchasing:'no',credit:'yes',supplierCredit:'no',sales:['quotes'],priorities:['sales','finance','reports']},
    'Manufactura':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['inventory','finance','reports']},
    'Restaurante / alimentos':{offering:'products',inventory:'yes',purchasing:'yes',credit:'no',supplierCredit:'yes',sales:['pos'],priorities:['sales','inventory','finance']},
    'Salud / bienestar':{offering:'services',inventory:'no',purchasing:'yes',credit:'yes',supplierCredit:'no',sales:['quotes','pos'],priorities:['sales','finance','team']},
    'Construcción':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['quotes','online'],priorities:['finance','inventory','reports']},
    'Otro':{offering:'both',inventory:'yes',purchasing:'yes',credit:'yes',supplierCredit:'yes',sales:['pos','quotes'],priorities:['sales','finance','reports']}
  };

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function hexToRgb(hex){let h=String(hex||'').replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');if(!/^[0-9a-f]{6}$/i.test(h))return null;return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}}
  function mix(hex,other='#ffffff',amt=.15){const a=hexToRgb(hex),b=hexToRgb(other);if(!a||!b)return hex;const v=k=>Math.round(a[k]+(b[k]-a[k])*clamp(amt,0,1)).toString(16).padStart(2,'0');return `#${v('r')}${v('g')}${v('b')}`}
  function contrastText(hex){const c=hexToRgb(hex);if(!c)return '#ffffff';const lum=(.299*c.r+.587*c.g+.114*c.b)/255;return lum>.62?'#0B1220':'#ffffff'}
  function selectedPalette(form){const key=form.elements.palette?.value||'nexo';const base={...(PALETTES[key]||PALETTES.nexo)};return {...base,key}}
  function applyBrand(brand){if(!brand)return;const root=document.documentElement;const primary=brand.primary||'#2F6DF6',accent=brand.accent||'#0EA5A4',nav=brand.nav||'#0C1728',bg=brand.bg||'#F4F7FB';root.style.setProperty('--blue',primary);root.style.setProperty('--blue2',mix(primary,'#000000',.14));root.style.setProperty('--teal',accent);root.style.setProperty('--nav',nav);root.style.setProperty('--nav2',mix(nav,'#ffffff',.08));root.style.setProperty('--bg',bg);root.style.setProperty('--brand-on-primary',contrastText(primary));root.dataset.visual=brand.style||'modern';document.body?.classList.toggle('premium-look',brand.style==='premium');document.body?.classList.toggle('minimal-look',brand.style==='minimal');document.body?.classList.toggle('tech-look',brand.style==='tech')}
  window.applyNexoBrand=applyBrand;

  function modulePlan(form){
    const f=new FormData(form), offering=f.get('offering')||'both', sales=vals('salesMode'), priorities=vals('priority');
    const mods=Object.fromEntries(PERMISSIONS.map(p=>[p,false]));
    const on=(...xs)=>xs.forEach(x=>mods[x]=true);
    on('dashboard','settings','modules','security','audit','users','roles','branches','tasks','documents','reports','customers');
    if(offering==='products'||offering==='both')on('products','inventory','warehouses','stockmoves','returns');
    if(offering==='services'||offering==='both')on('products','quotes','orders');
    if(sales.includes('pos'))on('sales','cashclose');
    if(sales.includes('quotes'))on('quotes','orders');
    if(sales.includes('online'))on('orders','sales');
    if(yn(f.get('inventoryControl')))on('inventory','warehouses','stockmoves','returns');
    if(yn(f.get('purchasing')))on('purchases','suppliers','payables');
    if(yn(f.get('creditSales')))on('receivables','finance');
    if(yn(f.get('supplierCredit')))on('payables','finance','purchases','suppliers');
    if(yn(f.get('expenses')))on('finance','cashclose');
    if(yn(f.get('multiBranch')))on('branches','warehouses','transfers');
    if(yn(f.get('teamManagement')))on('users','roles','tasks');
    if(yn(f.get('approvals')))on('approvals');
    priorities.forEach(x=>({sales:['sales','quotes','orders','customers'],inventory:['inventory','warehouses','stockmoves','purchases','suppliers'],finance:['finance','receivables','payables','cashclose'],team:['users','roles','tasks','approvals'],reports:['reports']}[x]||[]).forEach(m=>mods[m]=true));
    return mods;
  }
  function dashboardPreset(form){const f=new FormData(form),p=vals('priority');if(p[0]==='inventory')return 'operations';if(p[0]==='finance')return 'finance';if(p[0]==='team')return 'team';if(p[0]==='reports')return 'analytics';return 'commercial'}
  function suggestedPlan(form){const f=new FormData(form),team=f.get('teamSize'),multi=yn(f.get('multiBranch')),approvals=yn(f.get('approvals')),modules=Object.values(modulePlan(form)).filter(Boolean).length;if(team==='enterprise'||multi&&approvals)return 'Max';if(team==='large'||multi||modules>18)return 'Pro';if(team==='medium'||modules>12)return 'Plus';return 'Free'}
  function suggestedRoles(form){const f=new FormData(form),mods=modulePlan(form);const roles=[{name:'Propietario',permissions:[...PERMISSIONS],system:true},{name:'Administrador',permissions:[...PERMISSIONS].filter(x=>x!=='plans'),system:true}];if(mods.sales)roles.push({name:'Ventas',permissions:['dashboard','sales','quotes','orders','customers','tasks'].filter(x=>mods[x]),system:true});if(mods.inventory)roles.push({name:'Inventario',permissions:['dashboard','products','inventory','warehouses','stockmoves','purchases','suppliers','transfers','returns','tasks'].filter(x=>mods[x]),system:true});if(mods.finance)roles.push({name:'Finanzas',permissions:['dashboard','finance','receivables','payables','cashclose','reports','tasks'].filter(x=>mods[x]),system:true});return roles}
  function branchCount(form){const f=new FormData(form);if(!yn(f.get('multiBranch')))return 1;return Math.max(2,+f.get('branchCount')||2)}
  function warehouseCount(form){const f=new FormData(form);if(!yn(f.get('inventoryControl')))return 0;return Math.max(1,+f.get('warehouseCount')||1)}

  function applyIndustryPreset(form,industry){const p=INDUSTRY_PRESETS[industry]||INDUSTRY_PRESETS.Otro;const radio=form.querySelector(`[name="offering"][value="${p.offering}"]`);if(radio)radio.checked=true;['inventoryControl','purchasing','creditSales','supplierCredit'].forEach(k=>{if(form.elements[k])form.elements[k].value={inventoryControl:p.inventory,purchasing:p.purchasing,creditSales:p.credit,supplierCredit:p.supplierCredit}[k]});qa('[name="salesMode"]',form).forEach(x=>x.checked=p.sales.includes(x.value));qa('[name="priority"]',form).forEach(x=>x.checked=p.priorities.includes(x.value));refreshAuto()}

  function previewBrand(){const form=q('#registerForm');if(!form)return;const b=selectedPalette(form),preview=q('#brandPreview');if(preview){preview.style.setProperty('--preview-primary',b.primary);preview.style.setProperty('--preview-accent',b.accent);preview.style.setProperty('--preview-nav',b.nav);preview.style.setProperty('--preview-bg',b.bg);preview.dataset.style=form.elements.visualStyle?.value||'modern'}qa('.palette-card',form).forEach(x=>x.classList.toggle('active',x.dataset.palette===b.key))}
  function refreshAuto(){const form=q('#registerForm');if(!form)return;const mods=modulePlan(form),labels=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],x[1]])),active=Object.keys(mods).filter(k=>mods[k]&&labels[k]&&!['dashboard','settings'].includes(k)),plan=suggestedPlan(form),preset=dashboardPreset(form),branches=branchCount(form),warehouses=warehouseCount(form);const el=q('#autoModuleList');if(el)el.innerHTML=active.slice(0,14).map(k=>`<span>${labels[k]}</span>`).join('')+(active.length>14?`<span>+${active.length-14} más</span>`:'');const p=q('#autoPlan');if(p)p.textContent=plan;const d=q('#autoDashboard');if(d)d.textContent={commercial:'Comercial',operations:'Operaciones',finance:'Finanzas',team:'Equipo',analytics:'Analítico'}[preset];const br=q('#autoBranches');if(br)br.textContent=`${branches} ${branches===1?'sucursal':'sucursales'}`;const wh=q('#autoWarehouses');if(wh)wh.textContent=warehouses?`${warehouses} ${warehouses===1?'almacén':'almacenes'}`:'Sin almacén';previewBrand()}

  renderRegister=function(){
    authShell('Crear empresa','Primero cuéntale a Nexo cómo funciona tu negocio. Después, Nexo prepara la estructura por ti.',`
      <form id="registerForm" class="form onboarding-form personalized-onboarding pro-onboarding">
        <div class="onboarding-head">
          <div><span class="auto-badge">✦ NEXO SE ADAPTA A TU NEGOCIO</span><p>Configuración inteligente · Puedes cambiarlo todo después</p></div>
          <span class="onboarding-save">Se guarda en tu empresa</span>
        </div>
        <div class="onboarding-progress onboarding-progress-5"><i class="active"></i><i></i><i></i><i></i><i></i></div>

        <section class="onboarding-step active" data-step="1">
          <span class="step-label">PASO 1 DE 5</span><h3>Empecemos por ti</h3><p class="step-copy">Estos datos crean tu acceso como propietario. La personalización empieza en el siguiente paso.</p>
          <div class="account-compact">
            <label>Nombre completo<input name="name" required autocomplete="name" placeholder="Nombre y apellido"></label>
            <label>Correo<input name="email" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></label>
            <div class="two"><label>Contraseña<input name="password" type="password" minlength="6" required></label><label>Confirmar contraseña<input name="confirm" type="password" minlength="6" required></label></div>
          </div>
          <div class="step-tip"><span>✓</span><div><strong>Solo te lo pedimos una vez.</strong><small>Después podrás crear otras empresas desde Nexo sin repetir este proceso.</small></div></div>
          <div class="step-actions single"><button type="button" class="btn primary" onclick="v25Step(2)">Personalizar mi empresa →</button></div>
        </section>

        <section class="onboarding-step" data-step="2">
          <span class="step-label">PASO 2 DE 5</span><h3>Cuéntale a Nexo qué haces</h3><p class="step-copy">No necesitas conocer los módulos. Elige la opción que más se parezca a tu negocio y Nexo hará el resto.</p>
          <label>Nombre comercial<input name="company" required placeholder="Ej. Distribuidora Horizonte"></label>
          <input type="hidden" name="industry" value="Comercio">
          <div class="question-card business-type-card"><div class="question-head"><strong>¿Qué tipo de negocio tienes?</strong><small>Esto cambia las recomendaciones, el menú y el dashboard.</small></div><div class="industry-grid">${Object.entries(INDUSTRY_PRESETS).filter(([k])=>k!=='Otro').map(([k],i)=>`<button type="button" class="industry-choice ${i===0?'active':''}" data-industry="${k}" onclick="v25Industry('${k.replace(/'/g,"\\'")}')"><span class="industry-icon">${{'Comercio':'▦','Distribución':'⇄','Servicios':'◌','Profesional':'⌂','Manufactura':'◈','Restaurante / alimentos':'◍','Salud / bienestar':'＋','Construcción':'⌂'}[k]||'•'}</span><b>${k}</b><small>${{Comercio:'Tienda y venta de productos',Distribución:'Mayoreo y reparto',Servicios:'Servicios y proyectos',Profesional:'Consultoría y trabajo especializado',Manufactura:'Producción y transformación', 'Restaurante / alimentos':'Consumo y venta de alimentos','Salud / bienestar':'Consultorios y atención','Construcción':'Obra, materiales y proyectos'}[k]||''}</small></button>`).join('')}<button type="button" class="industry-choice" data-industry="Otro" onclick="v25Industry('Otro')"><span class="industry-icon">＋</span><b>Otro</b><small>Quiero que Nexo se adapte a mi caso</small></button></div></div>
          <div class="question-card"><strong>¿Qué ofreces principalmente?</strong><div class="choice-grid three"><label><input type="radio" name="offering" value="products" checked><span><b>Productos</b><small>Inventario, compras y proveedores</small></span></label><label><input type="radio" name="offering" value="services"><span><b>Servicios</b><small>Clientes, cotizaciones y seguimiento</small></span></label><label><input type="radio" name="offering" value="both"><span><b>Ambos</b><small>Operación combinada</small></span></label></div></div>
          <div class="micro-note"><span>✦</span><small>Nexo usará estas respuestas como punto de partida; no te encierra en una configuración.</small></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v25Step(1)">← Atrás</button><button type="button" class="btn primary" onclick="v25Step(3)">Continuar →</button></div>
        </section>

        <section class="onboarding-step" data-step="3">
          <span class="step-label">PASO 3 DE 5</span><h3>Así trabaja tu empresa</h3><p class="step-copy">Marca solo lo que aplica. Nexo activará las áreas necesarias y dejará fuera lo que no necesitas.</p>
          <div class="question-card"><div class="question-head"><strong>¿Cómo venden?</strong><small>Puedes elegir más de una.</small></div><div class="choice-grid sales-choice-grid"><label><input type="checkbox" name="salesMode" value="pos" checked><span><b>Venta directa</b><small>Mostrador, caja o venta inmediata</small></span></label><label><input type="checkbox" name="salesMode" value="quotes"><span><b>Cotizaciones</b><small>Propuestas antes de cerrar</small></span></label><label><input type="checkbox" name="salesMode" value="online"><span><b>Pedidos</b><small>Orden antes de entregar o cobrar</small></span></label></div></div>
          <div class="smart-settings-grid">${[['inventoryControl','Control de inventario','Existencias, mínimos y almacenes'],['purchasing','Compras a proveedores','Compras, recepción y proveedores'],['creditSales','Ventas a crédito','Cuentas por cobrar'],['supplierCredit','Compras a crédito','Cuentas por pagar']].map(([n,t,s])=>`<label class="smart-toggle"><div><strong>${t}</strong><small>${s}</small></div><select name="${n}"><option value="yes">Sí</option><option value="no">No</option></select></label>`).join('')}</div>
          <div class="advanced-disclosure"><button type="button" class="advanced-toggle" onclick="this.parentElement.classList.toggle('open')"><span>Más opciones</span><small>Equipo, autorizaciones, gastos y sucursales</small><b>⌄</b></button><div class="advanced-body"><div class="smart-settings-grid">${[['expenses','Caja, bancos y gastos','Movimientos y tesorería'],['multiBranch','Varias sucursales','Operación por ubicación'],['teamManagement','Permisos por usuario','Roles y accesos distintos'],['approvals','Autorizaciones','Descuentos, compras o cancelaciones']].map(([n,t,s])=>`<label class="smart-toggle"><div><strong>${t}</strong><small>${s}</small></div><select name="${n}"><option value="yes">Sí</option><option value="no">No</option></select></label>`).join('')}</div><div class="two"><label>Sucursales<input name="branchCount" type="number" min="1" max="50" value="1"></label><label>Almacenes<input name="warehouseCount" type="number" min="0" max="50" value="1"></label></div></div></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v25Step(2)">← Atrás</button><button type="button" class="btn primary" onclick="v25Step(4)">Definir prioridades →</button></div>
        </section>

        <section class="onboarding-step" data-step="4">
          <span class="step-label">PASO 4 DE 5</span><h3>Haz que Inicio trabaje para ti</h3><p class="step-copy">Elige hasta 3 prioridades. Nexo las usará para ordenar el dashboard y las alertas.</p>
          <div class="question-card priority-card-pro"><div class="question-head"><strong>¿Qué quieres ver primero?</strong><small>No cambias funciones; solo cambias el enfoque.</small></div><div class="priority-grid pro-priorities">${[['sales','Ventas','Rendimiento, clientes y oportunidades'],['inventory','Inventario','Stock, reposición y movimiento'],['finance','Finanzas','Ingresos, gastos y cobranza'],['team','Equipo','Tareas, permisos y pendientes'],['reports','Reportes','Indicadores y análisis']].map(([v,l,s],i)=>`<label><input type="checkbox" name="priority" value="${v}" ${i<3?'checked':''}><span><b>${l}</b><small>${s}</small></span></label>`).join('')}</div></div>
          <input type="hidden" name="palette" value="nexo"><input type="hidden" name="visualStyle" value="modern">
          <div class="customization-choice"><div><strong>Identidad de tu empresa</strong><small>Nexo puede usar su estilo profesional por defecto. Después podrás personalizar colores, logo y apariencia desde Configuración.</small></div><button type="button" class="btn secondary tiny" onclick="go('settings')">Personalizar después</button></div>
          <div class="two"><label>Sucursal principal<input name="branch" value="Principal" required></label><label>Ciudad<input name="city" placeholder="Ej. Ensenada"></label></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v25Step(3)">← Atrás</button><button type="button" class="btn primary" onclick="v25Step(5)">Ver mi configuración →</button></div>
        </section>

        <section class="onboarding-step" data-step="5">
          <span class="step-label">PASO 5 DE 5</span><h3>Así quedará tu empresa</h3><p class="step-copy">Nexo tomó tus respuestas y preparó una configuración inicial. Revísala y crea tu espacio.</p>
          <div class="auto-config-note premium-note"><span>✓</span><div><strong>Nexo lo prepara por ti.</strong><p>Menú, dashboard, módulos, roles y estructura se generan según la operación que describiste.</p></div></div>
          <div class="auto-summary-grid pro-summary"><div class="auto-summary-card"><small>Tipo de negocio</small><strong id="autoIndustry">Comercio</strong></div><div class="auto-summary-card"><small>Dashboard inicial</small><strong id="autoDashboard">Comercial</strong></div><div class="auto-summary-card"><small>Estructura</small><strong id="autoBranches">1 sucursal</strong></div><div class="auto-summary-card"><small>Inventario</small><strong id="autoWarehouses">1 almacén</strong></div></div>
          <div class="recommended-box pro-recommendation"><div><strong>Lo que Nexo activará</strong><p>Solo las áreas que tienen sentido para tu empresa.</p></div><div id="autoModuleList" class="auto-list"></div></div>
          <details class="fine-tuning"><summary>Quiero revisar detalles técnicos antes de crear</summary><div class="two"><label>Moneda<select name="currency"><option value="MXN">MXN — Peso mexicano</option><option value="USD">USD — Dólar</option><option value="EUR">EUR — Euro</option></select></label><label>IVA / impuesto %<input name="tax" type="number" min="0" max="100" value="16"></label></div></details>
          <input type="hidden" name="teamSize" value="small">
          <div class="create-summary"><span>✓ Configuración inicial</span><span>✓ Se puede cambiar después</span><span>✓ Nexo aprende de tu operación</span></div>
          <div class="step-actions"><button type="button" class="btn secondary" onclick="v25Step(4)">← Ajustar</button><button class="btn primary">Crear mi empresa</button></div>
        </section>
        <div id="authMsg"></div>
      </form><div class="auth-switch">¿Ya tienes cuenta? <button class="link" onclick="location.hash='#login'">Iniciar sesión</button></div>`);
    const form=q('#registerForm');
    form.onsubmit=v21Register;
    form.addEventListener('change',refreshAuto);
    form.addEventListener('input',refreshAuto);
    applyIndustryPreset(form,'Comercio');
    refreshAuto();
    previewBrand();
  };

  function updateOnboardingSummary(){
    const f=q('#registerForm');if(!f)return;
    const industry=f.elements.industry?.value||'Comercio';
    const plan=dashboardPreset(f);
    const preset={commercial:'Comercial',operations:'Operaciones',finance:'Finanzas',team:'Equipo',analytics:'Analítico'}[plan]||'Comercial';
    const i=q('#autoIndustry');if(i)i.textContent=industry;
    const p=modulePlan(f),labels=Object.fromEntries(NAV.flatMap(x=>x[1]).map(x=>[x[0],x[1]]));
    const active=Object.keys(p).filter(k=>p[k]&&labels[k]&&!['dashboard','settings'].includes(k));
    const el=q('#autoModuleList');if(el)el.innerHTML=active.slice(0,16).map(k=>`<span>${labels[k]}</span>`).join('')+(active.length>16?`<span>+${active.length-16} más</span>`:'');
    const d=q('#autoDashboard');if(d)d.textContent=preset;
    const br=q('#autoBranches');if(br)br.textContent=`${branchCount(f)} ${branchCount(f)===1?'sucursal':'sucursales'}`;
    const wh=q('#autoWarehouses');if(wh)wh.textContent=warehouseCount(f)?`${warehouseCount(f)} ${warehouseCount(f)===1?'almacén':'almacenes'}`:'Sin almacén';
  }
  window.v25Industry=v=>{const f=q('#registerForm');if(!f)return;f.elements.industry.value=v;qa('.industry-choice',f).forEach(x=>x.classList.toggle('active',x.dataset.industry===v));applyIndustryPreset(f,v);updateOnboardingSummary()};
  window.v25Step=n=>{const f=q('#registerForm');if(!f)return;const cur=q('.onboarding-step.active',f),current=+(cur?.dataset.step||1);if(n>current){const inv=qa('[required]',cur).find(x=>!String(x.value||'').trim());if(inv){inv.focus();return}if(current===1&&f.elements.password.value!==f.elements.confirm.value){q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';return}}q('#authMsg').innerHTML='';qa('.onboarding-step',f).forEach(s=>s.classList.toggle('active',+s.dataset.step===n));qa('.onboarding-progress i',f).forEach((x,i)=>x.classList.toggle('active',i<n));if(n===5){refreshAuto();updateOnboardingSummary()}window.scrollTo({top:0,behavior:'smooth'})};


  window.v21Industry=v=>{const f=q('#registerForm');if(f)applyIndustryPreset(f,v)};
  window.v21Palette=key=>{const f=q('#registerForm');if(!f)return;f.elements.palette.value=key;refreshAuto()};
  window.v21Step=n=>{const f=q('#registerForm');if(!f)return;const cur=q('.onboarding-step.active',f),current=+(cur?.dataset.step||1);if(n>current){const inv=qa('[required]',cur).find(x=>!String(x.value||'').trim());if(inv){inv.focus();return}if(current===1&&f.elements.password.value!==f.elements.confirm.value){q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';return}}q('#authMsg').innerHTML='';qa('.onboarding-step',f).forEach(s=>s.classList.toggle('active',+s.dataset.step===n));qa('.onboarding-progress i',f).forEach((x,i)=>x.classList.toggle('active',i<n));if(n===6)refreshAuto();window.scrollTo({top:0,behavior:'smooth'})};

  async function v21Register(e){
    e.preventDefault();const form=e.target,f=new FormData(form),name=String(f.get('name')).trim(),company=String(f.get('company')).trim(),email=String(f.get('email')).trim().toLowerCase(),pwd=String(f.get('password'));if(pwd!==f.get('confirm'))return q('#authMsg').innerHTML='<div class="error">Las contraseñas no coinciden.</div>';const db=loadDB();if(db.users.some(u=>u.email===email))return q('#authMsg').innerHTML='<div class="error">Ese correo ya está registrado durante esta sesión.</div>';
    const uidu=uid('usr'),cid=uid('cmp'),bid=uid('br'),mods=modulePlan(form),brand={...selectedPalette(form),style:f.get('visualStyle')||'modern'},profile={teamSize:f.get('teamSize'),offering:f.get('offering'),salesMode:vals('salesMode'),priorities:vals('priority'),inventoryControl:yn(f.get('inventoryControl')),purchasing:yn(f.get('purchasing')),creditSales:yn(f.get('creditSales')),supplierCredit:yn(f.get('supplierCredit')),expenses:yn(f.get('expenses')),multiBranch:yn(f.get('multiBranch')),teamManagement:yn(f.get('teamManagement')),approvals:yn(f.get('approvals'))};
    const branches=Array.from({length:branchCount(form)},(_,i)=>({id:i===0?bid:uid('br'),name:i===0?(f.get('branch')||'Principal'):`Sucursal ${i+1}`,city:f.get('city')||'',address:'',active:true}));const warehouses=Array.from({length:warehouseCount(form)},(_,i)=>({id:uid('wh'),name:i===0?'Almacén principal':`Almacén ${i+1}`,branch:branches[Math.min(i,branches.length-1)].name,type:'General',active:true,capacity:0,occupancy:0}));const roleTemplates=suggestedRoles(form).map((r,i)=>({id:uid('role'),...r}));const ownerRole=roleTemplates.find(r=>r.name==='Propietario');
    db.users.push({id:uidu,name,email,passwordHash:await hashPassword(pwd),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]});
    db.companies.push({id:cid,name:company,legalName:company,rfc:'',currency:f.get('currency')||'MXN',tax:+f.get('tax')||16,industry:f.get('industry')||'General',plan:suggestedPlan(form),theme:'light',brand,visualStyle:brand.style,dashboardPreset:dashboardPreset(form),onboardingComplete:true,businessProfile:profile,branches,roles:roleTemplates,members:[{userId:uidu,roleId:ownerRole.id,branchId:bid,status:'active'}],modules:mods,data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[{id:uid('aud'),at:nowISO(),user:name,action:'Nexo configurado automáticamente',detail:`${f.get('industry')} · ${suggestedPlan(form)}`}],notifications:[{id:uid('nt'),type:'success',title:'Tu Nexo está listo',text:'Configuramos módulos, roles, estructura y apariencia automáticamente.',read:false,at:nowISO(),action:'settings'}],transfers:[],documents:[],receivables:[],payables:[],warehouses,stockMoves:[],returns:[],cashClosings:[],metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:branches.map(b=>({name:b.name,value:0})),categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false,branding:true,automaticSetup:true}}});saveDB(db);setSession({userId:uidu,companyId:cid});if(typeof enhanceV19==='function')enhanceV19();applyBrand(brand);location.hash='';ui.route='dashboard';render();
  }

  const oldRenderApp=renderApp;renderApp=function(){const c=currentCompany();if(c?.brand)applyBrand(c.brand);oldRenderApp()};
  const oldSettings=settingsPage;settingsPage=function(){const base=oldSettings(),c=currentCompany();if(!c)return base;const b=c.brand||PALETTES.nexo;const block=`<section class="card settings-card brand-settings"><h3>Identidad automática</h3><p class="settings-intro">Nexo aplica estos colores a toda la interfaz de esta empresa.</p><div class="brand-colors-inline"><div class="brand-color-chip"><i style="background:${b.primary}"></i><div><small>Principal</small><strong>${b.primary}</strong></div></div><div class="brand-color-chip"><i style="background:${b.accent}"></i><div><small>Acento</small><strong>${b.accent}</strong></div></div><div class="brand-color-chip"><i style="background:${b.nav}"></i><div><small>Sidebar</small><strong>${b.nav}</strong></div></div></div><div class="setting-row"><div><strong>Configuración automática</strong><small>Módulos, roles, estructura y dashboard fueron definidos por el onboarding.</small></div><span class="badge success">Activa</span></div><div class="setting-row"><div><strong>Dashboard base</strong><small>Prioridad inicial detectada.</small></div><span class="badge info">${esc(c.dashboardPreset||'commercial')}</span></div><button class="btn secondary" onclick="location.hash='#register'">Volver a ver onboarding</button></section>`;return base.replace('</div>',`${block}</div>`)};

  // Aplicar branding al workspace de muestra también.
  const db=loadDB();db.companies.forEach(c=>{c.brand||={...PALETTES.nexo,key:'nexo',style:'modern'};c.dashboardPreset||='commercial'});saveDB(db);if(currentCompany()?.brand)applyBrand(currentCompany().brand);
})();
