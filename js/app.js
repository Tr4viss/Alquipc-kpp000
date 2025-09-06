// ALQUIPC - app.js (multi-page)

// Constantes de negocio
const PRECIO_DIA_EQUIPO = 35000;
const AJUSTES_UBICACION = {
  'dentro-ciudad': 1.00,
  'fuera-ciudad': 1.05,
  'dentro-establecimiento': 0.95
};

// Helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const currency = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);

// LocalStorage keys
const LS_INVOICES = 'alquipc_invoices_v1';
const LS_CLIENTS = 'alquipc_clients_v1';

function uid(prefix='id') { return prefix + '-' + Date.now() + '-' + Math.floor(Math.random()*9999); }

function loadInvoices(){ try{return JSON.parse(localStorage.getItem(LS_INVOICES) || '[]'); }catch(e){return []} }
function saveInvoices(arr){ localStorage.setItem(LS_INVOICES, JSON.stringify(arr)); }

function loadClients(){ try{return JSON.parse(localStorage.getItem(LS_CLIENTS) || '[]'); }catch(e){return []} }
function saveClients(arr){ localStorage.setItem(LS_CLIENTS, JSON.stringify(arr)); }

// Cálculo lógica (misma que enunciado)
function calcularFactura({equipos,diasIniciales,diasAdicionales,ubicacion}){
  const diasTotales = Number(diasIniciales) + Number(diasAdicionales);
  const subtotalBase = Number(equipos) * diasTotales * PRECIO_DIA_EQUIPO;
  const factorUbic = AJUSTES_UBICACION[ubicacion] ?? 1;
  const montoUbic = Math.round(subtotalBase * (factorUbic - 1));
  const subtotalConUb = subtotalBase + montoUbic;
  const descuentoPct = Math.min(0.02 * Number(diasAdicionales), 0.20);
  const montoDescuento = Math.round(subtotalConUb * descuentoPct);
  const total = Math.max(0, Math.round(subtotalConUb - montoDescuento));
  return {diasTotales, subtotalBase, montoUbic, descuentoPct, montoDescuento, total};
}

function renderReciboTemplate(inputs, calc){
  const ubicLab = {'dentro-ciudad':'Dentro de la ciudad','fuera-ciudad':'Fuera de la ciudad (+5%)','dentro-establecimiento':'Dentro del establecimiento (-5%)'}[inputs.ubicacion] || inputs.ubicacion;
  return `
    <div class="row"><div><strong>Cliente</strong></div><div>${inputs.idCliente || 'N/A'}</div></div>
    <div class="row"><div><strong>Equipos</strong></div><div>${inputs.equipos}</div></div>
    <div class="row"><div><strong>Días</strong></div><div>${inputs.diasIniciales} + ${inputs.diasAdicionales} = <span class="small">${calc.diasTotales}</span></div></div>
    <div class="row"><div><strong>Ubicación</strong></div><div>${ubicLab}</div></div>
    <div class="row"><div>Precio base</div><div>${currency(PRECIO_DIA_EQUIPO)} / eq/día</div></div>
    <div class="row"><div>Subtotal base</div><div>${currency(calc.subtotalBase)}</div></div>
    <div class="row"><div>Ajuste ubicación</div><div>${calc.montoUbic>=0?'+':''}${currency(calc.montoUbic)}</div></div>
    <div class="row"><div>Descuento (${(calc.descuentoPct*100).toFixed(0)}%)</div><div>-${currency(calc.montoDescuento)}</div></div>
    <div class="row"><div><strong>Total</strong></div><div><strong>${currency(calc.total)}</strong></div></div>
  `;
}

// Páginas: facturación
function setupFacturacionPage(){
  const form = $('#formFactura');
  if(!form) return;
  const reciboEl = $('#recibo');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const inputs = {
      idCliente: $('#idCliente').value.trim(),
      equipos: Number($('#equipos').value),
      diasIniciales: Number($('#diasIniciales').value),
      diasAdicionales: Number($('#diasAdicionales').value),
      ubicacion: $('#ubicacion').value
    };
    const errores = [];
    if(!inputs.idCliente) errores.push('Indica un ID de cliente (puedes crearlo en Clientes).');
    if(!(inputs.equipos >= 2)) errores.push('Mínimo 2 equipos.');
    if(!(inputs.diasIniciales >= 1)) errores.push('Los días iniciales deben ser al menos 1.');
    if(inputs.diasAdicionales < 0) errores.push('Días adicionales inválidos.');
    if(errores.length){ reciboEl.innerHTML = `<p class="small" style="color:#f05b5b">${errores.join('<br/>')}</p>`; return; }

    const calc = calcularFactura(inputs);
    reciboEl.innerHTML = renderReciboTemplate(inputs, calc);

    // Guardar factura en localStorage
    const invoices = loadInvoices();
    const invoice = {
      id: uid('inv'),
      cliente: inputs.idCliente,
      equipos: inputs.equipos,
      diasIniciales: inputs.diasIniciales,
      diasAdicionales: inputs.diasAdicionales,
      ubicacion: inputs.ubicacion,
      fecha: new Date().toISOString(),
      resumen: { ...calc }
    };
    invoices.unshift(invoice);
    saveInvoices(invoices);

    // preparar mailto y UI
    $('#btnMail').href = `mailto:?subject=${encodeURIComponent('Recibo ALQUIPC - ' + invoice.cliente)}&body=${encodeURIComponent(stripHtml(reciboEl.innerHTML))}`;
    toast('Factura guardada en historial.');
  });

  $('#btnCopiar')?.addEventListener('click', ()=>{
    const text = stripHtml($('#recibo').innerHTML);
    navigator.clipboard.writeText(text).then(()=>toast('Recibo copiado')).catch(()=>alert('No se pudo copiar'));
  });
  $('#btnPrint')?.addEventListener('click', ()=> window.print());
}

