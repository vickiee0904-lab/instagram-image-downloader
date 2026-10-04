(async()=>{
  const settings={...IGD.defaults,...await chrome.storage.local.get(IGD.defaults)};
  for(const key of Object.keys(IGD.defaults)){
    const el=document.getElementById(key);if(el.type==='checkbox')el.checked=settings[key];else el.value=settings[key];
    el.addEventListener('change',async()=>{await chrome.storage.local.set({[key]:el.type==='checkbox'?el.checked:el.value});});
  }
  const update=async()=>{document.getElementById('status').textContent=(await chrome.storage.local.get('lastStatus')).lastStatus||'';};
  await update();chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.lastStatus)update();});
})();
