export const leadership=[
 {id:'ajay-devgn',name:'Ajay Devgn',role:'Co-Founder',image:'/assets/leadership/ajay-devgn.jpg',source:'https://wclcricket.com/about/',copy:'Cinema meets cricket. Ajay Devgn brings his screen presence and creative experience to WCL as Co-Founder.',facts:[['1991','Film debut'],['4','National Film Awards'],['WCL','Co-Founder']]},
 {id:'harshit-tomar',name:'Harshit Tomar',role:'Founder & CEO',image:'/assets/leadership/harshit-tomar.jpg',source:'https://wclcricket.com/about/',copy:'From music and sports marketing to building a championship. Harshit Tomar is the Founder & CEO behind WCL.',facts:[['30+','Songs released'],['SPORT','Marketing experience'],['WCL','Founder & CEO']]}
];

// Use official WCL editorial photographs in hero frames, without rough subject masks.
// Match only old defaults: a deliberately replaced CMS image always wins.
const heroPhotos={
 'ajay-devgn':{original:'/assets/leadership/ajay-devgn.jpg',image:'/assets/leadership/ajay-devgn-editorial.jpg'},
 'harshit-tomar':{original:'/assets/leadership/harshit-tomar.jpg',image:'/assets/leadership/harshit-tomar-editorial.jpg'}
};
export function leadershipHeroImage(person){
 const photo=heroPhotos[person.id];
 return photo&&person.image===photo.original?photo.image:person.image;
}

// Shared by the static preview, fresh CMS seed and scoped content migration.
export function leadershipStory(person){return {
 id:person.id,label:person.name,tag:'WCL SPOTLIGHT',order:person.id==='harshit-tomar'?.1:.2,
 chapter:'Building the next chapter.',role:person.role,
 title:person.name.split(' ')[0].toUpperCase(),line:person.name.split(' ').slice(1).join(' ').toUpperCase()+'.',
 copy:person.copy,image:person.image,alt:person.name+' — official WCL photograph',
 action:'Meet '+person.name.split(' ')[0],to:'/about#'+person.id,
 secondary:'Explore the archive',secondaryTo:'/watch',facts:person.facts,
 source:person.source,note:'Biography & achievement source'
};}
