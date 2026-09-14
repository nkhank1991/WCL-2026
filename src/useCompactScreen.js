import {useEffect,useState} from 'react';

// Layout stays CSS-driven. This only disables automatic/spatial behaviour on touch layouts.
export function useCompactScreen(query='(max-width: 1100px)') {
 const [compact,setCompact]=useState(()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia(query).matches);
 useEffect(()=>{
  if(typeof window.matchMedia!=='function')return;
  const media=window.matchMedia(query),update=()=>setCompact(media.matches);
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[query]);
 return compact;
}
