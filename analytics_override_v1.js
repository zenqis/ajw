(function(){
  function aEnsureViews(){
    var body = document.querySelector('.body');
    if(body && !document.getElementById('V-analytics')){
      var d = document.createElement('div');
      d.id = 'V-analytics';
      d.style.display = 'none';
      body.appendChild(d);
    }
  }

  function aDefault(){
    return {
      sales: [],
      service: [],
      promo: [],
      customers: []
    };
  }
  function aPurchaseDefault(){
    return {
      rows: [],
      geojson: null,
      excelName: '',
      geoName: '',
      updatedAt: ''
    };
  }

  function aNum(v){ return _num(v); }
  function aEsc(v){ return esc(v == null ? '' : String(v)); }
  function aAttr(v){ return escAttr(v == null ? '' : String(v)); }
  function aId(prefix){ return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
  function aToday(){ return typeof _todayYMD === 'function' ? _todayYMD() : new Date().toISOString().slice(0,10); }
  function aFmtDate(v){ return v ? new Date(v + 'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-'; }
  var A_PROTO_STYLE = 'https://api.protomaps.com/styles/v5/dark/id.json?key=b5173d17a11e8e1a';
  var A_MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
  var A_MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  var A_XLSX_JS = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  window._analyticsMap = window._analyticsMap || null;
  window._analyticsMapMarkers = window._analyticsMapMarkers || [];
  window._analyticsMapLoaded = window._analyticsMapLoaded || false;

  window._analyticsData = (function(){
    try{
      return JSON.parse(localStorage.getItem('ajw_analytics_data') || 'null') || aDefault();
    }catch(e){
      return aDefault();
    }
  })();
  window._analyticsPurchase = (function(){
    try{
      return JSON.parse(localStorage.getItem('ajw_analytics_purchase_map') || 'null') || aPurchaseDefault();
    }catch(e){
      return aPurchaseDefault();
    }
  })();

  ['sales','service','promo','customers'].forEach(function(key){
    if(!Array.isArray(_analyticsData[key])) _analyticsData[key] = [];
  });
  if(!_analyticsPurchase || typeof _analyticsPurchase !== 'object') _analyticsPurchase = aPurchaseDefault();
  if(!Array.isArray(_analyticsPurchase.rows)) _analyticsPurchase.rows = [];

  window._analyticsSub = window._analyticsSub || 'dash';
  window._analyticsUI = window._analyticsUI || {
    salesEdit:-1,
    serviceEdit:-1,
    promoEdit:-1,
    customerEdit:-1,
    customerModalMode:'manual',
    listSorts:{},
    customerCityExpanded:false,
    customerKabExpanded:false,
    purchaseMapExpanded:false
  };

  function aAnalyticsGeneralData(){
    return {
      sales: (_analyticsData && _analyticsData.sales) || [],
      service: (_analyticsData && _analyticsData.service) || [],
      promo: (_analyticsData && _analyticsData.promo) || []
    };
  }
  function aSavePurchaseStore(){
    try{
      localStorage.setItem('ajw_analytics_purchase_map', JSON.stringify(_analyticsPurchase || aPurchaseDefault()));
    }catch(e){}
  }

  function aCustomerIso(v){
    var d = aParseDateTime(v);
    return d ? d.toISOString() : null;
  }

  function aCustomerDbRecord(r, idx){
    var rec = r || {};
    return {
      id: String(rec.id || ('cust_' + idx + '_' + Date.now())).slice(0,120),
      upload_session_id: rec.uploadSessionId || null,
      upload_session_label: rec.uploadSessionLabel || null,
      source_type: rec.sourceType || 'manual',
      tanggal: rec.date || null,
      period_from: rec.importPeriodFrom || rec.date || null,
      period_to: rec.importPeriodTo || rec.date || null,
      order_number: rec.orderNumber || null,
      package_type: rec.packageType || null,
      marketplace: rec.marketplace || rec.channel || null,
      store_marketplace: rec.storeMarketplace || null,
      store_name: rec.storeName || null,
      buyer_name: rec.buyerName || rec.name || null,
      receiver_name: rec.receiverName || null,
      phone: rec.phone || null,
      postal_code: rec.postalCode || null,
      province: rec.province || null,
      city: rec.city || null,
      district: rec.district || null,
      address: rec.address || null,
      sku: rec.sku || null,
      warehouse_sku: rec.warehouseSku || null,
      warehouse_sku_name: rec.warehouseSkuName || null,
      product_name: rec.productName || null,
      variant_name: rec.variantName || null,
      quantity: aNum(rec.quantity || rec.orders || 0),
      unit_price: aNum(rec.unitPrice),
      product_subtotal: aNum(rec.productSubtotal),
      product_cost: aNum(rec.productCost),
      shipping_service: rec.shippingService || null,
      tracking_number: rec.trackingNumber || null,
      total_order: aNum(rec.totalOrder || rec.revenue),
      payment_method: rec.paymentMethod || null,
      order_created_at: aCustomerIso(rec.orderCreatedAt || rec.date),
      completed_at: aCustomerIso(rec.completedAt),
      country: rec.country || 'Indonesia',
      data: rec,
      updated_at: new Date().toISOString()
    };
  }

  function aBatchReplaceTable(table, keyField, records, batchSize){
    if(!SB || !SB.init()) return Promise.reject(new Error('Supabase belum dikonfigurasi'));
    keyField = keyField || 'id';
    records = records || [];
    batchSize = batchSize || ((typeof _sbSafeBatchSize === 'function') ? Math.max(40, Math.min(_sbSafeBatchSize(), 100)) : 100);
    return SB.request('DELETE', '/rest/v1/' + table + '?' + keyField + '=not.is.null', {
      headers: {'Prefer':'return=minimal'}
    }).catch(function(err){
      if(err && err.status === 404) throw err;
      return {ok:true};
    }).then(function(){
      if(!records.length) return {ok:true};
      var chain = Promise.resolve();
      for(var i=0;i<records.length;i+=batchSize){
        (function(chunk){
          chain = chain.then(function(){ return SB.upsertMany(table, chunk); });
        })(records.slice(i, i + batchSize));
      }
      return chain;
    });
  }

  function syncAnalyticsCustomersToSupabase(silent){
    if(!SB || !SB.init()) return Promise.resolve({ok:false, skipped:true});
    var rows = (_analyticsData && _analyticsData.customers) || [];
    var customerBatch = (typeof _sbSafeBatchSize === 'function') ? Math.max(40, Math.min(_sbSafeBatchSize(), 100)) : 100;
    return aBatchReplaceTable('ajw_customer_data', 'id', rows.map(aCustomerDbRecord), customerBatch).then(function(res){
      window._analyticsCustomerDirty = false;
      return res;
    }).catch(function(err){
      console.warn('analytics customer sync', err);
      if(!silent && typeof toast === 'function') toast('Customer Data lokal tersimpan, tetapi sync cloud customer gagal.', 'warn', 5000);
      return {ok:false, error:err};
    });
  }

  function aQueueAnalyticsCloud(scope){
    try{
      var c = getCfg();
      if(!c.supabaseUrl || !c.supabaseKey) return;
      if(window._analyticsCloudPersistT) clearTimeout(window._analyticsCloudPersistT);
      window._analyticsCloudPersistT = setTimeout(function(){
        var job = typeof syncAllToSupabase === 'function'
          ? syncAllToSupabase(true)
          : (scope === 'customers' ? syncAnalyticsCustomersToSupabase(true) : Promise.resolve());
        Promise.resolve(job).catch(function(e){
          console.warn('analytics cloud sync fail:', scope || 'analytics', e);
        });
      }, (typeof _sbSafeModeEnabled === 'function' && _sbSafeModeEnabled()) ? (scope === 'customers' ? 7000 : 5000) : (scope === 'customers' ? 1800 : 1200));
    }catch(e){}
  }

  function aSave(scope){
    sv('ajw_analytics_data', _analyticsData || aDefault());
    if(scope === 'customers'){
      window._analyticsCustomerDirty = true;
      aQueueAnalyticsCloud('customers');
    }else{
      aQueueAnalyticsCloud('analytics_meta');
    }
  }

  function aResetEdit(section){
    if(section === 'sales') _analyticsUI.salesEdit = -1;
    if(section === 'service') _analyticsUI.serviceEdit = -1;
    if(section === 'promo') _analyticsUI.promoEdit = -1;
    if(section === 'customers') _analyticsUI.customerEdit = -1;
  }

  function aSetEdit(section, idx){
    aResetEdit(section);
    if(section === 'sales') _analyticsUI.salesEdit = idx;
    if(section === 'service') _analyticsUI.serviceEdit = idx;
    if(section === 'promo') _analyticsUI.promoEdit = idx;
    if(section === 'customers') _analyticsUI.customerEdit = idx;
    _renderAnalytics(_analyticsSub || 'dash');
  }

  function aDelete(section, idx){
    confirmDelete('Hapus data analytics ini?', function(){
      (_analyticsData[section] || []).splice(idx,1);
      aResetEdit(section);
      aSave(section === 'customers' ? 'customers' : 'general');
      toast('Data analytics dihapus','success');
      _renderAnalytics(_analyticsSub || 'dash');
      if(section === 'customers' && document.getElementById('ANA-CUSTOMER-MODAL') && _analyticsUI.customerModalMode === 'manage'){
        aOpenCustomerModal('manage');
      }
    });
  }

  function aCustomerKind(city){
    var norm = aNorm(city);
    if(!norm) return 'kota';
    if(/^kab /.test(norm) || /^kabupaten /.test(norm)) return 'kabupaten';
    return 'kota';
  }

  function aCustomerGroupsByKind(rows, kind){
    return aCustomerGroups((rows || []).filter(function(r){ return aCustomerKind(r.city) === kind; }));
  }

  function aCustomerSessions(rows){
    var grouped = {};
    (rows || []).forEach(function(r){
      var key = r.uploadSessionId || ('manual_' + (r.date || 'nodate'));
      if(!grouped[key]){
        grouped[key] = {
          id:key,
          label:r.uploadSessionLabel || (r.sourceType === 'import' ? 'Import tanpa label' : 'Input manual'),
          from:r.importPeriodFrom || r.date || '',
          to:r.importPeriodTo || r.date || '',
          count:0,
          omzet:0,
          orders:0,
          type:r.sourceType || 'manual',
          fileName:r.importFileName || ''
        };
      }
      grouped[key].count += 1;
      grouped[key].orders += aNum(r.orders);
      grouped[key].omzet += aNum(r.revenue);
    });
    return Object.keys(grouped).map(function(k){ return grouped[k]; }).sort(function(a,b){
      return String(b.from || '').localeCompare(String(a.from || ''));
    });
  }

  function aExtractTagged(note, label){
    var txt = String(note || '');
    var re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*:\\s*([^|]+)');
    var m = txt.match(re);
    return m ? String(m[1]).trim() : '';
  }

  function aModeInfo(values){
    var count = {};
    (values || []).forEach(function(v){
      v = String(v || '').trim();
      if(!v) return;
      count[v] = (count[v] || 0) + 1;
    });
    var items = Object.keys(count).map(function(k){ return {label:k, count:count[k]}; }).sort(function(a,b){ return b.count - a.count; });
    return items[0] || {label:'-', count:0};
  }

  function aNormCode(v){
    return String(v || '').toLowerCase().replace(/[^a-z0-9]/g,'');
  }

  function aOrderKey(r){
    return String(r.orderNumber || '').trim() || [r.date || '', r.name || r.phone || '', r.channel || '', r.totalOrder || r.revenue || ''].join('|');
  }

  function aParseDateTime(v){
    var s = String(v || '').trim();
    if(!s) return null;
    var norm = s.replace(/\//g,'-');
    if(/^\d{4}-\d{2}-\d{2}$/.test(norm)) norm += ' 00:00';
    if(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(norm)){
      var d = new Date(norm.replace(' ','T'));
      return isNaN(d.getTime()) ? null : d;
    }
    var d2 = new Date(s);
    return isNaN(d2.getTime()) ? null : d2;
  }

  function aTopCounts(items, limit){
    limit = limit || 6;
    return (items || []).sort(function(a,b){ return b.value - a.value; }).slice(0, limit);
  }

  function aCountRows(rows, getter, valueGetter){
    var map = {};
    (rows || []).forEach(function(r){
      var label = String(getter(r) || '').trim() || '-';
      if(!map[label]) map[label] = {label:label, value:0, extra:0};
      map[label].value += 1;
      map[label].extra += valueGetter ? aNum(valueGetter(r)) : 0;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a,b){ return b.value - a.value; });
  }

  function aUniqueOrders(rows){
    var map = {};
    (rows || []).forEach(function(r){
      var key = aOrderKey(r);
      if(!map[key]){
        map[key] = Object.assign({
          _key:key,
          rows:0,
          quantityTotal:0,
          subtotalTotal:0,
          voucherTotal:0,
          discountTotal:0
        }, r);
      }
      var o = map[key];
      o.rows += 1;
      o.quantityTotal += aNum(r.quantity || r.orders || 1);
      o.subtotalTotal += aNum(r.productSubtotal || r.unitPrice) * Math.max(1,aNum(r.quantity || r.orders || 1));
      o.voucherTotal += aNum(r.voucherAmount) + aNum(r.storeVoucherAmount);
      o.discountTotal += aNum(r.sellerDiscountAmount);
      if(!o.totalOrder && r.totalOrder) o.totalOrder = r.totalOrder;
      if(!o.orderCreatedAt && r.orderCreatedAt) o.orderCreatedAt = r.orderCreatedAt;
      if(!o.completedAt && r.completedAt) o.completedAt = r.completedAt;
      if(!o.phone && r.phone) o.phone = r.phone;
      if(!o.postalCode && r.postalCode) o.postalCode = r.postalCode;
      if(!o.city && r.city) o.city = r.city;
      if(!o.province && r.province) o.province = r.province;
      if(!o.channel && r.channel) o.channel = r.channel;
      if(!o.marketplace && r.marketplace) o.marketplace = r.marketplace;
      if(!o.storeMarketplace && r.storeMarketplace) o.storeMarketplace = r.storeMarketplace;
      if(!o.storeName && r.storeName) o.storeName = r.storeName;
      if(!o.paymentMethod && r.paymentMethod) o.paymentMethod = r.paymentMethod;
      if(!o.packageType && r.packageType) o.packageType = r.packageType;
      if(!o.trackingNumber && r.trackingNumber) o.trackingNumber = r.trackingNumber;
    });
    return Object.keys(map).map(function(k){
      var o = map[k];
      if(!aNum(o.totalOrder)) o.totalOrder = aNum(o.subtotalTotal);
      return o;
    }).sort(function(a,b){ return String(b.date || '').localeCompare(String(a.date || '')); });
  }

  function aCountOrders(orders, getter, valueGetter){
    var map = {};
    (orders || []).forEach(function(o){
      var label = String(getter(o) || '').trim() || '-';
      if(!map[label]) map[label] = {label:label, value:0, extra:0};
      map[label].value += 1;
      map[label].extra += valueGetter ? aNum(valueGetter(o)) : 0;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a,b){ return b.value - a.value; });
  }

  function aPanelCache(id, title, html){
    window._analyticsPanelCache = window._analyticsPanelCache || {};
    window._analyticsPanelCache[id] = { title:title, html:html };
  }

  function aPanelButton(id){
    return '<button class="btnsm" title="Perluas" onclick="_analyticsOpenPanel2(\''+aAttr(id)+'\')" style="width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:#12181f;border:1px solid rgba(255,255,255,.08);color:#dbe7f1;font-size:13px;line-height:1">⤢</button>';
  }

  function aPanelModalOpen(id){
    var cache = (window._analyticsPanelCache || {})[id];
    if(!cache) return;
    var old = document.getElementById('ANA-PANEL-MODAL');
    if(old) old.remove();
    var wrap = document.createElement('div');
    wrap.id = 'ANA-PANEL-MODAL';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,10,.72);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:28px';
    wrap.innerHTML = '<div style="width:min(1100px,96vw);max-height:88vh;overflow:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#0f141a,#090d12);box-shadow:0 28px 70px rgba(0,0,0,.45)"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07)"><div style="font-size:13px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em">'+aEsc(cache.title)+'</div><button class="btnsm" onclick="_analyticsClosePanel2()" style="background:#171d25;border:1px solid rgba(255,255,255,.1);color:#dbe7f1">Tutup</button></div><div style="padding:16px;max-height:calc(88vh - 58px);overflow:auto">'+cache.html+'</div></div>';
    wrap.addEventListener('click', function(ev){ if(ev.target === wrap) aPanelModalClose(); });
    document.body.appendChild(wrap);
  }

  function aPanelModalClose(){
    var el = document.getElementById('ANA-PANEL-MODAL');
    if(el) el.remove();
  }

  function aCompactMetric(label, value, accent, note){
    return '<div class="card" style="margin-bottom:0;padding:10px 11px;border:1px solid rgba(255,255,255,.06);border-top:1px solid '+accent+';background:#090909;box-shadow:none"><div style="font-size:9px;color:rgba(255,255,255,.48);text-transform:uppercase;font-weight:800;letter-spacing:.10em">'+label+'</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:6px;line-height:1.1">'+value+'</div><div style="font-size:9px;color:#7e8e9c;margin-top:5px;line-height:1.3">'+note+'</div></div>';
  }

  function aDonutCompare(title, items, accent, innerOnly){
    items = (items || []).filter(function(x){ return x && x.value > 0; });
    var colors = ['#F0C56A','#3FD0FF','#7CF1A3','#FF9A1F','#FF6B8A','#9A7CFF','#67E8F9'];
    var total = items.reduce(function(t,x){ return t + x.value; },0) || 1;
    var start = 0;
    var gradient = items.slice(0,6).map(function(item, idx){
      var pct = (item.value / total) * 100;
      var end = start + pct;
      var c = colors[idx % colors.length];
      var out = c + ' ' + start.toFixed(2) + '% ' + end.toFixed(2) + '%';
      start = end;
      return out;
    }).join(', ');
    var legend = items.slice(0,4).map(function(item, idx){
      var pct = aPct(item.value,total).toFixed(1);
      return '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span style="width:8px;height:8px;border-radius:999px;background:'+colors[idx % colors.length]+'"></span><span style="font-size:10px;color:#dfe8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+aEsc(item.label)+'</span><span style="font-size:10px;color:#fff;font-weight:800">'+pct+'%</span></div>';
    }).join('');
    var panelId = 'analytics_panel_' + aNorm(title).replace(/\s+/g,'_');
    var fullLegend = items.map(function(item, idx){
      var pct = aPct(item.value,total).toFixed(1);
      return '<div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span style="width:10px;height:10px;border-radius:999px;background:'+colors[idx % colors.length]+'"></span><span style="font-size:12px;color:#fff;font-weight:700">'+aEsc(item.label)+'</span><span style="font-size:11px;color:#8FD0FF">'+item.value+' item</span><span style="font-size:11px;color:#F0C56A;font-weight:800">'+pct+'%</span></div>';
    }).join('') || '<div style="font-size:12px;color:#8BA5BC">Belum ada data.</div>';
    aPanelCache(panelId, title, '<div style="display:grid;grid-template-columns:140px 1fr;gap:18px;align-items:flex-start"><div style="width:132px;height:132px;margin:auto;border-radius:999px;background:conic-gradient('+gradient+');display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 14px #0d1218"><div style="width:64px;height:64px;border-radius:999px;background:#0d1218;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:12px;color:'+(accent||'#F0C56A')+';font-weight:800">'+items.length+'</div></div><div>'+fullLegend+'</div></div>');
    var body = '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px"><div style="min-width:0"><div style="font-size:11px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em">'+title+'</div><div style="font-size:10px;color:#8BA5BC;margin-top:4px">'+items.length+' kategori aktif</div></div>'+aPanelButton(panelId)+'</div><div style="display:grid;grid-template-columns:86px 1fr;gap:10px;align-items:center"><div style="width:82px;height:82px;margin:auto;border-radius:999px;background:conic-gradient('+gradient+');display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 10px #0d1218"><div style="width:42px;height:42px;border-radius:999px;background:#0d1218;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:10px;color:'+(accent||'#F0C56A')+';font-weight:800">'+items.length+'</div></div><div>'+legend+'<div style="font-size:10px;color:#70879a;margin-top:6px">Klik ⤢ untuk detail penuh</div></div></div>';
    return innerOnly ? body : '<div class="card" style="padding:10px 11px;background:#090909;border:1px solid rgba(255,255,255,.06);box-shadow:none">'+body+'</div>';
  }

  function aRankList(title, items, note, formatter, maxHeight){
    items = (items || []).slice();
    var sortKey = aNorm(title);
    var mode = (_analyticsUI.listSorts || {})[sortKey] || 'desc';
    if(mode === 'asc') items.sort(function(a,b){ return a.value - b.value || String(a.label).localeCompare(String(b.label)); });
    else if(mode === 'az') items.sort(function(a,b){ return String(a.label).localeCompare(String(b.label)); });
    else items.sort(function(a,b){ return b.value - a.value || String(a.label).localeCompare(String(b.label)); });
    var badge = mode === 'asc' ? 'LOW-HIGH' : (mode === 'az' ? 'A-Z' : 'HIGH-LOW');
    var fullItems = (items.length ? items : [{label:'Belum ada data', value:0, extra:0}]).slice(0, 20);
    var panelId = 'analytics_panel_' + aNorm(title).replace(/\s+/g,'_');
    var fullHtml = '<div style="display:flex;flex-direction:column;gap:8px">'+fullItems.map(function(item, idx){
      var top = idx === 0 && item.value > 0;
      return '<div style="padding:11px 12px;border-radius:12px;background:'+(top?'rgba(240,197,106,.03)':'rgba(255,255,255,.03)')+';border:1px solid '+(top?'rgba(240,197,106,.45)':'rgba(255,255,255,.06)')+'"><div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center"><span style="font-size:11px;color:'+(top?'#F0C56A':'#8FD0FF')+';font-weight:800">'+(idx+1)+'.</span><div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="font-size:12px;color:#fff;font-weight:800">'+aEsc(item.label)+'</div>'+(top?'<span style="padding:2px 7px;border-radius:999px;border:1px solid rgba(240,197,106,.45);background:transparent;font-size:9px;color:#F0C56A;font-weight:800">TOP</span>':'')+'</div><div style="font-size:10px;color:#8BA5BC;margin-top:3px">'+(formatter ? formatter(item) : (item.value + ' data'))+'</div></div><div style="font-size:12px;color:#F0C56A;font-weight:800">'+item.value+'</div></div></div>';
    }).join('')+'</div>';
    aPanelCache(panelId, title, fullHtml);
    return '<div class="card" style="padding:10px 11px;background:#090909;border:1px solid rgba(255,255,255,.06);box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.05)"><div style="min-width:0"><div style="font-size:10px;font-weight:800;color:rgba(255,255,255,.62);text-transform:uppercase;letter-spacing:.10em">'+title+'</div><div style="font-size:9px;color:#798897;margin-top:4px">'+aEsc(note || '')+'</div></div><div style="display:flex;align-items:center;gap:6px"><span style="padding:3px 7px;border-radius:999px;border:1px solid rgba(63,208,255,.18);background:rgba(63,208,255,.05);font-size:8px;color:#8FD0FF;font-weight:800">'+badge+'</span><button class="btnsm" onclick="_analyticsToggleListSort2(\''+aAttr(sortKey)+'\')" style="padding:4px 7px;background:#101418;border:1px solid rgba(255,255,255,.08);color:#dbe7f1">Sort</button>'+aPanelButton(panelId)+'</div></div><div style="display:flex;flex-direction:column;gap:7px;max-height:'+(maxHeight || 220)+'px;overflow:auto">'+
      fullItems.slice(0, 6).map(function(item, idx){
        var top = idx === 0 && item.value > 0;
        return '<div style="padding:8px 10px;border-radius:12px;background:'+(top?'rgba(240,197,106,.03)':'rgba(255,255,255,.03)')+';border:1px solid '+(top?'rgba(240,197,106,.45)':'rgba(255,255,255,.06)')+'"><div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center"><span style="font-size:10px;color:'+(top?'#F0C56A':'#8FD0FF')+';font-weight:800">'+(idx+1)+'.</span><div style="min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="font-size:11px;color:#fff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">'+aEsc(item.label)+'</div>'+(top?'<span style="padding:1px 6px;border-radius:999px;border:1px solid rgba(240,197,106,.45);background:transparent;font-size:8px;color:#F0C56A;font-weight:800">TOP</span>':'')+'</div><div style="font-size:9px;color:#8BA5BC;margin-top:3px">'+(formatter ? formatter(item) : (item.value + ' data'))+'</div></div><div style="font-size:11px;color:#F0C56A;font-weight:800">'+item.value+'</div></div></div>';
      }).join('')+
    (fullItems.length > 6 ? '<div style="font-size:10px;color:#70879a;text-align:center;padding-top:4px">+'+(fullItems.length - 6)+' item lain • klik ⤢ untuk detail</div>' : '')+
    '</div></div>';
  }

  function aCustomerStatsTable(title, rows, expandedKey, emptyText){
    rows = rows || [];
    var expanded = !!_analyticsUI[expandedKey];
    var shown = expanded ? rows : rows.slice(0,20);
    var h = '<div class="card" style="padding:0;background:#050505;border:1px solid rgba(255,255,255,.06);overflow:hidden;box-shadow:none">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 11px;border-bottom:1px solid rgba(255,255,255,.06);background:#080808">';
    h += '<div style="font-size:10px;font-weight:800;color:rgba(255,255,255,.58);text-transform:uppercase;letter-spacing:.10em">'+title+'</div>';
    h += '<div style="display:flex;align-items:center;gap:8px">';
    h += '<span style="font-size:9px;color:#6f8397">'+rows.length+' wilayah</span>';
    if(rows.length > 20){
      h += '<button class="btnsm" onclick="_analyticsToggleStatsTable2(\''+aAttr(expandedKey)+'\')" style="padding:4px 8px;background:#0b0b0b;border:1px solid rgba(255,255,255,.08);color:#dbe7f1">'+(expanded?'Tutup':'Buka Semua')+'</button>';
    }
    h += '</div></div>';
    h += '<div style="overflow:auto"><table class="tbl" style="min-width:720px;background:#050505"><thead><tr><th>Wilayah</th><th>Provinsi</th><th>Rows</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>';
    shown.forEach(function(g){
      h += '<tr><td style="font-weight:700">'+aEsc(g.city)+'</td><td>'+aEsc(g.province||'-')+'</td><td>'+g.rows+'</td><td>'+g.count+'</td><td style="color:#F0C56A;font-weight:800">Rp '+fmt(g.omzet)+'</td></tr>';
    });
    if(!shown.length) h += aEmpty(emptyText || 'Belum ada data.');
    h += '</tbody></table></div>';
    if(rows.length > 20 && !expanded){
      h += '<div style="padding:8px 11px;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#70879a;text-align:center">Menampilkan 20 wilayah teratas • klik "Buka Semua" untuk melihat sisanya</div>';
    }
    h += '</div>';
    return h;
  }

  function aCustomerDerived(rows){
    rows = rows || [];
    var orders = aUniqueOrders(rows);
    var countries = [];
    var marketplaces = [];
    var stores = [];
    var storeMarkets = [];
    var skus = [];
    var methods = [];
    var packageTypes = [];
    var voucherTotal = 0;
    var discountTotal = 0;
    var validTimes = [];
    var durations = [];
    var phones = {};
    var postals = {};
    var tracking = {};
    rows.forEach(function(r){
      var sku = r.sku || r.warehouseSku || aExtractTagged(r.note, 'SKU') || aExtractTagged(r.note, 'SKU Gudang');
      skus.push(sku);
    });
    orders.forEach(function(r){
      var country = r.country || aExtractTagged(r.note, 'Negara');
      var storeName = r.storeName || r.storeMarketplace || r.name || '';
      var method = r.paymentMethod || aExtractTagged(r.note, 'Payment');
      var voucher = aNumLoose(r.voucherAmount != null ? r.voucherAmount : aExtractTagged(r.note, 'Voucher'));
      var storeVoucher = aNumLoose(r.storeVoucherAmount != null ? r.storeVoucherAmount : aExtractTagged(r.note, 'Voucher Toko'));
      var sellerDiscount = aNumLoose(r.sellerDiscountAmount != null ? r.sellerDiscountAmount : aExtractTagged(r.note, 'Diskon Penjual'));
      var rawTime = String(r.orderCreatedAt || r.date || '');
      countries.push(country || 'Indonesia');
      marketplaces.push(r.marketplace || r.channel || 'Marketplace');
      stores.push(storeName);
      storeMarkets.push(r.storeMarketplace || '-');
      methods.push(method);
      packageTypes.push(r.packageType || '-');
      voucherTotal += voucher + storeVoucher;
      discountTotal += sellerDiscount;
      var tm = rawTime.match(/(\d{1,2}):(\d{2})/);
      if(tm){
        validTimes.push((parseInt(tm[1],10) * 60) + parseInt(tm[2],10));
      }
      var created = aParseDateTime(r.orderCreatedAt || r.date);
      var done = aParseDateTime(r.completedAt);
      if(created && done && done >= created) durations.push((done.getTime() - created.getTime()) / 3600000);
      if(r.phone){
        if(!phones[r.phone]) phones[r.phone] = {label:r.phone, value:0};
        phones[r.phone].value += 1;
      }
      if(r.postalCode){
        var pk = String(r.postalCode).trim() + ' • ' + (r.city || '-');
        if(!postals[pk]) postals[pk] = {label:pk, value:0};
        postals[pk].value += 1;
      }
      if(r.trackingNumber){
        if(!tracking[r.trackingNumber]) tracking[r.trackingNumber] = {label:r.trackingNumber, value:0, marketplace:r.marketplace || r.channel || '-', city:r.city || '-'};
        tracking[r.trackingNumber].value += 1;
      }
    });
    var skuCounts = aCountRows(rows, function(r){ return r.sku || r.warehouseSku || '-'; }, function(r){ return aNum(r.quantity || r.orders || 1); });
    var skuMismatch = aCountRows(rows.filter(function(r){ return r.sku && r.warehouseSku && aNormCode(r.sku) !== aNormCode(r.warehouseSku); }), function(r){ return (r.sku || '-') + ' <> ' + (r.warehouseSku || '-'); });
    var skuProfit = aCountRows(rows, function(r){ return (r.productName || r.sku || r.warehouseSku || '-') + ' [' + (r.sku || r.warehouseSku || '-') + ']'; }, function(r){ return aNum(r.quantity || r.orders || 1); }).map(function(item){
      var related = rows.filter(function(r){ return ((r.productName || r.sku || r.warehouseSku || '-') + ' [' + (r.sku || r.warehouseSku || '-') + ']') === item.label; });
      var qty = related.reduce(function(t,r){ return t + Math.max(1,aNum(r.quantity || r.orders || 1)); },0) || 1;
      var sell = related.reduce(function(t,r){ return t + (aNum(r.unitPrice || r.productSubtotal || r.totalOrder) * Math.max(1,aNum(r.quantity || r.orders || 1))); },0) / qty;
      var cost = related.reduce(function(t,r){ return t + (aNum(r.productCost) * Math.max(1,aNum(r.quantity || r.orders || 1))); },0) / qty;
      item.sell = sell;
      item.cost = cost;
      item.profit = sell - cost;
      return item;
    }).slice(0,20);
    var byHourMap = {};
    var recentByHourMap = {};
    var now = Date.now();
    orders.forEach(function(r){
      var created = aParseDateTime(r.orderCreatedAt || r.date);
      if(!created) return;
      var hourKey = String(created.getHours()).padStart(2,'0') + ':00';
      byHourMap[hourKey] = (byHourMap[hourKey] || 0) + 1;
      if(now - created.getTime() <= 10 * 24 * 3600000){
        recentByHourMap[hourKey] = (recentByHourMap[hourKey] || 0) + 1;
      }
    });
    var avgMinutes = validTimes.length ? Math.round(validTimes.reduce(function(t,v){ return t + v; },0) / validTimes.length) : 0;
    var avgHour = validTimes.length ? String(Math.floor(avgMinutes / 60)).padStart(2,'0') + ':' + String(avgMinutes % 60).padStart(2,'0') : '-';
    var topMethod = aModeInfo(methods.filter(Boolean));
    return {
      orderCount: orders.length,
      orders: orders,
      dominantCountry: aModeInfo(countries),
      dominantMarketplace: aModeInfo(marketplaces),
      dominantStore: aModeInfo(stores.filter(Boolean)),
      dominantStoreMarketplace: aModeInfo(storeMarkets.filter(Boolean)),
      topSku: aModeInfo(skus.filter(Boolean)),
      topMethod: topMethod,
      paymentRatio: orders.length ? aPct(topMethod.count, orders.length) : 0,
      voucherTotal: voucherTotal,
      discountTotal: discountTotal,
      averageOrderTime: avgHour,
      averageDurationHours: durations.length ? (durations.reduce(function(t,v){ return t + v; },0) / durations.length) : 0,
      marketplaceCompare: aCountOrders(orders, function(o){ return o.marketplace || o.channel || 'Marketplace'; }),
      storeCompare: aCountOrders(orders, function(o){ return o.storeName || '-'; }),
      storeMarketplaceCompare: aCountOrders(orders, function(o){ return o.storeMarketplace || '-'; }),
      paymentCompare: aCountOrders(orders, function(o){ return o.paymentMethod || '-'; }),
      packageCompare: aCountOrders(orders, function(o){ return o.packageType || '-'; }),
      phoneBook: Object.keys(phones).map(function(k){ return phones[k]; }).sort(function(a,b){ return b.value - a.value; }),
      postalRanks: Object.keys(postals).map(function(k){ return postals[k]; }).sort(function(a,b){ return b.value - a.value; }),
      trackingList: Object.keys(tracking).map(function(k){ return tracking[k]; }).sort(function(a,b){ return String(a.label).localeCompare(String(b.label)); }),
      skuTop20: skuCounts.slice(0,20),
      skuMismatch: skuMismatch,
      skuProfit: skuProfit,
      byHour: Object.keys(byHourMap).map(function(k){ return {label:k, value:byHourMap[k]}; }).sort(function(a,b){ return a.label.localeCompare(b.label); }),
      recentByHour: Object.keys(recentByHourMap).map(function(k){ return {label:k, value:recentByHourMap[k]}; }).sort(function(a,b){ return a.label.localeCompare(b.label); }),
      buyerRepeat: aCountOrders(orders, function(o){ return o.buyerName || o.name || '-'; }),
      repeatBuyerCount: aCountOrders(orders, function(o){ return o.buyerName || o.name || '-'; }).filter(function(x){ return x.label !== '-' && x.value > 1; }).length,
      repeatOrderCount: aCountOrders(orders, function(o){ return o.buyerName || o.name || '-'; }).filter(function(x){ return x.label !== '-' && x.value > 1; }).reduce(function(t,x){ return t + x.value; },0)
    };
  }

  function aMetric(label, value, accent, note){
    return '<div class="card" style="margin-bottom:0;border-top:3px solid '+accent+'"><div style="font-size:10px;color:'+accent+';text-transform:uppercase;font-weight:800;letter-spacing:.08em">'+label+'</div><div style="font-size:26px;font-weight:800;color:var(--tx);margin-top:8px">'+value+'</div><div style="font-size:11px;color:var(--tx2);margin-top:8px">'+note+'</div></div>';
  }

  function aPct(part,total){
    part = aNum(part);
    total = aNum(total);
    if(!total) return 0;
    return (part / total) * 100;
  }

  function aSectionHeader(title, subtitle, right){
    return '<div class="card" style="background:linear-gradient(135deg,#111821,#2A1E17);margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800;color:#fff">'+title+'</div><div style="font-size:11px;color:rgba(255,255,255,.76);margin-top:4px">'+subtitle+'</div></div>'+(right||'')+'</div></div>';
  }

  function aInput(label, id, type, value, placeholder, extra){
    return '<div><label class="lbl">'+label+'</label><input id="'+id+'" class="fi" type="'+type+'" value="'+aAttr(value||'')+'" placeholder="'+aAttr(placeholder||'')+'" '+(extra||'')+'></div>';
  }

  function aText(label, id, value, placeholder, rows){
    return '<div><label class="lbl">'+label+'</label><textarea id="'+id+'" class="fi" rows="'+(rows||3)+'" placeholder="'+aAttr(placeholder||'')+'">'+aEsc(value||'')+'</textarea></div>';
  }

  function aEmpty(msg){
    return '<tr><td colspan="99" style="text-align:center;color:var(--tx3);padding:22px">'+msg+'</td></tr>';
  }

  function aTrendSvg(values, color){
    var vals = values.length ? values : [0,0,0,0,0];
    var max = Math.max.apply(null, vals.concat([1]));
    var min = Math.min.apply(null, vals.concat([0]));
    var span = Math.max(1, max - min);
    var pts = vals.map(function(v,i){
      var x = 20 + (i * (260 / Math.max(1, vals.length - 1)));
      var y = 110 - ((v - min) / span) * 80;
      return x.toFixed(1)+','+y.toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 300 130" style="width:100%;height:130px;display:block"><defs><linearGradient id="AG'+color.replace('#','')+'" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="'+color+'" stop-opacity=".15"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs><rect x="0" y="0" width="300" height="130" rx="12" fill="rgba(255,255,255,.01)"/><g stroke="rgba(255,255,255,.06)">'+[25,50,75,100].map(function(y){ return '<line x1="12" y1="'+y+'" x2="288" y2="'+y+'"/>'; }).join('')+'</g><polyline fill="none" stroke="'+color+'" stroke-width="3" points="'+pts+'"/>'+vals.map(function(v,i){ var x = 20 + (i * (260 / Math.max(1, vals.length - 1))); var y = 110 - ((v - min) / span) * 80; return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4" fill="'+color+'"/>'; }).join('')+'</svg>';
  }

  function aNorm(v){
    return String(v || '').toLowerCase().replace(/kabupaten/g,'kab').replace(/kota/g,'kota').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  function aNormKode(v){
    return String(v == null ? '' : v).trim().replace(/\s+/g,'').replace(/[^\w.-]/g,'').toUpperCase();
  }
  function aEnsureXLSX(cb){
    function done(){ if(typeof cb === 'function') cb(); }
    if(window.XLSX){ done(); return; }
    if(window._analyticsXlsxLoading){
      var wait = setInterval(function(){
        if(window.XLSX){ clearInterval(wait); done(); }
      }, 150);
      setTimeout(function(){ clearInterval(wait); done(); }, 8000);
      return;
    }
    window._analyticsXlsxLoading = true;
    var js = document.createElement('script');
    js.src = A_XLSX_JS;
    js.async = true;
    js.onload = function(){ window._analyticsXlsxLoading = false; done(); };
    js.onerror = function(){ window._analyticsXlsxLoading = false; done(); };
    document.head.appendChild(js);
  }
  function aFeatureBoundsCoords(coords, bounds){
    bounds = bounds || {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
    if(!Array.isArray(coords)) return bounds;
    if(typeof coords[0] === 'number' && typeof coords[1] === 'number'){
      bounds.minX = Math.min(bounds.minX, coords[0]);
      bounds.minY = Math.min(bounds.minY, coords[1]);
      bounds.maxX = Math.max(bounds.maxX, coords[0]);
      bounds.maxY = Math.max(bounds.maxY, coords[1]);
      return bounds;
    }
    coords.forEach(function(c){ aFeatureBoundsCoords(c, bounds); });
    return bounds;
  }
  function aFeatureCenter(feature){
    try{
      var b = aFeatureBoundsCoords(feature && feature.geometry && feature.geometry.coordinates, null);
      if(!b || !isFinite(b.minX) || !isFinite(b.minY)) return null;
      return {lon:(b.minX + b.maxX) / 2, lat:(b.minY + b.maxY) / 2, bounds:b};
    }catch(e){
      return null;
    }
  }

  function aSeedHash(text){
    text = String(text || '');
    var h = 0;
    for(var i=0;i<text.length;i++) h = ((h << 5) - h) + text.charCodeAt(i);
    return Math.abs(h || 1);
  }

  function aProvinceScatter(seed, province){
    var base = A_PROVINCE_COORDS[province] || [118.0, -2.5];
    var hash = aSeedHash(seed + '|' + province);
    var lonOffset = (((hash % 1000) / 1000) - 0.5) * 1.8;
    var latOffset = ((((Math.floor(hash / 7)) % 1000) / 1000) - 0.5) * 1.2;
    return [base[0] + lonOffset, base[1] + latOffset];
  }

  var A_PROVINCE_COORDS = {
    'aceh':[95.32,5.55],'sumatera utara':[99.12,2.32],'sumatera barat':[100.36,-0.95],'riau':[101.45,0.53],
    'kepulauan riau':[104.45,0.92],'jambi':[103.61,-1.59],'sumatera selatan':[104.75,-3.01],'bengkulu':[102.27,-3.80],
    'lampung':[105.27,-5.45],'kepulauan bangka belitung':[106.10,-2.13],'banten':[106.15,-6.12],'dki jakarta':[106.83,-6.20],
    'jakarta':[106.83,-6.20],'jawa barat':[107.62,-6.91],'jawa tengah':[110.42,-6.99],'di yogyakarta':[110.37,-7.80],
    'yogyakarta':[110.37,-7.80],'jawa timur':[112.75,-7.25],'bali':[115.22,-8.65],'nusa tenggara barat':[116.10,-8.58],
    'ntb':[116.10,-8.58],'nusa tenggara timur':[123.58,-10.18],'ntt':[123.58,-10.18],'kalimantan barat':[109.33,-0.03],
    'kalimantan tengah':[113.92,-2.21],'kalimantan selatan':[114.59,-3.32],'kalimantan timur':[117.15,-0.50],
    'kalimantan utara':[117.63,3.30],'sulawesi utara':[124.85,1.49],'gorontalo':[123.06,0.54],'sulawesi tengah':[119.87,-0.89],
    'sulawesi barat':[118.89,-2.67],'sulawesi selatan':[119.41,-5.14],'sulawesi tenggara':[122.52,-3.97],'maluku':[128.18,-3.70],
    'maluku utara':[127.38,0.79],'papua barat':[134.07,-0.86],'papua barat daya':[131.25,-0.87],'papua':[140.70,-2.53],
    'papua tengah':[136.87,-4.27],'papua pegunungan':[140.72,-3.97],'papua selatan':[140.39,-8.49]
  };

  var A_CITY_COORDS = {
    'kab bekasi':[107.18,-6.28],'bekasi':[106.99,-6.24],'kota bekasi':[106.99,-6.24],'kab bogor':[106.80,-6.60],'bogor':[106.80,-6.60],
    'depok':[106.82,-6.40],'tangerang':[106.63,-6.18],'tangerang selatan':[106.72,-6.29],'bandung':[107.61,-6.91],
    'kab bandung':[107.53,-7.02],'cimahi':[107.54,-6.87],'cirebon':[108.56,-6.73],'garut':[107.91,-7.22],'tasikmalaya':[108.22,-7.33],
    'sukabumi':[106.93,-6.92],'purwakarta':[107.44,-6.56],'karawang':[107.31,-6.31],'serang':[106.15,-6.12],'cilegon':[106.05,-6.00],
    'jakarta pusat':[106.83,-6.18],'jakarta timur':[106.90,-6.23],'jakarta selatan':[106.82,-6.27],'jakarta barat':[106.77,-6.17],'jakarta utara':[106.88,-6.12],
    'semarang':[110.42,-6.99],'solo':[110.82,-7.57],'surakarta':[110.82,-7.57],'yogyakarta':[110.37,-7.80],'sleman':[110.35,-7.72],
    'surabaya':[112.75,-7.25],'malang':[112.63,-7.98],'sidoarjo':[112.72,-7.45],'gresik':[112.66,-7.16],'kediri':[112.01,-7.82],
    'madiun':[111.52,-7.63],'jember':[113.70,-8.17],'denpasar':[115.21,-8.65],'badung':[115.17,-8.58],'mataram':[116.11,-8.58],
    'kupang':[123.58,-10.18],'pontianak':[109.34,-0.03],'singkawang':[108.98,0.91],'palangkaraya':[113.92,-2.21],'banjarmasin':[114.59,-3.32],
    'balikpapan':[116.85,-1.26],'samarinda':[117.15,-0.50],'tarakan':[117.63,3.30],'makassar':[119.41,-5.14],'gowa':[119.45,-5.33],
    'parepare':[119.62,-4.01],'manado':[124.85,1.49],'kendari':[122.52,-3.99],'palu':[119.87,-0.89],'gorontalo':[123.06,0.54],
    'ambon':[128.18,-3.70],'ternate':[127.38,0.79],'sorong':[131.25,-0.87],'manokwari':[134.08,-0.86],'jayapura':[140.70,-2.53],
    'merauke':[140.39,-8.49],'medan':[98.67,3.59],'binjai':[98.48,3.60],'padang':[100.36,-0.95],'pekanbaru':[101.45,0.53],
    'batam':[104.03,1.13],'palembang':[104.75,-2.99],'bandar lampung':[105.27,-5.45],'jambi':[103.61,-1.59]
  };

  function aLookupCoord(row){
    var city = aNorm(row.city);
    var province = aNorm(row.province);
    var cityPlain = city.replace(/^kab\s+/,'').replace(/^kota\s+/,'').replace(/\s+/g,' ').trim();
    var candidates = [
      city,
      cityPlain,
      'kab ' + cityPlain,
      'kota ' + cityPlain
    ].filter(Boolean);
    for(var i=0;i<candidates.length;i++){
      if(A_CITY_COORDS[candidates[i]]) return {cityLabel:row.city, provinceLabel:row.province, lon:A_CITY_COORDS[candidates[i]][0], lat:A_CITY_COORDS[candidates[i]][1]};
    }
    if(A_PROVINCE_COORDS[province]){
      var scattered = aProvinceScatter(city || row.city || row.province || 'wilayah', province);
      return {cityLabel:row.city, provinceLabel:row.province, lon:scattered[0], lat:scattered[1], provinceOnly:true};
    }
    return {cityLabel:row.city, provinceLabel:row.province, lon:118.0, lat:-2.5, provinceOnly:true};
  }

  function aProject(lon, lat){
    var x = ((lon - 94) / (142 - 94)) * 760 + 20;
    var y = ((6 - lat) / (6 - (-11.5))) * 340 + 10;
    return {x:x, y:y};
  }

  function aCustomerGroups(rows){
    var grouped = {};
    rows.forEach(function(row){
      var geo = aLookupCoord(row);
      var key = aNorm(row.city || row.province || 'lainnya') + '|' + aNorm(row.province || '');
      if(!grouped[key]){
        var pt = aProject(geo.lon, geo.lat);
        grouped[key] = {
          key:key,
          city:(row.city || 'Tanpa Kota'),
          province:(row.province || '-'),
          x:pt.x,
          y:pt.y,
          count:0,
          omzet:0,
          rows:0,
          orders:0,
          _orderSet:{}
        };
      }
      grouped[key].rows += 1;
      var orderKey = aOrderKey(row);
      if(!grouped[key]._orderSet[orderKey]){
        grouped[key]._orderSet[orderKey] = 1;
        grouped[key].count += 1;
      }
      grouped[key].orders += aNum(row.orders);
      grouped[key].omzet += aNum(row.revenue);
    });
    return Object.keys(grouped).map(function(k){ delete grouped[k]._orderSet; return grouped[k]; }).sort(function(a,b){ return b.count - a.count; });
  }

  function aCustomerSvgFallback(rows){
    var groups = aCustomerGroups(rows);
    var labels = groups.slice(0, 12).map(function(r){
      var size = Math.max(6, Math.min(18, 5 + Math.sqrt(r.count) * 1.5));
      return '<g><circle cx="'+r.x.toFixed(1)+'" cy="'+r.y.toFixed(1)+'" r="'+size.toFixed(1)+'" fill="rgba(255,165,0,.18)" stroke="#FFA500" stroke-width="2"/><circle cx="'+r.x.toFixed(1)+'" cy="'+r.y.toFixed(1)+'" r="'+Math.max(3,size/3).toFixed(1)+'" fill="#8FD0FF"/><text x="'+(r.x+size+7).toFixed(1)+'" y="'+(r.y-2).toFixed(1)+'" fill="#f6f6f6" font-size="10" font-family="Source Code Pro, monospace">'+aEsc(r.city)+'</text><text x="'+(r.x+size+7).toFixed(1)+'" y="'+(r.y+11).toFixed(1)+'" fill="#F0C56A" font-size="9" font-family="Source Code Pro, monospace">'+r.count+' order</text></g>';
    }).join('');
    return '<svg viewBox="0 0 800 360" style="width:100%;height:360px;display:block;background:radial-gradient(circle at top,#10161d,#07090d);border:1px solid rgba(255,255,255,.06);border-radius:14px"><g stroke="rgba(111,194,255,.22)" stroke-width="1" fill="rgba(255,255,255,.04)"><path d="M38 154 L84 138 L136 140 L180 156 L196 178 L164 196 L112 194 L72 180 Z"/><path d="M196 212 L262 204 L330 210 L392 220 L448 236 L452 250 L400 258 L330 252 L258 244 L205 232 Z"/><path d="M430 170 L492 142 L560 150 L590 178 L560 200 L500 192 L452 184 Z"/><path d="M584 204 L620 188 L652 198 L670 218 L650 236 L614 230 Z"/><path d="M470 252 L510 244 L556 248 L588 260 L556 270 L500 268 Z"/><path d="M646 222 L676 214 L708 220 L724 240 L698 250 L664 244 Z"/><path d="M690 170 L740 160 L786 170 L780 196 L730 204 L694 194 Z"/></g><g stroke="rgba(255,255,255,.04)">'+[60,120,180,240,300].map(function(y){ return '<line x1="16" y1="'+y+'" x2="784" y2="'+y+'"/>'; }).join('')+'</g><text x="56" y="130" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">SUMATRA</text><text x="290" y="200" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">JAWA</text><text x="470" y="136" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">KALIMANTAN</text><text x="612" y="190" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">SULAWESI</text><text x="512" y="286" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">BALI NUSA</text><text x="680" y="248" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">MALUKU</text><text x="724" y="156" fill="#7e93a7" font-size="10" font-family="Source Code Pro, monospace">PAPUA</text>'+labels+'</svg>';
  }

  function aPurchaseRowFromSheet(obj){
    var by = {};
    Object.keys(obj || {}).forEach(function(k){ by[aHeaderKey(k)] = obj[k]; });
    function pick(keys){
      for(var i=0;i<keys.length;i++){
        var key = aHeaderKey(keys[i]);
        if(by[key] != null && String(by[key]).trim() !== '') return by[key];
      }
      return '';
    }
    var kode = aNormKode(pick(['kode','kode wilayah','kode_wilayah','kode kabupaten','kode kota']));
    return {
      id: aId('pmap'),
      kode: kode,
      kabupaten: String(pick(['kabupaten','kabupaten kota','kabupaten/kota','kota kabupaten','wilayah']) || '').trim(),
      provinsi: String(pick(['provinsi','province']) || '').trim(),
      totalPembelian: aNumLoose(pick(['total_pembelian','total pembelian','total','nominal','omzet','revenue'])),
      raw: obj || {}
    };
  }

  function aImportPurchaseRows(rows, fileName){
    var mapped = (rows || []).map(aPurchaseRowFromSheet).filter(function(r){
      return r && r.kode;
    });
    if(!mapped.length){
      toast('Import pembelian gagal: kolom kode wilayah tidak ditemukan atau data kosong.', 'error', 4200);
      return;
    }
    _analyticsPurchase.rows = mapped;
    _analyticsPurchase.excelName = fileName || '';
    _analyticsPurchase.updatedAt = new Date().toISOString();
    aSavePurchaseStore();
    toast('Import pembelian kabupaten berhasil: ' + mapped.length + ' baris', 'success', 4200);
    _renderAnalytics('customers');
  }

  function aPurchaseDbRows(){
    return ((_analyticsPurchase && _analyticsPurchase.rows) || []).map(function(r, idx){
      return {
        id: r.id || aId('pdb_' + idx),
        kode: aNormKode(r.kode),
        kabupaten: r.kabupaten || '-',
        provinsi: r.provinsi || '-',
        total_pembelian: aNum(r.totalPembelian),
        source_file: (_analyticsPurchase && _analyticsPurchase.excelName) || null,
        updated_at: (_analyticsPurchase && _analyticsPurchase.updatedAt) || new Date().toISOString(),
        data: r
      };
    });
  }

  function aImportPurchaseExcel(){
    aEnsureXLSX(function(){
      if(!window.XLSX){
        toast('Parser XLSX belum tersedia. Pastikan koneksi browser aktif lalu coba lagi.', 'warn', 5200);
        return;
      }
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.xlsx,.xls,.csv';
      inp.onchange = function(e){
        var file = e.target.files && e.target.files[0];
        if(!file) return;
        var name = String(file.name || '').toLowerCase();
        if(name.endsWith('.csv')){
          var fr = new FileReader();
          fr.onload = function(ev){
            try{ aImportPurchaseRows(aParseCsv(ev.target.result), file.name || 'customer-purchase.csv'); }
            catch(err){ toast('Gagal membaca CSV pembelian.', 'error'); }
          };
          fr.readAsText(file);
          return;
        }
        var fr2 = new FileReader();
        fr2.onload = function(ev){
          try{
            var wb = XLSX.read(new Uint8Array(ev.target.result), {type:'array'});
            var sheet = wb.Sheets[wb.SheetNames[0]];
            var rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
            aImportPurchaseRows(rows, file.name || 'customer-purchase.xlsx');
          }catch(err){
            toast('Gagal membaca Excel pembelian.', 'error');
          }
        };
        fr2.readAsArrayBuffer(file);
      };
      inp.click();
    });
  }

  function aNormalizeGeoFeature(feature){
    var props = Object.assign({}, feature && feature.properties || {});
    var kode = aNormKode(props.kode || props.KODE || props.kode_wilayah || props.KODE_WILAYAH || props.code || props.id);
    props.kode = kode;
    return {
      type:'Feature',
      geometry: feature.geometry,
      properties: props
    };
  }

  function aImportPurchaseGeoJSONText(text, fileName){
    try{
      var parsed = JSON.parse(String(text || '{}'));
      var features = Array.isArray(parsed.features) ? parsed.features.map(aNormalizeGeoFeature).filter(function(f){ return f && f.properties && f.properties.kode; }) : [];
      if(!features.length){
        toast('GeoJSON wilayah belum punya properti kode yang valid.', 'error', 4800);
        return;
      }
      _analyticsPurchase.geojson = {type:'FeatureCollection', features:features};
      _analyticsPurchase.geoName = fileName || '';
      _analyticsPurchase.updatedAt = new Date().toISOString();
      aSavePurchaseStore();
      toast('GeoJSON wilayah berhasil dimuat: ' + features.length + ' fitur', 'success', 4200);
      _renderAnalytics('customers');
    }catch(err){
      toast('File GeoJSON tidak valid.', 'error', 4200);
    }
  }

  function aImportPurchaseGeoJSON(){
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.geojson,.json';
    inp.onchange = function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      var fr = new FileReader();
      fr.onload = function(ev){ aImportPurchaseGeoJSONText(ev.target.result, file.name || 'wilayah.geojson'); };
      fr.readAsText(file);
    };
    inp.click();
  }

  function aPurchaseJoin(){
    var rows = (_analyticsPurchase && _analyticsPurchase.rows) || [];
    var geojson = (_analyticsPurchase && _analyticsPurchase.geojson) || null;
    var rowMap = {};
    rows.forEach(function(r){
      var kode = aNormKode(r.kode);
      if(!kode) return;
      if(!rowMap[kode]){
        rowMap[kode] = {
          kode:kode,
          kabupaten:r.kabupaten || '-',
          provinsi:r.provinsi || '-',
          totalPembelian:0,
          rows:0
        };
      }
      rowMap[kode].totalPembelian += aNum(r.totalPembelian);
      rowMap[kode].rows += 1;
      if(!rowMap[kode].kabupaten || rowMap[kode].kabupaten === '-') rowMap[kode].kabupaten = r.kabupaten || '-';
      if(!rowMap[kode].provinsi || rowMap[kode].provinsi === '-') rowMap[kode].provinsi = r.provinsi || '-';
    });
    var features = [];
    if(geojson && Array.isArray(geojson.features)){
      features = geojson.features.map(function(feature){
        var f = aNormalizeGeoFeature(feature);
        var kode = aNormKode(f.properties && f.properties.kode);
        var hit = rowMap[kode] || null;
        var center = aFeatureCenter(f);
        f.properties.ajw_total = hit ? hit.totalPembelian : 0;
        f.properties.ajw_rows = hit ? hit.rows : 0;
        f.properties.ajw_kabupaten = (hit && hit.kabupaten) || f.properties.kabupaten || f.properties.nama || f.properties.name || '-';
        f.properties.ajw_provinsi = (hit && hit.provinsi) || f.properties.provinsi || f.properties.province || '-';
        f.properties.ajw_kode = kode;
        if(center){
          f.properties.ajw_center_lon = center.lon;
          f.properties.ajw_center_lat = center.lat;
        }
        return f;
      });
    }
    var matched = features.filter(function(f){ return aNum(f.properties && f.properties.ajw_total) > 0; });
    var summary = Object.keys(rowMap).map(function(k){ return rowMap[k]; }).sort(function(a,b){ return b.totalPembelian - a.totalPembelian; });
    return {
      rowMap: rowMap,
      summary: summary,
      featureCollection: features.length ? {type:'FeatureCollection', features:features} : null,
      matchedFeatures: matched,
      totalRows: rows.length,
      totalMatched: matched.length,
      totalWilayah: summary.length,
      totalPembelian: summary.reduce(function(t,r){ return t + aNum(r.totalPembelian); }, 0),
      maxPembelian: summary.reduce(function(m,r){ return Math.max(m, aNum(r.totalPembelian)); }, 0)
    };
  }

  function aEnsureMapLibre(cb){
    function done(){ if(typeof cb === 'function') cb(); }
    if(window.maplibregl){ done(); return; }
    if(window._analyticsMapLoaded){
      var wait = setInterval(function(){
        if(window.maplibregl){ clearInterval(wait); done(); }
      }, 150);
      setTimeout(function(){ clearInterval(wait); }, 5000);
      return;
    }
    window._analyticsMapLoaded = true;
    if(!document.getElementById('analytics-maplibre-css')){
      var css = document.createElement('link');
      css.id = 'analytics-maplibre-css';
      css.rel = 'stylesheet';
      css.href = A_MAPLIBRE_CSS;
      document.head.appendChild(css);
    }
    var js = document.createElement('script');
    js.src = A_MAPLIBRE_JS;
    js.async = true;
    js.onload = done;
    js.onerror = function(){ window._analyticsMapLoaded = false; done(); };
    document.head.appendChild(js);
  }

  function aDisposeMap(){
    try{
      (window._analyticsMapMarkers || []).forEach(function(m){
        try{ m.remove(); }catch(_){}
      });
      window._analyticsMapMarkers = [];
      if(window._analyticsMap){
        try{ window._analyticsMap.remove(); }catch(_){}
      }
      window._analyticsMap = null;
    }catch(_){}
  }

  function aMarkerHtml(group){
    var pct = Math.max(12, Math.min(32, 12 + Math.sqrt(group.count || 0) * 3));
    return '<div style="position:relative;width:'+pct+'px;height:'+pct+'px;border-radius:999px;background:radial-gradient(circle,rgba(255,166,0,.95) 0%,rgba(255,120,0,.55) 46%,rgba(255,120,0,.15) 70%,transparent 71%);box-shadow:0 0 0 1px rgba(255,185,88,.65),0 0 18px rgba(255,148,24,.45),0 0 32px rgba(76,224,255,.15)"><div style="position:absolute;inset:4px;border-radius:999px;border:1px solid rgba(188,246,255,.7)"></div></div>';
  }

  function aPopupHtml(group){
    return '<div style="min-width:220px;font-family:Source Code Pro,monospace;color:#D7E1EC">'+
      '<div style="font-size:12px;color:#FFA500;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">'+aEsc(group.city)+'</div>'+
      '<div style="font-size:11px;color:#93A8BD;margin-bottom:10px">'+aEsc(group.province || '-')+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px"><div style="font-size:10px;color:#8FD0FF">Baris</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">'+group.rows+'</div></div>'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px"><div style="font-size:10px;color:#A7F3B6">Order</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">'+group.count+'</div></div>'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px;grid-column:1 / span 2"><div style="font-size:10px;color:#F0C56A">Revenue Wilayah</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">Rp '+fmt(group.omzet)+'</div></div>'+
      '</div></div>';
  }

  function aPurchasePopupHtml(props){
    return '<div style="min-width:220px;font-family:Source Code Pro,monospace;color:#D7E1EC">'+
      '<div style="font-size:12px;color:#ffb257;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">'+aEsc(props.ajw_kabupaten || '-')+'</div>'+
      '<div style="font-size:11px;color:#93A8BD;margin-bottom:10px">'+aEsc(props.ajw_provinsi || '-')+' • kode '+aEsc(props.ajw_kode || '-')+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px"><div style="font-size:10px;color:#8FD0FF">Rows</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">'+aNum(props.ajw_rows)+'</div></div>'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px"><div style="font-size:10px;color:#A7F3B6">Matched</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">'+(aNum(props.ajw_total) > 0 ? 'Yes' : 'No')+'</div></div>'+
        '<div style="background:#111822;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px;grid-column:1 / span 2"><div style="font-size:10px;color:#F0C56A">Total Pembelian</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px">Rp '+fmt(aNum(props.ajw_total))+'</div></div>'+
      '</div></div>';
  }

  function aRenderCustomerProtomap(rows, containerId){
    containerId = containerId || 'ANA-CUSTOMER-MAP';
    var holder = document.getElementById(containerId);
    if(!holder) return;
    var purchase = aPurchaseJoin();
    var groups = aCustomerGroups(rows || []);
    if(!window.maplibregl){
      holder.innerHTML = aCustomerSvgFallback(rows || []);
      return;
    }
    aDisposeMap();
    holder.innerHTML = '';
    try{
      var map = new window.maplibregl.Map({
        container: containerId,
        style: A_PROTO_STYLE,
        center: [118.1, -2.3],
        zoom: 4.65,
        pitch: 0,
        bearing: 0,
        attributionControl: false
      });
      window._analyticsMap = map;
      map.addControl(new window.maplibregl.NavigationControl({visualizePitch:true}), 'top-right');
      map.on('load', function(){
        if(purchase.featureCollection && purchase.featureCollection.features && purchase.featureCollection.features.length){
          map.addSource('ajw-purchase-regions', {type:'geojson', data:purchase.featureCollection});
          var maxTotal = Math.max(1, purchase.maxPembelian || 1);
          map.addLayer({
            id:'ajw-purchase-fill',
            type:'fill',
            source:'ajw-purchase-regions',
            paint:{
              'fill-color': [
                'interpolate', ['linear'], ['coalesce', ['get','ajw_total'], 0],
                0, '#f5e3bf',
                maxTotal * 0.2, '#f0b96f',
                maxTotal * 0.45, '#eb7b45',
                maxTotal * 0.7, '#c0392b',
                maxTotal, '#640f0f'
              ],
              'fill-opacity': [
                'case',
                ['>', ['coalesce', ['get','ajw_total'], 0], 0], 0.74,
                0.10
              ]
            }
          });
          map.addLayer({
            id:'ajw-purchase-line',
            type:'line',
            source:'ajw-purchase-regions',
            paint:{
              'line-color':'rgba(143,208,255,0.28)',
              'line-width':[
                'case',
                ['>', ['coalesce', ['get','ajw_total'], 0], 0], 1.35,
                0.65
              ]
            }
          });
          var popup = new window.maplibregl.Popup({closeButton:false, closeOnClick:false, offset:14});
          map.on('mousemove','ajw-purchase-fill', function(e){
            var feature = e.features && e.features[0];
            if(!feature) return;
            map.getCanvas().style.cursor='pointer';
            popup.setLngLat(e.lngLat).setHTML(aPurchasePopupHtml(feature.properties || {})).addTo(map);
          });
          map.on('mouseleave','ajw-purchase-fill', function(){
            map.getCanvas().style.cursor='';
            popup.remove();
          });
          map.on('click','ajw-purchase-fill', function(e){
            var feature = e.features && e.features[0];
            if(!feature) return;
            var center = aFeatureCenter(feature);
            if(center && center.bounds){
              try{
                var b = center.bounds;
                map.fitBounds([[b.minX, b.minY],[b.maxX, b.maxY]], {padding:28, maxZoom:9.8, duration:650});
              }catch(_){}
            }
          });
          var matchedFeatures = purchase.matchedFeatures || [];
          if(matchedFeatures.length){
            try{
              var bounds = new window.maplibregl.LngLatBounds();
              matchedFeatures.forEach(function(feature){
                var center = aFeatureCenter(feature);
                if(center) bounds.extend([center.lon, center.lat]);
              });
              if(!bounds.isEmpty()) map.fitBounds(bounds, {padding:{top:28,right:28,bottom:28,left:28}, maxZoom:6.8, duration:700});
            }catch(_){}
          }
          return;
        }
        groups.forEach(function(group){
          var geo = aLookupCoord({city:group.city, province:group.province});
          var el = document.createElement('div');
          el.innerHTML = aMarkerHtml(group);
          el = el.firstChild;
          var marker = new window.maplibregl.Marker({element:el, anchor:'center'})
            .setLngLat([geo.lon, geo.lat])
            .setPopup(new window.maplibregl.Popup({offset:18, closeButton:false}).setHTML(aPopupHtml(group)))
            .addTo(map);
          window._analyticsMapMarkers.push(marker);
        });
        if(groups.length){
          var bounds = new window.maplibregl.LngLatBounds();
          groups.forEach(function(group){
            var geo = aLookupCoord({city:group.city, province:group.province});
            bounds.extend([geo.lon, geo.lat]);
          });
          try{
            if(groups.length === 1){
              var one = aLookupCoord({city:groups[0].city, province:groups[0].province});
              map.easeTo({center:[one.lon, one.lat], zoom:8.2, duration:650});
            }else{
              map.fitBounds(bounds, {padding:{top:24,right:24,bottom:24,left:24}, maxZoom:8.8, duration:700});
            }
          }catch(_){}
        }
      });
    }catch(err){
      console.warn('analytics protomap', err);
      holder.innerHTML = aCustomerSvgFallback(rows || []);
    }
  }

  function aTopCity(rows){
    var best = aCustomerGroups(rows)[0];
    return best ? {name:best.city, value:best.count} : {name:'-', value:0};
  }

  function aDashBadge(text, color){
    return '<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;border:1px solid '+color+';background:rgba(255,255,255,.03);font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.08em"><span style="width:7px;height:7px;border-radius:999px;background:'+color+';box-shadow:0 0 10px '+color+'"></span>'+text+'</span>';
  }

  function aDashPanel(title, body, right){
    return '<div class="card" style="padding:10px 12px;background:linear-gradient(180deg,#0d1117,#090b10);border:1px solid rgba(255,255,255,.07)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em">'+title+'</div>'+(right||'')+'</div>'+body+'</div>';
  }

  function aDashboard(){
    var sales = _analyticsData.sales || [];
    var service = _analyticsData.service || [];
    var promo = _analyticsData.promo || [];
    var customers = _analyticsData.customers || [];
    var totalRevenue = sales.reduce(function(t,r){ return t + aNum(r.revenue); },0);
    var totalOrders = sales.reduce(function(t,r){ return t + aNum(r.orders); },0);
    var avgRating = service.length ? (service.reduce(function(t,r){ return t + aNum(r.rating); },0) / service.length) : 0;
    var promoRoi = promo.reduce(function(t,r){ return t + (aNum(r.revenue) - aNum(r.spend)); },0);
    var topCity = aTopCity(customers);
    var customerGroups = aCustomerGroups(customers);
    var recentSales = sales.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,5);
    var recentService = service.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,4);
    var recentPromo = promo.slice().sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).slice(0,4);
    var repeatCustomers = customers.filter(function(r){ return String(r.status||'').toLowerCase() === 'repeat'; }).length;
    var activeHotspots = customerGroups.slice(0,6);
    var riskyService = service.filter(function(r){
      return aNum(r.rating) > 0 && aNum(r.rating) < 4 || (aNum(r.response) > 30) || (aNum(r.tickets) > aNum(r.resolved));
    }).length;
    var promoPositive = promo.filter(function(r){ return aNum(r.revenue) >= aNum(r.spend); }).length;
    var salesAov = totalOrders ? (totalRevenue / totalOrders) : 0;
    var serviceResolvePct = service.length ? service.reduce(function(t,r){ return t + aPct(aNum(r.resolved), Math.max(1,aNum(r.tickets))); },0) / service.length : 0;
    var h = '';
    h += '<div class="card" style="padding:10px 14px;background:linear-gradient(180deg,#0b0d10,#101418);border:1px solid rgba(77,255,146,.12)"><div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center">';
    h += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px;font-weight:900;letter-spacing:.18em;color:#fff">ANALYTICS</span><span style="font-size:10px;color:#7CF1A3;text-transform:uppercase;letter-spacing:.12em">live</span></div>';
    h += '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">'+
      aDashBadge('Indonesia Grid', '#3fd0ff')+
      aDashBadge('Revenue Stream', '#f0c56a')+
      aDashBadge('Customer Intel', '#ff9e1f')+
      aDashBadge('Service Watch', '#7cf1a3')+
    '</div>';
    h += '<div style="text-align:right;font-size:11px;color:#8aa0b3">Analytics Mission Clock<br><span style="color:#fff;font-weight:800">'+new Date().toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</span></div>';
    h += '</div></div>';
    h += '<div style="display:grid;grid-template-columns:210px minmax(0,1fr) 410px;gap:12px;margin-bottom:12px">';
    h += '<div class="card" style="padding:10px 12px;background:linear-gradient(180deg,#0d1117,#090b10);border:1px solid rgba(255,255,255,.07)">';
    h += '<div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Data Layers</div>';
    h += '<div style="display:flex;flex-direction:column;gap:8px;font-size:11px;color:#9ab0c3">';
    [
      ['Customer Hotspots', customerGroups.length, '#00d0ff'],
      ['Revenue Entries', sales.length, '#f0c56a'],
      ['Service Cases', service.length, '#7cf1a3'],
      ['Promo Campaigns', promo.length, '#ff9a1f'],
      ['Repeat Buyers', repeatCustomers, '#ff5d7a'],
      ['Risk Signals', riskyService, '#ff7878']
    ].forEach(function(item){
      h += '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)"><span style="width:8px;height:8px;border-radius:999px;background:'+item[2]+';box-shadow:0 0 10px '+item[2]+'"></span><span>'+item[0]+'</span><span style="color:#fff;font-weight:800">'+item[1]+'</span></div>';
    });
    h += '</div>';
    h += '<div style="margin-top:12px;padding:10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)"><div style="font-size:10px;color:#8aa0b3;text-transform:uppercase;letter-spacing:.08em">Top Customer Sector</div><div style="font-size:20px;color:#fff;font-weight:800;margin-top:8px">'+aEsc(topCity.name)+'</div><div style="font-size:11px;color:#f0c56a;margin-top:5px">'+topCity.value+' order tercatat</div></div>';
    h += '</div>';
    h += '<div class="card" style="padding:12px;background:linear-gradient(180deg,#090d13,#05070b);border:1px solid rgba(99,128,156,.22)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-size:12px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em">Indonesia Customer Command Map</div><div style="font-size:11px;color:#8FA6BB">Protomaps tactical view</div></div><div id="ANA-DASH-MAP" style="height:470px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#05080d"></div><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:10px;color:#7F95AA;text-transform:uppercase;letter-spacing:.08em"><span>Amber = density pulse</span><span>Cyan = point lock</span><span>Popup = orders / revenue / rows</span></div></div>';
    h += '<div style="display:flex;flex-direction:column;gap:12px">';
    h += aDashPanel('Strategic Risk Overview',
      '<div style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center"><div style="width:108px;height:108px;border-radius:999px;margin:auto;background:conic-gradient(#ff9a1f 0 '+Math.max(8,Math.min(320,Math.round(aPct(riskyService, Math.max(1,service.length))*3.2)))+'deg,rgba(255,255,255,.07) 0 360deg);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 12px #0d1218"><div style="text-align:center"><div style="font-size:28px;font-weight:900;color:#fff">'+Math.round(aPct(riskyService, Math.max(1,service.length)) || 0)+'</div><div style="font-size:10px;color:#F0C56A;text-transform:uppercase">risk</div></div></div><div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#8aa0b3">Customer Pressure</span><strong style="color:#fff">'+customerGroups.length+'</strong></div><div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#8aa0b3">Service Alerts</span><strong style="color:#fff">'+riskyService+'</strong></div><div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#8aa0b3">Promo Positive</span><strong style="color:#A7F3B6">'+promoPositive+'</strong></div><div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#8aa0b3">Avg Rating</span><strong style="color:#8FD0FF">'+(avgRating ? avgRating.toFixed(2) : '0.00')+'</strong></div></div></div>',
      '<span style="font-size:10px;color:#7cf1a3;text-transform:uppercase">live</span>'
    );
    h += aDashPanel('Customer Hotspots',
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      (activeHotspots.length ? activeHotspots : [{city:'Belum ada data',province:'-',count:0,omzet:0}]).map(function(item,idx){
        return '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)"><span style="width:9px;height:9px;border-radius:999px;background:#ff9a1f;box-shadow:0 0 12px rgba(255,154,31,.55)"></span><div><div style="font-size:12px;color:#fff;font-weight:800">'+(idx+1)+'. '+aEsc(item.city)+'</div><div style="font-size:10px;color:#8aa0b3;margin-top:2px">'+aEsc(item.province||'-')+'</div></div><div style="text-align:right"><div style="font-size:12px;color:#F0C56A;font-weight:800">'+item.count+'</div><div style="font-size:10px;color:#8FD0FF">order</div></div></div>';
      }).join('')+
      '</div>'
    );
    h += aDashPanel('Intel Feed',
      '<div style="display:flex;flex-direction:column;gap:8px;max-height:250px;overflow:auto">'+
      (recentSales.length ? recentSales : [{date:'-',channel:'Belum ada data',revenue:0,orders:0}]).map(function(item){
        return '<div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border-left:2px solid #3fd0ff"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-size:11px;color:#fff;font-weight:700">'+aEsc(item.channel||'-')+'</div><div style="font-size:10px;color:#8aa0b3">'+aFmtDate(item.date)+'</div></div><div style="font-size:10px;color:#9db0c2;margin-top:5px">Revenue Rp '+fmt(aNum(item.revenue))+' • '+aNum(item.orders)+' order</div></div>';
      }).join('')+
      '</div>'
    );
    h += '</div></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:12px;margin-bottom:12px">';
    h += aMetric('Revenue Analytics','Rp '+fmt(totalRevenue),'#F0C56A','Akumulasi data penjualan manual analytics');
    h += aMetric('Total Orders',String(totalOrders),'#8FD0FF','Total order dari input penjualan');
    h += aMetric('Service Resolve Avg',serviceResolvePct.toFixed(1)+'%','#A7F3B6','Rata-rata penyelesaian layanan');
    h += aMetric('Promo Net','Rp '+fmt(promoRoi),'#FFB86B','Revenue promo dikurangi spend');
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">';
    h += aDashPanel('Revenue Stream', aTrendSvg(sales.slice().sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); }).slice(-8).map(function(r){ return aNum(r.revenue); }),'#F0C56A') + '<div style="display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#8aa0b3;text-transform:uppercase"><span>AOV</span><strong style="color:#fff">Rp '+fmt(salesAov)+'</strong><span>Entries '+sales.length+'</span></div>');
    h += aDashPanel('Service Pulse',
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      (recentService.length ? recentService : [{channel:'Belum ada data',tickets:0,resolved:0,response:0,rating:0,date:'-'}]).map(function(item){
        var statusColor = aNum(item.response) > 30 || aNum(item.rating) < 4 ? '#ff7a7a' : '#7cf1a3';
        return '<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)"><div><div style="font-size:12px;color:#fff;font-weight:700">'+aEsc(item.channel||'-')+'</div><div style="font-size:10px;color:#8aa0b3;margin-top:2px">'+aFmtDate(item.date)+' • '+aNum(item.tickets)+' ticket • '+aNum(item.resolved)+' solved</div></div><span style="padding:4px 7px;border-radius:999px;border:1px solid '+statusColor+';color:'+statusColor+';font-size:10px;text-transform:uppercase">'+(aNum(item.response) > 30 || aNum(item.rating) < 4 ? 'alert' : 'normal')+'</span></div>';
      }).join('')+
      '</div>'
    );
    h += aDashPanel('Promotion Posture',
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      (recentPromo.length ? recentPromo : [{name:'Belum ada promo',channel:'-',spend:0,revenue:0,date:'-'}]).map(function(item){
        var net = aNum(item.revenue) - aNum(item.spend);
        var statusColor = net >= 0 ? '#7cf1a3' : '#ff9a8a';
        return '<div style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-size:12px;color:#fff;font-weight:700">'+aEsc(item.name||'-')+'</div><span style="font-size:10px;color:#8aa0b3">'+aFmtDate(item.date)+'</span></div><div style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:10px"><span style="color:#8aa0b3">'+aEsc(item.channel||'-')+'</span><strong style="color:'+statusColor+'">Net Rp '+fmt(net)+'</strong></div></div>';
      }).join('')+
      '</div>'
    );
    h += '</div>';
    return h;
  }

  function aSalesTab(){
    var editIdx = _analyticsUI.salesEdit;
    var row = editIdx >= 0 ? (_analyticsData.sales[editIdx] || {}) : {};
    var h = aSectionHeader('Analytics Penjualan','Input manual performa penjualan untuk dibaca sebagai trend analytics.','');
    h += '<div class="card"><div class="g2" style="grid-template-columns:repeat(5,minmax(140px,1fr));align-items:end">';
    h += aInput('Tanggal','ANA-SALES-DATE','date',row.date || aToday(),'');
    h += aInput('Channel','ANA-SALES-CHANNEL','text',row.channel || 'Marketplace','Shopee / Lazada / TikTok');
    h += aInput('Revenue','ANA-SALES-REV','number',row.revenue || '','0');
    h += aInput('Orders','ANA-SALES-ORD','number',row.orders || '','0');
    h += aInput('AOV','ANA-SALES-AOV','number',row.aov || '','0');
    h += '</div><div class="g2" style="margin-top:10px;grid-template-columns:1fr 220px">';
    h += aText('Catatan','ANA-SALES-NOTE',row.note || '','Catatan penjualan',3);
    h += '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end"><button class="btns" onclick="_analyticsReset2(\'sales\')">Reset</button><button class="btnp" onclick="_analyticsSaveSales2()" style="background:#8C5E16">'+(editIdx>=0?'Update':'Simpan')+' Penjualan</button></div>';
    h += '</div></div>';
    h += '<div class="card"><div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:10px">Trend Penjualan</div>'+aTrendSvg((_analyticsData.sales||[]).slice().sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); }).slice(-8).map(function(r){ return aNum(r.revenue); }),'#F0C56A')+'</div>';
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Tanggal</th><th>Channel</th><th>Revenue</th><th>Orders</th><th>AOV</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_analyticsData.sales||[]).forEach(function(r,idx){
      h += '<tr><td>'+aFmtDate(r.date)+'</td><td>'+aEsc(r.channel||'-')+'</td><td style="font-weight:800;color:#F0C56A">Rp '+fmt(aNum(r.revenue))+'</td><td>'+aNum(r.orders)+'</td><td>Rp '+fmt(aNum(r.aov))+'</td><td>'+aEsc(r.note||'-')+'</td><td class="c"><div style="display:flex;gap:6px;justify-content:center"><button class="btnsm" onclick="_analyticsEdit2(\'sales\','+idx+')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_analyticsDelete2(\'sales\','+idx+')" style="background:#5f6b7a">Hapus</button></div></td></tr>';
    });
    if(!(_analyticsData.sales||[]).length) h += aEmpty('Belum ada data penjualan.');
    h += '</tbody></table></div></div>';
    return h;
  }

  function aServiceTab(){
    var editIdx = _analyticsUI.serviceEdit;
    var row = editIdx >= 0 ? (_analyticsData.service[editIdx] || {}) : {};
    var h = aSectionHeader('Analytics Layanan','Pantau kualitas layanan, complaint, dan response time.','');
    h += '<div class="card"><div class="g2" style="grid-template-columns:repeat(6,minmax(120px,1fr));align-items:end">';
    h += aInput('Tanggal','ANA-SVC-DATE','date',row.date || aToday(),'');
    h += aInput('Channel','ANA-SVC-CHANNEL','text',row.channel || 'Chat','WA / Tokopedia / Shopee');
    h += aInput('Tickets','ANA-SVC-TICKET','number',row.tickets || '','0');
    h += aInput('Resolved','ANA-SVC-RES','number',row.resolved || '','0');
    h += aInput('Response (menit)','ANA-SVC-RESP','number',row.response || '','0');
    h += aInput('Rating','ANA-SVC-RATING','number',row.rating || '','0','step="0.1"');
    h += '</div><div class="g2" style="margin-top:10px;grid-template-columns:1fr 220px">';
    h += aText('Catatan','ANA-SVC-NOTE',row.note || '','Masalah utama / tindak lanjut',3);
    h += '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end"><button class="btns" onclick="_analyticsReset2(\'service\')">Reset</button><button class="btnp" onclick="_analyticsSaveService2()" style="background:#0F766E">'+(editIdx>=0?'Update':'Simpan')+' Layanan</button></div>';
    h += '</div></div>';
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Tanggal</th><th>Channel</th><th>Tickets</th><th>Resolved</th><th>Response</th><th>Rating</th><th>Catatan</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_analyticsData.service||[]).forEach(function(r,idx){
      h += '<tr><td>'+aFmtDate(r.date)+'</td><td>'+aEsc(r.channel||'-')+'</td><td>'+aNum(r.tickets)+'</td><td style="color:#A7F3B6;font-weight:700">'+aNum(r.resolved)+'</td><td>'+aNum(r.response)+' menit</td><td style="color:#8FD0FF;font-weight:700">'+aNum(r.rating).toFixed ? aNum(r.rating).toFixed(1) : aNum(r.rating)+'</td><td>'+aEsc(r.note||'-')+'</td><td class="c"><div style="display:flex;gap:6px;justify-content:center"><button class="btnsm" onclick="_analyticsEdit2(\'service\','+idx+')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_analyticsDelete2(\'service\','+idx+')" style="background:#5f6b7a">Hapus</button></div></td></tr>';
    });
    if(!(_analyticsData.service||[]).length) h += aEmpty('Belum ada data layanan.');
    h += '</tbody></table></div></div>';
    return h;
  }

  function aPromoTab(){
    var editIdx = _analyticsUI.promoEdit;
    var row = editIdx >= 0 ? (_analyticsData.promo[editIdx] || {}) : {};
    var h = aSectionHeader('Analytics Promosi','Catat campaign, biaya, revenue, leads, dan conversion.','');
    h += '<div class="card"><div class="g2" style="grid-template-columns:repeat(6,minmax(120px,1fr));align-items:end">';
    h += aInput('Tanggal','ANA-PRO-DATE','date',row.date || aToday(),'');
    h += aInput('Campaign','ANA-PRO-NAME','text',row.name || '','Nama promo');
    h += aInput('Channel','ANA-PRO-CHANNEL','text',row.channel || 'Marketplace','Ads / Affiliate / Live');
    h += aInput('Spend','ANA-PRO-SPEND','number',row.spend || '','0');
    h += aInput('Revenue','ANA-PRO-REV','number',row.revenue || '','0');
    h += aInput('Conversions','ANA-PRO-CONV','number',row.conversions || '','0');
    h += '</div><div class="g2" style="margin-top:10px;grid-template-columns:1fr 220px">';
    h += aText('Catatan','ANA-PRO-NOTE',row.note || '','Catatan promosi',3);
    h += '<div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end"><button class="btns" onclick="_analyticsReset2(\'promo\')">Reset</button><button class="btnp" onclick="_analyticsSavePromo2()" style="background:#C75F5F">'+(editIdx>=0?'Update':'Simpan')+' Promosi</button></div>';
    h += '</div></div>';
    h += '<div class="card"><div style="overflow:auto"><table class="tbl" style="min-width:980px"><thead><tr><th>Tanggal</th><th>Campaign</th><th>Channel</th><th>Spend</th><th>Revenue</th><th>Conversions</th><th>Net</th><th class="c">Aksi</th></tr></thead><tbody>';
    (_analyticsData.promo||[]).forEach(function(r,idx){
      var net = aNum(r.revenue) - aNum(r.spend);
      h += '<tr><td>'+aFmtDate(r.date)+'</td><td style="font-weight:700">'+aEsc(r.name||'-')+'</td><td>'+aEsc(r.channel||'-')+'</td><td>Rp '+fmt(aNum(r.spend))+'</td><td style="color:#F0C56A;font-weight:800">Rp '+fmt(aNum(r.revenue))+'</td><td>'+aNum(r.conversions)+'</td><td style="color:'+(net>=0?'#A7F3B6':'#FF9D9D')+';font-weight:800">Rp '+fmt(net)+'</td><td class="c"><div style="display:flex;gap:6px;justify-content:center"><button class="btnsm" onclick="_analyticsEdit2(\'promo\','+idx+')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_analyticsDelete2(\'promo\','+idx+')" style="background:#5f6b7a">Hapus</button></div></td></tr>';
    });
    if(!(_analyticsData.promo||[]).length) h += aEmpty('Belum ada data promosi.');
    h += '</tbody></table></div></div>';
    return h;
  }

  function aMonitorBadge(text, tone){
    var cfg = {
      live:['#24d17e','rgba(36,209,126,.12)'],
      warn:['#f0c56a','rgba(240,197,106,.12)'],
      risk:['#ff6b6b','rgba(255,107,107,.12)'],
      blue:['#4bc7ff','rgba(75,199,255,.12)']
    }[tone || 'blue'] || ['#4bc7ff','rgba(75,199,255,.12)'];
    return '<span style="display:inline-flex;align-items:center;gap:6px;padding:2px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:'+cfg[1]+';font-size:9px;color:'+cfg[0]+';font-weight:800;text-transform:uppercase;letter-spacing:.08em"><span style="width:6px;height:6px;border-radius:999px;background:'+cfg[0]+';box-shadow:0 0 10px '+cfg[0]+'"></span>'+aEsc(text)+'</span>';
  }

  function aIntelPanel(title, body, right){
    return '<div class="card" style="padding:0;background:#090909;border:1px solid rgba(255,255,255,.06);overflow:hidden;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.015)"><div style="font-size:10px;color:rgba(255,255,255,.58);font-weight:800;text-transform:uppercase;letter-spacing:.10em">'+title+'</div>'+(right || '')+'</div><div style="padding:9px 10px">'+body+'</div></div>';
  }

  function aIntelList(items, formatter, limit){
    limit = limit || 5;
    items = (items || []).slice(0, limit);
    if(!items.length) return '<div style="font-size:11px;color:#74879b">Belum ada data.</div>';
    return '<div style="display:flex;flex-direction:column;gap:7px">'+items.map(function(item, idx){
      var top = idx === 0;
      return '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.025);border:1px solid '+(top?'rgba(240,197,106,.35)':'rgba(255,255,255,.05)')+'"><span style="font-size:10px;color:'+(top?'#f0c56a':'#6ec8ff')+';font-weight:800">'+String(idx+1).padStart(2,'0')+'</span><div><div style="font-size:11px;color:#fff;font-weight:700;line-height:1.35">'+aEsc(item.label || item.city || '-').slice(0,56)+'</div><div style="font-size:9px;color:#7890a5;margin-top:3px">'+(formatter ? formatter(item) : '')+'</div></div><div style="font-size:11px;color:#fff;font-weight:800">'+(item.value != null ? item.value : item.count || 0)+'</div></div>';
    }).join('')+'</div>';
  }

  function aMapLayerControl(rows, derived, groups, purchase){
    purchase = purchase || null;
    var items = purchase && purchase.featureCollection ? [
      ['Excel Rows', purchase.totalRows || 0, '#f0c56a'],
      ['Wilayah Join', purchase.totalMatched || 0, '#4bc7ff'],
      ['Total Wilayah', purchase.totalWilayah || 0, '#24d17e'],
      ['GeoJSON Ready', (_analyticsPurchase && _analyticsPurchase.geoName) ? 'OK' : 'NO', '#9d8cff'],
      ['Pembelian', 'Rp ' + fmt(purchase.totalPembelian || 0), '#ff6b6b']
    ] : [
      ['Kab/Kota Points', groups.length, '#4bc7ff'],
      ['Unique Orders', derived.orderCount || 0, '#f0c56a'],
      ['Repeat Buyers', derived.repeatBuyerCount || 0, '#24d17e'],
      ['SKU Mismatch', (derived.skuMismatch || []).length, '#ff6b6b'],
      ['Tracking Ready', (derived.trackingList || []).length, '#9d8cff']
    ];
    return '<div style="position:absolute;left:12px;top:12px;width:140px;border-radius:10px;background:rgba(10,13,16,.88);border:1px solid rgba(255,255,255,.08);box-shadow:0 12px 30px rgba(0,0,0,.34);padding:8px 8px 10px;z-index:5"><div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px"><div style="font-size:10px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Layers</div><span style="font-size:9px;color:#6f8397">ON</span></div><div style="display:flex;flex-direction:column;gap:6px;font-size:9px;color:#c6d3de">'+
      items.map(function(item){
        return '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center"><span style="width:7px;height:7px;border-radius:2px;background:'+item[2]+';box-shadow:0 0 10px '+item[2]+'"></span><span>'+item[0]+'</span><strong style="color:#fff">'+item[1]+'</strong></div>';
      }).join('')+
    '</div></div>';
  }

  function aMapLegendFooter(purchase){
    if(purchase && purchase.featureCollection){
      return '<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:10px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:6px 10px;border-radius:999px;background:rgba(10,13,16,.84);border:1px solid rgba(255,255,255,.08);font-size:9px;color:#8ca1b3;text-transform:uppercase;letter-spacing:.08em;z-index:5"><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#f5e3bf"></span>nilai kecil</span><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#eb7b45"></span>menengah</span><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#640f0f"></span>pembelian tinggi</span></div>';
    }
    return '<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:10px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:6px 10px;border-radius:999px;background:rgba(10,13,16,.84);border:1px solid rgba(255,255,255,.08);font-size:9px;color:#8ca1b3;text-transform:uppercase;letter-spacing:.08em;z-index:5"><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#ff9a1f"></span>Customer pulse</span><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#4bc7ff"></span>Kab/Kota lock</span><span style="display:flex;align-items:center;gap:6px"><span style="width:7px;height:7px;border-radius:999px;background:#24d17e"></span>Repeat signal</span></div>';
  }

  function aCustomerTab(){
    var topCity = aTopCity(_analyticsData.customers || []);
    var groups = aCustomerGroups(_analyticsData.customers || []);
    var cityGroups = aCustomerGroupsByKind(_analyticsData.customers || [], 'kota');
    var kabGroups = aCustomerGroupsByKind(_analyticsData.customers || [], 'kabupaten');
    var sessions = aCustomerSessions(_analyticsData.customers || []);
    var derived = aCustomerDerived(_analyticsData.customers || []);
    var topProvince = groups.reduce(function(out,g){
      var key = aNorm(g.province || 'tanpa provinsi');
      if(!out[key]) out[key] = {province:g.province || '-', count:0, omzet:0, rows:0};
      out[key].count += g.count;
      out[key].omzet += g.omzet;
      out[key].rows += g.rows;
      return out;
    }, {});
    var topProvinceList = Object.keys(topProvince).map(function(k){ return topProvince[k]; }).sort(function(a,b){ return b.count - a.count; });
    var repeatTop = derived.buyerRepeat.filter(function(x){ return x.label !== '-' && x.value > 1; }).slice(0,20);
    var purchase = aPurchaseJoin();
    var h = '';
    h += '<div class="card" style="padding:8px 12px;background:linear-gradient(180deg,#101216,#0b0d10);border:1px solid rgba(255,255,255,.07)"><div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:14px;font-weight:900;letter-spacing:.20em;color:#4bc7ff">MONITOR</span>'+aMonitorBadge('live','live')+'</div><div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap">'+aMonitorBadge('customer intelligence','warn')+aMonitorBadge('indonesia grid','blue')+aMonitorBadge('repeat scan','live')+aMonitorBadge('geo watch','risk')+aMonitorBadge('kode-join','warn')+'</div><div style="display:flex;justify-content:flex-end;gap:8px;align-items:center;flex-wrap:wrap"><button class="btnsm" onclick="_analyticsOpenCustomerModal2(\'manual\')" style="background:#151b22;border:1px solid rgba(255,255,255,.08);color:#dbe7f1">+ Input</button><button class="btnsm" onclick="_analyticsOpenCustomerModal2(\'import\')" style="background:#151b22;border:1px solid rgba(255,255,255,.08);color:#dbe7f1">Import Customer</button><button class="btnsm" onclick="_analyticsImportPurchaseExcel2()" style="background:#151b22;border:1px solid rgba(240,197,106,.12);color:#f0c56a">Import Excel Pembelian</button><button class="btnsm" onclick="_analyticsImportPurchaseGeo2()" style="background:#151b22;border:1px solid rgba(75,199,255,.18);color:#8fd0ff">Upload GeoJSON</button><details style="position:relative"><summary class="btnsm" style="list-style:none;background:#151b22;border:1px solid rgba(255,255,255,.08);color:#dbe7f1;cursor:pointer">Control</summary><div style="position:absolute;right:0;top:30px;min-width:240px;padding:8px;border-radius:12px;background:#0f141a;border:1px solid rgba(255,255,255,.08);box-shadow:0 18px 40px rgba(0,0,0,.35);z-index:20"><button class="btnsm" onclick="_analyticsOpenCustomerModal2(\'manage\')" style="width:100%;background:#171d25;margin-bottom:6px">Kelola & Hapus Massal</button><button class="btnsm" onclick="_analyticsOpenCustomerModal2(\'import\')" style="width:100%;background:#171d25;margin-bottom:6px">Import Bertanggal</button><button class="btnsm" onclick="_analyticsOpenCustomerModal2(\'manual\')" style="width:100%;background:#171d25;margin-bottom:6px">Input Manual Lengkap</button><button class="btnsm" onclick="_analyticsImportPurchaseExcel2()" style="width:100%;background:#171d25;margin-bottom:6px">Refresh Excel Pembelian</button><button class="btnsm" onclick="_analyticsImportPurchaseGeo2()" style="width:100%;background:#171d25">Ganti GeoJSON Wilayah</button></div></details></div></div></div>';
    h += '<div style="display:grid;grid-template-columns:minmax(0,1.7fr) 420px;gap:10px;margin-bottom:10px;align-items:start">';
    h += '<div class="card" style="padding:0;background:#050505;border:1px solid rgba(255,255,255,.06);overflow:hidden;align-self:start;height:auto;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.05);background:#080808"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;color:rgba(255,255,255,.58);font-weight:800;text-transform:uppercase;letter-spacing:.10em">Maps Customer</span>'+aMonitorBadge(purchase.featureCollection ? 'kode-join active' : 'customer point mode','blue')+'</div><div style="display:flex;gap:8px;flex-wrap:wrap;font-size:9px;color:#7f92a5;text-transform:uppercase;letter-spacing:.08em"><span>'+ (purchase.excelName ? aEsc(purchase.excelName) : 'Excel pembelian belum dimuat') +'</span><span>Fri, '+new Date().toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</span></div></div><div style="position:relative;line-height:0"><div id="ANA-CUSTOMER-MAP" style="height:418px;background:#04070c"></div>'+aMapLayerControl(_analyticsData.customers || [], derived, groups, purchase)+aMapLegendFooter(purchase)+'</div></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-content:start">';
    h += aIntelPanel('Purchase Map Status',
      '<div style="display:flex;flex-direction:column;gap:8px;font-size:10px"><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Excel Rows</span><strong style="color:#fff">'+purchase.totalRows+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Wilayah Join</span><strong style="color:#8fd0ff">'+purchase.totalMatched+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">GeoJSON</span><strong style="color:#fff">'+(_analyticsPurchase.geoName ? aEsc(_analyticsPurchase.geoName) : '-')+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Updated</span><strong style="color:#f0c56a">'+(_analyticsPurchase.updatedAt ? new Date(_analyticsPurchase.updatedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-')+'</strong></div></div>',
      aMonitorBadge('join','warn')
    );
    h += aIntelPanel('Strategic Risk Overview',
      '<div style="display:grid;grid-template-columns:82px 1fr;gap:10px;align-items:center"><div style="width:76px;height:76px;border-radius:999px;background:conic-gradient(#ff9a1f 0 '+Math.max(20,Math.min(320,Math.round(aPct((derived.skuMismatch || []).length + derived.repeatBuyerCount, Math.max(1,derived.orderCount))*3.2)))+'deg,rgba(255,255,255,.06) 0 360deg);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 10px #0d1218"><div style="text-align:center"><div style="font-size:22px;color:#fff;font-weight:900">'+Math.round(aPct((derived.skuMismatch || []).length + derived.repeatBuyerCount, Math.max(1,derived.orderCount)))+'</div><div style="font-size:9px;color:#f0c56a">risk</div></div></div><div style="display:flex;flex-direction:column;gap:7px;font-size:10px"><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Kab/Kota Tracked</span><strong style="color:#fff">'+groups.length+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Repeat Buyers</span><strong style="color:#24d17e">'+(derived.repeatBuyerCount || 0)+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">SKU Mismatch</span><strong style="color:#ff6b6b">'+((derived.skuMismatch || []).length)+'</strong></div><div style="display:flex;justify-content:space-between"><span style="color:#7f93a6">Tracking Ready</span><strong style="color:#4bc7ff">'+((derived.trackingList || []).length)+'</strong></div></div></div>',
      aMonitorBadge('live','live')
    );
    h += aIntelPanel('Top Provinces', aIntelList((topProvinceList.slice(0,6).map(function(item){ return {label:item.province, value:item.count, rows:item.rows, omzet:item.omzet}; })), function(item){ return item.rows+' row • Rp '+fmt(item.omzet); }, 6), aMonitorBadge('rank','warn'));
    h += aIntelPanel('Customer Hotspots', aIntelList(groups.slice(0,6).map(function(item){ return {label:item.city + ' / ' + (item.province || '-'), value:item.count, rows:item.rows, omzet:item.omzet}; }), function(item){ return item.rows+' row • Rp '+fmt(item.omzet); }, 6), aMonitorBadge('geo','blue'));
    h += aIntelPanel('Repeat Buyer Ratio',
      '<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:8px"><div><div style="font-size:26px;color:#fff;font-weight:900">'+(derived.orderCount ? aPct(derived.repeatOrderCount, derived.orderCount).toFixed(1) : '0.0')+'%</div><div style="font-size:10px;color:#8195a8">repeat order dari buyer dengan nomor pesanan berbeda</div></div>'+aMonitorBadge((derived.repeatBuyerCount || 0)+' buyer','live')+'</div><div style="height:8px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden"><div style="width:'+Math.max(4,Math.min(100,aPct(derived.repeatOrderCount, Math.max(1,derived.orderCount))))+'%;height:100%;background:linear-gradient(90deg,#24d17e,#4bc7ff)"></div></div>'+aIntelList(repeatTop.slice(0,4), function(item){ return item.value + ' order unik'; }, 4)+'</div>',
      aMonitorBadge('repeat','live')
    );
    h += '</div></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-bottom:10px">';
    h += aCompactMetric('Wilayah Map', String(purchase.totalMatched || 0), '#FF9A1F', 'fitur kab/kota terjoin');
    h += aCompactMetric('Total Pembelian', 'Rp ' + fmt(purchase.totalPembelian || 0), '#F0C56A', 'berdasarkan Excel kode wilayah');
    h += aCompactMetric('Order Unik',String(derived.orderCount || 0),'#8FD0FF','1 nomor pesanan = 1 order');
    h += aCompactMetric('Rows',String((_analyticsData.customers||[]).length),'#4bc7ff','total baris customer');
    h += aCompactMetric('Negara',aEsc(derived.dominantCountry.label || '-'),'#3FD0FF',derived.dominantCountry.count+' order');
    h += aCompactMetric('Top Kota',aEsc(topCity.name || '-'),'#F0C56A',topCity.value+' order');
    h += aCompactMetric('Avg Order Time',aEsc(derived.averageOrderTime || '-'),'#FFB86B','jam transaksi aktif');
    h += aCompactMetric('Avg Complete',((derived.averageDurationHours || 0).toFixed(1))+' jam','#A7F3B6','dari dibuat ke selesai');
    h += aCompactMetric('Voucher','Rp '+fmt(derived.voucherTotal),'#A7F3B6','voucher + toko');
    h += aCompactMetric('Diskon','Rp '+fmt(derived.discountTotal),'#FFB86B','diskon penjual');
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px">';
    h += aIntelPanel('Marketplace Ratio', aDonutCompare('Rasio Marketplace', derived.marketplaceCompare, '#F0C56A', true), aMonitorBadge('pie','warn'));
    h += aIntelPanel('Payment Ratio', aDonutCompare('Rasio Metode Pembayaran', derived.paymentCompare, '#8FD0FF', true), aMonitorBadge('split','blue'));
    h += aIntelPanel('Store Dominance', aDonutCompare('Rasio Toko Dominan', derived.storeCompare, '#A7F3B6', true), aMonitorBadge('store','live'));
    h += aIntelPanel('Package Types', aDonutCompare('Rasio Jenis Paket', derived.packageCompare, '#FF9A1F', true), aMonitorBadge('ops','risk'));
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px">';
    h += aRankList('Waktu Order 10 Hari Terakhir', derived.recentByHour, 'range 10 hari', function(item){ return item.value + ' order pada jam ini'; }, 178);
    h += aRankList('SKU Terlaris 1-20', derived.skuTop20, 'top produk aktif', function(item){ return item.value + ' qty'; }, 178);
    h += aRankList('Phone Book', derived.phoneBook, 'frekuensi order unik', function(item){ return item.value + ' order berbeda'; }, 178);
    h += aRankList('Repeat Order Buyer Top 20', repeatTop, 'nama pembeli dengan no pesanan berbeda', function(item){ return item.value + ' order unik'; }, 178);
    h += aRankList('Kode Pos Teratas', derived.postalRanks, 'disertai kabupaten/kota', function(item){ return item.value + ' order'; }, 178);
    h += aRankList('Nomor Resi Database', derived.trackingList, 'siap dipakai berikutnya', function(item){ return item.marketplace + ' • ' + item.city; }, 178);
    h += aRankList('Crosscheck SKU vs SKU Gudang', derived.skuMismatch, 'cek perbedaan kode', function(item){ return item.value + ' mismatch terdeteksi'; }, 178);
    h += aRankList('Banding Harga vs Modal', derived.skuProfit, 'profit / loss by SKU', function(item){ return 'Sell Rp '+fmt(item.sell)+' • Modal Rp '+fmt(item.cost)+' • ' + (item.profit >= 0 ? 'Profit ' : 'Loss ') + 'Rp ' + fmt(Math.abs(item.profit)); }, 178);
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    h += aCustomerStatsTable('Peringkat Pembelian Kabupaten', purchase.summary.map(function(item){ return {city:item.kabupaten, province:item.provinsi, rows:item.rows, count:item.rows, omzet:item.totalPembelian}; }), 'purchaseMapExpanded', 'Belum ada data pembelian kabupaten dari Excel.');
    h += aCustomerStatsTable('Statistik Kota', cityGroups, 'customerCityExpanded', 'Belum ada statistik kota.');
    h += aCustomerStatsTable('Statistik Kabupaten', kabGroups, 'customerKabExpanded', 'Belum ada statistik kabupaten.');
    h += '</div>';
    return h;
  }

  function aSaveSales(){
    var row = {
      id: (_analyticsUI.salesEdit >= 0 && _analyticsData.sales[_analyticsUI.salesEdit]) ? _analyticsData.sales[_analyticsUI.salesEdit].id : aId('sale'),
      date: (document.getElementById('ANA-SALES-DATE')||{}).value || aToday(),
      channel: (document.getElementById('ANA-SALES-CHANNEL')||{}).value || '',
      revenue: aNum((document.getElementById('ANA-SALES-REV')||{}).value),
      orders: aNum((document.getElementById('ANA-SALES-ORD')||{}).value),
      aov: aNum((document.getElementById('ANA-SALES-AOV')||{}).value),
      note: (document.getElementById('ANA-SALES-NOTE')||{}).value || ''
    };
    if(!row.channel){ toast('Channel penjualan wajib diisi','error'); return; }
    if(!row.aov && row.orders > 0) row.aov = row.revenue / row.orders;
    if(_analyticsUI.salesEdit >= 0) _analyticsData.sales[_analyticsUI.salesEdit] = row; else _analyticsData.sales.unshift(row);
    aSave('general'); aResetEdit('sales'); toast('Data penjualan disimpan','success'); _renderAnalytics('sales');
  }

  function aSaveService(){
    var row = {
      id: (_analyticsUI.serviceEdit >= 0 && _analyticsData.service[_analyticsUI.serviceEdit]) ? _analyticsData.service[_analyticsUI.serviceEdit].id : aId('svc'),
      date: (document.getElementById('ANA-SVC-DATE')||{}).value || aToday(),
      channel: (document.getElementById('ANA-SVC-CHANNEL')||{}).value || '',
      tickets: aNum((document.getElementById('ANA-SVC-TICKET')||{}).value),
      resolved: aNum((document.getElementById('ANA-SVC-RES')||{}).value),
      response: aNum((document.getElementById('ANA-SVC-RESP')||{}).value),
      rating: aNum((document.getElementById('ANA-SVC-RATING')||{}).value),
      note: (document.getElementById('ANA-SVC-NOTE')||{}).value || ''
    };
    if(!row.channel){ toast('Channel layanan wajib diisi','error'); return; }
    if(_analyticsUI.serviceEdit >= 0) _analyticsData.service[_analyticsUI.serviceEdit] = row; else _analyticsData.service.unshift(row);
    aSave('general'); aResetEdit('service'); toast('Data layanan disimpan','success'); _renderAnalytics('service');
  }

  function aSavePromo(){
    var row = {
      id: (_analyticsUI.promoEdit >= 0 && _analyticsData.promo[_analyticsUI.promoEdit]) ? _analyticsData.promo[_analyticsUI.promoEdit].id : aId('promo'),
      date: (document.getElementById('ANA-PRO-DATE')||{}).value || aToday(),
      name: (document.getElementById('ANA-PRO-NAME')||{}).value || '',
      channel: (document.getElementById('ANA-PRO-CHANNEL')||{}).value || '',
      spend: aNum((document.getElementById('ANA-PRO-SPEND')||{}).value),
      revenue: aNum((document.getElementById('ANA-PRO-REV')||{}).value),
      conversions: aNum((document.getElementById('ANA-PRO-CONV')||{}).value),
      note: (document.getElementById('ANA-PRO-NOTE')||{}).value || ''
    };
    if(!row.name){ toast('Nama campaign wajib diisi','error'); return; }
    if(_analyticsUI.promoEdit >= 0) _analyticsData.promo[_analyticsUI.promoEdit] = row; else _analyticsData.promo.unshift(row);
    aSave('general'); aResetEdit('promo'); toast('Data promosi disimpan','success'); _renderAnalytics('promo');
  }

  function aCustomerFormMarkup(row){
    row = row || {};
    var h = '';
    h += '<div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Order & Marketplace</div>';
    h += '<div class="g2" style="grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px">';
    h += aInput('Nomor Pesanan','ANA-CUS-ORDER-NO','text',row.orderNumber || '','Nomor order');
    h += aInput('Jenis Paket','ANA-CUS-PACKAGE','text',row.packageType || '','Reguler / Instant / dsb');
    h += aInput('Marketplace','ANA-CUS-MARKET','text',row.channel || row.marketplace || '','Shopee / TikTok / Lazada');
    h += aInput('Toko Marketplace','ANA-CUS-STORE-MARKET','text',row.storeMarketplace || '','Nama toko di marketplace');
    h += aInput('Nama Panggilan Toko BigSeller','ANA-CUS-STORE-NICK','text',row.storeName || '','Alias toko BigSeller');
    h += aInput('Nama Pembeli','ANA-CUS-BUYER','text',row.name || row.buyerName || '','Nama pembeli');
    h += aInput('Nama Penerima','ANA-CUS-RECEIVER','text',row.receiverName || '','Nama penerima');
    h += aInput('Nomor Telepon','ANA-CUS-PHONE','text',row.phone || '','08xxxx');
    h += '</div>';
    h += '<div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 8px">Alamat & Wilayah</div>';
    h += '<div class="g2" style="grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px">';
    h += aInput('Kode Pos','ANA-CUS-POSTAL','text',row.postalCode || '','Kode pos');
    h += aInput('Provinsi','ANA-CUS-PROV','text',row.province || '','Contoh: Jawa Barat');
    h += aInput('Kabupaten/Kota','ANA-CUS-CITY','text',row.city || '','Kabupaten Bekasi / Kota Bekasi');
    h += aInput('Kecamatan','ANA-CUS-DISTRICT','text',row.district || '','Kecamatan');
    h += aInput('Negara','ANA-CUS-COUNTRY','text',row.country || 'Indonesia','Negara');
    h += '</div>';
    h += '<div style="margin-top:10px">'+aText('Alamat Lengkap','ANA-CUS-ADDRESS',row.fullAddress || '','Alamat lengkap',3)+'</div>';
    h += '<div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 8px">Produk & SKU</div>';
    h += '<div class="g2" style="grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px">';
    h += aInput('SKU','ANA-CUS-SKU','text',row.sku || '','SKU produk');
    h += aInput('Nama Produk','ANA-CUS-PRODUCT','text',row.productName || '','Nama produk');
    h += aInput('Nama Variasi','ANA-CUS-VARIANT','text',row.variantName || '','Warna / ukuran');
    h += aInput('Jumlah','ANA-CUS-QTY','number',row.quantity || row.orders || '1','0');
    h += aInput('SKU Gudang','ANA-CUS-WSKU','text',row.warehouseSku || row.sku || '','SKU gudang');
    h += aInput('Nama SKU Gudang','ANA-CUS-WSKU-NAME','text',row.warehouseSkuName || '','Nama SKU gudang');
    h += aInput('Tujuan Gambar','ANA-CUS-IMAGE-TARGET','text',row.imageTarget || '','Tujuan gambar');
    h += aInput('Kategori Produk','ANA-CUS-CATEGORY','text',row.segment || row.productCategory || 'Retail','Kategori produk');
    h += '</div>';
    h += '<div style="font-size:11px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 8px">Nilai, Pembayaran & Waktu</div>';
    h += '<div class="g2" style="grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px">';
    h += aInput('Harga Satuan','ANA-CUS-UNIT-PRICE','number',row.unitPrice || '','0');
    h += aInput('Subtotal Produk','ANA-CUS-SUBTOTAL','number',row.productSubtotal || row.revenue || '','0');
    h += aInput('Harga Awal Produk','ANA-CUS-BASE-PRICE','number',row.baseProductPrice || '','0');
    h += aInput('Modal Produk','ANA-CUS-COST','number',row.productCost || '','0');
    h += aInput('Voucher','ANA-CUS-VOUCHER','number',row.voucherAmount || '','0');
    h += aInput('Voucher Toko','ANA-CUS-STORE-VOUCHER','number',row.storeVoucherAmount || '','0');
    h += aInput('Diskon Penjual','ANA-CUS-SELLER-DISC','number',row.sellerDiscountAmount || '','0');
    h += aInput('Total Pesanan','ANA-CUS-TOTAL','number',row.totalOrder || row.revenue || '','0');
    h += aInput('Metode Pembayaran','ANA-CUS-PAYMENT','text',row.paymentMethod || '','COD / Transfer / QRIS');
    h += aInput('Jasa Kirim yang Dipilih','ANA-CUS-SHIPPING','text',row.shippingService || '','Kurir / service');
    h += aInput('Nomor Resi','ANA-CUS-TRACKING','text',row.trackingNumber || '','Nomor resi');
    h += aInput('Status','ANA-CUS-STATUS','text',row.status || 'Aktif','Aktif / Repeat / Baru');
    h += aInput('Tanggal Ringkas','ANA-CUS-DATE','date',row.date || aToday(),'');
    h += aInput('Waktu Pesanan Dibuat','ANA-CUS-CREATED','text',row.orderCreatedAt || '','YYYY-MM-DD HH:mm');
    h += aInput('Waktu Selesai','ANA-CUS-DONE','text',row.completedAt || '','YYYY-MM-DD HH:mm');
    h += '</div>';
    h += '<div style="margin-top:10px">'+aText('Catatan Tambahan','ANA-CUS-NOTE',row.note || '','Catatan customer / order',4)+'</div>';
    return h;
  }

  function aCloseCustomerModal(){
    var el = document.getElementById('ANA-CUSTOMER-MODAL');
    if(el) el.remove();
  }

  function aSaveCustomer(){
    var sessionId = (_analyticsUI.customerEdit >= 0 && _analyticsData.customers[_analyticsUI.customerEdit] && _analyticsData.customers[_analyticsUI.customerEdit].uploadSessionId) || aId('manual_session');
    var row = {
      id: (_analyticsUI.customerEdit >= 0 && _analyticsData.customers[_analyticsUI.customerEdit]) ? _analyticsData.customers[_analyticsUI.customerEdit].id : aId('cust'),
      date: (document.getElementById('ANA-CUS-DATE')||{}).value || aToday(),
      orderNumber: (document.getElementById('ANA-CUS-ORDER-NO')||{}).value || '',
      packageType: (document.getElementById('ANA-CUS-PACKAGE')||{}).value || '',
      marketplace: (document.getElementById('ANA-CUS-MARKET')||{}).value || '',
      storeMarketplace: (document.getElementById('ANA-CUS-STORE-MARKET')||{}).value || '',
      storeName: (document.getElementById('ANA-CUS-STORE-NICK')||{}).value || '',
      buyerName: (document.getElementById('ANA-CUS-BUYER')||{}).value || '',
      receiverName: (document.getElementById('ANA-CUS-RECEIVER')||{}).value || '',
      name: (document.getElementById('ANA-CUS-BUYER')||{}).value || '',
      phone: (document.getElementById('ANA-CUS-PHONE')||{}).value || '',
      postalCode: (document.getElementById('ANA-CUS-POSTAL')||{}).value || '',
      city: (document.getElementById('ANA-CUS-CITY')||{}).value || '',
      province: (document.getElementById('ANA-CUS-PROV')||{}).value || '',
      district: (document.getElementById('ANA-CUS-DISTRICT')||{}).value || '',
      fullAddress: (document.getElementById('ANA-CUS-ADDRESS')||{}).value || '',
      country: (document.getElementById('ANA-CUS-COUNTRY')||{}).value || 'Indonesia',
      sku: (document.getElementById('ANA-CUS-SKU')||{}).value || '',
      productName: (document.getElementById('ANA-CUS-PRODUCT')||{}).value || '',
      variantName: (document.getElementById('ANA-CUS-VARIANT')||{}).value || '',
      quantity: aNum((document.getElementById('ANA-CUS-QTY')||{}).value) || 1,
      warehouseSku: (document.getElementById('ANA-CUS-WSKU')||{}).value || '',
      warehouseSkuName: (document.getElementById('ANA-CUS-WSKU-NAME')||{}).value || '',
      imageTarget: (document.getElementById('ANA-CUS-IMAGE-TARGET')||{}).value || '',
      productCategory: (document.getElementById('ANA-CUS-CATEGORY')||{}).value || '',
      channel: (document.getElementById('ANA-CUS-MARKET')||{}).value || '',
      orders: aNum((document.getElementById('ANA-CUS-QTY')||{}).value) || 1,
      unitPrice: aNum((document.getElementById('ANA-CUS-UNIT-PRICE')||{}).value),
      productSubtotal: aNum((document.getElementById('ANA-CUS-SUBTOTAL')||{}).value),
      baseProductPrice: aNum((document.getElementById('ANA-CUS-BASE-PRICE')||{}).value),
      productCost: aNum((document.getElementById('ANA-CUS-COST')||{}).value),
      voucherAmount: aNum((document.getElementById('ANA-CUS-VOUCHER')||{}).value),
      storeVoucherAmount: aNum((document.getElementById('ANA-CUS-STORE-VOUCHER')||{}).value),
      sellerDiscountAmount: aNum((document.getElementById('ANA-CUS-SELLER-DISC')||{}).value),
      totalOrder: aNum((document.getElementById('ANA-CUS-TOTAL')||{}).value),
      revenue: aNum((document.getElementById('ANA-CUS-TOTAL')||{}).value) || aNum((document.getElementById('ANA-CUS-SUBTOTAL')||{}).value),
      paymentMethod: (document.getElementById('ANA-CUS-PAYMENT')||{}).value || '',
      shippingService: (document.getElementById('ANA-CUS-SHIPPING')||{}).value || '',
      trackingNumber: (document.getElementById('ANA-CUS-TRACKING')||{}).value || '',
      orderCreatedAt: (document.getElementById('ANA-CUS-CREATED')||{}).value || '',
      completedAt: (document.getElementById('ANA-CUS-DONE')||{}).value || '',
      status: (document.getElementById('ANA-CUS-STATUS')||{}).value || '',
      segment: (document.getElementById('ANA-CUS-CATEGORY')||{}).value || '',
      note: (document.getElementById('ANA-CUS-NOTE')||{}).value || '',
      sourceType:'manual',
      uploadSessionId: sessionId,
      uploadSessionLabel: (_analyticsUI.customerEdit >= 0 && _analyticsData.customers[_analyticsUI.customerEdit] && _analyticsData.customers[_analyticsUI.customerEdit].uploadSessionLabel) || ('Manual ' + aFmtDate((document.getElementById('ANA-CUS-DATE')||{}).value || aToday()))
    };
    if(!row.city){ toast('Kota / Kabupaten wajib diisi','error'); return; }
    if(_analyticsUI.customerEdit >= 0) _analyticsData.customers[_analyticsUI.customerEdit] = row; else _analyticsData.customers.unshift(row);
    aSave('customers'); aResetEdit('customers'); aCloseCustomerModal(); toast('Customer data disimpan','success'); _renderAnalytics('customers');
  }

  function aReset(section){
    aResetEdit(section);
    _renderAnalytics(_analyticsSub || 'dash');
  }

  function aNumLoose(v){
    var s = String(v == null ? '' : v).trim();
    if(!s) return 0;
    s = s.replace(/\s/g,'');
    if(/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g,'').replace(',', '.');
    else if(/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g,'');
    else s = s.replace(/,/g,'');
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  function aHeaderKey(v){
    return aNorm(v).replace(/\//g,' ').replace(/_/g,' ');
  }

  function aCustomerFromRow(obj, sessionMeta){
    sessionMeta = sessionMeta || {};
    var by = {};
    Object.keys(obj || {}).forEach(function(k){ by[aHeaderKey(k)] = obj[k]; });
    function pick(keys){
      for(var i=0;i<keys.length;i++){
        var key = aHeaderKey(keys[i]);
        if(by[key] != null && String(by[key]).trim() !== '') return by[key];
      }
      return '';
    }
    return {
      id: aId('custimp'),
      date: String(pick(['tanggal','date','created at','waktu pesanan dibuat']) || sessionMeta.from || aToday()).slice(0,10),
      orderNumber: String(pick(['nomor pesanan','order number','nomor order']) || '').trim(),
      packageType: String(pick(['jenis paket','tipe paket']) || '').trim(),
      orderCreatedAt: String(pick(['waktu pesanan dibuat','created at','tanggal','date']) || sessionMeta.from || aToday()).trim(),
      completedAt: String(pick(['waktu selesai','completed at','selesai']) || '').trim(),
      name: String(pick(['nama pembeli','nama customer','customer name','nama']) || '').trim(),
      buyerName: String(pick(['nama pembeli','customer name','nama']) || '').trim(),
      receiverName: String(pick(['nama penerima','receiver name']) || '').trim(),
      storeName: String(pick(['nama panggilan toko bigseller','nama toko','store name']) || '').trim(),
      storeMarketplace: String(pick(['toko marketplace','marketplace store']) || '').trim(),
      city: String(pick(['kota kabupaten','kabupaten kota','kota','kabupaten','city']) || '').trim(),
      district: String(pick(['kecamatan','district']) || '').trim(),
      fullAddress: String(pick(['alamat lengkap','full address','alamat']) || '').trim(),
      postalCode: String(pick(['kode pos','postal code']) || '').trim(),
      province: String(pick(['provinsi','province']) || '').trim(),
      country: String(pick(['negara','country']) || 'Indonesia').trim(),
      phone: String(pick(['nomor telepon','phone','no hp']) || '').trim(),
      channel: String(pick(['marketplace','channel','platform','sumber']) || 'Marketplace').trim(),
      marketplace: String(pick(['marketplace','channel','platform']) || 'Marketplace').trim(),
      orders: Math.max(1, aNumLoose(pick(['jumlah','orders','jumlah order','order'])) || 1),
      quantity: Math.max(1, aNumLoose(pick(['jumlah','orders','jumlah order','order'])) || 1),
      unitPrice: aNumLoose(pick(['harga satuan','unit price'])),
      productSubtotal: aNumLoose(pick(['subtotal produk','product subtotal'])),
      baseProductPrice: aNumLoose(pick(['harga awal produk','product base price'])),
      totalOrder: aNumLoose(pick(['total pesanan','revenue','omzet','nominal','total belanja'])),
      revenue: aNumLoose(pick(['total pesanan','revenue','omzet','nominal','total belanja','subtotal produk'])),
      status: String(pick(['status','customer status']) || (pick(['yang membatalkan']) ? 'Cancelled' : 'Aktif')).trim(),
      segment: String(pick(['segment','kategori','type','kategori produk']) || 'Retail').trim(),
      sku: String(pick(['sku','sku produk']) || '').trim(),
      productName: String(pick(['nama produk','product name']) || '').trim(),
      variantName: String(pick(['nama variasi','variasi','variant']) || '').trim(),
      warehouseSku: String(pick(['sku gudang','warehouse sku']) || '').trim(),
      warehouseSkuName: String(pick(['nama sku gudang','warehouse sku name']) || '').trim(),
      imageTarget: String(pick(['tujuan gambar','image target']) || '').trim(),
      productCost: aNumLoose(pick(['modal produk','product cost'])),
      paymentMethod: String(pick(['metode pembayaran','payment method']) || '').trim(),
      voucherAmount: aNumLoose(pick(['voucher'])),
      storeVoucherAmount: aNumLoose(pick(['voucher toko'])),
      sellerDiscountAmount: aNumLoose(pick(['diskon penjual'])),
      shippingService: String(pick(['jasa kirim yang dipilih','shipping service']) || '').trim(),
      trackingNumber: String(pick(['nomor resi','tracking number']) || '').trim(),
      note: [
        pick(['catatan','note','notes']),
        pick(['nomor pesanan']) ? 'Order: ' + pick(['nomor pesanan']) : '',
        pick(['nomor telepon']) ? 'Telp: ' + pick(['nomor telepon']) : '',
        pick(['negara']) ? 'Negara: ' + pick(['negara']) : '',
        pick(['yang membatalkan']) ? 'Pembatal: ' + pick(['yang membatalkan']) : '',
        pick(['alasan pembatalan']) ? 'Alasan: ' + pick(['alasan pembatalan']) : '',
        pick(['nama produk']) ? 'Produk: ' + pick(['nama produk']) : '',
        pick(['sku']) ? 'SKU: ' + pick(['sku']) : '',
        pick(['sku gudang']) ? 'SKU Gudang: ' + pick(['sku gudang']) : '',
        pick(['metode pembayaran']) ? 'Payment: ' + pick(['metode pembayaran']) : '',
        pick(['voucher']) ? 'Voucher: ' + pick(['voucher']) : '',
        pick(['voucher toko']) ? 'Voucher Toko: ' + pick(['voucher toko']) : '',
        pick(['diskon penjual']) ? 'Diskon Penjual: ' + pick(['diskon penjual']) : ''
      ].filter(Boolean).join(' | '),
      sourceType:'import',
      uploadSessionId: sessionMeta.id || aId('import_session'),
      uploadSessionLabel: sessionMeta.label || 'Import Customer',
      importPeriodFrom: sessionMeta.from || '',
      importPeriodTo: sessionMeta.to || '',
      importFileName: sessionMeta.fileName || ''
    };
  }

  function aParseCsv(text){
    var lines = String(text || '').replace(/\r/g,'').split('\n').filter(function(x){ return x.trim(); });
    if(lines.length < 2) return [];
    function split(line){
      var out=[], cur='', q=false;
      for(var i=0;i<line.length;i++){
        var ch=line[i];
        if(ch === '"'){
          if(q && line[i+1] === '"'){ cur += '"'; i++; }
          else q = !q;
        }else if(ch === ',' && !q){
          out.push(cur); cur = '';
        }else{
          cur += ch;
        }
      }
      out.push(cur);
      return out;
    }
    var headers = split(lines[0]).map(function(h){ return h.trim(); });
    return lines.slice(1).map(function(line){
      var cols = split(line);
      var obj = {};
      headers.forEach(function(h,idx){ obj[h] = cols[idx] == null ? '' : cols[idx]; });
      return obj;
    });
  }

  function aImportCustomerRows(rows, sessionMeta){
    var imported = rows.map(function(r){ return aCustomerFromRow(r, sessionMeta); }).filter(function(r){ return r.city || r.province || r.name; });
    if(!imported.length){ toast('Header customer tidak cocok atau file kosong','error'); return; }
    _analyticsData.customers = imported.concat(_analyticsData.customers || []);
    aSave('customers');
    aCloseCustomerModal();
    toast('Import customer berhasil: ' + imported.length + ' baris','success',4000);
    _renderAnalytics('customers');
  }

  function aImportCustomersDirect(from, to){
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.csv,.xlsx,.xls';
    inp.onchange = function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      var sessionMeta = {
        id: aId('import_session'),
        label: 'Import ' + (file.name || 'Customer') + ' • ' + aFmtDate(from || aToday()) + (to ? ' - ' + aFmtDate(to) : ''),
        from: from || aToday(),
        to: to || from || aToday(),
        fileName: file.name || ''
      };
      var name = String(file.name || '').toLowerCase();
      if((name.endsWith('.xlsx') || name.endsWith('.xls')) && !window.XLSX){
        toast('Import Excel butuh parser XLSX di halaman. Simpan sebagai CSV atau aktifkan parser XLSX dulu.','warn',5000);
        return;
      }
      if((name.endsWith('.xlsx') || name.endsWith('.xls')) && window.XLSX){
        var fr = new FileReader();
        fr.onload = function(ev){
          try{
            var wb = XLSX.read(new Uint8Array(ev.target.result), {type:'array'});
            var sheet = wb.Sheets[wb.SheetNames[0]];
            var rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
            aImportCustomerRows(rows, sessionMeta);
          }catch(err){
            toast('Gagal membaca file Excel customer','error');
          }
        };
        fr.readAsArrayBuffer(file);
      }else{
        var fr2 = new FileReader();
        fr2.onload = function(ev){
          try{
            aImportCustomerRows(aParseCsv(ev.target.result), sessionMeta);
          }catch(err){
            toast('Gagal membaca file CSV customer','error');
          }
        };
        fr2.readAsText(file);
      }
    };
    inp.click();
  }

  function aDeleteCustomerSession(sessionId){
    confirmDelete('Hapus seluruh data dari sesi upload ini?', function(){
      _analyticsData.customers = (_analyticsData.customers || []).filter(function(r){ return r.uploadSessionId !== sessionId; });
      aSave('customers');
      toast('Sesi upload dihapus','success');
      aCloseCustomerModal();
      _renderAnalytics('customers');
    });
  }

  function aDeleteSelectedCustomers(){
    var ids = Array.from(document.querySelectorAll('.ana-customer-check:checked')).map(function(el){ return el.value; });
    if(!ids.length){ toast('Pilih item customer yang ingin dihapus dulu','warn'); return; }
    confirmDelete('Hapus ' + ids.length + ' item customer terpilih?', function(){
      _analyticsData.customers = (_analyticsData.customers || []).filter(function(r){ return ids.indexOf(r.id) === -1; });
      aSave('customers');
      toast('Item terpilih dihapus','success');
      aCloseCustomerModal();
      _renderAnalytics('customers');
    });
  }

  function aToggleAllCustomerChecks(checked){
    Array.from(document.querySelectorAll('.ana-customer-check')).forEach(function(el){ el.checked = !!checked; });
  }

  function aOpenCustomerModal(mode, idx){
    _analyticsUI.customerModalMode = mode || 'manual';
    if(typeof idx === 'number') _analyticsUI.customerEdit = idx;
    else if(mode === 'manual') _analyticsUI.customerEdit = -1;
    var row = (_analyticsUI.customerEdit >= 0 && _analyticsData.customers[_analyticsUI.customerEdit]) ? _analyticsData.customers[_analyticsUI.customerEdit] : {};
    var sessions = aCustomerSessions(_analyticsData.customers || []);
    var body = '';
    var title = 'Customer Data';
    if(mode === 'manual'){
      title = _analyticsUI.customerEdit >= 0 ? 'Edit Customer Data' : 'Input Customer Data';
      body = '<div style="font-size:12px;color:var(--tx2);margin-bottom:12px">Input manual customer untuk dipetakan ke analytics wilayah.</div>' +
        aCustomerFormMarkup(row) +
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="btns" onclick="_analyticsCloseCustomerModal2()">Batal</button><button class="btnp" onclick="_analyticsSaveCustomer2()" style="background:#8C5E16">'+(_analyticsUI.customerEdit >= 0 ? 'Update' : 'Simpan')+' Customer</button></div>';
    }else if(mode === 'import'){
      title = 'Import Customer Excel / CSV';
      body = '<div style="font-size:12px;color:var(--tx2);margin-bottom:12px">Pilih periode import lalu upload file. Header yang didukung menyesuaikan format seperti `Nomor Telepon`, `Kabupaten/Kota`, `Provinsi`, `Marketplace`, `Nama Panggilan Toko BigSeller`, `Waktu Pesanan Dibuat`, dan kolom terkait lain pada file Anda.</div>'+
        '<div class="g2" style="grid-template-columns:1fr 1fr;gap:10px">'+
          aInput('Periode Dari','ANA-CUS-IMP-FROM','date',aToday(),'')+
          aInput('Periode Sampai','ANA-CUS-IMP-TO','date',aToday(),'')+
        '</div>'+
        '<div style="margin-top:12px;padding:12px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)"><div style="font-size:11px;color:#fff;font-weight:800;margin-bottom:8px">Contoh Header Excel</div><div style="display:flex;gap:8px;flex-wrap:wrap">'+
          ['Nomor Pesanan','Jenis Paket','Marketplace','Toko Marketplace','Nama Panggilan Toko BigSeller','Nama Pembeli','Nama Penerima','Nomor Telepon','Kode Pos','Provinsi','Kabupaten/Kota','Kecamatan','Alamat Lengkap','SKU','Nama Produk','Nama Variasi','Jumlah','Harga Satuan','Subtotal Produk','Harga Awal Produk','SKU Gudang','Nama SKU Gudang','Tujuan Gambar','Modal Produk','Jasa Kirim yang Dipilih','Nomor Resi','Total Pesanan','Metode Pembayaran','Waktu Pesanan Dibuat','Waktu Selesai','Negara','Yang Membatalkan','Alasan Pembatalan','Voucher','Voucher Toko','Diskon Penjual'].map(function(h){ return '<span class="chip" style="background:rgba(255,255,255,.04);color:#dce7f1;border:1px solid rgba(255,255,255,.08)">'+h+'</span>'; }).join('')+
        '</div></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="btns" onclick="_analyticsCloseCustomerModal2()">Tutup</button><button class="btnp" onclick="_analyticsStartImportCustomers2()" style="background:#8C5E16">Pilih File & Import</button></div>';
    }else{
      title = 'Kelola Data & Hapus Massal';
      body = '<div style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:12px"><div><div style="font-size:12px;color:var(--tx2);margin-bottom:10px">Hapus massal bisa dilakukan per item yang dipilih atau langsung per sesi upload.</div><div style="overflow:auto;max-height:420px"><table class="tbl" style="min-width:980px"><thead><tr><th class="c"><input type="checkbox" onchange="_analyticsToggleAllCustomers2(this.checked)"></th><th>Tanggal</th><th>Nama</th><th>Kota/Kab</th><th>Provinsi</th><th>Session</th><th>Orders</th><th>Revenue</th><th class="c">Aksi</th></tr></thead><tbody>'+
        ((_analyticsData.customers||[]).map(function(r,idx){
          return '<tr><td class="c"><input class="ana-customer-check" type="checkbox" value="'+aAttr(r.id)+'"></td><td>'+aFmtDate(r.date)+'</td><td style="font-weight:700">'+aEsc(r.name||'-')+'</td><td>'+aEsc(r.city||'-')+'</td><td>'+aEsc(r.province||'-')+'</td><td>'+aEsc(r.uploadSessionLabel||'Manual')+'</td><td>'+aNum(r.orders)+'</td><td style="color:#F0C56A;font-weight:800">Rp '+fmt(aNum(r.revenue))+'</td><td class="c"><div style="display:flex;gap:6px;justify-content:center"><button class="btnsm" onclick="_analyticsOpenCustomerEdit2('+idx+')" style="background:#1565C0">Edit</button><button class="btnsm" onclick="_analyticsDelete2(\'customers\','+idx+')" style="background:#5f6b7a">Hapus</button></div></td></tr>';
        }).join('') || aEmpty('Belum ada customer data.'))+
        '</tbody></table></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="btns" onclick="_analyticsCloseCustomerModal2()">Tutup</button><button class="btnp" onclick="_analyticsDeleteSelectedCustomers2()" style="background:#8C5E16">Hapus Item Terpilih</button></div></div><div class="card" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);padding:10px"><div style="font-size:12px;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Sesi Upload</div><div style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow:auto">'+
        (sessions.length ? sessions : [{id:'-',label:'Belum ada sesi',from:'',to:'',count:0,orders:0,omzet:0,type:'manual'}]).map(function(s){
          return '<div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)"><div style="font-size:12px;color:#fff;font-weight:800">'+aEsc(s.label)+'</div><div style="font-size:10px;color:#8BA5BC;margin-top:4px">'+(s.from ? aFmtDate(s.from) : '-')+(s.to ? ' - ' + aFmtDate(s.to) : '')+'</div><div style="display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:10px;color:#dce7f1"><span>'+s.count+' item</span><span>'+s.orders+' order</span><span>Rp '+fmt(s.omzet)+'</span></div>'+(s.id !== '-' ? '<button class="btnsm" onclick="_analyticsDeleteCustomerSession2(\''+aAttr(s.id)+'\')" style="margin-top:8px;background:#5f6b7a;width:100%">Hapus Sesi Ini</button>' : '')+'</div>';
        }).join('')+
        '</div></div></div>';
    }
    var html = '<div id="ANA-CUSTOMER-MODAL" onclick="_analyticsCloseCustomerModal2()" style="position:fixed;inset:0;z-index:9999;background:rgba(5,8,14,.74);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px"><div onclick="event.stopPropagation()" style="width:min(1180px,96vw);max-height:90vh;overflow:auto;background:linear-gradient(180deg,#171d25,#0d1218);border:1px solid rgba(255,255,255,.08);border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.45);padding:16px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px"><div><div style="font-size:18px;font-weight:800;color:#fff">'+title+'</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Analytics customer control center</div></div><button class="btns" onclick="_analyticsCloseCustomerModal2()">Tutup</button></div>'+body+'</div></div>';
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);
  }

  function aOpenCustomerEdit(idx){
    aOpenCustomerModal('manual', idx);
  }

  function aToggleListSort(key){
    if(!_analyticsUI.listSorts) _analyticsUI.listSorts = {};
    var cur = _analyticsUI.listSorts[key] || 'desc';
    _analyticsUI.listSorts[key] = cur === 'desc' ? 'asc' : (cur === 'asc' ? 'az' : 'desc');
    _renderAnalytics('customers');
  }

  function aStartImportCustomers(){
    var from = (document.getElementById('ANA-CUS-IMP-FROM') || {}).value || aToday();
    var to = (document.getElementById('ANA-CUS-IMP-TO') || {}).value || from;
    aImportCustomersDirect(from, to);
  }

  window._analyticsSaveSales2 = aSaveSales;
  window._analyticsSaveService2 = aSaveService;
  window._analyticsSavePromo2 = aSavePromo;
  window._analyticsSaveCustomer2 = aSaveCustomer;
  window._analyticsDelete2 = aDelete;
  window._analyticsEdit2 = aSetEdit;
  window._analyticsReset2 = aReset;
  window._analyticsOpenCustomerModal2 = aOpenCustomerModal;
  window._analyticsCloseCustomerModal2 = aCloseCustomerModal;
  window._analyticsOpenCustomerEdit2 = aOpenCustomerEdit;
  window._analyticsToggleListSort2 = aToggleListSort;
  window._analyticsStartImportCustomers2 = aStartImportCustomers;
  window._analyticsImportPurchaseExcel2 = aImportPurchaseExcel;
  window._analyticsImportPurchaseGeo2 = aImportPurchaseGeoJSON;
  window._analyticsDeleteCustomerSession2 = aDeleteCustomerSession;
  window._analyticsDeleteSelectedCustomers2 = aDeleteSelectedCustomers;
  window._analyticsToggleAllCustomers2 = aToggleAllCustomerChecks;
  window._analyticsOpenPanel2 = aPanelModalOpen;
  window._analyticsClosePanel2 = aPanelModalClose;
  window._analyticsImportCustomers2 = function(){ aOpenCustomerModal('import'); };
  window._analyticsToggleStatsTable2 = function(key){
    _analyticsUI[key] = !_analyticsUI[key];
    _renderAnalytics('customers');
  };
  function aProductsTab(){
    if(typeof _toolsProductSummary!=='function') return '<div class="card"><div style="font-size:12px;color:var(--tx2)">Modul rincian produk belum siap.</div></div>';
    var ps=_toolsProductSummary();
    var series=_toolsProductMonthlySeries();
    var ui=_toolsProductUi();
    var changes=_toolsProductModalChanges();
    var cat1Opts=_toolsProductCategoryOptions(1);
    var cat2Opts=_toolsProductCategoryOptions(2);
    var masterCount=_toolsProductMasterRows().length;
    var prod='';
    prod+='<div class="card" style="margin-bottom:12px;background:#080808;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><div style="font-size:14px;font-weight:800;color:#fff">Rincian Produk</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Database SKU produk untuk memantau stok, modal, kategori, dan rata-rata penjualan harian. Template acuan akan menjadi basis baku, sedangkan import regular hanya memperbarui SKU yang sudah ada di template tersebut.</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnsm" onclick="_toolsProductDownloadTemplate()">Template Import</button><button class="btns" onclick="_toolsProductImportMasterFile()">Upload Template Acuan</button><button class="btns" onclick="_toolsProductImportFile()">Import Update</button>'+(ui.edit?'<button class="btnp" onclick="_toolsProductSaveTableEdits()">Simpan Edit</button><button class="btnsm" onclick="_toolsProductToggleEditMode(false)">Batal</button>':'<button class="btnsm" onclick="_toolsProductToggleEditMode(true)">Mode Edit</button>')+'<button class="btnsm" onclick="confirmDelete(\'Hapus seluruh database rincian produk?\',function(){_toolProductRows=[];_toolsSave();_toolsProductRefreshView()})">Hapus Semua</button></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Template acuan: '+masterCount+' SKU</span><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">Baris tampil: '+ps.rows.length+'</span></div></div>';
    prod+='<div style="display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:10px;margin-bottom:12px">';
    [['Total Stok',fmt(ps.totalStock),'Akumulasi stok aktif','#8FD0FF'],['Total Modal',_toolsMoney(ps.totalModal),'Modal x total stok','#F0C56A'],['Rata-rata Penjualan Harian',fmt(Math.round(ps.avgDaily*100)/100),'Rerata estimasi per produk','#A7F3B6'],['Kategori Terlaris',esc(ps.topCategory||'-'),fmt(Math.round(ps.topCategoryDaily*100)/100)+' estimasi / hari','#D7E1EA']].forEach(function(card){
      prod+='<div class="card" style="background:#050505;border:1px solid rgba(255,255,255,.08);padding:12px 14px"><div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62)">'+card[0]+'</div><div style="font-size:24px;font-weight:900;color:'+card[3]+';margin-top:6px;word-break:break-word">'+card[1]+'</div><div style="font-size:11px;color:var(--tx2);margin-top:5px">'+card[2]+'</div></div>';
    });
    prod+='</div>';
    prod+='<div class="card" style="margin-bottom:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Trend Total Modal Stok</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Membandingkan total modal stok berdasarkan bulan import terakhir per SKU.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+(series.length?series.length:0)+' bulan</span></div><div style="height:220px;margin-top:10px"><canvas id="TOOLS-PRODUCT-CHART"></canvas></div></div>';
    prod+='<div class="card" style="margin-bottom:12px;background:#050505;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:13px;font-weight:800;color:#fff">Perubahan Modal Produk</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Riwayat perubahan modal per SKU dari import atau edit manual terbaru.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+changes.length+' perubahan</span></div><div style="margin-top:10px;display:grid;gap:8px">'+(changes.length?changes.slice(0,8).map(function(ch){ return '<div style="display:grid;grid-template-columns:minmax(180px,1.2fr) repeat(3,minmax(110px,.7fr)) minmax(150px,.8fr);gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:#070707;border:1px solid rgba(255,255,255,.06)"><div><div style="font-size:12px;font-weight:800;color:#fff">'+esc(ch.sku||'-')+'</div><div style="font-size:11px;color:var(--tx2);margin-top:2px">'+esc(ch.title||'-')+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Modal Lama</div><div style="font-size:12px;font-weight:700;color:#D7E1EA">'+_toolsMoney(ch.from)+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Modal Baru</div><div style="font-size:12px;font-weight:700;color:#fff">'+_toolsMoney(ch.to)+'</div></div><div><div style="font-size:10px;color:var(--tx2);text-transform:uppercase">Delta</div><div style="font-size:12px;font-weight:800;color:'+(ch.delta>=0?'#A7F3B6':'#FF8A80')+'">'+(ch.delta>=0?'+':'-')+_toolsMoney(Math.abs(ch.delta))+' ('+(ch.pct>=0?'+':'')+fmt(Math.round(ch.pct*100)/100)+'%)</div></div><div style="font-size:11px;color:var(--tx2)">'+esc(_toolsProductFormatDate(ch.updatedAt))+'</div></div>'; }).join(''):'<div style="padding:12px;border:1px dashed rgba(255,255,255,.12);border-radius:12px;color:var(--tx2);font-size:11px">Belum ada perubahan modal yang tercatat. Gunakan import update atau edit manual untuk mencatat histori modal.</div>')+'</div></div>';
    prod+='<div class="card" style="background:#070707;border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:13px;font-weight:800;color:#fff">Daftar Produk Aktif</div><div style="font-size:11px;color:var(--tx2);margin-top:4px">Snapshot terbaru per SKU dari template acuan dan histori pembaruan yang pernah Anda masukkan.</div></div><span class="chip" style="background:#050505;border:1px solid rgba(255,255,255,.08);color:#D7E1EA">'+ps.rows.length+' SKU aktif</span></div><div style="display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px;margin-bottom:10px"><div><label class="lbl">Sort</label><select class="fi" onchange="_toolsProductSetSort(this.value)"><option value="updated_desc"'+(ui.sort==='updated_desc'?' selected':'')+'>Terbaru Diperbarui</option><option value="sku_asc"'+(ui.sort==='sku_asc'?' selected':'')+'>SKU A-Z</option><option value="title_asc"'+(ui.sort==='title_asc'?' selected':'')+'>Nama Produk A-Z</option><option value="stock_desc"'+(ui.sort==='stock_desc'?' selected':'')+'>Stok Tertinggi</option><option value="modal_desc"'+(ui.sort==='modal_desc'?' selected':'')+'>Modal Tertinggi</option><option value="daily_desc"'+(ui.sort==='daily_desc'?' selected':'')+'>Penjualan Harian Tertinggi</option></select></div><div><label class="lbl">Kategori 1</label><select class="fi" onchange="_toolsProductSetCategory(1,this.value)"><option value="all"'+(ui.cat1==='all'?' selected':'')+'>Semua Kategori 1</option><option value="__NONE__"'+(ui.cat1==='__NONE__'?' selected':'')+'>Tanpa Kategori</option>'+cat1Opts.filter(function(v){ return v!=='__NONE__'; }).map(function(v){ return '<option value="'+escAttr(v)+'"'+(ui.cat1===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('')+'</select></div><div><label class="lbl">Kategori 2</label><select class="fi" onchange="_toolsProductSetCategory(2,this.value)"><option value="all"'+(ui.cat2==='all'?' selected':'')+'>Semua Kategori 2</option><option value="__NONE__"'+(ui.cat2==='__NONE__'?' selected':'')+'>Tanpa Kategori</option>'+cat2Opts.filter(function(v){ return v!=='__NONE__'; }).map(function(v){ return '<option value="'+escAttr(v)+'"'+(ui.cat2===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('')+'</select></div><div style="display:flex;align-items:end;justify-content:flex-end"><button class="btnsm" onclick="_toolsProductToggleEditMode('+(ui.edit?'false':'true')+')">'+(ui.edit?'Batalkan Edit':'Edit Tabel')+'</button></div></div><div style="overflow:auto"><table class="tbl"><thead><tr><th>Tautan Gambar</th><th>Nomor SKU</th><th>Judul</th><th>Total Stok</th><th>Perkiraan Penjualan Harian</th><th>Rata-Rata Modal Bobot</th><th>Kategori Pertama</th><th>Kategori Kedua</th><th>Terakhir Diperbarui</th></tr></thead><tbody>';
    if(!ps.rows.length) prod+='<tr><td colspan="9" style="text-align:center;color:var(--tx2)">'+(masterCount?'Belum ada data sesuai filter kategori atau sort yang dipilih.':'Belum ada data produk. Upload template acuan dulu untuk mulai membangun database produk.')+'</td></tr>';
    ps.rows.forEach(function(r){
      prod+='<tr><td>'+(ui.edit?'<input id="TP-EDIT-IMG-'+r.id+'" class="fi" value="'+escAttr(r.imageUrl||'')+'" placeholder="https://...">':(r.imageUrl?'<button class="btnsm" onclick="_toolsProductOpenImage(\''+String(r.imageUrl||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\',\''+String(r.title||r.sku||'Produk').replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">Buka</button>':'-'))+'</td><td style="font-weight:700">'+(ui.edit?'<input id="TP-EDIT-SKU-'+r.id+'" class="fi" value="'+escAttr(r.sku||'')+'" placeholder="SKU">':esc(r.sku||'-'))+'</td><td style="min-width:260px">'+(ui.edit?'<input id="TP-EDIT-TITLE-'+r.id+'" class="fi" value="'+escAttr(r.title||'')+'" placeholder="Nama produk">':esc(r.title||'-'))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-STOCK-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.totalStock)))+'">':fmt(r.totalStock))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-DAILY-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.dailySales)))+'">':fmt(Math.round(_num(r.dailySales)*100)/100))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-COST-'+r.id+'" class="fi" type="number" value="'+escAttr(String(_num(r.avgCost)))+'">':_toolsMoney(r.avgCost))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-CAT1-'+r.id+'" class="fi" value="'+escAttr(r.category1||'')+'" placeholder="Kategori 1">':esc(r.category1||'-'))+'</td><td>'+(ui.edit?'<input id="TP-EDIT-CAT2-'+r.id+'" class="fi" value="'+escAttr(r.category2||'')+'" placeholder="Kategori 2">':esc(r.category2||'-'))+'</td><td style="white-space:nowrap">'+esc(_toolsProductFormatDate(r.updatedAt||r.importedAt))+'</td></tr>';
    });
    prod+='</tbody></table></div></div>';
    return prod;
  }

  window._renderAnalytics = function(sub){
    aEnsureViews();
    sub = sub || window._analyticsSub || 'dash';
    window._analyticsSub = sub;
    var v = document.getElementById('V-analytics');
    if(!v) return;
    var wrapStyle = sub === 'customers' ? 'max-width:none;margin:0;display:flex;flex-direction:column;gap:12px' : 'max-width:1500px;margin:0 auto;display:flex;flex-direction:column;gap:12px';
    var titles = {
      dash:'ANALYTICS // DASHBOARD',
      sales:'ANALYTICS // PENJUALAN',
      service:'ANALYTICS // LAYANAN',
      promo:'ANALYTICS // PROMOSI',
      customers:'ANALYTICS // CUSTOMER DATA',
      products:'ANALYTICS // RINCIAN PRODUK'
    };
    var descs = {
      dash:'Command monitor untuk insight analytics.',
      sales:'Input dan pantau data penjualan.',
      service:'Pantau kualitas layanan dan response.',
      promo:'Monitor performa promosi dan campaign.',
      customers:'Geomap, order intel, repeat buyer, dan quality check.',
      products:'Database SKU, stok, modal, kategori, dan tren perubahan produk.'
    };
    var h = '<div style="'+wrapStyle+'">';
    h += '<div class="card" style="padding:10px 12px;background:linear-gradient(180deg,#101418,#0b0d10);border:1px solid rgba(255,255,255,.07)"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><div style="font-size:16px;font-weight:900;color:#fff;letter-spacing:.14em">'+titles[sub]+'</div><div style="font-size:11px;color:#8fa6bb;margin-top:4px">'+descs[sub]+'</div></div><div style="display:flex;gap:8px;flex-wrap:wrap">';
    [['dash','Dashboard'],['sales','Penjualan'],['service','Layanan'],['promo','Promosi'],['customers','Customer Data'],['products','Rincian Produk']].forEach(function(tab){
      h += '<button class="'+(sub===tab[0]?'btnp':'btns')+'" onclick="_renderAnalytics(\''+tab[0]+'\')" style="padding:8px 12px;'+(sub===tab[0]?'background:#8C5E16;border-color:#8C5E16':'')+'">'+tab[1]+'</button>';
    });
    h += '</div></div></div>';
    if(sub === 'dash') h += aDashboard();
    else if(sub === 'sales') h += aSalesTab();
    else if(sub === 'service') h += aServiceTab();
    else if(sub === 'promo') h += aPromoTab();
    else if(sub === 'customers') h += aCustomerTab();
    else if(sub === 'products') h += aProductsTab();
    h += '</div>';
    v.innerHTML = h;
    if(sub === 'customers'){
      aEnsureMapLibre(function(){ aRenderCustomerProtomap(_analyticsData.customers || [], 'ANA-CUSTOMER-MAP'); });
    }else if(sub === 'dash'){
      aEnsureMapLibre(function(){ aRenderCustomerProtomap(_analyticsData.customers || [], 'ANA-DASH-MAP'); });
    }else if(sub === 'products'){
      aDisposeMap();
      try{ if(typeof _toolsProductRenderChart==='function') _toolsProductRenderChart(); }catch(e){}
    }else{
      aDisposeMap();
    }
  };

  function aSystemTitle(){
    var cfg = getCfg() || {};
    return (cfg.sysTitle || 'SISTEM MANAJEMEN — ANTON JAYA WIJAYA').trim();
  }

  function aConnectionBadge(){
    var online = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
    var bg = online ? 'rgba(27,197,112,.12)' : 'rgba(255,92,92,.12)';
    var bd = online ? 'rgba(27,197,112,.36)' : 'rgba(255,92,92,.32)';
    var tx = online ? '#57f29a' : '#ff7d7d';
    var dot = online ? '#1bc570' : '#ff5c5c';
    return '<span class="tab-live-badge" style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid '+bd+';background:'+bg+';color:'+tx+';font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase"><span style="width:7px;height:7px;border-radius:999px;background:'+dot+';box-shadow:0 0 10px '+dot+'"></span>'+(online?'Live':'Offline')+'</span>';
  }

  var _analyticsBuildTabOrig = buildTabBar;
  buildTabBar = function(){
    var cfg = getCfg();
    var tc = cfg.tabsConfig || {};
    var role = window._ajwRole || 'admin';
    var defs = [
      {id:'dash', lbl:'DASHBOARD'},
      {id:'kpi', lbl:'KPI'},
      {id:'hr', lbl:'HR'},
      {id:'finance', lbl:'FINANCE'},
      {id:'analytics', lbl:'ANALYTICS'},
      {id:'ai', lbl:'AI'},
      {id:'development', lbl:'DEVELOPMENT'},
      {id:'tools', lbl:'TOOLS'},
      {id:'admin', lbl:'ADMIN'}
    ];
    if(role !== 'admin') defs = defs.filter(function(d){ return d.id !== 'admin'; });
    var brandInlineStyle = (typeof window !== 'undefined' && window.innerWidth < 1200)
      ? 'display:flex;align-items:center;gap:10px;min-width:0;max-width:100%;margin:0 auto 8px;justify-content:center'
      : 'position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;min-width:0;max-width:42vw;pointer-events:none';
    var h = '<div class="tab-brand-shell" style="'+brandInlineStyle+'"><span class="tab-brand-title" style="display:block;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.92)">'+esc(aSystemTitle())+'</span>'+aConnectionBadge()+'</div>';
    defs.forEach(function(d){
      if(tc['hide_'+d.id]) return;
      var lbl = tc['label_'+d.id] || d.lbl;
      var act = (_activeTab === d.id);
      h += '<button class="tab '+(act?'act':'on')+'" id="T-'+d.id+'" onclick="_navTo(\''+d.id+'\')">'+esc(lbl)+'</button>';
    });
    customTabs.forEach(function(ct){
      var act = (_activeTab === 'ct_' + ct.id);
      h += '<button class="tab '+(act?'act':'on')+'" onclick="_navTo(\'ct_'+ct.id+'\')">'+esc((ct.icon||'')+' '+ct.name)+'</button>';
    });
    var el = document.getElementById('TABS');
    if(el) el.innerHTML = h;
    var tabsWrap = document.querySelector('.tabs');
    if(tabsWrap){
      tabsWrap.style.display = 'flex';
      tabsWrap.style.alignItems = 'center';
      tabsWrap.style.gap = '8px';
      tabsWrap.style.flexWrap = 'wrap';
      tabsWrap.style.justifyContent = 'center';
      tabsWrap.style.position = 'relative';
    }
  };
  if(!window.__ajwTabBadgeBound){
    window.__ajwTabBadgeBound = true;
    window.addEventListener('online', function(){ try{ buildTabBar(); }catch(_){}; });
    window.addEventListener('offline', function(){ try{ buildTabBar(); }catch(_){}; });
  }

  _navTo = function(tabId){
    if(tabId === 'taligf') tabId = 'tools';
    if(tabId === 'agent' || tabId === 'automation'){
      window._aiSub = tabId;
      tabId = 'ai';
    }
    _activeTab = tabId;
    buildTabBar();
    if(typeof _resetPanelState === 'function') _resetPanelState();
    ['hr','finance','log','development','analytics','ai','tools'].forEach(function(id){
      if(!document.getElementById('V-'+id)){
        var d = document.createElement('div');
        d.id = 'V-'+id;
        d.style.display = 'none';
        var b = document.querySelector('.body');
        if(b) b.appendChild(d);
      }
    });
    var all = ['dash','hr','finance','analytics','ai','development','tools','eval','payroll','stats','emp','hist','admin','supplier','taligf','kpi','laporan','log'].concat(customTabs.map(function(ct){ return 'ct_' + ct.id; }));
    all.forEach(function(id){
      var v = document.getElementById('V-' + id);
      if(v) v.style.display = (id === tabId) ? 'block' : 'none';
    });
    try{
      if(tabId === 'dash') renderDash();
      else if(tabId === 'hr') _renderHR('dash');
      else if(tabId === 'finance') _renderFinance('dash');
      else if(tabId === 'analytics') _renderAnalytics(_analyticsSub || 'dash');
      else if(tabId === 'ai' && typeof _renderAI === 'function') _renderAI(window._aiSub || 'dash');
      else if(tabId === 'development') _renderDevelopment(_devSub || 'resources');
      else if(tabId === 'tools' && typeof _renderTools === 'function') _renderTools(window._toolsSub || 'dash');
      else if(tabId === 'eval') renderEvalForm();
      else if(tabId === 'payroll') renderPayrollForm();
      else if(tabId === 'stats') renderStats();
      else if(tabId === 'emp') renderEmp();
      else if(tabId === 'hist') renderHist();
      else if(tabId === 'log') _renderLog();
      else if(tabId === 'admin') renderAdmin();
      else if(tabId === 'supplier') renderSupplier();
      else if(tabId === 'kpi'){ loadKPI(); renderKPI(); }
      else if(tabId === 'taligf' && typeof _renderTools === 'function') _renderTools('rumus');
      else if(tabId === 'laporan') _renderLaporan();
      else if(tabId.indexOf('ct_') === 0 && typeof renderCustomTab === 'function') renderCustomTab(tabId.replace('ct_',''));
    }catch(e){
      console.error(e);
      toast('Error membuka tab '+String(tabId||'-')+': '+String((e&&e.message)||e||'Unknown error')+'. Kembali ke Dashboard...','error',4200);
      all.forEach(function(id){ var v = document.getElementById('V-'+id); if(v) v.style.display = (id === 'dash') ? 'block' : 'none'; });
      _activeTab = 'dash';
      buildTabBar();
      try{ renderDash(); }catch(_){}
    }
    window.scrollTo(0,0);
  };
  SW = function(tab){ _navTo(tab); };

  if(typeof syncAllToSupabase === 'function'){
    var _analyticsSyncOrig = syncAllToSupabase;
    syncAllToSupabase = function(silent){
      return _analyticsSyncOrig(silent).then(function(res){
        if(!SB.init()) return res;
        return SB.upsertMany('ajw_config', [{key:'analytics_data', value:{data:aAnalyticsGeneralData()}}]).then(function(){
          if(!silent || window._analyticsCustomerDirty) return syncAnalyticsCustomersToSupabase(true).then(function(){ return res; });
          return res;
        }).catch(function(err){
          console.warn('analytics sync', err);
          if(!silent) toast('Analytics lokal tersimpan, tetapi sync cloud analytics gagal.','warn',4500);
          return res;
        });
      });
    };
  }

  if(typeof loadFromSupabase === 'function'){
    var _analyticsLoadOrig = loadFromSupabase;
    loadFromSupabase = function(){
      var out = _analyticsLoadOrig.apply(this, arguments);
      try{
        if(!SB.init()) return out;
        Promise.all([
          SB.getAll('ajw_config','key.asc').catch(function(err){ console.warn('analytics config load', err); return []; }),
          SB.getAll('ajw_customer_data','order_created_at.desc').catch(function(err){ console.warn('analytics customer load', err); return null; })
        ]).then(function(payload){
          var rows = payload[0] || [];
          var customerRows = payload[1];
          var rec = rows.filter(function(r){ return r && r.key === 'analytics_data'; })[0];
          var next = aDefault();
          if(rec && rec.value && rec.value.data){
            next = Object.assign(next, rec.value.data || {});
          }
          if(customerRows && customerRows.length){
            next.customers = customerRows.map(function(r){ return r.data || {}; });
          }else if(rec && rec.value && rec.value.data && Array.isArray(rec.value.data.customers)){
            next.customers = rec.value.data.customers;
          }
          ['sales','service','promo','customers'].forEach(function(key){
            if(!Array.isArray(next[key])) next[key] = [];
          });
          _analyticsData = next;
          window._analyticsCustomerDirty = false;
          sv('ajw_analytics_data', _analyticsData);
          if(_activeTab === 'analytics') _renderAnalytics(_analyticsSub || 'dash');
        }).catch(function(err){ console.warn('analytics load', err); });
      }catch(e){
        console.warn('analytics wrapper load error', e);
      }
      return out;
    };
  }

  aEnsureViews();
})();
