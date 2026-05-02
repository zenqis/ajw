function _renderTools(sub){
  sub=sub||window._toolsSub||'dash'; window._toolsSub=sub;
  var v=document.getElementById('V-tools'); if(!v) return;
  if(!document.getElementById('TOOLS-SHELL')){
    v.innerHTML='<div id="TOOLS-SHELL"></div><div id="TOOLS-CONTENT"></div>';
  }
  var shell=document.getElementById('TOOLS-SHELL');
  var content=document.getElementById('TOOLS-CONTENT');
  if(!shell||!content) return;
  var h='';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Dashboard'],['materials','Belanja Material'],['pick','Picking List'],['rumus','Rumus Tali GF'],['refund','Pengembalian Dana'],['complaint','Komplain'],['request','Request'],['desc','Revisi Deskripsi'],['blast','Pesan Blast'],['blastmkt','Blast Marketing']].forEach(function(s){
    h+='<button class="'+(sub===s[0]?'btnp':'btns')+'" onclick="_renderTools(\''+s[0]+'\')" style="padding:8px 12px">'+s[1]+'</button>';
  });
  h+='</div></div>';
  shell.innerHTML=h;
  if(sub==='agent' || sub==='automation'){
    if(typeof _navTo==='function') _navTo('ai');
    else if(typeof _renderAI==='function') _renderAI(sub);
    return;
  }
  if(sub==='dash'){
    content.innerHTML=_renderToolsDashboard();
    return;
  }
  if(sub==='pick'){
    var pickCfg=_toolsPickingCfg();
    var pickRows=_toolPickingRows||[];
    var pickProcessed=_toolPickingProcessed||{bundling:[],satuan:[],processedAt:''};
    var pickProg=_toolPickingProgress||{active:false,percent:0,title:'',detail:'',tone:'info',done:false};
    var pickProgColors=_toolsPickingProgressColors(pickProg.tone);
    var pickWatch=_toolsPickingWatchState();
    var pickWatchStatusLabel=pickWatch.lastStatus==='success'?'SYNC OK':(pickWatch.lastStatus==='error'?'ERROR':'IDLE');
    var pickWatchStatusTone=pickWatch.lastStatus==='success'
      ? 'background:rgba(167,243,182,.12);color:#A7F3B6;border:1px solid rgba(167,243,182,.26)'
      : (pickWatch.lastStatus==='error'
        ? 'background:rgba(255,107,107,.12);color:#ff8f8f;border:1px solid rgba(255,107,107,.26)'
        : 'background:rgba(143,208,255,.10);color:#8FD0FF;border:1px solid rgba(143,208,255,.22)');
    var bundlingHeaders=(pickWatch.bundlingHeaders&&pickWatch.bundlingHeaders.length)?pickWatch.bundlingHeaders:[];
    var satuanHeaders=(pickWatch.satuanHeaders&&pickWatch.satuanHeaders.length)?pickWatch.satuanHeaders:[];
    var bundlingDisplay=(pickWatch.bundlingDisplayRows&&pickWatch.bundlingDisplayRows.length)
      ? pickWatch.bundlingDisplayRows
      : (pickWatch.bundlingRows||[]).map(function(r,idx){ return {status:'stable',data:r||{},index:idx}; });
    var satuanDisplay=(pickWatch.satuanDisplayRows&&pickWatch.satuanDisplayRows.length)
      ? pickWatch.satuanDisplayRows
      : (pickWatch.satuanRows||[]).map(function(r,idx){ return {status:'stable',data:r||{},index:idx}; });
    function _pickWatcherTable(label, headers, rows, stats){
      var html='';
      html+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)">';
      html+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px">';
      html+='<div><div style="font-size:13px;font-weight:800;color:#fff">'+label+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Pantau isi sheet dan perubahan setiap row.</div></div>';
      html+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
      html+='<span class="chip" style="font-size:11px">Baris '+(rows||[]).length+'</span>';
      html+='<span class="chip" style="font-size:11px;color:#A7F3B6">Baru '+(stats.added||0)+'</span>';
      html+='<span class="chip" style="font-size:11px;color:#F0C56A">Berubah '+(stats.changed||0)+'</span>';
      html+='<span class="chip" style="font-size:11px;color:#ff8f8f">Hilang '+(stats.removed||0)+'</span>';
      if(stats.headerChanged) html+='<span class="chip" style="font-size:11px;color:#8FD0FF">Header Berubah</span>';
      html+='</div></div>';
      if(!(headers||[]).length){
        html+='<div class="empty-state">Belum ada data watcher untuk '+label+'. Klik <b>Refresh Watcher</b> untuk membaca Google Sheet.</div>';
      }else{
        html+='<div style="max-height:340px;overflow:auto;border:1px solid rgba(255,255,255,.06);border-radius:10px">';
        html+='<table class="tbl"><thead><tr><th style="width:92px">Status</th>';
        headers.forEach(function(h){ html+='<th>'+esc(h||'-')+'</th>'; });
        html+='</tr></thead><tbody>';
        if(!(rows||[]).length){
          html+='<tr><td colspan="'+(headers.length+1)+'" style="text-align:center;color:var(--tx2)">Belum ada baris pada sheet ini.</td></tr>';
        }else{
          (rows||[]).forEach(function(item){
            var tone=_toolsPickingWatchTone(item&&item.status||'stable');
            html+='<tr>';
            html+='<td><span style="display:inline-flex;align-items:center;justify-content:center;min-width:74px;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.08em;background:'+tone.bg+';border:1px solid '+tone.bd+';color:'+tone.fg+'">'+tone.label+'</span></td>';
            headers.forEach(function(h){
              var cell=item&&item.data?item.data[h]:'';
              html+='<td>'+esc(String(cell==null||cell===''?'-':cell))+'</td>';
            });
            html+='</tr>';
          });
        }
        html+='</tbody></table></div>';
      }
      html+='</div>';
      return html;
    }
    var pick='';
    pick+='<div class="card" style="margin-bottom:12px;background:#080808;border:1px solid rgba(255,255,255,.08)">';
    pick+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">';
    pick+='<div><div style="font-size:14px;font-weight:800;color:#fff">Picking List</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Import file Bigseller, preview data, lalu proses hasil <b>Bundling</b> dan <b>Satuan</b> langsung di AJW. Upload ke Google Sheet tetap tersedia sebagai langkah terpisah jika dibutuhkan.</div></div>';
    pick+='<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+pickRows.length+' baris siap</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(_toolPickingHistory||[]).length+' riwayat</span></div>';
    pick+='</div>';
    pick+='<div style="display:grid;grid-template-columns:1.2fr .8fr .9fr;gap:10px;margin-top:12px">';
    pick+='<div><label class="lbl">Spreadsheet URL</label><input id="TOOLS-PICK-SPREADSHEET" class="fi" value="'+escAttr(pickCfg.spreadsheetUrl||'')+'" placeholder="https://docs.google.com/..."></div>';
    pick+='<div><label class="lbl">Nama Tab Sheet</label><input id="TOOLS-PICK-SHEET" class="fi" value="'+escAttr(pickCfg.sheetName||'')+'" placeholder="Automate Bigseller Export"></div>';
    pick+='<div><label class="lbl">URL Upload Sheet (Opsional)</label><input id="TOOLS-PICK-UPLOADURL" class="fi" value="'+escAttr(pickCfg.uploadUrl||'')+'" placeholder="https://script.google.com/macros/.../exec"></div>';
    pick+='</div>';
    pick+='<div style="font-size:11px;color:var(--tx2);margin-top:8px">Catatan: tombol <b>Proses Lokal Bundling &amp; Satuan</b> tidak memakai URL trigger. URL hanya dipakai bila Anda ingin mengirim data mentah ke Google Sheet.</div>';
    pick+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btns" onclick="_toolsPickingSaveConfig()">Simpan Config</button><button class="btns" onclick="window.open(\''+escAttr(pickCfg.spreadsheetUrl||'')+'\',\'_blank\')">Buka Spreadsheet</button><button class="btnsm" onclick="_toolsPickingDownloadTemplate()">Template Import</button><button class="btnp" onclick="_toolsPickingImportFile()">Import Excel / CSV</button><button class="btnp" onclick="_toolsPickingUpload()">'+(_toolPickingUploading?'Mengupload...':'Upload ke Sheet')+'</button><button id="trigger-pickinglist-btn" class="btnp" onclick="_toolsPickingTriggerFromWeb(event)">'+(_toolPickingUploading?'Memproses...':'Trigger Picking List')+'</button><button class="btns" onclick="_toolsPickingRunTrigger()">Proses Lokal Bundling &amp; Satuan</button><button class="btnsm" onclick="_toolsPickingExportProcessed()">Export Hasil</button><button class="btnsm" onclick="_toolsPickingClearRows()">Kosongkan</button></div>';
    pick+='</div>';
    if(pickProg.active || pickProg.done){
      pick+='<div class="card" style="margin-bottom:12px;background:#070707;border:1px solid '+pickProgColors.line+'"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:'+pickProgColors.fg+'">'+esc(pickProg.title||'Progress Picking List')+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+esc(pickProg.detail||'-')+'</div></div><div style="font-size:12px;font-weight:800;color:'+pickProgColors.fg+'">'+fmt(Math.round(_num(pickProg.percent)||0))+'%</div></div><div style="margin-top:10px;height:10px;border-radius:999px;background:#050505;border:1px solid rgba(255,255,255,.06);overflow:hidden"><div style="height:100%;width:'+fmt(Math.round(_num(pickProg.percent)||0))+'%;background:'+pickProgColors.fg+';box-shadow:0 0 12px '+pickProgColors.line+'"></div></div>'+(pickProg.done?'<div style="margin-top:8px;font-size:11px;color:'+pickProgColors.fg+'">'+(pickProg.tone==='success'?'Konfirmasi: proses selesai dengan sukses.':(pickProg.tone==='warn'?'Konfirmasi: proses lokal selesai, tetapi ada langkah yang tidak dijalankan.':'Konfirmasi: proses selesai dengan kendala, cek riwayat di bawah.'))+'</div>':'')+'</div>';
    }
    pick+='<div class="card" style="margin-bottom:12px;background:#070707;border:1px solid rgba(255,255,255,.08)">';
    pick+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:10px">';
    pick+='<div><div style="font-size:13px;font-weight:800;color:#fff">Watcher Google Sheet</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Pantau perubahan row/kolom pada tab <b>Bundling</b> dan <b>Satuan</b>. Jika ada perubahan di Google Sheet, AJW akan menandainya di tabel.</div></div>';
    pick+='<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="font-size:11px">Last Sync: '+(pickWatch.lastRun?esc(fmtD(pickWatch.lastRun)):'-')+'</span><span class="chip" style="font-size:11px;'+pickWatchStatusTone+'">'+pickWatchStatusLabel+'</span></div>';
    pick+='</div>';
    pick+='<div style="display:grid;grid-template-columns:1.15fr 1.15fr .42fr .42fr;gap:10px;align-items:end">';
    pick+='<div><label class="lbl">URL Bundling</label><input id="TOOLS-PICK-BUNDLING-URL" class="fi" value="'+escAttr(pickCfg.bundlingViewUrl||'')+'" placeholder="https://docs.google.com/...gid=915337788"></div>';
    pick+='<div><label class="lbl">URL Satuan</label><input id="TOOLS-PICK-SATUAN-URL" class="fi" value="'+escAttr(pickCfg.satuanViewUrl||'')+'" placeholder="https://docs.google.com/...gid=1985667532"></div>';
    pick+='<div><label class="lbl">Interval (detik)</label><input id="TOOLS-PICK-WATCH-SEC" class="fi" type="number" min="15" step="5" value="'+escAttr(String(Math.max(15,_num(pickWatch.intervalSec)||60)))+'"></div>';
    pick+='<div><label class="lbl">Auto Refresh</label><div style="display:flex;align-items:center;height:32px"><label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--tx2)"><input id="TOOLS-PICK-WATCH-AUTO" type="checkbox" '+(pickWatch.auto?'checked':'')+'>Aktif</label></div></div>';
    pick+='</div>';
    pick+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btns" onclick="_toolsPickingWatchSaveSettings()">Simpan Watcher</button><button class="btnp" onclick="_toolsPickingWatchRefresh(false)">Refresh Watcher</button><button class="btns" onclick="window.open(\''+escAttr(pickCfg.bundlingViewUrl||'')+'\',\'_blank\')">Buka Bundling</button><button class="btns" onclick="window.open(\''+escAttr(pickCfg.satuanViewUrl||'')+'\',\'_blank\')">Buka Satuan</button></div>';
    if(pickWatch.lastError){
      pick+='<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.18);font-size:12px;color:#FFD6D6"><b>Watcher Error:</b> '+esc(pickWatch.lastError)+'</div>';
    }
    pick+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">';
    pick+=_pickWatcherTable('Tab Bundling',bundlingHeaders,bundlingDisplay,{added:pickWatch.bundlingNew,changed:pickWatch.bundlingChanged,removed:pickWatch.bundlingRemoved,headerChanged:pickWatch.bundlingHeaderChanged});
    pick+=_pickWatcherTable('Tab Satuan',satuanHeaders,satuanDisplay,{added:pickWatch.satuanNew,changed:pickWatch.satuanChanged,removed:pickWatch.satuanRemoved,headerChanged:pickWatch.satuanHeaderChanged});
    pick+='</div>';
    if((pickWatch.logs||[]).length){
      pick+='<div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.06);padding-top:10px"><div style="font-size:12px;font-weight:800;color:#fff;margin-bottom:6px">Log Watcher Terbaru</div><div style="display:grid;gap:6px">';
      (pickWatch.logs||[]).slice(0,6).forEach(function(log){
        var c=log.level==='error'?'#FF8F8F':(log.level==='warn'?'#F0C56A':'#9BD2FF');
        pick+='<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:8px;background:#090909;border:1px solid rgba(255,255,255,.05)"><div style="font-size:12px;color:'+c+'">'+esc(log.note||'-')+'</div><div class="muted" style="white-space:nowrap">'+esc(log.ts?fmtD(log.ts):'-')+'</div></div>';
      });
      pick+='</div></div>';
    }
    pick+='</div>';
    pick+='<div class="card" style="margin-bottom:12px;background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Preview Data Picking</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Urutan kolom disesuaikan dengan Apps Script: Nomor Pesanan, Tautan Gambar, Nama Produk, SKU, Nama Variasi, Marketplace, Jumlah.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+pickRows.length+' baris</span></div><div style="overflow:auto"><table class="tbl"><thead><tr><th>No</th><th>Nomor Pesanan</th><th>Tautan Gambar</th><th>Nama Produk</th><th>SKU</th><th>Nama Variasi</th><th>Marketplace</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>';
    if(!pickRows.length) pick+='<tr><td colspan="9" style="text-align:center;color:var(--tx2)">Belum ada data picking yang diimport.</td></tr>';
    pickRows.forEach(function(r,idx){
      pick+='<tr><td>'+(idx+1)+'</td><td style="font-weight:700">'+esc(r.nomorPesanan||'-')+'</td><td>'+(r.tautanGambar?'<a href="'+escAttr(r.tautanGambar)+'" target="_blank" rel="noreferrer" style="color:#8FD0FF">Buka Link</a>':'-')+'</td><td>'+esc(r.namaProduk||'-')+'</td><td>'+esc(r.sku||'-')+'</td><td>'+esc(r.namaVariasi||'-')+'</td><td>'+esc(r.marketplace||'-')+'</td><td>'+fmt(_num(r.jumlah)||1)+'</td><td><button class="btnsm" onclick="_toolsPickingRemoveRow(\''+escAttr(r.id)+'\')">Hapus</button></td></tr>';
    });
    pick+='</tbody></table></div></div>';
    pick+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
    pick+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Hasil Satuan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Order dengan 1 item setelah quantity diexpand dan diurutkan A-Z berdasarkan nama produk.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(pickProcessed.satuan||[]).length+' baris</span></div><div style="overflow:auto;max-height:360px"><table class="tbl"><thead><tr><th>Done</th><th>Nomor Pesanan</th><th>Link</th><th>Nama Produk</th><th>SKU</th><th>Variasi</th><th>Marketplace</th></tr></thead><tbody>';
    if(!(pickProcessed.satuan||[]).length) pick+='<tr><td colspan="7" style="text-align:center;color:var(--tx2)">Belum ada hasil satuan. Jalankan proses terlebih dahulu.</td></tr>';
    (pickProcessed.satuan||[]).forEach(function(r,idx){
      pick+='<tr style="'+(r.done?'background:rgba(167,243,182,.08)':'')+'"><td><input type="checkbox" '+(r.done?'checked':'')+' onchange="_toolsPickingToggleDone(\'satuan\','+idx+')"></td><td style="font-weight:700">'+esc(r.nomorPesanan||'-')+'</td><td>'+(r.tautanGambar?'<a href="'+escAttr(r.tautanGambar)+'" target="_blank" rel="noreferrer" style="color:#8FD0FF">Link</a>':'-')+'</td><td>'+esc(r.namaProduk||'-')+'</td><td>'+esc(r.sku||'-')+'</td><td>'+esc(r.namaVariasi||'-')+'</td><td>'+esc(r.marketplace||'-')+'</td></tr>';
    });
    pick+='</tbody></table></div></div>';
    pick+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Hasil Bundling</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Order dengan lebih dari 1 item setelah quantity diexpand, dikelompokkan per nomor pesanan.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(pickProcessed.bundling||[]).length+' order bundling</span></div><div style="display:grid;gap:10px;max-height:360px;overflow:auto">';
    if(!(pickProcessed.bundling||[]).length) pick+='<div style="padding:12px;border:1px dashed rgba(255,255,255,.12);border-radius:12px;color:var(--tx2);font-size:11px">Belum ada hasil bundling. Jalankan proses terlebih dahulu.</div>';
    (pickProcessed.bundling||[]).forEach(function(group,gidx){
      pick+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div style="font-size:12px;font-weight:800;color:#fff">'+esc(group.orderNumber||'-')+'</div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+((group.items||[]).length)+' item</span></div><div style="overflow:auto"><table class="tbl"><thead><tr><th>Done</th><th>Link</th><th>Nama Produk</th><th>SKU</th><th>Variasi</th><th>Marketplace</th></tr></thead><tbody>';
      (group.items||[]).forEach(function(r,idx){
        pick+='<tr style="'+(r.done?'background:rgba(167,243,182,.08)':'')+'"><td><input type="checkbox" '+(r.done?'checked':'')+' onchange="_toolsPickingToggleDone(\'bundling\','+idx+','+gidx+')"></td><td>'+(r.tautanGambar?'<a href="'+escAttr(r.tautanGambar)+'" target="_blank" rel="noreferrer" style="color:#8FD0FF">Link</a>':'-')+'</td><td>'+esc(r.namaProduk||'-')+'</td><td>'+esc(r.sku||'-')+'</td><td>'+esc(r.namaVariasi||'-')+'</td><td>'+esc(r.marketplace||'-')+'</td></tr>';
      });
      pick+='</tbody></table></div></div>';
    });
    pick+='</div></div>';
    pick+='</div>';
    pick+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Riwayat Picking List</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Mencatat import, upload ke sheet, dan proses lokal bundling/satuan terbaru.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(_toolPickingHistory||[]).length+' event</span></div><div style="display:grid;gap:8px">'+((_toolPickingHistory||[]).length?(_toolPickingHistory||[]).slice(0,12).map(function(hh){ return '<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div style="font-size:12px;font-weight:800;color:#fff">'+esc((hh.type||'aksi').toUpperCase())+' • '+esc(hh.status||'-')+'</div><div style="font-size:11px;color:var(--tx2)">'+esc(fmtD(hh.ts||hh.createdAt||''))+'</div></div><div style="font-size:11px;color:var(--tx2);margin-top:6px">'+esc(hh.note||'-')+(hh.rowCount?(' • '+fmt(hh.rowCount)+' baris'):'')+'</div>'+(hh.response?'<div style="margin-top:8px;padding:8px 10px;border-radius:10px;background:#030303;border:1px solid rgba(255,255,255,.06);font-size:11px;color:#D7E1EA;white-space:pre-wrap;word-break:break-word">'+esc(hh.response)+'</div>':'')+'</div>'; }).join(''):'<div style="padding:12px;border:1px dashed rgba(255,255,255,.12);border-radius:12px;color:var(--tx2);font-size:11px">Belum ada riwayat Picking List.</div>')+'</div></div>';
    content.innerHTML=pick;
    return;
  }
  if(sub==='products'){
    var ps=_toolsProductSummary();
    var series=_toolsProductMonthlySeries();
    var ui=_toolsProductUi();
    var changes=_toolsProductModalChanges();
    var cat1Opts=_toolsProductCategoryOptions(1);
    var cat2Opts=_toolsProductCategoryOptions(2);
    var masterCount=_toolsProductMasterRows().length;
    var prod='';
    prod+='<div class="card" style="margin-bottom:12px;background:#080808;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Rincian Produk</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Database SKU produk untuk memantau stok, modal, kategori, dan rata-rata penjualan harian. Template acuan akan menjadi basis baku, sedangkan import regular hanya memperbarui SKU yang sudah ada di template tersebut.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsProductDownloadTemplate()">Template Import</button><button class="btns" onclick="_toolsProductImportMasterFile()">Upload Template Acuan</button><button class="btns" onclick="_toolsProductImportFile()">Import Update</button>'+(ui.edit?'<button class="btnp" onclick="_toolsProductSaveTableEdits()">Simpan Edit</button><button class="btnsm" onclick="_toolsProductToggleEditMode(false)">Batal</button>':'<button class="btnsm" onclick="_toolsProductToggleEditMode(true)">Mode Edit</button>')+'<button class="btnsm" onclick="confirmDelete(\'Hapus seluruh database rincian produk?\',function(){_toolProductRows=[];_toolsSave();_renderTools(\'products\')})">Hapus Semua</button></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Template acuan: '+masterCount+' SKU</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Baris tampil: '+ps.rows.length+'</span></div></div>';
    prod+='<div style="display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:10px;margin-bottom:12px">';
    [['Total Stok',fmt(ps.totalStock),'Akumulasi stok aktif','#8FD0FF'],['Total Modal',_toolsMoney(ps.totalModal),'Modal x total stok','#F0C56A'],['Rata-rata Penjualan Harian',fmt(Math.round(ps.avgDaily*100)/100),'Rerata estimasi per produk','#A7F3B6'],['Kategori Terlaris',esc(ps.topCategory||'-'),fmt(Math.round(ps.topCategoryDaily*100)/100)+' estimasi / hari','#D7E1EA']].forEach(function(card){
      prod+='<div class="card" style="background:#050505;border:1px solid rgba(255,255,255,.08);padding:12px 14px"><div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62)">'+card[0]+'</div><div style="font-size:24px;font-weight:900;color:'+card[3]+';margin-top:6px;word-break:break-word">'+card[1]+'</div><div style="font-size:11px;color:var(--tx2);margin-top:5px">'+card[2]+'</div></div>';
    });
    prod+='</div>';
    prod+='<div class="card" style="margin-bottom:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Trend Total Modal Stok</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Membandingkan total modal stok berdasarkan tanggal sesi upload template acuan dan import update berikutnya.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(series.length?series.length:0)+' titik update</span></div><div style="height:220px;margin-top:10px"><canvas id="TOOLS-PRODUCT-CHART"></canvas></div></div>';
    prod+='<div class="card" style="margin-bottom:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Perubahan Modal Produk</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Riwayat perubahan modal per SKU dari import atau edit manual terbaru.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+changes.length+' perubahan</span></div><div style="margin-top:10px;display:grid;gap:8px">'+(changes.length?changes.slice(0,8).map(function(ch){ return '<div style="display:grid;grid-template-columns:minmax(180px,1.2fr) repeat(3,minmax(110px,.7fr)) minmax(150px,.8fr);gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:#070707;border:1px solid rgba(255,255,255,.06)"><div><div style="font-size:12px;font-weight:800;color:#fff">'+esc(ch.sku||'-')+'</div><div style="font-size:11px;color:var(--tx2);margin-top:2px">'+esc(ch.title||'-')+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Modal Lama</div><div style="font-size:12px;font-weight:700;color:#D7E1EA">'+_toolsMoney(ch.from)+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Modal Baru</div><div style="font-size:12px;font-weight:700;color:#fff">'+_toolsMoney(ch.to)+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Delta</div><div style="font-size:12px;font-weight:800;color:'+(ch.delta>=0?'#A7F3B6':'#FF8A80')+'">'+(ch.delta>=0?'+':'-')+_toolsMoney(Math.abs(ch.delta))+' ('+(ch.pct>=0?'+':'')+fmt(Math.round(ch.pct*100)/100)+'%)</div></div><div style="font-size:11px;color:var(--tx2)">'+esc(_toolsProductFormatDate(ch.updatedAt))+'</div></div>'; }).join(''):'<div style="padding:12px;border:1px dashed rgba(255,255,255,.12);border-radius:12px;color:var(--tx2);font-size:11px">Belum ada perubahan modal yang tercatat. Gunakan import update atau edit manual untuk mencatat histori modal.</div>')+'</div></div>';
    prod+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Daftar Produk Aktif</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Snapshot terbaru per SKU dari template acuan dan histori pembaruan yang pernah Anda masukkan.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+ps.rows.length+' SKU aktif</span></div><div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px;margin-bottom:10px"><div><label class="lbl">Sort</label><select class="fi" onchange="_toolsProductSetSort(this.value)"><option value="updated_desc"'+(ui.sort==='updated_desc'?' selected':'')+'>Terbaru Diperbarui</option><option value="sku_asc"'+(ui.sort==='sku_asc'?' selected':'')+'>SKU A-Z</option><option value="title_asc"'+(ui.sort==='title_asc'?' selected':'')+'>Nama Produk A-Z</option><option value="stock_desc"'+(ui.sort==='stock_desc'?' selected':'')+'>Stok Tertinggi</option><option value="modal_desc"'+(ui.sort==='modal_desc'?' selected':'')+'>Modal Tertinggi</option><option value="daily_desc"'+(ui.sort==='daily_desc'?' selected':'')+'>Penjualan Harian Tertinggi</option></select></div><div><label class="lbl">Kategori 1</label><select class="fi" onchange="_toolsProductSetCategory(1,this.value)"><option value="all"'+(ui.cat1==='all'?' selected':'')+'>Semua Kategori 1</option><option value="__NONE__"'+(ui.cat1==='__NONE__'?' selected':'')+'>Tanpa Kategori</option>'+cat1Opts.filter(function(v){ return v!=='__NONE__'; }).map(function(v){ return '<option value="'+escAttr(v)+'"'+(ui.cat1===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Kategori 2</label><select class="fi" onchange="_toolsProductSetCategory(2,this.value)"><option value="all"'+(ui.cat2==='all'?' selected':'')+'>Semua Kategori 2</option><option value="__NONE__"'+(ui.cat2==='__NONE__'?' selected':'')+'>Tanpa Kategori</option>'+cat2Opts.filter(function(v){ return v!=='__NONE__'; }).map(function(v){ return '<option value="'+escAttr(v)+'"'+(ui.cat2===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('')+'</select></div><div style="display:flex;align-items:end;justify-content:flex-end"><button class="btnsm" onclick="_toolsProductToggleEditMode('+(ui.edit?'false':'true')+')">'+(ui.edit?'Batalkan Edit':'Edit Tabel')+'</button></div></div><div style="overflow:auto"><table class="tbl"><thead><tr><th>Tautan Gambar</th><th>Nomor SKU</th><th>Judul</th><th>Total Stok</th><th>Perkiraan Penjualan Harian</th><th>Rata-Rata Modal Bobot</th><th>Kategori Pertama</th><th>Kategori Kedua</th><th>Terakhir Diperbarui</th></tr></thead><tbody>';
    if(!ps.rows.length) prod+='<tr><td colspan="9" style="text-align:center;color:var(--tx2)">'+(masterCount?'Belum ada data sesuai filter kategori atau sort yang dipilih.':'Belum ada data produk. Upload template acuan dulu untuk mulai membangun database produk.')+'</td></tr>';
    ps.rows.forEach(function(r){
      prod+='<tr><td>'+(ui.edit?'<input id="TP-EDIT-IMG-'+r.id+'" class="fi" value="'+escAttr(r.imageUrl||'')+'" placeholder="https://...">':(r.imageUrl?'<button class="btnsm" onclick="_toolsProductOpenImage(\''+String(r.imageUrl||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\',\''+String(r.title||r.sku||'Produk').replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">Buka</button>':'-'))+'</td><td style="font-weight:700">'+(ui.edit?'<input id="TP-EDIT-SKU-'+r.id+'" class="fi" value="'+escAttr(r.sku||'')+'" placeholder="SKU">':esc(r.sku||'-'))+'</td><td style="min-width:260px">'+(ui.edit?'<input id="TP-EDIT-TITLE-'+r.id+'" class="fi" value="'+escAttr(r.title||'')+'" placeholder="Nama produk">':esc(r.title||'-'))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-STOCK-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.totalStock)))+'">':fmt(r.totalStock))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-DAILY-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.dailySales)))+'">':fmt(Math.round(_num(r.dailySales)*100)/100))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-COST-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.avgCost)))+'">':_toolsMoney(r.avgCost))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-CAT1-'+r.id+'" class="fi" value="'+escAttr(r.category1||'')+'" placeholder="Kategori 1">':esc(r.category1||'-'))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-CAT2-'+r.id+'" class="fi" value="'+escAttr(r.category2||'')+'" placeholder="Kategori 2">':esc(r.category2||'-'))+'</td><td style="white-space:nowrap">'+esc(_toolsProductFormatDate(r.updatedAt||r.importedAt))+'</td></tr>';
    });
    prod+='</tbody></table></div></div>';
    content.innerHTML=prod;
    _toolsProductRenderChart();
    return;
  }
  if(sub==='agent'){
    var core=_toolsGetAgentCorePrompt();
    var snap=_ajwAgentSystemSnapshot();
    var ag='';
    ag+='<div class="card" style="margin-bottom:12px;background:#080808;border:1px solid rgba(255,255,255,.08)">';
    ag+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Agent AI Core Prompt</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Ini adalah prompt utama yang menjadi otak sistem AJW untuk modul AI di menu Tools.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnsm" onclick="document.getElementById(&quot;TOOLS-AGENT-CORE&quot;).value=_toolsGetAgentCorePrompt();toast(&quot;Prompt utama dimuat&quot;,&quot;info&quot;,2200)">Refresh</button><button class="btnp" onclick="_toolsSaveAgentCorePrompt(document.getElementById(&quot;TOOLS-AGENT-CORE&quot;).value);toast(&quot;Prompt utama Agent AI disimpan&quot;,&quot;success&quot;,2600)">Simpan Prompt Utama</button></div></div>';
    ag+='<textarea id="TOOLS-AGENT-CORE" class="fi" rows="10" style="margin-top:12px;line-height:1.55" placeholder="Tulis prompt utama Agent AI di sini...">'+esc(core)+'</textarea>';
    ag+='</div>';
    ag+='<div class="card" style="margin-bottom:12px;background:#060606;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Integrasi Sistem AJW</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Agent AI membaca ringkasan lintas modul AJW setiap kali dijalankan, sehingga bisa dipakai sebagai otak sistem dan dasar automasi berikutnya.</div></div><span class="chip" style="background:rgba(255,184,77,.12);color:#FFB84D;border:1px solid rgba(255,184,77,.24)">Full System Context</span></div>';
    ag+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:12px">';
    ag+='<div style="background:#050505;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase">HR</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">'+snap.hr.employees+' Karyawan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+snap.hr.evaluations+' evaluasi • '+snap.hr.sopDocs+' SOP</div></div>';
    ag+='<div style="background:#050505;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase">Finance</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">Rp '+fmt(snap.finance.incomeTotal)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+snap.finance.incomeRows+' income • '+snap.finance.expenseRows+' expense</div></div>';
    ag+='<div style="background:#050505;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase">Analytics</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">'+snap.analytics.customers+' Customer</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+snap.analytics.sales+' sales • '+snap.analytics.promo+' promo</div></div>';
    ag+='<div style="background:#050505;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase">Tools</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">'+(snap.tools.refunds+snap.tools.complaints+snap.tools.requests)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+snap.tools.refunds+' refund • '+snap.tools.complaints+' komplain</div></div>';
    ag+='<div style="background:#050505;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase">Development</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">'+snap.development.tasks+' Task</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+snap.development.ideas+' ideas • '+snap.development.documents+' docs</div></div>';
    ag+='</div>';
    ag+='<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08);font-size:11px;color:var(--tx2);line-height:1.6">Konteks yang dibaca Agent AI saat ini mencakup HR, Finance, Supplier, Tools, Analytics, Development, SOP, KPI &amp; Control, laporan bulanan, dan data operasional terbaru. Ini adalah fondasi agar Agent AI bisa dipakai sebagai <b>otak AJW</b> untuk automasi, rekomendasi, dan keputusan operasional.</div></div>';
    ag+='<div class="card" style="background:#090909;border:1px solid rgba(255,255,255,.08)"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    ag+='<div><div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:8px">Workspace Agent AI</div><textarea id="TOOLS-AGENT-ASK" class="fi" rows="12" placeholder="Contoh: Buat SOP singkat untuk follow up komplain buyer.&#10;Atau: Rapikan draft proses refund berdasarkan data operasional AJW."></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button id="TOOLS-AGENT-RUN" class="btnp" onclick="_toolsRunAgentAI()">Jalankan Agent AI</button><button class="btnsm" onclick="document.getElementById(&quot;TOOLS-AGENT-ASK&quot;).value=&quot;&quot;;toast(&quot;Input Agent AI dibersihkan&quot;,&quot;info&quot;,2200)">Bersihkan Input</button></div></div>';
    ag+='<div><div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:8px">Output Agent AI</div><textarea id="TOOLS-AGENT-OUT" class="fi" rows="12" placeholder="Hasil Agent AI akan muncul di sini..." style="line-height:1.55"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btnsm" onclick="_toolsCopyAgentOutput()">Copy Output</button><button class="btnsm" onclick="document.getElementById(&quot;TOOLS-AGENT-OUT&quot;).value=&quot;&quot;;toast(&quot;Output Agent AI dibersihkan&quot;,&quot;info&quot;,2200)">Bersihkan Output</button></div></div>';
    ag+='</div><div style="margin-top:12px;padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08);font-size:11px;color:var(--tx2)">Prompt utama ini juga ikut dipakai sebagai lapisan instruksi inti saat tombol <b>AI</b> digunakan di tab <b>Pengembalian Dana</b>, <b>Komplain</b>, dan <b>Request</b>.</div></div>';
    content.innerHTML=ag;
    return;
  }
  if(sub==='automation'){
    var sum=_toolsAutomationSummary();
    var auto='';
    auto+='<div class="card" style="margin-bottom:12px;background:#090909;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:15px;font-weight:800;color:#fff">Automation Center</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Bangun automasi lokal AJW untuk Moon WA, webhook, dan tugas ke Agent AI. Runner berjalan saat AJW sedang terbuka.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Job aktif: '+sum.active+'</span><span class="chip" style="background:#050505;border:1px solid rgba(240,197,106,.22);color:#F0C56A">Webhook: '+(_toolWebhookDefs||[]).length+'</span><span class="chip" style="background:#050505;border:1px solid rgba(180,140,255,.24);color:#C4B5FD">Agent: '+esc((_toolAgentBridge&&_toolAgentBridge.provider)||'openclaw')+'</span></div></div></div>';
    auto+='<div style="display:grid;grid-template-columns:1.2fr .8fr;gap:12px;margin-bottom:12px">';
    auto+='<div class="card"><div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px">Jadwal Otomasi</div><div style="display:grid;grid-template-columns:1.1fr .8fr .8fr;gap:10px"><div><label class="lbl">Nama Automasi</label><input id="TOOL-AUTO-NAME" class="fi" placeholder="Contoh: Laporan pagi ke grup laporan"></div><div><label class="lbl">Channel</label><select id="TOOL-AUTO-CHANNEL" class="fi" onchange="_toolsAutomationToggleFields()"><option value="moonwa">Moon WA</option><option value="webhook">Webhook</option><option value="agent">Agent AI</option></select></div><div id="TOOL-AUTO-GROUP-WRAP"><label class="lbl">Tujuan WhatsApp</label>'+_toolsGroupSelect('TOOL-AUTO-GROUP',_toolsDefaultGroupId('report'),'report')+'</div></div>';
    auto+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-top:10px"><div><label class="lbl">Tipe Jadwal</label><select id="TOOL-AUTO-TYPE" class="fi" onchange="_toolsAutomationToggleFields()"><option value="daily">Harian</option><option value="weekly">Mingguan</option><option value="interval">Interval Menit</option><option value="once">Sekali</option></select></div><div id="TOOL-AUTO-DATE-WRAP" style="display:none"><label class="lbl">Tanggal Run</label><input id="TOOL-AUTO-DATE" type="date" class="fi" value="'+esc(ymd())+'"></div><div><label class="lbl">Jam</label><input id="TOOL-AUTO-TIME" type="time" class="fi" value="09:00"></div><div id="TOOL-AUTO-WEEKDAY-WRAP" style="display:none"><label class="lbl">Hari</label><select id="TOOL-AUTO-WEEKDAY" class="fi"><option value="1">Senin</option><option value="2">Selasa</option><option value="3">Rabu</option><option value="4">Kamis</option><option value="5">Jumat</option><option value="6">Sabtu</option><option value="0">Minggu</option></select></div><div id="TOOL-AUTO-MINS-WRAP" style="display:none"><label class="lbl">Interval (menit)</label><input id="TOOL-AUTO-MINS" class="fi" value="60"></div></div>';
    auto+='<div style="margin-top:10px"><label class="lbl">Pesan / Instruksi</label><textarea id="TOOL-AUTO-MSG" class="fi" rows="5" placeholder="Tulis pesan WhatsApp, payload ringkas, atau instruksi task untuk Agent AI"></textarea></div>';
    auto+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><div id="TOOL-AUTO-MEDIA-WRAP"><label class="lbl">Media URL (opsional)</label><input id="TOOL-AUTO-MEDIA" class="fi" placeholder="URL gambar publik untuk Moon WA send-media"></div><div id="TOOL-AUTO-WEBHOOK-WRAP" style="display:none"><label class="lbl">Webhook Tujuan</label><select id="TOOL-AUTO-WEBHOOK" class="fi"><option value="">Pilih webhook</option>'+(_toolWebhookDefs||[]).map(function(w){ return '<option value="'+w.id+'">'+esc(w.name)+' • '+esc(w.method||'POST')+'</option>'; }).join('')+'</select></div></div>';
    auto+='<div id="TOOL-AUTO-AGENT-NOTE" style="display:none;margin-top:10px;padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08);font-size:11px;color:var(--tx2)">Task akan dikirim ke endpoint Agent AI bridge dengan payload AJW terstruktur.</div>';
    auto+='<div style="display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:10px;align-items:end"><div><label class="lbl">Catatan</label><textarea id="TOOL-AUTO-NOTES" class="fi" rows="3" placeholder="Catatan operasional / konteks job"></textarea></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)"><input id="TOOL-AUTO-ACTIVE" type="checkbox" checked style="accent-color:var(--navy)"> Aktif</label><button class="btns" onclick="_toolsAutomationResetForm()">Reset</button><button class="btnp" onclick="_toolsAutomationSaveJob()">Simpan Automation</button></div></div></div>';
    auto+='<div class="card"><div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px">Bridge Agent AI</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btnsm" onclick="_toolsAgentBridgeApplyLocalPreset(false)">Mode Bridge Lokal</button><span class="chip" style="background:#050505;border:1px solid rgba(143,208,255,.22);color:#8FD0FF">Endpoint lokal AJW</span></div><div style="display:grid;grid-template-columns:.8fr 1.2fr;gap:10px"><div><label class="lbl">Provider</label><select id="TOOL-AGBR-PROVIDER" class="fi"><option value="openclaw"'+((_toolAgentBridge.provider||'')==='openclaw'?' selected':'')+'>OpenClaw</option><option value="openai"'+((_toolAgentBridge.provider||'')==='openai'?' selected':'')+'>OpenAI Agent</option><option value="custom"'+((_toolAgentBridge.provider||'')==='custom'?' selected':'')+'>Custom Agent</option></select></div><div><label class="lbl">Nama Agent</label><input id="TOOL-AGBR-NAME" class="fi" value="'+esc(_toolAgentBridge.agentName||'AJW Brain')+'" placeholder="AJW Brain"></div></div><div style="margin-top:10px"><label class="lbl">Endpoint URL</label><input id="TOOL-AGBR-ENDPOINT" class="fi" value="'+esc(_toolAgentBridge.endpoint||'')+'" placeholder="http://127.0.0.1:3000/api/agent/run"></div><div style="margin-top:10px"><label class="lbl">API Key / Token</label><input id="TOOL-AGBR-KEY" class="fi" value="'+esc(_toolAgentBridge.apiKey||'')+'" placeholder="Bearer / secret token"></div><div style="margin-top:10px"><label class="lbl">Catatan Integrasi</label><textarea id="TOOL-AGBR-NOTES" class="fi" rows="4" placeholder="Context, route, atau catatan deploy bridge">'+esc(_toolAgentBridge.notes||'')+'</textarea></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btns" onclick="_toolsAgentBridgePing()">Ping Endpoint</button><button class="btnp" onclick="_toolsAgentBridgeSave()">Simpan Bridge</button></div></div>';
    auto+='</div>';
    auto+='<div style="display:grid;grid-template-columns:1.1fr .9fr;gap:12px">';
    auto+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:13px;font-weight:800;color:#fff">Daftar Automation</div><div style="font-size:11px;color:var(--tx2)">'+(_toolAutomationJobs||[]).length+' job</div></div><div style="overflow:auto"><table class="tbl"><thead><tr><th>Nama</th><th>Channel</th><th>Jadwal</th><th>Next Run</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    if(!(_toolAutomationJobs||[]).length) auto+='<tr><td colspan="6" style="text-align:center;color:var(--tx2)">Belum ada automation.</td></tr>';
    (_toolAutomationJobs||[]).forEach(function(job){
      auto+='<tr><td style="font-weight:700">'+esc(job.name||'-')+'<div style="font-size:10px;color:var(--tx2);margin-top:3px">'+esc((job.channel==='moonwa'?_toolsGroupLabel(job.receiver):(job.channel==='webhook'?(((_toolWebhookDefs||[]).filter(function(w){ return w.id===job.webhookId; })[0]||{}).name||'-'):'Agent AI')))+'</div></td><td>'+esc(job.channel||'-')+'</td><td>'+esc(job.scheduleType||'-')+'</td><td>'+esc(_toolsAutomationPrettyWhen(job))+'</td><td><span class="chip" style="background:'+(job.active?'rgba(110,231,183,.08)':'rgba(255,255,255,.06)')+';border:1px solid '+(job.active?'rgba(110,231,183,.24)':'rgba(255,255,255,.12)')+';color:'+(job.active?'#A7F3B6':'#C8D2DC')+'">'+(job.active?'Aktif':'Pause')+'</span></td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsAutomationRunNow(\''+job.id+'\')">Run</button><button class="btnsm" onclick="_toolsAutomationEdit(\''+job.id+'\')">Edit</button><button class="btnsm" onclick="_toolsAutomationToggle(\''+job.id+'\')">'+(job.active?'Pause':'Aktifkan')+'</button><button class="btnsm" onclick="_toolsAutomationDelete(\''+job.id+'\')">Hapus</button></div></td></tr>';
    });
    auto+='</tbody></table></div></div>';
    auto+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:13px;font-weight:800;color:#fff">Webhook Registry</div><div style="font-size:11px;color:var(--tx2)">Beberapa endpoint bisa disimpan di sini</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label class="lbl">Nama Webhook</label><input id="TOOL-WH-NAME" class="fi" placeholder="AJW Incoming Orders"></div><div><label class="lbl">Method</label><select id="TOOL-WH-METHOD" class="fi"><option>POST</option><option>GET</option></select></div></div><div style="margin-top:10px"><label class="lbl">URL Endpoint</label><input id="TOOL-WH-URL" class="fi" placeholder="https://domain.com/webhook/..."></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><div><label class="lbl">Secret / Token</label><input id="TOOL-WH-SECRET" class="fi" placeholder="opsional"></div><div><label class="lbl">Event Name</label><input id="TOOL-WH-EVENT" class="fi" placeholder="automation.run"></div></div><div style="margin-top:10px"><label class="lbl">Payload Template JSON</label><textarea id="TOOL-WH-PAYLOAD" class="fi" rows="5">'+esc(_toolsWebhookPayloadTemplate())+'</textarea></div><div style="margin-top:10px"><label class="lbl">Catatan</label><textarea id="TOOL-WH-NOTES" class="fi" rows="3" placeholder="Kegunaan webhook / mapping payload"></textarea></div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px"><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)"><input id="TOOL-WH-ACTIVE" type="checkbox" checked style="accent-color:var(--navy)"> Aktif</label><div style="display:flex;gap:8px"><button class="btns" onclick="_toolsWebhookResetForm()">Reset</button><button class="btnp" onclick="_toolsWebhookSave()">Simpan Webhook</button></div></div><div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;max-height:320px;overflow:auto">';
    if(!(_toolWebhookDefs||[]).length) auto+='<div style="padding:12px;border:1px dashed rgba(255,255,255,.12);border-radius:10px;color:var(--tx2);font-size:11px">Belum ada webhook tersimpan.</div>';
    (_toolWebhookDefs||[]).forEach(function(w){
      auto+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.07)"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-size:12px;font-weight:800;color:#fff">'+esc(w.name||'-')+'</div><div style="font-size:10px;color:'+(w.active?'#A7F3B6':'#C8D2DC')+';font-weight:800">'+(w.active?'ACTIVE':'PAUSE')+'</div></div><div style="font-size:10px;color:var(--tx2);margin-top:4px">'+esc((w.method||'POST')+' • '+(w.eventName||'-'))+'</div><div style="font-size:10px;color:var(--tx2);margin-top:2px;word-break:break-all">'+esc(w.url||'-')+'</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btnsm" onclick="_toolsWebhookTest(\''+w.id+'\')">Test</button><button class="btnsm" onclick="_toolsWebhookEdit(\''+w.id+'\')">Edit</button><button class="btnsm" onclick="_toolsWebhookDelete(\''+w.id+'\')">Hapus</button></div></div>';
    });
    auto+='</div></div>';
    auto+='</div>';
    content.innerHTML=auto;
    _toolsAutomationToggleFields();
    return;
  }
  if(sub==='desc'){
    var rows=_toolDescRows||[];
    var doneCount=rows.filter(function(r){ return r.status==='done'; }).length;
    var errCount=rows.filter(function(r){ return r.status==='error'; }).length;
    var readyCount=rows.filter(function(r){ return r.status!=='done'; }).length;
    var desc='';
    desc+='<div class="card" style="margin-bottom:12px;background:#090909;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:15px;font-weight:800;color:#fff">Revisi Deskripsi Produk</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Import file Excel/CSV berisi kode produk, nama produk, dan deskripsi produk. AJW akan menjaga struktur kolom asli, lalu menghasilkan kolom deskripsi terbaru dengan AI per baris secara berurutan.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsDescDownloadTemplate()">Download Template Excel</button><button class="btns" onclick="_toolsDescImportFile()">Import Excel / CSV</button><button class="btnp" onclick="_toolsDescExportResults()">Export Excel Hasil</button></div></div>';
    desc+='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px">';
    [['Total Baris',rows.length,'#8FD0FF'],['Selesai',doneCount,'#A7F3B6'],['Error',errCount,'#FF8A80'],['Siap / Pending',readyCount,'#F0C56A']].forEach(function(it){
      desc+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.07)"><div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.65)">'+it[0]+'</div><div style="font-size:26px;font-weight:900;color:'+it[2]+';margin-top:6px">'+it[1]+'</div></div>';
    });
    desc+='</div></div>';
    desc+='<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div style="font-size:13px;font-weight:800;color:#fff">Prompt Revisi Deskripsi</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsDescResetPrompt()">Gunakan Default</button><button class="btnp" onclick="_toolsDescSavePrompt()">Simpan Prompt</button></div></div><textarea id="TOOL-DESC-PROMPT" class="fi" rows="18" style="margin-top:10px;line-height:1.55">'+esc(_toolsDescPromptValue())+'</textarea></div>';
    desc+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Daftar Revisi Deskripsi</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Generate bisa per baris atau berantai dari baris tertentu sampai ke bawah.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsDescRunFrom(0)"'+(_toolDescRunState.running?' disabled':'')+'>Generate Semua</button><button class="btnsm" onclick="confirmDelete(\'Kosongkan semua data revisi deskripsi?\',function(){_toolDescRows=[];_toolsSave();_renderTools(\'desc\')})">Kosongkan</button></div></div>';
    desc+='<div style="overflow:auto"><table class="tbl"><thead><tr><th style="width:46px">No</th><th>Kode Produk</th><th>Nama Produk</th><th>Deskripsi Produk</th><th>Deskripsi Terbaru</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    if(!rows.length) desc+='<tr><td colspan="7" style="text-align:center;color:var(--tx2)">Belum ada data. Import file template dulu untuk mulai revisi.</td></tr>';
    rows.forEach(function(r,idx){
      var statusLabel=r.status==='done'?'Selesai':(r.status==='running'?'Memproses':(r.status==='error'?'Error':'Siap'));
      var statusColor=r.status==='done'?'#A7F3B6':(r.status==='running'?'#8FD0FF':(r.status==='error'?'#FF8A80':'#F0C56A'));
      desc+='<tr><td>'+ (idx+1) +'</td><td style="font-weight:700">'+esc(r.productCode||'-')+'</td><td>'+esc(r.productName||'-')+'</td><td style="max-width:320px"><div style="max-height:110px;overflow:auto;white-space:pre-wrap;line-height:1.45">'+esc((r.oldDescription||'-').slice(0,250))+(String(r.oldDescription||'').length>250?'...':'')+'</div></td><td style="max-width:340px"><div style="max-height:110px;overflow:auto;white-space:pre-wrap;line-height:1.45">'+esc((r.newDescription||'-').slice(0,250))+(String(r.newDescription||'').length>250?'...':'')+'</div></td><td><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:'+statusColor+'">'+statusLabel+'</span>'+(r.error?'<div style="font-size:10px;color:#FF8A80;margin-top:4px;max-width:160px">'+esc(r.error)+'</div>':'')+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsDescOpenPreview(\''+r.id+'\')">Preview</button><button class="btnsm" onclick="_toolsDescGenerateOne(\''+r.id+'\')">Generate</button><button class="btnsm" onclick="_toolsDescRunFrom('+(idx)+')">Lanjut Bawah</button><button class="btnsm" onclick="_toolsDescDelete(\''+r.id+'\')">Hapus</button></div></td></tr>';
    });
    desc+='</tbody></table></div></div>';
    content.innerHTML=desc;
    return;
  }
  if(sub==='blast'){
    var blastRows=_toolsBlastFilteredRows();
    var stats=_toolsBlastStatsSummary();
    var blast='';
    blast+='<div class="card" style="margin-bottom:12px;background:#090909;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:15px;font-weight:800;color:#fff">Pesan Blast Customer</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Import data pesanan dari Excel berdasarkan Nomor Pesanan, sistem akan merapikan satu order menjadi satu pesan ke nomor customer masing-masing.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsBlastDownloadTemplate()">Download Template Import</button><button class="btns" onclick="_toolsBlastImportFile()">Import Excel / CSV</button><button class="btnp" onclick="_toolsBlastExportResults()">Export Excel</button></div></div>';
    blast+='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px">';
    [['Total Order',stats.total,'#8FD0FF'],['Siap Dikirim',stats.ready,'#F0C56A'],['Terkirim',stats.sent,'#A7F3B6'],['Error',stats.error,'#FF8A80']].forEach(function(it){
      blast+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.07)"><div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.65)">'+it[0]+'</div><div style="font-size:26px;font-weight:900;color:'+it[2]+';margin-top:6px">'+it[1]+'</div></div>';
    });
    blast+='</div></div>';
    blast+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:1.2fr .8fr;gap:12px;align-items:start"><div><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div style="font-size:13px;font-weight:800;color:#fff">Template Pesan Blast</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsBlastResetTemplate()">Gunakan Default</button><button class="btnp" onclick="_toolsBlastSaveTemplate()">Simpan Template</button></div></div><textarea id="TOOL-BLAST-TEMPLATE" class="fi" rows="14" style="margin-top:10px;line-height:1.55">'+esc(_toolsBlastTemplateValue())+'</textarea><div style="font-size:11px;color:var(--tx2);margin-top:8px">Placeholder tersedia: {{nomor_pesanan}}, {{nomor_resi}}, {{nama_penerima}}, {{alamat_lengkap}}, {{nama_produk}}, {{nama_variasi}}, {{nama_jasa_kirim}}, {{subtotal_produk}}, {{metode_pembayaran}}, {{marketplace}}, {{nomor_telepon}}, {{detail_produk}}, {{link_resi}}</div></div>';
    blast+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="font-size:13px;font-weight:800;color:#fff">Kontrol Pengiriman</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Atur filter status, jeda antar pesan, dan jaga statistik permanen blast tetap aman.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><div><label class="lbl">Filter Status</label><select id="TOOL-BLAST-FILTER" class="fi" onchange="_toolBlastStatusFilter=this.value;_renderTools(\'blast\')"><option value="all"'+(_toolBlastStatusFilter==='all'?' selected':'')+'>Semua</option><option value="ready"'+(_toolBlastStatusFilter==='ready'?' selected':'')+'>Siap</option><option value="sent"'+(_toolBlastStatusFilter==='sent'?' selected':'')+'>Terkirim</option><option value="error"'+(_toolBlastStatusFilter==='error'?' selected':'')+'>Error</option></select></div><div><label class="lbl">Jeda per Pesan (detik)</label><input id="TOOL-BLAST-DELAY" class="fi" type="number" min="1" value="'+esc(String(Math.round(_toolsBlastDelayValue()/1000)))+'"></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btns" onclick="_toolsBlastSetDelay()">Simpan Jeda</button><button class="btns" onclick="_toolsBlastArchiveAndClear()">Kosongkan Daftar</button><button class="btns" onclick="_toolsBlastDeleteAllCurrent()">Hapus Semua Daftar</button><button class="btns" onclick="_toolsBlastResetStats()">Reset Statistik</button><button class="btns" onclick="_toolsBlastResetAll()">Reset Semua</button></div><div style="font-size:11px;color:var(--tx2);margin-top:10px">Riwayat permanen: '+(_toolBlastHistory||[]).length+' • Database nomor: '+(_toolBlastPhoneDb||[]).length+' • Daftar aktif: '+(_toolBlastRows||[]).length+'</div></div></div></div>';
    blast+='<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Daftar Blast per Nomor Pesanan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Setiap order digabung berdasarkan Nomor Pesanan agar satu pesanan menghasilkan satu pesan customer.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsBlastPreviewList()">Preview Daftar</button><button class="btnp" onclick="_toolsBlastSendAll()"'+(_toolBlastSending?' disabled="disabled"':'')+'>Kirim Semua</button></div></div>';
    blast+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>No</th><th>Nomor Pesanan</th><th>Nama Penerima</th><th>Nomor Telepon</th><th>Produk</th><th>Resi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    if(!blastRows.length) blast+='<tr><td colspan="8" style="text-align:center;color:var(--tx2)">Belum ada data blast pada filter ini. Import template dulu atau ubah filter status.</td></tr>';
    blastRows.forEach(function(r,idx){
      var statusLabel=_toolsBlastStatusText(r.status);
      var statusColor=_toolsBlastStatusColor(r.status);
      blast+='<tr><td>'+(idx+1)+'</td><td style="font-weight:700">'+esc(r.orderNo||'-')+'</td><td>'+esc(r.namaPenerima||'-')+'</td><td>'+esc(r.nomorTeleponRaw||r.nomorTelepon||'-')+'</td><td style="max-width:280px"><div style="max-height:100px;overflow:auto;white-space:pre-wrap;line-height:1.45">'+esc(_toolsBlastDetailText(r))+'</div></td><td>'+esc(r.trackingNo||'-')+'</td><td><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:'+statusColor+'">'+statusLabel+'</span>'+(r.error?'<div style="font-size:10px;color:#FF8A80;margin-top:4px;max-width:180px">'+esc(r.error)+'</div>':'')+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsBlastPreview(\''+r.id+'\')">Preview</button><button class="btnsm" onclick="_toolsBlastRefreshRow(\''+r.id+'\')">Refresh</button><button class="btnsm" onclick="_toolsBlastSendOne(\''+r.id+'\')">Kirim</button><button class="btnsm" onclick="_toolsBlastDelete(\''+r.id+'\')">Hapus</button></div></td></tr>';
    });
    blast+='</tbody></table></div></div>';
    blast+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Database Nomor Telepon</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Nomor customer terkumpul otomatis dari import dan blast yang pernah diproses.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#8FD0FF">'+(_toolBlastPhoneDb||[]).length+' nomor</span></div><div style="overflow:auto;max-height:360px"><table class="tbl"><thead><tr><th>No</th><th>Nama</th><th>Telepon</th><th>Order Terakhir</th><th>Total Blast</th><th>Blast Marketing</th></tr></thead><tbody>';
    if(!(_toolBlastPhoneDb||[]).length) blast+='<tr><td colspan="6" style="text-align:center;color:var(--tx2)">Database nomor masih kosong.</td></tr>';
    (_toolBlastPhoneDb||[]).forEach(function(it,idx){
      blast+='<tr><td>'+(idx+1)+'</td><td>'+esc(it.receiverName||'-')+'</td><td>'+esc(it.phoneRaw||it.phone||'-')+'</td><td>'+esc(it.lastOrderNo||'-')+'</td><td>'+esc(String(it.totalBlastCount||0))+'</td><td>'+esc(String(it.marketingBlastCount||0))+'</td></tr>';
    });
    blast+='</tbody></table></div></div>';
    content.innerHTML=blast;
    return;
  }
  if(sub==='blastmkt'){
    var mkt=''; var selectedCount=(_toolBlastPhoneDb||[]).filter(function(it){ return !!it.selectedMarketing; }).length; var prog=_toolBlastMarketingProgress||{running:false,total:0,done:0,success:0,error:0,current:'',logs:[]};
    mkt+='<div class="card" style="margin-bottom:12px;background:#090909;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:15px;font-weight:800;color:#fff">Blast Marketing</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Kirim pesan marketing manual atau terjadwal ke database nomor customer yang sudah tersimpan di AJW.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_toolsBlastMarketingToggleAll(true)">Pilih Semua</button><button class="btns" onclick="_toolsBlastMarketingToggleAll(false)">Batal Pilih</button></div></div>';
    mkt+='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px">';
    [['Database Nomor',(_toolBlastPhoneDb||[]).length,'#8FD0FF'],['Terpilih',selectedCount,'#F0C56A'],['Jadwal Aktif',(_toolBlastMarketingSchedules||[]).filter(function(it){ return !!it.active; }).length,'#A7F3B6'],['Jeda Saat Ini',Math.round(_toolsBlastDelayValue()/1000)+' dtk','#D7E1EA']].forEach(function(it){
      mkt+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.07)"><div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.65)">'+it[0]+'</div><div style="font-size:24px;font-weight:900;color:'+it[2]+';margin-top:6px">'+it[1]+'</div></div>';
    });
    mkt+='</div></div>';
    mkt+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:1fr .9fr;gap:12px"><div><div style="font-size:13px;font-weight:800;color:#fff">Progress Pengiriman</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Pantau proses kirim marketing secara real-time saat AJW berjalan.</div><div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px"><div><div style="font-size:10px;color:rgba(255,255,255,.55)">Total</div><div style="font-size:20px;font-weight:900;color:#8FD0FF">'+(prog.total||0)+'</div></div><div><div style="font-size:10px;color:rgba(255,255,255,.55)">Selesai</div><div style="font-size:20px;font-weight:900;color:#F0C56A">'+(prog.done||0)+'</div></div><div><div style="font-size:10px;color:rgba(255,255,255,.55)">Sukses</div><div style="font-size:20px;font-weight:900;color:#A7F3B6">'+(prog.success||0)+'</div></div><div><div style="font-size:10px;color:rgba(255,255,255,.55)">Error</div><div style="font-size:20px;font-weight:900;color:#FF8A80">'+(prog.error||0)+'</div></div></div><div style="margin-top:10px"><div class="pbar"><div class="pfill" style="width:'+(prog.total?Math.min(100,Math.round((prog.done/prog.total)*100)):0)+'%;background:linear-gradient(90deg,#F0C56A,#A7F3B6)"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx2);margin-top:6px"><span>Status: '+(prog.running?'Mengirim':'Idle')+'</span><span>'+(prog.total?Math.min(100,Math.round((prog.done/prog.total)*100)):0)+'%</span></div><div style="font-size:11px;color:#fff;margin-top:6px">Target saat ini: '+esc(prog.current||'-')+'</div></div></div></div><div><div style="font-size:13px;font-weight:800;color:#fff">Log Progress</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Riwayat singkat hasil kirim terbaru.</div><div style="overflow:auto;max-height:190px;margin-top:10px;padding-right:4px">';
    if(!(prog.logs||[]).length){ mkt+='<div style="padding:12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08);font-size:11px;color:var(--tx2)">Belum ada log pengiriman.</div>'; }
    (prog.logs||[]).slice(0,12).forEach(function(log){
      mkt+='<div style="padding:10px 12px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.08);margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div style="font-size:12px;font-weight:800;color:#fff">'+esc(log.name||'-')+'</div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:'+(log.status==='success'?'#A7F3B6':'#FF8A80')+'">'+(log.status==='success'?'Terkirim':'Error')+'</span></div><div style="font-size:10px;color:var(--tx2);margin-top:4px">'+esc(log.target||'-')+' • '+esc(String(log.ts||'').replace('T',' ').replace('Z',''))+'</div><div style="font-size:11px;color:'+(log.status==='success'?'#A7F3B6':'#FF8A80')+';margin-top:6px;line-height:1.5">'+esc(log.message||'-')+'</div></div>';
    });
    mkt+='</div></div></div></div>';
    mkt+='<div style="display:grid;grid-template-columns:.9fr 1.1fr;gap:12px">';
    mkt+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Daftar Nomor Tujuan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Checklist manual nomor yang ingin menerima blast marketing. Jika tidak ada yang dipilih, sistem akan mengirim ke semua nomor.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#8FD0FF">'+selectedCount+' dipilih</span></div><div style="overflow:auto;max-height:520px"><table class="tbl"><thead><tr><th><input type="checkbox" '+(selectedCount&&selectedCount===(_toolBlastPhoneDb||[]).length?'checked':'')+' onchange="_toolsBlastMarketingToggleAll(this.checked)"></th><th>Nama</th><th>Telepon</th><th>Marketplace</th><th>Blast</th><th>Marketing</th><th>Terakhir</th></tr></thead><tbody>';
    if(!(_toolBlastPhoneDb||[]).length) mkt+='<tr><td colspan="7" style="text-align:center;color:var(--tx2)">Database nomor masih kosong.</td></tr>';
    (_toolBlastPhoneDb||[]).forEach(function(it){
      mkt+='<tr><td><input type="checkbox" '+(it.selectedMarketing?'checked':'')+' onchange="_toolsBlastMarketingTogglePhone(\''+escAttr(it.phone||'')+'\',this.checked)"></td><td>'+esc(it.receiverName||'-')+'</td><td>'+esc(it.phoneRaw||it.phone||'-')+'</td><td>'+esc(it.marketplace||'-')+'</td><td>'+esc(String(it.totalBlastCount||0))+'</td><td>'+esc(String(it.marketingBlastCount||0))+'</td><td>'+esc((it.lastMarketingAt||it.updatedAt||'-')).replace('T',' ').replace('Z','')+'</td></tr>';
    });
    mkt+='</tbody></table></div></div>';
    mkt+='<div style="display:grid;grid-template-columns:1fr;gap:12px">';
    mkt+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Komposer Blast Marketing</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Pilih template marketing, sesuaikan isi pesan, tambahkan gambar via URL bila perlu, lalu kirim manual atau jadwalkan.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="TOOL-BLAST-MARKETING-RESET-TPL" class="btns">Kosongkan Template</button><button type="button" id="TOOL-BLAST-MARKETING-SAVE-TPL" class="btnp">Simpan Template</button></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><div><label class="lbl">Template Marketing</label><select id="TOOL-BLAST-MARKETING-PRESET" class="fi" onchange="_toolsBlastApplyMarketingPreset(this.value)"><option value=\"\">Pilih template</option>';
    (_toolsBlastMarketingPresets()||[]).forEach(function(p){ mkt+='<option value="'+escAttr(p.key)+'">'+esc(p.label)+'</option>'; });
    mkt+='</select></div><div><label class="lbl">Jeda per Pesan (detik)</label><input id="TOOL-BLAST-DELAY" class="fi" type="number" min="1" value="'+esc(String(Math.round(_toolsBlastDelayValue()/1000)))+'"></div></div><textarea id="TOOL-BLAST-MARKETING-TEMPLATE" class="fi" rows="8" style="margin-top:10px;line-height:1.55" placeholder="Kosongkan jika ingin hanya kirim isi pesan manual apa adanya.">'+esc(_toolsBlastMarketingTemplateValue())+'</textarea><div style="font-size:11px;color:var(--tx2);margin-top:8px">Placeholder tersedia: {{nama_penerima}}, {{nomor_pesanan}}, {{nomor_resi}}, {{marketplace}}, {{nomor_telepon}}, {{pesan_marketing}}</div><div style="margin-top:10px"><label class="lbl">Isi Pesan Marketing</label><textarea id="TOOL-BLAST-MARKETING-MESSAGE" class="fi" rows="6" placeholder="Isi promo / follow up / campaign marketing yang ingin dikirim. Jika template kosong, teks ini dikirim apa adanya."></textarea></div><div style="margin-top:10px"><label class="lbl">Nomor Telepon Manual</label><textarea id="TOOL-BLAST-MARKETING-MANUAL-PHONES" class="fi" rows="3" placeholder="Pisahkan dengan enter, koma, atau titik koma. Contoh: 0812xxxx, 62813xxxx"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btnsm" onclick="_toolsBlastMarketingDownloadPhoneTemplate()">Template No Telepon</button><button class="btnsm" onclick="_toolsBlastMarketingImportPhones()">Import No Telepon</button></div></div><div style="margin-top:10px"><label class="lbl">URL Image (opsional)</label><input id="TOOL-BLAST-MARKETING-IMAGE" class="fi" placeholder="https://... jika ingin kirim gambar + teks"></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button type="button" id="TOOL-BLAST-MARKETING-SAVE-DELAY" class="btns">Simpan Jeda</button><button class="btns" onclick="_toolsBlastMarketingPreviewTargets()">Preview Target</button><button type="button" id="TOOL-BLAST-MARKETING-SEND" class="btnp"'+(_toolBlastSending?' disabled="disabled"':'')+'>Kirim Blast Marketing</button></div></div>';
    mkt+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Jadwal Blast Marketing</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Bisa dijalankan tiap minggu, tiap bulan, atau pada tanggal tertentu. Jadwal berjalan saat AJW aktif terbuka.</div></div></div><div style="display:grid;grid-template-columns:1.2fr .8fr .8fr .8fr;gap:10px;margin-top:10px"><div><label class="lbl">Nama Jadwal</label><input id="TOOL-BLAST-MARKETING-SCH-NAME" class="fi" placeholder="Contoh Promo Mingguan"></div><div><label class="lbl">Tipe Jadwal</label><select id="TOOL-BLAST-MARKETING-SCH-KIND" class="fi"><option value="weekly">Mingguan</option><option value="monthly">Bulanan</option><option value="date">Tanggal Tertentu</option></select></div><div><label class="lbl">Jam Kirim</label><input id="TOOL-BLAST-MARKETING-SCH-TIME" type="time" class="fi" value="09:00"></div><div><label class="lbl">Hari / Tanggal</label><input id="TOOL-BLAST-MARKETING-SCH-DATE" type="date" class="fi"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><div><label class="lbl">Hari Mingguan</label><select id="TOOL-BLAST-MARKETING-SCH-WEEKDAY" class="fi"><option value="mon">Senin</option><option value="tue">Selasa</option><option value="wed">Rabu</option><option value="thu">Kamis</option><option value="fri">Jumat</option><option value="sat">Sabtu</option><option value="sun">Minggu</option></select></div><div><label class="lbl">Tanggal Bulanan</label><input id="TOOL-BLAST-MARKETING-SCH-MONTHDAY" type="number" min="1" max="31" class="fi" value="1"></div></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button class="btnp" onclick="_toolsBlastMarketingSaveSchedule()">'+(_toolBlastMarketingEditId?'Update Jadwal':'Simpan Jadwal')+'</button></div><div style="overflow:auto;max-height:260px;margin-top:10px"><table class="tbl"><thead><tr><th>Nama</th><th>Tipe</th><th>Target</th><th>Next Run</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    if(!(_toolBlastMarketingSchedules||[]).length) mkt+='<tr><td colspan="6" style="text-align:center;color:var(--tx2)">Belum ada jadwal marketing.</td></tr>';
    (_toolBlastMarketingSchedules||[]).forEach(function(job){
      var target=job.kind==='weekly'?(job.weekday||'-'):(job.kind==='monthly'?('tgl '+(job.monthday||'-')):(job.date||'-'));
      mkt+='<tr><td>'+esc(job.name||'-')+'</td><td>'+esc(job.kind||'-')+'</td><td>'+esc(target)+'</td><td>'+esc(job.nextRunAt||'-').replace('T',' ').replace('Z','')+'</td><td><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:'+(job.active?'#A7F3B6':'#FF8A80')+'">'+(job.active?'Aktif':'Pause')+'</span></td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsBlastMarketingRunNow(\''+job.id+'\')">Run</button><button class="btnsm" onclick="_toolsBlastMarketingEditSchedule(\''+job.id+'\')">Edit</button><button class="btnsm" onclick="_toolsBlastMarketingToggleSchedule(\''+job.id+'\')">'+(job.active?'Pause':'Aktifkan')+'</button><button class="btnsm" onclick="_toolsBlastMarketingDeleteSchedule(\''+job.id+'\')">Hapus</button></div></td></tr>';
    });
    mkt+='</tbody></table></div></div></div></div>';
    content.innerHTML=mkt;
    _toolsBlastMarketingBindUI();
    return;
  }
  if(sub==='materials'){
    _toolsMaterialEnsureSessions();
    var mats=_toolsMaterialRowsSorted();
    var totalAwal=mats.reduce(function(t,r){ return t+_num(r.stokAwal); },0);
    var totalPakai=mats.reduce(function(t,r){ return t+_num(r.pakai); },0);
    var totalMasuk=mats.reduce(function(t,r){ return t+_num(r.masuk); },0);
    var totalAkhir=mats.reduce(function(t,r){ return t+_toolsMaterialEnding(r); },0);
    var totalNominalStok=mats.reduce(function(t,r){ return t+_toolsMaterialStockNominal(r); },0);
    var needRows=mats.filter(function(r){ return _toolsMaterialStatus(r).label==='Perlu Order'; });
    var warnRows=mats.filter(function(r){ return _toolsMaterialStatus(r).label==='Waspada'; });
    var activeOrders=_toolsMaterialOrdersBySession(_toolMaterialActiveSessionId);
    var activeHistory=_toolsMaterialHistoryBySession(_toolMaterialActiveSessionId);
    var orderQty=activeOrders.reduce(function(t,r){ return t+_num(r.qty); },0);
    var orderNominal=activeOrders.reduce(function(t,r){ return t+(_num(r.subtotal)||(_num(r.qty)*_num(r.hargaSatuan))); },0);
    var orderDone=activeHistory.length;
    var editRow=_toolMaterialEditId?((_toolMaterialStock||[]).find(function(r){ return r.id===_toolMaterialEditId; })||null):null;
    var orderRow=_toolMaterialOrderEditId?((_toolMaterialOrders||[]).find(function(r){ return r.id===_toolMaterialOrderEditId; })||null):null;
    var mt='';
    mt+='<div class="card" style="margin-bottom:12px;background:#080808;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Stok Material Packing & Operasional</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Kelola database material, link pembelian, dan buat daftar belanja tanpa mengubah fungsi stok yang sudah ada.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnp" onclick="_toolsMaterialOpenModal()">'+(_toolMaterialEditId?'Edit Material':'＋ Tambah Material')+'</button><button class="btnsm" onclick="_toolsMaterialOrderOpen()">Daftar Belanja'+(activeOrders.length?' ('+activeOrders.length+' / Qty '+fmt(orderQty)+' / Done '+orderDone+')':'')+'</button><button class="btnsm" onclick="_toolsMaterialResetDefault()">Pulihkan Template Default</button></div></div></div>';
    mt+='<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;margin-bottom:12px">';
    [['Total Item',mats.length,'Baris material aktif','#8FD0FF'],['Perlu Order',needRows.length,'Harus segera dibeli','#FF8A80'],['Waspada',warnRows.length,'Mendekati batas minimum','#F0C56A'],['Total Pakai',totalPakai,'Pemakaian minggu ini','#A7F3B6'],['Total Akhir',totalAkhir,'Akumulasi stok akhir','#D7E1EA'],['Nominal Total Stok',_toolsMoney(totalNominalStok),'Stok akhir x harga satuan','#FFD07A'],['Nominal Daftar Belanja',_toolsMoney(orderNominal),'Qty order x harga satuan','#FFC38C']].forEach(function(card){
      mt+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:rgba(255,255,255,.72);text-transform:uppercase">'+card[0]+'</div><div style="font-size:28px;font-weight:900;color:'+card[3]+';margin-top:8px">'+card[1]+'</div><div style="font-size:11px;color:var(--tx2);margin-top:6px">'+card[2]+'</div></div>';
    });
    mt+='</div>';
    mt+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">Rekap Stok Material</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Database material baku dengan status stok, catatan, dan link pembelian per item.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Stok Awal: '+fmt(totalAwal)+'</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Masuk: '+fmt(totalMasuk)+'</span></div></div>';
    mt+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Material / Item</th><th>Kategori</th><th>Satuan</th><th>Harga / Satuan</th><th>Link Pembelian</th><th>Stok Awal</th><th>Pakai Minggu Ini</th><th>Masuk / Beli</th><th>Stok Akhir</th><th>Nominal Stok</th><th>Status / Perlu Order?</th><th>Catatan</th><th>Terakhir Diperbarui</th><th>Aksi</th></tr></thead><tbody>';
    if(!mats.length) mt+='<tr><td colspan="14" style="text-align:center;color:var(--tx2)">Belum ada data material operasional.</td></tr>';
    mats.forEach(function(r){
      var st=_toolsMaterialStatus(r), akhir=_toolsMaterialEnding(r);
      var rowPrice=_toolsMaterialPrice(r,r.satuan);
      mt+='<tr><td style="font-weight:700">'+esc(r.nama||'-')+'</td><td>'+esc(r.kategori||'-')+'</td><td>'+esc(r.satuan||'-')+'</td><td style="font-weight:700">'+esc(_toolsMoney(rowPrice))+'</td><td>'+(r.linkPembelian?'<button class="btnsm" onclick="window.open(\''+String(r.linkPembelian).replace(/'/g,"&#39;")+'\',\'_blank\')">Buka Link</button>':'-')+'</td><td>'+fmt(_num(r.stokAwal))+'</td><td>'+fmt(_num(r.pakai))+'</td><td>'+fmt(_num(r.masuk))+'</td><td style="font-weight:800;color:'+(akhir<=_num(r.minStok)?'#FF8A80':'#A7F3B6')+'">'+fmt(akhir)+'</td><td style="font-weight:700">'+esc(_toolsMoney(_toolsMaterialStockNominal(r)))+'</td><td><span class="chip" style="background:'+st.bg+';border:1px solid '+st.bd+';color:'+st.fg+'">'+st.label+'</span></td><td style="max-width:260px">'+esc(r.catatan||'-')+'</td><td>'+esc(String(r.updatedAt||'-').replace('T',' ').slice(0,16))+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsMaterialEdit(\''+r.id+'\')">Edit</button><button class="btnsm" onclick="_toolsMaterialDelete(\''+r.id+'\')">Hapus</button></div></td></tr>';
    });
    mt+='</tbody></table></div></div>';
    if(_toolMaterialModalOpen){
      mt+='<div onclick="_toolsMaterialCloseModal()" style="position:fixed;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(2px);z-index:2200"></div><div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(980px,calc(100vw - 40px));max-height:calc(100vh - 48px);overflow:auto;background:#0b0f14;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.45);z-index:2201"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:#fff">'+(editRow?'Edit Material':'Tambah Material')+'</div><button class="btnsm" onclick="_toolsMaterialCloseModal()">Tutup</button></div>';
      mt+='<div style="display:grid;grid-template-columns:1.25fr .7fr .7fr .9fr .7fr .7fr;gap:10px">';
      mt+='<div><label class="lbl">Material / Item</label><input id="TOOL-MAT-NAMA" class="fi" placeholder="Contoh Bubble Wrap Roll" value="'+esc(editRow&&editRow.nama||'')+'"></div>';
      mt+='<div><label class="lbl">Kategori</label><select id="TOOL-MAT-KAT" class="fi"><option'+((editRow&&editRow.kategori||'Packing')==='Packing'?' selected':'')+'>Packing</option><option'+((editRow&&editRow.kategori||'')==='Operasional'?' selected':'')+'>Operasional</option><option'+((editRow&&editRow.kategori||'')==='Gudang'?' selected':'')+'>Gudang</option><option'+((editRow&&editRow.kategori||'')==='Lainnya'?' selected':'')+'>Lainnya</option></select></div>';
      mt+='<div><label class="lbl">Satuan</label><input id="TOOL-MAT-SAT" class="fi" placeholder="pcs / roll / bungkus" value="'+esc(editRow&&editRow.satuan||'pcs')+'"></div>';
      mt+='<div><label class="lbl">Link Pembelian</label><input id="TOOL-MAT-LINK" class="fi" placeholder="https://..." value="'+esc(editRow&&editRow.linkPembelian||'')+'"></div>';
      mt+='<div><label class="lbl">Stok Awal</label><input id="TOOL-MAT-AWAL" class="fi" placeholder="0" value="'+esc(_num(editRow&&editRow.stokAwal||0))+'"></div>';
      mt+='<div><label class="lbl">Pakai Minggu Ini</label><input id="TOOL-MAT-PAKAI" class="fi" placeholder="0" value="'+esc(_num(editRow&&editRow.pakai||0))+'"></div>';
      mt+='</div><div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:10px;align-items:end">';
      mt+='<div><label class="lbl">Harga pcs</label><input id="TOOL-MAT-HARGA-PCS" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'pcs')||0))+'"></div>';
      mt+='<div><label class="lbl">Harga roll</label><input id="TOOL-MAT-HARGA-ROLL" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'roll')||0))+'"></div>';
      mt+='<div><label class="lbl">Harga bungkus</label><input id="TOOL-MAT-HARGA-BUNGKUS" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'bungkus')||0))+'"></div>';
      mt+='<div><label class="lbl">Harga bungkuss</label><input id="TOOL-MAT-HARGA-BUNGKUSS" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'bungkuss')||0))+'"></div>';
      mt+='<div><label class="lbl">Harga pack</label><input id="TOOL-MAT-HARGA-PACK" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'pack')||0))+'"></div>';
      mt+='<div><label class="lbl">Harga set</label><input id="TOOL-MAT-HARGA-SET" class="fi" placeholder="0" value="'+esc(_num(editRow&&_toolsMaterialPrice(editRow,'set')||0))+'"></div>';
      mt+='</div><div style="display:grid;grid-template-columns:.9fr .9fr 1.6fr auto;gap:10px;margin-top:10px;align-items:end">';
      mt+='<div><label class="lbl">Masuk / Beli</label><input id="TOOL-MAT-MASUK" class="fi" placeholder="0" value="'+esc(_num(editRow&&editRow.masuk||0))+'"></div>';
      mt+='<div><label class="lbl">Minimum Stok</label><input id="TOOL-MAT-MIN" class="fi" placeholder="Batas order" value="'+esc(_num(editRow&&editRow.minStok||0))+'"></div>';
      mt+='<div><label class="lbl">Catatan</label><textarea id="TOOL-MAT-CAT" class="fi" rows="3" placeholder="Supplier, ukuran, atau catatan belanja">'+esc(editRow&&editRow.catatan||'')+'</textarea></div>';
      mt+='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btns" onclick="_toolsMaterialResetForm()">Reset</button><button class="btnp" onclick="_toolsMaterialSaveRow()">'+(editRow?'Update':'Simpan')+' Material</button></div>';
      mt+='</div></div>';
    }
    if(_toolMaterialOrderModalOpen){
      var matOpts=mats.map(function(r){ return '<option value="'+r.id+'"'+((orderRow&&orderRow.materialId||'')===r.id?' selected':'')+'>'+esc(r.nama||'-')+'</option>'; }).join('');
      var unitOpts=_toolsMaterialUnits().map(function(v){ return '<option value="'+esc(v)+'"'+(((orderRow&&orderRow.satuan)||'')===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('');
      var sesOpts=(_toolMaterialSessions||[]).map(function(s){ var selected=((orderRow&&orderRow.sessionId)||_toolMaterialActiveSessionId)===s.id?' selected':''; return '<option value="'+s.id+'"'+selected+'>'+esc(s.name||'-')+'</option>'; }).join('');
      var activeSessionName=_toolsMaterialSessionLabel(_toolMaterialActiveSessionId||'');
      var activeSessionDate=_toolsMaterialSessionCreatedAt(_toolMaterialActiveSessionId||'');
      mt+='<div onclick="_toolsMaterialOrderClose()" style="position:fixed;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(2px);z-index:2202"></div><div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1100px,calc(100vw - 32px));max-height:calc(100vh - 36px);overflow:auto;background:#0b0f14;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.48);z-index:2203"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Daftar Belanja Material</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Buat daftar pembelian dari material yang sudah ada, lalu ekspor atau kirim ke owner.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsMaterialOrderExportExcel()">Export Excel</button><button class="btnsm" onclick="_toolsMaterialOrderExportPDF()">Export PDF</button><button class="btnsm" onclick="_toolsMaterialOrderSendWA()">Kirim WA Owner</button><button class="btnsm" onclick="_toolsMaterialOrderClose()">Tutup</button></div></div>';
      mt+='<div class="card" style="margin-bottom:10px;background:#090909"><div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end"><div><label class="lbl">Sesi Aktif Belanja</label><select id="TOOL-MAT-ORD-SESSION" class="fi" onchange="_toolsMaterialSetActiveSession()">'+sesOpts+'</select><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+esc(activeSessionName)+' • '+esc(_toolsFmtDate(activeSessionDate||ymd()))+'</div></div><div><label class="lbl">Info Sesi</label><input class="fi" value="'+esc('Tanggal '+_toolsFmtDate(activeSessionDate||ymd())+' | Bulan '+(activeSessionDate?MONTHS[new Date(activeSessionDate).getMonth()]+' '+new Date(activeSessionDate).getFullYear():'-'))+'" readonly></div><div style="display:flex;justify-content:flex-end"><button class="btnsm" onclick="_toolsMaterialCreateSession()">+ Sesi Baru</button></div></div></div>';
      mt+='<div class="card" style="margin-bottom:12px;background:#090909"><div style="display:grid;grid-template-columns:1.2fr .55fr .55fr .8fr 1.2fr auto;gap:10px;align-items:end">';
      mt+='<div><label class="lbl">Nama Material</label><select id="TOOL-MAT-ORD-MATERIAL" class="fi" onchange="_toolsMaterialOrderSyncFromMaterial()"><option value="">Pilih material</option>'+matOpts+'</select></div>';
      mt+='<div><label class="lbl">Satuan</label><select id="TOOL-MAT-ORD-SAT" class="fi" onchange="_toolsMaterialOrderSyncFromMaterial()">'+unitOpts+'</select></div>';
      mt+='<div><label class="lbl">Qty Order</label><input id="TOOL-MAT-ORD-QTY" class="fi" placeholder="0" value="'+esc(_num(orderRow&&orderRow.qty||1))+'"></div>';
      mt+='<div><label class="lbl">Harga / Satuan</label><input id="TOOL-MAT-ORD-PRICE" class="fi" placeholder="0" value="'+esc(_num(orderRow&&orderRow.hargaSatuan||0))+'"></div>';
      mt+='<div><label class="lbl">Link Pembelian</label><div style="display:flex;gap:8px"><input id="TOOL-MAT-ORD-LINK" class="fi" placeholder="Link pembelian akan muncul otomatis" value="'+esc(orderRow&&orderRow.linkPembelian||'')+'"><button id="TOOL-MAT-ORD-LINK-BTN" class="btnsm" onclick="_toolsMaterialOrderOpenLink()"'+(!(orderRow&&orderRow.linkPembelian)?' disabled':'')+'>Buka Link</button></div></div>';
      mt+='<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btns" onclick="_toolsMaterialOrderOpen()">Reset</button><button class="btnp" onclick="_toolsMaterialOrderSave()">'+(orderRow?'Update':'Tambah')+'</button></div>';
      mt+='</div></div>';
      mt+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">Data Pembelian yang Sudah Diinput</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Daftar per sesi aktif. Checklist akan memindahkan item ke History Pembelanjaan.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Sesi: '+esc(_toolsMaterialSessionLabel(_toolMaterialActiveSessionId))+'</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Item: '+activeOrders.length+'</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Total Qty: '+fmt(orderQty)+'</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Done: '+orderDone+'</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Total Nominal: '+esc(_toolsMoney(orderNominal))+'</span></div></div>';
      mt+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Done</th><th>Sesi Belanja</th><th>Material</th><th>Satuan</th><th>Qty Order</th><th>Harga / Satuan</th><th>Subtotal</th><th>Link Pembelian</th><th>Terakhir Diperbarui</th><th>Aksi</th></tr></thead><tbody>';
      if(!activeOrders.length) mt+='<tr><td colspan="10" style="text-align:center;color:var(--tx2)">Belum ada data pembelian material pada sesi ini.</td></tr>';
      activeOrders.forEach(function(r){
        var isDone=!!r.ordered;
        mt+='<tr style="'+(isDone?'opacity:.72':'')+'"><td><input type="checkbox" '+(isDone?'checked':'')+' onchange="_toolsMaterialOrderToggleOrdered(\''+r.id+'\',this.checked)"></td><td><div style="font-weight:700">'+esc(_toolsMaterialSessionLabel(r.sessionId||''))+'</div><div style="font-size:11px;color:var(--tx2)">'+esc(_toolsFmtDate(_toolsMaterialSessionCreatedAt(r.sessionId||'')||ymd()))+'</div></td><td style="font-weight:700">'+esc(r.nama||'-')+'</td><td>'+esc(r.satuan||'-')+'</td><td>'+fmt(_num(r.qty))+'</td><td>'+esc(_toolsMoney(_num(r.hargaSatuan||0)))+'</td><td style="font-weight:700">'+esc(_toolsMoney(_num(r.subtotal)||(_num(r.qty)*_num(r.hargaSatuan))))+'</td><td>'+(r.linkPembelian?'<button class="btnsm" onclick="window.open(\''+String(r.linkPembelian).replace(/'/g,"&#39;")+'\',\'_blank\')">Buka Link</button>':'-')+'</td><td>'+esc(String(r.updatedAt||r.createdAt||'-').replace('T',' ').slice(0,16))+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsMaterialOrderOpen(\''+r.id+'\')">Edit</button><button class="btnsm" onclick="_toolsMaterialOrderDelete(\''+r.id+'\')">Hapus</button></div></td></tr>';
      });
      mt+='</tbody></table></div></div>';
      mt+='<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">History Pembelanjaan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Item yang sudah dichecklist masuk ke history sesi aktif.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">History: '+activeHistory.length+'</span></div></div>';
      mt+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Sesi</th><th>Material</th><th>Satuan</th><th>Qty</th><th>Subtotal</th><th>Selesai Dibeli</th><th>Aksi</th></tr></thead><tbody>';
      if(!activeHistory.length) mt+='<tr><td colspan="7" style="text-align:center;color:var(--tx2)">Belum ada history pembelanjaan di sesi ini.</td></tr>';
      activeHistory.forEach(function(r){
        mt+='<tr><td>'+esc(_toolsMaterialSessionLabel(r.sessionId||''))+'</td><td style="font-weight:700">'+esc(r.nama||'-')+'</td><td>'+esc(r.satuan||'-')+'</td><td>'+fmt(_num(r.qty))+'</td><td style="font-weight:700">'+esc(_toolsMoney(_num(r.subtotal)||(_num(r.qty)*_num(r.hargaSatuan))))+'</td><td>'+esc(String(r.completedAt||r.updatedAt||'-').replace('T',' ').slice(0,16))+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsMaterialHistoryRestore(\''+r.id+'\')">Kembalikan</button><button class="btnsm" onclick="_toolsMaterialHistoryDelete(\''+r.id+'\')">Hapus</button></div></td></tr>';
      });
      mt+='</tbody></table></div></div></div>';
    }
    content.innerHTML=mt;
    if(_toolMaterialOrderModalOpen) setTimeout(_toolsMaterialOrderSyncFromMaterial,0);
    return;
  }
  if(sub==='rumus'){
    renderTaliGFInto('TOOLS-CONTENT',true);
    return;
  }
  if(sub==='refund'){
    var rf='';
    rf+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px">';
    rf+='<div><label class="lbl">Tanggal</label><input id="TOOL-RF-DATE" type="date" class="fi" value="'+esc(ymd())+'"></div>';
    rf+='<div><label class="lbl">No Pesanan</label><input id="TOOL-RF-ORDER" class="fi" placeholder="Nomor pesanan"></div>';
    rf+='<div><label class="lbl">No Resi</label><input id="TOOL-RF-RESI" class="fi" placeholder="Nomor resi"></div>';
    rf+='<div><label class="lbl">Marketplace</label>'+_toolsMarketplaceSelect('TOOL-RF-MARKET','')+'</div>';
    rf+='<div><label class="lbl">Nama Item</label><input id="TOOL-RF-ITEM" class="fi" placeholder="Item yang direfund"></div>';
    rf+='</div><div style="display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:10px;margin-top:10px">';
    rf+='<div><label class="lbl">Nominal</label><input id="TOOL-RF-NOMINAL" class="fi" placeholder="Contoh 25000"></div>';
    rf+='<div><label class="lbl">Grup WhatsApp Refund</label>'+_toolsGroupSelect('TOOL-RF-GROUP','','refund')+'</div>';
    rf+='<div><label class="lbl">Catatan</label><textarea id="TOOL-RF-NOTES" class="fi" rows="3" placeholder="Pesanan tidak lengkap, item kosong, dll"></textarea></div>';
    rf+='</div>'+_toolsMediaBox('TOOL-RF-MEDIA','Upload / Paste Gambar Refund','refund','TOOL-RF-AI','TOOL-RF-ORDER|TOOL-RF-RESI|TOOL-RF-MARKET|TOOL-RF-ITEM|TOOL-RF-NOMINAL|TOOL-RF-NOTES')+'<div style="margin-top:10px"><label class="lbl">Analisa AI</label><textarea id="TOOL-RF-AI" class="fi" rows="5" placeholder="Hasil analisa AI dari gambar akan muncul di sini jika tombol AI dipakai."></textarea></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button class="btnp" onclick="_saveRefundRecord()">Simpan Pengembalian Dana</button></div></div>';
    rf+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:13px;font-weight:800;color:var(--tx)">Daftar Pengembalian Dana</div><div style="font-size:11px;color:var(--tx2)">'+_toolRefunds.length+' data</div></div>';
    rf+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>No Pesanan</th><th>No Resi</th><th>Marketplace</th><th>Item</th><th>Nominal</th><th>Analisa AI</th><th>Lampiran</th><th>Grup WhatsApp</th><th>Output</th><th>Aksi</th></tr></thead><tbody>';
    if(!_toolRefunds.length) rf+='<tr><td colspan="11" style="text-align:center;color:var(--tx2)">Belum ada data pengembalian dana.</td></tr>';
    _toolRefunds.forEach(function(r){
      rf+='<tr><td>'+esc(_toolsFmtDate(r.inputDate||r.ts))+'</td><td>'+esc(r.orderNo)+'</td><td>'+esc(r.trackingNo||'-')+'</td><td>'+esc(r.marketplace)+'</td><td>'+esc(r.itemName)+'</td><td style="font-weight:700">'+esc(_toolsMoney(r.nominal))+'</td><td style="max-width:260px">'+esc((r.aiAnalysis||'-')).slice(0,180)+'</td><td>'+(r.imageData?'<button class="btnsm" onclick="_toolsOpenRecordImageById(\'refund\',\''+r.id+'\')">Buka Gambar</button>':'-')+'</td><td>'+esc(_toolsGroupLabel(r.groupId||'-'))+'</td>';
      rf+='<td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsOpenOutputPreview(\'refund\',\''+r.id+'\')">Preview</button>';
      rf+='<button class="btnsm" onclick="_toolsSendWhatsApp(\'refund\',\''+r.id+'\')">Kirim WA Refund</button></div></td>';
      rf+='<td><button class="btnsm" onclick="_deleteRefundRecord(\''+r.id+'\')">Hapus</button></td></tr>';
    });
    rf+='</tbody></table></div></div>';
    content.innerHTML=rf;
    return;
  }
  if(sub==='complaint'){
    var cp='';
    cp+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px">';
    cp+='<div><label class="lbl">Tanggal</label><input id="TOOL-CP-DATE" type="date" class="fi" value="'+esc(ymd())+'"></div>';
    cp+='<div><label class="lbl">No Pesanan</label><input id="TOOL-CP-ORDER" class="fi" placeholder="Nomor pesanan"></div>';
    cp+='<div><label class="lbl">No Resi</label><input id="TOOL-CP-RESI" class="fi" placeholder="Nomor resi"></div>';
    cp+='<div><label class="lbl">Marketplace</label>'+_toolsMarketplaceSelect('TOOL-CP-MARKET','')+'</div>';
    cp+='<div><label class="lbl">Produk</label><input id="TOOL-CP-PRODUCT" class="fi" placeholder="Nama produk / item"></div>';
    cp+='<div><label class="lbl">Jenis Komplain</label><select id="TOOL-CP-TYPE" class="fi"><option value="">Pilih jenis</option><option>Tidak Sesuai</option><option>Barang Rusak</option><option>Kekurangan Barang</option><option>Salah Varian</option><option>Lainnya</option></select></div>';
    cp+='</div><div style="display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:10px;margin-top:10px">';
    cp+='<div><label class="lbl">Nominal Dampak</label><input id="TOOL-CP-NOMINAL" class="fi" placeholder="Contoh 25000"></div>';
    cp+='<div><label class="lbl">Detail Komplain</label><textarea id="TOOL-CP-DETAIL" class="fi" rows="4" placeholder="Jelaskan kondisi paket / barang yang diterima"></textarea></div>';
    cp+='<div><label class="lbl">Tindak Lanjut</label><textarea id="TOOL-CP-ACTION" class="fi" rows="4" placeholder="Refund, kirim ulang, follow up supplier, dll"></textarea><div style="margin-top:10px"><label class="lbl">Grup WhatsApp Komplain</label>'+_toolsGroupSelect('TOOL-CP-GROUP','','complaint')+'</div></div>';
    cp+='</div>'+_toolsMediaBox('TOOL-CP-MEDIA','Upload / Paste Bukti Komplain','complaint','TOOL-CP-AI','TOOL-CP-ORDER|TOOL-CP-RESI|TOOL-CP-MARKET|TOOL-CP-PRODUCT|TOOL-CP-TYPE|TOOL-CP-NOMINAL|TOOL-CP-DETAIL|TOOL-CP-ACTION')+'<div style="margin-top:10px"><label class="lbl">Analisa AI</label><textarea id="TOOL-CP-AI" class="fi" rows="5" placeholder="Hasil analisa AI dari gambar akan muncul di sini jika tombol AI dipakai."></textarea></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button class="btnp" onclick="_saveComplaintRecord()">Simpan Komplain</button></div></div>';
    cp+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:13px;font-weight:800;color:var(--tx)">Laporan Komplain</div><div style="font-size:11px;color:var(--tx2)">'+_toolComplaints.length+' data</div></div>';
    cp+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>No Pesanan</th><th>No Resi</th><th>Marketplace</th><th>Produk</th><th>Jenis</th><th>Nominal</th><th>Analisa AI</th><th>Lampiran</th><th>Detail</th><th>Tindak Lanjut</th><th>Grup WhatsApp</th><th>Aksi</th></tr></thead><tbody>';
    if(!_toolComplaints.length) cp+='<tr><td colspan="13" style="text-align:center;color:var(--tx2)">Belum ada data komplain.</td></tr>';
    _toolComplaints.forEach(function(r){
      cp+='<tr><td>'+esc(_toolsFmtDate(r.inputDate||r.ts))+'</td><td>'+esc(r.orderNo)+'</td><td>'+esc(r.trackingNo||'-')+'</td><td>'+esc(r.marketplace)+'</td><td>'+esc(r.product||'-')+'</td><td>'+esc(r.issueType)+'</td><td style="font-weight:700">'+esc(_toolsMoney(r.nominal||0))+'</td><td style="max-width:260px">'+esc((r.aiAnalysis||'-')).slice(0,180)+'</td><td>'+(r.imageData?'<button class="btnsm" onclick="_toolsOpenRecordImageById(\'complaint\',\''+r.id+'\')">Buka Gambar</button>':'-')+'</td><td>'+esc(r.detail)+'</td><td>'+esc(r.action||'-')+'</td><td>'+esc(_toolsGroupLabel(r.groupId||'-'))+'</td>';
      cp+='<td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsOpenOutputPreview(\'complaint\',\''+r.id+'\')">Preview</button><button class="btnsm" onclick="_toolsSendWhatsApp(\'complaint\',\''+r.id+'\')">Kirim WA Komplain</button><button class="btnsm" onclick="_deleteComplaintRecord(\''+r.id+'\')">Hapus</button></div></td></tr>';
    });
    cp+='</tbody></table></div></div>';
    content.innerHTML=cp;
    return;
  }
  var rq='';
  rq+='<div class="card" style="margin-bottom:12px"><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">';
  rq+='<div><label class="lbl">Tanggal</label><input id="TOOL-RQ-DATE" type="date" class="fi" value="'+esc(ymd())+'"></div>';
  rq+='<div><label class="lbl">No Pesanan</label><input id="TOOL-RQ-ORDER" class="fi" placeholder="Nomor pesanan"></div>';
  rq+='<div><label class="lbl">No Resi</label><input id="TOOL-RQ-RESI" class="fi" placeholder="Nomor resi"></div>';
  rq+='<div><label class="lbl">Marketplace</label>'+_toolsMarketplaceSelect('TOOL-RQ-MARKET','')+'</div>';
  rq+='</div><div style="display:grid;grid-template-columns:1.2fr .8fr;gap:10px;margin-top:10px">';
  rq+='<div><label class="lbl">Produk</label><input id="TOOL-RQ-PRODUCT" class="fi" placeholder="Produk / item yang diminta"></div>';
  rq+='<div><label class="lbl">Grup WhatsApp Request</label>'+_toolsGroupSelect('TOOL-RQ-GROUP','','request')+'</div>';
  rq+='</div><div style="margin-top:10px"><label class="lbl">Detail Request</label><textarea id="TOOL-RQ-DETAIL" class="fi" rows="4" placeholder="Tuliskan detail request / planning / kebutuhan tindak lanjut"></textarea></div>';
  rq+=_toolsMediaBox('TOOL-RQ-MEDIA','Upload / Paste Lampiran Request','request','TOOL-RQ-AI','TOOL-RQ-ORDER|TOOL-RQ-RESI|TOOL-RQ-MARKET|TOOL-RQ-PRODUCT|TOOL-RQ-DETAIL')+'<div style="margin-top:10px"><label class="lbl">Analisa AI</label><textarea id="TOOL-RQ-AI" class="fi" rows="5" placeholder="Hasil analisa AI dari gambar akan muncul di sini jika tombol AI dipakai."></textarea></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button class="btnp" onclick="_saveRequestRecord()">Simpan Request</button></div></div>';
  rq+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:13px;font-weight:800;color:var(--tx)">Daftar Request</div><div style="font-size:11px;color:var(--tx2)">'+_toolRequests.length+' data</div></div>';
  rq+='<div style="overflow:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>No Pesanan</th><th>No Resi</th><th>Marketplace</th><th>Produk</th><th>Analisa AI</th><th>Lampiran</th><th>Detail</th><th>Grup WhatsApp</th><th>Aksi</th></tr></thead><tbody>';
  if(!_toolRequests.length) rq+='<tr><td colspan="10" style="text-align:center;color:var(--tx2)">Belum ada data request.</td></tr>';
  _toolRequests.forEach(function(r){
    rq+='<tr><td>'+esc(_toolsFmtDate(r.inputDate||r.ts))+'</td><td>'+esc(r.orderNo||'-')+'</td><td>'+esc(r.trackingNo||'-')+'</td><td>'+esc(r.marketplace||'-')+'</td><td>'+esc(r.product||r.title||'-')+'</td><td style="max-width:260px">'+esc((r.aiAnalysis||'-')).slice(0,180)+'</td><td>'+(r.imageData?'<button class="btnsm" onclick="_toolsOpenRecordImageById(\'request\',\''+r.id+'\')">Buka Gambar</button>':'-')+'</td><td>'+esc(r.detail)+'</td><td>'+esc(_toolsGroupLabel(r.groupId||'-'))+'</td>';
    rq+='<td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsOpenOutputPreview(\'request\',\''+r.id+'\')">Preview</button><button class="btnsm" onclick="_toolsSendWhatsApp(\'request\',\''+r.id+'\')">Kirim WA Request</button><button class="btnsm" onclick="_deleteRequestRecord(\''+r.id+'\')">Hapus</button></div></td></tr>';
  });
  rq+='</tbody></table></div></div>';
  content.innerHTML=rq;
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

  request: function(method, path, opt){
    opt = opt || {};
    var headers = this.hdr(opt.headers || {});
    if(opt.noJsonContentType) delete headers['Content-Type'];
    return fetch(this.url + path, {
      method: method,
      headers: headers,
      body: opt.body == null ? undefined : (typeof opt.body === 'string' ? opt.body : JSON.stringify(opt.body))
    }).then(function(r){
      return r.text().then(function(t){
        var parsed = null;
        try{ parsed = t ? JSON.parse(t) : null; }catch(e){}
        if(r.ok) return {ok:true, status:r.status, text:t, json:parsed};
        var err = new Error((parsed && (parsed.message || parsed.error_description || parsed.hint)) || t || ('HTTP ' + r.status));
        err.status = r.status;
        err.body = parsed || t;
        throw err;
      });
    });
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

  replaceTable: function(table, keyField, records){
    var self = this;
    keyField = keyField || 'id';
    return self.request('DELETE', '/rest/v1/' + table + '?' + keyField + '=not.is.null', {
      headers: {'Prefer':'return=minimal'}
    }).catch(function(err){
      if(err && err.status === 404) throw err;
      return {ok:true};
    }).then(function(){
      return self.upsertMany(table, records || []);
    });
  },

  probeTable: function(table, columns){
    var select = columns && columns.length ? columns.join(',') : '*';
    return fetch(this.url + '/rest/v1/' + table + '?select=' + encodeURIComponent(select) + '&limit=1', {
      method: 'GET',
      headers: {'apikey': this.key, 'Authorization': 'Bearer ' + this.key}
    }).then(function(r){
      return r.text().then(function(t){
        if(r.ok) return {table:table, ok:true, exists:true, status:r.status, message:''};
        var raw = String(t || '');
        var low = raw.toLowerCase();
        var missingTable = r.status === 404 || low.indexOf('could not find the table') >= 0 || (low.indexOf('relation') >= 0 && low.indexOf('does not exist') >= 0);
        var missingColumn = low.indexOf('column') >= 0 && low.indexOf('does not exist') >= 0;
        return {
          table: table,
          ok: false,
          exists: !missingTable,
          status: r.status,
          reason: missingTable ? 'missing_table' : (missingColumn ? 'missing_column' : 'error'),
          message: raw
        };
      });
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
  runSupabaseSchemaAudit(true).catch(function(){ return _sbSchemaAudit || {}; }).then(function(audit){
    var results = {};
    var steps = [
      ['employees', function(){ return SB.getAll('ajw_employees', 'id.desc'); }],
      ['evals', function(){ return SB.getAll('ajw_eval', 'id.desc'); }],
      ['payrolls', function(){ return SB.getAll('ajw_payroll', 'id.desc'); }],
      ['kpi', function(){ return SB.getAll('ajw_kpi', 'periode.desc'); }],
      ['supplier', function(){ return SB.getAll('ajw_supplier', 'id.desc'); }],
      ['hrSops', function(){ return SB.getAll('ajw_hr_sops', 'updated_at.desc'); }],
      ['hrControlRows', function(){ return SB.getAll('ajw_hr_control', 'updated_at.desc'); }],
      ['devHubRows', function(){ return SB.getAll('ajw_dev_hub', 'updated_at.desc'); }],
      ['customerDataRows', function(){ return SB.getAll('ajw_customer_data', 'updated_at.desc'); }],
      ['analyticsRows', function(){ return SB.getAll('ajw_analytics_data', 'updated_at.desc'); }],
      ['toolRefunds', function(){ return SB.getAll('ajw_tool_refunds', 'input_date.desc'); }],
      ['toolComplaints', function(){ return SB.getAll('ajw_tool_complaints', 'input_date.desc'); }],
      ['toolRequests', function(){ return SB.getAll('ajw_tool_requests', 'input_date.desc'); }],
      ['toolMaterialStockRows', function(){ return SB.getAll('ajw_tool_material_stock', 'updated_at.desc'); }],
      ['toolMaterialOrders', function(){ return SB.getAll('ajw_tool_material_orders', 'updated_at.desc'); }],
      ['toolMaterialOrderHistory', function(){ return SB.getAll('ajw_tool_material_order_history', 'updated_at.desc'); }],
      ['toolMaterialSessions', function(){ return SB.getAll('ajw_tool_material_sessions', 'updated_at.desc'); }],
      ['toolProducts', function(){ return SB.getAll('ajw_tool_products', 'updated_at.desc'); }],
      ['toolDescRows', function(){ return SB.getAll('ajw_tool_desc_revision', 'updated_at.desc'); }],
      ['toolAutomationJobs', function(){ return SB.getAll('ajw_tool_automation_jobs', 'updated_at.desc'); }],
      ['toolAutomationLogs', function(){ return SB.getAll('ajw_tool_automation_logs', 'created_at.desc'); }],
      ['toolWebhooks', function(){ return SB.getAll('ajw_tool_webhooks', 'updated_at.desc'); }],
      ['toolBlastRows', function(){ return SB.getAll('ajw_tool_blast_rows', 'updated_at.desc'); }],
      ['toolBlastHistory', function(){ return SB.getAll('ajw_tool_blast_history', 'updated_at.desc'); }],
      ['toolBlastPhoneDb', function(){ return SB.getAll('ajw_tool_blast_phone_db', 'updated_at.desc'); }],
      ['toolBlastMarketing', function(){ return SB.getAll('ajw_tool_blast_marketing', 'updated_at.desc'); }],
      ['toolPickingRows', function(){ return SB.getAll('ajw_tool_picking_rows', 'updated_at.desc'); }],
      ['toolPickingHistory', function(){ return SB.getAll('ajw_tool_picking_history', 'updated_at.desc'); }],
      ['toolMeta', function(){ return SB.getAll('ajw_tool_meta', 'key.asc'); }],
      ['config', function(){ return SB.getAll('ajw_config', 'key.asc'); }]
    ];
    if(audit && audit.financeReady){
      steps = steps.concat([
        ['finIncome', function(){ return SB.getAll('ajw_fin_income', 'tanggal.desc'); }],
        ['finExpense', function(){ return SB.getAll('ajw_fin_expense', 'tanggal.desc'); }],
        ['finAssets', function(){ return SB.getAll('ajw_fin_assets', 'tanggal.desc'); }],
        ['finSubscriptions', function(){ return SB.getAll('ajw_fin_subscriptions', 'next_payment.asc'); }],
        ['finMonthly', function(){ return SB.getAll('ajw_fin_monthly', 'key.asc'); }],
        ['finMeta', function(){ return SB.getAll('ajw_fin_meta', 'key.asc'); }]
      ]);
    }
    if(audit && audit.logReady && !_sbSafeModeEnabled()){
      steps.push(['syncLog', function(){ return SB.getAll('ajw_sync_log', 'created_at.desc'); }]);
    }
    return _sbRunSeries(steps.map(function(step){
      return function(){
        return step[1]().then(function(val){
          results[step[0]] = val;
          return val;
        }).catch(function(err){
          console.warn('loadFromSupabase ' + step[0] + ':', err);
          results[step[0]] = null;
          return null;
        });
      };
    })).then(function(){
      return {audit:audit || {}, results:results};
    });
  }).then(function(payload){
    var audit = payload.audit || {};
    var results = payload.results || {};
    var changed = false;
    window._sbSuspendDirty = true;
    try{

      if(results.employees && results.employees.length){
        employees = results.employees.map(function(r){ return r.data; });
        sv('ajw_emp', employees); changed = true;
      }
      if(results.evals && results.evals.length){
        evalHistory = results.evals.map(function(r){ return r.data; });
        sv('ajw_eval', evalHistory); changed = true;
      }
      if(results.payrolls && results.payrolls.length){
        payHistory = results.payrolls.map(function(r){ return r.data; });
        sv('ajw_pay', payHistory); changed = true;
      }
      if(results.kpi && results.kpi.length){
        kpiData = results.kpi.map(function(r){ return r.data; });
        sv('ajw_kpi', kpiData); changed = true;
      }
      if(results.supplier && results.supplier.length){
        supplierHutang = results.supplier.map(function(r){ return r.data; });
        sv('ajw_supplier', supplierHutang); changed = true;
      }
      if(results.hrSops && results.hrSops.length){
        _hrSops = results.hrSops.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_hr_sops', JSON.stringify(_hrSops)); }catch(e){}
        changed = true;
      }
      if(results.hrControlRows && results.hrControlRows.length){
        _hrControlData = (results.hrControlRows[0] && results.hrControlRows[0].data) || _hrControlData || {};
        try{ localStorage.setItem('ajw_hr_control', JSON.stringify(_hrControlData)); }catch(e){}
        changed = true;
      }
      if(results.devHubRows && results.devHubRows.length){
        _devHub = (results.devHubRows[0] && results.devHubRows[0].data) || _devHub || {};
        try{ localStorage.setItem('ajw_dev_hub', JSON.stringify(_devHub)); }catch(e){}
        changed = true;
      }
      if(results.customerDataRows && results.customerDataRows.length){
        window._analyticsData = (typeof window._analyticsData==='object' && window._analyticsData) ? window._analyticsData : {};
        window._analyticsData.customers = results.customerDataRows.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_analytics_data', JSON.stringify(window._analyticsData)); }catch(e){}
        changed = true;
      }
      if(results.analyticsRows && results.analyticsRows.length){
        window._analyticsData = (typeof window._analyticsData==='object' && window._analyticsData) ? window._analyticsData : {};
        (results.analyticsRows||[]).forEach(function(r){
          if(r && r.scope) window._analyticsData[r.scope] = r.data || [];
        });
        try{ localStorage.setItem('ajw_analytics_data', JSON.stringify(window._analyticsData)); }catch(e){}
        changed = true;
      }
      if(results.toolRefunds && results.toolRefunds.length){
        _toolRefunds = results.toolRefunds.map(function(r){
          return Object.assign({}, r.data || {}, {imageData:r.image_data || ((r.data||{}).imageData) || '', imageName:r.image_name || ((r.data||{}).imageName) || '', groupId:r.group_id || ((r.data||{}).groupId) || _toolsGroupId('refund')});
        });
        try{ localStorage.setItem('ajw_tools_refunds', JSON.stringify(_toolRefunds)); }catch(e){}
        changed = true;
      }
      if(results.toolComplaints && results.toolComplaints.length){
        _toolComplaints = results.toolComplaints.map(function(r){
          return Object.assign({}, r.data || {}, {imageData:r.image_data || ((r.data||{}).imageData) || '', imageName:r.image_name || ((r.data||{}).imageName) || '', groupId:r.group_id || ((r.data||{}).groupId) || _toolsGroupId('complaint')});
        });
        try{ localStorage.setItem('ajw_tools_complaints', JSON.stringify(_toolComplaints)); }catch(e){}
        changed = true;
      }
      if(results.toolRequests && results.toolRequests.length){
        _toolRequests = results.toolRequests.map(function(r){
          return Object.assign({}, r.data || {}, {imageData:r.image_data || ((r.data||{}).imageData) || '', imageName:r.image_name || ((r.data||{}).imageName) || '', groupId:r.group_id || ((r.data||{}).groupId) || _toolsGroupId('request')});
        });
        try{ localStorage.setItem('ajw_tools_requests', JSON.stringify(_toolRequests)); }catch(e){}
        changed = true;
      }
      if(results.toolMaterialStockRows && results.toolMaterialStockRows.length){
        _toolMaterialStock = results.toolMaterialStockRows.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_material_stock', JSON.stringify(_toolMaterialStock)); }catch(e){}
        changed = true;
      }
      if(results.toolMaterialOrders && results.toolMaterialOrders.length){
        _toolMaterialOrders = results.toolMaterialOrders.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_material_orders', JSON.stringify(_toolMaterialOrders)); }catch(e){}
        changed = true;
      }
      if(results.toolMaterialOrderHistory && results.toolMaterialOrderHistory.length){
        _toolMaterialOrderHistory = results.toolMaterialOrderHistory.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_material_order_history', JSON.stringify(_toolMaterialOrderHistory)); }catch(e){}
        changed = true;
      }
      if(results.toolMaterialSessions && results.toolMaterialSessions.length){
        _toolMaterialSessions = results.toolMaterialSessions.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_material_sessions', JSON.stringify(_toolMaterialSessions)); }catch(e){}
        changed = true;
      }

      var cfgRows = results.config || [];
      var cfgMap = {};
      cfgRows.forEach(function(r){ if(r && r.key) cfgMap[r.key] = r.value || {}; });
      var toolMetaMap = {};
      (results.toolMeta || []).forEach(function(r){ if(r && r.key) toolMetaMap[r.key] = r.value || {}; });
      function _cfgData(key, fallback){
        var box = cfgMap[key];
        if(box && box.data != null) return box.data;
        return fallback;
      }
      function _cfgHas(key){
        return Object.prototype.hasOwnProperty.call(cfgMap, key);
      }
      function _takePreferredList(remoteRows, mapper, localRows, cfgKey, storageKey){
        var next = Array.isArray(localRows) ? localRows.slice() : [];
        var used = false;
        if(Array.isArray(remoteRows) && remoteRows.length){
          next = remoteRows.map(mapper);
          used = true;
        } else if(!next.length && _cfgHas(cfgKey)){
          var cfgVal = _cfgData(cfgKey, []);
          next = Array.isArray(cfgVal) ? cfgVal : [];
          used = true;
        }
        if(used && storageKey){
          try{ localStorage.setItem(storageKey, JSON.stringify(next)); }catch(e){}
          changed = true;
        }
        return next;
      }
      if(results.toolAutomationJobs && results.toolAutomationJobs.length){
        _toolAutomationJobs = results.toolAutomationJobs.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_automation_jobs', JSON.stringify(_toolAutomationJobs)); }catch(e){}
        changed = true;
      }
      if(results.toolAutomationLogs && results.toolAutomationLogs.length){
        _toolAutomationLogs = results.toolAutomationLogs.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_automation_logs', JSON.stringify(_toolAutomationLogs)); }catch(e){}
        changed = true;
      }
      if(results.toolWebhooks && results.toolWebhooks.length){
        _toolWebhookDefs = results.toolWebhooks.map(function(r){ return r.data || {}; });
        try{ localStorage.setItem('ajw_tools_webhooks', JSON.stringify(_toolWebhookDefs)); }catch(e){}
        changed = true;
      }
      if(cfgMap.supabase_schema_audit){
        _sbSchemaAudit = _cfgData('supabase_schema_audit', _sbSchemaAudit) || _sbSchemaAudit;
        _sbPersistSchemaState();
      }
      if(cfgMap.supabase_schema_log){
        _sbSchemaLog = _cfgData('supabase_schema_log', _sbSchemaLog) || _sbSchemaLog;
        _sbPersistSchemaState();
      }
      if(cfgMap.cfg_safe){
        var curr = getCfg();
        saveCfg(Object.assign({}, curr, cfgMap.cfg_safe || {}));
        changed = true;
      }
      if(_cfgData('tabs', null) || _cfgData('custom_tabs', null)){
        customTabs = _cfgData('custom_tabs', _cfgData('tabs', [])) || [];
        try{ localStorage.setItem('ajw_tabs', JSON.stringify(customTabs)); }catch(e){}
        changed = true;
      }
      if(_cfgData('sup_data', null)){
        supplierData = _cfgData('sup_data', []) || [];
        try{ localStorage.setItem('ajw_sup_data', JSON.stringify(supplierData)); }catch(e){}
        changed = true;
      }
      if(_cfgData('pesanan_data', null)){
        pesananData = _cfgData('pesanan_data', []) || [];
        try{ localStorage.setItem('ajw_pesanan', JSON.stringify(pesananData)); }catch(e){}
        changed = true;
      }
      if(_cfgData('laporan_bulanan', null)){
        _lb = _cfgData('laporan_bulanan', []) || [];
        try{ localStorage.setItem('ajw_laporan', JSON.stringify(_lb)); }catch(e){}
        changed = true;
      }
      if(_cfgData('dev_hub', null)){
        _devHub = _cfgData('dev_hub', null) || _devHub;
        try{ localStorage.setItem('ajw_dev_hub', JSON.stringify(_devHub)); }catch(e){}
        changed = true;
      }
      if(_cfgData('hr_sops', null)){
        _hrSops = _cfgData('hr_sops', []) || [];
        try{ localStorage.setItem('ajw_hr_sops', JSON.stringify(_hrSops)); }catch(e){}
        changed = true;
      }
      if(_cfgData('hr_control', null)){
        _hrControlData = _cfgData('hr_control', null) || _hrControlData;
        try{ localStorage.setItem('ajw_hr_control', JSON.stringify(_hrControlData)); }catch(e){}
        changed = true;
      }
      if(_cfgData('profit_data', null)){
        _profitData = _cfgData('profit_data', []) || [];
        try{ localStorage.setItem('ajw_profit', JSON.stringify(_profitData)); }catch(e){}
        changed = true;
      }
      _toolProductRows = _takePreferredList(results.toolProducts, function(r){ return r.data || {}; }, _toolProductRows, null, 'ajw_tools_product_rows');
      _toolDescRows = _takePreferredList(results.toolDescRows, function(r){ return r.data || {}; }, _toolDescRows, null, 'ajw_tools_desc_revision_rows');
      _toolBlastRows = _takePreferredList(results.toolBlastRows, function(r){ return r.data || {}; }, _toolBlastRows, null, 'ajw_tools_blast_rows');
      _toolBlastHistory = _takePreferredList(results.toolBlastHistory, function(r){ return r.data || {}; }, _toolBlastHistory, null, 'ajw_tools_blast_history');
      _toolBlastPhoneDb = _takePreferredList(results.toolBlastPhoneDb, function(r){ return r.data || {}; }, _toolBlastPhoneDb, null, 'ajw_tools_blast_phone_db');
      _toolBlastMarketingSchedules = _takePreferredList(results.toolBlastMarketing, function(r){ return r.data || {}; }, _toolBlastMarketingSchedules, null, 'ajw_tools_blast_marketing_schedules');
      _toolPickingRows = _takePreferredList(results.toolPickingRows, function(r){ return r.data || {}; }, _toolPickingRows, null, 'ajw_tools_picking_rows');
      _toolPickingHistory = _takePreferredList(results.toolPickingHistory, function(r){ return r.data || {}; }, _toolPickingHistory, null, 'ajw_tools_picking_history');
      if(toolMetaMap.desc_prompt && toolMetaMap.desc_prompt.data != null){
        _toolDescPrompt = String(toolMetaMap.desc_prompt.data || '');
        try{ localStorage.setItem('ajw_tools_desc_revision_prompt', _toolDescPrompt); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.blast_template && toolMetaMap.blast_template.data != null){
        _toolBlastTemplate = String(toolMetaMap.blast_template.data || '');
        try{ localStorage.setItem('ajw_tools_blast_template', _toolBlastTemplate); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.blast_delay_ms && toolMetaMap.blast_delay_ms.data != null){
        _toolBlastSendDelayMs = Number(toolMetaMap.blast_delay_ms.data || 2500) || 2500;
        try{ localStorage.setItem('ajw_tools_blast_delay_ms', String(_toolBlastSendDelayMs)); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.blast_marketing_template && toolMetaMap.blast_marketing_template.data != null){
        _toolBlastMarketingTemplate = String(toolMetaMap.blast_marketing_template.data || '');
        try{ localStorage.setItem('ajw_tools_blast_marketing_template', _toolBlastMarketingTemplate); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.material_active_session && toolMetaMap.material_active_session.data != null){
        _toolMaterialActiveSessionId = String(toolMetaMap.material_active_session.data || '').trim();
        try{ localStorage.setItem('ajw_tools_material_active_session', _toolMaterialActiveSessionId); }catch(e){}
        changed = true;
      } else if(_cfgHas('tools_material_active_session')){
        _toolMaterialActiveSessionId = String(_cfgData('tools_material_active_session', _toolMaterialActiveSessionId) || '').trim();
        try{ localStorage.setItem('ajw_tools_material_active_session', _toolMaterialActiveSessionId); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.agent_bridge && toolMetaMap.agent_bridge.data != null){
        _toolAgentBridge = toolMetaMap.agent_bridge.data || {};
        try{ localStorage.setItem('ajw_tools_agent_bridge', JSON.stringify(_toolAgentBridge)); }catch(e){}
        changed = true;
      } else if(_cfgHas('tools_agent_bridge')){
        _toolAgentBridge = _cfgData('tools_agent_bridge', _toolAgentBridge) || {};
        try{ localStorage.setItem('ajw_tools_agent_bridge', JSON.stringify(_toolAgentBridge)); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.picking_config && toolMetaMap.picking_config.data != null){
        _toolPickingConfig = toolMetaMap.picking_config.data || {};
        try{ localStorage.setItem('ajw_tools_picking_config', JSON.stringify(_toolPickingConfig)); }catch(e){}
        changed = true;
      } else if(_cfgHas('tools_picking_config')){
        _toolPickingConfig = _cfgData('tools_picking_config', _toolPickingConfig) || {};
        try{ localStorage.setItem('ajw_tools_picking_config', JSON.stringify(_toolPickingConfig)); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.picking_processed && toolMetaMap.picking_processed.data != null){
        _toolPickingProcessed = toolMetaMap.picking_processed.data || {bundling:[],satuan:[],processedAt:''};
        try{ localStorage.setItem('ajw_tools_picking_processed', JSON.stringify(_toolPickingProcessed)); }catch(e){}
        changed = true;
      } else if(_cfgHas('tools_picking_processed')){
        _toolPickingProcessed = _cfgData('tools_picking_processed', _toolPickingProcessed) || {bundling:[],satuan:[],processedAt:''};
        try{ localStorage.setItem('ajw_tools_picking_processed', JSON.stringify(_toolPickingProcessed)); }catch(e){}
        changed = true;
      }
      if(toolMetaMap.picking_watch && toolMetaMap.picking_watch.data != null){
        _toolPickingWatch = toolMetaMap.picking_watch.data || {};
        try{ localStorage.setItem('ajw_tools_picking_watch', JSON.stringify(_toolPickingWatch)); }catch(e){}
        changed = true;
      } else if(_cfgHas('tools_picking_watch')){
        _toolPickingWatch = _cfgData('tools_picking_watch', _toolPickingWatch) || {};
        try{ localStorage.setItem('ajw_tools_picking_watch', JSON.stringify(_toolPickingWatch)); }catch(e){}
        changed = true;
      }
      if(_cfgHas('tools_desc_prompt')){
        _toolDescPrompt = String(_cfgData('tools_desc_prompt', _toolDescPrompt) || '');
        try{ localStorage.setItem('ajw_tools_desc_revision_prompt', _toolDescPrompt); }catch(e){}
        changed = true;
      }
      if(_cfgHas('tools_blast_template')){
        _toolBlastTemplate = String(_cfgData('tools_blast_template', _toolBlastTemplate) || '');
        try{ localStorage.setItem('ajw_tools_blast_template', _toolBlastTemplate); }catch(e){}
        changed = true;
      }
      if(_cfgHas('tools_blast_delay_ms')){
        _toolBlastSendDelayMs = Number(_cfgData('tools_blast_delay_ms', _toolBlastSendDelayMs) || _toolBlastSendDelayMs || 2500) || 2500;
        try{ localStorage.setItem('ajw_tools_blast_delay_ms', String(_toolBlastSendDelayMs)); }catch(e){}
        changed = true;
      }
      if(_cfgHas('tools_blast_marketing_template')){
        _toolBlastMarketingTemplate = String(_cfgData('tools_blast_marketing_template', _toolBlastMarketingTemplate) || '');
        try{ localStorage.setItem('ajw_tools_blast_marketing_template', _toolBlastMarketingTemplate); }catch(e){}
        changed = true;
      }

      var financeCloudHasAnyRows = !!(
        (results.finIncome && results.finIncome.length) ||
        (results.finExpense && results.finExpense.length) ||
        (results.finAssets && results.finAssets.length) ||
        (results.finSubscriptions && results.finSubscriptions.length) ||
        (results.finMonthly && results.finMonthly.length) ||
        (results.finMeta && results.finMeta.length)
      );
      if(audit.financeReady && financeCloudHasAnyRows){
        _finIncome = _takePreferredList(results.finIncome, function(r){ return r.data || {}; }, _finIncome, 'fin_income', 'ajw_fin_income');
        _finExpense = _takePreferredList(results.finExpense, function(r){ return r.data || {}; }, _finExpense, 'fin_expense', 'ajw_fin_expense');
        _finAssets = _takePreferredList(results.finAssets, function(r){ return r.data || {}; }, _finAssets, 'fin_assets', 'ajw_fin_assets');
        _finSubscriptions = _takePreferredList(results.finSubscriptions, function(r){ return r.data || {}; }, _finSubscriptions, 'fin_subscriptions', 'ajw_fin_subscriptions');
        if(Array.isArray(results.finMonthly) && results.finMonthly.length){
          _finMonthlySettings = {};
          (results.finMonthly || []).forEach(function(r){ if(r && r.key) _finMonthlySettings[r.key] = r.data || {}; });
          try{ localStorage.setItem('ajw_fin_monthly_settings', JSON.stringify(_finMonthlySettings)); }catch(e){}
          changed = true;
        } else if(!_cfgHas('fin_monthly_settings') && !Object.keys(_finMonthlySettings||{}).length){
          _finMonthlySettings = {};
        } else if(_cfgHas('fin_monthly_settings') && !Object.keys(_finMonthlySettings||{}).length){
          _finMonthlySettings = _cfgData('fin_monthly_settings', {}) || {};
          try{ localStorage.setItem('ajw_fin_monthly_settings', JSON.stringify(_finMonthlySettings)); }catch(e){}
          changed = true;
        }
        var metaMap = {};
        (results.finMeta || []).forEach(function(r){ if(r && r.key) metaMap[r.key] = r.value || {}; });
        if(metaMap.expense_categories && metaMap.expense_categories.data != null){
          _finExpenseCategories = metaMap.expense_categories.data || [];
          try{ localStorage.setItem('ajw_fin_expense_categories', JSON.stringify(_finExpenseCategories)); }catch(e){}
          changed = true;
        } else if(_cfgHas('fin_expense_categories') && !(_finExpenseCategories||[]).length){
          _finExpenseCategories = _cfgData('fin_expense_categories', []) || [];
          try{ localStorage.setItem('ajw_fin_expense_categories', JSON.stringify(_finExpenseCategories)); }catch(e){}
          changed = true;
        }
        if(metaMap.expense_targets && metaMap.expense_targets.data != null){
          _finExpenseTargets = metaMap.expense_targets.data || {};
          try{ localStorage.setItem('ajw_fin_expense_targets', JSON.stringify(_finExpenseTargets)); }catch(e){}
          changed = true;
        } else if(_cfgHas('fin_expense_targets') && !Object.keys(_finExpenseTargets||{}).length){
          _finExpenseTargets = _cfgData('fin_expense_targets', {}) || {};
          try{ localStorage.setItem('ajw_fin_expense_targets', JSON.stringify(_finExpenseTargets)); }catch(e){}
          changed = true;
        }
      } else {
        _finIncome = _takePreferredList(null, function(r){ return r; }, _finIncome, 'fin_income', 'ajw_fin_income');
        _finExpense = _takePreferredList(null, function(r){ return r; }, _finExpense, 'fin_expense', 'ajw_fin_expense');
        _finAssets = _takePreferredList(null, function(r){ return r; }, _finAssets, 'fin_assets', 'ajw_fin_assets');
        _finSubscriptions = _takePreferredList(null, function(r){ return r; }, _finSubscriptions, 'fin_subscriptions', 'ajw_fin_subscriptions');
        if(_cfgHas('fin_expense_categories') && !(_finExpenseCategories||[]).length){
          _finExpenseCategories = _cfgData('fin_expense_categories', []) || [];
          try{ localStorage.setItem('ajw_fin_expense_categories', JSON.stringify(_finExpenseCategories)); }catch(e){}
          changed = true;
        }
        if(_cfgHas('fin_expense_targets') && !Object.keys(_finExpenseTargets||{}).length){
          _finExpenseTargets = _cfgData('fin_expense_targets', {}) || {};
          try{ localStorage.setItem('ajw_fin_expense_targets', JSON.stringify(_finExpenseTargets)); }catch(e){}
          changed = true;
        }
        if(_cfgHas('fin_monthly_settings') && !Object.keys(_finMonthlySettings||{}).length){
          _finMonthlySettings = _cfgData('fin_monthly_settings', {}) || {};
          try{ localStorage.setItem('ajw_fin_monthly_settings', JSON.stringify(_finMonthlySettings)); }catch(e){}
          changed = true;
        }
        if(audit.financeReady && !financeCloudHasAnyRows && !_finIncome.length && !_finAssets.length){
          _sbAddSchemaLog('warn', 'Table finance Supabase sudah ada tetapi belum berisi data, AJW mempertahankan data lokal agar tidak hilang.', {
            checkedAt: audit.checkedAt || new Date().toISOString()
          }, true);
        }
      }
    } finally {
      window._sbSuspendDirty = false;
      _sbClearDirty();
    }

    if(results.syncLog && results.syncLog.length){
      _sbSchemaLog = results.syncLog.map(function(r){
        return {id:r.id, level:r.level || 'info', title:r.title || '', detail:r.detail || {}, ts:r.created_at || new Date().toISOString()};
      }).slice(0, 40);
      _sbPersistSchemaState();
    }

    toast('✅ Data berhasil dimuat dari Supabase!', 'success', 4000);
    var el = document.getElementById('SB-SYNC-STATUS');
    if(el) el.textContent = '✅ Load dari Supabase: ' + new Date().toLocaleString('id-ID');
    if(changed){
      if(typeof buildTabBar==='function') buildTabBar();
      if(typeof _navTo==='function') _navTo(typeof _activeTab!=='undefined'?_activeTab:'dash');
      else if(typeof renderDash==='function') renderDash();
    }
  }).catch(function(err){
    toast('❌ Gagal load dari Supabase: ' + (err.message || err), 'error', 6000);
    console.error('loadFromSupabase error:', err);
  });
}

/* ── SQL TEMPLATE ── */
var AJW_SQL = "-- Jalankan di Supabase SQL Editor (New query → paste → Run)\n\nCREATE TABLE IF NOT EXISTS ajw_employees (id BIGINT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_eval (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode_mulai TEXT, grade TEXT, nilai NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_payroll (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode TEXT, gaji_bersih NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS ajw_kpi (id BIGSERIAL PRIMARY KEY, periode TEXT UNIQUE NOT NULL, data JSONB NOT NULL);\nCREATE TABLE IF NOT EXISTS ajw_supplier (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama_supplier TEXT, bulan TEXT, tahun INT);\nCREATE TABLE IF NOT EXISTS ajw_config (key TEXT PRIMARY KEY, value JSONB NOT NULL);\n\nALTER TABLE ajw_employees ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_eval ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_payroll ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_kpi ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_supplier ENABLE ROW LEVEL SECURITY;\nALTER TABLE ajw_config ENABLE ROW LEVEL SECURITY;\n\nDROP POLICY IF EXISTS open_access ON ajw_employees;\nDROP POLICY IF EXISTS open_access ON ajw_eval;\nDROP POLICY IF EXISTS open_access ON ajw_payroll;\nDROP POLICY IF EXISTS open_access ON ajw_kpi;\nDROP POLICY IF EXISTS open_access ON ajw_supplier;\nDROP POLICY IF EXISTS open_access ON ajw_config;\n\nCREATE POLICY open_access ON ajw_employees FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_eval FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_payroll FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_kpi FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_supplier FOR ALL TO anon USING (true) WITH CHECK (true);\nCREATE POLICY open_access ON ajw_config FOR ALL TO anon USING (true) WITH CHECK (true);";

var AJW_SB_SCHEMA_VERSION = 7;
var AJW_SB_TABLES = [
  {table:'ajw_employees', group:'core', label:'Master Karyawan', keyField:'id', columns:['id','data'], sql:"CREATE TABLE IF NOT EXISTS ajw_employees (id BIGINT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_eval', group:'core', label:'Penilaian', keyField:'id', columns:['id','data','nama','grade','nilai'], sql:"CREATE TABLE IF NOT EXISTS ajw_eval (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode_mulai TEXT, grade TEXT, nilai NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_payroll', group:'core', label:'Payroll', keyField:'id', columns:['id','data','nama','gaji_bersih'], sql:"CREATE TABLE IF NOT EXISTS ajw_payroll (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama TEXT, periode TEXT, gaji_bersih NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_kpi', group:'core', label:'KPI', keyField:'periode', columns:['periode','data'], sql:"CREATE TABLE IF NOT EXISTS ajw_kpi (id BIGSERIAL PRIMARY KEY, periode TEXT UNIQUE NOT NULL, data JSONB NOT NULL);"},
  {table:'ajw_supplier', group:'core', label:'Supplier', keyField:'id', columns:['id','data','nama_supplier'], sql:"CREATE TABLE IF NOT EXISTS ajw_supplier (id BIGINT PRIMARY KEY, data JSONB NOT NULL, nama_supplier TEXT, bulan TEXT, tahun INT);"},
  {table:'ajw_config', group:'core', label:'Config', keyField:'key', columns:['key','value'], sql:"CREATE TABLE IF NOT EXISTS ajw_config (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_hr_sops', group:'hr', label:'HR SOPs & Guides', keyField:'id', columns:['id','title','department','stage','doc_type','file_name','file_type','file_size','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_hr_sops (id TEXT PRIMARY KEY, title TEXT, department TEXT, stage TEXT, doc_type TEXT, file_name TEXT, file_type TEXT, file_size BIGINT DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_hr_control', group:'hr', label:'HR Control System', keyField:'id', columns:['id','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_hr_control (id TEXT PRIMARY KEY, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_dev_hub', group:'development', label:'Development Hub', keyField:'id', columns:['id','section_count','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_dev_hub (id TEXT PRIMARY KEY, section_count INT DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_customer_data', group:'analytics', label:'Analytics Customer Data', keyField:'id', columns:['id','upload_session_id','source_type','tanggal','order_number','marketplace','buyer_name','phone','province','city','sku','warehouse_sku','tracking_number','order_created_at','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_customer_data (id TEXT PRIMARY KEY, upload_session_id TEXT, upload_session_label TEXT, source_type TEXT, tanggal DATE, period_from DATE, period_to DATE, order_number TEXT, package_type TEXT, marketplace TEXT, store_marketplace TEXT, store_name TEXT, buyer_name TEXT, receiver_name TEXT, phone TEXT, postal_code TEXT, province TEXT, city TEXT, district TEXT, address TEXT, sku TEXT, warehouse_sku TEXT, warehouse_sku_name TEXT, product_name TEXT, variant_name TEXT, quantity NUMERIC DEFAULT 0, unit_price NUMERIC DEFAULT 0, product_subtotal NUMERIC DEFAULT 0, product_cost NUMERIC DEFAULT 0, shipping_service TEXT, tracking_number TEXT, total_order NUMERIC DEFAULT 0, payment_method TEXT, order_created_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, country TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_order_number ON ajw_customer_data(order_number);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_marketplace ON ajw_customer_data(marketplace);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_store_name ON ajw_customer_data(store_name);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_buyer_name ON ajw_customer_data(buyer_name);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_phone ON ajw_customer_data(phone);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_province_city ON ajw_customer_data(province, city);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_created_at ON ajw_customer_data(order_created_at);\nCREATE INDEX IF NOT EXISTS idx_ajw_customer_data_upload_session ON ajw_customer_data(upload_session_id);"},
  {table:'ajw_analytics_data', group:'analytics', label:'Analytics Data Snapshot', keyField:'id', columns:['id','scope','rows_count','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_analytics_data (id TEXT PRIMARY KEY, scope TEXT, rows_count INT DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_tool_refunds', group:'tools', label:'Tools Pengembalian Dana', keyField:'id', columns:['id','input_date','order_no','marketplace','item_name','nominal','group_id','image_name','image_data','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_refunds (id TEXT PRIMARY KEY, input_date DATE, order_no TEXT, marketplace TEXT, item_name TEXT, nominal NUMERIC DEFAULT 0, group_id TEXT, image_name TEXT, image_data TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_refunds_input_date ON ajw_tool_refunds(input_date);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_refunds_marketplace ON ajw_tool_refunds(marketplace);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_refunds_order_no ON ajw_tool_refunds(order_no);"},
  {table:'ajw_tool_complaints', group:'tools', label:'Tools Komplain', keyField:'id', columns:['id','input_date','order_no','marketplace','issue_type','nominal','group_id','image_name','image_data','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_complaints (id TEXT PRIMARY KEY, input_date DATE, order_no TEXT, marketplace TEXT, issue_type TEXT, nominal NUMERIC DEFAULT 0, group_id TEXT, image_name TEXT, image_data TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_complaints_input_date ON ajw_tool_complaints(input_date);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_complaints_marketplace ON ajw_tool_complaints(marketplace);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_complaints_order_no ON ajw_tool_complaints(order_no);"},
  {table:'ajw_tool_requests', group:'tools', label:'Tools Request', keyField:'id', columns:['id','input_date','title','division','priority','status','group_id','image_name','image_data','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_requests (id TEXT PRIMARY KEY, input_date DATE, title TEXT, division TEXT, priority TEXT, status TEXT, group_id TEXT, image_name TEXT, image_data TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_requests_input_date ON ajw_tool_requests(input_date);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_requests_status ON ajw_tool_requests(status);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_requests_priority ON ajw_tool_requests(priority);"},
  {table:'ajw_tool_material_stock', group:'tools', label:'Tools Belanja Material Stok', keyField:'id', columns:['id','nama','kategori','satuan','stok_akhir','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_material_stock (id TEXT PRIMARY KEY, nama TEXT, kategori TEXT, satuan TEXT, stok_akhir NUMERIC DEFAULT 0, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_material_stock_nama ON ajw_tool_material_stock(nama);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_material_stock_status ON ajw_tool_material_stock(status);"},
  {table:'ajw_tool_material_orders', group:'tools', label:'Tools Belanja Material Orders', keyField:'id', columns:['id','session_id','material_id','nama','qty','subtotal','ordered','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_material_orders (id TEXT PRIMARY KEY, session_id TEXT, material_id TEXT, nama TEXT, qty NUMERIC DEFAULT 0, subtotal NUMERIC DEFAULT 0, ordered BOOLEAN DEFAULT FALSE, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_material_orders_session ON ajw_tool_material_orders(session_id);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_material_orders_ordered ON ajw_tool_material_orders(ordered);"},
  {table:'ajw_tool_material_order_history', group:'tools', label:'Tools Belanja Material History', keyField:'id', columns:['id','session_id','material_id','nama','qty','subtotal','ordered','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_material_order_history (id TEXT PRIMARY KEY, session_id TEXT, material_id TEXT, nama TEXT, qty NUMERIC DEFAULT 0, subtotal NUMERIC DEFAULT 0, ordered BOOLEAN DEFAULT FALSE, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_material_history_session ON ajw_tool_material_order_history(session_id);"},
  {table:'ajw_tool_material_sessions', group:'tools', label:'Tools Belanja Material Sessions', keyField:'id', columns:['id','nama','created_at','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_material_sessions (id TEXT PRIMARY KEY, nama TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_tool_products', group:'tools', label:'Tools Rincian Produk', keyField:'id', columns:['id','sku','judul','kategori_pertama','kategori_kedua','total_stok','penjualan_harian','modal_bobot','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_products (id TEXT PRIMARY KEY, sku TEXT, judul TEXT, kategori_pertama TEXT, kategori_kedua TEXT, total_stok NUMERIC DEFAULT 0, penjualan_harian NUMERIC DEFAULT 0, modal_bobot NUMERIC DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_products_sku ON ajw_tool_products(sku);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_products_kat1 ON ajw_tool_products(kategori_pertama);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_products_updated ON ajw_tool_products(updated_at);"},
  {table:'ajw_tool_desc_revision', group:'tools', label:'Tools Revisi Deskripsi', keyField:'id', columns:['id','kode_produk','nama_produk','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_desc_revision (id TEXT PRIMARY KEY, kode_produk TEXT, nama_produk TEXT, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_desc_revision_kode ON ajw_tool_desc_revision(kode_produk);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_desc_revision_status ON ajw_tool_desc_revision(status);"},
  {table:'ajw_tool_automation_jobs', group:'tools', label:'AI / Tools Automation Jobs', keyField:'id', columns:['id','nama','channel','active','next_run','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_automation_jobs (id TEXT PRIMARY KEY, nama TEXT, channel TEXT, active BOOLEAN DEFAULT TRUE, next_run TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_automation_jobs_active ON ajw_tool_automation_jobs(active);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_automation_jobs_channel ON ajw_tool_automation_jobs(channel);"},
  {table:'ajw_tool_automation_logs', group:'tools', label:'AI / Tools Automation Logs', keyField:'id', columns:['id','level','title','data','created_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_automation_logs (id TEXT PRIMARY KEY, level TEXT, title TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_automation_logs_created ON ajw_tool_automation_logs(created_at DESC);"},
  {table:'ajw_tool_webhooks', group:'tools', label:'AI / Tools Webhooks', keyField:'id', columns:['id','nama','method','url','active','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_webhooks (id TEXT PRIMARY KEY, nama TEXT, method TEXT, url TEXT, active BOOLEAN DEFAULT TRUE, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_tool_blast_rows', group:'tools', label:'Tools Pesan Blast Aktif', keyField:'id', columns:['id','order_number','phone','marketplace','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_blast_rows (id TEXT PRIMARY KEY, order_number TEXT, phone TEXT, marketplace TEXT, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_rows_order ON ajw_tool_blast_rows(order_number);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_rows_phone ON ajw_tool_blast_rows(phone);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_rows_status ON ajw_tool_blast_rows(status);"},
  {table:'ajw_tool_blast_history', group:'tools', label:'Tools Pesan Blast Riwayat', keyField:'id', columns:['id','order_number','phone','marketplace','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_blast_history (id TEXT PRIMARY KEY, order_number TEXT, phone TEXT, marketplace TEXT, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_history_order ON ajw_tool_blast_history(order_number);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_history_phone ON ajw_tool_blast_history(phone);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_history_status ON ajw_tool_blast_history(status);"},
  {table:'ajw_tool_blast_phone_db', group:'tools', label:'Tools Blast Database Nomor', keyField:'id', columns:['id','phone','nama','marketplace','total_blast_count','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_blast_phone_db (id TEXT PRIMARY KEY, phone TEXT, nama TEXT, marketplace TEXT, total_blast_count INT DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_phone_db_phone ON ajw_tool_blast_phone_db(phone);"},
  {table:'ajw_tool_blast_marketing', group:'tools', label:'Tools Blast Marketing', keyField:'id', columns:['id','nama','schedule_type','active','next_run','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_blast_marketing (id TEXT PRIMARY KEY, nama TEXT, schedule_type TEXT, active BOOLEAN DEFAULT FALSE, next_run TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_blast_marketing_active ON ajw_tool_blast_marketing(active);"},
  {table:'ajw_tool_picking_rows', group:'tools', label:'Tools Picking List Rows', keyField:'id', columns:['id','order_number','marketplace','sku_gudang','quantity','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_picking_rows (id TEXT PRIMARY KEY, order_number TEXT, marketplace TEXT, sku_gudang TEXT, quantity NUMERIC DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_picking_rows_order ON ajw_tool_picking_rows(order_number);\nCREATE INDEX IF NOT EXISTS idx_ajw_tool_picking_rows_marketplace ON ajw_tool_picking_rows(marketplace);"},
  {table:'ajw_tool_picking_history', group:'tools', label:'Tools Picking List History', keyField:'id', columns:['id','source_file','total_rows','status','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_picking_history (id TEXT PRIMARY KEY, source_file TEXT, total_rows NUMERIC DEFAULT 0, status TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_tool_meta', group:'tools', label:'Tools Meta Settings', keyField:'key', columns:['key','value','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_tool_meta (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_income', group:'finance', label:'Finance Pendapatan', keyField:'id', columns:['id','tanggal','marketplace','toko','nominal','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_income (id TEXT PRIMARY KEY, tanggal DATE, periode_dari DATE, periode_sampai DATE, marketplace TEXT, toko TEXT, nominal NUMERIC DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_expense', group:'finance', label:'Finance Pengeluaran', keyField:'id', columns:['id','tanggal','kategori','nominal','source_type','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_expense (id TEXT PRIMARY KEY, tanggal DATE, kategori TEXT, nominal NUMERIC DEFAULT 0, source_type TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_assets', group:'finance', label:'Finance Aset', keyField:'id', columns:['id','tanggal','type','nama','nominal','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_assets (id TEXT PRIMARY KEY, tanggal DATE, type TEXT, nama TEXT, nominal NUMERIC DEFAULT 0, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_subscriptions', group:'finance', label:'Finance Langganan', keyField:'id', columns:['id','nama','provider','status','nominal','next_payment','billing_cycle','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_subscriptions (id TEXT PRIMARY KEY, nama TEXT, provider TEXT, status TEXT, nominal NUMERIC DEFAULT 0, next_payment DATE, billing_cycle TEXT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_monthly', group:'finance', label:'Finance Bulanan', keyField:'key', columns:['key','year','month','data','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_monthly (key TEXT PRIMARY KEY, year INT, month INT, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_fin_meta', group:'finance', label:'Finance Metadata', keyField:'key', columns:['key','value','updated_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_fin_meta (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());"},
  {table:'ajw_sync_log', group:'support', label:'Audit & Sync Log', keyField:'id', columns:['id','level','category','title','detail','created_at'], sql:"CREATE TABLE IF NOT EXISTS ajw_sync_log (id TEXT PRIMARY KEY, level TEXT, category TEXT, title TEXT, detail JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());"}
];
var _sbSchemaAudit = (function(){
  try{ return JSON.parse(localStorage.getItem('ajw_sb_schema_audit')||'null') || {ok:null, checkedAt:'', missingTables:[], issues:[], financeReady:false, logReady:false, sql:''}; }
  catch(e){ return {ok:null, checkedAt:'', missingTables:[], issues:[], financeReady:false, logReady:false, sql:''}; }
})();
var _sbSchemaLog = (function(){
  try{ return JSON.parse(localStorage.getItem('ajw_sb_schema_log')||'[]') || []; }catch(e){ return []; }
})();
function _sbPersistSchemaState(){
  try{ localStorage.setItem('ajw_sb_schema_audit', JSON.stringify(_sbSchemaAudit || {})); }catch(e){}
  try{ localStorage.setItem('ajw_sb_schema_log', JSON.stringify((_sbSchemaLog || []).slice(0,40))); }catch(e){}
}
function _sbFindTableDef(name){
  for(var i=0;i<AJW_SB_TABLES.length;i++) if(AJW_SB_TABLES[i].table===name) return AJW_SB_TABLES[i];
  return null;
}
function _sbPolicySQL(name){
  return [
    'ALTER TABLE ' + name + ' ENABLE ROW LEVEL SECURITY;',
    'DROP POLICY IF EXISTS open_access ON ' + name + ';',
    'CREATE POLICY open_access ON ' + name + ' FOR ALL TO anon USING (true) WITH CHECK (true);'
  ].join('\n');
}
function _sbBuildSchemaSQL(missingTables){
  var names = missingTables && missingTables.length ? missingTables : AJW_SB_TABLES.map(function(r){ return r.table; });
  var out = ['-- AJW schema upgrade v' + AJW_SB_SCHEMA_VERSION, '-- Jalankan di Supabase SQL Editor lalu klik Run'];
  names.forEach(function(name){
    var def = _sbFindTableDef(name);
    if(!def) return;
    out.push(def.sql);
    out.push(_sbPolicySQL(def.table));
  });
  return out.join('\n\n');
}
AJW_SQL = _sbBuildSchemaSQL();
function _sbAddSchemaLog(level, title, detail, silent){
  var row = {id:'sblog_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), level:level||'info', title:title||'', detail:detail||{}, ts:new Date().toISOString()};
  _sbSchemaLog = [row].concat((_sbSchemaLog || [])).slice(0,40);
  _sbPersistSchemaState();
  if(!silent && typeof toast === 'function') toast(title, level==='error'?'error':(level==='warn'?'warn':'info'), 4500);
  return row;
}
function _sbFinanceDataExists(){
  return !!((typeof _finIncome!=='undefined'&&_finIncome&&_finIncome.length)||(typeof _finExpense!=='undefined'&&_finExpense&&_finExpense.length)||(typeof _finAssets!=='undefined'&&_finAssets&&_finAssets.length)||(typeof _finSubscriptions!=='undefined'&&_finSubscriptions&&_finSubscriptions.length)||(typeof _finMonthlySettings!=='undefined'&&_finMonthlySettings&&Object.keys(_finMonthlySettings).length));
}
function _sbSafeId(prefix, raw, idx){
  var base = String(raw || '').trim();
  if(!base) base = prefix + '_' + (idx + 1) + '_' + Date.now();
  return base.replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,120);
}
function _sbIncomeRecord(r, idx){
  var rec = r || {};
  return {id:_sbSafeId('fininc', rec.id || rec.ts || [rec.tanggal,rec.marketplace,rec.toko,idx].join('_'), idx), tanggal:rec.tanggal || null, periode_dari:rec.periodeDari || rec.tanggal || null, periode_sampai:rec.periodeSampai || rec.tanggal || null, marketplace:rec.marketplace || rec.sumber || '', toko:rec.toko || '', nominal:_num(rec.pemasukanToko != null ? rec.pemasukanToko : rec.nominal), data:rec, updated_at:new Date().toISOString()};
}
function _sbHRSopRecord(r, idx){
  var rec = r || {};
  return {
    id:_sbSafeId('hrsop', rec.id || rec.updatedAt || [rec.title,rec.department,idx].join('_'), idx),
    title:rec.title || '',
    department:rec.department || '',
    stage:rec.stage || 'Draft',
    doc_type:rec.docType || 'Guides & SOPs',
    file_name:rec.fileName || '',
    file_type:rec.fileType || '',
    file_size:parseInt(rec.fileSize,10)||0,
    data:rec,
    updated_at:rec.updatedAt || new Date().toISOString()
  };
}
function _sbExpenseRecord(r, idx){
  var rec = r || {};
  return {id:_sbSafeId('finexp', rec.id || rec.ts || [rec.tanggal,rec.kategori,rec.namaPengeluaran,idx].join('_'), idx), tanggal:rec.tanggal || null, kategori:rec.kategori || '', nominal:_num(rec.nominal), source_type:rec.sourceType || 'manual', data:rec, updated_at:new Date().toISOString()};
}
function _sbAssetRecord(r, idx){
  var rec = r || {};
  return {id:_sbSafeId('finasset', rec.id || rec.ts || [rec.tanggal,rec.type,rec.nama,idx].join('_'), idx), tanggal:rec.tanggal || null, type:rec.type || '', nama:rec.nama || '', nominal:_num(rec.nominal), data:rec, updated_at:new Date().toISOString()};
}
function _sbSubscriptionRecord(r, idx){
  var rec = r || {};
  return {id:_sbSafeId('finsub', rec.id || rec.ts || [rec.nama,rec.provider,idx].join('_'), idx), nama:rec.nama || '', provider:rec.provider || '', status:rec.status || '', nominal:_num(rec.nominal), next_payment:rec.nextPayment || null, billing_cycle:rec.siklus || '', data:rec, updated_at:new Date().toISOString()};
}
function _sbMonthlySettingRecords(){
  var rows = [];
  Object.keys(_finMonthlySettings || {}).sort().forEach(function(key){
    var ym = String(key || '').split('-');
    rows.push({key:key, year:parseInt(ym[0],10)||null, month:parseInt(ym[1],10)||null, data:_finMonthlySettings[key] || {}, updated_at:new Date().toISOString()});
  });
  return rows;
}
function _sbFinanceMetaRecords(){
  return [
    {key:'expense_categories', value:{data:(typeof _finExpenseCategories!=='undefined'&&_finExpenseCategories)||[]}, updated_at:new Date().toISOString()},
    {key:'expense_targets', value:{data:(typeof _finExpenseTargets!=='undefined'&&_finExpenseTargets)||{}}, updated_at:new Date().toISOString()},
    {key:'schema_version', value:{data:AJW_SB_SCHEMA_VERSION}, updated_at:new Date().toISOString()}
  ];
}
function _sbLogRecords(){
  return (_sbSchemaLog || []).slice(0,40).map(function(r){
    return {id:r.id || ('sblog_' + Date.now()), level:r.level || 'info', category:'schema', title:r.title || '', detail:r.detail || {}, created_at:r.ts || new Date().toISOString()};
  });
}
window._sbSyncRuntime = window._sbSyncRuntime || {running:false, pending:false, pendingSilent:true, promise:null};
function _sbSafeModeEnabled(){
  var c = getCfg();
  return c.supabaseSafeMode !== false;
}
function _sbSafeBatchSize(){
  return _sbSafeModeEnabled() ? 80 : 250;
}
window._sbDirtyState = window._sbDirtyState || {};
function _sbMarkDirty(flag){
  if(!flag || window._sbSuspendDirty) return;
  var state = window._sbDirtyState = window._sbDirtyState || {};
  state[flag] = true;
}
function _sbDirtySnapshot(){
  var src = window._sbDirtyState || {};
  var out = {};
  Object.keys(src).forEach(function(k){ if(src[k]) out[k] = true; });
  return out;
}
function _sbClearDirty(flags){
  if(!flags){ window._sbDirtyState = {}; return; }
  var state = window._sbDirtyState || {};
  Object.keys(flags).forEach(function(k){ delete state[k]; });
}
function _sbHasDirty(flags, keys){
  if(!flags) return false;
  if(typeof keys === 'string') return !!flags[keys];
  return (keys || []).some(function(k){ return !!flags[k]; });
}
function _sbRunSeries(steps){
  steps = steps || [];
  var results = [];
  var chain = Promise.resolve();
  steps.forEach(function(step){
    chain = chain.then(function(){
      return Promise.resolve(typeof step === 'function' ? step() : step).then(function(res){
        results.push(res);
        return res;
      });
    });
  });
  return chain.then(function(){ return results; });
}
function _sbChunkedUpsert(table, records, batchSize){
  records = records || [];
  batchSize = batchSize || _sbSafeBatchSize();
  if(!records.length) return Promise.resolve({ok:true, skipped:true});
  var steps = [];
  for(var i=0;i<records.length;i+=batchSize){
    (function(chunk){
      steps.push(function(){ return SB.upsertMany(table, chunk); });
    })(records.slice(i, i + batchSize));
  }
  return _sbRunSeries(steps).then(function(){ return {ok:true}; });
}
function _sbChunkedReplace(table, keyField, records, batchSize){
  keyField = keyField || 'id';
  records = records || [];
  batchSize = batchSize || _sbSafeBatchSize();
  return SB.request('DELETE', '/rest/v1/' + table + '?' + keyField + '=not.is.null', {
    headers: {'Prefer':'return=minimal'}
  }).catch(function(err){
    if(err && err.status === 404) throw err;
    return {ok:true};
  }).then(function(){
    return _sbChunkedUpsert(table, records, batchSize);
  });
}
function _sbBuildConfigRows(cfg, audit, silent, dirtyFlags){
  var financeReady = !!(audit && audit.financeReady);
  var rows = [];
  var partialSafe = _sbSafeModeEnabled() && !!silent;
  function include(keys){ return !partialSafe || !dirtyFlags || _sbHasDirty(dirtyFlags, keys); }
  if(include('tabs')){
    rows.push({key:'tabs',value:{data:customTabs||[]}});
    rows.push({key:'custom_tabs',value:{data:customTabs||[]}});
  }
  if(!partialSafe){
    rows.push({key:'supabase_schema_audit',value:{data:_sbSchemaAudit||{}}});
    rows.push({key:'supabase_schema_log',value:{data:(_sbSchemaLog||[]).slice(0,20)}});
    rows.push({key:'cfg_safe',value:{adminName:cfg.adminName||'',adminWA:cfg.adminWA||'',sysTitle:cfg.sysTitle||'',evalTpl:cfg.evalTpl||'',payTpl:cfg.payTpl||'',theme:cfg.theme||'',tabsConfig:cfg.tabsConfig||{},fontMode:cfg.fontMode||'',fontScale:cfg.fontScale||'',supabaseSafeMode:(cfg.supabaseSafeMode!==false)}});
  }
  if(include('sup_data')) rows.push({key:'sup_data',value:{data:supplierData||[]}});
  if(include('pesanan_data')) rows.push({key:'pesanan_data',value:{data:pesananData||[]}});
  if(include('laporan_bulanan')) rows.push({key:'laporan_bulanan',value:{data:_lb||[]}});
  if(include('dev_hub')) rows.push({key:'dev_hub',value:{data:(typeof _devHub!=='undefined'&&_devHub)||null}});
  if(include('hr_control')) rows.push({key:'hr_control',value:{data:(typeof _hrControlData!=='undefined'&&_hrControlData)||null}});
  if(include('profit_data')) rows.push({key:'profit_data',value:{data:(typeof _profitData!=='undefined'&&_profitData)||[]}});
  if(include('tools_desc_rows')) rows.push({key:'tools_desc_prompt',value:{data:(typeof _toolDescPrompt!=='undefined'&&_toolDescPrompt)||''}});
  if(include(['tools_blast_rows','tools_blast_history','tools_blast_phone_db'])) rows.push({key:'tools_blast_template',value:{data:(typeof _toolBlastTemplate!=='undefined'&&_toolBlastTemplate)||''}});
  if(include(['tools_blast_rows','tools_blast_history','tools_blast_phone_db','tools_blast_marketing'])) rows.push({key:'tools_blast_delay_ms',value:{data:(typeof _toolBlastSendDelayMs!=='undefined'&&_toolBlastSendDelayMs)||2500}});
  if(include('tools_blast_marketing')) rows.push({key:'tools_blast_marketing_template',value:{data:(typeof _toolBlastMarketingTemplate!=='undefined'&&_toolBlastMarketingTemplate)||''}});
  if(include('tools_material_sessions')) rows.push({key:'tools_material_active_session',value:{data:(typeof _toolMaterialActiveSessionId!=='undefined'&&_toolMaterialActiveSessionId)||''}});
  if(include('tools_agent_bridge')) rows.push({key:'tools_agent_bridge',value:{data:(typeof _toolAgentBridge!=='undefined'&&_toolAgentBridge)||{}}});
  if(include('tools_picking_rows')) rows.push({key:'tools_picking_config',value:{data:(typeof _toolPickingConfig!=='undefined'&&_toolPickingConfig)||{}}});
  if(include('tools_picking_rows')) rows.push({key:'tools_picking_processed',value:{data:(typeof _toolPickingProcessed!=='undefined'&&_toolPickingProcessed)||{bundling:[],satuan:[],processedAt:''}}});
  if(include('tools_picking_rows')) rows.push({key:'tools_picking_watch',value:{data:(typeof _toolPickingWatch!=='undefined'&&_toolPickingWatch)||{}}});
  if(!financeReady){
    if(include('fin_income')) rows.push({key:'fin_income',value:{data:(typeof _finIncome!=='undefined'&&_finIncome)||[]}});
    if(include('fin_expense')) rows.push({key:'fin_expense',value:{data:(typeof _finExpense!=='undefined'&&_finExpense)||[]}});
    if(include('fin_expense_categories')) rows.push({key:'fin_expense_categories',value:{data:(typeof _finExpenseCategories!=='undefined'&&_finExpenseCategories)||[]}});
    if(include('fin_subscriptions')) rows.push({key:'fin_subscriptions',value:{data:(typeof _finSubscriptions!=='undefined'&&_finSubscriptions)||[]}});
    if(include('fin_expense_targets')) rows.push({key:'fin_expense_targets',value:{data:(typeof _finExpenseTargets!=='undefined'&&_finExpenseTargets)||{}}});
    if(include('fin_assets')) rows.push({key:'fin_assets',value:{data:(typeof _finAssets!=='undefined'&&_finAssets)||[]}});
    if(include('fin_monthly_settings')) rows.push({key:'fin_monthly_settings',value:{data:(typeof _finMonthlySettings!=='undefined'&&_finMonthlySettings)||{}}});
  }
  return rows;
}
function runSupabaseSchemaAudit(silent, force){
  if(!SB.init()) return Promise.reject(new Error('Supabase belum dikonfigurasi'));
  var now = Date.now();
  var last = _sbSchemaAudit && _sbSchemaAudit.checkedAt ? new Date(_sbSchemaAudit.checkedAt).getTime() : 0;
  if(!force && last && (now - last) < 60000) return Promise.resolve(_sbSchemaAudit);
  return Promise.all(AJW_SB_TABLES.map(function(def){
    return SB.probeTable(def.table, def.columns).then(function(r){
      r.group = def.group; r.label = def.label; r.keyField = def.keyField; return r;
    }).catch(function(err){
      return {table:def.table, group:def.group, label:def.label, keyField:def.keyField, ok:false, exists:false, reason:'error', message:(err&&err.message)||String(err)};
    });
  })).then(function(results){
    var missing = results.filter(function(r){ return !r.ok; }).map(function(r){ return r.table; });
    var financeMissing = results.filter(function(r){ return r.group==='finance' && !r.ok; }).map(function(r){ return r.table; });
    var logReady = results.some(function(r){ return r.table==='ajw_sync_log' && r.ok; });
    var audit = {version:AJW_SB_SCHEMA_VERSION, checkedAt:new Date().toISOString(), ok:missing.length===0, financeReady:financeMissing.length===0, logReady:logReady, missingTables:missing, issues:results.filter(function(r){ return !r.ok; }), sql:_sbBuildSchemaSQL(missing), usedFallback:financeMissing.length>0};
    var prev = JSON.stringify((_sbSchemaAudit && _sbSchemaAudit.missingTables) || []);
    var next = JSON.stringify(missing);
    _sbSchemaAudit = audit;
    _sbPersistSchemaState();
    if(prev !== next){
      if(missing.length) _sbAddSchemaLog('warn', 'Schema Supabase belum mengikuti versi AJW', {missingTables:missing, financeReady:audit.financeReady, sqlReady:true}, !!silent);
      else _sbAddSchemaLog('info', 'Schema Supabase sudah sinkron dengan AJW', {checkedAt:audit.checkedAt, version:AJW_SB_SCHEMA_VERSION}, !!silent);
    }
    return audit;
  });
}
function copySupabasePatchSQL(){
  var sql = (_sbSchemaAudit && _sbSchemaAudit.sql) || AJW_SQL;
  navigator.clipboard.writeText(sql).then(function(){ toast('SQL perbaikan berhasil dicopy', 'success', 2500); });
}

/* ── SUPABASE PANEL (injected into Admin Data & Backup) ── */
function buildSupabasePanel(){
  var cfg = getCfg();
  var connected = !!(cfg.supabaseUrl && cfg.supabaseKey);
  var lastSync = cfg.lastSupabaseSync
    ? '✅ Terakhir sync: ' + new Date(cfg.lastSupabaseSync).toLocaleString('id-ID')
    : 'Belum pernah sync';
  var audit = _sbSchemaAudit || {};
  var missing = audit.missingTables || [];
  var auditText = audit.checkedAt
    ? (missing.length ? ('Butuh upgrade schema: ' + missing.length + ' tabel') : 'Schema AJW sudah lengkap')
    : 'Audit schema belum dijalankan';
  var auditTone = !connected ? 'var(--bd)' : (missing.length ? '#E67E22' : '#2E7D32');

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
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<input type="checkbox" id="SB-SAFE-MODE" style="width:17px;height:17px;accent-color:#1A73E8" '+((cfg.supabaseSafeMode!==false)?' checked':'')+' onchange="var c=getCfg();c.supabaseSafeMode=this.checked;saveCfg(c);toast(this.checked?\'Safe mode Supabase aktif — sync dibuat bertahap dan lebih ringan\':\'Safe mode Supabase dinonaktifkan\',\'info\');renderAdmin();">';
  h += '<label for="SB-SAFE-MODE" style="font-size:12px;cursor:pointer">Safe mode untuk project Supabase kecil (serial sync, batch kecil, autosync lebih hemat)</label>';
  h += '</div>';

  h += '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">';
  h += '<button class="btnp" onclick="var c=getCfg();c.supabaseUrl=document.getElementById(\'SB-URL\').value.trim();c.supabaseKey=document.getElementById(\'SB-KEY\').value.trim();saveCfg(c);toast(\'Config disimpan!\',\'success\');renderAdmin();" style="background:#1A73E8;padding:9px 14px;font-size:12px">💾 Simpan Config</button>';
  h += '<button class="btna" onclick="SB.init();SB.test().then(function(){toast(\'✅ Koneksi Supabase berhasil!\',\'success\');return runSupabaseSchemaAudit(true,true);}).then(function(){renderAdmin();}).catch(function(e){toast(\'❌ Gagal: \'+e.message,\'error\')})" style="background:#546E7A;padding:9px 13px;font-size:12px">Test Koneksi</button>';
  h += '<button class="btna" onclick="syncAllToSupabase()" style="background:#0F9D58;padding:9px 13px;font-size:12px">☁ Sync Sekarang</button>';
  h += '<button class="btna" onclick="loadFromSupabase()" style="background:#1565C0;padding:9px 13px;font-size:12px">⬇ Load dari Cloud</button>';
  h += '<button class="btna" onclick="runSupabaseSchemaAudit(false,true).then(function(){renderAdmin(); if((_sbSchemaAudit.missingTables||[]).length) toast(\'Audit selesai — schema masih perlu diperbarui\',\'warn\',4000); else toast(\'Audit selesai — schema sudah sinkron\',\'success\',3000);}).catch(function(e){toast(\'Audit gagal: \'+e.message,\'error\')})" style="background:#8C5E16;padding:9px 13px;font-size:12px">🔎 Audit Schema</button>';
  h += '<button class="btna" onclick="copySupabasePatchSQL()" style="background:#7B3FB3;padding:9px 13px;font-size:12px">📋 Copy SQL Perbaikan</button>';
  h += '<button class="btna" onclick="showSQLModal()" style="background:#6A1B9A;padding:9px 13px;font-size:12px">📋 Setup SQL Tabel</button>';
  h += '</div>';

  h += '<div style="border:1px solid '+auditTone+';border-radius:10px;padding:10px 12px;background:rgba(255,255,255,.02);margin-bottom:10px">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<div><div style="font-size:12px;font-weight:700;color:'+auditTone+'">Schema AJW v'+AJW_SB_SCHEMA_VERSION+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+auditText+(audit.checkedAt?' • Dicek '+new Date(audit.checkedAt).toLocaleString('id-ID'):'')+'</div></div>';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h += '<span class="chip" style="background:rgba(143,208,255,.08);color:#8FD0FF;border:1px solid rgba(143,208,255,.3)">Finance Table: '+(audit.financeReady?'Siap':'Fallback ajw_config')+'</span>';
  h += '<span class="chip" style="background:rgba(240,197,106,.08);color:#F0C56A;border:1px solid rgba(240,197,106,.3)">Log: '+(audit.logReady?'Aktif':'Fallback lokal')+'</span>';
  h += '</div></div>';
  if(missing.length){
    h += '<div style="margin-top:10px;font-size:11px;color:var(--tx2);line-height:1.8">Tabel yang belum ada / belum sesuai: <b style="color:#FFD08A">'+missing.join(', ')+'</b></div>';
  } else if(connected && audit.checkedAt){
    h += '<div style="margin-top:10px;font-size:11px;color:#A7F3B6;line-height:1.8">Schema Supabase sudah lengkap untuk AJW, termasuk table finance terpisah.</div>';
  }
  h += '</div>';

  if(_sbSchemaLog && _sbSchemaLog.length){
    h += '<div style="margin-bottom:10px;background:var(--bg3);border-radius:8px;padding:10px 12px">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">Log Audit Otomatis</div>';
    _sbSchemaLog.slice(0,4).forEach(function(row){
      var tone = row.level === 'warn' ? '#FFD08A' : (row.level === 'error' ? '#FF9D9D' : '#8FD0FF');
      h += '<div style="padding:7px 0;border-top:1px solid rgba(255,255,255,.05)"><div style="font-size:11px;font-weight:700;color:'+tone+'">'+esc(row.title || '-')+'</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">'+new Date(row.ts).toLocaleString('id-ID')+'</div></div>';
    });
    h += '</div>';
  }

  h += '<div id="SB-SYNC-STATUS" style="font-size:11px;color:var(--tx2);padding:6px 9px;background:var(--bg3);border-radius:6px">'+lastSync+'</div>';
  h += '</div>';
  return h;
}

function showSQLModal(mode){
  var existing = document.getElementById('SQL-MODAL');
  if(existing) existing.remove();
  mode = mode || 'full';
  var sqlText = mode === 'patch' ? ((_sbSchemaAudit && _sbSchemaAudit.sql) || AJW_SQL) : AJW_SQL;
  var title = mode === 'patch' ? '📋 SQL Perbaikan Schema AJW' : '📋 SQL Setup AJW';

  var h = '<div id="SQL-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;justify-content:center;align-items:center;padding:20px" onclick="if(event.target===this)this.remove()">';
  h += '<div style="background:var(--bg2);border-radius:var(--r);padding:20px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4)">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  h += '<span style="font-size:13px;font-weight:700;color:var(--navy)">'+title+' — Paste di Supabase SQL Editor</span>';
  h += '<div style="display:flex;gap:6px">';
  h += '<button class="btna" onclick="navigator.clipboard.writeText(document.querySelector(\'#SQL-MODAL pre\').innerText).then(function(){toast(\'SQL berhasil dicopy!\',\'success\',2000)})" style="background:#2E7D32;padding:7px 12px;font-size:11px">📋 Copy SQL</button>';
  h += '<button onclick="document.getElementById(\'SQL-MODAL\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--tx2)">&times;</button>';
  h += '</div></div>';
  h += '<pre style="background:#1A1A2E;color:#E8ECF4;border-radius:8px;padding:14px;font-size:11px;line-height:1.7;overflow-x:auto;white-space:pre-wrap;font-family:monospace">'+esc(sqlText)+'</pre>';
  h += '<div style="margin-top:11px;background:#E8F0FE;border-radius:7px;padding:10px 13px;font-size:11px;line-height:1.8">';
  h += '<b>Cara jalankan SQL:</b><br>';
  h += '1. Login <a href="https://supabase.com" target="_blank" style="color:#1A73E8">supabase.com</a> → buka project kamu<br>';
  h += '2. Klik menu <b>SQL Editor</b> di sidebar kiri<br>';
  h += '3. Klik <b>New query</b><br>';
  h += '4. Paste SQL di atas → klik tombol <b style="color:#2E7D32">Run</b> (pojok kanan bawah)<br>';
  h += '5. Kembali ke AJW → klik <b>Audit Schema</b> lalu <b>Sync Sekarang</b>';
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
      {id:'kpi',def:'&#128202; KPI Bisnis'},{id:'ai',def:'&#129302; AI'},{id:'finansial',def:'&#128181; Finansial'},
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
  document.getElementById('V-supplier').innerHTML = '<div class="sup-compact">'+h+'</div>';
};

/* ── DASHBOARD ── */
function _supViewDashboard(names, sumBySup, gNota, gBayar){
  var gSaldo = gNota - gBayar;
  var h = '';
  /* Grand summary */
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px;margin-bottom:11px">';
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
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:9px;margin-bottom:11px">';
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
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:7px">';
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
    h += '<div class="card" style="padding:0;overflow:hidden;margin-bottom:9px">';
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
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:7px">';
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
  var h = '<div class="sup-section">';
  h += _supTitleBar('Pesanan Supplier','Kelola draft pesanan supplier, import CSV, dan pantau status pemesanan sebelum masuk ke hutang nota.','<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Pesanan</span><b>'+filtered.length+'</b></span><button class="btns" onclick="_dlPOTemplate()" style="padding:6px 10px">Template</button><button class="btnp" onclick="_openPOModal()" style="padding:6px 10px">+ Pesanan</button></div>');

  /* Drag & Drop Import Zone */
  h += '<div id="DROP-ZONE" class="drop-zone" style="margin-bottom:14px"';
  h += ' ondragover="event.preventDefault();this.classList.add(\'dragover\')"';
  h += ' ondragleave="this.classList.remove(\'dragover\')"';
  h += ' ondrop="_handlePODrop(event)"';
  h += ' onclick="_importPO()">';
  h += '<div style="font-size:28px;margin-bottom:7px">&#128229;</div>';
  h += '<div style="font-size:13px;font-weight:700;color:var(--tx2)">Drag & Drop file CSV di sini</div>';
  h += '<div style="font-size:11px;color:var(--tx3);margin-top:3px">atau klik untuk pilih file &bull; Format: SKU, Qty, Satuan, Harga</div>';
  h += '<button class="btna" style="background:var(--green);padding:7px 16px;font-size:11px;margin-top:10px" onclick="event.stopPropagation();_exportAllPO()">&#128228; Export CSV</button>';
  h += '</div>';

  if(!filtered.length){
    return h+'<div class="card" style="text-align:center;padding:22px;color:var(--tx3)">Belum ada pesanan.</div></div>';
  }
  filtered.sort(function(a,b){return (b.id||0)-(a.id||0);}).forEach(function(p){
    var oi = pesananData.indexOf(p);
    var sc={'Pending':'var(--tx2)','Diterima':'var(--tx)','Dibatalkan':'var(--tx3)'}[p.status]||'var(--tx3)';
    var gt=(p.items||[]).reduce(function(t,i){return t+(i.qty||0)*(i.harga||0);},0);
    h += '<div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">';
    h += '<div style="background:var(--bg3);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px;border-bottom:1px solid var(--bd)">';
    h += '<div><b style="color:var(--tx);font-size:12px">PO-'+p.id+'</b> <span style="font-size:11px;color:var(--tx2)">'+esc(p.supplier||'-')+'</span> <span style="font-size:11px;color:var(--tx3)">'+esc(p.tgl||'-')+'</span>'+(p.catatan?' <span style="font-size:10px;color:var(--tx2);background:var(--bg);padding:2px 6px;border-radius:4px">'+esc(p.catatan)+'</span>':'')+'</div>';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<span class="chip" style="background:rgba(255,255,255,.02);color:'+sc+';border:1px solid rgba(255,255,255,.08)">'+esc(p.status||'Pending')+'</span>';
    h += '<select class="fi" onchange="pesananData['+oi+'].status=this.value;saveSupplierAll();renderSupplier()" style="padding:4px 8px;font-size:11px;width:auto">';
    ['Pending','Diterima','Dibatalkan'].forEach(function(s){h+='<option'+(p.status===s?' selected':'')+'>'+s+'</option>';});
    h += '</select>';
    h += '<button onclick="_exportOnePO('+oi+')" class="btnsm" style="background:rgba(255,255,255,.04);color:var(--tx);border:1px solid rgba(255,255,255,.08)">Export</button>';
    h += '<button onclick="confirmDelete(\'Hapus pesanan ini?\',function(){pesananData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" class="btnsm" style="background:rgba(120,30,30,.12);color:#FFB2B2;border:1px solid rgba(255,178,178,.18)">X</button>';
    h += '</div></div>';
    h += '<div style="overflow-x:auto"><table class="tbl" style="margin:0"><thead><tr><th>#</th><th>SKU/Produk</th><th class="c">Qty</th><th class="c">Satuan</th><th class="c">Harga</th><th class="c">Total</th></tr></thead><tbody>';
    (p.items||[]).forEach(function(item,ix){
      var tot=(item.qty||0)*(item.harga||0);
      h += '<tr><td>'+( ix+1)+'</td><td>'+esc(item.sku||'-')+'</td><td class="c">'+item.qty+'</td><td class="c">'+esc(item.satuan||'pcs')+'</td><td class="c">'+(item.harga?'Rp '+fmt(item.harga):'-')+'</td><td class="c" style="font-weight:700;color:var(--tx)">'+(tot?'Rp '+fmt(tot):'-')+'</td></tr>';
    });
    if(gt) h += '<tr style="background:var(--bg3)"><td colspan="5" style="padding:8px 10px;color:#F2EAD0;font-weight:800;border:1px solid var(--bd)">TOTAL</td><td class="c" style="color:#8CE7A8;font-weight:800;border:1px solid var(--bd)">Rp '+fmt(gt)+'</td></tr>';
    h += '</tbody></table></div></div>';
  });
  return h+'</div>';
}

/* ────────────────────────────────────────────
   DATA SUPPLIER
──────────────────────────────────────────── */
function _supData(){
  var filtered = supplierData.filter(function(s){ return supplierFilter==='all'||s.nama===supplierFilter; });
  var h = '<div class="sup-section">';
  h += _supTitleBar('Data Supplier','Master supplier, kontak, kategori, dan informasi rekening untuk kebutuhan pembelian dan pembayaran.','<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Supplier</span><b>'+supplierData.length+'</b></span><button class="btnp" onclick="_openSupDataModal(-1)" style="padding:6px 10px">+ Supplier</button></div>');
  if(!filtered.length) return h+'<div class="card" style="text-align:center;padding:22px;color:var(--tx3)">Belum ada data supplier.</div></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">';
  filtered.forEach(function(sup){
    var oi=supplierData.indexOf(sup);
    h += '<div class="card" style="padding:16px;position:relative;overflow:hidden">';
    h += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#B98939,#F0C56A)"></div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">';
    h += '<div style="display:flex;gap:10px;align-items:center">';
    h += '<div style="width:40px;height:40px;border-radius:10px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:#FFD700;font-weight:800;font-size:16px">'+sup.nama.charAt(0).toUpperCase()+'</div>';
    h += '<div><div style="font-weight:700;color:var(--tx);font-size:13px">'+esc(sup.nama)+'</div><div style="font-size:10px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+'</div></div></div>';
    h += '<div style="display:flex;gap:5px">';
    h += '<button onclick="_openSupDataModal('+oi+')" class="btnsm" style="background:rgba(255,255,255,.04);color:var(--tx);border:1px solid rgba(255,255,255,.08)">Edit</button>';
    h += '<button onclick="confirmDelete(\'Hapus supplier <b>'+esc(sup.nama)+'</b>?\',function(){supplierData.splice('+oi+',1);saveSupplierAll();renderSupplier()})" class="btnsm" style="background:rgba(120,30,30,.12);color:#FFB2B2;border:1px solid rgba(255,178,178,.18)">X</button>';
    h += '</div></div>';
    var fields=[['&#128222;',sup.telepon],['&#128205;',sup.lokasi],['&#9993;',sup.email],['&#127974;',sup.bank+'  '+esc(sup.rekening||'')],['&#128200;',sup.metodeBayar]];
    h += '<div style="font-size:11px;display:flex;flex-direction:column;gap:5px">';
    fields.forEach(function(f){ if(f[1]&&f[1].trim()) h += '<div style="display:flex;gap:8px;align-items:center"><span style="font-size:13px">'+f[0]+'</span><span style="color:var(--tx2)">'+esc(f[1].trim())+'</span></div>'; });
    h += '</div>';
    if(sup.catatan) h += '<div style="font-size:11px;color:var(--tx2);margin-top:8px;padding-top:8px;border-top:1px solid var(--bd)">'+esc(sup.catatan)+'</div>';
    h += '</div>';
  });
  h += '</div>';
  return h+'</div>';
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
  var h = '<div class="sup-section">';
  h += _supTitleBar('History Bayar','Arsip seluruh pembayaran supplier beserta bukti transfer dan keterangannya.','<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Pembayaran</span><b>'+all.length+'</b></span>'+(all.length?'<span class="sup-soft-chip"><span>Total</span><b>Rp '+fmt(total)+'</b></span>':'')+'</div>');
  if(!all.length){ h+='<div class="card" style="text-align:center;padding:22px;color:var(--tx3)">Belum ada pembayaran.</div></div>'; return h; }
  h += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th>Supplier</th><th>Periode</th><th>Keterangan</th><th class="c">Jumlah</th><th class="c">Bukti</th></tr></thead><tbody>';
  all.forEach(function(b){
    h += '<tr><td style="white-space:nowrap">'+esc(b.tgl||'-')+'</td><td style="font-weight:700">'+esc(b.sup)+'</td><td style="font-size:10px;color:var(--tx2)">'+esc(b.periode)+'</td><td>'+esc(b.ket||'-')+'</td>';
    h += '<td class="c" style="font-weight:700;color:var(--tx)">Rp '+fmt(b.jml)+'</td>';
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
document.documentElement.style.fontSize = '17px';
if(document.body) document.body.style.fontSize = '16px';

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
    h += '</div>';
    h += '<div style="font-size:12px;color:var(--tx2);margin-bottom:8px">Mode Font</div>';
    h += '<div style="display:flex;gap:8px">';
    h += '<button onclick="var c=getCfg();c.fontMode=\'theme\';saveCfg(c);if(typeof applyFontMode===\'function\')applyFontMode();renderAdmin()" style="flex:1;padding:9px;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;background:'+((cfg.fontMode||'theme')==='theme'?'var(--navy)':'var(--bg3)')+';color:'+((cfg.fontMode||'theme')==='theme'?'#fff':'var(--tx2)')+'">Sesuai Tema</button>';
    h += '<button onclick="var c=getCfg();c.fontMode=\'default\';saveCfg(c);if(typeof applyFontMode===\'function\')applyFontMode();renderAdmin()" style="flex:1;padding:9px;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-family:Arial;background:'+((cfg.fontMode||'theme')==='default'?'var(--navy)':'var(--bg3)')+';color:'+((cfg.fontMode||'theme')==='default'?'#fff':'var(--tx2)')+'">Default</button>';
    h += '</div></div>';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Info Admin</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Nama Admin</label><input id="ADM-nm" class="fi" value="'+esc(cfg.adminName||'Hokky')+'"></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">No. WA Admin</label><input id="ADM-wa" class="fi" value="'+esc(cfg.adminWA||'6285710597159')+'"></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Password Admin (Secure Core)</label><input id="ADM-pass" class="fi" type="password" value="'+esc(cfg.adminPassword||'')+'" placeholder="'+(cfg.adminPassword?'Password admin tersimpan':'Kosong = masih pakai mode legacy')+'"><div style="font-size:10px;color:var(--tx2);margin-top:5px;line-height:1.6">Kosong berarti AJW masih memakai password admin legacy. Untuk publik/internal tim, isi password baru di sini agar login admin tidak lagi bergantung pada password bawaan lama.</div></div>';
    h += '<button onclick="var c=getCfg();c.adminName=document.getElementById(\'ADM-nm\').value.trim();c.adminWA=document.getElementById(\'ADM-wa\').value.trim();c.adminPassword=document.getElementById(\'ADM-pass\').value.trim();saveCfg(c);updateBadge();toast(\'Info admin & Secure Core disimpan\',\'success\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 20px;cursor:pointer;font-weight:700;font-family:Arial;width:100%">Simpan</button></div></div>';
    h += '<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Brand Sistem</div>';
    h += '<div style="margin-bottom:8px"><label class="lbl">Nama Website di Tabs</label><input id="ADM-title" class="fi" value="'+esc(cfg.sysTitle||'SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA')+'" placeholder="SISTEM MANAJEMEN \u2014 ANTON JAYA WIJAYA"></div>';
    h += '<div style="font-size:11px;color:var(--tx2);line-height:1.6;margin-bottom:10px">Judul ini akan tampil kecil di bar tab utama bersama badge status koneksi.</div>';
    h += '<button onclick="var c=getCfg();c.sysTitle=document.getElementById(\'ADM-title\').value.trim()||\'SISTEM MANAJEMEN — ANTON JAYA WIJAYA\';saveCfg(c);try{var st=document.getElementById(\'STITLE\');if(st)st.textContent=c.sysTitle;}catch(e){};if(typeof buildTabBar===\'function\')buildTabBar();toast(\'Brand sistem disimpan!\',\'success\')" style="width:100%;background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px;cursor:pointer;font-weight:700;font-family:Arial">Simpan Brand</button>';
    h += '</div>';
  }

  /* ── INTEGRASI & API ── */
  if(adminSub==='integrations'){
    /* WhatsApp API */
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">WhatsApp API Gateway</div>';
    h += '<div style="background:#EFF6FF;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.7">Aktifkan satu provider WhatsApp di sini agar semua fitur AJW yang butuh kirim pesan otomatis memakai konfigurasi yang sama. Saat ini yang disiapkan penuh adalah <b>Moon WA</b>.</div>';
    h += '<div class="g3" style="margin-bottom:9px"><div><label class="lbl">Provider Aktif</label><select id="WA-PROVIDER" class="fi"><option value="moonwa"'+((cfg.whatsappProvider||'moonwa')==='moonwa'?' selected':'')+'>Moon WA</option><option value="custom"'+((cfg.whatsappProvider||'moonwa')==='custom'?' selected':'')+'>Custom API</option><option value="none"'+((cfg.whatsappProvider||'moonwa')==='none'?' selected':'')+'>Nonaktif</option></select></div><div><label class="lbl">Status Integrasi</label><select id="WA-ACTIVE" class="fi"><option value="1"'+((cfg.whatsappActive!==false)?' selected':'')+'>Aktif</option><option value="0"'+((cfg.whatsappActive===false)?' selected':'')+'>Nonaktif</option></select></div><div><label class="lbl">API Key</label><input id="WA-KEY" class="fi" type="password" value="'+esc((cfg.whatsappApiKey||cfg.moonwaApiKey||''))+'" placeholder="API key provider"></div></div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Endpoint Send Message</label><input id="WA-MSG" class="fi" value="'+esc(cfg.whatsappMessageEndpoint||MOONWA_ENDPOINTS.message)+'" placeholder="https://.../send-message"></div><div><label class="lbl">Endpoint Send Media</label><input id="WA-MEDIA" class="fi" value="'+esc(cfg.whatsappMediaEndpoint||MOONWA_ENDPOINTS.media)+'" placeholder="https://.../send-media"></div></div>';
    h += '<div style="font-size:11px;color:var(--tx2);margin-bottom:10px">Dipakai oleh: Pengembalian Dana, Komplain, Request, Pesan Blast Customer, Blast Marketing, dan Automation Moon WA.</div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap"><button onclick="var c=getCfg();c.whatsappProvider=document.getElementById(\'WA-PROVIDER\').value;c.whatsappActive=document.getElementById(\'WA-ACTIVE\').value===\'1\';c.whatsappApiKey=document.getElementById(\'WA-KEY\').value.trim();c.moonwaApiKey=c.whatsappApiKey;c.whatsappMessageEndpoint=document.getElementById(\'WA-MSG\').value.trim();c.whatsappMediaEndpoint=document.getElementById(\'WA-MEDIA\').value.trim();saveCfg(c);toast(\'Integrasi WhatsApp disimpan\',\'success\');renderAdmin()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan WhatsApp API</button><button onclick="var wa=_toolsWhatsAppCfg();if(!wa.active){toast(\'Aktifkan integrasi WhatsApp dulu\',\'warn\');return;}if(wa.provider!==\'moonwa\'){toast(\'Test cepat saat ini baru untuk Moon WA\',\'warn\');return;}fetch(wa.messageEndpoint,{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({api_key:wa.apiKey,receiver:\''+esc((cfg.adminWA||'6285710597159'))+'@c.us\',data:{message:\'Test koneksi WhatsApp AJW berhasil\'}})}).then(function(r){return r.json().catch(function(){return {message:\'HTTP \'+r.status,status:false};}).then(function(d){return {ok:r.ok,data:d};});}).then(function(res){if(res.ok&&(res.data.status===true||res.data.success===true||!res.data.error))toast(\'Test WhatsApp berhasil\',\'success\');else toast(\'Test gagal: \'+((res.data&&(res.data.message||res.data.msg||res.data.error))||\'Unknown error\'),\'error\',5200);}).catch(function(e){toast(\'Test error: \'+e.message,\'error\',5200);})" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Test Koneksi</button></div></div>';
    h += '<div class="card" style="padding:14px;margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">AI Core / OpenClaw / Codex Bridge</div>';
    h += '<div style="background:#EFF6FF;border-radius:6px;padding:9px;margin-bottom:9px;font-size:11px;line-height:1.7">Satu konfigurasi bridge di sini akan dipakai bersama oleh <b>AI &gt; Agent AI</b>, <b>AI &gt; Automation</b>, dan task otomasi agent lintas AJW.</div>';
    h += '<div class="g3" style="margin-bottom:9px"><div><label class="lbl">Provider</label><select id="AI-BRIDGE-PROVIDER" class="fi"><option value="openclaw"'+((cfg.aiCoreProvider||'openclaw')==='openclaw'?' selected':'')+'>OpenClaw</option><option value="openai"'+((cfg.aiCoreProvider||'openclaw')==='openai'?' selected':'')+'>OpenAI Direct</option><option value="custom"'+((cfg.aiCoreProvider||'openclaw')==='custom'?' selected':'')+'>Custom Agent</option></select></div><div><label class="lbl">Runtime</label><select id="AI-BRIDGE-RUNTIME" class="fi"><option value="bridge"'+((cfg.aiCoreRuntime||'bridge')==='bridge'?' selected':'')+'>Bridge</option><option value="openai-direct"'+((cfg.aiCoreRuntime||'bridge')==='openai-direct'?' selected':'')+'>OpenAI Direct</option></select></div><div><label class="lbl">Nama Agent</label><input id="AI-BRIDGE-NAME" class="fi" value="'+esc(cfg.aiBridgeAgentName||'AJW Brain')+'" placeholder="AJW Brain"></div></div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Endpoint Bridge</label><input id="AI-BRIDGE-ENDPOINT" class="fi" value="'+esc(cfg.aiBridgeEndpoint||'')+'" placeholder="https://.../agent/run"><div style="font-size:10px;color:var(--tx2);margin-top:5px">Isi endpoint API bridge POST JSON, bukan root dashboard OpenClaw.</div></div><div><label class="lbl">API Key / Token</label><input id="AI-BRIDGE-KEY" class="fi" type="password" value="'+esc(cfg.aiBridgeApiKey||'')+'" placeholder="Bearer / secret token"></div></div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">OpenClaw Gateway</label><input id="AI-BRIDGE-GATEWAY" class="fi" value="'+esc(cfg.openclawGatewayUrl||'ws://127.0.0.1:18789')+'" placeholder="ws://127.0.0.1:18789"></div><div><label class="lbl">OpenClaw Dashboard</label><input id="AI-BRIDGE-DASH" class="fi" value="'+esc(cfg.openclawDashboardUrl||'http://127.0.0.1:18789/')+'" placeholder="http://127.0.0.1:18789/"></div></div>';
    h += '<div class="g2" style="margin-bottom:9px"><div><label class="lbl">Codex Workspace</label><input id="AI-BRIDGE-CODEX-WS" class="fi" value="'+esc(cfg.codexWorkspace||'D:\\CODEX\\AJW')+'" placeholder="D:\\CODEX\\AJW"></div><div><label class="lbl">Codex Mode</label><select id="AI-BRIDGE-CODEX-MODE" class="fi"><option value="task"'+((cfg.codexMode||'task')==='task'?' selected':'')+'>Task</option><option value="patch"'+((cfg.codexMode||'task')==='patch'?' selected':'')+'>Patch</option><option value="review"'+((cfg.codexMode||'task')==='review'?' selected':'')+'>Review</option></select></div></div>';
    h += '<div style="margin-bottom:10px"><label class="lbl">Catatan Bridge</label><textarea id="AI-BRIDGE-NOTES" class="fi" rows="4" placeholder="Aturan kerja OpenClaw, Codex, endpoint, atau guardrail">'+esc(cfg.aiBridgeNotes||'')+'</textarea></div>';
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap"><button onclick="_toolsAgentBridgeApplyLocalPreset(false)" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Mode Bridge Lokal</button><button onclick="_adminSaveAIBridge();renderAdmin()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Simpan Bridge AI</button><button onclick="_adminPingAIBridge()" style="background:var(--bg3);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Ping Bridge</button><button onclick="var u=document.getElementById(\'AI-BRIDGE-DASH\').value.trim();if(!u){toast(\'Isi dashboard URL dulu\',\'warn\');return;}window.open(u,\'_blank\')" style="background:var(--navy);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Buka Dashboard</button></div></div>';
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
      {id:'dash',def:'Dashboard'},
      {id:'kpi',def:'KPI'},
      {id:'hr',def:'HR'},
      {id:'finance',def:'Finance'},
      {id:'analytics',def:'Analytics'},
      {id:'ai',def:'AI'},
      {id:'development',def:'Development'},
      {id:'tools',def:'Tools'},
      {id:'admin',def:'Admin'}
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
    h += '<div style="font-size:11px;color:var(--tx2);line-height:1.7;margin-bottom:10px">Mode <b>Secure Core</b> aktif: export normal akan menyamarkan API key/token dan tidak membawa sesi login browser. Gunakan backup internal hanya untuk arsip owner yang disimpan sangat aman.</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
    h += '<button onclick="exportData()" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Export Aman</button>';
    h += '<button onclick="exportDataTrusted()" style="background:#6b4d14;color:#fff;border:none;border-radius:6px;padding:9px 14px;cursor:pointer;font-weight:700;font-family:Arial;font-size:12px">Backup Internal</button>';
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
  var h='<div class="sup-shell sup-compact">';
  h+='<div class="sup-toolbar">';
  h+=_supTitleBar('Hutang Supplier','Pantau saldo hutang supplier, dokumen nota, pesanan pembelian, data supplier, dan history pembayaran dalam satu tempat.','<div style="display:flex;gap:7px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Supplier</span><b>'+allNames.length+'</b></span><span class="sup-soft-chip"><span>Nota</span><b>'+supplierHutang.length+'</b></span><span class="sup-soft-chip"><span>Saldo</span><b>Rp '+fmt(gS)+'</b></span></div>');
  var views=[{id:'dashboard',lbl:'Dashboard'},{id:'hutang',lbl:'Hutang Nota'},{id:'pesanan',lbl:'Pesanan'},{id:'data',lbl:'Data Supplier'},{id:'history',lbl:'History Bayar'}];
  h+='<div class="sup-nav">';
  views.forEach(function(v){
    var act=supplierView===v.id;
    h+='<button onclick="supplierView=\''+v.id+'\';renderSupplier()" class="sup-nav-btn '+(act?'on':'')+'">'+v.lbl+'</button>';
  });
  h+='</div>';
  h+='<div class="sup-filter-pills" style="margin-top:8px">';
  h+='<span class="sup-tip">Filter supplier:</span>';
  var allAct=supplierFilter==='all';
  h+='<button onclick="supplierFilter=\'all\';renderSupplier()" class="sup-pill '+(allAct?'on':'')+'">Semua</button>';
  allNames.forEach(function(nm){
    var act=supplierFilter===nm;
    var safe=_supName(nm);
    h+='<button onclick="supplierFilter=\''+safe+'\';renderSupplier()" class="sup-pill '+(act?'on':'')+'">'+esc(nm)+'</button>';
  });
  h+='</div></div>';
  /* Views */
  if(supplierView==='dashboard') h+=_supDash(allNames,sumBySup,gN,gB,gS);
  else if(supplierView==='hutang') h+=_supHutangV2();
  else if(supplierView==='pesanan') h+=_supPesanan(allNames);
  else if(supplierView==='data') h+=_supData();
  else if(supplierView==='history') h+=_supHistory();
  h+=_supAllModals(allNames);
  h+='</div>';
  document.getElementById('V-supplier').innerHTML=h;
  var vs=document.getElementById('V-supplier');
  if(vs) vs.classList.add('sup-compact');
};

/* ── 9. _supHutangV2 — simple view + edit button + dropdown actions ── */
function _supHutangV2(){
  var filtered=supplierHutang.filter(function(d){return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter;});
  var h='<div class="sup-section">';
  h+=_supTitleBar('Hutang Nota','Kelola seluruh nota supplier, pembayaran per bulan, dan saldo hutang yang masih aktif.','<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Nota Aktif</span><b>'+filtered.length+'</b></span><button class="btns" onclick="_exportExcelAll()" style="padding:0 10px;height:30px">Export</button><button class="btnp" onclick="_openNotaModal()" style="padding:0 12px;height:30px">+ Nota</button></div>');
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><span class="sup-soft-chip"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#AEB7C2"></span>Nilai Nota</span><span class="sup-soft-chip"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8FA49A"></span>Pembayaran Masuk</span><span class="sup-soft-chip"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#B8A16C"></span>Saldo Tersisa</span>'+_supInfoIcon('Ringkasan warna pada halaman hutang nota: nilai nota, pembayaran masuk, dan saldo tersisa.')+'</div>';
  if(!filtered.length) return h+'<div class="card" style="text-align:center;padding:24px;color:var(--tx2)">Belum ada nota. Klik + Nota.</div></div>';
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
    h+='<div style="margin-bottom:14px">';
    /* Month header */
    h+='<div style="background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.06);border-bottom:none;border-radius:8px 8px 0 0;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h+='<span style="color:var(--tx);font-weight:700;font-size:13px">'+esc(mg.label)+'</span>';
    h+='<div style="display:flex;gap:14px;font-size:11px;color:var(--tx2);flex-wrap:wrap">';
    h+='<span>Nota <b style="color:var(--tx)">Rp '+fmt(mN)+'</b></span>';
    h+='<span>Bayar <b style="color:var(--tx)">Rp '+fmt(mB)+'</b></span>';
    h+='<span>Saldo <b style="color:var(--tx)">Rp '+fmt(mS)+'</b></span>';
    h+='</div></div>';
    /* Notas */
    h+='<div style="border:1px solid rgba(255,255,255,.08);border-top:none;border-radius:0 0 var(--r) var(--r)">';
    mg.items.forEach(function(d,di){
      var oi=supplierHutang.indexOf(d);
      var tN=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
      var tB=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
      var saldo=tN-tB, lunas=saldo<=0;
      var notaCount=(d.nota||[]).length, bayarCount=(d.bayar||[]).length;
      var rowBorder=(di===mg.items.length-1?'none':'1px solid rgba(255,255,255,.06)');
      h+='<div style="border-bottom:'+rowBorder+'">';
      /* Nota bar */
      h+='<div style="padding:9px 12px;display:grid;grid-template-columns:minmax(200px,.85fr) minmax(0,1.2fr) auto;align-items:center;gap:10px;background:rgba(255,255,255,.012)">';
      h+='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0">';
      h+='<span style="display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.02);color:var(--tx)">'+(lunas?'Lunas':'Belum Lunas')+'</span>';
      h+='<span style="font-size:12px;font-weight:700;color:var(--tx)">'+esc(d.namaSupplier||'Golden Fish')+'</span>';
      h+='<span style="font-size:11px;color:var(--tx2)">'+notaCount+' item nota</span>';
      h+='<span style="font-size:11px;color:var(--tx2)">'+bayarCount+' pembayaran</span>';
      if(d.catatan) h+='<span style="font-size:11px;color:var(--tx3)">• '+esc(d.catatan)+'</span>';
      h+='</div>';
      h+='<div class="sup-hutang-meta"><span>Nota <b>Rp '+fmt(tN)+'</b></span><span>Bayar <b>Rp '+fmt(tB)+'</b></span><span>Saldo <b>Rp '+fmt(saldo)+'</b></span></div>';
      /* Dropdown action button */
      h+='<div style="position:relative;display:inline-block">';
      h+='<button onclick="var m=document.getElementById(\'NOTA-DD-'+oi+'\');m.style.display=m.style.display===\'block\'?\'none\':\'block\'" class="btns" style="padding:0 10px;height:30px;font-size:11px">Aksi &#9660;</button>';
      h+='<div id="NOTA-DD-'+oi+'" style="display:none;position:absolute;right:0;top:100%;background:var(--bg2);border:1px solid rgba(219,151,76,.28);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;min-width:180px;overflow:hidden">';
      if(!lunas) h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openBayarModal('+oi+')" style="width:100%;padding:10px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:11px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:700">Bayar Nota</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openEditNotaModal('+oi+')" style="width:100%;padding:10px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:11px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:600">Edit Nota</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';genInvoiceSupplier('+oi+')" style="width:100%;padding:10px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:11px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:600">Invoice</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_openBuktiModal('+oi+')" style="width:100%;padding:10px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:11px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:600">Upload Bukti</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';_exportExcelOne(_supName(supplierHutang['+oi+'].namaSupplier||\'Golden Fish\'))" style="width:100%;padding:10px 14px;border:none;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:11px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);font-weight:700">Export Excel</button>';
      h+='<button onclick="document.getElementById(\'NOTA-DD-'+oi+'\').style.display=\'none\';deleteSupplierRecord('+oi+')" style="width:100%;padding:9px 14px;border:none;background:rgba(120,30,30,.12);color:#FFB2B2;cursor:pointer;font-size:11px;text-align:left;font-weight:700">Hapus</button>';
      h+='</div></div></div>';
      /* Transactions - simplified */
      var txns=[];
      (d.nota||[]).forEach(function(n){txns.push({tgl:n.tgl,noDok:n.noDok,ket:n.keterangan,kode:n.kode,netto:parseFloat(n.nilaiNetto)||0,bayar:0,isBayar:false,bukti:''});});
      (d.bayar||[]).forEach(function(b){txns.push({tgl:b.tgl,noDok:'',ket:b.keterangan,kode:'',netto:0,bayar:parseFloat(b.jumlah)||0,isBayar:true,bukti:b.bukti||''});});
      txns.sort(function(a,b){return (a.tgl||'').localeCompare(b.tgl||'');});
      h+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
      h+='<thead><tr style="background:var(--bg3)"><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:var(--tx2);font-weight:700">Tanggal</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:var(--tx2);font-weight:700">No Dokumen</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:var(--tx2);font-weight:700">Keterangan</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);color:var(--tx2);font-weight:700">Kode</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;color:var(--tx2);font-weight:700">Nilai Nota</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;color:var(--tx2);font-weight:700">Bayar</th><th style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:right;color:var(--tx2);font-weight:700">Saldo</th></tr></thead><tbody>';
      var sRun=0;
      txns.forEach(function(tx){
        sRun+=tx.netto-tx.bayar;
        h+='<tr style="border-bottom:1px solid rgba(255,255,255,.05)">';
        h+='<td style="padding:8px 12px;color:var(--tx);white-space:nowrap">'+esc(tx.tgl||'')+'</td>';
        h+='<td style="padding:8px 12px;color:var(--tx)">'+esc(tx.noDok||'')+'</td>';
        h+='<td style="padding:8px 12px;color:var(--tx);font-weight:'+(tx.isBayar?'600':'400')+'">'+esc(tx.ket||'')+(tx.bukti?'&nbsp;<span style="color:var(--tx2);font-size:10px">&#128248;</span>':'')+'</td>';
        h+='<td style="padding:8px 12px;color:var(--tx2);text-align:center">'+esc(tx.kode||'')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;color:'+(tx.netto>0?'var(--tx)':'var(--tx3)')+'">'+( tx.netto>0?'Rp '+fmt(tx.netto):'-')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;color:'+(tx.bayar>0?'var(--tx)':'var(--tx3)')+'">'+( tx.bayar>0?'Rp '+fmt(tx.bayar):'-')+'</td>';
        h+='<td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--tx)">Rp '+fmt(sRun)+'</td></tr>';
      });
      h+='<tr style="background:var(--bg3);border-top:1px solid rgba(255,255,255,.08)"><td colspan="4" style="padding:9px 12px;font-weight:800;color:var(--tx);letter-spacing:.03em">TOTAL</td>';
      h+='<td style="padding:9px 12px;text-align:right;font-weight:800;color:var(--tx)">Rp '+fmt(tN)+'</td>';
      h+='<td style="padding:9px 12px;text-align:right;font-weight:800;color:var(--tx)">Rp '+fmt(tB)+'</td>';
      h+='<td style="padding:9px 12px;text-align:right;font-weight:800;color:var(--tx)">Rp '+fmt(saldo)+'</td></tr>';
      h+='</tbody></table></div>';
      /* Bukti */
      if(d.buktiFoto&&d.buktiFoto.length){
        h+='<div style="padding:8px 14px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;background:var(--bg3);border-top:1px solid rgba(255,255,255,.06)">';
        h+='<span style="font-size:11px;font-weight:600;color:var(--tx2)">Bukti:</span>';
        d.buktiFoto.forEach(function(img){h+='<img src="'+img+'" onclick="showImageFull(this.src)" style="width:68px;height:52px;object-fit:cover;border-radius:5px;border:1px solid var(--bd);cursor:pointer">';});
        h+='</div>';
      }
      h+='</div>';
    });
    h+='</div></div>';
  });
  /* Close dropdown on outside click */
  /* dropdown handled globally */  return h+'</div>';
}

/* ── 10. _supDash — show inline hutang detail ── */
_supDash = function(names, sum, gNota, gBayar, gSaldo){
  var h='<div class="sup-section">';
  var paymentRate=gNota>0?Math.round((gBayar/gNota)*100):0;
  var outstandingSuppliers=names.filter(function(nm){ return (sum[nm]&&sum[nm].saldo>0); });
  var prioritySupplier=names.slice().sort(function(a,b){ return ((sum[b]&&sum[b].saldo)||0)-((sum[a]&&sum[a].saldo)||0); })[0]||'';
  var prioritySaldo=prioritySupplier&&sum[prioritySupplier]?sum[prioritySupplier].saldo:0;
  var monthlySaldoMap={};
  supplierHutang.filter(function(d){return supplierFilter==='all'||(d.namaSupplier||'Golden Fish')===supplierFilter;}).forEach(function(d){
    var mk=(d.tahun||2026)+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
    if(!monthlySaldoMap[mk]) monthlySaldoMap[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0,saldo:0};
    var nota=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
    var bayar=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
    monthlySaldoMap[mk].nota+=nota;
    monthlySaldoMap[mk].bayar+=bayar;
    monthlySaldoMap[mk].saldo+=nota-bayar;
  });
  var monthlyRows=Object.keys(monthlySaldoMap).sort().map(function(key){
    return {label:monthlySaldoMap[key].label||key,nota:monthlySaldoMap[key].nota||0,bayar:monthlySaldoMap[key].bayar||0,saldo:monthlySaldoMap[key].saldo||0};
  });
  function topMetric(title,value,accent,tip){
    return '<div class="sup-mini-card" style="position:relative">'+
      '<div style="position:absolute;left:0;right:0;top:0;height:2px;background:'+accent+'"></div>'+
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div class="sup-stat-key" style="color:var(--tx2)">'+title+'</div>'+_supInfoIcon(tip)+'</div>'+
      '<div class="sup-stat-val" style="margin-top:7px;color:var(--tx)">'+value+'</div></div>';
  }
  h+=_supTitleBar('Dashboard Hutang Supplier','Ringkasan saldo hutang, pembelian, pembayaran, dan supplier prioritas pada periode aktif.','<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="sup-soft-chip"><span>Coverage</span><b>'+paymentRate+'%</b></span><span class="sup-soft-chip"><span>Supplier Aktif</span><b>'+outstandingSuppliers.length+'</b></span></div>');
  h+='<div class="sup-overview-grid">';
  h+=topMetric('Total Pembelian','Rp '+fmt(gNota),'rgba(255,255,255,.08)','Akumulasi seluruh nilai nota supplier pada periode aktif.');
  h+=topMetric('Total Terbayar','Rp '+fmt(gBayar),'rgba(255,255,255,.08)','Total pembayaran yang sudah tercatat pada nota supplier.');
  h+=topMetric('Saldo Hutang','Rp '+fmt(gSaldo),'rgba(255,255,255,.08)','Saldo hutang yang masih harus dibayar.');
  h+=topMetric('Jumlah Nota',supplierHutang.length+' nota','rgba(255,255,255,.08)','Jumlah dokumen nota aktif yang sedang terbaca oleh dashboard.');
  h+=topMetric('Coverage Pembayaran',paymentRate+'%','rgba(255,255,255,.08)','Persentase pembayaran terhadap total pembelian. Semakin tinggi berarti hutang makin terkendali.');
  h+=topMetric('Supplier Perlu Tindak Lanjut',outstandingSuppliers.length+' supplier','rgba(255,255,255,.08)','Jumlah supplier dengan saldo aktif yang masih memerlukan pembayaran.');
  h+=topMetric('Prioritas Tertinggi',prioritySupplier?esc(prioritySupplier):'Belum ada','rgba(255,255,255,.08)','Supplier dengan saldo terbesar saat ini: Rp '+fmt(prioritySaldo));
  h+='</div>';
  h+='<div class="sup-list-card" style="padding:12px 13px;margin-bottom:14px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:var(--tx);letter-spacing:.02em">Trend Saldo Hutang / Bulan</div><div class="sup-muted-note" style="margin-top:2px">X = tanggal/periode, Y = nominal. Menampilkan total pembelian, total terbayar, dan saldo hutang.</div></div><span class="sup-soft-chip"><span>Periode</span><b>'+monthlyRows.length+'</b></span></div>';
  h+=_supDebtTrendSvg(monthlyRows);
  h+='</div>';
  var filtered=supplierFilter==='all'?names:names.filter(function(n){return n===supplierFilter;});
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">';
  filtered.forEach(function(nm){
    var s=sum[nm]||{nota:0,bayar:0,saldo:0,count:0};
    var pct=s.nota>0?Math.min(100,Math.round(s.bayar/s.nota*100)):0;
    var sup=supplierData.filter(function(d){return d.nama===nm;})[0]||{};
    var safeNm=_supName(nm);
    var supNotas=supplierHutang.filter(function(d){return (d.namaSupplier||'Golden Fish')===nm;});
    var mMap={};
    supNotas.forEach(function(d){
      var mk=(d.tahun||2026)+'-'+(d.bulanNum?String(d.bulanNum).padStart(2,'0'):'00');
      if(!mMap[mk]) mMap[mk]={label:(d.bulan||'')+' '+(d.tahun||''),nota:0,bayar:0};
      mMap[mk].nota+=(d.nota||[]).reduce(function(s0,n){return s0+(parseFloat(n.nilaiNetto)||0);},0);
      mMap[mk].bayar+=(d.bayar||[]).reduce(function(s0,b){return s0+(parseFloat(b.jumlah)||0);},0);
    });
    var mKeys=Object.keys(mMap).sort();
    h+='<div class="sup-horizontal-card">';
    h+='<div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;color:var(--tx);font-weight:800;font-size:14px;flex-shrink:0">'+nm.charAt(0).toUpperCase()+'</div><div><div style="font-weight:700;color:var(--tx);font-size:13px">'+esc(nm)+'</div><div style="font-size:10px;color:var(--tx2)">'+esc(sup.kategori||'Supplier')+(sup.telepon?' • '+esc(sup.telepon):'')+'</div></div></div><span class="sup-soft-chip">'+(s.saldo>0?'<span>Saldo</span><b>Rp '+fmt(s.saldo)+'</b>':'<span>Status</span><b>Lunas</b>')+'</span></div>';
    h+='<div><div class="sup-inline-stats" style="margin-bottom:8px">';
    [['Nota','Rp '+fmt(s.nota)],['Terbayar','Rp '+fmt(s.bayar)],['Progress',pct+'%']].forEach(function(meta){
      h+='<div class="sup-inline-stat"><div class="k">'+meta[0]+'</div><div class="v">'+meta[1]+'</div></div>';
    });
    h+='</div><div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:var(--tx2)">Rasio pembayaran supplier</span><span style="font-weight:700;color:var(--tx)">'+pct+'%</span></div><div style="height:6px;background:rgba(255,255,255,.04);border-radius:3px"><div style="height:100%;border-radius:3px;background:rgba(197,169,107,.88);width:'+pct+'%"></div></div></div></div>';
    if(mKeys.length){
      h+='<div class="sup-hutang-list">';
      mKeys.forEach(function(mk){
        var m=mMap[mk],saldo=m.nota-m.bayar;
        h+='<div class="sup-hutang-item"><div class="sup-hutang-row">';
        h+='<div><div style="font-size:11px;font-weight:700;color:var(--tx)">'+esc(m.label)+'</div><div style="font-size:9px;color:var(--tx3);margin-top:2px">Periode nota aktif</div></div>';
        h+='<div class="sup-hutang-meta">';
        h+='<span>Nota <b>Rp '+fmt(m.nota)+'</b></span>';
        h+='<span>Bayar <b>Rp '+fmt(m.bayar)+'</b></span>';
        h+='<span>Saldo <b>Rp '+fmt(saldo)+'</b></span>';
        h+='</div>';
        h+='<span class="sup-soft-chip">'+(saldo<=0?'<span>Status</span><b>Lunas</b>':'<span>Status</span><b>Belum</b>')+'</span>';
        h+='</div></div>';
      });
      h+='</div>';
    } else {
      h+='<div style="color:var(--tx3);font-size:10px;padding:14px;border:1px dashed rgba(255,255,255,.08);border-radius:10px">Belum ada ringkasan hutang bulanan.</div>';
    }
    h+='<div style="display:flex;gap:8px;align-self:center;flex-direction:column"><button onclick="supplierFilter=\''+safeNm+'\';supplierView=\'hutang\';renderSupplier()" class="btns" style="padding:0 10px;height:30px">Lihat Nota</button>'+(s.saldo>0?'<button onclick="_openBayarBulk(\''+safeNm+'\')" class="btnp" style="padding:0 10px;height:30px">Bayar</button>':'')+'</div></div>';
  });
  h+='</div>';
  /* Monthly recap */
  h+='<div class="sup-section">'+_supTitleBar('Rekap Bulanan','Akumulasi total nota, pembayaran, dan saldo per bulan berdasarkan filter supplier yang sedang aktif.','');
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
      h+='<td class="c" style="color:var(--tx);font-weight:700">Rp '+fmt(m.nota)+'</td>';
      h+='<td class="c" style="color:var(--tx);font-weight:700">Rp '+fmt(m.bayar)+'</td>';
      h+='<td class="c" style="font-weight:700;color:var(--tx)">Rp '+fmt(saldo)+'</td>';
      h+='<td class="c"><span class="chip" style="background:rgba(255,255,255,.02);color:var(--tx);border:1px solid rgba(255,255,255,.12)">'+(saldo<=0?'Lunas':'Belum Lunas')+'</span></td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div style="color:var(--tx2);padding:14px;text-align:center">Belum ada data</div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">';
  h+='<button onclick="_exportExcelAll()" class="btns" style="padding:0 11px;height:30px">Export Excel Semua Supplier</button>';
  h+='<button onclick="if(supplierFilter!==\'all\')_exportExcelOne(supplierFilter);else toast(\'Pilih 1 supplier dulu\',\'warn\')" class="btns" style="padding:0 11px;height:30px">Export Supplier Aktif</button>';
  h+='</div>';
  return h+'</div>';
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
document.documentElement.style.fontSize='17px';
if(document.body) document.body.style.fontSize='16px';

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
function _saveLB(){ localStorage.setItem('ajw_laporan',JSON.stringify(_lb)); if(typeof _queueSupabaseSync==='function') _queueSupabaseSync(); }

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

  var BASE_BTN = 'border:1px solid rgba(219,151,76,.34);cursor:pointer;font-family:Arial;font-weight:700;font-size:12px;white-space:nowrap;padding:9px 18px;background:transparent;border-radius:999px;transition:all .15s;';
  var h = '';
  groups.forEach(function(g){
    if(g.id==='admin' && role!=='admin') return;
    if(tc['hide_'+g.id]) return;
    var lbl = tc['label_'+g.id]||g.lbl;

    if(g.type==='s'){
      var act = _activeTab===g.id;
      h += '<button id="TB-'+g.id+'" onclick="_go(\''+g.id+'\')" style="'+BASE_BTN+'color:'+(act?'#F0C56A':'#C4B59A')+';border-color:'+(act?'rgba(219,151,76,.9)':'rgba(219,151,76,.34)')+';box-shadow:'+(act?'inset 0 0 0 1px rgba(219,151,76,.25)':'none')+'">'+esc(lbl)+'</button>';
    } else {
      /* group: check if any child is active */
      var grpAct = g.tabs.some(function(t){ return t.id===_activeTab; });
      h += '<div style="position:relative;display:inline-flex;align-items:stretch">';
      h += '<button id="TGB-'+g.id+'" onclick="_ddToggle(\''+g.id+'\')" style="'+BASE_BTN+'color:'+(grpAct?'#F0C56A':'#C4B59A')+';border-color:'+(grpAct?'rgba(219,151,76,.9)':'rgba(219,151,76,.34)')+';box-shadow:'+(grpAct?'inset 0 0 0 1px rgba(219,151,76,.25)':'none')+'">'+esc(lbl)+'</button>';
      /* Dropdown panel — starts hidden via style.display */
      h += '<div id="TDD-'+g.id+'" style="display:none;position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid rgba(219,151,76,.28);border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,.28);min-width:220px;z-index:9999;overflow:hidden">';
      g.tabs.forEach(function(t){
        if(role!=='admin' && (t.id==='eval'||t.id==='payroll'||t.id==='hist')) return;
        var tAct = _activeTab===t.id;
        h += '<button onclick="_ddClose();_go(\''+t.id+'\')" style="display:block;width:100%;padding:11px 16px;border:none;background:'+(tAct?'rgba(219,151,76,.12)':'var(--bg2)')+';color:'+(tAct?'#F0C56A':'var(--tx)')+';cursor:pointer;font-size:12px;font-family:Arial;text-align:left;border-bottom:1px solid rgba(255,255,255,.05);font-weight:'+(tAct?'700':'500')+';box-sizing:border-box'+(tAct?';border-left:3px solid rgba(219,151,76,.8)':'')+'">'+esc(t.lbl)+'</button>';
      });
      h += '</div></div>';
    }
  });
  /* Custom tabs */
  if(typeof customTabs!=='undefined') customTabs.forEach(function(ct){
    var act = _activeTab==='ct_'+ct.id;
    h += '<button onclick="_go(\'ct_'+ct.id+'\')" style="'+BASE_BTN+'color:'+(act?'#F0C56A':'#C4B59A')+';border-color:'+(act?'rgba(219,151,76,.9)':'rgba(219,151,76,.34)')+';box-shadow:'+(act?'inset 0 0 0 1px rgba(219,151,76,.25)':'none')+'">'+esc(ct.name)+'</button>';
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
  window._ajwAdminPassword = function(){
    try{
      var cfg=getCfg()||{};
      return String(cfg.adminPassword||'@Alva711119').trim();
    }catch(e){
      return '@Alva711119';
    }
  };
  window._ajwLegacyAdminPasswordActive = function(){
    try{
      var cfg=getCfg()||{};
      return !String(cfg.adminPassword||'').trim();
    }catch(e){
      return true;
    }
  };
  window._ajwResetLocalAccess = function(){
    var ok = window.confirm('Reset akses lokal AJW di perangkat ini?\n\nTindakan ini akan:\n- menghapus password admin tersimpan lokal\n- mengembalikan login admin ke mode legacy\n- menghapus sesi login aktif lokal\n\nData AJW lain tidak dihapus.');
    if(!ok) return;
    try{
      var cfg = getCfg()||{};
      delete cfg.adminPassword;
      if(!cfg.adminName) cfg.adminName = 'Hokky';
      saveCfg(cfg);
      localStorage.removeItem('ajw_session');
      var err=document.getElementById('LI-ERR');
      if(err){
        err.style.display='block';
        err.style.color='#8fd0ff';
        err.textContent='Akses lokal direset. Coba login admin lagi dengan password legacy: @Alva711119';
      }
      var p=document.getElementById('LI-P');
      if(p){ p.value=''; p.focus(); }
      var u=document.getElementById('LI-U');
      if(u && !u.value.trim()) u.value = cfg.adminName || 'Hokky';
      toast('Akses lokal berhasil direset','success',5000);
    }catch(e){
      var err=document.getElementById('LI-ERR');
      if(err){
        err.style.display='block';
        err.textContent='Reset akses lokal gagal: '+(e.message||e);
      }
    }
  };
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
    +'<div style="margin-top:14px;text-align:center;font-size:11px;color:#444">Nama bebas diisi apa saja. Admin: password sistem &nbsp;|&nbsp; Karyawan: 6 digit akhir WA</div>'
     +'<button onclick="_ajwResetLocalAccess()" style="width:100%;margin-top:10px;background:transparent;color:#c4b59a;border:1px solid #2a2a2a;border-radius:6px;padding:10px;cursor:pointer;font-size:12px;font-weight:700;font-family:Arial">Reset Akses Lokal</button>'
     +(window._ajwLegacyAdminPasswordActive()?'<div style="margin-top:8px;text-align:center;font-size:10px;color:#b08d57">Mode legacy aktif. Ubah password admin di Admin → Umum & Tema untuk Secure Core.</div>':'')
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
  if(p===window._ajwAdminPassword()){ role='admin'; }
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
    pesananData:pesananData||[], laporanBulanan:_lb||[], hrSops:(typeof _hrSops!=='undefined'&&_hrSops)||[], hrControl:(typeof _hrControlData!=='undefined'&&_hrControlData)||null, devHub:(typeof _devHub!=='undefined'&&_devHub)||null,
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
        if(d.hrSops){ _hrSops=d.hrSops; sv('ajw_hr_sops',_hrSops); }
        if(d.hrControl){ _hrControlData=d.hrControl; sv('ajw_hr_control',_hrControlData); }
        if(d.devHub){ _devHub=d.devHub; sv('ajw_dev_hub',_devHub); }
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
  var rt = window._sbSyncRuntime = window._sbSyncRuntime || {running:false,pending:false,pendingSilent:true,promise:null};
  if(rt.running){
    rt.pending = true;
    rt.pendingSilent = rt.pendingSilent && !!silent;
    return rt.promise || Promise.resolve({queued:true});
  }
  if(!silent)toast('Sync ke Supabase...', 'info', _sbSafeModeEnabled() ? 9000 : 7000);
  rt.running = true;
  rt.pending = false;
  rt.pendingSilent = true;
  var financeErrors=[];
  var dirtyFlags = _sbDirtySnapshot();
  var fullSync = !silent || !_sbSafeModeEnabled();
  rt.promise = runSupabaseSchemaAudit(true).catch(function(){ return _sbSchemaAudit || {}; }).then(function(audit){
    var steps=[];
    function _warnOnly(label){
      return function(e){ console.warn(label, e); return {ok:false,error:e}; };
    }
    function _finSyncCatch(label){
      return function(e){
        var msg=(e&&e.message)||String(e);
        financeErrors.push(label+': '+msg);
        _sbAddSchemaLog('error','Sync finance gagal pada '+label,{message:msg}, true);
        return {ok:false,error:e};
      };
    }
    var batchSize = _sbSafeBatchSize();
    var hrSopReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_hr_sops' && !it.ok; });
    var financeReady = !!(audit && audit.financeReady);
    var toolsRefundReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_refunds' && !it.ok; });
    var toolsComplaintReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_complaints' && !it.ok; });
    var toolsRequestReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_requests' && !it.ok; });
    var toolsProductsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_products' && !it.ok; });
    var toolsDescReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_desc_revision' && !it.ok; });
    var toolsBlastRowsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_blast_rows' && !it.ok; });
    var toolsBlastHistoryReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_blast_history' && !it.ok; });
    var toolsBlastPhoneReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_blast_phone_db' && !it.ok; });
    var toolsBlastMarketingReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_blast_marketing' && !it.ok; });
    var hrControlReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_hr_control' && !it.ok; });
    var devHubReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_dev_hub' && !it.ok; });
    var analyticsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_analytics_data' && !it.ok; });
    var customerDataReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_customer_data' && !it.ok; });
    var toolsMaterialStockReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_material_stock' && !it.ok; });
    var toolsMaterialOrdersReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_material_orders' && !it.ok; });
    var toolsMaterialHistoryReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_material_order_history' && !it.ok; });
    var toolsMaterialSessionsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_material_sessions' && !it.ok; });
    var toolsAutomationJobsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_automation_jobs' && !it.ok; });
    var toolsAutomationLogsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_automation_logs' && !it.ok; });
    var toolsWebhooksReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_webhooks' && !it.ok; });
    var toolsPickingRowsReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_picking_rows' && !it.ok; });
    var toolsPickingHistoryReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_picking_history' && !it.ok; });
    var toolsMetaReady = !((audit&&audit.issues)||[]).some(function(it){ return it.table==='ajw_tool_meta' && !it.ok; });
    var cfg=getCfg();

    function need(keys){ return fullSync || _sbHasDirty(dirtyFlags, keys); }

    if(need('emp') && employees.length) steps.push(function(){ return _sbChunkedUpsert('ajw_employees', employees.map(function(e){ return {id:e.id,data:e}; }), batchSize).catch(_warnOnly('emp sync')); });
    if(need('eval') && evalHistory.length) steps.push(function(){ return _sbChunkedUpsert('ajw_eval', evalHistory.map(function(e){ return {id:e.id,data:e,nama:(e.info&&e.info.nama)||'',grade:e.grade||'',nilai:e.fs||0}; }), batchSize).catch(_warnOnly('eval sync')); });
    if(need('payroll') && payHistory.length) steps.push(function(){ return _sbChunkedUpsert('ajw_payroll', payHistory.map(function(p){ return {id:p.id,data:p,nama:(p.info&&p.info.nama)||'',gaji_bersih:p.bersih||0}; }), batchSize).catch(_warnOnly('pay sync')); });
    if(need('kpi') && typeof kpiData!=='undefined'&&kpiData&&kpiData.length) steps.push(function(){ return _sbChunkedUpsert('ajw_kpi', kpiData.map(function(k){ return {periode:k.periode,data:k}; }), batchSize).catch(_warnOnly('kpi sync')); });
    if(need('supplier') && supplierHutang.length) steps.push(function(){ return _sbChunkedUpsert('ajw_supplier', supplierHutang.map(function(s){ return {id:s.id,data:s,nama_supplier:s.namaSupplier||'',bulan:s.bulan||'',tahun:s.tahun||0}; }), batchSize).catch(_warnOnly('supplier sync')); });
    if(need('hr_sops') && typeof _hrSops!=='undefined' && hrSopReady && (!_sbSafeModeEnabled() || !silent || (_hrSops||[]).length <= 50)){
      steps.push(function(){ return _sbChunkedReplace('ajw_hr_sops','id',(_hrSops||[]).map(_sbHRSopRecord), Math.max(20, Math.min(batchSize, 60))).catch(_warnOnly('hr sop sync')); });
    }
    if(need('hr_control') && typeof _hrControlData!=='undefined' && hrControlReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_hr_control','id',[_sbHRControlRecord(_hrControlData||{})], 10).catch(_warnOnly('hr control sync')); });
    }
    if(need('dev_hub') && typeof _devHub!=='undefined' && devHubReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_dev_hub','id',[_sbDevHubRecord(_devHub||{})], 10).catch(_warnOnly('dev hub sync')); });
    }
    if(need('analytics_data') && analyticsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_analytics_data','id',_sbAnalyticsRecords(), Math.max(8, Math.min(batchSize, 20))).catch(_warnOnly('analytics snapshot sync')); });
    }
    if(need(['analytics_data','customer_data']) && customerDataReady){
      steps.push(function(){
        var customers=((typeof window._analyticsData==='object' && window._analyticsData && Array.isArray(window._analyticsData.customers)) ? window._analyticsData.customers : []);
        return _sbChunkedReplace('ajw_customer_data','id',customers.map(_sbCustomerDataRecord), Math.max(20, Math.min(batchSize, 120))).catch(_warnOnly('customer data sync'));
      });
    }
    if(need('tools_refunds') && toolsRefundReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_refunds','id',(_toolRefunds||[]).map(_sbToolRefundRecord), Math.max(20, Math.min(batchSize, 50))).catch(_warnOnly('tools refund sync')); });
    }
    if(need('tools_complaints') && toolsComplaintReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_complaints','id',(_toolComplaints||[]).map(_sbToolComplaintRecord), Math.max(20, Math.min(batchSize, 50))).catch(_warnOnly('tools complaint sync')); });
    }
    if(need('tools_requests') && toolsRequestReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_requests','id',(_toolRequests||[]).map(_sbToolRequestRecord), Math.max(20, Math.min(batchSize, 50))).catch(_warnOnly('tools request sync')); });
    }
    if(need('tools_material_stock') && toolsMaterialStockReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_material_stock','id',(_toolMaterialStock||[]).map(_sbToolMaterialStockRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools material stock sync')); });
    }
    if(need('tools_material_orders') && toolsMaterialOrdersReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_material_orders','id',(_toolMaterialOrders||[]).map(_sbToolMaterialOrderRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools material orders sync')); });
    }
    if(need('tools_material_order_history') && toolsMaterialHistoryReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_material_order_history','id',(_toolMaterialOrderHistory||[]).map(_sbToolMaterialOrderRecord), Math.max(20, Math.min(batchSize, 100))).catch(_warnOnly('tools material history sync')); });
    }
    if(need('tools_material_sessions') && toolsMaterialSessionsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_material_sessions','id',(_toolMaterialSessions||[]).map(_sbToolMaterialSessionRecord), Math.max(10, Math.min(batchSize, 40))).catch(_warnOnly('tools material sessions sync')); });
    }
    if(need('tools_products') && toolsProductsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_products','id',(_toolProductRows||[]).map(_sbToolProductRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools product sync')); });
    }
    if(need('tools_desc_rows') && toolsDescReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_desc_revision','id',(_toolDescRows||[]).map(_sbToolDescRecord), Math.max(20, Math.min(batchSize, 60))).catch(_warnOnly('tools desc sync')); });
    }
    if(need('tools_automation_jobs') && toolsAutomationJobsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_automation_jobs','id',(_toolAutomationJobs||[]).map(_sbToolAutomationJobRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools automation jobs sync')); });
    }
    if(need('tools_automation_logs') && toolsAutomationLogsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_automation_logs','id',(_toolAutomationLogs||[]).map(_sbToolAutomationLogRecord), Math.max(20, Math.min(batchSize, 100))).catch(_warnOnly('tools automation logs sync')); });
    }
    if(need('tools_webhooks') && toolsWebhooksReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_webhooks','id',(_toolWebhookDefs||[]).map(_sbToolWebhookRecord), Math.max(10, Math.min(batchSize, 40))).catch(_warnOnly('tools webhooks sync')); });
    }
    if(need('tools_blast_rows') && toolsBlastRowsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_blast_rows','id',(_toolBlastRows||[]).map(_sbToolBlastRowRecord), Math.max(20, Math.min(batchSize, 60))).catch(_warnOnly('tools blast rows sync')); });
    }
    if(need('tools_blast_history') && toolsBlastHistoryReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_blast_history','id',(_toolBlastHistory||[]).map(_sbToolBlastRowRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools blast history sync')); });
    }
    if(need('tools_blast_phone_db') && toolsBlastPhoneReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_blast_phone_db','id',(_toolBlastPhoneDb||[]).map(_sbToolBlastPhoneRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools blast phone sync')); });
    }
    if(need('tools_blast_marketing') && toolsBlastMarketingReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_blast_marketing','id',(_toolBlastMarketingSchedules||[]).map(_sbToolBlastMarketingRecord), Math.max(20, Math.min(batchSize, 60))).catch(_warnOnly('tools blast marketing sync')); });
    }
    if(need('tools_picking_rows') && toolsPickingRowsReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_picking_rows','id',(_toolPickingRows||[]).map(_sbToolPickingRowRecord), Math.max(20, Math.min(batchSize, 120))).catch(_warnOnly('tools picking rows sync')); });
    }
    if(need('tools_picking_history') && toolsPickingHistoryReady){
      steps.push(function(){ return _sbChunkedReplace('ajw_tool_picking_history','id',(_toolPickingHistory||[]).map(_sbToolPickingHistoryRecord), Math.max(20, Math.min(batchSize, 80))).catch(_warnOnly('tools picking history sync')); });
    }
    if(need(['tools_desc_rows','tools_blast_rows','tools_blast_history','tools_blast_phone_db','tools_blast_marketing','tools_material_sessions','tools_automation_jobs','tools_webhooks','tools_agent_bridge','tools_picking_rows','tools_picking_history']) && toolsMetaReady){
      steps.push(function(){ return _sbChunkedUpsert('ajw_tool_meta',_sbToolMetaRecords(), Math.max(8, Math.min(batchSize, 30))).catch(_warnOnly('tools meta sync')); });
    }

    if(financeReady){
      if(need('fin_income')) steps.push(function(){ return _sbChunkedReplace('ajw_fin_income','id',(_finIncome||[]).map(_sbIncomeRecord), batchSize).catch(_finSyncCatch('ajw_fin_income')); });
      if(need('fin_expense')) steps.push(function(){ return _sbChunkedReplace('ajw_fin_expense','id',(_finExpense||[]).map(_sbExpenseRecord), batchSize).catch(_finSyncCatch('ajw_fin_expense')); });
      if(need('fin_assets')) steps.push(function(){ return _sbChunkedReplace('ajw_fin_assets','id',(_finAssets||[]).map(_sbAssetRecord), batchSize).catch(_finSyncCatch('ajw_fin_assets')); });
      if(need('fin_subscriptions')) steps.push(function(){ return _sbChunkedReplace('ajw_fin_subscriptions','id',(_finSubscriptions||[]).map(_sbSubscriptionRecord), batchSize).catch(_finSyncCatch('ajw_fin_subscriptions')); });
      if(need('fin_monthly_settings')) steps.push(function(){ return _sbChunkedReplace('ajw_fin_monthly','key',_sbMonthlySettingRecords(), batchSize).catch(_finSyncCatch('ajw_fin_monthly')); });
      if(need(['fin_income','fin_expense','fin_expense_categories','fin_subscriptions','fin_expense_targets','fin_assets','fin_monthly_settings'])) steps.push(function(){ return _sbChunkedUpsert('ajw_fin_meta',_sbFinanceMetaRecords(), Math.max(10, Math.min(batchSize, 40))).catch(_finSyncCatch('ajw_fin_meta')); });
      if(audit.logReady && !_sbSafeModeEnabled() && !silent){
        steps.push(function(){ return _sbChunkedReplace('ajw_sync_log','id',_sbLogRecords(), 20).catch(_warnOnly('sync log sync')); });
      }
    } else if(_sbFinanceDataExists()){
      _sbAddSchemaLog('warn','Finance AJW masih memakai fallback ajw_config karena table terpisah Supabase belum siap',{missingTables:(audit&&audit.missingTables)||[], checkedAt:(audit&&audit.checkedAt)||new Date().toISOString()}, true);
    }

    var cfgRows = _sbBuildConfigRows(cfg, audit, silent, dirtyFlags);
    if(cfgRows.length){
      steps.push(function(){ return _sbChunkedUpsert('ajw_config', cfgRows, Math.max(8, Math.min(batchSize, 25))).catch(_warnOnly('config sync')); });
    }

    return _sbRunSeries(steps).then(function(){
      var c=getCfg();c.lastSupabaseSync=new Date().toISOString();saveCfg(c);
      if(fullSync) _sbClearDirty();
      else _sbClearDirty(dirtyFlags);
      if(!silent){
        var note = _sbSafeModeEnabled() ? ' (safe mode aktif)' : '';
        if(financeReady) toast('Sync Supabase berhasil'+note+'!', 'success', 4500);
        else toast('Sync Supabase berhasil'+note+', tetapi finance masih fallback ke ajw_config sampai SQL schema dijalankan.', 'warn', 5500);
      }
      var el=document.getElementById('SB-SYNC-STATUS');if(el)el.textContent='Terakhir sync: '+new Date().toLocaleString('id-ID');
      return{ok:true};
    });
  }).catch(function(err){
    if(financeErrors.length) console.error('Finance sync errors:', financeErrors);
    if(!silent)toast('Supabase error: '+(err&&err.message||err),'error',5000);
    throw err;
  }).then(function(res){
    rt.running = false;
    var rerun = rt.pending;
    var rerunSilent = rt.pendingSilent;
    rt.pending = false;
    rt.pendingSilent = true;
    rt.promise = null;
    if(rerun) setTimeout(function(){ syncAllToSupabase(rerunSilent); }, _sbSafeModeEnabled() ? 1200 : 250);
    return res;
  }, function(err){
    rt.running = false;
    var rerun = rt.pending;
    var rerunSilent = rt.pendingSilent;
    rt.pending = false;
    rt.pendingSilent = true;
    rt.promise = null;
    if(rerun) setTimeout(function(){ syncAllToSupabase(rerunSilent); }, _sbSafeModeEnabled() ? 1600 : 400);
    throw err;
  });
  return rt.promise;
};

function _queueSupabaseSync(){
  var c=getCfg();
  if(!c.supabaseAutoSync||!c.supabaseUrl||!c.supabaseKey||typeof syncAllToSupabase!=='function') return;
  if(window._svT) clearTimeout(window._svT);
  window._svT=setTimeout(function(){ syncAllToSupabase(true); },_sbSafeModeEnabled()?6500:2500);
}

var _svD=sv;
sv=function(k,v){
  _svD(k,v);
  if(!{ajw_emp:1,ajw_eval:1,ajw_pay:1,ajw_kpi:1,ajw_supplier:1,ajw_sup_data:1,ajw_pesanan:1,ajw_tabs:1,ajw_laporan:1,ajw_profit:1,ajw_hr_sops:1,ajw_hr_control:1,ajw_dev_hub:1,ajw_fin_income:1,ajw_fin_expense:1,ajw_fin_expense_categories:1,ajw_fin_subscriptions:1,ajw_fin_expense_targets:1,ajw_fin_assets:1,ajw_fin_monthly_settings:1,ajw_tools_refunds:1,ajw_tools_complaints:1,ajw_tools_requests:1,ajw_tools_material_stock:1,ajw_tools_material_orders:1,ajw_tools_material_order_history:1,ajw_tools_material_sessions:1,ajw_tools_automation_jobs:1,ajw_tools_automation_logs:1,ajw_tools_webhooks:1,ajw_tools_agent_bridge:1,ajw_tools_product_rows:1,ajw_tools_desc_revision_rows:1,ajw_tools_blast_rows:1,ajw_tools_blast_history:1,ajw_tools_blast_phone_db:1,ajw_tools_blast_marketing_schedules:1,ajw_tools_picking_rows:1,ajw_tools_picking_history:1,ajw_tools_picking_config:1,ajw_tools_picking_processed:1,ajw_tools_picking_watch:1,ajw_analytics_data:1}[k])return;
  var dirtyMap={
    ajw_emp:'emp',
    ajw_eval:'eval',
    ajw_pay:'payroll',
    ajw_kpi:'kpi',
    ajw_supplier:'supplier',
    ajw_sup_data:'sup_data',
    ajw_pesanan:'pesanan_data',
    ajw_tabs:'tabs',
    ajw_laporan:'laporan_bulanan',
    ajw_profit:'profit_data',
    ajw_hr_sops:'hr_sops',
    ajw_hr_control:'hr_control',
    ajw_dev_hub:'dev_hub',
    ajw_analytics_data:'analytics_data',
    ajw_fin_income:'fin_income',
    ajw_fin_expense:'fin_expense',
    ajw_fin_expense_categories:'fin_expense_categories',
    ajw_fin_subscriptions:'fin_subscriptions',
    ajw_fin_expense_targets:'fin_expense_targets',
    ajw_fin_assets:'fin_assets',
    ajw_fin_monthly_settings:'fin_monthly_settings',
    ajw_tools_refunds:'tools_refunds',
    ajw_tools_complaints:'tools_complaints',
    ajw_tools_requests:'tools_requests',
    ajw_tools_material_stock:'tools_material_stock',
    ajw_tools_material_orders:'tools_material_orders',
    ajw_tools_material_order_history:'tools_material_order_history',
    ajw_tools_material_sessions:'tools_material_sessions',
    ajw_tools_automation_jobs:'tools_automation_jobs',
    ajw_tools_automation_logs:'tools_automation_logs',
    ajw_tools_webhooks:'tools_webhooks',
    ajw_tools_agent_bridge:'tools_agent_bridge',
    ajw_tools_product_rows:'tools_products',
    ajw_tools_desc_revision_rows:'tools_desc_rows',
    ajw_tools_blast_rows:'tools_blast_rows',
    ajw_tools_blast_history:'tools_blast_history',
    ajw_tools_blast_phone_db:'tools_blast_phone_db',
    ajw_tools_blast_marketing_schedules:'tools_blast_marketing',
    ajw_tools_picking_rows:'tools_picking_rows',
    ajw_tools_picking_history:'tools_picking_history',
    ajw_tools_picking_config:'tools_picking_rows',
    ajw_tools_picking_processed:'tools_picking_rows',
    ajw_tools_picking_watch:'tools_picking_rows'
  };
  _sbMarkDirty(dirtyMap[k]);
  if(typeof _activeTab!=='undefined' && _activeTab==='dash' && typeof renderDash==='function'){
    if(window._dashRefreshT) clearTimeout(window._dashRefreshT);
    window._dashRefreshT=setTimeout(function(){ try{ renderDash(); }catch(e){ console.error('dash refresh error',e); } },120);
  }
  _queueSupabaseSync();
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
};

/* ── LAPORAN BULANAN ── */
var _lb=[];
var _lbYear=new Date().getFullYear();
var _lbEditId=null;
(function(){try{_lb=JSON.parse(localStorage.getItem('ajw_laporan')||'[]');}catch(e){_lb=[];}
if(!_lb.length){var M=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];[2025,2026,2027].forEach(function(yr){M.forEach(function(m,i){_lb.push({id:yr+'-'+(i+1),bulan:m,tahun:yr,bulanNum:i+1,penjualan:0,targetPenjualan:300000000,cash:0,berulang:0,pengeluaran:0,catatan:'',platform:{shopee:0,tiktok:0,lazada:0,lainnya:0}});});});localStorage.setItem('ajw_laporan',JSON.stringify(_lb));}})();
function _saveLB(){localStorage.setItem('ajw_laporan',JSON.stringify(_lb)); if(typeof _queueSupabaseSync==='function') _queueSupabaseSync();}

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
var _hrSops = (function(){ try{return (window._hrSops&&Array.isArray(window._hrSops)?window._hrSops:JSON.parse(localStorage.getItem('ajw_hr_sops')||'[]'))||[];}catch(e){return [];} })();
var _hrSopFilter={recent:'today',department:''};
var _hrSopUI={uploadOpen:false,previewId:'',previewMode:'',previewTitle:'',previewHtml:'',previewError:''};
var _finIncome = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_income')||'[]');}catch(e){return [];} })();
var _finExpense = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_expense')||'[]');}catch(e){return [];} })();
var _finExpenseCategories = (function(){
  try{
    var data=JSON.parse(localStorage.getItem('ajw_fin_expense_categories')||'null');
    return Array.isArray(data)&&data.length?data:['Platform','Bahan Packing','Operasional','Gaji','Langganan'];
  }catch(e){ return ['Platform','Bahan Packing','Operasional','Gaji','Langganan']; }
})();
var _finSubscriptions = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_subscriptions')||'[]');}catch(e){return [];} })();
var _finExpenseTargets = (function(){
  try{
    var data=JSON.parse(localStorage.getItem('ajw_fin_expense_targets')||'{}');
    return {
      subscriptionMonthly:_num(data.subscriptionMonthly)||0,
      monthlyExpense:_num(data.monthlyExpense!=null?data.monthlyExpense:data.subscriptionMonthly)||0
    };
  }catch(e){ return {subscriptionMonthly:0, monthlyExpense:0}; }
})();
var _finAssets = (function(){ try{return JSON.parse(localStorage.getItem('ajw_fin_assets')||'[]');}catch(e){return [];} })();
var _finMonthlySettings = (function(){
  try{return JSON.parse(localStorage.getItem('ajw_fin_monthly_settings')||'{}')||{};}catch(e){return {};}
})();
var _finLapbulView='table';
var _finLapbulShow = (function(){
  try{
    var raw=JSON.parse(localStorage.getItem('ajw_fin_lapbul_show')||'{}')||{};
    return {
      penjualan:raw.penjualan!==false,
      keuntungan:raw.keuntungan!==false,
      persentaseKeuntungan:raw.persentaseKeuntungan!==false,
      pengeluaran:raw.pengeluaran!==false,
      totalAsset:raw.totalAsset!==false,
      saldoHutang:raw.saldoHutang!==false,
      saldoTahunan:raw.saldoTahunan!==false,
      cashBank:!!raw.cashBank,
      cashGoal:!!raw.cashGoal,
      cashProgress:!!raw.cashProgress,
      berulang:!!raw.berulang,
      date:!!raw.date,
      targetPenjualan:!!raw.targetPenjualan
    };
  }catch(e){ return {penjualan:true,keuntungan:true,persentaseKeuntungan:true,pengeluaran:true,totalAsset:true,saldoHutang:true,saldoTahunan:true,cashBank:false,cashGoal:false,cashProgress:false,berulang:false,date:false,targetPenjualan:false}; }
})();
var _finAssetFilter={type:'',dateFrom:'',dateTo:'',keyword:''};
var _finAssetTrendFocus=(function(){ try{return localStorage.getItem('ajw_fin_asset_focus')||'';}catch(e){return '';} })();
function _saveFin(){
  sv('ajw_fin_income', _finIncome||[]);
  sv('ajw_fin_expense', _finExpense||[]);
  sv('ajw_fin_expense_categories', _finExpenseCategories||[]);
  sv('ajw_fin_subscriptions', _finSubscriptions||[]);
  sv('ajw_fin_expense_targets', _finExpenseTargets||{});
  sv('ajw_fin_assets', _finAssets||[]);
  sv('ajw_fin_monthly_settings', _finMonthlySettings||{});
  _queueCloudPersist('finance');
}
function _saveHRSops(){
  sv('ajw_hr_sops', _hrSops||[]);
  _queueCloudPersist('hr_sops');
}
function _queueCloudPersist(scope){
  try{
    var c=getCfg();
    if(!c.supabaseUrl || !c.supabaseKey || typeof syncAllToSupabase!=='function') return;
    if(window._cloudPersistT) clearTimeout(window._cloudPersistT);
    window._cloudPersistT=setTimeout(function(){
      syncAllToSupabase(true).then(function(){
        console.log('cloud sync ok:', scope||'general');
      }).catch(function(e){
        console.warn('cloud sync fail:', scope||'general', e);
      });
    }, _sbSafeModeEnabled() ? 5000 : 1200);
  }catch(e){}
}
function _hrSopFileSizeLabel(bytes){
  var n=parseInt(bytes,10)||0;
  if(n>=1024*1024) return (n/(1024*1024)).toFixed(2)+' MB';
  if(n>=1024) return Math.round(n/1024)+' KB';
  return n+' B';
}
function _hrSopDepartmentOptions(){
  var base=['Admin','Operations','Marketing','Warehouse','Finance','HR','IT','Management'];
  (_hrSops||[]).forEach(function(r){
    var d=(r.department||'').trim();
    if(d && base.indexOf(d)<0) base.push(d);
  });
  return base;
}
function _hrSopApplyFilters(){
  _hrSopFilter.recent=((document.getElementById('HR-SOP-FLT-RECENT')||{}).value||'today').trim();
  _hrSopFilter.department=((document.getElementById('HR-SOP-FLT-DEPT')||{}).value||'').trim();
  _renderHR('sop');
}
function _hrSopToggleUpload(open){
  _hrSopUI.uploadOpen=(open!==false);
  _renderHR('sop');
}
function _hrSopDelete(id){
  confirmDelete('Hapus SOP / guide ini?',function(){
    _hrSops=_hrSops.filter(function(r){ return r.id!==id; });
    if(_hrSopUI.previewId===id){
      _hrSopUI.previewId=''; _hrSopUI.previewMode=''; _hrSopUI.previewTitle=''; _hrSopUI.previewHtml=''; _hrSopUI.previewError='';
    }
    _saveHRSops();
    toast('Dokumen SOP dihapus','success');
    _renderHR('sop');
  });
}
function _hrSopClosePreview(){
  _hrSopUI.previewId=''; _hrSopUI.previewMode=''; _hrSopUI.previewTitle=''; _hrSopUI.previewHtml=''; _hrSopUI.previewError='';
  _renderHR('sop');
}
function _hrSopDownload(id){
  var row=(_hrSops||[]).filter(function(r){ return r.id===id; })[0];
  if(!row||!row.dataUrl){ toast('File tidak ditemukan','error'); return; }
  var a=document.createElement('a');
  a.href=row.dataUrl;
  a.download=row.fileName||((row.title||'SOP')+'.file');
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ try{ document.body.removeChild(a); }catch(e){} },0);
}
function _hrSopDataUrlToArrayBuffer(dataUrl){
  var base64=String(dataUrl||'').split(',')[1]||'';
  var binary=atob(base64);
  var len=binary.length;
  var bytes=new Uint8Array(len);
  for(var i=0;i<len;i++) bytes[i]=binary.charCodeAt(i);
  return bytes.buffer;
}
function _hrSopDataUrlToText(dataUrl){
  var parts=String(dataUrl||'').split(',');
  if(parts.length<2) return '';
  var meta=parts[0]||'', body=parts.slice(1).join(',');
  try{
    return meta.indexOf(';base64')>=0 ? decodeURIComponent(escape(atob(body))) : decodeURIComponent(body);
  }catch(e){
    try{ return atob(body); }catch(ex){ return ''; }
  }
}
function _hrSopOpen(id){
  var row=(_hrSops||[]).filter(function(r){ return r.id===id; })[0];
  if(!row||!row.dataUrl){ toast('File tidak ditemukan','error'); return; }
  var type=String(row.fileType||'').toLowerCase();
  var name=String(row.fileName||'').toLowerCase();
  _hrSopUI.previewId=id;
  _hrSopUI.previewTitle=row.title||row.fileName||'Preview SOP';
  _hrSopUI.previewHtml='';
  _hrSopUI.previewError='';
  if(type.indexOf('pdf')>=0){ _hrSopUI.previewMode='pdf'; _renderHR('sop'); return; }
  if(type.indexOf('image/')===0){ _hrSopUI.previewMode='image'; _renderHR('sop'); return; }
  if(type.indexOf('text/')===0 || name.match(/\.(txt|csv|md|json)$/)){ _hrSopUI.previewMode='text'; _hrSopUI.previewHtml=esc(_hrSopDataUrlToText(row.dataUrl)); _renderHR('sop'); return; }
  if(type.indexOf('wordprocessingml.document')>=0 || name.match(/\.docx$/)){
    _hrSopUI.previewMode='loading';
    _hrSopUI.previewError='';
    _renderHR('sop');
    try{
      window.mammoth.convertToHtml({arrayBuffer:_hrSopDataUrlToArrayBuffer(row.dataUrl)}).then(function(result){
        if(_hrSopUI.previewId!==id) return;
        _hrSopUI.previewMode='html';
        _hrSopUI.previewHtml=result.value||'<p>Dokumen kosong.</p>';
        _hrSopUI.previewError=(result.messages&&result.messages.length)?result.messages.map(function(m){return m.message;}).join(' | '):'';
        _renderHR('sop');
      }).catch(function(err){
        if(_hrSopUI.previewId!==id) return;
        _hrSopUI.previewMode='unsupported';
        _hrSopUI.previewError='Preview DOCX gagal dibuka: '+((err&&err.message)||err);
        _renderHR('sop');
      });
    }catch(e){
      _hrSopUI.previewMode='unsupported';
      _hrSopUI.previewError='Browser gagal menyiapkan preview DOCX.';
      _renderHR('sop');
    }
    return;
  }
  if(type.indexOf('application/msword')>=0 || name.match(/\.doc$/)){
    _hrSopUI.previewMode='unsupported';
    _hrSopUI.previewError='Format DOC lama belum punya preview langsung di browser. Gunakan DOCX atau PDF untuk preview terbaik.';
    _renderHR('sop');
    return;
  }
  _hrSopUI.previewMode='unsupported';
  _hrSopUI.previewError='Format file ini belum punya preview langsung. Anda masih bisa mengunduhnya.';
  _renderHR('sop');
}
function _hrSopUpload(){
  var title=((document.getElementById('HR-SOP-TITLE')||{}).value||'').trim();
  var department=((document.getElementById('HR-SOP-DEPT')||{}).value||'').trim();
  var departmentManual=((document.getElementById('HR-SOP-DEPT-MANUAL')||{}).value||'').trim();
  var stage=((document.getElementById('HR-SOP-STAGE')||{}).value||'Draft').trim();
  var note=((document.getElementById('HR-SOP-NOTE')||{}).value||'').trim();
  var inp=document.getElementById('HR-SOP-FILE');
  var file=inp&&inp.files&&inp.files[0];
  if(!file){ toast('Pilih file dokumen terlebih dahulu','error'); return; }
  if(file.size>2*1024*1024){ toast('Ukuran file maksimal 2 MB per dokumen','error',4200); return; }
  var finalDept=departmentManual||department||'Umum';
  var fr=new FileReader();
  fr.onload=function(ev){
    var now=new Date().toISOString();
    _hrSops.unshift({
      id:'hrsop_'+Date.now(),
      title:title||file.name.replace(/\.[^.]+$/,''),
      department:finalDept,
      stage:stage||'Draft',
      docType:'Guides & SOPs',
      note:note,
      fileName:file.name,
      fileType:file.type||'application/octet-stream',
      fileSize:file.size||0,
      dataUrl:ev.target.result,
      createdAt:now,
      updatedAt:now
    });
    _saveHRSops();
    ['HR-SOP-TITLE','HR-SOP-DEPT-MANUAL','HR-SOP-NOTE'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    if(document.getElementById('HR-SOP-DEPT')) document.getElementById('HR-SOP-DEPT').value='';
    if(document.getElementById('HR-SOP-STAGE')) document.getElementById('HR-SOP-STAGE').value='Draft';
    if(inp) inp.value='';
    _hrSopUI.uploadOpen=false;
    toast('SOP berhasil diupload dan disimpan','success');
    _renderHR('sop');
  };
  fr.onerror=function(){ toast('File gagal dibaca','error'); };
  fr.readAsDataURL(file);
}
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
function _hrTemplateKey(name, stage){
  return String(name||'umum')+'__'+String(stage||'Evaluasi');
}
function _hrTemplatePreset(stage, pack){
  var nm=(pack&&pack.name)||'________________';
  var pos=(pack&&pack.latest&&pack.latest.info&&pack.latest.info.jabatan)||'________________';
  var reasons=_hrLetterReasons(pack).join('\n');
  var presets={
    'Evaluasi':{
      nomor:'EVAL-'+Date.now(),
      tanggal:_todayYMD(),
      nama:nm,
      posisi:pos,
      subtitle:'Tahap coaching awal sebelum surat peringatan formal.',
      alasan:reasons,
      target:'1. Coaching 1-on-1 dan cari akar masalah.\n2. Buat target perbaikan 1-2 minggu.\n3. Pantau progres harian secara ringan.',
      keputusan:'Jika tidak membaik, lanjut ke SP1.',
      warna:'#F57C00'
    },
    'SP1':{
      nomor:'SP1-'+Date.now(),
      tanggal:_todayYMD(),
      nama:nm,
      posisi:pos,
      subtitle:'Peringatan pertama. Masih ada kesempatan perbaikan 30 hari ke depan.',
      alasan:reasons,
      target:'1. Perbaiki indikator yang paling lemah pada evaluasi terakhir.\n2. Penuhi target perilaku kerja dan kedisiplinan harian.\n3. Lakukan check-in mingguan dengan supervisor / owner.',
      keputusan:'Jika tidak ada perbaikan dalam 30 hari, lanjut ke SP2.',
      warna:'#C62828'
    },
    'SP2':{
      nomor:'SP2-'+Date.now(),
      tanggal:_todayYMD(),
      nama:nm,
      posisi:pos,
      subtitle:'Peringatan terakhir. Jika tidak membaik dalam 30 hari, dapat berlanjut ke PHK.',
      alasan:reasons,
      target:'1. Penuhi target perbaikan yang tidak bisa ditawar.\n2. Monitoring sangat ketat harian.\n3. Semua pelanggaran tambahan dicatat resmi.',
      keputusan:'Jika tidak ada perbaikan dalam 30 hari, lanjut ke PHK.',
      warna:'#7B1FA2'
    },
    'PHK':{
      nomor:'PHK-'+Date.now(),
      tanggal:_todayYMD(),
      nama:nm,
      posisi:pos,
      subtitle:'Keputusan final hanya boleh diambil oleh owner.',
      alasan:reasons,
      target:'1. Serah terima inventaris / akses.\n2. Dokumentasikan keputusan dan arsip.\n3. Pastikan proses sesuai kesepakatan kerja.',
      keputusan:'Proses pemutusan hubungan kerja diputuskan oleh owner.',
      warna:'#5D0B0B'
    }
  };
  return presets[stage] || presets['Evaluasi'];
}
function _hrGetTemplateDraft(name, stage, pack){
  _hrControlData.templates=_hrControlData.templates||{};
  var key=_hrTemplateKey(name, stage);
  if(!_hrControlData.templates[key]){
    _hrControlData.templates[key]=_hrTemplatePreset(stage, pack);
  }
  return _hrControlData.templates[key];
}
function _hrSaveTemplateDraft(){
  var name=_hrControlUI.letterEmp||'';
  var stage=_hrControlUI.letterType||'Evaluasi';
  if(!name){ toast('Pilih karyawan untuk template','error'); return null; }
  _hrControlData.templates=_hrControlData.templates||{};
  var key=_hrTemplateKey(name, stage);
  _hrControlData.templates[key]={
    nomor:(((document.getElementById('HR-TPL-NO')||{}).value)||'').trim(),
    tanggal:(((document.getElementById('HR-TPL-DATE')||{}).value)||'').trim(),
    nama:(((document.getElementById('HR-TPL-NAME')||{}).value)||'').trim(),
    posisi:(((document.getElementById('HR-TPL-POS')||{}).value)||'').trim(),
    subtitle:(((document.getElementById('HR-TPL-SUB')||{}).value)||'').trim(),
    alasan:(((document.getElementById('HR-TPL-REASONS')||{}).value)||'').trim(),
    target:(((document.getElementById('HR-TPL-TARGET')||{}).value)||'').trim(),
    keputusan:(((document.getElementById('HR-TPL-DECISION')||{}).value)||'').trim(),
    warna:(((document.getElementById('HR-TPL-COLOR')||{}).value)||'').trim() || _hrTemplatePreset(stage, null).warna
  };
  _saveHRControl();
  toast('Template '+stage+' disimpan','success');
  return _hrControlData.templates[key];
}
function _hrDeleteDiscipline(id){
  confirmDelete('Hapus log disiplin ini?',function(){
    _hrControlData.disciplineLog=(_hrControlData.disciplineLog||[]).filter(function(r){ return r.id!==id; });
    _saveHRControl();
    toast('Log disiplin dihapus','success');
    _renderHR('control');
  });
}
function _hrPrintTemplate(){
  var draft=_hrSaveTemplateDraft();
  if(!draft) return;
  var stage=_hrControlUI.letterType||'Evaluasi';
  var reasons=String(draft.alasan||'').split(/\n+/).filter(Boolean);
  var targets=String(draft.target||'').split(/\n+/).filter(Boolean);
  var w=window.open('','_blank','width=980,height=820');
  if(!w){ toast('Popup print diblokir browser','error'); return; }
  var html='<!doctype html><html><head><meta charset=\"utf-8\"><title>'+stage+' - '+esc(draft.nama||'Karyawan')+'</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111} .head{background:'+draft.warna+';color:#fff;padding:18px 20px;font-weight:700;font-size:24px}.sub{padding:10px 20px;background:#f4f4f4;color:#444;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.card{border:1px solid #ddd;padding:14px;border-radius:10px}.ttl{font-size:12px;color:#666;font-weight:700;text-transform:uppercase;margin-bottom:6px} ol{padding-left:20px;line-height:1.8} .sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:28px}.line{margin-top:46px;border-top:1px solid #000;padding-top:6px;font-size:12px}</style></head><body><div class=\"head\">'+stage+' - '+(stage==='Evaluasi'?'Form Evaluasi':'Template Surat')+'</div><div class=\"sub\">'+esc(draft.subtitle||'')+'</div><div class=\"grid\"><div class=\"card\"><div class=\"ttl\">Informasi</div>Nomor: <b>'+esc(draft.nomor||'-')+'</b><br>Tanggal: <b>'+esc(draft.tanggal||'-')+'</b><br>Nama: <b>'+esc(draft.nama||'-')+'</b><br>Posisi: <b>'+esc(draft.posisi||'-')+'</b></div><div class=\"card\"><div class=\"ttl\">Keputusan</div>'+esc(draft.keputusan||'-').replace(/\n/g,'<br>')+'</div></div><div class=\"card\"><div class=\"ttl\">Alasan / Catatan</div><ol>'+reasons.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ol></div><div class=\"card\" style=\"margin-top:14px\"><div class=\"ttl\">Target / Tindak Lanjut</div><ol>'+targets.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ol></div><div class=\"sign\"><div><div class=\"line\">Owner</div></div><div><div class=\"line\">Supervisor</div></div><div><div class=\"line\">Karyawan</div></div></div></body></html>';
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 250);
}
function _hrGetEvalTs(r){
  return String((r&&((r.submittedAt||r.createdAt||r.ts)))||'');
}
function _hrScore100(r){
  var s=_num(r&&r.fs);
  return s>0?Math.round((s/4)*100):0;
}
function _hrEvalByEmployee(name){
  return evalHistory.filter(function(r){ return (r.info&&r.info.nama)===name; }).slice().sort(function(a,b){
    return _hrGetEvalTs(b).localeCompare(_hrGetEvalTs(a));
  });
}
function _hrConsecutiveGrade(list, target){
  var n=0;
  for(var i=0;i<list.length;i++){
    if((list[i].grade||'-')===target) n++;
    else break;
  }
  return n;
}
function _hrLatestDiscipline(name){
  var rows=(_hrControlData.disciplineLog||[]).filter(function(r){ return r.name===name; }).sort(function(a,b){ return String(b.ts||'').localeCompare(String(a.ts||'')); });
  return rows[0]||null;
}
function _hrActionTone(stage){
  return stage==='Reward'?'#2E7D32':stage==='Reward Premium'?'#1565C0':stage==='Evaluasi'?'#F57F17':stage==='SP1'?'#C62828':stage==='SP2'?'#7B1FA2':(stage==='PHK Review'||stage==='PHK')?'#5D0B0B':'#607D8B';
}
function _hrBuildEmployeeControl(name){
  var rows=_hrEvalByEmployee(name);
  var latest=rows[0]||null;
  var avg4=rows.length?rows.slice(0,4).reduce(function(t,r){ return t+_num(r.fs); },0)/Math.min(rows.length,4):0;
  var cCon=_hrConsecutiveGrade(rows,'C');
  var dCon=_hrConsecutiveGrade(rows,'D');
  var aCon=_hrConsecutiveGrade(rows,'A');
  var lowCon=0;
  for(var i=0;i<rows.length;i++){
    if(['C','D'].indexOf(rows[i].grade)>=0) lowCon++;
    else break;
  }
  var stage='Normal', decision='Pertahankan monitor mingguan', detail='Belum ada eskalasi.';
  if(!latest){
    stage='Belum Dinilai'; decision='Lakukan evaluasi awal'; detail='Belum ada histori penilaian.';
  }else if(aCon>=3){
    stage='Reward Premium'; decision='Berikan reward lebih besar / tanggung jawab naik'; detail='Grade A 3x berturut-turut.';
  }else if(aCon>=2){
    stage='Reward'; decision='Berikan reward / bonus mingguan'; detail='Grade A 2x berturut-turut.';
  }else if(dCon>=2 || (_hrLatestDiscipline(name)&&_hrLatestDiscipline(name).stage==='SP2'&&['C','D'].indexOf(latest.grade)>=0)){
    stage='PHK Review'; decision='Owner review final / PHK bila tidak ada perbaikan'; detail='Nilai sangat rendah berulang setelah eskalasi tinggi.';
  }else if(cCon>=3 || (_hrLatestDiscipline(name)&&_hrLatestDiscipline(name).stage==='SP1'&&['C','D'].indexOf(latest.grade)>=0)){
    stage='SP2'; decision='Keluarkan SP2, monitoring sangat ketat'; detail='Grade C berulang / tidak membaik setelah SP1.';
  }else if(dCon>=1 || cCon>=2){
    stage='SP1'; decision='Keluarkan SP1 + target perbaikan 30 hari'; detail=latest.grade==='D'?'Grade D membutuhkan SP1 langsung.':'Grade C 2x berturut-turut.';
  }else if(cCon>=1){
    stage='Evaluasi'; decision='Coaching 1-on-1, target remedial 1-2 minggu'; detail='Grade C pertama kali, masih tahap pra-formal.';
  }else if(['A','B'].indexOf(latest.grade)>=0){
    stage='Normal'; decision=latest.grade==='A'?'Pertahankan dan jadikan benchmark':'Pertahankan, tingkatkan area lemah'; detail='Kinerja masih dalam jalur aman.';
  }
  return {
    name:name,
    rows:rows,
    latest:latest,
    avg4:avg4,
    latestScore:_hrScore100(latest),
    latestGrade:latest?latest.grade:'-',
    lowConsecutive:lowCon,
    stage:stage,
    decision:decision,
    detail:detail,
    discipline:_hrLatestDiscipline(name)
  };
}
function _hrLetterReasons(p){
  if(!p||!p.latest) return ['Kinerja belum memenuhi standar kerja yang ditetapkan'];
  var out=[];
  var i=p.latest.info||{};
  if(i.lemah) out.push(i.lemah);
  if(i.catatan) out.push(i.catatan);
  if(!out.length) out.push('Nilai evaluasi '+p.latest.grade+' ('+p.latestScore+'/100) pada periode '+periodeLabel(i));
  return out.slice(0,3);
}
function _hrIssueDiscipline(stage,name){
  if(!name||name==='all'){ toast('Pilih karyawan terlebih dahulu','error'); return; }
  var pack=_hrBuildEmployeeControl(name);
  var rec={id:'hrdisc_'+Date.now(),name:name,stage:stage,score:pack.latestScore,grade:pack.latestGrade,reasons:_hrLetterReasons(pack),decision:pack.decision,ts:isoNow()};
  _hrControlData.disciplineLog.unshift(rec);
  _saveHRControl();
  _hrControlUI.letterEmp=name;
  _hrControlUI.letterType=(stage||'Evaluasi');
  _hrGetTemplateDraft(name, _hrControlUI.letterType, pack);
  toast(stage+' dicatat di sistem HR control','success');
  _renderHR('control');
}
function _hrSaveWeeklyOwnerNotes(){
  var g=function(id){ return (((document.getElementById(id)||{}).value)||'').trim(); };
  _hrControlData.weeklyFollowUp=g('HR-CTL-WEEK-FOLLOW');
  _hrControlData.weeklyRewardNote=g('HR-CTL-WEEK-REWARD');
  _hrControlData.weeklyOwnerNote=g('HR-CTL-WEEK-OWNER');
  _saveHRControl();
  toast('Catatan owner mingguan disimpan','success');
}
function _hrRenderControlOnly(){
  var content=document.getElementById('HR-CONTENT');
  if(!content) return;
  var empNames=employees.map(function(e){return e.nama;}).filter(Boolean);
  evalHistory.forEach(function(r){ var n=r.info&&r.info.nama; if(n&&empNames.indexOf(n)<0) empNames.push(n); });
  empNames.sort();
  var selectedName=(_hrControlUI.emp&&_hrControlUI.emp!=='all')?_hrControlUI.emp:(empNames[0]||'');
  var selected=selectedName?_hrBuildEmployeeControl(selectedName):null;
  if(!_hrControlUI.letterEmp && selectedName) _hrControlUI.letterEmp=selectedName;
  var letterName=_hrControlUI.letterEmp||selectedName||'';
  var letterPack=letterName?_hrBuildEmployeeControl(letterName):null;
  var letterType=_hrControlUI.letterType||'Evaluasi';
  var draft=_hrGetTemplateDraft(letterName, letterType, letterPack);
  var allPack=empNames.map(_hrBuildEmployeeControl);
  var safeCount=allPack.filter(function(p){ return ['Normal','Reward','Reward Premium'].indexOf(p.stage)>=0; }).length;
  var warnCount=allPack.filter(function(p){ return ['Evaluasi','SP1','SP2','PHK Review'].indexOf(p.stage)>=0; }).length;
  var spCount=allPack.filter(function(p){ return ['SP1','SP2','PHK Review'].indexOf(p.stage)>=0; }).length;
  var now=new Date();
  var weekAgo=new Date(now.getTime()-6*24*60*60*1000);
  var weeklyRows=evalHistory.filter(function(r){
    var d=new Date(_hrGetEvalTs(r)||0);
    return !isNaN(d.getTime()) && d>=weekAgo;
  }).slice().sort(function(a,b){ return _hrGetEvalTs(b).localeCompare(_hrGetEvalTs(a)); });
  var gradeAWeek=weeklyRows.filter(function(r){ return r.grade==='A'; }).length;
  var gradeCDWeek=weeklyRows.filter(function(r){ return r.grade==='C'||r.grade==='D'; }).length;
  var needsFollow=weeklyRows.filter(function(r){ return r.grade==='C'||r.grade==='D'; }).map(function(r){ return (r.info&&r.info.nama)||'-'; }).filter(function(n,i,a){return a.indexOf(n)===i;});
  var kpiRows=[
    ['Akurasi Picking (item benar)','≥ 99.5%','1 error / 500 order','Laporan komplain / retur salah item','Mingguan'],
    ['Akurasi Packing Joran (pipa benar)','100%','0 toleransi','Cek acak supervisor 10% paket joran','Harian'],
    ['Order selesai sebelum cut-off','100%','0 toleransi','Data BigSeller status terkirim','Harian'],
    ['Retur diperiksa hari ini','100% setiap hari','0 toleransi','Logbook retur harian','Harian'],
    ['Ketepatan berat paket','Selisih ≤ 50g','Max 100g','Sampling timbang ulang 10%','Harian'],
    ['Produk rusak / komplain tiba','≤ 0.3%','0.5%','Laporan komplain pembeli','Mingguan'],
    ['Paket hold terselesaikan','≤ 24 jam','48 jam','Logbook hold vs jam selesai','Harian'],
    ['Bukti pengiriman terkirim','100% order','0 toleransi','BigSeller bukti pengiriman','Harian'],
    ['Kebersihan area packing','Skor ≥ 85/100','≥ 70/100','Inspeksi harian supervisor','Harian'],
    ['Keluhan salah packing','≤ 1 / 1.000 order','≤ 3/1.000','Ticket CS & laporan komplain','Bulanan']
  ];
  var errorRows=[
    ['Kesalahan picking','0 salah barang / qty','Cek ulang 2 titik sebelum packing','Jika berulang: coaching → SP1'],
    ['Hold order > 24 jam','Semua selesai < 24 jam','Reminder leader + log penyebab','Jika > 48 jam: warning formal'],
    ['Komplain buyer','< 0.3%','Root cause + tindakan korektif','Pantau 2 minggu berturut'],
    ['Terlambat bukti kirim','100% hari yang sama','Checklist akhir shift','Masuk evaluasi operasional'],
    ['Area packing berantakan','Skor min 85','Audit foto harian area kerja','Masuk KPI kebersihan']
  ];
  var ownerSteps=[
    'Lihat dashboard stage: siapa aman, siapa perlu evaluasi, siapa sudah masuk SP.',
    'Buka radar karyawan untuk melihat nilai terakhir, tren, area lemah, dan keputusan sistem.',
    'Untuk Grade C pertama: lakukan coaching 1-on-1 dan catat target perbaikan 1-2 minggu.',
    'Untuk Grade C berulang / Grade D: keluarkan SP sesuai rekomendasi dan pantau mingguan.',
    'Gunakan form evaluasi mingguan untuk rekap cepat owner, lalu simpan jadi bahan bulan berikutnya.',
    'Final PHK hanya diputus owner setelah SP2 / pelanggaran zero tolerance.'
  ];
  var h='';
  h+='<div class="card" style="background:linear-gradient(135deg,#233B66,#3B2A20);margin-bottom:12px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#fff">HR Control System</div><div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:4px">Pusat KPI, error control, warning stage, penalty, template SP, dan keputusan owner yang terhubung dengan histori form penilaian.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:rgba(143,208,255,.14);color:#CFE8FF;border:1px solid rgba(143,208,255,.24)">'+allPack.length+' karyawan terpantau</span><span class="chip" style="background:rgba(240,197,106,.14);color:#FFE2A3;border:1px solid rgba(240,197,106,.24)">'+warnCount+' perlu perhatian</span></div></div></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px;margin-bottom:12px">';
  [['Zona Aman',safeCount,'#E8F5E9','#2E7D32'],['Warning Aktif',warnCount,'#FFF3E0','#F57F17'],['SP Aktif / Review',spCount,'#FFEBEE','#C62828'],['Grade C/D Minggu Ini',gradeCDWeek,'#F3E8FF','#7B1FA2']].forEach(function(x){ h+='<div class="card" style="margin-bottom:0;border-left:4px solid '+x[3]+'"><div style="font-size:10px;font-weight:700;color:'+x[3]+';text-transform:uppercase">'+x[0]+'</div><div style="font-size:28px;font-weight:800;color:var(--tx);margin-top:8px">'+x[1]+'</div></div>'; });
  h+='</div>';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:var(--tx)">Radar Karyawan & Keputusan Otomatis</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><label class="lbl" style="margin:0">Fokus Karyawan</label><select id="HR-CTL-EMP" class="fi" style="width:220px" onchange="_hrControlUI.emp=this.value; if(this.value!==\'all\'){_hrControlUI.letterEmp=this.value;} _renderHR(\'control\')"><option value="all">Semua Karyawan</option>'+empNames.map(function(n){ return '<option value="'+escAttr(n)+'"'+(_hrControlUI.emp===n?' selected':'')+'>'+esc(n)+'</option>'; }).join('')+'</select></div></div>';
  h+='<div style="overflow:auto"><table class="tbl" style="min-width:1080px"><thead><tr><th>Nama</th><th>Nilai Terakhir</th><th>Grade</th><th>Avg 4 Periode</th><th>Low Berturut</th><th>Stage</th><th>Keputusan</th><th class="c">Aksi</th></tr></thead><tbody>';
  allPack.forEach(function(p, idx){
    if(_hrControlUI.emp!=='all' && p.name!==_hrControlUI.emp) return;
    var tone=_hrActionTone(p.stage);
    h+='<tr><td style="font-weight:700">'+esc(p.name)+'</td><td>'+(p.latest?String(p.latestScore)+'/100':'-')+'</td><td><span class="chip" style="background:'+(gc(p.latest&&p.latest.fs||0).bg)+';color:'+(gc(p.latest&&p.latest.fs||0).fg)+'">'+esc(p.latestGrade)+'</span></td><td>'+(p.avg4?((p.avg4/4)*100).toFixed(1)+'%':'-')+'</td><td>'+p.lowConsecutive+'</td><td><span class="chip" style="background:'+tone+'22;color:'+tone+'">'+esc(p.stage)+'</span></td><td style="font-size:11px;line-height:1.6">'+esc(p.decision)+'</td><td class="c"><div style="display:flex;gap:5px;justify-content:center;align-items:center;flex-wrap:wrap"><button class="btnsm" onclick="_hrControlUI.emp=\''+escAttr(p.name)+'\';_hrControlUI.letterEmp=\''+escAttr(p.name)+'\';_renderHR(\'control\')" style="background:#1565C0">Detail</button><select id="HR-CTL-STAGE-'+idx+'" class="fi" style="width:118px;height:32px;padding:4px 8px"><option value="Evaluasi">Evaluasi</option><option value="SP1">SP1</option><option value="SP2">SP2</option><option value="PHK">PHK</option></select><button class="btnsm" onclick="_hrIssueDiscipline(((document.getElementById(\'HR-CTL-STAGE-'+idx+'\')||{}).value||\'Evaluasi\'),\''+escAttr(p.name)+'\')" style="background:#8C5E16">Catat</button></div></td></tr>';
  });
  if(!allPack.length) h+='<tr><td colspan="8" style="text-align:center;color:var(--tx3);padding:20px">Belum ada data penilaian untuk dianalisis.</td></tr>';
  h+='</tbody></table></div></div>';
  h+='<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.92fr);gap:12px;align-items:start;margin-bottom:12px">';
  h+='<div style="display:flex;flex-direction:column;gap:12px">';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">KPI & Standar Kinerja</div><div style="overflow:auto"><table class="tbl" style="min-width:940px"><thead><tr><th>Indikator KPI</th><th>Target</th><th>Toleransi</th><th>Metode Ukur</th><th>Periode</th></tr></thead><tbody>'+kpiRows.map(function(r){ return '<tr><td style="font-weight:700">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td><td>'+esc(r[4])+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Error Control System & KPI Waktu</div><div style="overflow:auto"><table class="tbl" style="min-width:820px"><thead><tr><th>Kontrol</th><th>Parameter</th><th>Tindakan Kontrol</th><th>Eskalasi</th></tr></thead><tbody>'+errorRows.map(function(r){ return '<tr><td style="font-weight:700">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:12px">';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Distribusi Grade</div><div style="position:relative;height:220px"><canvas id="HR-CTL-CH-GRADE"></canvas></div></div>';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Tren Karyawan Fokus</div><div style="font-size:11px;color:var(--tx2);margin-bottom:8px">'+(selected?('Fokus: '+esc(selected.name)+' • Stage '+esc(selected.stage)+' • '+esc(selected.detail)):'Pilih karyawan pada filter di atas.')+'</div><div style="position:relative;height:220px"><canvas id="HR-CTL-CH-TREND"></canvas></div></div>';
  h+='</div></div>';
  h+='<div class="card" style="background:#FFF8DE;margin-bottom:12px"><div style="font-size:14px;font-weight:800;color:#4D4632;margin-bottom:8px">Sistem Penalty & Aturan Grade Berturut</div><div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:10px;margin-bottom:10px"><div style="background:#F57C00;color:#fff;border-radius:10px;padding:14px;text-align:center;font-weight:800">EVALUASI (Pra-SP)</div><div style="background:#C62828;color:#fff;border-radius:10px;padding:14px;text-align:center;font-weight:800">SP1</div><div style="background:#7B1FA2;color:#fff;border-radius:10px;padding:14px;text-align:center;font-weight:800">SP2</div><div style="background:#5D0B0B;color:#fff;border-radius:10px;padding:14px;text-align:center;font-weight:800">PHK</div></div><div style="overflow:auto"><table class="tbl" style="min-width:820px"><thead><tr><th>Kondisi</th><th>Yang Dilakukan</th><th>Status</th></tr></thead><tbody><tr><td>Grade A 2x berturut</td><td>Reward langsung / bonus</td><td>Reward</td></tr><tr><td>Grade A 3x berturut</td><td>Reward premium + tanggung jawab naik</td><td>Reward Premium</td></tr><tr><td>Grade C 1x</td><td>Ngobrol 1-on-1, cari masalah, buat target</td><td>Evaluasi</td></tr><tr><td>Grade C 2x berturut</td><td>SP1 resmi</td><td>SP1</td></tr><tr><td>Grade C 3x berturut</td><td>SP2 resmi (peringatan terakhir)</td><td>SP2</td></tr><tr><td>Grade D 1x</td><td>SP1 langsung + pendampingan harian</td><td>SP1</td></tr><tr><td>Grade D berulang setelah SP2</td><td>PHK — keputusan owner</td><td>PHK</td></tr></tbody></table></div><div style="font-size:11px;color:#8A5A13;line-height:1.8;margin-top:10px"><b>Zero tolerance:</b> manipulasi data, pencurian, sabotase, membuka rahasia toko, dan kekerasan dapat langsung masuk SP2 / PHK tanpa tahap sebelumnya.</div></div>';
  h+='<div style="display:grid;grid-template-columns:minmax(0,1.1fr) minmax(340px,.9fr);gap:12px;align-items:start;margin-bottom:12px">';
  h+='<div style="display:flex;flex-direction:column;gap:12px">';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Form Evaluasi Mingguan (Untuk Owner)</div><div style="overflow:auto"><table class="tbl" style="min-width:900px"><thead><tr><th>Nama Karyawan</th><th>Posisi</th><th>Grade</th><th>Catatan Singkat</th><th>Tindak Lanjut</th></tr></thead><tbody>';
  weeklyRows.slice(0,8).forEach(function(r){ var p=_hrBuildEmployeeControl((r.info&&r.info.nama)||''); h+='<tr><td style="font-weight:700">'+esc((r.info&&r.info.nama)||'-')+'</td><td>'+esc((r.info&&r.info.jabatan)||'-')+'</td><td>'+esc(r.grade||'-')+'</td><td>'+esc((r.info&&r.info.catatan)|| (r.info&&r.info.lemah) || '-').slice(0,120)+'</td><td>'+esc(p.decision||'-')+'</td></tr>'; });
  if(!weeklyRows.length) h+='<tr><td colspan="5" style="text-align:center;color:var(--tx3);padding:18px">Belum ada evaluasi minggu ini.</td></tr>';
  h+='</tbody></table></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:12px;font-size:12px;line-height:1.8">Jumlah grade A minggu ini: <b>'+gradeAWeek+'</b><br>Jumlah grade C/D minggu ini: <b>'+gradeCDWeek+'</b><br>Yang perlu follow-up: <b>'+esc(needsFollow.join(', ')||'-')+'</b></div><div style="display:flex;flex-direction:column;gap:8px"><textarea id="HR-CTL-WEEK-FOLLOW" class="fi" rows="2" placeholder="Follow-up minggu depan">'+esc(_hrControlData.weeklyFollowUp||'')+'</textarea><textarea id="HR-CTL-WEEK-REWARD" class="fi" rows="2" placeholder="Reward yang perlu diberikan">'+esc(_hrControlData.weeklyRewardNote||'')+'</textarea><textarea id="HR-CTL-WEEK-OWNER" class="fi" rows="2" placeholder="Catatan penting untuk owner">'+esc(_hrControlData.weeklyOwnerNote||'')+'</textarea><div style="display:flex;justify-content:flex-end"><button class="btnp" onclick="_hrSaveWeeklyOwnerNotes()" style="background:#374151">Simpan Catatan Mingguan</button></div></div></div></div>';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Cara Menjalankan (Untuk Owner)</div><ol style="padding-left:18px;line-height:1.9;font-size:12px;color:var(--tx2)">'+ownerSteps.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('')+'</ol></div>';
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:12px">';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Template Evaluasi / SP / PHK</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><select class="fi" style="width:180px" onchange="_hrControlUI.letterEmp=this.value;_renderHR(\'control\')"><option value="">Pilih karyawan</option>'+empNames.map(function(n){ return '<option value="'+escAttr(n)+'"'+(_hrControlUI.letterEmp===n?' selected':'')+'>'+esc(n)+'</option>'; }).join('')+'</select><select class="fi" style="width:160px" onchange="_hrControlUI.letterType=this.value;_renderHR(\'control\')"><option value="Evaluasi"'+(letterType==='Evaluasi'?' selected':'')+'>Evaluasi</option><option value="SP1"'+(letterType==='SP1'?' selected':'')+'>SP1</option><option value="SP2"'+(letterType==='SP2'?' selected':'')+'>SP2</option><option value="PHK"'+(letterType==='PHK'?' selected':'')+'>PHK</option></select><input id="HR-TPL-COLOR" class="fi" type="color" value="'+escAttr(draft.warna||'#C62828')+'" style="width:72px;padding:4px"></div>';
  h+='<div style="background:#fff;border:1px solid var(--bd);border-radius:10px;overflow:hidden">';
  h+='<div style="padding:16px 18px;background:'+(draft.warna||'#C62828')+';color:#fff"><div style="font-size:18px;font-weight:800">'+letterType+' — '+(letterType==='Evaluasi'?'Form Evaluasi Tindak Lanjut':letterType==='SP1'?'Surat Peringatan Pertama':letterType==='SP2'?'Surat Peringatan Kedua (Terakhir)':'Pemutusan Hubungan Kerja')+'</div><div style="font-size:11px;margin-top:4px;color:rgba(255,255,255,.86)">'+esc(draft.subtitle||'')+'</div></div>';
  h+='<div style="padding:16px 18px;font-size:12px;line-height:1.9;color:#222">';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px"><div><label class="lbl" style="color:#4b5563">Nomor</label><input id="HR-TPL-NO" class="fi" value="'+escAttr(draft.nomor||'')+'"></div><div><label class="lbl" style="color:#4b5563">Tanggal</label><input id="HR-TPL-DATE" class="fi" type="date" value="'+escAttr(draft.tanggal||_todayYMD())+'"></div><div><label class="lbl" style="color:#4b5563">Nama Karyawan</label><input id="HR-TPL-NAME" class="fi" value="'+escAttr(draft.nama||letterName||'')+'"></div><div><label class="lbl" style="color:#4b5563">Posisi / Divisi</label><input id="HR-TPL-POS" class="fi" value="'+escAttr(draft.posisi||((letterPack&&letterPack.latest&&letterPack.latest.info&&letterPack.latest.info.jabatan)||''))+'"></div></div>';
  h+='<div style="margin-bottom:10px"><label class="lbl" style="color:#4b5563">Subjudul / pengantar</label><input id="HR-TPL-SUB" class="fi" value="'+escAttr(draft.subtitle||'')+'"></div>';
  h+='<div style="display:grid;grid-template-columns:1fr;gap:10px"><div><label class="lbl" style="color:#4b5563">Alasan / catatan (1 baris = 1 poin)</label><textarea id="HR-TPL-REASONS" class="fi" rows="6">'+esc(draft.alasan||'')+'</textarea></div><div><label class="lbl" style="color:#4b5563">Target / tindak lanjut (1 baris = 1 poin)</label><textarea id="HR-TPL-TARGET" class="fi" rows="6">'+esc(draft.target||'')+'</textarea></div><div><label class="lbl" style="color:#4b5563">Keputusan / status lanjutan</label><textarea id="HR-TPL-DECISION" class="fi" rows="3">'+esc(draft.keputusan||'')+'</textarea></div></div>';
  h+='<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btns" onclick="_hrSaveTemplateDraft()" style="width:auto">Simpan Template</button><button class="btnp" onclick="_hrPrintTemplate()" style="background:#374151;width:auto">Cetak / PDF</button></div>';
  h+='</div></div></div>';
  h+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:8px">Log Disiplin & Peringatan</div><div style="overflow:auto"><table class="tbl" style="min-width:880px"><thead><tr><th>Waktu</th><th>Nama</th><th>Stage</th><th>Grade</th><th>Decision</th><th class="c">Aksi</th></tr></thead><tbody>'+((_hrControlData.disciplineLog||[]).slice(0,12).map(function(r){ return '<tr><td>'+fmtD(r.ts)+'</td><td style="font-weight:700">'+esc(r.name)+'</td><td>'+esc(r.stage)+'</td><td>'+esc(r.grade)+'</td><td>'+esc(r.decision)+'</td><td class="c"><button class="btnsm" onclick="_hrDeleteDiscipline(\''+escAttr(r.id)+'\')" style="background:#5f6b7a">Hapus</button></td></tr>'; }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:18px">Belum ada log disiplin.</td></tr>')+'</tbody></table></div></div>';
  h+='</div></div>';
  content.innerHTML=h;
  setTimeout(function(){
    try{
      var grades=['A','B','C','D'];
      var gradeCounts=grades.map(function(g){ return evalHistory.filter(function(r){ return r.grade===g; }).length; });
      var c1=document.getElementById('HR-CTL-CH-GRADE');
      if(c1){
        if(_hrControlCharts.dist) _hrControlCharts.dist.destroy();
        _hrControlCharts.dist=new Chart(c1,{type:'doughnut',data:{labels:grades,datasets:[{data:gradeCounts.reduce(function(a,b){return a+b;},0)?gradeCounts:[1,0,0,0],backgroundColor:['#2E7D32','#1565C0','#F57F17','#C62828']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
      }
      var c2=document.getElementById('HR-CTL-CH-TREND');
      if(c2){
        if(_hrControlCharts.trend) _hrControlCharts.trend.destroy();
        var trendRows=selected&&selected.rows?selected.rows.slice(0,8).reverse():[];
        _hrControlCharts.trend=new Chart(c2,{type:'line',data:{labels:trendRows.map(function(r){ return periodeLabel(r.info); }),datasets:[{label:'Skor /100',data:trendRows.map(_hrScore100),borderColor:_hrActionTone(selected&&selected.stage||'Normal'),backgroundColor:'rgba(239,197,106,.12)',fill:true,tension:.35,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100}}}});
      }
    }catch(e){ console.error('hr control charts error',e); }
  },100);
}

function _devDefaultData(){
  return {
    resources:[
      {title:'HOOK', meta:'Hook', desc:'Kumpulan pembuka konten untuk inspirasi caption dan video.', color:'#EBD9E8'},
      {title:'Hashtag', meta:'# Hashtag', desc:'Daftar hashtag utama yang bisa dipakai ulang.', color:'#F3E6D8'},
      {title:'Audio', meta:'Audio', desc:'Audio dan tren yang ingin disimpan untuk referensi.', color:'#E8E1F5'},
      {title:'Bookmark', meta:'Bookmarks', desc:'Link penting, tools, dan sumber yang sering dipakai.', color:'#E6E8F5'},
      {title:'Reusable Templates', meta:'Template', desc:'Template invoice, kontrak, CTA, dan assets rutin.', color:'#F3E9D8'},
      {title:'Form Library', meta:'Forms', desc:'Kumpulan formulir dan format operasional bisnis.', color:'#E5EDF7'},
      {title:'Offer Assets', meta:'Offer assets', desc:'Materi pendukung offer dan launching campaign.', color:'#F4E4DF'},
      {title:'Case Studies', meta:'Case studies', desc:'Dokumentasi keberhasilan, insight, dan studi kasus.', color:'#E9E4F5'}
    ],
    vision:[
      {title:'Gudang lebih rapi & efisien', tag:'Operations', color:'linear-gradient(135deg,#755337,#C8AF8A)'},
      {title:'Workspace tim kreatif', tag:'Brand', color:'linear-gradient(135deg,#3F2615,#9E6A43)'},
      {title:'Display toko lebih profesional', tag:'Retail', color:'linear-gradient(135deg,#543B2E,#CDAE8B)'},
      {title:'Packaging signature AJW', tag:'Product', color:'linear-gradient(135deg,#2E2A24,#B89A6D)'},
      {title:'Konten harian yang konsisten', tag:'Content', color:'linear-gradient(135deg,#44312C,#C9B9A4)'},
      {title:'Ekspansi gudang & kantor', tag:'Growth', color:'linear-gradient(135deg,#3B2C23,#8E6E56)'}
    ],
    learning:[
      {name:'Marketplace Growth Sprint', status:'Active', price:'Rp 2.500.000', type:'Course', category:'Growth', creator:'Hokky', access:'Internal', activity:'14 April 2026', message:'Belajar strategi scale toko', todos:5},
      {name:'Brand Storytelling', status:'Planned', price:'Rp 950.000', type:'Workshop', category:'Branding', creator:'AJW Team', access:'Need Link', activity:'12 April 2026', message:'Pendalaman voice brand', todos:3}
    ],
    ideas:[
      {name:'Bundling set galatama premium', status:'Approved', project:'Sales Growth', priority:'High', by:'Hokky', date:'2026-04-12', category:'Offer', feasibility:8.6, impact:'Tinggi', notes:'Naikkan AOV lewat bundling kategori margin tinggi', next:'Uji di Shopee & TikTok'},
      {name:'Live selling mingguan tematik', status:'Review', project:'Marketing Hub', priority:'Medium', by:'Team Content', date:'2026-04-10', category:'Live Commerce', feasibility:7.2, impact:'Sedang', notes:'Buat kalender live berdasarkan musim dan stok', next:'Susun host + promo'}
    ],
    documents:[
      {name:'SOP Upload Produk', stage:'Draft', docType:'Guides & SOPs', createdOn:'27 November 2025', editedBy:'Hokky', editedAt:'11 April 2026 11:34', file:'SOP_upload_produk.pdf', url:''},
      {name:'Laporan Review Bulanan', stage:'Active', docType:'Reports & Reviews', createdOn:'1 April 2026', editedBy:'Hokky', editedAt:'16 April 2026 21:10', file:'review_bulanan_april.xlsx', url:''},
      {name:'Referensi Tone of Voice', stage:'Draft', docType:'References', createdOn:'10 April 2026', editedBy:'AJW Team', editedAt:'16 April 2026 12:20', file:'tone_of_voice.docx', url:''}
    ],
    objectives:[
      {name:'Margin keuntungan meningkat hingga 15%/bulan', outcome:'Fokus jual produk margin tinggi, negosiasi supplier, bundling otomatis', status:'Planned', start:'2026-04-01', target:'2026-07-31', priority:'Medium', targetValue:15, currentValue:5, category:'Financial'},
      {name:'Mencapai omzet 300 juta/bulan', outcome:'Naikkan jumlah produk, AOV, dan campaign promo', status:'Planned', start:'2026-04-01', target:'2026-07-31', priority:'High', targetValue:300000000, currentValue:115000000, category:'Marketing'}
    ],
    tasks:[
      {name:'Inbound Tali GF', done:true, priority:'Medium', assigned:'Warehouse', status:'Completed', deadline:'2026-04-10', project:'Operations', completedOn:'10 April 2026 23:47', duration:'2 jam'},
      {name:'Membuat SOP & Guides', done:false, priority:'Medium', assigned:'Hokky Alexander', status:'Overdue', deadline:'2026-04-11', project:'Development', completedOn:'', duration:'1 hari'},
      {name:'Perbaiki SKU Bigseller', done:false, priority:'High', assigned:'Hokky Alexander', status:'Upcoming', deadline:'2026-04-30', project:'Marketplace', completedOn:'', duration:'3 hari'}
    ],
    findings:[
      {title:'Banyak pesanan tapi stok banyak yang kosong', category:'Operations', source:'Sales data', insight:'Perlu revisi hubungan SKU dan restock produk', impact:'High', tag:'Pain point', action:'Hubungkan stok gudang ke listing aktif', status:'Implemented', priority:'High', area:'Operations'},
      {title:'Pesanan error bigseller, SKU tidak update', category:'Sales', source:'Ops report', insight:'Harus update SKU, revisi naming, dan sinkron stok', impact:'High', tag:'System', action:'Audit SKU mingguan', status:'Review', priority:'High', area:'Operations'}
    ],
    audits:[
      {name:'Audit Operasional Q2', date:'2026-04-14', quarter:'Q2', status:'Open', area:'Operations', message:'Perlu rapikan alur stok & picking', archived:'No', linkedTasks:2, linkedFinding:2, notifications:'Active', analytics:'Basic'},
      {name:'Audit Marketing Q2', date:'2026-04-15', quarter:'Q2', status:'In Review', area:'Marketing', message:'Konten belum dominan di channel utama', archived:'No', linkedTasks:1, linkedFinding:1, notifications:'Active', analytics:'Basic'}
    ],
    swot:{
      strength:['Multi-channel selling Shopee, Lazada, TikTok sudah kuat','Variasi produk luas, cocok jadi one stop fishing shop','Pengalaman pasar sudah paham demand pelanggan'],
      weakness:['Manajemen stok kompleks dan rawan mismatch','Konten & marketing belum dominan','Sistem keuangan & data belum full structured'],
      opportunity:['Pasar hobi pancing stabil & repeat order tinggi','TikTok Affiliate dan live selling bisa scale traffic murah','Bundling produk bisa naikkan average order value'],
      threat:['Perang harga marketplace bikin margin tipis','Kompetitor copy produk sangat cepat','Cashflow macet saat stok mati']
    },
    marketing:[
      {name:'Social Media', desc:'Konten feed, short video, stories, dan kalender posting'},
      {name:'Paid Ads', desc:'Shopee Ads, TikTok Ads, Meta Ads, retargeting'},
      {name:'Email Marketing', desc:'Broadcast pelanggan, after sales, dan nurture'},
      {name:'Print', desc:'Flyer toko, kartu ucapan, dan material offline'},
      {name:'Collaborations', desc:'Creator, affiliate, reseller, komunitas'},
      {name:'Referral Program', desc:'Program repeat & referral pelanggan setia'},
      {name:'Website', desc:'Landing page, katalog, dan funnel website'},
      {name:'Other', desc:'Eksperimen channel baru & partnership'}
    ],
    brand:{
      palette:[{hex:'#7F5A1A', hsl:'hsl(50,15%,31%)', css:'rgb(127,90,26)', color:'Primary', category:'orange', editor:'Hokky', edited:'11 April 2026 09:19', type:'Primary', brand:'Anton Pancing'},{hex:'#FF6F00', hsl:'hsl(33,100%,50%)', css:'rgb(255,111,0)', color:'Secondary', category:'orange', editor:'Hokky', edited:'11 April 2026 09:19', type:'Secondary', brand:'Anton Pancing'}],
      logos:[{name:'Golden Fish', desc:'Logo toko untuk kebutuhan marketplace'},{name:'Anton Pancing Logo', desc:'Logo utama untuk brand & website'}],
      inspiration:[{name:'Palette 01', colors:['#6E412A','#A6896D','#D0B48F','#EDE7CF','#F8F5EA']},{name:'Palette 02', colors:['#5C1604','#8D4517','#B86F42','#D9BEA0','#EFE5D4']},{name:'Palette 03', colors:['#C6AF8F','#D7BE9A','#E7CFAB','#BA9B78','#9B7254']},{name:'Palette 04', colors:['#432515','#7A5135','#C7A67D','#E0CCAA','#F6F0D8']}],
      fonts:[{name:'Montserrat', role:'Primary Typeface', use:'Headings / Logo / Website'},{name:'Poppins', role:'Secondary Typeface', use:'Body / Support'}]
    }
  };
}
var _devHub = (function(){ try{return JSON.parse(localStorage.getItem('ajw_dev_hub')||'null')||_devDefaultData();}catch(e){return _devDefaultData();} })();
var _devSub='resources';
function _saveDevHub(){
  sv('ajw_dev_hub',_devHub||_devDefaultData());
}
function _devSoftCard(title, subtitle, body, bg){
  return '<div style="background:'+bg+';border:1px solid rgba(0,0,0,.06);border-radius:14px;overflow:hidden;min-height:210px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 6px 18px rgba(0,0,0,.05)"><div style="padding:18px 18px 22px"><div style="font-size:32px;font-weight:800;color:#4A372B;line-height:1.15">'+title+'</div><div style="font-size:12px;color:#7B6A61;margin-top:12px">'+subtitle+'</div></div><div style="padding:14px 18px;border-top:1px solid rgba(0,0,0,.06);background:rgba(255,255,255,.55)"><div style="font-size:12px;font-weight:700;color:#56443B;margin-bottom:6px">'+subtitle+'</div><div style="font-size:11px;line-height:1.7;color:#6F625C">'+body+'</div></div></div>';
}
function _devProgress(val,max){
  var pct=max>0?Math.max(0,Math.min(100,(val/max)*100)):0;
  return '<div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:8px;background:#EEE7DD;border-radius:999px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#E7A1B8,#F6D7A8)"></div></div><span style="font-size:12px;color:#7B6858;min-width:42px">'+pct.toFixed(1)+'%</span></div>';
}
function _renderDevelopment(sub){
  sub=sub||_devSub||'resources'; _devSub=sub;
  var v=document.getElementById('V-development'); if(!v) return;
  var h='<div style="max-width:1460px;margin:0 auto;display:flex;flex-direction:column;gap:12px">';
  h+='<div class="card" style="background:linear-gradient(135deg,#F3EDF8,#F9F3EA);border-color:rgba(202,180,214,.45)">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#3B2D2D">Development Workspace</div><div style="font-size:11px;color:#6F625C;margin-top:4px">Ruang strategi, dokumentasi, pembelajaran, marketing, brand, dan pengembangan bisnis AJW.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:#F4E9F9;color:#7A4B88">Strategy Hub</span><span class="chip" style="background:#FBEED9;color:#9C6A17">Creative + Ops</span></div></div></div>';
  h+='<div class="card" style="margin-top:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['resources','Resources'],['vision','Vision Board'],['learning','Learning Library'],['ideas','Ideas'],['documents','Dokumen'],['objectives','Objektif'],['tasks','Task List'],['audit','Business Audit'],['swot','SWOT'],['marketing','Marketing Hub'],['brand','Brand Design']].forEach(function(it){
    h+='<button class="'+(sub===it[0]?'btnp':'btns')+'" onclick="_renderDevelopment(\''+it[0]+'\')" style="padding:8px 12px;'+(sub===it[0]?'background:#C27C2C;border-color:#C27C2C':'')+'">'+it[1]+'</button>';
  });
  h+='</div></div>';
  if(sub==='resources'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Resources</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px">';
    (_devHub.resources||[]).forEach(function(r){ h+=_devSoftCard(esc(r.title),esc(r.meta),esc(r.desc),r.color||'#F1E7F6'); });
    h+='</div>';
  } else if(sub==='vision'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Vision Board</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">';
    (_devHub.vision||[]).forEach(function(item,idx){
      h+='<div style="border-radius:14px;overflow:hidden;min-height:180px;background:'+item.color+';position:relative;box-shadow:0 10px 24px rgba(0,0,0,.08)"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.42))"></div><div style="position:absolute;left:14px;right:14px;bottom:14px"><span class="chip" style="background:rgba(255,255,255,.18);backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,.18)">'+esc(item.tag)+'</span><div style="font-size:18px;font-weight:800;color:#fff;line-height:1.3;margin-top:10px">'+esc(item.title)+'</div></div><div style="position:absolute;top:12px;right:12px;width:12px;height:12px;border-radius:3px;background:rgba(255,255,255,.45)"></div></div>';
    });
    h+='</div>';
  } else if(sub==='learning'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Learning Library</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1180px"><thead><tr><th>Name</th><th>Status</th><th>Price</th><th>Type</th><th>Category</th><th>Creator</th><th>Access Link</th><th>Last Activity</th><th>Activity Message</th><th>Task to-dos</th></tr></thead><tbody>';
    (_devHub.learning||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.price)+'</td><td>'+esc(r.type)+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.creator)+'</td><td>'+esc(r.access)+'</td><td>'+esc(r.activity)+'</td><td>'+esc(r.message)+'</td><td>'+esc(r.todos)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
  } else if(sub==='ideas'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Ideas Accepted</div></div>';
    h+='<div class="card" style="background:#FFF8DE"><div style="font-size:14px;font-weight:800;color:#4D4632">Detail View</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1400px"><thead><tr><th>Idea Name</th><th>Status</th><th>Linked Project</th><th>Priority</th><th>Idea by</th><th>Date Added</th><th>Category</th><th>Feasibility Score</th><th>Expected Impact</th><th>Notes / Description</th><th>Next Steps</th></tr></thead><tbody>';
    (_devHub.ideas||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.project)+'</td><td>'+esc(r.priority)+'</td><td>'+esc(r.by)+'</td><td>'+esc(r.date)+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.feasibility)+'</td><td>'+esc(r.impact)+'</td><td>'+esc(r.notes)+'</td><td>'+esc(r.next)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
  } else if(sub==='documents'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Important Documents</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1220px"><thead><tr><th>Name</th><th>Stage</th><th>Doc Type</th><th>Created On</th><th>Edited by</th><th>Last edited time</th><th>File & media</th><th>URL</th></tr></thead><tbody>';
    (_devHub.documents||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td>'+esc(r.stage)+'</td><td>'+esc(r.docType)+'</td><td>'+esc(r.createdOn)+'</td><td>'+esc(r.editedBy)+'</td><td>'+esc(r.editedAt)+'</td><td>'+esc(r.file)+'</td><td>'+esc(r.url||'-')+'</td></tr>'; });
    h+='</tbody></table></div></div>';
  } else if(sub==='objectives'){
    h+='<div class="card" style="background:#FFF8DE"><div style="font-size:16px;font-weight:800;color:#4D4632">Detail View</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1450px"><thead><tr><th>Objective Name</th><th>Hasil Utama</th><th>Status</th><th>Start Date</th><th>Target Date</th><th>Priority</th><th>Target Value</th><th>Current Value</th><th>Progress</th><th>Category</th></tr></thead><tbody>';
    (_devHub.objectives||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td style="white-space:pre-line">'+esc(r.outcome)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.start)+'</td><td>'+esc(r.target)+'</td><td>'+esc(r.priority)+'</td><td>'+fmt(r.targetValue)+'</td><td>'+fmt(r.currentValue)+'</td><td>'+_devProgress(r.currentValue,r.targetValue)+'</td><td>'+esc(r.category)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
  } else if(sub==='tasks'){
    var todayTasks=(_devHub.tasks||[]).filter(function(t){ return !t.done; }).length;
    var overdueTasks=(_devHub.tasks||[]).filter(function(t){ return !t.done && new Date(t.deadline+'T00:00:00').getTime()<new Date().setHours(0,0,0,0); }).length;
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Tasks at hand</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:10px;margin-bottom:12px"><div class="card" style="margin-bottom:0"><div style="font-size:10px;color:#7A6A61;text-transform:uppercase;font-weight:700">Today Tasks</div><div style="font-size:28px;font-weight:800;margin-top:6px">'+todayTasks+'</div></div><div class="card" style="margin-bottom:0"><div style="font-size:10px;color:#7A6A61;text-transform:uppercase;font-weight:700">This Week</div><div style="font-size:28px;font-weight:800;margin-top:6px">'+(_devHub.tasks||[]).length+'</div></div><div class="card" style="margin-bottom:0"><div style="font-size:10px;color:#7A6A61;text-transform:uppercase;font-weight:700">Overdue</div><div style="font-size:28px;font-weight:800;margin-top:6px;color:#D96C6C">'+overdueTasks+'</div></div></div>';
    h+='<div class="card" style="background:#FFF8DE"><div style="font-size:16px;font-weight:800;color:#4D4632">Detail View</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1280px"><thead><tr><th>Task Name</th><th>Done</th><th>Priority</th><th>Assigned to</th><th>Task Status</th><th>Deadline</th><th>Linked Project</th><th>Completed On</th><th>Est. Duration</th></tr></thead><tbody>';
    (_devHub.tasks||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td class="c">'+(r.done?'✓':'○')+'</td><td>'+esc(r.priority)+'</td><td>'+esc(r.assigned)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.deadline)+'</td><td>'+esc(r.project)+'</td><td>'+esc(r.completedOn||'-')+'</td><td>'+esc(r.duration||'-')+'</td></tr>'; });
    h+='</tbody></table></div></div>';
  } else if(sub==='audit'){
    var totalAudit=(_devHub.audits||[]).length;
    h+='<div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px">';
    h+='<div>';
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Finding = Tempat Catat Masalah / Ide</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1280px"><thead><tr><th>Title of Finding</th><th>Category</th><th>Source</th><th>Key Insight Summary</th><th>Business Impact</th><th>Tag</th><th>Recommended Action</th><th>Status</th><th>Priority Level</th><th>Business Area</th></tr></thead><tbody>';
    (_devHub.findings||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.title)+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.source)+'</td><td>'+esc(r.insight)+'</td><td>'+esc(r.impact)+'</td><td>'+esc(r.tag)+'</td><td>'+esc(r.action)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.priority)+'</td><td>'+esc(r.area)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
    h+='<div class="card" style="background:#FFF8DE"><div style="font-size:16px;font-weight:800;color:#4D4632">Detail View</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1320px"><thead><tr><th>Name</th><th>Audit date</th><th>Quarter</th><th>Status</th><th>Business area</th><th>Message</th><th>Archived</th><th>Linked Tasks</th><th>Linked Finding</th><th>Notifications</th><th>Analytics</th></tr></thead><tbody>';
    (_devHub.audits||[]).forEach(function(r){ h+='<tr><td style="font-weight:700">'+esc(r.name)+'</td><td>'+esc(r.date)+'</td><td>'+esc(r.quarter)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.area)+'</td><td>'+esc(r.message)+'</td><td>'+esc(r.archived)+'</td><td>'+esc(r.linkedTasks)+'</td><td>'+esc(r.linkedFinding)+'</td><td>'+esc(r.notifications)+'</td><td>'+esc(r.analytics)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
    h+='</div>';
    h+='<div class="card" style="align-self:start"><div style="font-size:18px;font-weight:800;color:#C27C2C;margin-bottom:10px">Business Audit</div><div style="font-size:12px;line-height:1.9;color:#6F625C">Client Audit: 0<br>Finance Audit: 0<br>Marketing Audit: '+((_devHub.audits||[]).filter(function(r){return r.area==='Marketing';}).length)+'<br>Offer Audit: 0<br>Operation Audit: '+((_devHub.audits||[]).filter(function(r){return r.area==='Operations';}).length)+'<br>Sales Audit: 0<br><b style="color:#332924">Total Audit: '+totalAudit+'</b></div></div>';
    h+='</div>';
  } else if(sub==='swot'){
    h+='<div class="card" style="background:#FBEED9"><div style="font-size:16px;font-weight:800;color:#5A3A27">SWOT Analysis</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px">';
    [['Strength','strength','#E8F7EE','#2E7D59'],['Weakness','weakness','#FFF0E0','#C7782B'],['Opportunity','opportunity','#FFF8DE','#B8871A'],['Threat','threat','#FDE8E6','#C75F5F']].forEach(function(col){
      h+='<div><div style="font-size:16px;font-weight:800;color:'+col[3]+';margin-bottom:10px">'+col[0]+' <span style="font-size:12px;color:#999;font-weight:700">'+((_devHub.swot[col[1]]||[]).length)+'</span></div>';
      (_devHub.swot[col[1]]||[]).forEach(function(item){ h+='<div style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:14px;padding:14px 14px 16px;margin-bottom:10px;line-height:1.6;color:#2F2A28;box-shadow:0 4px 12px rgba(0,0,0,.04)">'+esc(item)+'</div>'; });
      h+='</div>';
    });
    h+='</div>';
  } else if(sub==='marketing'){
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Marketing Resources</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">';
    (_devHub.marketing||[]).forEach(function(r,idx){ h+='<div style="border-radius:14px;overflow:hidden;background:#F8F0EE;border:1px solid rgba(0,0,0,.05);box-shadow:0 6px 16px rgba(0,0,0,.04)"><div style="height:150px;display:flex;align-items:center;justify-content:center;font-size:54px;color:#3F342E">'+['◉','⌁','✉','🖶','✦','↗','▣','◎'][idx%8]+'</div><div style="padding:14px 16px;border-top:1px solid rgba(0,0,0,.05)"><div style="font-size:18px;font-weight:800;color:#4A372B">'+esc(r.name)+'</div><div style="font-size:11px;line-height:1.7;color:#6F625C;margin-top:8px">'+esc(r.desc)+'</div></div></div>'; });
    h+='</div>';
  } else if(sub==='brand'){
    h+='<div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,.9fr);gap:14px">';
    h+='<div>';
    h+='<div class="card" style="background:#FBEED9"><div style="font-size:16px;font-weight:800;color:#5A3A27">Color Palette</div></div>';
    h+='<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>HEX</th><th>HSL</th><th>CSS</th><th>Color</th><th>Category</th><th>Editor</th><th>Edited time</th><th>Type</th><th>Brand</th></tr></thead><tbody>';
    (_devHub.brand.palette||[]).forEach(function(r){ h+='<tr><td><div style="display:flex;align-items:center;gap:8px"><span style="width:16px;height:16px;border-radius:4px;background:'+escAttr(r.hex)+';"></span>'+esc(r.hex)+'</div></td><td>'+esc(r.hsl)+'</td><td>'+esc(r.css)+'</td><td>'+esc(r.color)+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.editor)+'</td><td>'+esc(r.edited)+'</td><td>'+esc(r.type)+'</td><td>'+esc(r.brand)+'</td></tr>'; });
    h+='</tbody></table></div></div>';
    h+='<div class="card" style="background:#FBEED9"><div style="font-size:16px;font-weight:800;color:#5A3A27">Logo variation</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">';
    (_devHub.brand.logos||[]).forEach(function(l,idx){ var src=idx===0?LOGO_SRC:LOGO_SRC; h+='<div class="card" style="margin-bottom:0;text-align:center"><img src="'+src+'" style="width:100%;max-height:160px;object-fit:contain;background:#fff;border-radius:10px"><div style="font-size:16px;font-weight:800;color:var(--tx);margin-top:12px">'+esc(l.name)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:6px">'+esc(l.desc)+'</div></div>'; });
    h+='</div></div>';
    h+='<div style="display:flex;flex-direction:column;gap:14px">';
    h+='<div class="card" style="background:#F6F0FA"><div style="font-size:16px;font-weight:800;color:#43323A">Inspiration</div></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    (_devHub.brand.inspiration||[]).forEach(function(p){ h+='<div class="card" style="margin-bottom:0;padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:repeat(5,1fr);height:112px">'+p.colors.map(function(c){ return '<div style="background:'+c+'"></div>'; }).join('')+'</div><div style="padding:12px 14px;font-weight:800">'+esc(p.name)+'</div></div>'; });
    h+='</div>';
    h+='<div class="card" style="background:#FBEED9"><div style="font-size:16px;font-weight:800;color:#5A3A27">Brand Font</div></div>';
    (_devHub.brand.fonts||[]).forEach(function(f){ h+='<div class="card" style="margin-bottom:0"><div style="font-size:56px;line-height:1;color:#1B1663;font-weight:800">Aa Bb</div><div style="font-size:20px;font-weight:800;margin-top:12px">'+esc(f.name)+'</div><div style="font-size:12px;color:#6F625C;margin-top:6px"><b>'+esc(f.role)+'</b><br>'+esc(f.use)+'</div></div>'; });
    h+='</div></div>';
  }
  h+='</div>';
  v.innerHTML=h;
}

/* Main tabs: keep all old tabs, add HR/Finance/LOG, rename labels */
buildTabBar = function(){
  var cfg=getCfg(); var tc=cfg.tabsConfig||{}; var role=window._ajwRole||'admin';
  var defs=[
    {id:'dash',lbl:'HOME'},
    {id:'kpi',lbl:'KPI'},
    {id:'hr',lbl:'HR'},
    {id:'finance',lbl:'FINANCE'},
    {id:'tools',lbl:'TOOLS'},
    {id:'development',lbl:'DEVELOPMENT'},
    {id:'admin',lbl:'CONTROL'}
  ];
  if(role!=='admin') defs=defs.filter(function(d){ return d.id!=='admin' && d.id!=='eval' && d.id!=='payroll' && d.id!=='hist'; });
  var h='<div class="tab-brand">AJW MAIN FUNCTION</div>';
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
  var el=document.getElementById('TABS'); if(el) el.innerHTML=h;
};

/* HR page with subtabs */
function _renderHR(sub){
  sub=sub||window._hrSub||'dash'; window._hrSub=sub;
  if(sub!=='sop') window._hrSopWideMode=false;
  var v=document.getElementById('V-hr'); if(!v) return;
  /* Always restore mounted views first to avoid accidental node loss when switching HR subtabs */
  _restoreEmbeddedViews();
  if(!document.getElementById('HR-SHELL')){
    v.innerHTML='<div id="HR-SHELL"></div><div id="HR-CONTENT"></div>';
  }
  var shell=document.getElementById('HR-SHELL');
  var content=document.getElementById('HR-CONTENT');
  if(!shell||!content) return;
  shell.style.width=(sub==='sop'&&window._hrSopWideMode)?'min(100%,1540px)':'';
  content.style.width=(sub==='sop'&&window._hrSopWideMode)?'min(100%,1760px)':'';
  content.style.maxWidth=(sub==='sop'&&window._hrSopWideMode)?'1760px':'';
  var h='';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Desk HR'],['eval','Penilaian'],['payroll','Payroll'],['karyawan','Karyawan'],['statistik','Statistik'],['control','KPI & Control'],['sop','SOP & Guides'],['riw','Riwayat']].forEach(function(s){
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
  } else if(sub==='control'){
    _hrRenderControlOnly(); return;
  } else if(sub==='sop'){
    _renderHRSopOnly(); return;
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
  _syncPayrollExpenses();
  if(!document.getElementById('FIN-SHELL')){
    v.innerHTML='<div id="FIN-SHELL"></div><div id="FIN-CONTENT"></div>';
  }
  var shell=document.getElementById('FIN-SHELL');
  var content=document.getElementById('FIN-CONTENT');
  if(!shell||!content) return;
  var compactFinTabs={income:1,asset:1,hutang:1,lapbul:1};
  shell.className=compactFinTabs[sub]?'fin-compact':'';
  content.className=compactFinTabs[sub]?'fin-compact':'';
  var totalIn=_finIncome.map(_finIncomeMetrics).reduce(function(t,r){return t+r.pemasukanToko;},0);
  var totalEx=_finExpense.reduce(function(t,r){return t+_num(r.nominal);},0);
  var subReminders=_finSubscriptionReminders();
  var urgentSubReminders=subReminders.filter(function(r){ return r.level==='overdue'||r.level==='today'||r.level==='soon'; });
  _finNotifySubscriptionReminders(urgentSubReminders);
  var totalAssetBank=_finAssets.filter(function(r){ return (r.type||'')==='Bank'; }).reduce(function(t,r){ return t+_num(r.nominal); },0);
  var totalAssetOther=_finAssets.filter(function(r){ return (r.type||'')!=='Bank'; }).reduce(function(t,r){ return t+_num(r.nominal); },0);
  var totalAssetAll=totalAssetBank+totalAssetOther;
  var gN=(typeof supplierHutang!=='undefined'?supplierHutang.reduce(function(t,d){return t+(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);},0):0);
  var gB=(typeof supplierHutang!=='undefined'?supplierHutang.reduce(function(t,d){return t+(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);},0):0);
  var saldoH=gN-gB;
  var h='';
  h+='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Desk Finance'],['income','Pendapatan'],['expense','Pengeluaran'],['asset','Aset'],['hutang','Hutang Supplier'],['lapbul','Laporan Bulanan']].forEach(function(s){
    h+='<button class="'+(sub===s[0]?'btnp':'btns')+'" onclick="_renderFinance(\''+s[0]+'\')" style="padding:8px 12px">'+s[1]+'</button>';
  });
  h+='</div></div>';
  shell.innerHTML=h;
    if(sub==='dash'){
      var monthlyRowsAll=_finBuildMonthlySummary();
      var monthlyRows=_finFilterMonthlyRowsForDesk(monthlyRowsAll);
      var deskRange=_finResolveDeskRange();
      var currentMonth=_finDeskSummaryForRange();
      var bestMonth=monthlyRows.slice().sort(function(a,b){ return b.penjualan-a.penjualan; })[0]||currentMonth;
      var latestMonths=monthlyRows.slice().sort(function(a,b){ return String(b.key).localeCompare(String(a.key)); }).slice(0,4);
      var monthsCount=Math.max(_finMonthKeysInRange(deskRange.from,deskRange.to).length,1);
      var avgExpenseMonthly=monthlyRows.reduce(function(sum,row){ return sum+_num(row.pengeluaran); },0)/monthsCount;
      var avgSalesMonthly=monthlyRows.reduce(function(sum,row){ return sum+_num(row.penjualan); },0)/monthsCount;
      var avgExpensePct=avgSalesMonthly>0?((avgExpenseMonthly/avgSalesMonthly)*100):0;
      var profitPct=currentMonth.penjualan>0?((currentMonth.laba/currentMonth.penjualan)*100):0;
      var storeRatios=_finStoreRatiosForRange().slice(0,6);
      var productAssetSeries=_finProductAssetSeriesForRange(deskRange.from,deskRange.to);
      var productAssetLatest=productAssetSeries.length?productAssetSeries[productAssetSeries.length-1].value:0;
      var productAssetPrev=productAssetSeries.length>1?productAssetSeries[productAssetSeries.length-2].value:0;
      var productAssetDelta=productAssetLatest-productAssetPrev;
      var productAssetDeltaPct=productAssetPrev>0?(productAssetDelta/productAssetPrev*100):0;
      var supplierNamesDash=(typeof supplierData!=='undefined'?supplierData.map(function(s){ return s.nama; }).filter(Boolean):[]);
      var supplierSummaryDash={};
    supplierNamesDash.forEach(function(n){ supplierSummaryDash[n]={nota:0,bayar:0,saldo:0}; });
    if(typeof supplierHutang!=='undefined'){
      var activeMonthKeys={};
      _finMonthKeysInRange(deskRange.from,deskRange.to).forEach(function(key){ activeMonthKeys[key]=1; });
      supplierHutang.forEach(function(d){
        var rowKey=(d.tahun&&d.bulanNum)?(String(d.tahun)+'-'+String(d.bulanNum).padStart(2,'0')):'';
        if(rowKey && !activeMonthKeys[rowKey]) return;
        var nm=d.namaSupplier||'Golden Fish';
        supplierSummaryDash[nm]=supplierSummaryDash[nm]||{nota:0,bayar:0,saldo:0};
        var nota=(d.nota||[]).reduce(function(s,n){return s+(parseFloat(n.nilaiNetto)||0);},0);
        var bayar=(d.bayar||[]).reduce(function(s,b){return s+(parseFloat(b.jumlah)||0);},0);
        supplierSummaryDash[nm].nota+=nota;
        supplierSummaryDash[nm].bayar+=bayar;
        supplierSummaryDash[nm].saldo+=nota-bayar;
      });
    }
    var topSuppliers=Object.keys(supplierSummaryDash).map(function(nm){ return {nama:nm,saldo:(supplierSummaryDash[nm]||{}).saldo||0,nota:(supplierSummaryDash[nm]||{}).nota||0,bayar:(supplierSummaryDash[nm]||{}).bayar||0}; }).filter(function(x){ return x.nota>0||x.saldo>0; }).sort(function(a,b){ return b.saldo-a.saldo; }).slice(0,3);
    var fd='';
    fd+='<div class="card" style="margin-bottom:12px;padding:12px 14px;background:linear-gradient(135deg,rgba(240,197,106,.05),rgba(143,208,255,.03))">';
    fd+=_finTitleBar('Desk Finance','Dashboard inti finance yang menarik data dari pendapatan marketplace, pengeluaran operasional, hutang supplier, dan laporan bulanan dalam tampilan ringkas.', '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(240,197,106,.3);color:#F0C56A;font-size:11px;font-weight:700">'+esc(deskRange.label)+'</span><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(143,208,255,.25);color:#8FD0FF;font-size:11px;font-weight:700">4 modul</span></div>');
      fd+=_finDeskPeriodToolbar()+'</div>';
      fd+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">';
      [['Penjualan','Rp '+fmt(currentMonth.penjualan),'#8FD0FF','Total dana penjualan marketplace pada periode aktif'],['Keuntungan','Rp '+fmt(currentMonth.laba),currentMonth.laba>=0?'#A7F3B6':'#FF9D9D','Akumulasi keuntungan bersih dari data pendapatan aktif'],['% Keuntungan',profitPct.toFixed(1)+'%','#D796FF','Keuntungan dibanding dana penjualan pada periode aktif'],['Pengeluaran','Rp '+fmt(currentMonth.pengeluaran),'#FFB76B','Dari Pengeluaran Operasional pada periode aktif'],['Hutang','Rp '+fmt(currentMonth.hutangSupplier),'#FFD68A','Akumulasi saldo supplier pada periode aktif'],['Target',(currentMonth.progressPenjualan*100).toFixed(1)+'%','#D796FF','Penjualan vs target bulanan']].forEach(function(card){
        fd+=_finMiniKPI(card[0],card[1],card[2],card[3]);
      });
      fd+='</div>';
      fd+='<div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:12px;align-items:start;margin-bottom:12px">';
      fd+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Kompas Bulanan Finance</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Ringkasan utama bulan aktif yang menyambungkan target penjualan, cash, pengeluaran, dan saldo akhir.</div></div><button class="btns" onclick="_renderFinance(\'lapbul\')">Buka Laporan Bulanan</button></div>';
      fd+='<div style="display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:12px">';
    fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:14px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px"><span style="font-size:11px;font-weight:700;color:#8FD0FF;text-transform:uppercase;letter-spacing:.05em">Target Penjualan</span><span style="font-size:11px;color:var(--tx2)">Rp '+fmt(currentMonth.targetPenjualan)+'</span></div><div style="height:8px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,currentMonth.progressPenjualan*100))+'%;background:linear-gradient(90deg,#8FD0FF,#F0C56A)"></div></div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;font-size:11px;color:var(--tx2)"><span>Realisasi: Rp '+fmt(currentMonth.penjualan)+'</span><span>'+(currentMonth.progressPenjualan*100).toFixed(1)+'%</span></div></div>';
      fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:14px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px"><span style="font-size:11px;font-weight:700;color:#A7F3B6;text-transform:uppercase;letter-spacing:.05em">Cash Goal</span><span style="font-size:11px;color:var(--tx2)">Rp '+fmt(currentMonth.cashGoal)+'</span></div><div style="height:8px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,currentMonth.cashProgress*100))+'%;background:linear-gradient(90deg,#A7F3B6,#8FD0FF)"></div></div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;font-size:11px;color:var(--tx2)"><span>Cash bank bersih: Rp '+fmt(currentMonth.totalCash)+'</span><span>'+(currentMonth.cashProgress*100).toFixed(1)+'%</span></div></div>';
      fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:14px"><div style="font-size:11px;font-weight:700;color:#D796FF;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Rata-rata Pengeluaran / Bulan</div><div style="font-size:22px;font-weight:800;color:var(--tx)">Rp '+fmt(avgExpenseMonthly)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:8px">'+avgExpensePct.toFixed(1)+'% dibanding rata-rata penjualan bulanan pada periode aktif.</div></div>';
      fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:14px"><div style="font-size:11px;font-weight:700;color:#A7F3B6;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Bulan Terbaik (Omzet)</div><div style="font-size:22px;font-weight:800;color:var(--tx)">'+esc(bestMonth.name)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:8px">Omzet tertinggi: Rp '+fmt(bestMonth.penjualan)+'</div></div>';
      fd+='</div></div>';
      fd+='<div style="display:flex;flex-direction:column;gap:12px">';
      fd+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">Perubahan Aset Produk</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">Membaca snapshot aset jenis produk dari periode ke periode aktif.</div></div><button class="btns" onclick="_renderFinance(\'asset\')">Buka Aset</button></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:9px"><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:9px 10px"><div style="font-size:10px;font-weight:700;color:#8FD0FF;text-transform:uppercase">Aset Produk</div><div style="font-size:16px;font-weight:800;color:var(--tx);margin-top:4px">Rp '+fmt(productAssetLatest)+'</div></div><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:9px 10px"><div style="font-size:10px;font-weight:700;color:'+(productAssetDelta>=0?'#A7F3B6':'#FF9D9D')+';text-transform:uppercase">Perubahan</div><div style="font-size:16px;font-weight:800;color:'+(productAssetDelta>=0?'#A7F3B6':'#FF9D9D')+';margin-top:4px">'+(productAssetDelta>=0?'+':'-')+'Rp '+fmt(Math.abs(productAssetDelta))+'</div></div><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:9px 10px"><div style="font-size:10px;font-weight:700;color:#F0C56A;text-transform:uppercase">Delta %</div><div style="font-size:16px;font-weight:800;color:var(--tx);margin-top:4px">'+(productAssetSeries.length>1?(productAssetDeltaPct>=0?'+':'')+productAssetDeltaPct.toFixed(1)+'%':'-')+'</div></div></div><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:9px 10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:10px;font-weight:700;color:#8FD0FF;text-transform:uppercase">Trend Aset Produk</span><span style="font-size:10px;color:var(--tx2)">'+productAssetSeries.length+' periode</span></div>'+_finMiniLineSvg(productAssetSeries,'#8FD0FF')+'<div style="display:flex;justify-content:space-between;gap:10px;margin-top:7px;font-size:10px;color:var(--tx2)"><span>'+esc(productAssetSeries.length?(productAssetSeries[0].label||'-'):'Belum ada data')+'</span><span>'+esc(productAssetSeries.length?(productAssetSeries[productAssetSeries.length-1].label||'-'):'-')+'</span></div></div></div>';
      fd+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Supplier Prioritas</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Saldo terbesar yang perlu diperhatikan terlebih dahulu.</div></div><button class="btns" onclick="_renderFinance(\'hutang\')">Buka Hutang</button></div>';
    topSuppliers.forEach(function(r){
      fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:12px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">'+esc(r.nama)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Nota Rp '+fmt(r.nota)+' • Bayar Rp '+fmt(r.bayar)+'</div></div><div style="font-size:12px;font-weight:800;color:'+(r.saldo>0?'#FFD68A':'#A7F3B6')+'">Rp '+fmt(r.saldo)+'</div></div></div>';
      });
      if(!topSuppliers.length) fd+='<div style="color:var(--tx3);text-align:center;padding:14px 10px">Belum ada hutang supplier aktif.</div>';
      fd+='</div>';
      fd+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">Pengingat Langganan Aplikasi</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">Jatuh tempo terdekat dari langganan aktif.</div></div><button class="btns" onclick="_renderFinance(\'expense\')">Buka Pengeluaran</button></div><div style="display:grid;grid-template-columns:1fr;gap:8px">';
      urgentSubReminders.slice(0,6).forEach(function(r){
        var accent=r.level==='overdue'?'#FF9D9D':(r.level==='today'?'#FFD68A':'#8FD0FF');
        var statusText=r.level==='overdue'?'Terlambat '+Math.abs(r.daysLeft)+' hari':(r.level==='today'?'Jatuh tempo hari ini':'Jatuh tempo '+r.daysLeft+' hari lagi');
        fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-left:3px solid '+accent+';border-radius:8px;padding:9px 10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:6px"><div style="font-size:12px;font-weight:800;color:var(--tx)">'+esc(r.nama)+'</div><span style="font-size:10px;font-weight:700;color:'+accent+'">'+statusText+'</span></div><div style="font-size:10px;color:var(--tx2);line-height:1.55">Provider: '+esc(r.provider)+'<br>Jatuh tempo: '+esc(fmtD(r.dueDate))+'<br>Nominal: <b style="color:var(--tx)">Rp '+fmt(r.nominal)+'</b></div></div>';
      });
      if(!urgentSubReminders.length) fd+='<div style="grid-column:1 / -1;color:var(--tx3);text-align:center;padding:18px 10px">Belum ada langganan aktif yang perlu diingatkan saat ini.</div>';
      fd+='</div>';
      fd+='<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Rasio Untung per Toko</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Cari toko dengan margin laba tertinggi dibanding dana penjualan dan modal.</div></div><button class="btns" onclick="_renderFinance(\'income\')">Buka Pendapatan</button></div><div style="display:flex;flex-direction:column;gap:8px">';
      storeRatios.forEach(function(r){
        fd+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:10px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:12px;font-weight:800;color:var(--tx)">'+esc(r.nama)+'</div><div style="font-size:10px;color:var(--tx2);margin-top:4px">Dana Rp '+fmt(r.penjualan)+' • Modal Rp '+fmt(r.modal)+' • Laba Rp '+fmt(r.laba)+'</div></div><div style="text-align:right"><div style="font-size:12px;font-weight:800;color:#A7F3B6">'+r.marginPenjualan.toFixed(1)+'%</div><div style="font-size:10px;color:#8FD0FF;margin-top:4px">vs modal '+r.roiModal.toFixed(1)+'%</div></div></div></div>';
      });
      if(!storeRatios.length) fd+='<div style="color:var(--tx3);text-align:center;padding:16px 10px">Belum ada data toko pada periode aktif.</div>';
      fd+='</div></div></div></div>';
      content.innerHTML=fd;
  } else if(sub==='asset'){
    var assetRows=_finAssets.map(function(r,idx){ return Object.assign({_idx:idx},r); }).filter(function(r){
      if(_finAssetFilter.type && (r.type||'')!==_finAssetFilter.type) return false;
      if(_finAssetFilter.dateFrom && String(r.tanggal||'')<_finAssetFilter.dateFrom) return false;
      if(_finAssetFilter.dateTo && String(r.tanggal||'')>_finAssetFilter.dateTo) return false;
      if(_finAssetFilter.keyword){
        var hay=((r.nama||'')+' '+(r.kategori||'')+' '+(r.catatan||'')).toLowerCase();
        if(hay.indexOf(_finAssetFilter.keyword)<0) return false;
      }
      return true;
    });
    var assetChanges=_finAssetChangeRows(assetRows);
    var assetTypeTotals={};
    _finAssetTypes.forEach(function(t){ assetTypeTotals[t]=0; });
    assetRows.forEach(function(r){ assetTypeTotals[r.type]= (assetTypeTotals[r.type]||0)+_num(r.nominal); });
    var bankSnapshots={};
    _finAssets.filter(function(r){ return (r.type||'')==='Bank'; }).forEach(function(r){
      var key=(r.nama||'Tanpa Rekening').trim()||'Tanpa Rekening';
      if(!bankSnapshots[key] || String(bankSnapshots[key].tanggal||'')<String(r.tanggal||'')) bankSnapshots[key]=r;
    });
    var bankRows=Object.keys(bankSnapshots).sort().map(function(k){ return bankSnapshots[k]; });
    var fa='';
    fa+='<div class="card" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(240,197,106,.08),rgba(143,208,255,.04))"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#F0C56A">Aset Finance</div><div style="font-size:12px;color:var(--tx2);margin-top:4px;max-width:920px">Kelola saldo bank manual sebagai sumber cash bulanan, lalu catat aset lain seperti gudang, tanah, produk, atau aset tambahan lainnya dalam satu modul.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span style="padding:6px 12px;border-radius:999px;border:1px solid rgba(240,197,106,.3);color:#F0C56A;font-size:11px;font-weight:700">Data Aset: '+_finAssets.length+'</span><span style="padding:6px 12px;border-radius:999px;border:1px solid rgba(143,208,255,.25);color:#8FD0FF;font-size:11px;font-weight:700">Bank Aktif: '+bankRows.length+'</span></div></div></div>';
    fa+='<div style="display:grid;grid-template-columns:repeat(5,minmax(170px,1fr));gap:12px;margin-bottom:12px">';
    [['Total Aset','Rp '+fmt(totalAssetAll),'#A7F3B6'],['Aset Bank','Rp '+fmt(totalAssetBank),'#F0C56A'],['Aset Non-Bank','Rp '+fmt(totalAssetOther),'#8FD0FF'],['Snapshot Cash Bulan Ini','Rp '+fmt(_finBankCashForMonth(_todayYMD().slice(0,7))),'#FFD68A'],['Baris Tersaring',''+assetRows.length,'#D796FF']].forEach(function(card){
      fa+='<div class="card" style="margin-bottom:0;background:var(--bg3);position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:'+card[2]+'"></div><div style="font-size:11px;font-weight:700;color:'+card[2]+';text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">'+card[0]+'</div><div style="font-size:24px;font-weight:800;color:var(--tx)">'+card[1]+'</div></div>';
    });
    fa+='</div>';
    fa+='<div style="display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:12px;align-items:start">';
    fa+='<div style="display:flex;flex-direction:column;gap:12px">';
    fa+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Input Aset / Bank</div><div style="font-size:10px;color:var(--tx2);margin:-4px 0 10px;line-height:1.6">Saran terbaik: untuk memantau kenaikan / penurunan aset, gunakan <b style="color:var(--tx)">nama aset yang sama</b> lalu input snapshot baru dengan tanggal baru. Dengan begitu histori perubahan nilai per aset tetap terbaca dan bisa diaudit.</div><div style="display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));gap:10px"><div><label class="lbl">Tanggal</label><input id="FIN-AS-DATE" class="fi" type="date" value="'+_todayYMD()+'"></div><div><label class="lbl">Jenis Aset</label><select id="FIN-AS-TYPE" class="fi">'+_finAssetTypes.map(function(t){ return '<option value="'+escAttr(t)+'">'+esc(t)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Nama Aset / Rekening</label><input id="FIN-AS-NAME" class="fi" placeholder="BCA Operasional / Gudang Utama / Tanah"></div><div><label class="lbl">Kategori</label><input id="FIN-AS-CAT" class="fi" placeholder="Operasional / Properti / Stok / Investasi"></div><div><label class="lbl">Nilai / Saldo</label><input id="FIN-AS-NOM" class="fi" type="number" placeholder="0"></div><div><label class="lbl">Catatan</label><input id="FIN-AS-NOTE" class="fi" placeholder="Keterangan tambahan"></div></div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btnp" onclick="_finAddAsset()" style="background:var(--navy)">Simpan Aset</button></div></div>';
    fa+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Filter Aset</div><div style="display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:10px"><div><label class="lbl">Jenis</label><select id="FIN-AS-FLT-TYPE" class="fi"><option value="">Semua Jenis</option>'+_finAssetTypes.map(function(t){ return '<option value="'+escAttr(t)+'"'+(_finAssetFilter.type===t?' selected':'')+'>'+esc(t)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Keyword</label><input id="FIN-AS-FLT-KEY" class="fi" value="'+escAttr(_finAssetFilter.keyword||'')+'" placeholder="Nama / kategori / catatan"></div><div><label class="lbl">Dari Tanggal</label><input id="FIN-AS-FLT-FROM" class="fi" type="date" value="'+escAttr(_finAssetFilter.dateFrom||'')+'"></div><div><label class="lbl">Sampai Tanggal</label><input id="FIN-AS-FLT-TO" class="fi" type="date" value="'+escAttr(_finAssetFilter.dateTo||'')+'"></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btnp" onclick="_finApplyAssetFilters()" style="background:var(--navy)">Terapkan</button><button class="btns" onclick="_finResetAssetFilters()">Reset</button></div></div>';
    fa+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Daftar Aset</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Saldo bank per bulan dan aset lainnya semuanya dikelola manual dari sini.</div></div></div><div style="overflow-x:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Nama Aset</th><th>Kategori</th><th class="c">Nilai / Saldo</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    assetRows.slice().sort(function(a,b){ return String(b.tanggal||'').localeCompare(String(a.tanggal||'')); }).forEach(function(r){
      fa+='<tr><td>'+esc(r.tanggal||'-')+'</td><td><span class="chip" style="background:var(--bg3);color:var(--tx2)">'+esc(r.type||'-')+'</span></td><td style="font-weight:700">'+esc(r.nama||'-')+'</td><td>'+esc(r.kategori||'-')+'</td><td class="c" style="font-weight:800;color:'+(r.type==='Bank'?'#F0C56A':'#8FD0FF')+'">Rp '+fmt(_num(r.nominal))+'</td><td>'+esc(r.catatan||'-')+'</td><td class="c"><button class="btns" onclick="_finDeleteAsset(\''+escAttr(r.id)+'\')" style="padding:5px 9px;color:#FF9D9D;border-color:rgba(255,120,120,.35)">Hapus</button></td></tr>';
    });
    if(!assetRows.length) fa+='<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">Belum ada data aset pada filter ini.</td></tr>';
    fa+='</tbody></table></div></div></div>';
    fa+='<div style="display:flex;flex-direction:column;gap:12px">';
    var assetTrendSeries=_finAssetTrendSeries(assetRows);
    var assetTrendLast=assetTrendSeries.length?assetTrendSeries[assetTrendSeries.length-1]:null;
    var assetTrendPrev=assetTrendSeries.length>1?assetTrendSeries[assetTrendSeries.length-2]:null;
    var assetTrendDelta=(assetTrendLast&&assetTrendPrev)?(assetTrendLast.total-assetTrendPrev.total):0;
    var assetTrendTone=assetTrendDelta>0?'#A7F3B6':(assetTrendDelta<0?'#FF9D9D':'#8FD0FF');
    var assetFocusOptions=_finDistinctAssetTrendOptions(assetRows);
    if(!_finAssetTrendFocus || !assetFocusOptions.some(function(o){ return o.key===_finAssetTrendFocus; })){
      _finAssetTrendFocus=(assetChanges[0]&&assetChanges[0].key) || (assetFocusOptions[0]&&assetFocusOptions[0].key) || '';
    }
    fa+='<div class="card" style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Tren Total Aset</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">Perbandingan total aset per akhir bulan berdasarkan tanggal input yang masuk filter.</div></div><div style="text-align:right"><div style="font-size:10px;color:var(--tx2)">Perubahan bulan terakhir</div><div style="font-size:12px;font-weight:800;color:'+assetTrendTone+'">'+(assetTrendSeries.length>1?(assetTrendDelta>=0?'+ ':'- ')+'Rp '+fmt(Math.abs(assetTrendDelta)):'Belum cukup data')+'</div></div></div><div style="height:170px"><canvas id="FIN-ASSET-TREND-CHART"></canvas></div></div>';
    fa+='<div class="card" style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Histori Nilai per Nama Aset</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">Pilih nama aset untuk melihat naik / turun nilainya dari periode ke periode.</div></div><div style="min-width:220px"><select id="FIN-ASSET-TREND-FOCUS" class="fi" onchange="_finSetAssetTrendFocus(this.value)"><option value="">Pilih aset</option>'+assetFocusOptions.map(function(opt){ return '<option value="'+escAttr(opt.key)+'"'+(_finAssetTrendFocus===opt.key?' selected':'')+'>'+esc(opt.label)+'</option>'; }).join('')+'</select></div></div><div style="height:160px"><canvas id="FIN-ASSET-NAME-TREND-CHART"></canvas></div></div>';
    fa+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Perubahan Nilai per Aset</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">Membandingkan snapshot terakhir dengan snapshot sebelumnya pada nama aset yang sama.</div></div><span class="chip" style="background:rgba(143,208,255,.1);color:#8FD0FF;border:1px solid rgba(143,208,255,.25)">'+assetChanges.length+' aset berubah</span></div>';
    if(assetChanges.length){
      fa+='<div style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:auto;padding-right:2px">';
      assetChanges.forEach(function(ch){
        var tone=ch.delta>0?'#A7F3B6':'#FF9D9D';
        var bg=ch.delta>0?'rgba(107,208,140,.08)':'rgba(255,120,120,.07)';
        fa+='<div style="background:'+bg+';border:1px solid rgba(255,255,255,.08);border-left:3px solid '+tone+';border-radius:10px;padding:10px 11px">';
        fa+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:12px;font-weight:800;color:var(--tx)">'+esc(ch.nama)+'</div><div style="font-size:10px;color:var(--tx2);margin-top:3px">'+esc(ch.type)+(ch.kategori?' • '+esc(ch.kategori):'')+'</div></div><div style="text-align:right"><div style="font-size:11px;font-weight:800;color:'+tone+'">'+(ch.delta>0?'+ ':'- ')+'Rp '+fmt(Math.abs(ch.delta))+'</div><div style="font-size:10px;color:'+tone+'">'+(ch.pct?((ch.pct>0?'+':'')+ch.pct.toFixed(1)+'%'):'Perubahan nilai')+'</div></div></div>';
        fa+='<div style="margin-top:8px;font-size:10px;color:var(--tx2);line-height:1.7">Sebelumnya: <b style="color:var(--tx)">Rp '+fmt(ch.previousValue)+'</b> ('+esc(fmtD(ch.previousDate))+')<br>Terbaru: <b style="color:var(--tx)">Rp '+fmt(ch.currentValue)+'</b> ('+esc(fmtD(ch.currentDate))+')</div>';
        if(ch.latestNote) fa+='<div style="margin-top:6px;font-size:10px;color:var(--tx2)">Catatan: '+esc(ch.latestNote)+'</div>';
        fa+='</div>';
      });
      fa+='</div>';
    } else {
      fa+='<div style="color:var(--tx3);text-align:center;padding:18px 10px">Belum ada aset yang berubah nilainya pada filter ini.</div>';
    }
    fa+='</div>';
    fa+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Statistik per Jenis Aset</div><div style="display:flex;flex-direction:column;gap:10px">';
    _finAssetTypes.forEach(function(t){
      var val=assetTypeTotals[t]||0, pct=totalAssetAll>0?(val/totalAssetAll*100):0;
      fa+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:7px"><span style="font-size:13px;font-weight:800;color:var(--tx)">'+esc(t)+'</span><span style="font-size:11px;color:#F0C56A;font-weight:700">'+pct.toFixed(1)+'%</span></div><div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:8px">Rp '+fmt(val)+'</div><div style="height:6px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+pct.toFixed(2)+'%;background:linear-gradient(90deg,#8FD0FF,#F0C56A)"></div></div></div>';
    });
    fa+='</div></div>';
    fa+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Snapshot Bank Terbaru</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Dipakai sebagai sumber cash pada ringkasan bulanan.</div></div><span class="chip" style="background:rgba(240,197,106,.1);color:#F0C56A;border:1px solid rgba(240,197,106,.25)">Cash bulan ini: Rp '+fmt(_finBankCashForMonth(_todayYMD().slice(0,7)))+'</span></div>';
    bankRows.forEach(function(r){
      fa+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:12px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:13px;font-weight:800;color:var(--tx)">'+esc(r.nama||'-')+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Update terakhir: '+esc(fmtD(r.tanggal||''))+(r.kategori?' • '+esc(r.kategori):'')+'</div></div><div style="font-size:13px;font-weight:800;color:#F0C56A">Rp '+fmt(_num(r.nominal))+'</div></div></div>';
    });
    if(!bankRows.length) fa+='<div style="color:var(--tx3);text-align:center;padding:18px 10px">Belum ada snapshot bank. Tambahkan aset jenis Bank untuk mengisi cash bulanan.</div>';
    fa+='</div></div></div>';
    content.innerHTML=fa;
    setTimeout(function(){ _finRenderAssetTrendChart(assetRows); _finRenderAssetNameTrendChart(assetRows,_finAssetTrendFocus); },80);
  } else if(sub==='hutang'){
    _mountViewIn('supplier','FIN-CONTENT',renderSupplier); return;
  } else if(sub==='income'){
    var fi='', allRows=_finIncome.map(function(r,idx){ var m=_finIncomeMetrics(r); m._idx=idx; return m; }), incomeBySource={}, incomeByStore={};
    allRows.forEach(function(r){
      incomeBySource[r.marketplace]=incomeBySource[r.marketplace]||{pemasukan:0,count:0};
      incomeBySource[r.marketplace].pemasukan+=r.pemasukanToko;
      incomeBySource[r.marketplace].count+=1;
      incomeByStore[r.toko]=incomeByStore[r.toko]||{pemasukan:0,count:0};
      incomeByStore[r.toko].pemasukan+=r.pemasukanToko;
      incomeByStore[r.toko].count+=1;
    });
    var marketplaces=Object.keys(incomeBySource).sort(), stores=Object.keys(incomeByStore).sort();
    var rows=allRows.filter(function(r){
      if(_finIncomeFilter.marketplace && r.marketplace!==_finIncomeFilter.marketplace) return false;
      if(_finIncomeFilter.toko && r.toko!==_finIncomeFilter.toko) return false;
      var periodFrom=r.periodeDari||r.tanggal||'';
      var periodTo=r.periodeSampai||r.tanggal||'';
      if(_finIncomeFilter.dateFrom && periodTo<_finIncomeFilter.dateFrom) return false;
      if(_finIncomeFilter.dateTo && periodFrom>_finIncomeFilter.dateTo) return false;
      if(_finIncomeFilter.keyword){
        var hay=(r.marketplace+' '+r.toko+' '+r.penandaan+' '+r.catatan).toLowerCase();
        if(hay.indexOf(_finIncomeFilter.keyword)<0) return false;
      }
      return true;
    });
    var activeMarketplaces=Object.keys(rows.reduce(function(acc,r){ if(r.marketplace) acc[r.marketplace]=1; return acc; },{})).sort();
    var importSessionsMap={};
    rows.forEach(function(r){
      if(r.inputMethod!=='import' || !r.importSessionId) return;
      if(!importSessionsMap[r.importSessionId]){
        importSessionsMap[r.importSessionId]={
          id:r.importSessionId,
          label:r.importSessionLabel||r.importSessionId,
          count:0,
          total:0,
          ts:r.ts||'',
          periodFrom:r.periodeDari||r.tanggal||'',
          periodTo:r.periodeSampai||r.tanggal||''
        };
      }
      importSessionsMap[r.importSessionId].count+=1;
      importSessionsMap[r.importSessionId].total+=r.pemasukanToko;
      if(r.ts && (!importSessionsMap[r.importSessionId].ts || String(r.ts)>String(importSessionsMap[r.importSessionId].ts))) importSessionsMap[r.importSessionId].ts=r.ts;
    });
    var importSessions=Object.keys(importSessionsMap).map(function(k){ return importSessionsMap[k]; }).sort(function(a,b){ return String(b.ts||'').localeCompare(String(a.ts||'')); });
    var activePeriodLabel='Semua periode';
    if(_finIncomeFilter.dateFrom || _finIncomeFilter.dateTo){
      activePeriodLabel=(_finIncomeFilter.dateFrom||'Awal')+' s/d '+(_finIncomeFilter.dateTo||'Sekarang');
    }
    var totals=rows.reduce(function(t,r){
      t.dana+=r.danaPenjualanProduk;
      t.subsidi+=r.subsidiMarketplace;
      t.pemasukan+=r.pemasukanToko;
      t.modal+=r.modalProduk;
      t.unt+=r.keuntunganKerugian;
      return t;
    },{dana:0,subsidi:0,pemasukan:0,modal:0,unt:0});
    var totalPct=totals.dana>0?(totals.unt/totals.dana*100):0;
    var cardDefs=[
      {lbl:'Dana Penjualan Produk',val:'Rp '+fmt(totals.dana),tip:'Dana Penjualan Produk Setelah Diskon dan Promo, di mana Shopee mengacu pada Product Price di tagihan, TikTok mengacu pada Subtotal after seller discounts, dan pesanan manual/POS mengikuti total biaya produk di pesanan.',color:'#8FD0FF'},
      {lbl:'Pemasukan Toko',val:'Rp '+fmt(totals.pemasukan),tip:'Pemasukan Toko = Dana Penjualan Produk + Subsidi Marketplace + Biaya Marketplace + Biaya Lainnya.',color:'#F0C56A'},
      {lbl:'Modal Produk',val:'Rp '+fmt(totals.modal),tip:'Modal Produk berdasarkan pengaturan pengambilan harga modal pada pengaturan keuntungan.',color:'#D796FF'},
      {lbl:'Keuntungan / Kerugian',val:'Rp '+fmt(totals.unt),tip:'Keuntungan/Kerugian = Pemasukan Toko - Modal Produk.',color:totals.unt>=0?'#A7F3B6':'#FF9D9D'},
      {lbl:'Persentase Keuntungan',val:totalPct.toFixed(2)+'%',tip:'Persentase Keuntungan = Keuntungan / Dana Penjualan Produk x 100%. Mengikuti rumus laporan Excel BigSeller.',color:totalPct>=0?'#FFD68A':'#FF9D9D'}
    ];
    fi+='<div class="card" style="margin-bottom:12px;padding:12px 14px">';
    fi+=_finTitleBar('Pendapatan Marketplace','Input dan analisa laporan keuntungan marketplace. Sistem menghitung pemasukan toko, keuntungan/kerugian, dan persentase dari komponen yang Anda isi atau import.','<div style="display:flex;gap:8px;flex-wrap:wrap"><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(219,151,76,.35);color:#C4B59A;font-size:11px;font-weight:700">Marketplace: '+activeMarketplaces.length+'</span><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(219,151,76,.35);color:#C4B59A;font-size:11px;font-weight:700">Baris: '+rows.length+'</span><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(143,208,255,.25);color:#B8CEE8;font-size:11px;font-weight:700">'+esc(activePeriodLabel)+'</span></div>');
    fi+='</div>';
    fi+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">';
    cardDefs.forEach(function(card){
      fi+='<div class="card" style="margin-bottom:0;background:var(--bg3);position:relative;overflow:hidden">';
      fi+='<div style="position:absolute;top:0;left:0;right:0;height:3px;background:'+card.color+'"></div>';
      fi+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px"><div style="font-size:11px;font-weight:700;color:'+card.color+';text-transform:uppercase;letter-spacing:.05em;line-height:1.5">'+card.lbl+'</div>'+_finInfoIcon(card.tip)+'</div>';
      fi+='<div style="font-size:22px;font-weight:800;color:var(--tx);line-height:1.25">'+card.val+'</div></div>';
    });
    fi+='</div>';
    fi+='<div id="FIN-IN-MODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9500;justify-content:center;align-items:flex-start;padding:22px;overflow-y:auto" onclick="if(event.target===this)_closeFinIncomeModal()"><div onclick="event.stopPropagation()" style="background:var(--bg2);border:1px solid var(--bd);border-radius:14px;padding:20px;max-width:1180px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.35)">';
    fi+='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><div><div style="font-size:16px;font-weight:800;color:#F0C56A">Input Detail Laporan Marketplace</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Gunakan dropdown tetap untuk marketplace dan nama toko, atau import file Excel/CSV BigSeller.</div></div><button class="btns" onclick="_closeFinIncomeModal()">Tutup</button></div>';
    fi+='<div style="display:grid;grid-template-columns:repeat(5,minmax(140px,1fr));gap:10px;margin-bottom:10px">';
    fi+='<div><label class="lbl">Tanggal</label><input id="FIN-IN-DATE" class="fi" type="date" value="'+_todayYMD()+'" oninput="_finPreviewIncome()"></div>';
    fi+='<div><label class="lbl">Marketplace</label><select id="FIN-IN-MARKET" class="fi" onchange="_finPreviewIncome()"><option value="">Pilih Marketplace</option>'+_finMarketplaceOptions.map(function(x){return '<option value="'+escAttr(x)+'">'+esc(x)+'</option>';}).join('')+'</select></div>';
    fi+='<div><label class="lbl">Nama Toko</label><select id="FIN-IN-TOKO" class="fi" onchange="var v=this.value;var m=_guessMarketplaceByStore(v);if(m&&!(document.getElementById(\'FIN-IN-MARKET\')||{}).value)document.getElementById(\'FIN-IN-MARKET\').value=m;_finPreviewIncome()"><option value="">Pilih Nama Toko</option>'+_finStoreOptions.map(function(x){return '<option value="'+escAttr(x)+'">'+esc(x)+'</option>';}).join('')+'</select></div>';
    fi+='<div><label class="lbl">Penandaan Pesanan</label><input id="FIN-IN-TAG" class="fi" placeholder="Tag / kategori pesanan" oninput="_finPreviewIncome()"></div>';
    fi+='<div><label class="lbl">Catatan</label><input id="FIN-IN-NOTE" class="fi" placeholder="Catatan / referensi laporan" oninput="_finPreviewIncome()"></div>';
    fi+='</div>';
    fi+='<div style="font-size:12px;font-weight:800;color:#F0C56A;margin:10px 0 8px">Data Penjualan Utama</div><div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px;margin-bottom:10px"><div><label class="lbl">Dana Penjualan Produk</label><input id="FIN-IN-DANA" class="fi" type="number" placeholder="0" oninput="_finPreviewIncome()"></div><div><label class="lbl">Pemasukan Toko</label><input id="FIN-IN-PMS" class="fi" type="text" readonly value="Rp 0" style="font-weight:800;color:#8FD0FF;background:rgba(143,208,255,.06)"></div><div><label class="lbl">Modal Produk</label><input id="FIN-IN-MODAL" class="fi" type="number" placeholder="0" oninput="_finPreviewIncome()"></div><div><label class="lbl">Keuntungan / Kerugian</label><input id="FIN-IN-KRG" class="fi" type="text" readonly value="Rp 0" style="font-weight:800;color:#A7F3B6;background:rgba(167,243,182,.06)"></div></div>';
    fi+='<div style="font-size:12px;font-weight:800;color:#F0C56A;margin:10px 0 8px">Biaya Marketplace</div><div style="display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;margin-bottom:10px">';
    [['FIN-IN-SUBSIDI','Subsidi Marketplace'],['FIN-IN-ADM','Biaya Administrasi'],['FIN-IN-TRX','Biaya Transaksi Penjual'],['FIN-IN-LAY','Biaya Layanan'],['FIN-IN-ONGKIR','Ongkos Kirim Dibayar Penjual'],['FIN-IN-PROMO','Biaya Promosi'],['FIN-IN-RETUR','Pengembalian Dana'],['FIN-IN-ADJ','Biaya Penyesuaian Toko'],['FIN-IN-MKTLAIN','Biaya Marketplace Lainnya']].forEach(function(f){ fi+='<div><label class="lbl">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" placeholder="0" oninput="_finPreviewIncome()"></div>'; });
    fi+='</div><div style="font-size:12px;font-weight:800;color:#F0C56A;margin:10px 0 8px">Biaya Lainnya</div><div style="display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;margin-bottom:12px">';
    [['FIN-IN-PACK','Bahan Pengemasan'],['FIN-IN-IKLAN','Iklan'],['FIN-IN-SEWA','Sewa'],['FIN-IN-LAIN','Lainnya']].forEach(function(f){ fi+='<div><label class="lbl">'+f[1]+'</label><input id="'+f[0]+'" class="fi" type="number" placeholder="0" oninput="_finPreviewIncome()"></div>'; });
    fi+='</div><div style="display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:10px;margin-bottom:12px"><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:12px"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:4px">Preview Pemasukan Toko</div><div id="FIN-SUM-PMS" style="font-size:20px;font-weight:800;color:#8FD0FF">Rp 0</div></div><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:12px"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:4px">Preview Keuntungan / Kerugian</div><div id="FIN-SUM-KRG" style="font-size:20px;font-weight:800;color:#A7F3B6">Rp 0</div></div><div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:12px"><div style="font-size:11px;font-weight:700;color:var(--tx2);margin-bottom:4px">Preview Persentase Keuntungan</div><div id="FIN-SUM-PRS" style="font-size:20px;font-weight:800;color:#FFD68A">0%</div></div></div>';
    fi+='<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btns" onclick="_openFinImportModal()">Import Excel / CSV</button><button class="btns" onclick="_closeFinIncomeModal()">Batal</button><button class="btnp" onclick="_finAddIncome()" style="background:var(--navy)">Simpan Laporan Marketplace</button></div></div></div>';
    fi+='<div id="FIN-IMPORT-MODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9550;justify-content:center;align-items:center;padding:22px" onclick="if(event.target===this)_closeFinImportModal()"><div onclick="event.stopPropagation()" style="background:var(--bg2);border:1px solid var(--bd);border-radius:14px;padding:20px;max-width:560px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.35)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><div><div style="font-size:16px;font-weight:800;color:#F0C56A">Import Excel / CSV BigSeller</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Isi periode tanggal untuk data import, lalu pilih file dengan header seperti contoh BigSeller.</div></div><button class="btns" onclick="_closeFinImportModal()">Tutup</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px"><div><label class="lbl">Periode Dari</label><input id="FIN-IMP-FROM" class="fi" type="date" value="'+escAttr(_finImportPeriod.from||'')+'"></div><div><label class="lbl">Periode Sampai</label><input id="FIN-IMP-TO" class="fi" type="date" value="'+escAttr(_finImportPeriod.to||'')+'"></div></div><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btns" onclick="_closeFinImportModal()">Batal</button><button class="btnp" onclick="_finImportMarketplace()" style="background:var(--navy)">Pilih File Import</button></div></div></div>';
    fi+='<div style="padding:10px 12px;border:1px solid var(--bd);border-radius:12px;background:rgba(255,255,255,.01);margin-bottom:12px">';
    fi+='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px"><div style="font-size:13px;font-weight:800;color:var(--tx)">Filter Rincian Laporan</div>'+_finInfoIcon('Filter data, buka input detail, import file, dan kelola sesi upload dari toolbar ringkas ini.')+'</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><button class="btnp" onclick="_openFinIncomeModal()" style="background:var(--navy);padding:7px 10px">+ Input</button><button class="btns" onclick="_openFinImportModal()" style="padding:7px 10px">Import</button><select id="FIN-IMPORT-SESSION-SELECT" class="fi" style="min-width:230px;max-width:360px;padding:7px 10px"><option value="">'+(importSessions.length?('Sesi upload ('+importSessions.length+')'):'Belum ada sesi upload')+'</option>'+importSessions.map(function(s){ return '<option value="'+escAttr(s.id)+'">'+esc(s.label)+' • '+s.count+' baris</option>'; }).join('')+'</select><button class="btns" onclick="var el=document.getElementById(\'FIN-IMPORT-SESSION-SELECT\'); _finDeleteImportSession(el?el.value:\'\')" style="padding:7px 10px;color:#FFB4B4;border-color:rgba(255,120,120,.3)">Hapus Sesi</button><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2);cursor:pointer;padding:0 4px"><input id="FIN-SHOW-TABLE" type="checkbox" '+(_finIncomeFilter.showTable?'checked':'')+'> Tabel</label></div></div>';
    fi+='<div style="display:grid;grid-template-columns:repeat(5,minmax(140px,1fr));gap:10px">';
    fi+='<div><label class="lbl">Marketplace</label><select id="FIN-FLT-MARKET" class="fi"><option value="">Semua Marketplace</option>'+_finMarketplaceOptions.map(function(x){return '<option value="'+escAttr(x)+'"'+(_finIncomeFilter.marketplace===x?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select></div>';
    fi+='<div><label class="lbl">Toko</label><select id="FIN-FLT-TOKO" class="fi"><option value="">Semua Toko</option>'+_finStoreOptions.map(function(x){return '<option value="'+escAttr(x)+'"'+(_finIncomeFilter.toko===x?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select></div>';
    fi+='<div><label class="lbl">Dari Tanggal</label><input id="FIN-FLT-FROM" class="fi" type="date" value="'+escAttr(_finIncomeFilter.dateFrom||'')+'"></div>';
    fi+='<div><label class="lbl">Sampai Tanggal</label><input id="FIN-FLT-TO" class="fi" type="date" value="'+escAttr(_finIncomeFilter.dateTo||'')+'"></div>';
    fi+='<div><label class="lbl">Keyword</label><input id="FIN-FLT-KEY" class="fi" placeholder="Marketplace / toko / catatan" value="'+escAttr(_finIncomeFilter.keyword||'')+'"></div>';
    fi+='</div>';
    fi+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btnp" onclick="_finApplyIncomeFilters()" style="background:var(--navy);padding:7px 10px">Cari</button><button class="btns" onclick="_finResetIncomeFilters()" style="padding:7px 10px">Reset</button></div></div>';
    fi+='<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:var(--tx)">Grafik Laporan Keuntungan Marketplace</div><div style="font-size:11px;color:var(--tx2)">Data mengikuti hasil filter aktif</div></div><div style="height:340px"><canvas id="FIN-INCOME-CHART"></canvas></div></div>';
    fi+='<div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:12px;align-items:start">';
    fi+='<div>';
    if(_finIncomeFilter.showTable){
      var detailTableHtml='<div style="overflow-x:auto"><table class="tbl" style="min-width:2420px"><thead><tr><th class="c" style="width:42px"><input type="checkbox" onchange="_finToggleAllIncomeRows(this)"></th><th>Tanggal</th><th>Periode</th><th>Marketplace</th><th>Nama Toko</th><th>Penandaan</th><th class="c">Dana Penjualan Produk</th><th class="c">Pemasukan Toko</th><th class="c">Modal Produk</th><th class="c">Keuntungan / Kerugian</th><th class="c">Persentase Keuntungan</th><th class="c">Subsidi Marketplace</th><th class="c">Biaya Administrasi</th><th class="c">Biaya Transaksi Penjual</th><th class="c">Biaya Layanan</th><th class="c">Ongkir Seller</th><th class="c">Biaya Promosi</th><th class="c">Pengembalian Dana</th><th class="c">Biaya Penyesuaian Toko</th><th class="c">Biaya Marketplace Lainnya</th><th class="c">Bahan Pengemasan</th><th class="c">Iklan</th><th class="c">Sewa</th><th class="c">Lainnya</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
      rows.slice().sort(function(a,b){return String(b.tanggal||'').localeCompare(String(a.tanggal||''));}).forEach(function(r){
        detailTableHtml+='<tr><td class="c"><input class="fin-income-row-check" type="checkbox" data-idx="'+r._idx+'"></td><td style="white-space:nowrap">'+esc(r.tanggal)+'</td><td style="white-space:nowrap">'+esc((r.periodeDari||r.tanggal)+' s/d '+(r.periodeSampai||r.tanggal))+'</td><td>'+esc(r.marketplace)+'</td><td>'+esc(r.toko)+'</td><td>'+esc(r.penandaan||'-')+'</td><td class="c" style="font-weight:800;color:#8FD0FF">Rp '+fmt(r.danaPenjualanProduk)+'</td><td class="c" style="font-weight:800;color:#F0C56A">Rp '+fmt(r.pemasukanToko)+'</td><td class="c" style="color:#D796FF">Rp '+fmt(r.modalProduk)+'</td><td class="c" style="font-weight:800;color:'+(r.keuntunganKerugian>=0?'#A7F3B6':'#FF9D9D')+'">Rp '+fmt(r.keuntunganKerugian)+'</td><td class="c" style="color:'+(r.persentaseKeuntungan>=0?'#FFD68A':'#FF9D9D')+'">'+r.persentaseKeuntungan.toFixed(2)+'%</td><td class="c">Rp '+fmt(r.subsidiMarketplace)+'</td><td class="c">Rp '+fmt(r.biayaAdministrasi)+'</td><td class="c">Rp '+fmt(r.biayaTransaksiPenjual)+'</td><td class="c">Rp '+fmt(r.biayaLayanan)+'</td><td class="c">Rp '+fmt(r.ongkosKirimDibayarPenjual)+'</td><td class="c">Rp '+fmt(r.biayaPromosi)+'</td><td class="c">Rp '+fmt(r.pengembalianDana)+'</td><td class="c">Rp '+fmt(r.biayaPenyesuaianToko)+'</td><td class="c">Rp '+fmt(r.biayaMarketplaceLainnya)+'</td><td class="c">Rp '+fmt(r.bahanPengemasan)+'</td><td class="c">Rp '+fmt(r.iklan)+'</td><td class="c">Rp '+fmt(r.sewa)+'</td><td class="c">Rp '+fmt(r.lainnya)+'</td><td>'+esc(r.catatan||'-')+'</td><td class="c"><button class="btns" onclick="_finDeleteIncome('+r._idx+')" style="padding:5px 9px;color:#FF9D9D;border-color:rgba(255,120,120,.35)">Hapus</button></td></tr>';
      });
      if(!rows.length) detailTableHtml+='<tr><td colspan="26" style="text-align:center;color:var(--tx3);padding:24px">Belum ada data yang cocok dengan filter.</td></tr>';
      detailTableHtml+='</tbody></table></div>';
      fi+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Rincian Laporan Keuntungan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Statistik, ringkasan marketplace, dan tabel ini mengikuti periode serta filter aktif.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btns" onclick="_finDeleteSelectedIncome()" style="color:#FFB4B4;border-color:rgba(255,120,120,.3)">Hapus Terpilih</button><button class="btns" onclick="_openFinWideTable()">Mode Lebar</button></div></div>';
      fi+=detailTableHtml;
      fi+='</div>';
      fi+='<div id="FIN-WIDE-TABLE-MODAL" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9560;justify-content:center;align-items:flex-start;padding:18px;overflow:auto" onclick="if(event.target===this)_closeFinWideTable()"><div onclick="event.stopPropagation()" style="background:var(--bg2);border:1px solid var(--bd);border-radius:14px;padding:18px;max-width:min(96vw,1800px);width:100%;box-shadow:0 24px 64px rgba(0,0,0,.45)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><div><div style="font-size:16px;font-weight:800;color:#F0C56A">Rincian Laporan Keuntungan - Mode Lebar</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Periode aktif: '+esc(activePeriodLabel)+' | Baris tersaring: '+rows.length+'</div></div><button class="btns" onclick="_closeFinWideTable()">Tutup</button></div>'+detailTableHtml+'</div></div>';
    }
    fi+='</div>';
    fi+='<div style="display:flex;flex-direction:column;gap:12px"><div class="card" style="height:100%"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Ringkasan per Marketplace</div><div style="display:flex;flex-direction:column;gap:10px">';
    activeMarketplaces.forEach(function(src){
      var list=rows.filter(function(r){return r.marketplace===src;});
      if(!list.length) return;
      var total=list.reduce(function(t,r){return t+r.pemasukanToko;},0);
      var pct=totals.pemasukan>0?(total/totals.pemasukan*100):0;
      fi+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:7px"><span style="font-size:13px;font-weight:800;color:var(--tx)">'+esc(src)+'</span><span style="font-size:11px;color:#F0C56A;font-weight:700">'+pct.toFixed(2)+'%</span></div><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--tx2);margin-bottom:7px"><span>Pemasukan: <b style="color:#8FD0FF">Rp '+fmt(total)+'</b></span><span>Data: <b style="color:var(--tx)">'+list.length+'</b></span></div><div style="height:6px;background:var(--bg4);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+pct.toFixed(2)+'%;background:linear-gradient(90deg,#DB974C,#F0C56A)"></div></div></div>';
    });
    if(!activeMarketplaces.length) fi+='<div style="color:var(--tx3);text-align:center;padding:20px 10px">Belum ada ringkasan marketplace.</div>';
    fi+='</div></div>';
    fi+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Riwayat Penambahan</div><div style="display:flex;flex-direction:column;gap:10px">';
    rows.slice().sort(function(a,b){return String(b.ts||'').localeCompare(String(a.ts||''));}).slice(0,8).forEach(function(r){
      fi+='<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:12px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:6px"><span style="font-size:12px;font-weight:800;color:var(--tx)">'+esc(r.toko||r.marketplace)+'</span><span style="font-size:10px;color:'+(r.inputMethod==='import'?'#F0C56A':'#8FD0FF')+';font-weight:700;text-transform:uppercase">'+(r.inputMethod==='import'?'Import':'Manual')+'</span></div><div style="font-size:11px;color:var(--tx2);line-height:1.6">Marketplace: '+esc(r.marketplace)+'<br>Periode: '+esc((r.periodeDari||r.tanggal)+' s/d '+(r.periodeSampai||r.tanggal))+'<br>Ditambahkan: '+esc(r.ts?new Date(r.ts).toLocaleString('id-ID'):'-')+'</div></div>';
    });
    if(!rows.length) fi+='<div style="color:var(--tx3);text-align:center;padding:20px 10px">Belum ada riwayat penambahan.</div>';
    fi+='</div></div></div>';
    content.innerHTML=fi;
    setTimeout(function(){ _finPreviewIncome(); _renderFinIncomeChart(rows); },120);
  } else if(sub==='expense'){
    _finEnsureExpenseCategories();
    var fe='', allCats=[].concat(_finExpenseCategories);
    _finExpense.forEach(function(r){ if(r.kategori && allCats.indexOf(r.kategori)<0) allCats.push(r.kategori); });
    _finSubscriptions.forEach(function(r){ if(r.kategori && allCats.indexOf(r.kategori)<0) allCats.push(r.kategori); });
    allCats=allCats.filter(Boolean).sort(function(a,b){ return String(a).localeCompare(String(b),'id'); });
    var currentYear=parseInt(_finExpenseFilter.year||String(new Date().getFullYear()),10)||new Date().getFullYear();
    var filteredExpense=_finExpense.map(function(r,idx){ return Object.assign({_idx:idx},r); }).filter(function(r){
      var tg=r.tanggal||'';
      if(_finExpenseFilter.category && (r.kategori||'')!==_finExpenseFilter.category) return false;
      if(_finExpenseFilter.dateFrom && tg<_finExpenseFilter.dateFrom) return false;
      if(_finExpenseFilter.dateTo && tg>_finExpenseFilter.dateTo) return false;
      if(!_finExpenseFilter.dateFrom && !_finExpenseFilter.dateTo && currentYear && tg.slice(0,4)!==String(currentYear)) return false;
      return true;
    });
    var totalFiltered=filteredExpense.reduce(function(t,r){ return t+_num(r.nominal); },0);
    var totalGaji=filteredExpense.reduce(function(t,r){ return t+((r.sourceType==='payroll'||r.kategori==='Gaji')?_num(r.nominal):0); },0);
    var totalLangganan=filteredExpense.reduce(function(t,r){ return t+((r.kategori==='Langganan')?_num(r.nominal):0); },0);
    var projectedLangganan=_finProjectedSubscriptionMonthly();
    var projectedExpenseMonthly=_finProjectedExpenseMonthly();
    var avgProfitMonthly=_finAverageProfitMonthly();
    var targetLangganan=_num(_finExpenseTargets.monthlyExpense!=null?_finExpenseTargets.monthlyExpense:_finExpenseTargets.subscriptionMonthly);
    var targetDelta=targetLangganan-projectedExpenseMonthly;
    var profitUsagePct=avgProfitMonthly>0?(projectedExpenseMonthly/avgProfitMonthly*100):0;
    var targetStatus=targetLangganan<=0?'Belum diatur':(targetDelta>=0?'Dalam batas target':'Melewati batas target');
    var safetyStatus=avgProfitMonthly<=0?'Keuntungan belum cukup dibaca':(profitUsagePct<=60?'Sangat aman':(profitUsagePct<=85?'Masih aman':(profitUsagePct<=100?'Waspada':'Tidak aman')));
    var yearRows=_finExpense.filter(function(r){
      var tg=r.tanggal||'';
      return tg.slice(0,4)===String(currentYear) && (!_finExpenseFilter.category || (r.kategori||'')===_finExpenseFilter.category);
    });
    var catRows=allCats.filter(function(cat){
      if(_finExpenseFilter.category && cat!==_finExpenseFilter.category) return false;
      return yearRows.some(function(r){ return (r.kategori||'')===cat; }) || _finSubscriptions.some(function(s){ return (s.kategori||'')===cat; });
    });
    fe+='<div class="card" style="margin-bottom:12px;padding:12px 14px">';
    fe+=_finTitleBar('Pengeluaran Operasional','Kelola pengeluaran manual, gaji otomatis dari payroll, biaya langganan, dan target proyeksi pengeluaran dalam satu halaman.','<div style="display:flex;gap:8px;flex-wrap:wrap"><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(219,151,76,.35);color:#C4B59A;font-size:11px;font-weight:700">Kategori: '+allCats.length+'</span><span style="padding:5px 10px;border-radius:999px;border:1px solid rgba(143,208,255,.25);color:#B8CEE8;font-size:11px;font-weight:700">Baris: '+filteredExpense.length+'</span></div>');
    fe+='</div>';
    fe+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">';
    [['Total Pengeluaran','Rp '+fmt(totalFiltered),'#FFB76B','Akumulasi pengeluaran tersaring pada periode aktif'],['Total Gaji Payroll','Rp '+fmt(totalGaji),'#8FD0FF','Otomatis tersinkron dari slip payroll yang sudah dibuat'],['Langganan Tercatat','Rp '+fmt(totalLangganan),'#D796FF','Pengeluaran kategori langganan yang benar-benar tercatat'],['Proyeksi Pengeluaran / Bulan','Rp '+fmt(projectedExpenseMonthly),'#A7F3B6','Rata-rata pengeluaran bulanan ditambah proyeksi langganan aktif']].forEach(function(card){
      fe+=_finMiniKPI(card[0],card[1],card[2],card[3]);
    });
    fe+='</div>';
    fe+='<div style="padding:8px 10px;border:1px solid var(--bd);border-radius:10px;background:rgba(255,255,255,.01);margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:end;gap:8px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:8px"><div style="font-size:12px;font-weight:800;color:var(--tx)">Target Proyeksi Pengeluaran / Bulan</div>'+_finInfoIcon('Batas pengeluaran bulanan dibandingkan dengan proyeksi pengeluaran dan rata-rata keuntungan dari pendapatan marketplace.')+'</div><div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap"><div style="min-width:180px"><label class="lbl">Batas / Bulan</label><input id="FIN-EX-TARGET-SUB" class="fi" type="number" value="'+escAttr(targetLangganan?String(Math.round(targetLangganan)):'')+'" placeholder="Contoh: 1000000"></div><button class="btnp" onclick="_finSaveExpenseTarget()" style="background:var(--navy);padding:8px 11px">Simpan</button></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:8px">'+_finMiniKPI('Target',targetLangganan>0?('Rp '+fmt(targetLangganan)):'Belum diatur','#A7F3B6','Batas pengeluaran bulanan yang Anda tetapkan')+_finMiniKPI(targetDelta>=0?'Sisa':'Lebih',targetLangganan>0?('Rp '+fmt(Math.abs(targetDelta))):'-',targetDelta>=0?'#8FD0FF':'#FFB6B6','Selisih antara target dan proyeksi pengeluaran')+_finMiniKPI('Status',targetStatus,targetStatus==='Dalam batas target'?'#A7F3B6':targetStatus==='Melewati batas target'?'#FFB6B6':'#FFD68A','Status kondisi target pengeluaran')+_finMiniKPI('Acuan',safetyStatus,safetyStatus==='Sangat aman'?'#A7F3B6':safetyStatus==='Masih aman'?'#8FD0FF':safetyStatus==='Waspada'?'#FFD68A':'#FFB6B6',avgProfitMonthly>0?(profitUsagePct.toFixed(1)+'% dari rata-rata keuntungan bulanan'):'Belum ada cukup data keuntungan')+_finMiniKPI('Laba / Bulan',avgProfitMonthly>0?('Rp '+fmt(avgProfitMonthly)):'Belum ada data','#D796FF','Rata-rata keuntungan marketplace per bulan')+'</div></div>';
    fe+='<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Trend Pengeluaran / Bulan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Membandingkan total pengeluaran, payroll, dan langganan dari bulan ke bulan pada periode aktif.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;font-size:10px"><span class="chip" style="background:rgba(255,183,107,.08);color:#FFB76B;border:1px solid rgba(255,183,107,.18)">Total Pengeluaran</span><span class="chip" style="background:rgba(143,208,255,.08);color:#8FD0FF;border:1px solid rgba(143,208,255,.18)">Payroll</span><span class="chip" style="background:rgba(215,150,255,.08);color:#D796FF;border:1px solid rgba(215,150,255,.18)">Langganan</span></div></div><div style="height:220px"><canvas id="FIN-EXPENSE-TREND-CHART"></canvas></div></div>';
    fe+='<div class="card" style="margin-bottom:12px"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Filter Pengeluaran</div><div style="display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px"><div><label class="lbl">Tahun</label><input id="FIN-EX-FLT-YEAR" class="fi" type="number" value="'+escAttr(String(currentYear))+'"></div><div><label class="lbl">Kategori</label><select id="FIN-EX-FLT-CAT" class="fi"><option value="">Semua Kategori</option>'+allCats.map(function(cat){ return '<option value="'+escAttr(cat)+'"'+(_finExpenseFilter.category===cat?' selected':'')+'>'+esc(cat)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Dari Tanggal</label><input id="FIN-EX-FLT-FROM" class="fi" type="date" value="'+escAttr(_finExpenseFilter.dateFrom||'')+'"></div><div><label class="lbl">Sampai Tanggal</label><input id="FIN-EX-FLT-TO" class="fi" type="date" value="'+escAttr(_finExpenseFilter.dateTo||'')+'"></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btnp" onclick="_finApplyExpenseFilters()" style="background:var(--navy)">Terapkan</button><button class="btns" onclick="_finResetExpenseFilters()">Reset</button></div></div>';
    fe+='<div style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:12px;align-items:start">';
    fe+='<div style="display:flex;flex-direction:column;gap:12px">';
    fe+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Input Pengeluaran Manual</div><div style="display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));gap:10px"><div><label class="lbl">Nama Pengeluaran</label><input id="FIN-EX-NAME" class="fi" placeholder="Pembelian bubble wrap / listrik / dll"></div><div><label class="lbl">Tanggal</label><input id="FIN-EX-DATE" class="fi" type="date" value="'+_todayYMD()+'"></div><div><label class="lbl">Kategori</label><select id="FIN-EX-CAT" class="fi"><option value="">Pilih Kategori</option>'+allCats.map(function(cat){ return '<option value="'+escAttr(cat)+'">'+esc(cat)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Nominal</label><input id="FIN-EX-NOM" class="fi" type="number" placeholder="0"></div><div style="grid-column:1 / -1"><label class="lbl">Catatan</label><input id="FIN-EX-NOTE" class="fi" placeholder="Keterangan tambahan"></div></div><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:10px"><button class="btnp" onclick="_finAddExpense()" style="background:#C62828">Simpan Pengeluaran</button></div></div>';
    fe+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px"><div style="font-size:14px;font-weight:800;color:var(--tx)">Kategori Pengeluaran</div>'+_finInfoIcon('Kategori bisa ditambah manual dari tombol ringkas ini dan langsung dipakai di form pengeluaran.')+'</div><button class="btns" onclick="_finPromptExpenseCategory()" style="padding:7px 10px">+ Tambah Kategori</button></div><div style="display:flex;gap:8px;flex-wrap:wrap">'+(allCats.length?allCats.map(function(cat){ return '<span style="display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:var(--bg3);border:1px solid var(--bd);font-size:11px;font-weight:700;color:var(--tx)">'+esc(cat)+'<button class="btns" onclick="_finDeleteExpenseCategory(\''+encodeURIComponent(cat)+'\')" style="padding:2px 7px;font-size:10px">x</button></span>'; }).join(''):'<span style="color:var(--tx3)">Belum ada kategori.</span>')+'</div></div>';
    fe+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Riwayat Pengeluaran</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Gaji dari payroll masuk otomatis dan tidak bisa dihapus dari sini.</div></div></div><div style="overflow-x:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Tanggal</th><th>Nama Pengeluaran</th><th>Kategori</th><th class="c">Nominal</th><th>Sumber</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    filteredExpense.slice().sort(function(a,b){ return String(b.tanggal||'').localeCompare(String(a.tanggal||'')); }).forEach(function(r){
      fe+='<tr><td>'+esc(r.tanggal||'-')+'</td><td>'+esc(_finExpenseLabel(r))+'</td><td>'+esc(r.kategori||'-')+'</td><td class="c" style="font-weight:800;color:#FFB76B">Rp '+fmt(_num(r.nominal))+'</td><td>'+(r.sourceType==='payroll'?'<span class="chip" style="background:#0F2E45;color:#8FD0FF">Payroll Otomatis</span>':'<span class="chip" style="background:var(--bg3);color:var(--tx2)">Manual</span>')+'</td><td>'+esc(r.catatan||'-')+'</td><td class="c">'+(r.sourceType==='payroll'?'<span style="font-size:10px;color:var(--tx3)">Kelola di Payroll</span>':'<button class="btns" onclick="_finDeleteExpense('+r._idx+')" style="padding:5px 9px;color:#FF9D9D;border-color:rgba(255,120,120,.35)">Hapus</button>')+'</td></tr>';
    });
    if(!filteredExpense.length) fe+='<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">Belum ada pengeluaran pada periode ini.</td></tr>';
    fe+='</tbody></table></div></div>';
    fe+='</div>';
    fe+='<div style="display:flex;flex-direction:column;gap:12px">';
    fe+='<div class="card"><div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:10px">Tabel Pengeluaran Kategori per Periode</div><div style="font-size:11px;color:var(--tx2);margin-bottom:10px">Ringkasan per kategori untuk tahun '+esc(String(currentYear))+(_finExpenseFilter.category?' - filter kategori '+esc(_finExpenseFilter.category):'')+'.</div><div style="overflow-x:auto"><table class="tbl" style="min-width:1320px"><thead><tr><th>Kategori</th><th class="c">Jan</th><th class="c">Feb</th><th class="c">Mar</th><th class="c">Apr</th><th class="c">Mei</th><th class="c">Jun</th><th class="c">Jul</th><th class="c">Agu</th><th class="c">Sep</th><th class="c">Okt</th><th class="c">Nov</th><th class="c">Des</th><th class="c">Total Tahun</th></tr></thead><tbody>';
    catRows.forEach(function(cat){
      var yearTotal=0;
      fe+='<tr><td style="font-weight:700">'+esc(cat)+'</td>';
      for(var mi=0;mi<12;mi++){
        var monthTotal=yearRows.reduce(function(t,r){
          var d=new Date(r.tanggal||'');
          if((r.kategori||'')!==cat || isNaN(d.getTime()) || d.getMonth()!==mi) return t;
          return t+_num(r.nominal);
        },0);
        yearTotal+=monthTotal;
        fe+='<td class="c">Rp '+fmt(monthTotal)+'</td>';
      }
      fe+='<td class="c" style="font-weight:800;color:#FFB76B">Rp '+fmt(yearTotal)+'</td></tr>';
    });
    if(!catRows.length) fe+='<tr><td colspan="14" style="text-align:center;color:var(--tx3);padding:24px">Belum ada ringkasan kategori untuk tahun ini.</td></tr>';
    fe+='</tbody></table></div></div>';
    fe+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:14px;font-weight:800;color:var(--tx)">Biaya Langganan</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Isi data langganan aplikasi dan sistem akan memberi pengingat otomatis menjelang jatuh tempo.</div></div><span style="padding:6px 12px;border-radius:999px;border:1px solid rgba(240,197,106,.3);color:#F0C56A;font-size:11px;font-weight:700">Pengingat aktif: '+urgentSubReminders.length+'</span></div>';
    fe+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:12px">';
    urgentSubReminders.slice(0,6).forEach(function(r){
      var accent=r.level==='overdue'?'#FF9D9D':(r.level==='today'?'#FFD68A':'#8FD0FF');
      var statusText=r.level==='overdue'?'Terlambat '+Math.abs(r.daysLeft)+' hari':(r.level==='today'?'Jatuh tempo hari ini':'Jatuh tempo '+r.daysLeft+' hari lagi');
      fe+='<div style="background:var(--bg3);border:1px solid var(--bd);border-left:3px solid '+accent+';border-radius:8px;padding:12px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px"><div style="font-size:13px;font-weight:800;color:var(--tx)">'+esc(r.nama)+'</div><span style="font-size:10px;font-weight:700;color:'+accent+'">'+statusText+'</span></div><div style="font-size:11px;color:var(--tx2);line-height:1.6">Provider: '+esc(r.provider)+'<br>Jatuh tempo: '+esc(fmtD(r.dueDate))+'<br>Nominal: <b style="color:var(--tx)">Rp '+fmt(r.nominal)+'</b></div></div>';
    });
    if(!urgentSubReminders.length) fe+='<div style="grid-column:1 / -1;color:var(--tx3);text-align:center;padding:14px 10px;background:var(--bg3);border:1px dashed var(--bd);border-radius:8px">Belum ada langganan aktif yang mendekati jatuh tempo.</div>';
    fe+='</div><div style="display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:10px"><div><label class="lbl">Nama Langganan</label><input id="FIN-SUB-NAMA" class="fi" placeholder="BigSeller / Duoke / Canva"></div><div><label class="lbl">Provider</label><input id="FIN-SUB-PROV" class="fi" placeholder="Nama provider"></div><div><label class="lbl">Nominal</label><input id="FIN-SUB-NOM" class="fi" type="number" placeholder="0"></div><div><label class="lbl">Siklus</label><select id="FIN-SUB-CYCLE" class="fi"><option value="Bulanan">Bulanan</option><option value="Tahunan">Tahunan</option></select></div><div><label class="lbl">Tanggal Tagih</label><input id="FIN-SUB-BILL" class="fi" type="number" min="1" max="31" placeholder="23"></div><div><label class="lbl">Kategori</label><select id="FIN-SUB-CAT" class="fi">'+allCats.map(function(cat){ return '<option value="'+escAttr(cat)+'"'+(cat==='Langganan'?' selected':'')+'>'+esc(cat)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Last Payment</label><input id="FIN-SUB-LAST" class="fi" type="date"></div><div><label class="lbl">Next Payment</label><input id="FIN-SUB-NEXT" class="fi" type="date"></div><div><label class="lbl">Status</label><select id="FIN-SUB-STATUS" class="fi"><option value="Active">Active</option><option value="Paused">Paused</option></select></div></div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btnp" onclick="_finAddSubscription()" style="background:#5A3FC0">Simpan Langganan</button></div><div style="overflow-x:auto;margin-top:12px"><table class="tbl" style="min-width:860px"><thead><tr><th>Subscription</th><th>Provider</th><th class="c">Amount</th><th>Siklus</th><th>Status</th><th>Reminder</th><th class="c">Monthly Cost</th><th class="c">Yearly Cost</th><th>Next Payment</th><th class="c">Aksi</th></tr></thead><tbody>';
    _finSubscriptions.forEach(function(r){
      var monthly=(r.siklus==='Tahunan')?(_num(r.nominal)/12):_num(r.nominal);
      var yearly=(r.siklus==='Tahunan')?_num(r.nominal):(_num(r.nominal)*12);
      var rem=subReminders.filter(function(x){ return x.id===r.id; })[0];
      var remText='Belum aktif';
      if(rem){
        remText=rem.level==='overdue'?'Terlambat '+Math.abs(rem.daysLeft)+' hari':(rem.level==='today'?'Hari ini':'+'+rem.daysLeft+' hari');
      }
      fe+='<tr><td style="font-weight:700">'+esc(r.nama||'-')+'</td><td>'+esc(r.provider||'-')+'</td><td class="c">Rp '+fmt(_num(r.nominal))+'</td><td>'+esc(r.siklus||'-')+'</td><td>'+(r.status==='Active'?'<span class="chip" style="background:#153A24;color:#A7F3B6">Active</span>':'<span class="chip" style="background:#3A2B1A;color:#FFD68A">Paused</span>')+'</td><td>'+esc(remText)+'</td><td class="c">Rp '+fmt(monthly)+'</td><td class="c">Rp '+fmt(yearly)+'</td><td>'+esc(_finSubscriptionDueDate(r)||'-')+'</td><td class="c"><button class="btns" onclick="_finDeleteSubscription(\''+escAttr(r.id)+'\')" style="padding:5px 9px;color:#FF9D9D;border-color:rgba(255,120,120,.35)">Hapus</button></td></tr>';
    });
    if(!_finSubscriptions.length) fe+='<tr><td colspan="10" style="text-align:center;color:var(--tx3);padding:24px">Belum ada biaya langganan.</td></tr>';
    fe+='</tbody></table></div></div>';
    fe+='</div></div>';
    content.innerHTML=fe;
    try{ _finRenderExpenseTrendChart(filteredExpense); }catch(e){}
  } else if(sub==='lapbul'){
    var showLap=_finLapbulShow||{penjualan:true,keuntungan:true,persentaseKeuntungan:true,pengeluaran:true,totalAsset:true,saldoHutang:true,saldoTahunan:true,cashBank:false,cashGoal:false,cashProgress:false,berulang:false,date:false,targetPenjualan:false};
    var monthlyRowsLap=_finBuildMonthlySummary(showLap);
    var yearlyPenjualan=monthlyRowsLap.reduce(function(t,r){ return t+r.penjualan; },0);
    var yearlyCash=monthlyRowsLap.length ? monthlyRowsLap[monthlyRowsLap.length-1].cash : 0;
    var yearlyExpense=monthlyRowsLap.reduce(function(t,r){ return t+r.pengeluaran; },0);
    var yearlySaldo=monthlyRowsLap.length ? _num(monthlyRowsLap[monthlyRowsLap.length-1].saldoTahunan) : 0;
    var yearlyProfit=monthlyRowsLap.reduce(function(t,r){ return t+r.laba; },0);
    var yearlyProfitPct=yearlyPenjualan>0?(yearlyProfit/yearlyPenjualan*100):0;
    var yearlyAsset=monthlyRowsLap.length ? monthlyRowsLap[monthlyRowsLap.length-1].totalAsset : 0;
    var yearlySupplierSaldo=monthlyRowsLap.length ? monthlyRowsLap[monthlyRowsLap.length-1].hutangSupplier : ((typeof supplierHutang!=='undefined'?supplierHutang:[]).reduce(function(t,s){
      var nota=(s&&s.nota||[]).reduce(function(a,n){ return a+_num((n&&n.nilaiNetto)||0); },0);
      var bayar=(s&&s.bayar||[]).reduce(function(a,b){ return a+_num((b&&b.jumlah)||0); },0);
      return t+(nota-bayar);
    },0));
    var yearlyRecurring=monthlyRowsLap.reduce(function(t,r){ return t+_num(r.berulang); },0);
    var yearlyCashGoal=monthlyRowsLap.length ? monthlyRowsLap[monthlyRowsLap.length-1].cashGoal : 0;
    var yearlyCashProgress=monthlyRowsLap.length ? monthlyRowsLap[monthlyRowsLap.length-1].cashProgress : 0;
    var yearlyTargetPenjualan=monthlyRowsLap.reduce(function(t,r){ return t+_num(r.targetPenjualan); },0);
    var yearlyDateRange=(monthlyRowsLap.length?(monthlyRowsLap[0].dateLabel+' • '+monthlyRowsLap[monthlyRowsLap.length-1].dateLabel):'-');
    var fl='';
    fl+='<div class="card" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(240,197,106,.08),rgba(143,208,255,.04))"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#F0C56A">Ringkasan Bulanan</div><div style="font-size:12px;color:var(--tx2);margin-top:4px;max-width:920px">Halaman ini merangkum penjualan, target, cash bank manual, biaya berulang, pengeluaran, saldo, dan aktivitas marketplace per bulan dalam format yang lebih mirip board ringkasan bulanan.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="'+(_finLapbulView==='table'?'btnp':'btns')+'" onclick="_finLapbulView=\'table\';_renderFinance(\'lapbul\')" style="padding:8px 12px">Table</button><button class="'+(_finLapbulView==='gallery'?'btnp':'btns')+'" onclick="_finLapbulView=\'gallery\';_renderFinance(\'lapbul\')" style="padding:8px 12px">Galeri</button></div></div></div>';
    var lapToggleDefs=[
      ['penjualan','Penjualan'],
      ['keuntungan','Keuntungan'],
      ['persentaseKeuntungan','% Keuntungan'],
      ['pengeluaran','Pengeluaran'],
      ['totalAsset','Total Asset'],
      ['saldoHutang','Saldo Hutang'],
      ['saldoTahunan','Saldo Tahunan'],
      ['cashBank','Cash Bank'],
      ['cashGoal','Cash Goal'],
      ['cashProgress','Cash Progress'],
      ['berulang','Berulang'],
      ['date','Date'],
      ['targetPenjualan','Target Penjualan']
    ];
    fl+='<div class="card" style="margin-bottom:12px;padding:10px 12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div style="font-size:13px;font-weight:800;color:var(--tx)">Checklist Komponen</div><div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--tx2)">'+lapToggleDefs.map(function(it){ return '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" '+(showLap[it[0]]?'checked ':'')+'onchange="_finSetLapbulShow(\''+it[0]+'\',this.checked)"> '+it[1]+'</label>'; }).join('')+'</div></div></div>';
    var lapCards=[];
    if(showLap.penjualan) lapCards.push(['Penjualan Tahunan','Rp '+fmt(yearlyPenjualan),'#8FD0FF']);
    if(showLap.keuntungan) lapCards.push(['Keuntungan Tahunan','Rp '+fmt(yearlyProfit),yearlyProfit>=0?'#A7F3B6':'#FF9D9D']);
    if(showLap.persentaseKeuntungan) lapCards.push(['% Keuntungan',yearlyProfitPct.toFixed(2)+'%','#FFD68A']);
    if(showLap.pengeluaran) lapCards.push(['Pengeluaran Tahunan','Rp '+fmt(yearlyExpense),'#FFB76B']);
    if(showLap.totalAsset) lapCards.push(['Total Asset','Rp '+fmt(yearlyAsset),'#A7F3B6']);
    if(showLap.saldoHutang) lapCards.push(['Saldo Hutang','Rp '+fmt(yearlySupplierSaldo),'#FFD68A']);
    if(showLap.saldoTahunan) lapCards.push(['Saldo Tahunan','Rp '+fmt(yearlySaldo),yearlySaldo>=0?'#A7F3B6':'#FF9D9D']);
    if(showLap.cashBank) lapCards.push(['Cash Bank','Rp '+fmt(yearlyCash),'#F0C56A']);
    if(showLap.cashGoal) lapCards.push(['Cash Goal','Rp '+fmt(yearlyCashGoal),'#8FD0FF']);
    if(showLap.cashProgress) lapCards.push(['Cash Progress',(yearlyCashProgress*100).toFixed(1)+'%','#A7F3B6']);
    if(showLap.berulang) lapCards.push(['Berulang / Bulan','Rp '+fmt(yearlyRecurring),'#D796FF']);
    if(showLap.targetPenjualan) lapCards.push(['Target Penjualan','Rp '+fmt(yearlyTargetPenjualan),'#8FD0FF']);
    if(showLap.date) lapCards.push(['Rentang Data',yearlyDateRange,'#D7E1EA']);
    fl+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:12px">';
    lapCards.forEach(function(card){
      fl+='<div class="card" style="margin-bottom:0;background:var(--bg3);position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:'+card[2]+'"></div><div style="font-size:11px;font-weight:700;color:'+card[2]+';text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">'+card[0]+'</div><div style="font-size:24px;font-weight:800;color:var(--tx)">'+card[1]+'</div></div>';
    });
    fl+='</div>';
    if(_finLapbulView==='gallery'){
      fl+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">';
      monthlyRowsLap.forEach(function(r){
        fl+='<div class="card" style="margin-bottom:0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.03))"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px"><div><div style="font-size:16px;font-weight:800;color:var(--tx)">'+esc(r.name)+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">'+esc(r.dateLabel)+'</div></div><span class="chip" style="background:'+(r.closed?'rgba(51,120,73,.16)':'rgba(184,92,35,.18)')+';color:'+(r.closed?'#A7F3B6':'#FFD08A')+';border:1px solid '+(r.closed?'rgba(107,224,145,.45)':'rgba(255,182,118,.38)')+'">'+(r.closed?'Tutup Buku':'Aktif')+'</span></div>';
        var galleryStats=[];
        if(showLap.penjualan) galleryStats.push(['Penjualan','Rp '+fmt(r.penjualan),'#8FD0FF']);
        if(showLap.keuntungan) galleryStats.push(['Keuntungan','Rp '+fmt(r.laba),r.laba>=0?'#A7F3B6':'#FF9D9D']);
        if(showLap.persentaseKeuntungan) galleryStats.push(['% Keuntungan',r.persentaseKeuntungan.toFixed(2)+'%','#FFD68A']);
        if(showLap.pengeluaran) galleryStats.push(['Pengeluaran','Rp '+fmt(r.pengeluaran),'#FFB76B']);
        if(showLap.totalAsset) galleryStats.push(['Total Asset','Rp '+fmt(r.totalAsset),'#A7F3B6']);
        if(showLap.saldoHutang) galleryStats.push(['Saldo Hutang','Rp '+fmt(r.hutangSupplier),'#FFD68A']);
        if(showLap.saldoTahunan) galleryStats.push(['Saldo Tahunan','Rp '+fmt(r.saldoTahunan),r.saldoTahunan>=0?'#A7F3B6':'#FF9D9D']);
        if(showLap.cashBank) galleryStats.push(['Cash Bank','Rp '+fmt(r.cash),'#F0C56A']);
        if(showLap.cashGoal) galleryStats.push(['Cash Goal','Rp '+fmt(r.cashGoal),'#8FD0FF']);
        if(showLap.cashProgress) galleryStats.push(['Cash Progress',(r.cashProgress*100).toFixed(1)+'%','#A7F3B6']);
        if(showLap.berulang) galleryStats.push(['Berulang','Rp '+fmt(r.berulang),'#D796FF']);
        if(showLap.targetPenjualan) galleryStats.push(['Target Penjualan','Rp '+fmt(r.targetPenjualan),'#8FD0FF']);
        if(showLap.date) galleryStats.push(['Date',esc(r.dateLabel),'#D7E1EA']);
        fl+='<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px">'+galleryStats.map(function(stat){ return '<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:10px"><div style="font-size:10px;font-weight:700;color:'+stat[2]+';text-transform:uppercase">'+stat[0]+'</div><div style="font-size:18px;font-weight:800;color:var(--tx);margin-top:6px">'+stat[1]+'</div></div>'; }).join('')+'</div>';
        if(showLap.targetPenjualan) fl+='<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:var(--tx2);margin-bottom:6px"><span>Progress Target Penjualan</span><span>'+(r.progressPenjualan*100).toFixed(1)+'%</span></div><div style="height:8px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,r.progressPenjualan*100))+'%;background:linear-gradient(90deg,#8FD0FF,#F0C56A)"></div></div></div>';
        if(showLap.cashProgress) fl+='<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:var(--tx2);margin-bottom:6px"><span>Progress Cash</span><span>'+(r.cashProgress*100).toFixed(1)+'%</span></div><div style="height:8px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,r.cashProgress*100))+'%;background:linear-gradient(90deg,#A7F3B6,#8FD0FF)"></div></div></div>';
        fl+='<div style="font-size:11px;color:var(--tx2);line-height:1.7">Marketplace: <b style="color:var(--tx)">'+esc(r.marketplaces.length?r.marketplaces.join(', '):'-')+'</b></div></div>';
      });
      if(!monthlyRowsLap.length) fl+='<div class="card" style="text-align:center;color:var(--tx3);padding:24px">Belum ada data bulanan.</div>';
      fl+='</div>';
    } else {
      var colCount=1;
      fl+='<div class="card"><div style="overflow-x:auto"><table class="tbl" style="min-width:1320px"><thead><tr><th>Nama</th>';
      if(showLap.penjualan){ fl+='<th class="c">Penjualan</th>'; colCount++; }
      if(showLap.keuntungan){ fl+='<th class="c">Keuntungan</th>'; colCount++; }
      if(showLap.persentaseKeuntungan){ fl+='<th class="c">% Keuntungan</th>'; colCount++; }
      if(showLap.pengeluaran){ fl+='<th class="c">Pengeluaran</th>'; colCount++; }
      if(showLap.totalAsset){ fl+='<th class="c">Total Asset</th>'; colCount++; }
      if(showLap.saldoHutang){ fl+='<th class="c">Saldo Hutang</th>'; colCount++; }
      if(showLap.saldoTahunan){ fl+='<th class="c">Saldo Tahunan</th>'; colCount++; }
      if(showLap.cashBank){ fl+='<th class="c">Cash Bank</th>'; colCount++; }
      if(showLap.targetPenjualan){ fl+='<th class="c">Target Penjualan</th>'; colCount++; }
      if(showLap.cashGoal){ fl+='<th class="c">Cash Goal</th>'; colCount++; }
      if(showLap.cashProgress){ fl+='<th class="c">Cash Progress</th>'; colCount++; }
      if(showLap.berulang){ fl+='<th class="c">Berulang</th>'; colCount++; }
      if(showLap.date){ fl+='<th>Date</th>'; colCount++; }
      fl+='<th class="c">Tutup Buku</th><th>Transaksi Penjualan</th></tr></thead><tbody>';
      monthlyRowsLap.forEach(function(r){
        fl+='<tr><td style="font-weight:700">'+esc(r.name)+'</td>';
        if(showLap.penjualan) fl+='<td class="c">Rp '+fmt(r.penjualan)+'</td>';
        if(showLap.keuntungan) fl+='<td class="c" style="font-weight:800;color:'+(r.laba>=0?'#A7F3B6':'#FF9D9D')+'">Rp '+fmt(r.laba)+'</td>';
        if(showLap.persentaseKeuntungan) fl+='<td class="c">'+r.persentaseKeuntungan.toFixed(2)+'%</td>';
        if(showLap.pengeluaran) fl+='<td class="c">Rp '+fmt(r.pengeluaran)+'</td>';
        if(showLap.totalAsset) fl+='<td class="c">Rp '+fmt(r.totalAsset)+'</td>';
        if(showLap.saldoHutang) fl+='<td class="c">Rp '+fmt(r.hutangSupplier)+'</td>';
        if(showLap.saldoTahunan) fl+='<td class="c" style="font-weight:800;color:'+(r.saldoTahunan>=0?'#A7F3B6':'#FF9D9D')+'">Rp '+fmt(r.saldoTahunan)+'</td>';
        if(showLap.cashBank) fl+='<td class="c">Rp '+fmt(r.cash)+'</td>';
        if(showLap.targetPenjualan) fl+='<td class="c"><input class="fi" type="number" value="'+escAttr(String(r.targetPenjualan))+'" style="min-width:160px" onchange="_finSetMonthlySetting(\''+escAttr(r.key)+'\',\'targetPenjualan\',this.value)"></td>';
        if(showLap.cashGoal) fl+='<td class="c"><input class="fi" type="number" value="'+escAttr(String(r.cashGoal))+'" style="min-width:140px" onchange="_finSetMonthlySetting(\''+escAttr(r.key)+'\',\'cashGoal\',this.value)"></td>';
        if(showLap.cashProgress) fl+='<td class="c"><div style="display:flex;align-items:center;gap:8px;min-width:120px"><span style="font-weight:700">'+(r.cashProgress*100).toFixed(0)+'%</span><div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,r.cashProgress*100))+'%;background:linear-gradient(90deg,#A7F3B6,#8FD0FF)"></div></div></div></td>';
        if(showLap.berulang) fl+='<td class="c">Rp '+fmt(r.berulang)+'</td>';
        if(showLap.date) fl+='<td style="min-width:220px">'+esc(r.dateLabel)+'</td>';
        fl+='<td class="c"><input type="checkbox" '+(r.closed?'checked ':'')+'onchange="_finSetMonthlySetting(\''+escAttr(r.key)+'\',\'closed\',this.checked)"></td><td>'+esc(r.marketplaces.length?r.marketplaces.join(', '):'-')+'</td></tr>';
      });
      if(!monthlyRowsLap.length) fl+='<tr><td colspan="'+(colCount+2)+'" style="text-align:center;color:var(--tx3);padding:24px">Belum ada data bulanan.</td></tr>';
      fl+='</tbody></table></div></div>';
    }
    content.innerHTML=fl;
  }
}
function _finAddIncome(){
  var g=function(id){return _num((document.getElementById(id)||{}).value);};
  var gt=function(id){return (((document.getElementById(id)||{}).value)||'').trim();};
  var rec={
    id:'fininc_'+Date.now(),
    tanggal:gt('FIN-IN-DATE')||_todayYMD(),
    periodeDari:gt('FIN-IN-DATE')||_todayYMD(),
    periodeSampai:gt('FIN-IN-DATE')||_todayYMD(),
    inputMethod:'manual',
    marketplace:gt('FIN-IN-MARKET'),
    sumber:gt('FIN-IN-MARKET'),
    toko:gt('FIN-IN-TOKO'),
    penandaan:gt('FIN-IN-TAG'),
    catatan:gt('FIN-IN-NOTE'),
    danaPenjualanProduk:g('FIN-IN-DANA'),
    subsidiMarketplace:g('FIN-IN-SUBSIDI'),
    modalProduk:g('FIN-IN-MODAL'),
    biayaAdministrasi:g('FIN-IN-ADM'),
    biayaTransaksiPenjual:g('FIN-IN-TRX'),
    biayaLayanan:g('FIN-IN-LAY'),
    ongkosKirimDibayarPenjual:g('FIN-IN-ONGKIR'),
    biayaPromosi:g('FIN-IN-PROMO'),
    pengembalianDana:g('FIN-IN-RETUR'),
    biayaPenyesuaianToko:g('FIN-IN-ADJ'),
    biayaMarketplaceLainnya:g('FIN-IN-MKTLAIN'),
    bahanPengemasan:g('FIN-IN-PACK'),
    iklan:g('FIN-IN-IKLAN'),
    sewa:g('FIN-IN-SEWA'),
    lainnya:g('FIN-IN-LAIN'),
    ts:new Date().toISOString()
  };
  if(!rec.marketplace){toast('Marketplace wajib diisi','error');return;}
  if(!rec.toko){toast('Nama toko wajib diisi','error');return;}
  var calc=_finIncomeMetrics(rec);
  rec.nominal=calc.pemasukanToko;
  rec.pemasukanToko=calc.pemasukanToko;
  rec.keuntunganKerugian=calc.keuntunganKerugian;
  rec.persentaseKeuntungan=calc.persentaseKeuntungan;
  _finIncome.push(rec); _saveFin(); _closeFinIncomeModal(); toast('Laporan pendapatan marketplace disimpan','success'); _renderFinance('income');
}
function _finAddExpense(){
  var d=document.getElementById('FIN-EX-DATE'), s=document.getElementById('FIN-EX-CAT'), n=document.getElementById('FIN-EX-NOM'), c=document.getElementById('FIN-EX-NOTE'), nm=document.getElementById('FIN-EX-NAME');
  if(!d||!s||!n||!nm) return;
  var rec={id:'exp_'+Date.now(), tanggal:d.value||_todayYMD(), namaPengeluaran:(nm.value||'').trim(), kategori:(s.value||'').trim(), nominal:_num(n.value), catatan:(c&&c.value||'').trim(), sourceType:'manual', ts:new Date().toISOString()};
  if(!rec.namaPengeluaran){toast('Nama pengeluaran wajib diisi','error');return;}
  if(!rec.kategori){toast('Kategori wajib diisi','error');return;}
  if(!rec.nominal){toast('Nominal wajib diisi','error');return;}
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
function _navTo(tabId){
  if(tabId==='agent' || tabId==='automation') window._aiSub=tabId;
  _activeTab=tabId; buildTabBar();
  _resetPanelState();
  ['hr','finance','tools','ai','log','development'].forEach(function(id){
    if(!document.getElementById('V-'+id)){ var d=document.createElement('div'); d.id='V-'+id; d.style.display='none'; var b=document.querySelector('.body'); if(b)b.appendChild(d); }
  });
  if(tabId==='agent' || tabId==='automation') tabId='ai';
  var all=['dash','hr','finance','analytics','ai','tools','development','eval','payroll','stats','emp','hist','admin','supplier','taligf','kpi','laporan','log'].concat(customTabs.map(function(ct){return 'ct_'+ct.id;}));
  all.forEach(function(id){ var v=document.getElementById('V-'+id); if(v) v.style.display=(id===tabId)?'block':'none'; });
  try{
    if(tabId==='dash')renderDash();
    else if(tabId==='hr')_renderHR('dash');
    else if(tabId==='finance')_renderFinance('dash');
    else if(tabId==='analytics' && typeof _renderAnalytics==='function') _renderAnalytics(_analyticsSub||'dash');
    else if(tabId==='ai' && typeof _renderAI==='function') _renderAI(_aiSub||'agent');
    else if(tabId==='tools')_renderTools(_toolsSub||'dash');
    else if(tabId==='development')_renderDevelopment(_devSub||'resources');
    else if(tabId==='eval')renderEvalForm();
    else if(tabId==='payroll')renderPayrollForm();
    else if(tabId==='stats')renderStats();
    else if(tabId==='emp')renderEmp();
    else if(tabId==='hist')renderHist();
    else if(tabId==='log')_renderLog();
    else if(tabId==='admin')renderAdmin();
    else if(tabId==='supplier')renderSupplier();
    else if(tabId==='kpi'){loadKPI();renderKPI();}
    else if(tabId==='taligf'){ _activeTab='tools'; buildTabBar(); _renderTools('rumus'); }
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

/* Tactical theme overhaul */
(function(){
  var palette={
    bg:'#000000',
    bar:'#111111',
    tabbar:'#1a1a1a',
    panel:'#1e1e1e',
    panel2:'#2a2a2a',
    panel3:'#101010',
    border:'#444444',
    border2:'#555555',
    text:'#f0f0f0',
    muted:'#cccccc',
    dim:'#888888',
    accent:'#FFA500',
    accent2:'#FFC966',
    danger:'#502222',
    danger2:'#773333'
  };
  var secPalette=[
    {hbg:'#2a2a2a',lbg:'#1e1e1e',fg:'#FFA500'},
    {hbg:'#2a2a2a',lbg:'#1e1e1e',fg:'#FFC966'},
    {hbg:'#2a2a2a',lbg:'#1e1e1e',fg:'#FFA500'},
    {hbg:'#2a2a2a',lbg:'#1e1e1e',fg:'#FFC966'},
    {hbg:'#2a2a2a',lbg:'#1e1e1e',fg:'#FFA500'}
  ];
  SECS.forEach(function(sec,idx){
    var p=secPalette[idx%secPalette.length];
    sec.hbg=p.hbg;
    sec.lbg=p.lbg;
    sec.fg=p.fg;
  });
  SC=[
    {v:1,label:'Perlu Perbaikan',bg:'#251515',fg:'#ffb0b0',abg:'#773333'},
    {v:2,label:'Cukup',bg:'#2c2414',fg:'#FFC966',abg:'#6b5420'},
    {v:3,label:'Baik',bg:'#222222',fg:'#dddddd',abg:'#666666'},
    {v:4,label:'Sangat Baik',bg:'#2a2110',fg:'#FFA500',abg:'#FFA500'}
  ];
  gc=function(s){
    if(s>=3.5)return{bg:'#2a2110',fg:'#FFA500',dbg:'#FFA500'};
    if(s>=3)return{bg:'#222222',fg:'#dddddd',dbg:'#666666'};
    if(s>=2)return{bg:'#2c2414',fg:'#FFC966',dbg:'#6b5420'};
    return{bg:'#251515',fg:'#ffb0b0',dbg:'#773333'};
  };
  toast=function(msg,type,dur){
    var t=document.getElementById('TOAST');
    var cols={info:palette.panel2,success:'#1f2a1f',error:palette.danger,warn:'#3a2d12'};
    t.style.background=cols[type]||palette.panel2;
    t.style.color=palette.text;
    t.style.border='1px solid '+(type==='error'?palette.danger2:palette.border2);
    t.textContent=msg;
    t.classList.add('show');
    setTimeout(function(){t.classList.remove('show')},dur||3000);
  };
  applyTheme=function(){
    var c=getCfg();
    if(!c.theme){
      c.theme='dark';
      saveCfg(c);
    }
    document.documentElement.setAttribute('data-theme',c.theme||'dark');
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',palette.bg);
  };
  applyFontMode=function(){
    var c=getCfg();
    document.documentElement.setAttribute('data-font-mode',(c.fontMode||'theme'));
  };
  updateBadge=function(){
    var c=getCfg();
    var el=document.getElementById('BADGE');
    if(!el)return;
    el.innerHTML='<span class="ops-badge-k">ACTIVE USER</span><span class="ops-badge-v">'+esc(c.adminName||'Hokky')+'</span>';
  };
  function ensureStructure(){
    var body=document.body;
    var topbar=document.querySelector('.topbar');
    var tabs=document.querySelector('.tabs');
    if(body&&topbar&&tabs&&body.firstElementChild!==tabs){
      body.insertBefore(tabs,topbar);
    }
  }
  function ensureStyle(){
    if(document.getElementById('AJW-MAINFN-STYLE'))return;
    var st=document.createElement('style');
    st.id='AJW-MAINFN-STYLE';
    st.textContent=`
:root{
  --bg:${palette.bg};
  --bg2:${palette.panel};
  --bg3:${palette.panel2};
  --bg4:${palette.panel3};
  --bd:${palette.border};
  --bd2:${palette.border2};
  --tx:${palette.text};
  --tx2:${palette.muted};
  --tx3:${palette.dim};
  --navy:${palette.bar};
  --blue:${palette.accent};
  --teal:${palette.accent2};
  --green:${palette.accent2};
  --red:${palette.danger2};
  --orange:${palette.accent};
  --purple:${palette.panel2};
  --amber:${palette.accent};
  --gold:${palette.accent};
  --r:5px;
  --rs:4px;
  --sh:0 4px 12px rgba(0,0,0,.5);
}
[data-theme=dark]{
  --bg:${palette.bg};
  --bg2:${palette.panel};
  --bg3:${palette.panel2};
  --bg4:${palette.panel3};
  --bd:${palette.border};
  --bd2:${palette.border2};
  --tx:${palette.text};
  --tx2:${palette.muted};
  --tx3:${palette.dim};
}
html,body{
  min-height:100%;
  margin:0;
  padding:0;
  font-family:"Inter","Poppins","Segoe UI",Arial,sans-serif;
  background:${palette.bg};
  color:var(--tx);
  overflow:hidden;
  font-size:14px;
  line-height:1.5;
}
[data-font-mode="default"] body,
[data-font-mode="default"] .tab,
[data-font-mode="default"] .btnp,
[data-font-mode="default"] .btns,
[data-font-mode="default"] .btna,
[data-font-mode="default"] .btnsm,
[data-font-mode="default"] .kbtn,
[data-font-mode="default"] input,
[data-font-mode="default"] select,
[data-font-mode="default"] textarea,
[data-font-mode="default"] label,
[data-font-mode="default"] table,
[data-font-mode="default"] .shdr{
  font-family:"Inter","Poppins","Segoe UI",Arial,sans-serif!important;
}
[data-font-mode="theme"] body,
[data-font-mode="theme"] .tab,
[data-font-mode="theme"] .btnp,
[data-font-mode="theme"] .btns,
[data-font-mode="theme"] .btna,
[data-font-mode="theme"] .btnsm,
[data-font-mode="theme"] .kbtn,
[data-font-mode="theme"] input,
[data-font-mode="theme"] select,
[data-font-mode="theme"] textarea,
[data-font-mode="theme"] label,
[data-font-mode="theme"] table,
[data-font-mode="theme"] .shdr{
  font-family:"Inter","Poppins","Segoe UI",Arial,sans-serif!important;
}
body::before{
  content:none!important;
}
a{color:${palette.accent}}
.tabs{
  background:${palette.tabbar}!important;
  padding:5px 10px!important;
  display:flex!important;
  align-items:center!important;
  border-bottom:1px solid #2a2a2a!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  position:sticky!important;
  top:0!important;
  z-index:1001!important;
  gap:0!important;
  box-shadow:none!important;
}
#TABS{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  flex-wrap:wrap!important;
  gap:8px!important;
  width:100%!important;
  margin:0 auto!important;
  flex-shrink:0!important;
}
.tabs::-webkit-scrollbar{height:8px}
.tabs::-webkit-scrollbar-thumb{background-color:rgba(255,255,255,0.1);border-radius:4px}
.topbar{
  background:${palette.bar}!important;
  padding:8px 15px!important;
  display:flex!important;
  justify-content:space-between!important;
  align-items:center!important;
  border-bottom:1px solid #2a2a2a!important;
  flex-shrink:0!important;
  min-height:46px!important;
  position:sticky!important;
  top:42px!important;
  z-index:1000!important;
  box-shadow:none!important;
}
.topbar > div:first-child > div:last-child{
  display:flex;
  flex-direction:column;
  gap:2px;
}
#STITLE{
  font-size:14px!important;
  letter-spacing:.03em;
  text-transform:uppercase;
  color:${palette.text}!important;
  font-weight:700!important;
}
#BADGE{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:2px;
  text-align:right;
}
.ops-badge-k{
  font-size:10px;
  color:var(--tx3);
  letter-spacing:0;
}
.ops-badge-v{
  font-size:11px;
  color:${palette.accent2};
  font-weight:700;
}
.tab{
  background:#2c2c2c!important;
  color:#ccc!important;
  padding:7px 12px!important;
  margin-right:5px!important;
  border-radius:4px 4px 0 0!important;
  border:1px solid #333!important;
  border-bottom:none!important;
  cursor:pointer!important;
  font-size:12px!important;
  font-weight:600!important;
  white-space:nowrap!important;
  position:relative!important;
  min-height:auto!important;
  text-transform:none!important;
  letter-spacing:0!important;
}
.tab.on:hover{
  background:#383838!important;
  color:#fff!important;
  border-color:#333!important;
}
.tab.act{
  background:${palette.bar}!important;
  color:${palette.accent}!important;
  border-color:#2a2a2a!important;
}
.tab.act::after{
  content:"";
  position:absolute;
  bottom:-1px;
  left:0;
  right:0;
  height:1px;
  background:${palette.bar};
}
.body{
  max-width:none!important;
  padding:16px 18px 24px!important;
  margin:0!important;
  height:calc(100vh - 88px)!important;
  overflow:auto!important;
  background:${palette.bg}!important;
}
.body > div[id^="V-"]{width:100%;}
#V-admin,#V-taligf,#V-tools,#V-hr,#V-finance{
  width:min(100%,1360px);
  margin:0 auto;
}
#V-eval,#V-payroll{
  width:min(100%,1480px);
  margin:0 auto;
}
.form-stage{
  width:min(100%,1420px);
  margin:0 auto;
}
.form-split{
  grid-template-columns:minmax(0,1fr) minmax(360px,420px)!important;
  align-items:start;
}
#HR-SHELL,#FIN-SHELL{
  width:min(100%,1320px);
  margin:0 auto 12px;
}
#HR-CONTENT,#FIN-CONTENT{
  width:min(100%,1540px);
  margin:0 auto;
}
.card p,.card li,.card td,.card .itxt,.card .bk-row label{
  font-size:13px!important;
}
.card,.dash-card,.swrap,.preview-panel,#PREV-WRAP,#HR-SHELL .card,#FIN-SHELL .card{
  background:${palette.panel}!important;
  border:1px solid ${palette.border}!important;
  box-shadow:var(--sh)!important;
  border-radius:8px!important;
}
.card{
  padding:12px 14px!important;
  margin-bottom:12px!important;
}
.card,.dash-card{
  position:relative;
  overflow:hidden;
}
.card::before,.dash-card::before,.swrap::before{
  display:none!important;
}
.dash-card{
  border-left:1px solid ${palette.border}!important;
  padding:12px 14px!important;
  transform:none!important;
}
.dash-card:hover{
  border-color:${palette.border2}!important;
}
.shdr{
  background:${palette.panel2}!important;
  border-bottom:1px solid ${palette.border}!important;
  padding:10px 12px!important;
  font-size:15px!important;
  font-weight:600!important;
  color:var(--tx)!important;
}
.sbdy,.legbar{
  background:${palette.panel}!important;
  border-color:${palette.border}!important;
}
.irow:nth-child(odd),.irow:nth-child(even){
  background:${palette.panel}!important;
}
.irow{
  border-bottom:1px solid ${palette.border}!important;
  padding:8px 10px!important;
}
label.lbl,.tbl th,.kbtn,.btnp,.btns,.btna,.btnsm,.tab,.shdr,.ops-badge-k{
  font-family:"Inter","Poppins","Segoe UI",Arial,sans-serif;
}
label.lbl{
  color:${palette.dim}!important;
  font-size:11px!important;
  font-weight:600!important;
  text-transform:none!important;
  letter-spacing:0!important;
  margin-bottom:4px!important;
}
input.fi,select.fi,textarea.fi,.atinp{
  background:${palette.panel}!important;
  border:1px solid ${palette.border}!important;
  color:var(--tx)!important;
  border-radius:4px!important;
  min-height:28px!important;
  font-family:"Inter","Poppins","Segoe UI",Arial,sans-serif!important;
  box-shadow:none!important;
  padding:8px 10px!important;
  font-size:13px!important;
}
input.fi:focus,select.fi:focus,textarea.fi:focus,.atinp:focus{
  border-color:${palette.accent}!important;
  box-shadow:none!important;
}
.btnp,.btns,.btna,.btnsm,.kbtn,.pbtn{
  height:32px!important;
  min-height:32px!important;
  border-radius:8px!important;
  font-size:12px!important;
  font-weight:600!important;
  text-transform:none!important;
  letter-spacing:0!important;
  padding:6px 12px!important;
}
.btnp{
  background:${palette.tabbar}!important;
  color:${palette.accent}!important;
  border:1px solid ${palette.accent}!important;
}
.btnp:hover,.btna:hover,.btnsm:hover{
  background:${palette.panel2}!important;
  border-color:${palette.accent2}!important;
  color:${palette.accent2}!important;
  filter:none!important;
}
.btns,.kbtn,.pbtn{
  background:#333!important;
  color:#ccc!important;
  border:1px solid ${palette.border2}!important;
}
.btna,.btnsm{
  background:${palette.tabbar}!important;
  color:${palette.accent}!important;
  border:1px solid ${palette.accent}!important;
}
.tbl{
  border-collapse:separate!important;
  border-spacing:0;
}
.tbl th,table th{
  background:${palette.panel2}!important;
  color:${palette.muted}!important;
  border:1px solid ${palette.border}!important;
  padding:9px 10px!important;
  letter-spacing:0!important;
  text-transform:none!important;
  font-size:13px!important;
  font-weight:700!important;
}
.tbl td,table td{
  background:${palette.panel3}!important;
  border:1px solid ${palette.border}!important;
  color:var(--tx)!important;
  padding:8px 10px!important;
  font-size:13px!important;
}
.tbl tr:nth-child(even) td,.tbl tr:nth-child(odd) td,table tr td{
  background:${palette.panel3}!important;
}
.tbl tr:hover td,table tr:hover td{
  background:#181818!important;
}
.chip{
  border:1px solid ${palette.border2}!important;
  border-radius:999px!important;
}
.pbar{
  background:#111!important;
  border:1px solid ${palette.border}!important;
  height:8px!important;
}
.pfill{
  background:${palette.accent}!important;
}
.toast{
  border-radius:5px!important;
}
#EVAL-PREV,#PAY-PREV,#PAY-RPT,#EVAL-RPT{
  background:${palette.panel3}!important;
  color:var(--tx)!important;
  border:1px solid ${palette.border}!important;
}
#EVAL-RPT,#PAY-RPT{
  color:var(--tx)!important;
}
#EVAL-RPT [style*="background:#fff"],#EVAL-RPT [style*="background: #fff"],#PAY-RPT [style*="background:#fff"],#PAY-RPT [style*="background: #fff"]{
  background:#101214!important;
  color:var(--tx)!important;
}
#EVAL-RPT [style*="background:#EEF4FF"],#EVAL-RPT [style*="background: #EEF4FF"],#PAY-RPT [style*="background:#EEF4FF"],#PAY-RPT [style*="background: #EEF4FF"],
#EVAL-RPT [style*="background:#F0F5FC"],#EVAL-RPT [style*="background: #F0F5FC"],#EVAL-RPT [style*="background:#F4F8FD"],#EVAL-RPT [style*="background: #F4F8FD"],
#EVAL-RPT [style*="background:#EEF8EE"],#EVAL-RPT [style*="background: #EEF8EE"],#EVAL-RPT [style*="background:#F0F4F8"],#EVAL-RPT [style*="background: #F0F4F8"],
#PAY-RPT [style*="background:#FFFDE7"],#PAY-RPT [style*="background: #FFFDE7"],#PAY-RPT [style*="background:#FFF3E0"],#PAY-RPT [style*="background: #FFF3E0"]{
  background:#16191d!important;
  color:var(--tx)!important;
}
#EVAL-RPT [style*="border:1px solid #C8D8EA"],#EVAL-RPT [style*="border: 1px solid #C8D8EA"],#EVAL-RPT [style*="border:2px solid #0D2E5A"],#EVAL-RPT [style*="border: 2px solid #0D2E5A"],
#PAY-RPT [style*="border:1px solid #E2E8F0"],#PAY-RPT [style*="border: 1px solid #E2E8F0"],#PAY-RPT [style*="border:1px solid #333"],#PAY-RPT [style*="border: 1px solid #333"]{
  border-color:var(--bd)!important;
}
#EVAL-RPT [style*="color:#0D2E5A"],#EVAL-RPT [style*="color: #0D2E5A"],#EVAL-RPT [style*="color:#546E7A"],#EVAL-RPT [style*="color: #546E7A"],
#PAY-RPT [style*="color:#0D2E5A"],#PAY-RPT [style*="color: #0D2E5A"],#PAY-RPT [style*="color:#546E7A"],#PAY-RPT [style*="color: #546E7A"]{
  color:var(--tx)!important;
}
#EVAL-RPT [style*="color:#90CAF9"],#EVAL-RPT [style*="color: #90CAF9"],#PAY-RPT [style*="color:#90CAF9"],#PAY-RPT [style*="color: #90CAF9"]{
  color:var(--tx2)!important;
}
#EVAL-RPT table,#PAY-RPT table{
  width:100%!important;
}
#EVAL-RPT td,#EVAL-RPT th,#PAY-RPT td,#PAY-RPT th{
  font-size:12px!important;
  line-height:1.45!important;
}
#PWA-INSTALL-BTN{
  display:none!important;
  visibility:hidden!important;
  pointer-events:none!important;
  background:${palette.tabbar}!important;
  color:${palette.text}!important;
  border:1px solid ${palette.accent}!important;
  border-radius:4px!important;
  box-shadow:none!important;
}
img#LG{
  border-color:${palette.accent}!important;
  background:#06080c!important;
}
[style*="background:linear-gradient(135deg,#0D2E5A 0%,#1565C0 100%)"]{
  background:${palette.panel}!important;
  border:1px solid ${palette.border}!important;
}
[style*="background:#0D2E5A"],[style*="background: #0D2E5A"],[style*="background:#1565C0"],[style*="background: #1565C0"],[style*="background:#00838F"],[style*="background: #00838F"],[style*="background:#6A1B9A"],[style*="background: #6A1B9A"],[style*="background:#2E7D32"],[style*="background: #2E7D32"],[style*="background:#546E7A"],[style*="background: #546E7A"],[style*="background:#E65100"],[style*="background: #E65100"]{
  background:${palette.panel2}!important;
}
[style*="background:#C62828"],[style*="background: #C62828"]{background:${palette.danger}!important;}
[style*="background:#DBEAFE"],[style*="background: #DBEAFE"],[style*="background:#E8F5E9"],[style*="background: #E8F5E9"],[style*="background:#FFFDE7"],[style*="background: #FFFDE7"],[style*="background:#FFEBEE"],[style*="background: #FFEBEE"],[style*="background:#E0F7FA"],[style*="background: #E0F7FA"],[style*="background:#F3E5F5"],[style*="background: #F3E5F5"],[style*="background:#FFF3E0"],[style*="background: #FFF3E0"]{
  background:#181818!important;
}
[style*="background:#EFF6FF"],[style*="background: #EFF6FF"],[style*="background:#E3F2FD"],[style*="background: #E3F2FD"],[style*="background:#E8F0FE"],[style*="background: #E8F0FE"],[style*="background:#F0FDF4"],[style*="background: #F0FDF4"],[style*="background:#FEF2F2"],[style*="background: #FEF2F2"]{
  background:#141414!important;
  border:1px solid var(--bd)!important;
  color:var(--tx2)!important;
}
[style*="color:var(--navy)"],[style*="color: var(--navy)"]{color:var(--tx)!important;}
[style*="color:#1565C0"],[style*="color: #1565C0"],[style*="color:#00838F"],[style*="color: #00838F"],[style*="color:#6A1B9A"],[style*="color: #6A1B9A"],[style*="color:#2E7D32"],[style*="color: #2E7D32"],[style*="color:#90CAF9"],[style*="color: #90CAF9"]{
  color:${palette.accent2}!important;
}
[style*="color:#E65100"],[style*="color: #E65100"],[style*="color:#FFD700"],[style*="color: #FFD700"],[style*="color:#C8A400"],[style*="color: #C8A400"]{
  color:${palette.accent}!important;
}
[style*="color:#C62828"],[style*="color: #C62828"]{color:#ffb0b0!important;}
[style*="border-color:#1565C0"],[style*="border-color: #1565C0"],[style*="border-color:#00838F"],[style*="border-color: #00838F"]{border-color:${palette.accent}!important;}
[style*="border-color:#C62828"],[style*="border-color: #C62828"]{border-color:${palette.danger2}!important;}
[style*="border:2px solid #C8A400"],[style*="border: 2px solid #C8A400"],[style*="border:3px solid #C8A400"],[style*="border: 3px solid #C8A400"]{
  border-color:${palette.accent}!important;
}
.preview-panel,#PREV-WRAP{
  background:${palette.panel}!important;
  border:1px solid ${palette.border}!important;
  padding:12px!important;
  top:12px!important;
}
.g2,.g3,.g4,.split,.dash-grid{
  gap:12px!important;
}
.section-gap{
  margin-top:20px!important;
}
.chip,.tag,.badge,.status-pill{
  border-radius:999px!important;
  font-size:11px!important;
  padding:4px 8px!important;
  line-height:1.2!important;
}
.amt,.money,.metric-value,.big-num,.num{
  font-size:clamp(22px,2.2vw,34px)!important;
  font-weight:700!important;
  letter-spacing:-.02em!important;
}
.metric-label,.muted,.subtle,.help-text{
  font-size:11px!important;
  color:var(--tx2)!important;
}
.title-row,.module-title,.section-title{
  display:flex!important;
  align-items:center!important;
  gap:8px!important;
}
.title-row .help,.module-title .help,.section-title .help{
  width:18px!important;
  height:18px!important;
  border-radius:999px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  font-size:11px!important;
  border:1px solid var(--bd2)!important;
  color:var(--tx2)!important;
}
#V-supplier .card,
#V-supplier .dash-card,
#V-finance .card,
#V-finance .dash-card{
  border-radius:8px!important;
}
#V-supplier .chip,#V-supplier .status-pill,#V-finance .chip{
  font-size:11px!important;
  padding:4px 8px!important;
}
#V-supplier .tbl th,#V-finance .tbl th{
  font-size:13px!important;
}
#V-supplier .tbl td,#V-finance .tbl td{
  font-size:13px!important;
}
.fin-compact .card,.sup-compact .card{
  padding:12px 14px!important;
  margin-bottom:12px!important;
  border-radius:8px!important;
}
.fin-compact .chip,.sup-compact .chip{
  padding:4px 8px!important;
  font-size:11px!important;
}
.fin-compact .btnp,.fin-compact .btns,.fin-compact .btna,.fin-compact .btnsm,
.sup-compact .btnp,.sup-compact .btns,.sup-compact .btna,.sup-compact .btnsm{
  padding:6px 12px!important;
  font-size:12px!important;
}
.fin-compact .tbl th,.sup-compact .tbl th{
  padding:8px 10px!important;
  font-size:13px!important;
}
.fin-compact .tbl td,.sup-compact .tbl td{
  padding:8px 10px!important;
  font-size:13px!important;
}
.fin-compact input.fi,.fin-compact select.fi,.fin-compact textarea.fi,
.sup-compact input.fi,.sup-compact select.fi,.sup-compact textarea.fi{
  padding:8px 10px!important;
  font-size:13px!important;
}
.fin-compact label.lbl,.sup-compact label.lbl{
  font-size:11px!important;
  margin-bottom:4px!important;
}
.fin-compact [style*="font-size:18px"],.sup-compact [style*="font-size:18px"]{font-size:18px!important}
.fin-compact [style*="font-size:24px"],.sup-compact [style*="font-size:24px"]{font-size:24px!important}
.fin-compact [style*="font-size:22px"],.sup-compact [style*="font-size:22px"]{font-size:22px!important}
.fin-compact [style*="font-size:16px"],.sup-compact [style*="font-size:16px"]{font-size:15px!important}
.fin-compact [style*="font-size:14px"],.sup-compact [style*="font-size:14px"]{font-size:14px!important}
.fin-compact [style*="font-size:13px"],.sup-compact [style*="font-size:13px"]{font-size:13px!important}
.fin-compact [style*="font-size:12px"],.sup-compact [style*="font-size:12px"]{font-size:12px!important}
.fin-compact [style*="padding:14px"],.sup-compact [style*="padding:14px"]{padding:12px!important}
.fin-compact [style*="padding:12px"],.sup-compact [style*="padding:12px"]{padding:10px!important}
.fin-compact [style*="padding:10px"],.sup-compact [style*="padding:10px"]{padding:8px!important}
.dash-grid > .card,.g2 > .card,.g3 > .card,.g4 > .card{
  min-width:0!important;
}
@media (max-width:980px){
  .tabs{
    top:0!important;
  }
  .topbar{
    position:sticky!important;
    top:42px!important;
  }
  .body{
    height:auto!important;
    min-height:calc(100vh - 88px)!important;
  }
  .form-stage,.form-split,#V-eval,#V-payroll{
    width:100%!important;
  }
  .form-split{
    grid-template-columns:1fr!important;
  }
  #V-admin,#V-taligf,#V-tools,#V-hr,#V-finance,#HR-SHELL,#FIN-SHELL,#HR-CONTENT,#FIN-CONTENT{
    width:100%!important;
  }
}
@media print{
  body::before,.tabs,.topbar,#PWA-INSTALL-BTN{display:none!important;}
  .body{padding:0!important;margin:0!important;}
}
`;
    st.textContent += `
.topbar{display:none!important;}
.tabs{
  display:flex!important;
  align-items:center!important;
  gap:8px!important;
  padding:7px 12px!important;
  min-height:44px!important;
}
.body{
  padding-top:8px!important;
}
.tab-brand{
  display:inline-flex!important;
  align-items:center!important;
  align-self:center!important;
  padding:6px 10px!important;
  background:#090909!important;
  border:1px solid var(--bd)!important;
  border-radius:4px!important;
  color:rgba(255,255,255,.58)!important;
  font-size:11px!important;
  font-weight:700!important;
  letter-spacing:.08em!important;
  text-transform:uppercase!important;
  white-space:nowrap!important;
  line-height:1!important;
  margin-right:4px!important;
}
@media (max-width:900px){
  .tab-brand{
    font-size:10px!important;
    padding:5px 8px!important;
  }
}
`;
    document.head.appendChild(st);
  }
  function decorateChrome(){
    ensureStructure();
    ensureStyle();
    applyTheme();
    applyFontMode();
    updateBadge();
    var title=document.getElementById('STITLE');
    if(title)title.textContent='AJW MAIN FUNCTION';
    var topbar=document.querySelector('.topbar');
    if(topbar) topbar.style.display='none';
    var sub=title&&title.parentElement?title.parentElement.querySelector('div:nth-child(2)'):null;
    if(sub)sub.textContent='Persistent tabs // layout terminal // Anton Jaya Wijaya';
    document.title='AJW Main Function';
  }
  function scheduleDecor(){
    if(window.requestAnimationFrame)window.requestAnimationFrame(decorateChrome);
    else setTimeout(decorateChrome,0);
  }
  ['renderDash','renderEvalForm','renderPayrollForm','renderStats','renderHist','renderEmp','renderAdmin','renderKPI','renderSupplier','renderTaliGF','renderFinansial','renderOperasional','renderAIChat','showEvalReport','showPaySlip','_renderHR','_renderFinance','_renderLog','_renderTools'].forEach(function(name){
    var fn=window[name];
    if(typeof fn!=='function'||fn._opsWrapped)return;
    var orig=fn;
    window[name]=function(){
      var out=orig.apply(this,arguments);
      scheduleDecor();
      return out;
    };
    window[name]._opsWrapped=true;
  });
  var oldNav=_navTo;
  _navTo=function(tabId){
    var out=oldNav.apply(this,arguments);
    scheduleDecor();
    return out;
  };
  window._applyOpsTheme=scheduleDecor;
  scheduleDecor();
  setTimeout(function(){
    try{
      if(typeof buildTabBar==='function') buildTabBar();
      var tab=window._activeTab||'dash';
      if(tab==='tools' && typeof _renderTools==='function') _renderTools(window._toolsSub||'rumus');
      else if(typeof _navTo==='function') _navTo(tab);
    }catch(e){ console.error('final ui refresh error',e); }
  },80);
})();

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
  applyTheme();
  if(typeof applyFontMode==='function')applyFontMode();
  updateBadge();
  if(typeof _applyOpsTheme==='function')_applyOpsTheme();
  buildTabBar();
  _navTo('dash');
})();
</script>
<script src="development_override_v2.js?v=20260421.3"></script>
<script src="analytics_override_v1.js?v=20260422.1"></script>
<script src="shopee_chat_override.js?v=20260421.4"></script>
<script src="browser_consistency_patch.js?v=20260421.3"></script>
<script>
(function(){
  function ensureRuntimeParityWarning(){
    var missing=[];
    if(typeof window._renderDevelopment!=='function') missing.push('development_override_v2.js');
    if(typeof window._renderAnalytics!=='function') missing.push('analytics_override_v1.js');
    if(typeof window._renderChat!=='function') missing.push('shopee_chat_override.js');
    if(!window.__AJW_CROSS_BROWSER_PATCH__) missing.push('browser_consistency_patch.js');
    if(!missing.length) return;

    var msg='Runtime AJW tidak lengkap. File belum termuat: '+missing.join(', ')+' . Hard refresh (Ctrl+F5) dan pastikan semua file ikut ter-upload ke Netlify.';
    try{
      if(typeof window.toast==='function') window.toast(msg,'error',9000);
      console.error(msg);
    }catch(e){}

    var id='AJW-RUNTIME-WARN';
    if(document.getElementById(id)) return;
    var box=document.createElement('div');
    box.id=id;
    box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#5f1d1d;color:#fff;border:1px solid #ffb4b4;border-radius:8px;padding:10px 12px;font:12px Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35)';
    box.textContent=msg;
    document.body.appendChild(box);
  }
  setTimeout(ensureRuntimeParityWarning,800);
})();
</script>
<script src="perf-patch.js?v=20260421.2"></script>
<script src="cs-auto.js?v=20260422.1"></script>
</body>
</html>


