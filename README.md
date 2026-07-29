# OmniSight Care AI 👁️⚡
### *Assistive Vision & IoT Smart Home Guardian (Hackathon Edition)*

OmniSight Care is a next-generation, **Vercel-deployable** assistive IoT smart home and health guardian system designed for individuals with motor impairments, Parkinson's/tremors, mobility constraints, or special medical needs.

It combines in-browser **MediaPipe Computer Vision**, **WebSerial USB Hardware Driver**, **Medical Profile Adaptation**, **Active Servo Camera Tracking**, **AI Voice Controls**, and **Fall SOS Emergency Alerting**.

---

## 🌟 Key Features

- **🌐 Vercel-Deployable Web App**: Zero-configuration deployment on Vercel. Computer Vision (Hands, Face, Pose) runs directly inside client browsers using WASM.
- **🔌 WebSerial USB Arduino Driver**: Connect your Arduino/ESP32 directly over USB from Chrome or Edge—no local background Python process required!
- **🩺 Medical Profile Engine**:
  - *Parkinson's / Tremors Mode*: Filters hand jitter with tremor-smoothing & enables head-pose nod/tilt gestures.
  - *Mobility Impaired Mode*: Enables continuous servo camera height & angle auto-locking.
  - *Speech Impaired Mode*: Custom sign/hand gesture priority over voice.
- **📷 Living Camera Auto-Tracking**: Servo motor physically pans camera to keep user centered in frame.
- **🚨 Fall & Emergency SOS Guard**: Detects sudden falls or crossed-arm SOS posture, triggering siren, red strobe RGB LEDs, and dispatching emergency webhooks.
- **🗣️ AI Voice Assistant**: Native Web Speech API speech-to-text and text-to-speech assistant.

---

## 🛠️ Tech Stack

- **Frontend & Web Framework**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Styling & Aesthetics**: Cyberpunk Glassmorphism HUD, Framer Motion, Lucide Icons
- **Vision Engine**: Client-side `@mediapipe/hands`, `@mediapipe/face_mesh`, `@mediapipe/pose`
- **IoT & Hardware**: WebSerial API, Arduino C++ (`arduino/omnisight_firmware.ino`)
- **Deployment**: Vercel Ready (`vercel.json`)

---

## 🚀 Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge.

3. **Connect Hardware (Arduino)**:
   - Flash `arduino/omnisight_firmware.ino` onto your Arduino UNO/Nano/ESP32.
   - Plug the Arduino into your computer via USB.
   - Click **Connect Arduino (USB)** in the top header of the web application.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "OmniSight Care Vercel Edition"
   git push origin main
   ```
2. Import the repository into [Vercel Dashboard](https://vercel.com).
3. Vercel will automatically detect **Next.js** and build the application!
4. Anyone visiting your Vercel URL can open their webcam, connect their USB Arduino, select their medical profile, and experience the full system!

---

## 🔌 Hardware Setup (Arduino Pinout)

| Component | Arduino Pin | Function |
| :--- | :--- | :--- |
| **Servo Motor** | Pin 9 | Camera Pan Motor (0° to 180°) |
| **Appliance LED 1** | Pin 6 | Main Light Simulation |
| **Appliance LED 2** | Pin 7 | Fan / Appliance 2 |
| **RGB Status Red** | Pin 3 (PWM) | Red Alarm / SOS Strobe |
| **RGB Status Green** | Pin 5 (PWM) | Active Profile Status |
| **RGB Status Blue** | Pin 10 (PWM) | Voice Listener Status |
| **Buzzer** | Pin 8 | Emergency Alarm Siren |

---

## 📜 License & Security

MIT License. Created for Hackathons. Never share production API keys or medical contact numbers publicly.
