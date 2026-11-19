import bet1 from './bet1.jsx'
import bet2 from './bet2.jsx'
import bet3 from './bet3.jsx'
import nov20 from './nov20.jsx'

// Each deck lives here, keyed by the id used in /present/<id>.
export const DECKS = { bet1, bet2, bet3, nov20 }

/* The order and labels the Presentations page shows, oldest first. `stage`
   says where in the project the deck sits, since the file names alone do not
   say whether a deck came before or after its bet ran. */
export const DECK_LIST = [
  { id: 'bet1', stage: 'Bet #1', blurb: 'Market research: what supplemental benefits look like today and where the gaps are.' },
  { id: 'bet2', stage: 'Bet #2', blurb: 'Which benefits people pick when two packages of equal value go head to head.' },
  { id: 'bet3', stage: 'Bet #3 · before it ran', when: 'Nov 13', blurb: 'The plan: the flyer, the page it links to, and the 4 of 5 bar we set.' },
  { id: 'nov20', stage: 'Bet #3 · the result, and what is next', when: 'Nov 20', blurb: 'What happened, the rebuilt flyer, partner feedback, and the ad test.' },
]
