// The bet journey. One entry per weekly bet, so the Bets hub and the Goal page
// tell the story of how we are converging on the best package for 18-30s.
// `live` bets pull their numbers from the app; the rest are written summaries.

export const BETS = [
  {
    id: 1,
    week: 'Bet #1',
    title: 'Flexible wallet vs. a set bundle',
    status: 'Supported',
    summary:
      'All 5 chose a flexible allowance they control over a bundle decided for them. The real barrier turned out to be comprehension.',
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
    summary:
      'A balanced choice survey ranking six benefits against each other, so every benefit earns a clean win rate.',
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
  {
    id: 3,
    week: 'Bet #3',
    title: 'Does the flyer make people act',
    status: 'Not supported',
    summary:
      'None of five people clicked through the flyer unprompted within a minute. It read as a printed poster, so we rebuilt it.',
    hypothesis:
      'Shown the flyer with a clear next step, at least 4 of 5 bullseye users will click through to find out more within one minute, without being prompted.',
    result:
      '0 of 5 clicked through unprompted within a minute, against a bar of 4 of 5. One found the button without help after the first minute, two reached the page once the button was pointed out, and two never got past the flyer.',
    learning:
      'The flyer read as a printed poster and its one button sat below the bottom of the screen. What failed was the way in, so this result cannot yet say whether people want what is behind it. The flyer now fits one screen, has one clear button, and every benefit can be tapped. The next test puts it in front of people who have never met us.',
    links: [
      { label: 'Present the result', to: '/present/nov20', primary: true },
      { label: 'The plan, before it ran', to: '/present/bet3' },
      { label: 'Open the flyer', to: '/bets/3' },
      { label: 'The landing page people reach', to: '/plan?src=team', external: false },
      { label: 'Survey results behind it', to: '/bets/2' },
    ],
  },
]

export const BETS_BY_ID = Object.fromEntries(BETS.map((b) => [b.id, b]))
