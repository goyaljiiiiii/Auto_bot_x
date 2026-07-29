# Aura Sentinel 🛡️
### *A Hands-Free AI + IoT Personal Safety Companion for Women & Girls*

**Aura Sentinel** is a calm, modern, consumer-grade safety companion designed to help women stay connected, aware, and in control when it matters most. During an uncomfortable or potentially unsafe situation, a user may not be able to safely pull out their phone, unlock it, and find an SOS button. Aura Sentinel provides a hands-free safety layer using computer vision, hand gesture recognition, Google Gemini AI incident summarization, and IoT hardware.

---

## 🌟 Product Architecture & MVP Features

- **🌸 Soft Wellness & Safety UI**: Designed with a calm, modern visual identity (soft warm cream, deep plum, muted lavender, soft rose, charcoal text, rounded cards, and clean typography).
- **🛡️ Guardian Mode Session**:
  - Clear **Guardian Mode State Switcher** (OFF / ACTIVE).
  - Large central safety status card displaying: ⚪ **NORMAL**, 🟢 **GUARDIAN MONITORING**, 🔴 **SOS ACTIVATED**.
  - Real-time status indicators for Camera, Gesture Detection, Voice Trigger, IoT Device Connection, and Location.
- **🖐️ Hands-Free SOS Flow**:
  - Detects predefined hand gesture (Palm Fold Signal for Help) hands-free.
  - Enters **SOS ACTIVATED** state.
  - Activates visible IoT hardware response (RGB emergency lighting, siren buzzer, servo camera pan).
  - Server-side **Google Gemini AI** generates a concise, factual incident summary based on objective context.
  - Triggers a formatted **Trusted Contact Alert** (clearly labeled *"Demo Alert"* flow).
- **👁️ Look Around (Camera Direction Controls)**:
  - Physical servo panning controls: Look Left (0°), Center (90°), Look Right (180°), and "Look Behind Me".
  - Explicitly checks WebSerial hardware connection before attempting physical movement.
- **🤖 Remote Area Check (Rover Inspection)**:
  - Remotely move rover a short distance (`MOTOR:FORWARD`, `LEFT`, `RIGHT`, `STOP`) for area inspection.
- **👥 Trusted Contacts & Demo Alert**:
  - Configure trusted contact details (Name, Relationship, Phone, Email, Contact Method).
  - Test demo alert preview displaying structured incident details and Google Maps link.
- **📋 Incident History Log**:
  - Session history logging Date, Time, Trigger Type, Status, and factual Gemini Incident Summary.

---

## 🛠️ Hardware Setup (Arduino Pinout)

| Component | Arduino Pin | Function |
| :--- | :--- | :--- |
| **Servo Pan Motor** | Pin 9 | Camera Pan Motor (0° to 180°) |
| **Motor Driver IN1 / IN2** | Pin 4 / Pin 2 | Left Wheel DC Motor |
| **Motor Driver IN3 / IN4** | Pin 11 / Pin 12 | Right Wheel DC Motor |
| **RGB Status LED** | Red=Pin 3, Green=Pin 5, Blue=Pin 10 | Status Indicator & Emergency Strobe |
| **Siren Buzzer** | Pin 8 | Emergency Siren |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Optional: Google Gemini API Key for AI Incident Summaries
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: If no API key is configured, Aura Sentinel gracefully falls back to a local factual incident summary generator.*

---

## 🚀 Running Locally & Vercel Deployment

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge.

### Vercel Deployment
1. Push repository to GitHub.
2. Import project into Vercel Dashboard (Next.js framework detected automatically).
3. Set `GEMINI_API_KEY` in Vercel Environment Variables.
4. Deploy!

---

## ⚖️ Responsible Product Principles

1. Aura Sentinel is designed to assist and inform—it does not claim to guarantee personal safety or prevent attacks.
2. The system does not claim to automatically identify dangerous people.
3. Emergency contact alerts are demonstrated via a clearly labeled *"Demo Alert"* flow.
4. All API keys remain protected on server-side API routes (`/api/gemini`).
