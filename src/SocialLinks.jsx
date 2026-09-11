import {FacebookLogo,InstagramLogo,XLogo,YoutubeLogo,LinkedinLogo,ArrowUpRight} from '@phosphor-icons/react';
export const wclSocial=[
 {name:'Facebook',url:'https://www.facebook.com/share/18S6t9XWLN/?mibextid=wwXIfr',Icon:FacebookLogo},
 {name:'Instagram',url:'https://www.instagram.com/worldchampionshipoflegends?igsh=ZGx6ZjZzN2IzMWxz',Icon:InstagramLogo},
 {name:'X',url:'https://x.com/wclleague?s=21',Icon:XLogo},
 {name:'YouTube',url:'https://www.youtube.com/@Wclcricket',Icon:YoutubeLogo},
 {name:'LinkedIn',url:'https://www.linkedin.com/company/world-championships-of-legends-league',Icon:LinkedinLogo}
];
export const teamInstagram={
 india:'https://www.instagram.com/wcl_indiachampions?stkn=MWlqa2Rqb2gzcHhycg==',
 'west-indies':'https://www.instagram.com/wclwestindieschampions?stkn=MWJtZDVmNWRscnExeA==',
 'south-africa':'https://www.instagram.com/gc_southafricachampions?stkn=MWthYTlhM2xibmUzMQ==',
 australia:'https://www.instagram.com/wclaustraliachampions?stkn=NXV5cWc4YzBhOGgx',
 england:'https://www.instagram.com/meteoraenglandchampions?stkn=MTI5dzhrNzh5dnF4aQ==',
 pakistan:'https://www.instagram.com/wclpakistanchampions?stkn=b2c1eGVra3NpYTdy',
 bangladesh:'https://www.instagram.com/bangladeshchampionsofficial?stkn=cjA1b25jaGJkc2t6'
};
export function SocialLinks({compact=false}){return <div className={'social-links '+(compact?'mobile-social':'')}><p>Follow WCL</p><div>{wclSocial.map(({name,url,Icon})=><a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`WCL on ${name} (opens in a new tab)`} title={`WCL on ${name}`}><Icon size={22} weight="regular"/></a>)}</div></div>}
export function TeamInstagram({id,name}){return <a className="team-instagram" href={teamInstagram[id]} target="_blank" rel="noopener noreferrer" aria-label={`${name} Champions on Instagram (opens in a new tab)`}><InstagramLogo size={20}/><span>Follow {name}</span><ArrowUpRight size={16}/></a>}
