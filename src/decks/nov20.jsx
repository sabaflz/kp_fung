import { useEffect, useMemo, useState } from 'react'
import { T } from './content.jsx'
import { supabase, isConfigured } from '../lib/supabase.js'
import { R2_BY_ID, analyzeResponses } from '../data/packages.js'
import { FlyerSheet, FLYER_TOP } from '../pages/Bet3.jsx'

/* Partner update for Friday Nov 20: seven slides, about eight minutes.

   This is the first call with all three partners since Bet #3 ran, so it has
   to carry the result, the flyer rebuild, what we did with their feedback and
   the ad test, in that order. The result goes first and is stated flat: the
   bar was 4 of 5 and we got 0 of 5.

   No partner is named on a slide. The feedback slide says "you said" so the
   credit goes to the room.

   Slide 3 renders the real flyer component and slide 5 reads the survey table
   live, so neither can drift from the site. */

const SANS = "'Inter', system-ui, sans-serif"
const SERIF = "'Newsreader', Georgia, serif"
const BAR = <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 12, background: '#003087' }} />

const pill = {
  fontSize: 15, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
  color: '#FFFFFF', background: '#003087', padding: '7px 15px', borderRadius: 999, alignSelf: 'flex-start', margin: 0,
}
const base = (bg, fg) => ({
  width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
  fontFamily: SANS, background: bg, color: fg, padding: '54px 68px', display: 'flex', flexDirection: 'column',
})
const card = {
  background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14,
  padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 9,
}
const tag = (c) => ({ fontSize: 13.5, fontWeight: 700, letterSpacing: '1.6px', color: c })
const h2 = { fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }
const Head = ({ ey, eyp, h, hp }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <p style={pill}><T p={eyp}>{ey}</T></p>
    <h2 style={h2}><T p={hp}>{h}</T></h2>
  </div>
)

