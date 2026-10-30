import { useEffect, useRef, useState, useCallback } from 'react'
import Navbar from './Navbar'
import { go } from './auth'

const QUESTION_BANK = {
  college_computer_science: [
    { question: 'Which language is primarily used to structure web pages?', options: ['Python', 'HTML', 'C++', 'SQL'], answer: 1 },
    { question: 'Which data structure follows FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
    { question: 'Which data structure follows LIFO?', options: ['Queue', 'Array', 'Stack', 'Graph'], answer: 2 },
    { question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1) always'], answer: 1 },
    { question: 'Which one is a programming language?', options: ['HTTP', 'HTML', 'Java', 'CSS'], answer: 2 },
    { question: 'Which SQL command retrieves data?', options: ['GET', 'SELECT', 'OPEN', 'FETCHFILE'], answer: 1 },
    { question: 'Which OOP concept allows a class to inherit properties?', options: ['Inheritance', 'Compilation', 'Iteration', 'Indexing'], answer: 0 },
    { question: 'Which part of the computer executes instructions?', options: ['Monitor', 'CPU', 'Keyboard', 'Mouse'], answer: 1 },
    { question: 'Which of these is a loop in Java?', options: ['repeatonly', 'iterateall', 'for', 'repeatif'], answer: 2 },
    { question: 'What does DBMS stand for?', options: ['Data Backup Memory System', 'Database Management System', 'Digital Base Machine Software', 'Data Binary Management Service'], answer: 1 },
  ],
  computer_security: [
    { question: 'What is the main purpose of encryption?', options: ['Delete data', 'Protect data confidentiality', 'Increase screen brightness', 'Compress every file'], answer: 1 },
    { question: 'Which is an example of multi-factor authentication?', options: ['Password only', 'Username only', 'Password plus an authenticator code', 'A public profile'], answer: 2 },
    { question: 'What does HTTPS help protect?', options: ['Data in transit', 'A broken monitor', 'All malware automatically', 'A forgotten password'], answer: 0 },
    { question: 'What is phishing?', options: ['A backup method', 'A deceptive attempt to steal information', 'A programming language', 'A network cable'], answer: 1 },
    { question: 'Which is the strongest password practice?', options: ['Use 123456', 'Reuse one password everywhere', 'Use a unique long password', 'Share passwords with friends'], answer: 2 },
    { question: 'What does a firewall do?', options: ['Filters network traffic', 'Creates presentations', 'Repairs hardware', 'Designs websites'], answer: 0 },
    { question: 'What is malware?', options: ['A type of monitor', 'Malicious software', 'A safe password manager', 'A backup drive'], answer: 1 },
    { question: 'Why are software updates important?', options: ['They always remove files', 'They can fix security vulnerabilities', 'They disable all security', 'They replace passwords automatically'], answer: 1 },
    { question: 'What is the principle of least privilege?', options: ['Give everyone admin access', 'Give only the access needed', 'Disable all accounts', 'Share all permissions'], answer: 1 },
    { question: 'What should you do with a suspicious email attachment?', options: ['Open it immediately', 'Forward it to everyone', 'Avoid opening it and report it', 'Enter your password'], answer: 2 },
  ],
  machine_learning: [
    { question: 'What is machine learning?', options: ['A screen repair method', 'A method for systems to learn patterns from data', 'A database table', 'A computer cable'], answer: 1 },
    { question: 'Which task is supervised learning?', options: ['Learning from labelled examples', 'Learning without any data', 'Formatting a disk', 'Turning off a computer'], answer: 0 },
    { question: 'What is a feature in a dataset?', options: ['An input variable', 'Only the final prediction', 'A computer monitor', 'A file extension'], answer: 0 },
    { question: 'What is a label in supervised learning?', options: ['The target value', 'A keyboard shortcut', 'A network address', 'A folder name'], answer: 0 },
    { question: 'Why split data into training and test sets?', options: ['To evaluate performance on unseen data', 'To duplicate all records', 'To remove every feature', 'To slow down training'], answer: 0 },
    { question: 'What is overfitting?', options: ['Model performs well only on training data but generalizes poorly', 'Model has no input data', 'Data is always perfectly balanced', 'A model is deleted'], answer: 0 },
    { question: 'Which task is classification?', options: ['Predicting house price', 'Predicting spam or not spam', 'Adding two numbers', 'Sorting a folder'], answer: 1 },
    { question: 'Which task is regression?', options: ['Predicting a continuous house price', 'Classifying an email as spam', 'Recognizing a password', 'Sorting names alphabetically'], answer: 0 },
    { question: 'What does accuracy measure?', options: ['Fraction of predictions that are correct', 'Training time only', 'Dataset file size', 'Number of columns only'], answer: 0 },
    { question: 'What is a common use of a decision tree?', options: ['Making predictions using decision rules', 'Cooling the CPU', 'Encrypting every file automatically', 'Creating network cables'], answer: 0 },
  ],
  science_basic: [
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1 },
    { question: 'What is the chemical formula for water?', options: ['CO2', 'O2', 'H2O', 'NaCl'], answer: 2 },
    { question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Helium', 'Hydrogen'], answer: 1 },
    { question: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Volt'], answer: 2 },
    { question: 'Which organ pumps blood through the human body?', options: ['Lungs', 'Brain', 'Heart', 'Kidneys'], answer: 2 },
    { question: 'At sea level, water normally boils at what temperature?', options: ['0°C', '50°C', '100°C', '150°C'], answer: 2 },
    { question: 'Which part of a plant commonly absorbs water from soil?', options: ['Flower', 'Root', 'Fruit', 'Petal'], answer: 1 },
    { question: 'Which is the closest star to Earth?', options: ['Sirius', 'The Sun', 'Polaris', 'Alpha Centauri'], answer: 1 },
    { question: 'What is the approximate speed of light in a vacuum?', options: ['300 km/s', '3,000 km/s', '300,000 km/s', '3,000,000 km/s'], answer: 2 },
    { question: 'Which vitamin can the human body produce with sunlight exposure?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], answer: 3 },
  ],
}

const SUBJECT_NAMES = {
  college_computer_science: 'Computer Science',
  computer_security: 'Computer Security',
  machine_learning: 'Machine Learning',
  science_basic: 'General Science',
}

function CameraPreview({ onWarning }) {
  const videoRef = useRef(null)
  const warningCallbackRef = useRef(onWarning)
  const lastWarningTimeRef = useRef(0)

  const [status, setStatus] = useState('Starting camera...')
  const [error, setError] = useState('')
  const [aiStatus, setAiStatus] = useState('Loading AI face detection...')

  useEffect(() => {
    warningCallbackRef.current = onWarning
  }, [onWarning])

  useEffect(() => {
    let stream = null
    let detector = null
    let animationId = null
    let mounted = true
    let lastDetectionTime = 0
    let noFaceSince = null
    let multipleFacesSince = null
    let lastFaceWarning = ''

    const WARNING_COOLDOWN = 8000
    const DETECTION_INTERVAL = 300

    function reportWarning(message) {
      const now = Date.now()

      if (now - lastWarningTimeRef.current < WARNING_COOLDOWN) return

      lastWarningTimeRef.current = now
      warningCallbackRef.current?.(message)
    }

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera requires localhost or HTTPS.')
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        await video.play()

        if (mounted) setStatus('Camera active')

        const { FaceDetector, FilesetResolver } =
          await import('@mediapipe/tasks-vision')

        if (!mounted) return

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        )

        if (!mounted) return

        detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        })

        if (!mounted) {
          detector.close()
          return
        }

        setAiStatus('AI face detection active')

        function detectFaces() {
          if (!mounted) return

          animationId = requestAnimationFrame(detectFaces)

          const videoElement = videoRef.current

          if (
            !detector ||
            !videoElement ||
            videoElement.readyState < 2 ||
            videoElement.videoWidth === 0
          ) return

          const now = performance.now()

          if (now - lastDetectionTime < DETECTION_INTERVAL) return
          lastDetectionTime = now

          try {
            const result = detector.detectForVideo(videoElement, now)
            const faceCount = result.detections.length
            const currentTime = Date.now()

            if (faceCount === 0) {
              multipleFacesSince = null

              if (noFaceSince === null) noFaceSince = currentTime

              if (
                currentTime - noFaceSince >= 3000 &&
                lastFaceWarning !== 'no-face'
              ) {
                lastFaceWarning = 'no-face'
                reportWarning(
                  'No face detected. Please keep your face visible.'
                )
              }
            } else if (faceCount > 1) {
              noFaceSince = null

              if (multipleFacesSince === null) {
                multipleFacesSince = currentTime
              }

              if (
                currentTime - multipleFacesSince >= 1200 &&
                lastFaceWarning !== 'multiple-faces'
              ) {
                lastFaceWarning = 'multiple-faces'
                reportWarning(
                  'Multiple faces detected. Please ensure you are the only person in view.'
                )
              }
            } else {
              noFaceSince = null
              multipleFacesSince = null
              lastFaceWarning = ''
            }
          } catch (err) {
            console.error('Face detection error:', err)
            setAiStatus('AI detection error — check console')
          }
        }

        detectFaces()
      } catch (err) {
        if (!mounted) return

        console.error('Camera initialization error:', err)

        if (err.name === 'NotAllowedError') {
          setError('Allow camera permission in your browser settings.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera was found on this device.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera may be in use by another application.')
        } else {
          setError(
            'Camera or AI setup failed. Check your internet connection and browser console.'
          )
        }

        setStatus('Camera/AI unavailable')
        setAiStatus('AI detection unavailable')
      }
    }

    startCamera()

    return () => {
      mounted = false

      if (animationId !== null) cancelAnimationFrame(animationId)
      if (detector) detector.close()

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <section className="camera-card">
      <div className="camera-heading">
        <div>
          <h3>NETRAVA AI Monitoring</h3>
          <p>Live preview with AI face detection</p>
        </div>

        <span
          className={`camera-status ${
            status === 'Camera active' ? 'camera-active' : ''
          }`}
        >
          {status}
        </span>
      </div>

      <div className="camera-video-box">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
        />

        {error && (
          <div className="camera-error">
            <strong>Preview or AI unavailable</strong>
            <p>{error}</p>
          </div>
        )}
      </div>

      <p className="camera-note">{aiStatus}</p>
      <p className="camera-note">
        Live face analysis only. Video is not recorded or uploaded.
      </p>
    </section>
  )
}

