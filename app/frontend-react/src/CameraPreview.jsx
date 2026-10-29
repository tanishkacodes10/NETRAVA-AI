
import { useEffect, useRef, useState } from 'react'

export default function CameraPreview() {
  const videoRef = useRef(null)
  const [cameraStatus, setCameraStatus] = useState('Requesting camera...')
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera requires localhost or HTTPS.')
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraStatus('Camera is active')
        }
      } catch (error) {
        setCameraStatus('Camera unavailable')
        setCameraError(
          error.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in your browser.'
            : error.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : error.message || 'Could not start the camera.'
        )
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <section className="camera-card">
      <div className="camera-card-heading">
        <div>
          <h3>Camera Monitoring</h3>
          <p>Webcam preview for your assessment</p>
        </div>
        <span className="camera-status">
          {cameraStatus}
        </span>
      </div>

      <div className="camera-video-box">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />

        {cameraError && (
          <div className="camera-error">
            <p>{cameraError}</p>
          </div>
        )}
      </div>

      <p className="camera-note">
        Your camera preview is active only while this assessment
        page is open. This component does not record or upload video.
      </p>
    </section>
  )
}
