import { useEffect, useMemo, useState } from 'react'
import { T } from './content.jsx'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFIT_BY_ID, analyzeResponses } from '../data/packages.js'
import { FLYER_COPY, DEFAULT_TOP } from '../pages/Bet3.jsx'

/* Bet #3 deck: this week's partner update. Two slides read the survey table
   directly, so the numbers on screen are whatever the data says when the deck
   is opened. Nothing about the results is typed in. */

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

/* Shared loader for the two data-driven slides. */
function useSurvey() {
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
  const analysis = useMemo(() => analyzeResponses(rows), [rows])
  return { analysis, loaded }
}

/* ---- Slide 1 · Title (navy) ---- */
const S1 = (
  <div style={{ ...base('#0E1E3A', '#EEF3FA'), justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2B4A73', paddingBottom: 14 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#6FB0EC' }}><T p="title.ey1">FUNG × KP BENEFITS</T></span>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', color: '#8FA6C6' }}><T p="title.ey2">BET #3</T></span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 78, fontWeight: 600, lineHeight: 1.04, color: '#FFFFFF', margin: 0 }}>
        <T p="title.h1">{'From categories\nto specifics'}</T>
      </h1>
      <p style={{ fontSize: 27, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>
        <T p="title.sub">We know which benefits people reach for. Now we find out what they actually need inside them.</T>
      </p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.authors">Saba Feilizadeh  ·  Derek Hernandez Alonso  ·  Alexandra Arcaro</T></span>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.date">November 2026</T></span>
    </div>
  </div>
)

/* ---- Slide 2 · Where we are ---- */
const Step = ({ n, hp, h, pp, p, fp, f, done }) => (
  <div style={{
    flex: 1, background: done ? '#FFFFFF' : '#EEF3FB', border: '1px solid ' + (done ? '#E4E2DB' : '#D3E0F4'),
    borderTop: '5px solid ' + (done ? '#0067A8' : '#8A5A17'), borderRadius: 14,
    padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
  }}>
    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.8px', color: done ? '#0067A8' : '#8A5A17' }}>{n}</span>
    <h3 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: '#16233E', margin: 0, lineHeight: 1.15 }}><T p={hp}>{h}</T></h3>
    <p style={{ fontSize: 18, lineHeight: 1.4, color: '#4A5568', margin: 0 }}><T p={pp}>{p}</T></p>
    <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid ' + (done ? '#EDEBE4' : '#DCE6F5') }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '1.4px', color: '#9AA1AD' }}>
        {done ? 'WHAT IT GAVE US' : 'WHAT WE NEED'}
      </span>
      <p style={{ fontSize: 17.5, lineHeight: 1.35, color: '#16233E', margin: '6px 0 0', fontWeight: 600 }}><T p={fp}>{f}</T></p>
    </div>
  </div>
)
const S2 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 24 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}><T p="where.ey">Where we are</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="where.h2">Each bet narrows the question</T>
      </h2>
    </div>
    <div style={{ display: 'flex', gap: 20, flex: 1, alignItems: 'stretch' }}>
      <Step done n="BET #1 · DONE" hp="where.s1h" h="A wallet, not a bundle" pp="where.s1p"
        p="5 of 5 chose a flexible $300 allowance they control over a fixed set of benefits."
        fp="where.s1f" f="The shape of the product." />
      <Step done n="BET #2 · CLOSING" hp="where.s2h" h="Which benefits fill it" pp="where.s2p"
        p="A balanced head-to-head survey ranking six benefits against each other."
        fp="where.s2f" f="A ranking, and one clear leader." />
      <Step n="BET #3 · NEXT" hp="where.s3h" h="What goes inside each one" pp="where.s3p"
        p="A category is not a benefit. We need the specific thing a person needed and could not get."
        fp="where.s3f" f="Wording we can put on a flyer and defend." />
    </div>
  </div>
)

