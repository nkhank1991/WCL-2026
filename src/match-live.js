// Presentation adapter only. No roster, campaign or schedule establishes a live score.
export const livePhases=['toss','innings','chase','innings-break','result'];
export const eventTypes=['four','six','wicket','fifty','hundred','partnership','innings-break','result','toss'];
const integer=(value,max=2000)=>Number.isInteger(value)&&value>=0&&value<=max;
const text=(value,max=180)=>typeof value==='string'&&value.trim()?value.trim().slice(0,max):null;
const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?value:null;
export function ballsFromOvers(value){
 if(!/^\d{1,2}(\.[0-5])?$/.test(String(value)))return null;
 const [overs,balls='0']=String(value).split('.');
 return Number(overs)*6+Number(balls);
}
export function liveSnapshot(match){
 if(match.verificationStatus!=='verified'||!['Live','Completed'].includes(match.status)||!match.live)return null;
 const live=match.live,teamIds=match.teams||[];
 if(!livePhases.includes(live.phase)||!Array.isArray(live.innings)||!timestamp(live.updatedAt))return null;
 const innings=live.innings.filter(i=>i&&teamIds.includes(i.teamId)&&integer(i.runs)&&integer(i.wickets,10)&&ballsFromOvers(i.overs)!==null)
  .filter((i,index,rows)=>rows.findIndex(row=>row.teamId===i.teamId)===index)
  .slice(0,2).map(i=>({teamId:i.teamId,runs:i.runs,wickets:i.wickets,overs:String(i.overs),maxOvers:integer(i.maxOvers,99)&&i.maxOvers>0&&ballsFromOvers(i.overs)<=i.maxOvers*6?i.maxOvers:null}));
 const players=(Array.isArray(live.players)?live.players:[]).filter(p=>p&&text(p.playerId)&&teamIds.includes(p.teamId)&&(
  p.role==='batting'?integer(p.runs)&&integer(p.balls):p.role==='bowling'&&integer(p.wickets,10)&&integer(p.conceded)&&ballsFromOvers(p.overs)!==null
 )).filter((p,index,rows)=>rows.findIndex(row=>row.playerId===p.playerId)===index).slice(0,3).map(p=>({
  playerId:p.playerId,teamId:p.teamId,role:p.role,runs:p.runs,balls:p.balls,wickets:p.wickets,conceded:p.conceded,overs:p.overs,striker:p.striker===true
 }));
 const recentBalls=(Array.isArray(live.recentBalls)?live.recentBalls:[]).filter(b=>b&&text(b.id)&&/^(?:[0-7]|W|(?:[1-7])?(?:Wd|Nb|Lb|B))$/.test(b.label))
  .slice(-6).map(b=>({id:b.id,label:b.label,summary:text(b.summary),over:text(b.over,12)}));
 const event=live.event&&text(live.event.id)&&eventTypes.includes(live.event.type)&&text(live.event.title)&&timestamp(live.event.occurredAt)
  ?{id:live.event.id,type:live.event.type,title:text(live.event.title),detail:text(live.event.detail),occurredAt:live.event.occurredAt,playerId:text(live.event.playerId,100)}:null;
 return {phase:live.phase,updatedAt:live.updatedAt,battingTeam:teamIds.includes(live.battingTeam)?live.battingTeam:null,
  target:integer(live.target)&&live.target>0?live.target:null,toss:text(live.toss),innings,players,recentBalls,event};
}
export function chaseEquation(live){
 if(!live||live.phase!=='chase'||!Number.isInteger(live.target)||live.target<1)return null;
 const batting=live.innings.find(i=>i.teamId===live.battingTeam);
 if(!batting||!Number.isInteger(batting.maxOvers)||batting.maxOvers<1)return null;
 const balls=Math.max(0,batting.maxOvers*6-ballsFromOvers(batting.overs)),runs=Math.max(0,live.target-batting.runs);
 return {runs,balls,complete:batting.wickets===10||balls===0||runs===0,rate:balls>0?(runs*6/balls).toFixed(2):null};
}
export function scoreFor(match,teamId,index){
 const live=liveSnapshot(match),innings=live?.innings.find(i=>i.teamId===teamId);
 if(innings)return {value:innings.runs+'/'+innings.wickets,overs:innings.overs,batting:live.battingTeam===teamId};
 if(match.verificationStatus!=='verified'||!['Live','Completed'].includes(match.status))return null;
 const raw=match.scores?.[index];
 if(typeof raw!=='string'||!raw.trim())return null;
 const parsed=raw.match(/^(\d{1,4}(?:[\/-]\d{1,2})?)(?:\s*\((\d{1,2}(?:\.[0-5])?)\s*(?:ov(?:ers)?)?\))?$/i);
 return parsed?{value:parsed[1],overs:parsed[2]||null}:{value:raw,overs:null,long:true};
}
export function eligibleMoment(match,now=Date.now()){
 const event=liveSnapshot(match)?.event;
 if(!event)return null;
 const age=now-Date.parse(event.occurredAt);
 return Number.isFinite(age)&&age>=-5000&&age<90000?event:null;
}
