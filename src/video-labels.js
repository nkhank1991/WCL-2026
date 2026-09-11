const aliases=[['India',/\bindia\b|\bind\b/i],['Pakistan',/\bpakistan\b|\bpak\b/i],['South Africa',/\bsouth africa\b|\bsa\b/i],['Australia',/\baustralia\b|\baus\b/i],['England',/\bengland\b|\beng\b/i],['West Indies',/\bwest indies\b|\bwi\b/i],['Bangladesh',/\bbangladesh\b|\bban\b/i]];
// Derive only names actually present in the publisher's title. Never infer a fixture.
export function videoMatchLabel(video){
 const title=String(video.title||'WCL highlights');
 const found=aliases.map(([name,pattern])=>({name,index:title.search(pattern)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index);
 return found.length===2?found.map(x=>x.name).join(' × '):title;
}
