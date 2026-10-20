"use strict";
/* Documentos: modelos por foto, pedidos de exame e receitas.
   Usa as funções globais de index.html ($, esc, store, idx, page, nav, toast...). */

const FTYPES = {nome:"Nome da paciente", sus:"Cartão SUS", idade:"Idade", data:"Data", endereco:"Endereço",
  medico:"Médico (nome e CRM)", conteudo:"Conteúdo principal", obs:"Indicação clínica / CID"};
const FDEF = {nome:{w:50,h:3.6,fs:.022}, sus:{w:30,h:3.6,fs:.022}, idade:{w:14,h:3.6,fs:.022}, data:{w:18,h:3.6,fs:.022},
  endereco:{w:50,h:3.6,fs:.02}, medico:{w:40,h:6,fs:.02}, conteudo:{w:84,h:45,fs:.024}, obs:{w:84,h:6,fs:.02}};
const mk = (tipo,x,y,w,h,fs) => ({id:uid(),tipo,x,y,w,h,fs:fs||FDEF[tipo].fs});
const PADRAO = [
  {id:"padrao_exames", nome:"Padrão · pedido de exames", tipo:"exames", img:"", ratio:1.414, titulo:"SOLICITAÇÃO DE EXAMES", padrao:1,
   campos:[mk("nome",8,12,60,3.4), mk("idade",70,12,22,3.4), mk("sus",8,17,50,3.4), mk("data",70,17,22,3.4), mk("obs",8,23,84,5,.02),
           mk("conteudo",8,31,84,52), mk("medico",50,90,42,6)]},
  {id:"padrao_receita", nome:"Padrão · receituário", tipo:"receita", img:"", ratio:1.414, titulo:"RECEITUÁRIO", padrao:1,
   campos:[mk("nome",8,12,60,3.4), mk("idade",70,12,22,3.4), mk("data",70,17,22,3.4), mk("conteudo",8,25,84,58), mk("medico",50,90,42,6)]}
];
const PACOTES = {
  "Pré-natal · 1º trimestre":["HEMOGRAMA COMPLETO","TIPAGEM SANGUÍNEA ABO/RH","GLICEMIA DE JEJUM","VDRL","ANTI-HIV","HBSAG","ANTI-HCV","TOXOPLASMOSE IGG E IGM","EAS","UROCULTURA COM ANTIBIOGRAMA","TSH","USG OBSTÉTRICO"],
  "Pré-natal · 2º trimestre":["TOTG 75G (JEJUM, 1H, 2H)","HEMOGRAMA COMPLETO","EAS","UROCULTURA COM ANTIBIOGRAMA","USG MORFOLÓGICO"],
  "Pré-natal · 3º trimestre":["HEMOGRAMA COMPLETO","GLICEMIA DE JEJUM","VDRL","ANTI-HIV","HBSAG","TOXOPLASMOSE IGG E IGM","EAS","UROCULTURA COM ANTIBIOGRAMA","USG OBSTÉTRICO COM DOPPLER","CULTURA PARA STREPTOCOCCUS AGALACTIAE (35-37 SEMANAS)"],
  "Ginecologia · rotina":["CITOLOGIA ONCÓTICA","MAMOGRAFIA BILATERAL","USG TRANSVAGINAL","HEMOGRAMA COMPLETO","GLICEMIA DE JEJUM","TSH"],
  "Climatério":["FSH","ESTRADIOL","TSH","PERFIL LIPÍDICO","GLICEMIA DE JEJUM","MAMOGRAFIA BILATERAL","USG TRANSVAGINAL","DENSITOMETRIA ÓSSEA"],
  "Pré-operatório":["HEMOGRAMA COMPLETO","COAGULOGRAMA","GLICEMIA DE JEJUM","UREIA","CREATININA","TIPAGEM SANGUÍNEA ABO/RH","ECG"]
};
const EXAMES = ["HEMOGRAMA COMPLETO","TIPAGEM SANGUÍNEA ABO/RH","COOMBS INDIRETO","GLICEMIA DE JEJUM","TOTG 75G","HEMOGLOBINA GLICADA","VDRL","FTA-ABS","ANTI-HIV","HBSAG","ANTI-HBS","ANTI-HCV",
  "TOXOPLASMOSE IGG E IGM","RUBÉOLA IGG E IGM","CITOMEGALOVÍRUS IGG E IGM","EAS","UROCULTURA COM ANTIBIOGRAMA","PARASITOLÓGICO DE FEZES","TSH","T4 LIVRE","FSH","LH","ESTRADIOL","PROGESTERONA","PROLACTINA",
  "TESTOSTERONA TOTAL","SDHEA","17-OH PROGESTERONA","BETA-HCG QUANTITATIVO","CA-125","PERFIL LIPÍDICO","TGO","TGP","CREATININA","UREIA","ÁCIDO ÚRICO","LDH","RELAÇÃO PROTEÍNA/CREATININA EM URINA ISOLADA",
  "PROTEINÚRIA DE 24H","COAGULOGRAMA","FERRITINA","FERRO SÉRICO","VITAMINA D","VITAMINA B12","CITOLOGIA ONCÓTICA","COLPOSCOPIA","BACTERIOSCOPIA DE SECREÇÃO VAGINAL","CULTURA DE SECREÇÃO VAGINAL","PCR PARA CHLAMYDIA/GONOCOCO",
  "MAMOGRAFIA BILATERAL","USG DE MAMAS","USG TRANSVAGINAL","USG PÉLVICO","USG OBSTÉTRICO","USG OBSTÉTRICO COM DOPPLER","USG MORFOLÓGICO","ECOCARDIOGRAMA FETAL","PERFIL BIOFÍSICO FETAL","CARDIOTOCOGRAFIA",
  "HISTEROSSALPINGOGRAFIA","HISTEROSCOPIA DIAGNÓSTICA","RESSONÂNCIA MAGNÉTICA DE PELVE","DENSITOMETRIA ÓSSEA","ECG","RX DE TÓRAX","AVALIAÇÃO CARDIOLÓGICA","AVALIAÇÃO ANESTESIOLÓGICA"];

