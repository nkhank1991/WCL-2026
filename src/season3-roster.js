import roster from './data/season3.json' with {type:'json'};
import archive from './data/wcl.json' with {type:'json'};
import headshots from './data/season3-headshots.json' with {type:'json'};
const key=s=>s.toLowerCase().replace(/[^a-z]/g,'');
// Explicit spelling normalization; original workbook values remain in sourceName.
const aliases={
 'ambatiraudu':'Ambati Rayudu','ifranpathan':'Irfan Pathan',
 'lianplunekett':'Liam Plunkett','ajmalshehzad':'Ajmal Shahzad',
 'ifikharahmed':'Iftikhar Ahmed','umeramin':'Umar Amin',
 'sohailtanveer':'Sohail Tanvir','mohammedamir':'Mohammad Amir',
 'rumanraees':'Rumman Raees','sheldoncotrell':'Sheldon Cottrell',
 'djbravo':'Dwayne Bravo','shivchanderpaul':'Shivnarine Chanderpaul',
 'darcyshort':"D'Arcy Short",
 'enamukhaquejr':'Enamul Haque Jr.'
};
export const pendingSlots=roster.slots.filter(s=>s.status!=='listed');
export const season3Players=roster.slots.filter(s=>s.status==='listed').map(s=>{
 const cleaned=s.sourceName.replace(/\s*\(WK\)/gi,'').replace(/[�©]/g,'').trim();
 const normalized=aliases[key(cleaned)]||cleaned;
 const old=archive.players.find(p=>p.team===s.team&&key(p.name)===key(normalized));
 const name=cleaned;
 // The supplied C77 bitmap conflicts with its James Anderson label; do not publish or generate from it.
 const headshot=s.sourceRow===77?null:headshots[s.sourceRow];
 if(headshot&&headshot.team!==s.team)throw new Error('Headshot team mismatch at row '+s.sourceRow);
 if(headshot&&headshot.sourceName.replace(/\s+/g,' ').trim()!==s.sourceName.replace(/\s+/g,' ').trim())throw new Error('Headshot name mismatch at row '+s.sourceRow);
 const player={
  id:old?.id||s.team+'-'+key(normalized),
  name,team:s.team,role:(/\(WK\)/i.test(s.sourceName)?'Wicketkeeper':'Player'),
  image:headshot?.image||null,headshot:headshot?.image||null,source:old?.source||'https://wclcricket.com/',
  sourceName:s.sourceName,sourceRow:s.sourceRow,status:'Supplied player list · participation unverified',participation:'unverified',campaign:false
 };
 return player;
});
