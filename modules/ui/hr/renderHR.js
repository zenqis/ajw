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
