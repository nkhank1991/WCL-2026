import {useEffect,useRef,useState} from 'react';
import {Play,Pause,SpeakerHigh,SpeakerSlash,ArrowUpRight,ArrowClockwise} from '@phosphor-icons/react';

let apiRequest;
export function loadYouTubePlayer(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiRequest)return apiRequest;
 apiRequest=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  let script=document.querySelector('script[data-wcl-youtube-api]');
  const ownScript=!script;
  if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.dataset.wclYoutubeApi='true';script.async=true;script.referrerPolicy='strict-origin-when-cross-origin'}
  const cleanup=()=>{clearTimeout(timeout);script.removeEventListener('error',failed);if(window.onYouTubeIframeAPIReady===loaded)window.onYouTubeIframeAPIReady=previous};
  const failed=()=>{cleanup();if(ownScript)script.remove();reject(new Error('YouTube controls unavailable'))};
  const loaded=()=>{cleanup();try{previous?.()}catch{/* Another integration must not prevent this player loading. */}window.YT?.Player?resolve(window.YT):reject(new Error('YouTube player not ready'))};
  const timeout=setTimeout(failed,12000);
  window.onYouTubeIframeAPIReady=loaded;
  script.addEventListener('error',failed,{once:true});
  if(ownScript)document.head.append(script);
 }).catch(error=>{apiRequest=undefined;throw error});
 return apiRequest;
}

