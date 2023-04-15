import { useState, useRef } from "react"

import { FaStop, FaPlay, FaPause } from "react-icons/fa"

const mimeType = "audio/webm"

export default function Recorder() {
  const [permission, setPermission] = useState(false)
  const mediaRecorder = useRef(null)
  const [recordingStatus, setRecordingStatus] = useState("inactive")
  const [stream, setStream] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [audio, setAudio] = useState(null)

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        setPermission(true)
        setStream(streamData)
      } catch (err) {
        alert(err.message)
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.")
    }
  }

  const startRecording = async () => {
    setRecordingStatus("recording")
    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream, { type: mimeType })
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media
    //invokes the start method to start the recording process
    mediaRecorder.current.start()
    let localAudioChunks = []
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return
      if (event.data.size === 0) return
      localAudioChunks.push(event.data)
    }
    setAudioChunks(localAudioChunks)
  }

  const stopRecording = async () => {
    setRecordingStatus("inactive")
    //stops the recording instance
    mediaRecorder.current.stop()
    mediaRecorder.current.onstop = async () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      window.localStorage.setItem("audio", audioBlob)
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudio(audioUrl)
      console.log(audioUrl)
      setAudioChunks([])
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <p className="text-2xl">Recording Details</p>
      <div className="flex flex-row gap-4 text-2xl">
        <button>
          <FaPlay />
        </button>
        <button>
          <FaPause />
        </button>
        <button>
          <FaStop />
        </button>
      </div>
      <div className="audio-controls">
        {!permission ? (
          <button onClick={getMicrophonePermission} type="button">
            Get Microphone
          </button>
        ) : null}
        {permission && recordingStatus === "inactive" ? (
          <button onClick={startRecording} type="button">
            Start Recording
          </button>
        ) : null}
        {recordingStatus === "recording" ? (
          <button onClick={stopRecording} type="button">
            Stop Recording
          </button>
        ) : null}
        {audio ? (
          <div className="audio-container">
            <audio src={audio} controls></audio>
            <a download href={audio}>
              Download Recording
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
