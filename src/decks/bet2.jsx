/* Bet #2 deck: the choice-survey bet, built from our own research in the same
   style as the Bet #1 deck. No invented results; the survey is still collecting. */

const SANS = "'Inter', system-ui, sans-serif"
const SERIF = "'Newsreader', Georgia, serif"
const BAR = <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 12, background: '#003087' }} />

const pill = {
  fontSize: 15, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
  color: '#FFFFFF', background: '#003087', padding: '7px 15px', borderRadius: 999, alignSelf: 'flex-start', margin: 0,
}
const base = (bg, fg) => ({
  width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
  fontFamily: SANS, background: bg, color: fg, padding: '60px 72px', display: 'flex', flexDirection: 'column',
})

/* ---- Slide 1 · Title (navy) ---- */
const S1 = (
  <div style={{ ...base('#0E1E3A', '#EEF3FA'), justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2B4A73', paddingBottom: 14 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#6FB0EC' }}>FUNG FELLOWSHIP</span>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#8FA6C6' }}>BET #2</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 78, fontWeight: 600, lineHeight: 1.04, color: '#FFFFFF', margin: 0 }}>
        Which benefits win<br />head-to-head
      </h1>
      <p style={{ fontSize: 27, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>Turning the research into one recommended package for 18 to 30.</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}>Saba Feilizadeh &nbsp;·&nbsp; Derek Hernandez Alonso &nbsp;·&nbsp; Alexandra Arcaro</span>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}>November 2026</span>
    </div>
  </div>
)

/* ---- Slide 2 · The bet ---- */
const S2 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 26 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>The bet</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>From a flexible wallet to the right mix</h2>
    </div>
    <p style={{ fontSize: 24, lineHeight: 1.45, margin: 0 }}>
      Bet&nbsp;#1 proved young adults want a flexible <b style={{ color: '#003087' }}>$300 wallet</b> they control. Bet&nbsp;#2 answers the next question: <b style={{ color: '#003087' }}>which benefits go in it.</b>
    </p>
    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '7px solid #003087', borderRadius: 16, padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#7A8291' }}>HYPOTHESIS</span>
        <p style={{ fontSize: 23, lineHeight: 1.45, color: '#16233E', margin: 0 }}>
          Across a short balanced choice survey, one or two benefits will win a majority of their head-to-head matchups consistently enough to name one strongest package.
        </p>
      </div>
      <div style={{ width: 300, background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 16, padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8A5A17' }}>STATUS</span>
        <span style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: '#8A5A17', lineHeight: 1.05 }}>Collecting</span>
        <p style={{ fontSize: 18, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>The survey is live and gathering responses now.</p>
      </div>
    </div>
  </div>
)

/* ---- Slide 3 · The six candidates ---- */
const benefits = [
  ['Dental', 'Expanded dental coverage'],
  ['Therapy & mental health', 'Additional mental health support'],
  ['Gym & fitness', 'Fitness reimbursement'],
  ['Vision', 'Enhanced vision allowance'],
  ['Everyday health', 'An everyday health allowance'],
  ['Nutrition', 'Personalized nutrition support'],
]
const S3 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 24 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>The candidates</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>Six benefits, one $300 wallet</h2>
      <p style={{ fontSize: 20, color: '#6A7383', margin: 0 }}>The candidates we are testing against each other, drawn from the interviews.</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, flex: 1 }}>
      {benefits.map(([name, desc]) => (
        <div key={name} style={{ background: '#FFFFFF', border: '1px solid #E4E2DB', borderTop: '5px solid #0067A8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#003087', margin: 0 }}>{name}</h3>
          <p style={{ fontSize: 18, lineHeight: 1.35, color: '#4A5568', margin: 0 }}>{desc}</p>
        </div>
      ))}
    </div>
  </div>
)

