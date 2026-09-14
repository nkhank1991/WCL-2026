import {useId,useState} from 'react';
import {CaretDown} from '@phosphor-icons/react';

// One set of links: expanded on desktop and without JavaScript, opt-in on mobile.
export function MobileFooterGroup({title,children}) {
 const [expanded,setExpanded]=useState(false),id=useId();
 return <div className="mobile-footer-group" data-expanded={expanded}>
  <h3 className="footer-desktop-heading">{title}</h3>
  <button className="mobile-footer-toggle" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{title}<CaretDown aria-hidden="true"/></button>
  <div className="mobile-footer-links" id={id}>{children}</div>
 </div>;
}
