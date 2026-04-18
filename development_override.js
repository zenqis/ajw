(function(){
  function devEnsure(){
    window._devHub = window._devHub || (typeof _devDefaultData==='function' ? _devDefaultData() : {});
    ['resources','vision','learning','ideas','documents','objectives','tasks','findings','audits','marketing'].forEach(function(k){
      if(!Array.isArray(_devHub[k])) _devHub[k]=[];
    });
    _devHub.swot=_devHub.swot||{strength:[],weakness:[],opportunity:[],threat:[]};
    ['strength','weakness','opportunity','threat'].forEach(function(k){ if(!Array.isArray(_devHub.swot[k])) _devHub.swot[k]=[]; });
    _devHub.brand=_devHub.brand||{};
    ['palette','logos','inspiration','fonts'].forEach(function(k){ if(!Array.isArray(_devHub.brand[k])) _devHub.brand[k]=[]; });
  }

  window._devUI2={open:false,section:'',extra:'',mode:'add',index:-1,fileData:'',fileName:''};

  function devList(section, extra){
    devEnsure();
    if(section==='swot') return _devHub.swot[extra]||[];
    if(section==='brand') return _devHub.brand[extra]||[];
    if(section==='auditFinding') return _devHub.findings||[];
    if(section==='auditReview') return _devHub.audits||[];
    return _devHub[section]||[];
  }
  function devSet(section, extra, list){
    devEnsure();
    if(section==='swot'){ _devHub.swot[extra]=list; return; }
    if(section==='brand'){ _devHub.brand[extra]=list; return; }
    if(section==='auditFinding'){ _devHub.findings=list; return; }
    if(section==='auditReview'){ _devHub.audits=list; return; }
    _devHub[section]=list;
  }
  function devDefaults(section, extra){
    var base={id:'dev_'+Date.now()};
    if(section==='resources') return Object.assign(base,{title:'',meta:'',desc:''});
    if(section==='vision') return Object.assign(base,{date:_todayYMD(),title:'',note:'',dataUrl:'',fileName:''});
    if(section==='learning') return Object.assign(base,{name:'',category:'',notes:'',link:'',dataUrl:'',fileName:'',status:'Aktif'});
    if(section==='ideas') return Object.assign(base,{name:'',category:'',priority:'Medium',notes:'',next:'',date:_todayYMD()});
    if(section==='documents') return Object.assign(base,{name:'',docType:'Dokumen Toko',stage:'Draft',editedBy:'Hokky',editedAt:new Date().toLocaleString('id-ID'),notes:'',url:'',dataUrl:'',fileName:''});
    if(section==='objectives') return Object.assign(base,{name:'',category:'',status:'Planned',priority:'Medium',start:_todayYMD(),target:'',targetValue:0,currentValue:0,outcome:''});
    if(section==='tasks') return Object.assign(base,{name:'',project:'',assigned:'',priority:'Medium',status:'Planned',deadline:'',notes:'',done:false});
    if(section==='auditFinding') return Object.assign(base,{title:'',category:'',source:'',insight:'',impact:'',action:'',status:'Open',priority:'Medium',area:''});
    if(section==='auditReview') return Object.assign(base,{name:'',date:_todayYMD(),quarter:'Q2',status:'Open',area:'',message:''});
    if(section==='swot') return Object.assign(base,{text:''});
    if(section==='marketing') return Object.assign(base,{name:'',category:'',desc:'',link:''});
    if(section==='brand' && extra==='palette') return Object.assign(base,{hex:'#7F5A1A',hsl:'',css:'',color:'Primary',category:'Brand',brand:'AJW'});
    if(section==='brand' && extra==='logos') return Object.assign(base,{name:'',desc:'',dataUrl:'',fileName:''});
    if(section==='brand' && extra==='inspiration') return Object.assign(base,{name:'',colorsText:'#6E412A\n#A6896D\n#D0B48F\n#EDE7CF\n#F8F5EA'});
    if(section==='brand' && extra==='fonts') return Object.assign(base,{name:'',role:'',use:''});
    return base;
  }
  function devFields(section, extra){
    var m={
      resources:[['title','Nama','text'],['meta','Kategori','text'],['desc','Isi','textarea']],
      vision:[['date','Tanggal','date'],['title','Judul','text'],['note','Catatan','textarea'],['file','Upload Foto','file']],
      learning:[['name','Judul','text'],['category','Kategori','text'],['notes','Catatan','textarea'],['link','Link','url'],['file','Upload Dokumen','file']],
      ideas:[['name','Judul Ide','text'],['category','Kategori','text'],['priority','Prioritas','text'],['notes','Isi Ide','textarea'],['next','Next Step','textarea']],
      documents:[['name','Nama Dokumen','text'],['docType','Kategori','text'],['stage','Status','text'],['editedBy','Editor','text'],['notes','Catatan','textarea'],['url','Link','url'],['file','Upload Dokumen','file']],
      objectives:[['name','Tujuan','text'],['category','Kategori','text'],['status','Status','text'],['priority','Prioritas','text'],['start','Mulai','date'],['target','Target','date'],['targetValue','Target Value','number'],['currentValue','Current Value','number'],['outcome','Catatan','textarea']],
      tasks:[['name','Nama Tugas','text'],['project','Project','text'],['assigned','PIC','text'],['priority','Prioritas','text'],['status','Status','text'],['deadline','Deadline','date'],['notes','Catatan','textarea'],['done','Selesai','checkbox']],
      auditFinding:[['title','Judul Masalah','text'],['category','Kategori','text'],['source','Sumber','text'],['insight','Insight','textarea'],['impact','Dampak','text'],['action','Rekomendasi','textarea'],['status','Status','text'],['priority','Prioritas','text'],['area','Area','text']],
      auditReview:[['name','Nama Audit','text'],['date','Tanggal','date'],['quarter','Quarter','text'],['status','Status','text'],['area','Area','text'],['message','Pesan Audit','textarea']],
      swot:[['text','Isi SWOT','textarea']],
      marketing:[['name','Nama Hub','text'],['category','Kategori','text'],['desc','Isi','textarea'],['link','Link','url']]
    };
    if(section==='brand' && extra==='palette') return [['hex','HEX','text'],['hsl','HSL','text'],['css','CSS','text'],['color','Nama Warna','text'],['category','Kategori','text'],['brand','Brand','text']];
    if(section==='brand' && extra==='logos') return [['name','Nama Logo','text'],['desc','Catatan','textarea'],['file','Upload Logo','file']];
    if(section==='brand' && extra==='inspiration') return [['name','Nama Inspirasi','text'],['colorsText','Warna (1 hex per baris)','textarea']];
    if(section==='brand' && extra==='fonts') return [['name','Nama Font','text'],['role','Role','text'],['use','Penggunaan','textarea']];
    return m[section]||[];
  }
  function devTitle(section, extra){
    if(section==='brand') return extra==='palette'?'Palette':extra==='logos'?'Logo':extra==='inspiration'?'Inspirasi':'Font';
    return ({resources:'Resource',vision:'Vision Board',learning:'Learning',ideas:'Idea',documents:'Dokumen',objectives:'Objektif',tasks:'Task',auditFinding:'Finding',auditReview:'Audit',swot:'SWOT',marketing:'Marketing'})[section]||'Item';
  }
  function devHeader(title, subtitle, actions){
    return '<div class="card" style="background:linear-gradient(135deg,#1E2835,#3A241A);margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#fff">'+title+'</div><div style="font-size:11px;color:rgba(255,255,255,.76);margin-top:4px">'+subtitle+'</div></div>'+(actions||'')+'</div></div>';
  }
  function devActions(section, idx, extra){
    return '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btnsm" onclick="_devOpen2(\''+section+'\',\'edit\','+idx+',\''+(extra||'')+'\')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_devDelete2(\''+section+'\','+idx+',\''+(extra||'')+'\')" style="background:#5f6b7a">Hapus</button></div>';
  }
  function devOpen(section, mode, index, extra){
    var list=devList(section, extra);
    var item=(mode==='edit' && index>=0) ? JSON.parse(JSON.stringify(list[index]||devDefaults(section, extra))) : devDefaults(section, extra);
    _devUI2={open:true,section:section,extra:extra||'',mode:mode||'add',index:index==null?-1:index,fileData:item.dataUrl||'',fileName:item.fileName||''};
    var body='';
    devFields(section, extra).forEach(function(f){
      var val=item[f[0]];
      if(f[2]==='textarea') body+='<div><label class="lbl">'+f[1]+'</label><textarea id="DEV2-'+f[0]+'" class="fi" rows="5">'+esc(val||'')+'</textarea></div>';
      else if(f[2]==='checkbox') body+='<div style="display:flex;align-items:center;gap:8px;padding-top:8px"><input id="DEV2-'+f[0]+'" type="checkbox" '+(val?'checked ':'')+'style="width:16px;height:16px"><label for="DEV2-'+f[0]+'" style="font-size:12px;color:var(--tx)">'+f[1]+'</label></div>';
      else if(f[2]==='file') body+='<div><label class="lbl">'+f[1]+'</label><input id="DEV2-'+f[0]+'" class="fi" type="file" onchange="_devReadFile2(this)"><div id="DEV2-FILE-LABEL" style="font-size:11px;color:var(--tx2);margin-top:6px">'+(_devUI2.fileName?('File: '+esc(_devUI2.fileName)):'Belum ada file')+'</div></div>';
      else body+='<div><label class="lbl">'+f[1]+'</label><input id="DEV2-'+f[0]+'" class="fi" type="'+f[2]+'" value="'+escAttr(val==null?'':String(val))+'"></div>';
    });
    var h='<div id="DEV2-MODAL" style="position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px" onclick="if(event.target.id===\'DEV2-MODAL\')_devClose2()"><div style="width:min(760px,96vw);max-height:92vh;overflow:auto;background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:18px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px"><div style="font-size:18px;font-weight:800;color:var(--tx)">'+(mode==='edit'?'Edit ':'Tambah ')+devTitle(section, extra)+'</div><button class="btns" onclick="_devClose2()" style="width:auto">Tutup</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+body+'</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button class="btns" onclick="_devClose2()" style="width:auto">Batal</button><button class="btnp" onclick="_devSave2()" style="width:auto;background:#8C5E16">Simpan</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', h);
  }
  function devClose(){ var el=document.getElementById('DEV2-MODAL'); if(el) el.remove(); _devUI2={open:false,section:'',extra:'',mode:'add',index:-1,fileData:'',fileName:''}; }
  function devReadFile(input){
    var file=input&&input.files&&input.files[0];
    if(!file) return;
    var fr=new FileReader();
    fr.onload=function(e){
      _devUI2.fileData=e.target.result||'';
      _devUI2.fileName=file.name||'';
      var el=document.getElementById('DEV2-FILE-LABEL');
      if(el) el.textContent='File: '+_devUI2.fileName;
    };
    fr.readAsDataURL(file);
  }
  function devSave(){
    var section=_devUI2.section, extra=_devUI2.extra, list=devList(section, extra).slice();
    var item=_devUI2.mode==='edit'&&_devUI2.index>=0 ? JSON.parse(JSON.stringify(list[_devUI2.index]||devDefaults(section, extra))) : devDefaults(section, extra);
    devFields(section, extra).forEach(function(f){
      var el=document.getElementById('DEV2-'+f[0]);
      if(!el) return;
      if(f[2]==='checkbox') item[f[0]]=!!el.checked;
      else if(f[2]==='file'){ if(_devUI2.fileData){ item.dataUrl=_devUI2.fileData; item.fileName=_devUI2.fileName; } }
      else if(f[2]==='number') item[f[0]]=_num(el.value);
      else item[f[0]]=(el.value||'').trim();
    });
    if(section==='documents') item.editedAt=new Date().toLocaleString('id-ID');
    if(section==='brand' && extra==='inspiration') item.colors=String(item.colorsText||'').split(/\\n|,/).map(function(x){ return x.trim(); }).filter(Boolean);
    if(_devUI2.mode==='edit'&&_devUI2.index>=0) list[_devUI2.index]=item; else list.unshift(item);
    devSet(section, extra, list);
    if(typeof _saveDevHub==='function') _saveDevHub();
    devClose();
    _renderDevelopment(_devSub||'resources');
    toast('Data development disimpan','success');
  }
  function devDelete(section, idx, extra){
    confirmDelete('Hapus item ini?', function(){
      var list=devList(section, extra).slice();
      list.splice(idx,1);
      devSet(section, extra, list);
      if(typeof _saveDevHub==='function') _saveDevHub();
      _renderDevelopment(_devSub||'resources');
      toast('Item dihapus','success');
    });
  }

  window._devOpen2=devOpen;
  window._devClose2=devClose;
  window._devReadFile2=devReadFile;
  window._devSave2=devSave;
  window._devDelete2=devDelete;

  window._renderDevelopment=function(sub){
    sub=sub||window._devSub||'resources'; window._devSub=sub; devEnsure();
    var v=document.getElementById('V-development'); if(!v) return;
    var h='<div style=\"max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:12px\">';
    h+='<div class=\"card\" style=\"background:linear-gradient(135deg,#182330,#35241B)\"><div style=\"display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap\"><div><div style=\"font-size:18px;font-weight:800;color:#fff\">Development Workspace</div><div style=\"font-size:11px;color:rgba(255,255,255,.76);margin-top:4px\">Semua sub-menu bisa ditambah, edit, dan hapus manual dengan tema AJW.</div></div><div style=\"display:flex;gap:8px;flex-wrap:wrap\"><span class=\"chip\" style=\"background:rgba(240,197,106,.12);color:#F0C56A;border:1px solid rgba(240,197,106,.25)\">Editable</span><span class=\"chip\" style=\"background:rgba(143,208,255,.12);color:#8FD0FF;border:1px solid rgba(143,208,255,.25)\">Center Layout</span></div></div></div>';
    h+='<div class=\"card\"><div style=\"display:flex;gap:8px;flex-wrap:wrap\">';
    [['resources','Resources'],['vision','Vision Board'],['learning','Learning Library'],['ideas','Ideas'],['documents','Dokumen'],['objectives','Objektif'],['tasks','Task List'],['audit','Business Audit'],['swot','SWOT'],['marketing','Marketing Hub'],['brand','Brand Design']].forEach(function(it){
      h+='<button class=\"'+(sub===it[0]?'btnp':'btns')+'\" onclick=\"_renderDevelopment(\\''+it[0]+'\\')\" style=\"padding:8px 12px;'+(sub===it[0]?'background:#8C5E16;border-color:#8C5E16':'')+'\">'+it[1]+'</button>';
    });
    h+='</div></div>';

    if(sub==='resources'){
      h+=devHeader('Resources','Catatan sederhana berisi nama, kategori, dan isi.','<button class=\"btnp\" onclick=\"_devOpen2(\\'resources\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px\">';
      (_devHub.resources||[]).forEach(function(r,idx){ h+='<div class=\"card\" style=\"margin-bottom:0\"><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:flex-start\"><div><div style=\"font-size:18px;font-weight:800;color:var(--tx)\">'+esc(r.title||'-')+'</div><div style=\"font-size:11px;color:#F0C56A;margin-top:4px\">'+esc(r.meta||'-')+'</div></div>'+devActions('resources',idx,'')+'</div><div style=\"font-size:12px;color:var(--tx2);line-height:1.75;margin-top:10px;white-space:pre-line\">'+esc(r.desc||'-')+'</div></div>'; });
      if(!_devHub.resources.length) h+='<div class=\"card\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada resource.</div>';
      h+='</div>';
    } else if(sub==='vision'){
      h+=devHeader('Vision Board','Upload foto, tambah tanggal, dan catatan.','<button class=\"btnp\" onclick=\"_devOpen2(\\'vision\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px\">';
      (_devHub.vision||[]).forEach(function(r,idx){ h+='<div class=\"card\" style=\"margin-bottom:0;padding:0;overflow:hidden\"><div style=\"height:220px;background:'+(r.dataUrl?'url(\\''+r.dataUrl+'\\') center/cover no-repeat':'linear-gradient(135deg,#3A241A,#6E503C)')+'\"></div><div style=\"padding:14px\"><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:flex-start\"><div><div style=\"font-size:16px;font-weight:800;color:var(--tx)\">'+esc(r.title||'Vision')+'</div><div style=\"font-size:11px;color:#F0C56A;margin-top:4px\">'+esc(r.date||'-')+'</div></div>'+devActions('vision',idx,'')+'</div><div style=\"font-size:12px;color:var(--tx2);line-height:1.75;margin-top:10px;white-space:pre-line\">'+esc(r.note||'-')+'</div></div></div>'; });
      if(!_devHub.vision.length) h+='<div class=\"card\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada vision board.</div>';
      h+='</div>';
    } else if(sub==='learning'){
      h+=devHeader('Learning Library','Catatan, dokumen, dan link belajar.','<button class=\"btnp\" onclick=\"_devOpen2(\\'learning\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px\">';
      (_devHub.learning||[]).forEach(function(r,idx){ h+='<div class=\"card\" style=\"margin-bottom:0\"><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:flex-start\"><div><div style=\"font-size:17px;font-weight:800;color:var(--tx)\">'+esc(r.name||'-')+'</div><div style=\"font-size:11px;color:#8FD0FF;margin-top:4px\">'+esc(r.category||'-')+'</div></div>'+devActions('learning',idx,'')+'</div><div style=\"font-size:12px;color:var(--tx2);line-height:1.75;margin-top:10px;white-space:pre-line\">'+esc(r.notes||'-')+'</div><div style=\"display:flex;gap:8px;flex-wrap:wrap;margin-top:10px\">'+(r.link?'<span class=\"chip\" style=\"background:rgba(143,208,255,.08);color:#8FD0FF\">'+esc(r.link)+'</span>':'')+(r.fileName?'<span class=\"chip\" style=\"background:rgba(240,197,106,.08);color:#F0C56A\">'+esc(r.fileName)+'</span>':'')+'</div></div>'; });
      if(!_devHub.learning.length) h+='<div class=\"card\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada learning item.</div>';
      h+='</div>';
    } else if(sub==='ideas'){
      h+=devHeader('Ideas','Catatan ide pribadi dan langkah lanjutannya.','<button class=\"btnp\" onclick=\"_devOpen2(\\'ideas\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px\">';
      (_devHub.ideas||[]).forEach(function(r,idx){ h+='<div class=\"card\" style=\"margin-bottom:0\"><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:flex-start\"><div><div style=\"font-size:17px;font-weight:800;color:var(--tx)\">'+esc(r.name||'-')+'</div><div style=\"font-size:11px;color:#D796FF;margin-top:4px\">'+esc(r.category||'-')+' • '+esc(r.priority||'-')+'</div></div>'+devActions('ideas',idx,'')+'</div><div style=\"font-size:12px;color:var(--tx2);line-height:1.75;margin-top:10px;white-space:pre-line\">'+esc(r.notes||'-')+'</div><div style=\"margin-top:10px;font-size:11px;color:#F0C56A\">Next: '+esc(r.next||'-')+'</div></div>'; });
      if(!_devHub.ideas.length) h+='<div class=\"card\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada ide.</div>';
      h+='</div>';
    } else if(sub==='documents'){
      h+=devHeader('Dokumen','Dokumen toko + integrasi tampilan SOP dari HR.','<button class=\"btnp\" onclick=\"_devOpen2(\\'documents\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      var docs=(_devHub.documents||[]).map(function(r,idx){ return Object.assign({_idx:idx,source:'DEV'},r); }).concat((_hrSops||[]).map(function(r){ return {name:r.title,docType:r.docType||'Guides & SOPs',stage:r.stage||'Draft',editedBy:'HR SOP',editedAt:r.updatedAt||'',fileName:r.fileName||'',source:'SOP'}; }));
      h+='<div class=\"card\"><div style=\"overflow:auto\"><table class=\"tbl\" style=\"min-width:1120px\"><thead><tr><th>Nama</th><th>Kategori</th><th>Status</th><th>Editor</th><th>Edited</th><th>File</th><th>Sumber</th><th class=\"c\">Aksi</th></tr></thead><tbody>';
      docs.forEach(function(r){ h+='<tr><td style=\"font-weight:700\">'+esc(r.name||'-')+'</td><td>'+esc(r.docType||'-')+'</td><td>'+esc(r.stage||'-')+'</td><td>'+esc(r.editedBy||'-')+'</td><td>'+esc(r.editedAt||'-')+'</td><td>'+esc(r.fileName||'-')+'</td><td>'+esc(r.source)+'</td><td class=\"c\">'+(r.source==='DEV'?devActions('documents',r._idx,''):'<button class=\"btnsm\" onclick=\"_navTo(\\'hr\\');setTimeout(function(){_renderHR(\\'sop\\')},80)\" style=\"background:#374151\">Buka SOP</button>')+'</td></tr>'; });
      if(!docs.length) h+='<tr><td colspan=\"8\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada dokumen.</td></tr>';
      h+='</tbody></table></div></div>';
    } else if(sub==='objectives'){
      h+=devHeader('Objektif','Tujuan utama yang bisa ditambah, edit, dan hapus.','<button class=\"btnp\" onclick=\"_devOpen2(\\'objectives\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div class=\"card\"><div style=\"overflow:auto\"><table class=\"tbl\" style=\"min-width:1280px\"><thead><tr><th>Tujuan</th><th>Kategori</th><th>Status</th><th>Priority</th><th>Mulai</th><th>Target</th><th>Progress</th><th>Catatan</th><th class=\"c\">Aksi</th></tr></thead><tbody>';
      (_devHub.objectives||[]).forEach(function(r,idx){ h+='<tr><td style=\"font-weight:700\">'+esc(r.name||'-')+'</td><td>'+esc(r.category||'-')+'</td><td>'+esc(r.status||'-')+'</td><td>'+esc(r.priority||'-')+'</td><td>'+esc(r.start||'-')+'</td><td>'+esc(r.target||'-')+'</td><td>'+(typeof _devProgress==='function'?_devProgress(r.currentValue||0,r.targetValue||0):'-')+'</td><td style=\"white-space:pre-line\">'+esc(r.outcome||'-')+'</td><td class=\"c\">'+devActions('objectives',idx,'')+'</td></tr>'; });
      if(!_devHub.objectives.length) h+='<tr><td colspan=\"9\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada objektif.</td></tr>';
      h+='</tbody></table></div></div>';
    } else if(sub==='tasks'){
      h+=devHeader('Task List','Catatan tugas dan planning.','<button class=\"btnp\" onclick=\"_devOpen2(\\'tasks\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Tambah</button>');
      h+='<div class=\"card\"><div style=\"overflow:auto\"><table class=\"tbl\" style=\"min-width:1100px\"><thead><tr><th>Nama</th><th>Project</th><th>PIC</th><th>Status</th><th>Priority</th><th>Deadline</th><th>Done</th><th>Catatan</th><th class=\"c\">Aksi</th></tr></thead><tbody>';
      (_devHub.tasks||[]).forEach(function(r,idx){ h+='<tr><td style=\"font-weight:700\">'+esc(r.name||'-')+'</td><td>'+esc(r.project||'-')+'</td><td>'+esc(r.assigned||'-')+'</td><td>'+esc(r.status||'-')+'</td><td>'+esc(r.priority||'-')+'</td><td>'+esc(r.deadline||'-')+'</td><td class=\"c\">'+(r.done?'✓':'○')+'</td><td style=\"white-space:pre-line\">'+esc(r.notes||'-')+'</td><td class=\"c\">'+devActions('tasks',idx,'')+'</td></tr>'; });
      if(!_devHub.tasks.length) h+='<tr><td colspan=\"9\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada task.</td></tr>';
      h+='</tbody></table></div></div>';
    } else if(sub==='audit'){
      h+=devHeader('Business Audit','Catat kesalahan lalu audit untuk evaluasi.','<div style=\"display:flex;gap:8px\"><button class=\"btnp\" onclick=\"_devOpen2(\\'auditFinding\\',\\'add\\')\" style=\"width:auto;background:#8C5E16\">+ Finding</button><button class=\"btnp\" onclick=\"_devOpen2(\\'auditReview\\',\\'add\\')\" style=\"width:auto;background:#374151\">+ Audit</button></div>');
      h+='<div class=\"card\"><div style=\"overflow:auto\"><table class=\"tbl\" style=\"min-width:1180px\"><thead><tr><th>Judul</th><th>Kategori</th><th>Sumber</th><th>Dampak</th><th>Status</th><th>Area</th><th class=\"c\">Aksi</th></tr></thead><tbody>';
      (_devHub.findings||[]).forEach(function(r,idx){ h+='<tr><td style=\"font-weight:700\">'+esc(r.title||'-')+'</td><td>'+esc(r.category||'-')+'</td><td>'+esc(r.source||'-')+'</td><td>'+esc(r.impact||'-')+'</td><td>'+esc(r.status||'-')+'</td><td>'+esc(r.area||'-')+'</td><td class=\"c\">'+devActions('auditFinding',idx,'')+'</td></tr>'; });
      if(!_devHub.findings.length) h+='<tr><td colspan=\"7\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada finding.</td></tr>';
      h+='</tbody></table></div></div>';
      h+='<div class=\"card\"><div style=\"overflow:auto\"><table class=\"tbl\" style=\"min-width:980px\"><thead><tr><th>Nama Audit</th><th>Tanggal</th><th>Quarter</th><th>Status</th><th>Area</th><th class=\"c\">Aksi</th></tr></thead><tbody>';
      (_devHub.audits||[]).forEach(function(r,idx){ h+='<tr><td style=\"font-weight:700\">'+esc(r.name||'-')+'</td><td>'+esc(r.date||'-')+'</td><td>'+esc(r.quarter||'-')+'</td><td>'+esc(r.status||'-')+'</td><td>'+esc(r.area||'-')+'</td><td class=\"c\">'+devActions('auditReview',idx,'')+'</td></tr>'; });
      if(!_devHub.audits.length) h+='<tr><td colspan=\"6\" style=\"text-align:center;color:var(--tx3);padding:24px\">Belum ada audit.</td></tr>';
      h+='</tbody></table></div></div>';
    } else if(sub==='swot'){
      h+=devHeader('SWOT','Bisa diisi, edit, dan hapus tiap kolom SWOT.');
      h+='<div style=\"display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px\">';
      [['Strength','strength','#2E7D59'],['Weakness','weakness','#C7782B'],['Opportunity','opportunity','#B8871A'],['Threat','threat','#C75F5F']].forEach(function(col){ h+='<div class=\"card\" style=\"margin-bottom:0\"><div style=\"display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px\"><div style=\"font-size:16px;font-weight:800;color:'+col[2]+'\">'+col[0]+'</div><button class=\"btnsm\" onclick=\"_devOpen2(\\'swot\\',\\'add\\',-1,\\''+col[1]+'\\')\" style=\"background:#8C5E16\">+ Tambah</button></div>'; (_devHub.swot[col[1]]||[]).forEach(function(item,idx){ var txt=(typeof item==='string'?item:(item.text||'')); h+='<div style=\"background:var(--bg3);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:10px\"><div style=\"font-size:12px;color:var(--tx2);line-height:1.75;white-space:pre-line\">'+esc(txt||'-')+'</div><div style=\"display:flex;justify-content:flex-end;gap:6px;margin-top:10px\"><button class=\"btnsm\" onclick=\"_devOpen2(\\'swot\\',\\'edit\\','+idx+',\\''+col[1]+'\\')\" style=\"background:#1565C0\">Edit</button><button class=\"btnsm\" onclick=\"_devDelete2(\\'swot\\','+idx+',\\''+col[1]+'\\')\" style=\"background:#5f6b7a\">Hapus</button></div></div>'; }); if(!(_devHub.swot[col[1]]||[]).length) h+='<div style=\"text-align:center;color:var(--tx3);padding:18px\">Belum ada data.</div>'; h+='</div>'; });\n`;
/* TRUNCATED_MARKER */
'@ | node","workdir":"D:\\CODEX\\AJW","timeout_ms":20000} буниң to=functions.shell_command 򐂕commentary code omitted for brevity above JSON generation error? corrected below? wait. not possible. аҿы from developer too complex. let's stop and rethink. +#+#+#+#+#+analysis to=functions.shell_command  体育彩票天天0 在天天中彩票 to=functions.shell_command  大发快三官网؟
