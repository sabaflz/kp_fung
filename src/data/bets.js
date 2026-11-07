// The bet journey. One entry per weekly bet, so the Bets hub and the Goal page
// tell the story of how we are converging on the best package for 18-30s.
// `live` bets pull their numbers from the app; the rest are written summaries.

export const BETS = [
  {
    id: 1,
    week: 'Bet #1',
    title: 'Flexible wallet vs. a set bundle',
    status: 'Supported',
    hypothesis:
      'Shown two $300 packages, at least 4 of 5 bullseye users will name a specific benefit or combination they would prioritize, with a reason, within a 15-minute session.',
    result:
      '5 of 5 named a clear priority, and all 5 chose the flexible wallet over the pre-split bundle, across both presentation orders.',
    learning:
      'Young adults want a flexible allowance they control, not a bundle decided for them. The real barrier is comprehension: they could not tell what several benefits meant or what the allowance covers.',
    links: [
      { label: 'Present Bet #1', to: '/present/bet1', primary: true },
      { label: 'See the 5 interviews', to: '/interviews/log' },
    ],
  },
  {
    id: 2,
    week: 'Bet #2',
    title: 'Which benefits win head-to-head',
    status: 'Collecting',
    live: true,
    hypothesis:
      'Across a short balanced choice survey, one or two benefits will win a majority of their head-to-head matchups consistently enough to name one strongest package.',
    result: '',
    learning: '',
    links: [
      { label: 'Present Bet #2', to: '/present/bet2', primary: true },
      { label: 'Open live results', to: '/bets/2' },
      { label: 'Public survey link', to: '/packages', external: true },
    ],
  },
]

export const BETS_BY_ID = Object.fromEntries(BETS.map((b) => [b.id, b]))
