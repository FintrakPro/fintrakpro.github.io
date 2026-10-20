/* FinTrak Pro - Funds & accounts manager: every user sets up their own funds, goals, accounts, creditors and categories */
(function(){
'use strict';
/* generic starter for NEW users (existing users keep what is saved in their account) */
Object.keys(GOALS).forEach(function(k){delete GOALS[k]});
Object.assign(GOALS,{'EMERGENCY FUND':30000,'SAVINGS FUND':20000,'LIQUID FUND':10000});
DEF.accounts={'CASH':'LIQUID FUND','E-WALLET':'LIQUID FUND','BANK ACCOUNT':'SAVINGS FUND'};
DEF.credits=[];
DEF.cats=['FOOD & GROCERIES','TRANSPORTATION','UTILITIES','BILLS','SHOPPING','HEALTH','EDUCATION','OTHER EXPENSES'];

var MSG='',CF='';
var SUGG=['EMERGENCY FUND','SAVINGS FUND','LIQUID FUND','INVESTMENT FUND','VACATION FUND','EDUCATION FUND','INSURANCE FUND','RETIREMENT FUND','BILLS FUND','WANTS FUND'];
var U=function(s){return String(s==null?'':s).trim().replace(/\s+/g,' ').toUpperCase()};
var fix=function(){var c=S.cfg;c.accounts=c.accounts||{};c.credits=c.credits||[];c.cats=c.cats||[];c.installments=c.installments||[];S.goals=S.goals||{}};
var cnt=function(n){return S.tx.filter(function(x){return x.source===n||x.dest===n}).length};
var names=function(){return Object.keys(S.cfg.accounts).concat(S.cfg.credits,S.cfg.cats)};
var taken=function(n){return names().indexOf(n)>=0};
var fundNames=function(){var g=Object.keys(S.goals),ex=[];Object.keys(S.cfg.accounts).forEach(function(a){var f=S.cfg.accounts[a];if(f&&!(f in S.goals)&&ex.indexOf(f)<0)ex.push(f)});return g.concat(ex)};
var isFund=function(n){return fundNames().indexOf(n)>=0};
var done=function(m){MSG=m||'';CF='';save();render()};
var renameKey=function(o,a,b){var r={};Object.keys(o).forEach(function(k){r[k===a?b:k]=o[k]});return r};
var renameTx=function(a,b){S.tx.forEach(function(x){if(x.source===a)x.source=b;if(x.dest===a)x.dest=b})};
var A=function(s){return esc(s)};

function delBtn(kind,n,pfx){return '<button type="button" class="s" data-fx="'+kind+'" data-fxn="'+A(n)+'" style="color:#b91c1c">'+(CF===pfx+n?'Confirm?':'Remove')+'</button>'}
function bar(p){return '<div style="display:inline-block;vertical-align:middle;width:90px;height:8px;background:var(--bd);border-radius:6px;overflow:hidden"><div style="width:'+p+'%;height:100%;background:'+(p>=100?'#15803d':p>=50?'#b45309':'#b91c1c')+'"></div></div> '+Math.round(p)+'%'}
function nameCell(k,n){return '<input data-fxk="'+k+'" data-fxo="'+A(n)+'" value="'+A(n)+'" style="min-width:160px" aria-label="Name">'}
function simpleTable(k,list,pfx,kind,empty){
 return '<div class="tw"><table class="wide" style="min-width:420px"><tr><th>Name</th><th class="n">Entries</th><th></th></tr>'+
  (list.map(function(n){return '<tr><td>'+nameCell(k,n)+'</td><td class="n">'+cnt(n)+'</td><td>'+delBtn(kind,n,pfx)+'</td></tr>'}).join('')||'<tr><td colspan="3" class="k">'+empty+'</td></tr>')+'</table></div>'}

function creditTable(){var L=S.cfg.credits,I=S.cfg.installments;
 return '<div class="tw"><table class="wide" style="min-width:520px"><tr><th>Name</th><th>Installment loan?</th><th class="n">Entries</th><th></th></tr>'+
  (L.map(function(n){return '<tr><td>'+nameCell('crname',n)+'</td><td><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-fxk="inst" data-fxo="'+A(n)+'"'+(I.indexOf(n)>=0?' checked':'')+'> Show every unpaid installment</label></td><td class="n">'+cnt(n)+'</td><td>'+delBtn('delcr',n,'c')+'</td></tr>'}).join('')||'<tr><td colspan="4" class="k">None yet.</td></tr>')+'</table></div>'}

window.sett=function(){
 fix();
 var b=balances(),accs=Object.keys(S.cfg.accounts),fl=fundNames(),tg=0;
 var inF=function(f){return accs.filter(function(a){return (S.cfg.accounts[a]||'')===f})};
 var sum=function(l){return l.reduce(function(t,a){return t+(b[a]||0)},0)};
 var totBal=sum(accs),un=accs.filter(function(a){return !S.cfg.accounts[a]});
 var rows=fl.map(function(f){var m=inF(f),bal=sum(m),g=+S.goals[f]||0,has=g>0,p=has?Math.max(0,Math.min(100,bal/g*100)):0;if(has)tg+=g;
  return '<tr><td>'+nameCell('fundname',f)+'</td><td class="k">'+(m.length?A(m.join(', ')):'No accounts yet')+'</td><td class="n">'+PHP(bal)+'</td>'+
   '<td class="n"><input type="number" min="1" step="any" data-fxk="fundgoal" data-fxo="'+A(f)+'" value="'+(has?g:'')+'" placeholder="Set goal" style="width:120px;text-align:right" aria-label="Goal"></td>'+
   '<td>'+(has?bar(p):'<span class="k">No goal</span>')+'</td><td>'+delBtn('delfund',f,'f')+'</td></tr>'}).join('');
 if(un.length)rows+='<tr><td><i>Unassigned</i></td><td class="k">'+A(un.join(', '))+'</td><td class="n">'+PHP(sum(un))+'</td><td colspan="3" class="k">Choose a fund for these accounts in the Accounts table below.</td></tr>';
 var sugg=SUGG.filter(function(s){return !isFund(s)}).map(function(s){return '<button type="button" class="s" data-fx="quick" data-fxn="'+A(s)+'">+ '+A(s)+'</button>'}).join(' ');
 var fopts=function(cur){return '<option value="">— No fund —</option>'+fl.map(function(f){return '<option value="'+A(f)+'"'+(f===cur?' selected':'')+'>'+A(f)+'</option>'}).join('')};
 var accRows=accs.map(function(a){return '<tr><td>'+nameCell('accname',a)+'</td><td><select data-fxk="accfund" data-fxo="'+A(a)+'" aria-label="Fund">'+fopts(S.cfg.accounts[a]||'')+'</select></td><td class="n">'+PHP(b[a]||0)+'</td><td class="n">'+cnt(a)+'</td><td>'+delBtn('delacc',a,'a')+'</td></tr>'}).join('');
 return '<div class="c"><h3>My Funds — summary</h3><div class="k" style="margin-bottom:8px">A fund is a pot of money you save toward, such as an Emergency Fund, Savings or a Vacation. Create only the funds you need, set your own goal for each, and choose which of your accounts belong to it. You can rename or remove any of them.</div>'+
  (MSG?'<div class="inf" role="status" style="margin-bottom:8px">'+A(MSG)+'</div>':'')+
  '<div class="tw"><table class="wide" style="min-width:760px"><tr><th>Fund</th><th>Accounts in this fund</th><th class="n">Balance</th><th class="n">Goal (₱)</th><th>Progress</th><th></th></tr>'+rows+
  '<tr><th colspan="2">TOTAL (all accounts)</th><th class="n">'+PHP(totBal)+'</th><th class="n">'+PHP(tg)+'</th><th colspan="2"></th></tr></table></div>'+
  '<form id="fx-fund" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><input name="n" placeholder="New fund name (e.g. Vacation Fund)" required style="flex:1;min-width:210px"><input name="g" type="number" min="1" step="any" placeholder="Goal ₱" style="width:140px"><button class="p" style="width:auto;padding:9px 18px">Add fund</button></form>'+
  (sugg?'<div class="k" style="margin-top:8px">Quick add: '+sugg+'</div>':'')+'</div>'+
 '<div class="c"><h3>My Accounts (cash, banks, e-wallets)</h3><div class="k" style="margin-bottom:8px">Type a new name to rename an account — your past entries update automatically. Pick which fund each account belongs to. An account can be removed only when no entries use it.</div>'+
  '<div class="tw"><table class="wide" style="min-width:640px"><tr><th>Account</th><th>Fund</th><th class="n">Balance</th><th class="n">Entries</th><th></th></tr>'+accRows+'</table></div>'+
  '<form id="fx-acc" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><input name="n" placeholder="New account name (e.g. BDO Savings)" required style="flex:1;min-width:210px"><select name="fund" aria-label="Fund">'+fopts('')+'</select><button class="p" style="width:auto;padding:9px 18px">Add account</button></form></div>'+
 '<div class="c"><h3>My Credit / Loan accounts</h3><div class="k" style="margin-bottom:8px">Cards, loans and pay-later accounts you owe. Leave empty if you have none. Tick <b>Installment loan</b> for loans where each SOA entry is one installment (for example Mega Peso): the SOA then lists every unpaid installment and applies your payments to the oldest one first. Leave it unticked for credit cards, where a new statement replaces the old one.</div>'+
  creditTable()+
  '<form id="fx-cr" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><input name="n" placeholder="New creditor (e.g. BPI Credit Card)" required style="flex:1;min-width:210px"><button class="p" style="width:auto;padding:9px 18px">Add credit / loan</button></form></div>'+
 '<div class="c"><h3>My Expense categories</h3>'+
  simpleTable('catname',S.cfg.cats,'k','delcat','None yet.')+
  '<form id="fx-cat" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><input name="n" placeholder="New category (e.g. Pets)" required style="flex:1;min-width:210px"><button class="p" style="width:auto;padding:9px 18px">Add category</button></form></div>'+
 '<div class="c"><h3>Account</h3>Signed in as <b>'+esc(ACC.name||me)+'</b>'+(AUTH?' ('+esc(AUTH.email)+')':'')+'. Data: '+(store?'saved privately to your account':'saved in this browser only (sign in to sync)')+'.</div>'};

document.addEventListener('change',function(e){
 var x=e.target,k=x.dataset&&x.dataset.fxk;if(!k)return;fix();
 var o=x.dataset.fxo,v=x.value,n;
 if(k==='inst'){var I=S.cfg.installments,i=I.indexOf(o);if(x.checked&&i<0)I.push(o);if(!x.checked&&i>=0)I.splice(i,1);return done(x.checked?o+' now lists every unpaid installment in the SOA.':o+' now shows only its latest SOA entry.')}
 if(k==='accfund'){S.cfg.accounts[o]=v;return done('Fund updated.')}
 if(k==='fundgoal'){var g=+v;if(!v&&!(o in S.goals))return;if(!(g>0))return done('A goal must be more than 0.');S.goals[o]=g;return done('Goal saved.')}
 n=U(v);if(!n||n===o)return done();
 if(k==='fundname'){if(isFund(n))return done('A fund named '+n+' already exists.');
  if(o in S.goals)S.goals=renameKey(S.goals,o,n);
  Object.keys(S.cfg.accounts).forEach(function(a){if(S.cfg.accounts[a]===o)S.cfg.accounts[a]=n});
  return done('Fund renamed to '+n+'.')}
 if(taken(n))return done(n+' already exists in your accounts, credit/loans or categories.');
 if(k==='accname'){S.cfg.accounts=renameKey(S.cfg.accounts,o,n);renameTx(o,n);return done('Account renamed to '+n+'.')}
 if(k==='crname'){S.cfg.credits=S.cfg.credits.map(function(c){return c===o?n:c});S.cfg.installments=S.cfg.installments.map(function(c){return c===o?n:c});renameTx(o,n);return done('Renamed to '+n+'.')}
 if(k==='catname'){S.cfg.cats=S.cfg.cats.map(function(c){return c===o?n:c});renameTx(o,n);return done('Renamed to '+n+'.')}
});

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-fx]');if(!b)return;fix();
 var a=b.dataset.fx,n=b.dataset.fxn;
 if(a==='quick'){if(isFund(n))return done();S.goals[n]=10000;return done(n+' added with a sample goal — set your own goal amount.')}
 var key=({delfund:'f',delacc:'a',delcr:'c',delcat:'k'}[a]||'?')+n;
 if(CF!==key){CF=key;MSG='';return render()}
 if(a==='delfund'){
  if((n in S.goals)&&Object.keys(S.goals).length<=1)return done('Keep at least one fund.');
  delete S.goals[n];Object.keys(S.cfg.accounts).forEach(function(x){if(S.cfg.accounts[x]===n)S.cfg.accounts[x]=''});
  return done('Fund removed. Its accounts are now unassigned — pick a new fund for them.')}
 if(cnt(n))return done('Cannot remove '+n+': '+cnt(n)+' entries use it. Rename it instead, or delete those entries first.');
 if(a==='delacc'){if(Object.keys(S.cfg.accounts).length<=1)return done('Keep at least one account.');delete S.cfg.accounts[n];return done(n+' removed.')}
 if(a==='delcr'){S.cfg.credits=S.cfg.credits.filter(function(c){return c!==n});S.cfg.installments=S.cfg.installments.filter(function(c){return c!==n});return done(n+' removed.')}
 if(a==='delcat'){if(S.cfg.cats.length<=1)return done('Keep at least one category.');S.cfg.cats=S.cfg.cats.filter(function(c){return c!==n});return done(n+' removed.')}
});