/* ---- Slide 3 · Bet #2 result, read live from the survey ---- */
function ResultsSlide() {
  const { analysis: a, loaded } = useSurvey()
  const top = a.benefits[0]
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
      {BAR}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={pill}><T p="res.ey">Bet #2 result</T></p>
          <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
            <T p="res.h2">One clear winner, the rest too close to call</T>
          </h2>
        </div>
        <div style={{ flex: 'none', textAlign: 'right' }}>
          <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 600, color: '#003087', lineHeight: 1 }}>
            {loaded ? a.n : '–'}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '1.5px', color: '#7A8291' }}>RESPONSES</div>
        </div>
      </div>

      {!loaded ? (
        <p style={{ fontSize: 22, color: '#6A7383', margin: 0 }}>Loading the survey results…</p>
      ) : a.n === 0 ? (
        <p style={{ fontSize: 22, color: '#6A7383', margin: 0 }}>
          No responses yet. This slide fills itself in from the survey, so it will show the real ranking once people answer.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 250, flex: 'none' }} />
              <span style={{ flex: 1, position: 'relative', height: 16 }}>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: '#8A8880' }}>
                  COIN FLIP
                </span>
              </span>
              <span style={{ width: 80, flex: 'none' }} />
            </div>
            {a.benefits.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 250, flex: 'none', fontSize: 20, fontWeight: i === 0 ? 700 : 600, color: i === 0 ? '#003087' : '#4A5568' }}>
                  {BENEFIT_BY_ID[b.id].name}
                </span>
                {/* Full 0 to 100 scale with the coin-flip line marked, so the
                    chart cannot exaggerate the gap between first and second. */}
                <span style={{ flex: 1, height: 30, background: '#E7E5DE', borderRadius: 999, position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                    width: `${b.mean * 100}%`, background: i === 0 ? '#003087' : '#8FA6C6',
                  }} />
                  <span style={{ position: 'absolute', left: '50%', top: -5, bottom: -5, borderLeft: '2px dashed #A9A79F' }} />
                </span>
                <span style={{ width: 80, flex: 'none', textAlign: 'right', fontSize: 21, fontWeight: 700, color: i === 0 ? '#003087' : '#6A7383', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(b.mean * 100)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '16px 24px' }}>
            <p style={{ fontSize: 19, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
              <b style={{ color: '#8A5A17' }}>Read this carefully. </b>
              {top ? `${BENEFIT_BY_ID[top.id].name} leads at ${Math.round(top.mean * 100)}%, favored by ${top.favored} of ${top.n} people. ` : ''}
              {a.ahead.length <= 1
                ? 'Nothing else is clearly above a coin flip once the margin of error is counted, so second and third place are still open. '
                : `Also clearly ahead: ${a.ahead.slice(1).map((b) => BENEFIT_BY_ID[b.id].name).join(', ')}. `}
              Every screen splits the six three against three, so the rates always average 50%. A benefit below that is behind the field, not unwanted.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
const S3 = <ResultsSlide />

/* ---- Slide 4 · What surprised us (navy) ---- */
const S4 = (
  <div style={{ ...base('#0E1E3A', '#C9D6EA'), gap: 24 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#6FB0EC' }}>
        <T p="surp.ey">What surprised us</T>
      </span>
      <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}>
        <T p="surp.h2">A category is not a benefit</T>
      </h2>
    </div>
    <p style={{ fontSize: 24, lineHeight: 1.45, margin: 0, maxWidth: 1060 }}>
      <T p="surp.lede" b="#FFFFFF">We predicted dental plus fitness or everyday health. Dental led. **Neither partner benefit separated from the pack.**</T>
    </p>
    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
      <div style={{ flex: 1, background: '#15264A', borderLeft: '6px solid #6FB0EC', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#8FA6C6' }}>YOUR FEEDBACK, NOV 7</span>
        <p style={{ fontSize: 21, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>
          <T p="surp.tamer">Tamer read our fitness benefit as a gym membership. We meant any spending that keeps someone moving: a climbing pass, a mobility program, classes.</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#15264A', borderLeft: '6px solid #E8B54A', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#E8B54A' }}>WHAT THAT TELLS US</span>
        <p style={{ fontSize: 21, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>
          <T p="surp.lesson">If the label misread for you, it misread for our respondents. A benefit may be losing because of how we named it, not because nobody wants it. That is Bet #3.</T>
        </p>
      </div>
    </div>
  </div>
)

/* ---- Slide 5 · The flyer, built from the live ranking ---- */
function FlyerSlide() {
  const { analysis: a, loaded } = useSurvey()
  const top = loaded && a.n > 0 ? a.benefits.slice(0, 3).map((b) => b.id) : DEFAULT_TOP
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
      {BAR}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={pill}><T p="fly.ey">The package, as a flyer</T></p>
        <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
          <T p="fly.h2">Version 1, built from the survey</T>
        </h2>
      </div>
      <div style={{ display: 'flex', gap: 26, flex: 1 }}>
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#003087', padding: '22px 26px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.6px', color: '#B9D4F5' }}>EXTRA BENEFITS FOR THE LIFE YOU ACTUALLY HAVE</div>
            <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1, marginTop: 8 }}>$300 a year. Spend it your way.</div>
          </div>
          <div style={{ display: 'flex', flex: 1 }}>
            {top.map((id, i) => (
              <div key={id} style={{ flex: 1, padding: '18px 18px', borderLeft: i ? '1px solid #E4E2DB' : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '1.2px', color: '#0078B3', textTransform: 'uppercase' }}>{FLYER_COPY[id].kicker}</div>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: '#14213D', lineHeight: 1.25 }}>{FLYER_COPY[id].line}</div>
                <ul style={{ margin: '2px 0 0', paddingLeft: 15, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {FLYER_COPY[id].points.map((pt) => (
                    <li key={pt} style={{ fontSize: 13.5, lineHeight: 1.35, color: '#55607A' }}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
          {[
            ['fly.p1', 'The three benefits are whichever three are leading the survey right now. If the ranking changes, the flyer changes.'],
            ['fly.p2', 'It answers the comprehension problem from Bet #1: say what you get, in plain words, in thirty seconds.'],
            ['fly.p3', 'No price on it, on purpose. The benefits are not final, and asking what someone would pay leads them.'],
          ].map(([path, t]) => (
            <div key={path} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 999, background: '#0067A8', marginTop: 8 }} />
              <p style={{ fontSize: 19, lineHeight: 1.4, color: '#16233E', margin: 0 }}><T p={path}>{t}</T></p>
            </div>
          ))}
          <p style={{ fontSize: 16, lineHeight: 1.4, color: '#8A909C', margin: 0 }}>
            <T p="fly.foot">Dollar amounts and limits inside each benefit are placeholders. Those are the numbers we need from you.</T>
          </p>
        </div>
      </div>
    </div>
  )
}
const S5 = <FlyerSlide />

/* ---- Slide 6 · Bet #3 ---- */
const S6 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 22 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}><T p="b3.ey">Bet #3</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="b3.h2">What people needed, and could not get</T>
      </h2>
    </div>
    <div style={{ flex: 'none', background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '7px solid #003087', borderRadius: 16, padding: '22px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#7A8291' }}>HYPOTHESIS</span>
      <p style={{ fontSize: 22, lineHeight: 1.45, color: '#16233E', margin: 0 }}>
        <T p="b3.hyp" b="#003087">When at least 5 bullseye users describe the last time they needed care in our leading benefits, at least **4 of 5 will name the same specific need** inside a benefit, concrete enough to write onto the flyer.</T>
      </p>
    </div>
    <div style={{ flex: 1, display: 'flex', gap: 20 }}>
      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14, padding: '20px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#1A7F4B' }}>IF WE ARE RIGHT</span>
        <p style={{ fontSize: 19, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
          <T p="b3.right">The same specific need shows up unprompted across people, and they paid for it or put it off. That sentence goes on the flyer.</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14, padding: '20px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#B4232A' }}>IF WE ARE WRONG</span>
        <p style={{ fontSize: 19, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
          <T p="b3.wrong">Needs scatter inside a benefit, which tells us to keep it flexible rather than spell it out. That is a finding, not a failure.</T>
        </p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1, background: '#EEF3FB', border: '1px solid #D3E0F4', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#0067A8' }}>HOW WE ASK</span>
        <p style={{ fontSize: 18.5, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
          <T p="b3.ask">“Tell me about the last time you needed dental care. What happened? What did you do? What got in the way?”</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#8A5A17' }}>HOW WE DO NOT ASK</span>
        <p style={{ fontSize: 18.5, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
          <T p="b3.avoid">Nothing starts with “would you.” No prices, and we never describe our package before they have answered. We count what people did, not what they say they might do.</T>
        </p>
      </div>
    </div>
  </div>
)

/* ---- Slide 7 · What we need from you ---- */
const AskRow = ({ n, hp, pp, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '18px 26px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: '#0A6BB0', width: 44, flex: 'none' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#16233E', margin: 0 }}><T p={hp}>{h}</T></h3>
      <p style={{ fontSize: 18, color: '#6A7383', margin: '2px 0 0' }}><T p={pp}>{p}</T></p>
    </div>
  </div>
)
const S7 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}><T p="ask.ey">What we need from you</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="ask.h2">Three things only KP can answer</T>
      </h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
      <AskRow n="1" hp="ask.r1h" h="What do the add-ons cost today?" pp="ask.r1p" p="Monthly premiums for adult dental and vision in California. We could not find them anywhere public." />
      <AskRow n="2" hp="ask.r2h" h="Is there an allowance under 65?" pp="ask.r2p" p="The over-the-counter allowance appears on Medicare plans. Does anything like it exist for younger members?" />
      <AskRow n="3" hp="ask.r3h" h="How does this sit next to KP rewards?" pp="ask.r3p" p="Rewards already gives members flexible dollars and names Gen Z. Same mechanism with a different funding source, or a separate product?" />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#003087', borderRadius: 12, padding: '18px 26px' }}>
      <span style={{ color: '#FFFFFF', fontSize: 20 }}>▶</span>
      <p style={{ fontSize: 20, lineHeight: 1.35, color: '#FFFFFF', margin: 0 }}>
        <T p="ask.ask" b="#FFFFFF">**The ask:** react to the flyer wording, and tell us which specifics inside each benefit are realistic for KP to offer.</T>
      </p>
    </div>
  </div>
)

const bet3 = {
  id: 'bet3',
  title: 'Bet #3 · From categories to specifics',
  slides: [
    { id: 'title', node: S1, notes: 'One line to open: we know which benefits people reach for first, and we are now finding out what they need inside them. Keep it to fifteen seconds.' },
    { id: 'where', node: S2, notes: 'The three bets in order, so the partners see this is one line of reasoning rather than three separate studies. Bet #1 gave us the wallet, Bet #2 the ranking, Bet #3 the contents. Land on the last card: a category is not a benefit.' },
    { id: 'results', node: S3, notes: 'This chart reads the live survey, so whatever is on screen is current. Say the sample size out loud before the ranking, and do not oversell: dental is the one clear signal, the rest are inside the margin of error. The amber box is the honest caveat, read it rather than skipping it.' },
    { id: 'surprise', node: S4, notes: 'Credit Tamer directly. He read our fitness benefit as a gym membership, and if the label misread for him it misread for our respondents. This is the bridge into Bet #3: a benefit may be losing on its name, not on its substance.' },
    { id: 'flyer', node: S5, notes: 'Open /bets/3 in a browser tab and show the real flyer here rather than this miniature, which only has room for the headlines. Point out that the three benefits come from the survey and will change if the ranking does. Say plainly that the dollar amounts inside each benefit are placeholders.' },
    { id: 'bet3', node: S6, notes: 'The hypothesis and, just as important, how we ask. David flagged that "would you pay for this" is a leading question, so Bet #3 is built on what people actually did the last time they needed care. The right-hand box is the discipline we are holding ourselves to.' },
    { id: 'ask', node: S7, notes: 'Close on the three questions. These are the ones we could not answer from public pages, and they block the costed version of the package. Then the ask: react to the flyer wording and tell us which specifics are realistic.' },
  ],
}

export default bet3
