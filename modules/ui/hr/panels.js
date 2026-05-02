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

function _renderHRSopOnly(){
  var content=document.getElementById('HR-CONTENT');
  if(!content) return;
  var now=new Date();
  var todayKey=now.toISOString().slice(0,10);
  var weekAgo=new Date(now.getTime()-6*24*60*60*1000);
  var deptOpts=_hrSopDepartmentOptions();
  var sorted=(_hrSops||[]).slice().sort(function(a,b){ return String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')); });
  var updatedToday=sorted.filter(function(r){ return String(r.updatedAt||r.createdAt||'').slice(0,10)===todayKey; });
  var updatedWeek=sorted.filter(function(r){ var d=new Date(r.updatedAt||r.createdAt||0); return !isNaN(d.getTime()) && d>=weekAgo; });
  var recentMode=_hrSopFilter.recent||'today';
  var deptMode=_hrSopFilter.department||'';
  var filtered=sorted.filter(function(r){
    var d=new Date(r.updatedAt||r.createdAt||0);
    var okRecent=recentMode==='all' ? true : (recentMode==='week' ? (!isNaN(d.getTime()) && d>=weekAgo) : String(r.updatedAt||r.createdAt||'').slice(0,10)===todayKey);
    var okDept=!deptMode || (r.department||'')===deptMode;
    return okRecent && okDept;
  });
  var h='';
  h+='<div class="card" style="background:linear-gradient(135deg,rgba(240,197,106,.1),rgba(255,255,255,0));margin-bottom:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:var(--tx)">SOP & Guides</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Detail view diprioritaskan untuk membaca, mencari, membuka, dan mengelola dokumen SOP. Penambahan dokumen dilakukan lewat popup agar halaman tetap rapi.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="border:1px solid rgba(240,197,106,.35);background:rgba(240,197,106,.08);color:#F0C56A">'+sorted.length+' dokumen</span><span class="chip" style="border:1px solid rgba(143,208,255,.3);background:rgba(143,208,255,.08);color:#8FD0FF">'+deptOpts.length+' departemen</span><button class="btnp" onclick="_hrSopToggleUpload(true)" style="background:#C27C2C">+ Tambah SOP / Guide</button></div></div>';
  h+='</div>';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:repeat(3,minmax(140px,1fr)) minmax(220px,1.2fr);gap:10px;align-items:end">';
  h+='<div><label class="lbl">Rentang Update</label><select id="HR-SOP-FLT-RECENT" class="fi"><option value="today"'+(recentMode==='today'?' selected':'')+'>Updated Today</option><option value="week"'+(recentMode==='week'?' selected':'')+'>Updated This Week</option><option value="all"'+(recentMode==='all'?' selected':'')+'>Semua</option></select></div>';
  h+='<div><label class="lbl">Department</label><select id="HR-SOP-FLT-DEPT" class="fi"><option value="">Semua Department</option>'+deptOpts.map(function(d){ return '<option value="'+escAttr(d)+'"'+(deptMode===d?' selected':'')+'>'+esc(d)+'</option>'; }).join('')+'</select></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">';
  [['Hari Ini',updatedToday.length,'#8FD0FF'],['Minggu Ini',updatedWeek.length,'#A7F3B6'],['Total',sorted.length,'#F0C56A']].forEach(function(x){ h+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:10px"><div style="font-size:10px;font-weight:700;color:'+x[2]+';text-transform:uppercase">'+x[0]+'</div><div style="font-size:20px;font-weight:800;color:var(--tx);margin-top:5px">'+x[1]+'</div></div>'; });
  h+='</div>';
  h+='<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_hrSopFilter={recent:\'today\',department:\'\'};_renderHR(\'sop\')">Reset</button><button class="btnp" onclick="_hrSopApplyFilters()" style="background:#374151">Terapkan Filter</button></div>';
  h+='</div></div>';
  h+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:var(--tx)">Detail View</div><div style="font-size:11px;color:var(--tx2)">Klik <b>Buka</b> untuk preview langsung di AJW.</div></div><div style="overflow:auto"><table class="tbl" style="min-width:920px"><thead><tr><th>Nama</th><th>Stage</th><th>Doc Type</th><th>Department</th><th>File</th><th>Updated</th><th class="c">Aksi</th></tr></thead><tbody>';
  filtered.forEach(function(r){
    h+='<tr><td style="font-weight:700">'+esc(r.title||'-')+(r.note?'<div style="font-size:10px;color:var(--tx2);font-weight:400;margin-top:4px">'+esc(r.note)+'</div>':'')+'</td><td><span class="chip" style="background:rgba(143,208,255,.08);border:1px solid rgba(143,208,255,.28);color:#8FD0FF">'+esc(r.stage||'Draft')+'</span></td><td><span class="chip" style="background:rgba(215,150,255,.08);border:1px solid rgba(215,150,255,.28);color:#D796FF">'+esc(r.docType||'Guides & SOPs')+'</span></td><td><span class="chip" style="background:rgba(240,197,106,.08);border:1px solid rgba(240,197,106,.28);color:#F0C56A">'+esc(r.department||'Umum')+'</span></td><td>'+esc(r.fileName||'-')+'<div style="font-size:10px;color:var(--tx2);margin-top:4px">'+_hrSopFileSizeLabel(r.fileSize)+'</div></td><td style="white-space:nowrap;color:var(--tx2)">'+fmtD(r.updatedAt||r.createdAt)+'</td><td class="c"><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><button class="btnsm" onclick="_hrSopOpen(\''+escAttr(r.id)+'\')" style="background:#1565C0">Buka</button><button class="btnsm" onclick="_hrSopDownload(\''+escAttr(r.id)+'\')" style="background:#374151">Unduh</button><button class="btnsm" onclick="_hrSopDelete(\''+escAttr(r.id)+'\')" style="background:#C62828">Hapus</button></div></td></tr>';
  });
  if(!filtered.length) h+='<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">Belum ada SOP / guide pada filter ini.</td></tr>';
  h+='</tbody></table></div></div>';
  if(_hrSopUI.uploadOpen){
    h+='<div id="HR-SOP-UPLOAD-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9998;display:flex;justify-content:center;align-items:center;padding:20px" onclick="if(event.target.id===\'HR-SOP-UPLOAD-MODAL\')_hrSopToggleUpload(false)"><div style="background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:18px;max-width:860px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.35)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:14px"><div><div style="font-size:18px;font-weight:800;color:var(--tx)">Tambah SOP / Guide</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Upload dokumen ke AJW. Setelah disimpan, data ikut antre sinkron ke Supabase.</div></div><button class="btns" onclick="_hrSopToggleUpload(false)">Tutup</button></div><div class="g2" style="align-items:end"><div><label class="lbl">Nama SOP / Guide</label><input id="HR-SOP-TITLE" class="fi" placeholder="Contoh: SOP Packing & Pengiriman"></div><div><label class="lbl">Stage</label><select id="HR-SOP-STAGE" class="fi"><option>Draft</option><option>Active</option><option>Review</option><option>Archived</option></select></div><div><label class="lbl">Department</label><select id="HR-SOP-DEPT" class="fi"><option value="">Pilih departemen</option>'+deptOpts.map(function(d){ return '<option value="'+escAttr(d)+'">'+esc(d)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Department Manual</label><input id="HR-SOP-DEPT-MANUAL" class="fi" placeholder="Isi jika departemen baru"></div><div><label class="lbl">Upload File</label><input id="HR-SOP-FILE" class="fi" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"></div><div><label class="lbl">Catatan</label><input id="HR-SOP-NOTE" class="fi" placeholder="Keterangan singkat / revisi"></div></div><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px"><div style="font-size:11px;color:var(--tx2)">Preview terbaik: PDF, DOCX, TXT, CSV, PNG, JPG. Format DOC lama masih bisa diunduh.</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_hrSopToggleUpload(false)">Batal</button><button class="btnp" onclick="_hrSopUpload()" style="background:#C27C2C">Upload & Simpan SOP</button></div></div></div></div>';
  }
  if(_hrSopUI.previewId){
    var row=sorted.filter(function(r){ return r.id===_hrSopUI.previewId; })[0];
    h+='<div id="HR-SOP-PREVIEW-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;justify-content:center;align-items:center;padding:18px" onclick="if(event.target.id===\'HR-SOP-PREVIEW-MODAL\')_hrSopClosePreview()"><div style="background:var(--bg2);border:1px solid var(--bd);border-radius:14px;width:min(1180px,100%);max-height:92vh;overflow:auto;box-shadow:0 24px 70px rgba(0,0,0,.4)"><div style="padding:16px 18px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:var(--tx)">'+esc(_hrSopUI.previewTitle||'Preview SOP')+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+esc((row&&row.fileName)||'-')+' • '+esc((row&&row.department)||'Umum')+'</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_hrSopDownload(\''+escAttr(_hrSopUI.previewId)+'\')">Unduh</button><button class="btns" onclick="_hrSopClosePreview()">Tutup</button></div></div><div style="padding:18px">';
    if(_hrSopUI.previewMode==='pdf') h+='<iframe src="'+escAttr(row&&row.dataUrl||'')+'" style="width:100%;height:76vh;border:1px solid var(--bd);border-radius:10px;background:#fff"></iframe>';
    else if(_hrSopUI.previewMode==='image') h+='<div style="text-align:center"><img src="'+escAttr(row&&row.dataUrl||'')+'" style="max-width:100%;height:auto;border:1px solid var(--bd);border-radius:10px;background:#000"></div>';
    else if(_hrSopUI.previewMode==='text') h+='<pre style="white-space:pre-wrap;word-break:break-word;background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:16px;font-size:12px;line-height:1.7;color:var(--tx);max-height:72vh;overflow:auto">'+(_hrSopUI.previewHtml||'')+'</pre>';
    else if(_hrSopUI.previewMode==='html') h+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:18px;color:var(--tx);line-height:1.75;max-height:72vh;overflow:auto">'+(_hrSopUI.previewHtml||'<p>Tidak ada isi dokumen.</p>')+'</div>';
    else if(_hrSopUI.previewMode==='loading') h+='<div style="padding:40px 20px;text-align:center;color:var(--tx2)">Menyiapkan preview dokumen...</div>';
    else h+='<div style="background:rgba(255,157,157,.08);border:1px solid rgba(255,157,157,.28);border-radius:10px;padding:16px;color:#FFB4B4;line-height:1.8">Preview langsung belum tersedia untuk format ini.<br>'+( _hrSopUI.previewError ? esc(_hrSopUI.previewError) : 'Silakan gunakan tombol unduh untuk membuka file di aplikasi asalnya.')+'</div>';
    if(_hrSopUI.previewError && _hrSopUI.previewMode==='html') h+='<div style="margin-top:10px;font-size:11px;color:#FFD68A">'+esc(_hrSopUI.previewError)+'</div>';
    h+='</div></div></div>';
  }
  content.innerHTML=h;
}
function _ym(d){ return (d||'').slice(0,7); }
function _todayYMD(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
var _finIncomeFilter={marketplace:'',toko:'',dateFrom:'',dateTo:'',keyword:'',showTable:true};
var _finExpenseFilter={year:String(new Date().getFullYear()),category:'',dateFrom:'',dateTo:''};
var _finMarketplaceOptions=['Shopee','Lazada','Tiktok'];
var _finStoreOptions=['Zenqish Shoes','Istana Laz','Anton Tiktok','Alpha Laz','Jaya Wj Shopee','Jaya Wijaya Laz','Mega Laz','Anton Laz','Anton Shopee'];
var _finImportPeriod={from:'',to:''};
var _finAssetTypes=['Bank','Gudang','Tanah','Produk','Lainnya'];
setTimeout(function(){
  try{
    if(typeof _activeTab!=='undefined' && _activeTab==='dash' && typeof renderDash==='function') renderDash();
  }catch(e){
    console.error('dash bootstrap refresh error', e);
  }
}, 0);
function _finEnsureExpenseCategories(){
  ['Platform','Bahan Packing','Operasional','Gaji','Langganan'].forEach(function(cat){
    if(_finExpenseCategories.indexOf(cat)<0) _finExpenseCategories.push(cat);
  });
}
function _finExpenseLabel(r){ return (r&&r.namaPengeluaran)||((r&&r.catatan)||'').trim()||((r&&r.kategori)||'Pengeluaran'); }
function _finDateFromPayroll(r){
  if(r&&r.info){
    if(r.info.tglAkhir) return r.info.tglAkhir;
    if(r.info.tglMulai) return r.info.tglMulai;
  }
  if(r&&r.submittedAt) return String(r.submittedAt).slice(0,10);
  if(r&&r.ts) return String(r.ts).slice(0,10);
  return _todayYMD();
}
function _syncPayrollExpenses(){
  _finEnsureExpenseCategories();
  var changed=false, seen={}, validPayroll={}, beforeLen=_finExpense.length;
  payHistory.forEach(function(p){ validPayroll[String(p.id)]=p; });
  _finExpense=_finExpense.filter(function(r){
    if(r&&r.sourceType==='payroll'){
      return !!validPayroll[String(r.payrollId)];
    }
    return true;
  });
  if(_finExpense.length!==beforeLen) changed=true;
  _finExpense.forEach(function(r){
    if(r&&r.sourceType==='payroll'&&r.payrollId!=null) seen[String(r.payrollId)]=1;
  });
  payHistory.forEach(function(p){
    var key=String(p.id);
    var per=(typeof periodeLabel==='function'&&p.info)?periodeLabel(p.info):'';
    var normalized={
      id:'payroll_'+key,
      tanggal:_finDateFromPayroll(p),
      namaPengeluaran:'Gaji Karyawan - '+((p.info&&p.info.nama)||'Karyawan'),
      kategori:'Gaji',
      nominal:_num(p.bersih),
      catatan:'Otomatis dari payroll'+(per?' ('+per+')':''),
      sourceType:'payroll',
      payrollId:p.id,
      ts:p.submittedAt||p.ts||new Date().toISOString()
    };
    if(seen[key]){
      var idx=_finExpense.findIndex(function(r){ return r&&r.sourceType==='payroll'&&String(r.payrollId)===key; });
      if(idx>=0){
        var old=_finExpense[idx]||{};
        if(old.nominal!==normalized.nominal || old.tanggal!==normalized.tanggal || old.namaPengeluaran!==normalized.namaPengeluaran || old.catatan!==normalized.catatan){
          _finExpense[idx]=Object.assign({},old,normalized);
          changed=true;
        }
      }
      return;
    }
    _finExpense.push(normalized);
    changed=true;
  });
  if(changed) _saveFin();
}
function _finApplyExpenseFilters(){
  var yr=document.getElementById('FIN-EX-FLT-YEAR'), cat=document.getElementById('FIN-EX-FLT-CAT'), fr=document.getElementById('FIN-EX-FLT-FROM'), to=document.getElementById('FIN-EX-FLT-TO');
  _finExpenseFilter.year=((yr&&yr.value)||'').trim();
  _finExpenseFilter.category=((cat&&cat.value)||'').trim();
  _finExpenseFilter.dateFrom=((fr&&fr.value)||'').trim();
  _finExpenseFilter.dateTo=((to&&to.value)||'').trim();
  _renderFinance('expense');
}
function _finResetExpenseFilters(){
  _finExpenseFilter={year:String(new Date().getFullYear()),category:'',dateFrom:'',dateTo:''};
  _renderFinance('expense');
}
function _finAddExpenseCategory(){
  var inp=document.getElementById('FIN-EX-NEWCAT');
  var name=((inp&&inp.value)||'').trim();
  if(!name){ toast('Nama kategori wajib diisi','error'); return; }
  if(_finExpenseCategories.indexOf(name)>=0){ toast('Kategori sudah ada','warn'); return; }
  _finExpenseCategories.push(name);
  _finExpenseCategories.sort(function(a,b){ return String(a).localeCompare(String(b),'id'); });
  _saveFin(); if(inp) inp.value=''; toast('Kategori ditambahkan','success'); _renderFinance('expense');
}
function _finDeleteExpenseCategory(name){
  name=decodeURIComponent(name||'');
  if(!name) return;
  var used=_finExpense.some(function(r){ return (r.kategori||'')===name; }) || _finSubscriptions.some(function(r){ return (r.kategori||'')===name; });
  if(used){ toast('Kategori masih dipakai data pengeluaran atau langganan','warn'); return; }
  confirmDelete('Hapus kategori <b>'+esc(name)+'</b>?',function(){
    _finExpenseCategories=_finExpenseCategories.filter(function(x){ return x!==name; });
    _saveFin(); toast('Kategori dihapus','success'); _renderFinance('expense');
  });
}
function _finDeleteExpense(idx){
  if(idx<0||idx>=_finExpense.length) return;
  var item=_finExpense[idx]||{};
  if(item.sourceType==='payroll'){ toast('Data gaji otomatis dari payroll. Hapus dari tab Payroll jika ingin menghapusnya.','warn',5000); return; }
  confirmDelete('Hapus pengeluaran <b>'+esc(_finExpenseLabel(item))+'</b>?',function(){
    _finExpense.splice(idx,1); _saveFin(); toast('Pengeluaran dihapus','success'); _renderFinance('expense');
  });
}
function _finAddSubscription(){
  var gt=function(id){ return (((document.getElementById(id)||{}).value)||'').trim(); };
  var rec={
    id:'sub_'+Date.now(),
    nama:gt('FIN-SUB-NAMA'),
    provider:gt('FIN-SUB-PROV'),
    nominal:_num(gt('FIN-SUB-NOM')),
    siklus:gt('FIN-SUB-CYCLE')||'Bulanan',
    tanggalTagih:gt('FIN-SUB-BILL')||'',
    lastPayment:gt('FIN-SUB-LAST')||'',
    nextPayment:gt('FIN-SUB-NEXT')||'',
    status:gt('FIN-SUB-STATUS')||'Active',
    kategori:gt('FIN-SUB-CAT')||'Langganan',
    ts:new Date().toISOString()
  };
  if(!rec.nama){ toast('Nama langganan wajib diisi','error'); return; }
  if(!rec.nominal){ toast('Nominal langganan wajib diisi','error'); return; }
  if(_finExpenseCategories.indexOf(rec.kategori)<0) _finExpenseCategories.push(rec.kategori);
  _finSubscriptions.unshift(rec); _saveFin(); toast('Biaya langganan disimpan','success'); _renderFinance('expense');
}
function _finDeleteSubscription(id){
  confirmDelete('Hapus data langganan ini?',function(){
    _finSubscriptions=_finSubscriptions.filter(function(r){ return r.id!==id; });
    _saveFin(); toast('Langganan dihapus','success'); _renderFinance('expense');
  });
}
function _finAddAsset(){
  var gt=function(id){ return (((document.getElementById(id)||{}).value)||'').trim(); };
  var rec={
    id:'asset_'+Date.now(),
    tanggal:gt('FIN-AS-DATE')||_todayYMD(),
    type:gt('FIN-AS-TYPE')||'Bank',
    nama:gt('FIN-AS-NAME'),
    kategori:gt('FIN-AS-CAT'),
    nominal:_num(gt('FIN-AS-NOM')),
    catatan:gt('FIN-AS-NOTE'),
    ts:new Date().toISOString()
  };
  if(!rec.nama){ toast('Nama aset wajib diisi','error'); return; }
  if(!rec.nominal){ toast('Nilai aset wajib diisi','error'); return; }
  _finAssets.unshift(rec);
  _saveFin();
  toast('Aset disimpan','success');
  _renderFinance('asset');
}
function _finDeleteAsset(id){
  confirmDelete('Hapus data aset ini?',function(){
    _finAssets=_finAssets.filter(function(r){ return r.id!==id; });
    _saveFin();
    toast('Aset dihapus','success');
    _renderFinance('asset');
  });
}
function _finApplyAssetFilters(){
  _finAssetFilter.type=((document.getElementById('FIN-AS-FLT-TYPE')||{}).value||'').trim();
  _finAssetFilter.dateFrom=((document.getElementById('FIN-AS-FLT-FROM')||{}).value||'').trim();
  _finAssetFilter.dateTo=((document.getElementById('FIN-AS-FLT-TO')||{}).value||'').trim();
  _finAssetFilter.keyword=((document.getElementById('FIN-AS-FLT-KEY')||{}).value||'').trim().toLowerCase();
  _renderFinance('asset');
}
function _finResetAssetFilters(){
  _finAssetFilter={type:'',dateFrom:'',dateTo:'',keyword:''};
  _renderFinance('asset');
}
function _finSaveExpenseTarget(){
  var inp=document.getElementById('FIN-EX-TARGET-SUB');
  if(!inp) return;
  _finExpenseTargets.monthlyExpense=_num(inp.value);
  _finExpenseTargets.subscriptionMonthly=_finExpenseTargets.monthlyExpense;
  _saveFin();
  toast('Target proyeksi pengeluaran disimpan','success');
  _renderFinance('expense');
}
function _finDateToYMD(dt){
  if(!dt || isNaN(dt.getTime())) return '';
  return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
}
function _finParseDate(v){
  if(!v) return null;
  var d=new Date(String(v).slice(0,10)+'T00:00:00');
  return isNaN(d.getTime())?null:d;
}
function _finSubscriptionDueDate(sub){
  if(sub&&sub.nextPayment) return String(sub.nextPayment).slice(0,10);
  var cycle=(sub&&sub.siklus)||'Bulanan';
  var billDay=parseInt(sub&&sub.tanggalTagih,10);
  if(cycle==='Tahunan' && sub&&sub.lastPayment){
    var last=_finParseDate(sub.lastPayment);
    if(last){
      var d=new Date(last);
      d.setFullYear(d.getFullYear()+1);
      return _finDateToYMD(d);
    }
  }
  if(billDay){
    var now=_finParseDate(_todayYMD())||new Date();
    var lastDay=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    var due=new Date(now.getFullYear(),now.getMonth(),Math.min(billDay,lastDay));
    return _finDateToYMD(due);
  }
  return '';
}
function _finSubscriptionReminders(){
  var today=_finParseDate(_todayYMD())||new Date();
  return _finSubscriptions.filter(function(sub){ return (sub.status||'Active')==='Active'; }).map(function(sub){
    var dueYmd=_finSubscriptionDueDate(sub);
    var due=_finParseDate(dueYmd);
    if(!due) return null;
    var diff=Math.round((due.getTime()-today.getTime())/86400000);
    var level=diff<0?'overdue':(diff===0?'today':(diff<=3?'soon':'upcoming'));
    return {
      id:sub.id,
      nama:sub.nama||'Langganan',
      provider:sub.provider||'-',
      dueDate:dueYmd,
      daysLeft:diff,
      nominal:_num(sub.nominal),
      cycle:sub.siklus||'Bulanan',
      level:level
    };
  }).filter(Boolean).sort(function(a,b){ return a.daysLeft-b.daysLeft; });
}
function _finNotifySubscriptionReminders(reminders){
  reminders=(reminders||[]).filter(function(r){ return r.level==='overdue'||r.level==='today'||r.level==='soon'; });
  if(!reminders.length) return;
  var key='ajw_fin_sub_notice_'+_todayYMD();
  var sig=reminders.slice(0,6).map(function(r){ return r.id+':'+r.level; }).join('|');
  if(localStorage.getItem(key)===sig) return;
  var top=reminders[0];
  var msg=top.level==='overdue'
    ? 'Pengingat langganan: '+top.nama+' terlambat '+Math.abs(top.daysLeft)+' hari.'
    : (top.level==='today'
      ? 'Pengingat langganan: '+top.nama+' jatuh tempo hari ini.'
      : 'Pengingat langganan: '+top.nama+' jatuh tempo '+top.daysLeft+' hari lagi.');
  if(reminders.length>1) msg+=' +' + (reminders.length-1) + ' langganan lain.';
  localStorage.setItem(key,sig);
  toast(msg,'warn',5500);
}
function _num(v){
  if(typeof v==='number') return isNaN(v)?0:v;
  var s=String(v==null?'':v).trim();
  if(!s) return 0;
  s=s.replace(/[^\d,.\-]/g,'');
  if(s.indexOf(',')>=0 && s.indexOf('.')>=0){
    if(s.lastIndexOf(',')>s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',', '.');
    else s=s.replace(/,/g,'');
  }else if(s.indexOf(',')>=0){
    s=s.replace(/\./g,'').replace(',', '.');
  }
  var n=parseFloat(s);
  return isNaN(n)?0:n;
}
function _finIncomeMetrics(r){
  r=r||{};
  var dana=_num(r.danaPenjualanProduk!=null?r.danaPenjualanProduk:r.nominal);
  var subsidi=_num(r.subsidiMarketplace);
  var flowCost=function(v){
    var n=_num(v);
    if(!n) return 0;
    return n>0 ? -n : n;
  };
  var admin=_num(r.biayaAdministrasi);
  var transaksi=_num(r.biayaTransaksiPenjual);
  var layanan=_num(r.biayaLayanan);
  var ongkirSeller=_num(r.ongkosKirimDibayarPenjual);
  var promosi=_num(r.biayaPromosi);
  var retur=_num(r.pengembalianDana);
  var penyesuaian=_num(r.biayaPenyesuaianToko);
  var mktLain=_num(r.biayaMarketplaceLainnya);
  var pack=_num(r.bahanPengemasan);
  var iklan=_num(r.iklan);
  var sewa=_num(r.sewa);
  var lainnya=_num(r.lainnya);
  var modal=_num(r.modalProduk);
  var biayaMarketplace = flowCost(admin)+flowCost(transaksi)+flowCost(layanan)+flowCost(ongkirSeller)+flowCost(promosi)+flowCost(retur)+flowCost(penyesuaian)+flowCost(mktLain);
  var biayaLainnya = flowCost(pack)+flowCost(iklan)+flowCost(sewa)+flowCost(lainnya);
  var pemasukanCalc = dana + subsidi + biayaMarketplace + biayaLainnya;
  var keuntunganCalc = pemasukanCalc - modal;
  var hasExcelPemasukan = r.pemasukanTokoSource!=null && String(r.pemasukanTokoSource).trim()!=='';
  var hasExcelKeuntungan = r.keuntunganKerugianSource!=null && String(r.keuntunganKerugianSource).trim()!=='';
  var hasExcelPersen = r.persentaseKeuntunganSource!=null && String(r.persentaseKeuntunganSource).trim()!=='';
  var pemasukan = hasExcelPemasukan ? _num(r.pemasukanTokoSource) : pemasukanCalc;
  var keuntungan = hasExcelKeuntungan ? _num(r.keuntunganKerugianSource) : (pemasukan - modal);
  var persen = hasExcelPersen ? _num(r.persentaseKeuntunganSource) : (dana>0 ? (keuntungan/dana*100) : 0);
  return {
    tanggal:r.tanggal||_todayYMD(),
    marketplace:(r.marketplace||r.sumber||'Tanpa Marketplace').trim()||'Tanpa Marketplace',
    toko:(r.toko||r.sumber||'Tanpa Toko').trim()||'Tanpa Toko',
    penandaan:(r.penandaan||'').trim(),
    catatan:(r.catatan||'').trim(),
    danaPenjualanProduk:dana,
    subsidiMarketplace:subsidi,
    biayaAdministrasi:admin,
    biayaTransaksiPenjual:transaksi,
    biayaLayanan:layanan,
    ongkosKirimDibayarPenjual:ongkirSeller,
    biayaPromosi:promosi,
    pengembalianDana:retur,
    biayaPenyesuaianToko:penyesuaian,
    biayaMarketplaceLainnya:mktLain,
    bahanPengemasan:pack,
    iklan:iklan,
    sewa:sewa,
    lainnya:lainnya,
    biayaMarketplace:biayaMarketplace,
    biayaLainnya:biayaLainnya,
    pemasukanToko:pemasukan,
    modalProduk:modal,
    keuntunganKerugian:keuntungan,
    persentaseKeuntungan:persen,
    ts:r.ts||'',
    inputMethod:r.inputMethod||'manual',
    periodeDari:r.periodeDari||r.tanggal||'',
    periodeSampai:r.periodeSampai||r.tanggal||'',
    importSessionId:r.importSessionId||'',
    importSessionLabel:r.importSessionLabel||''
  };
}
function _finInfoIcon(txt){
  return '<span title="'+escAttr(txt)+'" style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:1px solid rgba(219,151,76,.35);border-radius:50%;color:#C4B59A;font-size:10px;cursor:help;flex-shrink:0">&#9432;</span>';
}
var _finDeskFilter={mode:'month',from:'',to:''};
function _finTitleBar(title, tip, rightHtml){
  return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><div style="font-size:14px;font-weight:800;color:#F0C56A;letter-spacing:.02em">'+title+'</div>'+_finInfoIcon(tip||'')+'</div>'+(rightHtml||'')+'</div>';
}
function _finMiniKPI(label, value, color, hint){
  return '<div class="card" style="margin-bottom:0;background:var(--bg3);position:relative;overflow:hidden;padding:8px 9px;min-width:0"><div style="position:absolute;top:0;left:0;right:0;height:2px;background:'+color+'"></div><div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px"><div style="font-size:9px;font-weight:700;color:'+color+';text-transform:uppercase;letter-spacing:.05em">'+label+'</div>'+_finInfoIcon(hint||label)+'</div><div style="font-size:16px;font-weight:800;color:var(--tx);line-height:1.2">'+value+'</div></div>';
}
var _supInfoIcon=_finInfoIcon;
function _supTitleBar(title, tip, rightHtml){
  return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><div style="font-size:13px;font-weight:800;color:var(--tx);letter-spacing:.02em">'+title+'</div>'+_supInfoIcon(tip||'')+'</div>'+(rightHtml||'')+'</div>';
}
function _finDeskUiStateFromFilter(){
  var mode=String(_finDeskFilter.mode||'month');
  if(mode==='today') return {group:'realtime',preset:'today'};
  if(mode==='7d') return {group:'realtime',preset:'7d'};
  if(mode==='30d') return {group:'realtime',preset:'30d'};
  if(mode==='month') return {group:'realtime',preset:'month'};
  if(mode==='year') return {group:'year',preset:'year'};
  if(mode==='manual') return {group:'manual',preset:'manual'};
  return {group:'realtime',preset:'month'};
}
function _finDeskPresetOptions(group){
  group=String(group||'realtime');
  if(group==='realtime') return [
    {id:'month',label:'Hari Ini - Pk 14:00 (GMT+07)'},
    {id:'today',label:'Hari ini'},
    {id:'yesterday',label:'Kemarin'},
    {id:'7d',label:'7 hari sebelumnya'},
    {id:'30d',label:'30 hari sebelumnya'}
  ];
  if(group==='day') return [{id:'manual',label:'Pilih rentang harian'}];
  if(group==='week') return [{id:'manual',label:'Pilih rentang mingguan'}];
  if(group==='month') return [{id:'manual',label:'Pilih rentang bulanan'}];
  if(group==='year') return [{id:'year',label:'Berdasarkan tahun aktif'},{id:'manual',label:'Pilih rentang tahunan'}];
  return [{id:'manual',label:'Atur manual'}];
}
function _finDeskPeriodToolbar(){
  var ui=_finDeskUiStateFromFilter();
  var groups=[
    {id:'realtime',label:'Real-time'},
    {id:'day',label:'Per Hari'},
    {id:'week',label:'Per Minggu'},
    {id:'month',label:'Per Bulan'},
    {id:'year',label:'Berdasarkan Tahun'},
    {id:'manual',label:'Manual'}
  ];
  var presets=_finDeskPresetOptions(ui.group);
  return '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">'
    +'<div style="min-width:170px;flex:0 1 190px"><label class="lbl">Periode Data</label><select id="FIN-DESK-GROUP" class="fi" onchange="_finDeskSyncPresetOptions()">'+groups.map(function(g){ return '<option value="'+g.id+'"'+(ui.group===g.id?' selected':'')+'>'+g.label+'</option>'; }).join('')+'</select></div>'
    +'<div style="min-width:230px;flex:0 1 270px"><label class="lbl">Preset / Rentang</label><select id="FIN-DESK-PRESET" class="fi">'+presets.map(function(p){ return '<option value="'+p.id+'"'+(ui.preset===p.id?' selected':'')+'>'+p.label+'</option>'; }).join('')+'</select></div>'
    +'<div style="width:150px"><label class="lbl">Dari</label><input id="FIN-DESK-FROM" class="fi" type="date" value="'+escAttr(_finDeskFilter.from||'')+'"></div>'
    +'<div style="width:150px"><label class="lbl">Sampai</label><input id="FIN-DESK-TO" class="fi" type="date" value="'+escAttr(_finDeskFilter.to||'')+'"></div>'
    +'<button class="btnp" onclick="_finApplyDeskFilter()" style="padding:8px 12px;background:var(--navy)">Terapkan</button>'
    +'<button class="btns" onclick="_finResetDeskFilter()" style="padding:8px 12px">Reset</button></div>';
}
function _finDeskSyncPresetOptions(){
  var groupEl=document.getElementById('FIN-DESK-GROUP');
  var presetEl=document.getElementById('FIN-DESK-PRESET');
  if(!groupEl||!presetEl) return;
  var current=String(presetEl.value||'');
  var opts=_finDeskPresetOptions(groupEl.value);
  presetEl.innerHTML=opts.map(function(p){ return '<option value="'+p.id+'"'+(p.id===current?' selected':'')+'>'+p.label+'</option>'; }).join('');
}
function _finResolveDeskRange(){
  var now=new Date();
  var today=_todayYMD();
  var mode=String(_finDeskFilter.mode||'month');
  var out={mode:mode,from:'',to:today,label:'Bulan ini'};
  if(mode==='today'){
    out.from=today; out.to=today; out.label='Hari ini';
  } else if(mode==='yesterday'){
    var yd=new Date(now); yd.setDate(yd.getDate()-1);
    out.from=_finDateToYMD(yd); out.to=out.from; out.label='Kemarin';
  } else if(mode==='7d'){
    var d7=new Date(now); d7.setDate(d7.getDate()-6);
    out.from=_finDateToYMD(d7); out.to=today; out.label='7 hari terakhir';
  } else if(mode==='30d'){
    var d30=new Date(now); d30.setDate(d30.getDate()-29);
    out.from=_finDateToYMD(d30); out.to=today; out.label='30 hari terakhir';
  } else if(mode==='year'){
    out.from=now.getFullYear()+'-01-01'; out.to=today; out.label='Tahun ini';
  } else if(mode==='manual'){
    out.from=String(_finDeskFilter.from||'').trim();
    out.to=String(_finDeskFilter.to||'').trim()||today;
    out.label=(out.from&&out.to)?(fmtD(out.from)+' \u2192 '+fmtD(out.to)):'Periode manual';
  } else {
    out.from=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-01';
    out.to=today;
    out.label='Bulan ini';
  }
  return out;
}
function _finDateOnly(v){
  return String(v||'').slice(0,10);
}
function _finRangeContains(date, from, to){
  var d=_finDateOnly(date);
  if(!d) return false;
  if(from && d<from) return false;
  if(to && d>to) return false;
  return true;
}
function _finRangeOverlaps(start, end, from, to){
  var s=_finDateOnly(start||end);
  var e=_finDateOnly(end||start);
  if(!s && !e) return false;
  if(!s) s=e;
  if(!e) e=s;
  if(from && e<from) return false;
  if(to && s>to) return false;
  return true;
}
function _finMonthKeysInRange(from,to){
  var out=[];
  if(!from||!to) return out;
  var d=new Date(from+'T00:00:00');
  var end=new Date(to+'T00:00:00');
  d.setDate(1); end.setDate(1);
  while(d<=end){
    out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));
    d.setMonth(d.getMonth()+1);
  }
  return out;
}
function _finBankCashUntilDate(toDate){
  var latestByName={};
  (_finAssets||[]).filter(function(r){ return (r.type||'')==='Bank'; }).forEach(function(r){
    var dt=_finDateOnly(r.tanggal||'');
    if(toDate && dt && dt>toDate) return;
    var key=(r.nama||'Tanpa Rekening').trim()||'Tanpa Rekening';
    if(!latestByName[key] || _finDateOnly(latestByName[key].tanggal||'')<dt) latestByName[key]=r;
  });
  return Object.keys(latestByName).reduce(function(sum,key){ return sum+_num(latestByName[key].nominal); },0);
}
function _finSupplierSaldoForRange(from,to){
  var toKey=String((to||'')).slice(0,7);
  var total=0;
  (typeof supplierHutang!=='undefined'?supplierHutang:[]).forEach(function(d){
    var yr=parseInt(d&&d.tahun,10)||0;
    var mn=parseInt(d&&d.bulanNum,10)||0;
    if((!yr || !mn) && d && d.bulan) mn=_finMonthNameToNum(d.bulan)||mn;
    if((!yr || !mn) && (d&&d.nota||[]).length){
      var notaDate=String((((d&&d.nota)||[])[0]||{}).tgl||'').trim();
      if(/^\d{4}-\d{2}/.test(notaDate)){
        yr=parseInt(notaDate.slice(0,4),10)||yr;
        mn=parseInt(notaDate.slice(5,7),10)||mn;
      }
    }
    if((!yr || !mn) && (d&&d.bayar||[]).length){
      var bayarDate=String((((d&&d.bayar)||[])[0]||{}).tgl||'').trim();
      if(/^\d{4}-\d{2}/.test(bayarDate)){
        yr=parseInt(bayarDate.slice(0,4),10)||yr;
        mn=parseInt(bayarDate.slice(5,7),10)||mn;
      }
    }
    if(!yr || !mn) return;
    var key=String(yr)+'-'+String(mn).padStart(2,'0');
    if(toKey && key>toKey) return;
    var nota=(d.nota||[]).reduce(function(t,n){ return t+_num((n&&n.nilaiNetto)||0); },0);
    var bayar=(d.bayar||[]).reduce(function(t,b){ return t+_num((b&&b.jumlah)||0); },0);
    total+=nota-bayar;
  });
  return total;
}
function _finDeskSummaryForRange(){
  var range=_finResolveDeskRange();
  var monthRows=_finBuildMonthlySummary();
  var monthKeys=_finMonthKeysInRange(range.from,range.to);
  var monthKeyMap={};
  monthKeys.forEach(function(key){ monthKeyMap[key]=1; });
  var incomeRows=(_finIncome||[]).map(_finIncomeMetrics).filter(function(r){
    return _finRangeOverlaps(r.periodeDari||r.tanggal||'', r.periodeSampai||r.tanggal||'', range.from, range.to);
  });
  var expenseRows=(_finExpense||[]).filter(function(r){
    return _finRangeContains(r.tanggal||'', range.from, range.to);
  });
  var subRows=expenseRows.filter(function(r){ return String(r.kategori||'').toLowerCase()==='langganan'; });
  var nonSubRows=expenseRows.filter(function(r){ return String(r.kategori||'').toLowerCase()!=='langganan'; });
  var targetPenjualan=0;
  var cashGoal=0;
  monthRows.forEach(function(r){
    if(monthKeyMap[r.key]){
      targetPenjualan+=_num(r.targetPenjualan);
      cashGoal+=_num(r.cashGoal);
    }
  });
  var penjualan=incomeRows.reduce(function(sum,r){ return sum+_num(r.danaPenjualanProduk); },0);
  var laba=incomeRows.reduce(function(sum,r){ return sum+_num(r.keuntunganKerugian); },0);
  var pengeluaran=expenseRows.reduce(function(sum,r){ return sum+_num(r.nominal); },0);
  var berulang=subRows.reduce(function(sum,r){ return sum+_num(r.nominal); },0);
  var pengeluaranOperasional=nonSubRows.reduce(function(sum,r){ return sum+_num(r.nominal); },0);
  var cash=_finBankCashUntilDate(range.to);
  var hutangSupplier=_finSupplierSaldoForRange(range.from,range.to);
  var marketplaces={};
  incomeRows.forEach(function(r){
    var mk=String(r.marketplace||r.toko||'').trim();
    if(mk) marketplaces[mk]=(marketplaces[mk]||0)+1;
  });
  var progressPenjualan=targetPenjualan>0?(penjualan/targetPenjualan):0;
  var cashProgress=cashGoal>0?(cash/cashGoal):0;
  return {
    key:String(range.to||'').slice(0,7),
    name:range.label,
    penjualan:penjualan,
    laba:laba,
    cash:cash,
    totalCash:cash,
    pengeluaran:pengeluaran,
    pengeluaranOperasional:pengeluaranOperasional,
    berulang:berulang,
    hutangSupplier:hutangSupplier,
    saldo:cash-pengeluaran-hutangSupplier,
    targetPenjualan:targetPenjualan,
    progressPenjualan:progressPenjualan,
    cashGoal:cashGoal,
    cashProgress:cashProgress,
    marketplaces:Object.keys(marketplaces).sort(function(a,b){ return marketplaces[b]-marketplaces[a]; }),
    rowCount:incomeRows.length,
    filterRange:range
  };
  }
  function _finStoreRatiosForRange(){
    var range=_finResolveDeskRange();
    var grouped={};
    (_finIncome||[]).map(_finIncomeMetrics).forEach(function(r){
      var from=r.periodeDari||r.tanggal||'';
      var to=r.periodeSampai||r.tanggal||'';
      if(!_finRangeOverlaps(from,to,range.from,range.to)) return;
      var key=String(r.toko||r.marketplace||'Tanpa Toko').trim()||'Tanpa Toko';
      grouped[key]=grouped[key]||{nama:key,penjualan:0,modal:0,laba:0,rows:0};
      grouped[key].penjualan+=_num(r.danaPenjualanProduk);
      grouped[key].modal+=_num(r.modalProduk);
      grouped[key].laba+=_num(r.keuntunganKerugian);
      grouped[key].rows+=1;
    });
    return Object.keys(grouped).map(function(key){
      var row=grouped[key];
      row.marginPenjualan=row.penjualan>0?((row.laba/row.penjualan)*100):0;
      row.roiModal=row.modal>0?((row.laba/row.modal)*100):0;
      return row;
    }).sort(function(a,b){
      if(b.marginPenjualan!==a.marginPenjualan) return b.marginPenjualan-a.marginPenjualan;
      if(b.roiModal!==a.roiModal) return b.roiModal-a.roiModal;
      return b.laba-a.laba;
    });
  }
  function _finFilterMonthlyRowsForDesk(rows){
  var range=_finResolveDeskRange();
  var keyMap={};
  _finMonthKeysInRange(range.from,range.to).forEach(function(key){ keyMap[key]=1; });
  return (rows||[]).filter(function(r){
    var key=String((r&&r.key)||'');
    return !!keyMap[key];
  });
}
function _finApplyDeskFilter(){
  var group=((document.getElementById('FIN-DESK-GROUP')||{}).value||'').trim();
  var preset=((document.getElementById('FIN-DESK-PRESET')||{}).value||'').trim();
  var legacy=((document.getElementById('FIN-DESK-MODE')||{}).value||'').trim();
  var from=((document.getElementById('FIN-DESK-FROM')||{}).value||'').trim();
  var to=((document.getElementById('FIN-DESK-TO')||{}).value||'').trim();
  var mode=legacy||'month';
  if(group){
    if(group==='realtime') mode=preset||'month';
    else if(group==='year' && preset==='year') mode='year';
    else if(group==='manual' || preset==='manual' || group==='day' || group==='week' || group==='month') mode='manual';
  }
  _finDeskFilter={mode:mode,from:from,to:to};
  _renderFinance('dash');
}
function _finResetDeskFilter(){
  _finDeskFilter={mode:'month',from:'',to:''};
  _renderFinance('dash');
}
function _finPromptExpenseCategory(){
  var name=prompt('Masukkan nama kategori pengeluaran baru:','');
  if(name==null) return;
  var inp={value:name};
  var old=document.getElementById('FIN-EX-NEWCAT');
  if(old){ old.value=name; _finAddExpenseCategory(); return; }
  name=String(name||'').trim();
  if(!name){ toast('Nama kategori wajib diisi','error'); return; }
  if(_finExpenseCategories.indexOf(name)>=0){ toast('Kategori sudah ada','warn'); return; }
  _finExpenseCategories.push(name);
  _finExpenseCategories.sort(function(a,b){ return String(a).localeCompare(String(b),'id'); });
  _saveFin(); toast('Kategori ditambahkan','success'); _renderFinance('expense');
}
function _finMonthKeyFromDate(d){
  return String(d||'').slice(0,7);
}
function _finMonthLabelShort(key){
  var p=String(key||'').split('-');
  var y=parseInt(p[0],10), m=parseInt(p[1],10);
  if(!y||!m) return key||'-';
  return new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
}
function _finMonthLabelLong(key){
  var p=String(key||'').split('-');
  var y=parseInt(p[0],10), m=parseInt(p[1],10);
  if(!y||!m) return key||'-';
  return new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'});
}
function _finMonthRangeLabel(key){
  var p=String(key||'').split('-');
  var y=parseInt(p[0],10), m=parseInt(p[1],10);
  if(!y||!m) return '-';
  var start=new Date(y,m-1,1);
  var end=new Date(y,m,0);
  return start.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+' \u2192 '+end.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}
function _finProjectedSubscriptionMonthly(){
  var annualized=_finSubscriptions.filter(function(r){ return (r.status||'Active')==='Active'; }).reduce(function(t,r){
    var n=_num(r.nominal);
    return t+((r.siklus||'Bulanan')==='Tahunan' ? n : (n*12));
  },0);
  return annualized/12;
}
function _finProjectedExpenseMonthly(){
  var nonSubscriptionRows=_finExpense.filter(function(r){ return (r.kategori||'')!=='Langganan'; });
  var monthMap={};
  nonSubscriptionRows.forEach(function(r){
    var key=_finMonthKeyFromDate(r.tanggal||'');
    if(key) monthMap[key]=1;
  });
  var monthCount=Math.max(Object.keys(monthMap).length,1);
  var avgNonSubscription=nonSubscriptionRows.reduce(function(t,r){ return t+_num(r.nominal); },0)/monthCount;
  return avgNonSubscription + _finProjectedSubscriptionMonthly();
}
function _finAverageProfitMonthly(){
  var grouped={};
  (_finIncome||[]).map(_finIncomeMetrics).forEach(function(r){
    var key=_finMonthKeyFromDate(r.tanggal||'');
    if(!key) return;
    grouped[key]=(grouped[key]||0)+_num(r.keuntunganKerugian);
  });
  var keys=Object.keys(grouped);
  if(!keys.length) return 0;
  return keys.reduce(function(t,k){ return t+grouped[k]; },0)/keys.length;
}
function _finAssetsByMonthEnd(key, type){
  var p=String(key||'').split('-');
  var y=parseInt(p[0],10), m=parseInt(p[1],10);
  if(!y||!m) return [];
  var endKey=_finDateToYMD(new Date(y,m,0));
  var grouped={};
  _finAssets.forEach(function(r){
    if(type && (r.type||'')!==type) return;
    var tg=String(r.tanggal||'');
    if(!tg || tg>endKey) return;
    var name=(r.nama||'Tanpa Nama').trim()||'Tanpa Nama';
    if(!grouped[name] || String(grouped[name].tanggal||'')<tg) grouped[name]=r;
  });
  return Object.keys(grouped).map(function(k){ return grouped[k]; });
}
function _finBankCashForMonth(key){
  return _finAssetsByMonthEnd(key,'Bank').reduce(function(t,r){ return t+_num(r.nominal); },0);
}
function _finAssetTrendSeries(rows){
  rows=(rows||[]).filter(function(r){ return r && r.tanggal; }).slice().sort(function(a,b){ return String(a.tanggal||'').localeCompare(String(b.tanggal||'')); });
  if(!rows.length) return [];
  var first=String(rows[0].tanggal||'').slice(0,7);
  var last=String(rows[rows.length-1].tanggal||'').slice(0,7);
  if(!first || !last) return [];
  var months=[], seen={};
  rows.forEach(function(r){
    var key=String(r.tanggal||'').slice(0,7);
    if(key && !seen[key]){ seen[key]=1; months.push(key); }
  });
  if(first!==last && months[months.length-1]!==last) months.push(last);
  months=months.sort();
  return months.map(function(key){
    var endKey=key+'-31';
    var grouped={};
    rows.forEach(function(r){
      var tg=String(r.tanggal||'');
      if(!tg || tg>endKey) return;
      var gk=((r.type||'Tanpa Jenis')+'|'+((r.nama||'Tanpa Nama').trim()||'Tanpa Nama'));
      if(!grouped[gk] || String(grouped[gk].tanggal||'')<tg) grouped[gk]=r;
    });
    var total=Object.keys(grouped).reduce(function(sum,k){ return sum+_num(grouped[k].nominal); },0);
    return {key:key,total:total};
  });
}
function _finAssetChangeRows(rows){
  rows=(rows||[]).filter(function(r){ return r && r.tanggal && (r.nama||'').trim(); }).slice().sort(function(a,b){
    var ka=String(a.tanggal||'')+'|'+String(a.ts||'')+'|'+String(a.id||'');
    var kb=String(b.tanggal||'')+'|'+String(b.ts||'')+'|'+String(b.id||'');
    return ka.localeCompare(kb);
  });
  if(!rows.length) return [];
  var grouped={};
  rows.forEach(function(r){
    var key=((r.type||'Tanpa Jenis')+'|'+((r.nama||'Tanpa Nama').trim()||'Tanpa Nama'));
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(r);
  });
  return Object.keys(grouped).map(function(key){
    var list=grouped[key];
    var latest=list[list.length-1];
    var prev=null;
    for(var i=list.length-2;i>=0;i--){
      if(_num(list[i].nominal)!==_num(latest.nominal) || String(list[i].tanggal||'')!==String(latest.tanggal||'')){ prev=list[i]; break; }
    }
    if(!prev) return null;
    var currVal=_num(latest.nominal), prevVal=_num(prev.nominal), delta=currVal-prevVal;
    if(Math.abs(delta)<0.0001) return null;
    var pct=prevVal ? (delta/prevVal*100) : 0;
    return {
      key:key,
      type:latest.type||'Tanpa Jenis',
      nama:(latest.nama||'Tanpa Nama').trim()||'Tanpa Nama',
      kategori:latest.kategori||prev.kategori||'',
      currentValue:currVal,
      previousValue:prevVal,
      delta:delta,
      pct:pct,
      previousDate:prev.tanggal||'',
      currentDate:latest.tanggal||'',
      latestNote:latest.catatan||''
    };
  }).filter(Boolean).sort(function(a,b){
    var da=Math.abs(a.delta), db=Math.abs(b.delta);
    if(db!==da) return db-da;
    return String(b.currentDate||'').localeCompare(String(a.currentDate||''));
  });
}
function _finProductAssetSeriesForRange(from,to){
  var rows=(_finAssets||[]).filter(function(r){
    var dt=String(r.tanggal||'').slice(0,10);
    var hay=((r.type||'')+' '+(r.kategori||'')+' '+(r.nama||'')).toLowerCase();
    if(hay.indexOf('produk')<0 && hay.indexOf('product')<0 && hay.indexOf('stok')<0) return false;
    if(from && dt && dt<from) return false;
    if(to && dt && dt>to) return false;
    return true;
  });
  return _finAssetTrendSeries(rows);
}
function _finMiniLineSvg(series, color){
  color=color||'#8FD0FF';
  if(!series || !series.length){
    return '<div style="height:54px;border:1px dashed rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--tx3)">Belum ada tren</div>';
  }
  var values=series.map(function(x){ return _num(x.total||x.value); });
  var max=Math.max.apply(null,values), min=Math.min.apply(null,values);
  var w=260, h=58, pad=6;
  var pts=series.map(function(s,idx){
    var v=_num(s.total||s.value);
    var x=pad + ((w-pad*2) * (series.length===1?0.5:(idx/(series.length-1))));
    var y=(max===min)?(h/2):(h-pad-(((v-min)/(max-min))*(h-pad*2)));
    return [Math.round(x*10)/10,Math.round(y*10)/10];
  });
  var poly=pts.map(function(p){ return p[0]+','+p[1]; }).join(' ');
  var last=series[series.length-1];
  return '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:58px;display:block"><polyline fill="none" stroke="'+color+'" stroke-width="2.4" points="'+poly+'"></polyline><polyline fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1" points="6,'+(h-10)+' '+(w-6)+','+(h-10)+'"></polyline>'+pts.map(function(p,idx){ return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(idx===pts.length-1?3.2:2.2)+'" fill="'+(idx===pts.length-1?'#F0C56A':color)+'"></circle>'; }).join('')+'<text x="'+(w-6)+'" y="12" text-anchor="end" fill="rgba(255,255,255,.55)" font-size="9">'+esc(_finMonthLabelShort(last.key||''))+'</text></svg>';
}
var _supTrendSeriesVis=(function(){
  try{
    var data=JSON.parse(localStorage.getItem('ajw_sup_trend_vis')||'null');
    return {
      nota:data&&data.nota!==false,
      bayar:data&&data.bayar!==false,
      saldo:data&&data.saldo!==false
    };
  }catch(e){}
  return {nota:true,bayar:true,saldo:true};
})();
function _supSetTrendVis(key, checked){
  _supTrendSeriesVis=_supTrendSeriesVis||{nota:true,bayar:true,saldo:true};
  _supTrendSeriesVis[key]=!!checked;
  try{ localStorage.setItem('ajw_sup_trend_vis', JSON.stringify(_supTrendSeriesVis)); }catch(e){}
  try{ if(typeof renderSupplier==='function') renderSupplier(); }catch(e){}
}
function _supShortMoney(n){
  n=_num(n);
  if(Math.abs(n)>=1000000000) return 'Rp '+(n/1000000000).toFixed(1).replace(/\.0$/,'')+' M';
  if(Math.abs(n)>=1000000) return 'Rp '+(n/1000000).toFixed(1).replace(/\.0$/,'')+' Jt';
  if(Math.abs(n)>=1000) return 'Rp '+(n/1000).toFixed(0)+' Rb';
  return 'Rp '+fmt(n);
}
function _supDebtTrendSvg(rows){
  rows=Array.isArray(rows)?rows.filter(Boolean):[];
  if(!rows.length){
    return '<div style="height:220px;border:1px dashed rgba(255,255,255,.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--tx3)">Belum ada data tren hutang</div>';
  }
  var vis=_supTrendSeriesVis||{nota:true,bayar:true,saldo:true};
  var w=920,h=220,padL=84,padR=18,padT=16,padB=42;
  var max=0;
  rows.forEach(function(r){
    if(vis.nota) max=Math.max(max,_num(r.nota));
    if(vis.bayar) max=Math.max(max,_num(r.bayar));
    if(vis.saldo) max=Math.max(max,_num(r.saldo));
  });
  if(max<=0) max=1;
  var innerW=w-padL-padR, innerH=h-padT-padB;
  function xAt(i){ return padL+(rows.length===1?innerW/2:(innerW/(rows.length-1))*i); }
  function yAt(v){ return padT+innerH-(Math.max(0,_num(v))/max)*innerH; }
  function buildPath(key){
    return rows.map(function(r,i){ return (i?'L':'M')+xAt(i).toFixed(1)+' '+yAt(r[key]).toFixed(1); }).join(' ');
  }
  var ticks=[0,max*0.33,max*0.66,max];
  var grid=ticks.map(function(t){
    var y=yAt(t);
    return '<line x1="'+padL+'" x2="'+(w-padR)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(255,255,255,.07)" stroke-width="1"></line>'+
      '<text x="'+(padL-10)+'" y="'+(y+4)+'" text-anchor="end" fill="rgba(255,255,255,.55)" font-size="10">'+esc(_supShortMoney(t))+'</text>';
  }).join('');
  var xLabels=rows.map(function(r,i){
    var x=xAt(i);
    return '<text x="'+x+'" y="'+(h-14)+'" text-anchor="middle" fill="rgba(255,255,255,.72)" font-size="11">'+esc(r.label||'')+'</text>';
  }).join('');
  function points(key,color){
    return rows.map(function(r,i){ var x=xAt(i), y=yAt(r[key]); return '<circle cx="'+x+'" cy="'+y+'" r="3.4" fill="'+color+'" stroke="rgba(9,11,15,.94)" stroke-width="1.5"></circle>'; }).join('');
  }
  var cNota='#B7BCC6', cBayar='#8FA59B', cSaldo='#C4A96B';
  return '<div class="sup-chart-legend">'+
    '<label><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+cNota+'"></span><input type="checkbox" '+(vis.nota?'checked ':'')+'onchange="_supSetTrendVis(\'nota\',this.checked)"> Total Pembelian</label>'+
    '<label><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+cBayar+'"></span><input type="checkbox" '+(vis.bayar?'checked ':'')+'onchange="_supSetTrendVis(\'bayar\',this.checked)"> Total Terbayar</label>'+
    '<label><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+cSaldo+'"></span><input type="checkbox" '+(vis.saldo?'checked ':'')+'onchange="_supSetTrendVis(\'saldo\',this.checked)"> Saldo Hutang</label>'+
    '</div>'+
    '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:244px;display:block;background:linear-gradient(180deg,rgba(255,255,255,.01),rgba(0,0,0,.03));border:1px solid rgba(255,255,255,.05);border-radius:12px">'+
    grid+
    '<line x1="'+padL+'" x2="'+(w-padR)+'" y1="'+(h-padB)+'" y2="'+(h-padB)+'" stroke="rgba(255,255,255,.09)" stroke-width="1"></line>'+
    (vis.nota?'<path d="'+buildPath('nota')+'" fill="none" stroke="'+cNota+'" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"></path>':'')+
    (vis.bayar?'<path d="'+buildPath('bayar')+'" fill="none" stroke="'+cBayar+'" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"></path>':'')+
    (vis.saldo?'<path d="'+buildPath('saldo')+'" fill="none" stroke="'+cSaldo+'" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path>':'')+
    (vis.nota?points('nota',cNota):'')+(vis.bayar?points('bayar',cBayar):'')+(vis.saldo?points('saldo',cSaldo):'')+
    xLabels+
    '</svg>';
}
function _finExpenseTrendSeries(rows){
  var map={};
  (rows||[]).forEach(function(r){
    var tg=String(r.tanggal||'').trim();
    if(!tg || tg.length<7) return;
    var key=tg.slice(0,7);
    if(!map[key]) map[key]={key:key,total:0,payroll:0,langganan:0};
    var nominal=_num(r.nominal);
    map[key].total+=nominal;
    if(r.sourceType==='payroll' || (r.kategori||'')==='Gaji') map[key].payroll+=nominal;
    if((r.kategori||'')==='Langganan') map[key].langganan+=nominal;
  });
  return Object.keys(map).sort().map(function(key){
    var y=Number(key.slice(0,4)),m=Number(key.slice(5,7));
    return {
      key:key,
      label:new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'}),
      total:map[key].total,
      payroll:map[key].payroll,
      langganan:map[key].langganan
    };
  });
}
function _finRenderExpenseTrendChart(rows){
  var canvas=document.getElementById('FIN-EXPENSE-TREND-CHART');
  if(!canvas || !window.Chart) return;
  if(window._finExpenseTrendChart){ try{ window._finExpenseTrendChart.destroy(); }catch(e){} }
  var series=_finExpenseTrendSeries(rows);
  if(!series.length){
    var ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    return;
  }
  window._finExpenseTrendChart=new Chart(canvas.getContext('2d'),{
    type:'line',
    data:{
      labels:series.map(function(p){ return p.label; }),
      datasets:[
        {label:'Total Pengeluaran',data:series.map(function(p){ return p.total; }),borderColor:'#FFB76B',backgroundColor:'rgba(255,183,107,.12)',fill:false,tension:.28,pointRadius:3,borderWidth:2.2},
        {label:'Payroll',data:series.map(function(p){ return p.payroll; }),borderColor:'#8FD0FF',backgroundColor:'rgba(143,208,255,.12)',fill:false,tension:.28,pointRadius:3,borderWidth:2},
        {label:'Langganan',data:series.map(function(p){ return p.langganan; }),borderColor:'#D796FF',backgroundColor:'rgba(215,150,255,.12)',fill:false,tension:.28,pointRadius:3,borderWidth:2}
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{display:true,labels:{color:'rgba(255,255,255,.74)',boxWidth:14,font:{size:11}}},
        tooltip:{callbacks:{label:function(ctx){ return ctx.dataset.label+': Rp '+fmt(ctx.raw||0); }}}
      },
      scales:{
        x:{grid:{display:false},ticks:{color:'rgba(255,255,255,.6)',font:{size:10}}},
        y:{grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'rgba(255,255,255,.6)',callback:function(v){ return 'Rp '+fmt(v); },font:{size:10}}}
      }
    }
  });
}
function _finRenderAssetTrendChart(rows){
  var canvas=document.getElementById('FIN-ASSET-TREND-CHART');
  if(!canvas||!window.Chart) return;
  if(window._finAssetTrendChart){ try{ window._finAssetTrendChart.destroy(); }catch(e){} }
  var series=_finAssetTrendSeries(rows);
  if(!series.length){
    var ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    return;
  }
  var labels=series.map(function(p){
    var bits=String(p.key).split('-');
    var y=parseInt(bits[0],10), m=parseInt(bits[1],10);
    return new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
  });
  var vals=series.map(function(p){ return p.total; });
  window._finAssetTrendChart=new Chart(canvas.getContext('2d'),{
    type:'line',
    data:{labels:labels,datasets:[{label:'Total Aset',data:vals,borderColor:'#8FD0FF',backgroundColor:'rgba(143,208,255,.12)',fill:true,tension:.32,pointRadius:3,pointHoverRadius:4,borderWidth:2}]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){ return 'Rp '+fmt(ctx.raw||0); }}}},
      scales:{
        x:{grid:{display:false},ticks:{color:'rgba(255,255,255,.55)',maxRotation:0,autoSkip:true,maxTicksLimit:6,font:{size:10}}},
        y:{grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'rgba(255,255,255,.55)',callback:function(v){ return 'Rp '+fmt(v); },font:{size:10}}}
      }
    }
  });
}
function _finDistinctAssetTrendOptions(rows){
  var seen={};
  return (rows||[]).filter(function(r){ return r && r.tanggal && (r.nama||'').trim(); }).map(function(r){
    return {
      key:((r.type||'Tanpa Jenis')+'|'+((r.nama||'Tanpa Nama').trim()||'Tanpa Nama')),
      label:((r.nama||'Tanpa Nama').trim()||'Tanpa Nama')+' ('+(r.type||'Tanpa Jenis')+')'
    };
  }).filter(function(r){
    if(seen[r.key]) return false;
    seen[r.key]=1;
    return true;
  }).sort(function(a,b){ return String(a.label||'').localeCompare(String(b.label||'')); });
}
function _finSetAssetTrendFocus(value){
  _finAssetTrendFocus=String(value||'').trim();
  try{ localStorage.setItem('ajw_fin_asset_focus', _finAssetTrendFocus); }catch(e){}
  _renderFinance('asset');
}
function _finAssetNameTrendSeries(rows, focusKey){
  rows=(rows||[]).filter(function(r){ return r && r.tanggal; });
  if(!focusKey) return [];
  var filtered=rows.filter(function(r){
    var key=((r.type||'Tanpa Jenis')+'|'+((r.nama||'Tanpa Nama').trim()||'Tanpa Nama'));
    return key===focusKey;
  }).slice().sort(function(a,b){ return String(a.tanggal||'').localeCompare(String(b.tanggal||'')); });
  if(!filtered.length) return [];
  var monthMap={};
  filtered.forEach(function(r){
    var key=String(r.tanggal||'').slice(0,7);
    if(!key) return;
    if(!monthMap[key] || String(monthMap[key].tanggal||'')<String(r.tanggal||'')) monthMap[key]=r;
  });
  return Object.keys(monthMap).sort().map(function(key){
    return { key:key, total:_num(monthMap[key].nominal), tanggal:monthMap[key].tanggal||'' };
  });
}
function _finRenderAssetNameTrendChart(rows, focusKey){
  var canvas=document.getElementById('FIN-ASSET-NAME-TREND-CHART');
  if(!canvas||!window.Chart) return;
  if(window._finAssetNameTrendChart){ try{ window._finAssetNameTrendChart.destroy(); }catch(e){} }
  var series=_finAssetNameTrendSeries(rows, focusKey);
  if(!series.length){
    var ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    return;
  }
  var labels=series.map(function(p){
    var bits=String(p.key).split('-');
    var y=parseInt(bits[0],10), m=parseInt(bits[1],10);
    return new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
  });
  var vals=series.map(function(p){ return p.total; });
  window._finAssetNameTrendChart=new Chart(canvas.getContext('2d'),{
    type:'line',
    data:{labels:labels,datasets:[{label:'Nilai Aset',data:vals,borderColor:'#FFD68A',backgroundColor:'rgba(240,197,106,.12)',fill:true,tension:.28,pointRadius:3,pointHoverRadius:4,borderWidth:2}]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){ return 'Rp '+fmt(ctx.raw||0); }}}},
      scales:{
        x:{grid:{display:false},ticks:{color:'rgba(255,255,255,.55)',maxRotation:0,autoSkip:true,maxTicksLimit:6,font:{size:10}}},
        y:{grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'rgba(255,255,255,.55)',callback:function(v){ return 'Rp '+fmt(v); },font:{size:10}}}
      }
    }
  });
}
function _finGetMonthlyConfig(key){
  var raw=_finMonthlySettings[key]||{};
  return {
    targetPenjualan:_num(raw.targetPenjualan)||300000000,
    cashGoal:_num(raw.cashGoal)||100000000,
    closed:!!raw.closed
  };
}
function _finSetMonthlySetting(key, field, value){
  if(!key) return;
  var current=_finGetMonthlyConfig(key);
  _finMonthlySettings[key]=Object.assign({}, current, _finMonthlySettings[key]||{});
  _finMonthlySettings[key][field]=(field==='closed')?!!value:_num(value);
  _saveFin();
  _renderFinance(window._finSub||'lapbul');
}
function _finSaveLapbulShow(){
  try{ localStorage.setItem('ajw_fin_lapbul_show', JSON.stringify(_finLapbulShow||{})); }catch(e){}
}
function _finSetLapbulShow(key, checked){
  _finLapbulShow=_finLapbulShow||{
    penjualan:true,keuntungan:true,persentaseKeuntungan:true,pengeluaran:true,totalAsset:true,saldoHutang:true,saldoTahunan:true,
    cashBank:false,cashGoal:false,cashProgress:false,berulang:false,date:false,targetPenjualan:false
  };
  _finLapbulShow[key]=!!checked;
  _finSaveLapbulShow();
  _renderFinance('lapbul');
}
function _finBuildMonthlySummary(showCfg){
  var show=Object.assign({
    penjualan:true,keuntungan:true,persentaseKeuntungan:true,pengeluaran:true,totalAsset:true,saldoHutang:true,saldoTahunan:true,
    cashBank:false,cashGoal:false,cashProgress:false,berulang:false,date:false,targetPenjualan:false
  }, showCfg||{});
  var useIncome=!!(show.penjualan||show.keuntungan||show.persentaseKeuntungan||show.targetPenjualan||show.saldoTahunan);
  var useExpense=!!(show.pengeluaran||show.berulang||show.saldoTahunan);
  var useAsset=!!(show.totalAsset||show.cashBank||show.cashGoal||show.cashProgress||show.saldoTahunan);
  var useSupplier=!!(show.saldoHutang||show.saldoTahunan);
  var now=new Date(), currentYear=now.getFullYear();
  var rowsMap={};
  function ensure(key){
    if(!rowsMap[key]){
      rowsMap[key]={
        key:key,
        penjualan:0,
        cash:0,
        totalAsset:0,
        pengeluaran:0,
        hutangSupplierDelta:0,
        hutangSupplier:0,
        laba:0,
        marketplaces:{},
        tokoCount:0,
        rowCount:0
      };
    }
    return rowsMap[key];
  }
  for(var mi=1;mi<=12;mi++){
    ensure(currentYear+'-'+String(mi).padStart(2,'0'));
  }
  if(useIncome){
  _finIncome.map(_finIncomeMetrics).forEach(function(r){
    var key=_finMonthKeyFromDate(r.periodeDari||r.tanggal||_todayYMD());
    var row=ensure(key);
    row.penjualan+=r.danaPenjualanProduk;
    row.laba+=r.keuntunganKerugian;
    row.rowCount+=1;
    if(r.toko) row.tokoCount+=1;
    if(r.marketplace){
      row.marketplaces[r.marketplace]=(row.marketplaces[r.marketplace]||0)+r.pemasukanToko;
    }
  });
  }
  if(useExpense){
  _finExpense.forEach(function(r){
    var key=_finMonthKeyFromDate(r.tanggal||_todayYMD());
    ensure(key).pengeluaran+=_num(r.nominal);
  });
  }
  if(useSupplier && typeof supplierHutang!=='undefined'){
    supplierHutang.forEach(function(s){
      var yr=parseInt(s.tahun,10)||0;
      var mn=parseInt(s.bulanNum,10)||0;
      if((!yr || !mn) && s.bulan){
        mn=_finMonthNameToNum(s.bulan)||mn;
      }
      if((!yr || !mn) && (s.nota||[]).length){
        var notaDate=String(((s.nota||[])[0]||{}).tgl||'').trim();
        if(notaDate && /^\d{4}-\d{2}/.test(notaDate)){
          yr=parseInt(notaDate.slice(0,4),10)||yr;
          mn=parseInt(notaDate.slice(5,7),10)||mn;
        }
      }
      if((!yr || !mn) && (s.bayar||[]).length){
        var bayarDate=String(((s.bayar||[])[0]||{}).tgl||'').trim();
        if(bayarDate && /^\d{4}-\d{2}/.test(bayarDate)){
          yr=parseInt(bayarDate.slice(0,4),10)||yr;
          mn=parseInt(bayarDate.slice(5,7),10)||mn;
        }
      }
      yr=yr||currentYear;
      mn=mn||1;
      var key=yr+'-'+String(mn).padStart(2,'0');
      var nota=(s.nota||[]).reduce(function(t,n){ return t+_num((n&&n.nilaiNetto)||0); },0);
      var bayar=(s.bayar||[]).reduce(function(t,b){ return t+_num((b&&b.jumlah)||0); },0);
      ensure(key).hutangSupplierDelta+=(nota-bayar);
    });
  }
  var recurringMonthly=useExpense?_finProjectedSubscriptionMonthly():0;
  var cumulativeSaldo=0, cumulativeSupplierSaldo=0;
  return Object.keys(rowsMap).sort().map(function(key){
    var row=rowsMap[key], cfg=_finGetMonthlyConfig(key);
    row.cash=useAsset?_finBankCashForMonth(key):0;
    row.totalAsset=useAsset?_finAssetsByMonthEnd(key).reduce(function(t,r){ return t+_num(r.nominal); },0):0;
    cumulativeSupplierSaldo+=_num(row.hutangSupplierDelta);
    row.hutangSupplier=cumulativeSupplierSaldo;
    var marketplaces=Object.keys(row.marketplaces).sort();
    var totalExpense=row.pengeluaran+recurringMonthly;
    var totalCash=row.cash;
    var saldoBulan=row.laba-totalExpense-_num(row.hutangSupplierDelta);
    cumulativeSaldo+=saldoBulan;
    return {
      key:key,
      name:_finMonthLabelShort(key),
      penjualan:row.penjualan,
      targetPenjualan:cfg.targetPenjualan,
      progressPenjualan:cfg.targetPenjualan>0?(row.penjualan/cfg.targetPenjualan):0,
      cash:row.cash,
      totalAsset:row.totalAsset,
      berulang:recurringMonthly,
      totalCash:totalCash,
      cashGoal:cfg.cashGoal,
      cashProgress:cfg.cashGoal>0?(totalCash/cfg.cashGoal):0,
      pengeluaran:totalExpense,
      pengeluaranOperasional:row.pengeluaran,
      hutangSupplierDelta:row.hutangSupplierDelta,
      hutangSupplier:row.hutangSupplier,
      saldo:saldoBulan,
      laba:row.laba,
      persentaseKeuntungan:row.penjualan>0?(row.laba/row.penjualan*100):0,
      saldoTahunan:cumulativeSaldo,
      closed:cfg.closed,
      dateLabel:_finMonthRangeLabel(key),
      marketplaces:marketplaces,
      marketplaceText:marketplaces.length?marketplaces.join(', '):'-',
      rowCount:row.rowCount
    };
  });
}
function _finApplyIncomeFilters(){
  _finIncomeFilter.marketplace=((document.getElementById('FIN-FLT-MARKET')||{}).value||'').trim();
  _finIncomeFilter.toko=((document.getElementById('FIN-FLT-TOKO')||{}).value||'').trim();
  _finIncomeFilter.dateFrom=((document.getElementById('FIN-FLT-FROM')||{}).value||'').trim();
  _finIncomeFilter.dateTo=((document.getElementById('FIN-FLT-TO')||{}).value||'').trim();
  _finIncomeFilter.keyword=((document.getElementById('FIN-FLT-KEY')||{}).value||'').trim().toLowerCase();
  var chk=document.getElementById('FIN-SHOW-TABLE');
  _finIncomeFilter.showTable = !chk || !!chk.checked;
  _renderFinance('income');
}
function _finResetIncomeFilters(){
  _finIncomeFilter={marketplace:'',toko:'',dateFrom:'',dateTo:'',keyword:'',showTable:true};
  _renderFinance('income');
}
function _finPreviewIncome(){
  var get=function(id){return _num((document.getElementById(id)||{}).value);};
  var m=_finIncomeMetrics({
    tanggal:((document.getElementById('FIN-IN-DATE')||{}).value||_todayYMD()),
    marketplace:((document.getElementById('FIN-IN-MARKET')||{}).value||'').trim(),
    toko:((document.getElementById('FIN-IN-TOKO')||{}).value||'').trim(),
    penandaan:((document.getElementById('FIN-IN-TAG')||{}).value||'').trim(),
    catatan:((document.getElementById('FIN-IN-NOTE')||{}).value||'').trim(),
    danaPenjualanProduk:get('FIN-IN-DANA'),
    subsidiMarketplace:get('FIN-IN-SUBSIDI'),
    modalProduk:get('FIN-IN-MODAL'),
    biayaAdministrasi:get('FIN-IN-ADM'),
    biayaTransaksiPenjual:get('FIN-IN-TRX'),
    biayaLayanan:get('FIN-IN-LAY'),
    ongkosKirimDibayarPenjual:get('FIN-IN-ONGKIR'),
    biayaPromosi:get('FIN-IN-PROMO'),
    pengembalianDana:get('FIN-IN-RETUR'),
    biayaPenyesuaianToko:get('FIN-IN-ADJ'),
    biayaMarketplaceLainnya:get('FIN-IN-MKTLAIN'),
    bahanPengemasan:get('FIN-IN-PACK'),
    iklan:get('FIN-IN-IKLAN'),
    sewa:get('FIN-IN-SEWA'),
    lainnya:get('FIN-IN-LAIN')
  });
  [['FIN-IN-PMS','Rp '+fmt(m.pemasukanToko),m.pemasukanToko>=0?'#8FD0FF':'#FF9D9D'],['FIN-IN-KRG','Rp '+fmt(m.keuntunganKerugian),m.keuntunganKerugian>=0?'#A7F3B6':'#FF9D9D']].forEach(function(x){
    var el=document.getElementById(x[0]); if(el){ el.value=x[1]; el.style.color=x[2]; }
  });
  [['FIN-SUM-PMS','Rp '+fmt(m.pemasukanToko),m.pemasukanToko>=0?'#8FD0FF':'#FF9D9D'],['FIN-SUM-KRG','Rp '+fmt(m.keuntunganKerugian),m.keuntunganKerugian>=0?'#A7F3B6':'#FF9D9D'],['FIN-SUM-PRS',m.persentaseKeuntungan.toFixed(2)+'%',m.persentaseKeuntungan>=0?'#FFD68A':'#FF9D9D']].forEach(function(x){
    var el=document.getElementById(x[0]); if(el){ el.textContent=x[1]; el.style.color=x[2]; }
  });
}
function _renderFinIncomeChart(rows){
  var canvas=document.getElementById('FIN-INCOME-CHART');
  if(!canvas||!window.Chart) return;
  if(window._finIncomeChart){ try{ window._finIncomeChart.destroy(); }catch(e){} }
  var daily={};
  (rows||[]).forEach(function(r){
    var k=r.tanggal||_todayYMD();
    if(!daily[k]) daily[k]={dana:0,subsidi:0,pemasukan:0,modal:0,unt:0,iklan:0};
    daily[k].dana+=r.danaPenjualanProduk;
    daily[k].subsidi+=r.subsidiMarketplace;
    daily[k].pemasukan+=r.pemasukanToko;
    daily[k].modal+=r.modalProduk;
    daily[k].unt+=r.keuntunganKerugian;
    daily[k].iklan+=r.iklan||0;
  });
  var labels=Object.keys(daily).sort();
  var percent=labels.map(function(k){
    var d=daily[k], base=d.dana;
    return base>0?(d.unt/base*100):0;
  });
  window._finIncomeChart=new Chart(canvas.getContext('2d'),{
    type:'line',
    data:{labels:labels,datasets:[
      {label:'Dana Penjualan Produk',data:labels.map(function(k){return daily[k].dana;}),borderColor:'#8FD0FF',backgroundColor:'rgba(143,208,255,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y'},
      {label:'Pemasukan Toko',data:labels.map(function(k){return daily[k].pemasukan;}),borderColor:'#F0C56A',backgroundColor:'rgba(240,197,106,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y'},
      {label:'Modal Produk',data:labels.map(function(k){return daily[k].modal;}),borderColor:'#D796FF',backgroundColor:'rgba(215,150,255,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y'},
      {label:'Keuntungan / Kerugian',data:labels.map(function(k){return daily[k].unt;}),borderColor:'#A7F3B6',backgroundColor:'rgba(167,243,182,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y'},
      {label:'Biaya Iklan',data:labels.map(function(k){return daily[k].iklan;}),borderColor:'#FF9D9D',backgroundColor:'rgba(255,157,157,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y'},
      {label:'Persentase Keuntungan',data:percent,borderColor:'#FF9FD0',backgroundColor:'rgba(255,159,208,.08)',tension:.35,pointRadius:3,fill:false,yAxisID:'y1'}
    ]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'}},scales:{y:{ticks:{callback:function(v){return 'Rp '+fmt(v);}}},y1:{position:'right',grid:{drawOnChartArea:false},ticks:{callback:function(v){return v+'%';}}}}}
  });
}
function _openFinIncomeModal(){ var m=document.getElementById('FIN-IN-MODAL'); if(m){ m.style.display='flex'; setTimeout(_finPreviewIncome,50); } }
function _closeFinIncomeModal(){ var m=document.getElementById('FIN-IN-MODAL'); if(m) m.style.display='none'; }
function _openFinImportModal(){
  var m=document.getElementById('FIN-IMPORT-MODAL');
  if(m){
    var f=document.getElementById('FIN-IMP-FROM'), t=document.getElementById('FIN-IMP-TO');
    if(f) f.value=_finImportPeriod.from||'';
    if(t) t.value=_finImportPeriod.to||'';
    m.style.display='flex';
  }
}
function _closeFinImportModal(){ var m=document.getElementById('FIN-IMPORT-MODAL'); if(m) m.style.display='none'; }
function _openFinWideTable(){ var m=document.getElementById('FIN-WIDE-TABLE-MODAL'); if(m) m.style.display='flex'; }
function _closeFinWideTable(){ var m=document.getElementById('FIN-WIDE-TABLE-MODAL'); if(m) m.style.display='none'; }
function _finToggleAllIncomeRows(master){
  var checked=!!(master&&master.checked);
  document.querySelectorAll('.fin-income-row-check').forEach(function(cb){ cb.checked=checked; });
}
function _finDeleteSelectedIncome(){
  var picked={};
  document.querySelectorAll('.fin-income-row-check:checked').forEach(function(cb){
    var idx=parseInt(cb.getAttribute('data-idx'),10);
    if(!isNaN(idx)) picked[idx]=1;
  });
  var ids=Object.keys(picked).map(function(x){ return parseInt(x,10); }).filter(function(x){ return !isNaN(x); }).sort(function(a,b){ return b-a; });
  if(!ids.length){ toast('Pilih data yang ingin dihapus dulu','warn'); return; }
  confirmDelete('Hapus <b>'+ids.length+' data</b> pendapatan marketplace yang dipilih?',function(){
    ids.forEach(function(idx){ if(idx>=0&&idx<_finIncome.length) _finIncome.splice(idx,1); });
    _saveFin(); toast(ids.length+' data berhasil dihapus','success'); _renderFinance('income');
  });
}
function _finDeleteIncome(idx){
  if(idx<0||idx>=_finIncome.length) return;
  var item=_finIncome[idx]||{};
  confirmDelete('Hapus data pendapatan <b>'+(esc(item.toko||item.sumber||item.marketplace||'-'))+'</b>?',function(){
    _finIncome.splice(idx,1); _saveFin(); toast('Data pendapatan dihapus','success'); _renderFinance('income');
  });
}
function _finDeleteImportSession(sessionId){
  sessionId=String(sessionId||'').trim();
  if(!sessionId){ toast('Sesi upload tidak ditemukan','warn'); return; }
  var matches=_finIncome.map(function(r,idx){ return {idx:idx,row:r||{}}; }).filter(function(x){
    return String(x.row.importSessionId||'').trim()===sessionId;
  });
  if(!matches.length){ toast('Tidak ada data sesi upload yang cocok','warn'); return; }
  var label=matches[0].row.importSessionLabel||sessionId;
  confirmDelete('Hapus <b>'+matches.length+' data import</b> dari sesi <b>'+esc(label)+'</b>?',function(){
    matches.sort(function(a,b){ return b.idx-a.idx; }).forEach(function(x){ _finIncome.splice(x.idx,1); });
    _saveFin();
    toast('Sesi upload berhasil dihapus: '+matches.length+' baris','success');
    _renderFinance('income');
  });
}
function _guessMarketplaceByStore(name){
  var s=String(name||'').toLowerCase();
  if(s.indexOf('shopee')>=0) return 'Shopee';
  if(s.indexOf('tiktok')>=0) return 'Tiktok';
  if(s.indexOf('laz')>=0) return 'Lazada';
  return '';
}
function _finIsImportSummaryRow(row, toko){
  var norm=String(toko||'').trim().toLowerCase();
  if(!norm || norm==='--' || norm==='total' || norm==='grand total' || norm==='subtotal') return true;
  var statVals=[
    _num(_findHeaderValue(row,['Pemasukan Toko'])),
    _num(_findHeaderValue(row,['Modal Produk'])),
    _num(_findHeaderValue(row,['Keuntungan/Kerugian'])),
    _num(_findHeaderValue(row,['Dana Penjualan Produk'])),
    _num(_findHeaderValue(row,['Persentase Keuntungan']))
  ];
  var hasStats=statVals.some(function(v){ return !!v; });
  return norm.indexOf('ringkasan')>=0 || norm.indexOf('summary')>=0 || (norm.indexOf('bigseller')>=0 && hasStats);
}
function _findHeaderValue(row, names){
  var normalize=function(v){
    return String(v||'').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'');
  };
  for(var i=0;i<names.length;i++){
    if(Object.prototype.hasOwnProperty.call(row,names[i])) return row[names[i]];
  }
  var rowKeys=Object.keys(row||{});
  if(!rowKeys.length) return '';
  for(var j=0;j<names.length;j++){
    var target=normalize(names[j]);
    for(var k=0;k<rowKeys.length;k++){
      if(normalize(rowKeys[k])===target) return row[rowKeys[k]];
    }
  }
  return '';
}
function _finEnsureXLSX(done){
  if(window.XLSX){ done(true); return; }
  if(window._finXlsxLoading){
    setTimeout(function(){ _finEnsureXLSX(done); }, 400);
    return;
  }
  if(typeof _toolsDescEnsureXLSX==='function'){
    _toolsDescEnsureXLSX(done);
    return;
  }
  window._finXlsxLoading=true;
  var js=document.createElement('script');
  js.src='https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
  js.onload=function(){ window._finXlsxLoading=false; done(true); };
  js.onerror=function(){ window._finXlsxLoading=false; done(false); };
  document.head.appendChild(js);
}
function _xlsxSheetToRowsByHeaderIndex(ws, headerRowIndex){
  if(!window.XLSX || !ws) return [];
  var aoa=window.XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false});
  if(!aoa || !aoa.length) return [];
  var idx=Math.max(0, Number(headerRowIndex)||0);
  if(!aoa[idx] || !aoa[idx].length){
    idx=aoa.findIndex(function(r){
      return Array.isArray(r) && r.some(function(cell){ return String(cell||'').trim(); });
    });
    if(idx<0) return [];
  }
  var headers=(aoa[idx]||[]).map(function(h, colIdx){
    var text=String(h||'').trim();
    return text || ('column_'+(colIdx+1));
  });
  var rows=[];
  for(var r=idx+1;r<aoa.length;r++){
    var cols=aoa[r]||[];
    var hasValue=cols.some(function(cell){ return String(cell||'').trim(); });
    if(!hasValue) continue;
    var obj={};
    headers.forEach(function(h,colIdx){ obj[h]=String(cols[colIdx]||'').trim(); });
    rows.push(obj);
  }
  return rows;
}
function _csvToRows(text){
  var raw=String(text||'').replace(/\r/g,'').trim();
  if(!raw) return [];
  var lines=raw.split('\n').filter(function(x){return x.trim();});
  if(!lines.length) return [];
  var sep=',';
  if(lines[0].indexOf('\t')>=0) sep='\t';
  else if(lines[0].split(';').length>lines[0].split(',').length) sep=';';
  var parse=function(line){
    if(sep==='\t') return line.split('\t');
    var out=[],cur='',q=false;
    for(var i=0;i<line.length;i++){
      var ch=line[i];
      if(ch==='"'){ if(q&&line[i+1]==='"'){ cur+='"'; i++; } else q=!q; }
      else if(ch===sep && !q){ out.push(cur); cur=''; }
      else cur+=ch;
    }
    out.push(cur);
    return out;
  };
  var headers=parse(lines[0]).map(function(h){return String(h||'').trim();});
  return lines.slice(1).map(function(line){
    var cols=parse(line), obj={};
    headers.forEach(function(h,idx){ obj[h]=String(cols[idx]||'').trim(); });
    return obj;
  });
}
function _finImportMarketplace(){
  var from=((document.getElementById('FIN-IMP-FROM')||{}).value||'').trim();
  var to=((document.getElementById('FIN-IMP-TO')||{}).value||'').trim();
  if(!from||!to){ toast('Isi periode tanggal import dulu','error'); return; }
  _finImportPeriod={from:from,to:to};
  var startPicker=function(){
    var inp=document.createElement('input'); inp.type='file'; inp.accept='.csv,.txt,.xls,.xlsx';
    inp.onchange=function(e){
      var file=(e.target.files||[])[0]; if(!file) return;
      var name=(file.name||'').toLowerCase();
      var handleRows=function(list){
      if(!list.length){ toast('Data file kosong atau header tidak terbaca','error'); return; }
      var imported=[];
      var sessionTs=Date.now();
      var sessionId='finimp_'+sessionTs;
      var sessionLabel='Import '+(_finImportPeriod.from||'-')+' s/d '+(_finImportPeriod.to||'-')+' • '+new Date(sessionTs).toLocaleString('id-ID');
      list.forEach(function(row){
        var toko=_findHeaderValue(row,['Nama Panggilan Toko BigSeller','Nama Panggilan Toko','Nama Toko']);
        if(_finIsImportSummaryRow(row,toko)) return;
        var subsidiDiskon=_num(_findHeaderValue(row,['Subsidi untuk Diskon & Promo','Subsidi Marketplace']));
        var rec={
            id:'fininc_'+Date.now()+'_'+imported.length,
            tanggal:_finImportPeriod.to||_todayYMD(),
            periodeDari:_finImportPeriod.from||'',
          periodeSampai:_finImportPeriod.to||'',
          inputMethod:'import',
          importSessionId:sessionId,
          importSessionLabel:sessionLabel,
          marketplace:_guessMarketplaceByStore(toko),
          sumber:_guessMarketplaceByStore(toko),
          toko:toko,
            penandaan:'Import BigSeller',
            catatan:'Import Excel BigSeller',
            danaPenjualanProduk:_num(_findHeaderValue(row,['Dana Penjualan Produk'])),
            subsidiMarketplace:subsidiDiskon,
            pemasukanTokoSource:_findHeaderValue(row,['Pemasukan Toko']),
            keuntunganKerugianSource:_findHeaderValue(row,['Keuntungan/Kerugian']),
            persentaseKeuntunganSource:_findHeaderValue(row,['Persentase Keuntungan']),
            modalProduk:_num(_findHeaderValue(row,['Modal Produk'])),
            biayaAdministrasi:_num(_findHeaderValue(row,['Biaya Administrasi'])),
            biayaTransaksiPenjual:_num(_findHeaderValue(row,['Biaya Transaksi Penjual'])),
            biayaLayanan:_num(_findHeaderValue(row,['Biaya Layanan'])),
            ongkosKirimDibayarPenjual:_num(_findHeaderValue(row,['Ongkos Kirim Dibayar Oleh Penjual'])),
            biayaPromosi:_num(_findHeaderValue(row,['Biaya Promosi'])),
            pengembalianDana:_num(_findHeaderValue(row,['Jumlah Pengembalian Pembeli','Pengembalian Dana'])),
            biayaPenyesuaianToko:_num(_findHeaderValue(row,['Biaya Penyesuaian Toko'])),
            biayaMarketplaceLainnya:_num(_findHeaderValue(row,['Biaya Marketplace Lainnya'])),
            bahanPengemasan:_num(_findHeaderValue(row,['Bahan Pengemasan'])),
            iklan:_num(_findHeaderValue(row,['Iklan'])),
            sewa:_num(_findHeaderValue(row,['Sewa'])),
            lainnya:_num(_findHeaderValue(row,['Lainnya'])),
            ts:new Date().toISOString()
          };
          var calc=_finIncomeMetrics(rec);
          rec.nominal=calc.pemasukanToko;
          rec.pemasukanToko=calc.pemasukanToko;
          rec.keuntunganKerugian=calc.keuntunganKerugian;
          rec.persentaseKeuntungan=calc.persentaseKeuntungan;
          imported.push(rec);
        });
        if(!imported.length){ toast('Header toko tidak ditemukan pada file import','error'); return; }
        _finIncome=_finIncome.concat(imported); _saveFin(); _closeFinImportModal(); toast('Import berhasil: '+imported.length+' baris','success',4000); _renderFinance('income');
      };
      if(window.XLSX && (name.slice(-5)==='.xlsx'||name.slice(-4)==='.xls')){
        var fr1=new FileReader();
        fr1.onload=function(ev){
          try{
            var wb=window.XLSX.read(ev.target.result,{type:'array',cellText:true,cellDates:true});
            var ws=wb.Sheets[wb.SheetNames[0]];
            handleRows(_xlsxSheetToRowsByHeaderIndex(ws,1));
          }catch(err){ toast('Gagal membaca file Excel','error'); }
        };
        fr1.readAsArrayBuffer(file);
      }else{
        var fr2=new FileReader();
        fr2.onload=function(ev){ handleRows(_csvToRows(ev.target.result||'')); };
        fr2.readAsText(file);
      }
    };
    inp.click();
  };
  _finEnsureXLSX(function(){ startPicker(); });
}

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
  var monthKey=_todayYMD().slice(0,7);
  var activeEmp=employees.filter(function(e){ return e.statusAktif!==false; }).length;
  var avgEval = evalHistory.length ? (evalHistory.reduce(function(t,r){return t+(parseFloat(r.fs)||0);},0)/evalHistory.length) : 0;
  var evalThisMonth=evalHistory.filter(function(r){ return String(r.submittedAt||r.ts||'').slice(0,7)===monthKey; });
  var payrollThisMonthRows=payHistory.filter(function(r){ return String(r.submittedAt||r.ts||'').slice(0,7)===monthKey; });
  var payrollThisMonth = payrollThisMonthRows.reduce(function(t,r){ return t+_num(r.bersih); },0);
  var sopCount=(typeof _hrSops!=='undefined'&&Array.isArray(_hrSops)?_hrSops.length:0);
  var disciplineRows=((_hrControlData&&_hrControlData.disciplineLog)||[]).slice().sort(function(a,b){ return String(b.ts||'').localeCompare(String(a.ts||'')); });
  var warnCount=disciplineRows.filter(function(r){ return ['Evaluasi','SP1','SP2','PHK Review','PHK'].indexOf(String(r.stage||''))>=0; }).length;
  var topAttention=disciplineRows.filter(function(r){ return ['SP1','SP2','PHK Review','PHK'].indexOf(String(r.stage||''))>=0; }).slice(0,4);
  var recent=(evalHistory.concat(payHistory.map(function(p){return {submittedAt:p.submittedAt||p.ts,info:p.info,type:'payroll',bersih:p.bersih};}))).sort(function(a,b){return String(b.submittedAt||'').localeCompare(String(a.submittedAt||''));}).slice(0,6);
  var hd='';
  hd+='<div class="card" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(240,197,106,.08),rgba(143,208,255,.04))"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><div style="font-size:16px;font-weight:800;color:#F0C56A">Desk HR</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Pantauan singkat evaluasi, payroll, SOP, dan control HR yang perlu diperhatikan.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="border:1px solid rgba(240,197,106,.3);background:rgba(240,197,106,.07);color:#F0C56A">'+esc(_finMonthLabelShort? _finMonthLabelShort(monthKey):monthKey)+'</span><span class="chip" style="border:1px solid rgba(143,208,255,.25);background:rgba(143,208,255,.07);color:#8FD0FF">'+activeEmp+' aktif</span></div></div></div>';
  hd+='<div style="display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px">';
  [['Karyawan Aktif',activeEmp,'#8FD0FF'],['Evaluasi Bulan Ini',evalThisMonth.length,'#A7F3B6'],['Payroll Bulan Ini','Rp '+fmt(payrollThisMonth),'#D796FF'],['Alert Control',warnCount,'#FFB76B']].forEach(function(card){
    hd+='<div class="card" style="margin-bottom:0;background:var(--bg3);padding:12px"><div style="font-size:10px;font-weight:700;color:'+card[2]+';text-transform:uppercase;letter-spacing:.05em">'+card[0]+'</div><div style="font-size:22px;font-weight:800;color:var(--tx);margin-top:6px">'+card[1]+'</div></div>';
  });
  hd+='</div>';
  hd+='<div class="card" style="margin-top:12px;padding:10px 12px;display:flex;gap:6px;flex-wrap:wrap">';
  hd+='<button class="btnp" onclick="_renderHR(\'eval\')" style="background:#1565C0">Penilaian</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'payroll\')" style="background:#00838F">Payroll</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'karyawan\')" style="background:#6A1B9A">Karyawan</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'statistik\')" style="background:#2E7D32">Statistik</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'control\')" style="background:#8C5E16">KPI &amp; Control</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'sop\')" style="background:#C27C2C">SOP &amp; Guides</button>';
  hd+='<button class="btnp" onclick="_renderHR(\'riw\')" style="background:#546E7A">Riwayat</button>';
  hd+='</div>';
  hd+='<div style="display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:12px;margin-top:12px">';
  hd+='<div class="card" style="padding:12px;margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:13px;font-weight:800;color:var(--tx)">Pantauan Inti HR</span><button class="btns" onclick="_renderHR(\'control\')" style="width:auto">Buka Control</button></div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:8px">'+[['Avg Nilai',avgEval>0?avgEval.toFixed(2):'-','#00838F'],['Dokumen SOP',sopCount,'#C27C2C'],['Riwayat Evaluasi',evalHistory.length,'#1565C0'],['Slip Payroll',payHistory.length,'#6A1B9A']].map(function(card){ return '<div style=\"background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:10px\"><div style=\"font-size:10px;color:'+card[2]+';text-transform:uppercase;font-weight:700\">'+card[0]+'</div><div style=\"font-size:18px;font-weight:800;color:var(--tx);margin-top:4px\">'+card[1]+'</div></div>'; }).join('')+'</div><div style="overflow-x:auto"><table class="tbl" style="min-width:620px"><thead><tr><th>Tipe</th><th>Nama</th><th>Waktu</th></tr></thead><tbody>';
  recent.forEach(function(r){hd+='<tr><td>'+(r.type==='payroll'?'Payroll':'Penilaian')+'</td><td style="font-weight:700">'+esc((r.info&&r.info.nama)||'-')+'</td><td style="white-space:nowrap;color:var(--tx2)">'+fmtD(r.submittedAt)+'</td></tr>';});
  if(!recent.length)hd+='<tr><td colspan="3" style="text-align:center;color:var(--tx3);padding:18px">Belum ada data</td></tr>';
  hd+='</tbody></table></div></div>';
  hd+='<div style="display:flex;flex-direction:column;gap:12px">';
  hd+='<div class="card" style="padding:12px;margin-bottom:0"><div style="font-size:13px;font-weight:800;color:var(--tx);margin-bottom:8px">Ringkasan Bulan Aktif</div><div style="font-size:11px;color:var(--tx2);line-height:1.75">Evaluasi masuk: <b style="color:var(--tx)">'+evalThisMonth.length+'</b><br>Payroll bulan ini: <b style="color:var(--tx)">Rp '+fmt(payrollThisMonth)+'</b><br>Alert control: <b style="color:'+(warnCount>0?'#FFB76B':'#A7F3B6')+'">'+warnCount+'</b></div></div>';
  hd+='<div class="card" style="padding:12px;margin-bottom:0"><div style="font-size:13px;font-weight:800;color:var(--tx);margin-bottom:8px">Perlu Perhatian</div>';
  topAttention.slice(0,4).forEach(function(r){ hd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-left:2px solid #FFB76B;border-radius:8px;padding:9px 10px;margin-bottom:8px"><div style="font-size:12px;font-weight:800;color:var(--tx)">'+esc(r.name||'-')+'</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">'+esc(r.stage||'-')+' • '+esc(r.decision||'-')+'</div></div>'; });
  if(!topAttention.length) hd+='<div style="font-size:11px;color:var(--tx3);text-align:center;padding:12px 10px">Belum ada escalation HR aktif.</div>';
  hd+='</div></div></div>';
  content.innerHTML=hd;
}

var _hrControlData = (function(){
  try{
    var data=JSON.parse(localStorage.getItem('ajw_hr_control')||'null');
    return data&&typeof data==='object'?data:{disciplineLog:[],weeklyOwnerNote:'',weeklyFollowUp:'',weeklyRewardNote:'',templates:{}};
  }catch(e){ return {disciplineLog:[],weeklyOwnerNote:'',weeklyFollowUp:'',weeklyRewardNote:'',templates:{}}; }
})();
var _hrControlUI={emp:'all',letterEmp:'',letterType:'Evaluasi'};
var _hrControlCharts={dist:null,trend:null};
function _saveHRControl(){
  sv('ajw_hr_control',_hrControlData||{disciplineLog:[]});
}