/* ---- 1 · Title ---- */
const S1 = (
  <div style={{ ...base('#0E1E3A', '#EEF3FA'), justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2B4A73', paddingBottom: 14 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#6FB0EC' }}><T p="title.ey1">FUNG × KP BENEFITS</T></span>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#8FA6C6' }}><T p="title.ey2">PARTNER UPDATE</T></span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 78, fontWeight: 600, lineHeight: 1.04, color: '#FFFFFF', margin: 0 }}>
        <T p="title.h1">{'Nobody clicked.\nSo we rebuilt the flyer.'}</T>
      </h1>
      <p style={{ fontSize: 27, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>
        <T p="title.sub">What Bet #3 showed, what we changed because of it and because of you, and how we test it with strangers next week.</T>
      </p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.authors">Saba Feilizadeh  ·  Derek Hernandez Alonso  ·  Alexandra Arcaro</T></span>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.date">November 20, 2026</T></span>
    </div>
  </div>
)

/* ---- 2 · The result ---- */
const Tally = ({ n, np, t, tp, c }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: c, width: 34, flex: 'none', textAlign: 'center' }}><T p={np}>{n}</T></span>
    <span style={{ fontSize: 18.5, lineHeight: 1.35, color: '#16233E' }}><T p={tp}>{t}</T></span>
  </div>
)
const S2 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
    {BAR}
    <Head eyp="res.ey" ey="What Bet #3 showed" hp="res.h2" h="We set a bar of 4 of 5. We got 0." />
    <div style={{ display: 'flex', gap: 20, flex: 1 }}>
      <div style={{ width: 372, flex: 'none', background: '#0E1E3A', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={tag('#6FB0EC')}>CLICKED WITHIN A MINUTE, UNPROMPTED</span>
        <div style={{ fontFamily: SERIF, fontWeight: 600, color: '#FFFFFF', lineHeight: 1 }}>
          <span style={{ fontSize: 124 }}><T p="res.big">0</T></span>
          <span style={{ fontSize: 44, color: '#8FA6C6' }}><T p="res.of"> of 5</T></span>
        </div>
        <p style={{ fontSize: 17.5, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>
          <T p="res.bigsub">Five people aged 18 to 30, handed the flyer with nothing more than “take a look”.</T>
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, gap: 10 }}>
          <span style={tag('#7A8291')}>WHAT THE FIVE DID</span>
          <Tally n="1" np="res.n1" c="#0A6BB0" tp="res.t1" t="found the button without help, but only after the first minute" />
          <Tally n="2" np="res.n2" c="#8A5A17" tp="res.t2" t="reached the page once we pointed the button out" />
          <Tally n="2" np="res.n3" c="#9AA1AD" tp="res.t3" t="never got past the flyer" />
        </div>
        <div style={{ ...card, flex: 1, borderLeft: '7px solid #003087', justifyContent: 'center' }}>
          <span style={tag('#0067A8')}>WHY</span>
          <p style={{ fontSize: 19.5, lineHeight: 1.42, color: '#16233E', margin: 0 }}>
            <T p="res.why" b="#003087">**It read as a printed poster.** People looked at it the way you look at something on a wall. The one button sat below the bottom of the screen, so most of them never saw there was anything to press.</T>
          </p>
        </div>
      </div>
    </div>
    <div style={{ background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '13px 22px' }}>
      <p style={{ fontSize: 17.5, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
        <T p="res.read" b="#8A5A17">**Not supported, and we are not moving the bar.** What failed is the way in, so this result cannot tell us yet whether people want what is behind it. That is the question the next test is built to answer.</T>
      </p>
    </div>
  </div>
)

/* ---- 3 · The flyer now: the real component, scaled down ---- */
const FLY_W = 816
const FLY_SCALE = 0.5
const Change = ({ n, h, hp, p, pp }) => (
  <div style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 18, padding: '15px 22px', flex: 1 }}>
    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: '#0A6BB0', width: 30, flex: 'none' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 20.5, fontWeight: 700, color: '#16233E', margin: 0 }}><T p={hp}>{h}</T></h3>
      <p style={{ fontSize: 16.5, color: '#6A7383', margin: '3px 0 0', lineHeight: 1.38 }}><T p={pp}>{p}</T></p>
    </div>
  </div>
)
function FlyerSlide() {
  // Measured, so the frame hugs the flyer whatever height its copy gives it.
  const [h, setH] = useState(1040)
  const measure = (el) => { if (el && el.offsetHeight && el.offsetHeight !== h) setH(el.offsetHeight) }
  const scale = Math.min(FLY_SCALE, 548 / h)
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
      {BAR}
      <Head eyp="fly.ey" ey="What we changed" hp="fly.h2" h="A flyer that looks like something you can press" />
      <div style={{ display: 'flex', gap: 26, flex: 1, minHeight: 0 }}>
        <div style={{ width: FLY_W * scale, height: h * scale, flex: 'none', borderRadius: 10, boxShadow: '0 6px 22px rgba(14,30,58,.16)', overflow: 'hidden', alignSelf: 'center' }}>
          <div ref={measure} style={{ width: FLY_W, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
            <FlyerSheet top={FLYER_TOP} onBenefit={() => {}}
              cta={<span className="fl-cta-btn">See what is included <span aria-hidden="true">&rarr;</span></span>} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <Change n="1" hp="fly.c1h" h="All of it on one screen" pp="fly.c1p"
            p="The whole flyer now fits whatever it is opened on, phone or laptop, with nothing cut and nothing to scroll for. The button can no longer be below the screen." />
          <Change n="2" hp="fly.c2h" h="One button, and it looks like one" pp="fly.c2p"
            p="A single clear call to action that reacts when you hover or press, instead of a line of text with a link in it." />
          <Change n="3" hp="fly.c3h" h="Every benefit is a way in" pp="fly.c3p"
            p="Each of the three benefits can be tapped and says so. Four things to press instead of one, and we record which one each person chose and how long it took." />
          <p style={{ fontSize: 15.5, lineHeight: 1.4, color: '#8A909C', margin: '2px 0 0' }}>
            <T p="fly.foot">Still no KP name, no price, and a line at the top saying this benefit does not exist yet.</T>
          </p>
        </div>
      </div>
    </div>
  )
}
const S3 = <FlyerSlide />

/* ---- 4 · Partner feedback, and what became of it ---- */
const Pair = ({ k, said, did }) => (
  <div style={{ display: 'flex', alignItems: 'stretch', background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 12, overflow: 'hidden', flex: 1 }}>
    <div style={{ width: 400, flex: 'none', background: '#EEF3FB', padding: '13px 22px', display: 'flex', alignItems: 'center' }}>
      <p style={{ fontSize: 18.5, lineHeight: 1.36, fontWeight: 600, color: '#16233E', margin: 0 }}><T p={`fb.s${k}`}>{said}</T></p>
    </div>
    <div style={{ flex: 1, padding: '13px 24px', display: 'flex', alignItems: 'center' }}>
      <p style={{ fontSize: 17.5, lineHeight: 1.38, color: '#4A5568', margin: 0 }}><T p={`fb.d${k}`} b="#003087">{did}</T></p>
    </div>
  </div>
)
const S4 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 14 }}>
    {BAR}
    <Head eyp="fb.ey" ey="Your feedback" hp="fb.h2" h="What you told us, and what we did with it" />
    <div style={{ display: 'flex', padding: '0 0 0 22px' }}>
      <span style={{ ...tag('#0067A8'), width: 400, flex: 'none' }}>YOU SAID</span>
      <span style={tag('#7A8291')}>WE DID</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <Pair k="1" said="Dental and vision already come with most plans."
        did="**Removed everywhere:** flyer, page and survey. A second survey round tests physical therapy, rides to care and dermatology in their place." />
      <Pair k="2" said="Frame it around wellbeing, not a list of services."
        did="The flyer now leads with **everyday health**, then **mental wellbeing** and **physical wellbeing**." />
      <Pair k="3" said="Name real things people would spend it on."
        did="Concrete examples under each heading, such as classes, coaching, sleep support and mindfulness apps. **Your full list is on the flyer before any ad runs.**" />
      <Pair k="4" said="No hard limit, but keep it to five or fewer."
        did="The package is the **top three from the data, plus at most two more.** Anything the data does not support stays out." />
    </div>
  </div>
)