document.addEventListener('submit',function(e){
 var f=e.target;if(!f.id||f.id.indexOf('fx-')!==0)return;e.preventDefault();fix();
 var g=function(k){return f.elements[k]?f.elements[k].value:''},n=U(g('n'));if(!n)return;
 if(f.id==='fx-fund'){if(isFund(n))return done('A fund named '+n+' already exists.');
  if(g('g')&&!(+g('g')>0))return done('A goal must be more than 0.');
  S.goals[n]=+g('g')||10000;return done(n+' added'+(g('g')?'.':' with a sample goal — set your own goal amount.'))}
 if(taken(n))return done(n+' already exists in your accounts, credit/loans or categories.');
 if(f.id==='fx-acc')S.cfg.accounts[n]=g('fund');
 else if(f.id==='fx-cr')S.cfg.credits.push(n);
 else if(f.id==='fx-cat')S.cfg.cats.push(n);
 done(n+' added.');
});

/* ---- SOA: installment loans list every unpaid installment; payments are applied oldest-first ---- */
var isPay=function(t,c){return (t.type==='EXPENSES'||t.type==='TRANSFER')&&t.dest===c};
var inst=function(c){return (S.cfg.installments||[]).indexOf(c)>=0};
var key=function(e){return e.due||e.date};
window.soaRows=function(){var last={},rows=[];
 S.tx.forEach(function(x){if(x.type!=='SOA')return;if(inst(x.source))rows.push(x);else if(!last[x.source]||x.date>=last[x.source].date)last[x.source]=x});
 return Object.keys(last).map(function(k){return last[k]}).concat(rows).sort(function(a,b){return (a.due||'')<(b.due||'')?-1:1})};