/* ---------- dados auxiliares ---------- */
let MOD=null, FAV=null;
async function getModelos(){ if(!MOD) MOD=(await store.loadAux("modelos.json"))||[]; return [...PADRAO,...MOD]; }
async function getFav(){ if(!FAV) FAV=(await store.loadAux("favoritos.json"))||{exames:[],receita:[]}; return FAV; }

/* ---------- estilos ---------- */
document.head.insertAdjacentHTML("beforeend",`<style id="docstyle">
.dpage{position:relative;background:#fff;container-type:inline-size;overflow:hidden;margin:0 auto;box-shadow:var(--sh);color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.dpage .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none;pointer-events:none}
.dtitle{position:absolute;left:8%;right:8%;top:4%;text-align:center;font:700 3.2cqw Arial,sans-serif;border-bottom:.35cqw solid #000;padding-bottom:1cqw}
.dfield{position:absolute;overflow:hidden;white-space:pre-wrap;line-height:1.25;font-family:Arial,sans-serif;color:#000;box-sizing:border-box}
.dpage.edit .dfield{outline:1.5px dashed #0e7c86;background:rgba(14,124,134,.14);cursor:move;overflow:visible;touch-action:none}
.dpage.edit .dfield.sel{outline:2px solid #0e7c86;background:rgba(14,124,134,.28)}
.dpage.edit .dfield .tg{position:absolute;left:0;top:-16px;font:600 10px Inter,sans-serif;background:#0e7c86;color:#fff;padding:1px 6px;border-radius:3px;white-space:nowrap;pointer-events:none}
.dpage.edit .dfield .hd{position:absolute;right:-6px;bottom:-6px;width:12px;height:12px;background:#0e7c86;border-radius:3px;cursor:nwse-resize}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.mcard{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:12px;box-shadow:var(--sh);display:flex;flex-direction:column;gap:8px}
.mcard .th{background:var(--bg);border-radius:8px;padding:8px;height:230px;overflow:hidden}
.mcard .th .dpage{width:100%;max-width:160px}
.edgrid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:16px;align-items:start}
.stage{background:var(--bg);border-radius:12px;padding:14px}
.stage .dpage{max-width:640px;touch-action:none}
.pk{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.chip .x{margin-left:6px;opacity:.7}
@media print{.dpage{box-shadow:none;margin:0;page-break-after:always;break-after:page}.dpage:last-child{page-break-after:auto}}
@media (max-width:1000px){.edgrid{grid-template-columns:1fr}}
</style>`);
window.addEventListener("afterprint",()=>{ $("#pgstyle")?.remove(); });
function imprimirDoc(html){ $("#print").innerHTML=html; document.head.insertAdjacentHTML("beforeend",`<style id="pgstyle">@page{size:A4;margin:0}</style>`); window.print(); }

