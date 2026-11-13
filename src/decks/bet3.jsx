import { useEffect, useMemo, useState } from 'react'
import { T } from './content.jsx'
import { supabase, isConfigured } from '../lib/supabase.js'
import { BENEFIT_BY_ID, analyzeResponses } from '../data/packages.js'
import { FLYER_COPY, DEFAULT_TOP } from '../pages/Bet3.jsx'

/* Bet #3 deck: this week's partner update, six slides for an eight-minute
   slot.

   Rebuilt rather than trimmed. The previous version was written before the
   landing page existed and described Bet #3 as handing someone a flyer and
   counting clicks. The actual instrument is now flyer -> landing page -> four
   ways in -> survey or email, with the timing recorded, and none of that was
   on a slide. It also still presented the 4-of-5 bar as a proposal, which the
   team settled on Nov 12.

   What is deliberately NOT here: a slide recapping all three bets. The
   partners have been on a weekly call through all of them. That slide belongs
   at the final, where the arc is the argument and the room is wider.

   Two slides read the survey table live, so the numbers on screen are whatever
   the data says when the deck is opened, filtered to the 18 to 30 bullseye the
   way the rest of the app now is. Nothing about the results is typed in. */

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

/* Shared loader. Returns the bullseye analysis plus the raw total, so a slide
   can say "x of y" without a second query. analyzeResponses defaults to the
   bullseye now, so `analysis.n` is already the 18-to-30 count. */
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
  return { analysis, total: rows.length, loaded }
}

/* ---- 1 · Title ---- */
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
        <T p="title.sub">We know which benefits people reach for. This week we stop asking them and start watching what they do.</T>
      </p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.authors">Saba Feilizadeh  ·  Derek Hernandez Alonso  ·  Alexandra Arcaro</T></span>
      <span style={{ fontSize: 19, color: '#AEC2DD' }}><T p="title.date">November 2026</T></span>
    </div>
  </div>
)

