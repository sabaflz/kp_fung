/* Bet #1 deck: the Market Research presentation, rebuilt in the site's style.
   Content is faithful to what the team presented; "Kaiser" reads as
   "Kaiser Permanente" on first mention, then "KP". Each slide is authored on a
   fixed 1280x720 canvas (the Deck view scales it to fit the screen). */

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
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#8FA6C6' }}>MARKET RESEARCH</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 82, fontWeight: 600, lineHeight: 1.03, color: '#FFFFFF', margin: 0 }}>
        Supplemental benefits<br />for 18 to 30
      </h1>
      <p style={{ fontSize: 27, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>What young adults need, and how Kaiser Permanente can lead.</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}>Saba Feilizadeh &nbsp;·&nbsp; Derek Hernandez Alonso &nbsp;·&nbsp; Alexandra Arcaro</span>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}>October 2026</span>
    </div>
  </div>
)

/* ---- Slide 2 · What we found ---- */
const bars = [
  ['Dental', 17], ['Mental health', 14], ['Fitness', 14], ['Everyday allowance', 10], ['Vision', 8],
]
const Stat = ({ n, l }) => (
  <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderTop: '5px solid #003087', borderRadius: 12, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 600, lineHeight: 1, color: '#003087' }}>{n}</span>
    <span style={{ fontSize: 17, lineHeight: 1.3, color: '#4A5568' }}>{l}</span>
  </div>
)
const S2 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 22 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>What we found</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>We heard from 34 young adults</h2>
      <p style={{ fontSize: 20, color: '#6A7383', margin: 0 }}>11 in-depth interviews and 23 survey responses.</p>
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <Stat n="87%" l="would choose the plan that includes the benefit they want" />
      <Stat n="91%" l="would actually use that benefit" />
      <Stat n="61%" l="want a flexible allowance, not one fixed benefit" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7A8291', margin: 0 }}>
        What they want most <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#9AA1AC' }}>· times chosen across the 34</span>
      </p>
      {bars.map(([name, v]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 160, textAlign: 'right', fontSize: 17, color: '#16233E' }}>{name}</span>
          <div style={{ flex: 1, height: 22, background: '#DCE7F3', borderRadius: 999 }}>
            <div style={{ width: `${(v / 17) * 100}%`, height: '100%', background: '#0A6BB0', borderRadius: 999 }} />
          </div>
          <span style={{ width: 34, fontSize: 18, fontWeight: 700, color: '#16233E' }}>{v}</span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 18, lineHeight: 1.35, margin: 0 }}>
      <b style={{ color: '#003087' }}>Dental and mental health lead.</b> Most still cannot say what their plan covers, so the need is clarity and a few targeted benefits, not more coverage.
    </p>
  </div>
)

