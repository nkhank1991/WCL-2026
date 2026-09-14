import {motion} from 'motion/react';
import {SignatureSweep,useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {deliveryImage,responsiveCampaign} from './media.js';

// Native vector clipping preserves the original portrait pixels and jerseys.
// These outlines are specific to the two approved source photos, not generic face masks.
export function RivalryStage(){
 const {spatial}=useBroadcastMotion();
 return <div className="rivalry-stage" aria-label="Yuvraj Singh and Shahid Afridi, WCL Season 3"><SignatureSweep/>
  <svg className="portrait-clips" aria-hidden="true"><defs>
   <clipPath id="yuvraj-silhouette" clipPathUnits="objectBoundingBox"><path transform="scale(.0009478673 .0006706908)" d="M 270 1491 L 288 1190 Q 300 1100 322 1040 L 326 1005 Q 307 993 309 974 L 319 884 Q 260 891 248 867 Q 229 834 228 757 L 234 703 L 247 654 L 255 599 Q 271 523 301 491 L 318 481 L 357 464 L 400 446 L 436 425 Q 451 394 461 394 L 463 366 L 454 332 Q 441 333 438 309 Q 431 277 435 261 Q 442 258 452 273 L 448 244 Q 446 211 452 190 L 461 181 L 460 171 L 473 157 L 489 144 L 507 138 L 523 127 L 543 124 L 559 125 L 577 137 L 590 146 L 606 165 Q 621 185 624 216 L 620 264 Q 637 255 639 263 Q 640 282 628 311 L 625 329 L 619 333 L 609 391 Q 619 392 624 409 L 638 424 L 692 449 L 721 466 L 754 486 Q 782 519 790 560 L 797 612 L 802 662 L 799 715 L 801 749 L 791 762 Q 782 840 753 894 Q 748 912 718 907 L 716 944 L 731 976 Q 731 991 714 1001 L 712 1028 L 722 1055 Q 747 1120 753 1250 L 757 1491 Z"/></clipPath>
   <clipPath id="afridi-silhouette" clipPathUnits="objectBoundingBox"><path transform="scale(.0008912656 .0007132668)" d="M 278 1402 Q 284 1250 327 1130 L 339 1090 L 323 1067 L 323 958 Q 282 962 271 935 Q 250 883 248 811 L 239 799 L 247 753 L 262 692 L 271 620 Q 284 544 313 516 Q 330 501 376 482 L 414 464 L 448 451 L 463 432 L 479 427 L 479 401 Q 462 383 456 352 Q 440 344 435 324 Q 419 297 416 268 Q 410 245 412 216 L 418 186 Q 424 161 443 143 L 463 127 L 483 113 L 501 106 L 520 101 L 543 99 L 567 104 L 584 113 L 601 119 L 620 134 L 638 153 Q 656 176 658 206 L 660 247 Q 670 258 662 284 L 655 307 L 645 315 L 642 393 Q 662 393 669 410 L 678 434 L 696 445 L 719 454 L 770 474 L 810 492 Q 844 511 858 559 L 869 612 L 877 663 L 888 724 L 893 768 L 882 783 Q 875 852 850 898 Q 844 918 825 917 L 796 919 L 798 987 L 805 1043 Q 809 1063 793 1072 L 784 1095 Q 814 1170 824 1290 L 834 1402 Z"/></clipPath>
  </defs></svg>
  <span className="rivalry-nation india-word" aria-hidden="true">IND</span>
  <span className="rivalry-nation pakistan-word" aria-hidden="true">PAK</span>
  <div className="arena-stripe" aria-hidden="true"/>
  <motion.img className="hero-legend hero-afridi" src={deliveryImage('/assets/pakistan.png')} {...responsiveCampaign('/assets/pakistan.png','(max-width: 700px) 80vw, 55vw')} alt="Shahid Afridi in Pakistan Champions jersey" initial={spatial?{opacity:0,x:-14}:{opacity:0}} animate={{opacity:1,x:0}} transition={{duration:spatial?.45:.15,delay:spatial?.05:0,ease:broadcastEase}}/>
  <motion.img className="hero-legend hero-yuvraj" src={deliveryImage('/assets/india.png')} {...responsiveCampaign('/assets/india.png','(max-width: 700px) 80vw, 55vw')} alt="Yuvraj Singh in India Champions jersey" fetchPriority="high" initial={spatial?{opacity:0,x:-14}:{opacity:0}} animate={{opacity:1,x:0}} transition={{duration:spatial?.45:.15,ease:broadcastEase}}/>
  <div className="rivalry-stage-base" aria-hidden="true"/>
  <div className="hero-player-signatures"><span>YUVRAJ <b>SINGH</b><small>INDIA CHAMPIONS</small></span><i>×</i><span>SHAHID <b>AFRIDI</b><small>PAKISTAN CHAMPIONS</small></span></div>
 </div>;
}
