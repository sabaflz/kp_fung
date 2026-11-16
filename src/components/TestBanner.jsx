import { isTestRun } from '../lib/track.js'

/* Shown on the public pages during a test run (?test=1), so nobody mistakes
   a test for the real thing or wonders why their click is not in the numbers. */
export default function TestBanner() {
  if (!isTestRun()) return null
  return (
    <>
      <div className="pk-testbar" role="status">
        <span><b>Test run.</b> This is exactly what a participant sees, but nothing you do here is recorded.</span>
        <span className="pk-testbar-actions">
          <button type="button" onClick={() => window.close()}>Close this tab</button>
        </span>
      </div>
      <div style={{ height: 42 }} aria-hidden="true" />
    </>
  )
}
