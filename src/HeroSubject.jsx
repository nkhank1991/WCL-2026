import {useId} from 'react';
import {deliveryImage} from './media.js';

// A live SVG image presentation, not a generated/repainted replacement photo.
export function HeroSubject({item,silhouette}){
 const id='hero-subject-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 return <svg className="hero-subject-art" viewBox={silhouette.viewBox} preserveAspectRatio={item.id==='trophy'?'xMidYMid meet':'xMidYMax meet'} role="img" aria-label={item.alt} focusable="false">
  <defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={silhouette.width} height={silhouette.height}>{silhouette.paths.map((d,index)=><path key={index} d={d} fill="white" fillRule="evenodd" stroke={silhouette.group?'black':'none'} strokeWidth={silhouette.group?3:0}/>)}</mask></defs>
  <image href={deliveryImage(item.image)} width={silhouette.width} height={silhouette.height} mask={`url(#${id})`} preserveAspectRatio="xMidYMid meet"/>
 </svg>;
}