/* ---------- renderização da página ---------- */
const AMOSTRA = {nome:"MARIA DA SILVA SANTOS", sus:"700000000000000", idade:"35 anos", data:fmtData(hoje()), endereco:"RUA EXEMPLO, 123 – CENTRO",
  medico:"Dr. Fulano de Tal\nCRM 00000", conteudo:"HEMOGRAMA COMPLETO\nGLICEMIA DE JEJUM\nUSG TRANSVAGINAL", obs:"CID: Z34.9"};
function valoresDoc(p,texto,obs){
  const f=perfil(), idade=idadeDe(p);
  return {nome:p.nome, sus:p.sus||"", idade:idade?idade+" anos":"", data:fmtData(hoje()), endereco:[p.residencia,p.procedencia].filter(Boolean).join(" – "),
    medico:[f.nome, f.crm&&"CRM "+f.crm].filter(Boolean).join("\n"), conteudo:texto||"", obs:obs||""};
}
function paginaHTML(m,vals,o={}){
  const mm=Math.min(210,297/m.ratio), edit=!!o.edit;
  const size=(edit||o.fluid)?`width:100%;aspect-ratio:1/${m.ratio}`:`width:${mm}mm;height:${(mm*m.ratio).toFixed(1)}mm`;
  let h=`<div class="dpage${edit?" edit":""}" style="${size}">`;
  if(m.img&&!o.semFundo) h+=`<img class="bg" src="${m.img}" alt="">`;
  else if(!m.img&&m.titulo) h+=`<div class="dtitle">${esc(m.titulo)}</div>`;
  for(const f of m.campos){
    h+=`<div class="dfield${o.sel===f.id?" sel":""}" data-id="${f.id}" style="left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.h}%;font-size:${(f.fs*100).toFixed(2)}cqw">${esc(vals[f.tipo]||"")}${edit?`<span class="tg">${esc(FTYPES[f.tipo])}</span><i class="hd"></i>`:""}</div>`;
  }
  return h+`</div>`;
}

/* ---------- lista de modelos ---------- */
async function telaModelos(){
  page.innerHTML=`<p class="mut">Carregando…</p>`;
  const ms=await getModelos();
  page.innerHTML=`<div class="row between" style="margin-bottom:16px"><h2>Modelos de documentos</h2>
    <button class="btn" id="mNovo">${lab("plus","Novo modelo a partir de foto")}</button></div>
    <p class="mut" style="margin-top:-6px">Fotografe ou escaneie o pedido de exames ou a receita da sua unidade. O sistema usa a imagem como fundo e preenche os campos nos lugares certos na hora de imprimir.</p>
    <div class="mgrid">${ms.map(m=>`<div class="mcard"><div class="th">${paginaHTML(m,AMOSTRA,{fluid:true})}</div>
      <div><b>${esc(m.nome)}</b><br><span class="tag ${m.tipo==="receita"?"pri":"warn"}">${m.tipo==="receita"?"Receita":m.tipo==="exames"?"Pedido de exames":"Outro"}</span> ${m.padrao?`<span class="tag">padrão</span>`:""}</div>
      <div class="row"><button class="btn sec sm" data-ed="${m.id}">${lab("edit",m.padrao?"Personalizar":"Editar")}</button>
      ${m.padrao?"":`<button class="btn danger sm" data-del="${m.id}">${ic("trash")}</button>`}</div></div>`).join("")}</div>`;
  $("#mNovo").onclick=()=>editorModelo(null);
  $$("[data-ed]",page).forEach(b=>b.onclick=()=>editorModelo(ms.find(m=>m.id===b.dataset.ed)));
  $$("[data-del]",page).forEach(b=>b.onclick=async()=>{ if(!confirm("Excluir este modelo?")) return;
    MOD=MOD.filter(m=>m.id!==b.dataset.del); await store.saveAux("modelos.json",MOD); telaModelos(); });
}