export default function App() {
  const category =
    sessionStorage.getItem('es_category') || 'college_computer_science'

  const [questions, setQuestions] = useState(
    QUESTION_BANK[category] || QUESTION_BANK.college_computer_science
  )
  const [sessionId, setSessionId] = useState('')
  const sessionIdRef = useRef('')
  const [backendError, setBackendError] = useState('')
  const [backendResult, setBackendResult] = useState(null)
  const subjectName = SUBJECT_NAMES[category] || 'Computer Science'

  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600)
  const [examStarted, setExamStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')

  const [warningCount, setWarningCount] = useState(0)
  const [warningMessage, setWarningMessage] = useState('')
  const [showWarningPopup, setShowWarningPopup] = useState(false)

  const warningCountRef = useRef(0)
  const examStartedRef = useRef(false)
  const submittedRef = useRef(false)

  // Initially suppress fullscreen warnings until the exam has started.
  const suppressFullscreenWarningRef = useRef(true)
  const submitTimerRef = useRef(null)
  const submittingRef = useRef(false)
  const API_BASE = ''

  async function sendBackendEvent(message) {
    const activeSessionId = sessionIdRef.current
    if (!activeSessionId || submittedRef.current) return

    const normalized = message.toLowerCase()
    let type = 'WINDOW_BLUR'
    if (normalized.includes('fullscreen')) type = 'FULLSCREEN_EXIT'
    else if (normalized.includes('tab') || normalized.includes('switched')) type = 'TAB_SWITCH'
    else if (normalized.includes('no face')) type = 'NO_FACE'
    else if (normalized.includes('multiple face')) type = 'MULTIPLE_FACES'
    else if (normalized.includes('camera')) type = 'CAMERA_OFF'

    try {
      const response = await fetch(`${API_BASE}/api/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSessionId,
          type,
          timestamp: Date.now() / 1000,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Event API returned ${response.status}`)
      }
    } catch (error) {
      console.error('Could not save proctoring event:', error)
    }
  }

  const addWarning = useCallback((message) => {
    if (!examStartedRef.current) return
    if (submittedRef.current) return
    if (suppressFullscreenWarningRef.current && message.includes('fullscreen')) return
    if (warningCountRef.current >= 3) return

    const nextCount = warningCountRef.current + 1

    warningCountRef.current = nextCount
    setWarningCount(nextCount)
    setWarningMessage(message)
    setShowWarningPopup(true)
    void sendBackendEvent(message)

    if (nextCount >= 3) {
      setWarningMessage(
        'Maximum warnings reached. Your assessment will be submitted automatically.'
      )

      submitTimerRef.current = setTimeout(() => {
        suppressFullscreenWarningRef.current = true
        setShowWarningPopup(false)
        void submitExam()
      }, 1800)
    }
  }, [])

  async function startExam() {
    setFullscreenError('')
    setBackendError('')
    setBackendResult(null)
    suppressFullscreenWarningRef.current = true

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      if (!document.fullscreenElement) {
        throw new Error('Fullscreen was not activated.')
      }

      const response = await fetch(`${API_BASE}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name:
            sessionStorage.getItem('es_name') ||
            sessionStorage.getItem('es_user') ||
            'Student',
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || `Backend returned ${response.status}`)
      }
      if (
        !data.session_id ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error('Backend returned an invalid exam session.')
      }

      sessionIdRef.current = data.session_id
      setSessionId(data.session_id)
      setQuestions(
        data.questions.map((question) => ({
          ...question,
          answer: undefined,
        }))
      )
      setAnswers({})
      setTimeLeft(Number(data.duration_sec) || 600)
      warningCountRef.current = 0
      setWarningCount(0)

      suppressFullscreenWarningRef.current = false
      examStartedRef.current = true
      setExamStarted(true)
    } catch (error) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      examStartedRef.current = false
      suppressFullscreenWarningRef.current = true
      setFullscreenError(
        error.message === 'Fullscreen was not activated.'
          ? 'Fullscreen could not start. Please click the button and try again.'
          : `Could not start exam: ${error.message}. Check that Flask is running on port 5000 and the selected category exists.`
      )
      console.error('Exam start error:', error)
    }
  }

  async function submitExam() {
    if (submittingRef.current || submittedRef.current) return
    submittingRef.current = true

    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current)
    }

    suppressFullscreenWarningRef.current = true
    setShowConfirmation(false)
    setShowWarningPopup(false)
    setBackendError('')

    try {
      const activeSessionId = sessionIdRef.current
      if (!activeSessionId) {
        throw new Error('No active backend session. Please restart the exam.')
      }

      const backendAnswers = {}
      questions.forEach((question, index) => {
        if (answers[index] !== undefined && question.id !== undefined) {
          backendAnswers[String(question.id)] = answers[index]
        }
      })

      const response = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSessionId,
          answers: backendAnswers,
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || `Submit API returned ${response.status}`)
      }

      setBackendResult({
        score: Number(result.score) || 0,
        total: Number(result.total) || questions.length,
        warnings: Number(result.warnings) || warningCountRef.current,
      })
      submittedRef.current = true
      setSubmitted(true)
    } catch (error) {
      console.error('Could not submit exam to backend:', error)
      setBackendError(
        `Result could not be saved: ${error.message}. Please check Flask and try submitting again.`
      )
      submittingRef.current = false
      setShowConfirmation(true)
    }
  }

  // Keep the refs in sync with React state.
  useEffect(() => {
    examStartedRef.current = examStarted
  }, [examStarted])

  useEffect(() => {
    submittedRef.current = submitted
  }, [submitted])

  // Exit fullscreen after submission without generating another warning.
  useEffect(() => {
    if (!submitted) return

    suppressFullscreenWarningRef.current = true

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.error('Could not exit fullscreen:', error)
      })
    }
  }, [submitted])

  // Timer is inactive until fullscreen has been confirmed.
  useEffect(() => {
    if (!examStarted || submitted) return

    if (timeLeft <= 0) {
      suppressFullscreenWarningRef.current = true
      submittedRef.current = true
      setSubmitted(true)
      return
    }

    const timerId = setTimeout(() => {
      setTimeLeft((time) => time - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [timeLeft, examStarted, submitted])

  // All browser event monitoring is registered only during the active exam.
  useEffect(() => {
    if (!examStarted || submitted) return
    if (suppressFullscreenWarningRef.current) return

    function handleVisibilityChange() {
      if (document.hidden) {
        addWarning('You switched away from the assessment tab.')
      }
    }

    function handleFullscreenChange() {
      if (
        !document.fullscreenElement &&
        examStartedRef.current &&
        !submittedRef.current &&
        !suppressFullscreenWarningRef.current
      ) {
        addWarning('You exited fullscreen mode.')
      }
    }

    function handleCopy(event) {
      event.preventDefault()
      addWarning('Copying content is not allowed during the assessment.')
    }

    function handlePaste(event) {
      event.preventDefault()
      addWarning('Pasting content is not allowed during the assessment.')
    }

    function handleContextMenu(event) {
      event.preventDefault()
      addWarning('Right-click is disabled during the assessment.')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [examStarted, submitted, addWarning])

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  const localScore = questions.reduce(
    (total, question, index) =>
      total +
      (question.answer !== undefined && answers[index] === question.answer ? 1 : 0),
    0
  )
  const score = backendResult ? backendResult.score : localScore
  const resultTotal = backendResult ? backendResult.total : questions.length

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
  }

  // Assessment result screen.
  if (submitted) {
    return (
      <div className="wrap exam-page">
        <Navbar />

        <main className="narrow exam-main">
          <section className="auth-panel exam-result">
            <div className="exam-result-icon">✓</div>
            <span className="auth-kicker">NETRAVA · ASSESSMENT COMPLETE</span>
            <h1>{subjectName} submitted!</h1>
            <p>Your answers have been evaluated for this session.</p>

            <div className="exam-score">
              <span>Your score</span>
              <strong>{score} / {resultTotal}</strong>
              <p>{Math.round((score / Math.max(resultTotal, 1)) * 100)}% correct</p>
            </div>

            <p>Questions answered: {answeredCount} / {questions.length}</p>
            <p>Proctoring warnings: {warningCount} / 3</p>

            <button
              type="button"
              className="auth-submit"
              onClick={() => go('dashboard')}
            >
              Back to dashboard →
            </button>
          </section>
        </main>
      </div>
    )
  }

  // Pre-exam screen: no camera, timer countdown, or warning listeners.
  if (!examStarted) {
    return (
      <div className="wrap exam-page">
        <Navbar />

        <main className="narrow exam-main">
          <section className="auth-panel exam-panel">
            <header className="exam-header">
              <span className="auth-kicker">NETRAVA</span>
              <h1>{subjectName} Assessment</h1>
              <p>Your assessment is ready. Enter fullscreen to begin.</p>
            </header>

            <div className="exam-timer">
              <span>Duration</span>
              <strong>10:00</strong>
            </div>

            <div className="exam-notice">
              <span className="notice-icon">i</span>
              <div>
                <strong>Before you begin</strong>
                <p>
                  Allow camera access when requested, keep your face visible,
                  and avoid leaving fullscreen during the assessment.
                </p>
              </div>
            </div>

            {(fullscreenError || backendError) && (
              <p className="auth-error" role="alert">
                {fullscreenError || backendError}
              </p>
            )}

            <button
              type="button"
              className="auth-submit"
              onClick={startExam}
            >
              Enter Fullscreen &amp; Start Exam →
            </button>
          </section>
        </main>
      </div>
    )
  }

  // Active assessment screen.
  return (
    <div className="wrap exam-page">
      <Navbar />

      <main className="narrow exam-main">
        <section className="auth-panel exam-panel">
          <header className="exam-header">
            <span className="auth-kicker">NETRAVA</span>
            <h1>{subjectName} Assessment</h1>
            <p>Read each question carefully and select one answer.</p>

            <div className="exam-timer">
              <span>Time remaining</span>
              <strong>{formatTime(timeLeft)}</strong>
            </div>

            <div className="exam-progress-info">
              <span>Assessment progress</span>
              <span>
                {answeredCount} of {questions.length} answered
              </span>
            </div>

            <div className="exam-progress">
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="exam-warning-status">
              <span>Proctoring warnings</span>
              <strong>{warningCount} / 3</strong>
            </div>
          </header>

          <CameraPreview onWarning={addWarning} />

          <div className="exam-questions">
            {questions.map((question, index) => (
              <section className="exam-question" key={index}>
                <div className="exam-question-title">
                  <span className="exam-number">{index + 1}</span>
                  <h3>{question.question}</h3>
                </div>

                <div className="exam-options">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex

                    return (
                      <label
                        key={option}
                        className={`exam-option ${
                          selected ? 'exam-option-selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={selected}
                          onChange={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [index]: optionIndex,
                            }))
                          }
                        />
                        <span>{option}</span>
                      </label>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <footer className="exam-footer">
            <p>
              {answeredCount === questions.length
                ? 'All questions answered. You can submit your assessment.'
                : `${questions.length - answeredCount} question(s) remaining.`}
            </p>

            <button
              type="button"
              className="auth-submit exam-submit"
              onClick={() => setShowConfirmation(true)}
            >
              Submit assessment →
            </button>
          </footer>
        </section>
      </main>

      {showWarningPopup && (
        <div className="warning-overlay">
          <section
            className="warning-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="warning-title"
          >
            <div className="warning-icon">⚠️</div>

            <h2 id="warning-title">
              {warningCount >= 3 ? 'Assessment Ending' : 'Proctoring Warning'}
            </h2>

            <p>{warningMessage}</p>
            <div className="warning-counter">Warning {warningCount} of 3</div>

            {warningCount < 3 ? (
              <button
                type="button"
                className="warning-ok"
                onClick={() => setShowWarningPopup(false)}
              >
                I Understand
              </button>
            ) : (
              <p className="warning-auto-submit">
                Submitting your assessment...
              </p>
            )}
          </section>
        </div>
      )}

      {showConfirmation && (
        <div className="exam-modal-backdrop">
          <section
            className="exam-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title">Submit assessment?</h2>

            {backendError && (
              <p className="auth-error" role="alert">{backendError}</p>
            )}

            <p>
              You have answered {answeredCount} out of {questions.length} questions.
            </p>

            {answeredCount < questions.length && (
              <p>
                Some questions are unanswered. You can return and complete
                them before submitting.
              </p>
            )}

            <div className="exam-confirm-actions">
              <button
                type="button"
                className="exam-secondary"
                onClick={() => setShowConfirmation(false)}
              >
                Go back
              </button>

              <button
                type="button"
                className="auth-submit"
                onClick={submitExam}
              >
                Confirm submit
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
