/* Nexo v23 — Crear empresa: simple por defecto, potente bajo demanda. El asistente SOLO se abre desde "Crear empresa". */
(()=>{
const PERSIST=true,KEY='nexo_v23';
const persist=()=>{if(PERSIST)try{localStorage.setItem(KEY,JSON.stringify({db:MEMORY_DB,session:MEMORY_SESSION}))}catch(e){}};
if(PERSIST){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.db){MEMORY_DB=s.db;MEMORY_SESSION=s.session}}catch(e){}
 const sd=saveDB,ss=setSession;saveDB=function(d){sd(d);persist()};setSession=function(s){ss(s);persist()}}
const LVN={q:'Rápida',r:'Recomendada',m:'A tu medida'},nl=l=>({b:'q',s:'r'}[l]||l||'r');
const CATS=[['Tienda','retail'],['Comida','food'],['Distribución','whole'],['Servicios','serv'],['Mayorista','whole'],['Otro','other']];
const guess=t=>/distrib|mayor/i.test(t)?'whole':/taquer|restaur|caf[eé]|pizz|comida|panad|fonda|helad|antojit/i.test(t)?'food':/ropa|boutique|zapat|calzado|moda/i.test(t)?'cloth':/ferret|refacc|autopart/i.test(t)?'hard':/salon|salón|barber|taller|servic|consult|cl[ií]nica|spa|gym|despacho/i.test(t)?'serv':/tienda|abarrot|papeler|farmac|super|miscel|limpieza|l[ií]nea/i.test(t)?'retail':'other';
const G=a=>a.grp||guess((a.type==='Otro'&&a.other)?a.other:(a.type||''));
const O=a=>G(a)==='serv'?'s':({Servicios:'s',Ambos:'b'}[a.offer]||'p'),prod=a=>O(a)!=='s',isFood=a=>G(a)==='food';
const yn=['Sí','No'],has=(a,k,x)=>(Array.isArray(a[k])?a[k]:[]).some(v=>v.includes(x));
const SELLQ={'Mostrador':['Venta en mostrador'],'Pedidos y WhatsApp':['Con pedidos','Por WhatsApp'],'A domicilio':['A domicilio'],'Mayoreo':['Por mayoreo'],'En línea':['En línea']};
const Q=[{id:'offer',when:a=>G(a)==='other',q:'¿Vendes productos, servicios o ambos?',opts:['Productos','Servicios','Ambos']},
{id:'sellq',q:'¿Cuál es tu forma principal de vender?',opts:Object.keys(SELLQ)},
{id:'mode',lv:'r',when:isFood,q:'¿Cómo atiendes principalmente?',opts:['Mesas','Para llevar','A domicilio','Combinación']},
{id:'deliv',lv:'r',when:a=>G(a)==='whole',q:'¿Haces entregas a domicilio o por ruta?',opts:yn},
{id:'citas',lv:'r',when:a=>G(a)==='serv',q:'¿Trabajas con citas?',opts:yn},
{id:'inv',when:prod,q:'¿Quieres controlar tu inventario?',opts:['Sí','No','Solo algunos productos']},
{id:'team',q:'¿Trabajará más de una persona en Nexo?',opts:yn},
{id:'cust',q:'¿Quieres llevar un registro de tus clientes?',opts:yn}];
/* Valores predeterminados inteligentes según el giro */
function _baseEff(a){const g=G(a),b={...a},p=prod(a),d=(k,v)=>{if(b[k]===undefined)b[k]=v};
d('pay',['Efectivo','Tarjeta']);d('inv',p?'Sí':'No');d('cust','Sí');d('sup',p&&g!=='serv'?'Sí':'No');d('team','No');d('sell',[]);
let sp=b.spec;if(sp===undefined){const m=b.mode||'';sp=({food:['Comandas','Cocina','Ingredientes y recetas',...(m!=='Para llevar'&&m!=='A domicilio'?['Mesas']:[]),...(m==='A domicilio'||m==='Combinación'?['Delivery']:[])],whole:['Crédito a clientes','Entregas'],serv:['Citas y agenda','Cotizaciones'],cloth:['Tallas','Colores','Variantes','Cambios y devoluciones'],hard:['Código de barras','SKU','Unidades de medida'],retail:['Código de barras']}[g]||[]).slice()}
if(b.deliv==='No')sp=sp.filter(x=>!/Delivery|Rutas|Entregas/.test(x));if(b.deliv==='Sí'&&!sp.some(x=>/Delivery|Rutas|Entregas/.test(x)))sp.push(g==='food'?'Delivery':'Entregas');if(b.citas==='No')sp=sp.filter(x=>!/Citas/.test(x));b.spec=sp;
d('sales',g==='whole'?['Ventas a crédito']:[]);
d('invn',['Existencias','Entradas y salidas','Inventario mínimo y alertas']);d('custn',['Teléfono','Dirección','Historial de compras','Notas']);d('prod',['Categorías']);d('ord',['Estados de pedido']);return b}
function _baseBuild(a){const g=G(a),o=O(a),m=a.mode||'',sp=x=>has(a,'spec',x),sl=x=>has(a,'sales',x),sv=x=>has(a,'sell',x),iv=a.inv&&a.inv!=='No';
return{tipo_negocio:a.type==='Otro'?(String(a.other||'Otro').replace(/^\s*(tengo|soy|es|manejo)\s+(una?|un)?\s*/i,'').replace(/^./,c=>c.toUpperCase())):(a.type||'Negocio'),grupo:g,vende:a.what||a.about||'',vende_productos:o!=='s',vende_servicios:o!=='p',
mayoreo:g==='whole'||sv('mayoreo'),menudeo:g==='whole'||sv('mostrador'),inventario:o!=='s'&&!!iv,alertas_stock:has(a,'invn','mínimo'),historial_movimientos:has(a,'invn','Historial'),
clientes:a.cust==='Sí'||sl('crédito')||g==='serv'||g==='whole',proveedores:a.sup==='Sí',empleados:a.team==='Sí',roles:!!(a.roles||[]).length,comisiones:sp('comisiones')||has(a,'perm','Comisiones'),actividad:false,
ventas_a_credito:sl('crédito')||sp('Crédito'),facturas:sl('Facturas'),cortes_caja:sl('Cortes'),devoluciones:sl('evoluciones')||sp('devoluciones'),descuentos:sl('Descuentos'),promociones:sl('promociones'),ganancias:sl('Ganancias')||has(a,'invn','ganancias'),
pedidos:sv('pedidos')||sv('WhatsApp')||sp('Pedidos')||g==='whole'||(g==='food'&&m!=='Mesas')||sp('Comandas'),
entregas:sv('domicilio')||sp('Delivery')||sp('Rutas')||sp('Entregas')||m==='A domicilio'||has(a,'ord','Entregas'),
mesas:g==='food'&&sp('Mesas'),comandas:sp('Comandas'),cocina:sp('Cocina'),citas:g==='serv'&&sp('Citas'),cotizaciones:sp('Cotizaciones')||g==='serv',rutas:sp('Rutas'),recetas:sp('Ingredientes'),
variantes:sp('Variantes')||has(a,'prod','Variantes')||sp('Tallas'),codigo_barras:sp('Código')||has(a,'prod','barras'),sucursales:false,metodos_pago:a.pay||['Efectivo'],canales_venta:a.sell||[]}}
let eff=_baseEff;
let build=_baseBuild;
const bp=a=>build(eff(a));
/* Catálogo de módulos */
const NAV0=JSON.parse(JSON.stringify(NAV)),ITEM=Object.fromEntries(NAV0.flatMap(x=>x[1]).map(x=>[x[0],[...x]]));
const FIXED=['dashboard','settings','roles','modules','security','plans','bizconfig'],REAL=Object.keys(ITEM).filter(k=>!FIXED.includes(k));
const GEN=[['mesas','Mesas','▦',p=>p.mesas],['comandas','Comandas','▤',p=>p.comandas],['cocina','Cocina','♨',p=>p.cocina],['delivery','Delivery','➤',p=>p.grupo==='food'&&p.entregas],['rutas','Rutas','⌖',p=>p.rutas],['entregas','Entregas','➤',p=>p.entregas&&p.grupo!=='food'],['comisiones','Comisiones','%',p=>p.comisiones],['citas','Citas','◷',p=>p.citas],['recetas','Recetas e ingredientes','❖',p=>p.recetas],['produccion','Producción','⚒',()=>false],['promociones','Promociones','★',p=>p.promociones],['descuentos','Descuentos','％',p=>p.descuentos],['facturacion','Facturación','▧',p=>p.facturas],['cajas','Cajas','▣',p=>p.cortes_caja&&!ITEM.cashclose]];
const LBL={food:{products:'Menú',orders:'Pedidos'},serv:{tasks:'Agenda',products:'Servicios',sales:'Pagos'},whole:{orders:'Pedidos y entregas',receivables:'Crédito'},cloth:{products:'Productos y variantes'}};
const ORD={food:['sales','x_mesas','x_comandas','orders','x_cocina','products','x_recetas','inventory','customers','purchases','suppliers','reports'],whole:['sales','products','inventory','customers','suppliers','purchases','orders','x_entregas','receivables','reports'],serv:['customers','products','tasks','x_citas','sales','users','reports']};
const genOf=id=>GEN.find(x=>'x_'+x[0]===id),lab=(id,g)=>{const x=genOf(id);return x?x[1]:(LBL[g]||{})[id]||ITEM[id]?.[1]||id};
function _baseModsFrom(p){const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false])),on=(...x)=>x.forEach(k=>m[k]=true);
on('dashboard','settings','modules','security','sales','reports','roles');if(p.vende_productos)on('products');if(p.inventario)on('inventory','warehouses');if(p.historial_movimientos)on('stockmoves');
if(p.proveedores)on('suppliers','purchases','payables');if(p.clientes)on('customers');if(p.ventas_a_credito)on('customers','receivables');if(p.ganancias||p.cortes_caja)on('finance');if(p.cortes_caja)on('cashclose');
if(p.devoluciones)on('returns');if(p.pedidos||p.entregas||p.comandas||p.mesas||p.cocina||p.citas)on('orders');if(p.cotizaciones)on('quotes');if(p.citas||p.grupo==='serv')on('tasks');if(p.empleados)on('users','tasks');return m}
let modsFrom=_baseModsFrom;
function _baseRecMenu(a){const p=bp(a),m=modsFrom(p),ord=ORD[p.grupo]||['sales','products','inventory','customers','suppliers','purchases','orders','quotes','reports'],all=[...REAL,...GEN.map(x=>'x_'+x[0])];
return[...new Set([...ord,...all])].filter(i=>all.includes(i)).map(id=>({id,on:genOf(id)?!!genOf(id)[3](p):!!m[id]&&id!=='warehouses'}))}
let recMenu=_baseRecMenu;
const WD=[['vd','Ventas del día','k'],['vm','Ventas del mes','k'],['gan','Ganancias','k'],['pv','Productos vendidos','k'],['bajo','Inventario bajo','l'],['pp','Pedidos pendientes','k'],['cn','Clientes nuevos','k'],['cxc','Cobranza','k'],['comp','Compras recientes','l'],['ent','Entregas pendientes','k'],['top','Más vendidos','l'],['emp','Empleados','k'],['com','Comisiones','k'],['graf','Gráfica de ingresos','g']];
function recWid(a){const g=G(a),pick={food:['vd','vm','pp','ent','bajo','gan'],whole:['vd','vm','cxc','pp','ent','bajo','gan','graf'],serv:['vd','vm','cn','cxc','gan'],cloth:['vd','vm','gan','bajo','graf']}[g]||['vd','vm','gan','bajo','cxc','graf'];return[...pick,...WD.map(x=>x[0]).filter(x=>!pick.includes(x))].map(id=>({id,on:pick.includes(id)}))}
const defAu=()=>({stock:{on:false,x:5},sale:{on:false},debt:{on:false},order:{on:false}});
const modsOf=menu=>{const m=Object.fromEntries(PERMISSIONS.map(k=>[k,false]));['dashboard','settings','roles','modules','security','plans'].forEach(k=>{if(k in m)m[k]=true});menu.filter(i=>i.on&&!i.id.startsWith('x_')).forEach(i=>m[i.id]=true);if(m.inventory)m.warehouses=true;return m};
function rolesFor(a,mods){const r=[{id:uid('role'),name:'Propietario',permissions:[...PERMISSIONS],system:true}],ok=x=>PERMISSIONS.includes(x)&&mods[x];
const base={Gerente:PERMISSIONS.filter(x=>x!=='roles'&&mods[x]),Vendedor:['dashboard','sales','quotes','orders','customers','products'],Cajero:['dashboard','sales','customers'],Almacenista:['dashboard','inventory','products','purchases','suppliers']};
(a.roles||[]).forEach(n=>{let p=(base[n]||[]).filter(ok);const f=x=>has(a,'perm',x);if(f('Reportes'))p.push('reports');if(f('Caja')&&n!=='Almacenista')p.push('finance','cashclose');if(f('Inventario')&&n!=='Almacenista')p.push('inventory');r.push({id:uid('role'),name:n,permissions:[...new Set(p.filter(ok))]})});return r}
const applySetup=c=>{const s=c.setup;c.modules=modsOf(s.menu);c.industry=s.profile.tipo_negocio;c.appearance=s.appearance||{};c.brandColor=c.appearance.primary||c.brandColor||'#2f6df6';c.theme=c.appearance.theme||c.theme||'light'};
const applyRoles=c=>{const a=c.setup.answers;if((a.roles||[]).length)rolesFor(a,c.modules).slice(1).forEach(r=>{if(!c.roles.some(x=>x.name===r.name))c.roles.push(r)})};
/* Navegación */
const SEC={sales:'Ventas',orders:'Ventas',quotes:'Ventas',returns:'Ventas',cashclose:'Ventas',x_mesas:'Ventas',x_comandas:'Ventas',x_cocina:'Ventas',x_delivery:'Ventas',x_citas:'Ventas',products:'Catálogo',inventory:'Catálogo',stockmoves:'Catálogo',transfers:'Catálogo',purchases:'Compras',suppliers:'Compras',payables:'Compras',customers:'Clientes',receivables:'Clientes',finance:'Finanzas',reports:'Finanzas'};
function buildNav(){const c=currentCompany(),s=c?.setup;NAV.splice(0,NAV.length,...NAV0.map(x=>[x[0],x[1].map(i=>[...i])]));
const emp=NAV.find(x=>x[0]==='Empresa');if(emp&&!emp[1].some(i=>i[0]==='bizconfig'))emp[1].push(['bizconfig','Personalizar empresa','✦']);
if(!s?.menu)return;const g=s.profile.grupo,items=s.menu.filter(i=>i.on).map(i=>{const x=genOf(i.id);return[i.id,lab(i.id,g),x?x[2]:(ITEM[i.id]||[])[2]||'•']}),em=NAV.find(x=>x[0]==='Empresa');
let mid=[['Tu negocio',items]];if(s.group){const o={};items.forEach(i=>(o[SEC[i[0]]||'Operación']=o[SEC[i[0]]||'Operación']||[]).push(i));mid=Object.entries(o)}
NAV.splice(0,NAV.length,['General',[ITEM.dashboard||['dashboard','Inicio','⌂']]],...mid,em)}
const _ra=renderApp;renderApp=function(){evalAutos();buildNav();_ra();coMenu()};
const _can=can;can=function(p){if(p==='bizconfig')return _can('settings');if(String(p).startsWith('x_'))return !!currentCompany()?.setup?.menu?.find(i=>i.id===p&&i.on);return _can(p)};
const _rp=renderPage;renderPage=function(){const r=ui.route;return r==='bizconfig'?cfgPage():String(r).startsWith('x_')?xPage(r):_rp()};
/* Dashboard personalizado */
const sum=r=>r.reduce((a,b)=>a+(+b.total||0),0),same=d=>new Date(d).toDateString()===new Date().toDateString(),mon=d=>{const x=new Date(d),n=new Date();return x.getMonth()===n.getMonth()&&x.getFullYear()===n.getFullYear()};
const _dash=dashboard;dashboard=function(){const c=currentCompany(),w=c?.setup?.wid;if(!w||!w.length)return _dash();const d=data(),m=d.metrics||{},L=(t,rows)=>`<section class="card"><div class="card-head"><div><h3>${t}</h3></div></div>${rows.length?rows.join(''):'<p class="settings-intro">Sin datos todavía.</p>'}</section>`;
const F={vd:()=>['k',money(sum(d.sales.filter(s=>same(s.createdAt)))),'Hoy'],vm:()=>['k',money(sum(d.sales.filter(s=>mon(s.createdAt)))),'Este mes'],gan:()=>['k',money(m.profit),pct(m.margin)+' de margen'],pv:()=>['k',d.sales.length,'Ventas registradas'],pp:()=>['k',d.orders.filter(o=>!['delivered','done','completed'].includes(o.status)).length,'Por atender'],cn:()=>['k',d.customers.filter(x=>x.createdAt&&Date.now()-new Date(x.createdAt)<2592e6).length,'Últimos 30 días'],cxc:()=>['k',money(m.receivable),'Por cobrar'],ent:()=>['k',d.orders.filter(o=>['ready','preparing'].includes(o.status)).length,'Por entregar'],emp:()=>['k',c.members.length,'Usuarios'],com:()=>['k','$0','Por configurar'],
bajo:()=>['l',L('Inventario bajo',d.products.filter(p=>p.type==='Producto'&&p.stock<=p.minStock).slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.name)}</strong><small>Mínimo ${p.minStock}</small></div><b>${p.stock}</b></div>`))],comp:()=>['l',L('Compras recientes',d.purchases.slice(0,4).map(p=>`<div class="mini-row"><div><strong>${esc(p.supplier)}</strong><small>${p.folio}</small></div><b>${money(p.total)}</b></div>`))],top:()=>['l',L('Más vendidos',(d.categorySales||[]).slice(0,4).map(x=>`<div class="mini-row"><div><strong>${esc(x.name)}</strong></div><b>${x.value}%</b></div>`))],graf:()=>['g','<section class="card chart-card"><div class="card-head"><div><h3>Ingresos</h3></div></div><div class="line-chart" id="lineChart"></div></section>']};
const on=w.filter(i=>i.on&&F[i.id]).map(i=>({r:F[i.id](),l:WD.find(x=>x[0]===i.id)[1]})),ks=on.filter(x=>x.r[0]==='k'),rest=on.filter(x=>x.r[0]!=='k');
return pageHead(esc(c.name),'Tu resumen.')+(ks.length?`<div class="kpi-grid">${ks.map(x=>kpi(x.l,x.r[1],x.r[2])).join('')}</div>`:'')+(rest.length?`<div class="dashboard-grid thirds">${rest.map(x=>x.r[1]).join('')}</div>`:'')};
function evalAutos(){const c=currentCompany(),au=c?.setup?.autos;if(!au)return;const f=c.setup.fired=c.setup.fired||{},d=c.data;
if(au.stock?.on)d.products.filter(p=>p.type==='Producto'&&p.stock<(+au.stock.x||0)&&!f['s'+p.id]).forEach(p=>{f['s'+p.id]=1;notify('Inventario bajo',`${p.name}: ${p.stock} pzas.`,'danger','inventory')});
if(au.debt?.on)d.customers.filter(x=>x.balance>0&&!f['d'+x.id]).forEach(x=>{f['d'+x.id]=1;notify('Saldo pendiente',`${x.name} debe ${money(x.balance)}.`,'warning','customers')})}
/* Módulos nuevos (registro simple) */
const CT=['Texto','Número','Fecha','Lista','Sí/No','Moneda','Porcentaje'],CE=['Productos','Clientes','Proveedores','Ventas','Pedidos','Empleados','Módulos nuevos'];
const inp=(f,id)=>f.t==='Lista'?`<select id="${id}">${(f.o||'').split(',').map(x=>`<option>${esc(x.trim())}</option>`).join('')}</select>`:f.t==='Sí/No'?`<select id="${id}"><option>Sí</option><option>No</option></select>`:`<input id="${id}" type="${{Número:'number',Moneda:'number',Porcentaje:'number',Fecha:'date'}[f.t]||'text'}" placeholder="${esc(f.n)}">`;
function xPage(id){const c=currentCompany(),g=c.setup.profile.grupo,rows=(c.data.extra||{})[id]||[],cf=(c.setup.custom||[]).filter(f=>f.e==='Módulos nuevos');
return pageHead(lab(id,g),'Registro simple de este módulo.','')+`<section class="card table-card"><div class="nx-in" style="padding:14px;flex-wrap:wrap"><input id="xn" placeholder="Nombre"><input id="xd" placeholder="Detalle">${cf.map((f,i)=>`<label class="nx-l">${esc(f.n)}${inp(f,'xf'+i)}</label>`).join('')}<button class="btn primary" onclick="NX.xadd('${id}')">Agregar</button></div><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Detalle</th>${cf.map(f=>`<th>${esc(f.n)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.n)}</strong></td><td>${esc(r.d)}</td>${cf.map(f=>`<td>${esc((r.f||{})[f.n]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}
/* ===== Estado ===== */
let W=null;const D=ns=>ns==='w'?W.d:currentCompany().setup,L=(ns,k)=>D(ns)[k],AN=ns=>D(ns).answers;
const MC={inventory:{k:'invn',t:'¿Qué quieres controlar?',main:['Existencias','Entradas y salidas','Inventario mínimo y alertas','Costos'],adv:['Ajustes de inventario','Historial de movimientos']},sales:{k:'sales',t:'¿Qué quieres controlar de tus ventas?',main:['Tickets','Descuentos y promociones','Devoluciones','Cortes de caja'],adv:['Facturas','Ventas a crédito','Ganancias']},customers:{k:'custn',t:'¿Qué quieres guardar de tus clientes?',main:['Teléfono','Dirección','Historial de compras','Notas'],adv:['Crédito y deudas','Historial de pagos']},products:{k:'prod',t:'¿Qué información manejas de tus productos?',main:['Categorías','Marcas','Unidades de medida','Código de barras'],adv:['Variantes','Tallas','Colores','Códigos y SKU']},orders:{k:'ord',t:'¿Qué necesitas de tus pedidos?',main:['Estados de pedido','Entregas','Seguimiento'],adv:[]}};
const LISTS={roles:['Gerente','Vendedor','Cajero','Almacenista'],perm:['Descuentos','Inventario','Caja','Reportes','Comisiones']};
const ui2=()=>ui.nx=ui.nx||{tab:'mods'};
const T=ns=>ns==='w'?W.tab:ui2().tab,setT=(ns,v)=>{ns==='w'?W.tab=v:ui2().tab=v};
const cls=on=>on?'on':'';
/* Sugerencias de Nexo */
function sug(ns){const s=D(ns),g=G(s.answers),dis=s.dismiss||[];return recMenu(s.answers).filter(r=>r.on&&!s.menu.find(m=>m.id===r.id&&m.on)&&!dis.includes(r.id)).slice(0,2).map(r=>({id:r.id,t:`Para un negocio como el tuyo recomendamos activar ${lab(r.id,g)}.`}))}
const sugHtml=ns=>sug(ns).map(x=>`<div class="nx-sug"><span>${esc(x.t)}</span><span><button class="btn secondary" onclick="NX.sugA('${ns}','${x.id}',1)">Activar</button><button class="link" onclick="NX.sugA('${ns}','${x.id}',0)">Ahora no</button></span></div>`).join('');
/* Editor visual */
function editor(ns){const s=D(ns),t=T(ns),g=G(s.answers);
const tabs=[['mods','Módulos y menú'],['dash','Pantalla principal'],['adv','Avanzado']].map(([k,l])=>`<button class="${cls(t===k)}" onclick="NX.tab('${ns}','${k}')">${l}</button>`).join('');let b='';
if(t==='mods'){const on=s.menu.map((m,i)=>({m,i})).filter(x=>x.m.on),off=s.menu.filter(m=>!m.on);
b=sugHtml(ns)+`<div class="nx-list">${on.map(({m,i})=>{const mc=MC[m.id],open=ui2().mc===m.id&&mc;return `<div class="nx-row" draggable="true" ondragstart="NX.ds(${i})" ondragover="event.preventDefault()" ondrop="NX.dp('${ns}','menu',${i})"><span class="grip">⋮⋮</span><b>${esc(lab(m.id,g))}</b><span class="grow"></span>${mc?`<button class="link" onclick="NX.mcOpen('${ns}','${m.id}')">${open?'Cerrar':'Configurar'}</button>`:''}<button class="ar" aria-label="Subir" onclick="NX.mv('${ns}','menu',${i},-1)">↑</button><button class="ar" aria-label="Bajar" onclick="NX.mv('${ns}','menu',${i},1)">↓</button><label class="sw"><input type="checkbox" checked onchange="NX.tg('${ns}','menu',${i})"><i></i></label></div>${open?mcPanel(ns,m.id):''}`}).join('')}</div>
<div class="nx-add"><button class="btn secondary" onclick="NX.addOpen()">+ Agregar módulo</button>${ui2().add?`<div class="nx-chips">${s.menu.map((m,i)=>m.on?'':`<button onclick="NX.tg('${ns}','menu',${i})">${esc(lab(m.id,g))}</button>`).join('')||'<small>Ya están todos activos.</small>'}</div>`:''}</div>
<label class="nx-chk"><input type="checkbox" ${s.group?'checked':''} onchange="NX.grp('${ns}',this.checked)"> Agrupar el menú por secciones</label>`}
else if(t==='dash'){b=`<p class="nx-hint">Elige qué ver al abrir Nexo y arrástralo para ordenar.</p><div class="nx-list">${s.wid.map((w,i)=>`<div class="nx-row" draggable="true" ondragstart="NX.ds(${i})" ondragover="event.preventDefault()" ondrop="NX.dp('${ns}','wid',${i})"><span class="grip">⋮⋮</span><b>${WD.find(x=>x[0]===w.id)[1]}</b><span class="grow"></span><button class="ar" onclick="NX.mv('${ns}','wid',${i},-1)">↑</button><button class="ar" onclick="NX.mv('${ns}','wid',${i},1)">↓</button><label class="sw"><input type="checkbox" ${w.on?'checked':''} onchange="NX.tg('${ns}','wid',${i})"><i></i></label></div>`).join('')}</div><button class="link" onclick="NX.reset('${ns}','wid')">Restaurar recomendado</button>`}
else b=advHtml(ns);
return `<div class="nx-tabs">${tabs}</div>${b}`}
function mcPanel(ns,id){const m=MC[id],a=eff(AN(ns)),cur=a[m.k]||[],ch=(o,j)=>`<button class="${cls(cur.includes(o))}" onclick="NX.mc('${ns}','${id}',${j})">${cur.includes(o)?'✓ ':''}${o}</button>`;
return `<div class="nx-cfg"><p>${m.t}</p><div class="nx-chips">${m.main.map((o,j)=>ch(o,j)).join('')}</div>${m.adv.length?`<button class="link" onclick="NX.mcAdv()">Configuración avanzada ${ui2().mcAdv?'▴':'▾'}</button>${ui2().mcAdv?`<div class="nx-chips">${m.adv.map((o,j)=>ch(o,m.main.length+j)).join('')}</div>`:''}`:''}</div>`}
function advHtml(ns){const s=D(ns),o=ui2().adv,a=eff(s.answers),sec=(k,t,c)=>`<div class="nx-acc"><button onclick="NX.adv('${k}')"><span>${t}</span><span>${o===k?'−':'+'}</span></button>${o===k?`<div class="nx-accb">${c}</div>`:''}</div>`;
const chips=k=>`<div class="nx-chips">${LISTS[k].map((x,i)=>`<button class="${cls((a[k]||[]).includes(x))}" onclick="NX.ch('${ns}','${k}',${i})">${(a[k]||[]).includes(x)?'✓ ':''}${x}</button>`).join('')}</div>`;
const cf=`${(s.custom||[]).map((f,i)=>`<div class="nx-line">${esc(f.n)} · ${f.e} · ${f.t}${f.o?' ('+esc(f.o)+')':''}<button class="link" onclick="NX.cfdel('${ns}',${i})">Quitar</button></div>`).join('')}<div class="nx-in" style="flex-wrap:wrap"><input id="cfn" placeholder="Nombre (ej. Ruta de entrega)"><select id="cfe">${CE.map(x=>`<option>${x}</option>`).join('')}</select><select id="cft">${CT.map(x=>`<option>${x}</option>`).join('')}</select><input id="cfo" placeholder="Opciones si es Lista: Ruta 1, Ruta 2"><button class="btn secondary" onclick="NX.cfadd('${ns}')">+ Crear campo personalizado</button></div><small>Los campos de Módulos nuevos ya se usan al registrar; en productos y clientes quedan guardados.</small>`;
const au=D(ns).autos,row=(k,pre,x,post)=>`<label class="nx-rule"><input type="checkbox" ${au[k].on?'checked':''} onchange="NX.au('${ns}','${k}',this.checked)"> <span>${pre}${x?` <input type="number" min="0" value="${au.stock.x}" onchange="NX.aux('${ns}',this.value)" style="width:64px">`:''} → ${post}</span></label>`;
const aut=row('stock','Cuando el inventario sea menor a',1,'mostrar alerta')+row('sale','Cuando se registre una venta','','actualizar inventario')+row('debt','Cuando exista saldo vencido','','mostrar alerta')+row('order','Cuando llegue un pedido','','notificar');
return sec('cf','Campos personalizados',cf)+sec('roles','Empleados y permisos',`<p class="nx-hint">Roles</p>${chips('roles')}<p class="nx-hint">Permisos adicionales</p>${chips('perm')}`)+sec('au','Automatizaciones',aut)}
/* ===== Pantallas ===== */
const iconSvg=(name)=>{
  const paths={
    store:'<path d="M3 10h18"/><path d="M5 10v10h14V10"/><path d="M4 10l1.5-6h13L20 10"/><path d="M8 20v-6h4v6"/>',
    food:'<path d="M7 3v7"/><path d="M4 3v4a3 3 0 0 0 6 0V3"/><path d="M7 10v11"/><path d="M16 3v18"/><path d="M16 3c4 1 4 7 0 8"/>',
    box:'<path d="M4 7.5 12 3l8 4.5L12 12 4 7.5Z"/><path d="M4 7.5V16l8 5 8-5V7.5"/><path d="M12 12v9"/>',
    wrench:'<path d="m14.7 6.3 3-3a5 5 0 0 0-6.2 6.2L4.7 16.3a2.8 2.8 0 1 0 4 4l6.8-6.8a5 5 0 0 0 6.2-6.2l-3 3-3-3Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    spark:'<path d="m12 3 1.4 5.1L18 10l-4.6 1.9L12 17l-1.4-5.1L6 10l4.6-1.9L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    settings:'<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20H12.5v-.1a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.16 15a1.7 1.7 0 0 0-1.56-1H6.5v-2.55h.1a1.7 1.7 0 0 0 1.56-1A1.7 1.7 0 0 0 7.82 7.6l-.06-.06 1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V4.5h2.55v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1h.1V14h-.1a1.7 1.7 0 0 0-1.56 1Z"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
};
const wizardStep=()=>W.step==='type'?1:W.step==='location'?2:W.step==='users'?3:W.step==='edit'?4:5;
const wizardProgress=()=>wizardStep()*20;
const wizardSteps=[
  ['Tu negocio','¿Qué haces y cómo operas?'],
  ['Ubicación y sucursales','¿Dónde está tu negocio?'],
  ['Usuarios','¿Quiénes lo van a usar?'],
  ['Personalización','Ajusta el estilo de Nexo'],
  ['Revisión','Verifica y crea tu empresa']
];
function previewPanel(){
  const a=W.a||{},p=bp(a),name=a.company||'Mi empresa',group=p.grupo||'retail',label=build(eff(a)).tipo_negocio||a.type||'Negocio';
  const kpis=group==='serv' ? [['Citas','0'],['Clientes','0'],['Pagos','$0'],['Pendientes','0']] : group==='food' ? [['Ventas hoy','$0'],['Pedidos','0'],['Clientes','0'],['Cobranza','$0']] : [['Ventas hoy','$0'],['Productos','0'],['Clientes','0'],['Cobranza','$0']];
  const nav=(group==='food'?['Inicio','Ventas','Pedidos','Menú','Clientes','Inventario']:group==='serv'?['Inicio','Clientes','Servicios','Agenda','Pagos','Reportes']:['Inicio','Ventas','Inventario','Clientes','Productos','Reportes']);
  return `<aside class="nx-preview">
    <section class="nx-preview-card">
      <div class="nx-preview-intro"><div class="nx-preview-spark">${iconSvg('spark')}</div><div><h3>Así se verá tu empresa en Nexo</h3><p>Con esta información, prepararemos tu espacio con la estructura ideal para ti.</p></div></div>
      <div class="nx-mini-app"><aside><div class="nx-mini-brand"><span>N</span><b>Nexo</b></div>${nav.map((x,i)=>`<div class="nx-mini-nav ${i===0?'active':''}"><span>${i===0?'⌂':i===1?'◫':i===2?'▣':i===3?'◇':i===4?'◎':'▥'}</span>${x}</div>`).join('')}</aside><main><div class="nx-mini-title"><div><span>${esc(label)}</span><strong>${esc(name)}</strong></div><i></i></div><div class="nx-mini-kpis">${kpis.map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div><div class="nx-mini-chart"><div class="nx-mini-line"></div><div class="nx-mini-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></main></div>
      <h4>Incluye:</h4>
      <ul class="nx-preview-list"><li>${iconSvg('spark')}<span>Módulos y funciones adaptados a tu negocio.</span></li><li>${iconSvg('settings')}<span>Dashboard con los indicadores más importantes.</span></li><li>${iconSvg('box')}<span>Estructura de productos e inventario adecuada.</span></li><li>${iconSvg('users')}<span>Usuarios y permisos según tu operación.</span></li></ul>
      <div class="nx-preview-note"><div class="nx-preview-note-icon">${iconSvg('spark')}</div><div><b>Tu negocio, en buenas manos</b><small>Nexo se adapta a ti, no al revés.</small></div></div>
    </section>
  </aside>`;
}
function proShell(inner,prog){
  const n=wizardStep(),top=Math.min(100,Math.max(0,prog||wizardProgress()));
  const steps=wizardSteps.map((x,i)=>{const idx=i+1,active=idx===n,done=idx<n;return `<div class="nx-step-item ${active?'active':''} ${done?'done':''}"><span class="nx-step-num">${done?'✓':idx}</span><div><b>${x[0]}</b><small>${x[1]}</small></div></div>`}).join('');
  return `<div class="nx pro-wizard-shell"><div class="nx-onboard-side"><div class="nx-onboard-brand"><span class="nx-brandmark">N</span><b>Nexo</b></div><p class="nx-onboard-copy">Configura tu empresa y comienza a trabajar en minutos.</p><nav class="nx-stepper">${steps}</nav><div class="nx-side-note"><div>${iconSvg('spark')}</div><div><b>Todo listo en unos minutos</b><small>Con la información que nos compartes, Nexo configurará tu empresa con la estructura ideal para ti.</small></div></div></div><div class="nx-onboard-main"><header class="nx-pro-top"><div class="nx-progress-track"><i style="width:${top}%"></i></div><button class="link" onclick="NX.cancel()">Cancelar</button></header><div class="nx-pro-content"><div class="nx-pro-center">${inner}</div>${previewPanel()}</div></div></div>`;
}
function drawPro(inner,prog){app.innerHTML=proShell(inner,prog);const i=app.querySelector('[autofocus]');i&&i.focus&&i.focus()}
function typeStepHtml(a){
  const sel=a.type;
  const desc={
    Tienda:'Abarrotes, regalos, ropa, electrónicos, etc.',
    Comida:'Comida, cafetería, repostería, etc.',
    Distribución:'Mayoreo, abarrotes, productos de consumo.',
    Servicios:'Talleres, estética, reparación, consultorías, etc.',
    Mayorista:'Venta en volumen, proveedores, etc.',
    Otro:'Describe tu negocio con más detalle.'
  };
  const icons=['store','food','box','wrench','users','spark'];
  const cards=CATS.map((c,i)=>{
    const active=sel===c[0]&&!a.free;
    return `<button type="button" class="nx-biz-card ${active?'active':''}" onclick="NX.cat('${c[0]}','${c[1]}')"><span class="nx-biz-icon">${iconSvg(icons[i])}</span><b>${c[0]}</b><small>${desc[c[0]]}</small>${active?'<em>✓</em>':''}</button>`;
  }).join('');
  return `<div class="nx-pro-badge">Paso 1 de 5</div>
    <h1>Cuéntale a Nexo qué haces</h1>
    <p class="nx-pro-sub">Esto nos ayudará a configurar tu empresa, mostrarte las herramientas adecuadas y personalizar tu experiencia.</p>
    <div class="nx-qblock">
      <div class="nx-qhead"><span>1</span><div><b>¿Qué tipo de negocio tienes?</b><small>Selecciona la opción que mejor describe tu empresa.</small></div></div>
      <div class="nx-biz-grid">${cards}</div>
      ${a.type==='Otro'?`<label class="nx-field-label">Describe tu negocio<input class="nx-pro-input" value="${esc(a.free||'')}" oninput="NX.f('free',this.value)" placeholder="Ej. Distribuidora de productos de limpieza"></label>`:''}
      <div class="nx-qhead field-head"><span>2</span><div><b>Nombre de tu empresa</b><small>Este nombre se mostrará en tu cuenta, reportes y documentos.</small></div></div>
      <input class="nx-pro-input" id="nxCo" value="${esc(a.company||'')}" oninput="NX.f('company',this.value)" placeholder="Ej. Mi empresa S.A. de C.V." autofocus>
      <div class="nx-qhead field-head"><span>3</span><div><b>Cuéntanos un poco sobre tu negocio</b><small>Qué vendes, qué servicios ofreces o cuál es tu mercado principal.</small></div></div>
      <textarea class="nx-pro-textarea" id="nxAbout" maxlength="500" oninput="NX.f('about',this.value)" placeholder="Ej. Limpiadores, artículos de limpieza y productos para el hogar...">${esc(a.about||'')}</textarea>
      <div class="nx-counter">${String(a.about||'').length}/500</div>
    </div>
    <div class="nx-reassurance"><span>${iconSvg('spark')}</span><div><b>No te preocupes, puedes cambiar esto después.</b><small>Si en el futuro necesitas ajustar esta información, lo podrás hacer desde la configuración de tu empresa.</small></div></div>
    <div id="aerr" class="error" style="display:none"></div>
    <div class="nx-pro-actions"><button class="btn primary" onclick="NX.toLocation()">Continuar <span>→</span></button></div>`;
}
function locationStepHtml(a){
  const count=Math.max(1,Math.min(20,parseInt(a.branchCount||1,10)||1));
  return `<div class="nx-pro-badge">Paso 2 de 5</div>
    <h1>Configura la ubicación de tu negocio</h1>
    <p class="nx-pro-sub">Indica dónde operas y cuántas sucursales quieres administrar desde Nexo.</p>
    <div class="nx-qblock">
      <div class="nx-qhead"><span>1</span><div><b>¿Dónde está tu negocio?</b><small>Usaremos esta información para organizar tus sucursales y reportes.</small></div></div>
      <div class="nx-two-fields"><label class="nx-field-label">Ciudad<input class="nx-pro-input" value="${esc(a.city||'')}" oninput="NX.f('city',this.value)" placeholder="Ej. Ensenada"></label><label class="nx-field-label">Estado<input class="nx-pro-input" value="${esc(a.state||'')}" oninput="NX.f('state',this.value)" placeholder="Ej. Baja California"></label></div>
      <label class="nx-field-label">Dirección<input class="nx-pro-input" value="${esc(a.address||'')}" oninput="NX.f('address',this.value)" placeholder="Calle, número, colonia..." ></label>
      <div class="nx-qhead field-head"><span>2</span><div><b>¿Cuántas sucursales tienes?</b><small>Puedes agregar o modificar sucursales después.</small></div></div>
      <div class="nx-answer-grid nx-branch-grid">
        ${['1','2','3','4','5+'].map(v=>{const active=(v==='5+'?count>=5:count===+v);return `<button class="nx-answer ${active?'active':''}" type="button" onclick="NX.branches('${v}')"><span>${active?'✓':'○'}</span><b>${v==='1'?'Una sucursal':v==='5+'?'5 o más':v+' sucursales'}</b></button>`}).join('')}
      </div>
    </div>
    <div id="aerr" class="error" style="display:none"></div>
    <div class="nx-pro-actions between"><button class="btn secondary" onclick="NX.go('type')">← Atrás</button><button class="btn primary" onclick="NX.toUsers()">Continuar <span>→</span></button></div>`;
}
function usersStepHtml(a){
  const who=a.teamChoice||'solo';
  const options=[['solo','Solo yo','Ideal si tú administrarás Nexo.'],['team','Yo y mi equipo','Agrega vendedores, administradores y otros usuarios.'],['many','Varias personas','Para equipos con diferentes áreas y permisos.']];
  return `<div class="nx-pro-badge">Paso 3 de 5</div>
    <h1>¿Quiénes usarán Nexo?</h1>
    <p class="nx-pro-sub">Configura desde el inicio quién tendrá acceso y deja los permisos listos para tu operación.</p>
    <div class="nx-level-grid">${options.map(o=>`<button type="button" class="nx-level-card ${who===o[0]?'active':''}" onclick="NX.team('${o[0]}')"><div><span>${who===o[0]?'✓':'○'}</span><b>${o[1]}</b></div><strong>${o[1]}</strong><small>${o[2]}</small><i>→</i></button>`).join('')}</div>
    <div class="nx-qblock" style="margin-top:18px">
      <div class="nx-qhead"><span>2</span><div><b>Tu acceso de propietario</b><small>Lo necesitarás para entrar a tu nueva empresa.</small></div></div>
      <div class="nx-two-fields"><label class="nx-field-label">Nombre completo<input class="nx-pro-input" id="nxOwnerName" value="${esc(a.ownerName||'')}" oninput="NX.f('ownerName',this.value)" placeholder="Ej. Saul Savin"></label><label class="nx-field-label">Correo electrónico<input class="nx-pro-input" id="nxOwnerEmail" type="email" value="${esc(a.ownerEmail||'')}" oninput="NX.f('ownerEmail',this.value)" placeholder="correo@empresa.com"></label></div>
      <label class="nx-field-label">Contraseña<input class="nx-pro-input" id="nxOwnerPass" type="password" minlength="6" value="${esc(a.ownerPass||'')}" oninput="NX.f('ownerPass',this.value)" placeholder="Mínimo 6 caracteres"></label>
    </div>
    <div id="aerr" class="error" style="display:none"></div>
    <div class="nx-pro-actions between"><button class="btn secondary" onclick="NX.go('location')">← Atrás</button><button class="btn primary" onclick="NX.toEdit()">Continuar <span>→</span></button></div>`;
}
function editStepHtml(){
  const a=W.a||{}, q=qList(), ap=W.d?.appearance||{primary:a.brandColor||'#2f6df6',theme:a.theme||'light',density:a.density||'comfortable',nav:a.navStyle||'classic'};
  const colors=[['#2f6df6','Nexo Blue'],['#0ea5a4','Esmeralda'],['#7c3aed','Violeta'],['#e67e22','Naranja'],['#dc2626','Rojo'],['#0f766e','Verde oscuro'],['#111827','Grafito'],['#db2777','Rosa']];
  const answers=q.map((x,i)=>`<div class="nx-personal-q"><div><b>${esc(x.q)}</b><small>Esto cambia la forma en que Nexo prepara tu empresa.</small></div><div class="nx-answer-grid nx-mini-answer">${x.opts.map(o=>`<button type="button" class="nx-answer ${a[x.id]===o?'active':''}" onclick="NX.answer('${x.id}',${JSON.stringify(o).replace(/</g,'&lt;')})"><span>${a[x.id]===o?'✓':'○'}</span><b>${esc(o)}</b></button>`).join('')}</div></div>`).join('');
  return `<div class="nx-pro-badge">Paso 4 de 5</div><h1>Haz que Nexo sea tuyo</h1><p class="nx-pro-sub">Aquí puedes personalizar la forma en que funciona y se ve tu empresa. Nexo te recomienda una configuración según tus respuestas, pero tú decides.</p>
  <section class="nx-custom-card"><div class="nx-custom-head"><div class="nx-custom-icon">✦</div><div><b>Personalización inteligente</b><small>Responde estas preguntas y Nexo ajustará módulos, ventas, inventario, clientes y herramientas a tu operación.</small></div></div>${answers}</section>
  <section class="nx-custom-card"><div class="nx-custom-title"><b>Colores de tu empresa</b><small>Elige el color principal que usará Nexo en botones, menús, indicadores y elementos destacados.</small></div><div class="nx-color-grid">${colors.map(c=>`<button type="button" class="nx-color-choice ${ap.primary===c[0]?'active':''}" title="${c[1]}" onclick="NX.appearance('primary','${c[0]}')"><i style="background:${c[0]}"></i><span>${c[1]}</span>${ap.primary===c[0]?'<b>✓</b>':''}</button>`).join('')}<label class="nx-color-custom"><span>Color propio</span><input type="color" value="${ap.primary}" onchange="NX.appearance('primary',this.value)"><code>${ap.primary.toUpperCase()}</code></label></div></section>
  <section class="nx-custom-card"><div class="nx-custom-title"><b>Apariencia general</b><small>Decide cómo quieres sentir tu espacio de trabajo.</small></div><div class="nx-style-grid"><button type="button" class="nx-style-card ${ap.theme==='light'?'active':''}" onclick="NX.appearance('theme','light')"><span>☀</span><b>Claro</b><small>Limpio y luminoso</small></button><button type="button" class="nx-style-card ${ap.theme==='dark'?'active':''}" onclick="NX.appearance('theme','dark')"><span>☾</span><b>Oscuro</b><small>Moderno y enfocado</small></button><button type="button" class="nx-style-card ${ap.density==='compact'?'active':''}" onclick="NX.appearance('density','compact')"><span>▤</span><b>Compacto</b><small>Más información en pantalla</small></button><button type="button" class="nx-style-card ${ap.density==='comfortable'?'active':''}" onclick="NX.appearance('density','comfortable')"><span>▦</span><b>Cómodo</b><small>Más espacio y facilidad</small></button></div></section>
  <div class="nx-editor-wrap">${editor('w')}</div><div class="nx-pro-actions between"><button class="btn secondary" onclick="NX.go('users')">← Volver</button><button class="btn primary" onclick="NX.go('summary')">Ver resumen <span>→</span></button></div>`;
}
function summaryStepHtml(a){
  const d=W.d||draftOf(a),g=d.profile?.grupo||G(a),on=d.menu.filter(i=>i.on),acct=!getSession()&&!a.ownerEmail;
  const modules=on.slice(0,12).map(i=>`<span>${esc(lab(i.id,g))}</span>`).join('');
  const more=on.length>12?`<span>+${on.length-12} más</span>`:'';
  const access=acct?`<div class="nx-access-card"><div class="nx-qhead"><span>+</span><div><b>Crea tu acceso</b><small>Necesitamos estos datos para entrar a tu nueva empresa.</small></div></div><div class="nx-form"><input id="an" placeholder="Nombre completo"><input id="ae" type="email" placeholder="Correo electrónico"><input id="ap" type="password" placeholder="Contraseña (mínimo 6 caracteres)"></div></div>`:'';
  return `<div class="nx-pro-badge">Paso 5 de 5</div><h1>Tu empresa está lista</h1><p class="nx-pro-sub">Revisa la configuración que preparamos para ti. Puedes modificarla ahora o hacerlo después desde Personalizar empresa.</p><div class="nx-final-grid"><div class="nx-summary-card"><div><small>Empresa</small><strong>${esc(a.company||'Mi empresa')}</strong></div><div><small>Tipo de negocio</small><strong>${esc(build(eff(a)).tipo_negocio)}</strong></div><div><small>Configuración</small><strong>${LVN[W.lv]}</strong></div><div><small>Color principal</small><strong><i class="nx-summary-color" style="background:${(W.d?.appearance?.primary||a.brandColor||'#2f6df6')}"></i>${(W.d?.appearance?.primary||a.brandColor||'#2f6df6').toUpperCase()}</strong></div></div><div class="nx-module-card"><div class="nx-card-top"><div><b>Tu espacio incluirá</b><small>Herramientas seleccionadas para tu operación.</small></div><span>${on.length}</span></div><div class="nx-module-pills">${modules}${more}</div></div></div>${access}<div class="nx-final-note"><span>${iconSvg('spark')}</span><div><b>Nexo se encargará de la configuración inicial.</b><small>Después podrás personalizar módulos, dashboard, permisos y apariencia desde tu empresa.</small></div></div><div id="aerr" class="error" style="display:none"></div><div class="nx-pro-actions between"><button class="btn secondary" onclick="NX.go('edit')">Personalizar</button><button class="btn primary" onclick="NX.finish()">${W.edit?'Guardar cambios':'Crear empresa'} <span>→</span></button></div>`;
}
function wizRender(){
  const s=W.step,a=W.a||{};
  if(s==='type') return drawPro(typeStepHtml(a),20);
  if(s==='location') return drawPro(locationStepHtml(a),40);
  if(s==='users') return drawPro(usersStepHtml(a),60);
  if(s==='edit') return drawPro(editStepHtml(),80);
  return drawPro(summaryStepHtml(a),100);
}
const qList=()=>Q.filter(q=>(!q.when||q.when(W.a))&&(q.lv!=='r'||W.lv==='r'));
function draftOf(a){const e=eff(a);return{answers:a,profile:build(e),menu:recMenu(a),wid:recWid(a),custom:[],autos:defAu(),group:false,dismiss:[],appearance:{primary:a.brandColor||'#2f6df6',theme:a.theme||'light',density:a.density||'comfortable',nav:a.navStyle||'classic'}}}
const rebuild=ns=>{if(ns==='w')return wizRender();mutate(c=>{const s=c.setup;s.profile=build(eff(s.answers));applySetup(c);applyRoles(c)});renderApp()};
const after=ns=>{if(ns==='w'){W.d.profile=build(eff(W.a));wizRender()}else rebuild('c')};
const dragS={};
async function fin(){const a=W.a,d=W.d,E=m=>{const x=document.getElementById('aerr');if(x){x.textContent=m;x.style.display='block'}return false};
const setup={level:W.lv,profile:build(eff(a)),answers:{...a},menu:d.menu,wid:d.wid,custom:d.custom,autos:d.autos,group:d.group,dismiss:d.dismiss,fired:{},appearance:{...(d.appearance||{}),primary:a.brandColor||d.appearance?.primary||'#2f6df6',theme:a.theme||d.appearance?.theme||'light',density:a.density||d.appearance?.density||'comfortable',nav:a.navStyle||d.appearance?.nav||'classic'}};
if(W.edit){mutate(c=>{setup.fired=c.setup?.fired||{};c.setup=setup;c.name=a.company||c.name;applySetup(c);applyRoles(c)});audit('Actualizó la personalización',LVN[W.lv])}
else{const db=loadDB(),cid=uid('cmp'),bid=uid('br'),mods=modsOf(d.menu),roles=rolesFor(a,mods),has_=!!getSession();let userId;
if(has_){userId=getSession().userId;const u=db.users.find(x=>x.id===userId);u.companyIds=[...(u.companyIds||[]),cid]}
else{const n=String(a.ownerName||document.getElementById('an')?.value||'').trim(),em=String(a.ownerEmail||document.getElementById('ae')?.value||'').trim().toLowerCase(),p=String(a.ownerPass||document.getElementById('ap')?.value||'');if(!n||!em)return E('Completa tu nombre y correo.');if(p.length<6)return E('La contraseña debe tener al menos 6 caracteres.');if(db.users.some(u=>u.email===em))return E('Ese correo ya está registrado.');
userId=uid('usr');db.users.push({id:userId,name:n,email:em,passwordHash:await hashPassword(p),companyIds:[cid],createdAt:nowISO(),lastAccess:nowISO(),sessions:[]})}
const name=a.company||'Mi empresa';
const branchCount=Math.max(1,Math.min(20,+a.branchCount||1));
const branches=Array.from({length:branchCount},(_,i)=>({id:i===0?bid:uid('br'),name:i===0?'Principal':`Sucursal ${i+1}`,city:a.city||'',state:a.state||'',address:a.address||'',active:true}));
db.companies.push({id:cid,name,legalName:name,rfc:'',currency:'MXN',tax:16,industry:setup.profile.tipo_negocio,plan:'Free',theme:setup.appearance.theme,brandColor:setup.appearance.primary,onboardingComplete:true,setup,appearance:setup.appearance,modules:mods,branches,roles,members:[{userId,roleId:roles[0].id,branchId:bid,status:'active'}],
data:{products:[],customers:[],suppliers:[],sales:[],quotes:[],orders:[],purchases:[],accounts:[],transactions:[],tasks:[],approvals:[],audit:[],notifications:[{id:uid('nt'),type:'info',title:'Empresa lista',text:'Preparamos tu espacio. Puedes cambiarlo en Personalizar empresa.',read:false,at:nowISO(),action:'bizconfig'}],transfers:[],documents:[],receivables:[],payables:[],warehouses:mods.warehouses?[{id:'wh_'+bid,name:'Almacén principal',branch:'Principal',type:'General',active:true,capacity:0,occupancy:0}]:[],stockMoves:[],returns:[],cashClosings:[],extra:{},metrics:{revenue:0,profit:0,expenses:0,receivable:0,payable:0,inventoryValue:0,margin:0,monthGrowth:0},trend:[0,0,0,0,0,0,0],branchSales:[],categorySales:[],onboarding:{company:true,branch:true,tax:true,modules:true,team:false,products:false}}});
saveDB(db);setSession({userId,companyId:cid})}
W=null;location.hash='';ui.route='dashboard';render()}
/* API */
window.NX={
start:()=>{W={step:'type',a:{},lv:'r',qi:0,tab:'mods',pub:!getSession()};wizRender()},
cancel:()=>{const pub=!getSession();W=null;if(pub)location.hash='';render()},go:s=>{W.step=s;wizRender()},
f:(k,v)=>{W.a[k]=v},cat:(t,g)=>{W.a.type=t;W.a.grp=g;W.a.free='';if(t==='Otro'){W.a.grp=undefined}wizRender();document.getElementById('nxFree').focus()},
toLevel:()=>NX.toLocation(),
toLocation:()=>{const a=W.a,E=m=>{const x=document.getElementById('aerr');if(x){x.textContent=m;x.style.display='block'}};const fr=(a.free||'').trim();
if(fr){a.type='Otro';a.other=fr;a.grp=guess(fr);a.what=fr}else if(!a.type||(a.type==='Otro'))return E('Elige un tipo de negocio.');
if(!(a.company||'').trim())return E('Escribe el nombre de tu empresa.');a.company=a.company.trim();W.step='location';wizRender()},
branches:v=>{W.a.branchCount=v==='5+'?5:+v;wizRender()},
toUsers:()=>{const a=W.a,E=m=>{const x=document.getElementById('aerr');if(x){x.textContent=m;x.style.display='block'}};if(!String(a.city||'').trim())return E('Escribe la ciudad de tu negocio.');a.branchCount=Math.max(1,Math.min(20,+a.branchCount||1));W.step='users';wizRender()},
team:v=>{W.a.teamChoice=v;W.a.team=v==='solo'?'No':'Sí';wizRender()},
toEdit:()=>{const a=W.a,E=m=>{const x=document.getElementById('aerr');if(x){x.textContent=m;x.style.display='block'}};if(!String(a.ownerName||'').trim()||!String(a.ownerEmail||'').trim())return E('Completa tu nombre y correo.');if(String(a.ownerPass||'').length<6)return E('La contraseña debe tener al menos 6 caracteres.');W.lv='r';W.d=draftOf(a);W.step='edit';wizRender()},
lv:l=>{W.lv=l;wizRender()},
afterLevel:()=>{W.d=draftOf(W.a);W.step='edit';wizRender()},
ans:i=>{},answer:(k,v)=>{W.a[k]=v;if(k==='sellq')W.a.sell=SELLQ[v]||[];if(k==='team')W.a.team=v;W.d=W.d||draftOf(W.a);W.d.profile=build(eff(W.a));W.d.menu=recMenu(W.a);W.d.wid=recWid(W.a);wizRender()},appearance:(k,v)=>{W.a[k==='primary'?'brandColor':k==='theme'?'theme':k==='density'?'density':'navStyle']=v;W.d=W.d||draftOf(W.a);W.d.appearance={...(W.d.appearance||{}),primary:W.a.brandColor||W.d.appearance?.primary||'#2f6df6',theme:W.a.theme||W.d.appearance?.theme||'light',density:W.a.density||W.d.appearance?.density||'comfortable',nav:W.a.navStyle||W.d.appearance?.nav||'classic'};wizRender()},
back:()=>NX.go('users'),
toDraft:()=>{W.d=draftOf(W.a);W.step='summary';wizRender()},
finish:()=>{fin().catch(e=>{const x=document.getElementById('aerr');if(x){x.textContent='No se pudo crear: '+e.message;x.style.display='block'}})},
tab:(ns,k)=>{setT(ns,k);ns==='w'?wizRender():renderApp()},
tg:(ns,k,i)=>{const l=L(ns,k);l[i].on=!l[i].on;after(ns)},
mv:(ns,k,i,d)=>{const l=L(ns,k);let j=i+d;if(k==='menu')while(l[j]&&!l[j].on)j+=d;if(!l[j])return;[l[i],l[j]]=[l[j],l[i]];after(ns)},
ds:i=>{dragS.i=i},dp:(ns,k,i)=>{const l=L(ns,k);if(dragS.i==null)return;const[x]=l.splice(dragS.i,1);l.splice(i,0,x);dragS.i=null;after(ns)},
grp:(ns,v)=>{D(ns).group=v;after(ns)},reset:(ns,k)=>{D(ns)[k]=recWid(AN(ns));after(ns)},
addOpen:()=>{ui2().add=!ui2().add;W?wizRender():renderApp()},
mcOpen:(ns,id)=>{ui2().mc=ui2().mc===id?null:id;ns==='w'?wizRender():renderApp()},mcAdv:()=>{ui2().mcAdv=!ui2().mcAdv;W?wizRender():renderApp()},
mc:(ns,id,j)=>{const m=MC[id],o=[...m.main,...m.adv][j],a=AN(ns);a[m.k]=[...(eff(a)[m.k]||[])];const k=a[m.k].indexOf(o);k<0?a[m.k].push(o):a[m.k].splice(k,1);after(ns)},
adv:k=>{const u=ui2();u.adv=u.adv===k?null:k;W?wizRender():renderApp()},
ch:(ns,k,i)=>{const a=AN(ns);a[k]=[...(a[k]||[])];const o=LISTS[k][i],j=a[k].indexOf(o);j<0?a[k].push(o):a[k].splice(j,1);after(ns)},
cfadd:ns=>{const n=document.getElementById('cfn').value.trim();if(!n)return;D(ns).custom=D(ns).custom||[];D(ns).custom.push({n,e:document.getElementById('cfe').value,t:document.getElementById('cft').value,o:document.getElementById('cfo').value.trim()});after(ns)},
cfdel:(ns,i)=>{D(ns).custom.splice(i,1);after(ns)},
au:(ns,k,v)=>{D(ns).autos[k].on=v;if(ns==='c')mutate(()=>{})},aux:(ns,v)=>{D(ns).autos.stock.x=+v||0;if(ns==='c')mutate(()=>{})},
sugA:(ns,id,y)=>{const s=D(ns);if(y){const m=s.menu.find(x=>x.id===id);m?m.on=true:s.menu.push({id,on:true})}else(s.dismiss=s.dismiss||[]).push(id);after(ns)},
xadd:id=>{const n=document.getElementById('xn').value.trim();if(!n)return;const cf=(currentCompany().setup.custom||[]).filter(f=>f.e==='Módulos nuevos'),f={};cf.forEach((x,i)=>f[x.n]=document.getElementById('xf'+i).value);
mutate(c=>{c.data.extra=c.data.extra||{};(c.data.extra[id]=c.data.extra[id]||[]).unshift({n,d:document.getElementById('xd').value,f})});renderApp()},
setLv:l=>{mutate(c=>{c.setup.level=l});ui2().open=false;renderApp()},openEd:()=>{ui2().open=true;renderApp()},
sw:id=>{setSession({...getSession(),companyId:id});ui.route='dashboard';ui.coMenu=false;renderApp()},co:()=>{ui.coMenu=!ui.coMenu;renderApp()},
fresh:l=>{const c=currentCompany();const a={company:c.name,type:c.industry||'Otro',other:c.industry||'',grp:guess(c.industry||'')};a.free='';W={step:'edit',a,lv:l,qi:0,tab:'mods',edit:true,d:null};W.d=draftOf(a);wizRender()}};
/* Configuración → Personalizar empresa */
function cfgPage(){const c=currentCompany(),s=c.setup;
if(!s)return pageHead('Personalizar empresa','Esta empresa se creó antes del asistente.','')+`<section class="card settings-card"><p class="settings-intro">Nexo puede preparar una configuración recomendada para tu negocio.</p><button class="btn primary" onclick="NX.fresh('r')">Preparar configuración</button></section>`;
const lv=nl(s.level),open=lv==='m'||ui2().open,g=s.profile.grupo,on=s.menu.filter(i=>i.on);
return pageHead('Personalizar empresa','Cambia lo que quieras. Nada se pierde al cambiar de nivel.','')+`<div class="nx-cfgpage"><div class="nx-seg">${['q','r','m'].map(l=>`<button class="${cls(lv===l)}" onclick="NX.setLv('${l}')">${LVN[l]}</button>`).join('')}</div>${sugHtml('c')}<section class="card settings-card"><h3>${esc(s.profile.tipo_negocio)}</h3><div class="nx-chips ro">${on.map(i=>`<span>${esc(lab(i.id,g))}</span>`).join('')}</div>${open?'':'<div class="nx-act"><button class="btn secondary" onclick="NX.openEd()">Personalizar</button></div>'}</section>${open?`<section class="card settings-card">${editor('c')}</section>`:''}</div>`}
function coMenu(){const u=currentUser(),el=document.querySelector('.company-switch');if(!el||!u)return;el.style.cursor='pointer';el.onclick=NX.co;
if(ui.coMenu){const cs=loadDB().companies.filter(c=>(u.companyIds||[]).includes(c.id)||c.id===currentCompany()?.id);el.insertAdjacentHTML('afterend',`<div class="nx-co">${cs.map(c=>`<button onclick="NX.sw('${c.id}')">${esc(c.name)}</button>`).join('')}<button class="nx-new" onclick="ui.coMenu=false;NX.start()">+ Crear empresa</button></div>`)}}
/* El asistente solo se abre desde "Crear empresa" */
renderRegister=function(){NX.start()};
const _r=render;render=function(){if(W){if(W.pub&&location.hash!=='#register'&&!getSession()){W=null}else return wizRender()}_r()};
window.addEventListener('hashchange',()=>{if(W&&W.pub&&location.hash!=='#register')W=null;render()});
// Restaurar automáticamente una sesión guardada al abrir o recargar Nexo.
// app.js se ejecuta antes que esta capa, por lo que aquí forzamos un render final
// después de hidratar MEMORY_DB/MEMORY_SESSION desde localStorage.
if(getSession() && currentUser() && currentCompany()){
  ui.route='dashboard';
  render();
}


/* v24 — Nexo AI visible y utilizable dentro de la aplicación. */
const AI_PLAN_ORDER={Free:0,Plus:1,Pro:2,Max:3,Business:1,Start:0,Enterprise:3};
const normalizePlan=p=>({Business:'Plus',Start:'Free',Enterprise:'Max'}[p]||p||'Free');
const aiLevel=()=>AI_PLAN_ORDER[normalizePlan(currentCompany()?.plan)]??0;
const aiPlanName=()=>normalizePlan(currentCompany()?.plan);

/* Migra nombres antiguos del prototipo para que los planes actuales sean Free / Plus / Pro / Max. */
try{
  const db=loadDB();
  let changed=false;
  (db.companies||[]).forEach(c=>{const n=normalizePlan(c.plan);if(c.plan!==n){c.plan=n;changed=true}});
  if(changed)saveDB(db);
}catch(e){}

/* Nexo AI se muestra en la navegación para todos; Free puede entrar y ver el acceso bloqueado. */
if(!NAV.some(([g,items])=>items.some(x=>x[0]==='ai'))){
  const gi=NAV.findIndex(x=>x[0]==='General');
  if(gi>=0)NAV[gi][1].push(['ai','Nexo AI','✦']);
}
const oldCanAI=can;
can=function(p){if(p==='ai')return !!currentCompany();return oldCanAI(p)};

function aiSuggestions(){return [
  ['Ventas','¿Cómo van mis ventas este mes?'],
  ['Inventario','¿Qué productos debo reponer?'],
  ['Cobranza','¿Quién me debe dinero?'],
  ['Negocio','¿Qué debería atender hoy?']
]}
function aiAnswer(q){
  const d=data(),m=d.metrics||{},products=d.products||[],customers=d.customers||[],low=products.filter(p=>p.type==='Producto'&&Number(p.stock||0)<=Number(p.minStock||0)),debtors=customers.filter(c=>Number(c.balance||0)>0).sort((a,b)=>(b.balance||0)-(a.balance||0));
  const x=String(q||'').toLowerCase();
  if(/venta|vendimos|ingreso|ingresos/.test(x)) return `Este periodo llevas ${money(m.revenue)} de ingresos y una utilidad de ${money(m.profit)}, con un margen de ${pct(m.margin)}. ${Number(m.monthGrowth||0)>0?`Vas ${pct(m.monthGrowth)} arriba frente al mes anterior.`:'Puedo comparar periodos si quieres.'}`;
  if(/reponer|agot|inventario|stock|producto/.test(x)) return low.length?`Detecté ${low.length} producto${low.length===1?'':'s'} con stock bajo: ${low.slice(0,4).map(p=>`${p.name} (${p.stock} disponibles)`).join(', ')}. Te recomiendo revisar primero ${low[0].name}.`:'No detecto productos por debajo del mínimo configurado.';
  if(/debe|deben|cobrar|cobranza|pendiente/.test(x)) return debtors.length?`Tienes ${debtors.length} cuenta${debtors.length===1?'':'s'} con saldo pendiente por ${money(m.receivable)}. La mayor es ${debtors[0].name} con ${money(debtors[0].balance)}.`:'No hay cuentas por cobrar pendientes en los datos actuales.';
  if(/ganancia|utilidad|margen|gasto|gastos/.test(x)) return `Tu utilidad actual es de ${money(m.profit)} con un margen de ${pct(m.margin)}. Los gastos del periodo son ${money(m.expenses)}.`;
  if(/hoy|atender|prioridad|pendiente|tarea/.test(x)) return `Hoy conviene revisar primero las alertas de inventario, las cuentas por cobrar y las tareas pendientes. Puedo ayudarte a entrar a cualquiera de esas áreas.`;
  if(/hola|buenas|hey/.test(x)) return `Hola, ${currentUser()?.name?.split(' ')[0]||'soy yo'} 👋. Soy Nexo AI. Puedo analizar ventas, inventario, cobranza, utilidad y operación de tu empresa.`;
  return `Puedo ayudarte a analizar tu negocio. Prueba preguntarme cosas como “¿Cómo van mis ventas?”, “¿Qué productos debo reponer?” o “¿Quién me debe dinero?”.`;
}
function aiPage(){
  const c=currentCompany(),name=c?.name||'tu empresa',plan=aiPlanName(),level=aiLevel();
  if(level===0)return `${pageHead('Nexo AI','Tu asistente inteligente para entender y operar tu negocio.','')}<section class="card ai-locked"><div class="ai-orb">✦</div><div><span class="ai-badge">NEXO AI</span><h2>Disponible desde Plus</h2><p>Actualiza tu plan para preguntarle a Nexo sobre ventas, inventario, clientes y rendimiento de <strong>${esc(name)}</strong>.</p><div class="ai-lock-features"><span>✓ Análisis de ventas</span><span>✓ Inventario</span><span>✓ Cobranza</span></div><button class="btn primary" onclick="go('plans')">Ver planes</button></div></section>`;
  const msgs=ui.aiMessages||[];
  return `${pageHead('Nexo AI','Tu asistente inteligente para entender y operar tu negocio.',`<span class="badge info">Plan ${plan}</span>`)}<div class="ai-workspace"><section class="card ai-chat"><header class="ai-chat-head"><div class="ai-avatar">✦</div><div><h2>Nexo AI</h2><p>Conoce los datos de ${esc(name)} y te ayuda a interpretarlos.</p></div><span class="ai-live">● Listo</span></header><div class="ai-messages" id="aiMessages">${msgs.length?msgs.map(m=>`<div class="ai-msg ${m.role==='user'?'user':'assistant'}"><div>${m.role==='assistant'?'✦':'Tú'}</div><p>${esc(m.text)}</p></div>`).join(''):`<div class="ai-welcome"><div class="ai-orb">✦</div><h3>Hola, ${esc((currentUser()?.name||'').split(' ')[0]||'qué gusto')} 👋</h3><p>Puedo ayudarte a entender qué está pasando en tu negocio y, según tu plan, después podremos hacer acciones por ti.</p></div>`}</div><div class="ai-composer"><input id="aiInput" placeholder="Pregúntale algo a Nexo..." onkeydown="if(event.key==='Enter')NXAI.ask()"><button class="btn primary" onclick="NXAI.ask()">Preguntar</button></div><div class="ai-disclaimer">Nexo AI usa la información disponible de esta empresa. Las acciones que cambien datos requerirán confirmación.</div></section><aside class="ai-side"><section class="card"><div class="card-head"><div><h3>Prueba con esto</h3><p>Preguntas rápidas sobre tu negocio</p></div></div>${aiSuggestions().map(x=>`<button class="ai-suggestion" onclick="NXAI.ask(${JSON.stringify(x[1]).replace(/"/g,'&quot;')})"><span>${x[0]}</span><b>${x[1]}</b><i>→</i></button>`).join('')}</section><section class="card ai-plan-mini"><span class="ai-badge">PLAN ${plan.toUpperCase()}</span><h3>${level>=2?'Nexo AI avanzado':'Nexo AI'}</h3><p>${level>=3?'Copiloto empresarial, análisis profundo y automatizaciones.':level>=2?'Análisis avanzado y acciones con autorización.':'Consultas inteligentes sobre el negocio.'}</p>${level<3?`<button class="link" onclick="go('plans')">Conocer niveles de IA →</button>`:''}</section></aside></div>`;
}
window.NXAI={
  ask:q=>{
    const input=document.getElementById('aiInput'),text=String(q??input?.value??'').trim();
    if(!text)return;
    ui.aiMessages=ui.aiMessages||[];ui.aiMessages.push({role:'user',text});ui.aiMessages.push({role:'assistant',text:aiAnswer(text)});if(ui.aiMessages.length>12)ui.aiMessages=ui.aiMessages.slice(-12);renderApp();setTimeout(()=>document.getElementById('aiInput')?.focus(),0);
  },
  clear:()=>{ui.aiMessages=[];renderApp()}
};

/* La página Nexo AI se integra al router existente. */
const _renderPageAI=renderPage;
renderPage=function(){if(ui.route==='ai')return aiPage();return _renderPageAI()};

/* Inserta Nexo AI en Inicio sin convertir el dashboard en un chat gigante. */
const _dashboardAI=dashboard;
dashboard=function(){
  const html=_dashboardAI();
  const c=currentCompany(),level=aiLevel();
  const card=level===0?`<section class="card ai-dashboard-card locked"><div class="ai-dashboard-icon">✦</div><div><span class="ai-badge">NEXO AI</span><h3>Tu asistente inteligente</h3><p>Disponible desde Plus. Pregunta sobre ventas, inventario, clientes y rendimiento.</p></div><button class="btn secondary" onclick="go('plans')">Ver Plus</button></section>`:`<section class="card ai-dashboard-card"><div class="ai-dashboard-icon">✦</div><div class="ai-dashboard-main"><span class="ai-badge">NEXO AI · ${aiPlanName().toUpperCase()}</span><h3>Pregúntale a Nexo</h3><p>Obtén respuestas sobre tu negocio sin salir del resumen ejecutivo.</p><div class="ai-quick-row">${aiSuggestions().slice(0,3).map(x=>`<button onclick="NXAI.ask(${JSON.stringify(x[1]).replace(/"/g,'&quot;')});go('ai')">${x[1]}</button>`).join('')}</div></div><button class="btn primary" onclick="go('ai')">Abrir Nexo AI</button></section>`;
  return html.replace('</div><div class="dashboard-grid">',`</div>${card}<div class="dashboard-grid">`);
};

