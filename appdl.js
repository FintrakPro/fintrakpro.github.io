/* FinTrak Pro - "Get the Android app" card for signed-in users on the website.
   Hidden inside the phone app itself. */
(function(){
'use strict';
if(window.FT_NATIVE)return;
var APK='app/Fintrak-Pro-App.apk', NAME='Fintrak Pro App.apk', HIDE='ft_appdl_hidden';
var ua=navigator.userAgent||'', IOS=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&'ontouchend' in document), ANDROID=/Android/i.test(ua);
function hidden(){try{return localStorage.getItem(HIDE)==='1'}catch(e){return false}}
function card(where){
  var c=document.createElement('div');c.className='c';c.id='ft-appdl';
  var body;
  if(IOS){
    body='<h3>📱 Use FinTrak Pro like an app on iPhone</h3><div class="k">In Safari, tap the <b>Share</b> button, then <b>Add to Home Screen</b>. The Android app is not available for iPhone yet.</div>';
  }else{
    body='<h3>📱 Get the Fintrak Pro Android app</h3><div class="k">Faster to open, with fingerprint lock and offline notice. Sign in with this same account — your records stay in sync.</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a class="p" href="'+APK+'" download="'+NAME+'" style="display:inline-block;width:auto;padding:9px 16px;text-decoration:none;text-align:center;border-radius:8px;background:var(--ac);color:#fff;font-weight:600">⬇ Download Android app</a></div>'+
      '<div class="k" style="margin-top:8px">'+(ANDROID?'After downloading, tap the file and allow installing from this source. If Play Protect warns you, tap <b>More details → Install anyway</b> (the app is not in the Play Store yet).':'Open this page on your Android phone to download, or send the file to your phone.')+'</div>';
  }
  c.innerHTML=body+(where==='dash'?'<button class="s" id="ft-appdl-x" style="color:var(--mu);margin-top:6px;padding:0">Hide this</button>':'');
  return c;
}
function place(){
  if(typeof locked==='undefined'||locked||typeof tab==='undefined')return;
  if(document.getElementById('ft-appdl'))return;
  var m=document.getElementById('m');if(!m)return;
  if(tab==='Account'){m.appendChild(card('acct'));}
  else if(tab==='Dashboard'&&!hidden()){m.insertBefore(card('dash'),m.firstChild);}
  var x=document.getElementById('ft-appdl-x');
  if(x)x.addEventListener('click',function(){try{localStorage.setItem(HIDE,'1')}catch(e){}var c=document.getElementById('ft-appdl');if(c)c.remove()});
}
function start(){var m=document.getElementById('m');if(!m)return;new MutationObserver(place).observe(m,{childList:true});place()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
