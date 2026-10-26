// 핵심 규칙 그림: 코어(가운데)에서 나간 신호가 이어진 세포를 따라 가까운 것부터 차례로 닿고, 닿은 세포가 그 순간 공격한다.
// 움직임 줄이기 설정이면 멈춘 한 장면만 그린다. 화면 밖에 있으면 그리지 않는다.
(function () {
  var cv = document.getElementById('pulse');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 세포 나무: 코어 → 자식 → 손자
  var nodes = [
    { x: 0.5, y: 0.5, p: -1, c: '#5cf2d6', r: 15 },
    { x: 0.36, y: 0.33, p: 0, c: '#e8eefc' }, { x: 0.64, y: 0.33, p: 0, c: '#8fd0ff' }, { x: 0.5, y: 0.78, p: 0, c: '#a7f06b' },
    { x: 0.22, y: 0.2, p: 1, c: '#ffd25c' }, { x: 0.26, y: 0.5, p: 1, c: '#ff9a62' },
    { x: 0.78, y: 0.2, p: 2, c: '#c59bff' }, { x: 0.8, y: 0.5, p: 2, c: '#8fd0ff' },
    { x: 0.36, y: 0.86, p: 3, c: '#ff8caa' }, { x: 0.64, y: 0.86, p: 3, c: '#e8eefc' }
  ];
  function depth(i) { var d = 0; while (nodes[i].p >= 0) { i = nodes[i].p; d++; } return d; }
  nodes.forEach(function (n, i) { n.d = depth(i); });
  var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function px(n) { var s = Math.min(W, H * 1.9); return { x: W / 2 + (n.x - 0.5) * s, y: H / 2 + (n.y - 0.5) * H * 0.92 }; }
  var period = 2.2, hop = 0.32, visible = true, running = false;
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var phase = reduce ? 0.55 : (t / 1000) % period;
    nodes.forEach(function (n) {
      if (n.p < 0) return;
      var a = px(n), b = px(nodes[n.p]);
      ctx.strokeStyle = 'rgba(164,179,207,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    // 신호 점: 부모 → 자식
    nodes.forEach(function (n) {
      if (n.p < 0) return;
      var start = (n.d - 1) * hop, k = (phase - start) / hop;
      if (k < 0 || k > 1) return;
      var a = px(nodes[n.p]), b = px(n);
      ctx.fillStyle = '#5cf2d6'; ctx.shadowColor = '#5cf2d6'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    nodes.forEach(function (n) {
      var p = px(n), r = n.r || 10;
      var hit = phase - n.d * hop, glow = hit >= 0 && hit < 0.35 ? 1 - hit / 0.35 : 0;
      if (n.p < 0) glow = phase < 0.3 ? 1 - phase / 0.3 : 0;
      if (glow > 0) { ctx.fillStyle = 'rgba(92,242,214,' + (0.35 * glow) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, r + 10 * glow + 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#0b1424'; ctx.strokeStyle = n.c; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 닿은 세포가 바깥쪽으로 쏘는 선
      if (glow > 0.6 && n.p >= 0) { ctx.strokeStyle = 'rgba(255,140,170,' + glow + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (p.x - W / 2) * 0.35, p.y + (p.y - H / 2) * 0.35); ctx.stroke(); }
    });
    if (!reduce && visible) requestAnimationFrame(draw); else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(draw); } }
  size();
  window.addEventListener('resize', function () { size(); if (reduce) start(); });
  if ('IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(cv);
  }
  start();
})();