// Historial page
function renderHistorialTable(){
  const container = $('#tblContainer');
  if(!container) return;
  const invoices = loadInvoices();
  if(!invoices.length){ container.innerHTML = '<p class="small">No hay facturas guardadas.</p>'; return; }
  let html = '<table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acciones</th></tr></thead><tbody>';
  invoices.forEach(inv=>{
    html += `<tr><td>${inv.id}</td><td>${inv.cliente}</td><td>${new Date(inv.fecha).toLocaleString()}</td><td>${currency(inv.resumen.total)}</td><td><button class="btn btn-ghost btn-view" data-id="${inv.id}">Ver</button> <button class="btn btn-ghost btn-del" data-id="${inv.id}">Borrar</button></td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;

  $$('.btn-del').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    if(!confirm('Borrar factura ' + id + ' ?')) return;
    let invoices = loadInvoices();
    invoices = invoices.filter(i=>i.id !== id);
    saveInvoices(invoices);
    renderHistorialTable();
  }));

  $$('.btn-view').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    const inv = loadInvoices().find(x=>x.id===id);
    if(!inv) return alert('No encontrada');
    const win = window.open('', '_blank', 'width=600,height=600');
    win.document.write(`<pre style="font-family:monospace">${JSON.stringify(inv,null,2)}</pre>`);
  }));
}

// Clientes page
function setupClientesPage(){
  const form = $('#formCliente');
  if(!form) return;
  const list = $('#clientesList');
  function renderClients(){
    const clients = loadClients();
    if(!clients.length){ list.innerHTML = '<p class="small">No hay clientes.</p>'; return; }
    let html = '<ul>';
    clients.forEach(c=> html += `<li><strong>${c.nombre}</strong> · ${c.id} · <span class="small">${c.email||''}</span> <button class="btn btn-ghost btn-del" data-id="${c.id}">Borrar</button></li>`);
    html += '</ul>';
    list.innerHTML = html;
    $$('.btn-del').forEach(b=> b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      if(!confirm('Borrar cliente ' + id + ' ?')) return;
      const clients = loadClients().filter(x=> x.id !== id);
      saveClients(clients);
      renderClients();
    }));
  }
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const nombre = $('#clienteNombre').value.trim();
    const id = $('#clienteId').value.trim();
    const email = $('#clienteEmail').value.trim();
    if(!nombre || !id){ alert('Nombre e ID son obligatorios'); return; }
    const clients = loadClients();
    if(clients.some(c=> c.id === id)){ alert('Ya existe un cliente con ese ID'); return; }
    clients.unshift({nombre, id, email, creado: new Date().toISOString()});
    saveClients(clients);
    form.reset();
    renderClients();
    toast('Cliente guardado');
  });
  renderClients();
}

// Página index / utilidades
function setupIndexPage(){
  $('#btnExportAll')?.addEventListener('click', ()=>{
    const payload = { invoices: loadInvoices(), clients: loadClients(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'alquipc_export_'+Date.now()+'.json'; a.click();
    URL.revokeObjectURL(url);
  });
}

// Utilities
function stripHtml(html){ const tmp = document.createElement('div'); tmp.innerHTML = html; return (tmp.textContent||tmp.innerText||'').trim(); }
function toast(msg){ const t = document.createElement('div'); t.textContent = msg; t.style.position='fixed'; t.style.bottom='18px'; t.style.left='50%'; t.style.transform='translateX(-50%)'; t.style.padding='8px 12px'; t.style.background='#23273a'; t.style.border='1px solid rgba(255,255,255,.08)'; t.style.borderRadius='10px'; t.style.zIndex=9999; document.body.appendChild(t); setTimeout(()=>t.remove(),1800); }

// Inicializador según página
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.getAttribute('data-page');
  if(page === 'facturacion') setupFacturacionPage();
  if(page === 'historial') { renderHistorialTable(); $('#btnClearAll')?.addEventListener('click', ()=>{ if(confirm('Borrar todo el historial?')){ saveInvoices([]); renderHistorialTable(); } }); }
  if(page === 'clientes') setupClientesPage();
  if(page === 'index') setupIndexPage();

  // activar link sidebar según página
  $$('.nav-link').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href').endsWith(page + '.html') || (page==='index' && a.getAttribute('href').endsWith('index.html')));
  });
});
