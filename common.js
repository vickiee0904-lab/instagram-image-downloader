'use strict';
globalThis.IGD = (() => {
  const defaults = {hover:true, highRes:true, naming:'organized', saveAs:false};
  const allowed = value => {try {const u=new URL(value); return u.protocol==='https:' && /(^|\.)(cdninstagram\.com|fbcdn\.net|instagram\.com)$/.test(u.hostname);} catch {return false;}};
  function candidates(img, highRes=true) {
    const list=[];
    if(highRes) for(const item of (img.getAttribute('srcset')||'').split(',')) {
      const m=item.trim().match(/^(\S+)\s+(\d+(?:\.\d+)?)(w|x)$/);
      if(m) list.push({url:m[1],score:Number(m[2])*(m[3]==='x' ? (img.clientWidth||1):1)});
    }
    list.sort((a,b)=>b.score-a.score);
    list.push({url:img.currentSrc,score:0},{url:img.src,score:0});
    return [...new Set(list.map(x=>x.url).filter(allowed))];
  }
  const clean = s => String(s||'').replace(/[\x00-\x1f<>:"/\\|?*]/g,'_').replace(/\.\./g,'_').replace(/^[. ]+|[. ]+$/g,'').slice(0,100)||'instagram';
  function filename(url, meta, settings) {
    const u=new URL(url), base=u.pathname.split('/').pop()||'image.jpg';
    const ext=(base.match(/\.(jpg|jpeg|png|webp|avif)$/i)||[])[1]||'jpg';
    if(settings.naming==='original') return 'Instagram/'+clean(base);
    const now=new Date(), stamp=now.toISOString().replace(/[-:]/g,'').replace('T','_').slice(0,15);
    return 'Instagram/'+clean(meta.user||'instagram')+'_'+stamp+'_'+clean(meta.post||'image')+'_'+clean(meta.index||'1')+'.'+ext.toLowerCase();
  }
  return {defaults,allowed,candidates,clean,filename};
})();
