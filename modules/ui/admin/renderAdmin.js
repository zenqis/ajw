function renderAdmin(){
  var cfg=getCfg();
  var subs=[['general','Umum & Tema'],['integrations','Integrasi & API'],['templates','Template Caption'],['tabs','Manajemen Tab'],['aios','AI Core & Safety'],['data','Data & Backup']];
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
    var coreDefs=[{id:'dash',def:'\uD83C\uDFE0 Dashboard'},{id:'eval',def:'\uD83D\uDCCB Penilaian'},{id:'payroll',def:'\uD83D\uDCB0 Payroll'},{id:'stats',def:'\uD83D\uDCCA Statistik'},{id:'emp',def:'\uD83D\uDC65 Karyawan'},{id:'hist',def:'\uD83D\uDCDC Riwayat'},{id:'kpi',def:'\uD83D\uDCCA KPI Bisnis'},{id:'ai',def:'\uD83E\uDD16 AI'},{id:'aichat',def:'\uD83E\uDD16 AI Chat'},{id:'admin',def:'\u2699\uFE0F Admin'}];
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

  if(adminSub==='aios'){
    h+=_renderAdminAIOS(cfg);
  }

  if(adminSub==='aios'){
    h+=_renderAdminAIOS(cfg);
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
