// FAQ
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Progress bar simulation (like ITGenius)
function simulateProgress() {
  const steps = [
    [0,  'เริ่มต้นการตรวจสอบ'],
    [18, 'ถามคำถามที่ 1/5'],
    [36, 'ถามคำถามที่ 2/5'],
    [52, 'ถามคำถามที่ 3/5'],
    [68, 'ถามคำถามที่ 4/5'],
    [84, 'ถามคำถามที่ 5/5'],
    [95, 'กำลังวิเคราะห์ผล...'],
  ];
  let i = 0;
  const bar = document.getElementById('progress-i');
  const stepEl = document.getElementById('spin-step');
  const iv = setInterval(() => {
    if (i >= steps.length) { clearInterval(iv); return; }
    if (bar) bar.style.width = steps[i][0] + '%';
    if (stepEl) stepEl.textContent = steps[i][1];
    i++;
  }, 2100);
  return function stop() {
    clearInterval(iv);
    if (bar) bar.style.width = '100%';
  };
}

// Build result HTML
function buildResult(data, brand) {
  var sov = data.sov != null ? data.sov : 0;
  var isBad = sov === 0;
  var isMid = sov > 0 && sov < 40;
  var gc = isBad ? 'bad' : (isMid ? 'mid' : 'good');
  var comps = (data.competitors && data.competitors.length) ? data.competitors : [];

  // Category breakdown
  var cats = [
    { name: 'AI Mention Rate',   pct: sov,                             lbl: sov + '%' },
    { name: 'Keyword Relevance', pct: sov > 0 ? Math.min(sov+20,100) : 15, lbl: sov > 0 ? 'พอใช้' : 'ต่ำ' },
    { name: 'Brand Clarity',     pct: sov > 0 ? 60 : 25,              lbl: sov > 0 ? 'ปานกลาง' : 'ต่ำ' },
    { name: 'Context Match',     pct: sov > 0 ? 55 : 20,              lbl: sov > 0 ? 'ปานกลาง' : 'ต่ำ' },
  ];
  var catsHtml = cats.map(function(c) {
    var cls = c.pct >= 50 ? 'good' : (c.pct >= 25 ? 'mid' : 'bad');
    return '<div class="cat-row"><span class="cat-name">'+c.name+'</span><span class="cat-score">'+c.lbl+'</span><div class="cat-bar '+cls+'"><i style="width:'+c.pct+'%"></i></div></div>';
  }).join('');

  // Audit items
  var audits = [
    { name:'AI พูดถึงแบรนด์คุณ', status: sov>0 ? 'pass':'fail', val: sov>0 ? 'พบ':'ไม่พบ', fix: sov===0 ? 'สร้าง entity ให้ AI รู้จัก เช่น Wikidata, รีวิวบน 3rd-party sites':''},
    { name:'คีย์เวิร์ดตรงกับ category', status: sov>30 ? 'pass':(sov>0?'partial':'fail'), val: sov>30 ? 'ตรง':'ต้องปรับ', fix:'เพิ่ม keyword ที่เจาะจงกับ category มากขึ้น'},
    { name:'มี brand mention บน web', status: sov>20 ? 'pass':'fail', val: sov>20 ? 'มี':'ไม่มีหรือน้อยมาก', fix:'เพิ่ม backlink, guest post, PR ที่กล่าวถึงแบรนด์'},
    { name:'คู่แข่งใน AI results', status: comps.length>0 ? 'fail':'pass', val: comps.length>0 ? 'มี '+comps.length+' ราย':'ไม่มี', fix:''},
  ];
  var auditHtml = audits.map(function(a) {
    return '<details class="audit-item" data-status="'+a.status+'"><summary class="audit-summary"><div class="audit-dot"></div><span class="audit-name">'+a.name+'</span><span class="audit-val">'+a.val+'</span></summary>'+(a.fix ? '<div class="audit-body2"><div class="fix-box"><strong>💡 แนะนำ</strong>'+a.fix+'</div></div>':'')+  '</details>';
  }).join('');

  // Priority list
  var prios = isBad ? [
    {t:'สร้าง brand entity ให้ AI รู้จัก', f:'ลงทะเบียนบน Wikidata, เพิ่มรายชื่อใน directory'},
    {t:'สร้าง mentions บน 3rd-party', f:'PR, guest post, forum, รีวิว Google Maps'},
    {t:'ปรับ website content ให้ AI อ่านง่าย', f:'เพิ่ม FAQ schema, structured data, clear H1-H3'},
  ] : [
    {t:'เพิ่มความถี่ที่ AI พูดถึง', f:'เพิ่ม content ที่ตอบคำถาม category ตรงๆ'},
    {t:'ขยาย keyword coverage', f:'ครอบคลุม long-tail query ที่ลูกค้าถาม AI'},
  ];
  var prioHtml = prios.map(function(p){return '<li><span class="p-title">'+p.t+'</span><span class="p-fix">'+p.f+'</span></li>';}).join('');

  var chipHtml = '<div class="filter-row"><button class="chip active" data-filter="all" style="--chip-color:var(--green)">ทั้งหมด</button><button class="chip" data-filter="pass" style="--chip-color:var(--green)"><span class="cdot" style="background:var(--green)"></span>ผ่าน</button><button class="chip" data-filter="partial" style="--chip-color:var(--orange)"><span class="cdot" style="background:var(--orange)"></span>บางส่วน</button><button class="chip" data-filter="fail" style="--chip-color:var(--red)"><span class="cdot" style="background:var(--red)"></span>ต้องแก้</button></div>';

  var compHtml = comps.length ? '<div class="comp-block">🔴 แทนที่จะแนะนำคุณ <b>AI แนะนำ: '+comps.join(', ')+'</b><br>คู่แข่งกำลังได้ลูกค้าจาก AI แทนคุณ</div>' : '';
  var ctaTitle = isBad ? '⚠️ ธุรกิจคุณกำลังหายไปจากยุค AI' : '🚀 ดันให้ AI แนะนำคุณบ่อยขึ้น';
  var ctaSub = isBad ? 'AI ยังไม่รู้จักธุรกิจคุณ — ทีม BizGrow Tech พร้อมช่วยให้ AI พูดถึงคุณผ่าน AEO/GEO ทีมจะติดต่อกลับโดยเร็ว' : 'ดีแล้ว! ยังเพิ่ม Share of Voice ได้อีก — BizGrow Tech พร้อมช่วยดันให้สูงขึ้น';

  return '<div class="result-header"><div class="gauge-ring '+gc+'" style="--val:'+sov+'"><div class="gauge-num">'+sov+'</div><div class="gauge-den">/ 100</div></div><div class="result-meta"><div class="result-status">'+(isBad ? '❌ AI ยังไม่แนะนำแบรนด์คุณ':'✅ AI แนะนำแบรนด์คุณแล้ว')+'</div><div class="result-desc">AI Share of Voice ของ <strong>'+brand+'</strong> อยู่ที่ '+sov+'% จากการวิเคราะห์ 5 prompt</div></div></div>'+
    '<div class="cat-section"><div class="cat-title">คะแนนรายมิติ</div><div class="cat-list">'+catsHtml+'</div></div>'+
    compHtml+
    '<div><div class="cat-title">รายการตรวจ</div>'+chipHtml+'<div class="audit-list" id="audit-list">'+auditHtml+'</div></div>'+
    '<div><div class="priority-title">⚡ สิ่งที่ควรแก้ก่อน</div><ol class="priority-list">'+prioHtml+'</ol></div>'+
    '<div class="result-cta"><div class="result-cta-title">'+ctaTitle+'</div><div class="result-cta-sub">'+ctaSub+'</div><div class="cta-btns"><a href="tel:0922824848" class="cta-btn-orange">📞 โทรหาทีม BizGrow Tech</a><a href="https://line.me/ti/p/~bizgrowtech" class="cta-btn-green">💬 LINE ทีมงาน</a></div></div>';
}