/* ---- Slide 3 · The opportunity ---- */
const OppCard = ({ h, p }) => (
  <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderTop: '5px solid #0067A8', borderRadius: 14, padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <h3 style={{ fontSize: 25, fontWeight: 700, color: '#003087', margin: 0 }}>{h}</h3>
    <p style={{ fontSize: 19, lineHeight: 1.4, color: '#4A5568', margin: 0 }}>{p}</p>
  </div>
)
const S3 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 28 }}>
    {BAR}
    <p style={pill}>The opportunity</p>
    <h2 style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, lineHeight: 1.12, color: '#16233E', margin: 0 }}>
      No insurer, Kaiser Permanente included, has built a benefits package for 18 to 30. But KP is best positioned to, because the tools already exist.
    </h2>
    <div style={{ display: 'flex', gap: 20 }}>
      <OppCard h="Flexible spending card" p="A real allowance on a card. KP already runs one, for senior members today." />
      <OppCard h="Rewards for healthy habits" p="An engine that pays members for healthy actions is already built." />
      <OppCard h="One connected system" p="Doctor, pharmacy, and records in one place. No competitor can match this." />
    </div>
    <div style={{ background: '#E7ECF7', borderLeft: '6px solid #003087', borderRadius: 12, padding: '20px 26px' }}>
      <p style={{ fontSize: 20, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
        Competitors offer the same generic extras to everyone, a dental add-on here, a small rewards program there. None is built for this group.
      </p>
    </div>
  </div>
)

/* ---- Slide 4 · The proposal ---- */
const Step = ({ n, h, p }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
    <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 999, background: '#003087', color: '#FFFFFF', fontFamily: SERIF, fontSize: 22, fontWeight: 600, textAlign: 'center', lineHeight: '40px' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 24, fontWeight: 700, color: '#003087', margin: 0 }}>{h}</h3>
      <p style={{ fontSize: 19, lineHeight: 1.35, color: '#4A5568', margin: '3px 0 0' }}>{p}</p>
    </div>
  </div>
)
const S4 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 24 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>The proposal</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>What we&rsquo;re proposing</h2>
      <p style={{ fontSize: 20, color: '#6A7383', margin: 0 }}>A package built for this age group, using what KP already has.</p>
    </div>
    <div style={{ display: 'flex', gap: 40, flex: 1 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
        <Step n="1" h="One flexible allowance" p="for the things they want, since 61% asked for flexibility" />
        <Step n="2" h="Faster, affordable mental health" p="one of their top asks" />
        <Step n="3" h="A plain-language plan guide" p="in the app: what is covered, what you will pay, and who to see" />
        <Step n="4" h="On KP&rsquo;s existing flex card" p="no new system to build" />
      </div>
      <div style={{ width: 420, background: '#0E1E3A', borderRadius: 18, padding: '30px 32px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8FA6C6' }}>PRICE TARGET</span>
        <span style={{ fontFamily: SERIF, fontSize: 54, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF' }}>~ $10 to $25</span>
        <span style={{ fontSize: 19, color: '#AEC2DD', marginBottom: 8 }}>per member, per month</span>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '1px', color: '#8FA6C6' }}>HOW WE GOT THERE</span>
        <p style={{ fontSize: 16, lineHeight: 1.4, color: '#D6E2F4', margin: '4px 0 0' }}>The $300-a-year allowance we tested is about $25 a month of value. Less than people already pay piecing these together, a gym alone is $15 to $25. A starting estimate; we will test the exact price next.</p>
      </div>
    </div>
  </div>
)

/* ---- Slide 5 · Your access (navy) ---- */
const S5 = (
  <div style={{ ...base('#0E1E3A', '#C9D6EA'), gap: 26 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#6FB0EC' }}>Your access</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}>You have access</h2>
      <p style={{ fontSize: 22, lineHeight: 1.4, margin: 0 }}><b style={{ color: '#FFFFFF' }}>You now have read-only access to our live dashboard.</b> Here is how to get in.</p>
    </div>
    <div style={{ display: 'flex', gap: 40, flex: 1 }}>
      <div style={{ flex: 1, background: '#15264A', borderRadius: 16, padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8FA6C6' }}>HOW TO GET IN</span>
        {[
          ['1', <>Go to <b style={{ color: '#FFFFFF' }}>kp-fung-saffreon.vercel.app</b></>],
          ['2', 'Choose “email me a link” and enter your KP email'],
          ['3', 'Open the one-time link we email you'],
          ['4', 'You land on a read-only dashboard'],
        ].map(([n, t], idx) => (
          <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: '#6FB0EC', width: 22 }}>{n}</span>
            <span style={{ fontSize: 20, lineHeight: 1.35 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8FA6C6' }}>WHAT YOU&rsquo;LL SEE</span>
        {['The live dashboard', 'Survey results', 'The interview log', 'Our full market research'].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#6FB0EC', fontSize: 20 }}>&rarr;</span>
            <span style={{ fontSize: 21, color: '#EAF1FB' }}>{t}</span>
          </div>
        ))}
        <p style={{ fontStyle: 'italic', fontSize: 18, color: '#9FB4D4', margin: '8px 0 0' }}>Everything is view-only. Feel free to explore.</p>
      </div>
    </div>
  </div>
)

/* ---- Slide 6 · Next steps ---- */
const NextRow = ({ n, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '22px 28px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, color: '#0A6BB0', width: 68 }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 25, fontWeight: 700, color: '#16233E', margin: 0 }}>{h}</h3>
      <p style={{ fontSize: 19, color: '#6A7383', margin: '3px 0 0' }}>{p}</p>
    </div>
  </div>
)
const S6 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 24 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}>Next steps</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>What we do next</h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
      <NextRow n="01" h="Close the current survey Sunday" p="Goal: reach 50 responses." />
      <NextRow n="02" h="Design two package options" p="Shape the findings into two concepts to compare." />
      <NextRow n="03" h="Build a survey to test the packages" p="Put both in front of users, then bring the results to you." />
    </div>
    <p style={{ fontSize: 18, color: '#8A909C', margin: 0 }}>The research is live, and it keeps growing.</p>
  </div>
)

const bet1 = {
  id: 'bet1',
  title: 'Bet #1 · Market research',
  slides: [
    { id: 'title', node: S1, notes: 'Open here. One line: this is our market research on supplemental benefits for 18-to-30s, and the case for why Kaiser Permanente is the one to build it. Keep it to 20 seconds, then move on.' },
    { id: 'found', node: S2, notes: 'The evidence slide. We talked to 34 young adults. Lead with the three numbers: they want the benefit they choose, they would use it, and most want flexibility. Then the bars: dental and mental health lead. The real theme is clarity, not more coverage.' },
    { id: 'opportunity', node: S3, notes: 'The whitespace. Nobody builds for this age group, but KP already owns the three pieces needed: the flex card, the rewards engine, and the connected system. Competitors bolt on generic extras; none is designed for this group.' },
    { id: 'proposal', node: S4, notes: 'The pitch. Four parts, all buildable on what KP already has. The price box is a starting estimate from our survey ($300 a year is about $25 a month), framed against what people already pay. Be clear we will test the exact price next.' },
    { id: 'access', node: S5, notes: 'Hand them the keys. Walk through the four steps to sign in with their KP email, and point out that it is strictly view-only. Invite them to explore the live dashboard after the call.' },
    { id: 'next', node: S6, notes: 'Close on momentum. Three concrete next steps and a date. End on: the research is live and keeps growing, so by next week we will have more responses and two package concepts.' },
  ],
}

export default bet1
