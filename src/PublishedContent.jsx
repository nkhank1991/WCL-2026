import {useEffect,useState} from 'react';
// Static files are a preview fallback only. A connected DB returning [] stays empty.
export function usePublished(collection,fallback){
 const [items,setItems]=useState(fallback);
 useEffect(()=>{let alive=true;const controller=new AbortController();
  const refresh=()=>fetch('/api/public/content/'+collection,{signal:controller.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Offline');return r.json()}).then(data=>{if(alive&&Array.isArray(data.items))setItems(data.items.sort((a,b)=>(a.order||0)-(b.order||0)))}).catch(()=>{});
  refresh();window.addEventListener('focus',refresh);const interval=setInterval(refresh,60000);
  return()=>{alive=false;controller.abort();clearInterval(interval);window.removeEventListener('focus',refresh)};
 },[collection]);return items;
}