/* ---------- imagem ---------- */
function carregarImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function arquivoParaImg(file){
  const src=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
  const im=await carregarImg(src), s=Math.min(1,1500/im.width), c=document.createElement("canvas");
  c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  return c;
}
const canvasParaUrl = c => c.toDataURL("image/jpeg",.8);
async function girarImg(url,graus){
  const im=await carregarImg(url), c=document.createElement("canvas"), r=Math.abs(graus)===90;
  c.width=r?im.height:im.width; c.height=r?im.width:im.height; const x=c.getContext("2d");
  x.translate(c.width/2,c.height/2); x.rotate(graus*Math.PI/180); x.drawImage(im,-im.width/2,-im.height/2); return c;
}
async function melhorarImg(url){
  const im=await carregarImg(url), c=document.createElement("canvas"); c.width=im.width; c.height=im.height;
  const x=c.getContext("2d"); x.drawImage(im,0,0); const d=x.getImageData(0,0,c.width,c.height), a=d.data, hist=new Array(256).fill(0);
  for(let i=0;i<a.length;i+=4){ const g=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)|0; a[i]=a[i+1]=a[i+2]=g; hist[g]++; }
  const tot=c.width*c.height; let lo=0,hi=255,s=0; for(;lo<255;lo++){ s+=hist[lo]; if(s>tot*.02) break; } s=0; for(;hi>0;hi--){ s+=hist[hi]; if(s>tot*.25) break; }
  hi=Math.max(hi,lo+40);
  for(let i=0;i<a.length;i+=4){ const v=Math.max(0,Math.min(255,(a[i]-lo)*255/(hi-lo))); a[i]=a[i+1]=a[i+2]=v; }
  x.putImageData(d,0,0); return c;
}

/* ---------- OCR (opcional) ---------- */
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"");
async function carregarTesseract(){
  if(window.Tesseract) return;
  await new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"; s.onload=res; s.onerror=()=>rej(new Error("Não foi possível carregar o OCR")); document.head.appendChild(s); });
}
async function ocrSugerir(m){
  await carregarTesseract();
  const im=await carregarImg(m.img), W=im.width, H=im.height;
  const r=await Tesseract.recognize(m.img,"por");
  const words=(r.data.words||[]).map(w=>({t:norm(w.text),x0:w.bbox.x0,y0:w.bbox.y0,x1:w.bbox.x1,y1:w.bbox.y1})).filter(w=>w.t);
  const first=(...keys)=>words.find(w=>keys.some(k=>w.t.startsWith(k)));
  const novos=[]; const linha=(tipo,w,larg)=>{ if(!w) return; const h=(w.y1-w.y0);
    novos.push({id:uid(),tipo,x:+((w.x1+W*.01)/W*100).toFixed(1),y:+(Math.max(0,w.y0-h*.2)/H*100).toFixed(1),w:Math.min(larg,100-(w.x1+W*.01)/W*100-2),h:+(h*1.5/H*100).toFixed(1),fs:+Math.max(.014,Math.min(.035,h/W*1.15)).toFixed(3)}); };
  linha("nome",first("nome","paciente"),60); linha("sus",first("sus")||first("cartao"),36); linha("idade",first("idade"),16);
  linha("data",words.find(w=>w.t==="data"||w.t==="date"),20); linha("endereco",first("endereco","residencia"),50);
  const abaixo=words.filter(w=>w.y0>H*.18&&["exame","solicit","prescri","rp","uso"].some(k=>w.t.startsWith(k)));
  const lc=abaixo[0]||null;
  const base=Math.max(0,...novos.map(n=>n.y+n.h));
  if(lc&&lc.y1/H*100<base) lc.y1=(base+1)/100*H;
  if(lc) novos.push({id:uid(),tipo:"conteudo",x:8,y:+((lc.y1+H*.01)/H*100).toFixed(1),w:84,h:+Math.max(20,Math.min(55,80-(lc.y1/H*100))).toFixed(1),fs:.024});
  if(!novos.length) return 0;
  const tipos=new Set(novos.map(n=>n.tipo)); m.campos=[...m.campos.filter(c=>!tipos.has(c.tipo)),...novos];
  return novos.length;
}

