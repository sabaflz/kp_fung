// Competitive market assessment: supplemental benefits for 18-to-30-year-olds.
// Combines the team's California competitor review with national market research.

const UPDATED = 'October 2026'

function Stat({ n, l }) {
  return (
    <div className="tile"><div className="n">{n}</div><div className="l">{l}</div></div>
  )
}

function Table({ head, rows }) {
  return (
    <div className="tablewrap">
      <table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ cursor: 'default' }}>
              {r.map((c, j) => <td key={j}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Theme-safe status label for the survey-mapping table.
function St({ k }) {
  const color = k === 'Included' ? 'var(--accent)' : k === 'Partial' ? '#d97706' : 'var(--muted)'
  return <span style={{ color, fontWeight: 700, fontSize: 12.5 }}>{k}</span>
}

const GAPS = [
  ['No life-event onboarding', 'No insurer sells a "you just turned 26" experience, even though aging off a parent’s plan is a predictable, dated trigger.'],
  ['No cash-value flexibility', 'Medicare Advantage members get OTC and flex cards worth hundreds to over a thousand dollars a year. Young adults get discount portals, which feel like nothing.'],
  ['Mental-health speed not guaranteed', 'Insurers offer apps and "book in minutes" visits, but none promises time-to-therapist. Young adults pay $280 to $436 a month for BetterHelp or Talkspace, so they will pay for speed.'],
  ['Dermatology and recovery uncovered', 'Only Cigna sells virtual dermatology, and it is leaving the market. Hims & Hers proves the demand at $25 to $29 a month.'],
]

const NATIONAL = [
  ['Oscar Health', '20 states, 573 counties', '$0 virtual urgent care, $3 preferred Rx, AI assistant, app-first Care Team', 'Up to $125/yr points + savings card (2027)', 'Brand only (historically 26–35 largest group)'],
  ['UnitedHealthcare', '30 states', '$0 24/7 virtual urgent + behavioral, generics from $8, dental $1,000 max + $150 frames, One Pass gyms', '$150–$275 (sources vary)', 'None'],
  ['Aetna / CVS', 'Exited ACA individual (2026)', 'Reaches young adults via student and employer plans; AbleTo mental health; MinuteClinic', 'Attain (legacy, Apple Watch)', 'Student plans only'],
  ['Anthem / Elevance', '14 states', '$0 virtual via Sydney Health, 24/7 NurseLine, dental and vision add-ons', '$200–$300 (employer)', 'None'],
  ['Cigna / Evernorth', '11 states, exiting 1/1/2027', 'MDLIVE incl. virtual dermatology, $0–$3 generics, $25 insulin', 'Up to $325 (Take Control)', 'None'],
  ['Kaiser Permanente', 'CA + 7 regions', 'Free Calm + Headspace, ClassPass, 20% off acupuncture/chiro/massage, integrated care', 'None branded', 'None (the opening)'],
]

const CA = [
  ['Blue Shield of California', 'Dental from $14/mo, vision from $7.90/mo, dental+vision bundle from $57.20/mo, Wellvolution digital wellness at no extra cost.', 'Delivers wellness through a portfolio of digital programs, not just cash reimbursement.'],
  ['Anthem Blue Cross', '$0 virtual care on many plans via Sydney Health, 24/7 NurseLine, "Special Offers" discounts, stand-alone dental and vision.', 'Competes on access, convenience, and one easy digital entry point.'],
  ['Health Net', 'WeightWatchers from $9.75/mo, "Your Wellness" resources, care management, Community Connect (free resource navigation), behavioral health.', 'Shows the gap between giving a benefit and helping members find and use it. Community-resource navigation is the standout idea.'],
  ['Molina Healthcare', 'Mostly Medi-Cal: transportation, Healthy Rewards, Teladoc + nurse line, care coordination, Community Health Worker, medically tailored meals.', 'Good design examples for rewards and navigation, but Medi-Cal, not a commercial-plan benchmark.'],
  ['Aetna (CA)', 'Dental $14 DMO / $22–$29 PPO, vision $11–$19, fitness and coaching discounts, AbleTo 8-week mental-health program, MinuteClinic, navigation app.', 'Three plays at once: separate coverage, everyday savings, and easier access.'],
]

const CA_PRICES = [
  ['Blue Shield CA', 'Dental HMO (age 19+)', 'From $14/mo', 'Dental premium'],
  ['Blue Shield CA', 'Vision', 'From $7.90/mo', 'Vision premium'],
  ['Blue Shield CA', 'Dental + vision bundle', 'From $57.20/mo', 'Bundle'],
  ['Aetna CA', 'Dental (DMO / PPO)', '$14 / $22–$29 mo', 'Dental premium'],
  ['Aetna CA', 'Vision (Value / Select / Elite)', '$11 / $14 / $19 mo', 'Vision premium'],
  ['Health Net', 'WeightWatchers (members)', 'From $9.75/mo', 'Discounted program'],
  ['Anthem BC CA', 'Virtual care', '$0 on many plans', 'Member price'],
  ['Kaiser Permanente', 'Adult dental add-on', '$32.01/mo', 'Optional add-on'],
]

const DTC = [
  ['Primary / virtual care', 'Amazon One Medical', '$9/mo or $99/yr with Prime'],
  ['Online therapy', 'BetterHelp', '$280–$400/mo'],
  ['Online therapy', 'Talkspace', '$276–$436/mo'],
  ['Meditation', 'Headspace', '$69.99/yr'],
  ['Meditation', 'Calm', '$69.99–$79.99/yr'],
  ['Telehealth / skincare', 'Hims & Hers', 'Rx skincare from $25–$29/mo'],
  ['Fitness', 'ClassPass', 'From $19/mo'],
  ['Fitness', 'Planet Fitness', '$15–$25/mo'],
]

const MA = [
  ['Flex cards (non-medical)', '~50% of plans', '~$1,398/yr average'],
  ['OTC allowance', '66% of plans', '~$276/yr (~$23/mo)'],
  ['Fitness (SilverSneakers / One Pass)', '>90% of plans', 'Free gym network + home kit'],
  ['Dental / vision / hearing', '98–99% of plans', 'Preventive dental ~98%'],
  ['Transportation', '~24% of plans', 'Trip caps'],
]

const SURVEY = [
  ['Mental health / faster access', 'Included', 'No new category', 'Test speed vs cost vs provider choice'],
  ['Dental coverage', 'Included', 'No new category', 'Separate richer coverage from just having it'],
  ['Vision allowance', 'Included', 'No new category', 'Test larger allowance vs provider choice'],
  ['Fitness reimbursement', 'Included', 'No new category', 'Already represented'],
  ['Nutrition / dietitian', 'Included', 'No new category', 'Distinct from food assistance'],
  ['Prescription savings', 'Included', 'No new category', 'Already represented'],
  ['Transportation', 'Included', 'No new category', 'Clarify "beyond what you already get"'],
  ['Health rewards', 'Included', 'No new category', 'Later test which actions people complete'],
  ['Everyday / flexible allowance', 'Included', 'Keep (Q12)', 'Validate the $300 budget assumption'],
  ['Digital wellness programs', 'Partial', 'Test delivery model', 'Digital program vs visits vs allowance'],
  ['Health-related discounts', 'Partial', 'Test delivery model', 'Discounts vs a direct allowance'],
  ['Nurse advice line', 'Excluded', 'Optional, low priority', 'Overlaps with virtual care'],
  ['Care management / coordination', 'Excluded', 'Test if interviews support it', 'Not the same as financial guidance'],
  ['Community-resource navigation', 'Excluded', 'Most promising new concept', 'Food, housing, jobs during transitions'],
  ['Confidence using current benefits', 'Excluded', 'Add one question', 'Is the gap a new benefit or clearer access?'],
]

const STAKES = [
  '$0 24/7 virtual urgent care and virtual behavioral health',
  '$0 to $10 generic prescriptions',
  'Free Calm and Headspace',
  'Discounted gym access (ClassPass / One Pass)',
  'App-first experience with rewards for autopay and paperless',
]

const DIFF = [
  ['Guaranteed fast mental health', 'A first therapy appointment within 7 days, plus a Headspace coaching window of 180 days or more.'],
  ['Young-adult wellness wallet', '$300 to $600 a year for gym, nutrition, OTC, skin care, and recovery. In line with the ~$276 MA OTC average, well below the $1,398 flex-card average.'],
  ['Daily-habit rewards', '$150 to $300 a year for steps, sleep, a first preventive visit, and connecting a device, paid into the wallet or toward premiums.'],
  ['Virtual dermatology and skin care', 'Fill the gap Cigna leaves behind, a category young adults already pay Hims & Hers for.'],
  ['Financial guidance and navigation', 'A "first plan" coach for deductibles, HSAs, and bills, plus one easy entry point to find and use benefits.'],
  ['Injury prevention and recovery', 'Turn the 20% acupuncture/chiro/massage discount into a few covered sessions a year, or fold it into the wallet.'],
]

const TRIGGERS = ['Aging off a parent’s plan (25–26)', 'Leaving a student plan at graduation', 'A first job or gig work', 'Moving to a new city']

const SOURCES = [
  ['KFF, 2026 marketplace premiums and deductibles', 'https://www.kff.org/medicare/medicare-advantage-2026-spotlight-a-first-look-at-plan-premiums-and-benefits/'],
  ['Congressional Research Service, 2026 benchmark premiums', 'https://www.congress.gov/crs-product/R48290'],
  ['Kaiser Permanente CA 2026 rate chart', 'https://business.kaiserpermanente.org/business/broker/ca/forms/2026/nongrandfathered-rate-chart-guide-ca-en-2026.pdf'],
  ['Oscar Health investor relations (2027 products)', 'https://ir.oscarhealth.com/news-events/press-releases/detail/227/oscar-introduces-a-new-wave-of-consumer-health-products'],
  ['UnitedHealthcare incentive rewards', 'https://www.uhc.com/news-articles/benefits-and-coverage/incentive-rewards'],
  ['Cigna exits ACA market in 2027 (STAT)', 'https://www.statnews.com/2026/04/30/cigna-exits-aca-market-2027-369-thousand-people-affected/'],
  ['ATI Advisory, 2026 MA supplemental benefits', 'https://atiadvisory.com/resources/cy2026-medicare-advantage-trends-supplemental-benefits/'],
  ['RAND / Vitality Apple Watch activity study', 'https://www.prnewswire.com/news-releases/the-largest-behavior-change-study-on-physical-activity---based-on-verified-data---shows-vitality-incentives-combined-with-apple-watch-lead-to-significant-and-sustained-increases-in-activity-levels-300756428.html'],
  ['UC Berkeley SHIP fees', 'https://uhs.berkeley.edu/insurance/ship-fees-enrollment'],
  ['Blue Shield of California dental and vision', 'https://www.blueshieldca.com/en/ifp/dental-and-vision-plans'],
  ['Aetna individual dental and vision', 'https://www.aetna.com/individuals-families/buy-dental-coverage.html'],
  ['Health Net wellness programs', 'https://www.healthnet.com/en_us/health-and-wellness.html'],
]

export default function Market() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Header */}
      <div>
        <div className="eyebrow">Competitive market assessment</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Supplemental benefits for 18 to 30
        </h1>
        <p className="lede">
          What competitors offer, what it costs, and whether anyone builds for this life stage. Updated {UPDATED}. Combines our California competitor review with national market research.
        </p>
      </div>

      {/* Headline finding */}
      <div className="notice" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
        <b>The opening:</b> No major US insurer sells a supplemental package built for 18-to-30-year-olds. Every competitor offers roughly the same generic extras, and none organizes them around life events like aging off a parent&rsquo;s plan at 26. Aetna has left the individual market and Cigna leaves on January 1, 2027, so the field is shrinking.
      </div>

      <div className="tiles">
        <Stat n="0" l={'insurers with a package built for 18–30'} />
        <Stat n="$178" l="avg 2026 marketplace net premium (up 58%)" />
        <Stat n="$1,398" l="avg MA flex-card value, the model to borrow" />
        <Stat n={'$10–$25'} l="proposed KP add-on, per month" />
      </div>

      {/* Gaps */}
      <div className="card">
        <div className="hd"><h2>The opportunity: four open gaps</h2><span className="note">where KP can win</span></div>
        <div className="bd">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {GAPS.map(([t, d]) => (
              <div key={t} style={{ border: '1px solid var(--line)', borderLeft: '3px solid var(--accent)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.45 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* National landscape */}
      <div className="card">
        <div className="hd"><h2>National competitor landscape</h2><span className="note">individual-market extras, 2026</span></div>
        <div className="bd" style={{ paddingTop: 0 }}>
          <Table head={['Competitor', 'Footprint', 'Key extras', 'Rewards / yr', 'Targets 18–30?']} rows={NATIONAL} />
          <p className="lede" style={{ fontSize: 13, marginTop: 10 }}>
            Oscar has the youth brand but aims its new products at chronic conditions and menopause. UnitedHealthcare has the richest extras but no youth focus. Cigna is the only one selling virtual dermatology, and it is on the way out.
          </p>
        </div>
      </div>

      {/* California market */}
      <div className="card">
        <div className="hd"><h2>California market</h2><span className="note">our core market</span></div>
        <div className="bd" style={{ display: 'grid', gap: 12 }}>
          {CA.map(([name, offer, insight]) => (
            <div key={name} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '13px 15px' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>{offer}</div>
              <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', marginTop: 6 }}><b>Takeaway:</b> {insight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <div className="card">
          <div className="hd"><h2>California price points</h2><span className="note">reference, not apples-to-apples</span></div>
          <div className="bd" style={{ paddingTop: 0 }}>
            <Table head={['Carrier', 'Offering', 'Price', 'What it is']} rows={CA_PRICES} />
          </div>
        </div>
        <div className="card">
          <div className="hd"><h2>What young adults already pay</h2><span className="note">direct-to-consumer anchors</span></div>
          <div className="bd" style={{ paddingTop: 0 }}>
            <Table head={['Category', 'Service', 'Price']} rows={DTC} />
          </div>
        </div>
      </div>

      {/* What works */}
      <div className="card">
        <div className="hd"><h2>What is demonstrably working</h2><span className="note">evidence to borrow from</span></div>
        <div className="bd">
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, fontSize: 14, lineHeight: 1.5 }}>
            <li><b>Flexible dollars beat discounts.</b> Even as MA plans trim OTC benefits, flex cards spread to half of plans because members value choosing how to spend. One flexible wallet beats several narrow allowances.</li>
            <li><b>Wearable-linked rewards change behavior.</b> A RAND study of 400,000+ people found Vitality plus Apple Watch drove a 34% sustained rise in activity. John Hancock members can earn an Apple Watch for as little as $25.</li>
            <li><b>Low-friction daily earning wins.</b> UnitedHealthcare reports 92% of first-time participants registered and earned a reward, against an industry backdrop where only 23% use well-being programs.</li>
            <li><b>Subscription pricing sets expectations.</b> One Medical at $9/mo, ClassPass from $19, and Hims at $25 have taught young adults to judge value in single-digit-to-$25 monthly amounts.</li>
          </ul>
          <div style={{ marginTop: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Medicare Advantage as the template</div>
            <Table head={['Benefit', 'Prevalence', 'Typical value']} rows={MA} />
            <p className="lede" style={{ fontSize: 12.5, marginTop: 8 }}>KP already tailors a rich supplemental package for members over 65. The young-adult equivalent does not exist yet.</p>
          </div>
        </div>
      </div>

      {/* Survey mapping */}
      <div className="card">
        <div className="hd"><h2>How it maps to our survey</h2><span className="note">keep breadth, test delivery</span></div>
        <div className="bd" style={{ paddingTop: 0 }}>
          <Table
            head={['Offering or model', 'Status', 'Add or change?', 'Rationale']}
            rows={SURVEY.map((r) => [r[0], <St k={r[1]} key={r[1] + r[0]} />, r[2], r[3]])}
          />
          <div className="notice" style={{ marginTop: 12 }}>
            <b>The biggest gap is navigation, not more categories.</b> Competitors differentiate through how members discover, access, and use support. Our survey does not yet measure confidence in understanding and using current coverage, so we should add one benefit-navigation question and test delivery models (allowance vs covered visits vs discounts vs digital platform vs navigator vs rewards). Community-resource navigation is the most promising new concept, but validate the need before leading with it.
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="card">
        <div className="hd"><h2>Recommendation: the "KP Launch" package</h2><span className="note">a life-event product</span></div>
        <div className="bd" style={{ display: 'grid', gap: 16 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Triggered by a life event</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {TRIGGERS.map((t) => <span key={t} className="tag b">{t}</span>)}
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Table stakes (KP mostly has these)</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 5, fontSize: 13.5, lineHeight: 1.45 }}>
                {STAKES.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Differentiators (where KP can win)</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {DIFF.map(([t, d]) => (
                  <div key={t} style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                    <b>{t}.</b> <span style={{ color: 'var(--muted)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="notice" style={{ borderColor: 'var(--accent)' }}>
            <b>Price target:</b> $10 to $25 per member per month as a rider, or built into a "Launch" bronze or catastrophic design. That sits above voluntary accident coverage ($6 to $13/mo) and well below the standalone apps young adults already pay for. Validate willingness to pay in Fung user testing with a conjoint or a three-price test. De-prioritize transportation and hearing.
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="card">
        <div className="hd"><h2>Sources</h2><span className="note">key references</span></div>
        <div className="bd">
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Show source list</summary>
            <ul style={{ marginTop: 10, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13 }}>
              {SOURCES.map(([t, u]) => (
                <li key={u}><a href={u} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{t}</a></li>
              ))}
            </ul>
            <p className="lede" style={{ fontSize: 12, marginTop: 10 }}>
              Caveats: UnitedHealthcare&rsquo;s reward cap appears as $150, $250, and $275 in different sources. Oscar&rsquo;s age data is from 2019. Some consumer prices come from aggregator sites. 2027 catastrophic-plan and subsidy rules are still unsettled. Check current plan documents before quoting a specific figure.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