/* ---- 5 · Round 2 of the survey, read live ---- */
function useRounds() {
  const [rows, setRows] = useState([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let alive = true
    if (!isConfigured) { setLoaded(true); return }
    supabase.from('bet2_responses').select('age, choices')
      .then(({ data, error }) => { if (!alive) return; if (!error) setRows(data || []); setLoaded(true) })
      .catch(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [])
  const r1 = useMemo(() => analyzeResponses(rows, { round: 1 }), [rows])
  const r2 = useMemo(() => analyzeResponses(rows, { round: 2 }), [rows])
  return { r1, r2, loaded }
}
function RoundSlide() {
  const { r1, r2: a, loaded } = useRounds()
  const top = a.benefits[0]
  const thin = a.n < 10
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 13 }}>
      {BAR}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
        <Head eyp="r2.ey" ey="Survey, round 2" hp="r2.h2" h="Seven benefits, without dental and vision" />
        <div style={{ flex: 'none', textAlign: 'right' }}>
          <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 600, color: '#003087', lineHeight: 1 }}>{loaded ? a.n : '–'}</div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.4px', color: '#7A8291' }}>AGED 18 TO 30, SO FAR</div>
        </div>
      </div>
      {!loaded ? (
        <p style={{ fontSize: 22, color: '#6A7383', margin: 0 }}>Loading the survey results…</p>
      ) : a.n === 0 ? (
        <div style={{ ...card, flex: 1, justifyContent: 'center' }}>
          <p style={{ fontSize: 22, lineHeight: 1.45, color: '#16233E', margin: 0 }}>
            No round 2 responses in range yet. Round 1 closed with {r1.n}. This slide fills itself in as people answer.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, justifyContent: 'center' }}>
            {a.benefits.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 250, flex: 'none', fontSize: 18.5, fontWeight: i < 3 ? 700 : 600, color: i < 3 ? '#003087' : '#4A5568' }}>
                  {R2_BY_ID[b.id].name}
                </span>
                {/* Full 0 to 100 scale with the coin-flip line marked, so the
                    chart cannot exaggerate a gap. */}
                <span style={{ flex: 1, height: 24, background: '#E7E5DE', borderRadius: 999, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, width: `${b.mean * 100}%`, background: i < 3 ? '#003087' : '#8FA6C6' }} />
                  <span style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, borderLeft: '2px dashed #A9A79F' }} />
                </span>
                <span style={{ width: 64, flex: 'none', textAlign: 'right', fontSize: 19, fontWeight: 700, color: i < 3 ? '#003087' : '#6A7383', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(b.mean * 100)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '12px 22px' }}>
            <p style={{ fontSize: 17, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
              <b style={{ color: '#8A5A17' }}>How to read it. </b>
              The percentage is how often a person picked the package with that benefit in it; the dashed line is a coin flip.{' '}
              {top ? `${R2_BY_ID[top.id].name} leads at ${Math.round(top.mean * 100)}%. ` : ''}
              {thin
                ? `With ${a.n} ${a.n === 1 ? 'person' : 'people'} this is an early direction, not a ranking. `
                : a.ahead.length === 0
                  ? 'Nothing is clearly above a coin flip yet once the margin of error is counted. '
                  : `Clearly ahead: ${a.ahead.map((b) => R2_BY_ID[b.id].name).join(', ')}. `}
              Rounds are never mixed: round 1 had dental and vision in it and closed with {r1.n} people.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
const S5 = <RoundSlide />

/* ---- 6 · The click test ---- */
const Step = ({ k, d, t }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderLeft: '3px solid #6FB0EC' }}>
    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.2px', color: '#6FB0EC' }}><T p={`ad.d${k}`}>{d}</T></span>
    <span style={{ fontSize: 16.5, lineHeight: 1.35, color: '#EAF1FB' }}><T p={`ad.t${k}`}>{t}</T></span>
  </div>
)
const Ad = ({ k, label, lead, c }) => (
  <div style={{ flex: 1, background: '#15264A', borderTop: `5px solid ${c}`, borderRadius: 14, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 7 }}>
    <span style={tag(c)}><T p={`ad.l${k}`}>{label}</T></span>
    <p style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, lineHeight: 1.2, color: '#FFFFFF', margin: 0 }}><T p={`ad.h${k}`}>{lead}</T></p>
    <p style={{ fontSize: 16, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}><T p={`ad.p${k}`}>Same picture, same wording, same audience, same budget.</T></p>
  </div>
)
const S6 = (
  <div style={{ ...base('#0E1E3A', '#C9D6EA'), gap: 16 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#6FB0EC' }}><T p="ad.ey">Next: a test with strangers</T></span>
      <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}><T p="ad.h2">Two ads, one difference</T></h2>
    </div>
    <p style={{ fontSize: 21, lineHeight: 1.42, margin: 0, maxWidth: 1080 }}>
      <T p="ad.lede" b="#FFFFFF">Everyone we have tested with so far knew one of us. A small paid ad on Instagram and Facebook puts the flyer in front of **18 to 30 year olds who have never met us**, and a click costs them nothing to withhold.</T>
    </p>
    <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
      <Ad k="a" c="#6FB0EC" label="AD A" lead="Leads with the top benefit from the survey" />
      <div style={{ alignSelf: 'center', fontFamily: SERIF, fontSize: 26, color: '#8FA6C6' }}>vs</div>
      <Ad k="b" c="#E8B54A" label="AD B" lead="Leads with the second" />
    </div>
    <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
      <Step k="1" d="FRI NOV 20" t="Pick the two leads. Your go-ahead." />
      <Step k="2" d="NOV 21 TO 23" t="Build both ads, submit for review." />
      <Step k="3" d="NOV 24 TO 30" t="Ads run for seven days." />
      <Step k="4" d="TUE DEC 1" t="Read the numbers." />
      <Step k="5" d="TUE DEC 8" t="Final showcase." />
    </div>
    <p style={{ fontSize: 16, lineHeight: 1.4, color: '#8FA6C6', margin: 0 }}>
      <T p="ad.foot">What it tells us: which benefit pulls people in, and how many keep going to the page, the survey or an email. What it cannot tell us: whether anyone would pay.</T>
    </p>
  </div>
)

/* ---- 7 · What we need ---- */
const AskRow = ({ n, hp, pp, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '16px 24px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: '#0A6BB0', width: 40, flex: 'none' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 21, fontWeight: 700, color: '#16233E', margin: 0 }}><T p={hp}>{h}</T></h3>
      <p style={{ fontSize: 17.5, color: '#6A7383', margin: '2px 0 0', lineHeight: 1.38 }}><T p={pp}>{p}</T></p>
    </div>
  </div>
)
const S7 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
    {BAR}
    <Head eyp="ask.ey" ey="What we need from you" hp="ask.h2" h="Three things, and the first has a date" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1, justifyContent: 'center' }}>
      <AskRow n="1" hp="ask.r1h" h="A yes, or changes, on the final flyer and the two ads" pp="ask.r1p"
        p="We send both right after this call. The ads go in for review on Monday, Nov 23, so anything you want changed we need by then." />
      <AskRow n="2" hp="ask.r2h" h="Anything we should stay away from" pp="ask.r2p"
        p="Nothing carries the KP name. Even so, if there is a word, a claim or an example you would not want near a public ad, tell us now rather than after it has run." />
      <AskRow n="3" hp="ask.r3h" h="Your read on the final story before Dec 8" pp="ask.r3p"
        p="We will share a draft of the final presentation ahead of the showcase and would value one round of comments on it." />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#003087', borderRadius: 12, padding: '16px 24px' }}>
      <span style={{ color: '#FFFFFF', fontSize: 19 }}>▶</span>
      <p style={{ fontSize: 19, lineHeight: 1.35, color: '#FFFFFF', margin: 0 }}>
        <T p="ask.bar" b="#FFFFFF">**By Dec 1 we will know something we have not known all semester:** what people who owe us nothing do when they see this.</T>
      </p>
    </div>
  </div>
)