/* ---- Slide 4 · The method ---- */
const MiniPkg = ({ label, items }) => (
  <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #DCE6F5', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', color: '#0067A8' }}>{label} · $300 / YEAR</span>
    {items.map((t) => (
      <span key={t} style={{ fontSize: 17, color: '#16233E' }}>• {t}</span>
    ))}
  </div>
)
const S4 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 24 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>The method</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>A balanced head-to-head</h2>
    </div>
    <div style={{ display: 'flex', gap: 40, flex: 1 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        {[
          'Two $300 packages, shown ten times. People pick the one they would rather have.',
          'Every benefit is weighed against every other an equal number of times, so each earns a clean win rate.',
          'Anonymous, about two minutes, one link we can send anywhere.',
          'At the end each person sees their own top benefits, which helps them finish.',
        ].map((t, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ flex: 'none', width: 12, height: 12, borderRadius: 999, background: '#0067A8', marginTop: 8 }} />
            <p style={{ fontSize: 21, lineHeight: 1.4, color: '#16233E', margin: 0 }}>{t}</p>
          </div>
        ))}
      </div>
      <div style={{ width: 430, background: '#EEF3FB', border: '1px solid #D3E0F4', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.5px', color: '#7A8291', textAlign: 'center' }}>WHICH WOULD YOU RATHER HAVE?</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <MiniPkg label="A" items={['Dental', 'Fitness', 'Everyday health']} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#6A7383' }}>or</span>
          <MiniPkg label="B" items={['Mental health', 'Vision', 'Nutrition']} />
        </div>
        <span style={{ fontSize: 15, color: '#8A909C', textAlign: 'center' }}>Repeated 10 times, a different split each time.</span>
      </div>
    </div>
  </div>
)

/* ---- Slide 5 · Reading the winner (navy) ---- */
const S5 = (
  <div style={{ ...base('#0E1E3A', '#C9D6EA'), gap: 26 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#6FB0EC' }}>Reading the winner</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}>Every benefit earns a win rate</h2>
    </div>
    <p style={{ fontSize: 24, lineHeight: 1.45, margin: 0, maxWidth: 1050 }}>
      A win rate above 50% means people chose packages containing that benefit more often than not. Because the matchups are balanced, the ranking is fair, not an artifact of which pairs we happened to show.
    </p>
    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
      <div style={{ flex: 1, background: '#15264A', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8FA6C6' }}>WHAT WE DO WITH IT</span>
        <p style={{ fontSize: 21, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>The one or two benefits with the highest win rates become the core of the recommended package. We pair the numbers with the interviews for the reasons behind them.</p>
      </div>
      <div style={{ width: 380, background: '#15264A', borderLeft: '6px solid #6FB0EC', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1 }}>Live and collecting</span>
        <p style={{ fontSize: 19, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>Results update on the dashboard as responses come in. We will name the package once the sample is large enough to trust.</p>
      </div>
    </div>
  </div>
)

/* ---- Slide 6 · Next steps ---- */
const NextRow = ({ n, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '18px 26px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: '#0A6BB0', width: 56 }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 23, fontWeight: 700, color: '#16233E', margin: 0 }}>{h}</h3>
      <p style={{ fontSize: 18, color: '#6A7383', margin: '2px 0 0' }}>{p}</p>
    </div>
  </div>
)
const S6 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>Next steps</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>What happens next</h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
      <NextRow n="1" h="Collect responses" p="Push the survey toward about 50 so the win rates are callable." />
      <NextRow n="2" h="Name the package" p="Lock the one or two strongest benefits into the flexible wallet." />
      <NextRow n="3" h="Run package interviews" p="Pair the numbers with the reasons, using the standard protocol." />
      <NextRow n="4" h="Test willingness to pay" p="The $5-then-$15 question, toward a $10 to $25 per-month price." />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#003087', borderRadius: 12, padding: '18px 26px' }}>
      <span style={{ color: '#FFFFFF', fontSize: 20 }}>&#9658;</span>
      <p style={{ fontSize: 20, lineHeight: 1.35, color: '#FFFFFF', margin: 0 }}><b>The ask:</b> share the two-minute survey with a few 18-to-30s, and tell us where the package shape feels off.</p>
    </div>
  </div>
)

const bet2 = {
  id: 'bet2',
  title: 'Bet #2 · Which benefits win',
  slides: [
    { id: 'title', node: S1, notes: 'Open here. This bet turns the market research into one recommended package. Last week we proved they want a flexible wallet; this week is about which benefits fill it. Keep it short.' },
    { id: 'bet', node: S2, notes: 'State the bet plainly, and connect it to Bet #1. The hypothesis is that one or two benefits win clearly enough to name a package. Be honest that it is still collecting, not concluded.' },
    { id: 'candidates', node: S3, notes: 'The six benefits on the table, all drawn from what people asked for in the interviews. We are not adding new ideas here, we are ranking these six.' },
    { id: 'method', node: S4, notes: 'Explain why the survey is trustworthy: every benefit meets every other the same number of times, so the win rate is fair. Walk through the A-or-B example on the right. Mention the personal result at the end, which lifts completion.' },
    { id: 'reading', node: S5, notes: 'How we read a winner: above 50% means chosen more often than not. The top one or two become the core package. Stress that it is live and we will only name the package once the sample is big enough.' },
    { id: 'next', node: S6, notes: 'Close on the plan and the ask. The most useful thing the partners can do is help us get responses. Then we name the package, interview on it, and test the price.' },
  ],
}

export default bet2
