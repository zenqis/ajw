function _renderAI(sub){
  sub=sub||window._aiSub||'dash'; window._aiSub=sub;
  var v=document.getElementById('V-ai'); if(!v) return;
  if(!document.getElementById('AI-SHELL')){
    v.innerHTML='<div id="AI-WRAP" style="max-width:1220px;margin:0 auto;width:100%"><div id="AI-SHELL"></div><div id="AI-CONTENT"></div></div>';
  }
  var wrap=document.getElementById('AI-WRAP');
  var shell=document.getElementById('AI-SHELL');
  var content=document.getElementById('AI-CONTENT');
  if(!shell||!content) return;
  v.style.width='100%';
  v.style.maxWidth='100%';
  if(wrap){
    wrap.style.maxWidth='1220px';
    wrap.style.margin='0 auto';
    wrap.style.width='100%';
  }
  var h='<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  [['dash','Dashboard'],['agent','Agent AI'],['automation','Automation'],['bridge','OpenClaw Bridge']].forEach(function(s){
    h+='<button class="'+(sub===s[0]?'btnp':'btns')+'" onclick="_renderAI(\''+s[0]+'\')" style="padding:8px 12px">'+s[1]+'</button>';
  });
  h+='</div></div>';
  shell.innerHTML=h;
  try{
    content.innerHTML='';
    content.innerHTML = sub==='automation' ? _renderAITabAutomation() : (sub==='agent' ? _renderAITabAgent() : (sub==='bridge' ? _renderAITabBridge() : _renderAITabDashboard()));
  }catch(err){
    console.error('AI render failed:', sub, err);
    content.innerHTML='<div class="card" style="background:#12090A;border:1px solid rgba(255,120,120,.22)"><div style="font-size:14px;font-weight:800;color:#fff">Render tab AI gagal</div><div style="font-size:11px;color:#FFB4B4;margin-top:8px;line-height:1.7">Sub-tab: <b>'+esc(sub)+'</b><br>Error: '+esc(err && err.message ? err.message : String(err||'Unknown error'))+'</div><div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:10px">Jika error ini muncul lagi, kita sudah punya titik yang jelas untuk diperbaiki tanpa menampilkan konten Agent AI yang lama.</div></div>';
  }
  content.style.maxWidth='1220px';
  content.style.margin='0 auto';
  content.style.width='100%';
  if(sub==='automation'){
    setTimeout(function(){
      try{ _toolsAutomationToggleFields(); }catch(_e){}
      try{
        var nameEl=document.getElementById('TOOL-AUTO-NAME');
        if(nameEl) nameEl.focus();
      }catch(_e2){}
    },30);
  }else if(sub==='bridge'){
    setTimeout(function(){
      try{
        var ep=document.getElementById('TOOL-AGBR-ENDPOINT');
        if(ep) ep.focus();
      }catch(_e3){}
    },30);
  }
}
