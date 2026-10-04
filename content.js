(() => {
  'use strict';
  let settings={...IGD.defaults}, current=null, busy=false, lastPoint=null;
  const host=document.createElement('div');
  host.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
  const root=host.attachShadow({mode:'closed'});
  root.innerHTML=`<style>
    button{position:fixed;display:none;pointer-events:auto;border:1px solid #ffffff70;border-radius:10px;background:#171923eb;color:white;padding:10px 14px;font:600 13px system-ui;box-shadow:0 3px 18px #0005;cursor:pointer}
    button:hover{background:#6544e8}button:focus-visible{outline:3px solid #a88cff}
    .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);max-width:460px;background:#171923f5;color:#fff;border-radius:12px;padding:12px 18px;font:14px/1.5 system-ui;display:none;box-shadow:0 3px 18px #0005}
  </style><button type="button" aria-label="下载当前 Instagram 图片">↓ 下载图片</button><div class="toast" role="status" aria-live="polite"></div>`;
  document.documentElement.append(host);
  const button=root.querySelector('button'),toast=root.querySelector('.toast');let timer;
  function notify(message){toast.textContent=message;toast.style.display='block';clearTimeout(timer);timer=setTimeout(()=>toast.style.display='none',5000);}
  function valid(img){if(!(img instanceof HTMLImageElement)||!img.complete||img.naturalWidth<160||img.naturalHeight<120)return false;const r=img.getBoundingClientRect();return r.width>=120&&r.height>=100&&IGD.candidates(img,false).length>0;}
  function position(){if(!current?.isConnected||!settings.hover){hide();return;} const r=current.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight){hide();return;}button.style.left=Math.max(4,Math.min(innerWidth-150,r.right-140))+'px';button.style.top=Math.max(4,r.top+10)+'px';button.style.display='block';}
  function hide(){if(!busy){current=null;button.style.display='none';}}
  function locate(x,y){
    const elements=document.elementsFromPoint(x,y).filter(e=>e!==host);
    for(const e of elements){if(valid(e))return e;}
    // Instagram sometimes puts clickable overlays above the image.
    for(const e of elements.slice(0,6)){
      if(e===document.body||e===document.documentElement)continue;
      const er=e.getBoundingClientRect();if(er.width>innerWidth*.98&&er.height>innerHeight*.9)continue;
      for(const img of e.querySelectorAll('img')){if(!valid(img))continue;const r=img.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return img;}
    }
    return null;
  }
  document.addEventListener('pointermove',e=>{
    if(busy||!settings.hover)return;
    if(e.composedPath().includes(host))return;
    lastPoint={x:e.clientX,y:e.clientY};current=locate(e.clientX,e.clientY);if(current)position();else hide();
  },{passive:true});
  document.addEventListener('pointerleave',hide);
  addEventListener('scroll',()=>{if(!busy)hide();},{passive:true,capture:true});
  addEventListener('resize',()=>hide(),{passive:true});
  function metadata(img){
    const scope=img.closest('article')||img.closest('[role="dialog"]');
    const postLink=scope?.querySelector('a[href*="/p/"],a[href*="/reel/"]');
    const post=(postLink?.getAttribute('href')||location.pathname).match(/\/(?:p|reel)\/([^/]+)/)?.[1];
    const reserved=new Set(['p','reel','reels','explore','direct','accounts','stories']);let user='';
    for(const a of scope?.querySelectorAll('a[href]')||[]){const match=a.getAttribute('href').match(/^\/([a-zA-Z0-9._]+)\/?$/);if(match&&!reserved.has(match[1])){user=match[1];break;}}
    const list=scope?[...scope.querySelectorAll('img')].filter(valid):[img];
    return {user,post,index:Math.max(1,list.indexOf(img)+1)};
  }
  button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();});
  button.addEventListener('click',async e=>{
    e.preventDefault();e.stopPropagation();if(!current||busy)return;
    const img=current, urls=IGD.candidates(img,settings.highRes);busy=true;button.textContent='准备下载…';
    try{const result=await chrome.runtime.sendMessage({type:'IGD_DOWNLOAD',urls,meta:metadata(img)});notify(result?.ok?'下载已开始，请在 Chrome 下载列表查看进度。':(result?.error||'下载失败，请刷新页面重试。'));}
    catch{notify('插件已更新或连接中断，请刷新 Instagram 页面后重试。');}
    finally{busy=false;button.textContent='↓ 下载图片';hide();}
  });
  chrome.storage.local.get(IGD.defaults).then(value=>{settings={...IGD.defaults,...value};});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;for(const key of Object.keys(IGD.defaults))if(changes[key])settings[key]=changes[key].newValue??IGD.defaults[key];if(!settings.hover)hide();});
  chrome.runtime.onMessage.addListener(m=>{if(m.type==='IGD_STATUS')notify(m.message);});
})();
