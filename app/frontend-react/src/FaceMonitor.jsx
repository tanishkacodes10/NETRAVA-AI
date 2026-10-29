import { useEffect, useRef, useState } from 'react'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

const WASM = '/wasm'
const HOLD_MS = { NO_FACE: 3000, MULTIPLE_FACES: 2000 } // itni der lagatar issue rahe tab warning
const GRACE_MS = 1500     // beech mein itni der miss ho jaye to bhi timer chalta rahe
const COOLDOWN_MS = 10000 // dobara warning se pehle gap

export default function FaceMonitor({ stream, onEvent }) {
  const videoRef = useRef(null)
  const onEventRef = useRef(onEvent)
  const [status, setStatus] = useState('Loading detector...')

  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  useEffect(() => {
    let detector = null
    let timer = null
    let cancelled = false
    const video = videoRef.current
    video.srcObject = stream
    video.play().catch(() => {})

    const track = stream.getVideoTracks()[0]
    track.onended = () => onEventRef.current('CAMERA_OFF')

    const state = {
      NO_FACE: { since: 0, lastSeen: 0, last: 0 },
      MULTIPLE_FACES: { since: 0, lastSeen: 0, last: 0 },
    }
    function check(type, active, now) {
      const s = state[type]
      if (active) {
        if (!s.since) s.since = now
        s.lastSeen = now
      } else if (s.since && now - s.lastSeen > GRACE_MS) {
        s.since = 0
      }
      if (s.since && now - s.since >= HOLD_MS[type] && now - s.last >= COOLDOWN_MS) {
        s.last = now
        s.since = 0
        onEventRef.current(type)
      }
    }

    function loop() {
      if (!detector || video.readyState < 2) return
      const res = detector.detectForVideo(video, performance.now())
      const n = res.detections.length
      const now = Date.now()
      check('NO_FACE', n === 0, now)
      check('MULTIPLE_FACES', n > 1, now)
      if (n === 0) setStatus('No face detected')
      else if (n > 1) setStatus(`Multiple faces (${n})`)
      else if (res.detections[0].categories[0].score < 0.75) setStatus('Detection uncertain')
      else setStatus('Face detected')
    }

    async function init() {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM)
        const d = await FaceDetector.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: '/blaze_face_short_range.tflite',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.4,
        })
        if (cancelled) { d.close(); return }
        detector = d
        timer = setInterval(loop, 400)
      } catch (e) {
        console.error(e)
        setStatus('Detector failed to load')
      }
    }
    init()

    return () => {
      cancelled = true
      clearInterval(timer)
      track.onended = null
      if (detector) detector.close()
    }
  }, [stream])

  const ok = status === 'Face detected'
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, width: 180, background: '#1e293b', borderRadius: 12, padding: 8, boxShadow: '0 6px 20px rgba(0,0,0,.5)', zIndex: 50 }}>
      <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 8, transform: 'scaleX(-1)' }} />
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, textAlign: 'center', padding: '4px 6px', borderRadius: 6, background: ok ? '#14532d' : '#7f1d1d', color: ok ? '#bbf7d0' : '#fecaca' }}>
        {status}
      </div>
    </div>
  )
}