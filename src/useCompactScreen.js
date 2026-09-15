import {useEffect,useState} from 'react';

// Layout stays CSS-driven. Components use this to simplify spatial effects and controls.
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
