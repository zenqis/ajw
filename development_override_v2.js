(function(){
  function devEnsure(){
    window._devHub = window._devHub || (typeof _devDefaultData === 'function' ? _devDefaultData() : {});
    ['resources','vision','learning','ideas','documents','objectives','tasks','findings','audits','marketing'].forEach(function(key){
      if(!Array.isArray(_devHub[key])) _devHub[key] = [];
    });
    _devHub.swot = _devHub.swot || {strength:[], weakness:[], opportunity:[], threat:[]};
    ['strength','weakness','opportunity','threat'].forEach(function(key){
      if(!Array.isArray(_devHub.swot[key])) _devHub.swot[key] = [];
    });
    _devHub.brand = _devHub.brand || {palette:[], logos:[], inspiration:[], fonts:[]};
    ['palette','logos','inspiration','fonts'].forEach(function(key){
      if(!Array.isArray(_devHub.brand[key])) _devHub.brand[key] = [];
    });
  }

  function devSave(){
    if(typeof _saveDevHub === 'function') _saveDevHub();
    if(typeof _queueCloudPersist === 'function') _queueCloudPersist('development');
  }

  function devText(value){ return esc(value == null ? '' : String(value)); }
  function devAttr(value){ return escAttr(value == null ? '' : String(value)); }
  function devId(prefix){ return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7); }
  function devModalDefaults(){ return {open:false, section:'resources', extra:'', mode:'add', index:-1, fileData:'', fileName:''}; }

  window._devModal2 = window._devModal2 || devModalDefaults();

  function devList(section, extra){
    devEnsure();
    if(section === 'swot') return _devHub.swot[extra] || [];
    if(section === 'brand') return _devHub.brand[extra] || [];
    if(section === 'auditFinding') return _devHub.findings || [];
    if(section === 'auditReview') return _devHub.audits || [];
    return _devHub[section] || [];
  }

  function devSet(section, extra, list){
    devEnsure();
    if(section === 'swot'){ _devHub.swot[extra] = list; return; }
    if(section === 'brand'){ _devHub.brand[extra] = list; return; }
    if(section === 'auditFinding'){ _devHub.findings = list; return; }
    if(section === 'auditReview'){ _devHub.audits = list; return; }
    _devHub[section] = list;
  }

  function devTitle(section, extra){
    if(section === 'brand'){
      if(extra === 'palette') return 'Palette';
      if(extra === 'logos') return 'Logo';
      if(extra === 'inspiration') return 'Inspirasi';
      if(extra === 'fonts') return 'Font';
    }
    return ({
      resources:'Resource',
      vision:'Vision Board',
      learning:'Learning',
      ideas:'Idea',
      documents:'Dokumen',
      objectives:'Objektif',
      tasks:'Task',
      auditFinding:'Finding',
      auditReview:'Audit',
      swot:'SWOT',
      marketing:'Marketing'
    })[section] || 'Item';
  }

  function devItemDefaults(section, extra){
    var base = {id:devId('dev')};
    if(section === 'resources') return Object.assign(base, {title:'', category:'', body:''});
    if(section === 'vision') return Object.assign(base, {date:_todayYMD(), note:'', title:'', dataUrl:'', fileName:''});
    if(section === 'learning') return Object.assign(base, {title:'', category:'', body:'', link:'', dataUrl:'', fileName:'', sourceType:'Catatan'});
    if(section === 'ideas') return Object.assign(base, {title:'', category:'', body:'', nextStep:'', priority:'Medium', date:_todayYMD()});
    if(section === 'documents') return Object.assign(base, {title:'', category:'Dokumen Toko', body:'', link:'', dataUrl:'', fileName:'', createdAt:_todayYMD(), editor:'Hokky'});
    if(section === 'objectives') return Object.assign(base, {title:'', category:'', body:'', status:'Planned', priority:'Medium', targetDate:'', targetValue:0, currentValue:0});
    if(section === 'tasks') return Object.assign(base, {title:'', project:'', assigned:'', priority:'Medium', status:'Planned', deadline:'', body:'', done:false});
    if(section === 'auditFinding') return Object.assign(base, {title:'', category:'', source:'', insight:'', impact:'', action:'', status:'Open', priority:'Medium', area:''});
    if(section === 'auditReview') return Object.assign(base, {title:'', date:_todayYMD(), quarter:'Q2', status:'Open', area:'', body:''});
    if(section === 'swot') return Object.assign(base, {text:''});
    if(section === 'marketing') return Object.assign(base, {title:'', category:'', body:'', link:''});
    if(section === 'brand' && extra === 'palette') return Object.assign(base, {hex:'#7F5A1A', name:'Primary', category:'Brand', usage:''});
    if(section === 'brand' && extra === 'logos') return Object.assign(base, {title:'', body:'', dataUrl:'', fileName:''});
    if(section === 'brand' && extra === 'inspiration') return Object.assign(base, {title:'', colorsText:'#6E412A\n#A6896D\n#D0B48F\n#EDE7CF\n#F8F5EA'});
    if(section === 'brand' && extra === 'fonts') return Object.assign(base, {title:'', role:'', body:''});
    return base;
  }

  function devFields(section, extra){
    if(section === 'resources') return [['title','Nama','text'],['category','Kategori','text'],['body','Isi','textarea']];
    if(section === 'vision') return [['date','Tanggal','date'],['title','Judul','text'],['note','Catatan','textarea'],['file','Upload Foto','file']];
    if(section === 'learning') return [['title','Judul','text'],['category','Kategori','text'],['sourceType','Tipe','text'],['body','Catatan','textarea'],['link','Link Web','url'],['file','Upload Dokumen','file']];
    if(section === 'ideas') return [['title','Nama Ide','text'],['category','Kategori','text'],['priority','Prioritas','text'],['date','Tanggal','date'],['body','Isi Ide','textarea'],['nextStep','Langkah Berikutnya','textarea']];
    if(section === 'documents') return [['title','Nama Dokumen','text'],['category','Kategori','text'],['createdAt','Tanggal','date'],['editor','Editor','text'],['body','Catatan','textarea'],['link','Link','url'],['file','Upload Dokumen','file']];
    if(section === 'objectives') return [['title','Tujuan','text'],['category','Kategori','text'],['status','Status','text'],['priority','Prioritas','text'],['targetDate','Target Date','date'],['targetValue','Target Value','number'],['currentValue','Current Value','number'],['body','Detail / Hasil Utama','textarea']];
    if(section === 'tasks') return [['title','Nama Tugas','text'],['project','Project','text'],['assigned','PIC','text'],['priority','Prioritas','text'],['status','Status','text'],['deadline','Deadline','date'],['done','Selesai','checkbox'],['body','Catatan','textarea']];
    if(section === 'auditFinding') return [['title','Judul Masalah','text'],['category','Kategori','text'],['source','Sumber','text'],['impact','Dampak','text'],['status','Status','text'],['priority','Prioritas','text'],['area','Area','text'],['insight','Insight','textarea'],['action','Rekomendasi','textarea']];
    if(section === 'auditReview') return [['title','Nama Audit','text'],['date','Tanggal','date'],['quarter','Quarter','text'],['status','Status','text'],['area','Area','text'],['body','Pesan Audit','textarea']];
    if(section === 'swot') return [['text','Isi SWOT','textarea']];
    if(section === 'marketing') return [['title','Nama Hub','text'],['category','Kategori','text'],['body','Isi','textarea'],['link','Link','url']];
    if(section === 'brand' && extra === 'palette') return [['hex','HEX','text'],['name','Nama Warna','text'],['category','Kategori','text'],['usage','Usage','textarea']];
    if(section === 'brand' && extra === 'logos') return [['title','Nama Logo','text'],['body','Catatan','textarea'],['file','Upload Logo','file']];
    if(section === 'brand' && extra === 'inspiration') return [['title','Nama Inspirasi','text'],['colorsText','Warna (1 HEX per baris)','textarea']];
    if(section === 'brand' && extra === 'fonts') return [['title','Nama Font','text'],['role','Role','text'],['body','Penggunaan','textarea']];
    return [];
  }

  function devOpen(section, mode, index, extra){
    var list = devList(section, extra);
    var item = (mode === 'edit' && index >= 0) ? JSON.parse(JSON.stringify(list[index] || {})) : devItemDefaults(section, extra);
    window._devModal2 = {open:true, section:section, extra:extra || '', mode:mode || 'add', index:index == null ? -1 : index, item:item, fileData:item.dataUrl || '', fileName:item.fileName || ''};
    window._renderDevelopment(window._devSub || 'resources');
  }

  function devClose(){
    window._devModal2 = devModalDefaults();
    window._renderDevelopment(window._devSub || 'resources');
  }

  function devReadFile(input){
    var file = input && input.files && input.files[0];
    if(!file) return;
    var fr = new FileReader();
    fr.onload = function(ev){
      window._devModal2.fileData = ev.target.result;
      window._devModal2.fileName = file.name;
      toast('File siap disimpan','success');
      window._renderDevelopment(window._devSub || 'resources');
    };
    fr.readAsDataURL(file);
  }

  function devSaveItem(){
    var modal = window._devModal2 || {};
    var item = modal.item || {};
    devFields(modal.section, modal.extra).forEach(function(field){
      var key = field[0];
      var type = field[2];
      if(key === 'file') return;
      var el = document.getElementById('DEV-FLD-' + key);
      if(!el) return;
      item[key] = (type === 'checkbox') ? !!el.checked : el.value;
    });
    if(modal.fileData){
      item.dataUrl = modal.fileData;
      item.fileName = modal.fileName || item.fileName || '';
    }
    if(modal.section === 'brand' && modal.extra === 'inspiration'){
      item.colors = String(item.colorsText || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean);
    }
    if(modal.section === 'swot' && typeof item.text === 'string') item.text = item.text.trim();
    var mainTitle = item.title || item.name || item.text || '';
    if(!String(mainTitle).trim()){
      toast(devTitle(modal.section, modal.extra) + ' wajib punya judul/isi utama','error');
      return;
    }
    var list = devList(modal.section, modal.extra).slice();
    if(modal.mode === 'edit' && modal.index >= 0) list[modal.index] = item;
    else list.unshift(item);
    devSet(modal.section, modal.extra, list);
    devSave();
    toast(devTitle(modal.section, modal.extra) + ' disimpan','success');
    devClose();
  }

  function devDelete(section, index, extra){
    var list = devList(section, extra);
    var item = list[index] || {};
    var label = item.title || item.name || item.text || devTitle(section, extra);
    confirmDelete('Hapus <b>' + esc(label) + '</b>?', function(){
      var next = list.slice();
      next.splice(index, 1);
      devSet(section, extra, next);
      devSave();
      toast('Data dihapus','success');
      window._renderDevelopment(window._devSub || 'resources');
    });
  }

  function devOpenAsset(dataUrl, link){
    if(dataUrl) window.open(dataUrl, '_blank');
    else if(link) window.open(link, '_blank');
    else toast('Tidak ada file atau link untuk dibuka','warn');
  }

  function devOpenSopWide(){
    window._hrSopWideMode = true;
    _navTo('hr');
    setTimeout(function(){ _renderHR('sop'); }, 80);
  }

  function devHeader(title, subtitle, actionHtml){
    return '<div class="card" style="background:linear-gradient(135deg,#182330,#35241B);margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#fff">' + title + '</div><div style="font-size:11px;color:rgba(255,255,255,.76);margin-top:4px">' + subtitle + '</div></div>' + (actionHtml || '') + '</div></div>';
  }

  function devActionButtons(section, idx, extra){
    return '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_devOpen2(\'' + section + '\',\'edit\',' + idx + ',\'' + (extra || '') + '\')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_devDelete2(\'' + section + '\',' + idx + ',\'' + (extra || '') + '\')" style="background:#5f6b7a">Hapus</button></div>';
  }

  function devMetric(label, value, accent, note){
    return '<div class="card" style="margin-bottom:0;border-top:3px solid ' + accent + '"><div style="font-size:10px;color:' + accent + ';text-transform:uppercase;font-weight:800;letter-spacing:.08em">' + label + '</div><div style="font-size:28px;font-weight:800;color:var(--tx);margin-top:10px">' + value + '</div><div style="font-size:11px;color:var(--tx2);margin-top:8px">' + note + '</div></div>';
  }

  function devEmpty(msg){
    return '<div class="card" style="text-align:center;color:var(--tx3);padding:26px">' + msg + '</div>';
  }

  function devResourceCards(){
    var list = _devHub.resources || [];
    var h = devHeader('Resources', 'Catatan manual untuk resource, referensi, dan isi singkat.', '<button class="btnp" onclick="_devOpen2(\'resources\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Resource</button>');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">';
    list.forEach(function(item, idx){
      h += '<div class="card" style="margin-bottom:0;background:linear-gradient(180deg,rgba(240,197,106,.08),rgba(255,255,255,.01));border-left:3px solid #F0C56A"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:17px;font-weight:800;color:var(--tx)">' + devText(item.title) + '</div><div style="font-size:11px;color:#F0C56A;margin-top:4px">' + devText(item.category || '-') + '</div></div>' + devActionButtons('resources', idx, '') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.8;margin-top:10px;white-space:pre-line">' + devText(item.body || '-') + '</div></div>';
    });
    if(!list.length) h += devEmpty('Belum ada resource.');
    h += '</div>';
    return h;
  }

  function devVisionCards(){
    var list = _devHub.vision || [];
    var h = devHeader('Vision Board', 'Upload foto lalu simpan sebagai card dengan tanggal dan catatan.', '<button class="btnp" onclick="_devOpen2(\'vision\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Vision</button>');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">';
    list.forEach(function(item, idx){
      var bg = item.dataUrl ? 'url(\'' + devAttr(item.dataUrl) + '\') center/cover no-repeat' : 'linear-gradient(135deg,#3A241A,#6E503C)';
      h += '<div class="card" style="margin-bottom:0;padding:0;overflow:hidden"><div style="height:220px;background:' + bg + '"></div><div style="padding:14px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:16px;font-weight:800;color:var(--tx)">' + devText(item.title || 'Vision') + '</div><div style="font-size:11px;color:#F0C56A;margin-top:4px">' + devText(item.date || '-') + '</div></div>' + devActionButtons('vision', idx, '') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.8;margin-top:10px;white-space:pre-line">' + devText(item.note || '-') + '</div>' + (item.dataUrl ? '<div style="margin-top:12px"><button class="btnsm" onclick="_devOpenAsset2(\'' + devAttr(item.dataUrl) + '\',\'\')" style="background:#374151">Buka Foto</button></div>' : '') + '</div></div>';
    });
    if(!list.length) h += devEmpty('Belum ada vision board.');
    h += '</div>';
    return h;
  }

  function devLearningCards(){
    var list = _devHub.learning || [];
    var h = devHeader('Learning Library', 'Catatan belajar, dokumen, link web, dan referensi lain.', '<button class="btnp" onclick="_devOpen2(\'learning\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Learning</button>');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">';
    list.forEach(function(item, idx){
      h += '<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:17px;font-weight:800;color:var(--tx)">' + devText(item.title) + '</div><div style="font-size:11px;color:#8FD0FF;margin-top:4px">' + devText(item.category || '-') + ' • ' + devText(item.sourceType || 'Catatan') + '</div></div>' + devActionButtons('learning', idx, '') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.8;margin-top:10px;white-space:pre-line">' + devText(item.body || '-') + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' + (item.link ? '<button class="btnsm" onclick="_devOpenAsset2(\'\',\'' + devAttr(item.link) + '\')" style="background:#0F766E">Buka Link</button>' : '') + (item.dataUrl ? '<button class="btnsm" onclick="_devOpenAsset2(\'' + devAttr(item.dataUrl) + '\',\'\')" style="background:#374151">Buka File</button>' : '') + (item.fileName ? '<span class="chip" style="background:rgba(240,197,106,.12);color:#F0C56A">' + devText(item.fileName) + '</span>' : '') + '</div></div>';
    });
    if(!list.length) h += devEmpty('Belum ada item learning.');
    h += '</div>';
    return h;
  }

  function devIdeasCards(){
    var list = _devHub.ideas || [];
    var h = devHeader('Ideas', 'Tempat menyimpan ide, peluang, dan langkah lanjutannya.', '<button class="btnp" onclick="_devOpen2(\'ideas\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Ide</button>');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">';
    list.forEach(function(item, idx){
      h += '<div class="card" style="margin-bottom:0;border-top:3px solid #D796FF"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:17px;font-weight:800;color:var(--tx)">' + devText(item.title) + '</div><div style="font-size:11px;color:#D796FF;margin-top:4px">' + devText(item.category || '-') + ' • ' + devText(item.priority || '-') + '</div></div>' + devActionButtons('ideas', idx, '') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.8;margin-top:10px;white-space:pre-line">' + devText(item.body || '-') + '</div><div style="margin-top:10px;font-size:11px;color:#F0C56A">Next: ' + devText(item.nextStep || '-') + '</div></div>';
    });
    if(!list.length) h += devEmpty('Belum ada ide.');
    h += '</div>';
    return h;
  }

  function devDocumentsTable(){
    var docs = (_devHub.documents || []).map(function(item, idx){
      return {title:item.title, category:item.category, createdAt:item.createdAt, editor:item.editor, body:item.body, link:item.link, dataUrl:item.dataUrl, fileName:item.fileName, idx:idx, source:'Development'};
    });
    (_hrSops || []).forEach(function(item){
      docs.push({title:item.title, category:item.docType || 'Guides & SOPs', createdAt:item.createdOn || item.updatedAt || '-', editor:item.department || 'HR', body:item.note || '', link:'', dataUrl:item.fileData || '', fileName:item.fileName || '', source:'HR SOP'});
    });
    var h = devHeader('Dokumen', 'Dokumen toko, file referensi, dan integrasi daftar SOP dari HR.', '<button class="btnp" onclick="_devOpen2(\'documents\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Dokumen</button>');
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1180px"><thead><tr><th>Nama</th><th>Kategori</th><th>Tanggal</th><th>Editor</th><th>Catatan</th><th>File</th><th>Sumber</th><th class="c">Aksi</th></tr></thead><tbody>';
    docs.forEach(function(item){
      h += '<tr><td style="font-weight:700">' + devText(item.title || '-') + '</td><td>' + devText(item.category || '-') + '</td><td>' + devText(item.createdAt || '-') + '</td><td>' + devText(item.editor || '-') + '</td><td style="white-space:pre-line">' + devText(item.body || '-') + '</td><td>' + devText(item.fileName || '-') + '</td><td>' + devText(item.source) + '</td><td class="c">' + (item.source === 'Development' ? (devActionButtons('documents', item.idx, '') + (item.dataUrl || item.link ? '<div style="margin-top:6px"><button class="btnsm" onclick="_devOpenAsset2(\'' + devAttr(item.dataUrl || '') + '\',\'' + devAttr(item.link || '') + '\')" style="background:#374151">Buka</button></div>' : '')) : '<button class="btnsm" onclick="_openHRSopWide2()" style="background:#374151">Buka SOP</button>') + '</td></tr>';
    });
    if(!docs.length) h += '<tr><td colspan="8" style="text-align:center;color:var(--tx3);padding:24px">Belum ada dokumen.</td></tr>';
    h += '</tbody></table></div></div>';
    return h;
  }

  function devObjectivesTable(){
    var list = _devHub.objectives || [];
    var h = devHeader('Objektif', 'Tujuan yang bisa dibuat, diubah, dan dipantau progresnya.', '<button class="btnp" onclick="_devOpen2(\'objectives\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Objektif</button>');
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1280px"><thead><tr><th>Tujuan</th><th>Kategori</th><th>Status</th><th>Priority</th><th>Target</th><th>Progress</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    list.forEach(function(item, idx){
      var prog = typeof _devProgress === 'function' ? _devProgress(_num(item.currentValue), _num(item.targetValue)) : devText(item.currentValue + '/' + item.targetValue);
      h += '<tr><td style="font-weight:700">' + devText(item.title) + '</td><td>' + devText(item.category || '-') + '</td><td>' + devText(item.status || '-') + '</td><td>' + devText(item.priority || '-') + '</td><td>' + devText(item.targetDate || '-') + '</td><td>' + prog + '</td><td style="white-space:pre-line">' + devText(item.body || '-') + '</td><td class="c">' + devActionButtons('objectives', idx, '') + '</td></tr>';
    });
    if(!list.length) h += '<tr><td colspan="8" style="text-align:center;color:var(--tx3);padding:24px">Belum ada objektif.</td></tr>';
    h += '</tbody></table></div></div>';
    return h;
  }

  function devTasksTable(){
    var list = _devHub.tasks || [];
    var openCount = list.filter(function(item){ return !item.done; }).length;
    var doneCount = list.filter(function(item){ return !!item.done; }).length;
    var h = '<div style="display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:12px;margin-bottom:12px">' +
      devMetric('Open Task', String(openCount), '#F0C56A', 'Task yang masih aktif') +
      devMetric('Completed', String(doneCount), '#7EE0A7', 'Task yang sudah selesai') +
      devMetric('All Task', String(list.length), '#8FD0FF', 'Seluruh catatan tugas') +
      '</div>';
    h += devHeader('Task List', 'Catatan tugas, planning, dan pekerjaan yang sedang berjalan.', '<button class="btnp" onclick="_devOpen2(\'tasks\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Task</button>');
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:1180px"><thead><tr><th>Nama</th><th>Project</th><th>PIC</th><th>Status</th><th>Priority</th><th>Deadline</th><th>Done</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    list.forEach(function(item, idx){
      h += '<tr><td style="font-weight:700">' + devText(item.title) + '</td><td>' + devText(item.project || '-') + '</td><td>' + devText(item.assigned || '-') + '</td><td>' + devText(item.status || '-') + '</td><td>' + devText(item.priority || '-') + '</td><td>' + devText(item.deadline || '-') + '</td><td class="c">' + (item.done ? '✓' : '○') + '</td><td style="white-space:pre-line">' + devText(item.body || '-') + '</td><td class="c">' + devActionButtons('tasks', idx, '') + '</td></tr>';
    });
    if(!list.length) h += '<tr><td colspan="9" style="text-align:center;color:var(--tx3);padding:24px">Belum ada task.</td></tr>';
    h += '</tbody></table></div></div>';
    return h;
  }

  function devAuditSection(){
    var h = devHeader('Business Audit', 'Tempat mencatat kesalahan, temuan, dan evaluasi audit bisnis.', '<div style="display:flex;gap:8px"><button class="btnp" onclick="_devOpen2(\'auditFinding\',\'add\')" style="width:auto;background:#8C5E16">+ Finding</button><button class="btnp" onclick="_devOpen2(\'auditReview\',\'add\')" style="width:auto;background:#374151">+ Audit</button></div>');
    h += '<div class="card"><div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:10px">Finding / Masalah</div><div style="overflow:auto"><table class="tbl" style="min-width:1180px"><thead><tr><th>Judul</th><th>Kategori</th><th>Sumber</th><th>Dampak</th><th>Status</th><th>Area</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_devHub.findings || []).forEach(function(item, idx){
      h += '<tr><td style="font-weight:700">' + devText(item.title) + '</td><td>' + devText(item.category || '-') + '</td><td>' + devText(item.source || '-') + '</td><td>' + devText(item.impact || '-') + '</td><td>' + devText(item.status || '-') + '</td><td>' + devText(item.area || '-') + '</td><td class="c">' + devActionButtons('auditFinding', idx, '') + '</td></tr>';
    });
    if(!(_devHub.findings || []).length) h += '<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">Belum ada finding.</td></tr>';
    h += '</tbody></table></div></div>';
    h += '<div class="card"><div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:10px">Audit Review</div><div style="overflow:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Nama Audit</th><th>Tanggal</th><th>Quarter</th><th>Status</th><th>Area</th><th>Pesan</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_devHub.audits || []).forEach(function(item, idx){
      h += '<tr><td style="font-weight:700">' + devText(item.title) + '</td><td>' + devText(item.date || '-') + '</td><td>' + devText(item.quarter || '-') + '</td><td>' + devText(item.status || '-') + '</td><td>' + devText(item.area || '-') + '</td><td style="white-space:pre-line">' + devText(item.body || '-') + '</td><td class="c">' + devActionButtons('auditReview', idx, '') + '</td></tr>';
    });
    if(!(_devHub.audits || []).length) h += '<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">Belum ada audit.</td></tr>';
    h += '</tbody></table></div></div>';
    return h;
  }

  function devSwotBoard(){
    var cols = [['Strength','strength','#2E7D59'],['Weakness','weakness','#C7782B'],['Opportunity','opportunity','#B8871A'],['Threat','threat','#C75F5F']];
    var h = devHeader('SWOT', 'Semua kolom SWOT bisa diisi, diedit, dan dihapus.', '');
    h += '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px">';
    cols.forEach(function(col){
      h += '<div class="card" style="margin-bottom:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:16px;font-weight:800;color:' + col[2] + '">' + col[0] + '</div><button class="btnsm" onclick="_devOpen2(\'swot\',\'add\',-1,\'' + col[1] + '\')" style="background:#8C5E16">+ Tambah</button></div>';
      (_devHub.swot[col[1]] || []).forEach(function(item, idx){
        var text = typeof item === 'string' ? item : (item.text || '');
        h += '<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:10px"><div style="font-size:12px;color:var(--tx2);line-height:1.75;white-space:pre-line">' + devText(text) + '</div><div style="display:flex;justify-content:flex-end;gap:6px;margin-top:10px"><button class="btnsm" onclick="_devOpen2(\'swot\',\'edit\',' + idx + ',\'' + col[1] + '\')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_devDelete2(\'swot\',' + idx + ',\'' + col[1] + '\')" style="background:#5f6b7a">Hapus</button></div></div>';
      });
      if(!(_devHub.swot[col[1]] || []).length) h += '<div style="text-align:center;color:var(--tx3);padding:18px">Belum ada data.</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function devMarketingCards(){
    var list = _devHub.marketing || [];
    var h = devHeader('Marketing Hub', 'Hub marketing yang bisa diisi, diedit, dan dihapus.', '<button class="btnp" onclick="_devOpen2(\'marketing\',\'add\')" style="width:auto;background:#8C5E16">+ Tambah Hub</button>');
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">';
    list.forEach(function(item, idx){
      h += '<div class="card" style="margin-bottom:0;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(240,197,106,.04))"><div style="font-size:38px;line-height:1;margin-bottom:18px;color:#F0C56A">◎</div><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:17px;font-weight:800;color:var(--tx)">' + devText(item.title) + '</div><div style="font-size:11px;color:#F0C56A;margin-top:4px">' + devText(item.category || '-') + '</div></div>' + devActionButtons('marketing', idx, '') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.8;margin-top:10px;white-space:pre-line">' + devText(item.body || '-') + '</div>' + (item.link ? '<div style="margin-top:12px"><button class="btnsm" onclick="_devOpenAsset2(\'\',\'' + devAttr(item.link) + '\')" style="background:#0F766E">Buka Link</button></div>' : '') + '</div>';
    });
    if(!list.length) h += devEmpty('Belum ada item marketing hub.');
    h += '</div>';
    return h;
  }

  function devBrandSection(){
    var h = devHeader('Brand Design', 'Elemen brand bisa diisi, diubah, dan dihapus manual.', '');
    h += '<div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:12px">';
    h += '<div style="display:flex;flex-direction:column;gap:12px">';
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:#fff">Color Palette</div><button class="btnsm" onclick="_devOpen2(\'brand\',\'add\',-1,\'palette\')" style="background:#8C5E16">+ Tambah</button></div><div style="overflow:auto"><table class="tbl" style="min-width:860px"><thead><tr><th>HEX</th><th>Nama</th><th>Kategori</th><th>Usage</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_devHub.brand.palette || []).forEach(function(item, idx){
      h += '<tr><td><div style="display:flex;align-items:center;gap:8px"><span style="width:16px;height:16px;border-radius:4px;background:' + devAttr(item.hex || '#000') + ';display:inline-block"></span>' + devText(item.hex || '-') + '</div></td><td>' + devText(item.name || '-') + '</td><td>' + devText(item.category || '-') + '</td><td style="white-space:pre-line">' + devText(item.usage || '-') + '</td><td class="c">' + devActionButtons('brand', idx, 'palette') + '</td></tr>';
    });
    if(!(_devHub.brand.palette || []).length) h += '<tr><td colspan="5" style="text-align:center;color:var(--tx3);padding:20px">Belum ada palette.</td></tr>';
    h += '</tbody></table></div></div>';
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:#fff">Logo Variation</div><button class="btnsm" onclick="_devOpen2(\'brand\',\'add\',-1,\'logos\')" style="background:#8C5E16">+ Tambah</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">';
    (_devHub.brand.logos || []).forEach(function(item, idx){
      h += '<div style="border:1px solid var(--bd);border-radius:12px;padding:12px;background:var(--bg3)"><div style="height:140px;border-radius:10px;background:' + (item.dataUrl ? 'url(\'' + devAttr(item.dataUrl) + '\') center/contain no-repeat, #fff' : 'linear-gradient(135deg,#35241B,#1E2835)') + ';margin-bottom:10px"></div><div style="font-size:15px;font-weight:800;color:var(--tx)">' + devText(item.title || '-') + '</div><div style="font-size:11px;color:var(--tx2);line-height:1.7;margin-top:6px">' + devText(item.body || '-') + '</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' + devActionButtons('brand', idx, 'logos') + (item.dataUrl ? '<button class="btnsm" onclick="_devOpenAsset2(\'' + devAttr(item.dataUrl) + '\',\'\')" style="background:#374151">Buka</button>' : '') + '</div></div>';
    });
    if(!(_devHub.brand.logos || []).length) h += '<div style="text-align:center;color:var(--tx3);padding:20px">Belum ada logo.</div>';
    h += '</div></div>';
    h += '</div>';
    h += '<div style="display:flex;flex-direction:column;gap:12px">';
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:#fff">Inspiration</div><button class="btnsm" onclick="_devOpen2(\'brand\',\'add\',-1,\'inspiration\')" style="background:#8C5E16">+ Tambah</button></div><div style="display:grid;grid-template-columns:1fr;gap:10px">';
    (_devHub.brand.inspiration || []).forEach(function(item, idx){
      var colors = item.colors || String(item.colorsText || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean);
      h += '<div style="border:1px solid var(--bd);border-radius:12px;overflow:hidden;background:var(--bg3)"><div style="display:grid;grid-template-columns:repeat(' + Math.max(colors.length,1) + ',1fr);height:92px">' + (colors.length ? colors.map(function(color){ return '<div style="background:' + devAttr(color) + '"></div>'; }).join('') : '<div style="background:#444"></div>') + '</div><div style="padding:10px 12px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div style="font-size:14px;font-weight:800;color:var(--tx)">' + devText(item.title || '-') + '</div>' + devActionButtons('brand', idx, 'inspiration') + '</div></div></div>';
    });
    if(!(_devHub.brand.inspiration || []).length) h += '<div style="text-align:center;color:var(--tx3);padding:20px">Belum ada inspirasi.</div>';
    h += '</div></div>';
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:14px;font-weight:800;color:#fff">Brand Font</div><button class="btnsm" onclick="_devOpen2(\'brand\',\'add\',-1,\'fonts\')" style="background:#8C5E16">+ Tambah</button></div><div style="display:grid;grid-template-columns:1fr;gap:10px">';
    (_devHub.brand.fonts || []).forEach(function(item, idx){
      h += '<div style="border:1px solid var(--bd);border-radius:12px;padding:12px;background:var(--bg3)"><div style="font-size:48px;font-weight:800;line-height:1;color:#D9DDFD">Aa Bb</div><div style="font-size:18px;font-weight:800;color:var(--tx);margin-top:10px">' + devText(item.title || '-') + '</div><div style="font-size:11px;color:#8FD0FF;margin-top:6px">' + devText(item.role || '-') + '</div><div style="font-size:12px;color:var(--tx2);line-height:1.7;margin-top:8px;white-space:pre-line">' + devText(item.body || '-') + '</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' + devActionButtons('brand', idx, 'fonts') + '</div></div>';
    });
    if(!(_devHub.brand.fonts || []).length) h += '<div style="text-align:center;color:var(--tx3);padding:20px">Belum ada font.</div>';
    h += '</div></div>';
    h += '</div></div>';
    return h;
  }

  function devModal(){
    var modal = window._devModal2 || {};
    if(!modal.open) return '';
    var fields = devFields(modal.section, modal.extra);
    var item = modal.item || {};
    var h = '<div class="modal" style="position:fixed;inset:0;display:flex;justify-content:center;align-items:center;padding:20px;background:rgba(0,0,0,.7);z-index:9999" onclick="if(event.target===this)_devClose2()"><div class="modalbox" onclick="event.stopPropagation()" style="max-width:760px;width:min(92vw,760px);max-height:90vh;overflow:auto;background:linear-gradient(180deg,#171717,#222);border:1px solid rgba(240,197,106,.25)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px"><div><div style="font-size:18px;font-weight:800;color:#fff">' + (modal.mode === 'edit' ? 'Edit ' : 'Tambah ') + devTitle(modal.section, modal.extra) + '</div><div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:4px">Semua field disimpan ke Development Hub AJW.</div></div><button class="btns" onclick="_devClose2()">Tutup</button></div><div class="g2">';
    fields.forEach(function(field){
      var key = field[0], label = field[1], type = field[2];
      if(type === 'textarea'){
        h += '<div style="grid-column:1 / -1"><label class="lbl">' + label + '</label><textarea id="DEV-FLD-' + key + '" class="fi" rows="5">' + devText(item[key] || '') + '</textarea></div>';
      } else if(type === 'file'){
        h += '<div style="grid-column:1 / -1"><label class="lbl">' + label + '</label><input type="file" class="fi" onchange="_devReadFile2(this)">' + (modal.fileName ? '<div style="font-size:11px;color:#F0C56A;margin-top:6px">' + devText(modal.fileName) + '</div>' : '') + '</div>';
      } else if(type === 'checkbox'){
        h += '<div><label class="lbl">' + label + '</label><label style="display:flex;align-items:center;gap:8px;color:var(--tx)"><input id="DEV-FLD-' + key + '" type="checkbox" ' + (item[key] ? 'checked' : '') + '> Ya</label></div>';
      } else {
        h += '<div><label class="lbl">' + label + '</label><input id="DEV-FLD-' + key + '" type="' + type + '" class="fi" value="' + devAttr(item[key] || '') + '"></div>';
      }
    });
    h += '</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button class="btns" onclick="_devClose2()">Batal</button><button class="btnp" onclick="_devSave2()" style="background:#8C5E16">Simpan</button></div></div></div>';
    return h;
  }

  window._devOpen2 = devOpen;
  window._devClose2 = devClose;
  window._devReadFile2 = devReadFile;
  window._devSave2 = devSaveItem;
  window._devDelete2 = devDelete;
  window._devOpenAsset2 = devOpenAsset;
  window._openHRSopWide2 = devOpenSopWide;

  window._renderDevelopment = function(sub){
    sub = sub || window._devSub || 'resources';
    window._devSub = sub;
    devEnsure();
    var v = document.getElementById('V-development');
    if(!v) return;
    var h = '<div style="max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:12px">';
    h += '<div class="card" style="background:linear-gradient(135deg,#182330,#35241B)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#fff">Development Workspace</div><div style="font-size:11px;color:rgba(255,255,255,.76);margin-top:4px">Ruang strategi, dokumentasi, brand, pembelajaran, dan pengembangan bisnis AJW yang sekarang benar-benar editable.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip" style="background:rgba(240,197,106,.12);color:#F0C56A;border:1px solid rgba(240,197,106,.25)">Editable</span><span class="chip" style="background:rgba(143,208,255,.12);color:#8FD0FF;border:1px solid rgba(143,208,255,.25)">Supabase Ready</span></div></div></div>';
    h += '<div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap">';
[['resources','Resources'],['vision','Vision Board'],['learning','Learning Library'],['ideas','Ideas'],['documents','Dokumen'],['objectives','Objektif'],['tasks','Task List'],['audit','Business Audit'],['swot','SWOT'],['marketing','Marketing Hub'],['brand','Brand Design'],['foto','Foto Produk']].forEach(function(tab){
      h += '<button class="' + (sub === tab[0] ? 'btnp' : 'btns') + '" onclick="_renderDevelopment(\'' + tab[0] + '\')" style="padding:8px 12px;' + (sub === tab[0] ? 'background:#8C5E16;border-color:#8C5E16' : '') + '">' + tab[1] + '</button>';
    });
    h += '</div></div>';
    if(sub === 'resources') h += devResourceCards();
    else if(sub === 'vision') h += devVisionCards();
    else if(sub === 'learning') h += devLearningCards();
    else if(sub === 'ideas') h += devIdeasCards();
    else if(sub === 'documents') h += devDocumentsTable();
    else if(sub === 'objectives') h += devObjectivesTable();
    else if(sub === 'tasks') h += devTasksTable();
    else if(sub === 'audit') h += devAuditSection();
    else if(sub === 'swot') h += devSwotBoard();
    else if(sub === 'marketing') h += devMarketingCards();
    else if(sub === 'brand') h += devBrandSection();
    else if(sub === 'foto') h += '<div id="DEV-FOTO-HOST"></div>';
    h += '</div>' + devModal();
    v.innerHTML = h;
    if(sub === 'foto' && typeof _renderFotoProdukInto === 'function'){
      setTimeout(function(){ _renderFotoProdukInto('DEV-FOTO-HOST'); }, 0);
    }
  };

  if(document.getElementById('V-development') && typeof _activeTab !== 'undefined' && _activeTab === 'development'){
    setTimeout(function(){ window._renderDevelopment(window._devSub || 'resources'); }, 30);
  }
})();