render();
})();

/* v26 — personalización real por modelo de empresa + selector de planes funcional */
(()=>{
  /* Planes es una sección disponible para cualquier propietario; no depende de los módulos del negocio. */
  if(!PERMISSIONS.includes('plans')) PERMISSIONS.push('plans');
  if(!NAV.some(([g,items])=>items.some(x=>x[0]==='plans'))){
    const eg=NAV.find(x=>x[0]==='Empresa');
    if(eg)eg[1].push(['plans','Planes','◈']);
  }
  const _canPlan=can;
  can=function(p){return p==='plans'?true:_canPlan(p)};

  /* Más variables de negocio para que dos empresas del mismo giro no queden iguales. */
  Q.push(
    {id:'size',q:'¿Qué tamaño tiene tu operación?',opts:['Emprendimiento / 1 persona','Pequeña / 2–10 personas','Mediana / 11–50 personas','Grande / 51+ personas']},
    {id:'operation',q:'¿Cómo funciona principalmente tu operación?',opts:['Venta rápida / mostrador','Pedidos y seguimiento','Proyectos / trabajos por etapas','Producción / fabricación','Mixta']},
    {id:'control',when:a=>prod(a),q:'¿Qué tan detallado quieres el control de inventario?',opts:['Básico','Con movimientos y mínimos','Avanzado por almacén / lote / variante']},
    {id:'billing',q:'¿Qué tan importante es el control administrativo?',opts:['Solo lo esencial','Ventas, gastos y cobranza','Control financiero y administrativo completo']}
  );

  const _eff=eff;
  eff=function(a){
    const b=_eff(a); b.size=a.size||'Pequeña / 2–10 personas'; b.operation=a.operation||'Venta rápida / mostrador'; b.control=a.control||'Básico'; b.billing=a.billing||'Solo lo esencial';
    if(b.size.includes('Grande')){b.team='Sí';b.billing='Control financiero y administrativo completo';b.control='Avanzado por almacén / lote / variante';}
    if(b.size.includes('Mediana')){b.team='Sí';if(b.billing==='Solo lo esencial')b.billing='Ventas, gastos y cobranza';}
    return b;
  };

  const _build=build;
  build=function(a){
    const p=_build(a), size=a.size||'Pequeña / 2–10 personas', op=a.operation||'Venta rápida / mostrador', control=a.control||'Básico', billing=a.billing||'Solo lo esencial';
    p.tamano=size; p.operacion=op; p.control_inventario=control; p.control_administrativo=billing;
    p.multi_almacen=/Avanzado/.test(control)||/Mediana|Grande/.test(size);
    p.aprobaciones=/Mediana|Grande/.test(size)||billing.includes('completo');
    p.finance=billing!=='Solo lo esencial';
    p.compras_avanzadas=p.proveedores && (billing!=='Solo lo esencial'||/Producción/.test(op));
    p.proyectos=/Proyectos/.test(op);
    p.produccion=/Producción/.test(op);
    return p;
  };

  const _modsFrom=modsFrom;
  modsFrom=function(p){
    const m=_modsFrom(p);
    if(p.finance)m.finance=true;
    if(p.compras_avanzadas)m.purchases=m.suppliers=m.payables=true;
    if(p.multi_almacen)m.warehouses=m.inventory=true;
    if(p.aprobaciones)m.approvals=true;
    if(p.proyectos)m.quotes=m.orders=m.tasks=true;
    if(p.produccion){m.inventory=m.products=m.purchases=m.suppliers=true;}
    if(p.tamano&&/Grande/.test(p.tamano)){m.users=m.roles=m.security=m.reports=true;}
    return m;
  };

  const _recMenu=recMenu;
  recMenu=function(a){
    const base=_recMenu(a),p=build(eff(a)),ids=new Set(base.map(x=>x.id));
    const extra=[];
    if(p.finance)extra.push('finance');
    if(p.aprobaciones)extra.push('approvals');
    if(p.proyectos)extra.push('quotes','orders','tasks');
    if(p.produccion)extra.push('inventory','purchases','suppliers');
    return [...base,...extra.filter(id=>!ids.has(id)).map(id=>({id,on:true}))];
  };

  /* Vista de planes: ahora sí permite cambiar el plan y ver inmediatamente cómo cambia Nexo. */
  const PLAN_UI={
    Free:{price:'$0',desc:'Para empezar y probar la operación básica.',ai:'Sin Nexo AI',tag:'Para comenzar',tone:'free'},
    Plus:{price:'$299/mes',desc:'Para negocios que quieren automatización y análisis.',ai:'Nexo AI incluido',tag:'Más elegido',tone:'plus'},
    Pro:{price:'$599/mes',desc:'Para equipos con operación y control más completos.',ai:'Nexo AI avanzado',tag:'Operación profesional',tone:'pro'},
    Max:{price:'$999/mes',desc:'Para empresas que necesitan máxima capacidad.',ai:'Nexo AI + automatización',tag:'Máximo control',tone:'max'}
  };
  const PLAN_FEATURES={
    Free:['Ventas básicas','Clientes y productos','Dashboard esencial','1 empresa / operación básica'],
    Plus:['Todo Free','Nexo AI','Inventario y compras','Reportes ampliados'],
    Pro:['Todo Plus','Equipos y permisos avanzados','Finanzas y aprobaciones','Automatizaciones'],
    Max:['Todo Pro','Multi-sucursal avanzada','Controles empresariales','Mayor capacidad de IA']
  };
  window.NXPlan={
    select(plan){
      const allowed=['Free','Plus','Pro','Max'];
      if(!allowed.includes(plan))return toast('Plan no disponible');
      const db=loadDB(),session=getSession(),c=db.companies.find(x=>x.id===session?.companyId);
      if(!c)return;
      const previous=normalizePlan(c.plan||'Free');
      c.plan=plan;
      c.planUpdatedAt=nowISO();
      c.planHistory=[...(c.planHistory||[]),{from:previous,to:plan,at:c.planUpdatedAt}].slice(-20);
      saveDB(db);
      ui.planPreview=null;
      ui.toast=previous===plan?`Ya estás en ${plan}`:`Plan cambiado: ${previous} → ${plan}`;
      ui.route='plans';
      renderApp();
    },
    preview(plan){
      const c=currentCompany();
      ui.planPreview=plan;
      ui.planPreviewCompany=c?.name||'Tu empresa';
      renderApp();
    },
    close(){ui.planPreview=null;renderApp()}
  };
  plansPage=function(){
    const c=currentCompany(),current=normalizePlan(c?.plan||'Free'),p=PLAN_UI;
    const cards=Object.keys(p).map((name,i)=>{const x=p[name],active=current===name;return `<article class="nx-plan-card ${active?'active':''} ${x.tone}">
      ${active?'<span class="nx-plan-current">PLAN ACTUAL</span>':(name==='Plus'?'<span class="nx-plan-popular">RECOMENDADO</span>':'')}
      <div class="nx-plan-top"><div><h3>${name}</h3><small>${x.tag}</small></div><strong>${x.price}</strong></div>
      <p>${x.desc}</p><div class="nx-plan-ai">✦ ${x.ai}</div><ul>${PLAN_FEATURES[name].map(f=>`<li>✓ ${f}</li>`).join('')}</ul>
      <div class="nx-plan-actions"><button class="btn secondary" onclick="NXPlan.preview('${name}')">Ver cómo se ve</button><button class="btn ${active?'secondary':'primary'}" onclick="NXPlan.select('${name}')">${active?'Actual':'Usar este plan'}</button></div>
    </article>`}).join('');
    const preview=ui.planPreview?`<div class="nx-plan-preview-backdrop" onclick="NXPlan.close()"><section class="nx-plan-preview" onclick="event.stopPropagation()"><button class="nx-plan-preview-close" onclick="NXPlan.close()">×</button><span class="ai-badge">VISTA PREVIA · ${ui.planPreview.toUpperCase()}</span><h2>Así se vería Nexo con ${ui.planPreview}</h2><p>Esta vista es interactiva: puedes recorrer el plan sin cambiarlo. Para aplicarlo, usa “Usar este plan”.</p><div class="nx-preview-kpis">${[['Ventas','$184,520'],['Utilidad','$62,840'],['IA',PLAN_UI[ui.planPreview].ai],['Equipo',ui.planPreview==='Free'?'1 usuario':ui.planPreview==='Plus'?'5 usuarios':'Usuarios ampliados']].map(x=>`<div><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('')}</div><div class="nx-preview-modules">${PLAN_FEATURES[ui.planPreview].map(x=>`<span>✓ ${x}</span>`).join('')}</div><div class="nx-preview-fake-nav"><b>Resumen</b><span>Ventas</span><span>Inventario</span><span>Clientes</span><span>Reportes</span><span class="locked">✦ Nexo AI</span></div><button class="btn primary" onclick="NXPlan.select('${ui.planPreview}')">Aplicar ${ui.planPreview} a esta empresa</button></section></div>`:'';
    return `${pageHead('Planes','Cambia el plan, pruébalo visualmente y decide cuál encaja mejor con tu empresa.','')}<div class="nx-plan-current-bar"><div><small>EMPRESA ACTUAL</small><strong>${esc(c?.name||'Tu empresa')}</strong></div><div><small>PLAN ACTUAL</small><b>${current}</b></div><span>Los cambios se aplican en esta sesión.</span></div><div class="nx-plan-grid">${cards}</div><section class="card ai-cost-card"><div><span class="ai-badge">✦ Nexo AI</span><h3>La IA también cambia según el plan</h3><p>Free la mantiene bloqueada; Plus agrega consultas, Pro añade análisis y acciones, y Max agrega capacidades avanzadas.</p></div></section>${preview}`;
  };

  /* Evita que el cambio de plan deje la IA o módulos con información antigua en pantalla. */
  const _renderApp26=renderApp;
  renderApp=function(){
    const c=currentCompany();
    if(c?.setup){
      c.setup.profile=build(eff(c.setup.answers||{}));
      c.setup.menu=recMenu(c.setup.answers||{});
      c.modules=modsOf(c.setup.menu);
    }
    _renderApp26();
  };
})();
