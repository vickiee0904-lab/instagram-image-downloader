'use strict';
importScripts('common.js');
chrome.runtime.onInstalled.addListener(()=> {
  chrome.contextMenus.removeAll(()=>chrome.contextMenus.create({id:'igd-image',title:'下载这张 Instagram 图片',contexts:['image'],documentUrlPatterns:['https://www.instagram.com/*','https://instagram.com/*']}));
});
async function startDownload(urls,meta,sender) {
  const settings={...IGD.defaults,...await chrome.storage.local.get(IGD.defaults)};
  const urlsSafe=[...new Set((urls||[]).filter(IGD.allowed))].slice(0,6);
  if(!urlsSafe.length) throw new Error('未找到可下载的图片地址，请等待图片加载完成后重试。');
  // Preserve the exact signed CDN URL; modifying query parameters can invalidate it.
  const id=await chrome.downloads.download({url:urlsSafe[0],filename:IGD.filename(urlsSafe[0],meta||{},settings),conflictAction:'uniquify',saveAs:settings.saveAs});
  await chrome.storage.session.set({['download_'+id]:{tabId:sender?.tab?.id,urls:urlsSafe,meta:meta||{},settings}});
  await chrome.storage.local.set({lastStatus:'下载已开始，可在 Chrome 下载列表查看进度。'});
  return {ok:true,id};
}
chrome.runtime.onMessage.addListener((message,sender,reply)=> {
  if(message.type!=='IGD_DOWNLOAD') return;
  if(!sender.tab?.url || !/^https:\/\/(www\.)?instagram\.com\//.test(sender.tab.url)) {reply({ok:false,error:'只能从 Instagram 页面下载。'});return;}
  startDownload(message.urls,message.meta,sender).then(reply).catch(e=>reply({ok:false,error:e.message}));
  return true;
});
chrome.contextMenus.onClicked.addListener((info,tab)=> {
  if(info.menuItemId!=='igd-image')return;
  startDownload([info.srcUrl],{}, {tab}).catch(e=>chrome.storage.local.set({lastStatus:'下载失败：'+e.message}));
});
chrome.downloads.onChanged.addListener(async delta=> {
  if(!delta.state || !['complete','interrupted'].includes(delta.state.current))return;
  const key='download_'+delta.id, data=(await chrome.storage.session.get(key))[key];
  if(!data)return;
  await chrome.storage.session.remove(key);
  if(delta.state.current==='interrupted' && data.urls.length>1 && delta.error?.current!=='USER_CANCELED') {
    try {
      const next=data.urls.slice(1);
      const id=await chrome.downloads.download({url:next[0],filename:IGD.filename(next[0],data.meta,data.settings),conflictAction:'uniquify',saveAs:data.settings.saveAs});
      await chrome.storage.session.set({['download_'+id]:{...data,urls:next}});
      return;
    } catch {} 
  }
  const message=delta.state.current==='complete'?'图片已保存到下载目录。':'下载未完成：'+(delta.error?.current||'请查看 Chrome 下载列表')+'。可刷新帖子后重试。';
  await chrome.storage.local.set({lastStatus:message});
  if(data.tabId) chrome.tabs.sendMessage(data.tabId,{type:'IGD_STATUS',message}).catch(()=>{});
});
