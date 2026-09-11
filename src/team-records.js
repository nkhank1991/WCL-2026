// Group-stage records, not player statistics or whole-tournament win totals.
// Sources checked 11 September 2026. Keep knockout outcomes separate.
export const recordSources = {
  1: 'https://www.cricbuzz.com/cricket-series/8481/world-championship-of-legends-2024/points-table',
  2: 'https://www.cricbuzz.com/cricket-series/10361/world-championship-of-legends-2025/points-table',
};
const row = (played, wins, losses, noResult, points, finish) => ({played, wins, losses, noResult, points, finish});
export const teamRecords = {
  1: {
    india: row(5,2,3,0,4,'Champions'),
    pakistan: row(5,4,1,0,8,'Runners-up'),
    'south-africa': row(5,2,3,0,4,'Group stage'),
    australia: row(5,4,1,0,8,'Semi-finalists'),
    england: row(5,1,4,0,2,'Group stage'),
    'west-indies': row(5,2,3,0,4,'Semi-finalists'),
  },
  2: {
    india: row(5,1,3,1,3,'Semi-final qualification'),
    pakistan: row(5,4,0,1,9,'Runners-up'),
    'south-africa': row(5,4,1,0,8,'Champions'),
    australia: row(5,2,2,1,5,'Semi-finalists'),
    england: row(5,1,3,1,3,'Group stage'),
    'west-indies': row(5,1,4,0,2,'Group stage'),
  },
};
// Portraits are the approved Season 3 campaign, independent of archive selection.
// Do not infer a captain from a supplied hero photograph.
export const captainAppointments = {
  australia: {
    name: 'David Warner', season: 3,
    source: 'https://www.instagram.com/wclaustraliachampions/reel/DdBizFJIFPi/',
  },
};
export function teamRecord(id, season) {
  return teamRecords[season]?.[id] || null;
}

// Independently verified final score summaries. Preserve all other source fixtures
// and never overwrite a newer published result, cancellation, or edited matchup.
export const archiveFinals = {
  's1-18': {
    season: 1, teams: ['pakistan','india'], scores: ['156/6 (20)','159/5 (19.1)'],
    result: 'India Champions won by 5 wickets', winner: 'india',
    scoreSource: 'https://www.cricbuzz.com/live-cricket-scorecard/100861/indch-vs-pakch-final-world-championship-of-legends-2024',
  },
  's2-18': {
    season: 2, teams: ['pakistan','south-africa'], scores: ['195/5 (20)','197/1 (16.5)'],
    result: 'South Africa Champions won by 9 wickets', winner: 'south-africa',
    scoreSource: 'https://www.cricbuzz.com/live-cricket-scorecard/125250/pakch-vs-sach-final-world-championship-of-legends-2025',
  },
};
export function withArchiveFinal(match) {
  const final = archiveFinals[match.id];
  if (!final || match.status !== 'Archive schedule' || match.verificationStatus === 'verified'
    || Number(match.season) !== final.season || JSON.stringify(match.teams) !== JSON.stringify(final.teams)) return match;
  return {...match, ...final, status:'Completed', verificationStatus:'verified'};
}