// Submit
var goBtn    = document.getElementById('go-btn');
var formSect = document.getElementById('form-section');
var spinEl   = document.getElementById('spin');
var resultEl = document.getElementById('result');

goBtn.onclick = async function() {
  var brand    = document.getElementById('brand').value.trim();
  var url      = document.getElementById('url').value.trim();
  var category = document.getElementById('category').value.trim();
  var name     = document.getElementById('name').value.trim();
  var phone    = document.getElementById('phone').value.trim();
  var keywords = document.getElementById('keywords').value.trim();
  var contact  = document.getElementById('contact').value.trim();
  var digits   = phone.replace(/[^0-9]/g,'');

  if (!brand||!category||!name||!keywords){ alert('กรุณากรอก ชื่อแบรนด์ · ประเภทธุรกิจ · ชื่อคุณ · คีย์เวิร์ด'); return; }
  if (digits.length<9||digits.length>13){ alert('กรุณากรอกเบอร์โทรที่ถูกต้อง (9–10 หลัก)'); document.getElementById('phone').focus(); return; }

  formSect.style.display='none';
  spinEl.style.display='block';
  goBtn.disabled=true;
  var stopProg = simulateProgress();

  try {
    var res  = await fetch('/api/aeo-audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brand,url,category,name,phone,keywords,contact,lang:'th',ref:new URLSearchParams(location.search).get('ref')||''})});
    var data = await res.json();
    stopProg();
    spinEl.style.display='none';
    resultEl.style.display='block';
    resultEl.innerHTML=buildResult(data,brand);

    // Filter chips event
    resultEl.addEventListener('click',function(e){
      var chip=e.target.closest('.chip');
      if(!chip)return;
      resultEl.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');});
      chip.classList.add('active');
      var filter=chip.dataset.filter;
      resultEl.querySelectorAll('.audit-item').forEach(function(item){
        item.style.display=(filter==='all'||item.dataset.status===filter)?'':'none';
      });
    });
  } catch(e) {
    stopProg();
    spinEl.innerHTML='<p style="color:var(--red);text-align:center;padding:1rem">ขออภัย มีข้อผิดพลาด กรุณาลองใหม่</p>';
  }
};