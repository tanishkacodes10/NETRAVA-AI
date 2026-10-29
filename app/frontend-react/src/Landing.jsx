import Navbar from './Navbar'
import { go, getUser } from './auth'

const FEATURES = [
  ['📷', 'Live Face Monitoring', 'Detects missing face or multiple faces during the exam, right in the browser.'],
  ['🖥️', 'Tab & Fullscreen Tracking', 'Tab switches and fullscreen exits are caught instantly and counted.'],
  ['⚠️', 'Smart Warnings', 'Clear on-screen warnings, with automatic submission after repeated violations.'],
  ['🧾', 'Activity Logs', 'Every event is stored with a timestamp for transparent review.'],
  ['⏱️', 'Timed Exams', 'Countdown timer with automatic submission when time ends.'],
  ['🔒', 'Privacy First', 'Video stays in the browser. Nothing is uploaded or recorded.'],
]
const STEPS = [
  ['Sign up', 'Create your account in a few seconds.'],
  ['System check', 'Allow camera access and go fullscreen.'],
  ['Take the exam', 'Answer MCQs while the proctor watches for violations.'],
  ['Get your report', 'See your score and a transparent integrity report.'],
]

export default function Landing() {
  const user = getUser()
  return (
    <>
      <Navbar />
      <div className="wrap">
        <div className="hero">
          <h2>Online exams you can <span className="grad">trust</span></h2>
          <p>ExamShield AI is a smart proctoring browser that monitors face presence, tab switching and fullscreen exits, with transparent warnings and detailed logs.</p>
          <div className="hero-btns">
            <button className="primary" onClick={() => go(user ? 'dashboard' : 'signup')}>
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
            {!user && <button className="outline" onClick={() => go('login')}>I have an account</button>}
          </div>
        </div>

        <div className="section">
          <h2>Features</h2>
          <div className="grid">
            {FEATURES.map(([ic, t, d]) => (
              <div className="feat" key={t}>
                <div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>How it works</h2>
          <div className="grid">
            {STEPS.map(([t, d], i) => (
              <div className="feat" key={t}>
                <div className="step-n">{i + 1}</div><h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="note">
            <b>Honest limits:</b> face detection checks whether a face is present, not who the person is. Proctoring signals are meant to flag suspicious behaviour for human review, not to prove cheating.
          </div>
        </div>
        <div className="footer">ExamShield AI · Deviathon DEV_102</div>
      </div>
    </>
  )
}