export function playbackTime(seconds){const value=Math.max(0,Math.floor(Number(seconds)||0));return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`}

export function playbackError(code){
 if(code===153)return 'YouTube could not verify this website in this browser. Retry the player; if this persists, open this WCL page in your regular browser.';
 if(code===101||code===150)return 'Embedding is disabled for this video. It can only be watched on YouTube.';
 if(code===100)return 'This video is private or no longer available on YouTube.';
 if(code===2)return 'YouTube could not recognise this video link.';
 return 'The YouTube player could not start this video. Please retry.';
}

export function BroadcastVideo(props){return <VideoPlayer key={props.videoId} {...props}/>}
function VideoPlayer({videoId,title,poster,initiallyOpen=false,onPlay,playLabel='Watch the film'}){
 const [opened,setOpened]=useState(initiallyOpen),[playing,setPlaying]=useState(false),[ready,setReady]=useState(false),[muted,setMuted]=useState(true),[position,setPosition]=useState(0),[duration,setDuration]=useState(0),[playerError,setPlayerError]=useState(null),[sdkUnavailable,setSdkUnavailable]=useState(false),[attempt,setAttempt]=useState(0),[autoplayBlocked,setAutoplayBlocked]=useState(false);
 const host=useRef(null),player=useRef(null),wantsAutoplay=useRef(false),notify=useRef(onPlay);
 notify.current=onPlay;
 function sync(instance=player.current){
  if(!instance)return;
  const time=Number(instance.getCurrentTime?.()),length=Number(instance.getDuration?.());
  if(Number.isFinite(time))setPosition(Math.max(0,time));
  if(Number.isFinite(length)&&length>0)setDuration(length);
  if(instance.isMuted)setMuted(instance.isMuted());
 }
 useEffect(()=>{
  if(!opened||!host.current)return;
  let cancelled=false,instance,readyTimeout,provider,documentLoaded=false;
  const root=host.current;
  // The provider owns this subtree, so destroy() cannot remove a React-owned node.
  const iframe=document.createElement('iframe');
  // Use the actual site origin, never another domain to evade embed restrictions.
  iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=1&rel=0&playsinline=1&autoplay=${wantsAutoplay.current?1:0}&mute=1`;
  iframe.title=title;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';iframe.allowFullscreen=true;
  function connect(){
   if(cancelled||instance||!provider||!documentLoaded)return;
   instance=new provider.Player(iframe,{events:{
    onReady:event=>{if(cancelled)return;clearTimeout(readyTimeout);player.current=event.target;setReady(true);setSdkUnavailable(false);sync(event.target);const active=event.target.getPlayerState?.()===1;setPlaying(active);if(active)notify.current?.()},
    onStateChange:event=>{if(cancelled)return;setPlaying(event.data===1);sync(event.target);if(event.data===1){setPlayerError(null);setAutoplayBlocked(false);notify.current?.()}},
    onError:event=>{if(!cancelled){clearTimeout(readyTimeout);setPlayerError(Number(event.data)||'unknown');setPlaying(false)}},
    onAutoplayBlocked:()=>{if(!cancelled)setAutoplayBlocked(true)}
   }});
  }
  function loaded(){
   // A WebView can emit a load for its initial empty document. Do not attach the
   // API until the actual provider navigation commits; native playback comes first.
   try{if(iframe.contentWindow?.location.href==='about:blank')return}catch{/* Cross-origin means the YouTube document committed. */}
   documentLoaded=true;try{connect()}catch{setSdkUnavailable(true)}
  }
  iframe.addEventListener('load',loaded);
  readyTimeout=setTimeout(()=>{if(!cancelled)setSdkUnavailable(true)},12000);
  root.append(iframe);
  loadYouTubePlayer().then(YT=>{provider=YT;if(!cancelled)connect()}).catch(()=>{if(!cancelled)setSdkUnavailable(true)});
  return()=>{cancelled=true;clearTimeout(readyTimeout);iframe.removeEventListener('load',loaded);player.current=null;instance?.destroy?.();root.replaceChildren()};
 },[opened,videoId,title,attempt]);
 useEffect(()=>{
  if(!ready||!playing)return;
  const timer=setInterval(()=>{if(!document.hidden)sync()},250);
  return()=>clearInterval(timer);
 },[ready,playing]);
 const canControl=ready&&!sdkUnavailable&&!playerError;
 function retry(){setPlayerError(null);setSdkUnavailable(false);setReady(false);setPlaying(false);setAutoplayBlocked(false);setPosition(0);setDuration(0);wantsAutoplay.current=true;setAttempt(value=>value+1)}
 return <div className="broadcast-video" data-hero-interactive="true">
  <div className="broadcast-video-screen">
   {opened?<div className="broadcast-video-host" ref={host}/>:<button className="hero-film-poster" aria-label={'Play '+title} onClick={()=>{wantsAutoplay.current=true;setOpened(true);notify.current?.()}}>{poster&&<img src={poster} alt=""/>}<span><Play weight="fill"/> {playLabel}</span></button>}
  </div>
  {opened&&<div className="broadcast-video-controls">
   {canControl?<><button aria-label={playing?'Pause video':'Play video'} onClick={()=>{if(playing)player.current?.pauseVideo();else player.current?.playVideo()}}>{playing?<Pause weight="fill"/>:<Play weight="fill"/>}</button>
    {duration>0?<><input className="broadcast-video-progress" type="range" min="0" max={duration} step="1" value={Math.min(position,duration)} aria-label="Seek video" aria-valuetext={`${playbackTime(position)} of ${playbackTime(duration)}`} style={{'--played':`${Math.min(100,position/duration*100)}%`}} onChange={event=>{const value=Number(event.target.value);setPosition(value);player.current?.seekTo(value,true)}}/><time>{playbackTime(position)} <span>/ {playbackTime(duration)}</span></time></>:<span className="video-controls-note">Waiting for video information</span>}
    <button aria-label={muted?'Unmute video':'Mute video'} onClick={()=>{if(muted)player.current?.unMute();else player.current?.mute();sync()}}>{muted?<SpeakerSlash/>:<SpeakerHigh/>}</button>
   </>:<span className="video-controls-note">{sdkUnavailable?'Player not responding? Reload it here.':'Loading YouTube player…'}</span>}
   <button aria-label="Retry video" title="Reload the YouTube player" onClick={retry}><ArrowClockwise/></button>
   <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`} target="_blank" rel="noreferrer" aria-label="Open video on YouTube"><ArrowUpRight/></a>
  </div>}
  {playerError&&<p className="video-playback-message" role="alert">{playbackError(playerError)} <small>YouTube error {playerError}</small></p>}
  {!playerError&&autoplayBlocked&&<p className="video-playback-message" role="status">Tap the play button in the video to start.</p>}
 </div>;
}