const nov20 = {
  id: 'nov20',
  title: 'Partner update · Nov 20',
  slides: [
    /* SPOKEN SCRIPT. Only the words said out loud. Slide 5 reads live data,
       so its notes leave the numbers to be read off the screen. */

    { id: 'title', node: S1, notes:
      "Thanks everyone, and it's really good to have all three of you here, because a lot has happened since we last had the full group.\n\nThe short version is that we ran Bet 3, it missed, and the way it missed was clear enough that we knew exactly what to fix. So I'll show you the result, what we changed, what we did with the feedback you sent this week, and then the test we'd like to start on Tuesday." },

    { id: 'result', node: S2, notes:
      "So, Bet 3. We said that if we handed someone the flyer with a clear next step, at least four out of five would click through within a minute without us saying anything.\n\nWe got zero out of five.\n\nHere's what the five actually did. One person found the button on their own, but it took about a minute and a half. Two got to the page only after we pointed the button out. And two never got past the flyer at all.\n\nWhen we went back through the sessions, the reason was the same every time. It looked like a printed poster. People read it the way you'd read something pinned to a wall, and the only button was below the bottom of the screen, so most of them had no idea there was anything to press.\n\nI want to be straight about how we're reading that. The bet is not supported, and we're not going to move the bar to make it look better. But what failed was the way in. If people can't see the door, we can't learn whether they want what's behind it. So that's what we fixed first." },

    { id: 'flyer', node: S3, notes:
      "This is the flyer as it is today, and it's the live one, not a screenshot.\n\nThree things changed. First, the whole flyer now fits on one screen, whatever you open it on. Phone, laptop, it scales so nothing is cut off and there's nothing to scroll for. The button can't hide below the screen anymore.\n\nSecond, there's one button and it looks like a button. It responds when you hover or press it.\n\nThird, each of the three benefits is something you can tap, and it says so. So there are four ways in instead of one, and we record which one each person pressed and how long it took them.\n\nWhat hasn't changed: there's no KP name on it, there's no price, and it says at the top that this benefit doesn't exist yet." },

    { id: 'feedback', node: S4, notes:
      "A lot of what's on that flyer came from you, so I want to close the loop on it.\n\nYou told us dental and vision already come with most plans, so they don't belong in a supplemental package. We took them out of everything, the flyer, the page and the survey. And we started a second round of the survey that tests physical therapy, rides to care and dermatology in their place.\n\nYou suggested framing it around wellbeing rather than a list of services. So the flyer leads with everyday health, which has been our strongest idea from the start, and then mental wellbeing and physical wellbeing.\n\nYou gave us real examples of what people would spend this on, things like classes, coaching, sleep support, mindfulness apps. Those are going onto the flyer before any ad runs, and you'll see that final version from us right after this call.\n\nAnd on how many benefits can go in, the answer we got was no hard limit, but keep it to five or fewer. So our rule is the top three from the data, plus at most two more if the data supports them." },

    { id: 'round2', node: S5, notes:
      "This is the second round of the survey, and this slide reads the data live.\n\nSame method as before. Each screen shows two packages worth the same amount and people pick one. The percentage is how often someone chose the package with that benefit in it, and the dashed line is a coin flip.\n\nYou can see how many people in our age range have answered so far in the top corner. It's still early, so I'd read this as a direction and not a ranking yet.\n\nWe're keeping the two rounds completely separate. Round one had dental and vision in it, so mixing them would be comparing two different questions.\n\nThe top of this list is what decides which benefits lead the two ads, which is the next slide." },

    { id: 'ads', node: S6, notes:
      "So here's what we'd like to do next, and it's the part we need your go-ahead on.\n\nEveryone we've tested with so far knew one of us. That's a real weakness, because people are polite to people they know. So we want to put this in front of strangers.\n\nThe plan is two small ads on Instagram and Facebook, aimed at 18 to 30 year olds. The two ads are identical in every way except one: which benefit they lead with. One leads with the top benefit from the survey, the other with the second. Same picture, same wording, same audience, same budget. That way if one does better, we know why.\n\nOn timing: today we pick the two leads. Over the weekend we build both ads, and they go in for review on Monday. They run for seven days, the 24th through the 30th. We read the numbers on December 1st, and that goes straight into the final showcase on the 8th.\n\nWhat this can tell us is which benefit pulls people in, and how many of them keep going, to the page, to the survey, or to leaving an email. What it can't tell us is whether anyone would pay for it, and we're not going to claim that it does." },

    { id: 'asks', node: S7, notes:
      "So three things from you, and only the first one is urgent.\n\nFirst, a yes or your changes on the final flyer and the two ads. We'll send both right after this call. They need to go in for review on Monday, so anything you'd like changed, we'd need it by then.\n\nSecond, anything you'd want us to stay away from. Nothing carries the KP name. But if there's a word or a claim or an example you wouldn't want anywhere near a public ad, we'd much rather hear it today than after it's been running for a week.\n\nAnd third, before December 8th we'll share a draft of the final presentation, and we'd really value one round of comments from you on it.\n\nBy December 1st we'll know something we haven't known all semester, which is what people who owe us nothing actually do when they see this. Thank you. We'd love to hear your thoughts." },
  ],
}

export default nov20
