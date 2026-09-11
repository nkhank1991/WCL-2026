// Shared with the visible FAQ page. Dates come from season3-schedule.js.
import {season3Matches} from '../season3-schedule.js';
const rivalry = season3Matches.find(m => m.id === 's3-match-14');
export const answers = [
  {q:'What is WCL?',a:'WCL stands for World Championship of Legends, a cricket competition bringing celebrated international cricketers together in national team colours.',links:[['About WCL','/about']]},
  {q:'When and where is WCL Season 3?',a:'WCL Season 3 is scheduled for 3–18 October 2026 in the United Arab Emirates, with 24 fixtures. Schedule times are UAE time (UTC+4).',links:[['Season 3 information','/season'],['All fixtures','/matches']]},
  {q:'Which teams are in WCL?',a:'The seven WCL teams are India Champions, Pakistan Champions, South Africa Champions, Australia Champions, England Champions, West Indies Champions and Bangladesh Champions.',links:[['Team directory','/teams']]},
  {q:'When is India vs Pakistan in WCL 2026?',a:`India Champions vs Pakistan Champions is scheduled for ${rivalry.date} at ${rivalry.time} UAE time (UTC+4). Check the fixture page for the latest published information.`,links:[['India vs Pakistan guide','/india-vs-pakistan'],['Match details','/matches/s3-match-14']]},
  {q:'Who won the first two WCL seasons?',a:'India Champions won Season 1 in 2024. South Africa Champions won Season 2 in 2025. Both finals were against Pakistan Champions.',links:[['2024 final','/matches/s1-18'],['2025 final','/matches/s2-18']]},
  {q:'Which player list is used for Season 3?',a:'The player directory shows the Season 3 list. Individual match squads and appearances are announced separately; a listing does not confirm participation in a particular match.',links:[['Players by team','/players']]},
  {q:'Why do some archive matches show no scores?',a:'Some archive records contain schedules only. Results and scores appear when independently verified.',links:[['Match archive','/matches']]},
  {q:'Where can I watch WCL highlights?',a:'WCL TV contains the YouTube videos linked from the official Season 1 and Season 2 pages. Playback availability is controlled by the video publisher.',links:[['WCL TV highlights','/watch']]},
  {q:'Where can I buy WCL tickets?',a:'The ticket page will link to an authorized ticketing provider once confirmed. Booking links, prices and venue details will be published there when available.',links:[['Tickets and venues','/tickets']]},
  {q:'Do I need an account for My WCL?',a:'No. Your favourite team and saved videos are stored in this browser on this device.',links:[['My WCL','/fan-zone'],['Cookies and storage','/cookies']]},
  {q:'How can I contact WCL?',a:'Email info@wclcricket.com or use the contact page for general, media, partnership and ticket enquiries.',links:[['Contact WCL','/contact']]},
];
