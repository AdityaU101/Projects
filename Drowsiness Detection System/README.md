<div align="center">

# 😴 Drowsiness Detection System

**A real-time driver fatigue detection app using computer vision. It monitors a webcam feed, computes Eye Aspect Ratio (EAR) against a personalized calibration baseline, and pauses video playback with an audio alert when drowsiness is detected.**

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white)](https://opencv.org)
[![dlib](https://img.shields.io/badge/dlib-008080?style=flat-square)](http://dlib.net)

</div>

---

## 👋 About This Project

Drowsiness Detection System uses **dlib's 68-point facial landmark predictor** to track eye openness in real time. The system is personalized through a one-time **calibration phase**: 100 webcam frames are used to compute your average open-eye EAR and set a dynamic threshold (80% of baseline). Once calibrated, the app monitors you every second while you watch YouTube videos. If your EAR drops below threshold, the video pauses and an alert sound plays.

---

## ✨ Features

- **Personalized calibration** derives an individual EAR threshold from 100 webcam frames
- **Real-time detection** evaluates eye state every second via the webcam
- **YouTube playlist integration** lets you search and watch playlists while being monitored
- **Automatic video pause** stops playback when drowsiness is detected
- **Audio alert** plays a looping alarm until the driver is awake again
- **Post-session analysis** stores a per-video drowsiness timeline in `localStorage` for review

---

## 🛠️ Tech Stack

**Backend**  
`Python` `Flask` `OpenCV` `dlib` `SciPy` `NumPy`

**Frontend**  
`React` `Vite` `Tailwind CSS` `react-webcam` `ReactPlayer` `Axios`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+ with a virtual environment
- Node.js 18+
- `shape_predictor_68_face_landmarks.dat` placed in `server/` (download from [dlib's model zoo](http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2))

### 1. Start the Backend

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install flask flask-cors opencv-python dlib scipy numpy
python app.py
# Runs on http://localhost:5000
```

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Use the App

1. Search for a YouTube playlist on the Home tab
2. Click a video to open the detector
3. Complete the calibration step (look at the webcam and click **Calibrate**)
4. The video plays while the app monitors you automatically

---

## 📂 Project Structure

```
Drowsiness Detection System/
├── server/
│   ├── app.py                               # Flask API (/calibrate + /detect_drowsiness)
│   └── shape_predictor_68_face_landmarks.dat
└── client/
    └── src/
        ├── App.jsx
        ├── alert.mp3                        # Alert sound
        └── components/
            ├── DrowsinessDetector.jsx       # Core detection + video player
            ├── DrowsinessAnalysis.jsx       # Post-session analytics
            ├── Search.jsx                   # YouTube playlist search
            ├── Playlist.jsx
            ├── PlaylistItem.jsx
            └── VideoAnalysis.jsx
```

---

## 🔬 How It Works

1. **EAR Calculation** - for each eye, the aspect ratio is `(A + B) / (2 x C)` where A and B are vertical distances between landmarks and C is the horizontal distance
2. **Calibration** - 100 frames are averaged; threshold = `mean_EAR x 0.8`
3. **Detection loop** - every 1000 ms, a screenshot is sent to `POST /detect_drowsiness`; if `EAR < threshold`, `drowsy = true`
4. **Recovery** - once eyes re-open above threshold, video automatically resumes
