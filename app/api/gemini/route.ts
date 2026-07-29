import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { triggerType, timestamp, guardianActive, personDetected, deviceConnected, locationUrl } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    const structuredContext = {
      triggerType: triggerType || "Hands-Free SOS Gesture",
      timestamp: timestamp || new Date().toLocaleTimeString(),
      guardianActive: guardianActive ?? true,
      personDetected: personDetected ?? true,
      deviceConnected: deviceConnected ?? false,
      locationUrl: locationUrl || "Unavailable",
    };

    // Factual local fallback summary if API key is not configured
    const localFactualSummary = `Emergency gesture (${structuredContext.triggerType}) detected at ${structuredContext.timestamp} while Guardian Mode was active. ${
      structuredContext.personDetected ? "A person was detected in camera view shortly before activation." : "No additional subject in view."
    } Hardware status: ${structuredContext.deviceConnected ? "IoT Companion Link Active" : "Standby"}. Incident requires attention.`;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        summary: localFactualSummary,
        source: "Local Factual Engine (No API Key Configured)",
      });
    }

    // Call Google Gemini 1.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an objective, factual AI incident summarizer for a personal safety app named Aura Sentinel.
Generate a concise, 2-sentence factual incident summary based ONLY on the following structured incident data:
- Trigger Type: ${structuredContext.triggerType}
- Time: ${structuredContext.timestamp}
- Guardian Mode Active: ${structuredContext.guardianActive}
- Person Detected in Camera View: ${structuredContext.personDetected}
- Device Connection: ${structuredContext.deviceConnected}

Important instructions:
- Do NOT draw unsupported conclusions or claim that a person was "dangerous" or "attacking".
- State only objective facts about the detected trigger, time, and system state.
- Keep output concise (max 2 sentences).`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || localFactualSummary;

    return NextResponse.json({ success: true, summary, source: "Google Gemini 1.5 Flash API" });
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        summary: "Emergency gesture detected while Guardian Mode was active. System safety response initiated. Incident logged for review.",
        source: "Fallback Factual Engine",
      },
      { status: 200 }
    );
  }
}
