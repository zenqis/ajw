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
