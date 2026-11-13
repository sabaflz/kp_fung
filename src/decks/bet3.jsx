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
        <T p="title.h1">{'Would anyone\nactually take it?'}</T>
      </h1>
      <p style={{ fontSize: 27, lineHeight: 1.4, color: '#AEC2DD', margin: 0 }}>
        <T p="title.sub">We know which benefits people reach for. Now we put the package in front of them and watch what they do.</T>
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
      <Step n="BET #3 · NEXT" hp="where.s3h" h="Whether anyone acts on it" pp="where.s3p"
        p="Liking a package is cheap. We show the flyer and count who takes a real next step."
        fp="where.s3f" f="Evidence that the interest is real, not polite." />
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
            {/* The headline follows the data. Hardcoding "one clear winner"
                meant it could contradict the caveat box directly below it. */}
            <T p="res.h2">{a.ahead.length === 0
              ? 'A direction, not yet a result'
              : 'One clear winner, the rest too close to call'}</T>
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
              {/* Three cases, because the two-case version overclaimed. Saying
                  "nothing ELSE is above a coin flip" implies the leader is,
                  which at this sample size is not yet true of anything. */}
              {a.ahead.length === 0
                ? 'At this sample size nothing is clearly above a coin flip once the margin of error is counted, the leader included. Treat the order as a direction to follow, not a result to act on. '
                : a.ahead.length === 1
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
          {/* Deliberately not attributed to one person. The feedback came out
              of the partner call as a whole, and naming a single partner
              implies the others contributed less. */}
          <T p="surp.tamer">Your read on it was that our fitness benefit sounded like a gym membership. We meant any spending that keeps someone moving: a climbing pass, a mobility program, classes.</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#15264A', borderLeft: '6px solid #E8B54A', borderRadius: 16, padding: '26px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#E8B54A' }}>WHAT THAT TELLS US</span>
        <p style={{ fontSize: 21, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>
          <T p="surp.lesson">If the label misread for you, it misread for our respondents. We cannot settle that by asking people to rate labels, so Bet #3 puts the whole thing in front of them and counts what they do.</T>
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
            ['fly.p2', 'Bet #1 found the barrier was not wanting these benefits, it was not understanding them. This says what you get in thirty seconds.'],
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
        <T p="b3.h2">Does the flyer make people act?</T>
      </h2>
    </div>
    <div style={{ flex: 'none', background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '7px solid #003087', borderRadius: 16, padding: '22px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color: '#7A8291' }}>HYPOTHESIS</span>
      <p style={{ fontSize: 22, lineHeight: 1.45, color: '#16233E', margin: 0 }}>
        <T p="b3.hyp" b="#003087">Shown the flyer with a clear next step, **at least 4 of 5 bullseye users will click through to find out more within one minute**, unprompted. We count the click, not whether they say they like it.</T>
      </p>
    </div>
    <div style={{ flex: 1, display: 'flex', gap: 20 }}>
      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14, padding: '20px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#1A7F4B' }}>IF WE ARE RIGHT</span>
        <p style={{ fontSize: 19, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
          <T p="b3.right">4 of 5 click through on their own, and the landing page shows what they wanted to know first. That tells us which part of the offer is doing the work.</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14, padding: '20px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.6px', color: '#B4232A' }}>IF WE ARE WRONG</span>
        <p style={{ fontSize: 19, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
          <T p="b3.wrong">They look, say it is nice, and do nothing. That is the most useful result we could get before anyone spends money on building it.</T>
        </p>
      </div>
    </div>
    {/* The "how we ask" and "how we do not ask" boxes used to sit here and
        repeated what the next slide says properly, so the same caveat landed
        twice in an eight-minute slot. One line carries the discipline; the
        method belongs on the slide about the method. */}
    <p style={{ fontSize: 19, lineHeight: 1.4, color: '#6A7383', margin: 0 }}>
      <T p="b3.note">No prompting and no prices. A click is a real choice; agreeing with a student holding a laptop is not.</T>
    </p>
  </div>
)

/* ---- Slide 7 · How we run it: two tracks, kept apart ---- */
const Track = ({ tag, tagColor, hp, h, pp, p, np, nn, f }) => (
  <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E4E2DB', borderTop: '5px solid ' + tagColor,
    borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '1.6px', color: tagColor }}>{tag}</span>
    <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: '#16233E', margin: 0, lineHeight: 1.15 }}><T p={hp}>{h}</T></h3>
    <p style={{ fontSize: 18, lineHeight: 1.4, color: '#4A5568', margin: 0 }}><T p={pp}>{p}</T></p>
    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #EDEBE4', display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '1.4px', color: '#9AA1AD' }}>{nn}</span>
      <p style={{ fontSize: 17, lineHeight: 1.35, color: '#16233E', margin: 0, fontWeight: 600 }}><T p={np}>{f}</T></p>
    </div>
  </div>
)
const S7 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}><T p="run.ey">How we run it</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="run.h2">Two tracks, reported separately</T>
      </h2>
    </div>
    <div style={{ display: 'flex', gap: 20, flex: 1 }}>
      <Track tag="TRACK 1 · THE BET" tagColor="#0067A8"
        hp="run.t1h" h="Five people, watched"
        pp="run.t1p" p="We hand the flyer to five bullseye users we sourced ourselves, say nothing beyond take a look, and record whether they click through."
        nn="PASSES IF" np="run.t1f" f="4 of 5 click within a minute." />
      <Track tag="TRACK 2 · THE VOLUME" tagColor="#8A5A17"
        hp="run.t2h" h="Posted in public"
        pp="run.t2p" p="The same flyer goes out on Instagram, Discord, Snapchat and Facebook, each with its own link, so every platform gets its own row."
        nn="GIVES US" np="run.t2f" f="A click and sign-up rate per platform." />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '16px 24px' }}>
      <p style={{ fontSize: 18.5, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
        <T p="run.warn" b="#8A5A17">**Why we keep them apart.** A click-through rate on social is normally one to three percent. Judging a public post against the 4-of-5 bar would make a good flyer look like a failure, and we are not going to report it that way.</T>
      </p>
    </div>
  </div>
)

/* ---- Slide 8 · What we need from you ---- */
const AskRow = ({ n, hp, pp, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '18px 26px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: '#0A6BB0', width: 44, flex: 'none' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#16233E', margin: 0 }}><T p={hp}>{h}</T></h3>
      <p style={{ fontSize: 18, color: '#6A7383', margin: '2px 0 0' }}><T p={pp}>{p}</T></p>
    </div>
  </div>
)
const S8 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 20 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={pill}><T p="ask.ey">What we need from you</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="ask.h2">Three things that change what we do next</T>
      </h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
      {/* Rewritten. These used to be costing questions, which do not help a
          team that has deliberately decided not to price anything yet. Each
          one below changes something we do in the next two weeks. */}
      <AskRow n="1" hp="ask.r1h" h="Tell us what the package cannot claim" pp="ask.r1p"
        p="This goes to real people this week. It carries no KP name, but the idea is yours. Anything in it a plan could never actually do, we would rather hear now than after five hundred people have read it." />
      <AskRow n="2" hp="ask.r2h" h="Make one benefit specific with us" pp="ask.r2p"
        p="We can rank dental. We cannot say what dental. Fifteen minutes with whoever knows the benefit design would save us weeks of guessing at amounts and limits." />
      <AskRow n="3" hp="ask.r3h" h="Does this already exist as KP rewards?" pp="ask.r3p"
        p="Rewards gives members flexible dollars and names Gen Z. If that is the same mechanism, we should be building on it rather than beside it, and we would rather find out now than at the final." />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#003087', borderRadius: 12, padding: '18px 26px' }}>
      <span style={{ color: '#FFFFFF', fontSize: 20 }}>▶</span>
      <p style={{ fontSize: 20, lineHeight: 1.35, color: '#FFFFFF', margin: 0 }}>
        <T p="ask.ask" b="#FFFFFF">**Next time we meet we will have numbers:** how many people saw the flyer, how many acted, and which part of the offer they opened first.</T>
      </p>
    </div>
  </div>
)

const bet3 = {
  id: 'bet3',
  title: 'Bet #3 · From categories to specifics',
  slides: [
    { id: 'title', node: S1, notes: 'One line to open: we know which benefits people reach for, and now we are testing whether the package makes anyone actually move. Keep it to fifteen seconds.' },
    { id: 'where', node: S2, notes: 'The three bets in order, so the partners see this is one line of reasoning rather than three separate studies. Bet #1 gave us the wallet, Bet #2 the ranking, Bet #3 asks whether anyone acts on it. Land on the last card: liking a package is cheap.' },
    { id: 'results', node: S3, notes: 'This chart reads the live survey, so whatever is on screen is current. Say the sample size out loud before the ranking, and do not oversell: dental is the one clear signal, the rest are inside the margin of error. The amber box is the honest caveat, read it rather than skipping it.' },
    { id: 'surprise', node: S4, notes: 'Credit the room, not one person: say "your feedback on the fitness benefit" rather than naming a partner, so nobody hears that only one of them was useful. The point is that if the label misread for the people who sell this, it misread for our respondents. This is the bridge into Bet #3: we cannot settle a labelling problem by asking people about labels, so we show them the real thing and count clicks.' },
    { id: 'flyer', node: S5, notes: 'Open /bets/3 in a browser tab and show the real flyer here rather than this miniature, which only has room for the headlines. Point out that the three benefits come from the survey and will change if the ranking does. Say plainly that the dollar amounts inside each benefit are placeholders.' },
    { id: 'bet3', node: S6, notes: 'The hypothesis, which the three of us agreed on Nov 12, so say "we set the bar at" rather than "we were thinking". David flagged that "would you pay for this" is a leading question, so Bet #3 counts a click rather than an opinion. Two tracks, and keep them separate when reporting: five supervised users is the bet, and the public posting gives volume but cannot prove anyone was bullseye. A click-through rate on social is normally one to three percent, so never hold that against the 4-of-5 bar.' },
    { id: 'run', node: S7, notes: 'The part to be most careful about out loud. Track 1 is the actual bet: five people we sourced, watched, 4 of 5 clicking inside a minute. Track 2 is the public posting, which gives volume but cannot prove anyone was in the age range. Say the one-to-three-percent figure yourself before a partner assumes a low social number means the flyer failed.' },
    { id: 'ask', node: S8, notes: 'Three asks, and every one of them changes something we do in the next fortnight, so do not let this become a wish list. One: the flyer goes out this week, so any objection to what it claims has to come now. Two: name a person we can get fifteen minutes with about what dental should actually cover, and get a date before the call ends. Three: the KP rewards question is the uncomfortable one, so ask it plainly, because if rewards is the same mechanism we would rather rebuild on it now than be told at the final. Close by saying what they get next time: real numbers, not another plan.' },
  ],
}

export default bet3
