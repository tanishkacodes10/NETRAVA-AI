
import Navbar from './Navbar'
import { getUser, go } from './auth'

const EXAMS = [
  {
    key: 'college_computer_science',
    title: 'Computer Science',
    desc: 'Algorithms, data structures, operating systems and core CS concepts.',
    icon: 'CS',
    category: 'TECHNICAL',
  },
  {
    key: 'computer_security',
    title: 'Computer Security',
    desc: 'Cryptography, network security and secure computing.',
    icon: 'SEC',
    category: 'CYBERSECURITY',
  },
  {
    key: 'machine_learning',
    title: 'Machine Learning',
    desc: 'ML concepts, model selection and performance evaluation.',
    icon: 'ML',
    category: 'ARTIFICIAL INTELLIGENCE',
  },
  {
    key: 'science_basic',
    title: 'General Science',
    desc: 'Test your knowledge of fundamental science concepts.',
    icon: 'GS',
    category: 'GENERAL',
  },
]

export default function Dashboard() {
  const user = getUser()

  function startExam(exam) {
    // Check whether the student is logged in
    const currentUser = getUser()

    if (!currentUser) {
      go('login')
      return
    }

    // Save selected exam and open exam page
    sessionStorage.setItem('es_category', exam.key)
    go('exam')
  }

  return (
    <>
      <Navbar />

      <main className="portal">
        <section className="portal-welcome">
          <div className="welcome-copy">
            <span className="eyebrow">STUDENT ASSESSMENT PORTAL</span>

            <h1>
              Welcome back, <span>{user?.name || 'Student'}</span>
            </h1>

            <p>
              Choose your assessment, prepare your workspace, and give it
              your best. Your progress starts here.
            </p>
          </div>

          <div className="welcome-badge">
            <span className="welcome-badge-icon">✓</span>
            <div>
              <strong>Secure assessments</strong>
              <small>AI-assisted proctoring</small>
            </div>
          </div>
        </section>

        <section className="assessment-summary">
          <div className="summary-item">
            <span className="summary-symbol">04</span>
            <div>
              <strong>Assessments</strong>
              <small>Available to you</small>
            </div>
          </div>

          <div className="summary-item">
            <span className="summary-symbol">10</span>
            <div>
              <strong>Questions each</strong>
              <small>Per assessment</small>
            </div>
          </div>

          <div className="summary-item">
            <span className="summary-symbol">10m</span>
            <div>
              <strong>Time limit</strong>
              <small>For each assessment</small>
            </div>
          </div>
        </section>

        <section className="assessment-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR LEARNING SPACE</span>
              <h2>Available assessments</h2>
              <p>Select a subject to begin your assessment.</p>
            </div>

            <span className="available-count">04 AVAILABLE</span>
          </div>

          <div className="assessment-grid">
            {EXAMS.map((exam) => (
              <article className="assessment-card" key={exam.key}>
                <div className="assessment-card-top">
                  <div className="subject-icon">{exam.icon}</div>

                  <span className="proctor-tag">
                    <span className="status-dot"></span>
                    Proctored
                  </span>
                </div>

                <span className="subject-category">{exam.category}</span>

                <h3>{exam.title}</h3>
                <p className="assessment-description">{exam.desc}</p>

                <div className="assessment-meta">
                  <span>◷ 10 minutes</span>
                  <span>▤ 10 questions</span>
                </div>

                <button
                  type="button"
                  className="assessment-start"
                  onClick={() => startExam(exam)}
                >
                  Start assessment
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="exam-notice">
          <div className="notice-icon">i</div>
          <div>
            <strong>Before you begin</strong>
            <p>
              Allow camera access and enable fullscreen when prompted.
              Ensure you have a stable internet connection before starting.
            </p>
          </div>
        </section>

        <footer className="portal-footer">
          <span>Smart Proctoring Browser</span>
          <span>Secure assessments · Fair evaluation</span>
        </footer>
      </main>
    </>
  )
}