/* ---- 2 · Where Bet #2 landed, read live ---- */
function ResultsSlide() {
  const { analysis: a, total, loaded } = useSurvey()
  const top = a.benefits[0]
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
      {BAR}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <p style={pill}><T p="res.ey">Where Bet #2 landed</T></p>
          <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
            <T p="res.h2">{a.ahead.length === 0
              ? 'A direction, not yet a result'
              : 'One clear winner, the rest too close to call'}</T>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.35, color: '#6A7383', margin: '4px 0 0' }}>
            <T p="res.lede">Bet #1 gave us the shape: 5 of 5 chose an allowance they control over a fixed bundle. This is what people put in it.</T>
          </p>
        </div>
        <div style={{ flex: 'none', textAlign: 'right' }}>
          <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 600, color: '#003087', lineHeight: 1 }}>
            {loaded ? a.n : '–'}{loaded && total > a.n ? <span style={{ fontSize: 26, color: '#7A8291' }}> / {total}</span> : null}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '1.4px', color: '#7A8291' }}>AGED 18 TO 30</div>
        </div>
      </div>

      {!loaded ? (
        <p style={{ fontSize: 22, color: '#6A7383', margin: 0 }}>Loading the survey results…</p>
      ) : a.n === 0 ? (
        <p style={{ fontSize: 22, color: '#6A7383', margin: 0 }}>
          No responses in range yet. This slide fills itself in from the survey.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 240, flex: 'none' }} />
              <span style={{ flex: 1, position: 'relative', height: 15 }}>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 12.5, fontWeight: 700, letterSpacing: '1px', color: '#8A8880' }}>
                  COIN FLIP
                </span>
              </span>
              <span style={{ width: 74, flex: 'none' }} />
            </div>
            {a.benefits.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 240, flex: 'none', fontSize: 19, fontWeight: i === 0 ? 700 : 600, color: i === 0 ? '#003087' : '#4A5568' }}>
                  {BENEFIT_BY_ID[b.id].name}
                </span>
                {/* Full 0 to 100 scale with the coin-flip line marked, so the
                    chart cannot exaggerate the gap between first and second. */}
                <span style={{ flex: 1, height: 27, background: '#E7E5DE', borderRadius: 999, position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999,
                    width: `${b.mean * 100}%`, background: i === 0 ? '#003087' : '#8FA6C6',
                  }} />
                  <span style={{ position: 'absolute', left: '50%', top: -5, bottom: -5, borderLeft: '2px dashed #A9A79F' }} />
                </span>
                <span style={{ width: 74, flex: 'none', textAlign: 'right', fontSize: 20, fontWeight: 700, color: i === 0 ? '#003087' : '#6A7383', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(b.mean * 100)}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '14px 22px' }}>
            <p style={{ fontSize: 18, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
              <b style={{ color: '#8A5A17' }}>Read this carefully. </b>
              {top ? `${BENEFIT_BY_ID[top.id].name} leads at ${Math.round(top.mean * 100)}%, favored by ${top.favored} of ${top.n} people. ` : ''}
              {/* Three cases. The two-case version implied the leader cleared
                  the bar whenever nothing else did. */}
              {a.ahead.length === 0
                ? 'At this sample size nothing is clearly above a coin flip once the margin of error is counted, the leader included. '
                : a.ahead.length === 1
                  ? 'Nothing else is clearly above a coin flip once the margin of error is counted, so second and third are still open. '
                  : `Also clearly ahead: ${a.ahead.slice(1).map((b) => BENEFIT_BY_ID[b.id].name).join(', ')}. `}
              Every screen splits the six three against three, so the rates always average 50%. Below that is behind the field, not unwanted.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
const S2 = <ResultsSlide />

/* ---- 3 · The pivot ---- */
const S3 = (
  <div style={{ ...base('#0E1E3A', '#C9D6EA'), gap: 22 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#6FB0EC' }}>
        <T p="surp.ey">Why we are not just collecting more</T>
      </span>
      <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}>
        <T p="surp.h2">A category is not a benefit</T>
      </h2>
    </div>
    <p style={{ fontSize: 23, lineHeight: 1.45, margin: 0, maxWidth: 1040 }}>
      <T p="surp.lede" b="#FFFFFF">More responses would sharpen the ranking. They would not tell us **what dental, up to how much, for whom** — and that is the part you would have to build.</T>
    </p>
    <div style={{ display: 'flex', gap: 22, flex: 1 }}>
      {/* Not attributed to one partner. The feedback came out of the call, and
          naming a person implies the others contributed less. */}
      <div style={{ flex: 1, background: '#15264A', borderLeft: '6px solid #6FB0EC', borderRadius: 16, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11 }}>
        <span style={tag('#8FA6C6')}>WE ALREADY HAVE ONE SIGN OF IT</span>
        <p style={{ fontSize: 20, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>
          <T p="surp.a">Your read on our fitness benefit was that it sounded like a gym membership. We meant any spending that keeps someone moving: a climbing pass, a mobility program, classes.</T>
        </p>
      </div>
      <div style={{ flex: 1, background: '#15264A', borderLeft: '6px solid #E8B54A', borderRadius: 16, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11 }}>
        <span style={tag('#E8B54A')}>SO WE STOPPED ASKING</span>
        <p style={{ fontSize: 20, lineHeight: 1.45, color: '#EAF1FB', margin: 0 }}>
          <T p="surp.b">If the label misread for the people who sell this, it misread for our respondents. You cannot settle a wording problem by asking people about wording, so we built the real thing and we watch what they do with it.</T>
        </p>
      </div>
    </div>
  </div>
)

/* ---- 4 · What we built: the flyer and where it lands ---- */
function BuiltSlide() {
  const { analysis: a, loaded } = useSurvey()
  const top = loaded && a.n > 0 ? a.benefits.slice(0, 3).map((b) => b.id) : DEFAULT_TOP
  return (
    <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
      {BAR}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <p style={pill}><T p="built.ey">What we built</T></p>
        <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
          <T p="built.h2">An offer, and somewhere for it to go</T>
        </h2>
      </div>
      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
        {/* The flyer */}
        <div style={{ flex: 1.15, background: '#FFFFFF', border: '1px solid #E4E2DB', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#003087', padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#B9D4F5' }}>EXTRA BENEFITS FOR THE LIFE YOU ACTUALLY HAVE</div>
            <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1, marginTop: 6 }}>$300 a year. Spend it your way.</div>
          </div>
          <div style={{ display: 'flex', flex: 1 }}>
            {top.map((id, i) => (
              <div key={id} style={{ flex: 1, padding: '14px 14px', borderLeft: i ? '1px solid #E4E2DB' : 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '1.1px', color: '#0078B3', textTransform: 'uppercase' }}>{FLYER_COPY[id].kicker}</div>
                <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: '#14213D', lineHeight: 1.25 }}>{FLYER_COPY[id].line}</div>
                {/* The detail lines belong here. Without them the card is a
                    headline over empty space, which does not read as a flyer. */}
                <ul style={{ margin: '2px 0 0', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {FLYER_COPY[id].points.map((pt) => (
                    <li key={pt} style={{ fontSize: 12.5, lineHeight: 1.35, color: '#55607A' }}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid #EDEBE4', fontSize: 14, color: '#8A909C' }}>
            <T p="built.flyfoot">Three benefits, straight from the survey. Carries no KP name and no price.</T>
          </div>
        </div>

        {/* Where it lands */}
        <div style={{ flex: 1, ...card, gap: 11 }}>
          <span style={tag('#0067A8')}>THE PAGE IT LINKS TO</span>
          <p style={{ fontSize: 17.5, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
            <T p="built.land">Not the survey. A page with four ways in, so we see what someone wanted to know before they committed to anything.</T>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {['What is included', 'Who could get it', 'How it would work', 'Is this real?'].map((c) => (
              <span key={c} style={{ fontSize: 13.5, fontWeight: 600, color: '#0A6BB0', background: '#EEF3FB', border: '1px solid #D3E0F4', borderRadius: 999, padding: '5px 11px' }}>{c}</span>
            ))}
          </div>
          <div style={{ marginTop: 8, paddingTop: 11, borderTop: '1px solid #EDEBE4' }}>
            <span style={tag('#9AA1AD')}>WHAT WE CAN SEE</span>
            <p style={{ fontSize: 17, lineHeight: 1.4, color: '#16233E', margin: '5px 0 0', fontWeight: 600 }}>
              <T p="built.see">Arrivals, which way in they opened, how long before they moved, and whether they started the survey or left an email. Per platform.</T>
            </p>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 15.5, lineHeight: 1.4, color: '#8A909C', margin: 0 }}>
        <T p="built.foot">No IP address, no cookie, nothing that follows anyone. The page says in its own words that this does not exist yet and nobody is selling it.</T>
      </p>
    </div>
  )
}
const S4 = <BuiltSlide />

/* ---- 5 · The bet, and how we run it ---- */
const S5 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 15 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <p style={pill}><T p="b3.ey">Bet #3</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="b3.h2">Does it make anyone move?</T>
      </h2>
    </div>
    <div style={{ flex: 'none', background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '7px solid #003087', borderRadius: 14, padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={tag('#7A8291')}>HYPOTHESIS · AGREED BY THE TEAM, NOV 12</span>
      <p style={{ fontSize: 21, lineHeight: 1.4, color: '#16233E', margin: 0 }}>
        <T p="b3.hyp" b="#003087">Shown the flyer with a clear next step, **at least 4 of 5 bullseye users will click through within one minute**, unprompted. We count the click, not whether they say they like it.</T>
      </p>
    </div>
    <div style={{ display: 'flex', gap: 18, flex: 1 }}>
      <div style={{ ...card, flex: 1, borderTop: '5px solid #0067A8' }}>
        <span style={tag('#0067A8')}>TRACK 1 · THE BET</span>
        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: '#16233E', margin: 0 }}><T p="b3.t1h">Five people, watched</T></h3>
        <p style={{ fontSize: 17, lineHeight: 1.38, color: '#4A5568', margin: 0 }}>
          <T p="b3.t1p">Five bullseye users we sourced ourselves. We hand it over, say nothing beyond take a look, and record what happens.</T>
        </p>
        <p style={{ fontSize: 16.5, lineHeight: 1.35, color: '#16233E', margin: 'auto 0 0', fontWeight: 700 }}>
          <T p="b3.t1f">This is what Bet #3\u2019s 4-of-5 bar judges.</T>
        </p>
      </div>
      <div style={{ ...card, flex: 1, borderTop: '5px solid #8A5A17' }}>
        <span style={tag('#8A5A17')}>TRACK 2 · THE VOLUME</span>
        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: '#16233E', margin: 0 }}><T p="b3.t2h">Posted in public</T></h3>
        <p style={{ fontSize: 17, lineHeight: 1.38, color: '#4A5568', margin: 0 }}>
          <T p="b3.t2p">The same flyer on Instagram, Discord, Snapchat and Facebook, each with its own link so every platform gets its own row.</T>
        </p>
        <p style={{ fontSize: 16.5, lineHeight: 1.35, color: '#16233E', margin: 'auto 0 0', fontWeight: 700 }}>
          <T p="b3.t2f">Reach and a click rate. It cannot prove anyone was in range.</T>
        </p>
      </div>
    </div>
    <div style={{ background: '#F5E7D4', border: '1px solid #EAD3AE', borderRadius: 12, padding: '13px 22px' }}>
      <p style={{ fontSize: 17.5, lineHeight: 1.4, color: '#7A5A2A', margin: 0 }}>
        <T p="b3.warn" b="#8A5A17">**Two tracks, reported apart.** A social click-through rate is normally one to three percent, so holding a public post to the 4-of-5 bar would make a good flyer look like a failure. And if nobody moves: they look, say it is nice, and do nothing. That is the most useful thing we could learn before anyone spends money building it.</T>
      </p>
    </div>
  </div>
)

/* ---- 6 · The ask ---- */
const AskRow = ({ n, hp, pp, h, p }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#FFFFFF', border: '1px solid #E4E2DB', borderLeft: '6px solid #003087', borderRadius: 12, padding: '16px 24px' }}>
    <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: '#0A6BB0', width: 40, flex: 'none' }}>{n}</span>
    <div>
      <h3 style={{ fontSize: 21, fontWeight: 700, color: '#16233E', margin: 0 }}><T p={hp}>{h}</T></h3>
      <p style={{ fontSize: 17.5, color: '#6A7383', margin: '2px 0 0', lineHeight: 1.38 }}><T p={pp}>{p}</T></p>
    </div>
  </div>
)
const S6 = (
  <div style={{ ...base('#F5F4F0', '#4A5568'), gap: 16 }}>
    {BAR}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <p style={pill}><T p="ask.ey">What we need from you</T></p>
      <h2 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.06, color: '#16233E', margin: '2px 0 0' }}>
        <T p="ask.h2">Three things that change what we do next</T>
      </h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1, justifyContent: 'center' }}>
      <AskRow n="1" hp="ask.r1h" h="Tell us what the package cannot claim" pp="ask.r1p"
        p="This goes to real people this week. It carries no KP name, but the idea is yours. Anything in it a plan could never actually do, we would rather hear now than after five hundred people have read it." />
      <AskRow n="2" hp="ask.r2h" h="Make one benefit specific with us" pp="ask.r2p"
        p="We can rank dental. We cannot say what dental. Fifteen minutes with whoever knows the benefit design would save us weeks of guessing at amounts and limits." />
      <AskRow n="3" hp="ask.r3h" h="Does this already exist as KP rewards?" pp="ask.r3p"
        p="Rewards gives members flexible dollars and names Gen Z. If that is the same mechanism, we should be building on it rather than beside it, and we would rather find out now than at the final." />
    </div>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#003087', borderRadius: 12, padding: '16px 24px' }}>
      <span style={{ color: '#FFFFFF', fontSize: 19 }}>▶</span>
      <p style={{ fontSize: 19, lineHeight: 1.35, color: '#FFFFFF', margin: 0 }}>
        <T p="ask.ask" b="#FFFFFF">**Next time we meet we will have numbers:** how many people saw it, how many moved, and which part of the offer they opened first.</T>
      </p>
    </div>
  </div>
)

const bet3 = {
  id: 'bet3',
  title: 'Bet #3 · Does anyone actually move?',
  slides: [
    /* SPOKEN SCRIPT, roughly eight minutes. Say it in your own words; the
       point of writing it out is the order and the landing lines, not the
       wording. Times are a budget, not a target. */

    { id: 'title', node: S1, notes:
      "[20 sec] We know which benefits people reach for. What we do not know is whether any of it would make someone actually do something. That is this week.\n\nThree minutes on what Bet #2 says, two on what we built, three asks for you at the end.\n\nDo NOT recap the three bets. They have been on every call. Save that for the final." },

    { id: 'results', node: S2, notes:
      "[90 sec] Bet #1 told us the shape: five out of five chose an allowance they control over a fixed bundle. Bet #2 asked what goes in it.\n\nRead the counts off the screen, they are live and they move. Then: dental leads. The average person picked the package with dental in it X percent of the time. Second is Y. After that it is tight.\n\nTwo things to say plainly before anyone asks.\n\nOne: this is a small sample. Dental leads, but the gap to second is inside the noise. We are calling it a direction, not a result.\n\nTwo: our own bar for this bet was four out of five people favouring the same benefit, and we have not hit it. Say that yourself. It is on the dashboard and it is better coming from you.\n\nThen the quirk, because it changes how they read every number: each screen puts three benefits against three, so the six rates average fifty by construction. A category under fifty is behind the field, not unwanted." },

    { id: 'pivot', node: S3, notes:
      "[75 sec] Here is what we kept running into. More responses would sharpen that ranking. They would not tell us what dental means.\n\nSomeone picking dental might mean cleanings, might mean help with a filling, might mean a crown they have been putting off for two years. Those are three different products, and you cannot build from the word.\n\nYour feedback on the fitness benefit is what made this concrete for us. The wording read as a gym membership. We meant anything that keeps someone moving: classes, a climbing pass, a mobility program. If it read that way to you, it read that way to the people we surveyed.\n\nLand on this line: you cannot fix a wording problem by asking people about wording. So we stopped asking and built the thing.\n\nCredit the room, never one person by name." },

    { id: 'built', node: S4, notes:
      "[90 sec] Have /plan already open in a tab. Show the real page, not this miniature.\n\nTwo pieces. A flyer: three hundred dollars a year, and the three benefits on it come straight from the survey, so if the ranking moves the flyer moves with it. It gives examples rather than categories, cleanings and help with fillings, therapy sessions, everyday things like cold medicine and first aid. Say plainly that we invented those examples and they are exactly where we need their eyes.\n\nThen the part to point at. The flyer does not link to the survey. It links to a page with four ways in: what is included, who could get it, how it would work, is this real. Which one somebody opens first tells us what they needed to know before they would go further. That is the question we could not ask them directly.\n\nWe can see arrivals, which way in they chose, how long before they moved, and whether they started the survey or left an email, per platform.\n\nGet ahead of the privacy question rather than waiting for it: no IP address, no cookie, nothing that follows anyone anywhere. The page says in its own words that this does not exist and nobody is selling it, and there is no KP branding on any of it." },

    { id: 'bet3', node: S5, notes:
      "[90 sec] The bar is agreed, so say we set the bar at, not we were thinking.\n\nShown the flyer with a clear next step, at least four of five target users click through within a minute, unprompted. We count the click, not whether they say they like it.\n\nTwo tracks, reported apart. Track one is the bet: five people in range we recruit ourselves, we hand it over, say take a look, and say nothing else. That is the group the four-of-five judges. Track two is public, Instagram, Discord, Snapchat, Facebook, each with its own link, which gives reach and a click rate per platform but cannot prove anyone who clicked was in range.\n\nSay the one-to-three-percent figure yourself, before a partner assumes a low social number means the flyer flopped.\n\nClose on the honest limit, because a partner who hears you welcome a bad result trusts the good one more: a click does not prove anyone would buy this, it proves the offer is worth thirty seconds. And if people look, say it is nice and do nothing, that is the cheapest thing we could possibly learn right now." },

    { id: 'ask', node: S6, notes:
      "[90 sec] Three asks, each one changing what we do in the next two weeks. Do not let this turn into a wish list, and do not phrase them as questions.\n\nFirst: tell us what this cannot claim. It goes out this week. We have written things about covered services and access that we are not qualified to promise, and we would rather hear it now than after five hundred people have read it.\n\nSecond: fifteen minutes with whoever knows benefit design, starting with dental. What is a realistic amount, what are the limits, what does a person actually get. That one conversation is the difference between a ranked category and something you could build. Ask for a name in the room and offer to do the scheduling. Do not leave with we will look into it.\n\nThird, the uncomfortable one, so ask it plainly. How does this sit next to KP rewards? We have seen flexible dollars and Gen Z in your own material. If that is the same mechanism we would rather find out now and build on it than present it beside it at the final.\n\nClose on what they get next time: the five-person test, the public response, and which part of the offer people opened first. Then one line, starting with the flyer claims, because that one is blocking us." },
  ],
}

export default bet3
