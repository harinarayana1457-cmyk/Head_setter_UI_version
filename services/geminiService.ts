
import { GoogleGenAI, Type } from "@google/genai";
import { SecurityState, SecurityInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSecurityInsight = async (state: SecurityState): Promise<SecurityInsight> => {
  const distance = calculateDistance(state.baseLocation, state.currentLocation);
  
  const prompt = `
    Analyze the current security state of a user's headphones.
    Base Location: ${JSON.stringify(state.baseLocation)}
    Current Location: ${JSON.stringify(state.currentLocation)}
    Distance: ${distance} meters
    Fence Radius: ${state.fenceRadius} meters
    Locked State: ${state.isLocked ? 'Armed' : 'Disarmed'}

    Provide a professional security status assessment. 
    If distance > fenceRadius, it is high risk.
    Return a JSON object with: status ('safe', 'warning', 'danger'), message (short status), and advice (recovery or prevention tip).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            message: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          required: ["status", "message", "advice"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as SecurityInsight;
  } catch (error) {
    console.error("Gemini insight error:", error);
    return {
      status: distance > state.fenceRadius ? 'danger' : 'safe',
      message: "Monitoring active.",
      advice: "Keep your headphones within your sight."
    };
  }
};

function calculateDistance(loc1: any, loc2: any): number {
  if (!loc1 || !loc2) return 0;
  const R = 6371e3; // metres
  const φ1 = loc1.latitude * Math.PI/180;
  const φ2 = loc2.latitude * Math.PI/180;
  const Δφ = (loc2.latitude-loc1.latitude) * Math.PI/180;
  const Δλ = (loc2.longitude-loc1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
