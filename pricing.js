/* FinTrak Pro - first month price vs renewal price. Loaded after funds.js. */
(function () {
  var RENEW = 99, loaded = false;
  try { if (typeof CFCOL === 'object') CFCOL.renew = 'renewal_price'; } catch (e) {}
  function cur() { if (typeof CFG !== 'undefined' && CFG && CFG.renew != null && !isNaN(+CFG.renew)) RENEW = +CFG.renew; return RENEW; }
  function load() {
    if (loaded || typeof sb === 'undefined' || !sb) return;
    loaded = true;
    sb.from('app_config').select('renewal_price').eq('id', 1).maybeSingle().then(function (r) {
      if (r && r.data && r.data.renewal_price != null) {
        var v = +r.data.renewal_price;
        if (v !== RENEW) { RENEW = v; try { render(); } catch (e) {} }
      } else loaded = false;
    }).catch(function () { loaded = false; });
  }
  var subOrig = window.subHtml;
  window.subHtml = function () {
    load(); var rn = cur();
    var first = !(typeof MYPAYS !== 'undefined' && MYPAYS.some(function (p) { return p.kind === 'paid'; }));
    var o = CFG.monthly;
    if (!first && !IS_ADMIN) CFG.monthly = rn;
    var h;
    try { h = subOrig(); } finally { CFG.monthly = o; }
    return h.replace('<div class="k">Pay month by month.</div>', first
      ? '<div class="k">First month. Renews at ' + PHP(rn) + ' per month after that.</div>'
      : '<div class="k">Renewal price. Thank you for staying with us!</div>');
  };
  var admOrig = window.adminHtml;
  window.adminHtml = function () {
    load(); var rn = cur();
    var h = admOrig();
    try {
      (ADM || []).filter(function (r) { return r.requested_plan === 'Monthly'; }).forEach(function (r) {
        var paid = (PAYS || []).some(function (p) { return p.user_id === r.id && p.kind === 'paid'; });
        var a = '<small class="k">' + esc(r.email) + '</small></td><td>Monthly<br><small class="k">';
        var i = h.indexOf(a);
        if (i >= 0) { var s = i + a.length, t = h.indexOf('</small>', s); h = h.slice(0, s) + PHP(paid ? rn : CFG.monthly) + (paid ? ' (renewal)' : ' (first month)') + h.slice(t); }
      });
      var lab = '<label class="fl">Free trial on approval (days)';
      h = h.replace(lab, '<label class="fl">Renewal price per month (₱)<input type="number" data-cfg="renew" value="' + rn + '"></label>' + lab);
    } catch (e) {}
    return h;
  };
})();