/* ---------- editor de modelo ---------- */
function editorModelo(orig){
  const m=orig?JSON.parse(JSON.stringify(orig)):{id:uid(),nome:"Novo modelo",tipo:"exames",img:"",ratio:1.414,campos:[]};
  if(orig?.padrao){ m.id=uid(); m.nome=orig.nome.replace("Padrão · ","")+" (meu)"; delete m.padrao; }
  let sel=null;
  page.innerHTML=`<div class="row" style="margin-bottom:10px"><button class="btn ghost sm" id="ebk">${lab("back","Modelos")}</button><h2>${orig&&!orig.padrao?"Editar modelo":"Novo modelo"}</h2></div>
   <div class="edgrid"><div class="stage" id="stage"></div><div>
    <div class="card"><h3>Modelo</h3><label style="margin-top:0">Nome</label><input id="mn" value="${esc(m.nome)}">
      <label>Tipo</label><select id="mt"><option value="exames">Pedido de exames</option><option value="receita">Receita</option><option value="outro">Outro</option></select></div>
    <div class="card"><h3>Foto do modelo</h3><input type="file" id="mf" accept="image/*" style="display:none">
      <div class="row"><button class="btn sec sm" id="bf">${lab("plus",m.img?"Trocar foto":"Escolher foto")}</button>
      <button class="btn sec sm" id="b90" title="Girar à esquerda">↺</button><button class="btn sec sm" id="b270" title="Girar à direita">↻</button>
      <button class="btn sec sm" id="bm">Melhorar</button></div>
      <div class="row" style="margin-top:8px"><button class="btn sm" id="bo">Sugerir campos automaticamente</button></div>
      <p class="hint" style="margin:8px 0 0">Fotografe a folha de cima, com boa luz e reta. O reconhecimento de texto roda no seu navegador. Depois ajuste os campos arrastando.</p></div>
    <div class="card"><h3>Campos</h3><div class="row" id="pal" style="gap:6px">${Object.entries(FTYPES).map(([k,v])=>`<button class="btn sec sm" data-add="${k}">+ ${v}</button>`).join("")}</div>
      <div id="props" style="margin-top:12px"></div></div>
    <div class="row"><button class="btn" id="msave">${lab("save","Salvar modelo")}</button></div></div></div>`;
  $("#mt").value=m.tipo;
  const stage=$("#stage"), draw=()=>{ stage.innerHTML=paginaHTML(m,AMOSTRA,{edit:true,sel}); };
  const props=()=>{ const f=m.campos.find(c=>c.id===sel), el=$("#props");
    if(!f){ el.innerHTML=`<p class="hint" style="margin:0">Clique em um campo para ajustar. Arraste para mover e use o canto para redimensionar.</p>`; return; }
    el.innerHTML=`<label style="margin-top:0">Tipo do campo</label><select id="pt">${Object.entries(FTYPES).map(([k,v])=>`<option value="${k}" ${k===f.tipo?"selected":""}>${v}</option>`).join("")}</select>
     <label>Tamanho da letra</label><input type="range" id="pf" min="0.012" max="0.045" step="0.001" value="${f.fs}">
     <button class="btn danger sm" id="pd" style="margin-top:10px">${lab("trash","Remover campo")}</button>`;
    $("#pt").onchange=e=>{ f.tipo=e.target.value; draw(); }; $("#pf").oninput=e=>{ f.fs=+e.target.value; draw(); };
    $("#pd").onclick=()=>{ m.campos=m.campos.filter(c=>c.id!==f.id); sel=null; draw(); props(); }; };
  const select=id=>{ sel=id; $$(".dfield",stage).forEach(e=>e.classList.toggle("sel",e.dataset.id===id)); props(); };
  stage.addEventListener("pointerdown",e=>{
    const fe=e.target.closest(".dfield"); if(!fe){ select(null); return; }
    const f=m.campos.find(c=>c.id===fe.dataset.id); select(f.id); e.preventDefault();
    const rect=stage.firstElementChild.getBoundingClientRect(), resize=e.target.classList.contains("hd");
    const sx=e.clientX, sy=e.clientY, o={x:f.x,y:f.y,w:f.w,h:f.h};
    const mv=ev=>{ const dx=(ev.clientX-sx)/rect.width*100, dy=(ev.clientY-sy)/rect.height*100;
      if(resize){ f.w=Math.max(4,Math.min(100-f.x,o.w+dx)); f.h=Math.max(1.5,Math.min(100-f.y,o.h+dy)); }
      else { f.x=Math.max(0,Math.min(100-f.w,o.x+dx)); f.y=Math.max(0,Math.min(100-f.h,o.y+dy)); }
      Object.assign(fe.style,{left:f.x+"%",top:f.y+"%",width:f.w+"%",height:f.h+"%"}); };
    const up=()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up);
  });
  $$("[data-add]").forEach(b=>b.onclick=()=>{ const k=b.dataset.add, d=FDEF[k]; const f={id:uid(),tipo:k,x:10,y:10,w:d.w,h:d.h,fs:d.fs}; m.campos.push(f); draw(); select(f.id); });
  const setImg=async c=>{ m.img=canvasParaUrl(c); m.ratio=+(c.height/c.width).toFixed(4); draw(); $("#bf").lastChild.textContent="Trocar foto"; };
  $("#bf").onclick=()=>$("#mf").click();
  $("#mf").onchange=async e=>{ if(e.target.files[0]){ try{ await setImg(await arquivoParaImg(e.target.files[0])); }catch(x){ toast("Não consegui abrir a imagem."); } } };
  const need=()=>{ if(!m.img){ toast("Escolha uma foto primeiro."); return false; } return true; };
  $("#b90").onclick=async()=>need()&&setImg(await girarImg(m.img,-90)); $("#b270").onclick=async()=>need()&&setImg(await girarImg(m.img,90));
  $("#bm").onclick=async()=>need()&&setImg(await melhorarImg(m.img));
  $("#bo").onclick=async()=>{ if(!need()) return; const b=$("#bo"); b.disabled=true; b.textContent="Lendo a imagem…";
    try{ const n=await ocrSugerir(m); toast(n?`${n} campo(s) sugerido(s). Ajuste se precisar.`:"Não encontrei rótulos conhecidos. Adicione os campos manualmente."); draw(); props(); }
    catch(x){ toast("OCR indisponível: "+x.message); } b.disabled=false; b.textContent="Sugerir campos automaticamente"; };
  $("#ebk").onclick=()=>nav("modelos");
  $("#msave").onclick=async()=>{ m.nome=$("#mn").value.trim()||"Modelo"; m.tipo=$("#mt").value; if(!m.campos.length) return toast("Adicione ao menos um campo.");
    await getModelos(); const i=MOD.findIndex(x=>x.id===m.id); if(i<0) MOD.push(m); else MOD[i]=m;
    $("#msave").disabled=true; try{ await store.saveAux("modelos.json",MOD); toast("Modelo salvo."); nav("modelos"); }catch(e){ toast("Erro ao salvar: "+e.message); $("#msave").disabled=false; } };
  draw(); props();
}