function alloc(c){var ents=S.tx.filter(function(t){return t.type==='SOA'&&t.source===c}).sort(function(a,b){var x=key(a),y=key(b);return x<y?-1:x>y?1:(a.date<b.date?-1:1)});
 var d0=ents.reduce(function(m,e){return e.date<m?e.date:m},'9999-99-99');
 var pool=S.tx.filter(function(t){return isPay(t,c)&&t.date>=d0}).reduce(function(a,t){return a+ +t.amount},0),m=new Map();
 ents.forEach(function(e,i){var p=i===ents.length-1?pool:Math.min(+e.amount,pool);if(p<0)p=0;m.set(e,p);pool-=p});return m}
window.soaPaid=function(x){if(!inst(x.source))return S.tx.filter(function(t){return isPay(t,x.source)&&t.date>=x.date}).reduce(function(a,t){return a+ +t.amount},0);return alloc(x.source).get(x)||0};
var RE=/S\.tx\.filter\(t=>\(t\.type===(['"])EXPENSES\1\|\|t\.type===\1TRANSFER\1\)&&t\.dest===x\.source&&t\.date>=x\.date\)\.reduce\(\(a,t\)=>a\+ \+t\.amount,0\)/;
['rep2','soaDash','dash3','dash4'].forEach(function(nm){var f=window[nm];if(typeof f!=='function')return;var src=String(f),out=src.replace(RE,'soaPaid(x)');if(out!==src)(0,eval)(out)});
})();
