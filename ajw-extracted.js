

var LOGO_SRC=document.getElementById('LG').src;
var SECS=[
  {key:'kpi',title:'KPI & Produktivitas',w:30,hbg:'#00838F',lbg:'#E0F7FA',fg:'#004D40',
   items:['Akurasi picking \u2014 tidak ada salah item (target \u2265 99.5%)','Akurasi packing joran \u2014 pipa core benar (target 100%)','Order selesai sebelum cut-off kurir (target 100%)','Retur diperiksa setiap hari tanpa diingatkan','Ketepatan berat paket \u2014 selisih \u2264 50 gram','Produk rusak / komplain saat tiba (target \u2264 0.3%)','Paket hold terselesaikan dalam \u2264 24 jam','Bukti pengiriman terkirim ke semua pembeli','Skor kebersihan area \u2014 inspeksi (target \u2265 85/100)','Keluhan salah packing (target \u2264 1 per 1.000 order)']},
  {key:'a',title:'Kualitas Packing',w:25,hbg:'#1565C0',lbg:'#DBEAFE',fg:'#0D47A1',
   items:['Akurasi item \u2014 produk benar, varian benar, jumlah sesuai','Standar packing JORAN \u2014 pipa core tepat, tutup ujung, label FRAGILE','Standar packing REEL \u2014 double bubble, padding, FRAGILE 4 sisi','Kerapian label AWB \u2014 rata, tidak terlipat, bisa di-scan dari 30cm','Kualitas visual packing \u2014 rapi, profesional, merepresentasikan toko','Penanganan bundling \u2014 semua item lengkap sebelum packing']},
  {key:'b',title:'Efisiensi & BigSeller',w:20,hbg:'#1976D2',lbg:'#E3F2FD',fg:'#0D47A1',
   items:['Kecepatan packing sesuai target waktu','Penggunaan BigSeller Wave \u2014 picking terorganisir','Efisiensi material \u2014 manfaatkan sisa pipa core','Outbound scan selesai tepat waktu sebelum cut-off','Penyelesaian paket hold dalam \u2264 24 jam tanpa diingatkan','Pengecekan & input retur BigSeller setiap hari']},
  {key:'c',title:'Kebersihan & Kerapian',w:15,hbg:'#6A1B9A',lbg:'#F3E5F5',fg:'#4A148C',
   items:['Meja packing selalu bersih dan clear dari barang tidak relevan','Sampah sisa material langsung dibuang ke tempat sampah','Semua alat dikembalikan ke tempatnya setelah selesai','Sisa pipa core disimpan rapi di rak sisa dengan label ukuran','Area packing bersih total saat akhir shift','Inisiatif membersihkan / merapikan tanpa perlu diperintah']},
  {key:'d',title:'Karakter & Kepatuhan SOP',w:10,hbg:'#E65100',lbg:'#FFF3E0',fg:'#BF360C',
   items:['Mengikuti alur SOP tanpa melompat atau melewati tahapan','Bukti pengiriman dikirim ke semua pembeli tanpa pengecualian','Verifikasi akhir BigSeller dilakukan sebelum tutup shift','Melaporkan masalah ke admin (OOS, cacat, hold) maks. 15 menit','Loyalitas & kepedulian \u2014 menjaga kualitas tanpa perlu diawasi','Disiplin waktu \u2014 hadir tepat, tidak tinggalkan area sebelum selesai','Komunikasi \u2014 laporan jelas, proaktif, dan tepat waktu']}
];
/* SCORES 1-4 ONLY */
var SC=[
  {v:1,label:'Perlu Perbaikan',bg:'#FFEBEE',fg:'#C62828',abg:'#C62828'},
  {v:2,label:'Cukup',bg:'#FFFDE7',fg:'#F57F17',abg:'#F57F17'},
  {v:3,label:'Baik',bg:'#E8F5E9',fg:'#2E7D32',abg:'#2E7D32'},
  {v:4,label:'Sangat Baik',bg:'#E0F7FA',fg:'#006064',abg:'#00838F'}
];
var KEPUTS=['Lanjut Normal','Coaching Intensif','SP1','Promosi','Bonus'];
var MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var evalScores={},evalCol={},evalInfo={};
var payInfo={};
var curEval=null,curPay=null;
var employees=[],evalHistory=[],payHistory=[];
var chartInst={};
var statsFilter={emp:'all',period:'all',type:'all'};
var histFilter={type:'all',emp:'all'};
var previewBW=false;
var customTabs=[];
var adminSub='general';

function loadAll(){
  try{evalHistory=JSON.parse(localStorage.getItem('ajw_eval')||'[]')}catch(e){evalHistory=[]}
  try{payHistory=JSON.parse(localStorage.getItem('ajw_pay')||'[]')}catch(e){payHistory=[]}
  try{employees=JSON.parse(localStorage.getItem('ajw_emp')||'[]')}catch(e){employees=[]}
  try{customTabs=JSON.parse(localStorage.getItem('ajw_tabs')||'[]')}catch(e){customTabs=[]}
  loadKPI();applyTheme();updateBadge();buildTabBar();
}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function getCfg(){try{return JSON.parse(localStorage.getItem('ajw_cfg')||'{}')}catch(e){return{}}}
function saveCfg(c){sv('ajw_cfg',c)}
function updateBadge(){var c=getCfg();var el=document.getElementById('BADGE');if(el)el.innerHTML='<span style="color:#FFD700;font-weight:700">'+esc(c.adminName||'Hokky')+'</span>'}
function applyTheme(){var c=getCfg();document.documentElement.setAttribute('data-theme',c.theme||'light')}
function toggleTheme(){var c=getCfg();c.theme=(c.theme==='dark'?'light':'dark');saveCfg(c);applyTheme()}
function applyCSSOverride(css){var el=document.getElementById('CSO');if(!el){el=document.createElement('style');el.id='CSO';document.head.appendChild(el)}el.textContent=css||''}

function today(){return new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}
function isoNow(){return new Date().toISOString()}
function ymd(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fmtD(d){try{return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}catch(e){return d||'-'}}
function fmtRange(a,b){
  try{
    var da=new Date(a);
    var la=da.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    if(b){var db=new Date(b);return la+' \u2013 '+db.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
    return da.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  }catch(e){return a+(b?' - '+b:'')}
}
function periodeLabel(info){
  if(info.tglMulai)return fmtRange(info.tglMulai,info.tglAkhir||null);
  if(info.bulan)return (info.bulan||'')+' '+(info.tahun||'');
  return info.periode||'-';
}
function avg(arr){var f=arr.filter(function(v){return v>0});return f.length?f.reduce(function(a,b){return a+b},0)/f.length:0}
function fscr(sc){return SECS.reduce(function(t,s){return t+avg(sc[s.key]||[])*(s.w/100)},0)}
function grade(s){if(!s)return'-';if(s>=3.5)return'A';if(s>=3)return'B';if(s>=2)return'C';return'D'}
function cat(s){if(!s)return'-';if(s>=3.5)return'SANGAT BAIK';if(s>=3)return'BAIK';if(s>=2)return'CUKUP';return'PERLU PERBAIKAN'}
function gc(s){if(s>=3.5)return{bg:'#E8F5E9',fg:'#2E7D32',dbg:'#388E3C'};if(s>=3)return{bg:'#DBEAFE',fg:'#1565C0',dbg:'#1976D2'};if(s>=2)return{bg:'#FFFDE7',fg:'#F57F17',dbg:'#F9A825'};return{bg:'#FFEBEE',fg:'#C62828',dbg:'#D32F2F'}}
function slabel(v){var s=SC.filter(function(c){return c.v===v})[0];return s?s.label:''}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function fmt(n){return new Intl.NumberFormat('id-ID').format(n||0)}
function totItems(){return SECS.reduce(function(a,s){return a+s.items.length},0)}
function filItems(){return SECS.reduce(function(a,s){return a+(evalScores[s.key]||[]).filter(function(v){return v>0}).length},0)}
function initES(){var r={};SECS.forEach(function(s){r[s.key]=new Array(s.items.length).fill(0)});return r}
function initEI(){return{nama:'',jabatan:'Staff Packing',noWA:'',email:'',tglMulai:'',tglAkhir:'',tipe:'Mingguan',penilai:'Hokky (Owner)',tanggal:today(),hadir:'',izin:'',alpha:'',terlambat:'',kuat:'',lemah:'',target:'',action:'',keputusan:'Lanjut Normal',catatan:''}}
function initPI(){return{nama:'',jabatan:'Packer',noWA:'',email:'',tipe:'Mingguan',tglMulai:'',tglAkhir:'',bulan:'',tahun:new Date().getFullYear(),tanggal:today(),hariKerja:'',gajiPokok:0,lembur:0,allowance:0,bonus:0,pajak:0,potAbsen:0,bpjs:0,kasbon:0,catatan:''}}

function toast(msg,type,dur){
  var t=document.getElementById('TOAST');
  var cols={info:'#1565C0',success:'#2E7D32',error:'#C62828',warn:'#E65100'};
  t.style.background=cols[type]||cols.info;t.textContent=msg;t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},dur||3000);
}

/* ====== TAB SYSTEM ====== */
var CORE_TABS=['dash','eval','payroll','stats','emp','hist','kpi','aichat','finansial','operasional','supplier','taligf','admin'];
function buildTabBar(){
  var c=getCfg();var tc=c.tabsConfig||{};
  var defs=[{id:'dash',lbl:'\uD83C\uDFE0 Dashboard'},{id:'eval',lbl:'\uD83D\uDCCB Penilaian'},{id:'payroll',lbl:'\uD83D\uDCB0 Payroll'},{id:'stats',lbl:'\uD83D\uDCCA Statistik'},{id:'emp',lbl:'\uD83D\uDC65 Karyawan'},{id:'hist',lbl:'\uD83D\uDCDC Riwayat'},{id:'admin',lbl:'\u2699\uFE0F Admin'}];
  customTabs.forEach(function(ct){defs.push({id:'ct_'+ct.id,lbl:(ct.icon||'\uD83D\uDCC4')+' '+ct.name,isCustom:true})});
  var html='';
  defs.forEach(function(d){
    if(tc['hide_'+d.id])return;
    var lbl=tc['label_'+d.id]||d.lbl;
    html+='<button class="tab on" id="T-'+d.id+'" onclick="SW(\''+d.id+'\')">'+lbl+'</button>';
  });
  document.getElementById('TABS').innerHTML=html;
}
function SW(tab){
  var all=CORE_TABS.concat(customTabs.map(function(ct){return 'ct_'+ct.id}));
  all.forEach(function(x){
    var v=document.getElementById('V-'+x);var b=document.getElementById('T-'+x);
    if(v)v.style.display=(x===tab)?'block':'none';
    if(b)b.className='tab '+(x===tab?'act':'on');
  });
  if(tab==='dash')renderDash();
  else if(tab==='kpi'){loadKPI();renderKPI();}
  else if(tab==='aichat')renderAIChat();
  else if(tab==='stats')renderStats();
  else if(tab==='emp')renderEmp();
  else if(tab==='hist')renderHist();
  else if(tab==='admin')renderAdmin();
  else if(tab==='finansial')renderFinansial();
  else if(tab==='operasional')renderOperasional();
  else if(tab==='supplier')renderSupplier();
  else if(tab==='taligf')renderTaliGF();
  else if(tab.indexOf('ct_')===0)renderCustomTab(tab.replace('ct_',''));
  window.scrollTo(0,0);
}

/* ====== PICK EMP ====== */
function pickEmp(idx,dest){
  var e=employees[idx];if(!e){toast('Karyawan tidak ditemukan','error');return}
  if(dest==='eval'){evalInfo.nama=e.nama;evalInfo.jabatan=e.jabatan;evalInfo.noWA=e.noWA||'';evalInfo.email=e.email||'';if(e.gajiPokok)payInfo.gajiPokok=e.gajiPokok;renderEvalForm();SW('eval');toast('Data '+e.nama+' dimuat ke form penilaian','success');}
  else if(dest==='payroll'){payInfo.nama=e.nama;payInfo.jabatan=e.jabatan;payInfo.noWA=e.noWA||'';payInfo.email=e.email||'';if(e.gajiPokok)payInfo.gajiPokok=e.gajiPokok;renderPayrollForm();SW('payroll');toast('Data '+e.nama+' dimuat ke form payroll','success');}
  else if(dest==='stats'){statsFilter.emp=e.nama;SW('stats');}
}
function viewEvalRecord(histIdx){
  curEval=evalHistory[histIdx];if(!curEval)return;
  if(typeof _activeTab!=='undefined'&&_activeTab==='hr'&&typeof _renderHR==='function'){
    _renderHR('eval');
    setTimeout(function(){showEvalReport(curEval);},0);
  }else{
    showEvalReport(curEval);SW('eval');
  }
}
function viewPayRecord(histIdx){
  curPay=payHistory[histIdx];if(!curPay)return;
  if(typeof _activeTab!=='undefined'&&_activeTab==='hr'&&typeof _renderHR==='function'){
    _renderHR('payroll');
    setTimeout(function(){showPaySlip(curPay);},0);
  }else{
    showPaySlip(curPay);SW('payroll');
  }
}
function editEvalRecord(histIdx){
  var r=evalHistory[histIdx];if(!r)return;
  evalInfo=JSON.parse(JSON.stringify(r.info));evalScores=JSON.parse(JSON.stringify(r.scores));SECS.forEach(function(s){evalCol[s.key]=false});
  if(typeof _activeTab!=='undefined'&&_activeTab==='hr'&&typeof _renderHR==='function')_renderHR('eval');else{renderEvalForm();SW('eval');}
  toast('Data dimuat ke form \u2014 edit lalu submit ulang','info',4000);
}
function editPayRecord(histIdx){
  var r=payHistory[histIdx];if(!r)return;
  payInfo=JSON.parse(JSON.stringify(r.info));
  if(typeof _activeTab!=='undefined'&&_activeTab==='hr'&&typeof _renderHR==='function')_renderHR('payroll');else{renderPayrollForm();SW('payroll');}
  toast('Data slip dimuat \u2014 edit lalu generate ulang','info',4000);
}

/* ====== EVAL FORM ====== */
function setScore(sk,idx,val){
  evalScores[sk][idx]=(evalScores[sk][idx]===val)?0:val;
  SC.forEach(function(s){
    var b=document.getElementById('sb-'+sk+'-'+idx+'-'+s.v);if(!b)return;
    var on=(evalScores[sk][idx]===s.v);
    b.style.borderColor=on?s.abg:'var(--bd2)';b.style.background=on?s.abg:'var(--bg2)';b.style.color=on?'#fff':s.fg;
  });
  liveEval();updateEvalPreview();
}
function liveEval(){
  var f=filItems(),t=totItems(),p=Math.round(f/t*100);
  var fs=fscr(evalScores),g=grade(fs),cl=gc(fs);
  var pf=document.getElementById('EPF'),pt=document.getElementById('EPT'),ls=document.getElementById('ELS');
  if(pf){pf.style.width=p+'%';pf.style.background=p>=80?'#2E7D32':p>=50?'#F9A825':'#1565C0'}
  if(pt)pt.textContent=f+'/'+t+' item \u2014 '+p+'% selesai';
  if(ls){ls.textContent=fs>0?'Nilai: '+fs.toFixed(2)+' \u2014 Grade '+g:'Isi untuk lihat nilai live';ls.style.color=cl.fg}
  SECS.forEach(function(sec){
    var sa=avg(evalScores[sec.key]||[]);var fl=(evalScores[sec.key]||[]).filter(function(v){return v>0}).length;
    var e=document.getElementById('ESA-'+sec.key),ef=document.getElementById('ESF-'+sec.key);
    if(e){e.textContent=sa>0?sa.toFixed(2):'';e.style.display=sa>0?'inline-block':'none';e.style.color=gc(sa).fg}
    if(ef)ef.textContent=fl+'/'+sec.items.length;
  });
  var sb=document.getElementById('ESUBBTN');if(sb){var ok=f>=Math.ceil(t*.5);sb.style.background=ok?'#0D2E5A':'#90A4AE'}
}
function toggleSec(k){
  evalCol[k]=!evalCol[k];
  var bd=document.getElementById('SB-'+k),ar=document.getElementById('AR-'+k);
  if(bd)bd.style.display=evalCol[k]?'none':'block';
  if(ar)ar.innerHTML=evalCol[k]?'&#9660;':'&#9650;';
}
function setKep(v){
  evalInfo.keputusan=v;
  KEPUTS.forEach(function(o){
    var b=document.getElementById('EKB-'+o.replace(/ /g,'_'));if(!b)return;
    var on=(v===o);b.style.borderColor=on?'#1565C0':'var(--bd2)';b.style.background=on?'#1565C0':'var(--bg2)';b.style.color=on?'#fff':'var(--tx2)';
  });
}
function updateEvalPreview(){
  var ep=document.getElementById('EVAL-PREV');if(!ep||!evalInfo.nama){return;}
  var sec={};SECS.forEach(function(s){sec[s.key]=avg(evalScores[s.key]||[])});
  var fs=fscr(evalScores);
  var tmp={id:'PRV',info:evalInfo,scores:evalScores,secScores:sec,fs:fs,grade:grade(fs),cat:cat(fs),submittedAt:isoNow()};
  ep.innerHTML=buildEvalHTML(tmp);
  ep.style.filter=previewBW?'grayscale(100%)':'';
}
function buildBackupOpts(ctx){
  var cfg=getCfg();
  var atg=(cfg['bk_tg_'+ctx]===true),adr=(cfg['bk_dr_'+ctx]===true);
  var h='<div class="card" style="padding:11px;margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:7px">Opsi Backup Otomatis saat Generate</div>';
  h+='<div class="bk-row"><input type="checkbox" id="BKT-'+ctx+'"'+(atg?' checked':'')+' onchange="var c=getCfg();c[\'bk_tg_'+ctx+'\']=this.checked;saveCfg(c)"><label style="font-size:12px;cursor:pointer" for="BKT-'+ctx+'">Kirim ke Telegram (backup riwayat)</label></div>';
  h+='<div class="bk-row"><input type="checkbox" id="BKD-'+ctx+'"'+(adr?' checked':'')+' onchange="var c=getCfg();c[\'bk_dr_'+ctx+'\']=this.checked;saveCfg(c)"><label style="font-size:12px;cursor:pointer" for="BKD-'+ctx+'">Upload ke Google Drive otomatis</label></div>';
  h+='<div style="font-size:10px;color:var(--tx3);margin-top:5px">\u2713 Centang = aktif permanen setiap generate</div></div>';
  return h;
}
function renderEvalForm(){
  var f=filItems(),t=totItems(),p=Math.round(f/t*100);
  var fs=fscr(evalScores),g=grade(fs),cl=gc(fs);
  var L='<div class="card" style="padding:11px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;flex-wrap:wrap;gap:4px"><span id="EPT" style="font-size:11px;font-weight:700;color:var(--tx2)">'+f+'/'+t+' item \u2014 '+p+'% selesai</span><span id="ELS" style="font-size:11px;font-weight:700;color:'+cl.fg+'">'+(fs>0?'Nilai: '+fs.toFixed(2)+' \u2014 Grade '+g:'Isi untuk lihat nilai live')+'</span></div><div class="pbar"><div id="EPF" class="pfill" style="width:'+p+'%;background:'+(p>=80?'#2E7D32':p>=50?'#F9A825':'#1565C0')+'"></div></div></div>';
  L+='<div class="card">';
  if(employees.length){L+='<div style="margin-bottom:10px"><label class="lbl">Pilih dari Database Karyawan</label><select class="fi" onchange="if(this.value!==\'\')pickEmp(parseInt(this.value),\'eval\')"><option value="">-- Pilih karyawan --</option>';employees.forEach(function(e,i){L+='<option value="'+i+'">'+esc(e.nama)+' \u2014 '+esc(e.jabatan)+'</option>'});L+='</select></div>';}
  L+='<span style="background:#0D2E5A;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:9px">DATA KARYAWAN &amp; PERIODE</span>';
  L+='<div class="g2" style="margin-bottom:10px">';
  L+='<div><label class="lbl">Nama Lengkap *</label><input class="fi" type="text" value="'+esc(evalInfo.nama)+'" placeholder="Nama karyawan" oninput="evalInfo.nama=this.value;updateEvalPreview()"></div>';
  L+='<div><label class="lbl">Jabatan</label><input class="fi" type="text" value="'+esc(evalInfo.jabatan)+'" oninput="evalInfo.jabatan=this.value"></div>';
  L+='<div><label class="lbl">No. WhatsApp</label><input class="fi" type="text" value="'+esc(evalInfo.noWA)+'" placeholder="628xxx" oninput="evalInfo.noWA=this.value"></div>';
  L+='<div><label class="lbl">Email</label><input class="fi" type="email" value="'+esc(evalInfo.email)+'" oninput="evalInfo.email=this.value"></div>';
  L+='<div><label class="lbl">Periode \u2014 Tanggal Mulai *</label><input class="fi" type="date" value="'+esc(evalInfo.tglMulai||'')+'" oninput="evalInfo.tglMulai=this.value;updateEvalPreview()"></div>';
  L+='<div><label class="lbl">Periode \u2014 Tanggal Akhir</label><input class="fi" type="date" value="'+esc(evalInfo.tglAkhir||'')+'" oninput="evalInfo.tglAkhir=this.value;updateEvalPreview()"></div>';
  L+='<div><label class="lbl">Tipe</label><select class="fi" onchange="evalInfo.tipe=this.value"><option'+(evalInfo.tipe==='Mingguan'?' selected':'')+'>Mingguan</option><option'+(evalInfo.tipe==='Bulanan'?' selected':'')+'>Bulanan</option></select></div>';
  L+='<div><label class="lbl">Dinilai Oleh</label><input class="fi" type="text" value="'+esc(evalInfo.penilai)+'" oninput="evalInfo.penilai=this.value"></div>';
  L+='</div>';
  L+='<div style="border-top:1px solid var(--bd);padding-top:9px"><div style="font-size:11px;font-weight:700;color:#6A1B9A;margin-bottom:7px">KEHADIRAN PERIODE INI</div><div class="g4">';
  [['hadir','Hadir','#2E7D32','#E8F5E9'],['izin','Izin/Sakit','#F57F17','#FFFDE7'],['alpha','Alpha','#C62828','#FFEBEE'],['terlambat','Terlambat(x)','#6A1B9A','#F3E5F5']].forEach(function(x){L+='<div><div style="font-size:10px;font-weight:700;color:'+x[2]+';text-align:center;margin-bottom:3px">'+x[1]+'</div><input class="atinp" type="text" value="'+esc(evalInfo[x[0]])+'" placeholder="0" oninput="evalInfo.'+x[0]+'=this.value" style="border-color:'+x[2]+'50;color:'+x[2]+';background:'+x[3]+'"></div>';});
  L+='</div></div></div>';
  SECS.forEach(function(sec){
    var sa=avg(evalScores[sec.key]||[]),sf=evalScores[sec.key]||[];
    var sfil=sf.filter(function(v){return v>0}).length,scl=gc(sa);
    L+='<div class="swrap"><button class="shdr" style="background:'+sec.hbg+'" onclick="toggleSec(\''+sec.key+'\')">';
    L+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="color:#fff;font-weight:700;font-size:12px">'+sec.title+'</span><span style="background:rgba(255,255,255,.2);color:#fff;font-size:10px;padding:2px 7px;border-radius:20px">Bobot '+sec.w+'%</span></div>';
    L+='<div style="display:flex;align-items:center;gap:6px;flex-shrink:0"><span id="ESA-'+sec.key+'" style="background:rgba(255,255,255,.92);color:'+scl.fg+';font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;display:'+(sa>0?'inline-block':'none')+'">'+(sa>0?sa.toFixed(2):'')+'</span><span id="ESF-'+sec.key+'" style="color:rgba(255,255,255,.8);font-size:11px">'+sfil+'/'+sec.items.length+'</span><span id="AR-'+sec.key+'" style="color:#fff">&#9650;</span></div></button>';
    L+='<div id="SB-'+sec.key+'" class="sbdy">';
    sec.items.forEach(function(item,idx){
      var cur=sf[idx]||0;
      L+='<div class="irow"><div class="itxt"><span style="color:var(--tx3);font-size:10px;font-weight:700;margin-right:4px">'+(idx+1)+'.</span>'+item+'</div><div class="sbs">';
      SC.forEach(function(s){var on=(cur===s.v);L+='<button id="sb-'+sec.key+'-'+idx+'-'+s.v+'" class="sb" onclick="setScore(\''+sec.key+'\','+idx+','+s.v+')" title="'+s.label+'" style="border-color:'+(on?s.abg:'var(--bd2)')+';background:'+(on?s.abg:'var(--bg2)')+';color:'+(on?'#fff':s.fg)+'">'+s.v+'</button>';});
      L+='</div></div>';
    });
    L+='<div class="legbar">';SC.forEach(function(s){L+='<span style="font-size:10px;color:'+s.fg+';font-weight:700">'+s.v+'='+s.label+'</span>'});L+='</div></div></div>';
  });
  L+='<div class="card"><span style="background:#1565C0;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:9px">CATATAN &amp; ACTION PLAN</span>';
  L+='<div class="g2" style="margin-bottom:9px">';
  [['kuat','Kekuatan'],['lemah','Area Tingkatkan'],['target','Target Depan'],['action','Action Plan']].forEach(function(x){L+='<div><label class="lbl">'+x[1]+'</label><textarea class="fi" oninput="evalInfo.'+x[0]+'=this.value">'+esc(evalInfo[x[0]])+'</textarea></div>';});
  L+='</div><div style="margin-bottom:9px"><label class="lbl">Keputusan</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">';
  KEPUTS.forEach(function(o){var on=(evalInfo.keputusan===o);L+='<button id="EKB-'+o.replace(/ /g,'_')+'" class="kbtn" onclick="setKep(\''+o+'\')" style="border-color:'+(on?'#1565C0':'var(--bd2)')+';background:'+(on?'#1565C0':'var(--bg2)')+';color:'+(on?'#fff':'var(--tx2)')+'">'+o+'</button>';});
  L+='</div></div><div><label class="lbl">Catatan Tambahan</label><textarea class="fi" rows="2" oninput="evalInfo.catatan=this.value">'+esc(evalInfo.catatan)+'</textarea></div></div>';
  L+=buildBackupOpts('eval');
  L+='<div style="display:flex;justify-content:flex-end;gap:8px;padding-bottom:18px"><button class="btns" onclick="evalInfo=initEI();evalScores=initES();SECS.forEach(function(s){evalCol[s.key]=false});renderEvalForm()">Reset</button><button id="ESUBBTN" class="btnp" onclick="evalSubmit()" style="background:#90A4AE">Submit &amp; Generate Laporan</button></div>';

  var R='<div class="preview-panel" id="PREV-WRAP" style="position:sticky;top:68px;max-height:calc(100vh - 78px);overflow-y:auto;resize:horizontal;min-width:260px;border:1px dashed var(--bd2);border-radius:var(--r);padding:8px">';
  R+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span style="font-size:11px;font-weight:700;color:var(--tx2)">PREVIEW <small style="font-weight:400;color:var(--tx3)">(tarik sudut kanan utk resize)</small></span>';
  R+='<button class="btna" onclick="previewBW=!previewBW;var el=document.getElementById(\'EVAL-PREV\');if(el)el.style.filter=previewBW?\'grayscale(100%)\':\'\';" style="background:#546E7A;padding:5px 9px;font-size:10px">BW/Color</button></div>';
  R+='<div id="EVAL-PREV" style="background:#fff;border-radius:7px;overflow:hidden;font-size:9.5px"><div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Isi nama untuk preview</div></div></div>';
  document.getElementById('V-eval').innerHTML='<div class="split"><div>'+L+'</div>'+R+'</div>';
  liveEval();
}
function evalSubmit(){
  if(!evalInfo.nama.trim()){toast('Nama karyawan wajib','error');return}
  if(!evalInfo.tglMulai){toast('Tanggal mulai periode wajib','error');return}
  var f=filItems(),t=totItems();
  if(f<Math.ceil(t*.5)){toast('Isi minimal 50% penilaian','warn');return}
  var fs=fscr(evalScores);
  var sec={};SECS.forEach(function(s){sec[s.key]=avg(evalScores[s.key]||[])});
  curEval={id:Date.now(),type:'eval',info:JSON.parse(JSON.stringify(evalInfo)),scores:JSON.parse(JSON.stringify(evalScores)),fs:fs,grade:grade(fs),cat:cat(fs),secScores:sec,submittedAt:isoNow()};
  evalHistory.unshift(curEval);if(evalHistory.length>500)evalHistory.pop();sv('ajw_eval',evalHistory);
  showEvalReport(curEval);
  sendEvalNotifs(curEval);
  var cfg=getCfg();
  if(document.getElementById('BKT-eval')&&document.getElementById('BKT-eval').checked)syncTelegram(curEval,'eval');
  if(document.getElementById('BKD-eval')&&document.getElementById('BKD-eval').checked)uploadDrive(curEval,'eval');
  toast('Laporan penilaian berhasil dibuat!','success',4000);
}

/* ====== EVAL REPORT HTML ====== */
function buildEvalHTML(r){
  var i=r.info,cl=gc(r.fs),g=r.grade,pLbl=periodeLabel(i);
  var h='<div id="EVAL-RPT" style="background:#fff;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact">';
  h+='<div style="background:#0D2E5A;padding:14px 20px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
  h+='<img src="'+LOGO_SRC+'" style="width:62px;height:62px;object-fit:contain;border-radius:50%;border:3px solid #C8A400;background:#000;flex-shrink:0">';
  h+='<div style="flex:1"><div style="font-size:18px;font-weight:700;color:#FFD700">ANTON JAYA WIJAYA</div><div style="color:#C8A400;font-size:11px;font-weight:700">ANTON PANCING</div><div style="color:#90CAF9;font-size:10px">Toko Alat Pancing Online</div></div>';
  h+='<div style="text-align:right;flex-shrink:0"><div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:7px;padding:8px 12px"><div style="color:#fff;font-size:11px;font-weight:700">LAPORAN PENILAIAN KINERJA</div><div style="color:#90CAF9;font-size:9px;margin-top:3px">FORM-AJW-EVAL | ID: '+r.id+'</div></div></div></div>';
  h+='<table style="width:100%;border-collapse:collapse;margin-top:9px;border-top:2px solid #1565C0"><tr>';
  [['Tanggal',i.tanggal],['Periode',pLbl],['Tipe',i.tipe],['Penilai',i.penilai]].forEach(function(x){h+='<td style="padding:6px 9px;border-right:1px solid #1565C0"><div style="color:#90CAF9;font-size:9px;font-weight:700">'+x[0]+'</div><div style="color:#fff;font-size:11px;font-weight:700">'+esc(x[1])+'</div></td>';});
  h+='</tr></table></div>';
  h+='<div style="background:#EEF4FF;padding:13px 20px;border-bottom:3px solid #0D2E5A;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:11px">';
  h+='<div><div style="font-size:9px;color:#546E7A;font-weight:700;text-transform:uppercase">Nama Karyawan yang Dinilai</div>';
  h+='<div style="font-size:21px;font-weight:700;color:#0D2E5A;margin-top:2px">'+esc(i.nama)+'</div>';
  h+='<div style="font-size:12px;color:#546E7A">'+esc(i.jabatan)+'</div>';
  if(i.noWA)h+='<div style="font-size:11px;color:#25D366;margin-top:2px">WA: '+esc(i.noWA)+'</div>';
  if(i.hadir||i.izin||i.alpha){
    h+='<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">';
    [['Hadir',i.hadir,'#2E7D32','#E8F5E9'],['Izin/Sakit',i.izin,'#F57F17','#FFFDE7'],['Alpha',i.alpha,'#C62828','#FFEBEE'],['Terlambat(x)',i.terlambat,'#6A1B9A','#F3E5F5']].forEach(function(x){if(!x[1])return;h+='<div style="background:'+x[3]+';padding:4px 9px;border-radius:6px;text-align:center"><div style="font-size:14px;font-weight:700;color:'+x[2]+'">'+x[1]+'</div><div style="font-size:9px;color:'+x[2]+';font-weight:700">'+x[0]+'</div></div>';});
    h+='</div>';
  }
  h+='</div>';
  h+='<div style="text-align:center"><div style="font-size:9px;color:#546E7A;font-weight:700;margin-bottom:6px;text-transform:uppercase">Nilai Akhir</div>';
  h+='<div style="width:88px;height:88px;border-radius:50%;border:4px solid '+cl.fg+';background:'+cl.bg+';display:flex;flex-direction:column;justify-content:center;align-items:center;margin:0 auto"><div style="font-size:26px;font-weight:700;color:'+cl.fg+';line-height:1">'+g+'</div><div style="font-size:13px;font-weight:700;color:'+cl.fg+'">'+r.fs.toFixed(2)+'</div></div>';
  h+='<div style="font-size:11px;font-weight:700;color:'+cl.fg+';margin-top:6px">'+r.cat+'</div></div></div>';
  h+='<div style="padding:12px 16px 7px"><div style="font-size:10px;font-weight:700;color:#fff;background:#0D2E5A;padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:8px">RINGKASAN PENILAIAN PER SEKSI</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:10px;border:2px solid #0D2E5A"><thead><tr>';
  ['Seksi Penilaian','Bobot','Skor Rata-rata','Tertimbang','Grade','Indikator','Status'].forEach(function(x){h+='<th style="background:#0D2E5A;color:#fff;padding:6px 8px;border:1px solid #1D4E8A;text-align:center">'+x+'</th>'});
  h+='</tr></thead><tbody>';
  SECS.forEach(function(sec){
    var sa=r.secScores[sec.key]||0,sc2=gc(sa),bar=sa>0?Math.round(sa/4*100):0;
    h+='<tr><td style="font-weight:700;color:'+sec.hbg+';padding:6px 8px;border:1px solid #C8D8EA">'+sec.title+'</td>';
    h+='<td style="text-align:center;padding:6px 8px;border:1px solid #C8D8EA;background:#F0F5FC;font-weight:700">'+sec.w+'%</td>';
    h+='<td style="text-align:center;padding:6px 8px;border:1px solid #C8D8EA;background:'+sc2.bg+';color:'+sc2.fg+';font-weight:700;font-size:12px">'+(sa>0?sa.toFixed(2):'-')+'</td>';
    h+='<td style="text-align:center;padding:6px 8px;border:1px solid #C8D8EA;color:'+sc2.fg+';font-weight:700">'+(sa>0?(sa*sec.w/100).toFixed(3):'-')+'</td>';
    h+='<td style="text-align:center;padding:6px 8px;border:1px solid #C8D8EA"><span style="background:'+sc2.dbg+';color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">'+(sa>0?grade(sa):'-')+'</span></td>';
    h+='<td style="padding:6px 11px;border:1px solid #C8D8EA"><div style="height:9px;background:#DDE6F0;border-radius:4px;overflow:hidden"><div style="width:'+bar+'%;height:100%;background:'+sec.hbg+';border-radius:4px"></div></div></td>';
    h+='<td style="font-size:10px;font-weight:700;color:'+sc2.fg+';padding:6px 8px;border:1px solid #C8D8EA">'+(sa>0?cat(sa):'-')+'</td></tr>';
  });
  h+='</tbody><tfoot><tr>';
  h+='<td colspan="2" style="background:#0D2E5A;color:#fff;font-weight:700;font-size:11px;padding:7px 8px;border:1px solid #1D4E8A">TOTAL NILAI AKHIR</td>';
  h+='<td style="background:'+cl.dbg+';color:#fff;font-weight:700;font-size:14px;text-align:center;padding:7px 8px;border:1px solid #1D4E8A">'+r.fs.toFixed(2)+'</td>';
  h+='<td style="background:#0D2E5A;color:#fff;font-weight:700;text-align:center;padding:7px 8px;border:1px solid #1D4E8A">'+r.fs.toFixed(3)+'</td>';
  h+='<td style="background:'+cl.dbg+';color:#fff;font-weight:700;font-size:15px;text-align:center;padding:7px 8px;border:1px solid #1D4E8A">'+g+'</td>';
  h+='<td colspan="2" style="background:#0D2E5A;color:#fff;font-weight:700;text-align:center;padding:7px 8px;border:1px solid #1D4E8A">'+r.cat+'</td>';
  h+='</tr></tfoot></table></div>';
  h+='<div style="padding:4px 0"><div style="font-size:10px;font-weight:700;color:#fff;background:#0D2E5A;padding:4px 10px;border-radius:4px;display:inline-block;margin:4px 16px 10px">DETAIL PENILAIAN PER ASPEK</div>';
  SECS.forEach(function(sec){
    var sa=r.secScores[sec.key]||0,sf=r.scores[sec.key]||[];
    h+='<div style="border:2px solid '+sec.hbg+';border-radius:7px;margin:0 16px 9px;overflow:hidden">';
    h+='<div style="background:'+sec.hbg+';padding:7px 12px;display:flex;justify-content:space-between"><span style="color:#fff;font-weight:700;font-size:11px">'+sec.title+' (Bobot '+sec.w+'%)</span><span style="color:rgba(255,255,255,.9);font-size:11px;font-weight:700">Rata-rata: '+(sa>0?sa.toFixed(2):'-')+' / 4.00 &nbsp;|&nbsp; Grade: '+(sa>0?grade(sa):'-')+'</span></div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:'+sec.lbg+'"><th style="padding:5px 7px;border:1px solid #D8E2EE;width:22px;text-align:center">#</th><th style="padding:5px 7px;border:1px solid #D8E2EE">Aspek Penilaian</th><th style="padding:5px 7px;border:1px solid #D8E2EE;width:40px;text-align:center">Skor</th><th style="padding:5px 7px;border:1px solid #D8E2EE;width:96px;text-align:center">Level</th></tr></thead><tbody>';
    sf.forEach(function(sv2,idx){
      var sc2=SC.filter(function(s){return s.v===sv2})[0];
      h+='<tr style="background:'+(idx%2?'#F4F8FD':'#fff')+'"><td style="padding:5px 7px;border:1px solid #D8E2EE;text-align:center;color:#90A4AE;font-weight:700">'+(idx+1)+'</td><td style="padding:5px 7px;border:1px solid #D8E2EE">'+(sec.items[idx]||'')+'</td><td style="padding:5px 7px;border:1px solid #D8E2EE;text-align:center"><span style="background:'+(sc2?sc2.bg:'#F0F4F8')+';color:'+(sc2?sc2.fg:'#90A4AE')+';font-weight:700;padding:2px 7px;border-radius:4px;font-size:12px">'+(sv2||'-')+'</span></td><td style="padding:5px 7px;border:1px solid #D8E2EE;text-align:center;font-size:10px;font-weight:700;color:'+(sc2?sc2.fg:'#90A4AE')+'">'+(sv2?slabel(sv2):'Tidak diisi')+'</td></tr>';
    });
    h+='</tbody></table></div>';
  });
  h+='</div>';
  h+='<div style="padding:0 16px 12px"><div style="font-size:10px;font-weight:700;color:#fff;background:#546E7A;padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:8px">TABEL REFERENSI GRADE (Skala 1-4)</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:10px;border:2px solid #0D2E5A"><thead><tr>';
  ['Grade','Rentang Nilai','Kategori','Tindak Lanjut'].forEach(function(x){h+='<th style="background:#0D2E5A;color:#fff;padding:6px 8px;border:1px solid #1D4E8A;text-align:center">'+x+'</th>'});
  h+='</tr></thead><tbody>';
  [{g:'A',r:'3.50 - 4.00',l:'SANGAT BAIK',s:3.5,tl:'Pertahankan, beri tanggung jawab lebih'},{g:'B',r:'3.00 - 3.49',l:'BAIK',s:3,tl:'Pertahankan & tingkatkan area lemah'},{g:'C',r:'2.00 - 2.99',l:'CUKUP',s:2,tl:'Coaching 2 minggu + target remedial'},{g:'D',r:'1.00 - 1.99',l:'PERLU PERBAIKAN',s:1,tl:'SP1 + Training ulang + Pendampingan'}].forEach(function(gg){
    var gc2=gc(gg.s);var act=r.grade===gg.g;
    h+='<tr><td style="text-align:center;background:'+gc2.bg+';font-size:15px;font-weight:700;color:'+gc2.fg+';border:1px solid #C8D8EA;padding:6px 8px'+(act?';outline:3px solid '+gc2.dbg:'')+'">'+gg.g+'</td><td style="text-align:center;border:1px solid #C8D8EA;padding:6px 8px;background:'+(act?gc2.bg:'#fff')+';color:'+gc2.fg+';font-weight:700">'+gg.r+'</td><td style="text-align:center;border:1px solid #C8D8EA;padding:6px 8px;background:'+(act?gc2.bg:'#fff')+';color:'+gc2.fg+';font-weight:700">'+gg.l+'</td><td style="border:1px solid #C8D8EA;padding:6px 8px;background:'+(act?gc2.bg:'#fff')+';font-size:10px">'+gg.tl+'</td></tr>';
  });
  h+='</tbody></table></div>';
  if(i.kuat||i.lemah||i.target||i.action||i.catatan||i.keputusan){
    h+='<div style="padding:0 16px 12px"><div style="font-size:10px;font-weight:700;color:#fff;background:#1565C0;padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:7px">CATATAN &amp; KEPUTUSAN</div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:10px;border:2px solid #0D2E5A"><thead><tr><th style="background:#0D2E5A;color:#fff;padding:6px 9px;border:1px solid #1D4E8A;width:130px">Kategori</th><th style="background:#0D2E5A;color:#fff;padding:6px 9px;border:1px solid #1D4E8A">Isi</th></tr></thead><tbody>';
    [['Kekuatan',i.kuat],['Area Tingkatkan',i.lemah],['Target Depan',i.target],['Action Plan',i.action],['Keputusan','<b>'+esc(i.keputusan)+'</b>'],i.catatan?['Catatan',i.catatan]:null].filter(Boolean).forEach(function(x,ix){h+='<tr style="background:'+(ix%2?'#F4F8FD':'#fff')+'"><td style="font-weight:700;color:#0D2E5A;padding:6px 9px;border:1px solid #C8D8EA">'+x[0]+'</td><td style="padding:6px 9px;border:1px solid #C8D8EA">'+(x[1]||'-')+'</td></tr>';});
    h+='</tbody></table></div>';
  }
  h+='<div style="padding:0 16px 16px"><div style="font-size:10px;font-weight:700;color:#fff;background:#0D2E5A;padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:8px">TANDA TANGAN &amp; PERSETUJUAN</div>';
  h+='<table style="width:100%;border-collapse:collapse;border:2px solid #0D2E5A"><thead><tr>';
  ['Staff yang Dinilai','Supervisor / Leader','Owner / Hokky'].forEach(function(x){h+='<th style="background:#0D2E5A;color:#fff;padding:7px;border:2px solid #0D2E5A;text-align:center;font-size:10px">'+x+'</th>'});
  h+='</tr></thead><tbody><tr>';
  [[esc(i.nama),'#1565C0','#EEF4FF'],['___________','#0D2E5A','#F0F4F8'],['Hokky','#2E7D32','#EEF8EE']].forEach(function(x){h+='<td style="background:'+x[2]+';border:2px solid #0D2E5A;padding:12px;text-align:center;vertical-align:top"><div style="height:40px;border-bottom:2px solid '+x[1]+'60;margin-bottom:7px"></div><div style="font-size:10px;font-weight:700;color:'+x[1]+'">'+x[0]+'</div><div style="font-size:9px;color:#90A4AE;margin-top:3px">Tanggal: ___________</div></td>';});
  h+='</tr></tbody></table></div>';
  h+='<div style="background:#0D2E5A;padding:7px 16px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><div style="font-size:9px;color:#90CAF9">Anton Jaya Wijaya \u2014 ID: '+r.id+'</div><div style="font-size:9px;color:#64B5F6">'+fmtD(r.submittedAt)+'</div></div></div>';
  return h;
}
function showEvalReport(r){
  var cfg=getCfg(),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  var h='<div class="noprint" style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:11px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="window.open(\'https://wa.me/'+adminWA+'?text=\'+encodeURIComponent(buildEvalCaption(curEval)),\'_blank\')" style="background:#25D366;padding:8px 12px">WA Admin</button>';
  if(r.info.noWA)h+='<button class="btna" onclick="window.open(\'https://wa.me/\'+curEval.info.noWA.replace(/\\D/g,\'\')+\'?text=\'+encodeURIComponent(buildEvalCaption(curEval)),\'_blank\')" style="background:#128C7E;padding:8px 12px">WA Karyawan</button>';
  if(r.info.email)h+='<button class="btna" onclick="window.location.href=\'mailto:\'+curEval.info.email+\'?subject=\'+encodeURIComponent(\'Laporan Penilaian \u2014 \'+curEval.info.nama)+\'&body=\'+encodeURIComponent(buildEvalCaption(curEval))" style="background:#1565C0;padding:8px 12px">Email</button>';
  h+='<button class="btna" onclick="genPDF(\'EVAL-RPT\',\'Penilaian_\'+curEval.info.nama)" style="background:#E65100;padding:8px 12px">PDF</button>';
  h+='<button class="btna" onclick="window.print()" style="background:#546E7A;padding:8px 12px">Print</button>';
  h+='<button class="btna" onclick="evalInfo=initEI();evalScores=initES();SECS.forEach(function(s){evalCol[s.key]=false});renderEvalForm()" style="background:#0D2E5A;padding:8px 12px">+ Form Baru</button></div>';
  h+=buildEvalHTML(r);
  document.getElementById('V-eval').innerHTML=h;
}

/* ====== PAYROLL ====== */
function calcPay(){var p=parseInt(payInfo.gajiPokok)||0,l=parseInt(payInfo.lembur)||0,a=parseInt(payInfo.allowance)||0,b=parseInt(payInfo.bonus)||0,k=p+l+a+b,pj=parseInt(payInfo.pajak)||0,pt=parseInt(payInfo.potAbsen)||0,bj=parseInt(payInfo.bpjs)||0;return{gajiPokok:p,lembur:l,allowance:a,bonus:b,kotor:k,pajak:pj,potAbsen:pt,bpjs:bj,kasbon:parseInt(payInfo.kasbon)||0,bersih:k-pj-pt-bj}}
function payLiveCalc(){var c=calcPay();var k=document.getElementById('PAY-KOTOR'),b=document.getElementById('PAY-BERSIH');if(k)k.textContent='Rp '+fmt(c.kotor);if(b){b.textContent='Rp '+fmt(c.bersih);b.style.color=c.bersih>=0?'#2E7D32':'#C62828'}updatePayPreview()}
function updatePayPreview(){var el=document.getElementById('PAY-PREV');if(!el||!payInfo.nama)return;var c=calcPay();var tmp={id:'PRV',info:payInfo,gajiPokok:c.gajiPokok,lembur:c.lembur,allowance:c.allowance,bonus:c.bonus,kotor:c.kotor,pajak:c.pajak,potAbsen:c.potAbsen,bpjs:c.bpjs,kasbon:c.kasbon,bersih:c.bersih,submittedAt:isoNow()};el.innerHTML=buildPayHTML(tmp);el.style.filter=previewBW?'grayscale(100%)':'';}
function autoWeek(){var now=new Date(),d=now.getDay(),diff=d===0?-6:1-d;var mon=new Date(now);mon.setDate(now.getDate()+diff);var fri=new Date(mon);fri.setDate(mon.getDate()+4);payInfo.tglMulai=ymd(mon);payInfo.tglAkhir=ymd(fri);var tm=document.getElementById('PAY-TM'),ta=document.getElementById('PAY-TA');if(tm)tm.value=payInfo.tglMulai;if(ta)ta.value=payInfo.tglAkhir;updPLab();}
function updPLab(){var el=document.getElementById('PLAB');if(!el)return;if(payInfo.tglMulai&&payInfo.tglAkhir)el.textContent=fmtRange(payInfo.tglMulai,payInfo.tglAkhir);}
function setPP(type){payInfo.tipe=type;document.querySelectorAll('.pbtn').forEach(function(b){b.classList.toggle('on',b.dataset.t===type)});var wf=document.getElementById('PAY-WF'),mf=document.getElementById('PAY-MF');if(wf)wf.style.display=type==='Mingguan'?'grid':'none';if(mf)mf.style.display=type==='Bulanan'?'grid':'none';if(type==='Mingguan')autoWeek();}
function paySubmit(){
  if(!payInfo.nama.trim()){toast('Nama wajib diisi','error');return}
  if(payInfo.tipe==='Mingguan'&&!payInfo.tglMulai){toast('Tanggal mulai periode wajib','error');return}
  if(payInfo.tipe==='Bulanan'&&!payInfo.bulan){toast('Bulan wajib diisi','error');return}
  var c=calcPay();
  curPay={id:Date.now(),type:'payroll',info:JSON.parse(JSON.stringify(payInfo)),gajiPokok:c.gajiPokok,lembur:c.lembur,allowance:c.allowance,bonus:c.bonus,kotor:c.kotor,pajak:c.pajak,potAbsen:c.potAbsen,bpjs:c.bpjs,kasbon:c.kasbon,bersih:c.bersih,submittedAt:isoNow()};
  payHistory.unshift(curPay);if(payHistory.length>500)payHistory.pop();sv('ajw_pay',payHistory);
  showPaySlip(curPay);sendPayNotifs(curPay);
  if(document.getElementById('BKT-payroll')&&document.getElementById('BKT-payroll').checked)syncTelegram(curPay,'payroll');
  if(document.getElementById('BKD-payroll')&&document.getElementById('BKD-payroll').checked)uploadDrive(curPay,'payroll');
  toast('Slip gaji berhasil dibuat!','success',4000);
}
function renderPayrollForm(){
  var c=calcPay();
  var L='<div class="card">';
  if(employees.length){L+='<div style="margin-bottom:10px"><label class="lbl">Pilih dari Database</label><select class="fi" onchange="if(this.value!==\'\')pickEmp(parseInt(this.value),\'payroll\')"><option value="">-- Pilih karyawan --</option>';employees.forEach(function(e,i){L+='<option value="'+i+'">'+esc(e.nama)+' \u2014 '+esc(e.jabatan)+'</option>'});L+='</select></div>';}
  L+='<span style="background:#00838F;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:9px">DATA KARYAWAN &amp; PERIODE GAJI</span>';
  L+='<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Nama *</label><input class="fi" type="text" value="'+esc(payInfo.nama)+'" oninput="payInfo.nama=this.value;updatePayPreview()"></div><div><label class="lbl">Jabatan</label><input class="fi" type="text" value="'+esc(payInfo.jabatan)+'" oninput="payInfo.jabatan=this.value"></div><div><label class="lbl">No. WhatsApp</label><input class="fi" type="text" value="'+esc(payInfo.noWA)+'" placeholder="628xxx" oninput="payInfo.noWA=this.value"></div><div><label class="lbl">Email</label><input class="fi" type="email" value="'+esc(payInfo.email)+'" oninput="payInfo.email=this.value"></div></div>';
  L+='<div style="margin-bottom:8px"><label class="lbl">Tipe Periode</label><div style="display:flex;gap:6px;margin-top:5px"><button class="pbtn'+(payInfo.tipe==='Mingguan'?' on':'')+'" data-t="Mingguan" onclick="setPP(\'Mingguan\')">Mingguan</button><button class="pbtn'+(payInfo.tipe==='Bulanan'?' on':'')+'" data-t="Bulanan" onclick="setPP(\'Bulanan\')">Bulanan</button></div></div>';
  L+='<div id="PAY-WF" class="g2" style="margin-bottom:8px;'+(payInfo.tipe!=='Mingguan'?'display:none':'')+'">';
  L+='<div><label class="lbl">Tanggal Mulai</label><input id="PAY-TM" class="fi" type="date" value="'+(payInfo.tglMulai||'')+'" oninput="payInfo.tglMulai=this.value;updPLab()"></div>';
  L+='<div><label class="lbl">Tanggal Akhir</label><input id="PAY-TA" class="fi" type="date" value="'+(payInfo.tglAkhir||'')+'" oninput="payInfo.tglAkhir=this.value;updPLab()"></div></div>';
  L+='<div id="PAY-MF" class="g2" style="margin-bottom:8px;'+(payInfo.tipe!=='Bulanan'?'display:none':'')+'">';
  L+='<div><label class="lbl">Bulan *</label><select class="fi" onchange="payInfo.bulan=this.value"><option value="">-- Pilih --</option>';MONTHS.forEach(function(m){L+='<option value="'+m+'"'+(payInfo.bulan===m?' selected':'')+'>'+m+'</option>'});L+='</select></div>';
  L+='<div><label class="lbl">Tahun</label><input class="fi" type="number" value="'+payInfo.tahun+'" oninput="payInfo.tahun=this.value"></div></div>';
  L+='<div id="PLAB" style="background:#E0F7FA;border-radius:6px;padding:7px 11px;margin-bottom:8px;font-size:12px;color:#004D40;font-weight:700">'+(payInfo.tglMulai?fmtRange(payInfo.tglMulai,payInfo.tglAkhir):'Pilih tanggal periode')+'</div>';
  L+='<div class="g2"><div><label class="lbl">Tanggal Bayar</label><input class="fi" type="text" value="'+esc(payInfo.tanggal)+'" oninput="payInfo.tanggal=this.value"></div><div><label class="lbl">Hari Kerja</label><input class="fi" type="number" value="'+(payInfo.hariKerja||'')+'" placeholder="0" oninput="payInfo.hariKerja=this.value;payLiveCalc()"></div></div></div>';
  L+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
  L+='<div class="card"><span style="background:#2E7D32;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:8px">+ PENDAPATAN</span>';
  [['gajiPokok','Gaji Pokok *'],['lembur','Upah Lembur'],['allowance','Allowance / Tunjangan'],['bonus','Bonus / Insentif']].forEach(function(x){L+='<div style="margin-bottom:7px"><label class="lbl">'+x[1]+'</label><div style="display:flex;align-items:center;gap:5px"><span style="font-size:12px;font-weight:700;color:var(--tx2);flex-shrink:0">Rp</span><input class="fi" type="number" value="'+(payInfo[x[0]]||'')+'" placeholder="0" oninput="payInfo.'+x[0]+'=parseInt(this.value)||0;payLiveCalc()"></div></div>';});
  L+='<div style="background:#E8F5E9;border-radius:7px;padding:9px;margin-top:5px;border:1px solid #2E7D3240"><div style="font-size:10px;color:#2E7D32;font-weight:700">TOTAL KOTOR</div><div id="PAY-KOTOR" style="font-size:18px;font-weight:700;color:#2E7D32;margin-top:2px">Rp '+fmt(c.kotor)+'</div></div></div>';
  L+='<div class="card"><span style="background:#C62828;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:8px">- POTONGAN</span>';
  [['pajak','Pajak (PPh21)'],['potAbsen','Potongan Absensi'],['bpjs','BPJS']].forEach(function(x){L+='<div style="margin-bottom:7px"><label class="lbl">'+x[1]+'</label><div style="display:flex;align-items:center;gap:5px"><span style="font-size:12px;font-weight:700;color:var(--tx2);flex-shrink:0">Rp</span><input class="fi" type="number" value="'+(payInfo[x[0]]||'')+'" placeholder="0" oninput="payInfo.'+x[0]+'=parseInt(this.value)||0;payLiveCalc()"></div></div>';});
  L+='<div style="background:#FFEBEE;border-radius:7px;padding:9px;margin-top:5px;border:1px solid #C6282840"><div style="font-size:10px;color:#C62828;font-weight:700">GAJI BERSIH</div><div id="PAY-BERSIH" style="font-size:18px;font-weight:700;color:'+(c.bersih>=0?'#2E7D32':'#C62828')+';margin-top:2px">Rp '+fmt(c.bersih)+'</div></div></div></div>';
  L+='<div class="card"><div class="g2"><div><label class="lbl">Kas Bon</label><div style="display:flex;align-items:center;gap:5px"><span style="font-size:12px;font-weight:700;color:var(--tx2);flex-shrink:0">Rp</span><input class="fi" type="number" value="'+(payInfo.kasbon||'')+'" placeholder="0" oninput="payInfo.kasbon=parseInt(this.value)||0;payLiveCalc()"></div></div><div><label class="lbl">Catatan</label><textarea class="fi" oninput="payInfo.catatan=this.value">'+esc(payInfo.catatan)+'</textarea></div></div></div>';
  L+=buildBackupOpts('payroll');
  L+='<div style="display:flex;justify-content:flex-end;gap:8px;padding-bottom:18px"><button class="btns" onclick="payInfo=initPI();renderPayrollForm()">Reset</button><button class="btnp" onclick="paySubmit()" style="background:#00838F">Generate Slip &amp; Kirim</button></div>';
  var R='<div style="position:sticky;top:68px;max-height:calc(100vh - 78px);overflow-y:auto;resize:horizontal;min-width:260px;border:1px dashed var(--bd2);border-radius:var(--r);padding:8px">';
  R+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span style="font-size:11px;font-weight:700;color:var(--tx2)">PREVIEW SLIP <small style="font-weight:400;color:var(--tx3)">(resize)</small></span><button class="btna" onclick="previewBW=!previewBW;var el=document.getElementById(\'PAY-PREV\');if(el)el.style.filter=previewBW?\'grayscale(100%)\':\'\';" style="background:#546E7A;padding:5px 9px;font-size:10px">BW/Color</button></div>';
  R+='<div id="PAY-PREV" style="background:#fff;border-radius:7px;overflow:hidden;font-size:9.5px"><div style="padding:22px;text-align:center;color:var(--tx3);font-size:12px">Isi nama untuk preview</div></div></div>';
  document.getElementById('V-payroll').innerHTML='<div class="split"><div>'+L+'</div>'+R+'</div>';
  if(payInfo.tipe==='Mingguan'&&!payInfo.tglMulai)autoWeek();
}
function buildPayHTML(r){
  var i=r.info,bAK=r.bersih-(r.kasbon||0),pLbl=periodeLabel(i);
  var h='<div id="PAY-RPT" style="background:#fff;max-width:680px;margin:0 auto;-webkit-print-color-adjust:exact;print-color-adjust:exact">';
  h+='<div style="background:#0D2E5A;padding:13px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  h+='<div style="display:flex;align-items:center;gap:11px"><img src="'+LOGO_SRC+'" style="width:52px;height:52px;object-fit:contain;border-radius:50%;border:2px solid #C8A400;background:#000;flex-shrink:0"><div><div style="color:#FFD700;font-weight:700;font-size:16px">ANTON JAYA PANCING</div><div style="color:#C8A400;font-size:10px">Anton Jaya Wijaya</div></div></div>';
  h+='<div style="text-align:right"><div style="color:#fff;font-size:14px;font-weight:700">SALARY SLIP</div><div style="color:#90CAF9;font-size:10px">ID: '+r.id+'</div></div></div>';
  h+='<div style="background:#EEF4FF;padding:10px 18px;border-bottom:2px solid #0D2E5A"><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:11px">';
  [['Karyawan',i.nama],['Jabatan',i.jabatan],['Periode',pLbl],['Tipe',i.tipe],['Tanggal Bayar',i.tanggal],['Hari Kerja',(i.hariKerja||'-')+' hari']].forEach(function(x){h+='<div style="display:flex;gap:5px"><span style="color:#546E7A;min-width:78px">'+x[0]+'</span><span style="font-weight:700;color:#0D2E5A">: '+esc(x[1]||'-')+'</span></div>';});
  h+='</div></div>';
  h+='<div style="padding:12px 18px"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th colspan="3" style="background:#1A1A2E;color:#fff;padding:6px 10px;border:1px solid #333;text-align:left">INCOME</th><th colspan="3" style="background:#1A1A2E;color:#fff;padding:6px 10px;border:1px solid #333;text-align:left">REVENUE CUTS</th></tr></thead><tbody>';
  var incI=[['Gaji Pokok',r.gajiPokok],['Upah Lembur',r.lembur],['Allowance',r.allowance],['Tunjangan/Bonus',r.bonus]];
  var cutI=[['Pajak',r.pajak],['Pot. Absensi',r.potAbsen],['BPJS',r.bpjs],['','']];
  for(var ix=0;ix<4;ix++){var inc=incI[ix],cut=cutI[ix];h+='<tr><td style="padding:5px 9px;border:1px solid #E2E8F0;color:#546E7A">'+inc[0]+'</td><td style="padding:5px 9px;border:1px solid #E2E8F0;color:#546E7A;text-align:right">Rp</td><td style="padding:5px 9px;border:1px solid #E2E8F0;font-weight:'+(inc[1]>0?'700':'400')+';text-align:right">'+(inc[1]>0?fmt(inc[1]):'-')+'</td><td style="padding:5px 9px;border:1px solid #E2E8F0;color:#546E7A">'+cut[0]+'</td><td style="padding:5px 9px;border:1px solid #E2E8F0;color:#546E7A;text-align:right">'+(cut[0]?'Rp':'')+'</td><td style="padding:5px 9px;border:1px solid #E2E8F0;text-align:right">'+(cut[0]?(cut[1]>0?fmt(cut[1]):'-'):'')+'</td></tr>';}
  h+='</tbody></table>';
  if(i.catatan)h+='<div style="margin-top:6px;padding:6px 10px;background:#FFFDE7;border-radius:5px;font-size:11px"><b>Catatan: </b>'+esc(i.catatan)+'</div>';
  var tc=r.pajak+r.potAbsen+r.bpjs;
  h+='<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:9px"><tr><td style="background:#1A1A2E;color:#fff;font-weight:700;padding:6px 10px;border:1px solid #333;width:50%">TOTAL INCOME</td><td style="background:#1A1A2E;color:#fff;padding:6px 10px;border:1px solid #333;text-align:right">Rp</td><td style="background:#1A1A2E;color:#FFD700;font-weight:700;padding:6px 10px;border:1px solid #333;text-align:right">'+fmt(r.kotor)+'</td><td style="background:#C62828;color:#fff;font-weight:700;padding:6px 10px;border:1px solid #333">TOTAL CUTS</td><td style="background:#C62828;color:#fff;padding:6px 10px;border:1px solid #333;text-align:right">Rp</td><td style="background:#C62828;color:#fff;font-weight:700;padding:6px 10px;border:1px solid #333;text-align:right">'+(tc>0?fmt(tc):'-')+'</td></tr></table>';
  h+='<div style="background:#0D2E5A;border-radius:7px;padding:11px 15px;margin-top:8px;text-align:center"><div style="color:#90CAF9;font-size:10px;font-weight:700">TOTAL GAJI BERSIH (NET SALARY)</div><div style="color:#FFD700;font-size:24px;font-weight:700;margin:3px 0">'+fmt(r.bersih)+'</div><div style="color:#fff;font-size:11px">Rp '+fmt(r.bersih)+'</div></div>';
  if(r.kasbon>0)h+='<div style="background:#FFF3E0;border-radius:7px;padding:9px 14px;margin-top:7px;border:2px solid #E65100;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;color:#E65100;font-weight:700">Kas Bon</div></div><div style="text-align:right"><div style="font-size:11px;color:#E65100">- Rp '+fmt(r.kasbon)+'</div><div style="font-size:14px;font-weight:700;color:#2E7D32">Net Dibayar: Rp '+fmt(bAK)+'</div></div></div>';
  h+='<div style="margin-top:14px;display:flex;justify-content:space-between;align-items:flex-end"><div style="font-size:11px;color:#546E7A">Regards,</div><div style="text-align:center"><div style="height:36px;border-bottom:2px solid #0D2E5A;width:120px;margin-bottom:6px"></div><div style="font-size:11px;font-weight:700;color:#0D2E5A">Hokky</div><div style="font-size:10px;color:#546E7A">Owner \u2014 Anton Jaya Wijaya</div></div></div></div>';
  h+='<div style="background:#1A1A2E;padding:7px 18px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><div style="font-size:9px;color:#90CAF9">Anton Jaya Wijaya \u2014 ID: '+r.id+'</div><div style="font-size:9px;color:#64B5F6">'+fmtD(r.submittedAt)+'</div></div></div>';
  return h;
}
function showPaySlip(r){
  var cfg=getCfg(),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  var h='<div class="noprint" style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:11px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="window.open(\'https://wa.me/'+adminWA+'?text=\'+encodeURIComponent(buildPayCaption(curPay)),\'_blank\')" style="background:#25D366;padding:8px 12px">WA Admin</button>';
  if(r.info.noWA)h+='<button class="btna" onclick="window.open(\'https://wa.me/\'+curPay.info.noWA.replace(/\\D/g,\'\')+\'?text=\'+encodeURIComponent(buildPayCaption(curPay)),\'_blank\')" style="background:#128C7E;padding:8px 12px">WA Karyawan</button>';
  h+='<button class="btna" onclick="genPDF(\'PAY-RPT\',\'SlipGaji_\'+curPay.info.nama)" style="background:#E65100;padding:8px 12px">PDF</button>';
  h+='<button class="btna" onclick="window.print()" style="background:#546E7A;padding:8px 12px">Print</button>';
  h+='<button class="btna" onclick="payInfo=initPI();renderPayrollForm()" style="background:#00838F;padding:8px 12px">+ Slip Baru</button></div>';
  h+=buildPayHTML(r);
  document.getElementById('V-payroll').innerHTML=h;
}

/* ====== CAPTIONS ====== */
function buildEvalCaption(r){
  var cfg=getCfg(),tpl=cfg.evalTpl||'LAPORAN PENILAIAN KINERJA\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nTanggal: {tanggal}\n\nNILAI AKHIR: {nilai} / 4.00\nGrade: {grade} - {kategori}\n\nRincian:\n{rincian}\n\nKeputusan: {keputusan}\n{catatan}\n\n_Anton Jaya Wijaya_';
  var rincian=SECS.map(function(s){return '- '+s.title+' ('+s.w+'%): '+(r.secScores[s.key]||0).toFixed(2)+' / Grade '+grade(r.secScores[s.key]||0)}).join('\n');
  return tpl.replace(/{nama}/g,r.info.nama).replace(/{jabatan}/g,r.info.jabatan).replace(/{periode}/g,periodeLabel(r.info)).replace(/{tipe}/g,r.info.tipe).replace(/{tanggal}/g,r.info.tanggal).replace(/{nilai}/g,r.fs.toFixed(2)).replace(/{grade}/g,r.grade).replace(/{kategori}/g,r.cat).replace(/{rincian}/g,rincian).replace(/{keputusan}/g,r.info.keputusan).replace(/{catatan}/g,r.info.catatan?'Catatan: '+r.info.catatan:'');
}
function buildPayCaption(r){
  var cfg=getCfg(),tpl=cfg.payTpl||'SLIP GAJI KARYAWAN\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nHari Kerja: {hariKerja} hari\n\nGaji Pokok : Rp {gajiPokok}\nLembur     : Rp {lembur}\nBonus      : Rp {bonus}\nTotal Kotor: Rp {kotor}\n\nGAJI BERSIH: Rp {bersih}\n\n_Anton Jaya Wijaya_';
  return tpl.replace(/{nama}/g,r.info.nama).replace(/{jabatan}/g,r.info.jabatan).replace(/{periode}/g,periodeLabel(r.info)).replace(/{tipe}/g,r.info.tipe).replace(/{hariKerja}/g,r.info.hariKerja||'-').replace(/{tanggal}/g,r.info.tanggal).replace(/{gajiPokok}/g,fmt(r.gajiPokok)).replace(/{lembur}/g,fmt(r.lembur)).replace(/{bonus}/g,fmt(r.bonus)).replace(/{kotor}/g,fmt(r.kotor)).replace(/{bersih}/g,fmt(r.bersih));
}
function buildStatsCaption(emp,filterType){
  var ee=evalHistory.filter(function(d){return d.info.nama===emp});
  var ep=payHistory.filter(function(d){return d.info.nama===emp});
  if(filterType==='eval')ep=[];
  if(filterType==='pay')ee=[];
  var ea=ee.length?ee.reduce(function(a,b){return a+b.fs},0)/ee.length:0;
  var et=ep.reduce(function(a,b){return a+b.bersih},0);
  var txt='STATISTIK KARYAWAN \u2014 Anton Jaya Wijaya\n\nNama: '+emp+'\n';
  if(ee.length)txt+='Total Evaluasi: '+ee.length+'\nRata-rata Nilai: '+(ea>0?ea.toFixed(2):'-')+' / 4.00\nNilai Terbaik: '+Math.max.apply(null,ee.map(function(d){return d.fs})).toFixed(2)+'\n\n';
  if(ep.length)txt+='Total Slip Gaji: '+ep.length+'\nTotal Gaji Diterima: Rp '+fmt(et)+'\nRata-rata Gaji: Rp '+fmt(ep.length?Math.round(et/ep.length):0)+'\n\n';
  return txt+'_Anton Jaya Wijaya_';
}

/* ====== NOTIFICATIONS ====== */
function sendEvalNotifs(r){
  var cfg=getCfg(),caption=buildEvalCaption(r),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  if(adminWA)setTimeout(function(){window.open('https://wa.me/'+adminWA+'?text='+encodeURIComponent('[LAPORAN MASUK]\n'+caption),'_blank')},600);
  if(r.info.noWA)setTimeout(function(){window.open('https://wa.me/'+r.info.noWA.replace(/\D/g,'')+'?text='+encodeURIComponent(caption),'_blank')},1400);
  if(r.info.email)setTimeout(function(){var a=document.createElement('a');a.href='mailto:'+r.info.email+'?subject='+encodeURIComponent('Laporan Penilaian - '+r.info.nama)+'&body='+encodeURIComponent(caption);a.click()},2200);
}
function sendPayNotifs(r){
  var cfg=getCfg(),caption=buildPayCaption(r),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  if(adminWA)setTimeout(function(){window.open('https://wa.me/'+adminWA+'?text='+encodeURIComponent('[SLIP GAJI]\n'+caption),'_blank')},600);
  if(r.info.noWA)setTimeout(function(){window.open('https://wa.me/'+r.info.noWA.replace(/\D/g,'')+'?text='+encodeURIComponent(caption),'_blank')},1400);
  if(r.info.email)setTimeout(function(){var a=document.createElement('a');a.href='mailto:'+r.info.email+'?subject='+encodeURIComponent('Slip Gaji - '+r.info.nama)+'&body='+encodeURIComponent(caption);a.click()},2200);
}

/* ====== TELEGRAM (FIXED) ====== */
function syncTelegram(data,type){
  var cfg=getCfg();if(!cfg.tgToken||!cfg.tgChat)return;
  var msg=type==='eval'?buildEvalCaption(data):buildPayCaption(data);
  fetch('https://api.telegram.org/bot'+cfg.tgToken+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:cfg.tgChat,text:msg})})
  .then(function(r){return r.json()}).then(function(d){if(d.ok)toast('Telegram backup terkirim','success');else toast('Telegram: '+d.description,'error')})
  .catch(function(){toast('Gagal kirim Telegram','error')});
}

/* ====== DRIVE ====== */
function uploadDrive(data,type){
  var cfg=getCfg();if(!cfg.driveToken)return;
  var folderId=type==='eval'?(cfg.driveEvalFolder||'1D4lQmi48BBPNYxhqAM_Qtp68I6nPTw9Z'):(cfg.drivePayFolder||'10b5C7W-33tS3Ujd5xYcvjtYj_9NYsWhJ');
  var empName=(data.info?data.info.nama:'Unknown').replace(/[^a-zA-Z0-9 ]/g,'').trim();
  var dateStr=new Date().toISOString().split('T')[0];
  var filename=(type==='eval'?'Penilaian':'Payroll')+'-'+empName+'-'+dateStr+'.json';
  var meta=JSON.stringify({name:filename,parents:[folderId]});
  var content=JSON.stringify(data,null,2);
  var boundary='AJW_'+Date.now();
  var body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+content+'\r\n--'+boundary+'--';
  fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{'Authorization':'Bearer '+cfg.driveToken,'Content-Type':'multipart/related; boundary='+boundary},body:body})
  .then(function(r){return r.json()}).then(function(d){if(d.id)toast('Drive: '+filename+' uploaded','success',4000);else toast('Drive: '+(d.error?d.error.message:'Gagal'),'error')})
  .catch(function(){toast('Gagal upload Drive','error')});
}

/* ====== PDF ====== */
function genPDF(elId,filename){
  toast('Membuat PDF...','info',6000);
  var el=document.getElementById(elId);if(!el){toast('Element tidak ada','error');return}
  html2canvas(el,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false}).then(function(canvas){
    var jsPDF2=window.jspdf.jsPDF;var pdf=new jsPDF2({orientation:'portrait',unit:'mm',format:'a4'});
    var imgData=canvas.toDataURL('image/jpeg',0.92);
    var pdfW=pdf.internal.pageSize.getWidth(),pdfH=(canvas.height*pdfW)/canvas.width;
    var pgH=pdf.internal.pageSize.getHeight(),left=pdfH,pos=0;
    pdf.addImage(imgData,'JPEG',0,pos,pdfW,pdfH);left-=pgH;
    while(left>0){pos=left-pdfH;pdf.addPage();pdf.addImage(imgData,'JPEG',0,pos,pdfW,pdfH);left-=pgH}
    pdf.save((filename||'dokumen')+'.pdf');toast('PDF berhasil diunduh!','success');
  }).catch(function(e){toast('Gagal PDF: '+e.message,'error')});
}

/* ====== STATS ====== */
function renderStats(){
  var empNames=[].concat(evalHistory.map(function(d){return d.info.nama}),payHistory.map(function(d){return d.info.nama})).filter(function(n,i,arr){return n&&arr.indexOf(n)===i}).sort();
  var seenP={};var allPeriods=[];
  evalHistory.forEach(function(d){var lbl=periodeLabel(d.info);if(lbl&&lbl!=='-'&&!seenP[lbl]){seenP[lbl]=1;allPeriods.push({label:lbl,key:d.info.tglMulai||d.info.periode||''})}});
  allPeriods.sort(function(a,b){return b.key.localeCompare(a.key)});
  var fe=evalHistory.filter(function(d){return(statsFilter.emp==='all'||d.info.nama===statsFilter.emp)&&(statsFilter.period==='all'||periodeLabel(d.info)===statsFilter.period)});
  var fp=payHistory.filter(function(d){return statsFilter.emp==='all'||d.info.nama===statsFilter.emp});
  var avgS=fe.length?fe.reduce(function(a,b){return a+b.fs},0)/fe.length:0;
  var totalP=fp.reduce(function(a,b){return a+b.bersih},0),avgP=fp.length?totalP/fp.length:0;
  var h='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;flex-wrap:wrap;gap:7px"><span style="background:#1565C0;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700">DASHBOARD STATISTIK</span>';
  if(statsFilter.emp!=='all'){
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
    h+='<button class="btna" onclick="window.open(\'https://wa.me/\'+(getCfg().adminWA||\'6285710597159\').replace(/\\D/g,\'\')+\'?text=\'+encodeURIComponent(buildStatsCaption(statsFilter.emp,statsFilter.type)),\'_blank\')" style="background:#25D366;padding:7px 12px;font-size:11px">Kirim Statistik ke WA</button>';
    h+='<button class="btna" onclick="var el=document.getElementById(\'STATS-DETAIL\')||document.getElementById(\'STATS-MAIN\');genPDF(el.id,\'Statistik_\'+statsFilter.emp)" style="background:#E65100;padding:7px 12px;font-size:11px">Print / PDF</button>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">';
  h+='<div style="flex:1;min-width:140px"><label class="lbl">Filter Karyawan</label><select class="fi" onchange="statsFilter.emp=this.value;renderStats()"><option value="all">Semua</option>';
  empNames.forEach(function(n){h+='<option value="'+esc(n)+'"'+(statsFilter.emp===n?' selected':'')+'>'+esc(n)+'</option>'});
  h+='</select></div>';
  h+='<div style="flex:1;min-width:160px"><label class="lbl">Filter Periode</label><select class="fi" onchange="statsFilter.period=this.value;renderStats()"><option value="all">Semua Periode</option>';
  allPeriods.forEach(function(p){h+='<option value="'+esc(p.label)+'"'+(statsFilter.period===p.label?' selected':'')+'>'+esc(p.label)+'</option>'});
  h+='</select></div>';
  h+='<div style="flex:1;min-width:140px"><label class="lbl">Tampilkan</label><select class="fi" onchange="statsFilter.type=this.value;renderStats()"><option value="all">Penilaian + Gaji</option><option value="eval">Penilaian Saja</option><option value="pay">Gaji Saja</option></select></div></div>';
  h+='<div id="STATS-MAIN"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:12px">';
  [['Evaluasi',fe.length,'#DBEAFE','#1565C0'],['Avg Nilai',avgS>0?avgS.toFixed(2):'-','#E8F5E9','#2E7D32'],['Slip Gaji',fp.length,'#FFF3E0','#E65100'],['Total Gaji','Rp '+fmt(totalP),'#E0F7FA','#006064']].forEach(function(x){h+='<div style="background:'+x[2]+';border-radius:9px;padding:11px;text-align:center;border:1px solid '+x[3]+'40"><div style="font-size:'+(String(x[1]).length>7?'13':'21')+'px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div><div style="font-size:10px;font-weight:700;color:'+x[3]+';margin-top:2px">'+x[0]+'</div></div>';});
  h+='</div>';
  if(fp.length&&statsFilter.type!=='eval'){
    var maxP=Math.max.apply(null,fp.map(function(d){return d.bersih})),minP=Math.min.apply(null,fp.map(function(d){return d.bersih}));
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px">';
    [['Gaji Tertinggi','Rp '+fmt(maxP),'#E8F5E9','#2E7D32'],['Gaji Terendah','Rp '+fmt(minP),'#FFEBEE','#C62828'],['Rata-rata Gaji','Rp '+fmt(Math.round(avgP)),'#E0F7FA','#006064']].forEach(function(x){h+='<div style="background:'+x[2]+';border-radius:9px;padding:11px;text-align:center;border:1px solid '+x[3]+'40"><div style="font-size:13px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div><div style="font-size:10px;font-weight:700;color:'+x[3]+';margin-top:2px">'+x[0]+'</div></div>';});
    h+='</div>';
  }
  if(statsFilter.type!=='pay')h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px"><div class="card" style="padding:11px"><div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:5px">Tren Nilai Penilaian</div><div style="position:relative;height:200px"><canvas id="CHT-EVAL"></canvas></div></div><div class="card" style="padding:11px"><div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:5px">Distribusi Grade</div><div style="position:relative;height:200px"><canvas id="CHT-GRADE"></canvas></div></div></div>';
  if(statsFilter.type!=='eval')h+='<div class="card" style="padding:11px;margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:5px">Tren Gaji Bersih</div><div style="position:relative;height:200px"><canvas id="CHT-PAY"></canvas></div></div>';
  h+='</div></div>';
  if(statsFilter.emp!=='all'){
    var en=statsFilter.emp;
    var ee=evalHistory.filter(function(d){return d.info.nama===en&&(statsFilter.period==='all'||periodeLabel(d.info)===statsFilter.period)});
    var ep=payHistory.filter(function(d){return d.info.nama===en});
    h+='<div class="card" style="border:2px solid #1565C0;margin-top:12px" id="STATS-DETAIL">';
    h+='<span style="background:#1565C0;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:10px">DETAIL: '+esc(en)+'</span>';
    if(ee.length&&statsFilter.type!=='pay'){
      h+='<div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px">Riwayat Penilaian</div>';
      h+='<div style="overflow-x:auto;margin-bottom:12px"><table class="tbl"><thead><tr><th>Periode</th>';
      SECS.forEach(function(s){h+='<th class="c">'+s.title.split(' ')[0]+'</th>'});
      h+='<th class="c">Nilai</th><th class="c">Grade</th><th></th></tr></thead><tbody>';
      ee.forEach(function(d){
        var cl=gc(d.fs),oi=evalHistory.indexOf(d);
        h+='<tr><td>'+esc(periodeLabel(d.info))+'</td>';
        SECS.forEach(function(s){h+='<td class="c" style="color:'+gc(d.secScores[s.key]||0).fg+';font-weight:700">'+(d.secScores[s.key]||0).toFixed(1)+'</td>'});
        h+='<td class="c" style="font-weight:700;color:'+cl.fg+';font-size:13px">'+d.fs.toFixed(2)+'</td>';
        h+='<td class="c"><span class="chip" style="background:'+cl.bg+';color:'+cl.fg+'">'+d.grade+'</span></td>';
        h+='<td style="white-space:nowrap"><button class="btnsm" onclick="viewEvalRecord('+oi+')" style="background:#1565C0">Lihat</button><button class="btnsm" onclick="editEvalRecord('+oi+')" style="background:#00838F">Edit</button></td></tr>';
      });
      h+='</tbody></table></div>';
    }
    if(ep.length&&statsFilter.type!=='eval'){
      h+='<div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px">Riwayat Payroll</div>';
      h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Periode</th><th>Tipe</th><th class="c">Pokok</th><th class="c">Lembur</th><th class="c">Bonus</th><th class="c">Kotor</th><th class="c">Potongan</th><th class="c">Bersih</th><th></th></tr></thead><tbody>';
      ep.forEach(function(d){
        var oi=payHistory.indexOf(d);
        h+='<tr><td>'+esc(periodeLabel(d.info))+'</td><td>'+d.info.tipe+'</td><td class="c">'+fmt(d.gajiPokok)+'</td><td class="c">'+fmt(d.lembur)+'</td><td class="c">'+fmt(d.bonus)+'</td><td class="c">'+fmt(d.kotor)+'</td><td class="c" style="color:#C62828">'+fmt(d.pajak+d.potAbsen+d.bpjs)+'</td><td class="c" style="font-weight:700;color:#2E7D32">'+fmt(d.bersih)+'</td>';
        h+='<td style="white-space:nowrap"><button class="btnsm" onclick="viewPayRecord('+oi+')" style="background:#00838F">Lihat</button><button class="btnsm" onclick="editPayRecord('+oi+')" style="background:#1565C0">Edit</button></td></tr>';
      });
      h+='</tbody></table></div>';
    }
    h+='</div>';
  }
  document.getElementById('V-stats').innerHTML=h;
  setTimeout(function(){
    var c1=document.getElementById('CHT-EVAL');
    if(c1){if(chartInst.eval)chartInst.eval.destroy();var el2=fe.slice(0,12).reverse();chartInst.eval=new Chart(c1,{type:'line',data:{labels:el2.map(function(d){return periodeLabel(d.info)}),datasets:[{label:'Nilai',data:el2.map(function(d){return +d.fs.toFixed(2)}),borderColor:'#1565C0',backgroundColor:'rgba(21,101,192,.1)',fill:true,tension:.4,pointRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:4,ticks:{stepSize:1}}}}})}
    var c2=document.getElementById('CHT-GRADE');
    if(c2){
      if(chartInst.grade)chartInst.grade.destroy();
      var grades=['A','B','C','D'],gradeCounts=grades.map(function(g){return fe.filter(function(d){return d.grade===g}).length}),gradeTotal=gradeCounts.reduce(function(a,b){return a+b},0);
      chartInst.grade=new Chart(c2,{type:'doughnut',data:{labels:grades,datasets:[{data:gradeTotal>0?gradeCounts:[1,0,0,0],backgroundColor:['#2E7D32','#1565C0','#F57F17','#C62828'],borderWidth:gradeTotal>0?2:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right'},tooltip:{callbacks:{label:function(ctx){if(gradeTotal===0)return 'Tidak ada data';return ctx.label+': '+ctx.raw+' ('+Math.round(ctx.raw/gradeTotal*100)+'%)'}}}}}})}
    var c3=document.getElementById('CHT-PAY');
    if(c3){if(chartInst.pay)chartInst.pay.destroy();var pl=fp.slice(0,12).reverse();chartInst.pay=new Chart(c3,{type:'bar',data:{labels:pl.map(function(d){return periodeLabel(d.info)}),datasets:[{label:'Gaji Bersih',data:pl.map(function(d){return d.bersih}),backgroundColor:'rgba(0,131,143,.7)',borderColor:'#00838F',borderWidth:2,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:function(v){return 'Rp '+fmt(v)}}}}}})}
  },120);
}

/* ====== EMPLOYEES ====== */

/* ====== HISTORY ====== */
function renderHist(){
  var all=evalHistory.map(function(d){return Object.assign({},d,{dtype:'eval'})}).concat(payHistory.map(function(d){return Object.assign({},d,{dtype:'pay'})})).sort(function(a,b){return b.id-a.id});
  var empNames=all.map(function(d){return d.info.nama}).filter(function(n,i,arr){return n&&arr.indexOf(n)===i}).sort();
  var filtered=all.filter(function(d){if(histFilter.type!=='all'&&d.dtype!==histFilter.type)return false;if(histFilter.emp!=='all'&&d.info.nama!==histFilter.emp)return false;return true;});
  var h='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;flex-wrap:wrap;gap:7px"><span style="background:#0D2E5A;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700">RIWAYAT ('+filtered.length+' dari '+all.length+')</span><div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btna" onclick="exportData()" style="background:#2E7D32;padding:7px 11px;font-size:11px">Export JSON</button><button class="btna" onclick="importData()" style="background:#1565C0;padding:7px 11px;font-size:11px">Import JSON</button></div></div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><div style="flex:1;min-width:130px"><label class="lbl">Tipe</label><select class="fi" onchange="histFilter.type=this.value;renderHist()"><option value="all">Semua</option><option value="eval"'+(histFilter.type==='eval'?' selected':'')+'>Penilaian</option><option value="pay"'+(histFilter.type==='pay'?' selected':'')+'>Payroll</option></select></div>';
  h+='<div style="flex:1;min-width:150px"><label class="lbl">Karyawan</label><select class="fi" onchange="histFilter.emp=this.value;renderHist()"><option value="all">Semua</option>';
  empNames.forEach(function(n){h+='<option value="'+esc(n)+'"'+(histFilter.emp===n?' selected':'')+'>'+esc(n)+'</option>'});
  h+='</select></div></div>';
  h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tgl</th><th>Tipe</th><th>Nama</th><th>Jabatan</th><th>Periode</th><th class="c">Nilai/Gaji</th><th class="c">Grade</th><th></th></tr></thead><tbody>';
  filtered.forEach(function(item){
    var isE=(item.dtype==='eval'),cl=isE?gc(item.fs||0):{bg:'#E0F7FA',fg:'#006064',dbg:'#00838F'};
    var oi=isE?evalHistory.findIndex(function(d){return d.id===item.id}):payHistory.findIndex(function(d){return d.id===item.id});
    h+='<tr><td style="font-size:10px;white-space:nowrap;color:var(--tx2)">'+fmtD(item.submittedAt)+'</td>';
    h+='<td><span class="chip" style="background:'+(isE?'#DBEAFE':'#E0F7FA')+';color:'+(isE?'#1565C0':'#006064')+'">'+(isE?'Eval':'Gaji')+'</span></td>';
    h+='<td style="font-weight:700;color:var(--navy)">'+esc(item.info.nama||'-')+'</td>';
    h+='<td style="color:var(--tx2);font-size:11px">'+esc(item.info.jabatan||'-')+'</td>';
    h+='<td style="color:var(--tx2);font-size:11px">'+esc(periodeLabel(item.info))+'</td>';
    h+='<td class="c" style="font-weight:700;color:'+cl.fg+'">'+(isE?item.fs.toFixed(2):'Rp '+fmt(item.bersih))+'</td>';
    h+='<td class="c"><span class="chip" style="background:'+cl.bg+';color:'+cl.fg+'">'+(isE?item.grade:'OK')+'</span></td>';
    h+='<td style="white-space:nowrap">';
    if(isE&&oi>=0)h+='<button class="btnsm" onclick="viewEvalRecord('+oi+')" style="background:#1565C0">Lihat</button><button class="btnsm" onclick="editEvalRecord('+oi+')" style="background:#00838F">Edit</button>';
    if(!isE&&oi>=0)h+='<button class="btnsm" onclick="viewPayRecord('+oi+')" style="background:#00838F">Lihat</button><button class="btnsm" onclick="editPayRecord('+oi+')" style="background:#1565C0">Edit</button>';
    h+='<button class="btnsm" onclick="';
    if(isE)h+='evalHistory=evalHistory.filter(function(d){return d.id!=='+item.id+'});sv(\'ajw_eval\',evalHistory)';
    else h+='payHistory=payHistory.filter(function(d){return d.id!=='+item.id+'});sv(\'ajw_pay\',payHistory)';
    h+=';renderHist()" style="background:#C62828;margin-left:2px">X</button></td></tr>';
  });
  if(!filtered.length)h+='<tr><td colspan="8" style="text-align:center;padding:18px;color:var(--tx3)">Tidak ada data</td></tr>';
  h+='</tbody></table></div></div>';
  document.getElementById('V-hist').innerHTML=h;
}

/* ====== DASHBOARD ====== */
function renderDash(){
  var cfg=getCfg(),totalEval=evalHistory.length,totalPay=payHistory.length,totalEmp=employees.length;
  var lastEval=evalHistory[0],lastPay=payHistory[0];
  var avgScore=totalEval?evalHistory.reduce(function(a,b){return a+b.fs},0)/totalEval:0;
  var totalGaji=payHistory.reduce(function(a,b){return a+b.bersih},0);
  var hasWA=!!(cfg.adminWA),hasTg=!!(cfg.tgToken&&cfg.tgChat),hasDrv=!!(cfg.driveToken);
  var activityCount=totalEval+totalPay;
  var healthLabel=(hasWA&&hasTg&&hasDrv)?'Semua integrasi aktif':((hasWA||hasTg||hasDrv)?'Sebagian integrasi siap':'Butuh konfigurasi');
  var h='<div class="card ajw-hero">';
  h+='<span class="chip">Overview Workspace</span>';
  h+='<div class="ajw-hero-title">Dashboard operasional AJW dengan tampilan baru yang lebih bersih, tajam, dan fokus ke keputusan cepat.</div>';
  h+='<div class="ajw-hero-copy">Seluruh fungsi tetap sama, tetapi sekarang ringkasan, akses cepat, histori terbaru, dan status integrasi tampil lebih terstruktur untuk pemantauan harian Anton Jaya Wijaya.</div>';
  h+='<div class="ajw-hero-meta">';
  h+='<div class="ajw-meta-card"><div class="ajw-meta-label">Owner</div><div class="ajw-meta-value">'+esc(cfg.adminName||'Hokky')+'</div></div>';
  h+='<div class="ajw-meta-card"><div class="ajw-meta-label">Tanggal</div><div class="ajw-meta-value" style="font-size:15px">'+new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</div></div>';
  h+='<div class="ajw-meta-card"><div class="ajw-meta-label">System Health</div><div class="ajw-meta-value" style="font-size:15px">'+healthLabel+'</div></div>';
  h+='</div></div>';
  h+='<div class="ajw-metrics">';
  [
    {v:totalEmp,l:'Karyawan Aktif',s:'Kelola database tenaga kerja',c:'var(--teal)',t:'emp'},
    {v:totalEval,l:'Penilaian Tersimpan',s:'Rata-rata '+(avgScore>0?avgScore.toFixed(2):'-')+' / 4.00',c:'var(--blue)',t:'eval'},
    {v:'Rp '+fmt(totalGaji),l:'Total Payroll',s:'Semua slip gaji tersimpan',c:'var(--orange)',t:'payroll'},
    {v:activityCount,l:'Aktivitas Sistem',s:'Eval + payroll yang tercatat',c:'var(--purple)',t:'hist'}
  ].forEach(function(x){
    h+='<div class="dash-card ajw-metric" onclick="SW(\''+x.t+'\')"><div class="ajw-metric-kicker">'+x.l+'</div><div class="ajw-metric-value" style="color:'+x.c+'">'+x.v+'</div><div class="ajw-metric-foot">'+x.s+'</div></div>';
  });
  h+='</div>';
  h+='<div class="ajw-shell">';
  h+='<div class="ajw-side-stack">';
  h+='<div class="card"><div class="ajw-panel-title">Ringkasan Performa Terbaru</div><div class="ajw-panel-sub">Pemantauan cepat untuk evaluasi dan payroll yang terakhir diproses.</div><div class="ajw-grid-2" style="margin-top:16px">';
  h+='<div class="ajw-spotlight">';
  h+='<div class="ajw-panel-title" style="font-size:12px">Penilaian Terbaru</div>';
  if(lastEval){var cl=gc(lastEval.fs);h+='<div class="ajw-summary-row"><div><strong>'+esc(lastEval.info.nama)+'</strong><span>'+esc(periodeLabel(lastEval.info))+'</span><span>'+lastEval.cat+'</span></div><div style="text-align:right"><div style="font-size:26px;font-weight:800;color:'+cl.fg+'">'+lastEval.fs.toFixed(2)+'</div><div class="chip">'+lastEval.grade+'</div></div></div>';}
  else h+='<div class="ajw-empty">Belum ada penilaian tersimpan.</div>';
  h+='<button class="btnp" onclick="SW(\'eval\')" style="width:100%;margin-top:4px">Buat Penilaian Baru</button></div>';
  h+='<div class="ajw-spotlight">';
  h+='<div class="ajw-panel-title" style="font-size:12px">Slip Gaji Terbaru</div>';
  if(lastPay){h+='<div class="ajw-summary-row"><div><strong>'+esc(lastPay.info.nama)+'</strong><span>'+esc(periodeLabel(lastPay.info))+'</span><span>Slip payroll terbaru</span></div><div style="text-align:right"><div style="font-size:24px;font-weight:800;color:var(--teal)">Rp '+fmt(lastPay.bersih)+'</div><div class="chip">Payroll</div></div></div>';}
  else h+='<div class="ajw-empty">Belum ada slip gaji tersimpan.</div>';
  h+='<button class="btnp" onclick="SW(\'payroll\')" style="width:100%;margin-top:4px;background:linear-gradient(135deg,var(--teal),#48c7bb)!important;box-shadow:0 14px 26px rgba(15,159,143,.20)!important">Generate Slip Gaji</button></div>';
  h+='</div></div>';
  h+='<div class="card"><div class="ajw-panel-title">Akses Cepat</div><div class="ajw-panel-sub">Susunan baru untuk navigasi kerja harian yang lebih cepat.</div><div class="ajw-quick-actions" style="margin-top:16px">';
  [['\uD83D\uDCCA Statistik','stats','Lihat tren performa & payroll'],['\uD83D\uDC65 Karyawan','emp','Kelola profil, kontak, dan data kerja'],['\uD83D\uDCDC Riwayat','hist','Buka seluruh histori evaluasi dan slip'],['\u2699\uFE0F Admin','admin','Atur integrasi, backup, dan konfigurasi']].forEach(function(x){h+='<button class="ajw-action" onclick="SW(\''+x[1]+'\')"><strong style="font-size:13px">'+x[0]+'</strong><small>'+x[2]+'</small></button>';});
  h+='</div></div>';
  h+='</div>';
  h+='<div class="ajw-side-stack">';
  h+='<div class="card"><div class="ajw-panel-title">Status Integrasi</div><div class="ajw-panel-sub">Pantau koneksi utama website tanpa membuka menu admin terlebih dahulu.</div><div class="ajw-status-list" style="margin-top:16px">';
  var hasWA=!!(cfg.adminWA),hasTg=!!(cfg.tgToken&&cfg.tgChat),hasDrv=!!(cfg.driveToken);
  [['WhatsApp',hasWA,'#25D366'],['Telegram',hasTg,'#34a3ff'],['Google Drive',hasDrv,'#0F9D58']].forEach(function(x){
    h+='<div class="ajw-status-item"><div style="display:flex;align-items:center;gap:12px"><div class="ajw-status-bullet" style="background:'+x[2]+'"></div><div><div style="font-size:13px;font-weight:700;color:var(--tx)">'+x[0]+'</div><div style="font-size:11px;color:var(--tx3)">'+(x[1]?'Koneksi aktif dan siap digunakan':'Belum dikonfigurasi')+'</div></div></div><div class="chip">'+(x[1]?'Aktif':'Offline')+'</div></div>';
  });
  h+='</div><button class="btna" onclick="SW(\'admin\')" style="width:100%;margin-top:14px;background:linear-gradient(135deg,#233a63,#3e5f98)!important">\u2699\uFE0F Buka Konfigurasi Integrasi</button></div>';
  h+='<div class="card"><div class="ajw-panel-title">Catatan Dashboard</div><div class="ajw-panel-sub">Ringkasan kecil untuk menjaga fokus tim operasional.</div><div class="ajw-status-list" style="margin-top:16px">';
  [['Prioritas Hari Ini',totalEval?'Lanjutkan monitoring evaluasi dan tindak lanjut coaching.':'Mulai dengan membuat penilaian pertama.'],['Payroll',totalPay?'Data payroll sudah tersedia untuk ditinjau kembali.':'Belum ada slip gaji, siapkan payroll periode berjalan.'],['Database Karyawan',totalEmp?'Database karyawan siap dipakai untuk evaluasi dan payroll.':'Tambahkan data karyawan agar workflow lebih cepat.']].forEach(function(x){
    h+='<div class="ajw-status-item"><div><div style="font-size:12px;font-weight:800;color:var(--tx)">'+x[0]+'</div><div style="font-size:11px;color:var(--tx3);margin-top:5px;line-height:1.7">'+x[1]+'</div></div></div>';
  });
  h+='</div></div>';
  h+='</div></div>';
  document.getElementById('V-dash').innerHTML=h;
}

/* ====== ADMIN ====== */

/* ====== CUSTOM TABS ====== */
function addCustomTabDiv(ct){
  if(document.getElementById('V-ct_'+ct.id))return;
  var div=document.createElement('div');div.id='V-ct_'+ct.id;div.style.display='none';
  document.querySelector('.body').appendChild(div);
}
function renderCustomTab(ctId){
  var ct=customTabs.filter(function(c){return String(c.id)===String(ctId)})[0];
  var el=document.getElementById('V-ct_'+ctId);if(!el||!ct)return;
  el.innerHTML='<div class="card"><div style="font-size:11px;font-weight:700;margin-bottom:10px"><span style="background:var(--blue);color:#fff;border-radius:5px;padding:3px 10px">'+(ct.icon||'\uD83D\uDCC4')+' '+esc(ct.name)+'</span></div>'+ct.html+'</div>';
}
function editCustomTabHTML(idx){
  var ct=customTabs[idx];if(!ct)return;
  var newHTML=prompt('Edit HTML tab "'+ct.name+'":',ct.html||'');
  if(newHTML===null)return;
  customTabs[idx].html=newHTML;sv('ajw_tabs',customTabs);
  toast('Tab diperbarui','success');renderCustomTab(ct.id);renderAdmin();
}

/* ====== EXPORT/IMPORT ====== */
function exportData(){var blob=new Blob([JSON.stringify({evalHistory:evalHistory,payHistory:payHistory,employees:employees,customTabs:customTabs},null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='AJW_Data_'+new Date().toISOString().split('T')[0]+'.json';a.click();}
function importData(){var inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=function(e){var fr=new FileReader();fr.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(d.evalHistory)evalHistory=d.evalHistory;if(d.payHistory)payHistory=d.payHistory;if(d.employees)employees=d.employees;if(d.customTabs)customTabs=d.customTabs;sv('ajw_eval',evalHistory);sv('ajw_pay',payHistory);sv('ajw_emp',employees);sv('ajw_tabs',customTabs);buildTabBar();toast('Import berhasil! '+evalHistory.length+' eval, '+payHistory.length+' gaji','success');}catch(err){toast('File tidak valid','error')}};fr.readAsText(e.target.files[0]);};inp.click();}

/* ====== INIT ====== */
loadAll();
evalScores=initES();evalInfo=initEI();payInfo=initPI();
SECS.forEach(function(s){evalCol[s.key]=false});
var _cfg=getCfg();if(_cfg.cssOverride)applyCSSOverride(_cfg.cssOverride);
customTabs.forEach(addCustomTabDiv);
renderEvalForm();renderPayrollForm();
SW('dash');

/* ============================================================
   AJW v7 NEW MODULES
   - Enhanced Employee (photo, KTP upload, bank, etc)
   - Business KPI Dashboard
   - AI Chat (GPT/Gemini/Claude)
   - Tab HTML Editor
   - Database Backup (Drive/Supabase)
   - All-in-One HTML Export
============================================================ */

/* ====== ENHANCED EMPLOYEE INIT ====== */
function initEmpForm(){
  return {
    nama:'',jabatan:'Staff Packing',divisi:'Warehouse',jobdesk:'',
    tipeKerja:'Fulltime',noWA:'',email:'',ktp:'',ktpImg:'',
    fotoProfile:'',tglLahir:'',jenisKelamin:'Laki-laki',
    tglMasuk:'',alamat:'',gajiPokok:0,tipeGaji:'Bulanan',
    statusAktif:true,metodeBayar:'Transfer',nomorRek:'',
    namaBank:'BCA',catatan:''
  }
}

var BANK_OPTS = ['BCA','BNI','BRI','Mandiri','BSI','CIMB','Danamon','BTN','OCBC','Dana','GoPay','OVO','ShopeePay','SeaBank','Jago'];
var DIVISI_OPTS = ['Warehouse','Packing','Admin','Customer Service','Keuangan','Marketing','IT','Management'];

/* ====== ENHANCED ADD EMPLOYEE ====== */
function addEmpV7(){
  var nm=document.getElementById('EMP-n').value.trim();
  if(!nm){toast('Nama wajib diisi','error');return}
  var emp = {
    id: Date.now(),
    nama: nm,
    jabatan: document.getElementById('EMP-j').value.trim()||'Staff Packing',
    divisi: document.getElementById('EMP-div').value||'Warehouse',
    jobdesk: document.getElementById('EMP-jd').value.trim(),
    tipeKerja: document.getElementById('EMP-tk').value||'Fulltime',
    noWA: document.getElementById('EMP-w').value.trim(),
    email: document.getElementById('EMP-e').value.trim(),
    ktp: document.getElementById('EMP-k').value.trim(),
    ktpImg: window._tmpKtpImg||'',
    fotoProfile: window._tmpFoto||'',
    tglLahir: document.getElementById('EMP-tlhr').value,
    jenisKelamin: document.getElementById('EMP-jk').value||'Laki-laki',
    tglMasuk: document.getElementById('EMP-t').value,
    alamat: document.getElementById('EMP-a').value.trim(),
    gajiPokok: parseInt(document.getElementById('EMP-g').value)||0,
    tipeGaji: document.getElementById('EMP-tg').value||'Bulanan',
    statusAktif: document.getElementById('EMP-status').checked,
    metodeBayar: document.getElementById('EMP-mb').value||'Transfer',
    nomorRek: document.getElementById('EMP-nr').value.trim(),
    namaBank: document.getElementById('EMP-nb').value||'BCA',
    catatan: document.getElementById('EMP-cat').value.trim(),
    createdAt: isoNow()
  };
  employees.push(emp);
  sv('ajw_emp', employees);
  window._tmpKtpImg=''; window._tmpFoto='';
  toast('Karyawan ditambahkan','success');
  document.getElementById('EMPMODAL').style.display='none';
  renderEmp();
}

function readImgAsB64(file, cb){
  if(!file)return;
  var fr=new FileReader();
  fr.onload=function(e){cb(e.target.result)};
  fr.readAsDataURL(file);
}

function renderEmp(){
  var h='<div class="card">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:7px">';
  h+='<span style="background:#00838F;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700">DATABASE KARYAWAN ('+employees.length+')</span>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="exportEmpCSV()" style="background:#2E7D32;padding:7px 11px;font-size:11px">Export CSV</button>';
  h+='<button class="btnp" onclick="openAddEmpModal()" style="background:#00838F;padding:8px 16px;font-size:12px">+ Tambah Karyawan</button></div></div>';

  if(employees.length){
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Foto</th><th>Nama</th><th>Divisi/Jabatan</th><th>Tipe</th><th>WhatsApp</th><th class="c">Gaji Pokok</th><th class="c">Tipe Gaji</th><th class="c">Status</th><th class="c">Eval</th><th class="c">Gaji</th><th>Aksi</th></tr></thead><tbody>';
    employees.forEach(function(e,idx){
      var ec=evalHistory.filter(function(d){return d.info.nama===e.nama}).length;
      var pc=payHistory.filter(function(d){return d.info.nama===e.nama}).length;
      var isActive=(e.statusAktif!==false);
      h+='<tr><td style="color:var(--tx2)">'+(idx+1)+'</td>';
      h+='<td style="text-align:center">';
      if(e.fotoProfile)h+='<img src="'+e.fotoProfile+'" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--teal)">';
      else h+='<div style="width:30px;height:30px;border-radius:50%;background:var(--bg3);display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:var(--tx3);border:1px solid var(--bd)">'+esc(e.nama.charAt(0).toUpperCase())+'</div>';
      h+='</td>';
      h+='<td style="font-weight:700;color:var(--navy)"><div>'+esc(e.nama)+'</div><div style="font-size:10px;color:var(--tx3)">'+esc(e.jobdesk||'')+'</div></td>';
      h+='<td><div style="font-size:11px;color:var(--tx2)">'+esc(e.divisi||'-')+'</div><div style="font-size:11px">'+esc(e.jabatan)+'</div></td>';
      h+='<td><span class="chip" style="background:'+(e.tipeKerja==='Fulltime'?'#E8F5E9':'#FFF3E0')+';color:'+(e.tipeKerja==='Fulltime'?'#2E7D32':'#E65100')+'">'+esc(e.tipeKerja||'Fulltime')+'</span></td>';
      h+='<td>'+(e.noWA?'<a href="https://wa.me/'+e.noWA.replace(/\D/g,'')+'" target="_blank" style="color:#25D366;font-weight:700;font-size:11px">'+esc(e.noWA)+'</a>':'<span style="color:var(--tx3)">-</span>')+'</td>';
      h+='<td class="c" style="font-weight:700;color:#2E7D32;white-space:nowrap">'+(e.gajiPokok?'Rp '+fmt(e.gajiPokok):'-')+'</td>';
      h+='<td class="c" style="font-size:10px"><span class="chip" style="background:var(--bg3);color:var(--tx2)">'+esc(e.tipeGaji||'Bulanan')+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:'+(isActive?'#E8F5E9':'#FFEBEE')+';color:'+(isActive?'#2E7D32':'#C62828')+'">'+(isActive?'Aktif':'Non-Aktif')+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:#DBEAFE;color:#1565C0">'+ec+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:#E0F7FA;color:#006064">'+pc+'</span></td>';
      h+='<td style="white-space:nowrap">';
      h+='<button class="btnsm" onclick="viewEmpDetail('+idx+')" style="background:#546E7A">Detail</button>';
      h+='<button class="btnsm" onclick="pickEmp('+idx+',\'eval\')" style="background:#1565C0">Nilai</button>';
      h+='<button class="btnsm" onclick="pickEmp('+idx+',\'payroll\')" style="background:#00838F">Gaji</button>';
      h+='<button class="btnsm" onclick="statsFilter.emp=employees['+idx+'].nama;SW(\'stats\')" style="background:#6A1B9A">Stats</button>';
      h+='<button class="btnsm" onclick="delEmp('+idx+')" style="background:#C62828">X</button></td></tr>';
    });
    h+='</tbody></table></div>';
  }else h+='<div style="text-align:center;padding:30px;color:var(--tx3)">Belum ada karyawan. Klik + Tambah Karyawan.</div>';
  h+='</div>';
  h+=buildEmpModal();
  document.getElementById('V-emp').innerHTML=h;
}

function viewEmpDetail(idx){
  var e=employees[idx]; if(!e)return;
  var h='<div style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;justify-content:center;align-items:center;padding:20px" id="EMPDETAIL" onclick="if(event.target===this)this.remove()">';
  h+='<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><span style="font-size:14px;font-weight:700;color:var(--navy)">Detail Karyawan</span><button onclick="document.getElementById(\'EMPDETAIL\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--tx2)">&times;</button></div>';
  h+='<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">';
  if(e.fotoProfile)h+='<img src="'+e.fotoProfile+'" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid var(--teal)">';
  else h+='<div style="width:70px;height:70px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;font-weight:700">'+esc(e.nama.charAt(0).toUpperCase())+'</div>';
  h+='<div><div style="font-size:18px;font-weight:700;color:var(--navy)">'+esc(e.nama)+'</div>';
  h+='<div style="font-size:12px;color:var(--tx2)">'+esc(e.jabatan)+' &bull; '+esc(e.divisi||'-')+'</div>';
  h+='<span class="chip" style="background:'+(e.statusAktif!==false?'#E8F5E9':'#FFEBEE')+';color:'+(e.statusAktif!==false?'#2E7D32':'#C62828')+';margin-top:4px;display:inline-block">'+(e.statusAktif!==false?'Aktif':'Non-Aktif')+'</span></div></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">';
  var fields=[['Tipe Kerja',e.tipeKerja],['Jenis Kelamin',e.jenisKelamin],['Tgl Lahir',e.tglLahir?fmtD(e.tglLahir):'-'],['Tgl Masuk',e.tglMasuk?fmtD(e.tglMasuk):'-'],['No. WA',e.noWA||'-'],['Email',e.email||'-'],['No. KTP',e.ktp||'-'],['Alamat',e.alamat||'-'],['Gaji Pokok','Rp '+fmt(e.gajiPokok)+' / '+esc(e.tipeGaji||'Bulanan')],['Metode Bayar',esc(e.metodeBayar||'-')],['Bank/E-wallet',esc(e.namaBank||'-')],['No. Rekening',e.nomorRek||'-']];
  fields.forEach(function(f){
    h+='<div style="background:var(--bg3);padding:8px;border-radius:6px;border:1px solid var(--bd)"><div style="font-size:10px;color:var(--tx3);font-weight:700">'+f[0]+'</div><div style="font-weight:700;color:var(--tx);margin-top:2px">'+esc(String(f[1]))+'</div></div>';
  });
  h+='</div>';
  if(e.ktpImg){h+='<div style="margin-top:12px"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:6px">Foto KTP</div>';h+='<img src="'+e.ktpImg+'" style="max-width:100%;border-radius:7px;border:1px solid var(--bd)"></div>';}
  if(e.catatan)h+='<div style="margin-top:12px;padding:8px;background:var(--bg3);border-radius:6px;font-size:11px"><b>Catatan:</b> '+esc(e.catatan)+'</div>';
  h+='<div style="display:flex;gap:7px;margin-top:14px"><button class="btnp" onclick="pickEmp('+idx+',\'eval\');document.getElementById(\'EMPDETAIL\').remove()" style="background:#1565C0;flex:1">Buat Penilaian</button><button class="btnp" onclick="pickEmp('+idx+',\'payroll\');document.getElementById(\'EMPDETAIL\').remove()" style="background:#00838F;flex:1">Generate Slip Gaji</button></div>';
  h+='</div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
}

function openAddEmpModal(){
  window._tmpKtpImg=''; window._tmpFoto='';
  document.getElementById('EMPMODAL').style.display='flex';
}

function buildEmpModal(){
  var h='<div id="EMPMODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h+='<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:720px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.35)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
  h+='<span style="font-size:13px;font-weight:700;color:var(--navy)">Tambah Karyawan Baru</span>';
  h+='<button onclick="document.getElementById(\'EMPMODAL\').style.display=\'none\'" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--tx2)">&times;</button></div>';

  /* Foto Profile Upload */
  h+='<div style="text-align:center;margin-bottom:14px">';
  h+='<div id="FOTO-PREVIEW" style="width:70px;height:70px;border-radius:50%;background:var(--bg3);border:3px dashed var(--teal);display:inline-flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;margin-bottom:6px;overflow:hidden" onclick="document.getElementById(\'FOTO-INPUT\').click()">&#128100;</div>';
  h+='<div style="font-size:10px;color:var(--tx3)">Klik untuk upload foto profil</div>';
  h+='<input type="file" id="FOTO-INPUT" accept="image/*" style="display:none" onchange="readImgAsB64(this.files[0],function(d){window._tmpFoto=d;var el=document.getElementById(\'FOTO-PREVIEW\');el.innerHTML=\'<img src=\\\'\'+d+\'\\\' style=\\\'width:100%;height:100%;object-fit:cover\\\'>\'})">';
  h+='</div>';

  h+='<div class="g2" style="margin-bottom:10px">';
  /* Basic info */
  h+='<div><label class="lbl">Nama Lengkap *</label><input id="EMP-n" class="fi" type="text" placeholder="Nama lengkap"></div>';
  h+='<div><label class="lbl">Jabatan</label><input id="EMP-j" class="fi" type="text" value="Staff Packing"></div>';
  h+='<div><label class="lbl">Divisi</label><select id="EMP-div" class="fi">';
  DIVISI_OPTS.forEach(function(d){h+='<option value="'+d+'">'+d+'</option>'});
  h+='</select></div>';
  h+='<div><label class="lbl">Job Desk</label><input id="EMP-jd" class="fi" type="text" placeholder="Deskripsi pekerjaan"></div>';
  h+='<div><label class="lbl">Jenis Kelamin</label><select id="EMP-jk" class="fi"><option>Laki-laki</option><option>Perempuan</option></select></div>';
  h+='<div><label class="lbl">Tanggal Lahir</label><input id="EMP-tlhr" class="fi" type="date"></div>';
  h+='<div><label class="lbl">No. WhatsApp</label><input id="EMP-w" class="fi" type="text" placeholder="628xxxxxxxxxx"></div>';
  h+='<div><label class="lbl">Email</label><input id="EMP-e" class="fi" type="email" placeholder="email@domain.com"></div>';
  h+='<div><label class="lbl">Tanggal Masuk</label><input id="EMP-t" class="fi" type="date"></div>';
  h+='<div><label class="lbl">Tipe Kerja</label><select id="EMP-tk" class="fi"><option>Fulltime</option><option>Parttime</option><option>Kontrak</option><option>Freelance</option></select></div>';
  h+='</div>';

  /* KTP */
  h+='<div class="g2" style="margin-bottom:10px">';
  h+='<div><label class="lbl">No. KTP (16 digit NIK)</label><input id="EMP-k" class="fi" type="text" placeholder="3201xxxxxxxxxxxx"></div>';
  h+='<div><label class="lbl">Upload Foto KTP</label>';
  h+='<input type="file" id="KTP-INPUT" accept="image/*" class="fi" style="padding:5px" onchange="readImgAsB64(this.files[0],function(d){window._tmpKtpImg=d;toast(\'Foto KTP berhasil di-upload\',\'success\')})"></div>';
  h+='</div>';

  /* Gaji */
  h+='<div style="background:var(--bg3);border-radius:7px;padding:11px;margin-bottom:10px;border:1px solid var(--bd)">';
  h+='<div style="font-size:11px;font-weight:700;color:var(--teal);margin-bottom:8px">INFORMASI GAJI</div>';
  h+='<div class="g2">';
  h+='<div><label class="lbl">Gaji Pokok (Rp)</label><input id="EMP-g" class="fi" type="number" placeholder="0"></div>';
  h+='<div><label class="lbl">Tipe Gaji</label><select id="EMP-tg" class="fi"><option value="Bulanan">Per Bulan</option><option value="Mingguan">Per Minggu</option></select></div>';
  h+='<div><label class="lbl">Metode Pembayaran</label><select id="EMP-mb" class="fi"><option>Transfer</option><option>Cash</option></select></div>';
  h+='<div><label class="lbl">Bank / E-wallet</label><select id="EMP-nb" class="fi">';
  BANK_OPTS.forEach(function(b){h+='<option value="'+b+'">'+b+'</option>'});
  h+='</select></div>';
  h+='<div style="grid-column:1/-1"><label class="lbl">No. Rekening / No. Akun</label><input id="EMP-nr" class="fi" type="text" placeholder="No. Rekening / Nomor akun e-wallet"></div>';
  h+='</div></div>';

  /* Status + Alamat + Catatan */
  h+='<div class="g2" style="margin-bottom:10px">';
  h+='<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:7px;border:1px solid var(--bd)">';
  h+='<label class="lbl" style="margin:0;flex:1">Status Karyawan</label>';
  h+='<label style="display:flex;align-items:center;gap:7px;cursor:pointer"><input type="checkbox" id="EMP-status" checked style="width:0;height:0;opacity:0" onchange="var el=document.getElementById(\'STATUS-LBL\');el.textContent=this.checked?\'Aktif\':\'Non-Aktif\';el.style.color=this.checked?\'#2E7D32\':\'#C62828\';document.getElementById(\'STATUS-KNOB\').style.left=this.checked?\'22px\':\'2px\'"><div style="position:relative;width:42px;height:22px;background:var(--bd2);border-radius:11px;transition:.2s" id="STATUS-TRACK"><div id="STATUS-KNOB" style="position:absolute;top:2px;left:22px;width:18px;height:18px;background:var(--teal);border-radius:50%;transition:.2s"></div></div><span id="STATUS-LBL" style="font-size:12px;font-weight:700;color:#2E7D32">Aktif</span></label></div>';
  h+='<div><label class="lbl">Alamat Lengkap</label><input id="EMP-a" class="fi" type="text" placeholder="Alamat lengkap"></div>';
  h+='</div>';
  h+='<div style="margin-bottom:12px"><label class="lbl">Catatan</label><textarea id="EMP-cat" class="fi" rows="2" placeholder="Catatan tambahan"></textarea></div>';

  h+='<div style="display:flex;justify-content:flex-end;gap:8px"><button class="btns" onclick="document.getElementById(\'EMPMODAL\').style.display=\'none\'">Batal</button><button class="btnp" onclick="addEmpV7()" style="background:#00838F">+ Simpan Karyawan</button></div>';
  h+='</div></div>';
  return h;
}

function delEmp(idx){if(!confirm('Hapus karyawan ini?'))return;employees.splice(idx,1);sv('ajw_emp',employees);renderEmp()}
function exportEmpCSV(){
  if(!employees.length){toast('Tidak ada data karyawan','warn');return}
  var cols=['Nama','Jabatan','Divisi','Tipe Kerja','No. WA','Email','No. KTP','Jenis Kelamin','Tgl Lahir','Tgl Masuk','Gaji Pokok','Tipe Gaji','Metode Bayar','Bank','No. Rekening','Status'];
  var rows=[cols.join(',')];
  employees.forEach(function(e){
    rows.push([e.nama,e.jabatan,e.divisi||'',e.tipeKerja||'Fulltime',e.noWA,e.email,e.ktp,e.jenisKelamin||'',e.tglLahir||'',e.tglMasuk||'',e.gajiPokok,e.tipeGaji||'Bulanan',e.metodeBayar||'',e.namaBank||'',e.nomorRek||'',(e.statusAktif!==false?'Aktif':'Non-Aktif')].map(function(v){return '"'+String(v||'').replace(/"/g,'""')+'"'}).join(','));
  });
  var blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Karyawan_AJW_'+ymd()+'.csv';a.click();
  toast('CSV berhasil diekspor','success');
}

/* ====== BUSINESS KPI ====== */
var kpiData = [];
function loadKPI(){try{kpiData=JSON.parse(localStorage.getItem('ajw_kpi')||'[]')}catch(e){kpiData=[]}}
function saveKPI(){sv('ajw_kpi',kpiData)}

var KPI_METRICS = [
  {key:'orders',label:'Total Order',icon:'📦',unit:'order',target:100,color:'#1565C0'},
  {key:'revenue',label:'Omset (Rp)',icon:'💰',unit:'Rp',target:10000000,color:'#2E7D32'},
  {key:'retur',label:'Retur / Komplain',icon:'↩️',unit:'item',target:5,color:'#C62828',lower:true},
  {key:'accuracy',label:'Akurasi Packing (%)',icon:'🎯',unit:'%',target:99.5,color:'#00838F'},
  {key:'shipped',label:'Paket Dikirim',icon:'🚚',unit:'paket',target:100,color:'#6A1B9A'},
  {key:'rating',label:'Rating Toko (avg)',icon:'⭐',unit:'',target:4.8,color:'#F57F17'}
];

function renderKPI(){
  loadKPI();
  var now=new Date();
  var thisMonth=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var latest=kpiData.filter(function(d){return d.periode===thisMonth})[0]||{data:{}};

  var h='<div class="card" style="background:linear-gradient(135deg,#0D2E5A,#1565C0);color:#fff;padding:14px 18px;margin-bottom:12px">';
  h+='<div style="font-size:16px;font-weight:700;color:#FFD700">📊 KPI BISNIS — ANTON JAYA WIJAYA</div>';
  h+='<div style="color:#90CAF9;font-size:11px;margin-top:2px">Pantau performa bisnis secara real-time</div></div>';

  /* Input form */
  h+='<div class="card" style="margin-bottom:12px">';
  h+='<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">Input KPI Bulan Ini ('+thisMonth+')</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:9px">';
  KPI_METRICS.forEach(function(m){
    var val=latest.data[m.key]||0;
    h+='<div><label class="lbl">'+m.icon+' '+m.label+' ('+m.unit+')</label>';
    h+='<input id="KPI-'+m.key+'" class="fi" type="number" value="'+val+'" placeholder="0"></div>';
  });
  h+='</div>';
  h+='<div style="display:flex;gap:7px">';
  h+='<button class="btnp" onclick="saveKPIMonth()" style="background:#00838F;padding:9px 16px;font-size:12px">Simpan KPI Bulan Ini</button>';
  h+='<button class="btna" onclick="sendKPItoWA()" style="background:#25D366;padding:9px 13px;font-size:12px">Kirim ke WA</button>';
  h+='<button class="btna" onclick="genPDF(\'KPI-RPT\',\'KPI_AJW_'+thisMonth+'\')" style="background:#E65100;padding:9px 13px;font-size:12px">PDF</button>';
  h+='</div></div>';

  /* KPI Cards */
  h+='<div id="KPI-RPT">';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-bottom:12px">';
  KPI_METRICS.forEach(function(m){
    var val=latest.data[m.key]||0;
    var pct=m.lower?(m.target>0?Math.max(0,100-val/m.target*100):100):(m.target>0?Math.min(100,val/m.target*100):0);
    var good=m.lower?(val<=m.target):(val>=m.target);
    h+='<div class="card" style="padding:13px;border-left:4px solid '+m.color+'">';
    h+='<div style="font-size:11px;color:var(--tx2);font-weight:700;margin-bottom:4px">'+m.icon+' '+m.label+'</div>';
    h+='<div style="font-size:22px;font-weight:700;color:'+m.color+'">'+(m.unit==='Rp'?'Rp '+fmt(val):(val+(m.unit?(' '+m.unit):'')))+'</div>';
    h+='<div style="font-size:10px;color:var(--tx3);margin-top:3px">Target: '+(m.unit==='Rp'?'Rp '+fmt(m.target):(m.target+' '+m.unit))+'</div>';
    h+='<div class="pbar" style="margin-top:7px"><div class="pfill" style="width:'+pct+'%;background:'+(good?m.color:'#F57F17')+'"></div></div>';
    h+='<div style="font-size:10px;color:'+(good?'#2E7D32':'#E65100')+';font-weight:700;margin-top:3px">'+Math.round(pct)+'% '+(good?'Tercapai':'Belum Tercapai')+'</div>';
    h+='</div>';
  });
  h+='</div>';

  /* KPI History table */
  if(kpiData.length){
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:8px">Riwayat KPI Bulanan</div>';
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Periode</th>';
    KPI_METRICS.forEach(function(m){h+='<th class="c">'+m.icon+' '+m.label.split(' ')[0]+'</th>'});
    h+='</tr></thead><tbody>';
    kpiData.slice(0,12).forEach(function(d){
      h+='<tr><td style="font-weight:700;color:var(--navy)">'+d.periode+'</td>';
      KPI_METRICS.forEach(function(m){
        var v=d.data[m.key]||0;var good=m.lower?(v<=m.target):(v>=m.target);
        h+='<td class="c" style="color:'+(good?'#2E7D32':'#E65100')+';font-weight:700">'+(m.unit==='Rp'?'Rp '+fmt(v):v)+'</td>';
      });
      h+='</tr>';
    });
    h+='</tbody></table></div></div>';
  }
  h+='</div>';
  document.getElementById('V-kpi').innerHTML=h;
}

function saveKPIMonth(){
  var now=new Date();
  var periode=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var data={};
  KPI_METRICS.forEach(function(m){data[m.key]=parseFloat(document.getElementById('KPI-'+m.key).value)||0});
  var idx=kpiData.findIndex(function(d){return d.periode===periode});
  if(idx>=0)kpiData[idx].data=data;
  else kpiData.unshift({periode:periode,data:data,savedAt:isoNow()});
  saveKPI();toast('KPI bulan '+periode+' disimpan!','success');renderKPI();
}
function sendKPItoWA(){
  var cfg=getCfg();var now=new Date();var periode=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var latest=kpiData.filter(function(d){return d.periode===periode})[0]||{data:{}};
  var msg='KPI BISNIS AJW - '+periode+'\nAnton Jaya Wijaya\n\n';
  KPI_METRICS.forEach(function(m){msg+=(m.icon+' '+m.label+': '+(m.unit==='Rp'?'Rp '+fmt(latest.data[m.key]||0):((latest.data[m.key]||0)+' '+(m.unit||'')))+'\n')});
  msg+='\n_Anton Jaya Wijaya_';
  var adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  window.open('https://wa.me/'+adminWA+'?text='+encodeURIComponent(msg),'_blank');
}

/* ====== AI CHAT ====== */
var aiChatHistory = [];
var aiModel = 'gpt';

function renderAIChat(){
  var cfg=getCfg();
  var models=[
    {id:'gpt',label:'ChatGPT',icon:'🤖',key:cfg.openaiKey||'',model:'gpt-4o-mini',url:'https://api.openai.com/v1/chat/completions',header:'Authorization',prefix:'Bearer '},
    {id:'gemini',label:'Gemini',icon:'✨',key:cfg.geminiKey||'',model:'gemini-1.5-flash'},
    {id:'claude',label:'Claude',icon:'🧠',key:cfg.anthropicKey||'',model:'claude-3-5-haiku-20241022'}
  ];
  var h='<div class="card" style="margin-bottom:10px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px">';
  h+='<div style="display:flex;gap:6px">';
  models.forEach(function(m){
    var active=(aiModel===m.id);
    h+='<button onclick="aiModel=\''+m.id+'\';renderAIChat()" class="btna" style="background:'+(active?'#0D2E5A':'var(--bg3)')+';color:'+(active?'#fff':'var(--tx2)')+';border:1.5px solid '+(active?'#0D2E5A':'var(--bd2)')+';padding:7px 12px;font-size:12px">'+m.icon+' '+m.label+(m.key?'':' ⚠️')+'</button>';
  });
  h+='</div>';
  h+='<button class="btna" onclick="aiChatHistory=[];renderAIChatMessages()" style="background:#546E7A;padding:7px 11px;font-size:11px">Bersihkan Chat</button></div></div>';

  h+='<div id="AI-CHAT-WRAP" style="height:420px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--bd);display:flex;flex-direction:column;margin-bottom:10px">';
  h+='<div id="AI-CHAT-MSGS" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px">';
  h+='<div style="text-align:center;color:var(--tx3);font-size:12px;padding:20px">Mulai percakapan dengan AI<br><span style="font-size:10px">Model aktif: <b>'+aiModel.toUpperCase()+'</b></span></div>';
  h+='</div>';
  h+='<div style="padding:10px;border-top:1px solid var(--bd);display:flex;gap:7px">';
  h+='<textarea id="AI-INPUT" class="fi" rows="2" placeholder="Tanya apapun tentang bisnis, karyawan, strategi..." style="flex:1;resize:none" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendAIMsg()}"></textarea>';
  h+='<button class="btnp" onclick="sendAIMsg()" id="AI-SEND-BTN" style="background:#0D2E5A;align-self:flex-end;padding:10px 14px">Kirim</button>';
  h+='</div></div>';

  /* Quick prompts */
  h+='<div class="card"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:7px">Prompt Cepat untuk AJW</div>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  var prompts=['Analisis performa karyawan terbaik','Strategi meningkatkan omset toko','Tips optimalkan BigSeller','Cara reduce retur produk','Analisis KPI bulan ini','Draft SOP packing terbaru'];
  prompts.forEach(function(p){h+='<button class="btna" onclick="document.getElementById(\'AI-INPUT\').value=\''+p+'\'" style="background:var(--bg3);color:var(--tx2);border:1px solid var(--bd);padding:5px 10px;font-size:10px">'+p+'</button>';});
  h+='</div></div>';
  document.getElementById('V-aichat').innerHTML=h;
  renderAIChatMessages();
}

function renderAIChatMessages(){
  var el=document.getElementById('AI-CHAT-MSGS'); if(!el)return;
  if(!aiChatHistory.length){el.innerHTML='<div style="text-align:center;color:var(--tx3);font-size:12px;padding:20px">Mulai percakapan dengan AI<br><span style="font-size:10px">Model aktif: <b>'+aiModel.toUpperCase()+'</b></span></div>';return}
  var h='';
  aiChatHistory.forEach(function(msg){
    if(msg.role==='user'){
      h+='<div style="display:flex;justify-content:flex-end"><div style="background:#1565C0;color:#fff;padding:9px 13px;border-radius:13px 13px 2px 13px;max-width:80%;font-size:12px;line-height:1.5">'+esc(msg.content).replace(/\n/g,'<br>')+'</div></div>';
    }else{
      h+='<div style="display:flex;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:#0D2E5A;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px">🤖</div>';
      h+='<div style="background:var(--bg2);border:1px solid var(--bd);padding:9px 13px;border-radius:2px 13px 13px 13px;max-width:82%;font-size:12px;line-height:1.6">'+msg.content.replace(/\n/g,'<br>')+'</div></div>';
    }
  });
  el.innerHTML=h;
  el.scrollTop=el.scrollHeight;
}

function sendAIMsg(){
  var inp=document.getElementById('AI-INPUT');if(!inp)return;
  var msg=inp.value.trim();if(!msg)return;
  inp.value='';
  var cfg=getCfg();
  aiChatHistory.push({role:'user',content:msg});
  renderAIChatMessages();
  var btn=document.getElementById('AI-SEND-BTN');if(btn){btn.disabled=true;btn.textContent='...'}

  /* Inject AJW context */
  var ctx='Kamu adalah asisten bisnis untuk toko alat pancing online Anton Jaya Wijaya (AJW). Pemilik: Hokky. Platform: Shopee, Lazada, TikTok via BigSeller. Karyawan aktif: '+employees.filter(function(e){return e.statusAktif!==false}).length+'. Total evaluasi: '+evalHistory.length+'. Berikan jawaban dalam bahasa Indonesia yang singkat dan praktis.';
  var messages=[{role:'system',content:ctx}].concat(aiChatHistory.slice(-10));

  if(aiModel==='gpt'){
    var key=cfg.openaiKey||'';
    if(!key){toast('OpenAI API Key belum diset di Admin → Integrasi','error');if(btn){btn.disabled=false;btn.textContent='Kirim'}return}
    fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:cfg.openaiModel||'gpt-4o-mini',max_tokens:800,messages:messages})
    }).then(function(r){return r.json()}).then(function(d){
      var reply=d.choices&&d.choices[0]?d.choices[0].message.content:'Error: '+JSON.stringify(d.error||d);
      aiChatHistory.push({role:'assistant',content:reply});renderAIChatMessages();if(btn){btn.disabled=false;btn.textContent='Kirim'}
    }).catch(function(e){toast('Gagal: '+e.message,'error');if(btn){btn.disabled=false;btn.textContent='Kirim'}});
  }else if(aiModel==='claude'){
    var key2=cfg.anthropicKey||'';
    if(!key2){toast('Anthropic API Key belum diset di Admin → Integrasi','error');if(btn){btn.disabled=false;btn.textContent='Kirim'}return}
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key2,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:cfg.claudeModel||'claude-3-5-haiku-20241022',max_tokens:800,system:ctx,messages:aiChatHistory.slice(-10).filter(function(m){return m.role!=='system'})})
    }).then(function(r){return r.json()}).then(function(d){
      var reply=d.content&&d.content[0]?d.content[0].text:'Error: '+JSON.stringify(d.error||d);
      aiChatHistory.push({role:'assistant',content:reply});renderAIChatMessages();if(btn){btn.disabled=false;btn.textContent='Kirim'}
    }).catch(function(e){toast('Gagal: '+e.message,'error');if(btn){btn.disabled=false;btn.textContent='Kirim'}});
  }else if(aiModel==='gemini'){
    var key3=cfg.geminiKey||'';
    if(!key3){toast('Gemini API Key belum diset di Admin → Integrasi','error');if(btn){btn.disabled=false;btn.textContent='Kirim'}return}
    var gMsg=aiChatHistory.slice(-10).map(function(m){return{role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}});
    fetch('https://generativelanguage.googleapis.com/v1beta/models/'+(cfg.geminiModel||'gemini-1.5-flash')+':generateContent?key='+key3,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({contents:gMsg,systemInstruction:{parts:[{text:ctx}]}})
    }).then(function(r){return r.json()}).then(function(d){
      var reply=d.candidates&&d.candidates[0]?d.candidates[0].content.parts[0].text:'Error: '+JSON.stringify(d.error||d);
      aiChatHistory.push({role:'assistant',content:reply});renderAIChatMessages();if(btn){btn.disabled=false;btn.textContent='Kirim'}
    }).catch(function(e){toast('Gagal: '+e.message,'error');if(btn){btn.disabled=false;btn.textContent='Kirim'}});
  }
}

/* ====== TAB HTML EDITOR (in Admin) ====== */
function openTabEditor(tabId, tabLabel){
  var cfg=getCfg();var tc=cfg.tabsConfig||{};
  /* get current tab HTML from localStorage if custom, or empty */
  var isCustom=tabId.indexOf('ct_')===0;
  var ctId=isCustom?tabId.replace('ct_',''):'';
  var ct=isCustom?customTabs.filter(function(c){return String(c.id)===String(ctId)})[0]:null;
  var currentHTML=ct?ct.html:'';
  /* For core tabs, get current innerHTML */
  if(!isCustom){
    var el=document.getElementById('V-'+tabId);
    currentHTML=el?el.innerHTML:'';
  }
  var h='<div style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;flex-direction:column;padding:16px" id="TAB-EDITOR-MODAL">';
  h+='<div style="background:var(--bg2);border-radius:var(--r);display:flex;flex-direction:column;flex:1;overflow:hidden;max-height:calc(100vh - 32px)">';
  h+='<div style="background:#0D2E5A;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">';
  h+='<span style="color:#FFD700;font-weight:700;font-size:13px">&#9998; Edit HTML Tab: '+esc(tabLabel)+'</span>';
  h+='<div style="display:flex;gap:6px"><button class="btna" onclick="applyTabHTML(\''+tabId+'\',\''+ctId+'\')" style="background:#2E7D32;padding:7px 13px">Terapkan</button><button class="btna" onclick="document.getElementById(\'TAB-EDITOR-MODAL\').remove()" style="background:#C62828;padding:7px 11px">&times; Tutup</button></div></div>';
  h+='<div style="padding:8px;background:#1A1A2E;font-size:10px;color:#90CAF9">Tips: Edit HTML ini akan langsung diterapkan ke tab. Semua fungsi JS yang ada tetap bisa dipakai.</div>';
  h+='<textarea id="TAB-HTML-EDITOR" style="flex:1;font-family:\'Courier New\',monospace;font-size:12px;line-height:1.6;padding:12px;border:none;outline:none;background:#0F1117;color:#E8ECF4;resize:none">'+esc(currentHTML)+'</textarea>';
  h+='</div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
}

function applyTabHTML(tabId, ctId){
  var newHTML=document.getElementById('TAB-HTML-EDITOR').value;
  if(ctId){
    /* Custom tab */
    var idx=customTabs.findIndex(function(c){return String(c.id)===String(ctId)});
    if(idx>=0){customTabs[idx].html=newHTML;sv('ajw_tabs',customTabs);renderCustomTab(ctId);}
  }else{
    /* Core tab - direct injection */
    var el=document.getElementById('V-'+tabId);
    if(el)el.innerHTML=newHTML;
  }
  toast('HTML tab diterapkan!','success');
  document.getElementById('TAB-EDITOR-MODAL').remove();
}

/* ====== ALL-IN-ONE HTML EXPORT ====== */
function exportFullHTML(){
  toast('Menyiapkan export HTML...','info',4000);
  setTimeout(function(){
    var fullHTML=document.documentElement.outerHTML;
    var blob=new Blob([fullHTML],{type:'text/html;charset=utf-8'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='AJW_Sistem_v7_'+ymd()+'.html';
    a.click();
    toast('HTML berhasil diexport! Deploy ke Netlify dengan drag & drop.','success',5000);
  },500);
}

/* ====== DATABASE BACKUP ====== */
function backupToDrive(){
  var cfg=getCfg();
  if(!cfg.driveToken){
    toast('Bearer Token Drive belum diset di Admin \u2192 Integrasi','error');return;
  }
  var folderId=cfg.driveHRFolder||cfg.drivePayFolder||'1tv-IUtvJDrP9bw4sAMhpGq_h9MrK8H4t';
  var data={evalHistory:evalHistory,payHistory:payHistory,employees:employees,customTabs:customTabs,kpiData:kpiData,exportedAt:isoNow()};
  var filename='AJW_Backup_'+ymd()+'.json';
  var meta=JSON.stringify({name:filename,parents:[folderId]});
  var content=JSON.stringify(data,null,2);
  var boundary='AJW_BK_'+Date.now();
  var body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+content+'\r\n--'+boundary+'--';
  toast('Mengupload backup ke Drive...','info',6000);
  fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
    method:'POST',
    headers:{'Authorization':'Bearer '+cfg.driveToken,'Content-Type':'multipart/related; boundary='+boundary},
    body:body
  }).then(function(r){return r.json()}).then(function(d){
    if(d.id){toast('\u2705 Backup berhasil: '+filename,'success',5000);}
    else toast('\u274C Backup gagal: '+(d.error?d.error.message:'Unknown'),'error');
  }).catch(function(e){toast('\u274C Gagal: '+e.message,'error')});
}

/* removed old backupToSupabase */

/* Override renderAdmin to include new sections */
var _origRenderAdmin = renderAdmin;

function renderAdmin(){
  var cfg=getCfg();
  var subs=[['general','Umum & Tema'],['integrations','Integrasi & API'],['templates','Template Caption'],['tabs','Manajemen Tab'],['data','Data & Backup']];
  var h='<div class="card" style="padding:11px 13px;margin-bottom:12px"><div style="display:flex;gap:3px;flex-wrap:wrap">';
  subs.forEach(function(s){h+='<button class="adm-sub" onclick="adminSub=\''+s[0]+'\';renderAdmin()" style="background:'+(adminSub===s[0]?'#0D2E5A':'var(--bg3)')+';color:'+(adminSub===s[0]?'#fff':'var(--tx2)')+'">'+s[1]+'</button>';});
  h+='</div></div>';

  if(adminSub==='general'){
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:10px">Tema & Tampilan</div><div style="display:flex;gap:7px;margin-bottom:10px"><button class="btnp" onclick="var c=getCfg();c.theme=\'light\';saveCfg(c);applyTheme();renderAdmin()" style="background:'+(cfg.theme!=='dark'?'#1565C0':'#546E7A')+'">&#9728;&#65039; Light Mode</button><button class="btnp" onclick="var c=getCfg();c.theme=\'dark\';saveCfg(c);applyTheme();renderAdmin()" style="background:'+(cfg.theme==='dark'?'#1565C0':'#546E7A')+'">&#127769; Dark Mode</button></div>';
    h+='<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Nama Admin</label><input id="ADM-nm" class="fi" value="'+esc(cfg.adminName||'Hokky')+'"></div><div><label class="lbl">No. WA Admin</label><input id="ADM-wa" class="fi" value="'+esc(cfg.adminWA||'6285710597159')+'"></div></div>';
    h+='<div style="margin-bottom:9px"><label class="lbl">Judul Header Sistem</label><input id="ADM-title" class="fi" value="'+esc(cfg.sysTitle||'SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA')+'"></div>';
    h+='<button class="btnp" onclick="var c=getCfg();c.adminName=document.getElementById(\'ADM-nm\').value.trim();c.adminWA=document.getElementById(\'ADM-wa\').value.trim();c.sysTitle=document.getElementById(\'ADM-title\').value.trim();saveCfg(c);updateBadge();document.getElementById(\'STITLE\').textContent=c.sysTitle||\'SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA\';toast(\'Disimpan\',\'success\')" style="background:#0D2E5A;padding:9px 18px;font-size:12px">Simpan</button></div>';
  }

  if(adminSub==='integrations'){
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:#0088CC;margin-bottom:7px">Telegram Bot</div>';
    h+='<div style="background:#E3F2FD;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.7"><b>Fix "bots can\'t send to bots":</b><br>1. Chat ID harus USER/GRUP bukan bot lain<br>2. Kirim pesan ke bot di Telegram<br>3. Buka: https://api.telegram.org/bot{TOKEN}/getUpdates<br>4. Lihat "chat":{"id":XXXXXXX}</div>';
    h+='<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Bot Token</label><input id="TG-tok" class="fi" value="'+esc(cfg.tgToken||'')+'" placeholder="123456:AAxxxx"></div><div><label class="lbl">Chat ID</label><input id="TG-chat" class="fi" value="'+esc(cfg.tgChat||'')+'" placeholder="-1001234567890"></div></div>';
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnp" onclick="var c=getCfg();c.tgToken=document.getElementById(\'TG-tok\').value.trim();c.tgChat=document.getElementById(\'TG-chat\').value.trim();saveCfg(c);toast(\'Telegram disimpan\',\'success\')" style="background:#0088CC;padding:9px 14px;font-size:12px">Simpan</button>';
    h+='<button class="btna" onclick="var c=getCfg();if(!c.tgToken||!c.tgChat){toast(\'Isi token dan chat ID\',\'error\');return};fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/sendMessage\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({chat_id:c.tgChat,text:\'\u2705 Test AJW OK!\'})}).then(function(r){return r.json()}).then(function(d){if(d.ok)toast(\'Test berhasil!\',\'success\');else toast(d.description,\'error\')}).catch(function(){toast(\'Gagal\',\'error\')})" style="background:#546E7A;padding:9px 13px;font-size:12px">Test</button>';
    h+='<button class="btna" onclick="var c=getCfg();if(!c.tgToken){toast(\'Isi token\',\'error\');return};fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/getUpdates\').then(function(r){return r.json()}).then(function(d){if(d.ok&&d.result&&d.result.length){var m=d.result[d.result.length-1];var id=m.message?m.message.chat.id:(m.channel_post?m.channel_post.chat.id:\'\');if(id){document.getElementById(\'TG-chat\').value=id;toast(\'Chat ID: \'+id,\'success\',5000)}}else toast(\'Belum ada pesan\',\'warn\')}).catch(function(){toast(\'Gagal\',\'error\')})" style="background:#2E7D32;padding:9px 13px;font-size:12px">Auto Detect Chat ID</button></div></div>';

    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:#0F9D58;margin-bottom:7px">Google Drive Upload</div>';
    h+='<div style="background:#E8F5E9;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.6">Cara dapat token: <a href="https://developers.google.com/oauthplayground" target="_blank" style="color:#0F9D58">OAuth Playground</a> \u2192 Drive API v3 \u2192 Authorize \u2192 Exchange token \u2192 copy</div>';
    h+='<div style="margin-bottom:8px"><label class="lbl">Bearer Token</label><input id="DRV-tok" class="fi" value="'+esc(cfg.driveToken||'')+'" placeholder="ya29.xxx..."></div>';
    h+='<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Folder ID \u2014 Penilaian</label><input id="DRV-eval" class="fi" value="'+esc(cfg.driveEvalFolder||'1D4lQmi48BBPNYxhqAM_Qtp68I6nPTw9Z')+'"></div><div><label class="lbl">Folder ID \u2014 Payroll</label><input id="DRV-pay" class="fi" value="'+esc(cfg.drivePayFolder||'10b5C7W-33tS3Ujd5xYcvjtYj_9NYsWhJ')+'"></div></div>';
    h+='<div style="margin-bottom:8px"><label class="lbl">Folder HR Umum (untuk backup)</label><input id="DRV-hr" class="fi" value="'+esc(cfg.driveHRFolder||'1tv-IUtvJDrP9bw4sAMhpGq_h9MrK8H4t')+'"></div>';
    h+='<button class="btnp" onclick="var c=getCfg();c.driveToken=document.getElementById(\'DRV-tok\').value.trim();c.driveEvalFolder=document.getElementById(\'DRV-eval\').value.trim();c.drivePayFolder=document.getElementById(\'DRV-pay\').value.trim();c.driveHRFolder=document.getElementById(\'DRV-hr\').value.trim();saveCfg(c);toast(\'Drive config disimpan\',\'success\')" style="background:#0F9D58;padding:9px 14px;font-size:12px">Simpan Drive Config</button></div>';

    /* AI API Keys */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:#6A1B9A;margin-bottom:9px">AI API Keys</div>';
    h+='<div style="background:#F3E5F5;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.6">';
    h+='<b>OpenAI:</b> <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#6A1B9A">platform.openai.com</a><br>';
    h+='<b>Google Gemini:</b> <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#6A1B9A">aistudio.google.com</a><br>';
    h+='<b>Anthropic Claude:</b> <a href="https://console.anthropic.com" target="_blank" style="color:#6A1B9A">console.anthropic.com</a></div>';
    h+='<div class="g3" style="margin-bottom:9px">';
    h+='<div><label class="lbl">OpenAI API Key</label><input id="AI-GPT-KEY" class="fi" type="password" value="'+esc(cfg.openaiKey||'')+'" placeholder="sk-proj-..."><div style="margin-top:4px"><label class="lbl">GPT Model</label><select id="AI-GPT-MDL" class="fi"><option value="gpt-4o-mini"'+(cfg.openaiModel==='gpt-4o-mini'?' selected':'')+'>gpt-4o-mini (cepat)</option><option value="gpt-4o"'+(cfg.openaiModel==='gpt-4o'?' selected':'')+'>gpt-4o (powerful)</option></select></div></div>';
    h+='<div><label class="lbl">Gemini API Key</label><input id="AI-GEM-KEY" class="fi" type="password" value="'+esc(cfg.geminiKey||'')+'" placeholder="AIzaSy..."><div style="margin-top:4px"><label class="lbl">Gemini Model</label><select id="AI-GEM-MDL" class="fi"><option value="gemini-1.5-flash"'+(cfg.geminiModel==='gemini-1.5-flash'?' selected':'')+'>gemini-1.5-flash</option><option value="gemini-1.5-pro"'+(cfg.geminiModel==='gemini-1.5-pro'?' selected':'')+'>gemini-1.5-pro</option></select></div></div>';
    h+='<div><label class="lbl">Anthropic API Key</label><input id="AI-CLD-KEY" class="fi" type="password" value="'+esc(cfg.anthropicKey||'')+'" placeholder="sk-ant-..."><div style="margin-top:4px"><label class="lbl">Claude Model</label><select id="AI-CLD-MDL" class="fi"><option value="claude-3-5-haiku-20241022"'+(cfg.claudeModel==='claude-3-5-haiku-20241022'?' selected':'')+'>Claude Haiku (cepat)</option><option value="claude-3-5-sonnet-20241022"'+(cfg.claudeModel==='claude-3-5-sonnet-20241022'?' selected':'')+'>Claude Sonnet</option></select></div></div>';
    h+='</div>';
    h+='<button class="btnp" onclick="var c=getCfg();c.openaiKey=document.getElementById(\'AI-GPT-KEY\').value.trim();c.openaiModel=document.getElementById(\'AI-GPT-MDL\').value;c.geminiKey=document.getElementById(\'AI-GEM-KEY\').value.trim();c.geminiModel=document.getElementById(\'AI-GEM-MDL\').value;c.anthropicKey=document.getElementById(\'AI-CLD-KEY\').value.trim();c.claudeModel=document.getElementById(\'AI-CLD-MDL\').value;saveCfg(c);toast(\'AI Keys disimpan\',\'success\')" style="background:#6A1B9A;padding:9px 14px;font-size:12px">Simpan AI API Keys</button></div>';

    /* Supabase */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:#1A73E8;margin-bottom:7px">Supabase Database</div>';
    h+='<div style="background:#E8F0FE;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.7">';
    h+='<b>Cara setup:</b><br>1. Daftar di <a href="https://supabase.com" target="_blank" style="color:#1A73E8">supabase.com</a> (gratis)<br>2. Buat project baru<br>3. Buat table <code>ajw_backup</code> dengan kolom: id, eval_history (text), pay_history (text), employees (text), kpi_data (text), exported_at (text)<br>4. Settings \u2192 API \u2192 copy Project URL dan anon key</div>';
    h+='<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Supabase Project URL</label><input id="SB-URL" class="fi" value="'+esc(cfg.supabaseUrl||'')+'" placeholder="https://xxx.supabase.co"></div><div><label class="lbl">Supabase Anon Key</label><input id="SB-KEY" class="fi" type="password" value="'+esc(cfg.supabaseKey||'')+'" placeholder="eyJhb..."></div></div>';
    h+='<button class="btnp" onclick="var c=getCfg();c.supabaseUrl=document.getElementById(\'SB-URL\').value.trim();c.supabaseKey=document.getElementById(\'SB-KEY\').value.trim();saveCfg(c);toast(\'Supabase config disimpan\',\'success\')" style="background:#1A73E8;padding:9px 14px;font-size:12px">Simpan Supabase</button></div>';
  }

  if(adminSub==='templates'){
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:#E65100;margin-bottom:7px">Template Caption WA / Telegram</div>';
    h+='<div style="font-size:10px;color:var(--tx2);background:var(--bg3);padding:8px;border-radius:5px;margin-bottom:9px;line-height:1.7">Variabel: {nama} {jabatan} {periode} {tipe} {tanggal} {nilai} {grade} {kategori} {rincian} {keputusan} {catatan} {gajiPokok} {lembur} {bonus} {kotor} {bersih} {hariKerja}</div>';
    h+='<div style="margin-bottom:10px"><label class="lbl">Template Penilaian</label><textarea id="TPL-eval" class="fi" rows="6">'+esc(cfg.evalTpl||'LAPORAN PENILAIAN KINERJA\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nTanggal: {tanggal}\n\nNILAI AKHIR: {nilai} / 4.00\nGrade: {grade} - {kategori}\n\nRincian:\n{rincian}\n\nKeputusan: {keputusan}\n{catatan}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h+='<div style="margin-bottom:10px"><label class="lbl">Template Payroll</label><textarea id="TPL-pay" class="fi" rows="5">'+esc(cfg.payTpl||'SLIP GAJI KARYAWAN\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nHari Kerja: {hariKerja} hari\n\nGaji Pokok : Rp {gajiPokok}\nLembur     : Rp {lembur}\nBonus      : Rp {bonus}\nTotal Kotor: Rp {kotor}\n\nGAJI BERSIH: Rp {bersih}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h+='<button class="btnp" onclick="var c=getCfg();c.evalTpl=document.getElementById(\'TPL-eval\').value;c.payTpl=document.getElementById(\'TPL-pay\').value;saveCfg(c);toast(\'Template disimpan\',\'success\')" style="background:#E65100;padding:9px 14px;font-size:12px">Simpan Template</button></div>';
  }

  if(adminSub==='tabs'){
    /* Tab config */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">Konfigurasi Tab Bawaan (Edit Nama, Sembunyikan, Edit HTML)</div>';
    var tc=cfg.tabsConfig||{};
    var coreDefs=[{id:'dash',def:'\uD83C\uDFE0 Dashboard'},{id:'eval',def:'\uD83D\uDCCB Penilaian'},{id:'payroll',def:'\uD83D\uDCB0 Payroll'},{id:'stats',def:'\uD83D\uDCCA Statistik'},{id:'emp',def:'\uD83D\uDC65 Karyawan'},{id:'hist',def:'\uD83D\uDCDC Riwayat'},{id:'kpi',def:'\uD83D\uDCCA KPI Bisnis'},{id:'aichat',def:'\uD83E\uDD16 AI Chat'},{id:'admin',def:'\u2699\uFE0F Admin'}];
    coreDefs.forEach(function(t){
      var lbl=tc['label_'+t.id]||t.def;
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:7px 10px;background:var(--bg3);border-radius:6px">';
      h+='<input type="checkbox" id="THIDE-'+t.id+'"'+(tc['hide_'+t.id]?'':' checked')+' style="width:16px;height:16px;accent-color:var(--teal)">';
      h+='<label style="font-size:11px;width:45px;color:var(--tx2)" for="THIDE-'+t.id+'">Tampil</label>';
      h+='<input class="fi" id="TLBL-'+t.id+'" type="text" value="'+esc(lbl)+'" style="flex:1;padding:6px 9px;font-size:12px">';
      h+='<button class="btna" onclick="openTabEditor(\''+t.id+'\',document.getElementById(\'TLBL-'+t.id+'\').value)" style="background:#1565C0;padding:6px 11px;font-size:10px">&#9998; Edit HTML</button>';
      h+='</div>';
    });
    h+='<button class="btna" onclick="var c=getCfg();c.tabsConfig=c.tabsConfig||{};';
    coreDefs.forEach(function(t){h+='c.tabsConfig[\'hide_'+t.id+'\']=!document.getElementById(\'THIDE-'+t.id+'\').checked;c.tabsConfig[\'label_'+t.id+'\']=document.getElementById(\'TLBL-'+t.id+'\').value;'});
    h+='saveCfg(c);buildTabBar();toast(\'Tab diperbarui\',\'success\')" style="background:#0D2E5A;padding:9px 13px;font-size:12px;margin-top:5px;margin-bottom:14px">Simpan Konfigurasi Tab</button></div>';

    /* Custom tabs */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">Tab Custom</div>';
    if(customTabs.length){customTabs.forEach(function(ct,idx){
      h+='<div style="border:1px solid var(--bd);border-radius:6px;padding:9px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px">';
      h+='<span style="font-weight:700;color:var(--navy)">'+(ct.icon||'\uD83D\uDCC4')+' '+esc(ct.name)+'</span>';
      h+='<div style="display:flex;gap:5px"><button class="btnsm" onclick="openTabEditor(\'ct_'+ct.id+'\',\''+esc(ct.name)+'\')" style="background:#1565C0">&#9998; Edit HTML</button><button class="btnsm" onclick="SW(\'ct_'+ct.id+'\')" style="background:#00838F">Preview</button><button class="btnsm" onclick="customTabs.splice('+idx+',1);sv(\'ajw_tabs\',customTabs);buildTabBar();renderAdmin()" style="background:#C62828">Hapus</button></div></div>';
    });}
    else h+='<div style="color:var(--tx3);font-size:12px;margin-bottom:10px">Belum ada tab custom.</div>';
    h+='<div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:7px">+ Tambah Tab Custom</div>';
    h+='<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Nama Tab</label><input id="CT-nm" class="fi" placeholder="Nama Tab Baru"></div><div><label class="lbl">Icon (emoji)</label><input id="CT-ic" class="fi" placeholder="\uD83D\uDCC4" style="max-width:80px"></div></div>';
    h+='<div style="margin-bottom:8px"><label class="lbl">HTML Content</label><textarea id="CT-html" class="fi" rows="5" style="font-family:monospace;font-size:12px" placeholder="<div>Konten tab kamu disini...</div>"></textarea></div>';
    h+='<button class="btna" onclick="var nm=document.getElementById(\'CT-nm\').value.trim();if(!nm){toast(\'Nama tab wajib\',\'error\');return};var ct={id:Date.now(),name:nm,icon:document.getElementById(\'CT-ic\').value||\'\uD83D\uDCC4\',html:document.getElementById(\'CT-html\').value};customTabs.push(ct);sv(\'ajw_tabs\',customTabs);addCustomTabDiv(ct);buildTabBar();toast(\'Tab ditambahkan!\',\'success\');renderAdmin()" style="background:#00838F;padding:9px 13px;font-size:12px">+ Tambah Tab</button></div>';

    /* All-in-One HTML Export */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:7px">&#128190; Export HTML Keseluruhan Sistem</div>';
    h+='<div style="font-size:11px;color:var(--tx2);margin-bottom:10px;line-height:1.7">Download seluruh sistem AJW sebagai 1 file HTML yang bisa langsung di-deploy ke Netlify (drag & drop) atau dibuka offline. Semua tab, data, konfigurasi, dan kode ada di dalam file ini.</div>';
    h+='<button class="btnp" onclick="exportFullHTML()" style="background:#E65100;padding:10px 18px;font-size:12px">&#128190; Download HTML Keseluruhan Sistem</button></div>';

    /* CSS Override */
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:7px">Override CSS (All-in-One Kustomisasi)</div>';
    h+='<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">Edit CSS variables untuk ubah warna, tema, ukuran. Contoh: <code>:root{--blue:#FF5722}</code></div>';
    h+='<textarea id="CSS-OVR" class="fi" rows="7" style="font-family:monospace;font-size:12px" placeholder=":root { --blue: #FF5722; }&#10;.topbar { background: #1a1a1a; }">'+esc(cfg.cssOverride||'')+'</textarea>';
    h+='<div style="display:flex;gap:6px;margin-top:8px"><button class="btna" onclick="var css=document.getElementById(\'CSS-OVR\').value;var c=getCfg();c.cssOverride=css;saveCfg(c);applyCSSOverride(css);toast(\'CSS diterapkan!\',\'success\')" style="background:#E65100;padding:9px 13px;font-size:12px">Terapkan CSS</button><button class="btna" onclick="var c=getCfg();c.cssOverride=\'\';saveCfg(c);applyCSSOverride(\'\');document.getElementById(\'CSS-OVR\').value=\'\';toast(\'CSS direset\',\'info\')" style="background:#546E7A;padding:9px 13px;font-size:12px">Reset CSS</button></div></div>';
  }

  if(adminSub==='data'){
    h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:9px">Backup & Manajemen Data</div>';
    /* Drive Backup */
    h+='<div style="background:var(--bg3);border-radius:7px;padding:11px;margin-bottom:10px;border:1px solid var(--bd)">';
    h+='<div style="font-size:11px;font-weight:700;color:#0F9D58;margin-bottom:7px">&#9729; Backup ke Google Drive</div>';
    h+='<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">Backup semua data (eval, payroll, karyawan, KPI) ke satu file JSON di Drive. Butuh Bearer Token di tab Integrasi.</div>';
    h+='<button class="btna" onclick="backupToDrive()" style="background:#0F9D58;padding:9px 14px;font-size:12px">&#9729; Backup ke Drive Sekarang</button></div>';
    /* Supabase Backup */
    h+='<div style="background:var(--bg3);border-radius:7px;padding:11px;margin-bottom:10px;border:1px solid var(--bd)">';
    h+='<div style="font-size:11px;font-weight:700;color:#1A73E8;margin-bottom:7px">&#128196; Backup ke Supabase</div>';
    h+='<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">Simpan data ke cloud database Supabase (gratis 500MB). Butuh konfigurasi di tab Integrasi.</div>';
    h+='<button class="btna" onclick="backupToSupabase()" style="background:#1A73E8;padding:9px 14px;font-size:12px">&#128196; Backup ke Supabase Sekarang</button></div>';
    /* Local backup */
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px">';
    h+='<button class="btna" onclick="exportData()" style="background:#2E7D32;padding:9px 13px;font-size:12px">Export JSON Lokal</button>';
    h+='<button class="btna" onclick="importData()" style="background:#1565C0;padding:9px 13px;font-size:12px">Import JSON</button>';
    h+='<button class="btna" onclick="if(confirm(\'Hapus SEMUA riwayat?\')){evalHistory=[];payHistory=[];sv(\'ajw_eval\',evalHistory);sv(\'ajw_pay\',payHistory);toast(\'Data dihapus\',\'warn\')}" style="background:#C62828;padding:9px 13px;font-size:12px">Reset Data</button></div>';
    /* Storage recommendation */
    h+='<div style="background:#FFF3E0;border-radius:7px;padding:11px;border:1px solid #E65100">';
    h+='<div style="font-size:11px;font-weight:700;color:#E65100;margin-bottom:5px">&#128161; Rekomendasi Penyimpanan Database</div>';
    h+='<div style="font-size:11px;color:var(--tx);line-height:1.8">';
    h+='<b>Saat ini:</b> localStorage browser (offline, ~5-10MB, hanya di 1 perangkat)<br>';
    h+='<b>Rekomendasi:</b> <b style="color:#1A73E8">Supabase</b> \u2014 gratis 500MB, sync multi-device, real-time, mudah setup<br>';
    h+='<b>Alternatif:</b> Google Drive (sudah terintegrasi) \u2014 backup manual/otomatis ke folder Drive<br>';
    h+='<b>Enterprise:</b> Firebase Firestore (gratis sampai 1GB/bulan)<br>';
    h+='Aktifkan backup otomatis di Integrasi agar data aman.</div></div>';
    h+='<div style="margin-top:8px;font-size:11px;color:var(--tx2)">Tersimpan lokal: '+evalHistory.length+' penilaian + '+payHistory.length+' slip gaji + '+employees.length+' karyawan + '+customTabs.length+' tab custom</div></div>';
  }

  document.getElementById('V-admin').innerHTML=h;
}

/* ============================================================
   AJW v8 PATCHES & NEW FEATURES
   Applied on top of v7 JS
============================================================ */

/* ====== GOOGLE OAUTH / DRIVE LOGIN ====== */
var GOOGLE_CLIENT_ID = '';  /* Set in admin */
var driveAccessToken = '';

function initGoogleAuth(){
  var cfg = getCfg();
  GOOGLE_CLIENT_ID = cfg.googleClientId || '';
  driveAccessToken = cfg.driveToken || '';
}

function googleSignIn(cb){
  var cfg = getCfg();
  var clientId = cfg.googleClientId || '';
  if(!clientId){ toast('Google Client ID belum diset di Admin \u2192 Integrasi', 'error'); return; }
  var scope = 'https://www.googleapis.com/auth/drive.file';
  var url = 'https://accounts.google.com/o/oauth2/v2/auth'
    + '?client_id=' + clientId
    + '&redirect_uri=' + encodeURIComponent(location.origin + location.pathname)
    + '&response_type=token'
    + '&scope=' + encodeURIComponent(scope)
    + '&prompt=select_account';
  var w = window.open(url, 'google_auth', 'width=500,height=600,scrollbars=yes');
  var timer = setInterval(function(){
    try {
      if(!w || w.closed){ clearInterval(timer); return; }
      var hash = w.location.hash;
      if(hash && hash.indexOf('access_token') >= 0){
        clearInterval(timer); w.close();
        var params = {};
        hash.replace('#','').split('&').forEach(function(p){ var kv=p.split('='); params[kv[0]]=kv[1]; });
        driveAccessToken = params['access_token'];
        var c = getCfg(); c.driveToken = driveAccessToken; saveCfg(c);
        toast('\u2705 Login Google berhasil! Drive siap digunakan.', 'success', 4000);
        if(cb) cb(driveAccessToken);
        renderAdmin();
      }
    }catch(e){}
  }, 500);
}

function uploadDriveFull(data, type){
  var cfg = getCfg();
  var token = cfg.driveToken || driveAccessToken;
  if(!token){ toast('Belum login Google Drive. Klik "Login Google Drive" di Admin.', 'error'); return; }
  var folderId = type==='eval'?(cfg.driveEvalFolder||'1D4lQmi48BBPNYxhqAM_Qtp68I6nPTw9Z'):(cfg.drivePayFolder||'10b5C7W-33tS3Ujd5xYcvjtYj_9NYsWhJ');
  var empName = (data.info?data.info.nama:'Unknown').replace(/[^a-zA-Z0-9 ]/g,'').trim();
  var dateStr = ymd();
  var filename = (type==='eval'?'Penilaian':'Payroll')+'-'+empName+'-'+dateStr+'.json';
  var meta = JSON.stringify({name:filename, parents:[folderId]});
  var content = JSON.stringify(data, null, 2);
  var boundary = 'AJW_'+Date.now();
  var body = '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+content+'\r\n--'+boundary+'--';
  toast('Mengupload ke Drive...','info',5000);
  fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
    method:'POST',
    headers:{'Authorization':'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},
    body:body
  }).then(function(r){return r.json()}).then(function(d){
    if(d.id) toast('\u2705 Drive: '+filename+' berhasil!','success',4000);
    else toast('\u274C Drive: '+(d.error?d.error.message:'Token mungkin expired, login ulang'),'error');
  }).catch(function(e){ toast('\u274C Gagal: '+e.message,'error'); });
}

/* Override uploadDrive with new version */
uploadDrive = uploadDriveFull;

/* ====== MANUAL BACKUP BUTTONS ====== */
function manualBackupTelegram(data, type){
  syncTelegram(data, type);
}
function manualBackupDrive(data, type){
  uploadDriveFull(data, type);
}

/* ====== EMPLOYEE EDIT ====== */
var editEmpIdx = -1;

function openEditEmpModal(idx){
  var e = employees[idx]; if(!e) return;
  editEmpIdx = idx;
  window._tmpKtpImg = e.ktpImg||'';
  window._tmpFoto = e.fotoProfile||'';
  document.getElementById('EMPMODAL').style.display='flex';
  /* Pre-fill after render */
  setTimeout(function(){
    var setVal = function(id, val){ var el=document.getElementById(id); if(el)el.value=val||''; };
    setVal('EMP-n', e.nama);
    setVal('EMP-j', e.jabatan);
    setVal('EMP-jd', e.jobdesk||'');
    setVal('EMP-w', e.noWA||'');
    setVal('EMP-e', e.email||'');
    setVal('EMP-k', e.ktp||'');
    setVal('EMP-tlhr', e.tglLahir||'');
    setVal('EMP-t', e.tglMasuk||'');
    setVal('EMP-a', e.alamat||'');
    setVal('EMP-g', e.gajiPokok||0);
    setVal('EMP-nr', e.nomorRek||'');
    setVal('EMP-cat', e.catatan||'');
    var setSelect = function(id, val){ var el=document.getElementById(id); if(el&&val){for(var i=0;i<el.options.length;i++){if(el.options[i].value===val){el.selectedIndex=i;break}}}};
    setSelect('EMP-div', e.divisi||'Warehouse');
    setSelect('EMP-jk', e.jenisKelamin||'Laki-laki');
    setSelect('EMP-tk', e.tipeKerja||'Fulltime');
    setSelect('EMP-tg', e.tipeGaji||'Bulanan');
    setSelect('EMP-mb', e.metodeBayar||'Transfer');
    setSelect('EMP-nb', e.namaBank||'BCA');
    var status = document.getElementById('EMP-status');
    if(status) status.checked = (e.statusAktif !== false);
    var slbl = document.getElementById('STATUS-LBL');
    if(slbl){ slbl.textContent = (e.statusAktif!==false)?'Aktif':'Non-Aktif'; slbl.style.color=(e.statusAktif!==false)?'#2E7D32':'#C62828'; }
    var knob = document.getElementById('STATUS-KNOB');
    if(knob) knob.style.left = (e.statusAktif!==false)?'22px':'2px';
    /* Show existing photo */
    if(e.fotoProfile){
      var fp=document.getElementById('FOTO-PREVIEW');
      if(fp) fp.innerHTML='<img src="'+e.fotoProfile+'" style="width:100%;height:100%;object-fit:cover">';
    }
    /* Change save button */
    var btn = document.querySelector('#EMPMODAL button[onclick="addEmpV7()"]');
    if(btn){ btn.textContent='Simpan Perubahan'; btn.setAttribute('onclick','saveEditEmp()'); }
    var title = document.querySelector('#EMPMODAL [style*="font-size:13px"]');
    if(title) title.textContent='Edit Karyawan: '+e.nama;
  }, 50);
}

function saveEditEmp(){
  var nm = document.getElementById('EMP-n').value.trim();
  if(!nm){ toast('Nama wajib diisi','error'); return; }
  employees[editEmpIdx] = {
    id: employees[editEmpIdx].id,
    nama: nm,
    jabatan: document.getElementById('EMP-j').value.trim()||'Staff Packing',
    divisi: document.getElementById('EMP-div').value||'Warehouse',
    jobdesk: document.getElementById('EMP-jd').value.trim(),
    tipeKerja: document.getElementById('EMP-tk').value||'Fulltime',
    noWA: document.getElementById('EMP-w').value.trim(),
    email: document.getElementById('EMP-e').value.trim(),
    ktp: document.getElementById('EMP-k').value.trim(),
    ktpImg: window._tmpKtpImg||employees[editEmpIdx].ktpImg||'',
    fotoProfile: window._tmpFoto||employees[editEmpIdx].fotoProfile||'',
    tglLahir: document.getElementById('EMP-tlhr').value,
    jenisKelamin: document.getElementById('EMP-jk').value||'Laki-laki',
    tglMasuk: document.getElementById('EMP-t').value,
    alamat: document.getElementById('EMP-a').value.trim(),
    gajiPokok: parseInt(document.getElementById('EMP-g').value)||0,
    tipeGaji: document.getElementById('EMP-tg').value||'Bulanan',
    statusAktif: document.getElementById('EMP-status').checked,
    metodeBayar: document.getElementById('EMP-mb').value||'Transfer',
    nomorRek: document.getElementById('EMP-nr').value.trim(),
    namaBank: document.getElementById('EMP-nb').value||'BCA',
    catatan: document.getElementById('EMP-cat').value.trim(),
    createdAt: employees[editEmpIdx].createdAt || isoNow(),
    updatedAt: isoNow()
  };
  sv('ajw_emp', employees);
  window._tmpKtpImg=''; window._tmpFoto=''; editEmpIdx=-1;
  toast('Data karyawan diperbarui!','success');
  document.getElementById('EMPMODAL').style.display='none';
  renderEmp();
}

/* Patch renderEmp to add Edit button */
var _origRenderEmp = renderEmp;
renderEmp = function(){
  _origRenderEmp();
  /* Add edit buttons to table */
  var tds = document.querySelectorAll('#V-emp table tbody tr');
  if(!tds.length) return;
  /* Already handled by new version via renderEmpV8 */
};

function renderEmpV8(){
  var h='<div class="card">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:7px">';
  h+='<span style="background:#00838F;color:#fff;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:700">DATABASE KARYAWAN ('+employees.length+')</span>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="exportEmpCSV()" style="background:#2E7D32;padding:7px 11px;font-size:11px">Export CSV</button>';
  h+='<button class="btnp" onclick="editEmpIdx=-1;openAddEmpModal()" style="background:#00838F;padding:8px 16px;font-size:12px">+ Tambah Karyawan</button></div></div>';

  if(employees.length){
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Foto</th><th>Nama</th><th>Divisi/Jabatan</th><th>Tipe</th><th>WhatsApp</th><th class="c">Gaji Pokok</th><th class="c">Tipe</th><th class="c">Status</th><th class="c">Eval</th><th class="c">Gaji</th><th>Aksi</th></tr></thead><tbody>';
    employees.forEach(function(e,idx){
      var ec=evalHistory.filter(function(d){return d.info.nama===e.nama}).length;
      var pc=payHistory.filter(function(d){return d.info.nama===e.nama}).length;
      var isActive=(e.statusAktif!==false);
      h+='<tr><td style="color:var(--tx2)">'+(idx+1)+'</td>';
      h+='<td style="text-align:center">';
      if(e.fotoProfile) h+='<img src="'+e.fotoProfile+'" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--teal)">';
      else h+='<div style="width:30px;height:30px;border-radius:50%;background:var(--bg3);display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:var(--tx3);border:1px solid var(--bd)">'+esc(e.nama.charAt(0).toUpperCase())+'</div>';
      h+='</td>';
      h+='<td style="font-weight:700;color:var(--navy)"><div>'+esc(e.nama)+'</div><div style="font-size:10px;color:var(--tx3)">'+esc(e.jobdesk||'')+'</div></td>';
      h+='<td><div style="font-size:11px;color:var(--tx2)">'+esc(e.divisi||'-')+'</div><div style="font-size:11px">'+esc(e.jabatan)+'</div></td>';
      h+='<td><span class="chip" style="background:'+(e.tipeKerja==='Fulltime'?'#E8F5E9':'#FFF3E0')+';color:'+(e.tipeKerja==='Fulltime'?'#2E7D32':'#E65100')+'">'+esc(e.tipeKerja||'Fulltime')+'</span></td>';
      h+='<td>'+(e.noWA?'<a href="https://wa.me/'+e.noWA.replace(/\D/g,'')+'" target="_blank" style="color:#25D366;font-weight:700;font-size:11px">'+esc(e.noWA)+'</a>':'<span style="color:var(--tx3)">-</span>')+'</td>';
      h+='<td class="c" style="font-weight:700;color:#2E7D32;white-space:nowrap">'+(e.gajiPokok?'Rp '+fmt(e.gajiPokok):'-')+'</td>';
      h+='<td class="c"><span class="chip" style="background:var(--bg3);color:var(--tx2)">'+esc(e.tipeGaji||'Bulanan')+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:'+(isActive?'#E8F5E9':'#FFEBEE')+';color:'+(isActive?'#2E7D32':'#C62828')+'">'+(isActive?'Aktif':'Non-Aktif')+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:#DBEAFE;color:#1565C0">'+ec+'</span></td>';
      h+='<td class="c"><span class="chip" style="background:#E0F7FA;color:#006064">'+pc+'</span></td>';
      h+='<td style="white-space:nowrap">';
      h+='<button class="btnsm" onclick="viewEmpDetail('+idx+')" style="background:#546E7A">Detail</button>';
      h+='<button class="btnsm" onclick="genEmpCard('+idx+')" style="background:#6A1B9A">Kartu</button>';
      h+='<button class="btnsm" onclick="openEditEmpModal('+idx+')" style="background:#F57F17">Edit</button>';
      h+='<button class="btnsm" onclick="pickEmp('+idx+',\'eval\')" style="background:#1565C0">Nilai</button>';
      h+='<button class="btnsm" onclick="pickEmp('+idx+',\'payroll\')" style="background:#00838F">Gaji</button>';
      h+='<button class="btnsm" onclick="statsFilter.emp=employees['+idx+'].nama;SW(\'stats\')" style="background:#6A1B9A">Stats</button>';
      h+='<button class="btnsm" onclick="delEmp('+idx+')" style="background:#C62828">X</button></td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div style="text-align:center;padding:30px;color:var(--tx3)">Belum ada karyawan. Klik + Tambah Karyawan.</div>';
  h+='</div>';
  h+=buildEmpModal();
  document.getElementById('V-emp').innerHTML=h;
}
renderEmp = renderEmpV8;

/* ====== EMPLOYEE BUSINESS CARD ====== */
function genEmpCard(idx){
  var e = employees[idx]; if(!e) return;
  var cfg = getCfg();
  var isActive = (e.statusAktif !== false);
  var h='<div style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;justify-content:center;align-items:center;padding:20px" id="EMP-CARD-MODAL" onclick="if(event.target===this)this.remove()">';
  h+='<div style="max-width:420px;width:100%">';
  h+='<div style="display:flex;justify-content:flex-end;gap:7px;margin-bottom:9px">';
  h+='<button class="btna" onclick="genPDF(\'EMP-CARD-'+idx+'\',\'KartuKaryawan_'+esc(e.nama)+'\')" style="background:#E65100;padding:7px 12px">PDF / Print</button>';
  h+='<button class="btna" onclick="document.getElementById(\'EMP-CARD-MODAL\').remove()" style="background:#546E7A;padding:7px 11px">&times; Tutup</button></div>';
  /* Card */
  h+='<div id="EMP-CARD-'+idx+'" style="background:linear-gradient(135deg,#0D2E5A 0%,#1565C0 100%);border-radius:16px;padding:24px;color:#fff;box-shadow:0 8px 32px rgba(0,0,0,.4);-webkit-print-color-adjust:exact;print-color-adjust:exact">';
  /* Header with logo */
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">';
  h+='<div><div style="font-size:12px;font-weight:700;color:#FFD700;letter-spacing:1px">ANTON JAYA WIJAYA</div><div style="font-size:10px;color:#90CAF9">Anton Pancing &bull; Toko Alat Pancing</div></div>';
  h+='<img src="'+LOGO_SRC+'" style="width:44px;height:44px;border-radius:50%;border:2px solid #C8A400;background:#000;object-fit:contain">';
  h+='</div>';
  /* Photo + Name */
  h+='<div style="display:flex;align-items:center;gap:16px;margin-bottom:18px">';
  if(e.fotoProfile) h+='<img src="'+e.fotoProfile+'" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #C8A400;flex-shrink:0">';
  else h+='<div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#FFD700;border:3px solid #C8A400;flex-shrink:0">'+esc(e.nama.charAt(0).toUpperCase())+'</div>';
  h+='<div><div style="font-size:20px;font-weight:700;color:#fff">'+esc(e.nama)+'</div>';
  h+='<div style="font-size:12px;color:#FFD700;font-weight:700;margin-top:2px">'+esc(e.jabatan)+'</div>';
  h+='<div style="font-size:11px;color:#90CAF9;margin-top:2px">'+esc(e.divisi||'')+'</div>';
  h+='<span style="background:'+(isActive?'#2E7D32':'#C62828')+';color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;display:inline-block;margin-top:5px">'+(isActive?'Aktif':'Non-Aktif')+'</span>';
  h+='</div></div>';
  /* Info grid */
  h+='<div style="background:rgba(255,255,255,.1);border-radius:9px;padding:12px;margin-bottom:14px">';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  [['Tipe Kerja',e.tipeKerja||'Fulltime'],['Jenis Kelamin',e.jenisKelamin||'-'],['Bergabung',e.tglMasuk?fmtD(e.tglMasuk):'-'],['Divisi',e.divisi||'-']].forEach(function(x){
    h+='<div><div style="font-size:9px;color:#90CAF9;font-weight:700">'+x[0].toUpperCase()+'</div><div style="font-size:11px;color:#fff;font-weight:700;margin-top:1px">'+esc(x[1])+'</div></div>';
  });
  h+='</div></div>';
  /* Contact */
  h+='<div style="display:flex;flex-direction:column;gap:5px">';
  if(e.noWA) h+='<div style="display:flex;align-items:center;gap:8px;font-size:11px"><span style="color:#25D366">📱</span><span style="color:#fff">'+esc(e.noWA)+'</span></div>';
  if(e.email) h+='<div style="display:flex;align-items:center;gap:8px;font-size:11px"><span style="color:#64B5F6">✉️</span><span style="color:#fff">'+esc(e.email)+'</span></div>';
  h+='</div>';
  /* Footer */
  h+='<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:14px;padding-top:10px;display:flex;justify-content:space-between;align-items:center">';
  h+='<div style="font-size:9px;color:#90CAF9">ID: '+e.id+'</div>';
  h+='<div style="font-size:9px;color:#C8A400;font-weight:700">KARTU KARYAWAN</div>';
  h+='</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', h);
}

/* ====== ADMIN CHATBOT GPT ====== */
var adminChatHistory = [];

function buildAdminChatbot(){
  var h='<div class="card" id="ADMIN-CHATBOT"><div style="font-size:12px;font-weight:700;color:#6A1B9A;margin-bottom:9px">🤖 Asisten AI Admin (ChatGPT)</div>';
  h+='<div style="background:#F3E5F5;border-radius:6px;padding:8px;margin-bottom:9px;font-size:11px;color:#4A148C">Tanya AI tentang bisnis, karyawan, strategi, analisis data, dll. Butuh OpenAI API Key di tab Integrasi.</div>';
  h+='<div id="ADM-CHAT-MSGS" style="height:280px;background:var(--bg3);border-radius:8px;border:1px solid var(--bd);overflow-y:auto;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:7px">';
  h+='<div style="text-align:center;color:var(--tx3);font-size:12px;padding:20px">Tanya apapun tentang bisnis AJW...</div></div>';
  h+='<div style="display:flex;gap:7px">';
  h+='<textarea id="ADM-CHAT-INP" class="fi" rows="2" placeholder="Tanya AI..." style="flex:1;resize:none" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendAdminChat()}"></textarea>';
  h+='<button class="btnp" id="ADM-CHAT-BTN" onclick="sendAdminChat()" style="background:#6A1B9A;align-self:flex-end;padding:10px 14px">Kirim</button></div>';
  h+='<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">';
  ['Analisis KPI bisnis saya','Rekomendasi strategi Shopee','Tips reduce retur','Draft SOP packing','Analisis karyawan terbaik','Forecast pendapatan'].forEach(function(p){
    h+='<button class="btna" onclick="document.getElementById(\'ADM-CHAT-INP\').value=\''+p+'\'" style="background:var(--bg3);color:var(--tx2);border:1px solid var(--bd);padding:4px 9px;font-size:10px">'+p+'</button>';
  });
  h+='<button class="btna" onclick="adminChatHistory=[];renderAdminChatMsgs()" style="background:#C62828;padding:4px 9px;font-size:10px">Bersihkan</button>';
  h+='</div></div>';
  return h;
}

function renderAdminChatMsgs(){
  var el=document.getElementById('ADM-CHAT-MSGS'); if(!el) return;
  if(!adminChatHistory.length){ el.innerHTML='<div style="text-align:center;color:var(--tx3);font-size:12px;padding:20px">Tanya apapun tentang bisnis AJW...</div>'; return; }
  var h='';
  adminChatHistory.forEach(function(msg){
    if(msg.role==='user') h+='<div style="display:flex;justify-content:flex-end"><div style="background:#6A1B9A;color:#fff;padding:8px 12px;border-radius:12px 12px 2px 12px;max-width:80%;font-size:12px;line-height:1.5">'+esc(msg.content).replace(/\n/g,'<br>')+'</div></div>';
    else h+='<div style="display:flex;gap:7px"><div style="width:26px;height:26px;border-radius:50%;background:#6A1B9A;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">🤖</div><div style="background:var(--bg2);border:1px solid var(--bd);padding:8px 12px;border-radius:2px 12px 12px 12px;max-width:82%;font-size:12px;line-height:1.6">'+msg.content.replace(/\n/g,'<br>')+'</div></div>';
  });
  el.innerHTML=h;
  el.scrollTop=el.scrollHeight;
}

function sendAdminChat(){
  var inp=document.getElementById('ADM-CHAT-INP'); if(!inp) return;
  var msg=inp.value.trim(); if(!msg) return;
  inp.value='';
  var cfg=getCfg();
  if(!cfg.openaiKey){ toast('OpenAI API Key belum diset di Admin \u2192 Integrasi','error'); return; }
  adminChatHistory.push({role:'user',content:msg});
  renderAdminChatMsgs();
  var btn=document.getElementById('ADM-CHAT-BTN'); if(btn){btn.disabled=true;btn.textContent='...'}
  var ctx='Kamu adalah asisten bisnis AJW (Anton Jaya Wijaya). Data: '+(employees.length)+' karyawan aktif, '+evalHistory.length+' penilaian, '+payHistory.length+' slip gaji. Jawab singkat, praktis, dalam bahasa Indonesia.';
  var messages=[{role:'system',content:ctx}].concat(adminChatHistory.slice(-8));
  fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.openaiKey},
    body:JSON.stringify({model:cfg.openaiModel||'gpt-4o-mini',max_tokens:600,messages:messages})
  }).then(function(r){return r.json()}).then(function(d){
    var reply=d.choices&&d.choices[0]?d.choices[0].message.content:'Error: '+JSON.stringify(d.error||d);
    adminChatHistory.push({role:'assistant',content:reply});
    renderAdminChatMsgs();
    if(btn){btn.disabled=false;btn.textContent='Kirim'}
  }).catch(function(e){ toast('AI error: '+e.message,'error'); if(btn){btn.disabled=false;btn.textContent='Kirim'} });
}

/* ====== FULL HTML SOURCE VIEWER & DOWNLOAD ====== */
function buildHTMLViewer(){
  var h='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;flex-wrap:wrap;gap:7px">';
  h+='<div style="font-size:12px;font-weight:700;color:var(--navy)">📄 HTML Sumber Keseluruhan Sistem</div>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="exportFullHTML()" style="background:#E65100;padding:8px 13px;font-size:12px">💾 Download HTML</button>';
  h+='<button class="btna" onclick="toggleHTMLEditor()" style="background:#1565C0;padding:8px 13px;font-size:12px" id="HTML-EDIT-BTN">✏️ Mode Edit</button>';
  h+='<button class="btna" onclick="applyEditedHTML()" id="HTML-APPLY-BTN" style="background:#2E7D32;padding:8px 13px;font-size:12px;display:none">✅ Terapkan Perubahan</button>';
  h+='</div></div>';
  h+='<div style="font-size:11px;color:var(--tx2);margin-bottom:8px;background:var(--bg3);padding:8px;border-radius:6px">';
  h+='Lihat seluruh kode HTML sistem AJW. Klik <b>Mode Edit</b> untuk edit, lalu <b>Terapkan</b>. Untuk edit per tab, gunakan tombol ✎ di Konfigurasi Tab di bawah.</div>';
  var currentHTML = document.documentElement.outerHTML;
  h+='<div id="HTML-SRC-WRAP">';
  h+='<textarea id="HTML-SRC" class="fi" rows="20" readonly style="font-family:monospace;font-size:11px;line-height:1.5;background:var(--bg4)">'+esc(currentHTML)+'</textarea>';
  h+='</div></div>';
  return h;
}

var htmlEditorLocked = true;
function toggleHTMLEditor(){
  var ta = document.getElementById('HTML-SRC');
  var btn = document.getElementById('HTML-EDIT-BTN');
  var applyBtn = document.getElementById('HTML-APPLY-BTN');
  if(!ta) return;
  htmlEditorLocked = !htmlEditorLocked;
  ta.readOnly = htmlEditorLocked;
  ta.style.background = htmlEditorLocked ? 'var(--bg4)' : '#FFF8E1';
  ta.style.border = htmlEditorLocked ? '' : '2px solid #F57F17';
  if(btn) btn.textContent = htmlEditorLocked ? '✏️ Mode Edit' : '🔒 Kunci';
  if(applyBtn) applyBtn.style.display = htmlEditorLocked ? 'none' : 'inline-block';
  toast(htmlEditorLocked ? 'Editor dikunci' : '⚠️ Mode edit aktif — hati-hati mengedit kode!', htmlEditorLocked ? 'info' : 'warn', 3000);
}

function applyEditedHTML(){
  if(!confirm('Terapkan perubahan HTML? Pastikan kode sudah benar.')) return;
  var newHTML = document.getElementById('HTML-SRC').value;
  var blob = new Blob([newHTML], {type:'text/html;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'AJW_Custom_'+ymd()+'.html';
  a.click();
  toast('HTML berhasil didownload. Buka file tersebut untuk melihat perubahan.', 'success', 5000);
}

/* ====== INJECT NOTIFY — disable auto-send, use manual buttons ====== */
/* Patch eval submit - remove auto notifs */
var _origEvalSubmit = evalSubmit;
evalSubmit = function(){
  if(!evalInfo.nama.trim()){toast('Nama karyawan wajib','error');return}
  if(!evalInfo.tglMulai){toast('Tanggal mulai periode wajib','error');return}
  var f=filItems(),t=totItems();
  if(f<Math.ceil(t*.5)){toast('Isi minimal 50% penilaian','warn');return}
  var fs=fscr(evalScores);
  var sec={};SECS.forEach(function(s){sec[s.key]=avg(evalScores[s.key]||[])});
  curEval={id:Date.now(),type:'eval',info:JSON.parse(JSON.stringify(evalInfo)),scores:JSON.parse(JSON.stringify(evalScores)),fs:fs,grade:grade(fs),cat:cat(fs),secScores:sec,submittedAt:isoNow()};
  evalHistory.unshift(curEval);if(evalHistory.length>500)evalHistory.pop();
  sv('ajw_eval',evalHistory);
  showEvalReportV8(curEval);
  toast('✅ Laporan dibuat! Klik tombol untuk kirim WA / Telegram / Drive.','success',5000);
};

var _origPaySubmit = paySubmit;
paySubmit = function(){
  if(!payInfo.nama.trim()){toast('Nama wajib diisi','error');return}
  if(payInfo.tipe==='Mingguan'&&!payInfo.tglMulai){toast('Tanggal mulai wajib','error');return}
  if(payInfo.tipe==='Bulanan'&&!payInfo.bulan){toast('Bulan wajib diisi','error');return}
  var c=calcPay();
  curPay={id:Date.now(),type:'payroll',info:JSON.parse(JSON.stringify(payInfo)),gajiPokok:c.gajiPokok,lembur:c.lembur,allowance:c.allowance,bonus:c.bonus,kotor:c.kotor,pajak:c.pajak,potAbsen:c.potAbsen,bpjs:c.bpjs,kasbon:c.kasbon,bersih:c.bersih,submittedAt:isoNow()};
  payHistory.unshift(curPay);if(payHistory.length>500)payHistory.pop();
  sv('ajw_pay',payHistory);
  showPaySlipV8(curPay);
  toast('✅ Slip dibuat! Klik tombol untuk kirim WA / Telegram / Drive.','success',5000);
};

function showEvalReportV8(r){
  var cfg=getCfg(),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  var h='<div class="noprint" style="background:var(--bg3);border-radius:var(--r);padding:12px 14px;margin-bottom:12px;border:1px solid var(--bd)">';
  h+='<div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:8px">Kirim Laporan:</div>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="window.open(\'https://wa.me/'+adminWA+'?text=\'+encodeURIComponent(buildEvalCaption(curEval)),\'_blank\')" style="background:#25D366;padding:8px 13px">📱 WA Admin</button>';
  if(r.info.noWA) h+='<button class="btna" onclick="window.open(\'https://wa.me/\'+curEval.info.noWA.replace(/\\D/g,\'\')+\'?text=\'+encodeURIComponent(buildEvalCaption(curEval)),\'_blank\')" style="background:#128C7E;padding:8px 13px">📱 WA Karyawan</button>';
  if(r.info.email) h+='<button class="btna" onclick="window.location.href=\'mailto:\'+curEval.info.email+\'?subject=\'+encodeURIComponent(\'Laporan Penilaian \'+curEval.info.nama)+\'&body=\'+encodeURIComponent(buildEvalCaption(curEval))" style="background:#1565C0;padding:8px 13px">✉️ Email</button>';
  h+='<button class="btna" onclick="syncTelegram(curEval,\'eval\')" style="background:#0088CC;padding:8px 13px">✈️ Telegram</button>';
  h+='<button class="btna" onclick="uploadDriveFull(curEval,\'eval\')" style="background:#0F9D58;padding:8px 13px">☁️ Drive</button>';
  h+='<button class="btna" onclick="genPDF(\'EVAL-RPT\',\'Penilaian_\'+curEval.info.nama)" style="background:#E65100;padding:8px 13px">📄 PDF</button>';
  h+='<button class="btna" onclick="window.print()" style="background:#546E7A;padding:8px 13px">🖨️ Print</button>';
  h+='<button class="btna" onclick="evalInfo=initEI();evalScores=initES();SECS.forEach(function(s){evalCol[s.key]=false});renderEvalForm()" style="background:#0D2E5A;padding:8px 13px">+ Form Baru</button>';
  h+='</div></div>';
  h+=buildEvalHTML(r);
  document.getElementById('V-eval').innerHTML=h;
}

function showPaySlipV8(r){
  var cfg=getCfg(),adminWA=(cfg.adminWA||'6285710597159').replace(/\D/g,'');
  var h='<div class="noprint" style="background:var(--bg3);border-radius:var(--r);padding:12px 14px;margin-bottom:12px;border:1px solid var(--bd)">';
  h+='<div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:8px">Kirim Slip:</div>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="window.open(\'https://wa.me/'+adminWA+'?text=\'+encodeURIComponent(buildPayCaption(curPay)),\'_blank\')" style="background:#25D366;padding:8px 13px">📱 WA Admin</button>';
  if(r.info.noWA) h+='<button class="btna" onclick="window.open(\'https://wa.me/\'+curPay.info.noWA.replace(/\\D/g,\'\')+\'?text=\'+encodeURIComponent(buildPayCaption(curPay)),\'_blank\')" style="background:#128C7E;padding:8px 13px">📱 WA Karyawan</button>';
  h+='<button class="btna" onclick="syncTelegram(curPay,\'payroll\')" style="background:#0088CC;padding:8px 13px">✈️ Telegram</button>';
  h+='<button class="btna" onclick="uploadDriveFull(curPay,\'payroll\')" style="background:#0F9D58;padding:8px 13px">☁️ Drive</button>';
  h+='<button class="btna" onclick="genPDF(\'PAY-RPT\',\'SlipGaji_\'+curPay.info.nama)" style="background:#E65100;padding:8px 13px">📄 PDF</button>';
  h+='<button class="btna" onclick="window.print()" style="background:#546E7A;padding:8px 13px">🖨️ Print</button>';
  h+='<button class="btna" onclick="payInfo=initPI();renderPayrollForm()" style="background:#00838F;padding:8px 13px">+ Slip Baru</button>';
  h+='</div></div>';
  h+=buildPayHTML(r);
  document.getElementById('V-payroll').innerHTML=h;
}
/* Override showEvalReport & showPaySlip */
showEvalReport = showEvalReportV8;
showPaySlip = showPaySlipV8;

/* ====== PATCH ADMIN - inject chatbot + HTML viewer in general tab ====== */
var _origRenderAdminV8 = renderAdmin;
renderAdmin = function(){
  _origRenderAdminV8();
  /* Inject chatbot into general tab */
  if(adminSub === 'general'){
    var adminEl = document.getElementById('V-admin');
    if(adminEl) adminEl.insertAdjacentHTML('beforeend', buildAdminChatbot());
  }
  /* Inject HTML viewer + Google login into tabs panel */
  if(adminSub === 'tabs'){
    var adminEl2 = document.getElementById('V-admin');
    if(adminEl2){
      /* Add HTML viewer at top */
      adminEl2.insertAdjacentHTML('afterbegin', buildHTMLViewer());
    }
  }
  /* Inject Google Login button into integrations */
  if(adminSub === 'integrations'){
    var adminEl3 = document.getElementById('V-admin');
    if(adminEl3){
      var cfg=getCfg();
      var gLoginHTML='<div class="card"><div style="font-size:12px;font-weight:700;color:#4285F4;margin-bottom:7px">🔐 Login Google Drive (OAuth)</div>';
      gLoginHTML+='<div style="background:#E8F0FE;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.7"><b>Cara setup Google OAuth:</b><br>1. Buka <a href="https://console.cloud.google.com" target="_blank" style="color:#4285F4">console.cloud.google.com</a><br>2. Buat project &rarr; Enable Drive API<br>3. Credentials &rarr; OAuth Client ID &rarr; Web App<br>4. Authorized origins: domain kamu (atau http://localhost)<br>5. Copy Client ID ke field di bawah<br><br><b>Atau pakai OAuth Playground</b> (lebih mudah, token 1 jam): <a href="https://developers.google.com/oauthplayground" target="_blank" style="color:#4285F4">link</a></div>';
      gLoginHTML+='<div style="margin-bottom:9px"><label class="lbl">Google OAuth Client ID (untuk Login button)</label><input id="GCID" class="fi" value="'+esc(cfg.googleClientId||'')+'" placeholder="xxxxxx.apps.googleusercontent.com"></div>';
      gLoginHTML+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
      gLoginHTML+='<button class="btnp" onclick="var c=getCfg();c.googleClientId=document.getElementById(\'GCID\').value.trim();saveCfg(c);toast(\'Client ID disimpan\',\'success\')" style="background:#4285F4;padding:9px 14px;font-size:12px">Simpan Client ID</button>';
      gLoginHTML+='<button class="btnp" onclick="googleSignIn(function(token){toast(\'Login OK! Token disimpan.\',\'success\')})" style="background:#34A853;padding:9px 14px;font-size:12px">🔑 Login Google Drive</button>';
      if(cfg.driveToken) gLoginHTML+='<span style="font-size:11px;color:#2E7D32;align-self:center">✅ Token aktif</span>';
      gLoginHTML+='</div></div>';
      adminEl3.insertAdjacentHTML('afterbegin', gLoginHTML);
    }
  }
};

/* ====== NEW TABS: FINANSIAL, OPERASIONAL ====== */
function renderFinansial(){
  var h='<div class="card" style="background:linear-gradient(135deg,#0D2E5A,#1976D2);color:#fff;margin-bottom:12px;padding:14px 18px">';
  h+='<div style="font-size:16px;font-weight:700;color:#FFD700">💵 DIVISI FINANSIAL — AJW</div>';
  h+='<div style="color:#90CAF9;font-size:11px;margin-top:2px">Pantau arus kas, hutang, dan kesehatan keuangan bisnis</div></div>';

  /* Quick stats */
  var totalGaji=payHistory.reduce(function(a,b){return a+b.bersih},0);
  var totalKotor=payHistory.reduce(function(a,b){return a+b.kotor},0);
  var totalPot=payHistory.reduce(function(a,b){return a+(b.pajak+b.potAbsen+b.bpjs)},0);
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:14px">';
  [['Total Gaji Dibayar','Rp '+fmt(totalGaji),'#E8F5E9','#2E7D32'],
   ['Total Kotor (Bruto)','Rp '+fmt(totalKotor),'#DBEAFE','#1565C0'],
   ['Total Potongan','Rp '+fmt(totalPot),'#FFEBEE','#C62828'],
   ['Total Slip',''+payHistory.length+' slip','#E0F7FA','#006064']].forEach(function(x){
    h+='<div class="card" style="padding:13px;border-left:4px solid '+x[3]+'"><div style="font-size:11px;color:var(--tx2);font-weight:700;margin-bottom:4px">'+x[0]+'</div><div style="font-size:18px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div></div>';
  });
  h+='</div>';

  /* Payroll per karyawan summary */
  h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">Rekap Payroll per Karyawan</div>';
  var empSummary={};
  payHistory.forEach(function(d){
    if(!empSummary[d.info.nama]) empSummary[d.info.nama]={count:0,total:0,kotor:0};
    empSummary[d.info.nama].count++;
    empSummary[d.info.nama].total+=d.bersih;
    empSummary[d.info.nama].kotor+=d.kotor;
  });
  if(Object.keys(empSummary).length){
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nama</th><th class="c">Jml Slip</th><th class="c">Total Kotor</th><th class="c">Total Bersih</th><th class="c">Rata-rata</th></tr></thead><tbody>';
    Object.entries(empSummary).sort(function(a,b){return b[1].total-a[1].total}).forEach(function(kv){
      h+='<tr><td style="font-weight:700;color:var(--navy)">'+esc(kv[0])+'</td>';
      h+='<td class="c">'+kv[1].count+'</td>';
      h+='<td class="c">Rp '+fmt(kv[1].kotor)+'</td>';
      h+='<td class="c" style="font-weight:700;color:#2E7D32">Rp '+fmt(kv[1].total)+'</td>';
      h+='<td class="c">Rp '+fmt(kv[1].count?Math.round(kv[1].total/kv[1].count):0)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div style="color:var(--tx3);font-size:12px;padding:14px;text-align:center">Belum ada data payroll</div>';
  h+='</div>';

  /* Financial notes */
  h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">Catatan Keuangan</div>';
  h+='<textarea id="FIN-NOTES" class="fi" rows="5" placeholder="Tulis catatan keuangan, target, dll..." style="margin-bottom:9px">'+esc((getCfg().finNotes||''))+'</textarea>';
  h+='<button class="btnp" onclick="var c=getCfg();c.finNotes=document.getElementById(\'FIN-NOTES\').value;saveCfg(c);toast(\'Disimpan\',\'success\')" style="background:#1565C0;padding:9px 14px;font-size:12px">Simpan Catatan</button></div>';
  document.getElementById('V-finansial').innerHTML=h;
}

function renderOperasional(){
  var h='<div class="card" style="background:linear-gradient(135deg,#E65100,#F57F17);color:#fff;margin-bottom:12px;padding:14px 18px">';
  h+='<div style="font-size:16px;font-weight:700;color:#fff">⚙️ DIVISI OPERASIONAL — AJW</div>';
  h+='<div style="color:rgba(255,255,255,.85);font-size:11px;margin-top:2px">BigSeller, packing, pengiriman, warehouse management</div></div>';

  /* Stats from KPI */
  loadKPI();
  var now=new Date();
  var thisMonth=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var latestKPI=(kpiData.filter(function(d){return d.periode===thisMonth})[0]||{data:{}}).data;
  
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-bottom:14px">';
  [['📦 Total Order',latestKPI.orders||0,'#DBEAFE','#1565C0'],
   ['🚚 Paket Dikirim',latestKPI.shipped||0,'#E8F5E9','#2E7D32'],
   ['↩️ Retur/Komplain',latestKPI.retur||0,'#FFEBEE','#C62828']].forEach(function(x){
    h+='<div class="card" style="padding:13px;border-left:4px solid '+x[3]+';text-align:center"><div style="font-size:11px;color:var(--tx2);font-weight:700;margin-bottom:4px">'+x[0]+'</div><div style="font-size:24px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div></div>';
  });
  h+='</div>';

  /* SOP / Prosedur */
  h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">📋 SOP & Prosedur</div>';
  var sops=[];
  try{sops=JSON.parse(getCfg().sops||'[]')}catch(e){sops=[]}
  if(sops.length){
    sops.forEach(function(sop,i){
      h+='<div style="border:1px solid var(--bd);border-radius:7px;padding:10px;margin-bottom:7px">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">';
      h+='<b style="color:var(--navy)">'+esc(sop.title)+'</b>';
      h+='<button class="btnsm" onclick="var c=getCfg();var s=JSON.parse(c.sops||\'[]\');s.splice('+i+',1);c.sops=JSON.stringify(s);saveCfg(c);renderOperasional()" style="background:#C62828">Hapus</button></div>';
      h+='<div style="font-size:11px;color:var(--tx2);white-space:pre-wrap">'+esc(sop.content)+'</div></div>';
    });
  } else h+='<div style="color:var(--tx3);font-size:12px;margin-bottom:9px">Belum ada SOP. Tambahkan prosedur operasional.</div>';
  h+='<div style="margin-top:9px;border-top:1px solid var(--bd);padding-top:9px">';
  h+='<div class="g2" style="margin-bottom:7px">';
  h+='<div><label class="lbl">Judul SOP</label><input id="SOP-TITLE" class="fi" placeholder="e.g. SOP Packing Joran"></div>';
  h+='<div><label class="lbl">Konten SOP</label><textarea id="SOP-CONTENT" class="fi" rows="3" placeholder="Langkah-langkah..."></textarea></div>';
  h+='</div>';
  h+='<button class="btna" onclick="var c=getCfg();var s=JSON.parse(c.sops||\'[]\');var t=document.getElementById(\'SOP-TITLE\').value.trim();var ct=document.getElementById(\'SOP-CONTENT\').value.trim();if(!t){toast(\'Judul wajib\',\'error\');return}s.push({title:t,content:ct,createdAt:isoNow()});c.sops=JSON.stringify(s);saveCfg(c);toast(\'SOP ditambahkan\',\'success\');renderOperasional()" style="background:#E65100;padding:8px 13px;font-size:12px">+ Tambah SOP</button></div>';
  h+='</div>';

  /* Task list */
  h+='<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">✅ Task / To-Do Operasional</div>';
  var tasks=[];
  try{tasks=JSON.parse(getCfg().opTasks||'[]')}catch(e){tasks=[]}
  if(tasks.length){
    tasks.forEach(function(task,i){
      h+='<div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--bd)">';
      h+='<input type="checkbox"'+(task.done?' checked':'')+' style="width:17px;height:17px;accent-color:var(--teal);flex-shrink:0" onchange="var c=getCfg();var t=JSON.parse(c.opTasks||\'[]\');t['+i+'].done=this.checked;c.opTasks=JSON.stringify(t);saveCfg(c)">';
      h+='<span style="font-size:12px;flex:1;'+(task.done?'text-decoration:line-through;color:var(--tx3)':'')+'">'+(task.priority==='High'?'🔴 ':task.priority==='Med'?'🟡 ':'🟢 ')+esc(task.title)+'</span>';
      h+='<button class="btnsm" onclick="var c=getCfg();var t=JSON.parse(c.opTasks||\'[]\');t.splice('+i+',1);c.opTasks=JSON.stringify(t);saveCfg(c);renderOperasional()" style="background:#C62828">X</button></div>';
    });
  }
  h+='<div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap">';
  h+='<input id="TASK-TITLE" class="fi" type="text" placeholder="Task baru..." style="flex:1">';
  h+='<select id="TASK-PRIO" class="fi" style="width:100px"><option value="Low">🟢 Low</option><option value="Med" selected>🟡 Med</option><option value="High">🔴 High</option></select>';
  h+='<button class="btna" onclick="var c=getCfg();var t=JSON.parse(c.opTasks||\'[]\');var tt=document.getElementById(\'TASK-TITLE\').value.trim();if(!tt){toast(\'Isi task\',\'error\');return}t.push({title:tt,priority:document.getElementById(\'TASK-PRIO\').value,done:false,createdAt:isoNow()});c.opTasks=JSON.stringify(t);saveCfg(c);toast(\'Task ditambahkan\',\'success\');renderOperasional()" style="background:#E65100;padding:8px 12px;font-size:12px">+ Tambah</button></div></div>';
  document.getElementById('V-operasional').innerHTML=h;
}

/* ====== UPDATE SW FOR NEW TABS ====== */
var _origSW = SW;
SW = function(tab){
  _origSW(tab);
  if(tab==='finansial') renderFinansial();
  else if(tab==='operasional') renderOperasional();
};

/* ====== UPDATE buildTabBar for new tabs ====== */
var _origBuildTabBar = buildTabBar;
buildTabBar = function(){
  var c=getCfg(); var tc=c.tabsConfig||{};
  var defs=[
    {id:'dash',lbl:'\uD83C\uDFE0 Dashboard'},
    {id:'eval',lbl:'\uD83D\uDCCB Penilaian'},
    {id:'payroll',lbl:'\uD83D\uDCB0 Payroll'},
    {id:'stats',lbl:'\uD83D\uDCCA Statistik'},
    {id:'emp',lbl:'\uD83D\uDC65 Karyawan'},
    {id:'hist',lbl:'\uD83D\uDCDC Riwayat'},
    {id:'kpi',lbl:'\uD83D\uDCCA KPI Bisnis'},
    {id:'finansial',lbl:'\uD83D\uDCB5 Finansial'},
    {id:'operasional',lbl:'\u2699\uFE0F Operasional'},
    {id:'aichat',lbl:'\uD83E\uDD16 AI Chat'},
    {id:'admin',lbl:'\uD83D\uDD27 Admin'}
  ];
  customTabs.forEach(function(ct){defs.push({id:'ct_'+ct.id,lbl:(ct.icon||'\uD83D\uDCC4')+' '+ct.name})});
  var html='';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl=tc['label_'+d.id]||d.lbl;
    html+='<button class="tab on" id="T-'+d.id+'" onclick="SW(\''+d.id+'\')">'+lbl+'</button>';
  });
  document.getElementById('TABS').innerHTML=html;
};

/* ====== INIT v8 ====== */
initGoogleAuth();
/* Ensure new tab divs exist */
['finansial','operasional'].forEach(function(id){
  if(!document.getElementById('V-'+id)){
    var div=document.createElement('div');div.id='V-'+id;div.style.display='none';
    document.querySelector('.body').appendChild(div);
  }
});
buildTabBar();

/* ============================================================
   AJW ADD-ON: Hutang Supplier + Tali GF + PWA
============================================================ */

/* ====== TALI GF DATA ====== */
var TALI_GF_DATA = [
  {sku:'TALI GF [1 LAKBAN BIRU]-10/0.12MM-1 Lakban Biru',roll:500,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-12/0.15MM-1 Lakban Biru',roll:500,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-15/0.20MM-1 Lakban Biru',roll:500,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-20/0.23MM-1 Lakban Biru',roll:250,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-25/0.25MM-1 Lakban Biru',roll:250,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-30/0.28MM-1 Lakban Biru',roll:250,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-40/0.30MM-1 Lakban Biru',roll:250,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-50/0.35MM-1 Lakban Biru',roll:250,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-60/0.37MM-1 Lakban Biru',roll:100,bungkus:2},
  {sku:'TALI GF [1 LAKBAN BIRU]-70/0.40MM-1 Lakban Biru',roll:100,bungkus:2},
  {sku:'TALI GF [1 LAKBAN BIRU]-80/0.45MM-1 Lakban Biru',roll:100,bungkus:2},
  {sku:'TALI GF [1 LAKBAN BIRU]-100/0.50MM-1 Lakban Biru',roll:100,bungkus:2},
  {sku:'TALI GF [1 LAKBAN BIRU]-120/0.55MM-1 Lakban Biru',roll:50,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-150/0.60MM-1 Lakban Biru',roll:50,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-200/0.65MM-1 Lakban Biru',roll:50,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-250/0.75MM-1 Lakban Biru',roll:50,bungkus:5},
  {sku:'TALI GF [1 LAKBAN BIRU]-300/0.85MM-1 Lakban Biru',roll:20,bungkus:2},
  {sku:'TALI GF [1 LAKBAN BIRU]-400/0.95MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-500/1.00MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-600/1.10MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-700/1.20MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-800/1.30MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-1000/1.40MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-2000/2.00MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-1200/1.50MM-1 Lakban Biru',roll:10,bungkus:1},
  {sku:'TALI GF [1 LAKBAN BIRU]-1500/1.80MM-1 Lakban Biru',roll:10,bungkus:1}
];

var taliQty = {};      /* {skuIndex: {bungkus:'', qtyPesanan:''}} */
var taliGenerated = [];

/* ====== TALI GF TAB ====== */
function renderTaliGF(){
  var h='<div style="background:linear-gradient(135deg,#0D2E5A,#1976D2);color:#fff;padding:14px 18px;border-radius:var(--r);margin-bottom:12px">';
  h+='<div style="font-size:16px;font-weight:700;color:#FFD700">🧵 KALKULATOR TALI GOLDEN FISH</div>';
  h+='<div style="font-size:11px;color:#90CAF9;margin-top:2px">Input bungkus &amp; qty pesanan → hitung total lakban → export template BigSeller</div></div>';

  h+='<div class="card">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;flex-wrap:wrap;gap:7px">';
  h+='<span style="font-size:12px;font-weight:700;color:var(--navy)">Input Qty Pesanan &amp; Bungkus</span>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h+='<button class="btna" onclick="clearTaliQty()" style="background:#546E7A;padding:7px 12px;font-size:11px">🔄 Reset</button>';
  h+='<button class="btnp" onclick="generateTali()" style="background:#00838F;padding:8px 16px;font-size:12px">⚡ Generate &amp; Export Excel</button>';
  h+='</div></div>';
  h+='<div style="overflow-x:auto"><table class="tbl" id="TALI-TABLE">';
  h+='<thead><tr>';
  h+='<th style="min-width:320px;text-align:left">SKU</th>';
  h+='<th class="c" style="width:90px">Roll/Bungkus</th>';
  h+='<th class="c" style="width:90px">1 Bungkus Lakban</th>';
  h+='<th class="c" style="width:120px">Qty Pesanan</th>';
  h+='<th class="c" style="width:90px">Bungkus</th>';
  h+='<th class="c" style="width:100px">Total Lakban</th>';
  h+='</tr></thead><tbody>';

  TALI_GF_DATA.forEach(function(item, i){
    var q = taliQty[i] || {bungkus:'', qtyPesanan:''};
    var bungkusCalc = q.qtyPesanan ? Math.ceil(parseInt(q.qtyPesanan||0) / item.roll) : (q.bungkus?parseInt(q.bungkus):0);
    var totalLakban = bungkusCalc * item.bungkus;
    var hasData = bungkusCalc > 0 || (q.qtyPesanan&&parseInt(q.qtyPesanan)>0);
    h+='<tr style="background:'+(hasData?'#E8F5E9':'')+'"><td style="font-size:11px">'+esc(item.sku)+'</td>';
    h+='<td class="c" style="font-size:11px">'+item.roll+'</td>';
    h+='<td class="c" style="font-size:11px">'+item.bungkus+'</td>';
    h+='<td class="c"><input type="number" min="0" value="'+esc(q.qtyPesanan||'')+'" placeholder="0" class="fi" style="text-align:center;padding:5px;font-size:12px" oninput="taliQty['+i+']=taliQty['+i+']||{};taliQty['+i+'].qtyPesanan=this.value;updateTaliRow('+i+')"></td>';
    h+='<td class="c" style="font-weight:700;color:#1565C0;font-size:13px" id="TALI-BNG-'+i+'">'+(bungkusCalc>0?bungkusCalc:'-')+'</td>';
    h+='<td class="c" style="font-weight:700;color:'+(hasData?'#2E7D32':'var(--tx3)')+';font-size:13px" id="TALI-LKB-'+i+'">'+(hasData?totalLakban:'-')+'</td>';
    h+='</tr>';
  });
  h+='</tbody></table></div>';

  /* Summary */
  var totalLakbanAll = TALI_GF_DATA.reduce(function(sum, item, i){
    var q=taliQty[i]||{};
    var b=q.qtyPesanan?Math.ceil(parseInt(q.qtyPesanan||0)/item.roll):(q.bungkus?parseInt(q.bungkus):0);
    return sum + b * item.bungkus;
  }, 0);
  var activeItems = TALI_GF_DATA.filter(function(item,i){
    var q=taliQty[i]||{};
    var b=q.qtyPesanan?Math.ceil(parseInt(q.qtyPesanan||0)/item.roll):0;
    return b>0;
  }).length;

  h+='<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">';
  h+='<div style="background:#E0F7FA;border-radius:8px;padding:11px 16px;border:2px solid #00838F;flex:1;text-align:center"><div style="font-size:11px;color:#006064;font-weight:700">SKU Aktif</div><div style="font-size:24px;font-weight:700;color:#00838F">'+activeItems+'</div></div>';
  h+='<div style="background:#E8F5E9;border-radius:8px;padding:11px 16px;border:2px solid #2E7D32;flex:1;text-align:center"><div style="font-size:11px;color:#1B5E20;font-weight:700">Total Lakban Dibutuhkan</div><div style="font-size:24px;font-weight:700;color:#2E7D32">'+totalLakbanAll+'</div></div>';
  h+='</div></div>';

  /* Generated output */
  if(taliGenerated.length){
    h+='<div class="card" id="TALI-OUTPUT"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;flex-wrap:wrap;gap:6px">';
    h+='<span style="font-size:12px;font-weight:700;color:var(--navy)">Output Template BigSeller ('+taliGenerated.length+' SKU aktif)</span>';
    h+='<button class="btnp" onclick="exportTaliExcel()" style="background:#2E7D32;padding:8px 14px;font-size:12px">📊 Download Excel BigSeller</button></div>';
    h+='<div style="overflow-x:auto"><table class="tbl">';
    h+='<thead><tr><th>*Nomor SKU</th><th class="c">*Jumlah Penambahan Stok</th><th class="c">Bungkus</th><th class="c">Total Lakban</th><th>Tgl Produksi</th><th>Tgl Kedaluwarsa</th></tr></thead><tbody>';
    taliGenerated.forEach(function(row){
      h+='<tr><td style="font-size:11px">'+esc(row.sku)+'</td><td class="c" style="font-weight:700;color:#2E7D32">'+row.jumlah+'</td><td class="c">'+row.bungkus+'</td><td class="c" style="color:#1565C0;font-weight:700">'+row.totalLakban+'</td><td style="font-size:11px">'+esc(row.tglProduksi||'')+'</td><td style="font-size:11px">'+esc(row.tglKadaluarsa||'')+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
  }

  document.getElementById('V-taligf').innerHTML = h;
}

function updateTaliRow(i){
  var item = TALI_GF_DATA[i];
  var q = taliQty[i]||{};
  var bungkus = q.qtyPesanan ? Math.ceil(parseInt(q.qtyPesanan||0)/item.roll) : 0;
  var total = bungkus * item.bungkus;
  var bEl = document.getElementById('TALI-BNG-'+i);
  var lEl = document.getElementById('TALI-LKB-'+i);
  if(bEl) bEl.textContent = bungkus>0?bungkus:'-';
  if(lEl){ lEl.textContent = bungkus>0?total:'-'; lEl.style.color = bungkus>0?'#2E7D32':'var(--tx3)'; }
  var row = bEl?bEl.closest('tr'):null;
  if(row) row.style.background = bungkus>0?'#E8F5E9':'';
}

function clearTaliQty(){
  taliQty={};taliGenerated=[];renderTaliGF();
}

function generateTali(){
  var today = ymd();
  taliGenerated = [];
  TALI_GF_DATA.forEach(function(item,i){
    var q = taliQty[i]||{};
    var qty = parseInt(q.qtyPesanan||0);
    var bungkus = qty > 0 ? Math.ceil(qty/item.roll) : 0;
    if(bungkus > 0){
      taliGenerated.push({
        sku: item.sku,
        jumlah: qty,
        bungkus: bungkus,
        totalLakban: bungkus * item.bungkus,
        tglProduksi: today,
        tglKadaluarsa: ''
      });
    }
  });
  if(!taliGenerated.length){ toast('Isi qty pesanan minimal 1 SKU','warn'); return; }
  toast('✅ '+taliGenerated.length+' SKU siap export. Klik Download Excel.','success',4000);
  renderTaliGF();
  /* Auto export */
  setTimeout(exportTaliExcel, 600);
}

function exportTaliExcel(){
  if(!taliGenerated.length){ toast('Generate dulu sebelum export','warn'); return; }
  /* Build CSV (compatible with BigSeller import) */
  var headers = ['*Nomor SKU (SKU atau GTIN Wajib Diisi)','*GTIN (SKU atau GTIN Wajib Diisi)','*Jumlah Penambahan Stok','Harga Satuan','Tanggal Produksi','Tanggal Kedaluwarsa'];
  var rows = [headers.join('\t')];
  taliGenerated.forEach(function(row){
    rows.push([row.sku, '', row.jumlah, '', row.tglProduksi||'', row.tglKadaluarsa||''].join('\t'));
  });
  /* Try XLSX generation via base64 if available, else TSV */
  var content = rows.join('\n');
  /* Create proper Excel-compatible CSV */
  var csvRows = [headers.map(function(h){return '"'+h+'"'}).join(',')];
  taliGenerated.forEach(function(row){
    csvRows.push(['"'+row.sku+'"','""','"'+row.jumlah+'"','""','"'+(row.tglProduksi||'')+'"','""'].join(','));
  });
  var csvContent = '\uFEFF' + csvRows.join('\n'); /* BOM for Excel */
  var blob = new Blob([csvContent], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'BigSeller_TambahStok_TaliGF_'+ymd()+'.csv';
  a.click();
  toast('📊 Template BigSeller berhasil diexport!','success',4000);
}

/* ====== HUTANG SUPPLIER ====== */
var supplierHutang = [];

function loadSupplier(){ try{supplierHutang=JSON.parse(localStorage.getItem('ajw_supplier')||'[]')}catch(e){supplierHutang=[]} }
function saveSupplier(){ sv('ajw_supplier', supplierHutang); }

/* Golden Fish nota structure:
   {id, supplierName:'Golden Fish', bulan, tahun, nota:[{tgl,noDok,keterangan,kode,nilaiNetto}], bayar:[{tgl,keterangan,jumlah}], createdAt}
*/

function renderSupplier(){
  loadSupplier();
  var h='';
  /* Header banner - Golden Fish style */
  h+='<div style="background:linear-gradient(135deg,#1A1A2E 0%,#2D3561 100%);padding:16px 20px;border-radius:var(--r);margin-bottom:12px;-webkit-print-color-adjust:exact">';
  h+='<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">';
  h+='<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,215,0,.15);border:3px solid #FFD700;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🐟</div>';
  h+='<div style="flex:1"><div style="color:#FFD700;font-weight:700;font-size:16px;letter-spacing:.5px">HUTANG SUPPLIER — GOLDEN FISH</div>';
  h+='<div style="color:#90CAF9;font-size:11px;margin-top:2px">Kartu Hutang &amp; Rekap Nota Pembelian</div></div>';
  h+='<button class="btnp" onclick="openAddNotaModal()" style="background:#FFD700;color:#1A1A2E;padding:9px 16px;font-size:12px;font-weight:700">+ Tambah Nota</button></div></div>';

  /* Summary cards */
  var totalHutang = 0, totalTerbayar = 0;
  supplierHutang.forEach(function(d){
    var totalNota = (d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0)},0);
    var totalBayar = (d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0)},0);
    totalHutang += totalNota;
    totalTerbayar += totalBayar;
  });
  var totalSaldo = totalHutang - totalTerbayar;

  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:14px">';
  [
    ['Total Pembelian','Rp '+fmt(totalHutang),'#FFEBEE','#C62828'],
    ['Total Terbayar','Rp '+fmt(totalTerbayar),'#E8F5E9','#2E7D32'],
    ['Saldo Hutang','Rp '+fmt(totalSaldo),totalSaldo>0?'#FFF3E0':'#E8F5E9',totalSaldo>0?'#E65100':'#2E7D32'],
    ['Jumlah Nota',''+supplierHutang.length+' nota','#DBEAFE','#1565C0']
  ].forEach(function(x){
    h+='<div class="card" style="padding:13px;border-left:4px solid '+x[3]+';text-align:center">';
    h+='<div style="font-size:11px;color:var(--tx2);font-weight:700;margin-bottom:4px">'+x[0]+'</div>';
    h+='<div style="font-size:18px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div></div>';
  });
  h+='</div>';

  /* Filter by month */
  var months = [];
  var seenM = {};
  supplierHutang.forEach(function(d){
    var k = d.tahun+'-'+(d.bulan||'');
    if(!seenM[k]){ seenM[k]=1; months.push({label:(d.bulan||'')+' '+(d.tahun||''),key:k}); }
  });
  months.sort(function(a,b){return b.key.localeCompare(a.key)});

  /* Main ledger table - Golden Fish style */
  if(supplierHutang.length){
    /* Group by month */
    var byMonth = {};
    supplierHutang.forEach(function(d){
      var k = d.tahun+'-'+(String(d.bulanNum||'').padStart(2,'0'));
      if(!byMonth[k]) byMonth[k] = {label:(d.bulan||'')+' '+(d.tahun||''), items:[]};
      byMonth[k].items.push(d);
    });
    var sortedMonths = Object.keys(byMonth).sort().reverse();

    sortedMonths.forEach(function(mk){
      var grp = byMonth[mk];
      var mTotalNota=0, mTotalBayar=0;
      grp.items.forEach(function(d){
        var tn=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0)},0);
        var tb=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0)},0);
        mTotalNota+=tn; mTotalBayar+=tb;
      });
      var mSaldo = mTotalNota - mTotalBayar;

      h+='<div class="card" style="padding:0;overflow:hidden;margin-bottom:14px">';
      /* Month header */
      h+='<div style="background:#1A237E;color:#fff;padding:8px 14px;display:flex;justify-content:space-between;align-items:center">';
      h+='<span style="font-weight:700;font-size:12px;letter-spacing:.5px">'+esc(grp.label)+'</span>';
      h+='<div style="display:flex;gap:14px;font-size:11px">';
      h+='<span>Nota: <b>Rp '+fmt(mTotalNota)+'</b></span>';
      h+='<span>Bayar: <b style="color:#69F0AE">Rp '+fmt(mTotalBayar)+'</b></span>';
      h+='<span>Saldo: <b style="color:'+(mSaldo>0?'#FFD54F':'#69F0AE')+'">Rp '+fmt(mSaldo)+'</b></span>';
      h+='</div></div>';

      /* Ledger table */
      h+='<div style="overflow-x:auto">';
      h+='<table style="width:100%;border-collapse:collapse;font-size:11px">';
      h+='<thead><tr style="background:#0D2E5A;color:#fff">';
      ['Tanggal','No Dokumen','Keterangan','Kode','Nilai Netto (Rp)','Bayar (Rp)','Saldo (Rp)',''].forEach(function(th){
        h+='<th style="padding:7px 10px;border:1px solid #1D4E8A;white-space:nowrap;text-align:'+(th===''?'center':'left')+'">'+th+'</th>';
      });
      h+='</tr></thead><tbody>';

      grp.items.forEach(function(d, di){
        var oi = supplierHutang.indexOf(d);
        var saldoRun = 0;
        /* Combine and sort all transactions */
        var txns = [];
        (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,bold:false})});
        (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,bold:true})});
        txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'')});
        txns.forEach(function(tx){
          saldoRun = saldoRun + tx.netto - tx.bayar;
          var isSLD = tx.ket&&tx.ket.indexOf('SLD')>=0;
          h+='<tr style="background:'+(tx.bold?'rgba(0,0,0,.04)':'')+(isSLD?'background:#E8F5E9':'')+'">';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;white-space:nowrap">'+esc(tx.tgl||'')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0">'+esc(tx.noDok||'')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;font-weight:'+(tx.bold?'700':'400')+';color:'+(tx.bold?'#1565C0':'inherit')+'">'+esc(tx.ket||'')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;color:var(--tx2)">'+esc(tx.kode||'')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;color:'+(tx.netto>0?'#C62828':'var(--tx3)')+'">'+( tx.netto>0 ? fmt(tx.netto) : '-')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;color:'+(tx.bayar>0?'#2E7D32':'var(--tx3)')+'">'+( tx.bayar>0 ? fmt(tx.bayar) : '-')+'</td>';
          h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;font-weight:700;color:'+(saldoRun>0?'#E65100':'#2E7D32')+'">'+fmt(saldoRun)+'</td>';
          h+='<td style="padding:4px 6px;border:1px solid #E2E8F0;text-align:center"></td>';
          h+='</tr>';
        });
        /* Total row */
        var totalNota=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0)},0);
        var totalBayar2=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0)},0);
        h+='<tr style="background:#0D2E5A"><td colspan="4" style="padding:6px 10px;color:#fff;font-weight:700;border:1px solid #1D4E8A">TOTAL '+esc(d.namaSupplier||'GOLDEN FISH')+' — '+esc(grp.label)+'</td>';
        h+='<td style="padding:6px 10px;color:#FFD700;font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(totalNota)+'</td>';
        h+='<td style="padding:6px 10px;color:#69F0AE;font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(totalBayar2)+'</td>';
        h+='<td style="padding:6px 10px;color:'+(totalNota-totalBayar2>0?'#FFD54F':'#69F0AE')+';font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(totalNota-totalBayar2)+'</td>';
        h+='<td style="padding:4px 6px;border:1px solid #1D4E8A;text-align:center">';
        h+='<button class="btnsm" onclick="openAddBayarModal('+oi+')" style="background:#2E7D32;font-size:9px">+Bayar</button>&nbsp;';
        h+='<button class="btnsm" onclick="genInvoiceSupplier('+oi+')" style="background:#1565C0;font-size:9px">Invoice</button>&nbsp;';
        h+='<button class="btnsm" onclick="if(confirm(\'Hapus?\'))supplierHutang.splice('+oi+',1);saveSupplier();renderSupplier()" style="background:#C62828;font-size:9px">X</button>';
        h+='</td></tr>';
      });
      h+='</tbody></table></div></div>';
    });
  } else {
    h+='<div class="card" style="text-align:center;padding:36px;color:var(--tx3)"><div style="font-size:32px;margin-bottom:8px">🐟</div><div>Belum ada nota supplier. Klik + Tambah Nota.</div></div>';
  }

  h+=buildSupplierModals();
  document.getElementById('V-supplier').innerHTML = h;
}

function buildSupplierModals(){
  var h='';
  /* Add Nota Modal */
  h+='<div id="NOTA-MODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h+='<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:780px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.35)">';
  h+='<div style="background:#1A237E;color:#fff;padding:10px 14px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">';
  h+='<span style="font-weight:700">🐟 Tambah Nota Pembelian Golden Fish</span>';
  h+='<button onclick="document.getElementById(\'NOTA-MODAL\').style.display=\'none\'" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">&times;</button></div>';
  /* Supplier info */
  h+='<div class="g2" style="margin-bottom:10px">';
  h+='<div><label class="lbl">Nama Supplier</label><input id="NM-SUP" class="fi" value="Golden Fish" placeholder="Nama supplier"></div>';
  h+='<div class="g2">';
  h+='<div><label class="lbl">Bulan</label><select id="NM-BLN" class="fi">';
  var MONTHS2=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var nowM=new Date().getMonth();
  MONTHS2.forEach(function(m,i){h+='<option value="'+m+'"'+(i===nowM?' selected':'')+' data-num="'+(i+1)+'">'+m+'</option>'});
  h+='</select></div>';
  h+='<div><label class="lbl">Tahun</label><input id="NM-THN" class="fi" type="number" value="'+new Date().getFullYear()+'"></div>';
  h+='</div></div>';
  h+='<div style="margin-bottom:9px"><label class="lbl">Keterangan / Catatan</label><input id="NM-CAT" class="fi" placeholder="Catatan nota"></div>';
  /* Nota items */
  h+='<div style="border:1px solid var(--bd);border-radius:8px;overflow:hidden;margin-bottom:11px">';
  h+='<div style="background:#0D2E5A;color:#fff;padding:8px 12px;font-size:11px;font-weight:700">ITEM NOTA (STGF / Faktur Pembelian)</div>';
  h+='<div id="NOTA-ITEMS">';
  h+=buildNotaItemRow(0);
  h+='</div>';
  h+='<div style="padding:8px 12px;border-top:1px solid var(--bd)">';
  h+='<button class="btna" onclick="addNotaItemRow()" style="background:#1565C0;padding:6px 12px;font-size:11px">+ Tambah Baris</button></div></div>';
  /* Bayar rows */
  h+='<div style="border:1px solid var(--bd);border-radius:8px;overflow:hidden;margin-bottom:11px">';
  h+='<div style="background:#1B5E20;color:#fff;padding:8px 12px;font-size:11px;font-weight:700">PEMBAYARAN YANG SUDAH DILAKUKAN</div>';
  h+='<div id="BAYAR-ITEMS">';
  h+=buildBayarItemRow(0);
  h+='</div>';
  h+='<div style="padding:8px 12px;border-top:1px solid var(--bd)">';
  h+='<button class="btna" onclick="addBayarItemRow()" style="background:#2E7D32;padding:6px 12px;font-size:11px">+ Tambah Pembayaran</button></div></div>';
  h+='<div style="display:flex;justify-content:flex-end;gap:8px">';
  h+='<button class="btns" onclick="document.getElementById(\'NOTA-MODAL\').style.display=\'none\'">Batal</button>';
  h+='<button class="btnp" onclick="saveNota()" style="background:#1A237E">💾 Simpan Nota</button></div>';
  h+='</div></div>';

  /* Add Bayar Modal */
  h+='<div id="BAYAR-MODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h+='<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.35)">';
  h+='<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)">💳 Tambah Pembayaran</div>';
  h+='<input type="hidden" id="BAYAR-TARGET-IDX" value="">';
  h+='<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Tanggal Bayar</label><input id="BAYAR-TGL" class="fi" type="date" value="'+ymd()+'"></div><div><label class="lbl">Jumlah (Rp)</label><input id="BAYAR-JML" class="fi" type="number" placeholder="0"></div></div>';
  h+='<div style="margin-bottom:12px"><label class="lbl">Keterangan</label><input id="BAYAR-KET" class="fi" placeholder="e.g. BAYAR BCA (8719) 25-2-26"></div>';
  h+='<div style="display:flex;gap:7px;justify-content:flex-end">';
  h+='<button class="btns" onclick="document.getElementById(\'BAYAR-MODAL\').style.display=\'none\'">Batal</button>';
  h+='<button class="btnp" onclick="saveBayar()" style="background:#2E7D32">Simpan Pembayaran</button></div></div></div>';
  return h;
}

var notaItemCount=1, bayarItemCount=1;
function buildNotaItemRow(i){
  var today=ymd();
  return '<div class="g2" style="gap:7px;padding:8px 12px;border-bottom:1px solid var(--bd);align-items:end" id="NI-ROW-'+i+'">'+
    '<div><label class="lbl">Tanggal</label><input id="NI-TGL-'+i+'" class="fi" type="date" value="'+today+'"></div>'+
    '<div><label class="lbl">No Dokumen</label><input id="NI-DOK-'+i+'" class="fi" placeholder="226010044"></div>'+
    '<div><label class="lbl">Keterangan</label><input id="NI-KET-'+i+'" class="fi" placeholder="STGF S.DAMYL PTH,BIRU,MB,HJ"></div>'+
    '<div><label class="lbl">Kode</label><input id="NI-KOD-'+i+'" class="fi" placeholder="DM / 37" style="max-width:100px"></div>'+
    '<div><label class="lbl">Nilai Netto (Rp)</label><input id="NI-NET-'+i+'" class="fi" type="number" placeholder="0"></div>'+
    (i>0?'<div style="align-self:flex-end"><button class="btna" onclick="document.getElementById(\'NI-ROW-'+i+'\').remove()" style="background:#C62828;padding:7px 10px">&times;</button></div>':'<div></div>')+
    '</div>';
}
function buildBayarItemRow(i){
  return '<div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:end" id="BI-ROW-'+i+'">'+
    '<div style="flex:1"><label class="lbl">Tanggal</label><input id="BI-TGL-'+i+'" class="fi" type="date" value="'+ymd()+'"></div>'+
    '<div style="flex:2"><label class="lbl">Keterangan</label><input id="BI-KET-'+i+'" class="fi" placeholder="BAYAR BCA (8719) 25-2-26"></div>'+
    '<div style="flex:1"><label class="lbl">Jumlah (Rp)</label><input id="BI-JML-'+i+'" class="fi" type="number" placeholder="0"></div>'+
    (i>0?'<div style="align-self:flex-end"><button class="btna" onclick="document.getElementById(\'BI-ROW-'+i+'\').remove()" style="background:#C62828;padding:7px 10px">&times;</button></div>':'<div style="width:40px"></div>')+
    '</div>';
}
function addNotaItemRow(){var i=notaItemCount++;document.getElementById('NOTA-ITEMS').insertAdjacentHTML('beforeend',buildNotaItemRow(i))}
function addBayarItemRow(){var i=bayarItemCount++;document.getElementById('BAYAR-ITEMS').insertAdjacentHTML('beforeend',buildBayarItemRow(i))}

function openAddNotaModal(){
  notaItemCount=1; bayarItemCount=1;
  document.getElementById('NOTA-MODAL').style.display='flex';
}
function openAddBayarModal(idx){
  document.getElementById('BAYAR-TARGET-IDX').value=idx;
  document.getElementById('BAYAR-TGL').value=ymd();
  document.getElementById('BAYAR-JML').value='';
  document.getElementById('BAYAR-KET').value='';
  document.getElementById('BAYAR-MODAL').style.display='flex';
}

function saveNota(){
  var nota=[];
  var i=0;
  while(document.getElementById('NI-TGL-'+i)){
    var net=parseFloat(document.getElementById('NI-NET-'+i).value)||0;
    var ket=document.getElementById('NI-KET-'+i).value.trim();
    if(ket||net>0) nota.push({tgl:document.getElementById('NI-TGL-'+i).value,noDok:document.getElementById('NI-DOK-'+i).value.trim(),keterangan:ket,kode:document.getElementById('NI-KOD-'+i).value.trim(),nilaiNetto:net});
    i++;
  }
  var bayar=[];
  var j=0;
  while(document.getElementById('BI-TGL-'+j)){
    var jml=parseFloat(document.getElementById('BI-JML-'+j).value)||0;
    if(jml>0) bayar.push({tgl:document.getElementById('BI-TGL-'+j).value,keterangan:document.getElementById('BI-KET-'+j).value.trim(),jumlah:jml});
    j++;
  }
  if(!nota.length&&!bayar.length){toast('Isi minimal 1 nota atau pembayaran','warn');return}
  var blnEl=document.getElementById('NM-BLN');
  var blnNum=blnEl?blnEl.selectedIndex+1:new Date().getMonth()+1;
  var record={id:Date.now(),namaSupplier:document.getElementById('NM-SUP').value||'Golden Fish',bulan:document.getElementById('NM-BLN').value,bulanNum:blnNum,tahun:parseInt(document.getElementById('NM-THN').value)||new Date().getFullYear(),catatan:document.getElementById('NM-CAT').value.trim(),nota:nota,bayar:bayar,createdAt:isoNow()};
  supplierHutang.unshift(record);saveSupplier();
  document.getElementById('NOTA-MODAL').style.display='none';
  toast('✅ Nota berhasil disimpan!','success');renderSupplier();
}

function saveBayar(){
  var idx=parseInt(document.getElementById('BAYAR-TARGET-IDX').value);
  var jml=parseFloat(document.getElementById('BAYAR-JML').value)||0;
  if(!jml){toast('Isi jumlah bayar','error');return}
  if(!supplierHutang[idx]){toast('Data tidak ditemukan','error');return}
  if(!supplierHutang[idx].bayar) supplierHutang[idx].bayar=[];
  supplierHutang[idx].bayar.push({tgl:document.getElementById('BAYAR-TGL').value,keterangan:document.getElementById('BAYAR-KET').value,jumlah:jml});
  saveSupplier();
  document.getElementById('BAYAR-MODAL').style.display='none';
  toast('✅ Pembayaran disimpan!','success');renderSupplier();
}

function genInvoiceSupplier(idx){
  var d = supplierHutang[idx]; if(!d) return;
  var totalNota=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0)},0);
  var totalBayar=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0)},0);
  var saldo=totalNota-totalBayar;
  var h='<div style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;justify-content:center;align-items:center;padding:20px" id="INV-MODAL" onclick="if(event.target===this)this.remove()">';
  h+='<div style="max-width:700px;width:100%;max-height:92vh;overflow-y:auto">';
  h+='<div style="display:flex;gap:7px;justify-content:flex-end;margin-bottom:9px">';
  h+='<button class="btna" onclick="genPDF(\'INV-CONTENT\',\'Invoice_GoldenFish_'+esc((d.bulan||'')+d.tahun)+'\')" style="background:#E65100;padding:7px 12px">PDF</button>';
  h+='<button class="btna" onclick="window.print()" style="background:#546E7A;padding:7px 11px">Print</button>';
  h+='<button class="btna" onclick="document.getElementById(\'INV-MODAL\').remove()" style="background:#C62828;padding:7px 11px">&times;</button></div>';
  h+='<div id="INV-CONTENT" style="background:#fff;border-radius:10px;overflow:hidden;border:2px solid #1A237E;-webkit-print-color-adjust:exact">';
  /* Invoice header */
  h+='<div style="background:#1A237E;padding:16px 20px;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">';
  h+='<div><div style="font-size:18px;font-weight:700;color:#FFD700">KARTU HUTANG SUPPLIER</div>';
  h+='<div style="color:#90CAF9;font-size:11px">Anton Jaya Wijaya — Anton Pancing</div></div>';
  h+='<div style="text-align:right"><div style="color:#FFD700;font-size:15px;font-weight:700">'+esc(d.namaSupplier||'GOLDEN FISH')+'</div>';
  h+='<div style="color:#fff;font-size:12px">'+esc((d.bulan||'')+' '+(d.tahun||''))+'</div></div></div>';
  /* Meta */
  h+='<div style="background:#EEF4FF;padding:11px 18px;border-bottom:2px solid #1A237E;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">';
  [['Supplier',d.namaSupplier||'Golden Fish'],['Periode',(d.bulan||'')+' '+(d.tahun||'')],['No. Kartu','KH-'+d.id],['Tanggal Cetak',new Date().toLocaleDateString('id-ID')]].forEach(function(x){
    h+='<div><span style="color:#546E7A">'+x[0]+': </span><b style="color:#0D2E5A">'+esc(x[1])+'</b></div>';
  });
  h+='</div>';
  /* Ledger */
  h+='<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:#0D2E5A;color:#fff">';
  ['Tanggal','No Dokumen','Keterangan','Kode','Nilai Netto','Bayar','Saldo'].forEach(function(th){h+='<th style="padding:7px 10px;border:1px solid #1D4E8A;text-align:'+(th==='Nilai Netto'||th==='Bayar'||th==='Saldo'?'right':'left')+'">'+th+'</th>'});
  h+='</tr></thead><tbody>';
  var saldoRun=0;
  var txns=[];
  (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,bold:false})});
  (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,bold:true})});
  txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'')});
  txns.forEach(function(tx,ti){
    saldoRun=saldoRun+tx.netto-tx.bayar;
    h+='<tr style="background:'+(ti%2?'#F8FAFC':'#fff')+'">';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0">'+esc(tx.tgl||'')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0">'+esc(tx.noDok||'')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;font-weight:'+(tx.bold?'700':'400')+';color:'+(tx.bold?'#1565C0':'inherit')+'">'+esc(tx.ket||'')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;color:#546E7A">'+esc(tx.kode||'')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;color:'+(tx.netto>0?'#C62828':'#90A4AE')+'">'+( tx.netto>0?fmt(tx.netto):'-')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;color:'+(tx.bayar>0?'#2E7D32':'#90A4AE')+'">'+( tx.bayar>0?fmt(tx.bayar):'-')+'</td>';
    h+='<td style="padding:6px 10px;border:1px solid #E2E8F0;text-align:right;font-weight:700;color:'+(saldoRun>0?'#E65100':'#2E7D32')+'">'+fmt(saldoRun)+'</td></tr>';
  });
  h+='</tbody><tfoot><tr style="background:#0D2E5A">';
  h+='<td colspan="4" style="padding:7px 10px;color:#fff;font-weight:700;border:1px solid #1D4E8A">TOTAL</td>';
  h+='<td style="padding:7px 10px;color:#FFD700;font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(totalNota)+'</td>';
  h+='<td style="padding:7px 10px;color:#69F0AE;font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(totalBayar)+'</td>';
  h+='<td style="padding:7px 10px;color:'+(saldo>0?'#FFD54F':'#69F0AE')+';font-weight:700;text-align:right;border:1px solid #1D4E8A">'+fmt(saldo)+'</td></tr></tfoot></table>';
  /* Status */
  h+='<div style="padding:12px 18px;background:'+(saldo<=0?'#E8F5E9':'#FFF3E0')+';border-top:3px solid '+(saldo<=0?'#2E7D32':'#E65100')+';text-align:center">';
  h+='<div style="font-size:14px;font-weight:700;color:'+(saldo<=0?'#2E7D32':'#E65100')+'">'+(saldo<=0?'✅ LUNAS':'⏳ SISA HUTANG: Rp '+fmt(saldo))+'</div></div>';
  h+='<div style="background:#0D2E5A;padding:7px 18px;display:flex;justify-content:space-between;font-size:9px;color:#90CAF9">';
  h+='<span>Anton Jaya Wijaya — Kartu Hutang Supplier</span><span>Dicetak: '+new Date().toLocaleDateString('id-ID')+'</span></div>';
  h+='</div></div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
}

/* ====== PATCH SW & CORE_TABS & buildTabBar ====== */
var _origSW2 = SW;
SW = function(tab){
  _origSW2(tab);
  if(tab==='supplier') renderSupplier();
  else if(tab==='taligf') renderTaliGF();
};

var _origBTB2 = buildTabBar;
buildTabBar = function(){
  var c=getCfg(); var tc=c.tabsConfig||{};
  var defs=[
    {id:'dash',lbl:'\uD83C\uDFE0 Dashboard'},
    {id:'eval',lbl:'\uD83D\uDCCB Penilaian'},
    {id:'payroll',lbl:'\uD83D\uDCB0 Payroll'},
    {id:'stats',lbl:'\uD83D\uDCCA Statistik'},
    {id:'emp',lbl:'\uD83D\uDC65 Karyawan'},
    {id:'hist',lbl:'\uD83D\uDCDC Riwayat'},
    {id:'kpi',lbl:'\uD83D\uDCCA KPI Bisnis'},
    {id:'finansial',lbl:'\uD83D\uDCB5 Finansial'},
    {id:'operasional',lbl:'\u2699\uFE0F Operasional'},
    {id:'supplier',lbl:'\uD83D\uDC1F Hutang Supplier'},
    {id:'taligf',lbl:'\uD83E\uDDF5 Tali GF'},
    {id:'aichat',lbl:'\uD83E\uDD16 AI Chat'},
    {id:'admin',lbl:'\uD83D\uDD27 Admin'}
  ];
  customTabs.forEach(function(ct){defs.push({id:'ct_'+ct.id,lbl:(ct.icon||'\uD83D\uDCC4')+' '+ct.name})});
  var html='';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl=tc['label_'+d.id]||d.lbl;
    html+='<button class="tab on" id="T-'+d.id+'" onclick="SW(\''+d.id+'\')">'+lbl+'</button>';
  });
  document.getElementById('TABS').innerHTML=html;
};

/* ====== PWA SERVICE WORKER & INSTALL ====== */
var pwaInstallPrompt = null;

window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  pwaInstallPrompt = e;
  var btn = document.getElementById('PWA-INSTALL-BTN');
  if(btn) btn.style.display='flex';
});

window.addEventListener('appinstalled', function(){
  toast('\u2705 Aplikasi AJW berhasil diinstall!','success',5000);
  pwaInstallPrompt=null;
  var btn=document.getElementById('PWA-INSTALL-BTN');
  if(btn) btn.style.display='none';
});

function triggerPWAInstall(){
  if(pwaInstallPrompt){
    pwaInstallPrompt.prompt();
    pwaInstallPrompt.userChoice.then(function(result){
      if(result.outcome==='accepted') toast('\u2705 Instalasi berhasil!','success');
      else toast('Instalasi dibatalkan','info');
      pwaInstallPrompt=null;
    });
  } else {
    var ua=navigator.userAgent;
    if(/iPhone|iPad/i.test(ua)){
      alert('Di iOS Safari: ketuk ikon Share (\u2191) \u2192 "Add to Home Screen" \u2192 Add\n\nAplikasi AJW akan muncul di layar utama iPhone/iPad kamu.');
    } else if(/Android/i.test(ua)){
      alert('Di Android Chrome: ketuk menu (\u22ee) \u2192 "Add to Home Screen"\n\nAtau cek notifikasi install di bagian bawah browser.');
    } else {
      alert('Di Desktop Chrome/Edge: cari ikon install (\u2295) di address bar.\n\nAtau ketuk menu \u22ee \u2192 "Install AJW Sistem"');
    }
  }
}

/* ====== INIT ADDON ====== */
loadSupplier();
/* Ensure new tab divs */
['supplier','taligf'].forEach(function(id){
  if(!document.getElementById('V-'+id)){
    var div=document.createElement('div');div.id='V-'+id;div.style.display='none';
    document.querySelector('.body').appendChild(div);
  }
});
buildTabBar();

/* ============================================================
   SUPABASE INTEGRATION — AJW v8 FINAL
   Simpan ke setiap tabel terpisah, sync 2 arah, auto-sync
============================================================ */

var SB = {
  url: '', key: '', ready: false,

  init: function(){
    var cfg = getCfg();
    this.url = (cfg.supabaseUrl || '').replace(/\/$/, '');
    this.key = cfg.supabaseKey || '';
    this.ready = !!(this.url && this.key);
    return this.ready;
  },

  hdr: function(extra){
    return Object.assign({
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': 'Bearer ' + this.key
    }, extra || {});
  },

  upsertMany: function(table, records){
    if(!records || !records.length) return Promise.resolve({ok:true});
    return fetch(this.url + '/rest/v1/' + table, {
      method: 'POST',
      headers: this.hdr({'Prefer': 'resolution=merge-duplicates,return=minimal'}),
      body: JSON.stringify(records)
    }).then(function(r){
      if(r.ok || r.status === 201 || r.status === 204) return {ok:true};
      return r.text().then(function(t){ throw new Error(table+': '+t); });
    });
  },

  getAll: function(table, order){
    var url = this.url + '/rest/v1/' + table + '?select=*';
    if(order) url += '&order=' + order;
    return fetch(url, {
      method: 'GET',
      headers: {'apikey': this.key, 'Authorization': 'Bearer ' + this.key}
    }).then(function(r){
      if(r.ok) return r.json();
      return r.text().then(function(t){ throw new Error(table+': '+t); });
    });
  },

  test: function(){
    if(!this.init()) return Promise.reject(new Error('Belum dikonfigurasi'));
    return fetch(this.url + '/rest/v1/ajw_employees?select=id&limit=1', {
      headers: {'apikey': this.key, 'Authorization': 'Bearer ' + this.key}
    }).then(function(r){
      if(r.ok) return {ok:true};
      return r.text().then(function(t){ throw new Error(t); });
    });
  }
};

/* ── SYNC ALL DATA → SUPABASE ── */
function syncAllToSupabase(silent){
  if(!SB.init()){
    toast('Supabase belum dikonfigurasi di Admin → Data & Backup', 'error');
    return Promise.reject('not configured');
  }
  if(!silent) toast('Menyinkronkan ke Supabase...', 'info', 8000);

  var tasks = [];

  /* Employees */
  if(employees.length){
    tasks.push(SB.upsertMany('ajw_employees',
      employees.map(function(e){ return {id: e.id, data: e}; })
    ).catch(function(e){ console.warn('emp sync:', e); }));
  }

  /* Evaluasi */
  if(evalHistory.length){
    tasks.push(SB.upsertMany('ajw_eval',
      evalHistory.map(function(e){ return {
        id: e.id, data: e,
        nama: e.info.nama || '',
        periode_mulai: e.info.tglMulai || '',
        grade: e.grade || '',
        nilai: e.fs || 0
      }; })
    ).catch(function(e){ console.warn('eval sync:', e); }));
  }

  /* Payroll */
  if(payHistory.length){
    tasks.push(SB.upsertMany('ajw_payroll',
      payHistory.map(function(p){
        var pl = '';
        try{ pl = typeof periodeLabel === 'function' ? periodeLabel(p.info) : (p.info.bulan || ''); }catch(e){}
        return {id: p.id, data: p, nama: p.info.nama || '', periode: pl, gaji_bersih: p.bersih || 0};
      })
    ).catch(function(e){ console.warn('pay sync:', e); }));
  }

  /* KPI */
  if(typeof kpiData !== 'undefined' && kpiData && kpiData.length){
    tasks.push(SB.upsertMany('ajw_kpi',
      kpiData.map(function(k){ return {periode: k.periode, data: k}; })
    ).catch(function(e){ console.warn('kpi sync:', e); }));
  }

  /* Supplier */
  if(typeof supplierHutang !== 'undefined' && supplierHutang && supplierHutang.length){
    tasks.push(SB.upsertMany('ajw_supplier',
      supplierHutang.map(function(s){ return {
        id: s.id, data: s,
        nama_supplier: s.namaSupplier || 'Golden Fish',
        bulan: s.bulan || '', tahun: s.tahun || 0
      }; })
    ).catch(function(e){ console.warn('supplier sync:', e); }));
  }

  /* Config (tabs, settings) */
  var cfg = getCfg();
  tasks.push(SB.upsertMany('ajw_config', [
    {key: 'tabs', value: {data: typeof customTabs !== 'undefined' ? customTabs : []}},
    {key: 'cfg_safe', value: {adminName: cfg.adminName, adminWA: cfg.adminWA, sysTitle: cfg.sysTitle,
      evalTpl: cfg.evalTpl, payTpl: cfg.payTpl, theme: cfg.theme, tabsConfig: cfg.tabsConfig}}
  ]).catch(function(e){ console.warn('config sync:', e); }));

  return Promise.all(tasks).then(function(){
    var c = getCfg();
    c.lastSupabaseSync = new Date().toISOString();
    saveCfg(c);
    if(!silent) toast('✅ Semua data berhasil disinkronkan ke Supabase!', 'success', 5000);
    var el = document.getElementById('SB-SYNC-STATUS');
    if(el) el.textContent = '✅ Terakhir sync: ' + new Date().toLocaleString('id-ID');
    return {ok: true};
  }).catch(function(err){
    if(!silent) toast('❌ Supabase error: ' + (err.message || err), 'error', 6000);
    throw err;
  });
}

/* ── LOAD ALL DATA ← SUPABASE ── */
function loadFromSupabase(){
  if(!SB.init()){
    toast('Supabase belum dikonfigurasi', 'error');
    return;
  }
  toast('Memuat data dari Supabase...', 'info', 6000);

  Promise.all([
    SB.getAll('ajw_employees', 'id.desc'),
    SB.getAll('ajw_eval', 'id.desc'),
    SB.getAll('ajw_payroll', 'id.desc'),
    SB.getAll('ajw_kpi', 'periode.desc'),
    SB.getAll('ajw_supplier', 'id.desc')
  ]).then(function(results){
    var changed = false;

    if(results[0] && results[0].length){
      employees = results[0].map(function(r){ return r.data; });
      sv('ajw_emp', employees); changed = true;
    }
    if(results[1] && results[1].length){
      evalHistory = results[1].map(function(r){ return r.data; });
      sv('ajw_eval', evalHistory); changed = true;
    }
    if(results[2] && results[2].length){
      payHistory = results[2].map(function(r){ return r.data; });
      sv('ajw_pay', payHistory); changed = true;
    }
    if(results[3] && results[3].length){
      kpiData = results[3].map(function(r){ return r.data; });
      sv('ajw_kpi', kpiData); changed = true;
    }
    if(results[4] && results[4].length){
      supplierHutang = results[4].map(function(r){ return r.data; });
      sv('ajw_supplier', supplierHutang); changed = true;
    }

    toast('✅ Data berhasil dimuat dari Supabase!', 'success', 4000);
    var el = document.getElementById('SB-SYNC-STATUS');
    if(el) el.textContent = '✅ Load dari Supabase: ' + new Date().toLocaleString('id-ID');
    if(changed) renderDash();
  }).catch(function(err){
    toast('❌ Gagal load dari Supabase: ' + (err.message || err), 'error', 6000);
    console.error('loadFromSupabase error:', err);
  });
}

/* ── SQL TEMPLATE ── */
var AJW_SQL = "-- Jalankan di Supabase SQL Editor (New query → paste → Run)\n\nCREATE TABLE IF NOT EXISTS ajw_employees (id BIGINT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_eval (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode_mulai TEXT, grade TEXT, nilai NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_payroll (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode TEXT, gaji_bersih NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_kpi (id BIGSERIAL PRIMARY KEY, periode TEXT UNIQUE NOT NULL, data JSONB NOT NULL);\nCREATE TABLE IF NOT EXISTS ajw_supplier (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama_supplier TEXT, bulan TEXT, tahun INT);\nCREATE TABLE IF NOT EXISTS ajw_config (key TEXT PRIMARY KEY, value JSONB NOT NULL);\n\nALTER TABLE ajw_employees ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_eval ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_payroll ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_kpi ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_supplier ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_config ENABLE ROW LEVEL SECURITY;\n\nDROP POLICY IF EXISTS open_access ON ajw_employees;\nDROP POLICY IF EXISTS open_access ON ajw_eval;\nDROP POLICY IF EXISTS open_access ON ajw_payroll;\nDROP POLICY IF EXISTS open_access ON ajw_kpi;\nDROP POLICY IF EXISTS open_access ON ajw_supplier;\nDROP POLICY IF EXISTS open_access ON ajw_config;\n\nCREATE POLICY open_access ON ajw_employees FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_eval FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_payroll FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_kpi FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_supplier FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_config FOR ALL TO anon USING (true) WITH CHECK (true);";

/* ── SUPABASE PANEL (injected into Admin Data & Backup) ── */
function buildSupabasePanel(){
  var cfg = getCfg();
  var connected = !!(cfg.supabaseUrl && cfg.supabaseKey);
  var lastSync = cfg.lastSupabaseSync
    ? '✅ Terakhir sync: ' + new Date(cfg.lastSupabaseSync).toLocaleString('id-ID')
    : 'Belum pernah sync';

  var h = '<div class="card" style="border:2px solid '+(connected?'#1A73E8':'var(--bd)')+';">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:7px">';
  h += '<div style="font-size:13px;font-weight:700;color:#1A73E8">☁️ Supabase Database (Cloud Sync)</div>';
  h += '<span class="chip" style="background:'+(connected?'#E8F5E9':'#FFEBEE')+';color:'+(connected?'#2E7D32':'#C62828')+'">'+(connected?'✅ Terhubung':'⚠️ Belum dikonfigurasi')+'</span>';
  h += '</div>';

  if(!connected){
    h += '<div style="background:#E8F0FE;border-radius:7px;padding:10px 13px;margin-bottom:10px;font-size:11px;line-height:1.9">';
    h += '<b style="color:#1A73E8">Cara setup (5 menit, gratis):</b><br>';
    h += '1. Buka <a href="https://supabase.com" target="_blank" style="color:#1A73E8;font-weight:700">supabase.com</a> → Sign Up → New Project<br>';
    h += '2. Tunggu ~1 menit selesai → Settings → API<br>';
    h += '3. Copy <b>Project URL</b> dan <b>anon/public key</b><br>';
    h += '4. Isi form di bawah → klik Simpan<br>';
    h += '5. Klik <b>Setup SQL Tabel</b> → paste SQL → Run di Supabase<br>';
    h += '6. Klik <b>Sync ke Supabase</b> → selesai!';
    h += '</div>';
  }

  h += '<div class="g2" style="margin-bottom:9px">';
  h += '<div><label class="lbl">Supabase Project URL</label><input id="SB-URL" class="fi" value="'+esc(cfg.supabaseUrl||'')+'" placeholder="https://xxxx.supabase.co"></div>';
  h += '<div><label class="lbl">Supabase Anon Key</label><input id="SB-KEY" class="fi" type="password" value="'+esc(cfg.supabaseKey||'')+'" placeholder="eyJhb..."></div>';
  h += '</div>';

  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<input type="checkbox" id="SB-AUTO" style="width:17px;height:17px;accent-color:#1A73E8" '+(cfg.supabaseAutoSync?' checked':'')+' onchange="var c=getCfg();c.supabaseAutoSync=this.checked;saveCfg(c);toast(this.checked?\'Auto-sync aktif — data tersimpan cloud otomatis\':\'Auto-sync dinonaktifkan\',\'info\')">';
  h += '<label for="SB-AUTO" style="font-size:12px;cursor:pointer">Auto-sync ke Supabase setiap ada perubahan data</label>';
  h += '</div>';

  h += '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">';
  h += '<button class="btnp" onclick="var c=getCfg();c.supabaseUrl=document.getElementById(\'SB-URL\').value.trim();c.supabaseKey=document.getElementById(\'SB-KEY\').value.trim();saveCfg(c);toast(\'Config disimpan!\',\'success\');renderAdmin();" style="background:#1A73E8;padding:9px 14px;font-size:12px">💾 Simpan Config</button>';
  h += '<button class="btna" onclick="SB.init();SB.test().then(function(){toast(\'✅ Koneksi Supabase berhasil!\',\'success\')}).catch(function(e){toast(\'❌ Gagal: \'+e.message,\'error\')})" style="background:#546E7A;padding:9px 13px;font-size:12px">Test Koneksi</button>';
  h += '<button class="btna" onclick="syncAllToSupabase()" style="background:#0F9D58;padding:9px 13px;font-size:12px">☁ Sync Sekarang</button>';
  h += '<button class="btna" onclick="loadFromSupabase()" style="background:#1565C0;padding:9px 13px;font-size:12px">⬇ Load dari Cloud</button>';
  h += '<button class="btna" onclick="showSQLModal()" style="background:#6A1B9A;padding:9px 13px;font-size:12px">📋 Setup SQL Tabel</button>';
  h += '</div>';

  h += '<div id="SB-SYNC-STATUS" style="font-size:11px;color:var(--tx2);padding:6px 9px;background:var(--bg3);border-radius:6px">'+lastSync+'</div>';
  h += '</div>';
  return h;
}

function showSQLModal(){
  var existing = document.getElementById('SQL-MODAL');
  if(existing) existing.remove();

  var h = '<div id="SQL-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.remove()">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  h += '<span style="font-size:13px;font-weight:700;color:var(--navy)">📋 SQL Setup — Paste di Supabase SQL Editor</span>';
  h += '<div style="display:flex;gap:6px">';
  h += '<button class="btna" onclick="navigator.clipboard.writeText(AJW_SQL).then(function(){toast(\'SQL berhasil dicopy!\',\'success\',2000)})" style="background:#2E7D32;padding:7px 12px;font-size:11px">📋 Copy SQL</button>';
  h += '<button onclick="document.getElementById(\'SQL-MODAL\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--tx2)">&times;</button>';
  h += '</div></div>';
  h += '<pre style="background:#1A1A2E;color:#E8ECF4;border-radius:8px;padding:14px;font-size:11px;line-height:1.7;overflow-x:auto;white-space:pre-wrap;font-family:monospace">'+esc(AJW_SQL)+'</pre>';
  h += '<div style="margin-top:11px;background:#E8F0FE;border-radius:7px;padding:10px 13px;font-size:11px;line-height:1.8">';
  h += '<b>Cara jalankan SQL:</b><br>';
  h += '1. Login <a href="https://supabase.com" target="_blank" style="color:#1A73E8">supabase.com</a> → buka project kamu<br>';
  h += '2. Klik menu <b>SQL Editor</b> di sidebar kiri<br>';
  h += '3. Klik <b>New query</b><br>';
  h += '4. Paste SQL di atas → klik tombol <b style="color:#2E7D32">Run</b> (pojok kanan bawah)<br>';
  h += '5. Kembali ke AJW → klik <b>Sync Sekarang</b>';
  h += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', h);
}

/* ── AUTO-SYNC: patch sv() ── */
var _sbOrigSv = sv;
sv = function(key, val){
  _sbOrigSv(key, val);
  var cfg = getCfg();
  if(cfg.supabaseAutoSync && cfg.supabaseUrl && cfg.supabaseKey){
    if(window._sbTimer) clearTimeout(window._sbTimer);
    window._sbTimer = setTimeout(function(){
      syncAllToSupabase(true);
    }, 4000);
  }
};

/* ── INJECT PANEL INTO ADMIN (Data & Backup tab) ── */
var _adminOrigForSB = renderAdmin;
renderAdmin = function(){
  _adminOrigForSB();
  if(adminSub === 'data'){
    var el = document.getElementById('V-admin');
    if(el){
      var firstCard = el.querySelector('.card');
      if(firstCard) firstCard.insertAdjacentHTML('beforebegin', buildSupabasePanel());
      else el.insertAdjacentHTML('afterbegin', buildSupabasePanel());
    }
  }
};

/* ── AUTO-LOAD on startup if configured ── */
(function(){
  var cfg = getCfg();
  if(cfg.supabaseUrl && cfg.supabaseKey && cfg.supabaseAutoSync){
    setTimeout(function(){ loadFromSupabase(); }, 2500);
  }
})();

/* ============================================================
   AJW ADMIN PATCH — Rapih, Efisien + Supabase Real-time Sync
============================================================ */

/* ====== CONFIRM + DELETE + SUPABASE SYNC HELPERS ====== */

function confirmDelete(msg, onYes){
  /* Custom confirm modal (lebih rapih dari browser default) */
  var existing = document.getElementById('CONFIRM-MODAL');
  if(existing) existing.remove();
  var h = '<div id="CONFIRM-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;justify-content:center;align-items:center;padding:20px">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:22px;max-width:380px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.35);border-top:4px solid #C62828">';
  h += '<div style="font-size:18px;margin-bottom:10px">&#128465;</div>';
  h += '<div style="font-size:14px;font-weight:700;color:var(--tx);margin-bottom:8px">Konfirmasi Hapus</div>';
  h += '<div style="font-size:13px;color:var(--tx2);margin-bottom:18px;line-height:1.5">'+msg+'</div>';
  h += '<div style="display:flex;gap:9px;justify-content:flex-end">';
  h += '<button class="btns" onclick="document.getElementById(\'CONFIRM-MODAL\').remove()" style="padding:9px 18px">Batal</button>';
  h += '<button class="btnp" id="CONFIRM-YES-BTN" style="background:#C62828;padding:9px 18px">Ya, Hapus</button>';
  h += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', h);
  document.getElementById('CONFIRM-YES-BTN').onclick = function(){
    document.getElementById('CONFIRM-MODAL').remove();
    onYes();
  };
}

/* Delete + Supabase delete helper */
function sbDeleteRecord(table, id){
  var cfg = getCfg();
  if(cfg.supabaseUrl && cfg.supabaseKey){
    fetch(cfg.supabaseUrl+'/rest/v1/'+table+'?id=eq.'+id, {
      method: 'DELETE',
      headers: {'apikey': cfg.supabaseKey, 'Authorization': 'Bearer '+cfg.supabaseKey}
    }).then(function(r){
      if(r.ok) toast('&#9729; Supabase: record dihapus', 'success', 2000);
    }).catch(function(){});
  }
}

/* Patch delEmp with confirm + supabase */
var _origDelEmp = delEmp;
delEmp = function(idx){
  var e = employees[idx];
  if(!e) return;
  confirmDelete('Hapus karyawan <b>'+esc(e.nama)+'</b>?<br><small style="color:var(--tx3)">Data tidak bisa dikembalikan.</small>', function(){
    sbDeleteRecord('ajw_employees', e.id);
    employees.splice(idx, 1);
    sv('ajw_emp', employees);
    toast('Karyawan dihapus', 'warn');
    renderEmp();
  });
};

/* Patch eval/pay/supplier delete from renderHist - override with safe versions */
function deleteEvalRecord(id){
  confirmDelete('Hapus laporan penilaian ini?', function(){
    sbDeleteRecord('ajw_eval', id);
    evalHistory = evalHistory.filter(function(d){ return d.id !== id; });
    sv('ajw_eval', evalHistory);
    toast('Penilaian dihapus', 'warn');
    renderHist();
  });
}
function deletePayRecord(id){
  confirmDelete('Hapus slip gaji ini?', function(){
    sbDeleteRecord('ajw_payroll', id);
    payHistory = payHistory.filter(function(d){ return d.id !== id; });
    sv('ajw_pay', payHistory);
    toast('Slip gaji dihapus', 'warn');
    renderHist();
  });
}
function deleteSupplierRecord(idx){
  var s = supplierHutang[idx];
  confirmDelete('Hapus nota supplier <b>'+esc((s&&s.namaSupplier)||'ini')+'</b>?', function(){
    if(s) sbDeleteRecord('ajw_supplier', s.id);
    supplierHutang.splice(idx,1);
    saveSupplier();
    toast('Nota dihapus', 'warn');
    renderSupplier();
  });
}

/* Patch renderHist to use safe delete functions */
var _origRenderHist = renderHist;
renderHist = function(){
  _origRenderHist();
  /* Replace inline delete buttons with safe versions */
  var el = document.getElementById('V-hist');
  if(!el) return;
  var html = el.innerHTML;
  /* The X buttons in renderHist use inline onclick with evalHistory.filter */
  /* We patch them post-render by finding all X buttons and replacing onclick */
  var btns = el.querySelectorAll('button.btnsm[style*="C62828"]');
  btns.forEach(function(btn){
    var onclick = btn.getAttribute('onclick') || '';
    if(onclick.indexOf('evalHistory') >= 0){
      var idMatch = onclick.match(/d\.id!==(\d+)/);
      if(idMatch){
        var id = parseInt(idMatch[1]);
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function(){ deleteEvalRecord(id); });
      }
    } else if(onclick.indexOf('payHistory') >= 0){
      var idMatch2 = onclick.match(/d\.id!==(\d+)/);
      if(idMatch2){
        var id2 = parseInt(idMatch2[1]);
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function(){ deletePayRecord(id2); });
      }
    }
  });
};

/* Supabase real-time: when any data changes, sync immediately (not just after 4s) */
var _sbFastSv = sv;
sv = function(key, val){
  _sbFastSv(key, val);
  /* Only sync data tables, not config */
  var dataTables = {'ajw_emp':true,'ajw_eval':true,'ajw_pay':true,'ajw_kpi':true,'ajw_supplier':true};
  if(!dataTables[key]) return;
  var cfg = getCfg();
  if(!cfg.supabaseAutoSync || !cfg.supabaseUrl || !cfg.supabaseKey) return;
  if(window._sbFastTimer) clearTimeout(window._sbFastTimer);
  window._sbFastTimer = setTimeout(function(){
    syncAllToSupabase(true);
  }, 1500);
};

/* ====== REDESIGNED ADMIN PANEL ====== */
var adminSub = 'general';

renderAdmin = function(){
  var cfg = getCfg();
  var sbConnected = !!(cfg.supabaseUrl && cfg.supabaseKey);
  var lastSync = cfg.lastSupabaseSync
    ? new Date(cfg.lastSupabaseSync).toLocaleString('id-ID')
    : null;

  /* ── SUB-TAB CONFIG ── */
  var subs = [
    {id:'general', icon:'&#9881;', label:'Umum & Tema'},
    {id:'integrations', icon:'&#128279;', label:'Integrasi & API'},
    {id:'templates', icon:'&#128203;', label:'Template WA'},
    {id:'tabs', icon:'&#128195;', label:'Tab & HTML'},
    {id:'data', icon:'&#9729;', label:'Data & Backup'}
  ];

  var h = '<div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">';
  /* Sub-tab bar */
  h += '<div style="display:flex;border-bottom:1px solid var(--bd);background:var(--bg3);overflow-x:auto;scrollbar-width:none">';
  subs.forEach(function(s){
    var active = (adminSub === s.id);
    h += '<button onclick="adminSub=\''+s.id+'\';renderAdmin()" style="padding:10px 16px;border:none;cursor:pointer;font-size:11px;font-weight:700;font-family:Arial;white-space:nowrap;border-bottom:2px solid '+(active?'var(--blue)':'transparent')+';background:'+(active?'var(--bg2)':'transparent')+';color:'+(active?'var(--blue)':'var(--tx2)')+'">';
    h += s.icon+' '+s.label+'</button>';
  });
  h += '</div>';

  /* ── Status bar ── */
  h += '<div style="padding:7px 14px;background:'+(sbConnected?'#E8F5E9':'#FFEBEE')+';display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:11px">';
  h += '<div style="display:flex;align-items:center;gap:7px"><span>'+(sbConnected?'&#9989;':'&#9888;')+'</span><span style="color:'+(sbConnected?'#2E7D32':'#C62828')+';font-weight:700">Supabase: '+(sbConnected?'Terhubung':'Belum dikonfigurasi')+'</span>'+(lastSync?'<span style="color:var(--tx2)">| Terakhir sync: '+lastSync+'</span>':'')+'</div>';
  if(sbConnected) h += '<button class="btna" onclick="syncAllToSupabase()" style="background:#0F9D58;padding:5px 12px;font-size:10px">&#9729; Sync Sekarang</button>';
  h += '</div>';
  h += '<div id="ADMIN-CONTENT" style="padding:16px">';

  /* ════════ GENERAL ════════ */
  if(adminSub === 'general'){
    h += '<div class="g2" style="margin-bottom:12px">';
    /* Theme card */
    h += '<div class="card" style="padding:13px"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#127763; Tema Tampilan</div>';
    h += '<div style="display:flex;gap:7px;margin-bottom:9px">';
    h += '<button class="btnp" onclick="var c=getCfg();c.theme=\'light\';saveCfg(c);applyTheme();renderAdmin()" style="background:'+(cfg.theme!=='dark'?'#1565C0':'#546E7A')+';flex:1;padding:9px">&#9728; Light</button>';
    h += '<button class="btnp" onclick="var c=getCfg();c.theme=\'dark\';saveCfg(c);applyTheme();renderAdmin()" style="background:'+(cfg.theme==='dark'?'#1565C0':'#546E7A')+';flex:1;padding:9px">&#127769; Dark</button>';
    h += '</div><div style="font-size:10px;color:var(--tx3);text-align:center">Aktif: '+(cfg.theme==='dark'?'Dark':'Light')+' Mode</div></div>';
    /* Admin info card */
    h += '<div class="card" style="padding:13px"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#128100; Info Admin</div>';
    h += '<div style="margin-bottom:7px"><label class="lbl">Nama Admin</label><input id="ADM-nm" class="fi" value="'+esc(cfg.adminName||'Hokky')+'"></div>';
    h += '<div style="margin-bottom:7px"><label class="lbl">No. WA Admin</label><input id="ADM-wa" class="fi" value="'+esc(cfg.adminWA||'6285710597159')+'"></div>';
    h += '<button class="btnp" onclick="var c=getCfg();c.adminName=document.getElementById(\'ADM-nm\').value.trim();c.adminWA=document.getElementById(\'ADM-wa\').value.trim();saveCfg(c);updateBadge();toast(\'Disimpan\',\'success\')" style="background:#0D2E5A;width:100%;padding:9px;font-size:12px">Simpan</button></div>';
    h += '</div>';
    /* Judul + CSS */
    h += '<div class="card" style="padding:13px;margin-top:0"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:8px">&#128196; Judul & Custom CSS</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Judul Header Sistem</label><input id="ADM-title" class="fi" value="'+esc(cfg.sysTitle||'SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA')+'"></div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Override CSS (ubah warna, font, dll)</label>';
    h += '<textarea id="CSS-OVR" class="fi" rows="4" style="font-family:monospace;font-size:11px" placeholder=":root { --blue: #FF5722; }&#10;.topbar { background: #333; }">'+esc(cfg.cssOverride||'')+'</textarea></div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    h += '<button class="btnp" onclick="var c=getCfg();c.sysTitle=document.getElementById(\'ADM-title\').value.trim();c.cssOverride=document.getElementById(\'CSS-OVR\').value;saveCfg(c);document.getElementById(\'STITLE\').textContent=c.sysTitle;applyCSSOverride(c.cssOverride);toast(\'Disimpan!\',\'success\')" style="background:#0D2E5A;flex:1;padding:9px;font-size:12px">Simpan</button>';
    h += '<button class="btna" onclick="var c=getCfg();c.cssOverride=\'\';saveCfg(c);applyCSSOverride(\'\');document.getElementById(\'CSS-OVR\').value=\'\';toast(\'Reset CSS\',\'info\')" style="background:#546E7A;padding:9px 13px;font-size:12px">Reset CSS</button>';
    h += '</div></div>';

    /* Admin Chatbot */
    h += '<div class="card" style="padding:13px;margin-top:0"><div style="font-size:12px;font-weight:700;color:#6A1B9A;margin-bottom:8px">&#129302; Asisten AI Admin (ChatGPT)</div>';
    h += '<div id="ADM-CHAT-MSGS" style="height:220px;background:var(--bg3);border-radius:7px;border:1px solid var(--bd);overflow-y:auto;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:7px"><div style="text-align:center;color:var(--tx3);font-size:12px;padding:16px">Tanya AI tentang bisnis AJW...</div></div>';
    h += '<div style="display:flex;gap:6px"><textarea id="ADM-CHAT-INP" class="fi" rows="2" placeholder="Tanya AI..." style="flex:1;resize:none" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendAdminChat()}"></textarea><button class="btnp" id="ADM-CHAT-BTN" onclick="sendAdminChat()" style="background:#6A1B9A;align-self:flex-end;padding:9px 13px;font-size:12px">Kirim</button></div>';
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">';
    ['Analisis KPI bisnis','Strategi Shopee','Tips reduce retur','Draft SOP packing','Karyawan terbaik'].forEach(function(p){
      h += '<button class="btna" onclick="document.getElementById(\'ADM-CHAT-INP\').value=\''+p+'\'" style="background:var(--bg3);color:var(--tx2);border:1px solid var(--bd);padding:4px 8px;font-size:10px">'+p+'</button>';
    });
    h += '</div></div>';
  }

  /* ════════ INTEGRATIONS ════════ */
  if(adminSub === 'integrations'){
    /* Telegram */
    h += '<div class="card" style="padding:13px;margin-bottom:10px">';
    h += '<div style="font-size:12px;font-weight:700;color:#0088CC;margin-bottom:8px">&#128228; Telegram Bot</div>';
    h += '<div style="background:#E3F2FD;border-radius:6px;padding:8px 11px;margin-bottom:9px;font-size:11px;line-height:1.7">Fix error "bots can\'t send to bots":<br>1. Kirim pesan ke bot kamu → 2. Buka <code>api.telegram.org/bot{TOKEN}/getUpdates</code> → 3. Ambil <code>chat.id</code></div>';
    h += '<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Bot Token</label><input id="TG-tok" class="fi" value="'+esc(cfg.tgToken||'')+'" placeholder="123456:AAxxxx"></div><div><label class="lbl">Chat ID</label><input id="TG-chat" class="fi" value="'+esc(cfg.tgChat||'')+'" placeholder="-1001234..."></div></div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    h += '<button class="btnp" onclick="var c=getCfg();c.tgToken=document.getElementById(\'TG-tok\').value.trim();c.tgChat=document.getElementById(\'TG-chat\').value.trim();saveCfg(c);toast(\'Telegram disimpan\',\'success\')" style="background:#0088CC;padding:9px 14px;font-size:12px">Simpan</button>';
    h += '<button class="btna" onclick="var c=getCfg();if(!c.tgToken||!c.tgChat){toast(\'Isi token dan chat ID\',\'error\');return}fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/sendMessage\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({chat_id:c.tgChat,text:\'Test AJW OK!\'})}).then(function(r){return r.json()}).then(function(d){if(d.ok)toast(\'Test berhasil!\',\'success\');else toast(d.description,\'error\')})" style="background:#546E7A;padding:9px 13px;font-size:12px">Test</button>';
    h += '<button class="btna" onclick="var c=getCfg();if(!c.tgToken)return;fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/getUpdates\').then(function(r){return r.json()}).then(function(d){if(d.ok&&d.result&&d.result.length){var m=d.result[d.result.length-1];var id=m.message?m.message.chat.id:\'\';if(id){document.getElementById(\'TG-chat\').value=id;toast(\'Chat ID: \'+id,\'success\',5000)}}else toast(\'Kirim pesan ke bot dulu\',\'warn\')})" style="background:#2E7D32;padding:9px 13px;font-size:12px">Auto Detect Chat ID</button>';
    h += '</div></div>';

    /* Google Drive */
    h += '<div class="card" style="padding:13px;margin-bottom:10px">';
    h += '<div style="font-size:12px;font-weight:700;color:#0F9D58;margin-bottom:8px">&#9729; Google Drive</div>';
    h += '<div style="background:#E8F5E9;border-radius:6px;padding:8px 11px;margin-bottom:9px;font-size:11px;line-height:1.6">Bearer Token: <a href="https://developers.google.com/oauthplayground" target="_blank" style="color:#0F9D58">OAuth Playground</a> &#8594; Drive API v3 &#8594; Exchange token &#8594; copy</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Bearer Token</label><input id="DRV-tok" class="fi" value="'+esc(cfg.driveToken||'')+'" placeholder="ya29.xxx..."></div>';
    h += '<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Folder ID Penilaian</label><input id="DRV-eval" class="fi" value="'+esc(cfg.driveEvalFolder||'1D4lQmi48BBPNYxhqAM_Qtp68I6nPTw9Z')+'"></div><div><label class="lbl">Folder ID Payroll</label><input id="DRV-pay" class="fi" value="'+esc(cfg.drivePayFolder||'10b5C7W-33tS3Ujd5xYcvjtYj_9NYsWhJ')+'"></div></div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Folder HR Umum</label><input id="DRV-hr" class="fi" value="'+esc(cfg.driveHRFolder||'1tv-IUtvJDrP9bw4sAMhpGq_h9MrK8H4t')+'"></div>';
    h += '<button class="btnp" onclick="var c=getCfg();c.driveToken=document.getElementById(\'DRV-tok\').value.trim();c.driveEvalFolder=document.getElementById(\'DRV-eval\').value.trim();c.drivePayFolder=document.getElementById(\'DRV-pay\').value.trim();c.driveHRFolder=document.getElementById(\'DRV-hr\').value.trim();saveCfg(c);toast(\'Drive disimpan\',\'success\')" style="background:#0F9D58;padding:9px 14px;font-size:12px">Simpan Drive Config</button></div>';

    /* AI Keys */
    h += '<div class="card" style="padding:13px">';
    h += '<div style="font-size:12px;font-weight:700;color:#6A1B9A;margin-bottom:8px">&#129302; AI API Keys</div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-bottom:9px;line-height:1.7"><a href="https://platform.openai.com/api-keys" target="_blank" style="color:#6A1B9A">OpenAI</a> &bull; <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#6A1B9A">Gemini</a> &bull; <a href="https://console.anthropic.com" target="_blank" style="color:#6A1B9A">Anthropic Claude</a></div>';
    h += '<div class="g3" style="margin-bottom:9px">';
    h += '<div><label class="lbl">OpenAI Key</label><input id="AI-GPT-KEY" class="fi" type="password" value="'+esc(cfg.openaiKey||'')+'" placeholder="sk-proj-..."><select id="AI-GPT-MDL" class="fi" style="margin-top:5px"><option value="gpt-4o-mini"'+(cfg.openaiModel==='gpt-4o-mini'?' selected':'')+'>GPT-4o mini</option><option value="gpt-4o"'+(cfg.openaiModel==='gpt-4o'?' selected':'')+'>GPT-4o</option></select></div>';
    h += '<div><label class="lbl">Gemini Key</label><input id="AI-GEM-KEY" class="fi" type="password" value="'+esc(cfg.geminiKey||'')+'" placeholder="AIzaSy..."><select id="AI-GEM-MDL" class="fi" style="margin-top:5px"><option value="gemini-1.5-flash">Gemini Flash</option><option value="gemini-1.5-pro">Gemini Pro</option></select></div>';
    h += '<div><label class="lbl">Claude Key</label><input id="AI-CLD-KEY" class="fi" type="password" value="'+esc(cfg.anthropicKey||'')+'" placeholder="sk-ant-..."><select id="AI-CLD-MDL" class="fi" style="margin-top:5px"><option value="claude-3-5-haiku-20241022">Haiku (cepat)</option><option value="claude-3-5-sonnet-20241022">Sonnet</option></select></div>';
    h += '</div>';
    h += '<button class="btnp" onclick="var c=getCfg();c.openaiKey=document.getElementById(\'AI-GPT-KEY\').value.trim();c.openaiModel=document.getElementById(\'AI-GPT-MDL\').value;c.geminiKey=document.getElementById(\'AI-GEM-KEY\').value.trim();c.geminiModel=document.getElementById(\'AI-GEM-MDL\').value;c.anthropicKey=document.getElementById(\'AI-CLD-KEY\').value.trim();c.claudeModel=document.getElementById(\'AI-CLD-MDL\').value;saveCfg(c);toast(\'AI Keys disimpan\',\'success\')" style="background:#6A1B9A;padding:9px 14px;font-size:12px">Simpan AI Keys</button></div>';
  }

  /* ════════ TEMPLATES ════════ */
  if(adminSub === 'templates'){
    h += '<div class="card" style="padding:13px">';
    h += '<div style="font-size:12px;font-weight:700;color:#E65100;margin-bottom:8px">&#128203; Template Caption WA / Telegram</div>';
    h += '<div style="font-size:10px;color:var(--tx2);background:var(--bg3);padding:8px;border-radius:5px;margin-bottom:9px;line-height:1.8">Variabel: <code>{nama} {jabatan} {periode} {tipe} {tanggal} {nilai} {grade} {kategori} {rincian} {keputusan} {catatan} {gajiPokok} {lembur} {bonus} {kotor} {bersih} {hariKerja}</code></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Template Penilaian</label><textarea id="TPL-eval" class="fi" rows="7">'+esc(cfg.evalTpl||'LAPORAN PENILAIAN KINERJA\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nTanggal: {tanggal}\n\nNILAI AKHIR: {nilai} / 4.00\nGrade: {grade} - {kategori}\n\nRincian:\n{rincian}\n\nKeputusan: {keputusan}\n{catatan}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Template Payroll</label><textarea id="TPL-pay" class="fi" rows="5">'+esc(cfg.payTpl||'SLIP GAJI KARYAWAN\nAnton Jaya Wijaya\n\nNama: {nama}\nPeriode: {periode} ({tipe})\nHari Kerja: {hariKerja} hari\n\nGaji Pokok : Rp {gajiPokok}\nLembur     : Rp {lembur}\nBonus      : Rp {bonus}\nTotal Kotor: Rp {kotor}\nGAJI BERSIH: Rp {bersih}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h += '<button class="btnp" onclick="var c=getCfg();c.evalTpl=document.getElementById(\'TPL-eval\').value;c.payTpl=document.getElementById(\'TPL-pay\').value;saveCfg(c);toast(\'Template disimpan!\',\'success\')" style="background:#E65100;padding:9px 16px;font-size:12px">Simpan Template</button></div>';
  }

  /* ════════ TABS & HTML ════════ */
  if(adminSub === 'tabs'){
    var tc = cfg.tabsConfig||{};
    var coreDefs = [
      {id:'dash',def:'&#127968; Dashboard'},{id:'eval',def:'&#128203; Penilaian'},
      {id:'payroll',def:'&#128176; Payroll'},{id:'stats',def:'&#128202; Statistik'},
      {id:'emp',def:'&#128101; Karyawan'},{id:'hist',def:'&#128220; Riwayat'},
      {id:'kpi',def:'&#128202; KPI Bisnis'},{id:'finansial',def:'&#128181; Finansial'},
      {id:'operasional',def:'&#9881; Operasional'},{id:'supplier',def:'&#128031; Hutang Supplier'},
      {id:'taligf',def:'&#129399; Tali GF'},{id:'aichat',def:'&#129302; AI Chat'},
      {id:'admin',def:'&#128295; Admin'}
    ];
    h += '<div class="card" style="padding:13px;margin-bottom:10px">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#128195; Konfigurasi Tab</div>';
    coreDefs.forEach(function(t){
      var lbl = tc['label_'+t.id]||t.def;
      h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--bg3);border-radius:6px;margin-bottom:5px">';
      h += '<input type="checkbox" id="THIDE-'+t.id+'"'+(tc['hide_'+t.id]?'':' checked')+' style="width:16px;height:16px;accent-color:var(--teal);flex-shrink:0">';
      h += '<input class="fi" id="TLBL-'+t.id+'" type="text" value="'+esc(lbl)+'" style="flex:1;padding:6px 9px;font-size:11px">';
      h += '<button class="btna" onclick="openTabEditor(\''+t.id+'\',\''+t.id+'\')" style="background:#1565C0;padding:5px 10px;font-size:10px">&#9998; Edit HTML</button>';
      h += '</div>';
    });
    h += '<button class="btna" onclick="var c=getCfg();c.tabsConfig=c.tabsConfig||{};';
    coreDefs.forEach(function(t){
      h += 'c.tabsConfig[\'hide_'+t.id+'\']=!document.getElementById(\'THIDE-'+t.id+'\').checked;c.tabsConfig[\'label_'+t.id+'\']=document.getElementById(\'TLBL-'+t.id+'\').value;';
    });
    h += 'saveCfg(c);buildTabBar();toast(\'Tab diperbarui!\',\'success\')" style="background:#0D2E5A;padding:9px 14px;font-size:12px;margin-top:6px">Simpan Konfigurasi Tab</button></div>';

    /* Custom tabs */
    h += '<div class="card" style="padding:13px;margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#10010; Tab Custom</div>';
    if(customTabs.length){
      customTabs.forEach(function(ct,idx){
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg3);border-radius:6px;margin-bottom:5px;gap:8px">';
        h += '<span style="font-size:12px;font-weight:700">'+(ct.icon||'')+'&nbsp;'+esc(ct.name)+'</span>';
        h += '<div style="display:flex;gap:5px"><button class="btnsm" onclick="openTabEditor(\'ct_'+ct.id+'\',\''+esc(ct.name)+'\')" style="background:#1565C0">&#9998; Edit</button><button class="btnsm" onclick="SW(\'ct_'+ct.id+'\')" style="background:#00838F">Preview</button><button class="btnsm" onclick="confirmDelete(\'Hapus tab <b>'+esc(ct.name)+'</b>?\',function(){customTabs.splice('+idx+',1);sv(\'ajw_tabs\',customTabs);buildTabBar();renderAdmin()})" style="background:#C62828">X</button></div>';
        h += '</div>';
      });
    } else h += '<div style="color:var(--tx3);font-size:12px;margin-bottom:9px">Belum ada tab custom.</div>';
    h += '<div class="g2" style="margin-bottom:7px"><div><label class="lbl">Nama Tab</label><input id="CT-nm" class="fi" placeholder="Tab Baru"></div><div><label class="lbl">Icon (emoji)</label><input id="CT-ic" class="fi" placeholder="&#128196;"></div></div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">HTML Content</label><textarea id="CT-html" class="fi" rows="4" style="font-family:monospace;font-size:11px" placeholder="<div>Konten...</div>"></textarea></div>';
    h += '<button class="btna" onclick="var nm=document.getElementById(\'CT-nm\').value.trim();if(!nm){toast(\'Nama tab wajib\',\'error\');return};var ct={id:Date.now(),name:nm,icon:document.getElementById(\'CT-ic\').value||\'&#128196;\',html:document.getElementById(\'CT-html\').value};customTabs.push(ct);sv(\'ajw_tabs\',customTabs);addCustomTabDiv(ct);buildTabBar();toast(\'Tab ditambahkan!\',\'success\');renderAdmin()" style="background:#00838F;padding:9px 13px;font-size:12px">+ Tambah Tab</button></div>';

    /* Download HTML */
    h += '<div class="card" style="padding:13px"><div style="font-size:12px;font-weight:700;color:#E65100;margin-bottom:7px">&#128190; Download HTML Sistem</div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-bottom:9px">Download seluruh sistem sebagai 1 file HTML — bisa deploy ke Netlify (drag & drop).</div>';
    h += '<button class="btnp" onclick="exportFullHTML()" style="background:#E65100;padding:9px 16px;font-size:12px">&#128190; Download HTML</button></div>';
  }

  /* ════════ DATA & BACKUP ════════ */
  if(adminSub === 'data'){
    /* Supabase Panel */
    h += buildSupabasePanel();

    /* Google Drive Backup */
    h += '<div class="card" style="padding:13px;margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:#0F9D58;margin-bottom:7px">&#9729; Backup Google Drive</div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">Upload semua data ke satu file JSON di folder HR Drive. Butuh Bearer Token di tab Integrasi.</div>';
    h += '<button class="btna" onclick="backupToDrive()" style="background:#0F9D58;padding:9px 14px;font-size:12px">&#9729; Backup ke Drive</button></div>';

    /* Local backup */
    h += '<div class="card" style="padding:13px"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#128196; Lokal Backup</div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px">';
    h += '<button class="btna" onclick="exportData()" style="background:#2E7D32;padding:9px 13px;font-size:12px">Export JSON</button>';
    h += '<button class="btna" onclick="importData()" style="background:#1565C0;padding:9px 13px;font-size:12px">Import JSON</button>';
    h += '<button class="btna" onclick="confirmDelete(\'Hapus SEMUA riwayat penilaian &amp; payroll? Data karyawan tetap ada.\',function(){evalHistory=[];payHistory=[];sv(\'ajw_eval\',evalHistory);sv(\'ajw_pay\',payHistory);toast(\'Data dihapus\',\'warn\')})" style="background:#C62828;padding:9px 13px;font-size:12px">Reset Data</button>';
    h += '</div>';
    h += '<div style="background:#FFF3E0;border-radius:6px;padding:9px 12px;font-size:11px;line-height:1.8;border:1px solid #E6510040">';
    h += '<b style="color:#E65100">&#128161; Rekomendasi Storage:</b><br>';
    h += '&#128194; <b>localStorage</b> (saat ini) — offline, ~5-10MB, 1 perangkat<br>';
    h += '&#9729; <b>Supabase</b> (rekomendasi) — gratis 500MB, cloud, multi-device<br>';
    h += '&#9644; <b>Google Drive</b> — backup manual/otomatis ke folder';
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-top:8px">Tersimpan lokal: '+evalHistory.length+' penilaian &bull; '+payHistory.length+' slip gaji &bull; '+employees.length+' karyawan &bull; '+customTabs.length+' tab custom</div>';
    h += '</div>';
  }

  h += '</div></div>'; /* close ADMIN-CONTENT + card */
  document.getElementById('V-admin').innerHTML = h;
  if(adminSub === 'general') renderAdminChatMsgs();
};

/* ============================================================
   AJW PATCH — Supplier v2 + Supabase delete sync + Font zoom
   Strategy: ADD on top, override only renderSupplier
   All existing functions preserved untouched
============================================================ */

/* ──── NEW GLOBALS (safe to re-declare) ──── */
var supplierData   = supplierData   || [];
var pesananData    = pesananData    || [];
var supplierFilter = supplierFilter || 'all';
var supplierView   = supplierView   || 'dashboard';
var currentFontScale = currentFontScale || 1.0;

/* ──── LOAD/SAVE ALL SUPPLIER DATA ──── */
function loadSupplierAll(){
  try{ supplierHutang = JSON.parse(localStorage.getItem('ajw_supplier')||'[]'); }catch(e){ supplierHutang=[]; }
  try{ supplierData   = JSON.parse(localStorage.getItem('ajw_sup_data')||'[]'); }catch(e){ supplierData=[]; }
  try{ pesananData    = JSON.parse(localStorage.getItem('ajw_pesanan') ||'[]'); }catch(e){ pesananData=[]; }
}

function saveSupplierAll(){
  try{ localStorage.setItem('ajw_supplier', JSON.stringify(supplierHutang)); }catch(e){}
  try{ localStorage.setItem('ajw_sup_data', JSON.stringify(supplierData));   }catch(e){}
  try{ localStorage.setItem('ajw_pesanan',  JSON.stringify(pesananData));    }catch(e){}
  sbSyncSupplierAll();
}

function saveSupplier(){
  try{ localStorage.setItem('ajw_supplier', JSON.stringify(supplierHutang)); }catch(e){}
  sbSyncSupplierAll();
}

function sbSyncSupplierAll(){
  var cfg = getCfg();
  if(!cfg.supabaseUrl || !cfg.supabaseKey) return;
  if(window._sbSupTimer) clearTimeout(window._sbSupTimer);
  window._sbSupTimer = setTimeout(function(){
    if(typeof SB !== 'undefined' && SB.init){
      SB.init();
      if(supplierHutang.length){
        var recs = supplierHutang.map(function(s){
          return {id:s.id, data:s, nama_supplier:s.namaSupplier||'', bulan:s.bulan||'', tahun:s.tahun||0};
        });
        SB.upsertMany('ajw_supplier', recs).catch(function(){});
      }
      SB.upsertMany('ajw_config',[
        {key:'sup_data', value:{data:supplierData}},
        {key:'pesanan',  value:{data:pesananData}}
      ]).catch(function(){});
    }
  }, 2000);
}

/* ──── FONT SCALE ──── */
function setFontScale(scale){
  currentFontScale = Math.max(0.7, Math.min(1.5, scale));
  document.documentElement.style.fontSize = (currentFontScale * 14) + 'px';
  var cfg = getCfg(); cfg.fontScale = currentFontScale; saveCfg(cfg);
  var el = document.getElementById('FONT-SCALE-LBL');
  if(el) el.textContent = Math.round(currentFontScale*100) + '%';
}

/* ──── IMAGE FULLSCREEN ──── */
function showImageFull(src){
  var existing = document.getElementById('IMG-FULL');
  if(existing) existing.remove();
  var d = document.createElement('div');
  d.id = 'IMG-FULL';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;justify-content:center;align-items:center;cursor:pointer';
  d.onclick = function(){ d.remove(); };
  d.innerHTML = '<img src="'+src+'" style="max-width:92vw;max-height:92vh;border-radius:8px"><div style="position:fixed;top:16px;right:20px;color:#fff;font-size:26px;cursor:pointer">&times;</div>';
  document.body.appendChild(d);
}

/* ──── CONFIRM DELETE HELPER (if not already defined) ──── */
if(typeof confirmDelete === 'undefined'){
  function confirmDelete(msg, onYes){
    var d = document.createElement('div');
    d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;justify-content:center;align-items:center;padding:20px';
    d.innerHTML='<div style="background:var(--bg2);border-radius:var(--r);padding:22px;max-width:360px;width:100%;border-top:4px solid #C62828"><div style="font-size:14px;font-weight:700;margin-bottom:8px">Konfirmasi Hapus</div><div style="font-size:13px;color:var(--tx2);margin-bottom:18px;line-height:1.5">'+msg+'</div><div style="display:flex;gap:9px;justify-content:flex-end"><button onclick="this.closest(\'div[style*=position\\:fixed]\').remove()" style="padding:9px 18px;background:var(--bg3);border:1px solid var(--bd);border-radius:5px;cursor:pointer;font-family:Arial">Batal</button><button id="CDEL-YES" style="padding:9px 18px;background:#C62828;color:#fff;border:none;border-radius:5px;cursor:pointer;font-family:Arial">Ya, Hapus</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('#CDEL-YES').onclick = function(){ d.remove(); onYes(); };
  }
}

/* ──── SUPABASE DELETE (if not already defined) ──── */
if(typeof sbDeleteRecord === 'undefined'){
  function sbDeleteRecord(table, id){
    var cfg = getCfg();
    if(!cfg.supabaseUrl || !cfg.supabaseKey) return;
    fetch(cfg.supabaseUrl+'/rest/v1/'+table+'?id=eq.'+id, {
      method:'DELETE',
      headers:{'apikey':cfg.supabaseKey,'Authorization':'Bearer '+cfg.supabaseKey}
    }).then(function(r){
      if(r.ok) toast('☁ Supabase: record dihapus','success',2000);
    }).catch(function(){});
  }
}

/* ──── PATCH delEmp to use confirmDelete + supabase ──── */
delEmp = function(idx){
  var e = employees[idx];
  if(!e) return;
  confirmDelete('Hapus karyawan <b>'+esc(e.nama)+'</b>?<br><small style="color:var(--tx3)">Data tidak dapat dikembalikan.</small>', function(){
    sbDeleteRecord('ajw_employees', e.id);
    employees.splice(idx,1);
    try{ localStorage.setItem('ajw_emp', JSON.stringify(employees)); }catch(ex){}
    toast('Karyawan dihapus','warn');
    renderEmp();
  });
};

/* ──── PATCH sv() for auto supabase sync on data change ──── */
var _svOrigPatch = sv;
sv = function(key, val){
  _svOrigPatch(key, val);
  var syncKeys = {ajw_emp:'ajw_employees', ajw_eval:'ajw_eval', ajw_pay:'ajw_payroll', ajw_kpi:'ajw_kpi', ajw_supplier:'ajw_supplier'};
  if(!syncKeys[key]) return;
  var cfg = getCfg();
  if(!cfg.supabaseAutoSync || !cfg.supabaseUrl || !cfg.supabaseKey) return;
  if(window._sbAutoTimer) clearTimeout(window._sbAutoTimer);
  window._sbAutoTimer = setTimeout(function(){
    if(typeof syncAllToSupabase === 'function') syncAllToSupabase(true);
  }, 2000);
};

/* ══════════════════════════════════════════════════════
   MAIN: renderSupplier OVERRIDE
   Complete rewrite with 5 sub-views
══════════════════════════════════════════════════════ */

renderSupplier = function(){
  loadSupplierAll();

  /* Get all supplier names */
  var fromData  = supplierData.map(function(s){ return s.nama; });
  var fromHutang= supplierHutang.map(function(d){ return d.namaSupplier||'Golden Fish'; });
  var allNames  = fromData.concat(fromHutang).filter(function(n,i,a){ return n && a.indexOf(n)===i; }).sort();
  if(!allNames.length) allNames = ['Golden Fish'];

  /* Per-supplier summary */
  var sumBySup = {};
  allNames.forEach(function(nm){
    var list = supplierHutang.filter(function(d){ return (d.namaSupplier||'Golden Fish')===nm; });
    var tNota = list.reduce(function(t,d){ return t+(d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0); },0);
    var tBayar= list.reduce(function(t,d){ return t+(d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0); },0);
    sumBySup[nm] = {nota:tNota, bayar:tBayar, saldo:tNota-tBayar, count:list.length};
  });
  var gNota  = Object.keys(sumBySup).reduce(function(t,k){ return t+sumBySup[k].nota; },0);
  var gBayar = Object.keys(sumBySup).reduce(function(t,k){ return t+sumBySup[k].bayar; },0);

  var cfg = getCfg();
  var fScale = cfg.fontScale||1.0;

  var h = '';

  /* ── TOP HEADER ── */
  h += '<div style="background:linear-gradient(135deg,#1A1A2E,#2D3561);padding:14px 18px;border-radius:var(--r);margin-bottom:11px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  h += '<div style="display:flex;align-items:center;gap:12px">';
  h += '<div style="width:44px;height:44px;border-radius:50%;background:rgba(255,215,0,.15);border:2px solid #FFD700;display:flex;align-items:center;justify-content:center;font-size:20px">&#128031;</div>';
  h += '<div><div style="color:#FFD700;font-weight:700;font-size:15px">HUTANG SUPPLIER</div>';
  h += '<div style="color:#90CAF9;font-size:11px">'+allNames.length+' supplier &bull; '+supplierHutang.length+' nota</div></div></div>';
  /* Font zoom */
  h += '<div style="display:flex;align-items:center;gap:6px">';
  h += '<span style="color:#90CAF9;font-size:11px">Zoom:</span>';
  h += '<button onclick="setFontScale(currentFontScale-0.1)" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:14px">A-</button>';
  h += '<span id="FONT-SCALE-LBL" style="color:#FFD700;font-size:12px;font-weight:700;min-width:36px;text-align:center">'+Math.round(fScale*100)+'%</span>';
  h += '<button onclick="setFontScale(currentFontScale+0.1)" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:14px">A+</button>';
  h += '<button onclick="setFontScale(1.0)" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:5px;padding:4px 7px;cursor:pointer;font-size:10px">Reset</button>';
  h += '</div></div></div>';

  /* ── VIEW NAV ── */
  var views = [{id:'dashboard',lbl:'&#128202; Dashboard'},{id:'hutang',lbl:'&#128180; Hutang & Nota'},{id:'pesanan',lbl:'&#128230; Pesanan'},{id:'data',lbl:'&#128101; Data Supplier'},{id:'history',lbl:'&#128336; History Bayar'}];
  h += '<div style="display:flex;gap:4px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">';
  views.forEach(function(v){
    var act = supplierView===v.id;
    h += '<button onclick="supplierView=\''+v.id+'\';renderSupplier()" style="padding:8px 14px;border-radius:7px;border:1.5px solid '+(act?'#1A237E':'var(--bd)')+';cursor:pointer;font-size:11px;font-weight:700;font-family:Arial;white-space:nowrap;background:'+(act?'#1A237E':'var(--bg2)')+';color:'+(act?'#fff':'var(--tx2)')+'">'+v.lbl+'</button>';
  });
  h += '</div>';

  /* ── SUPPLIER FILTER PILLS ── */
  h += '<div style="display:flex;gap:6px;margin-bottom:11px;flex-wrap:wrap;align-items:center">';
  h += '<span style="font-size:11px;font-weight:700;color:var(--tx2)">Filter:</span>';
  h += '<button onclick="supplierFilter=\'all\';renderSupplier()" style="padding:5px 13px;border-radius:20px;border:1.5px solid '+(supplierFilter==='all'?'#1A237E':'var(--bd)')+';background:'+(supplierFilter==='all'?'#1A237E':'var(--bg2)')+';color:'+(supplierFilter==='all'?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">Semua</button>';
  allNames.forEach(function(nm){
    var act = supplierFilter===nm;
    h += '<button onclick="supplierFilter='+JSON.stringify(nm)+';renderSupplier()" style="padding:5px 13px;border-radius:20px;border:1.5px solid '+(act?'#1A237E':'var(--bd)')+';background:'+(act?'#1A237E':'var(--bg2)')+';color:'+(act?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">'+esc(nm)+'</button>';
  });
  h += '</div>';

  /* ── CONTENT BY VIEW ── */
  if(supplierView==='dashboard')  h += _supViewDashboard(allNames, sumBySup, gNota, gBayar);
  else if(supplierView==='hutang') h += _supViewHutang();
  else if(supplierView==='pesanan')h += _supViewPesanan(allNames);
  else if(supplierView==='data')   h += _supViewData();
  else if(supplierView==='history')h += _supViewHistory();

  h += _supModals(allNames);
  document.getElementById('V-supplier').innerHTML = h;
};

/* ── DASHBOARD ── */
function _supViewDashboard(names, sumBySup, gNota, gBayar){
  var gSaldo = gNota - gBayar;
  var h = '';
  /* Grand summary */
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:13px">';
  [['Total Pembelian','Rp '+fmt(gNota),'#FFEBEE','#C62828'],
   ['Total Terbayar','Rp '+fmt(gBayar),'#E8F5E9','#2E7D32'],
   ['Saldo Hutang','Rp '+fmt(gSaldo),gSaldo>0?'#FFF3E0':'#E8F5E9',gSaldo>0?'#E65100':'#2E7D32'],
   ['Jumlah Nota',''+supplierHutang.length,'#DBEAFE','#1565C0']
  ].forEach(function(x){
    h += '<div class="card" style="padding:13px;border-left:4px solid '+x[3]+';text-align:center">';
    h += '<div style="font-size:10px;color:var(--tx2);font-weight:700;margin-bottom:5px">'+x[0]+'</div>';
    h += '<div style="font-size:16px;font-weight:700;color:'+x[3]+'">'+x[1]+'</div></div>';
  });
  h += '</div>';
  /* Per supplier cards */
  var filtered = supplierFilter==='all' ? names : names.filter(function(n){ return n===supplierFilter; });
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:11px;margin-bottom:13px">';
  filtered.forEach(function(nm){
    var s = sumBySup[nm]||{nota:0,bayar:0,saldo:0,count:0};
    var pct = s.nota>0 ? Math.min(100,Math.round(s.bayar/s.nota*100)) : (s.saldo===0?100:0);
    var sup = supplierData.filter(function(d){ return d.nama===nm; })[0]||{};
    h += '<div class="card" style="padding:13px;border-top:3px solid #1A237E">';
    h += '<div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">';
    h += '<div style="width:36px;height:36px;border-radius:50%;background:#1A237E;display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:700;font-size:15px;flex-shrink:0">'+nm.charAt(0).toUpperCase()+'</div>';
    h += '<div><div style="font-weight:700;color:var(--navy)">'+esc(nm)+'</div>';
    h += '<div style="font-size:10px;color:var(--tx2)">'+(sup.kategori||'Supplier')+(sup.telepon?' &bull; '+esc(sup.telepon):'')+'</div></div></div>';
    /* Progress */
    h += '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--tx2);margin-bottom:3px"><span>Terbayar</span><span style="font-weight:700">'+pct+'%</span></div>';
    h += '<div style="height:6px;background:var(--bg3);border-radius:3px;margin-bottom:10px"><div style="height:100%;border-radius:3px;background:'+(pct>=100?'#2E7D32':pct>=50?'#F57F17':'#C62828')+';width:'+pct+'%"></div></div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:10px">';
    [['Nota','Rp '+fmt(s.nota),'#C62828'],['Terbayar','Rp '+fmt(s.bayar),'#2E7D32'],
     ['Saldo','Rp '+fmt(s.saldo),s.saldo>0?'#E65100':'#2E7D32'],['Jumlah',s.count+' nota','#1565C0']].forEach(function(r){
      h += '<div style="background:var(--bg3);padding:6px;border-radius:5px"><div style="font-size:9px;color:var(--tx2);font-weight:700">'+r[0]+'</div><div style="font-weight:700;color:'+r[2]+'">'+r[1]+'</div></div>';
    });
    h += '</div>';
    h += '<div style="display:flex;gap:6px">';
    h += '<button class="btna" onclick="supplierFilter='+JSON.stringify(nm)+';supplierView=\'hutang\';renderSupplier()" style="background:#1A237E;flex:1;padding:7px;font-size:11px">Lihat Nota</button>';
    if(s.saldo>0) h += '<button class="btna" onclick="_openBayarBulk('+JSON.stringify(nm)+')" style="background:#2E7D32;flex:1;padding:7px;font-size:11px">Bayar</button>';
    h += '</div></div>';
  });
  h += '</div>';
  /* Rekap bulanan */
  h += '<div class="card"><div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#128336; Rekap Bulanan</div>';
  var mMap = {};
  supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; })
    .forEach(function(d){
      var mk = (d.tahun||'2026')+(d.bulanNum?('-'+String(d.bulanNum).padStart(2,'0')):'');
      if(!mMap[mk]) mMap[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0};
      mMap[mk].nota  += (d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0);
      mMap[mk].bayar += (d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0);
    });
  var mKeys = Object.keys(mMap).sort().reverse();
  if(mKeys.length){
    h += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Bulan</th><th class="c">Total Nota</th><th class="c">Terbayar</th><th class="c">Saldo</th><th class="c">Status</th></tr></thead><tbody>';
    mKeys.forEach(function(mk){
      var m=mMap[mk], saldo=m.nota-m.bayar;
      h += '<tr><td style="font-weight:700">'+esc(m.label)+'</td>';
      h += '<td class="c" style="color:#C62828">Rp '+fmt(m.nota)+'</td>';
      h += '<td class="c" style="color:#2E7D32">Rp '+fmt(m.bayar)+'</td>';
      h += '<td class="c" style="font-weight:700;color:'+(saldo>0?'#E65100':'#2E7D32')+'">Rp '+fmt(saldo)+'</td>';
      h += '<td class="c"><span class="chip" style="background:'+(saldo<=0?'#E8F5E9':'#FFF3E0')+';color:'+(saldo<=0?'#2E7D32':'#E65100')+'">'+(saldo<=0?'&#9989; Lunas':'&#9203; Belum')+'</span></td></tr>';
    });
    h += '</tbody></table></div>';
  } else h += '<div style="color:var(--tx3);font-size:12px;padding:14px;text-align:center">Belum ada data</div>';
  h += '</div>';
  return h;
}

/* ── HUTANG & NOTA VIEW ── */
function _supViewHutang(){
  var filtered = supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:7px">';
  h += '<span style="font-size:12px;font-weight:700;color:var(--navy)">'+filtered.length+' nota</span>';
  h += '<button class="btnp" onclick="_openNotaModal()" style="background:#1A237E;padding:9px 16px;font-size:12px">+ Tambah Nota</button></div>';
  if(!filtered.length){
    return h+'<div class="card" style="text-align:center;padding:36px;color:var(--tx3)"><div style="font-size:36px">&#128031;</div><div>Belum ada nota. Klik + Tambah Nota.</div></div>';
  }
  /* Group by supplier+month */
  var groups={};
  filtered.forEach(function(d){
    var sup = d.namaSupplier||'Golden Fish';
    var mk = sup+'__'+(d.tahun||'')+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
    if(!groups[mk]) groups[mk]={sup:sup,label:(d.bulan||'')+' '+(d.tahun||''),items:[]};
    groups[mk].items.push(d);
  });
  Object.keys(groups).sort().reverse().forEach(function(gk){
    var grp=groups[gk];
    var gNota=grp.items.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0);
    var gBayar=grp.items.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0);
    var gSaldo=gNota-gBayar;
    h += '<div class="card" style="padding:0;overflow:hidden;margin-bottom:13px">';
    h += '<div style="background:#1A237E;padding:9px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h += '<div><span style="color:#FFD700;font-weight:700">&#128031; '+esc(grp.sup)+'</span><span style="color:#90CAF9;font-size:11px;margin-left:10px">'+esc(grp.label)+'</span></div>';
    h += '<div style="display:flex;gap:12px;font-size:11px">';
    h += '<span style="color:#ccc">Nota:<b style="color:#FFD700"> Rp '+fmt(gNota)+'</b></span>';
    h += '<span style="color:#ccc">Bayar:<b style="color:#69F0AE"> Rp '+fmt(gBayar)+'</b></span>';
    h += '<span style="color:#ccc">Saldo:<b style="color:'+(gSaldo>0?'#FFD54F':'#69F0AE')+'"> Rp '+fmt(gSaldo)+'</b></span>';
    if(gSaldo>0) h += '<button class="btnsm" onclick="_openBayarBulk('+JSON.stringify(grp.sup)+')" style="background:#2E7D32;font-size:10px">Bayar Semua</button>';
    h += '</div></div>';
    h += '<div style="padding:11px;display:flex;flex-direction:column;gap:10px">';
    grp.items.forEach(function(d){
      var oi = supplierHutang.indexOf(d);
      var tN=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
      var tB=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
      var saldo=tN-tB, lunas=saldo<=0;
      h += '<div style="border:1px solid var(--bd);border-radius:8px;overflow:hidden;border-left:4px solid '+(lunas?'#2E7D32':'#C62828')+'">';
      h += '<div style="background:var(--bg3);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
      h += '<div style="display:flex;gap:8px;align-items:center">';
      h += '<span class="chip" style="background:'+(lunas?'#E8F5E9':'#FFEBEE')+';color:'+(lunas?'#2E7D32':'#C62828')+'">'+(lunas?'&#9989; Lunas':'&#9203; Belum Lunas')+'</span>';
      if(d.catatan) h += '<span style="font-size:11px;color:var(--tx2)">'+esc(d.catatan)+'</span>';
      h += '</div>';
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
      if(!lunas) h += '<button class="btnsm" onclick="_openBayarModal('+oi+')" style="background:#2E7D32;font-size:10px">+Bayar</button>';
      h += '<button class="btnsm" onclick="genInvoiceSupplier('+oi+')" style="background:#1565C0;font-size:10px">Invoice</button>';
      h += '<button class="btnsm" onclick="_openBuktiModal('+oi+')" style="background:#6A1B9A;font-size:10px">&#128248; Bukti</button>';
      h += '<button class="btnsm" onclick="deleteSupplierRecord('+oi+')" style="background:#C62828;font-size:10px">X</button>';
      h += '</div></div>';
      /* Transactions table */
      var txns=[];
      (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,isBayar:false,bukti:''});});
      (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,isBayar:true,bukti:b.bukti||''});});
      txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'');});
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">';
      h += '<thead><tr style="background:#0D2E5A;color:#fff">';
      ['Tanggal','No Dokumen','Keterangan','Kode','Nilai Netto','Bayar','Saldo'].forEach(function(th){
        h += '<th style="padding:6px 9px;border:1px solid #1D4E8A;text-align:'+(th==='Nilai Netto'||th==='Bayar'||th==='Saldo'?'right':'left')+'">'+th+'</th>';
      });
      h += '</tr></thead><tbody>';
      var sRun=0;
      txns.forEach(function(tx,ti){
        sRun=sRun+tx.netto-tx.bayar;
        h += '<tr style="background:'+(ti%2?'var(--bg3)':'var(--bg2)')+'">';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);white-space:nowrap">'+esc(tx.tgl||'')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd)">'+esc(tx.noDok||'')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);font-weight:'+(tx.isBayar?'700':'400')+';color:'+(tx.isBayar?'#1565C0':'inherit')+'">'+esc(tx.ket||'')+(tx.bukti?'&nbsp;<span title="Ada bukti" style="color:#6A1B9A">&#128248;</span>':'')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);color:var(--tx2)">'+esc(tx.kode||'')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);text-align:right;color:'+(tx.netto>0?'#C62828':'var(--tx3)')+'">'+( tx.netto>0?'Rp '+fmt(tx.netto):'-')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);text-align:right;color:'+(tx.bayar>0?'#2E7D32':'var(--tx3)')+'">'+( tx.bayar>0?'Rp '+fmt(tx.bayar):'-')+'</td>';
        h += '<td style="padding:5px 9px;border:1px solid var(--bd);text-align:right;font-weight:700;color:'+(sRun>0?'#E65100':'#2E7D32')+'">Rp '+fmt(sRun)+'</td></tr>';
      });
      h += '<tr style="background:#0D2E5A"><td colspan="4" style="padding:6px 9px;color:#fff;font-weight:700;border:1px solid #1D4E8A">TOTAL</td>';
      h += '<td style="padding:6px 9px;color:#FFD700;font-weight:700;text-align:right;border:1px solid #1D4E8A">Rp '+fmt(tN)+'</td>';
      h += '<td style="padding:6px 9px;color:#69F0AE;font-weight:700;text-align:right;border:1px solid #1D4E8A">Rp '+fmt(tB)+'</td>';
      h += '<td style="padding:6px 9px;color:'+(saldo>0?'#FFD54F':'#69F0AE')+';font-weight:700;text-align:right;border:1px solid #1D4E8A">Rp '+fmt(saldo)+'</td></tr>';
      h += '</tbody></table></div>';
      /* Bukti images */
      if(d.buktiFoto && d.buktiFoto.length){
        h += '<div style="padding:8px 12px;border-top:1px solid var(--bd);display:flex;gap:7px;flex-wrap:wrap;align-items:center">';
        h += '<span style="font-size:10px;font-weight:700;color:var(--tx2)">&#128248; Bukti:</span>';
        d.buktiFoto.forEach(function(img){
          h += '<img src="'+img+'" onclick="showImageFull(\''+img+'\')" style="width:72px;height:54px;object-fit:cover;border-radius:5px;border:1px solid var(--bd);cursor:pointer">';
        });
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h;
}

/* ── PESANAN VIEW ── */
function _supViewPesanan(allNames){
  var filtered = pesananData.filter(function(p){ return supplierFilter==='all'||(p.supplier||'')===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:7px">';
  h += '<span style="font-size:12px;font-weight:700;color:var(--navy)">&#128230; '+filtered.length+' pesanan</span>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h += '<button class="btnp" onclick="_openPOModal()" style="background:#1565C0;padding:9px 13px;font-size:12px">+ Buat Pesanan</button>';
  h += '<button class="btna" onclick="_importPO()" style="background:#2E7D32;padding:9px 12px;font-size:12px">&#128229; Import CSV</button>';
  h += '<button class="btna" onclick="_exportAllPO()" style="background:#E65100;padding:9px 12px;font-size:12px">&#128228; Export CSV</button>';
  h += '</div></div>';
  if(!filtered.length){
    return h+'<div class="card" style="text-align:center;padding:36px;color:var(--tx3)"><div style="font-size:36px">&#128230;</div><div>Belum ada pesanan.<br><small>Format CSV: SKU, Qty, Satuan, Harga</small></div></div>';
  }
  filtered.sort(function(a,b){return (b.id||0)-(a.id||0);}).forEach(function(p){
    var oi = pesananData.indexOf(p);
    var sc={'Pending':'#F57F17','Diterima':'#2E7D32','Dibatalkan':'#C62828'}[p.status]||'#546E7A';
    var gt=(p.items||[]).reduce(function(t,i){return t+(i.qty||0)*(i.harga||0);},0);
    h += '<div class="card" style="padding:0;overflow:hidden;margin-bottom:10px">';
    h += '<div style="background:var(--bg3);padding:9px 13px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px;border-bottom:1px solid var(--bd)">';
    h += '<div><b style="color:var(--navy)">PO-'+p.id+'</b> <span style="font-size:11px;color:var(--tx2)">'+esc(p.supplier||'-')+'</span> <span style="font-size:11px;color:var(--tx3)">'+esc(p.tgl||'-')+'</span>'+(p.catatan?' <span style="font-size:10px;color:var(--tx2)">'+esc(p.catatan)+'</span>':'')+'</div>';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<span class="chip" style="background:'+sc+'20;color:'+sc+'">'+esc(p.status||'Pending')+'</span>';
    h += '<select class="fi" onchange="pesananData['+oi+'].status=this.value;saveSupplierAll();renderSupplier()" style="padding:4px 7px;font-size:11px;width:auto">';
    ['Pending','Diterima','Dibatalkan'].forEach(function(s){h+='<option'+(p.status===s?' selected':'')+'>'+s+'</option>';});
    h += '</select>';
    h += '<button class="btnsm" onclick="_exportOnePO('+oi+')" style="background:#E65100;font-size:10px">Export</button>';
    h += '<button class="btnsm" onclick="confirmDelete(\'Hapus pesanan ini?\',function(){pesananData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" style="background:#C62828;font-size:10px">X</button>';
    h += '</div></div>';
    h += '<div style="overflow-x:auto"><table class="tbl" style="margin:0"><thead><tr><th>#</th><th>SKU / Produk</th><th class="c">Qty</th><th class="c">Satuan</th><th class="c">Harga</th><th class="c">Total</th></tr></thead><tbody>';
    (p.items||[]).forEach(function(item,ix){
      var tot=(item.qty||0)*(item.harga||0);
      h += '<tr><td>'+(ix+1)+'</td><td>'+esc(item.sku||'-')+'</td><td class="c">'+item.qty+'</td><td class="c">'+esc(item.satuan||'pcs')+'</td><td class="c">'+(item.harga?'Rp '+fmt(item.harga):'-')+'</td><td class="c" style="font-weight:700">'+(tot?'Rp '+fmt(tot):'-')+'</td></tr>';
    });
    if(gt) h += '<tr style="background:#0D2E5A"><td colspan="5" style="padding:6px 9px;color:#fff;font-weight:700;border:1px solid #1D4E8A">TOTAL</td><td class="c" style="color:#FFD700;font-weight:700;border:1px solid #1D4E8A">Rp '+fmt(gt)+'</td></tr>';
    h += '</tbody></table></div></div>';
  });
  return h;
}

/* ── DATA SUPPLIER VIEW ── */
function _supViewData(){
  var filtered = supplierData.filter(function(s){ return supplierFilter==='all'||s.nama===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:7px">';
  h += '<span style="font-size:12px;font-weight:700;color:var(--navy)">'+supplierData.length+' supplier terdaftar</span>';
  h += '<button class="btnp" onclick="_openSupDataModal(-1)" style="background:#00838F;padding:9px 14px;font-size:12px">+ Tambah Supplier</button></div>';
  if(!filtered.length) return h+'<div class="card" style="text-align:center;padding:30px;color:var(--tx3)">Belum ada data supplier. Klik + Tambah Supplier.</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:11px">';
  filtered.forEach(function(sup){
    var oi=supplierData.indexOf(sup);
    h += '<div class="card" style="padding:13px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
    h += '<div style="display:flex;gap:9px;align-items:center">';
    h += '<div style="width:36px;height:36px;border-radius:50%;background:#1A237E;display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:700">'+sup.nama.charAt(0).toUpperCase()+'</div>';
    h += '<div><div style="font-weight:700;color:var(--navy)">'+esc(sup.nama)+'</div><div style="font-size:10px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+'</div></div></div>';
    h += '<div style="display:flex;gap:5px">';
    h += '<button class="btnsm" onclick="_openSupDataModal('+oi+')" style="background:#F57F17">Edit</button>';
    h += '<button class="btnsm" onclick="confirmDelete(\'Hapus supplier <b>'+esc(sup.nama)+'</b>?\',function(){supplierData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" style="background:#C62828">X</button>';
    h += '</div></div>';
    var fields=[['&#128222;',sup.telepon],['&#128205;',sup.lokasi],['&#9993;',sup.email],['&#127974;',sup.bank],['&#128179;',sup.rekening],['&#128200;',sup.metodeBayar]];
    h += '<div style="font-size:11px;display:flex;flex-direction:column;gap:4px">';
    fields.forEach(function(f){ if(f[1]) h += '<div style="display:flex;gap:7px"><span>'+f[0]+'</span><span style="color:var(--tx2)">'+esc(f[1])+'</span></div>'; });
    h += '</div>';
    if(sup.catatan) h += '<div style="font-size:11px;color:var(--tx2);margin-top:7px;padding-top:7px;border-top:1px solid var(--bd)">'+esc(sup.catatan)+'</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ── HISTORY BAYAR VIEW ── */
function _supViewHistory(){
  var all=[];
  supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; })
    .forEach(function(d){
      (d.bayar||[]).forEach(function(b){
        all.push({tgl:b.tgl,ket:b.keterangan,jml:parseFloat(b.jumlah)||0,sup:d.namaSupplier||'Golden Fish',periode:(d.bulan||'')+' '+(d.tahun||''),bukti:b.bukti||''});
      });
    });
  all.sort(function(a,b){return (b.tgl||'').localeCompare(a.tgl||'');});
  var total=all.reduce(function(t,b){return t+b.jml;},0);
  var h = '<div class="card">';
  h += '<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:9px">&#128336; History Semua Pembayaran</div>';
  if(!all.length){ h+='<div style="text-align:center;padding:24px;color:var(--tx3)">Belum ada pembayaran.</div></div>'; return h; }
  h += '<div style="background:#E8F5E9;border-radius:6px;padding:8px 12px;margin-bottom:9px;font-size:12px;font-weight:700;color:#2E7D32">Total Terbayar: Rp '+fmt(total)+'</div>';
  h += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>Supplier</th><th>Periode</th><th>Keterangan</th><th class="c">Jumlah</th><th class="c">Bukti</th></tr></thead><tbody>';
  all.forEach(function(b){
    h += '<tr><td style="white-space:nowrap">'+esc(b.tgl||'-')+'</td><td style="font-weight:700">'+esc(b.sup)+'</td><td style="font-size:10px;color:var(--tx2)">'+esc(b.periode)+'</td><td>'+esc(b.ket||'-')+'</td>';
    h += '<td class="c" style="font-weight:700;color:#2E7D32">Rp '+fmt(b.jml)+'</td>';
    h += '<td class="c">'+(b.bukti?'<img src="'+b.bukti+'" onclick="showImageFull(this.src)" style="width:34px;height:26px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--bd)">':'<span style="color:var(--tx3)">-</span>')+'</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

/* ── MODALS ── */
function _supModals(allNames){
  var today = new Date().toISOString().split('T')[0];
  var MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var nowM = new Date().getMonth();
  var nowY = new Date().getFullYear();
  var h = '';

  /* Nota Modal */
  h += '<div id="M-NOTA" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;justify-content:center;align-items:flex-start;overflow-y:auto;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:800px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4);margin:auto">';
  h += '<div style="background:#1A237E;color:#fff;padding:10px 14px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700">+ Tambah Nota Pembelian</span><button onclick="document.getElementById(\'M-NOTA\').style.display=\'none\'" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">&times;</button></div>';
  h += '<div class="g2" style="margin-bottom:10px">';
  h += '<div><label class="lbl">Nama Supplier</label><select id="MN-SUP" class="fi">';
  allNames.forEach(function(nm){h+='<option value="'+esc(nm)+'">'+esc(nm)+'</option>';});
  h += '</select></div>';
  h += '<div class="g2"><div><label class="lbl">Bulan</label><select id="MN-BLN" class="fi">';
  MONTHS.forEach(function(m,i){h+='<option value="'+m+'"'+(i===nowM?' selected':'')+' data-num="'+(i+1)+'">'+m+'</option>';});
  h += '</select></div><div><label class="lbl">Tahun</label><input id="MN-THN" class="fi" type="number" value="'+nowY+'"></div></div></div>';
  h += '<div style="margin-bottom:9px"><label class="lbl">Catatan</label><input id="MN-CAT" class="fi" placeholder="Catatan nota..."></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:7px;overflow:hidden;margin-bottom:10px">';
  h += '<div style="background:#0D2E5A;color:#fff;padding:7px 12px;font-size:11px;font-weight:700">Item Nota (Faktur)</div>';
  h += '<div id="MN-ITEMS">'+_notaRow(0)+'</div>';
  h += '<div style="padding:8px 12px"><button class="btna" onclick="(function(){var c=window._mnCnt=(window._mnCnt||1);window._mnCnt++;document.getElementById(\'MN-ITEMS\').insertAdjacentHTML(\'beforeend\',_notaRow(c))})()" style="background:#1565C0;padding:5px 11px;font-size:11px">+ Baris</button></div></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:7px;overflow:hidden;margin-bottom:10px">';
  h += '<div style="background:#1B5E20;color:#fff;padding:7px 12px;font-size:11px;font-weight:700">Pembayaran Sudah Dilakukan</div>';
  h += '<div id="MN-BAYAR">'+_bayarRow(0)+'</div>';
  h += '<div style="padding:8px 12px"><button class="btna" onclick="(function(){var c=window._mnBCnt=(window._mnBCnt||1);window._mnBCnt++;document.getElementById(\'MN-BAYAR\').insertAdjacentHTML(\'beforeend\',_bayarRow(c))})()" style="background:#2E7D32;padding:5px 11px;font-size:11px">+ Bayar</button></div></div>';
  h += '<div style="display:flex;justify-content:flex-end;gap:8px"><button class="btns" onclick="document.getElementById(\'M-NOTA\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveNota()" style="background:#1A237E">Simpan Nota</button></div>';
  h += '</div></div>';

  /* Bayar Modal */
  h += '<div id="M-BAYAR" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)">+ Tambah Pembayaran</div>';
  h += '<input type="hidden" id="MB-IDX">';
  h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Tanggal</label><input id="MB-TGL" class="fi" type="date" value="'+today+'"></div><div><label class="lbl">Jumlah (Rp)</label><input id="MB-JML" class="fi" type="number" placeholder="0"></div></div>';
  h += '<div style="margin-bottom:9px"><label class="lbl">Keterangan</label><input id="MB-KET" class="fi" placeholder="e.g. BAYAR BCA 25-2-26"></div>';
  h += '<div style="margin-bottom:12px"><label class="lbl">Upload Bukti Transfer</label><input type="file" id="MB-BUKTI" accept="image/*" class="fi" style="padding:5px" onchange="readImgAsB64(this.files[0],function(d){window._mbBukti=d;toast(\'Bukti diupload\',\'success\')})"></div>';
  h += '<div style="display:flex;gap:7px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-BAYAR\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBayar()" style="background:#2E7D32">Simpan</button></div>';
  h += '</div></div>';

  /* Bayar Bulk Modal */
  h += '<div id="M-BULK" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)">Bayar Hutang Supplier</div>';
  h += '<div id="M-BULK-BODY"></div>';
  h += '<div style="display:flex;gap:7px;justify-content:flex-end;margin-top:12px"><button class="btns" onclick="document.getElementById(\'M-BULK\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBulkBayar()" style="background:#2E7D32">Simpan Pembayaran</button></div>';
  h += '</div></div>';

  /* Bukti Upload Modal */
  h += '<div id="M-BUKTI" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:460px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)">Upload Bukti Nota / Transfer</div>';
  h += '<input type="hidden" id="MBUKTI-IDX">';
  h += '<div id="MBUKTI-PREVIEW" style="margin-bottom:10px"></div>';
  h += '<input type="file" id="MBUKTI-FILE" accept="image/*" class="fi" style="padding:5px;margin-bottom:12px" onchange="readImgAsB64(this.files[0],function(d){window._buktiImg=d;document.getElementById(\'MBUKTI-PREVIEW\').innerHTML=\'<img src=\\\'\'+d+\'\\\' style=\\\'max-width:100%;border-radius:6px\\\'>\'})"> ';
  h += '<div style="display:flex;gap:7px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-BUKTI\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBukti()" style="background:#6A1B9A">Simpan Bukti</button></div>';
  h += '</div></div>';

  /* Supplier Data Modal */
  h += '<div id="M-SUPDATA" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;justify-content:center;align-items:center;overflow-y:auto;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:620px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4);margin:auto">';
  h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)" id="M-SUPDATA-TITLE">Tambah Supplier</div>';
  h += '<input type="hidden" id="MSD-IDX" value="-1">';
  h += '<div class="g2" style="margin-bottom:9px">';
  h += '<div><label class="lbl">Nama *</label><input id="MSD-NAMA" class="fi" placeholder="Nama supplier"></div>';
  h += '<div><label class="lbl">Kategori</label><input id="MSD-KAT" class="fi" placeholder="Distributor / Brand"></div>';
  h += '<div><label class="lbl">No. Telepon</label><input id="MSD-TELP" class="fi" placeholder="08xxx"></div>';
  h += '<div><label class="lbl">Email</label><input id="MSD-EMAIL" class="fi" type="email" placeholder="email@..."></div>';
  h += '<div><label class="lbl">Lokasi / Kota</label><input id="MSD-LOK" class="fi" placeholder="Jakarta, dll"></div>';
  h += '<div><label class="lbl">Alamat</label><input id="MSD-ALAMAT" class="fi" placeholder="Alamat lengkap"></div>';
  h += '<div><label class="lbl">Bank / E-wallet</label><input id="MSD-BANK" class="fi" placeholder="BCA, BNI, Dana..."></div>';
  h += '<div><label class="lbl">No. Rekening</label><input id="MSD-REK" class="fi" placeholder="No rekening"></div>';
  h += '<div><label class="lbl">Atas Nama</label><input id="MSD-AN" class="fi" placeholder="Nama pemilik rekening"></div>';
  h += '<div><label class="lbl">Metode Bayar</label><select id="MSD-MB" class="fi"><option>Transfer</option><option>Cash</option><option>Tempo</option><option>COD</option></select></div>';
  h += '<div><label class="lbl">Tempo (hari)</label><input id="MSD-TEMPO" class="fi" type="number" placeholder="30"></div>';
  h += '<div><label class="lbl">NPWP</label><input id="MSD-NPWP" class="fi" placeholder="NPWP"></div>';
  h += '</div>';
  h += '<div style="margin-bottom:9px"><label class="lbl">Catatan</label><textarea id="MSD-CAT" class="fi" rows="2" placeholder="Catatan..."></textarea></div>';
  h += '<div style="display:flex;gap:7px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-SUPDATA\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveSupData()" style="background:#00838F">Simpan</button></div>';
  h += '</div></div>';

  /* PO Modal */
  h += '<div id="M-PO" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;justify-content:center;align-items:flex-start;overflow-y:auto;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:800px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4);margin:auto">';
  h += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--navy)">Buat Pesanan ke Supplier</div>';
  h += '<div class="g2" style="margin-bottom:10px"><div><label class="lbl">Supplier</label><select id="MPO-SUP" class="fi">';
  allNames.forEach(function(nm){h+='<option value="'+esc(nm)+'">'+esc(nm)+'</option>';});
  h += '</select></div><div><label class="lbl">Tanggal</label><input id="MPO-TGL" class="fi" type="date" value="'+today+'"></div></div>';
  h += '<div style="margin-bottom:9px"><label class="lbl">Catatan</label><input id="MPO-CAT" class="fi" placeholder="Catatan pesanan..."></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:7px;overflow:hidden;margin-bottom:10px">';
  h += '<div style="background:#0D2E5A;color:#fff;padding:7px 12px;font-size:11px;font-weight:700">Item Pesanan</div>';
  h += '<div id="MPO-ITEMS">'+_poRow(0)+'</div>';
  h += '<div style="padding:8px 12px"><button class="btna" onclick="(function(){var c=window._poCnt=(window._poCnt||1);window._poCnt++;document.getElementById(\'MPO-ITEMS\').insertAdjacentHTML(\'beforeend\',_poRow(c))})()" style="background:#1565C0;padding:5px 11px;font-size:11px">+ Produk</button></div></div>';
  h += '<div style="display:flex;justify-content:flex-end;gap:8px"><button class="btns" onclick="document.getElementById(\'M-PO\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_savePO()" style="background:#1565C0">Simpan Pesanan</button></div>';
  h += '</div></div>';

  return h;
}

/* ── ROW BUILDERS ── */
function _notaRow(i){
  return '<div style="display:flex;gap:7px;padding:7px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end" id="MNR-'+i+'">'
    +'<div style="flex:1;min-width:110px"><label class="lbl">Tanggal</label><input id="MN-TGL-'+i+'" class="fi" type="date" value="'+new Date().toISOString().split('T')[0]+'"></div>'
    +'<div style="flex:1;min-width:110px"><label class="lbl">No Dokumen</label><input id="MN-DOK-'+i+'" class="fi" placeholder="226010044"></div>'
    +'<div style="flex:2;min-width:150px"><label class="lbl">Keterangan</label><input id="MN-KET-'+i+'" class="fi" placeholder="STGF S.DAMYL..."></div>'
    +'<div style="flex:1;min-width:70px"><label class="lbl">Kode</label><input id="MN-KOD-'+i+'" class="fi" placeholder="DM"></div>'
    +'<div style="flex:1;min-width:110px"><label class="lbl">Nilai Netto (Rp)</label><input id="MN-NET-'+i+'" class="fi" type="number" placeholder="0"></div>'
    +(i>0?'<div style="align-self:flex-end"><button class="btna" onclick="document.getElementById(\'MNR-'+i+'\').remove()" style="background:#C62828;padding:6px 9px">&times;</button></div>':'<div style="width:36px"></div>')
    +'</div>';
}
function _bayarRow(i){
  return '<div style="display:flex;gap:7px;padding:7px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end" id="MBR-'+i+'">'
    +'<div style="flex:1"><label class="lbl">Tanggal</label><input id="MB-TGL-'+i+'" class="fi" type="date" value="'+new Date().toISOString().split('T')[0]+'"></div>'
    +'<div style="flex:2"><label class="lbl">Keterangan</label><input id="MB-KET-'+i+'" class="fi" placeholder="BAYAR BCA 25-2-26"></div>'
    +'<div style="flex:1"><label class="lbl">Jumlah (Rp)</label><input id="MB-JML-'+i+'" class="fi" type="number" placeholder="0"></div>'
    +(i>0?'<div style="align-self:flex-end"><button class="btna" onclick="document.getElementById(\'MBR-'+i+'\').remove()" style="background:#C62828;padding:6px 9px">&times;</button></div>':'<div style="width:36px"></div>')
    +'</div>';
}
function _poRow(i){
  return '<div style="display:flex;gap:7px;padding:7px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end" id="POR-'+i+'">'
    +'<div style="flex:3"><label class="lbl">SKU / Nama Produk</label><input id="PO-SKU-'+i+'" class="fi" placeholder="Nama produk"></div>'
    +'<div style="flex:1;min-width:80px"><label class="lbl">Qty</label><input id="PO-QTY-'+i+'" class="fi" type="number" placeholder="0"></div>'
    +'<div style="flex:1;min-width:70px"><label class="lbl">Satuan</label><input id="PO-SAT-'+i+'" class="fi" placeholder="pcs"></div>'
    +'<div style="flex:1;min-width:90px"><label class="lbl">Harga</label><input id="PO-HRG-'+i+'" class="fi" type="number" placeholder="0"></div>'
    +(i>0?'<div style="align-self:flex-end"><button class="btna" onclick="document.getElementById(\'POR-'+i+'\').remove()" style="background:#C62828;padding:6px 9px">&times;</button></div>':'')
    +'</div>';
}

/* ── OPEN MODAL FUNCTIONS ── */
function _openNotaModal(){ window._mnCnt=1; window._mnBCnt=1; document.getElementById('MN-ITEMS').innerHTML=_notaRow(0); document.getElementById('MN-BAYAR').innerHTML=_bayarRow(0); document.getElementById('M-NOTA').style.display='flex'; }
function _openBayarModal(idx){ window._mbBukti=''; document.getElementById('MB-IDX').value=idx; document.getElementById('MB-TGL').value=new Date().toISOString().split('T')[0]; document.getElementById('MB-JML').value=''; document.getElementById('MB-KET').value=''; document.getElementById('M-BAYAR').style.display='flex'; }
function _openBuktiModal(idx){ window._buktiImg=''; document.getElementById('MBUKTI-IDX').value=idx; document.getElementById('MBUKTI-PREVIEW').innerHTML=''; document.getElementById('M-BUKTI').style.display='flex'; }
function _openPOModal(){ window._poCnt=1; document.getElementById('MPO-ITEMS').innerHTML=_poRow(0); document.getElementById('M-PO').style.display='flex'; }
function _openSupDataModal(idx){
  var s = idx>=0 ? supplierData[idx] : {};
  document.getElementById('MSD-IDX').value=idx;
  document.getElementById('M-SUPDATA-TITLE').textContent = idx>=0 ? 'Edit Supplier: '+s.nama : 'Tambah Supplier';
  var set=function(id,v){var el=document.getElementById(id);if(el)el.value=v||'';};
  set('MSD-NAMA',s.nama);set('MSD-KAT',s.kategori);set('MSD-TELP',s.telepon);set('MSD-EMAIL',s.email);
  set('MSD-LOK',s.lokasi);set('MSD-ALAMAT',s.alamat);set('MSD-BANK',s.bank);set('MSD-REK',s.rekening);
  set('MSD-AN',s.atasNama);set('MSD-NPWP',s.npwp);set('MSD-TEMPO',s.tempo);set('MSD-CAT',s.catatan);
  var mb=document.getElementById('MSD-MB');if(mb&&s.metodeBayar){for(var i=0;i<mb.options.length;i++){if(mb.options[i].value===s.metodeBayar){mb.selectedIndex=i;break;}}}
  document.getElementById('M-SUPDATA').style.display='flex';
}
function _openBayarBulk(supName){
  var notaUnpaid = supplierHutang.filter(function(d){
    if((d.namaSupplier||'Golden Fish')!==supName) return false;
    var saldo=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0)-(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    return saldo>0;
  });
  var totalSaldo=notaUnpaid.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0)-(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0);
  document.getElementById('M-BULK-BODY').innerHTML=
    '<div style="background:var(--bg3);border-radius:6px;padding:10px;margin-bottom:10px;font-size:12px"><b>Supplier:</b> '+esc(supName)+'<br><b>Total Saldo:</b> <span style="color:#C62828;font-weight:700">Rp '+fmt(totalSaldo)+'</span><br><b>Nota belum lunas:</b> '+notaUnpaid.length+'</div>'
    +'<input type="hidden" id="MBK-SUP" value="'+esc(supName)+'">'
    +'<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Tanggal Bayar</label><input id="MBK-TGL" class="fi" type="date" value="'+new Date().toISOString().split('T')[0]+'"></div>'
    +'<div><label class="lbl">Jumlah (Rp)</label><input id="MBK-JML" class="fi" type="number" value="'+totalSaldo+'"></div></div>'
    +'<div style="margin-bottom:9px"><label class="lbl">Keterangan</label><input id="MBK-KET" class="fi" placeholder="BAYAR BCA April 2026"></div>'
    +'<div><label class="lbl">Upload Bukti Transfer</label><input type="file" id="MBK-BUKTI" accept="image/*" class="fi" style="padding:5px" onchange="readImgAsB64(this.files[0],function(d){window._mbkBukti=d;toast(\'Bukti diupload\',\'success\')})"></div>';
  document.getElementById('M-BULK').style.display='flex';
}

/* ── SAVE FUNCTIONS ── */
function _saveNota(){
  var nota=[],i=0;
  while(document.getElementById('MN-TGL-'+i)){
    var net=parseFloat(document.getElementById('MN-NET-'+i).value)||0;
    var ket=document.getElementById('MN-KET-'+i).value.trim();
    if(ket||net>0) nota.push({tgl:document.getElementById('MN-TGL-'+i).value,noDok:document.getElementById('MN-DOK-'+i).value.trim(),keterangan:ket,kode:document.getElementById('MN-KOD-'+i).value.trim(),nilaiNetto:net});
    i++;
  }
  var bayar=[],j=0;
  while(document.getElementById('MB-TGL-'+j)){
    var jml=parseFloat(document.getElementById('MB-JML-'+j).value)||0;
    if(jml>0) bayar.push({tgl:document.getElementById('MB-TGL-'+j).value,keterangan:document.getElementById('MB-KET-'+j).value.trim(),jumlah:jml});
    j++;
  }
  if(!nota.length&&!bayar.length){toast('Isi minimal 1 nota atau pembayaran','warn');return;}
  var blnEl=document.getElementById('MN-BLN');
  var blnNum = blnEl ? blnEl.selectedIndex+1 : new Date().getMonth()+1;
  var rec={id:Date.now(),namaSupplier:document.getElementById('MN-SUP').value,bulan:document.getElementById('MN-BLN').value,bulanNum:blnNum,tahun:parseInt(document.getElementById('MN-THN').value)||new Date().getFullYear(),catatan:document.getElementById('MN-CAT').value.trim(),nota:nota,bayar:bayar,buktiFoto:[],createdAt:isoNow()};
  supplierHutang.unshift(rec);
  saveSupplier();
  document.getElementById('M-NOTA').style.display='none';
  toast('✅ Nota disimpan!','success');
  renderSupplier();
}
function _saveBayar(){
  var idx=parseInt(document.getElementById('MB-IDX').value);
  var jml=parseFloat(document.getElementById('MB-JML').value)||0;
  if(!jml){toast('Isi jumlah bayar','error');return;}
  if(!supplierHutang[idx]){toast('Data tidak ditemukan','error');return;}
  if(!supplierHutang[idx].bayar) supplierHutang[idx].bayar=[];
  supplierHutang[idx].bayar.push({tgl:document.getElementById('MB-TGL').value,keterangan:document.getElementById('MB-KET').value,jumlah:jml,bukti:window._mbBukti||''});
  window._mbBukti='';
  saveSupplier();
  document.getElementById('M-BAYAR').style.display='none';
  toast('✅ Pembayaran disimpan!','success');
  renderSupplier();
}
function _saveBulkBayar(){
  var supName=document.getElementById('MBK-SUP').value;
  var jml=parseFloat(document.getElementById('MBK-JML').value)||0;
  if(!jml){toast('Isi jumlah bayar','error');return;}
  var remaining=jml;
  supplierHutang.forEach(function(d){
    if(remaining<=0) return;
    if((d.namaSupplier||'Golden Fish')!==supName) return;
    var saldo=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0)-(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    if(saldo<=0) return;
    var bayarIni=Math.min(remaining,saldo);
    if(!d.bayar) d.bayar=[];
    d.bayar.push({tgl:document.getElementById('MBK-TGL').value,keterangan:document.getElementById('MBK-KET').value||('BAYAR '+supName),jumlah:bayarIni,bukti:window._mbkBukti||''});
    remaining-=bayarIni;
  });
  window._mbkBukti='';
  saveSupplier();
  document.getElementById('M-BULK').style.display='none';
  toast('✅ Pembayaran Rp '+fmt(jml)+' disimpan!','success');
  renderSupplier();
}
function _saveBukti(){
  var idx=parseInt(document.getElementById('MBUKTI-IDX').value);
  if(!window._buktiImg){toast('Pilih file gambar dulu','error');return;}
  if(!supplierHutang[idx]) return;
  if(!supplierHutang[idx].buktiFoto) supplierHutang[idx].buktiFoto=[];
  supplierHutang[idx].buktiFoto.push(window._buktiImg);
  window._buktiImg='';
  saveSupplier();
  document.getElementById('M-BUKTI').style.display='none';
  toast('✅ Bukti disimpan!','success');
  renderSupplier();
}
function _saveSupData(){
  var nm=document.getElementById('MSD-NAMA').value.trim();
  if(!nm){toast('Nama supplier wajib','error');return;}
  var rec={nama:nm,kategori:document.getElementById('MSD-KAT').value.trim(),telepon:document.getElementById('MSD-TELP').value.trim(),email:document.getElementById('MSD-EMAIL').value.trim(),lokasi:document.getElementById('MSD-LOK').value.trim(),alamat:document.getElementById('MSD-ALAMAT').value.trim(),bank:document.getElementById('MSD-BANK').value.trim(),rekening:document.getElementById('MSD-REK').value.trim(),atasNama:document.getElementById('MSD-AN').value.trim(),metodeBayar:document.getElementById('MSD-MB').value,tempo:parseInt(document.getElementById('MSD-TEMPO').value)||0,npwp:document.getElementById('MSD-NPWP').value.trim(),catatan:document.getElementById('MSD-CAT').value.trim()};
  var editIdx=parseInt(document.getElementById('MSD-IDX').value);
  if(editIdx>=0) supplierData[editIdx]=rec; else supplierData.push(rec);
  saveSupplierAll();
  document.getElementById('M-SUPDATA').style.display='none';
  toast('✅ Data supplier disimpan!','success');
  renderSupplier();
}
function _savePO(){
  var items=[],i=0;
  while(document.getElementById('PO-SKU-'+i)){
    var sku=document.getElementById('PO-SKU-'+i).value.trim();
    var qty=parseInt(document.getElementById('PO-QTY-'+i).value)||0;
    if(sku||qty>0) items.push({sku:sku,qty:qty,satuan:document.getElementById('PO-SAT-'+i).value||'pcs',harga:parseInt(document.getElementById('PO-HRG-'+i).value)||0});
    i++;
  }
  if(!items.length){toast('Tambah minimal 1 produk','warn');return;}
  pesananData.push({id:Date.now(),supplier:document.getElementById('MPO-SUP').value,tgl:document.getElementById('MPO-TGL').value,catatan:document.getElementById('MPO-CAT').value,items:items,status:'Pending',createdAt:isoNow()});
  saveSupplierAll();
  document.getElementById('M-PO').style.display='none';
  toast('✅ Pesanan disimpan!','success');
  supplierView='pesanan'; renderSupplier();
}

/* ── IMPORT/EXPORT PO ── */
function _importPO(){
  var inp=document.createElement('input');inp.type='file';inp.accept='.csv,.txt';
  inp.onchange=function(e){
    var fr=new FileReader();
    fr.onload=function(ev){
      var lines=ev.target.result.split('\n').filter(function(l){return l.trim();});
      if(lines.length<2){toast('File kosong atau format salah','error');return;}
      var items=[];
      for(var i=1;i<lines.length;i++){
        var cols=lines[i].split(',').map(function(c){return c.replace(/^"|"$/g,'').trim();});
        if(cols[0]) items.push({sku:cols[0],qty:parseInt(cols[1])||0,satuan:cols[2]||'pcs',harga:parseInt(cols[3])||0});
      }
      if(!items.length){toast('Tidak ada data valid','error');return;}
      pesananData.push({id:Date.now(),supplier:supplierFilter!=='all'?supplierFilter:'Golden Fish',tgl:new Date().toISOString().split('T')[0],catatan:'Import dari CSV',items:items,status:'Pending',createdAt:isoNow()});
      saveSupplierAll();
      toast('✅ '+items.length+' produk diimport!','success');
      supplierView='pesanan'; renderSupplier();
    };
    fr.readAsText(e.target.files[0]);
  };inp.click();
}
function _exportOnePO(idx){
  var p=pesananData[idx];if(!p)return;
  var rows=['"SKU","Qty","Satuan","Harga","Total"'];
  (p.items||[]).forEach(function(it){rows.push('"'+it.sku+'",'+it.qty+',"'+(it.satuan||'pcs')+'",'+it.harga+','+(it.qty*it.harga));});
  var blob=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PO_'+p.supplier+'_'+p.tgl+'.csv';a.click();
  toast('Export PO berhasil!','success');
}
function _exportAllPO(){
  var fl=pesananData.filter(function(p){return supplierFilter==='all'||(p.supplier||'')===supplierFilter;});
  if(!fl.length){toast('Tidak ada pesanan','warn');return;}
  var rows=['"PO ID","Supplier","Tanggal","SKU","Qty","Satuan","Harga","Total","Status"'];
  fl.forEach(function(p){(p.items||[]).forEach(function(it){rows.push('"'+p.id+'","'+p.supplier+'","'+p.tgl+'","'+it.sku+'",'+it.qty+',"'+(it.satuan||'pcs')+'",'+it.harga+','+(it.qty*it.harga)+',"'+p.status+'"');});});
  var blob=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Pesanan_AJW_'+new Date().toISOString().split('T')[0]+'.csv';a.click();
  toast('Export semua PO berhasil!','success');
}

/* ── PATCH deleteSupplierRecord to use confirmDelete + supabase ── */
deleteSupplierRecord = function(idx){
  var s = supplierHutang[idx];
  confirmDelete('Hapus nota supplier <b>'+esc((s&&s.namaSupplier)||'ini')+'</b>?<br><small style="color:var(--tx3)">Data tidak dapat dikembalikan.</small>', function(){
    if(s && s.id) sbDeleteRecord('ajw_supplier', s.id);
    supplierHutang.splice(idx,1);
    saveSupplier();
    toast('Nota dihapus','warn');
    renderSupplier();
  });
};

/* ── INIT ── */
loadSupplierAll();
(function(){
  var cfg = getCfg();
  if(cfg.fontScale) { currentFontScale = cfg.fontScale; document.documentElement.style.fontSize = (currentFontScale*14)+'px'; }
})();

/* ============================================================
   FIX PATCH v2
   1. Fix onclick JSON.stringify button bug
   2. Font scale = global (all AJW)
   3. Hutang grouped by month properly
   4. Import with drag & drop + template download
   5. Export to Excel (XLSX-compatible)
   6. Modern topbar theme
============================================================ */

/* ── GLOBAL FONT SCALE (overrides old one) ── */
setFontScale = function(scale){
  currentFontScale = Math.max(0.75, Math.min(1.5, scale));
  /* Apply to ENTIRE document, not just supplier */
  if(document.documentElement) document.documentElement.style.setProperty('font-size', (currentFontScale * 14) + 'px', 'important');
  if(document.body) document.body.style.fontSize = (currentFontScale * 14) + 'px';
  var cfg = getCfg(); cfg.fontScale = currentFontScale; saveCfg(cfg);
  /* Update ALL zoom labels */
  document.querySelectorAll('[id$="-SCALE-LBL"], #FONT-SCALE-LBL, #GLOBAL-ZOOM-LBL').forEach(function(el){
    el.textContent = Math.round(currentFontScale * 100) + '%';
  });
};

/* ── HELPER: safe onclick supplier name (no JSON.stringify double-quote issue) ── */
function _supName(nm){
  /* Encode supplier name for safe use in onclick attribute */
  return nm.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

/* ── MODERN TOPBAR: inject global zoom button ── */
(function(){
  var badge = document.getElementById('BADGE');
  if(badge && !document.getElementById('GLOBAL-ZOOM-WRAP')){
    var zw = document.createElement('div');
    zw.id = 'GLOBAL-ZOOM-WRAP';
    zw.style.cssText = 'display:flex;align-items:center;gap:5px;margin-right:6px';
    zw.innerHTML = '<span style="color:rgba(255,255,255,.6);font-size:10px">Zoom:</span>'
      + '<button onclick="setFontScale(currentFontScale-0.1)" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:12px">A-</button>'
      + '<span id="GLOBAL-ZOOM-LBL" style="color:#FFD700;font-size:11px;font-weight:700;min-width:34px;text-align:center">'
        + Math.round((currentFontScale||1)*100) + '%'
      + '</span>'
      + '<button onclick="setFontScale(currentFontScale+0.1)" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:12px">A+</button>';
    badge.parentNode.insertBefore(zw, badge);
  }
})();

/* ══════════════════════════════════════════════════════
   SUPPLIER OVERRIDES — fix all button issues
══════════════════════════════════════════════════════ */

renderSupplier = function(){
  loadSupplierAll();

  var fromData   = supplierData.map(function(s){ return s.nama; });
  var fromHutang = supplierHutang.map(function(d){ return d.namaSupplier||'Golden Fish'; });
  var allNames   = fromData.concat(fromHutang).filter(function(n,i,a){ return n && a.indexOf(n)===i; }).sort();
  if(!allNames.length) allNames = ['Golden Fish'];

  var sumBySup = {};
  allNames.forEach(function(nm){
    var list  = supplierHutang.filter(function(d){ return (d.namaSupplier||'Golden Fish')===nm; });
    var tNota = list.reduce(function(t,d){ return t+(d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0); },0);
    var tBayar= list.reduce(function(t,d){ return t+(d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0); },0);
    sumBySup[nm] = {nota:tNota, bayar:tBayar, saldo:tNota-tBayar, count:list.length};
  });
  var gNota  = Object.keys(sumBySup).reduce(function(t,k){ return t+sumBySup[k].nota; },0);
  var gBayar = Object.keys(sumBySup).reduce(function(t,k){ return t+sumBySup[k].bayar; },0);
  var gSaldo = gNota - gBayar;

  var cfg    = getCfg();
  var fScale = cfg.fontScale||1.0;

  var h = '';

  /* ── HEADER ── */
  h += '<div style="background:linear-gradient(135deg,#1E3A5F 0%,#1E4D8C 100%);padding:14px 18px;border-radius:var(--r);margin-bottom:12px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  h += '<div style="display:flex;align-items:center;gap:12px">';
  h += '<div style="width:44px;height:44px;border-radius:12px;background:rgba(255,215,0,.15);border:2px solid #FFD700;display:flex;align-items:center;justify-content:center;font-size:22px">&#128031;</div>';
  h += '<div><div style="color:#FFD700;font-weight:700;font-size:16px;letter-spacing:.3px">HUTANG SUPPLIER</div>';
  h += '<div style="color:#93C5FD;font-size:11px">'+allNames.length+' supplier &bull; '+supplierHutang.length+' nota &bull; Saldo: <b style="color:'+(gSaldo>0?'#FCA5A5':'#6EE7B7')+'">Rp '+fmt(gSaldo)+'</b></div></div></div>';
  /* Zoom in supplier header */
  h += '<div style="display:flex;align-items:center;gap:6px">';
  h += '<span style="color:rgba(255,255,255,.6);font-size:10px">Zoom:</span>';
  h += '<button onclick="setFontScale(currentFontScale-0.1)" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px">A-</button>';
  h += '<span id="FONT-SCALE-LBL" style="color:#FFD700;font-size:12px;font-weight:700;min-width:38px;text-align:center">'+Math.round(fScale*100)+'%</span>';
  h += '<button onclick="setFontScale(currentFontScale+0.1)" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px">A+</button>';
  h += '<button onclick="setFontScale(1.0)" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:10px">Reset</button>';
  h += '</div></div></div>';

  /* ── VIEW TABS ── */
  var views = [{id:'dashboard',lbl:'&#128202; Dashboard'},{id:'hutang',lbl:'&#128180; Hutang & Nota'},{id:'pesanan',lbl:'&#128230; Pesanan'},{id:'data',lbl:'&#128101; Data Supplier'},{id:'history',lbl:'&#128336; History Bayar'}];
  h += '<div style="display:flex;gap:4px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">';
  views.forEach(function(v){
    var act = supplierView===v.id;
    h += '<button onclick="supplierView=\''+v.id+'\';renderSupplier()" style="padding:9px 16px;border-radius:8px;border:1.5px solid '+(act?'var(--blue)':'var(--bd)')+';cursor:pointer;font-size:11px;font-weight:700;font-family:Arial;white-space:nowrap;background:'+(act?'var(--blue)':'var(--bg2)')+';color:'+(act?'#fff':'var(--tx2)')+'">'+v.lbl+'</button>';
  });
  h += '</div>';

  /* ── FILTER PILLS ── */
  h += '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center">';
  h += '<span style="font-size:11px;font-weight:600;color:var(--tx2)">Filter:</span>';
  var allAct = supplierFilter==='all';
  h += '<button onclick="supplierFilter=\'all\';renderSupplier()" style="padding:5px 14px;border-radius:20px;border:1.5px solid '+(allAct?'var(--blue)':'var(--bd)')+';background:'+(allAct?'var(--blue)':'var(--bg2)')+';color:'+(allAct?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">Semua</button>';
  allNames.forEach(function(nm){
    var act = supplierFilter===nm;
    /* FIX: use escaped single quotes, NOT JSON.stringify */
    var safeNm = _supName(nm);
    h += '<button onclick="supplierFilter=\''+safeNm+'\';renderSupplier()" style="padding:5px 14px;border-radius:20px;border:1.5px solid '+(act?'var(--blue)':'var(--bd)')+';background:'+(act?'var(--blue)':'var(--bg2)')+';color:'+(act?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">'+esc(nm)+'</button>';
  });
  h += '</div>';

  /* ── CONTENT ── */
  if(supplierView==='dashboard')  h += _supDash(allNames, sumBySup, gNota, gBayar, gSaldo);
  else if(supplierView==='hutang') h += _supHutang();
  else if(supplierView==='pesanan')h += _supPesanan(allNames);
  else if(supplierView==='data')   h += _supData();
  else if(supplierView==='history')h += _supHistory();

  h += _supAllModals(allNames);
  document.getElementById('V-supplier').innerHTML = h;
};

/* ────────────────────────────────────────────
   DASHBOARD
──────────────────────────────────────────── */
function _supDash(names, sum, gNota, gBayar, gSaldo){
  var h = '';
  /* Grand total cards */
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  var cards = [
    {label:'Total Pembelian', val:'Rp '+fmt(gNota), color:'#EF4444', bg:'#FEF2F2', icon:'&#128181;'},
    {label:'Total Terbayar',  val:'Rp '+fmt(gBayar), color:'#10B981', bg:'#ECFDF5', icon:'&#9989;'},
    {label:'Saldo Hutang',    val:'Rp '+fmt(gSaldo), color:gSaldo>0?'#F97316':'#10B981', bg:gSaldo>0?'#FFF7ED':'#ECFDF5', icon:'&#9203;'},
    {label:'Jumlah Nota',     val:supplierHutang.length+' nota', color:'#3B82F6', bg:'#EFF6FF', icon:'&#128196;'}
  ];
  cards.forEach(function(c){
    h += '<div style="background:'+c.bg+';border-radius:var(--r);padding:16px;border:1px solid var(--bd)">';
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    h += '<div style="width:36px;height:36px;border-radius:8px;background:'+c.color+'20;display:flex;align-items:center;justify-content:center;font-size:16px">'+c.icon+'</div>';
    h += '<span style="font-size:11px;font-weight:600;color:'+c.color+'">'+c.label+'</span></div>';
    h += '<div style="font-size:20px;font-weight:800;color:'+c.color+'">'+c.val+'</div></div>';
  });
  h += '</div>';

  /* Per-supplier cards */
  var filtered = supplierFilter==='all' ? names : names.filter(function(n){ return n===supplierFilter; });
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:16px">';
  filtered.forEach(function(nm){
    var s   = sum[nm]||{nota:0,bayar:0,saldo:0,count:0};
    var pct = s.nota>0 ? Math.min(100,Math.round(s.bayar/s.nota*100)) : 0;
    var sup = supplierData.filter(function(d){ return d.nama===nm; })[0]||{};
    var safeNm = _supName(nm);
    h += '<div class="card" style="padding:16px;position:relative;overflow:hidden">';
    h += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#3B82F6,#8B5CF6)"></div>';
    /* Avatar + info */
    h += '<div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">';
    h += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#1E3A5F,#3B82F6);display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:800;font-size:18px;flex-shrink:0">'+nm.charAt(0).toUpperCase()+'</div>';
    h += '<div><div style="font-weight:700;color:var(--tx);font-size:14px">'+esc(nm)+'</div>';
    h += '<div style="font-size:11px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+(sup.telepon?' &bull; '+esc(sup.telepon):'')+'</div></div></div>';
    /* Progress */
    h += '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px"><span style="color:var(--tx2)">Terbayar</span><span style="font-weight:700;color:'+(pct>=100?'#10B981':'#F97316')+'">'+pct+'%</span></div>';
    h += '<div style="height:7px;background:var(--bg3);border-radius:4px;margin-bottom:12px">';
    h += '<div style="height:100%;border-radius:4px;background:'+(pct>=100?'#10B981':pct>=50?'#F59E0B':'#EF4444')+';width:'+pct+'%;transition:width .5s"></div></div>';
    /* Stats grid */
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px">';
    [['Nota','Rp '+fmt(s.nota),'#EF4444'],['Terbayar','Rp '+fmt(s.bayar),'#10B981'],
     ['Saldo','Rp '+fmt(s.saldo),s.saldo>0?'#F97316':'#10B981'],['Jumlah',s.count+' nota','#3B82F6']].forEach(function(r){
      h += '<div style="background:var(--bg3);padding:8px;border-radius:8px">';
      h += '<div style="font-size:9px;font-weight:600;color:var(--tx2);margin-bottom:2px">'+r[0].toUpperCase()+'</div>';
      h += '<div style="font-weight:700;color:'+r[2]+';font-size:12px">'+r[1]+'</div></div>';
    });
    h += '</div>';
    /* Buttons - FIX: use _supName(nm) */
    h += '<div style="display:flex;gap:8px">';
    h += '<button onclick="supplierFilter=\''+safeNm+'\';supplierView=\'hutang\';renderSupplier()" class="btnp" style="flex:1;padding:8px;font-size:11px;background:#1E3A5F">Lihat Nota</button>';
    if(s.saldo>0) h += '<button onclick="_openBayarBulk(\''+safeNm+'\')" class="btna" style="background:#10B981;flex:1;padding:8px;font-size:11px">Bayar</button>';
    h += '</div></div>';
  });
  h += '</div>';

  /* Monthly recap */
  h += '<div class="card"><div style="font-size:13px;font-weight:700;color:var(--tx);margin-bottom:12px">&#128336; Rekap Bulanan</div>';
  var mMap = {};
  supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; })
    .forEach(function(d){
      var mk = (d.tahun||'2026')+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
      if(!mMap[mk]) mMap[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0};
      mMap[mk].nota  += (d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0);
      mMap[mk].bayar += (d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0);
    });
  var mKeys = Object.keys(mMap).sort().reverse();
  if(mKeys.length){
    h += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Bulan</th><th class="c">Total Nota</th><th class="c">Terbayar</th><th class="c">Saldo</th><th class="c">Status</th></tr></thead><tbody>';
    mKeys.forEach(function(mk){
      var m=mMap[mk]; var saldo=m.nota-m.bayar;
      h += '<tr><td style="font-weight:700">'+esc(m.label)+'</td>';
      h += '<td class="c" style="color:#EF4444;font-weight:700">Rp '+fmt(m.nota)+'</td>';
      h += '<td class="c" style="color:#10B981;font-weight:700">Rp '+fmt(m.bayar)+'</td>';
      h += '<td class="c" style="font-weight:700;color:'+(saldo>0?'#F97316':'#10B981')+'">Rp '+fmt(saldo)+'</td>';
      h += '<td class="c"><span class="chip" style="background:'+(saldo<=0?'#ECFDF5':'#FFF7ED')+';color:'+(saldo<=0?'#10B981':'#F97316')+'">'+(saldo<=0?'&#9989; Lunas':'&#9203; Belum')+'</span></td></tr>';
    });
    h += '</tbody></table></div>';
  } else h += '<div style="text-align:center;padding:20px;color:var(--tx3)">Belum ada data</div>';
  h += '</div>';

  /* Export all button */
  h += '<div style="display:flex;gap:8px;margin-top:4px">';
  h += '<button class="btna" onclick="_exportExcelAll()" style="background:#10B981;padding:9px 16px;font-size:12px">&#128229; Export Excel Semua Supplier</button>';
  h += '<button class="btna" onclick="if(supplierFilter!==\'all\')_exportExcelOne(supplierFilter);else toast(\'Pilih 1 supplier dulu\',\'warn\')" style="background:#3B82F6;padding:9px 16px;font-size:12px">&#128229; Export Supplier Aktif</button>';
  h += '</div>';
  return h;
}

/* ────────────────────────────────────────────
   HUTANG & NOTA — grouped by MONTH
──────────────────────────────────────────── */
function _supHutang(){
  var filtered = supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
  h += '<span style="font-size:13px;font-weight:700;color:var(--tx)">'+filtered.length+' nota ditemukan</span>';
  h += '<div style="display:flex;gap:7px;flex-wrap:wrap">';
  h += '<button class="btna" onclick="_exportExcelAll()" style="background:#10B981;padding:8px 13px;font-size:11px">&#128229; Export Excel</button>';
  h += '<button class="btnp" onclick="_openNotaModal()" style="background:linear-gradient(135deg,#1E3A5F,#3B82F6);padding:9px 16px;font-size:12px">+ Tambah Nota</button>';
  h += '</div></div>';

  if(!filtered.length){
    return h+'<div class="card" style="text-align:center;padding:40px;color:var(--tx3)"><div style="font-size:40px;margin-bottom:10px">&#128031;</div><div>Belum ada nota. Klik + Tambah Nota.</div></div>';
  }

  /* Group by MONTH (key: tahun-bulanNum), then per nota inside */
  var monthGroups = {};
  filtered.forEach(function(d){
    var mk = (d.tahun||'2026')+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
    var mlabel = (d.bulan||'')+' '+(d.tahun||'');
    if(!monthGroups[mk]) monthGroups[mk] = {label:mlabel, items:[]};
    monthGroups[mk].items.push(d);
  });
  var monthKeys = Object.keys(monthGroups).sort().reverse();

  monthKeys.forEach(function(mk){
    var mg = monthGroups[mk];
    /* Per month: compute summary across all notas in this month */
    var mNota  = mg.items.reduce(function(t,d){ return t+(d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0); },0);
    var mBayar = mg.items.reduce(function(t,d){ return t+(d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0); },0);
    var mSaldo = mNota - mBayar;

    /* Group suppliers within this month */
    var supGroups = {};
    mg.items.forEach(function(d){
      var sn = d.namaSupplier||'Golden Fish';
      if(!supGroups[sn]) supGroups[sn] = [];
      supGroups[sn].push(d);
    });

    h += '<div style="margin-bottom:20px">';
    /* Month header */
    h += '<div style="background:linear-gradient(135deg,#1E3A5F,#1E4D8C);border-radius:var(--r) var(--r) 0 0;padding:11px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h += '<div style="display:flex;align-items:center;gap:10px">';
    h += '<div style="background:rgba(255,215,0,.2);border-radius:8px;padding:5px 10px;color:#FFD700;font-weight:700;font-size:13px">&#128197; '+esc(mg.label)+'</div>';
    h += '<span style="color:#93C5FD;font-size:11px">'+mg.items.length+' nota</span></div>';
    h += '<div style="display:flex;gap:14px;font-size:11px">';
    h += '<span style="color:rgba(255,255,255,.7)">Nota: <b style="color:#FCA5A5">Rp '+fmt(mNota)+'</b></span>';
    h += '<span style="color:rgba(255,255,255,.7)">Bayar: <b style="color:#6EE7B7">Rp '+fmt(mBayar)+'</b></span>';
    h += '<span style="color:rgba(255,255,255,.7)">Saldo: <b style="color:'+(mSaldo>0?'#FCD34D':'#6EE7B7')+'">Rp '+fmt(mSaldo)+'</b></span>';
    h += '</div></div>';

    /* Notas inside this month */
    h += '<div style="border:1px solid var(--bd);border-top:none;border-radius:0 0 var(--r) var(--r);overflow:hidden">';
    Object.keys(supGroups).forEach(function(sn, sIdx){
      var snNotes = supGroups[sn];
      var snNota  = snNotes.reduce(function(t,d){ return t+(d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0); },0);
      var snBayar = snNotes.reduce(function(t,d){ return t+(d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0); },0);
      var snSaldo = snNota - snBayar;
      var safeNm  = _supName(sn);

      if(Object.keys(supGroups).length > 1){
        /* Supplier sub-header inside month */
        h += '<div style="background:var(--bg3);padding:8px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bd)">';
        h += '<b style="color:var(--tx);font-size:12px">&#128031; '+esc(sn)+'</b>';
        h += '<div style="display:flex;gap:10px;font-size:11px">';
        h += '<span style="color:#EF4444">Nota: Rp '+fmt(snNota)+'</span>';
        h += '<span style="color:#10B981">Bayar: Rp '+fmt(snBayar)+'</span>';
        h += '<span style="color:'+(snSaldo>0?'#F97316':'#10B981')+'">Saldo: Rp '+fmt(snSaldo)+'</span>';
        if(snSaldo>0) h += '<button onclick="_openBayarBulk(\''+safeNm+'\')" class="btnsm" style="background:#10B981">Bayar Semua</button>';
        h += '</div></div>';
      }

      /* Each nota */
      snNotes.forEach(function(d){
        var oi    = supplierHutang.indexOf(d);
        var tN    = (d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0);
        var tB    = (d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0); },0);
        var saldo = tN - tB;
        var lunas = saldo <= 0;

        h += '<div style="border-left:3px solid '+(lunas?'#10B981':'#EF4444')+';'+(sIdx>0?'border-top:1px solid var(--bd)':'') +'">';
        /* Nota header */
        h += '<div style="background:var(--bg4);padding:9px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px;border-bottom:1px solid var(--bd)">';
        h += '<div style="display:flex;align-items:center;gap:8px">';
        h += '<span class="chip" style="background:'+(lunas?'#ECFDF5':'#FEF2F2')+';color:'+(lunas?'#10B981':'#EF4444')+'">'+(lunas?'&#9989; Lunas':'&#9203; Belum Lunas')+'</span>';
        if(d.catatan) h += '<span style="font-size:11px;color:var(--tx2);background:var(--bg3);padding:2px 8px;border-radius:5px">'+esc(d.catatan)+'</span>';
        h += '</div>';
        h += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
        if(!lunas) h += '<button onclick="_openBayarModal('+oi+')" class="btnsm" style="background:#10B981;font-size:10px">+Bayar</button>';
        h += '<button onclick="genInvoiceSupplier('+oi+')" class="btnsm" style="background:#3B82F6;font-size:10px">Invoice</button>';
        h += '<button onclick="_openBuktiModal('+oi+')" class="btnsm" style="background:#8B5CF6;font-size:10px">&#128248; Bukti</button>';
        h += '<button onclick="_exportExcelOne(\''+safeNm+'\')" class="btnsm" style="background:#F97316;font-size:10px">Excel</button>';
        h += '<button onclick="deleteSupplierRecord('+oi+')" class="btnsm" style="background:#EF4444;font-size:10px">X</button>';
        h += '</div></div>';

        /* Transactions table */
        var txns=[];
        (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,isBayar:false,bukti:''});});
        (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,isBayar:true,bukti:b.bukti||''});});
        txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'');});

        h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">';
        h += '<thead><tr style="background:#1E3A5F"><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff;text-align:left">Tanggal</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff">No Dokumen</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff">Keterangan</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff">Kode</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff;text-align:right">Nilai Netto</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff;text-align:right">Bayar</th><th style="padding:7px 10px;border:1px solid rgba(255,255,255,.1);color:#fff;text-align:right">Saldo</th></tr></thead><tbody>';
        var sRun=0;
        txns.forEach(function(tx,ti){
          sRun=sRun+tx.netto-tx.bayar;
          h += '<tr style="background:'+(ti%2?'var(--bg3)':'var(--bg2)')+'">';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);white-space:nowrap;color:var(--tx)">'+esc(tx.tgl||'')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);color:var(--tx)">'+esc(tx.noDok||'')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);font-weight:'+(tx.isBayar?'700':'400')+';color:'+(tx.isBayar?'#3B82F6':'var(--tx)')+'">'+esc(tx.ket||'')+(tx.bukti?'&nbsp;<span style="color:#8B5CF6">&#128248;</span>':'')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);color:var(--tx2)">'+esc(tx.kode||'')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);text-align:right;color:'+(tx.netto>0?'#EF4444':'var(--tx3)')+'">'+( tx.netto>0?'Rp '+fmt(tx.netto):'-')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);text-align:right;color:'+(tx.bayar>0?'#10B981':'var(--tx3)')+'">'+( tx.bayar>0?'Rp '+fmt(tx.bayar):'-')+'</td>';
          h += '<td style="padding:6px 10px;border:1px solid var(--bd);text-align:right;font-weight:700;color:'+(sRun>0?'#F97316':'#10B981')+'">Rp '+fmt(sRun)+'</td></tr>';
        });
        h += '<tr style="background:#1E3A5F"><td colspan="4" style="padding:7px 10px;color:#fff;font-weight:700;border:1px solid rgba(255,255,255,.1)">TOTAL</td>';
        h += '<td style="padding:7px 10px;color:#FCA5A5;font-weight:700;text-align:right;border:1px solid rgba(255,255,255,.1)">Rp '+fmt(tN)+'</td>';
        h += '<td style="padding:7px 10px;color:#6EE7B7;font-weight:700;text-align:right;border:1px solid rgba(255,255,255,.1)">Rp '+fmt(tB)+'</td>';
        h += '<td style="padding:7px 10px;color:'+(saldo>0?'#FCD34D':'#6EE7B7')+';font-weight:700;text-align:right;border:1px solid rgba(255,255,255,.1)">Rp '+fmt(saldo)+'</td></tr>';
        h += '</tbody></table></div>';

        /* Bukti photos */
        if(d.buktiFoto && d.buktiFoto.length){
          h += '<div style="padding:9px 14px;border-top:1px solid var(--bd);display:flex;gap:7px;flex-wrap:wrap;align-items:center">';
          h += '<span style="font-size:10px;font-weight:600;color:var(--tx2)">&#128248; Bukti:</span>';
          d.buktiFoto.forEach(function(img){
            h += '<img src="'+img+'" onclick="showImageFull(this.src)" style="width:72px;height:54px;object-fit:cover;border-radius:6px;border:1px solid var(--bd);cursor:pointer;transition:transform .15s" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">';
          });
          h += '</div>';
        }
        h += '</div>';
      });
    });
    h += '</div></div>';
  });
  return h;
}

/* ────────────────────────────────────────────
   PESANAN — with drag & drop import
──────────────────────────────────────────── */
function _supPesanan(allNames){
  var filtered = pesananData.filter(function(p){ return supplierFilter==='all'||(p.supplier||'')===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
  h += '<span style="font-size:13px;font-weight:700;color:var(--tx)">'+filtered.length+' pesanan</span>';
  h += '<div style="display:flex;gap:7px;flex-wrap:wrap">';
  h += '<button class="btna" onclick="_dlPOTemplate()" style="background:#8B5CF6;padding:9px 13px;font-size:11px">&#128190; Download Template CSV</button>';
  h += '<button class="btnp" onclick="_openPOModal()" style="background:linear-gradient(135deg,#1E3A5F,#3B82F6);padding:9px 16px;font-size:12px">+ Buat Pesanan</button>';
  h += '</div></div>';

  /* Drag & Drop Import Zone */
  h += '<div id="DROP-ZONE" class="drop-zone" style="margin-bottom:14px"';
  h += ' ondragover="event.preventDefault();this.classList.add(\'dragover\')"';
  h += ' ondragleave="this.classList.remove(\'dragover\')"';
  h += ' ondrop="_handlePODrop(event)"';
  h += ' onclick="_importPO()">';
  h += '<div style="font-size:28px;margin-bottom:7px">&#128229;</div>';
  h += '<div style="font-size:13px;font-weight:700;color:var(--tx2)">Drag & Drop file CSV di sini</div>';
  h += '<div style="font-size:11px;color:var(--tx3);margin-top:3px">atau klik untuk pilih file &bull; Format: SKU, Qty, Satuan, Harga</div>';
  h += '<button class="btna" style="background:#10B981;padding:7px 16px;font-size:11px;margin-top:10px" onclick="event.stopPropagation();_exportAllPO()">&#128228; Export CSV</button>';
  h += '</div>';

  if(!filtered.length){
    return h+'<div class="card" style="text-align:center;padding:30px;color:var(--tx3)">Belum ada pesanan.</div>';
  }
  filtered.sort(function(a,b){return (b.id||0)-(a.id||0);}).forEach(function(p){
    var oi = pesananData.indexOf(p);
    var sc={'Pending':'#F59E0B','Diterima':'#10B981','Dibatalkan':'#EF4444'}[p.status]||'#6B7280';
    var gt=(p.items||[]).reduce(function(t,i){return t+(i.qty||0)*(i.harga||0);},0);
    h += '<div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">';
    h += '<div style="background:var(--bg3);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px;border-bottom:1px solid var(--bd)">';
    h += '<div><b style="color:var(--tx);font-size:12px">PO-'+p.id+'</b> <span style="font-size:11px;color:var(--tx2)">'+esc(p.supplier||'-')+'</span> <span style="font-size:11px;color:var(--tx3)">'+esc(p.tgl||'-')+'</span>'+(p.catatan?' <span style="font-size:10px;color:var(--tx2);background:var(--bg);padding:2px 6px;border-radius:4px">'+esc(p.catatan)+'</span>':'')+'</div>';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<span class="chip" style="background:'+sc+'20;color:'+sc+'">'+esc(p.status||'Pending')+'</span>';
    h += '<select class="fi" onchange="pesananData['+oi+'].status=this.value;saveSupplierAll();renderSupplier()" style="padding:4px 8px;font-size:11px;width:auto">';
    ['Pending','Diterima','Dibatalkan'].forEach(function(s){h+='<option'+(p.status===s?' selected':'')+'>'+s+'</option>';});
    h += '</select>';
    h += '<button onclick="_exportOnePO('+oi+')" class="btnsm" style="background:#F97316">Export</button>';
    h += '<button onclick="confirmDelete(\'Hapus pesanan ini?\',function(){pesananData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" class="btnsm" style="background:#EF4444">X</button>';
    h += '</div></div>';
    h += '<div style="overflow-x:auto"><table class="tbl" style="margin:0"><thead><tr><th>#</th><th>SKU/Produk</th><th class="c">Qty</th><th class="c">Satuan</th><th class="c">Harga</th><th class="c">Total</th></tr></thead><tbody>';
    (p.items||[]).forEach(function(item,ix){
      var tot=(item.qty||0)*(item.harga||0);
      h += '<tr><td>'+( ix+1)+'</td><td>'+esc(item.sku||'-')+'</td><td class="c">'+item.qty+'</td><td class="c">'+esc(item.satuan||'pcs')+'</td><td class="c">'+(item.harga?'Rp '+fmt(item.harga):'-')+'</td><td class="c" style="font-weight:700;color:#10B981">'+(tot?'Rp '+fmt(tot):'-')+'</td></tr>';
    });
    if(gt) h += '<tr style="background:#1E3A5F"><td colspan="5" style="padding:7px 10px;color:#fff;font-weight:700;border:1px solid rgba(255,255,255,.1)">TOTAL</td><td class="c" style="color:#6EE7B7;font-weight:700;border:1px solid rgba(255,255,255,.1)">Rp '+fmt(gt)+'</td></tr>';
    h += '</tbody></table></div></div>';
  });
  return h;
}

/* ────────────────────────────────────────────
   DATA SUPPLIER
──────────────────────────────────────────── */
function _supData(){
  var filtered = supplierData.filter(function(s){ return supplierFilter==='all'||s.nama===supplierFilter; });
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:7px">';
  h += '<span style="font-size:13px;font-weight:700;color:var(--tx)">'+supplierData.length+' supplier</span>';
  h += '<button class="btnp" onclick="_openSupDataModal(-1)" style="background:linear-gradient(135deg,#0EA5E9,#3B82F6);padding:9px 16px;font-size:12px">+ Tambah Supplier</button></div>';
  if(!filtered.length) return h+'<div class="card" style="text-align:center;padding:30px;color:var(--tx3)">Belum ada data supplier.</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';
  filtered.forEach(function(sup){
    var oi=supplierData.indexOf(sup);
    h += '<div class="card" style="padding:16px;position:relative;overflow:hidden">';
    h += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0EA5E9,#8B5CF6)"></div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">';
    h += '<div style="display:flex;gap:10px;align-items:center">';
    h += '<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1E3A5F,#3B82F6);display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:800;font-size:16px">'+sup.nama.charAt(0).toUpperCase()+'</div>';
    h += '<div><div style="font-weight:700;color:var(--tx);font-size:13px">'+esc(sup.nama)+'</div><div style="font-size:10px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+'</div></div></div>';
    h += '<div style="display:flex;gap:5px">';
    h += '<button onclick="_openSupDataModal('+oi+')" class="btnsm" style="background:#F59E0B">Edit</button>';
    h += '<button onclick="confirmDelete(\'Hapus supplier <b>'+esc(sup.nama)+'</b>?\',function(){supplierData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" class="btnsm" style="background:#EF4444">X</button>';
    h += '</div></div>';
    var fields=[['&#128222;',sup.telepon],['&#128205;',sup.lokasi],['&#9993;',sup.email],['&#127974;',sup.bank+'  '+esc(sup.rekening||'')],['&#128200;',sup.metodeBayar]];
    h += '<div style="font-size:11px;display:flex;flex-direction:column;gap:5px">';
    fields.forEach(function(f){ if(f[1]&&f[1].trim()) h += '<div style="display:flex;gap:8px;align-items:center"><span style="font-size:13px">'+f[0]+'</span><span style="color:var(--tx2)">'+esc(f[1].trim())+'</span></div>'; });
    h += '</div>';
    if(sup.catatan) h += '<div style="font-size:11px;color:var(--tx2);margin-top:8px;padding-top:8px;border-top:1px solid var(--bd)">'+esc(sup.catatan)+'</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ────────────────────────────────────────────
   HISTORY BAYAR
──────────────────────────────────────────── */
function _supHistory(){
  var all=[];
  supplierHutang.filter(function(d){ return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter; })
    .forEach(function(d){
      (d.bayar||[]).forEach(function(b){
        all.push({tgl:b.tgl,ket:b.keterangan,jml:parseFloat(b.jumlah)||0,sup:d.namaSupplier||'Golden Fish',periode:(d.bulan||'')+' '+(d.tahun||''),bukti:b.bukti||''});
      });
    });
  all.sort(function(a,b){return (b.tgl||'').localeCompare(a.tgl||'');});
  var total=all.reduce(function(t,b){return t+b.jml;},0);
  var h = '<div class="card">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:13px;font-weight:700;color:var(--tx)">History Pembayaran ('+all.length+')</span>';
  if(all.length) h += '<div style="background:#ECFDF5;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;color:#10B981">Total: Rp '+fmt(total)+'</div>';
  h += '</div>';
  if(!all.length){ h+='<div style="text-align:center;padding:24px;color:var(--tx3)">Belum ada pembayaran.</div></div>'; return h; }
  h += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>Supplier</th><th>Periode</th><th>Keterangan</th><th class="c">Jumlah</th><th class="c">Bukti</th></tr></thead><tbody>';
  all.forEach(function(b){
    h += '<tr><td style="white-space:nowrap">'+esc(b.tgl||'-')+'</td><td style="font-weight:700">'+esc(b.sup)+'</td><td style="font-size:10px;color:var(--tx2)">'+esc(b.periode)+'</td><td>'+esc(b.ket||'-')+'</td>';
    h += '<td class="c" style="font-weight:700;color:#10B981">Rp '+fmt(b.jml)+'</td>';
    h += '<td class="c">'+(b.bukti?'<img src="'+b.bukti+'" onclick="showImageFull(this.src)" style="width:36px;height:28px;object-fit:cover;border-radius:5px;cursor:pointer;border:1px solid var(--bd)">':'<span style="color:var(--tx3)">-</span>')+'</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

/* ────────────────────────────────────────────
   EXPORT TO EXCEL (CSV with full detail)
──────────────────────────────────────────── */
function _exportExcelAll(){
  _exportExcelCore(supplierHutang, 'Semua_Supplier');
}
function _exportExcelOne(supName){
  var list = supplierHutang.filter(function(d){ return (d.namaSupplier||'Golden Fish')===supName; });
  _exportExcelCore(list, supName.replace(/[^a-zA-Z0-9]/g,'_'));
}
function _exportExcelCore(list, filename){
  if(!list.length){ toast('Tidak ada data untuk diexport','warn'); return; }
  var rows = [];
  rows.push([
    'Supplier','Bulan','Tahun','Tanggal','No Dokumen','Keterangan','Kode',
    'Nilai Netto (Rp)','Tanggal Bayar','Keterangan Bayar','Jumlah Bayar (Rp)','Saldo (Rp)','Status'
  ].map(function(h){return '"'+h+'"';}).join(','));

  list.forEach(function(d){
    var sup  = d.namaSupplier||'Golden Fish';
    var tN   = (d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
    var tB   = (d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    var saldo= tN-tB;
    var status = saldo<=0?'Lunas':'Belum Lunas';

    /* Nota rows */
    (d.nota||[]).forEach(function(n){
      rows.push([
        '"'+esc(sup)+'"','"'+(d.bulan||'')+'"',d.tahun||'',
        '"'+(n.tgl||'')+'"','"'+(n.noDok||'')+'"','"'+(n.keterangan||'')+'"','"'+(n.kode||'')+'"',
        parseFloat(n.nilaiNetto)||0,
        '','','',
        saldo, '"'+status+'"'
      ].join(','));
    });
    /* Bayar rows */
    (d.bayar||[]).forEach(function(b){
      rows.push([
        '"'+esc(sup)+'"','"'+(d.bulan||'')+'"',d.tahun||'',
        '','','','',0,
        '"'+(b.tgl||'')+'"','"'+(b.keterangan||'')+'"',parseFloat(b.jumlah)||0,
        saldo, '"'+status+'"'
      ].join(','));
    });
    /* Spacer row per nota group */
    rows.push(',,,,,,,,,,,,');
  });

  var content = '\uFEFF' + rows.join('\n');
  var blob = new Blob([content], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'HutangSupplier_'+filename+'_'+ymd()+'.csv';
  a.click();
  toast('&#128229; Export berhasil: '+filename+'.csv','success',4000);
}

/* ────────────────────────────────────────────
   IMPORT PO — drag & drop + template download
──────────────────────────────────────────── */
function _handlePODrop(e){
  e.preventDefault();
  var dropZone = document.getElementById('DROP-ZONE');
  if(dropZone) dropZone.classList.remove('dragover');
  var file = e.dataTransfer.files[0];
  if(!file){ toast('Tidak ada file','error'); return; }
  _processPOFile(file);
}
function _importPO(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.csv,.txt';
  inp.onchange=function(ev){ if(ev.target.files[0]) _processPOFile(ev.target.files[0]); };
  inp.click();
}
function _processPOFile(file){
  var fr = new FileReader();
  fr.onload = function(ev){
    var lines = ev.target.result.split('\n').filter(function(l){ return l.trim(); });
    if(lines.length < 2){ toast('File kosong atau format salah','error'); return; }
    var items = [];
    for(var i=1; i<lines.length; i++){
      var cols = lines[i].split(',').map(function(c){ return c.replace(/^"|"$/g,'').trim(); });
      if(cols[0]) items.push({sku:cols[0], qty:parseInt(cols[1])||0, satuan:cols[2]||'pcs', harga:parseInt(cols[3])||0});
    }
    if(!items.length){ toast('Tidak ada data valid di file','error'); return; }
    var sup = supplierFilter !== 'all' ? supplierFilter : 'Golden Fish';
    pesananData.push({id:Date.now(), supplier:sup, tgl:ymd(), catatan:'Import dari: '+file.name, items:items, status:'Pending', createdAt:isoNow()});
    saveSupplierAll();
    toast('&#9989; '+items.length+' produk berhasil diimport!','success',4000);
    supplierView = 'pesanan';
    renderSupplier();
  };
  fr.readAsText(file);
}
function _dlPOTemplate(){
  var content = '\uFEFF"SKU/Nama Produk","Qty","Satuan","Harga Satuan"\n'
    + '"TALI GF [1 LAKBAN BIRU]-20/0.23MM",1000,"roll",0\n'
    + '"TALI GF [1 LAKBAN BIRU]-30/0.28MM",500,"roll",0\n'
    + '"Contoh Produk Lain",100,"pcs",0\n';
  var blob = new Blob([content], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Template_Pesanan_AJW.csv';
  a.click();
  toast('Template CSV berhasil didownload','success');
}

/* ────────────────────────────────────────────
   ALL MODALS (same structure, modern styling)
──────────────────────────────────────────── */
function _supAllModals(allNames){
  var today = new Date().toISOString().split('T')[0];
  var MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var nowM = new Date().getMonth();
  var nowY = new Date().getFullYear();
  var modalBg = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;justify-content:center;align-items:flex-start;overflow-y:auto;padding:20px;backdrop-filter:blur(4px)';
  var modalBox = 'background:var(--bg2);border-radius:var(--r);padding:22px;max-width:820px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);margin:auto;border:1px solid var(--bd)';
  var h = '';

  /* ── NOTA MODAL ── */
  h += '<div id="M-NOTA" style="display:none;'+modalBg+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox+'">';
  h += '<div style="background:linear-gradient(135deg,#1E3A5F,#1E4D8C);color:#fff;padding:12px 16px;border-radius:var(--rs);margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">';
  h += '<span style="font-weight:700;font-size:14px">+ Tambah Nota Pembelian</span>';
  h += '<button onclick="document.getElementById(\'M-NOTA\').style.display=\'none\'" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:16px">&times;</button></div>';
  h += '<div class="g2" style="margin-bottom:12px">';
  h += '<div><label class="lbl">Nama Supplier</label><select id="MN-SUP" class="fi">';
  allNames.forEach(function(nm){h+='<option value="'+esc(nm)+'">'+esc(nm)+'</option>';});
  h += '</select></div>';
  h += '<div class="g2"><div><label class="lbl">Bulan</label><select id="MN-BLN" class="fi">';
  MONTHS.forEach(function(m,i){h+='<option value="'+m+'"'+(i===nowM?' selected':'')+'>'+m+'</option>';});
  h += '</select></div><div><label class="lbl">Tahun</label><input id="MN-THN" class="fi" type="number" value="'+nowY+'"></div></div></div>';
  h += '<div style="margin-bottom:12px"><label class="lbl">Catatan</label><input id="MN-CAT" class="fi" placeholder="Catatan nota..."></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden;margin-bottom:12px">';
  h += '<div style="background:linear-gradient(135deg,#1E3A5F,#1E4D8C);color:#fff;padding:8px 13px;font-size:11px;font-weight:700">Item Nota (Faktur Pembelian)</div>';
  h += '<div id="MN-ITEMS">'+_notaRow(0)+'</div>';
  h += '<div style="padding:8px 12px;border-top:1px solid var(--bd)"><button class="btna" onclick="(function(){var c=window._mnCnt=(window._mnCnt||1);window._mnCnt++;document.getElementById(\'MN-ITEMS\').insertAdjacentHTML(\'beforeend\',_notaRow(c))})()" style="background:#3B82F6;padding:6px 12px;font-size:11px">+ Tambah Baris</button></div></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden;margin-bottom:14px">';
  h += '<div style="background:linear-gradient(135deg,#065F46,#10B981);color:#fff;padding:8px 13px;font-size:11px;font-weight:700">Pembayaran Sudah Dilakukan (opsional)</div>';
  h += '<div id="MN-BAYAR">'+_bayarRow(0)+'</div>';
  h += '<div style="padding:8px 12px;border-top:1px solid var(--bd)"><button class="btna" onclick="(function(){var c=window._mnBCnt=(window._mnBCnt||1);window._mnBCnt++;document.getElementById(\'MN-BAYAR\').insertAdjacentHTML(\'beforeend\',_bayarRow(c))})()" style="background:#10B981;padding:6px 12px;font-size:11px">+ Tambah Bayar</button></div></div>';
  h += '<div style="display:flex;justify-content:flex-end;gap:9px"><button class="btns" onclick="document.getElementById(\'M-NOTA\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveNota()" style="background:linear-gradient(135deg,#1E3A5F,#3B82F6)">Simpan Nota</button></div>';
  h += '</div></div>';

  /* ── BAYAR MODAL ── */
  h += '<div id="M-BAYAR" style="display:none;'+modalBg.replace('9998','9999')+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox.replace('820px','480px')+'">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;color:var(--tx)">&#128179; Tambah Pembayaran</div>';
  h += '<input type="hidden" id="MB-IDX">';
  h += '<div class="g2" style="margin-bottom:10px"><div><label class="lbl">Tanggal</label><input id="MB-TGL" class="fi" type="date" value="'+today+'"></div><div><label class="lbl">Jumlah (Rp)</label><input id="MB-JML" class="fi" type="number" placeholder="0"></div></div>';
  h += '<div style="margin-bottom:10px"><label class="lbl">Keterangan</label><input id="MB-KET" class="fi" placeholder="e.g. BAYAR BCA 25-2-26"></div>';
  h += '<div style="margin-bottom:14px"><label class="lbl">Upload Bukti Transfer</label>';
  h += '<input type="file" id="MB-BUKTI" accept="image/*" class="fi" style="padding:6px" onchange="readImgAsB64(this.files[0],function(d){window._mbBukti=d;toast(\'Bukti diupload &#10003;\',\'success\')})"></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-BAYAR\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBayar()" style="background:#10B981">Simpan Bayar</button></div>';
  h += '</div></div>';

  /* ── BAYAR BULK MODAL ── */
  h += '<div id="M-BULK" style="display:none;'+modalBg.replace('9998','9999')+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox.replace('820px','500px')+'">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;color:var(--tx)">&#128179; Bayar Hutang Supplier</div>';
  h += '<div id="M-BULK-BODY"></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btns" onclick="document.getElementById(\'M-BULK\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBulkBayar()" style="background:#10B981">Simpan Pembayaran</button></div>';
  h += '</div></div>';

  /* ── BUKTI MODAL ── */
  h += '<div id="M-BUKTI" style="display:none;'+modalBg.replace('9998','9999')+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox.replace('820px','460px')+'">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;color:var(--tx)">&#128248; Upload Bukti Nota / Transfer</div>';
  h += '<input type="hidden" id="MBUKTI-IDX">';
  h += '<div id="MBUKTI-PREVIEW" style="margin-bottom:10px"></div>';
  h += '<input type="file" id="MBUKTI-FILE" accept="image/*" class="fi" style="padding:6px;margin-bottom:14px" onchange="readImgAsB64(this.files[0],function(d){window._buktiImg=d;document.getElementById(\'MBUKTI-PREVIEW\').innerHTML=\'<img src=\\\'\'+d+\'\\\' style=\\\'max-width:100%;border-radius:8px;border:1px solid var(--bd)\\\'>\'})">';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-BUKTI\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveBukti()" style="background:#8B5CF6">Simpan Bukti</button></div>';
  h += '</div></div>';

  /* ── SUPPLIER DATA MODAL ── */
  h += '<div id="M-SUPDATA" style="display:none;'+modalBg.replace('9998','9999')+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox.replace('820px','640px')+'">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;color:var(--tx)" id="M-SUPDATA-TITLE">Tambah Supplier</div>';
  h += '<input type="hidden" id="MSD-IDX" value="-1">';
  h += '<div class="g2" style="margin-bottom:12px">';
  [['MSD-NAMA','Nama *','text','Nama supplier'],['MSD-KAT','Kategori','text','Distributor / Brand'],
   ['MSD-TELP','No. Telepon','text','08xxx'],['MSD-EMAIL','Email','email','email@...'],
   ['MSD-LOK','Lokasi / Kota','text','Jakarta, dll'],['MSD-ALAMAT','Alamat','text','Alamat lengkap'],
   ['MSD-BANK','Bank / E-wallet','text','BCA, BNI, Dana...'],['MSD-REK','No. Rekening','text','No rekening'],
   ['MSD-AN','Atas Nama','text','Nama pemilik rekening'],['MSD-NPWP','NPWP','text','NPWP']].forEach(function(f){
    h += '<div><label class="lbl">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="'+f[2]+'" placeholder="'+f[3]+'"></div>';
  });
  h += '<div><label class="lbl">Metode Bayar</label><select id="MSD-MB" class="fi"><option>Transfer</option><option>Cash</option><option>Tempo</option><option>COD</option></select></div>';
  h += '<div><label class="lbl">Tempo (hari)</label><input id="MSD-TEMPO" class="fi" type="number" placeholder="30"></div>';
  h += '</div>';
  h += '<div style="margin-bottom:14px"><label class="lbl">Catatan</label><textarea id="MSD-CAT" class="fi" rows="2" placeholder="Catatan..."></textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btns" onclick="document.getElementById(\'M-SUPDATA\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_saveSupData()" style="background:#0EA5E9">Simpan</button></div>';
  h += '</div></div>';

  /* ── PO MODAL ── */
  h += '<div id="M-PO" style="display:none;'+modalBg+'" onclick="if(event.target===this)this.style.display=\'none\'">';
  h += '<div style="'+modalBox+'">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:14px;color:var(--tx)">&#128230; Buat Pesanan ke Supplier</div>';
  h += '<div class="g2" style="margin-bottom:12px"><div><label class="lbl">Supplier</label><select id="MPO-SUP" class="fi">';
  allNames.forEach(function(nm){h+='<option value="'+esc(nm)+'">'+esc(nm)+'</option>';});
  h += '</select></div><div><label class="lbl">Tanggal</label><input id="MPO-TGL" class="fi" type="date" value="'+today+'"></div></div>';
  h += '<div style="margin-bottom:12px"><label class="lbl">Catatan</label><input id="MPO-CAT" class="fi" placeholder="Catatan pesanan..."></div>';
  h += '<div style="border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden;margin-bottom:14px">';
  h += '<div style="background:linear-gradient(135deg,#1E3A5F,#1E4D8C);color:#fff;padding:8px 13px;font-size:11px;font-weight:700">Item Pesanan</div>';
  h += '<div id="MPO-ITEMS">'+_poRow(0)+'</div>';
  h += '<div style="padding:8px 12px;border-top:1px solid var(--bd)"><button class="btna" onclick="(function(){var c=window._poCnt=(window._poCnt||1);window._poCnt++;document.getElementById(\'MPO-ITEMS\').insertAdjacentHTML(\'beforeend\',_poRow(c))})()" style="background:#3B82F6;padding:6px 12px;font-size:11px">+ Produk</button></div></div>';
  h += '<div style="display:flex;justify-content:flex-end;gap:9px"><button class="btns" onclick="document.getElementById(\'M-PO\').style.display=\'none\'">Batal</button><button class="btnp" onclick="_savePO()" style="background:linear-gradient(135deg,#1E3A5F,#3B82F6)">Simpan Pesanan</button></div>';
  h += '</div></div>';

  return h;
}

/* ============================================================
   FINAL PATCH — Notion-style Theme + Fixes
   Strategy: pure additive overrides only
============================================================ */

/* ── 1. REMOVE ZOOM BUTTONS from topbar (inject after DOM ready) ── */
(function removeZoom(){
  /* Remove GLOBAL-ZOOM-WRAP if it was added */
  var zw = document.getElementById('GLOBAL-ZOOM-WRAP');
  if(zw) zw.remove();
  /* Remove zoom buttons inside supplier header - handled by not rendering them */
  /* Reset font size to normal */
  document.documentElement.style.removeProperty('font-size');
  if(document.body) document.body.style.fontSize = '';
})();

/* ── 2. NOTION-STYLE CSS OVERRIDE ── */
(function applyNotionTheme(){
  var old = document.getElementById('NOTION-THEME-STYLE');
  if(old) old.remove();
  var style = document.createElement('style');
  style.id = 'NOTION-THEME-STYLE';
  style.textContent = `
    /* === NOTION MINIMAL THEME === */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --bg:#FFFFFF; --bg2:#FFFFFF; --bg3:#F7F7F5; --bg4:#F1F1EF;
      --bd:#E9E9E7; --bd2:#D5D5D0;
      --tx:#1C1C1C; --tx2:#6B6B6B; --tx3:#A5A5A0;
      --navy:#1C1C1C; --blue:#2B6CB0; --teal:#0D7B6D;
      --green:#276749; --red:#C53030; --orange:#C05621;
      --purple:#553C9A; --amber:#B7791F; --gold:#B7791F;
      --r:8px; --rs:6px;
      --sh:none;
      --sh2:0 0 0 1px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.06);
    }
    [data-theme=dark] {
      --bg:#1A1A1A; --bg2:#1A1A1A; --bg3:#242424; --bg4:#2C2C2C;
      --bd:#2E2E2E; --bd2:#3A3A3A;
      --tx:#EBEBEB; --tx2:#8B8B8B; --tx3:#555555;
    }

    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      background: var(--bg);
      color: var(--tx);
    }

    /* Topbar - minimal */
    .topbar {
      background: var(--bg2);
      border-bottom: 1px solid var(--bd);
      box-shadow: none;
      padding: 10px 20px;
    }

    /* Tab bar - notion style */
    .tabs {
      background: var(--bg2);
      border-bottom: 1px solid var(--bd);
      padding: 0 16px;
      gap: 0;
      box-shadow: none;
      position: sticky;
      top: 49px;
    }
    .tab {
      font-size: 13px;
      font-weight: 500;
      color: var(--tx2);
      padding: 10px 14px;
      border-radius: 0;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color .15s, border-color .15s;
    }
    .tab.act { color: var(--tx); border-bottom-color: var(--tx); font-weight: 600; }
    .tab.on:hover { color: var(--tx); background: transparent; }

    /* Body - wider, normal size */
    .body { max-width: 1280px; padding: 24px 28px; }

    /* Cards - notion-like */
    .card {
      background: var(--bg2);
      border: 1px solid var(--bd);
      border-radius: var(--r);
      box-shadow: none;
      padding: 16px;
      margin-bottom: 12px;
    }
    .card:hover { box-shadow: var(--sh2); }

    /* Form elements */
    input.fi, select.fi, textarea.fi {
      border: 1px solid var(--bd2);
      border-radius: var(--rs);
      font-size: 13px;
      padding: 7px 10px;
      background: var(--bg2);
      transition: border-color .15s, box-shadow .15s;
    }
    input.fi:focus, select.fi:focus, textarea.fi:focus {
      border-color: var(--tx2);
      box-shadow: none;
      outline: none;
    }
    label.lbl { font-size: 12px; font-weight: 500; color: var(--tx2); margin-bottom: 4px; }

    /* Buttons - minimal */
    .btnp {
      background: var(--tx);
      color: var(--bg);
      border-radius: var(--rs);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      box-shadow: none;
      transition: opacity .15s;
    }
    .btnp:hover { opacity: .8; transform: none; }
    .btns {
      background: var(--bg2);
      border: 1px solid var(--bd2);
      color: var(--tx2);
      border-radius: var(--rs);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 14px;
    }
    .btns:hover { background: var(--bg3); }
    .btna {
      background: var(--bg3);
      color: var(--tx);
      border-radius: var(--rs);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      box-shadow: none;
    }
    .btna:hover { background: var(--bg4); opacity: 1; transform: none; }
    .btnsm {
      background: var(--bg3);
      color: var(--tx);
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      padding: 3px 8px;
    }
    .btnsm:hover { background: var(--bd2); }

    /* Table */
    .tbl th {
      background: var(--bg3);
      color: var(--tx2);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      border: none;
      border-bottom: 1px solid var(--bd);
      padding: 8px 12px;
    }
    .tbl td {
      border: none;
      border-bottom: 1px solid var(--bg3);
      padding: 8px 12px;
      font-size: 13px;
      color: var(--tx);
    }
    .tbl tr:nth-child(even) td { background: transparent; }
    .tbl tr:nth-child(odd) td { background: transparent; }
    .tbl tr:hover td { background: var(--bg3); }

    /* Chip/badge */
    .chip {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    /* Toast */
    .toast {
      background: var(--tx);
      color: var(--bg);
      border-radius: var(--rs);
      box-shadow: var(--sh2);
      font-size: 13px;
      font-weight: 500;
    }

    /* Dashboard cards */
    .dash-card {
      border: 1px solid var(--bd);
      border-radius: var(--r);
      box-shadow: none;
      transition: box-shadow .15s;
    }
    .dash-card:hover { box-shadow: var(--sh2); }

    /* Progress bar */
    .pbar { height: 4px; background: var(--bg4); border-radius: 2px; }

    /* Supplier header */
    #V-supplier > div:first-child {
      background: var(--bg2) !important;
      border: 1px solid var(--bd) !important;
      border-radius: var(--r) !important;
    }

    /* Drop zone */
    .drop-zone {
      border: 1.5px dashed var(--bd2);
      background: var(--bg3);
      border-radius: var(--r);
      color: var(--tx2);
    }
    .drop-zone.dragover { border-color: var(--blue); background: #EBF4FF; color: var(--blue); }

    /* Admin sub-tabs */
    .adm-sub {
      font-size: 13px;
      font-weight: 500;
      color: var(--tx2);
      padding: 8px 14px;
      border-radius: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 3px; }
  `;
  document.head.appendChild(style);
})();

/* ── 3. UPDATE CORE_TABS & buildTabBar — remove finansial, operasional, aichat ── */
CORE_TABS = ['dash','eval','payroll','stats','emp','hist','kpi','supplier','taligf','admin'];

buildTabBar = function(){
  var c=getCfg(); var tc=c.tabsConfig||{};
  var defs=[
    {id:'dash',    lbl:'Dashboard'},
    {id:'eval',    lbl:'Penilaian'},
    {id:'payroll', lbl:'Payroll'},
    {id:'stats',   lbl:'Statistik'},
    {id:'emp',     lbl:'Karyawan'},
    {id:'hist',    lbl:'Riwayat'},
    {id:'kpi',     lbl:'KPI Bisnis'},
    {id:'supplier',lbl:'Hutang Supplier'},
    {id:'taligf',  lbl:'Tali GF'},
    {id:'admin',   lbl:'Admin'}
  ];
  customTabs.forEach(function(ct){defs.push({id:'ct_'+ct.id,lbl:ct.name});});
  var html='';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl=tc['label_'+d.id]||d.lbl;
    html+='<button class="tab on" id="T-'+d.id+'" onclick="SW(\''+d.id+'\')">'+lbl+'</button>';
  });
  document.getElementById('TABS').innerHTML=html;
};

/* ── 4. OVERRIDE renderAdmin — remove chatbot from general tab ── */
var _rAdminNoChat = renderAdmin;
renderAdmin = function(){
  _rAdminNoChat();
  /* Remove chatbot card */
  var msgs = document.getElementById('ADM-CHAT-MSGS');
  if(msgs){
    /* Walk up to find the card container */
    var card = msgs;
    while(card && !card.classList.contains('card')){ card = card.parentNode; }
    if(card) card.remove();
  }
  /* Also remove by ID if exists */
  var chatCard = document.getElementById('ADMIN-CHATBOT');
  if(chatCard) chatCard.remove();
};

/* ── 5. TOPBAR — make it Notion-style (inject after DOM) ── */
(function notionTopbar(){
  var cfg = getCfg();
  var topbar = document.querySelector('.topbar');
  if(!topbar) return;
  /* Reset topbar background to white/notion style */
  topbar.style.background = '';
  topbar.style.boxShadow = '';

  /* Make logo text dark */
  var stitle = document.getElementById('STITLE');
  if(stitle){ stitle.style.color = 'var(--tx)'; stitle.style.fontSize = '14px'; }
  
  /* Update topbar buttons */
  var themeBtn = topbar.querySelector('button');
  if(themeBtn){ themeBtn.style.cssText = 'background:transparent;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:5px 10px;cursor:pointer;font-size:12px;font-family:Inter,Arial,sans-serif'; }
  
  /* Badge */
  var badge = document.getElementById('BADGE');
  if(badge){ badge.querySelector && badge.querySelectorAll('span').forEach(function(s){s.style.color='var(--tx2)'; s.style.fontSize='13px';}); }
})();

/* ── 6. UPDATE syncAllToSupabase — add supplierData + pesananData ── */
var _origSync = syncAllToSupabase;
syncAllToSupabase = function(silent){
  var promise = _origSync(silent);
  /* Also sync new supplier tables */
  if(SB.init()){
    var cfg2 = getCfg();
    var extras = [];
    if(typeof supplierData !== 'undefined' && supplierData && supplierData.length){
      extras.push(SB.upsertMany('ajw_config',[{key:'sup_data_v2',value:{data:supplierData,ts:new Date().toISOString()}}]).catch(function(){}));
    }
    if(typeof pesananData !== 'undefined' && pesananData && pesananData.length){
      extras.push(SB.upsertMany('ajw_config',[{key:'pesanan_v2',value:{data:pesananData,ts:new Date().toISOString()}}]).catch(function(){}));
    }
    if(extras.length) Promise.all(extras).catch(function(){});
  }
  return promise;
};

/* ── 7. SUPPLIER HEADER — no zoom, notion style ── */
var _origRenderSup = renderSupplier;
renderSupplier = function(){
  _origRenderSup();
  /* Remove zoom controls from supplier header */
  var zoomEls = document.querySelectorAll('#V-supplier [id="FONT-SCALE-LBL"]');
  zoomEls.forEach(function(el){
    /* Find parent zoom div and remove it */
    var p = el.parentNode;
    if(p) p.remove();
  });
};

/* ── 8. EDIT NOTA FEATURE ── */
function openEditNotaModal(notaIdx){
  var d = supplierHutang[notaIdx];
  if(!d){ toast('Data tidak ditemukan','error'); return; }
  var MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  
  /* Build edit modal */
  var existing = document.getElementById('EDIT-NOTA-MODAL');
  if(existing) existing.remove();

  var h = '<div id="EDIT-NOTA-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;padding:20px" onclick="if(event.target===this)this.remove()">';
  h += '<div style="background:var(--bg2);border:1px solid var(--bd);border-radius:var(--r);padding:22px;max-width:860px;width:100%;box-shadow:var(--sh2);margin:auto">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--bd)">';
  h += '<span style="font-size:15px;font-weight:600;color:var(--tx)">Edit Nota Pembelian</span>';
  h += '<button onclick="document.getElementById(\'EDIT-NOTA-MODAL\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--tx2);line-height:1">&times;</button></div>';
  
  /* Header info */
  h += '<div class="g2" style="margin-bottom:14px">';
  h += '<div><label class="lbl">Nama Supplier</label><input id="EN-SUP" class="fi" value="'+esc(d.namaSupplier||'Golden Fish')+'"></div>';
  h += '<div class="g2"><div><label class="lbl">Bulan</label><select id="EN-BLN" class="fi">';
  MONTHS.forEach(function(m,i){h+='<option value="'+m+'"'+(m===d.bulan?' selected':'')+'>'+m+'</option>';});
  h += '</select></div><div><label class="lbl">Tahun</label><input id="EN-THN" class="fi" type="number" value="'+(d.tahun||2026)+'"></div></div>';
  h += '</div>';
  h += '<div style="margin-bottom:14px"><label class="lbl">Catatan</label><input id="EN-CAT" class="fi" value="'+esc(d.catatan||'')+'"></div>';
  
  /* Nota items */
  h += '<div style="margin-bottom:14px">';
  h += '<div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">Item Nota</div>';
  h += '<div style="border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden">';
  h += '<div id="EN-ITEMS">';
  (d.nota||[]).forEach(function(n,ni){
    h += '<div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end" id="ENI-'+ni+'">';
    h += '<div style="flex:1;min-width:100px"><label class="lbl">Tanggal</label><input id="ENI-TGL-'+ni+'" class="fi" type="date" value="'+esc(n.tgl||'')+'"></div>';
    h += '<div style="flex:1;min-width:100px"><label class="lbl">No Dokumen</label><input id="ENI-DOK-'+ni+'" class="fi" value="'+esc(n.noDok||'')+'"></div>';
    h += '<div style="flex:2;min-width:120px"><label class="lbl">Keterangan</label><input id="ENI-KET-'+ni+'" class="fi" value="'+esc(n.keterangan||'')+'"></div>';
    h += '<div style="flex:1;min-width:60px"><label class="lbl">Kode</label><input id="ENI-KOD-'+ni+'" class="fi" value="'+esc(n.kode||'')+'"></div>';
    h += '<div style="flex:1;min-width:100px"><label class="lbl">Nilai Netto</label><input id="ENI-NET-'+ni+'" class="fi" type="number" value="'+(n.nilaiNetto||0)+'"></div>';
    h += '<div style="align-self:flex-end"><button onclick="document.getElementById(\'ENI-'+ni+'\').remove()" style="background:none;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:6px 10px;cursor:pointer;font-size:12px">&times;</button></div>';
    h += '</div>';
  });
  h += '</div>';
  h += '<button onclick="(function(){var c=window._eniCnt=(window._eniCnt||'+(d.nota||[]).length+');window._eniCnt++;var r=document.createElement(\'div\');r.id=\'ENI-\'+c;r.style.cssText=\'display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end\';r.innerHTML=\'<div style=\\\'flex:1;min-width:100px\\\'><label class=\\\"lbl\\\">Tanggal</label><input id=\\\"ENI-TGL-\'+c+\'\\\" class=\\\"fi\\\" type=\\\"date\\\" value=\\\"'+new Date().toISOString().split('T')[0]+'\\\"></div><div style=\\\'flex:1;min-width:100px\\\'><label class=\\\"lbl\\\">No Dokumen</label><input id=\\\"ENI-DOK-\'+c+\'\\\" class=\\\"fi\\\"></div><div style=\\\'flex:2;min-width:120px\\\'><label class=\\\"lbl\\\">Keterangan</label><input id=\\\"ENI-KET-\'+c+\'\\\" class=\\\"fi\\\"></div><div style=\\\'flex:1;min-width:60px\\\'><label class=\\\"lbl\\\">Kode</label><input id=\\\"ENI-KOD-\'+c+\'\\\" class=\\\"fi\\\"></div><div style=\\\'flex:1;min-width:100px\\\'><label class=\\\"lbl\\\">Nilai Netto</label><input id=\\\"ENI-NET-\'+c+\'\\\" class=\\\"fi\\\" type=\\\"number\\\" value=\\\"0\\\"></div><div style=\\\'align-self:flex-end\\\'><button onclick=\\\"this.closest(\\\\\'[id^=ENI-]\\\\\').remove()\\\" style=\\\"background:none;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:6px 10px;cursor:pointer\\\">&times;</button></div>\';document.getElementById(\'EN-ITEMS\').appendChild(r);})()" style="padding:8px 14px;background:transparent;border:none;color:var(--tx2);cursor:pointer;font-size:12px;font-weight:500">+ Tambah Baris</button>';
  h += '</div></div>';
  
  /* Bayar items */
  h += '<div style="margin-bottom:14px">';
  h += '<div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">Pembayaran</div>';
  h += '<div style="border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden">';
  h += '<div id="EN-BAYAR">';
  (d.bayar||[]).forEach(function(b,bi){
    h += '<div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end" id="ENB-'+bi+'">';
    h += '<div style="flex:1"><label class="lbl">Tanggal</label><input id="ENB-TGL-'+bi+'" class="fi" type="date" value="'+esc(b.tgl||'')+'"></div>';
    h += '<div style="flex:2"><label class="lbl">Keterangan</label><input id="ENB-KET-'+bi+'" class="fi" value="'+esc(b.keterangan||'')+'"></div>';
    h += '<div style="flex:1"><label class="lbl">Jumlah</label><input id="ENB-JML-'+bi+'" class="fi" type="number" value="'+(b.jumlah||0)+'"></div>';
    h += '<div style="align-self:flex-end"><button onclick="document.getElementById(\'ENB-'+bi+'\').remove()" style="background:none;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:6px 10px;cursor:pointer;font-size:12px">&times;</button></div>';
    h += '</div>';
  });
  h += '</div>';
  h += '<button onclick="(function(){var c=window._enbCnt=(window._enbCnt||'+(d.bayar||[]).length+');window._enbCnt++;var el=document.getElementById(\'EN-BAYAR\');el.insertAdjacentHTML(\'beforeend\',\'<div style=\\\"display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:flex-end\\\" id=\\\"ENB-\'+c+\'\\\"><div style=\\\"flex:1\\\"><label class=\\\"lbl\\\">Tanggal</label><input id=\\\"ENB-TGL-\'+c+\'\\\" class=\\\"fi\\\" type=\\\"date\\\" value=\\\"'+new Date().toISOString().split('T')[0]+'\\\"></div><div style=\\\"flex:2\\\"><label class=\\\"lbl\\\">Keterangan</label><input id=\\\"ENB-KET-\'+c+\'\\\" class=\\\"fi\\\"></div><div style=\\\"flex:1\\\"><label class=\\\"lbl\\\">Jumlah</label><input id=\\\"ENB-JML-\'+c+\'\\\" class=\\\"fi\\\" type=\\\"number\\\" value=\\\"0\\\"></div><div style=\\\"align-self:flex-end\\\"><button onclick=\\\"this.closest(\\\\\'[id^=ENB-]\\\\\').remove()\\\" style=\\\"background:none;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:6px 10px;cursor:pointer\\\">&times;</button></div></div>\')})()" style="padding:8px 14px;background:transparent;border:none;color:var(--tx2);cursor:pointer;font-size:12px;font-weight:500">+ Tambah Pembayaran</button>';
  h += '</div></div>';
  
  /* Bukti photos */
  h += '<div style="margin-bottom:18px">';
  h += '<div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">Bukti Foto</div>';
  if(d.buktiFoto && d.buktiFoto.length){
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px" id="EN-BUKTI-LIST">';
    d.buktiFoto.forEach(function(img,ii){
      h += '<div style="position:relative"><img src="'+img+'" onclick="showImageFull(\''+img+'\')" style="width:72px;height:54px;object-fit:cover;border-radius:6px;border:1px solid var(--bd);cursor:pointer">';
      h += '<button onclick="supplierHutang['+notaIdx+'].buktiFoto.splice('+ii+',1);saveSupplier();this.closest(\'div[style*=position]\').remove()" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:var(--red);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:9px;line-height:1;display:flex;align-items:center;justify-content:center">&times;</button></div>';
    });
    h += '</div>';
  } else h += '<div style="font-size:12px;color:var(--tx3);margin-bottom:8px">Belum ada bukti.</div>';
  h += '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--tx2);padding:6px 12px;border:1px solid var(--bd2);border-radius:var(--rs)">';
  h += '+ Upload Bukti Baru<input type="file" accept="image/*" style="display:none" onchange="readImgAsB64(this.files[0],function(d2){if(!supplierHutang['+notaIdx+'].buktiFoto)supplierHutang['+notaIdx+'].buktiFoto=[];supplierHutang['+notaIdx+'].buktiFoto.push(d2);saveSupplier();toast(\'Bukti ditambahkan\',\'success\')})"></label>';
  h += '</div>';
  
  /* Save button */
  h += '<div style="display:flex;justify-content:flex-end;gap:9px;padding-top:14px;border-top:1px solid var(--bd)">';
  h += '<button class="btns" onclick="document.getElementById(\'EDIT-NOTA-MODAL\').remove()">Batal</button>';
  h += '<button class="btnp" onclick="saveEditNota('+notaIdx+')" style="background:var(--tx);color:var(--bg)">Simpan Perubahan</button>';
  h += '</div>';
  h += '</div></div>';
  
  document.body.insertAdjacentHTML('beforeend', h);
}

function saveEditNota(notaIdx){
  var d = supplierHutang[notaIdx];
  if(!d) return;
  
  /* Collect nota items */
  var nota = [];
  var i = 0;
  while(document.getElementById('ENI-TGL-'+i) || document.getElementById('ENI-'+i)){
    var tglEl = document.getElementById('ENI-TGL-'+i);
    if(!tglEl){ i++; continue; }
    var net = parseFloat(document.getElementById('ENI-NET-'+i).value)||0;
    var ket = document.getElementById('ENI-KET-'+i).value.trim();
    if(ket || net > 0){
      nota.push({
        tgl: tglEl.value,
        noDok: document.getElementById('ENI-DOK-'+i).value.trim(),
        keterangan: ket,
        kode: document.getElementById('ENI-KOD-'+i).value.trim(),
        nilaiNetto: net
      });
    }
    i++;
  }
  
  /* Collect bayar items */
  var bayar = [];
  var j = 0;
  while(document.getElementById('ENB-TGL-'+j)){
    var jml = parseFloat(document.getElementById('ENB-JML-'+j).value)||0;
    if(jml > 0){
      bayar.push({
        tgl: document.getElementById('ENB-TGL-'+j).value,
        keterangan: document.getElementById('ENB-KET-'+j).value.trim(),
        jumlah: jml,
        bukti: (d.bayar&&d.bayar[j])?d.bayar[j].bukti||'':''
      });
    }
    j++;
  }
  
  var blnEl = document.getElementById('EN-BLN');
  var blnNum = blnEl ? blnEl.selectedIndex + 1 : d.bulanNum;
  
  /* Update the record */
  supplierHutang[notaIdx].namaSupplier = document.getElementById('EN-SUP').value;
  supplierHutang[notaIdx].bulan = blnEl ? blnEl.value : d.bulan;
  supplierHutang[notaIdx].bulanNum = blnNum;
  supplierHutang[notaIdx].tahun = parseInt(document.getElementById('EN-THN').value)||d.tahun;
  supplierHutang[notaIdx].catatan = document.getElementById('EN-CAT').value.trim();
  supplierHutang[notaIdx].nota = nota;
  supplierHutang[notaIdx].bayar = bayar;
  
  saveSupplier();
  sbSyncSupplierAll && sbSyncSupplierAll();
  document.getElementById('EDIT-NOTA-MODAL').remove();
  toast('Nota berhasil diperbarui','success');
  renderSupplier();
}

/* ── 9. INJECT EDIT BUTTON into _supHutang ── */
var _origSupHutang = _supHutang;
_supHutang = function(){
  var html = _origSupHutang();
  /* Replace X button to include Edit button - inject into DOM after render */
  return html;
};

/* Post-render: add Edit buttons to nota rows */
var _origRenderSupFinal = renderSupplier;
renderSupplier = function(){
  _origRenderSupFinal();
  /* After render, inject Edit buttons next to each X button */
  var xBtns = document.querySelectorAll('#V-supplier .btnsm[style*="EF4444"][onclick*="deleteSupplierRecord"]');
  xBtns.forEach(function(xBtn){
    /* Get nota index from onclick */
    var onclick = xBtn.getAttribute('onclick')||'';
    var match = onclick.match(/deleteSupplierRecord\((\d+)\)/);
    if(!match) return;
    var notaIdx = match[1];
    /* Check if Edit button already exists */
    if(xBtn.previousSibling && xBtn.previousSibling.textContent === 'Edit') return;
    var editBtn = document.createElement('button');
    editBtn.className = 'btnsm';
    editBtn.style.background = '#374151';
    editBtn.style.fontSize = '10px';
    editBtn.style.marginRight = '4px';
    editBtn.textContent = 'Edit';
    editBtn.onclick = function(){ openEditNotaModal(parseInt(notaIdx)); };
    xBtn.parentNode.insertBefore(editBtn, xBtn);
  });
};

/* ── 10. FIX _exportExcelCore — sort by month ASC + add totals ── */
_exportExcelCore = function(list, filename){
  if(!list.length){ toast('Tidak ada data untuk diexport','warn'); return; }
  
  /* Sort by year ASC then month ASC */
  var sorted = list.slice().sort(function(a,b){
    var ya = parseInt(a.tahun)||0, yb = parseInt(b.tahun)||0;
    if(ya !== yb) return ya - yb;
    return (parseInt(a.bulanNum)||0) - (parseInt(b.bulanNum)||0);
  });
  
  var rows = [];
  var headerRow = [
    'Supplier','Bulan','Tahun','Tanggal','No Dokumen','Keterangan','Kode',
    'Nilai Netto (Rp)','Tanggal Bayar','Keterangan Bayar','Jumlah Bayar (Rp)','Saldo (Rp)','Status'
  ].map(function(h){ return '"'+h+'"'; }).join(',');
  rows.push(headerRow);

  var grandTotalNota = 0, grandTotalBayar = 0;

  sorted.forEach(function(d){
    var sup   = d.namaSupplier||'Golden Fish';
    var tN    = (d.nota||[]).reduce(function(s,n){ return s+(parseFloat(n.nilaiNetto)||0); },0);
    var tB    = (d.bayar||[]).reduce(function(s,b){ return s+(parseFloat(b.jumlah)||0);   },0);
    var saldo = tN - tB;
    var status = saldo <= 0 ? 'Lunas' : 'Belum Lunas';
    grandTotalNota += tN;
    grandTotalBayar += tB;

    /* Nota rows */
    (d.nota||[]).forEach(function(n){
      rows.push([
        '"'+sup+'"', '"'+(d.bulan||'')+'"', d.tahun||'',
        '"'+(n.tgl||'')+'"', '"'+(n.noDok||'')+'"', '"'+(n.keterangan||'')+'"', '"'+(n.kode||'')+'"',
        parseFloat(n.nilaiNetto)||0,
        '""','""', '',
        saldo, '"'+status+'"'
      ].join(','));
    });
    /* Bayar rows */
    (d.bayar||[]).forEach(function(b){
      rows.push([
        '"'+sup+'"', '"'+(d.bulan||'')+'"', d.tahun||'',
        '""','""','""','""', '',
        '"'+(b.tgl||'')+'"', '"'+(b.keterangan||'')+'"', parseFloat(b.jumlah)||0,
        saldo, '"'+status+'"'
      ].join(','));
    });
    /* Subtotal row per nota */
    rows.push([
      '"--- SUBTOTAL '+sup+' '+( d.bulan||'')+' '+(d.tahun||'')+' ---"',
      '','','','','','',
      tN,'','',tB,saldo,'"'+status+'"'
    ].join(','));
    rows.push(''); /* blank row between groups */
  });

  /* Grand total row */
  rows.push([
    '"=== GRAND TOTAL ==="',
    '','','','','','',
    grandTotalNota,'','',grandTotalBayar,
    grandTotalNota-grandTotalBayar,'"—"'
  ].join(','));

  var content = '\uFEFF' + rows.join('\n');
  var blob = new Blob([content], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'HutangSupplier_'+filename+'_'+ymd()+'.csv';
  a.click();
  toast('Export berhasil: '+list.length+' nota','success',3000);
};

/* ── 11. REMOVE topbar logo text color (was gold, now dark) ── */
(function fixTopbar(){
  var stitle = document.getElementById('STITLE');
  if(stitle){
    stitle.style.color = 'var(--tx)';
    stitle.style.fontWeight = '600';
    stitle.style.fontSize = '14px';
  }
  /* Remove subtitle that says Anton Pancing */
  var subtitles = document.querySelectorAll('.topbar div[style*="90CAF9"]');
  subtitles.forEach(function(el){ el.style.color = 'var(--tx3)'; el.style.fontSize = '12px'; });
  /* Remove zoom wrap if somehow injected */
  var zw = document.getElementById('GLOBAL-ZOOM-WRAP');
  if(zw) zw.remove();
  /* Topbar buttons */
  document.querySelectorAll('.topbar button').forEach(function(btn){
    if(btn.textContent.includes('Install')||btn.textContent.includes('Tema')){
      btn.style.cssText='background:transparent;border:1px solid var(--bd2);color:var(--tx2);border-radius:var(--rs);padding:5px 10px;cursor:pointer;font-size:12px;font-family:Inter,Arial,sans-serif';
    }
  });
})();

/* ── 12. RE-RENDER with new theme applied ── */
buildTabBar();

/* ================================================================
   FINAL PATCH — AJW v8
   1. Remove zoom buttons (global font size normal ~15px)
   2. Remove Finansial, Operasional, AI Chat tabs from CORE_TABS
   3. Remove Admin chatbot
   4. 2-3 color palette only (navy, blue/teal, green)
   5. No icons on sub-menu titles
   6. Edit nota (rincian + bukti)
   7. Export Excel sorted Jan→Feb→... with TOTAL rows
   8. Hutang & Nota simplified view
   9. Dashboard inline hutang detail
   10. Dropdown action buttons in hutang
   11. Supabase sync for sup_data + pesanan
   12. Bigger base font size (16px)
================================================================ */

/* ── 1. GLOBAL FONT SIZE – remove zoom, set normal size ── */
document.documentElement.style.fontSize = '16px';
if(document.body) document.body.style.fontSize = '15px';

/* Remove old zoom buttons from topbar if injected */
(function(){
  var z = document.getElementById('GLOBAL-ZOOM-WRAP');
  if(z) z.remove();
})();

/* Disable setFontScale so old zoom buttons do nothing */
setFontScale = function(){ /* zoom disabled */ };

/* ── 2. CORE_TABS — remove finansial, operasional, aichat ── */
CORE_TABS = ['dash','eval','payroll','stats','emp','hist','kpi','supplier','taligf','admin'];

/* ── 3. buildTabBar override — clean 2-color tabs ── */
buildTabBar = function(){
  var c = getCfg(); var tc = c.tabsConfig||{};
  var defs = [
    {id:'dash',    lbl:'Dashboard'},
    {id:'eval',    lbl:'Penilaian'},
    {id:'payroll', lbl:'Payroll'},
    {id:'stats',   lbl:'Statistik'},
    {id:'emp',     lbl:'Karyawan'},
    {id:'hist',    lbl:'Riwayat'},
    {id:'kpi',     lbl:'KPI Bisnis'},
    {id:'supplier',lbl:'Hutang Supplier'},
    {id:'taligf',  lbl:'Tali GF'},
    {id:'admin',   lbl:'Admin'}
  ];
  customTabs.forEach(function(ct){
    defs.push({id:'ct_'+ct.id, lbl:(ct.icon||'')+' '+ct.name});
  });
  var html = '';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl = tc['label_'+d.id]||d.lbl;
    html += '<button class="tab on" id="T-'+d.id+'" onclick="SW(\''+d.id+'\')" style="font-size:12px;padding:10px 14px">'+esc(lbl)+'</button>';
  });
  document.getElementById('TABS').innerHTML = html;
};

/* ── 4. SW override — remove finansial/operasional/aichat routing ── */
var _swBase = SW;
SW = function(tab){
  /* Show/hide divs */
  var all = CORE_TABS.concat(customTabs.map(function(ct){ return 'ct_'+ct.id; }));
  all.forEach(function(x){
    var v = document.getElementById('V-'+x);
    var b = document.getElementById('T-'+x);
    if(v) v.style.display = (x===tab)?'block':'none';
    if(b) b.className = 'tab '+(x===tab?'act':'on');
  });
  /* Render */
  if(tab==='dash') renderDash();
  else if(tab==='kpi'){ if(typeof loadKPI==='function')loadKPI(); if(typeof renderKPI==='function')renderKPI(); }
  else if(tab==='stats') renderStats();
  else if(tab==='emp') renderEmp();
  else if(tab==='hist') renderHist();
  else if(tab==='admin') renderAdmin();
  else if(tab==='supplier') renderSupplier();
  else if(tab==='taligf'){ if(typeof renderTaliGF==='function')renderTaliGF(); }
  else if(tab.indexOf('ct_')===0){ if(typeof renderCustomTab==='function')renderCustomTab(tab.replace('ct_','')); }
  else if(tab==='eval'){ /* eval form already rendered */ }
  else if(tab==='payroll'){ /* payroll form already rendered */ }
  window.scrollTo(0,0);
};

/* ── 5. renderAdmin FINAL — no chatbot, clean sub-titles, navy+blue only ── */
var adminSub = adminSub || 'general';

renderAdmin = function(){
  var cfg = getCfg();
  var sbOK = !!(cfg.supabaseUrl && cfg.supabaseKey);
  var lastSync = cfg.lastSupabaseSync ? new Date(cfg.lastSupabaseSync).toLocaleString('id-ID') : null;

  var subs = ['general','integrations','templates','tabs','data'];
  var subLabels = {'general':'Umum & Tema','integrations':'Integrasi & API','templates':'Template Caption','tabs':'Tab & HTML','data':'Data & Backup'};

  var h = '<div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">';
  /* Tab bar */
  h += '<div style="display:flex;border-bottom:2px solid var(--bd);overflow-x:auto;scrollbar-width:none;background:var(--bg3)">';
  subs.forEach(function(s){
    var act = adminSub===s;
    h += '<button onclick="adminSub=\''+s+'\';renderAdmin()" style="padding:11px 18px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:Arial;white-space:nowrap;background:'+(act?'var(--bg2)':'transparent')+';color:'+(act?'var(--navy)':'var(--tx2)')+';border-bottom:3px solid '+(act?'var(--navy)':'transparent')+';margin-bottom:-2px">'+subLabels[s]+'</button>';
  });
  h += '</div>';
  /* Supabase status bar */
  h += '<div style="padding:8px 16px;background:'+(sbOK?'#F0FDF4':'#FEF2F2')+';display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--bd);font-size:11px">';
  h += '<span style="color:'+(sbOK?'var(--green)':'var(--red)')+';font-weight:700">Supabase: '+(sbOK?'Terhubung':'Belum dikonfigurasi')+(lastSync?' &bull; Sync: '+lastSync:'')+'</span>';
  if(sbOK) h += '<button onclick="syncAllToSupabase()" style="background:var(--green);color:#fff;border:none;padding:5px 13px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:700;font-family:Arial">Sync Sekarang</button>';
  h += '</div>';
  h += '<div style="padding:18px">';

  /* ── UMUM & TEMA ── */
  if(adminSub==='general'){
    h += '<div class="g2" style="margin-bottom:14px">';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Tema Tampilan</div>';
    h += '<div style="display:flex;gap:8px;margin-bottom:9px">';
    h += '<button onclick="var c=getCfg();c.theme=\'light\';saveCfg(c);applyTheme();renderAdmin()" style="flex:1;padding:9px;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;background:'+(cfg.theme!=='dark'?'var(--navy)':'var(--bg3)')+';color:'+(cfg.theme!=='dark'?'#fff':'var(--tx2)')+'">Light</button>';
    h += '<button onclick="var c=getCfg();c.theme=\'dark\';saveCfg(c);applyTheme();renderAdmin()" style="flex:1;padding:9px;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;background:'+(cfg.theme==='dark'?'var(--navy)':'var(--bg3)')+';color:'+(cfg.theme==='dark'?'#fff':'var(--tx2)')+'">Dark</button>';
    h += '</div></div>';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Info Admin</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Nama Admin</label><input id="ADM-nm" class="fi" value="'+esc(cfg.adminName||'Hokky')+'"></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">No. WA Admin</label><input id="ADM-wa" class="fi" value="'+esc(cfg.adminWA||'6285710597159')+'"></div>';
    h += '<button onclick="var c=getCfg();c.adminName=document.getElementById(\'ADM-nm\').value.trim();c.adminWA=document.getElementById(\'ADM-wa\').value.trim();saveCfg(c);updateBadge();toast(\'Disimpan\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 20px;cursor:pointer;font-weight:700;font-family:Arial;width:100%">Simpan</button></div></div>';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Judul & Custom CSS</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Judul Header</label><input id="ADM-title" class="fi" value="'+esc(cfg.sysTitle||'SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA')+'"></div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Override CSS</label><textarea id="CSS-OVR" class="fi" rows="4" style="font-family:monospace;font-size:12px" placeholder=":root { --blue: #FF5722; }">'+esc(cfg.cssOverride||'')+'</textarea></div>';
    h += '<div style="display:flex;gap:8px">';
    h += '<button onclick="var c=getCfg();c.sysTitle=document.getElementById(\'ADM-title\').value.trim();c.cssOverride=document.getElementById(\'CSS-OVR\').value;saveCfg(c);document.getElementById(\'STITLE\').textContent=c.sysTitle;applyCSSOverride(c.cssOverride);toast(\'Disimpan!\',\'success\')" style="flex:1;background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px;cursor:pointer;font-weight:700;font-family:Arial">Simpan</button>';
    h += '<button onclick="var c=getCfg();c.cssOverride=\'\';saveCfg(c);applyCSSOverride(\'\');document.getElementById(\'CSS-OVR\').value=\'\';toast(\'Reset\',\'info\')" style="background:var(--bg3);color:var(--tx2);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial">Reset</button>';
    h += '</div></div>';
  }

  /* ── INTEGRASI & API ── */
  if(adminSub==='integrations'){
    /* Telegram */
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Telegram Bot</div>';
    h += '<div style="background:#EFF6FF;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.8">1. Kirim pesan ke bot &rarr; 2. Buka <code>api.telegram.org/bot{TOKEN}/getUpdates</code> &rarr; 3. Copy <code>chat.id</code></div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Bot Token</label><input id="TG-tok" class="fi" value="'+esc(cfg.tgToken||'')+'" placeholder="123456:AAxxxx"></div><div><label class="lbl">Chat ID</label><input id="TG-chat" class="fi" value="'+esc(cfg.tgChat||'')+'" placeholder="-1001234..."></div></div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap">';
    h += '<button onclick="var c=getCfg();c.tgToken=document.getElementById(\'TG-tok\').value.trim();c.tgChat=document.getElementById(\'TG-chat\').value.trim();saveCfg(c);toast(\'Disimpan\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan</button>';
    h += '<button onclick="var c=getCfg();if(!c.tgToken||!c.tgChat){toast(\'Isi token dan chat ID\',\'error\');return}fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/sendMessage\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({chat_id:c.tgChat,text:\'Test AJW OK!\'})}).then(function(r){return r.json()}).then(function(d){if(d.ok)toast(\'Test berhasil!\',\'success\');else toast(d.description,\'error\')})" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Test Kirim</button>';
    h += '<button onclick="var c=getCfg();if(!c.tgToken)return;fetch(\'https://api.telegram.org/bot\'+c.tgToken+\'/getUpdates\').then(function(r){return r.json()}).then(function(d){if(d.ok&&d.result&&d.result.length){var m=d.result[d.result.length-1];var id=m.message?m.message.chat.id:\'\';if(id){document.getElementById(\'TG-chat\').value=id;toast(\'Chat ID: \'+id,\'success\',5000)}}else toast(\'Kirim pesan ke bot dulu\',\'warn\')})" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Auto Detect Chat ID</button>';
    h += '</div></div>';
    /* Drive */
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Google Drive</div>';
    h += '<div style="background:#F0FDF4;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.6">Bearer Token: <a href="https://developers.google.com/oauthplayground" target="_blank" style="color:var(--green)">OAuth Playground</a> &rarr; Drive API v3 &rarr; Exchange token &rarr; copy</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Bearer Token</label><input id="DRV-tok" class="fi" value="'+esc(cfg.driveToken||'')+'" placeholder="ya29.xxx..."></div>';
    h += '<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Folder ID Penilaian</label><input id="DRV-eval" class="fi" value="'+esc(cfg.driveEvalFolder||'1D4lQmi48BBPNYxhqAM_Qtp68I6nPTw9Z')+'"></div><div><label class="lbl">Folder ID Payroll</label><input id="DRV-pay" class="fi" value="'+esc(cfg.drivePayFolder||'10b5C7W-33tS3Ujd5xYcvjtYj_9NYsWhJ')+'"></div></div>';
    h += '<div style="margin-bottom:9px"><label class="lbl">Folder HR Umum</label><input id="DRV-hr" class="fi" value="'+esc(cfg.driveHRFolder||'1tv-IUtvJDrP9bw4sAMhpGq_h9MrK8H4t')+'"></div>';
    h += '<button onclick="var c=getCfg();c.driveToken=document.getElementById(\'DRV-tok\').value.trim();c.driveEvalFolder=document.getElementById(\'DRV-eval\').value.trim();c.drivePayFolder=document.getElementById(\'DRV-pay\').value.trim();c.driveHRFolder=document.getElementById(\'DRV-hr\').value.trim();saveCfg(c);toast(\'Drive disimpan\',\'success\')" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan Drive Config</button></div>';
    /* AI Keys */
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">AI API Keys</div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-bottom:9px"><a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--blue)">OpenAI</a> &bull; <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--blue)">Gemini</a> &bull; <a href="https://console.anthropic.com" target="_blank" style="color:var(--blue)">Anthropic</a></div>';
    h += '<div class="g3" style="margin-bottom:10px">';
    h += '<div><label class="lbl">OpenAI Key</label><input id="AI-GPT-KEY" class="fi" type="password" value="'+esc(cfg.openaiKey||'')+'" placeholder="sk-proj-..."><select id="AI-GPT-MDL" class="fi" style="margin-top:5px"><option value="gpt-4o-mini"'+(cfg.openaiModel==='gpt-4o-mini'?' selected':'')+'>gpt-4o-mini</option><option value="gpt-4o"'+(cfg.openaiModel==='gpt-4o'?' selected':'')+'>gpt-4o</option></select></div>';
    h += '<div><label class="lbl">Gemini Key</label><input id="AI-GEM-KEY" class="fi" type="password" value="'+esc(cfg.geminiKey||'')+'" placeholder="AIzaSy..."><select id="AI-GEM-MDL" class="fi" style="margin-top:5px"><option value="gemini-1.5-flash">Flash</option><option value="gemini-1.5-pro">Pro</option></select></div>';
    h += '<div><label class="lbl">Claude Key</label><input id="AI-CLD-KEY" class="fi" type="password" value="'+esc(cfg.anthropicKey||'')+'" placeholder="sk-ant-..."><select id="AI-CLD-MDL" class="fi" style="margin-top:5px"><option value="claude-3-5-haiku-20241022">Haiku</option><option value="claude-3-5-sonnet-20241022">Sonnet</option></select></div>';
    h += '</div>';
    h += '<button onclick="var c=getCfg();c.openaiKey=document.getElementById(\'AI-GPT-KEY\').value.trim();c.openaiModel=document.getElementById(\'AI-GPT-MDL\').value;c.geminiKey=document.getElementById(\'AI-GEM-KEY\').value.trim();c.geminiModel=document.getElementById(\'AI-GEM-MDL\').value;c.anthropicKey=document.getElementById(\'AI-CLD-KEY\').value.trim();c.claudeModel=document.getElementById(\'AI-CLD-MDL\').value;saveCfg(c);toast(\'AI Keys disimpan\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan AI Keys</button></div>';
    /* Supabase */
    h += '<div class="card" style="padding:14px;margin-top:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Supabase Database</div>';
    h += '<div style="background:#EFF6FF;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.8"><b>Setup:</b> Daftar <a href="https://supabase.com" target="_blank" style="color:var(--blue)">supabase.com</a> &rarr; New Project &rarr; Settings &rarr; API &rarr; copy URL dan anon key</div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Project URL</label><input id="SB-URL" class="fi" value="'+esc(cfg.supabaseUrl||'')+'" placeholder="https://xxxx.supabase.co"></div><div><label class="lbl">Anon Key</label><input id="SB-KEY" class="fi" type="password" value="'+esc(cfg.supabaseKey||'')+'" placeholder="eyJhb..."></div></div>';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px"><input type="checkbox" id="SB-AUTO" style="width:16px;height:16px;accent-color:var(--blue)"'+(cfg.supabaseAutoSync?' checked':'')+' onchange="var c=getCfg();c.supabaseAutoSync=this.checked;saveCfg(c);toast(this.checked?\'Auto-sync aktif\':\'Auto-sync off\',\'info\')"><label for="SB-AUTO" style="font-size:12px;cursor:pointer">Auto-sync setiap ada perubahan data</label></div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap">';
    h += '<button onclick="var c=getCfg();c.supabaseUrl=document.getElementById(\'SB-URL\').value.trim();c.supabaseKey=document.getElementById(\'SB-KEY\').value.trim();saveCfg(c);toast(\'Supabase disimpan\',\'success\');renderAdmin()" style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan</button>';
    h += '<button onclick="SB.init();SB.test().then(function(){toast(\'Koneksi OK!\',\'success\')}).catch(function(e){toast(\'Error: \'+e.message,\'error\')})" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Test Koneksi</button>';
    h += '<button onclick="syncAllToSupabase()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Sync Sekarang</button>';
    h += '<button onclick="loadFromSupabase()" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Load dari Cloud</button>';
    h += '<button onclick="showSQLModal()" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Setup SQL Tabel</button>';
    h += '</div></div>';
  }

  /* ── TEMPLATE CAPTION ── */
  if(adminSub==='templates'){
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Template Caption WA / Telegram</div>';
    h += '<div style="font-size:11px;color:var(--tx2);background:var(--bg3);padding:8px;border-radius:6px;margin-bottom:10px;line-height:1.8">Variabel: <code>{nama} {jabatan} {periode} {tipe} {tanggal} {nilai} {grade} {kategori} {rincian} {keputusan} {catatan} {gajiPokok} {lembur} {bonus} {kotor} {bersih} {hariKerja}</code></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Template Penilaian</label><textarea id="TPL-eval" class="fi" rows="7">'+esc(cfg.evalTpl||'LAPORAN PENILAIAN KINERJA\nAnton Jaya Wijaya\n\nNama: {nama}\nJabatan: {jabatan}\nPeriode: {periode} ({tipe})\nTanggal: {tanggal}\n\nNILAI AKHIR: {nilai} / 4.00\nGrade: {grade} - {kategori}\n\nRincian:\n{rincian}\n\nKeputusan: {keputusan}\n{catatan}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Template Payroll</label><textarea id="TPL-pay" class="fi" rows="5">'+esc(cfg.payTpl||'SLIP GAJI\nAnton Jaya Wijaya\n\nNama: {nama}\nPeriode: {periode} ({tipe})\n\nGaji Pokok: Rp {gajiPokok}\nBonus     : Rp {bonus}\nBersih    : Rp {bersih}\n\n_Anton Jaya Wijaya_')+'</textarea></div>';
    h += '<button onclick="var c=getCfg();c.evalTpl=document.getElementById(\'TPL-eval\').value;c.payTpl=document.getElementById(\'TPL-pay\').value;saveCfg(c);toast(\'Template disimpan!\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan Template</button></div>';
  }

  /* ── TAB & HTML ── */
  if(adminSub==='tabs'){
    var tc = cfg.tabsConfig||{};
    var coreDefs = [
      {id:'dash',def:'Dashboard'},{id:'eval',def:'Penilaian'},{id:'payroll',def:'Payroll'},
      {id:'stats',def:'Statistik'},{id:'emp',def:'Karyawan'},{id:'hist',def:'Riwayat'},
      {id:'kpi',def:'KPI Bisnis'},{id:'supplier',def:'Hutang Supplier'},
      {id:'taligf',def:'Tali GF'},{id:'admin',def:'Admin'}
    ];
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Konfigurasi Tab</div>';
    coreDefs.forEach(function(t){
      var lbl = tc['label_'+t.id]||t.def;
      h += '<div style="display:flex;align-items:center;gap:9px;padding:7px 10px;background:var(--bg3);border-radius:6px;margin-bottom:5px">';
      h += '<input type="checkbox" id="THIDE-'+t.id+'"'+(tc['hide_'+t.id]?'':' checked')+' style="width:16px;height:16px;accent-color:var(--blue)">';
      h += '<input class="fi" id="TLBL-'+t.id+'" type="text" value="'+esc(lbl)+'" style="flex:1;padding:6px 10px;font-size:12px">';
      h += '<button onclick="openTabEditor(\''+t.id+'\',\''+t.id+'\')" style="background:var(--blue);color:#fff;border:none;border-radius:5px;padding:5px 10px;cursor:pointer;font-size:10px;font-weight:700;font-family:Arial">Edit HTML</button>';
      h += '</div>';
    });
    h += '<button onclick="var c=getCfg();c.tabsConfig=c.tabsConfig||{};';
    coreDefs.forEach(function(t){
      h += 'c.tabsConfig[\'hide_'+t.id+'\']=!document.getElementById(\'THIDE-'+t.id+'\').checked;c.tabsConfig[\'label_'+t.id+'\']=document.getElementById(\'TLBL-'+t.id+'\').value;';
    });
    h += 'saveCfg(c);buildTabBar();toast(\'Tab diperbarui!\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 15px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px;margin-top:7px">Simpan Konfigurasi Tab</button></div>';
    /* Custom tab */
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Tab Custom</div>';
    if(customTabs.length){
      customTabs.forEach(function(ct,idx){
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg3);border-radius:6px;margin-bottom:5px">';
        h += '<span style="font-size:12px;font-weight:700">'+esc((ct.icon||'')+' '+ct.name)+'</span>';
        h += '<div style="display:flex;gap:5px">';
        h += '<button onclick="openTabEditor(\'ct_'+ct.id+'\',\''+esc(ct.name)+'\')" style="background:var(--blue);color:#fff;border:none;border-radius:5px;padding:4px 9px;cursor:pointer;font-size:10px;font-weight:700;font-family:Arial">Edit</button>';
        h += '<button onclick="SW(\'ct_'+ct.id+'\')" style="background:var(--green);color:#fff;border:none;border-radius:5px;padding:4px 9px;cursor:pointer;font-size:10px;font-weight:700;font-family:Arial">Preview</button>';
        h += '<button onclick="confirmDelete(\'Hapus tab '+esc(ct.name)+'?\',function(){customTabs.splice('+idx+',1);sv(\'ajw_tabs\',customTabs);buildTabBar();renderAdmin()})" style="background:var(--red);color:#fff;border:none;border-radius:5px;padding:4px 9px;cursor:pointer;font-size:10px;font-weight:700;font-family:Arial">X</button>';
        h += '</div></div>';
      });
    } else h += '<div style="color:var(--tx2);font-size:12px;margin-bottom:9px">Belum ada tab custom.</div>';
    h += '<div class="g2" style="margin-bottom:8px"><div><label class="lbl">Nama Tab</label><input id="CT-nm" class="fi" placeholder="Nama Tab Baru"></div><div><label class="lbl">Icon</label><input id="CT-ic" class="fi" placeholder="emoji"></div></div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">HTML Content</label><textarea id="CT-html" class="fi" rows="4" style="font-family:monospace;font-size:12px" placeholder="<div>Konten...</div>"></textarea></div>';
    h += '<button onclick="var nm=document.getElementById(\'CT-nm\').value.trim();if(!nm){toast(\'Nama wajib\',\'error\');return};var ct={id:Date.now(),name:nm,icon:document.getElementById(\'CT-ic\').value||\'📄\',html:document.getElementById(\'CT-html\').value};customTabs.push(ct);sv(\'ajw_tabs\',customTabs);addCustomTabDiv(ct);buildTabBar();toast(\'Tab ditambahkan!\',\'success\');renderAdmin()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">+ Tambah Tab</button></div>';
    /* Download HTML */
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Download HTML Sistem</div>';
    h += '<div style="font-size:12px;color:var(--tx2);margin-bottom:10px">Download seluruh sistem AJW sebagai 1 file HTML.</div>';
    h += '<button onclick="exportFullHTML()" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Download HTML Sistem</button></div>';
  }

  /* ── DATA & BACKUP ── */
  if(adminSub==='data'){
    h += buildSupabasePanel();
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Backup Google Drive</div>';
    h += '<div style="font-size:12px;color:var(--tx2);margin-bottom:10px">Upload semua data ke folder HR Drive. Butuh Bearer Token di tab Integrasi.</div>';
    h += '<button onclick="backupToDrive()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Backup ke Drive</button></div>';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Lokal Backup</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
    h += '<button onclick="exportData()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Export JSON</button>';
    h += '<button onclick="importData()" style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Import JSON</button>';
    h += '<button onclick="confirmDelete(\'Hapus SEMUA riwayat penilaian & payroll?\',function(){evalHistory=[];payHistory=[];sv(\'ajw_eval\',evalHistory);sv(\'ajw_pay\',payHistory);toast(\'Data dihapus\',\'warn\')})" style="background:var(--red);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Reset Data</button>';
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--tx2)">Tersimpan: '+evalHistory.length+' penilaian &bull; '+payHistory.length+' slip gaji &bull; '+employees.length+' karyawan &bull; '+supplierHutang.length+' nota supplier</div></div>';
  }

  h += '</div></div>'; /* close padding + card */
  document.getElementById('V-admin').innerHTML = h;
};

/* ── 6. SUPABASE SYNC — add sup_data + pesanan tables ── */
var _origSyncAll = syncAllToSupabase;
syncAllToSupabase = function(silent){
  if(!SB.init()){ if(!silent) toast('Supabase belum dikonfigurasi', 'error'); return Promise.reject('not configured'); }
  if(!silent) toast('Menyinkronkan ke Supabase...', 'info', 8000);
  var tasks = [];
  if(employees.length) tasks.push(SB.upsertMany('ajw_employees', employees.map(function(e){return {id:e.id,data:e};})).catch(function(){}));
  if(evalHistory.length) tasks.push(SB.upsertMany('ajw_eval', evalHistory.map(function(e){return {id:e.id,data:e,nama:e.info.nama||'',grade:e.grade||'',nilai:e.fs||0};})).catch(function(){}));
  if(payHistory.length) tasks.push(SB.upsertMany('ajw_payroll', payHistory.map(function(p){return {id:p.id,data:p,nama:p.info.nama||'',gaji_bersih:p.bersih||0};})).catch(function(){}));
  if(typeof kpiData!=='undefined'&&kpiData&&kpiData.length) tasks.push(SB.upsertMany('ajw_kpi', kpiData.map(function(k){return {periode:k.periode,data:k};})).catch(function(){}));
  if(supplierHutang.length) tasks.push(SB.upsertMany('ajw_supplier', supplierHutang.map(function(s){return {id:s.id,data:s,nama_supplier:s.namaSupplier||'',bulan:s.bulan||'',tahun:s.tahun||0};})).catch(function(){}));
  /* NEW: sup_data and pesanan */
  if(typeof supplierData!=='undefined'&&supplierData&&supplierData.length){
    tasks.push(SB.upsertMany('ajw_config',[{key:'sup_data',value:{data:supplierData}}]).catch(function(){}));
  }
  if(typeof pesananData!=='undefined'&&pesananData&&pesananData.length){
    tasks.push(SB.upsertMany('ajw_config',[{key:'pesanan_data',value:{data:pesananData}}]).catch(function(){}));
  }
  tasks.push(SB.upsertMany('ajw_config',[{key:'cfg_safe',value:{adminName:(getCfg().adminName||''),tabsConfig:(getCfg().tabsConfig||{})}}]).catch(function(){}));
  return Promise.all(tasks).then(function(){
    var c=getCfg(); c.lastSupabaseSync=new Date().toISOString(); saveCfg(c);
    if(!silent) toast('Sync ke Supabase berhasil!','success',5000);
    var el=document.getElementById('SB-SYNC-STATUS'); if(el) el.textContent='Terakhir sync: '+new Date().toLocaleString('id-ID');
    return {ok:true};
  }).catch(function(err){
    if(!silent) toast('Supabase error: '+(err.message||err),'error',5000);
    throw err;
  });
};

/* ── 7. EXPORT EXCEL — sorted Jan→Feb→... with TOTAL ── */
_exportExcelCore = function(list, filename){
  if(!list||!list.length){toast('Tidak ada data','warn');return;}
  /* Sort by tahun ASC then bulanNum ASC (Jan first) */
  var sorted = list.slice().sort(function(a,b){
    var ay=a.tahun||0, by=b.tahun||0;
    if(ay!==by) return ay-by;
    return (a.bulanNum||0)-(b.bulanNum||0);
  });
  var rows=[];
  var header=['Supplier','Bulan','Tahun','Tanggal','No Dokumen','Keterangan','Kode','Nilai Netto (Rp)','Tanggal Bayar','Ket. Bayar','Jumlah Bayar (Rp)','Saldo (Rp)','Status'];
  rows.push(header.map(function(h){return'"'+h+'"';}).join(','));
  var grandTotalNota=0, grandTotalBayar=0;
  sorted.forEach(function(d){
    var sup=d.namaSupplier||'Golden Fish';
    var tN=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
    var tB=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    var saldo=tN-tB, status=saldo<=0?'Lunas':'Belum Lunas';
    grandTotalNota+=tN; grandTotalBayar+=tB;
    /* Nota rows */
    (d.nota||[]).forEach(function(n){
      rows.push(['"'+sup+'"','"'+(d.bulan||'')+'"',d.tahun||'','"'+(n.tgl||'')+'"','"'+(n.noDok||'')+'"','"'+(n.keterangan||'')+'"','"'+(n.kode||'')+'"',parseFloat(n.nilaiNetto)||0,'','','',saldo,'"'+status+'"'].join(','));
    });
    /* Bayar rows */
    (d.bayar||[]).forEach(function(b){
      rows.push(['"'+sup+'"','"'+(d.bulan||'')+'"',d.tahun||'','','','','',0,'"'+(b.tgl||'')+'"','"'+(b.keterangan||'')+'"',parseFloat(b.jumlah)||0,saldo,'"'+status+'"'].join(','));
    });
    /* Sub-total per nota */
    rows.push(['"--- TOTAL '+sup+' '+d.bulan+' '+d.tahun+' ---"','','','','','','',tN,'','',tB,saldo,'"'+status+'"'].join(','));
    rows.push(''); /* spacer */
  });
  /* Grand total row */
  rows.push('');
  rows.push(['"=== GRAND TOTAL ==="','','','','','','',grandTotalNota,'','',grandTotalBayar,grandTotalNota-grandTotalBayar,'"'+(grandTotalNota-grandTotalBayar<=0?'Lunas':'Belum Lunas')+'"'].join(','));

  var blob=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='HutangSupplier_'+filename+'_'+ymd()+'.csv';
  a.click();
  toast('Export berhasil: '+filename,'success',4000);
};

/* ── 8. SUPPLIER RENDER — simplified, proper colors ── */
renderSupplier = function(){
  loadSupplierAll();
  var fromData=supplierData.map(function(s){return s.nama;});
  var fromH=supplierHutang.map(function(d){return d.namaSupplier||'Golden Fish';});
  var allNames=fromData.concat(fromH).filter(function(n,i,a){return n&&a.indexOf(n)===i;}).sort();
  if(!allNames.length) allNames=['Golden Fish'];
  var sumBySup={};
  allNames.forEach(function(nm){
    var list=supplierHutang.filter(function(d){return (d.namaSupplier||'Golden Fish')===nm;});
    var tN=list.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0);
    var tB=list.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0);
    sumBySup[nm]={nota:tN,bayar:tB,saldo:tN-tB,count:list.length};
  });
  var gN=Object.keys(sumBySup).reduce(function(t,k){return t+sumBySup[k].nota;},0);
  var gB=Object.keys(sumBySup).reduce(function(t,k){return t+sumBySup[k].bayar;},0);
  var gS=gN-gB;
  var h='';
  /* Header */
  h+='<div style="background:var(--navy);padding:14px 18px;border-radius:var(--r);margin-bottom:12px;color:#fff">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
  h+='<div><div style="font-size:17px;font-weight:700;color:#FFD700;letter-spacing:.3px">Hutang Supplier</div>';
  h+='<div style="font-size:12px;color:#93C5FD;margin-top:2px">'+allNames.length+' supplier &bull; '+supplierHutang.length+' nota &bull; Saldo: <b style="color:'+(gS>0?'#FCA5A5':'#6EE7B7')+'">Rp '+fmt(gS)+'</b></div></div></div></div>';
  /* Nav */
  var views=[{id:'dashboard',lbl:'Dashboard'},{id:'hutang',lbl:'Hutang & Nota'},{id:'pesanan',lbl:'Pesanan'},{id:'data',lbl:'Data Supplier'},{id:'history',lbl:'History Bayar'}];
  h+='<div style="display:flex;gap:3px;margin-bottom:11px;overflow-x:auto;scrollbar-width:none;background:var(--bg3);border-radius:8px;padding:4px">';
  views.forEach(function(v){
    var act=supplierView===v.id;
    h+='<button onclick="supplierView=\''+v.id+'\';renderSupplier()" style="flex:1;padding:8px 12px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:Arial;white-space:nowrap;background:'+(act?'var(--navy)':'transparent')+';color:'+(act?'#fff':'var(--tx2)')+'">'+v.lbl+'</button>';
  });
  h+='</div>';
  /* Filter */
  h+='<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center">';
  h+='<span style="font-size:12px;font-weight:600;color:var(--tx2)">Filter:</span>';
  var allAct=supplierFilter==='all';
  h+='<button onclick="supplierFilter=\'all\';renderSupplier()" style="padding:5px 14px;border-radius:20px;border:2px solid '+(allAct?'var(--navy)':'var(--bd)')+';background:'+(allAct?'var(--navy)':'var(--bg2)')+';color:'+(allAct?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">Semua</button>';
  allNames.forEach(function(nm){
    var act=supplierFilter===nm;
    var safe=_supName(nm);
    h+='<button onclick="supplierFilter=\''+safe+'\';renderSupplier()" style="padding:5px 14px;border-radius:20px;border:2px solid '+(act?'var(--navy)':'var(--bd)')+';background:'+(act?'var(--navy)':'var(--bg2)')+';color:'+(act?'#fff':'var(--tx2)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">'+esc(nm)+'</button>';
  });
  h+='</div>';
  /* Views */
  if(supplierView==='dashboard') h+=_supDash(allNames,sumBySup,gN,gB,gS);
  else if(supplierView==='hutang') h+=_supHutangV2();
  else if(supplierView==='pesanan') h+=_supPesanan(allNames);
  else if(supplierView==='data') h+=_supData();
  else if(supplierView==='history') h+=_supHistory();
  h+=_supAllModals(allNames);
  document.getElementById('V-supplier').innerHTML=h;
};

/* ── 9. _supHutangV2 — simple view + edit button + dropdown actions ── */
function _supHutangV2(){
  var filtered=supplierHutang.filter(function(d){return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter;});
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
  h+='<span style="font-size:13px;font-weight:700;color:var(--tx)">'+filtered.length+' nota ditemukan</span>';
  h+='<div style="display:flex;gap:7px">';
  h+='<button onclick="_exportExcelAll()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Export Excel</button>';
  h+='<button onclick="_openNotaModal()" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">+ Tambah Nota</button>';
  h+='</div></div>';
  if(!filtered.length) return h+'<div class="card" style="text-align:center;padding:40px;color:var(--tx2)">Belum ada nota. Klik + Tambah Nota.</div>';
  /* Group by month */
  var mGroups={};
  filtered.forEach(function(d){
    var mk=(d.tahun||2026)+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
    var ml=(d.bulan||'')+' '+(d.tahun||'');
    if(!mGroups[mk]) mGroups[mk]={label:ml,items:[]};
    mGroups[mk].items.push(d);
  });
  /* Sort months: earliest first (Jan at top) */
  var mKeys=Object.keys(mGroups).sort();
  mKeys.forEach(function(mk){
    var mg=mGroups[mk];
    var mN=mg.items.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0);
    var mB=mg.items.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0);
    var mS=mN-mB;
    h+='<div style="margin-bottom:18px">';
    /* Month header */
    h+='<div style="background:var(--navy);border-radius:var(--r) var(--r) 0 0;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h+='<span style="color:#FFD700;font-weight:700;font-size:13px">'+esc(mg.label)+'</span>';
    h+='<div style="display:flex;gap:16px;font-size:12px;color:#93C5FD">';
    h+='<span>Nota: <b style="color:#FCA5A5">Rp '+fmt(mN)+'</b></span>';
    h+='<span>Bayar: <b style="color:#6EE7B7">Rp '+fmt(mB)+'</b></span>';
    h+='<span>Saldo: <b style="color:'+(mS>0?'#FCD34D':'#6EE7B7')+'">Rp '+fmt(mS)+'</b></span>';
    h+='</div></div>';
    /* Notas */
    h+='<div style="border:1px solid var(--bd);border-top:none;border-radius:0 0 var(--r) var(--r)">';
    mg.items.forEach(function(d,di){
      var oi=supplierHutang.indexOf(d);
      var tN=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
      var tB=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
      var saldo=tN-tB, lunas=saldo<=0;
      h+='<div style="border-bottom:1px solid var(--bd)"+(di===mg.items.length-1?"style=\'border-bottom:none\'":"")+">';
      /* Nota bar */
      h+='<div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:var(--bg4)">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:'+(lunas?'#DCFCE7':'#FEF2F2')+';color:'+(lunas?'#166534':'#991B1B')+'">'+(lunas?'Lunas':'Belum Lunas')+'</span>';
      if(d.catatan) h+='<span style="font-size:12px;color:var(--tx2)">'+esc(d.catatan)+'</span>';
      h+='<span style="font-size:12px;font-weight:700;color:var(--tx)">Rp '+fmt(tN)+'</span>';
      if(tB>0) h+='<span style="font-size:12px;color:var(--green)">- Rp '+fmt(tB)+'</span>';
      h+='<span style="font-size:12px;font-weight:700;color:'+(saldo>0?'var(--red)':'var(--green)')+'">= Rp '+fmt(saldo)+'</span>';
      h+='</div>';
      /* Dropdown action button */
      h+='<div style="position:relative;display:inline-block">';
      h+='<button onclick="var m=document.getElementById(\'NOTA-DD-'+oi+'\');m.style.display=m.style.display===\'block\'?\'none\':\'block\'" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:700;font-family:Arial">Aksi &#9660;</button>';
      h+='<div id="NOTA-DD-'+oi+'" style="display:none;position:absolute;right:0;top:100%;background:var(--bg2);border:1px solid var(--bd);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;min-width:160px;overflow:hidden">';
      if(!lunas) h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openBayarModal('+oi+')" style="width:100%;padding:9px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid var(--bd);font-weight:600">+ Bayar</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openEditNotaModal('+oi+')" style="width:100%;padding:9px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid var(--bd);font-weight:600">Edit Nota</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';genInvoiceSupplier('+oi+')" style="width:100%;padding:9px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid var(--bd);font-weight:600">Invoice</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openBuktiModal('+oi+')" style="width:100%;padding:9px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid var(--bd);font-weight:600">Upload Bukti</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_exportExcelOne(_supName(supplierHutang['+oi+'].namaSupplier||\'Golden Fish\'))" style="width:100%;padding:9px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid var(--bd);font-weight:600">Export Excel</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';deleteSupplierRecord('+oi+')" style="width:100%;padding:9px 14px;border:none;background:#FEF2F2;color:var(--red);cursor:pointer;font-size:12px;font-family:Arial;text-align:left;font-weight:700">Hapus</button>';
      h+='</div></div></div>';
      /* Transactions - simplified */
      var txns=[];
      (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,isBayar:false,bukti:''});});
      (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,isBayar:true,bukti:b.bukti||''});});
      txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'');});
      h+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
      h+='<thead><tr style="background:#F8FAFC"><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:left;color:var(--tx2);font-weight:600">Tanggal</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:left;color:var(--tx2);font-weight:600">No Dokumen</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:left;color:var(--tx2);font-weight:600">Keterangan</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);color:var(--tx2);font-weight:600">Kode</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:right;color:var(--tx2);font-weight:600">Nilai Netto</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:right;color:var(--tx2);font-weight:600">Bayar</th><th style="padding:7px 12px;border-bottom:1px solid var(--bd);text-align:right;color:var(--tx2);font-weight:600">Saldo</th></tr></thead><tbody>';
      var sRun=0;
      txns.forEach(function(tx){
        sRun+=tx.netto-tx.bayar;
        h+='<tr style="border-bottom:1px solid var(--bd)">';
        h+='<td style="padding:8px 12px;color:var(--tx);white-space:nowrap">'+esc(tx.tgl||'')+'</td>';
        h+='<td style="padding:8px 12px;color:var(--tx)">'+esc(tx.noDok||'')+'</td>';
        h+='<td style="padding:8px 12px;color:'+(tx.isBayar?'var(--green)':'var(--tx)')+';font-weight:'+(tx.isBayar?'600':'400')+'">'+esc(tx.ket||'')+(tx.bukti?'&nbsp;<span style="color:var(--blue);font-size:10px">&#128248;</span>':'')+'</td>';
        h+='<td style="padding:8px 12px;color:var(--tx2);text-align:center">'+esc(tx.kode||'')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;color:'+(tx.netto>0?'var(--red)':'var(--tx3)')+'">'+( tx.netto>0?'Rp '+fmt(tx.netto):'-')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;color:'+(tx.bayar>0?'var(--green)':'var(--tx3)')+'">'+( tx.bayar>0?'Rp '+fmt(tx.bayar):'-')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:'+(sRun>0?'var(--red)':'var(--green)')+'">Rp '+fmt(sRun)+'</td></tr>';
      });
      h+='<tr style="background:#F8FAFC;border-top:2px solid var(--bd)"><td colspan="4" style="padding:8px 12px;font-weight:700;color:var(--navy)">TOTAL</td>';
      h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--red)">Rp '+fmt(tN)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--green)">Rp '+fmt(tB)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:'+(saldo>0?'var(--red)':'var(--green)')+'">Rp '+fmt(saldo)+'</td></tr>';
      h+='</tbody></table></div>';
      /* Bukti */
      if(d.buktiFoto&&d.buktiFoto.length){
        h+='<div style="padding:8px 14px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;background:var(--bg3);border-top:1px solid var(--bd)">';
        h+='<span style="font-size:11px;font-weight:600;color:var(--tx2)">Bukti:</span>';
        d.buktiFoto.forEach(function(img){h+='<img src="'+img+'" onclick="showImageFull(this.src)" style="width:68px;height:52px;object-fit:cover;border-radius:5px;border:1px solid var(--bd);cursor:pointer">';});
        h+='</div>';
      }
      h+='</div>';
    });
    h+='</div></div>';
  });
  /* Close dropdown on outside click */
  /* dropdown handled globally */  return h;
}

/* ── 10. _supDash — show inline hutang detail ── */
_supDash = function(names, sum, gNota, gBayar, gSaldo){
  var h='';
  /* Summary cards - navy only */
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  [['Total Pembelian','Rp '+fmt(gNota),'#FEF2F2','var(--red)'],
   ['Total Terbayar','Rp '+fmt(gBayar),'#F0FDF4','var(--green)'],
   ['Saldo Hutang','Rp '+fmt(gSaldo),gSaldo>0?'#FFF7ED':'#F0FDF4',gSaldo>0?'var(--orange)':'var(--green)'],
   ['Jumlah Nota',''+supplierHutang.length+' nota','#EFF6FF','var(--blue)']
  ].forEach(function(x){
    h+='<div style="background:'+x[2]+';border-radius:var(--r);padding:16px;border:1px solid var(--bd)">';
    h+='<div style="font-size:12px;font-weight:600;color:'+x[3]+';margin-bottom:6px">'+x[0]+'</div>';
    h+='<div style="font-size:20px;font-weight:800;color:'+x[3]+'">'+x[1]+'</div></div>';
  });
  h+='</div>';
  /* Supplier cards with inline hutang detail */
  var filtered=supplierFilter==='all'?names:names.filter(function(n){return n===supplierFilter;});
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-bottom:16px">';
  filtered.forEach(function(nm){
    var s=sum[nm]||{nota:0,bayar:0,saldo:0,count:0};
    var pct=s.nota>0?Math.min(100,Math.round(s.bayar/s.nota*100)):0;
    var sup=supplierData.filter(function(d){return d.nama===nm;})[0]||{};
    var safeNm=_supName(nm);
    /* Get latest nota per bulan for inline detail */
    var supNotas=supplierHutang.filter(function(d){return (d.namaSupplier||'Golden Fish')===nm;});
    var mMap={};
    supNotas.forEach(function(d){
      var mk=(d.tahun||2026)+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
      if(!mMap[mk]) mMap[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0};
      mMap[mk].nota+=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
      mMap[mk].bayar+=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    });
    var mKeys=Object.keys(mMap).sort();
    h+='<div class="card" style="padding:16px">';
    h+='<div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">';
    h+='<div style="width:42px;height:42px;border-radius:10px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:800;font-size:17px;flex-shrink:0">'+nm.charAt(0).toUpperCase()+'</div>';
    h+='<div><div style="font-weight:700;color:var(--tx);font-size:14px">'+esc(nm)+'</div>';
    h+='<div style="font-size:11px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+(sup.telepon?' &bull; '+esc(sup.telepon):'')+'</div></div></div>';
    h+='<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:var(--tx2)">Terbayar</span><span style="font-weight:700;color:'+(pct>=100?'var(--green)':'var(--orange)')+'">'+pct+'%</span></div>';
    h+='<div style="height:6px;background:var(--bg3);border-radius:3px;margin-bottom:12px"><div style="height:100%;border-radius:3px;background:'+(pct>=100?'var(--green)':pct>=50?'var(--amber)':'var(--red)')+';width:'+pct+'%"></div></div>';
    /* Inline hutang per bulan */
    if(mKeys.length){
      h+='<div style="border:1px solid var(--bd);border-radius:6px;overflow:hidden;margin-bottom:11px">';
      mKeys.forEach(function(mk,mi){
        var m=mMap[mk],saldo=m.nota-m.bayar;
        h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 11px;'+(mi>0?'border-top:1px solid var(--bd)':'')+'background:'+(saldo<=0?'#F0FDF4':'#FFF7ED')+'">';
        h+='<span style="font-size:12px;font-weight:600;color:var(--tx)">'+esc(m.label)+'</span>';
        h+='<div style="display:flex;gap:12px;font-size:12px">';
        h+='<span style="color:var(--tx2)">Nota: <b>Rp '+fmt(m.nota)+'</b></span>';
        h+='<span style="color:var(--tx2)">Saldo: <b style="color:'+(saldo>0?'var(--red)':'var(--green)')+'">Rp '+fmt(saldo)+'</b></span>';
        h+='<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:'+(saldo<=0?'#DCFCE7':'#FEE2E2')+';color:'+(saldo<=0?'#166534':'#991B1B')+';font-weight:700">'+(saldo<=0?'Lunas':'Belum')+'</span>';
        h+='</div></div>';
      });
      h+='</div>';
    }
    h+='<div style="display:flex;gap:8px">';
    h+='<button onclick="supplierFilter=\''+safeNm+'\';supplierView=\'hutang\';renderSupplier()" style="flex:1;padding:8px;background:var(--navy);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Lihat Nota</button>';
    if(s.saldo>0) h+='<button onclick="_openBayarBulk(\''+safeNm+'\')" style="flex:1;padding:8px;background:var(--green);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Bayar</button>';
    h+='</div></div>';
  });
  h+='</div>';
  /* Monthly recap */
  h+='<div class="card"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Rekap Bulanan</div>';
  var mMap2={};
  supplierHutang.filter(function(d){return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter;})
    .forEach(function(d){
      var mk=(d.tahun||2026)+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
      if(!mMap2[mk]) mMap2[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0};
      mMap2[mk].nota+=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
      mMap2[mk].bayar+=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    });
  var mKeys2=Object.keys(mMap2).sort();
  if(mKeys2.length){
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Bulan</th><th class="c">Total Nota</th><th class="c">Terbayar</th><th class="c">Saldo</th><th class="c">Status</th></tr></thead><tbody>';
    mKeys2.forEach(function(mk){
      var m=mMap2[mk],saldo=m.nota-m.bayar;
      h+='<tr><td style="font-weight:700">'+esc(m.label)+'</td>';
      h+='<td class="c" style="color:var(--red);font-weight:700">Rp '+fmt(m.nota)+'</td>';
      h+='<td class="c" style="color:var(--green);font-weight:700">Rp '+fmt(m.bayar)+'</td>';
      h+='<td class="c" style="font-weight:700;color:'+(saldo>0?'var(--red)':'var(--green)')+'">Rp '+fmt(saldo)+'</td>';
      h+='<td class="c"><span class="chip" style="background:'+(saldo<=0?'#DCFCE7':'#FEE2E2')+';color:'+(saldo<=0?'#166534':'#991B1B')+'">'+(saldo<=0?'Lunas':'Belum Lunas')+'</span></td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div style="color:var(--tx2);padding:14px;text-align:center">Belum ada data</div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">';
  h+='<button onclick="_exportExcelAll()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Export Excel Semua Supplier</button>';
  h+='<button onclick="if(supplierFilter!==\'all\')_exportExcelOne(supplierFilter);else toast(\'Pilih 1 supplier dulu\',\'warn\')" style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:9px 16px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Export Supplier Aktif</button>';
  h+='</div>';
  return h;
};

/* ── 11. EDIT NOTA MODAL ── */
function _openEditNotaModal(idx){
  var d=supplierHutang[idx]; if(!d) return;
  /* Open the standard nota modal pre-filled */
  var existing=document.getElementById('M-NOTA'); if(!existing) return;
  window._mnCnt=1; window._mnBCnt=1;
  var MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  /* Reset and re-populate */
  document.getElementById('M-NOTA').style.display='flex';
  setTimeout(function(){
    /* Set supplier */
    var supSel=document.getElementById('MN-SUP');
    if(supSel) for(var i=0;i<supSel.options.length;i++){if(supSel.options[i].value===d.namaSupplier){supSel.selectedIndex=i;break;}}
    /* Set month */
    var blnSel=document.getElementById('MN-BLN');
    if(blnSel) for(var j=0;j<blnSel.options.length;j++){if(blnSel.options[j].value===d.bulan){blnSel.selectedIndex=j;break;}}
    /* Set year */
    var thnEl=document.getElementById('MN-THN'); if(thnEl) thnEl.value=d.tahun||new Date().getFullYear();
    /* Set catatan */
    var catEl=document.getElementById('MN-CAT'); if(catEl) catEl.value=d.catatan||'';
    /* Fill nota items */
    var notaWrap=document.getElementById('MN-ITEMS');
    if(notaWrap){
      notaWrap.innerHTML='';
      (d.nota||[{tgl:'',noDok:'',keterangan:'',kode:'',nilaiNetto:0}]).forEach(function(n,idx2){
        if(idx2>0) window._mnCnt=(window._mnCnt||1)+1;
        var r=_notaRow(idx2); notaWrap.insertAdjacentHTML('beforeend',r);
        setTimeout(function(){
          var tEl=document.getElementById('MN-TGL-'+idx2); if(tEl) tEl.value=n.tgl||'';
          var dEl=document.getElementById('MN-DOK-'+idx2); if(dEl) dEl.value=n.noDok||'';
          var kEl=document.getElementById('MN-KET-'+idx2); if(kEl) kEl.value=n.keterangan||'';
          var koEl=document.getElementById('MN-KOD-'+idx2); if(koEl) koEl.value=n.kode||'';
          var nEl=document.getElementById('MN-NET-'+idx2); if(nEl) nEl.value=n.nilaiNetto||0;
        },50);
      });
    }
    /* Fill bayar items */
    var bayarWrap=document.getElementById('MN-BAYAR');
    if(bayarWrap){
      bayarWrap.innerHTML='';
      (d.bayar&&d.bayar.length?d.bayar:[{tgl:'',keterangan:'',jumlah:0}]).forEach(function(b,idx3){
        if(idx3>0) window._mnBCnt=(window._mnBCnt||1)+1;
        var r=_bayarRow(idx3); bayarWrap.insertAdjacentHTML('beforeend',r);
        setTimeout(function(){
          var tEl=document.getElementById('MB-TGL-'+idx3); if(tEl) tEl.value=b.tgl||'';
          var kEl=document.getElementById('MB-KET-'+idx3); if(kEl) kEl.value=b.keterangan||'';
          var jEl=document.getElementById('MB-JML-'+idx3); if(jEl) jEl.value=b.jumlah||0;
        },50);
      });
    }
    /* Change save button to update */
    var saveBtn=document.querySelector('#M-NOTA button[onclick="_saveNota()"]');
    if(saveBtn){
      saveBtn.textContent='Update Nota';
      saveBtn.setAttribute('onclick','_updateNota('+idx+')');
    }
    /* Change title */
    var hdr=document.querySelector('#M-NOTA span[style*="font-weight:700"]');
    if(hdr) hdr.textContent='Edit Nota';
  },80);
}

function _updateNota(idx){
  var nota=[]; var i=0;
  while(document.getElementById('MN-TGL-'+i)){
    var net=parseFloat(document.getElementById('MN-NET-'+i).value)||0;
    var ket=document.getElementById('MN-KET-'+i).value.trim();
    if(ket||net>0) nota.push({tgl:document.getElementById('MN-TGL-'+i).value,noDok:document.getElementById('MN-DOK-'+i).value.trim(),keterangan:ket,kode:document.getElementById('MN-KOD-'+i).value.trim(),nilaiNetto:net});
    i++;
  }
  var bayar=[]; var j=0;
  while(document.getElementById('MB-TGL-'+j)){
    var jml=parseFloat(document.getElementById('MB-JML-'+j).value)||0;
    if(jml>0) bayar.push({tgl:document.getElementById('MB-TGL-'+j).value,keterangan:document.getElementById('MB-KET-'+j).value.trim(),jumlah:jml});
    j++;
  }
  var blnEl=document.getElementById('MN-BLN');
  var blnNum=blnEl?blnEl.selectedIndex+1:supplierHutang[idx].bulanNum;
  supplierHutang[idx].nota=nota;
  supplierHutang[idx].bayar=bayar;
  supplierHutang[idx].namaSupplier=document.getElementById('MN-SUP').value;
  supplierHutang[idx].bulan=document.getElementById('MN-BLN').value;
  supplierHutang[idx].bulanNum=blnNum;
  supplierHutang[idx].tahun=parseInt(document.getElementById('MN-THN').value)||new Date().getFullYear();
  supplierHutang[idx].catatan=document.getElementById('MN-CAT').value.trim();
  saveSupplier();
  document.getElementById('M-NOTA').style.display='none';
  toast('Nota berhasil diupdate!','success');
  renderSupplier();
}

/* ── INIT ── */
buildTabBar();
/* Close nota dropdowns on outside click */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t) return;
  var onc = t.getAttribute ? (t.getAttribute('onclick')||'') : '';
  var inDD = false;
  var el = t;
  while(el && el !== document.body){
    if(el.id && el.id.indexOf('NOTA-DD-')===0){ inDD=true; break; }
    el = el.parentNode;
  }
  if(!inDD && onc.indexOf('NOTA-DD-')<0){
    var dds = document.querySelectorAll('div[id]');
    dds.forEach(function(d){ if(d.id && d.id.indexOf('NOTA-DD-')===0) d.style.display='none'; });
  }
});
/* Hide unused tab divs */
['finansial','operasional','aichat'].forEach(function(id){
  var el=document.getElementById('V-'+id);
  if(el) el.style.display='none';
});
/* Apply normal font size */
document.documentElement.style.fontSize='16px';
if(document.body) document.body.style.fontSize='15px';

/* ================================================================
   AJW DEFINITIVE PATCH — v9
   Strategy: No CSS classes for dropdowns (uses inline style only)
   Dropdown = div with style.display toggle (100% reliable)
================================================================ */

/* ── 1. GLOBAL VARS ── */
var _activeTab = 'dash';
var _lbYear = new Date().getFullYear();
var _lbEditId = null;
var _lb = [];

/* ── 2. LOAD LAPORAN DATA ── */
(function(){
  try { _lb = JSON.parse(localStorage.getItem('ajw_laporan')||'[]'); } catch(e){ _lb=[]; }
  if(!_lb.length){
    var M=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    [2025,2026,2027].forEach(function(yr){
      M.forEach(function(m,i){ _lb.push({id:yr+'-'+(i+1),bulan:m,tahun:yr,bulanNum:i+1,penjualan:0,targetPenjualan:300000000,cash:0,berulang:0,pengeluaran:0,catatan:'',platform:{shopee:0,tiktok:0,lazada:0,lainnya:0}}); });
    });
    localStorage.setItem('ajw_laporan',JSON.stringify(_lb));
  }
})();
function _saveLB(){ localStorage.setItem('ajw_laporan',JSON.stringify(_lb)); }

/* ── 3. DROPDOWN TAB BAR — NO CSS CLASSES, PURE INLINE STYLE ── */
function _buildTabs(){
  var cfg=getCfg(); var tc=cfg.tabsConfig||{};
  var role=window._ajwRole||'admin';
  var groups=[
    {type:'s', id:'dash',    lbl:'Dashboard'},
    {type:'g', id:'hr',     lbl:'HR ▾', tabs:[
      {id:'hr-dash', lbl:'Dashboard HR'},
      {id:'eval',    lbl:'Penilaian'},
      {id:'payroll', lbl:'Payroll'},
      {id:'emp',     lbl:'Karyawan'},
      {id:'hist',    lbl:'Riwayat'}
    ]},
    {type:'g', id:'finance', lbl:'Finance ▾', tabs:[
      {id:'laporan',  lbl:'Laporan Bulanan'},
      {id:'supplier', lbl:'Hutang Supplier'},
      {id:'kpi',      lbl:'KPI Bisnis'}
    ]},
    {type:'s', id:'taligf', lbl:'Tali GF'},
    {type:'s', id:'stats',  lbl:'Statistik'},
    {type:'s', id:'admin',  lbl:'Admin'}
  ];

  var BASE_BTN = 'border:none;cursor:pointer;font-family:Arial;font-weight:700;font-size:12px;white-space:nowrap;padding:10px 14px;background:transparent;transition:color .1s;';
  var h = '';
  groups.forEach(function(g){
    if(g.id==='admin' && role!=='admin') return;
    if(tc['hide_'+g.id]) return;
    var lbl = tc['label_'+g.id]||g.lbl;

    if(g.type==='s'){
      var act = _activeTab===g.id;
      h += '<button id="TB-'+g.id+'" onclick="_go(\''+g.id+'\')" style="'+BASE_BTN+'color:'+(act?'#111':'#666')+';border-bottom:3px solid '+(act?'#111':'transparent')+';margin-bottom:-2px">'+esc(lbl)+'</button>';
    } else {
      /* group: check if any child is active */
      var grpAct = g.tabs.some(function(t){ return t.id===_activeTab; });
      h += '<div style="position:relative;display:inline-flex;align-items:stretch">';
      h += '<button id="TGB-'+g.id+'" onclick="_ddToggle(\''+g.id+'\')" style="'+BASE_BTN+'color:'+(grpAct?'#111':'#666')+';border-bottom:3px solid '+(grpAct?'#111':'transparent')+';margin-bottom:-2px">'+esc(lbl)+'</button>';
      /* Dropdown panel — starts hidden via style.display */
      h += '<div id="TDD-'+g.id+'" style="display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #ddd;border-radius:0 0 8px 8px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:200px;z-index:9999;overflow:hidden">';
      g.tabs.forEach(function(t){
        if(role!=='admin' && (t.id==='eval'||t.id==='payroll'||t.id==='hist')) return;
        var tAct = _activeTab===t.id;
        h += '<button onclick="_ddClose();_go(\''+t.id+'\')" style="display:block;width:100%;padding:10px 16px;border:none;background:'+(tAct?'#f0f0f0':'#fff')+';color:'+(tAct?'#111':'#444')+';cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid #f5f5f5;font-weight:'+(tAct?'700':'500')+';box-sizing:border-box'+(tAct?';border-left:3px solid #111':'')+'">'+esc(t.lbl)+'</button>';
      });
      h += '</div></div>';
    }
  });
  /* Custom tabs */
  if(typeof customTabs!=='undefined') customTabs.forEach(function(ct){
    var act = _activeTab==='ct_'+ct.id;
    h += '<button onclick="_go(\'ct_'+ct.id+'\')" style="'+BASE_BTN+'color:'+(act?'#111':'#666')+';border-bottom:3px solid '+(act?'#111':'transparent')+';margin-bottom:-2px">'+esc(ct.name)+'</button>';
  });

  var el = document.getElementById('TABS');
  if(el) el.innerHTML = h;
}

function _ddToggle(id){
  var dd = document.getElementById('TDD-'+id);
  if(!dd) return;
  var isOpen = dd.style.display==='block';
  _ddClose(); /* close all first */
  if(!isOpen) dd.style.display = 'block';
}

function _ddClose(){
  ['hr','finance'].forEach(function(id){
    var dd = document.getElementById('TDD-'+id);
    if(dd) dd.style.display = 'none';
  });
}

/* Close on outside click */
document.addEventListener('click', function(e){
  var el = e.target;
  while(el && el !== document.body){
    if(el.id && (el.id.indexOf('TDD-')===0 || el.id.indexOf('TGB-')===0)) return;
    el = el.parentNode;
  }
  _ddClose();
  /* Also close nota dropdowns */
  document.querySelectorAll('[id^="NDD-"]').forEach(function(d){ d.style.display='none'; });
});

function _go(tabId){
  _activeTab = tabId;
  _buildTabs();

  /* Ensure V-hr-dash and V-laporan exist */
  ['hr-dash','laporan'].forEach(function(id){
    if(!document.getElementById('V-'+id)){
      var d=document.createElement('div'); d.id='V-'+id; d.style.display='none';
      var b=document.querySelector('.body'); if(b) b.appendChild(d);
    }
  });

  /* Show/hide all divs */
  var all=['dash','eval','payroll','stats','emp','hist','kpi','aichat','finansial','operasional','supplier','taligf','admin','hr-dash','laporan'];
  if(typeof customTabs!=='undefined') customTabs.forEach(function(ct){ all.push('ct_'+ct.id); });
  all.forEach(function(id){
    var v=document.getElementById('V-'+id);
    if(v) v.style.display=(id===tabId)?'block':'none';
  });

  /* Render */
  if(tabId==='dash') renderDash();
  else if(tabId==='hr-dash') _renderHRDash();
  else if(tabId==='laporan') _renderLaporan();
  else if(tabId==='kpi'){ if(typeof loadKPI==='function')loadKPI(); if(typeof renderKPI==='function')renderKPI(); }
  else if(tabId==='stats') renderStats();
  else if(tabId==='emp') renderEmp();
  else if(tabId==='hist') renderHist();
  else if(tabId==='admin') renderAdmin();
  else if(tabId==='supplier') renderSupplier();
  else if(tabId==='taligf'){ if(typeof renderTaliGF==='function')renderTaliGF(); }
  else if(tabId.indexOf('ct_')===0){ if(typeof renderCustomTab==='function') renderCustomTab(tabId.replace('ct_','')); }
  window.scrollTo(0,0);
}

/* Override SW and buildTabBar */
SW = function(tab){ _go(tab); };
buildTabBar = function(){ _buildTabs(); };

/* ── 4. LOGIN ── */
(function(){
  var PASS_ADMIN = '@Alva711119';
  var SK = 'ajw_session';
  var sess = null;
  try{ sess=JSON.parse(localStorage.getItem(SK)||'null'); }catch(e){}
  if(sess && sess.role && Date.now()-sess.time < 8*3600*1000){
    window._ajwRole=sess.role; window._ajwUser=sess.user||'Admin';
    _updateBadge(); return;
  }
  /* Show login */
  var ov=document.createElement('div');
  ov.id='AJW-LOGIN-OV';
  ov.style.cssText='position:fixed;inset:0;background:#0a0a0a;display:flex;justify-content:center;align-items:center;z-index:99999;font-family:Arial';
  ov.innerHTML='<div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:36px 40px;width:340px;max-width:92vw">'
    +'<div style="text-align:center;margin-bottom:28px"><div style="font-size:11px;letter-spacing:.2em;color:#555;font-weight:700;margin-bottom:6px">ANTON JAYA WIJAYA</div>'
    +'<div style="font-size:22px;font-weight:800;color:#fff">AJW Sistem</div>'
    +'<div style="width:32px;height:2px;background:#fff;margin:10px auto 0"></div></div>'
    +'<div style="margin-bottom:12px"><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:.08em">Nama</label>'
    +'<input id="LI-U" type="text" placeholder="Nama Anda" style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:10px 12px;color:#fff;font-size:13px;font-family:Arial;outline:none;box-sizing:border-box" onkeydown="if(event.key===\'Enter\')document.getElementById(\'LI-P\').focus()"></div>'
    +'<div style="margin-bottom:16px"><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:.08em">Password</label>'
    +'<input id="LI-P" type="password" placeholder="••••••••" style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:10px 12px;color:#fff;font-size:13px;font-family:Arial;outline:none;box-sizing:border-box" onkeydown="if(event.key===\'Enter\')_doLogin()"></div>'
    +'<div id="LI-ERR" style="color:#cc3333;font-size:12px;margin-bottom:10px;display:none;text-align:center"></div>'
    +'<button onclick="_doLogin()" style="width:100%;background:#fff;color:#111;border:none;border-radius:6px;padding:11px;cursor:pointer;font-size:13px;font-weight:800;font-family:Arial">Masuk</button>'
    +'<div style="margin-top:14px;text-align:center;font-size:11px;color:#444">Admin: @Alva711119 &nbsp;|&nbsp; Karyawan: 6 digit akhir WA</div>'
    +'</div>';
  document.body.appendChild(ov);
  setTimeout(function(){ var u=document.getElementById('LI-U'); if(u)u.focus(); }, 100);
})();

window._doLogin = function(){
  var u=(document.getElementById('LI-U').value||'').trim();
  var p=document.getElementById('LI-P').value;
  var err=document.getElementById('LI-ERR');
  if(!u){ err.style.display='block'; err.textContent='Masukkan nama Anda'; return; }
  if(!p){ err.style.display='block'; err.textContent='Masukkan password'; return; }
  var role=null;
  if(p==='@Alva711119'){ role='admin'; }
  else{
    var em=employees.filter(function(e){ return e.noWA&&p===e.noWA.replace(/\D/g,'').slice(-6); });
    if(em.length) role='karyawan';
  }
  if(!role){ err.style.display='block'; err.textContent='Password salah'; return; }
  localStorage.setItem('ajw_session',JSON.stringify({role:role,user:u,time:Date.now()}));
  window._ajwRole=role; window._ajwUser=u;
  var ov=document.getElementById('AJW-LOGIN-OV'); if(ov)ov.remove();
  _updateBadge();
  _buildTabs();
  renderDash();
  toast('Selamat datang, '+u+'!','success',3000);
};

window._doLogout = function(){
  localStorage.removeItem('ajw_session');
  window.location.reload();
};

function _updateBadge(){
  var el=document.getElementById('BADGE'); if(!el) return;
  var role=window._ajwRole||'admin', user=window._ajwUser||'Admin';
  el.innerHTML='<div style="line-height:1.3"><div style="color:#FFD700;font-weight:700;font-size:13px">'+esc(user)+'</div>'
    +'<div style="color:#aaa;font-size:10px">'+(role==='admin'?'Admin':'Karyawan')+'</div></div>'
    +'<button onclick="_doLogout()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.7);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:10px;font-family:Arial;margin-left:6px">Keluar</button>';
}

/* ── 5. HR DASHBOARD ── */
function _renderHRDash(){
  var el=document.getElementById('V-hr-dash'); if(!el)return;
  var actEmp=employees.filter(function(e){return e.statusAktif!==false;}).length;
  var totPay=payHistory.reduce(function(t,p){return t+(p.bersih||0);},0);
  var avgEval=evalHistory.length?(evalHistory.reduce(function(t,e){return t+(e.fs||0);},0)/evalHistory.length).toFixed(2):'-';
  var h='<div style="margin-bottom:16px"><h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:3px">Dashboard HR</h2>'
    +'<p style="font-size:13px;color:#666">Ringkasan Human Resources — Anton Jaya Wijaya</p></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">';
  [['Karyawan Aktif',actEmp,''],['Total Penilaian',evalHistory.length,''],['Rata-rata Nilai',avgEval,'/4.00'],['Total Payroll','Rp '+fmt(totPay),'']].forEach(function(x){
    h+='<div style="background:#fff;border:1px solid #e8e8e8;border-radius:8px;padding:16px"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px">'+x[0]+'</div><div style="font-size:22px;font-weight:800;color:#111">'+x[1]+'<span style="font-size:12px;color:#666;font-weight:400">'+x[2]+'</span></div></div>';
  });
  h+='</div>';
  if(evalHistory.length){
    h+='<div style="background:#fff;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;margin-bottom:14px">';
    h+='<div style="padding:13px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:#111">Penilaian Terbaru</div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8f8f8"><th style="padding:9px 14px;text-align:left;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Nama</th><th style="padding:9px 14px;text-align:center;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Grade</th><th style="padding:9px 14px;text-align:right;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Nilai</th><th style="padding:9px 14px;text-align:right;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Tanggal</th></tr></thead><tbody>';
    evalHistory.slice(0,6).forEach(function(e){
      h+='<tr style="border-bottom:1px solid #f5f5f5"><td style="padding:9px 14px;font-weight:600;color:#111">'+esc((e.info&&e.info.nama)||'-')+'</td><td style="padding:9px 14px;text-align:center"><span style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">'+esc(e.grade||'-')+'</span></td><td style="padding:9px 14px;text-align:right;font-weight:700;color:#111">'+(e.fs||0).toFixed(2)+'</td><td style="padding:9px 14px;text-align:right;font-size:11px;color:#999">'+(e.submittedAt||'').slice(0,10)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  if(payHistory.length){
    h+='<div style="background:#fff;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden">';
    h+='<div style="padding:13px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:#111">Payroll Terbaru</div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8f8f8"><th style="padding:9px 14px;text-align:left;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Nama</th><th style="padding:9px 14px;text-align:center;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Periode</th><th style="padding:9px 14px;text-align:right;font-weight:700;color:#666;border-bottom:1px solid #f0f0f0">Gaji Bersih</th></tr></thead><tbody>';
    payHistory.slice(0,5).forEach(function(p){
      var per=(p.info&&p.info.bulan)?((p.info.bulan||'')+(p.info.tahun?' '+p.info.tahun:'')):((p.info&&p.info.tglMulai)||'').slice(0,7)||'-';
      h+='<tr style="border-bottom:1px solid #f5f5f5"><td style="padding:9px 14px;font-weight:600;color:#111">'+esc((p.info&&p.info.nama)||'-')+'</td><td style="padding:9px 14px;text-align:center;color:#666">'+esc(per)+'</td><td style="padding:9px 14px;text-align:right;font-weight:700;color:#111">Rp '+fmt(p.bersih||0)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  el.innerHTML=h;
}

/* ── 6. LAPORAN BULANAN ── */
function _renderLaporan(){
  var el=document.getElementById('V-laporan'); if(!el)return;
  var years=[]; _lb.forEach(function(l){if(years.indexOf(l.tahun)<0)years.push(l.tahun);}); years.sort();
  if(!years.length)years=[new Date().getFullYear()];
  var yr=_lbYear;
  var rows=_lb.filter(function(l){return l.tahun===yr;}).sort(function(a,b){return a.bulanNum-b.bulanNum;});
  var totP=rows.reduce(function(t,l){return t+l.penjualan;},0);
  var totC=rows.reduce(function(t,l){return t+l.cash;},0);
  var totE=rows.reduce(function(t,l){return t+l.pengeluaran;},0);
  var h='<div style="background:#111;padding:14px 18px;border-radius:8px;margin-bottom:14px">'
    +'<div style="color:#fff;font-weight:800;font-size:17px">Laporan Bulanan</div>'
    +'<div style="color:#888;font-size:12px;margin-top:2px">Rekap keuangan & penjualan per bulan</div></div>';
  /* Year pills */
  h+='<div style="display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap">';
  years.forEach(function(y){
    h+='<button onclick="_lbYear='+y+';_renderLaporan()" style="padding:5px 14px;border-radius:20px;border:1.5px solid '+(yr===y?'#111':'#ddd')+';background:'+(yr===y?'#111':'#fff')+';color:'+(yr===y?'#fff':'#555')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">'+y+'</button>';
  });
  h+='</div>';
  /* Summary */
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  [['Total Penjualan','Rp '+fmt(totP)],['Cash Masuk','Rp '+fmt(totC)],['Pengeluaran','Rp '+fmt(totE)],['Saldo','Rp '+fmt(totC-totE)]].forEach(function(x){
    h+='<div style="background:#fff;border:1px solid #e8e8e8;border-radius:8px;padding:16px"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">'+x[0]+'</div><div style="font-size:19px;font-weight:800;color:#111">'+x[1]+'</div></div>';
  });
  h+='</div>';
  /* Main table */
  h+='<div style="background:#fff;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;overflow-x:auto">';
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;min-width:800px">';
  h+='<thead><tr style="background:#111">';
  ['Bulan','Target','Penjualan','Progress','Cash','Berulang','Pengeluaran','Saldo',''].forEach(function(th,ti){
    h+='<th style="padding:10px 12px;color:#fff;font-weight:700;border-right:1px solid #222;text-align:'+(ti===0||ti===8?'left':'right')+'">'+th+'</th>';
  });
  h+='</tr></thead><tbody>';
  var M=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  M.forEach(function(bulan,mi){
    var lb=rows.filter(function(l){return l.bulan===bulan;})[0]||{id:yr+'-'+(mi+1),bulan:bulan,tahun:yr,bulanNum:mi+1,penjualan:0,targetPenjualan:300000000,cash:0,berulang:0,pengeluaran:0,catatan:'',platform:{}};
    var pct=lb.targetPenjualan>0?Math.min(100,Math.round(lb.penjualan/lb.targetPenjualan*100)):0;
    var saldo=lb.cash-lb.pengeluaran;
    var isNow=(new Date().getMonth()+1)===lb.bulanNum&&new Date().getFullYear()===yr;
    var bg=isNow?'#fafafa':'#fff';
    h+='<tr style="border-bottom:1px solid #f0f0f0;background:'+bg+'" onmouseover="this.style.background=\'#f8f8f8\'" onmouseout="this.style.background=\''+bg+'\'">';
    h+='<td style="padding:9px 12px;font-weight:'+(isNow?'700':'500')+';border-right:1px solid #f0f0f0">'+esc(bulan)+(isNow?'<span style="font-size:9px;background:#111;color:#fff;padding:1px 6px;border-radius:3px;margin-left:6px">Bulan Ini</span>':'')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;color:#999;border-right:1px solid #f0f0f0">Rp '+fmt(lb.targetPenjualan)+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:600;color:#111;border-right:1px solid #f0f0f0">'+(lb.penjualan?'Rp '+fmt(lb.penjualan):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:center;border-right:1px solid #f0f0f0">';
    if(lb.penjualan>0)h+='<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:4px;background:#e8e8e8;border-radius:2px"><div style="height:100%;border-radius:2px;background:#111;width:'+pct+'%"></div></div><span style="font-size:11px;font-weight:700;min-width:34px">'+pct+'%</span></div>';
    else h+='-';
    h+='</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:600;color:#111;border-right:1px solid #f0f0f0">'+(lb.cash?'Rp '+fmt(lb.cash):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;color:#666;border-right:1px solid #f0f0f0">'+(lb.berulang?'Rp '+fmt(lb.berulang):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;color:'+(lb.pengeluaran?'#cc0000':'#999')+';border-right:1px solid #f0f0f0">'+(lb.pengeluaran?'Rp '+fmt(lb.pengeluaran):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:700;color:'+(saldo>0?'#111':saldo<0?'#cc0000':'#999')+';border-right:1px solid #f0f0f0">'+(lb.cash||lb.pengeluaran?'Rp '+fmt(saldo):'-')+'</td>';
    h+='<td style="padding:9px 12px"><button onclick="_lbEdit(\''+lb.id+'\')" style="background:#111;color:#fff;border:none;border-radius:5px;padding:5px 11px;cursor:pointer;font-size:11px;font-weight:700;font-family:Arial">Edit</button></td></tr>';
  });
  /* Total */
  var totTgt=rows.reduce(function(t,l){return t+l.targetPenjualan;},0);
  h+='<tr style="background:#111"><td style="padding:9px 12px;color:#fff;font-weight:700;border-right:1px solid #222">Total '+yr+'</td><td style="padding:9px 12px;text-align:right;color:#888;border-right:1px solid #222">Rp '+fmt(totTgt)+'</td><td style="padding:9px 12px;text-align:right;color:#fff;font-weight:700;border-right:1px solid #222">Rp '+fmt(totP)+'</td><td style="padding:9px 12px;text-align:center;color:#ccc;border-right:1px solid #222">'+(totTgt?Math.round(totP/totTgt*100)+'%':'-')+'</td><td style="padding:9px 12px;text-align:right;color:#fff;font-weight:700;border-right:1px solid #222">Rp '+fmt(totC)+'</td><td style="border-right:1px solid #222"></td><td style="padding:9px 12px;text-align:right;color:#fca5a5;font-weight:700;border-right:1px solid #222">Rp '+fmt(totE)+'</td><td style="padding:9px 12px;text-align:right;font-weight:700;color:'+(totC-totE>=0?'#6ee7b7':'#fca5a5')+'">Rp '+fmt(totC-totE)+'</td><td></td></tr>';
  h+='</tbody></table></div>';
  /* Edit modal */
  if(_lbEditId){
    var lb2=_lb.filter(function(l){return l.id===_lbEditId;})[0];
    if(lb2){
      h+='<div id="LBM" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;display:flex;justify-content:center;align-items:center;padding:20px" onclick="if(event.target.id===\'LBM\'){_lbEditId=null;_renderLaporan()}">';
      h+='<div style="background:#fff;border-radius:8px;padding:22px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">';
      h+='<div style="font-size:15px;font-weight:800;color:#111;margin-bottom:16px">Edit: '+esc(lb2.bulan)+' '+lb2.tahun+'</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
      [['LBF-P','Penjualan (Rp)',lb2.penjualan],['LBF-T','Target Penjualan (Rp)',lb2.targetPenjualan],
       ['LBF-C','Cash Masuk (Rp)',lb2.cash],['LBF-B','Berulang (Rp)',lb2.berulang],
       ['LBF-E','Pengeluaran (Rp)',lb2.pengeluaran]].forEach(function(f){
        h+='<div><label style="font-size:11px;font-weight:700;color:#666;display:block;margin-bottom:4px">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" value="'+(f[2]||0)+'"></div>';
      });
      h+='</div>';
      var p2=lb2.platform||{};
      h+='<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:700;color:#666;margin-bottom:8px">Penjualan per Platform</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">';
      [['LBF-SP','Shopee',p2.shopee||0],['LBF-TK','TikTok',p2.tiktok||0],['LBF-LZ','Lazada',p2.lazada||0],['LBF-LN','Lainnya',p2.lainnya||0]].forEach(function(f){
        h+='<div><label style="font-size:11px;font-weight:700;color:#666;display:block;margin-bottom:4px">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" value="'+f[2]+'"></div>';
      });
      h+='</div></div>';
      h+='<div style="margin-bottom:14px"><label style="font-size:11px;font-weight:700;color:#666;display:block;margin-bottom:4px">Catatan</label><textarea id="LBF-CAT" class="fi" rows="2">'+esc(lb2.catatan||'')+'</textarea></div>';
      h+='<div style="display:flex;gap:8px;justify-content:flex-end"><button onclick="_lbEditId=null;_renderLaporan()" style="background:#fff;color:#333;border:1.5px solid #ccc;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Batal</button><button onclick="_lbSave(\''+lb2.id+'\')" style="background:#111;color:#fff;border:none;border-radius:6px;padding:9px 20px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan</button></div>';
      h+='</div></div>';
    }
  }
  el.innerHTML=h;
}
function _lbEdit(id){ _lbEditId=id; _renderLaporan(); }
function _lbSave(id){
  var i=_lb.findIndex(function(l){return l.id===id;}); if(i<0)return;
  var g=function(eid){var el=document.getElementById(eid);return el?parseFloat(el.value)||0:0;};
  _lb[i].penjualan=g('LBF-P'); _lb[i].targetPenjualan=g('LBF-T'); _lb[i].cash=g('LBF-C');
  _lb[i].berulang=g('LBF-B'); _lb[i].pengeluaran=g('LBF-E');
  var caEl=document.getElementById('LBF-CAT'); _lb[i].catatan=caEl?caEl.value:'';
  _lb[i].platform={shopee:g('LBF-SP'),tiktok:g('LBF-TK'),lazada:g('LBF-LZ'),lainnya:g('LBF-LN')};
  _saveLB(); _lbEditId=null; toast('Laporan disimpan!','success'); _renderLaporan();
}

/* ── 7. COMPLETE exportData / importData ── */
exportData = function(){
  var cfg=getCfg();
  /* Remove sensitive keys if needed — we keep all for full backup */
  var data={
    _version:9, _exported:new Date().toISOString(),
    /* HR */
    evalHistory:evalHistory, payHistory:payHistory, employees:employees,
    /* Finance */
    supplierHutang:supplierHutang, supplierData:supplierData||[],
    pesananData:pesananData||[], laporanBulanan:_lb||[],
    /* KPI */
    kpiData:typeof kpiData!=='undefined'?kpiData:[],
    /* Custom tabs */
    customTabs:customTabs||[],
    /* Config (all settings incl API keys, tokens, etc) */
    config:cfg
  };
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='AJW_FullBackup_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  toast('Backup lengkap berhasil didownload!','success',4000);
};

importData = function(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange=function(e){
    var fr=new FileReader();
    fr.onload=function(ev){
      try{
        var d=JSON.parse(ev.target.result);
        if(d.evalHistory) { evalHistory=d.evalHistory; sv('ajw_eval',evalHistory); }
        if(d.payHistory)  { payHistory=d.payHistory;   sv('ajw_pay',payHistory); }
        if(d.employees)   { employees=d.employees;     sv('ajw_emp',employees); }
        if(d.supplierHutang){ supplierHutang=d.supplierHutang; sv('ajw_supplier',supplierHutang); }
        if(d.supplierData){ supplierData=d.supplierData; sv('ajw_sup_data',supplierData); }
        if(d.pesananData) { pesananData=d.pesananData;  sv('ajw_pesanan',pesananData); }
        if(d.laporanBulanan){ _lb=d.laporanBulanan; _saveLB(); }
        if(d.kpiData)     { kpiData=d.kpiData;       sv('ajw_kpi',kpiData); }
        if(d.customTabs)  { customTabs=d.customTabs; sv('ajw_tabs',customTabs); }
        if(d.config){
          /* Merge config, keep current sensitive keys if not in backup */
          var cur=getCfg();
          var merged=Object.assign({},cur,d.config);
          saveCfg(merged);
        }
        toast('Import berhasil! Semua data dipulihkan.','success',5000);
        _buildTabs(); renderDash();
      }catch(err){ toast('Error import: '+err.message,'error',5000); }
    };
    fr.readAsText(e.target.files[0]);
  };
  inp.click();
};

/* ── 8. SUPABASE SYNC — complete ── */
syncAllToSupabase = function(silent){
  if(!SB.init()){if(!silent)toast('Supabase belum dikonfigurasi','error');return Promise.reject('nc');}
  if(!silent)toast('Sync ke Supabase...','info',7000);
  var t=[];
  if(employees.length) t.push(SB.upsertMany('ajw_employees',employees.map(function(e){return{id:e.id,data:e};})).catch(function(){}));
  if(evalHistory.length) t.push(SB.upsertMany('ajw_eval',evalHistory.map(function(e){return{id:e.id,data:e,nama:(e.info&&e.info.nama)||'',grade:e.grade||'',nilai:e.fs||0};})).catch(function(){}));
  if(payHistory.length) t.push(SB.upsertMany('ajw_payroll',payHistory.map(function(p){return{id:p.id,data:p,nama:(p.info&&p.info.nama)||'',gaji_bersih:p.bersih||0};})).catch(function(){}));
  if(typeof kpiData!=='undefined'&&kpiData&&kpiData.length) t.push(SB.upsertMany('ajw_kpi',kpiData.map(function(k){return{periode:k.periode,data:k};})).catch(function(){}));
  if(supplierHutang.length) t.push(SB.upsertMany('ajw_supplier',supplierHutang.map(function(s){return{id:s.id,data:s,nama_supplier:s.namaSupplier||'',bulan:s.bulan||'',tahun:s.tahun||0};})).catch(function(){}));
  var cfg=getCfg(), cfgRows=[
    {key:'sup_data',value:{data:supplierData||[]}},
    {key:'pesanan_data',value:{data:pesananData||[]}},
    {key:'laporan_bulanan',value:{data:_lb||[]}},
    {key:'cfg_safe',value:{adminName:cfg.adminName||'',tabsConfig:cfg.tabsConfig||{}}}
  ];
  t.push(SB.upsertMany('ajw_config',cfgRows).catch(function(){}));
  return Promise.all(t).then(function(){
    var c=getCfg();c.lastSupabaseSync=new Date().toISOString();saveCfg(c);
    if(!silent)toast('Sync Supabase berhasil!','success',4000);
    var el=document.getElementById('SB-SYNC-STATUS');if(el)el.textContent='Terakhir sync: '+new Date().toLocaleString('id-ID');
    return{ok:true};
  }).catch(function(err){if(!silent)toast('Supabase error: '+(err&&err.message||err),'error',4000);throw err;});
};

var _svD=sv;
sv=function(k,v){
  _svD(k,v);
  var c=getCfg();
  if(!c.supabaseAutoSync||!c.supabaseUrl||!c.supabaseKey)return;
  if(!{ajw_emp:1,ajw_eval:1,ajw_pay:1,ajw_kpi:1,ajw_supplier:1,ajw_sup_data:1,ajw_pesanan:1}[k])return;
  if(window._svT)clearTimeout(window._svT);
  window._svT=setTimeout(function(){syncAllToSupabase(true);},2500);
};

/* ── 9. ENSURE DIVS & INIT ── */
(function(){
  ['hr-dash','laporan'].forEach(function(id){
    if(!document.getElementById('V-'+id)){
      var d=document.createElement('div');d.id='V-'+id;d.style.display='none';
      var b=document.querySelector('.body');if(b)b.appendChild(d);
    }
  });
  /* Title white */
  var t=document.getElementById('STITLE');
  if(t){t.style.color='#fff';t.style.fontWeight='700';}
  /* Apply BW theme to existing topbar */
  var tb=document.querySelector('.topbar');
  if(tb){tb.style.background='#111';tb.style.boxShadow='none';tb.style.borderBottom='1px solid #222';}
  /* Update badge if already logged in */
  if(window._ajwRole) _updateBadge();
  /* Build tabs */
  _activeTab='dash';
  _buildTabs();
})();

/* =========================================================
   AJW PATCH: FLAT TABS + LAPORAN + PROFIT DASHBOARD
   ========================================================= */

/* ── Flat buildTabBar (no dropdown) ── */
var _activeTab = 'dash';
buildTabBar = function(){
  var cfg=getCfg(); var tc=cfg.tabsConfig||{};
  var role=window._ajwRole||'admin';
  var defs=[
    {id:'dash',    lbl:'Dashboard'},
    {id:'laporan', lbl:'Laporan Bulanan'},
    {id:'profit',  lbl:'Pendapatan & Keuntungan'},
    {id:'supplier',lbl:'Hutang Supplier'},
    {id:'kpi',     lbl:'KPI Bisnis'},
    {id:'eval',    lbl:'Penilaian'},
    {id:'payroll', lbl:'Payroll'},
    {id:'emp',     lbl:'Karyawan'},
    {id:'hist',    lbl:'Riwayat'},
    {id:'stats',   lbl:'Statistik'},
    {id:'taligf',  lbl:'Tali GF'},
    {id:'admin',   lbl:'Admin'}
  ];
  if(role!=='admin') defs=defs.filter(function(d){return d.id!=='admin'&&d.id!=='eval'&&d.id!=='payroll'&&d.id!=='hist';});
  var h='';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl=tc['label_'+d.id]||d.lbl;
    var act=(_activeTab===d.id);
    h+='<button class="tab '+(act?'act':'on')+'" id="T-'+d.id+'" onclick="_navTo(\''+d.id+'\')">'+esc(lbl)+'</button>';
  });
  customTabs.forEach(function(ct){
    var act=(_activeTab==='ct_'+ct.id);
    h+='<button class="tab '+(act?'act':'on')+'" onclick="_navTo(\'ct_'+ct.id+'\')">'+esc((ct.icon||'')+' '+ct.name)+'</button>';
  });
  var el=document.getElementById('TABS');
  if(el) el.innerHTML=h;
};

/* ── Navigation ── */
function _navTo(tabId){
  _activeTab=tabId;
  buildTabBar();
  /* Ensure special divs */
  ['laporan','profit'].forEach(function(id){
    if(!document.getElementById('V-'+id)){
      var d=document.createElement('div');d.id='V-'+id;d.style.display='none';
      var b=document.querySelector('.body');if(b)b.appendChild(d);
    }
  });
  /* Show/hide */
  var all=CORE_TABS.concat(['laporan','profit']).concat(customTabs.map(function(ct){return 'ct_'+ct.id;}));
  all.forEach(function(id){
    var v=document.getElementById('V-'+id);
    if(v) v.style.display=(id===tabId)?'block':'none';
  });
  /* Render */
  if(tabId==='dash')renderDash();
  else if(tabId==='laporan')_renderLaporan();
  else if(tabId==='profit')_renderProfit();
  else if(tabId==='kpi'){loadKPI();renderKPI();}
  else if(tabId==='stats')renderStats();
  else if(tabId==='emp')renderEmp();
  else if(tabId==='hist')renderHist();
  else if(tabId==='admin')renderAdmin();
  else if(tabId==='supplier')renderSupplier();
  else if(tabId==='taligf'){if(typeof renderTaliGF==='function')renderTaliGF();}
  else if(tabId.indexOf('ct_')===0){if(typeof renderCustomTab==='function')renderCustomTab(tabId.replace('ct_',''));}
  window.scrollTo(0,0);
}
SW=function(tab){_navTo(tab);};

/* ── Supplier card in renderDash ── */
var _origRenderDash=renderDash;
renderDash=function(){
  _origRenderDash();
  /* Inject supplier summary after first card block */
  var el=document.getElementById('V-dash');
  if(!el||typeof supplierHutang==='undefined') return;
  var gN=supplierHutang.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0);
  var gB=supplierHutang.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0);
  var gS=gN-gB;
  var snames=[];supplierHutang.forEach(function(d){var n=d.namaSupplier||'';if(n&&snames.indexOf(n)<0)snames.push(n);});
  var card='<div class="card" style="margin-bottom:14px;padding:14px;border-left:3px solid #333">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
    +'<span style="font-size:12px;font-weight:700;color:#111">&#128031; Hutang Supplier</span>'
    +'<button onclick="_navTo(\'supplier\')" style="background:#111;color:#fff;border:none;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:10px;font-weight:700;font-family:Arial">Lihat Semua</button>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:9px">'
    +'<div style="background:#f5f5f5;border-radius:6px;padding:10px;text-align:center"><div style="font-size:10px;color:#666;font-weight:700;margin-bottom:3px">TOTAL NOTA</div><div style="font-size:15px;font-weight:800;color:#111">Rp '+fmt(gN)+'</div></div>'
    +'<div style="background:#f5f5f5;border-radius:6px;padding:10px;text-align:center"><div style="font-size:10px;color:#666;font-weight:700;margin-bottom:3px">TERBAYAR</div><div style="font-size:15px;font-weight:800;color:#333">Rp '+fmt(gB)+'</div></div>'
    +'<div style="background:'+(gS>0?'#fff5f5':'#f0fff4')+';border-radius:6px;padding:10px;text-align:center;border:1px solid '+(gS>0?'#fcc':'#9f9')+'">'
    +'<div style="font-size:10px;color:#666;font-weight:700;margin-bottom:3px">SALDO</div>'
    +'<div style="font-size:15px;font-weight:800;color:'+(gS>0?'#cc0000':'#007700')+'">Rp '+fmt(gS)+'</div></div>'
    +'</div>'
    +(snames.length?'<div style="font-size:11px;color:#666">'+snames.length+' supplier: '+snames.join(', ')+'</div>':'')
    +'</div>';
  /* Insert before first .card that has penilaian terbaru text */
  var cur=el.innerHTML;
  var idx=cur.indexOf('Penilaian Terbaru');
  if(idx<0) idx=cur.indexOf('class="card"', 500);
  var ins=cur.lastIndexOf('<div class="card"', idx>=0?idx:cur.length);
  if(ins>=0) el.innerHTML=cur.slice(0,ins)+card+cur.slice(ins);
  else el.innerHTML+=card;
};

/* ── LAPORAN BULANAN ── */
var _lb=[];
var _lbYear=new Date().getFullYear();
var _lbEditId=null;
(function(){try{_lb=JSON.parse(localStorage.getItem('ajw_laporan')||'[]');}catch(e){_lb=[];}
if(!_lb.length){var M=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];[2025,2026,2027].forEach(function(yr){M.forEach(function(m,i){_lb.push({id:yr+'-'+(i+1),bulan:m,tahun:yr,bulanNum:i+1,penjualan:0,targetPenjualan:300000000,cash:0,berulang:0,pengeluaran:0,catatan:'',platform:{shopee:0,tiktok:0,lazada:0,lainnya:0}});});});localStorage.setItem('ajw_laporan',JSON.stringify(_lb));}})();
function _saveLB(){localStorage.setItem('ajw_laporan',JSON.stringify(_lb));}

function _renderLaporan(){
  var el=document.getElementById('V-laporan');if(!el)return;
  var years=[];_lb.forEach(function(l){if(years.indexOf(l.tahun)<0)years.push(l.tahun);});years.sort();
  if(!years.length)years=[new Date().getFullYear()];
  var yr=_lbYear;
  var rows=_lb.filter(function(l){return l.tahun===yr;}).sort(function(a,b){return a.bulanNum-b.bulanNum;});
  var totP=rows.reduce(function(t,l){return t+l.penjualan;},0);
  var totC=rows.reduce(function(t,l){return t+l.cash;},0);
  var totE=rows.reduce(function(t,l){return t+l.pengeluaran;},0);
  var h='<div style="background:#111;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:14px"><div style="font-size:17px;font-weight:800">Laporan Bulanan</div><div style="font-size:12px;color:#aaa;margin-top:2px">Rekap keuangan & penjualan per bulan</div></div>';
  h+='<div style="display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap">';
  years.forEach(function(y){h+='<button onclick="_lbYear='+y+';_renderLaporan()" style="padding:5px 14px;border-radius:20px;border:1.5px solid '+(yr===y?'#111':'#ddd')+';background:'+(yr===y?'#111':'#fff')+';color:'+(yr===y?'#fff':'#555')+';font-size:11px;font-weight:700;cursor:pointer;font-family:Arial">'+y+'</button>';});
  h+='</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  [['Total Penjualan','Rp '+fmt(totP)],['Cash Masuk','Rp '+fmt(totC)],['Pengeluaran','Rp '+fmt(totE)],['Saldo','Rp '+fmt(totC-totE)]].forEach(function(x){
    h+='<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:16px"><div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">'+x[0]+'</div><div style="font-size:19px;font-weight:800;color:#111">'+x[1]+'</div></div>';
  });
  h+='</div>';
  h+='<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;overflow-x:auto">';
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;min-width:800px">';
  h+='<thead><tr style="background:#111">';
  ['Bulan','Target Penjualan','Penjualan','Progress','Cash Masuk','Pengeluaran','Saldo',''].forEach(function(th,ti){
    h+='<th style="padding:10px 12px;color:#fff;font-weight:700;border-right:1px solid #222;text-align:'+(ti===0||ti===7?'left':'right')+'">'+th+'</th>';
  });
  h+='</tr></thead><tbody>';
  var MNAMES=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  MNAMES.forEach(function(bulan,mi){
    var lb=rows.filter(function(l){return l.bulan===bulan;})[0]||{id:yr+'-'+(mi+1),bulan:bulan,tahun:yr,bulanNum:mi+1,penjualan:0,targetPenjualan:300000000,cash:0,pengeluaran:0,catatan:'',platform:{}};
    var pct=lb.targetPenjualan>0?Math.min(100,Math.round(lb.penjualan/lb.targetPenjualan*100)):0;
    var saldo=lb.cash-lb.pengeluaran;
    var isNow=(new Date().getMonth()+1)===lb.bulanNum&&new Date().getFullYear()===yr;
    var bg=isNow?'#fafafa':'#fff';
    h+='<tr style="border-bottom:1px solid #f0f0f0;background:'+bg+'" onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\''+bg+'\'">';
    h+='<td style="padding:9px 12px;font-weight:'+(isNow?700:500)+';border-right:1px solid #f0f0f0">'+esc(bulan)+(isNow?'<span style="font-size:9px;background:#111;color:#fff;padding:1px 6px;border-radius:3px;margin-left:6px">Bulan Ini</span>':'')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;color:#888;border-right:1px solid #f0f0f0">Rp '+fmt(lb.targetPenjualan||0)+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:600;color:#111;border-right:1px solid #f0f0f0">'+(lb.penjualan?'Rp '+fmt(lb.penjualan):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:center;border-right:1px solid #f0f0f0">';
    if(lb.penjualan>0)h+='<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:4px;background:#e0e0e0;border-radius:2px"><div style="height:100%;border-radius:2px;background:#111;width:'+pct+'%"></div></div><span style="font-size:10px;font-weight:700;min-width:30px">'+pct+'%</span></div>';
    else h+='-';
    h+='</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:600;color:#111;border-right:1px solid #f0f0f0">'+(lb.cash?'Rp '+fmt(lb.cash):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;color:'+(lb.pengeluaran?'#cc0000':'#888')+';border-right:1px solid #f0f0f0">'+(lb.pengeluaran?'Rp '+fmt(lb.pengeluaran):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:right;font-weight:700;color:'+(saldo>0?'#007700':saldo<0?'#cc0000':'#888')+';border-right:1px solid #f0f0f0">'+(lb.cash||lb.pengeluaran?'Rp '+fmt(saldo):'-')+'</td>';
    h+='<td style="padding:9px 12px;text-align:center"><button onclick="_lbEditId=\''+lb.id+'\';_renderLaporan()" style="background:#111;color:#fff;border:none;border-radius:5px;padding:5px 11px;cursor:pointer;font-size:11px;font-weight:700;font-family:Arial">Edit</button></td>';
    h+='</tr>';
  });
  var totTgt=rows.reduce(function(t,l){return t+(l.targetPenjualan||0);},0);
  h+='<tr style="background:#111"><td style="padding:9px 12px;color:#fff;font-weight:700;border-right:1px solid #222">Total '+yr+'</td><td style="padding:9px 12px;text-align:right;color:#888;border-right:1px solid #222">Rp '+fmt(totTgt)+'</td><td style="padding:9px 12px;text-align:right;color:#fff;font-weight:700;border-right:1px solid #222">Rp '+fmt(totP)+'</td><td style="border-right:1px solid #222"></td><td style="padding:9px 12px;text-align:right;color:#fff;font-weight:700;border-right:1px solid #222">Rp '+fmt(totC)+'</td><td style="padding:9px 12px;text-align:right;color:#fca5a5;font-weight:700;border-right:1px solid #222">Rp '+fmt(totE)+'</td><td style="padding:9px 12px;text-align:right;font-weight:700;color:'+(totC-totE>=0?'#6ee7b7':'#fca5a5')+'">Rp '+fmt(totC-totE)+'</td><td></td></tr>';
  h+='</tbody></table></div>';
  if(_lbEditId){
    var lb2=_lb.filter(function(l){return l.id===_lbEditId;})[0];
    if(lb2){
      var p2=lb2.platform||{};
      h+='<div id="LBM" onclick="if(event.target.id===\'LBM\'){_lbEditId=null;_renderLaporan()}" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;justify-content:center;align-items:center;padding:20px">';
      h+='<div onclick="event.stopPropagation()" style="background:#fff;border-radius:8px;padding:22px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">';
      h+='<div style="font-size:15px;font-weight:800;color:#111;margin-bottom:16px">Edit: '+esc(lb2.bulan)+' '+lb2.tahun+'</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
      [['LBF-P','Penjualan (Rp)',lb2.penjualan||0],['LBF-T','Target Penjualan (Rp)',lb2.targetPenjualan||300000000],['LBF-C','Cash Masuk (Rp)',lb2.cash||0],['LBF-E','Pengeluaran (Rp)',lb2.pengeluaran||0]].forEach(function(f){
        h+='<div><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:4px">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" value="'+f[2]+'"></div>';
      });
      h+='</div>';
      h+='<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:700;color:#555;margin-bottom:8px">Per Platform</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">';
      [['LBF-SP','Shopee',p2.shopee||0],['LBF-TK','TikTok',p2.tiktok||0],['LBF-LZ','Lazada',p2.lazada||0],['LBF-LN','Lainnya',p2.lainnya||0]].forEach(function(f){
        h+='<div><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:4px">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" value="'+f[2]+'"></div>';
      });
      h+='</div></div>';
      h+='<div style="margin-bottom:14px"><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:4px">Catatan</label><textarea id="LBF-CAT" class="fi" rows="2">'+esc(lb2.catatan||'')+'</textarea></div>';
      h+='<div style="display:flex;gap:8px;justify-content:flex-end"><button onclick="_lbEditId=null;_renderLaporan()" style="background:#fff;color:#333;border:1.5px solid #ccc;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Batal</button><button onclick="_lbSave(\''+lb2.id+'\')" style="background:#111;color:#fff;border:none;border-radius:6px;padding:9px 20px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan</button></div>';
      h+='</div></div>';
    }
  }
  el.innerHTML=h;
}
function _lbSave(id){
  var i=_lb.findIndex(function(l){return l.id===id;});if(i<0)return;
  var g=function(eid){var el=document.getElementById(eid);return el?parseFloat(el.value)||0:0;};
  var gt=function(eid){var el=document.getElementById(eid);return el?el.value:'';};
  _lb[i].penjualan=g('LBF-P');_lb[i].targetPenjualan=g('LBF-T');_lb[i].cash=g('LBF-C');_lb[i].pengeluaran=g('LBF-E');_lb[i].catatan=gt('LBF-CAT');
  _lb[i].platform={shopee:g('LBF-SP'),tiktok:g('LBF-TK'),lazada:g('LBF-LZ'),lainnya:g('LBF-LN')};
  _saveLB();_lbEditId=null;toast('Laporan disimpan!','success');_renderLaporan();
}

// PROFIT DASHBOARD
/* ═══════════ PROFIT DASHBOARD ═══════════ */
var _profitData=[];
(function(){try{_profitData=JSON.parse(localStorage.getItem('ajw_profit')||'[]');}catch(e){_profitData=[];}})();
function _saveProfit(){
  localStorage.setItem('ajw_profit',JSON.stringify(_profitData));
  var cfg=getCfg();
  if(cfg.supabaseUrl&&cfg.supabaseKey&&typeof SB!=='undefined'&&SB.upsertMany){
    SB.init&&SB.init();
    SB.upsertMany('ajw_config',[{key:'profit_data',value:{data:_profitData}}]).catch(function(){});
  }
}

function _renderProfit(){
  var el=document.getElementById('V-profit');if(!el)return;
  var totIn=_profitData.reduce(function(t,r){return t+(r.pemasukan||0);},0);
  var totMod=_profitData.reduce(function(t,r){return t+(r.modal||0);},0);
  var totUnt=totIn-totMod;
  var pctUnt=totMod>0?(totUnt/totMod*100).toFixed(1):'0';
  var h='';
  /* Header */
  h+='<div style="background:#111;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h+='<div><div style="font-size:17px;font-weight:800">Pendapatan &amp; Keuntungan</div><div style="font-size:12px;color:#aaa;margin-top:2px">Rekap keuangan bisnis AJW</div></div>';
  h+='<button onclick="_openProfitForm()" style="background:#fff;color:#111;border:none;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-size:12px;font-family:Arial">+ Input Data</button>';
  h+='</div>';
  /* 4 Summary Cards */
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">';
  [{lbl:'Total Pemasukan',val:'Rp '+fmt(totIn),sub:_profitData.length+' periode',c:'#111'},
   {lbl:'Total Modal',val:'Rp '+fmt(totMod),sub:'HPP + Iklan + Fee',c:'#444'},
   {lbl:'Keuntungan Bersih',val:'Rp '+fmt(totUnt),sub:totUnt>=0?'Profit':'Rugi',c:totUnt>=0?'#007700':'#cc0000'},
   {lbl:'% Keuntungan',val:pctUnt+'%',sub:'ROI / periode',c:parseFloat(pctUnt)>=20?'#007700':parseFloat(pctUnt)>=0?'#333':'#cc0000'}
  ].forEach(function(x){
    h+='<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:16px;border-top:3px solid '+x.c+'">';
    h+='<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px">'+x.lbl+'</div>';
    h+='<div style="font-size:22px;font-weight:800;color:'+x.c+'">'+x.val+'</div>';
    h+='<div style="font-size:11px;color:#aaa;margin-top:3px">'+x.sub+'</div>';
    h+='</div>';
  });
  h+='</div>';
  /* Chart */
  h+='<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:18px;margin-bottom:18px">';
  h+='<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:14px">Tren Pemasukan &amp; Keuntungan</div>';
  h+='<canvas id="PROFIT-CHART" style="max-height:280px"></canvas>';
  h+='</div>';
  /* Table */
  h+='<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin-bottom:18px">';
  h+='<div style="padding:13px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:#111">Riwayat Data</div>';
  if(_profitData.length){
    h+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
    h+='<thead><tr style="background:#111">';
    ['Periode','Pemasukan','Modal','Iklan','Keuntungan','ROI%','ROAS','ACOS%',''].forEach(function(th){
      h+='<th style="padding:9px 12px;color:#fff;border-right:1px solid #222;text-align:right;white-space:nowrap">'+th+'</th>';
    });
    h+='</tr></thead><tbody>';
    _profitData.slice().reverse().forEach(function(r,ri){
      var idx=_profitData.length-1-ri;
      var unt=(r.pemasukan||0)-(r.modal||0);
      var roi=r.modal>0?(unt/r.modal*100).toFixed(1):'-';
      var roas=r.iklan>0?((r.pemasukan||0)/r.iklan).toFixed(2):'-';
      var acos=r.pemasukan>0?((r.iklan||0)/(r.pemasukan||1)*100).toFixed(1):'-';
      h+='<tr style="border-bottom:1px solid #f5f5f5">';
      h+='<td style="padding:8px 12px;font-weight:600;color:#111;border-right:1px solid #f0f0f0;white-space:nowrap">'+esc(r.periode||'-')+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:#111;font-weight:600;border-right:1px solid #f0f0f0">Rp '+fmt(r.pemasukan||0)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:#444;border-right:1px solid #f0f0f0">Rp '+fmt(r.modal||0)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:#555;border-right:1px solid #f0f0f0">Rp '+fmt(r.iklan||0)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:'+(unt>=0?'#007700':'#cc0000')+';border-right:1px solid #f0f0f0">Rp '+fmt(unt)+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:'+(parseFloat(roi)>=20?'#007700':parseFloat(roi)<0?'#cc0000':'#555')+';border-right:1px solid #f0f0f0">'+roi+'%</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:#444;border-right:1px solid #f0f0f0">'+roas+'</td>';
      h+='<td style="padding:8px 12px;text-align:right;color:#555;border-right:1px solid #f0f0f0">'+acos+'%</td>';
      h+='<td style="padding:8px 12px;text-align:center"><button onclick="confirmDelete(\'Hapus data ini?\',function(){_profitData.splice('+idx+',1);_saveProfit();_renderProfit();})" style="background:#cc0000;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:10px;font-family:Arial;font-weight:700">X</button></td>';
      h+='</tr>';
    });
    h+='</tbody></table></div>';
  } else {
    h+='<div style="padding:30px;text-align:center;color:#aaa">Belum ada data. Klik + Input Data.</div>';
  }
  h+='</div>';
  /* Form modal */
  h+='<div id="PROFIT-FORM" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.style.display=\'none\'">';
  h+='<div onclick="event.stopPropagation()" style="background:#fff;border-radius:10px;padding:24px;max-width:560px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.2)">';
  h+='<div style="font-size:15px;font-weight:800;color:#111;margin-bottom:18px">Input Data Keuangan</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">';
  [['PF-PER','Periode','text','Contoh: Jan 2026'],['PF-IN','Total Pemasukan (Rp)','number','0'],['PF-MOD','Modal / HPP (Rp)','number','0'],['PF-IKL','Biaya Iklan (Rp)','number','0'],['PF-FEE','Admin Fee (Rp)','number','0'],['PF-OTH','Pengeluaran Lain (Rp)','number','0']].forEach(function(f){
    h+='<div><label style="font-size:11px;font-weight:700;color:#555;display:block;margin-bottom:4px;text-transform:uppercase">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="'+f[2]+'" placeholder="'+f[3]+'" oninput="_updateProfitCalc()"></div>';
  });
  h+='</div>';
  h+='<div style="background:#f5f5f5;border-radius:8px;padding:14px;margin-bottom:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">';
  h+='<div><div style="font-size:10px;color:#888;font-weight:700;margin-bottom:4px;text-transform:uppercase">Keuntungan</div><div id="PF-R-UNT" style="font-size:18px;font-weight:800;color:#111">Rp 0</div></div>';
  h+='<div><div style="font-size:10px;color:#888;font-weight:700;margin-bottom:4px;text-transform:uppercase">ROI</div><div id="PF-R-ROI" style="font-size:18px;font-weight:800;color:#111">0%</div></div>';
  h+='<div><div style="font-size:10px;color:#888;font-weight:700;margin-bottom:4px;text-transform:uppercase">ROAS</div><div id="PF-R-ROAS" style="font-size:18px;font-weight:800;color:#111">0x</div></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end">';
  h+='<button onclick="document.getElementById(\'PROFIT-FORM\').style.display=\'none\'" style="background:#fff;color:#333;border:1.5px solid #ccc;border-radius:6px;padding:9px 18px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Batal</button>';
  h+='<button onclick="_saveProfitEntry()" style="background:#111;color:#fff;border:none;border-radius:6px;padding:9px 20px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan</button>';
  h+='</div>';
  h+='</div></div>';
  el.innerHTML=h;
  /* Chart */
  setTimeout(function(){
    var canvas=document.getElementById('PROFIT-CHART');
    if(!canvas||!window.Chart)return;
    if(canvas._ch){try{canvas._ch.destroy();}catch(e){}}
    var sorted=_profitData.slice().sort(function(a,b){return (a.periode||'').localeCompare(b.periode||'');});
    var labels=sorted.map(function(r){return r.periode||'-';});
    var dataIn=sorted.map(function(r){return r.pemasukan||0;});
    var dataUnt=sorted.map(function(r){return (r.pemasukan||0)-(r.modal||0);});
    canvas._ch=new Chart(canvas.getContext('2d'),{
      type:'line',
      data:{labels:labels,datasets:[
        {label:'Pemasukan',data:dataIn,borderColor:'#111',backgroundColor:'rgba(0,0,0,.05)',tension:.35,pointRadius:4,fill:true},
        {label:'Keuntungan',data:dataUnt,borderColor:'#555',backgroundColor:'rgba(80,80,80,.07)',tension:.35,pointRadius:4,borderDash:[5,3],fill:false}
      ]},
      options:{responsive:true,plugins:{legend:{position:'top'}},scales:{y:{ticks:{callback:function(v){return 'Rp '+fmt(v);}}}}}
    });
  },120);
}
function _openProfitForm(){
  var w=document.getElementById('PROFIT-FORM');if(w)w.style.display='flex';
  setTimeout(_updateProfitCalc,50);
}
function _updateProfitCalc(){
  var g=function(id){return parseFloat((document.getElementById(id)||{value:'0'}).value)||0;};
  var ins=g('PF-IN'),mod=g('PF-MOD'),ikl=g('PF-IKL'),fee=g('PF-FEE'),oth=g('PF-OTH');
  var totalMod=mod+ikl+fee+oth;
  var unt=ins-totalMod;
  var roi=totalMod>0?(unt/totalMod*100).toFixed(1):'0';
  var roas=ikl>0?(ins/ikl).toFixed(2):'0';
  var s=function(id,v){var el=document.getElementById(id);if(el){el.textContent=v;el.style.color=id==='PF-R-UNT'?(unt>=0?'#007700':'#cc0000'):'#111';}};
  s('PF-R-UNT','Rp '+fmt(unt));s('PF-R-ROI',roi+'%');s('PF-R-ROAS',roas+'x');
}
function _saveProfitEntry(){
  var g=function(id){return parseFloat((document.getElementById(id)||{value:'0'}).value)||0;};
  var gt=function(id){return ((document.getElementById(id)||{value:''}).value||'').trim();};
  var per=gt('PF-PER');
  if(!per){toast('Isi periode dulu','error');return;}
  var mod=g('PF-MOD'),ikl=g('PF-IKL'),fee=g('PF-FEE'),oth=g('PF-OTH');
  var rec={periode:per,pemasukan:g('PF-IN'),modal:mod+ikl+fee+oth,iklan:ikl,adminFee:fee,lainnya:oth,ts:new Date().toISOString()};
  var ei=_profitData.findIndex(function(r){return r.periode===per;});
  if(ei>=0)_profitData[ei]=rec;else _profitData.push(rec);
  _saveProfit();
  var w=document.getElementById('PROFIT-FORM');if(w)w.style.display='none';
  toast('Data disimpan!','success',3000);
  _renderProfit();
}

/* ── Custom Tab Manager in Admin ── */
function _addCustomTab2(){
  var nm=((document.getElementById('CT2-NM')||{}).value||'').trim();
  if(!nm){toast('Nama tab wajib','error');return;}
  var ic=((document.getElementById('CT2-IC')||{}).value||'').trim();
  var htm=((document.getElementById('CT2-HTML')||{}).value||'');
  var ct={id:Date.now(),name:nm,icon:ic,html:htm};
  customTabs.push(ct);
  addCustomTabDiv(ct);
  sv('ajw_tabs',customTabs);
  buildTabBar();
  toast('Tab "'+nm+'" ditambahkan!','success',3000);
  renderAdmin();
}

/* ====== FINAL OVERRIDE: HR + FINANCE + LOG ====== */
var _finIncome = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_income')||'[]');}catch(e){return [];} })();
var _finExpense = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_expense')||'[]');}catch(e){return [];} })();
function _saveFin(){ localStorage.setItem('ajw_fin_income', JSON.stringify(_finIncome)); localStorage.setItem('ajw_fin_expense', JSON.stringify(_finExpense)); }
function _ym(d){ return (d||'').slice(0,7); }
function _todayYMD(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

/* Ensure new view containers */
(function(){
  ['hr','finance','log'].forEach(function(id){
    if(!document.getElementById('V-'+id)){
      var d=document.createElement('div'); d.id='V-'+id; d.style.display='none';
      var b=document.querySelector('.body'); if(b) b.appendChild(d);
    }
  });
})();

function _restoreEmbeddedViews(){
  var bodyWrap=document.querySelector('.body');
  if(!bodyWrap) return;
  ['eval','payroll','emp','stats','hist','supplier','laporan'].forEach(function(id){
    var el=document.getElementById('V-'+id);
    if(el){
      el.style.display='none';
      if(el.parentNode!==bodyWrap) bodyWrap.appendChild(el);
    }
  });
}
function _resetPanelState(){
  _restoreEmbeddedViews();
  var hc=document.getElementById('HR-CONTENT');
  var fc=document.getElementById('FIN-CONTENT');
  if(hc) hc.innerHTML='';
  if(fc) fc.innerHTML='';
}
function _mountViewIn(elId, hostId, renderFn){
  _restoreEmbeddedViews();
  var host=document.getElementById(hostId);
  var el=document.getElementById('V-'+elId);
  if(!host||!el) return;
  host.innerHTML='';
  host.appendChild(el);
  el.style.display='block';
  if(typeof renderFn==='function'){
    try{ renderFn(); }catch(e){ console.error(e); toast('Gagal memuat menu, coba klik ulang','error'); }
  }
}
function _renderHREvalOnly(){
  _mountViewIn('eval','HR-CONTENT',renderEvalForm);
}
function _renderHRPayrollOnly(){
  _mountViewIn('payroll','HR-CONTENT',renderPayrollForm);
}
function _renderHREmpOnly(){
  _mountViewIn('emp','HR-CONTENT',renderEmp);
  if(!document.getElementById('HR-EMP-ONLY-STYLE')){
    var st=document.createElement('style');
    st.id='HR-EMP-ONLY-STYLE';
    st.textContent=
      '#HR-CONTENT table.tbl thead th:nth-child(10),'+
      '#HR-CONTENT table.tbl thead th:nth-child(11),'+
      '#HR-CONTENT table.tbl tbody td:nth-child(10),'+
      '#HR-CONTENT table.tbl tbody td:nth-child(11){display:none !important;}'+
      '#HR-CONTENT button[onclick*="pickEmp("],'+
      '#HR-CONTENT button[onclick*="SW(\\\'stats\\\')"],'+
      '#HR-CONTENT button[onclick*="viewEmpDetail("]{display:none !important;}';
    document.head.appendChild(st);
  }
}
function _renderHRHistOnly(){
  _mountViewIn('hist','HR-CONTENT',renderHist);
  var host=document.getElementById('HR-CONTENT');
  if(!host) return;
  if(!document.getElementById('HR-HIST-ONLY-STYLE')){
    var st=document.createElement('style');
    st.id='HR-HIST-ONLY-STYLE';
    st.textContent='#HR-CONTENT button[onclick="exportData()"],#HR-CONTENT button[onclick="importData()"]{display:none !important;}';
    document.head.appendChild(st);
  }
}
function _renderHRDashOnly(){
  var content=document.getElementById('HR-CONTENT');
  if(!content) return;
  var avgEval = evalHistory.length ? (evalHistory.reduce(function(t,r){return t+(parseFloat(r.fs)||0);},0)/evalHistory.length) : 0;
  var totPay = payHistory.reduce(function(t,r){ return t+(parseFloat(r.bersih)||0); },0);
  var hd='';
  hd+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">';
  hd+='<div class="dash-card"><div style="font-size:30px;font-weight:800;color:#1565C0">'+employees.length+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Total Karyawan</div></div>';
  hd+='<div class="dash-card"><div style="font-size:30px;font-weight:800;color:#00838F">'+avgEval.toFixed(2)+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Rata-rata Penilaian</div></div>';
  hd+='<div class="dash-card"><div style="font-size:30px;font-weight:800;color:#6A1B9A">Rp '+fmt(totPay)+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Total Payroll</div></div>';
  hd+='</div>';
  hd+='<div class="card" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">';
  hd+='<button class="btnp" onclick="_renderHR(\'eval\')" style="background:#1565C0">Penilaian</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'payroll\')" style="background:#00838F">Payroll</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'karyawan\')" style="background:#6A1B9A">Karyawan</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'statistik\')" style="background:#2E7D32">Statistik</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'riw\')" style="background:#546E7A">Riwayat</button>';
  hd+='</div>';
  content.innerHTML=hd;
}

/* Main tabs: keep all old tabs, add HR/Finance/LOG, rename labels */
buildTabBar = function(){
  var cfg=getCfg(); var tc=cfg.tabsConfig||{}; var role=window._ajwRole||'admin';
  var defs=[
    {id:'dash',lbl:'Dashboard',icon:'⌂',group:'PRIMARY'},
    {id:'finance',lbl:'Operations',icon:'◫',group:'PRIMARY'},
    {id:'hr',lbl:'Units',icon:'⌘',group:'PRIMARY'},
    {id:'kpi',lbl:'Analytics',icon:'◇',group:'PRIMARY'},
    {id:'supplier',lbl:'Assets',icon:'▣',group:'PRIMARY'},
    {id:'log',lbl:'Comms',icon:'✉',group:'SECONDARY'},
    {id:'taligf',lbl:'Signals',icon:'⌁',group:'SECONDARY'},
    {id:'admin',lbl:'Control',icon:'⚙',group:'SECONDARY'}
  ];
  if(role!=='admin') defs=defs.filter(function(d){ return d.id!=='admin' && d.id!=='eval' && d.id!=='payroll' && d.id!=='hist'; });
  var h='';
  h+='<div class="tac-brand" title="AJW Tactical">AJW</div>';
  defs.forEach(function(d){
    if(tc['hide_'+d.id]) return;
    var lbl=(tc['label_'+d.id]||d.lbl);
    var act=(_activeTab===d.id);
    h+='<button class="tab '+(act?'act':'on')+'" id="T-'+d.id+'" title="'+esc(lbl)+'" onclick="_navTo(\''+d.id+'\')">'+d.icon+'</button>';
  });
  customTabs.forEach(function(ct){
    var act=(_activeTab==='ct_'+ct.id);
    h+='<button class="tab '+(act?'act':'on')+'" title="'+esc(ct.name)+'" onclick="_navTo(\'ct_'+ct.id+'\')">'+esc(ct.icon||'•')+'</button>';
  });
  h+='<div class="tac-nav-spacer"></div>';
  if(typeof window._doLogout==='function'){
    h+='<button class="tab on" title="Logout" onclick="_doLogout()">↩</button>';
  }
  var el=document.getElementById('TABS'); if(el) el.innerHTML=h;
};

/* HR page with subtabs */
function _renderHR(sub){
  sub=sub||window._hrSub||'dash'; window._hrSub=sub;
  var v=document.getElementById('V-hr'); if(!v) return;
  /* Always restore mounted views first to avoid accidental node loss when switching HR subtabs */
  _restoreEmbeddedViews();
  if(!document.getElementById('HR-SHELL')){
    v.innerHTML='<div id="HR-SHELL"></div><div id="HR-CONTENT"></div>';
  }
  var shell=document.getElementById('HR-SHELL');
  var content=document.getElementById('HR-CONTENT');
  if(!shell||!content) return;
  var h='';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Dashboard HR'],['eval','Penilaian'],['payroll','Payroll'],['karyawan','Karyawan'],['statistik','Statistik'],['riw','Riwayat']].forEach(function(s){
    h+='<button class="'+(sub===s[0]?'btnp':'btns')+'" onclick="_renderHR(\''+s[0]+'\')" style="padding:8px 12px">'+s[1]+'</button>';
  });
  h+='</div></div>';
  shell.innerHTML=h;
  if(sub==='dash'){
    _renderHRDashOnly();
  } else if(sub==='eval'){
    _renderHREvalOnly(); return;
  } else if(sub==='payroll'){
    _renderHRPayrollOnly(); return;
  } else if(sub==='karyawan'){
    _renderHREmpOnly(); return;
  } else if(sub==='statistik'){
    _mountViewIn('stats','HR-CONTENT',renderStats); return;
  } else if(sub==='riw'){
    _renderHRHistOnly(); return;
  }
}

/* Finance page with subtabs and monthly automatic report */
function _renderFinance(sub){
  sub=sub||window._finSub||'dash'; window._finSub=sub;
  var v=document.getElementById('V-finance'); if(!v) return;
  /* Always restore mounted views first to avoid accidental node loss when switching Finance subtabs */
  _restoreEmbeddedViews();
  if(!document.getElementById('FIN-SHELL')){
    v.innerHTML='<div id="FIN-SHELL"></div><div id="FIN-CONTENT"></div>';
  }
  var shell=document.getElementById('FIN-SHELL');
  var content=document.getElementById('FIN-CONTENT');
  if(!shell||!content) return;
  var totalIn=_finIncome.reduce(function(t,r){return t+(parseFloat(r.nominal)||0);},0);
  var totalEx=_finExpense.reduce(function(t,r){return t+(parseFloat(r.nominal)||0);},0);
  var gN=(typeof supplierHutang!=='undefined'?supplierHutang.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0):0);
  var gB=(typeof supplierHutang!=='undefined'?supplierHutang.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0):0);
  var saldoH=gN-gB;
  var h='';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Dashboard Finance'],['income','Input Data Pendapatan Marketplace'],['expense','Pengeluaran Operasional'],['hutang','Hutang Supplier'],['lapbul','Laporan Bulanan Otomatis']].forEach(function(s){
    h+='<button class="'+(sub===s[0]?'btnp':'btns')+'" onclick="_renderFinance(\''+s[0]+'\')" style="padding:8px 12px">'+s[1]+'</button>';
  });
  h+='</div></div>';
  shell.innerHTML=h;
  if(sub==='dash'){
    var fd='';
    fd+='<div class="dash-grid">';
    fd+='<div class="dash-card"><div style="font-size:26px;font-weight:800;color:#1565C0">Rp '+fmt(totalIn)+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Pendapatan Marketplace</div></div>';
    fd+='<div class="dash-card"><div style="font-size:26px;font-weight:800;color:#C62828">Rp '+fmt(totalEx)+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Pengeluaran Operasional</div></div>';
    fd+='<div class="dash-card"><div style="font-size:26px;font-weight:800;color:'+(saldoH>0?'#C62828':'#2E7D32')+'">Rp '+fmt(saldoH)+'</div><div style="font-size:12px;color:var(--tx2);font-weight:700">Saldo Hutang Supplier</div></div>';
    fd+='</div>';
    content.innerHTML=fd;
  } else if(sub==='hutang'){
    _mountViewIn('supplier','FIN-CONTENT',renderSupplier); return;
  } else if(sub==='income'){
    var fi='';
    fi+='<div class="card"><div style="font-size:13px;font-weight:700;margin-bottom:10px">Input Pendapatan Marketplace</div>';
    fi+='<div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px">';
    fi+='<input id="FIN-IN-DATE" class="fi" type="date" value="'+_todayYMD()+'"><input id="FIN-IN-SRC" class="fi" placeholder="Marketplace"><input id="FIN-IN-NOM" class="fi" type="number" placeholder="Nominal"><input id="FIN-IN-NOTE" class="fi" placeholder="Catatan"></div>';
    fi+='<button class="btnp" onclick="_finAddIncome()" style="margin-top:8px;background:#1565C0">Simpan</button></div>';
    fi+='<div class="card" style="margin-top:10px"><table style="width:100%;border-collapse:collapse"><tr><th>Tanggal</th><th>Marketplace</th><th>Nominal</th><th>Catatan</th></tr>';
    _finIncome.slice().reverse().forEach(function(r){ fi+='<tr><td>'+esc(r.tanggal||'')+'</td><td>'+esc(r.sumber||'')+'</td><td>Rp '+fmt(r.nominal||0)+'</td><td>'+esc(r.catatan||'-')+'</td></tr>'; });
    fi+='</table></div>';
    content.innerHTML=fi;
  } else if(sub==='expense'){
    var fe='';
    fe+='<div class="card"><div style="font-size:13px;font-weight:700;margin-bottom:10px">Input Pengeluaran Operasional</div>';
    fe+='<div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px">';
    fe+='<input id="FIN-EX-DATE" class="fi" type="date" value="'+_todayYMD()+'"><input id="FIN-EX-CAT" class="fi" placeholder="Kategori"><input id="FIN-EX-NOM" class="fi" type="number" placeholder="Nominal"><input id="FIN-EX-NOTE" class="fi" placeholder="Catatan"></div>';
    fe+='<button class="btnp" onclick="_finAddExpense()" style="margin-top:8px;background:#C62828">Simpan</button></div>';
    fe+='<div class="card" style="margin-top:10px"><table style="width:100%;border-collapse:collapse"><tr><th>Tanggal</th><th>Kategori</th><th>Nominal</th><th>Catatan</th></tr>';
    _finExpense.slice().reverse().forEach(function(r){ fe+='<tr><td>'+esc(r.tanggal||'')+'</td><td>'+esc(r.kategori||'')+'</td><td>Rp '+fmt(r.nominal||0)+'</td><td>'+esc(r.catatan||'-')+'</td></tr>'; });
    fe+='</table></div>';
    content.innerHTML=fe;
  } else if(sub==='lapbul'){
    var m={};
    _finIncome.forEach(function(r){ var k=_ym(r.tanggal)||'unknown'; m[k]=m[k]||{in:0,ex:0}; m[k].in+=(parseFloat(r.nominal)||0); });
    _finExpense.forEach(function(r){ var k=_ym(r.tanggal)||'unknown'; m[k]=m[k]||{in:0,ex:0}; m[k].ex+=(parseFloat(r.nominal)||0); });
    if(typeof supplierHutang!=='undefined'){
      supplierHutang.forEach(function(s){
        var yr=parseInt(s.tahun)||new Date().getFullYear();
        var mn=parseInt(s.bulanNum)||1;
        var key=yr+'-'+String(mn).padStart(2,'0');
        var nota=(s.nota||[]).reduce(function(t,n){ return t+(parseFloat(n.nilaiNetto)||0); },0);
        var bayar=(s.bayar||[]).reduce(function(t,b){ return t+(parseFloat(b.jumlah)||0); },0);
        m[key]=m[key]||{in:0,ex:0,sup:0};
        m[key].sup=(m[key].sup||0)+(nota-bayar);
      });
    }
    var fl='';
    fl+='<div class="card"><div style="font-size:13px;font-weight:700;margin-bottom:10px">Laporan Bulanan (Otomatis, tanpa input manual)</div>';
    fl+='<table style="width:100%;border-collapse:collapse"><tr><th>Bulan</th><th>Pendapatan</th><th>Pengeluaran</th><th>Hutang Supplier</th><th>Laba/Rugi Bersih</th></tr>';
    Object.keys(m).sort().reverse().forEach(function(k){
      var sup=(m[k].sup||0);
      var p=(m[k].in||0)-(m[k].ex||0)-sup;
      fl+='<tr><td>'+esc(k)+'</td><td>Rp '+fmt(m[k].in||0)+'</td><td>Rp '+fmt(m[k].ex||0)+'</td><td style="color:'+(sup>0?'#C62828':'#2E7D32')+'">Rp '+fmt(sup)+'</td><td style="color:'+(p>=0?'#2E7D32':'#C62828')+'">Rp '+fmt(p)+'</td></tr>';
    });
    if(!Object.keys(m).length) fl+='<tr><td colspan="5" style="color:#777">Belum ada data</td></tr>';
    fl+='</table></div>';
    content.innerHTML=fl;
  }
}
function _finAddIncome(){
  var d=document.getElementById('FIN-IN-DATE'), s=document.getElementById('FIN-IN-SRC'), n=document.getElementById('FIN-IN-NOM'), c=document.getElementById('FIN-IN-NOTE');
  if(!d||!s||!n) return;
  var rec={tanggal:d.value||_todayYMD(), sumber:(s.value||'').trim(), nominal:parseFloat(n.value)||0, catatan:(c&&c.value||'').trim(), ts:new Date().toISOString()};
  if(!rec.sumber){toast('Marketplace wajib diisi','error');return;}
  _finIncome.push(rec); _saveFin(); toast('Pendapatan disimpan','success'); _renderFinance('income');
}
function _finAddExpense(){
  var d=document.getElementById('FIN-EX-DATE'), s=document.getElementById('FIN-EX-CAT'), n=document.getElementById('FIN-EX-NOM'), c=document.getElementById('FIN-EX-NOTE');
  if(!d||!s||!n) return;
  var rec={tanggal:d.value||_todayYMD(), kategori:(s.value||'').trim(), nominal:parseFloat(n.value)||0, catatan:(c&&c.value||'').trim(), ts:new Date().toISOString()};
  if(!rec.kategori){toast('Kategori wajib diisi','error');return;}
  _finExpense.push(rec); _saveFin(); toast('Pengeluaran disimpan','success'); _renderFinance('expense');
}

/* LOG page: general merged history */
function _renderLog(){
  var v=document.getElementById('V-log'); if(!v) return;
  var logs=[];
  evalHistory.forEach(function(r){ logs.push({ts:r.ts||r.createdAt||'', tipe:'Penilaian', ket:(r.info&&r.info.nama)||'-'}); });
  payHistory.forEach(function(r){ logs.push({ts:r.ts||r.createdAt||'', tipe:'Payroll', ket:(r.info&&r.info.nama)||'-'}); });
  _finIncome.forEach(function(r){ logs.push({ts:r.ts||'', tipe:'Finance Income', ket:(r.sumber||'-')+' Rp '+fmt(r.nominal||0)}); });
  _finExpense.forEach(function(r){ logs.push({ts:r.ts||'', tipe:'Finance Expense', ket:(r.kategori||'-')+' Rp '+fmt(r.nominal||0)}); });
  logs.sort(function(a,b){ return String(b.ts||'').localeCompare(String(a.ts||'')); });
  var h='<div class="card"><div style="font-size:14px;font-weight:800;margin-bottom:10px">LOG Umum Website</div>';
  h+='<table style="width:100%;border-collapse:collapse"><tr><th>Waktu</th><th>Tipe</th><th>Keterangan</th></tr>';
  logs.forEach(function(l){ h+='<tr><td>'+(l.ts?new Date(l.ts).toLocaleString('id-ID'):'-')+'</td><td>'+esc(l.tipe)+'</td><td>'+esc(l.ket)+'</td></tr>'; });
  if(!logs.length) h+='<tr><td colspan="3" style="color:#777">Belum ada data log</td></tr>';
  h+='</table></div>';
  v.innerHTML=h;
}

/* Override navigation for new tabs */
function _cmSpark(values, stroke, fill){
  var max=Math.max.apply(null, values.concat([1]));
  var min=Math.min.apply(null, values.concat([0]));
  var range=Math.max(1,max-min);
  var pts=values.map(function(v,i){
    var x=(i/(values.length-1))*100;
    var y=78-((v-min)/range)*58;
    return x.toFixed(2)+','+y.toFixed(2);
  }).join(' ');
  var area='0,88 '+pts+' 100,88';
  return '<svg viewBox="0 0 100 88" preserveAspectRatio="none" style="width:100%;height:100%"><defs><linearGradient id="g'+stroke.replace('#','')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+fill+'" stop-opacity=".45"/><stop offset="100%" stop-color="'+fill+'" stop-opacity="0"/></linearGradient></defs><polygon points="'+area+'" fill="url(#g'+stroke.replace('#','')+')" /><polyline points="'+pts+'" fill="none" stroke="'+stroke+'" stroke-width="1.6" /></svg>';
}
function _cmDashData(){
  var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL'];
  var spent=[380,350,520,640,950,880,1260];
  var savings=[720,1280,610,420,810,600,920];
  var invest=[180,520,480,950,1320,1580,2470];
  if(payHistory.length){
    spent=months.map(function(_,i){
      var p=payHistory[i%payHistory.length];
      return Math.max(180, Math.round((parseFloat(p&&p.bersih)||0)/10000)%1400);
    });
  }
  if(evalHistory.length){
    savings=months.map(function(_,i){
      var e=evalHistory[i%evalHistory.length];
      return Math.max(220, Math.round((parseFloat(e&&e.fs)||0)*240 + (i*90)));
    });
  }
  var tx=[];
  payHistory.slice(0,4).forEach(function(p){
    tx.push({icon:'▣',name:(p.info&&p.info.nama)||'Payroll',meta:periodeLabel(p.info||{}),amt:'+$'+((parseFloat(p.bersih)||0)/1000).toFixed(2),cat:'Transfer',pos:true});
  });
  evalHistory.slice(0,6).forEach(function(e){
    tx.push({icon:'◉',name:(e.info&&e.info.nama)||'Penilaian',meta:periodeLabel(e.info||{}),amt:'-$'+((parseFloat(e.fs)||0)*9.99).toFixed(2),cat:'Subscription',pos:false});
  });
  if(!tx.length){
    tx=[
      {icon:'◉',name:'Simon Pegg',meta:'Jul 20, 6:22 PM',amt:'+$44.00',cat:'Transfer',pos:true},
      {icon:'♫',name:'Apple Music',meta:'Jul 20, 12:30 PM',amt:'-$9.99',cat:'Subscription',pos:false},
      {icon:'▤',name:'7-Eleven',meta:'Jul 19, 2:56 PM',amt:'-$5.18',cat:'Grocery store',pos:false},
      {icon:'◉',name:'Joe Davis',meta:'Jul 19, 1:23 PM',amt:'+$13.00',cat:'Transfer',pos:true},
      {icon:'F',name:'Framer',meta:'Jul 19, 10:00 AM',amt:'-$14.99',cat:'Subscription',pos:false},
      {icon:'N',name:'Notion',meta:'Jul 18, 9:00 PM',amt:'-$17.99',cat:'Subscription',pos:false}
    ];
  }
  tx=tx.slice(0,9);
  var bars=months.map(function(m,idx){
    var a=Math.max(40, Math.round((spent[idx]||0)*0.22));
    var b=Math.max(22, Math.round((spent[idx]||0)*0.18));
    var c=Math.max(30, Math.round((spent[idx]||0)*0.24));
    var d=Math.max(18, Math.round((spent[idx]||0)*0.14));
    return {month:m,stacks:[a,b,c,d]};
  });
  return {months:months,spent:spent,savings:savings,invest:invest,tx:tx,bars:bars};
}
function _softRadar(){
  return '<svg viewBox="0 0 240 220" preserveAspectRatio="none"><polygon points="120,24 180,58 168,132 120,182 72,132 60,58" fill="none" stroke="#e8edf5" stroke-width="1"/><polygon points="120,48 162,72 154,124 120,156 86,124 78,72" fill="none" stroke="#eef2f8" stroke-width="1"/><polygon points="120,72 145,86 140,116 120,134 100,116 95,86" fill="none" stroke="#f2f5fa" stroke-width="1"/><polyline points="120,70 154,90 144,120 120,136 92,116 102,86 120,70" fill="rgba(79,116,255,.08)" stroke="#4f74ff" stroke-width="2"/><polyline points="120,84 166,100 136,132 120,148 82,124 88,88 120,84" fill="rgba(67,213,145,.08)" stroke="#43d591" stroke-width="2"/><polyline points="120,62 138,82 128,110 120,126 106,114 96,92 120,62" fill="rgba(255,204,77,.08)" stroke="#f4c74a" stroke-width="2"/></svg>';
}
renderDash=function(){
  var cfg=getCfg();
  var totalEval=evalHistory.length,totalPay=payHistory.length,totalEmp=employees.length;
  var avgScore=totalEval?evalHistory.reduce(function(a,b){return a+(parseFloat(b.fs)||0);},0)/totalEval:0;
  var totalGaji=payHistory.reduce(function(a,b){return a+(parseFloat(b.bersih)||0);},0);
  var openOps=Math.max(3,Math.min(37,totalEmp||0)||37);
  var completeOps=Math.max(12,totalEval||0);
  var holdOps=Math.max(2,Math.min(12,Math.round((totalPay||12)/2)));
  var agentsA=Math.max(24,totalEmp*3||84);
  var agentsB=Math.max(12,totalEval*2||42);
  var efficiency=(avgScore>0?Math.min(98,Math.max(61,avgScore*16)):80.2).toFixed(1);
  var successRate=(avgScore>0?Math.min(96,Math.max(72,avgScore*18/10)):91.3).toFixed(1);
  var payIdx=payHistory[0]||{};
  var evalIdx=evalHistory[0]||{};
  var empIdx=employees[0]||{};
  function tacStatus(level){
    if(level==='critical') return '<span class="status-tag critical">CRITICAL</span>';
    if(level==='warning') return '<span class="status-tag warning">WARNING</span>';
    return '<span class="status-tag active">ACTIVE</span>';
  }
  function tacBars(n,total){
    var out='<div class="tac-progress">';
    for(var i=0;i<total;i++) out+='<i class="'+(i<n?'on':'')+'"></i>';
    return out+'</div>';
  }
  var h='';
  h+='<div class="tac-shell">';
  h+='<div class="tac-topbar"><div class="tac-topbar-title"><span>CIA CONTROL INTERFACE</span><span class="tac-classified">[CLASSIFIED ACCESS]</span></div><div class="tac-rightmeta"><span>Last Sync: '+new Date().toLocaleString('sv-SE').replace(' ',' ')+' GMT+7</span></div></div>';
  h+='<div class="tac-statusbar"><div class="tac-meta"><span>Admin: <span class="tac-key">'+esc(cfg.adminName||window._ajwUser||'R.HENDERSON')+'</span></span><span>Access: <span class="tac-key">'+esc(cfg.accessCode||'ALPHA-1')+'</span></span></div><div class="tac-meta"><span>System Status: '+tacStatus('active')+'</span><span>Encryption: '+tacStatus('active')+'</span></div></div>';
  h+='<div class="tac-grid-top">';
  h+='<div class="tac-panel"><div class="tac-panel-head"><div class="tac-section">GLOBAL MISSION METRICS</div></div><div class="tac-metrics">';
  h+='<div class="tac-metric"><div class="tac-number">'+fmt(openOps)+'</div><div class="tac-label">Active</div></div>';
  h+='<div class="tac-metric"><div class="tac-number">'+fmt(completeOps)+'</div><div class="tac-label">Completed</div></div>';
  h+='<div class="tac-metric"><div class="tac-number">'+fmt(holdOps)+'</div><div class="tac-label">On Hold</div></div>';
  h+='</div></div>';
  h+='<div class="tac-panel"><div class="tac-panel-head"><div class="tac-section">OPERATION ACTIVITY</div></div><div class="tac-activity">';
  h+='<div><div class="tac-label">Agents Deployed</div>'+tacBars(10,12)+'<span class="tac-value">'+fmt(agentsA)+'/'+fmt(agentsA+agentsB)+'</span></div>';
  h+='<div><div class="tac-label">Agent Efficiency Index</div>'+tacBars(8,10)+'<span class="tac-value">'+efficiency+'</span></div>';
  h+='<div><div class="tac-label">Avg Success Rate</div>'+tacBars(11,12)+'<span class="tac-value">'+successRate+'%</span></div>';
  h+='</div></div></div>';
  h+='<div class="tac-grid-main">';
  h+='<div class="tac-panel"><div class="tac-panel-head"><div class="tac-section">MISSION TABLE</div><div style="display:flex;gap:10px"><button type="button">Choose Status</button><button type="button">Choose Priority</button></div></div>';
  h+='<div class="tac-table-head"><div>Mission Name</div><div>Agents</div><div>Status</div><div>Priority</div><div>Deadline</div></div>';
  h+='<div class="tac-row featured"><div class="tac-mission-title"><strong>Operation Phantom Tide</strong><span>Objective: Extract data from Node-47</span></div><div>A-'+fmt((empIdx.id||117)).replace(/,/g,'')+' | A-'+fmt((evalIdx.id||42)).replace(/,/g,'')+'</div><div><span class="tac-dot warning"></span>In-Progress</div><div>'+tacStatus('critical')+'</div><div>'+new Date(Date.now()+86400000*14).toISOString().slice(0,10)+'</div></div>';
  h+='<div class="tac-subgrid"><div>Region: Eastern Sector</div><div>Agents: A-'+fmt((empIdx.id||117)).replace(/,/g,'')+' (Lead), A-'+fmt((evalIdx.id||42)).replace(/,/g,'')+' (Support)</div><div>Risk: HIGH</div></div>';
  h+='<div class="tac-log"><div>&gt; ['+new Date().toLocaleTimeString('en-GB')+'] Encrypted comms channel established.</div><div>&gt; ['+new Date().toLocaleTimeString('en-GB')+'] Data extraction protocol initiated.</div><div>&gt; ['+new Date().toLocaleTimeString('en-GB')+'] <span style="color:var(--tac-red)">Firewall breach detected</span> - counter-measures deploying.</div><div>&gt; ['+new Date().toLocaleTimeString('en-GB')+'] Data packet: <span style="color:var(--tac-green)">68% retrieved</span> - integrity holding.</div><div>&gt; ['+new Date().toLocaleTimeString('en-GB')+'] Local authorities on alert - escalation risk: <span style="color:var(--tac-red)">HIGH</span></div></div>';
  [
    {name:'Operation Silent Echo',agents:'A-027',status:'warning',statusText:'In-Progress',priority:'HIGH',deadline:'2026-05-11'},
    {name:'Desert Mirage',agents:'A-081',status:'active',statusText:'Assigned',priority:'MEDIUM',deadline:'2026-05-28'},
    {name:'Icebreaker',agents:'A-20 | A-543',status:'hold',statusText:'On-Hold',priority:'LOW',deadline:'2026-09-27'},
    {name:'Ghost Protocol',agents:'A-019 | A-086',status:'active',statusText:'Completed',priority:'HIGH',deadline:'2026-09-22'},
    {name:'MIT 200777',agents:'A-777',status:'active',statusText:'Completed',priority:'HIGH',deadline:'2026-09-22'}
  ].forEach(function(r){
    var cls=r.status==='warning'?'warning':(r.status==='hold'?'hold':'active');
    var tag=r.priority==='HIGH'?'critical':(r.priority==='MEDIUM'?'warning':'active');
    h+='<div class="tac-row"><div>'+r.name+'</div><div>'+r.agents+'</div><div><span class="tac-dot '+cls+'"></span>'+r.statusText+'</div><div>'+tacStatus(tag)+'</div><div>'+r.deadline+'</div></div>';
  });
  h+='<div style="text-align:center;padding-top:16px"><button type="button">View All</button></div></div>';
  h+='<div style="display:grid;gap:16px">';
  h+='<div class="tac-panel"><div class="tac-panel-head"><div class="tac-section">OPERATION REQUIRES APPROVAL</div><div style="color:#fff">View All ›</div></div><div class="tac-approval-grid"><div>Mission Name<b>'+(esc(empIdx.nama||'Silent Dagger'))+'</b></div><div>Mission ID<b>SD-092</b></div><div>Priority<b>HIGH</b></div><div>Submitted By<b>'+(esc(payIdx.nama||'AGENT A-204'))+'</b></div><div>Region<b>SOUTH-EAST ASIA</b></div><div>Agent Support<b>-</b></div><div>Est Duration<b>48HRS</b></div><div>Status<b>PENDING APPROVAL</b></div></div><div class="tac-risk"><div class="tac-label" style="margin-bottom:8px">Risk Level</div><div class="tac-risk-track"><div class="tac-risk-fill"></div></div><div style="margin-top:6px;color:#d6dad7">MEDIUM</div></div><div class="tac-terminal">AI Assessment:<br>&gt; Estimated Success Probability: 82%<br>&gt; Possible Complications: Local surveillance interference<br>&gt; Recommended Action: APPROVE with limited extraction window</div><div class="tac-actions"><button type="button">Cancel</button><button type="button" class="approve">Approve</button></div></div>';
  h+='<div class="tac-panel tac-assistant"><div><div class="tac-panel-head"><div class="tac-section">AI ASSISTANT PANEL</div></div><div class="tac-terminal">&gt; Incoming data streams decrypted.<br>&gt; Global surveillance grid online.<br>&gt; Ready when you are.<br><br>| - Operation Phantom Tide <span style="color:var(--tac-red)">(CRITICAL)</span><br>| - Operation Silent Echo <span style="color:var(--tac-orange)">(HIGH)</span></div></div><div class="tac-assistant-input">Ask anything...</div></div>';
  h+='</div></div>';
  h+='<div class="tac-grid-bottom">';
  h+='<div class="tac-panel tac-live"><div class="tac-panel-head"><div class="tac-live-chip"><span style="color:var(--tac-red)">●</span><span>LIVE: //HeadCam/POSITION X-'+fmt((empIdx.id||2027)).replace(/,/g,'')+'.1 / Y-'+fmt((evalIdx.id||2945)).replace(/,/g,'')+'.4</span></div><button type="button">Switch Cam</button></div><div class="tac-live-head" style="font-size:12px;color:var(--tac-muted)">Agent(s): <b style="display:inline;color:#fff">'+esc((empIdx.nama||'A-117'))+' | '+esc((payIdx.nama||'A-042'))+'</b></div><div class="tac-live-frame"></div></div>';
  h+='<div class="tac-panel tac-map"><div class="tac-panel-head"><div class="tac-section">LIVE SATELLITE FEED: SECTOR 7G / ENCRYPTION</div><div>STATUS: <span style="color:var(--tac-green)">ACTIVE</span></div></div><div class="tac-map-area"><div class="tac-blip" style="left:16%;top:20%">A-117 | A-042</div><div class="tac-blip" style="left:54%;top:12%">A-027</div><div class="tac-blip alt" style="left:68%;top:54%">A-081</div></div><div style="padding-top:10px;text-align:center;color:#d2d6d4;font-size:12px">SURVEILLANCE GRID ONLINE - MONITORING <span style="color:var(--tac-red)">3</span> ACTIVE TARGETS</div></div>';
  h+='</div></div>';
  document.getElementById('V-dash').innerHTML=h;
};
function _navTo(tabId){
  _activeTab=tabId; buildTabBar();
  _resetPanelState();
  ['hr','finance','log'].forEach(function(id){
    if(!document.getElementById('V-'+id)){ var d=document.createElement('div'); d.id='V-'+id; d.style.display='none'; var b=document.querySelector('.body'); if(b)b.appendChild(d); }
  });
  var all=['dash','hr','finance','eval','payroll','stats','emp','hist','admin','supplier','taligf','kpi','laporan','log'].concat(customTabs.map(function(ct){return 'ct_'+ct.id;}));
  all.forEach(function(id){ var v=document.getElementById('V-'+id); if(v) v.style.display=(id===tabId)?'block':'none'; });
  try{
    if(tabId==='dash')renderDash();
    else if(tabId==='hr')_renderHR('dash');
    else if(tabId==='finance')_renderFinance('dash');
    else if(tabId==='eval')renderEvalForm();
    else if(tabId==='payroll')renderPayrollForm();
    else if(tabId==='stats')renderStats();
    else if(tabId==='emp')renderEmp();
    else if(tabId==='hist')renderHist();
    else if(tabId==='log')_renderLog();
    else if(tabId==='admin')renderAdmin();
    else if(tabId==='supplier')renderSupplier();
    else if(tabId==='kpi'){loadKPI();renderKPI();}
    else if(tabId==='taligf'){if(typeof renderTaliGF==='function')renderTaliGF();}
    else if(tabId==='laporan')_renderLaporan();
    else if(tabId.indexOf('ct_')===0){ if(typeof renderCustomTab==='function')renderCustomTab(tabId.replace('ct_','')); }
  }catch(e){
    console.error(e);
    toast('Terjadi error saat membuka tab. Kembali ke Dashboard...','error',3500);
    all.forEach(function(id){ var v=document.getElementById('V-'+id); if(v) v.style.display=(id==='dash')?'block':'none'; });
    _activeTab='dash'; buildTabBar();
    try{ renderDash(); }catch(_){}
  }
  window.scrollTo(0,0);
}
SW=function(tab){ _navTo(tab); };

/* Responsive hardening for embedded tabs */
(function(){
  if(document.getElementById('HR-FIN-RESP-STYLE')) return;
  var st=document.createElement('style');
  st.id='HR-FIN-RESP-STYLE';
  st.textContent=
    '#HR-SHELL .card div,#FIN-SHELL .card div{max-width:100%;}'+
    '#HR-CONTENT table,#FIN-CONTENT table{width:100%;table-layout:auto;}'+
    '#HR-CONTENT .split,#FIN-CONTENT .split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,36%);gap:10px;align-items:start;}'+
    '#HR-CONTENT .g2,#FIN-CONTENT .g2{grid-template-columns:1fr 1fr;}'+
    '@media (max-width:900px){#HR-CONTENT .split,#FIN-CONTENT .split{grid-template-columns:1fr !important;}#HR-CONTENT .g2,#FIN-CONTENT .g2{grid-template-columns:1fr !important;}#HR-CONTENT .dash-grid,#FIN-CONTENT .dash-grid{grid-template-columns:1fr !important;}#HR-SHELL .card button,#FIN-SHELL .card button{font-size:11px;padding:7px 10px !important;}}';
  document.head.appendChild(st);
})();

/* ── Init ── */
(function(){
  var t=document.getElementById('STITLE');if(t){t.style.color='#fff';t.style.fontWeight='700';}
  buildTabBar();
  _navTo('dash');
})();