/* ---------- emitir documento ---------- */
async function telaDocumento(p,tipo){
  page.innerHTML=`<p class="mut">Carregando…</p>`;
  const todos=await getModelos(), fav=await getFav(), ms=todos.filter(m=>m.tipo===tipo||m.tipo==="outro");
  const titulo=tipo==="receita"?"Receita":"Pedido de exames";
  page.innerHTML=`<div class="cbar"><button class="btn ghost sm" id="dbk">${lab("back","Voltar")}</button><h2>${titulo} <span class="mut" style="font-weight:400">· ${esc(p.nome)}</span></h2>
    <button class="btn" id="dpr">${lab("print","Imprimir")}</button></div>
   <div class="edgrid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div>
    <div class="card"><label style="margin-top:0">Modelo</label><select id="dm">${ms.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join("")}</select>
     <div class="row" style="margin-top:10px"><label style="margin:0"><input type="checkbox" id="dsf" style="width:auto"> Imprimir sem o fundo (papel já impresso)</label>
      <label style="margin:0">Vias <select id="dv" style="width:auto;display:inline-block"><option>1</option><option>2</option></select></label></div></div>
    <div class="card"><h3>${tipo==="receita"?"Prescrição":"Exames"}</h3>
     ${tipo==="exames"?`<div class="hint">Pacotes</div><div class="pk">${Object.keys(PACOTES).map(k=>`<span class="chip" data-pk="${esc(k)}">${esc(k)}</span>`).join("")}</div>`:""}
     <div class="hint">Favoritos</div><div class="pk" id="favs"></div>
     ${tipo==="exames"?`<input id="dx" list="exlist" placeholder="Adicionar exame (digite e Enter)" class="up"><datalist id="exlist">${EXAMES.map(e=>`<option value="${esc(e)}">`).join("")}</datalist>`:""}
     <textarea id="dt" style="min-height:190px;margin-top:8px;${tipo==="receita"?"text-transform:none":""}" placeholder="${tipo==="receita"?"Digite a prescrição…":"Um exame por linha"}"></textarea>
     <div class="row" style="margin-top:8px"><button class="btn sec sm" id="dfv">${lab("plus","Salvar como favorito")}</button><button class="btn ghost sm" id="dcl">Limpar</button></div>
     <label>Indicação clínica / CID</label><input id="do" class="up"></div>
   </div><div><div class="stage" id="dpv"></div></div></div>`;
  const get=()=>ms.find(m=>m.id===$("#dm").value)||ms[0];
  const render=()=>{ $("#dpv").innerHTML=paginaHTML(get(),valoresDoc(p,$("#dt").value,$("#do").value),{semFundo:$("#dsf").checked,fluid:true}); $("#dsf").disabled=!get().img; };
  const favs=()=>{ $("#favs").innerHTML=(fav[tipo]||[]).map((f,i)=>`<span class="chip" data-fv="${i}">${esc(f.nome)}<span class="x" data-fx="${i}">✕</span></span>`).join("")||`<span class="hint">Nenhum favorito salvo ainda.</span>`; };
  const addLinhas=ls=>{ const t=$("#dt"), cur=t.value.split("\n").map(x=>x.trim()).filter(Boolean); for(const l of ls) if(!cur.includes(l)) cur.push(l); t.value=cur.join("\n"); render(); };
  ["dm","dsf","dt","do"].forEach(id=>$("#"+id).addEventListener("input",render)); $("#dm").onchange=render; $("#dsf").onchange=render;
  $$("[data-pk]").forEach(c=>c.onclick=()=>addLinhas(PACOTES[c.dataset.pk]));
  if($("#dx")) $("#dx").addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.value.trim()){ addLinhas([e.target.value.trim().toUpperCase()]); e.target.value=""; } });
  $("#favs").onclick=async e=>{ const x=e.target.closest("[data-fx]"), c=e.target.closest("[data-fv]");
    if(x){ fav[tipo].splice(+x.dataset.fx,1); await store.saveAux("favoritos.json",fav); favs(); return; }
    if(c){ const f=fav[tipo][+c.dataset.fv]; const t=$("#dt"); t.value=(t.value?t.value.replace(/\n+$/,"")+"\n\n":"")+f.texto; render(); } };
  $("#dfv").onclick=async()=>{ const t=$("#dt").value.trim(); if(!t) return toast("Escreva o conteúdo antes."); const n=prompt("Nome do favorito:"); if(!n) return;
    fav[tipo].push({nome:n.trim(),texto:t}); await store.saveAux("favoritos.json",fav); favs(); toast("Favorito salvo."); };
  $("#dcl").onclick=()=>{ $("#dt").value=""; render(); };
  $("#dbk").onclick=()=>telaPaciente(p.id);
  $("#dpr").onclick=async()=>{
    const t=$("#dt").value.trim(); if(!t) return toast("Escreva o conteúdo do documento.");
    const m=get(), html=paginaHTML(m,valoresDoc(p,t,$("#do").value),{semFundo:$("#dsf").checked}).repeat(+$("#dv").value);
    imprimirDoc(html);
    p.docs=p.docs||[]; p.docs.push({id:uid(),data:hoje(),tipo,modelo:m.nome,modeloId:m.id,texto:t,obs:$("#do").value});
    try{ await gravarPaciente(p); toast("Documento registrado no prontuário."); }catch(e){ toast("Impresso, mas não consegui registrar: "+e.message); } };
  favs(); render();
}
async function reimprimirDoc(p,id){
  const d=p.docs.find(x=>x.id===id), ms=await getModelos(), m=ms.find(x=>x.id===d.modeloId)||ms.find(x=>x.tipo===d.tipo);
  if(!confirm(`Reimprimir ${d.tipo==="receita"?"receita":"pedido de exames"} de ${fmtData(d.data)}?`)) return;
  imprimirDoc(paginaHTML(m,{...valoresDoc(p,d.texto,d.obs),data:fmtData(d.data)}));
}
