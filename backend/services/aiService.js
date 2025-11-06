import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BPReading from '../models/BPReading.js';
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import 'dotenv/config';
import { generateFallbackResponse, generateContextualFallbackResponse, isOpenAIConfigured } from './chatbotFallback.js';

// Initialize Gemini client (Google Generative AI)
let genAI = null;
let lastLLMError = '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';

// Models can be overridden via env vars (Gemini)
// Default per request: gemini-2.0-flash (stable, free-tier compatible)
const REC_MODEL = process.env.GEMINI_REC_MODEL || process.env.OPENAI_REC_MODEL || 'gemini-2.0-flash';
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || process.env.OPENAI_CHAT_MODEL || 'gemini-2.0-flash';
const DEMO_MODE = (process.env.DEMO_MODE || '').toString().toLowerCase() === 'true';

// Ensure Gemini is initialized (lazy init). Returns boolean
export const ensureOpenAIReady = async () => {
  if (genAI) return true;
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    lastLLMError = 'GEMINI_API_KEY missing or invalid';
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return true;
  } catch (e) {
    lastLLMError = e?.message || String(e);
    genAI = null;
    return false;
  }
};

// REST helper aligned with curl example
async function geminiGenerateTextREST(model, text, generationConfig) {
  const url = `${GEMINI_BASE_URL}/${GEMINI_API_VERSION}/models/${model}:generateContent`;
  const body = {
    contents: [
      {
        parts: [ { text } ]
      }
    ],
    ...(generationConfig ? { generationConfig } : {})
  };
  const res = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    proxy: false
  });
  // Extract text safely
  const candidates = res.data?.candidates || [];
  const first = candidates[0];
  const parts = first?.content?.parts || [];
  const out = parts[0]?.text || '';
  return out;
}

// Generate medication recommendations based on patient data
export const generateRecommendation = async (patientId) => {
  try {
    // Ensure OpenAI ready unless demo mode
    const ready = await ensureOpenAIReady();
    // If no OpenAI or demo mode is enabled, return a safe heuristic recommendation
    const useHeuristic = !ready || DEMO_MODE;

    // Fetch patient data
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    // Fetch recent BP readings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bpReadings = await BPReading.find({
      patientId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: -1 });

    if (bpReadings.length === 0) {
      throw new Error('Insufficient BP readings for recommendation');
    }

    // Calculate averages
    const avgSystolic = bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length;
    const avgDiastolic = bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length;

    // Fetch medical history
    const conditions = await MedicalRecord.find({
      patientId,
      type: 'condition',
      status: { $in: ['active', 'ongoing'] }
    });

    const medications = await MedicalRecord.find({
      patientId,
      type: 'medication',
      status: { $in: ['active', 'ongoing'] }
    });

    const allergies = await MedicalRecord.find({
      patientId,
      type: 'allergy'
    });

    // Build context for AI
    const patientContext = {
      age: patient.age,
      gender: patient.gender,
      bpAverage: `${Math.round(avgSystolic)}/${Math.round(avgDiastolic)}`,
      bpTrend: bpReadings.length >= 7 ? 'consistent' : 'limited_data',
      conditions: conditions.map(c => c.title),
      currentMedications: medications.map(m => `${m.title} ${m.dosage || ''}`),
      allergies: allergies.map(a => a.title),
      region: `${patient.city}, ${patient.state}, ${patient.country}`,
      incomeRange: patient.incomeRange
    };

    // If heuristic path, produce a deterministic, safe recommendation
    if (useHeuristic) {
      const meds = [];
      // Very simple rule-based suggestion for demo purposes
      if (avgSystolic >= 140 || avgDiastolic >= 90) {
        meds.push({
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          cost: 12.5,
          availability: 'high',
          sideEffects: ['Swelling of ankles', 'Headache', 'Dizziness']
        });
      } else if (avgSystolic >= 130 || avgDiastolic >= 80) {
        meds.push({
          name: 'Hydrochlorothiazide',
          dosage: '12.5mg',
          frequency: 'Once daily in morning',
          cost: 8.75,
          availability: 'high',
          sideEffects: ['Increased urination', 'Dizziness', 'Low potassium']
        });
      }

      const lifestyleAdvice = [];
      // Simple lifestyle advice based on averages
      if (avgSystolic >= 130 || avgDiastolic >= 80) {
        lifestyleAdvice.push('Reduce sodium intake to under 2,000mg/day');
        lifestyleAdvice.push('Walk briskly for 30 minutes at least 5 days/week');
        lifestyleAdvice.push('Limit alcohol and avoid tobacco');
      } else {
        lifestyleAdvice.push('Maintain balanced DASH-style diet');
        lifestyleAdvice.push('Keep regular physical activity routine');
      }

      const listLines = meds.map((m, i) => `${i + 1}) ${m.name} ${m.dosage} — ${m.frequency} — ~$${Number(m.cost).toFixed(2)} (${m.availability} availability)`);
      const header = 'AI suggestions (not a prescription). Doctor approval required.';
      const patientMessage = [header, ...listLines].join('\n');

      const recommendation = {
        medications: meds,
        lifestyleAdvice,
        patientMessage,
        reasoning: 'Heuristic demo: Based on average BP and common first-line antihypertensives. This is NOT a prescription. Doctor review required.',
        region: `${patient.city}, ${patient.state}, ${patient.country}`,
        confidence: 60,
        bpAverage: {
          systolic: Math.round(avgSystolic),
          diastolic: Math.round(avgDiastolic)
        },
        medicalHistorySummary: [
          ...conditions.map(c => c.title),
          ...medications.map(m => m.title)
        ],
        allergies: allergies.map(a => a.title),
        aiModel: 'heuristic-demo',
        aiPrompt: 'DEMO_MODE=true (no external API used)'
      };
      return recommendation;
    }

    // Create AI prompt
    const prompt = `You are a medical AI assistant helping with blood pressure medication recommendations. 
    
Patient Context:
- Age: ${patientContext.age || 'Not specified'}
- Gender: ${patientContext.gender || 'Not specified'}
- Average BP: ${patientContext.bpAverage} mmHg (based on ${bpReadings.length} readings)
- Current Conditions: ${patientContext.conditions.join(', ') || 'None'}
- Current Medications: ${patientContext.currentMedications.join(', ') || 'None'}
- Allergies: ${patientContext.allergies.join(', ') || 'None'}
- Region: ${patientContext.region}
- Income Range: ${patientContext.incomeRange || 'Not specified'}

Recent BP Readings (last 7):
${bpReadings.slice(0, 7).map(r => `- ${r.systolic}/${r.diastolic} mmHg at ${new Date(r.timestamp).toLocaleDateString()}`).join('\n')}

Based on this information, provide a medication recommendation following this JSON format:
{
  "reasoning": "Detailed explanation of why these medications are recommended, considering patient's BP trends, medical history, allergies, and regional availability",
  "lifestyleAdvice": ["actionable lifestyle tip 1", "actionable lifestyle tip 2"],
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "e.g., 5mg",
      "frequency": "e.g., Once daily",
      "cost": 12.50,
      "availability": "high|medium|low",
      "sideEffects": ["Side effect 1", "Side effect 2"]
    }
  ],
  "confidence": 85,
  "region": "${patientContext.region}"
}

IMPORTANT:
- Consider drug interactions with current medications
- Avoid medications patient is allergic to
- Consider regional drug availability and cost
- Provide evidence-based recommendations
- Be conservative and prioritize safety
- Confidence should reflect certainty level (0-100)`;

    // Call Gemini via REST (matches curl usage)
    const responseText = await geminiGenerateTextREST(REC_MODEL, prompt, { temperature: 0.3, maxOutputTokens: 2000 });
    
    // Parse JSON response (handle markdown code blocks if present)
    let recommendationData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationData = JSON.parse(jsonMatch[0]);
      } else {
        recommendationData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI recommendation');
    }

    // Validate and structure the response
    const medsOut = recommendationData.medications || [];
    const listLines = medsOut.map((m, i) => {
      const price = typeof m.cost === 'number' ? `$${Number(m.cost).toFixed(2)}` : 'N/A';
      const avail = m.availability || 'unknown';
      return `${i + 1}) ${m.name} ${m.dosage || ''} — ${m.frequency || ''} — ~${price} (${avail} availability)`;
    });
    const header = 'AI suggestions (not a prescription). Doctor approval required.';
    const patientMessage = [header, ...listLines].join('\n');

    const recommendation = {
      medications: medsOut,
      patientMessage,
      lifestyleAdvice: recommendationData.lifestyleAdvice || [],
      reasoning: recommendationData.reasoning || 'No reasoning provided',
      region: recommendationData.region || patientContext.region,
      confidence: recommendationData.confidence || 75,
      bpAverage: {
        systolic: Math.round(avgSystolic),
        diastolic: Math.round(avgDiastolic)
      },
      medicalHistorySummary: [
        ...conditions.map(c => c.title),
        ...medications.map(m => m.title)
      ],
      allergies: allergies.map(a => a.title),
      aiModel: 'gpt-4',
      aiPrompt: prompt
    };

    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid LLM API key. Please check your .env configuration.');
    } else if (error.status === 429) {
      throw new Error('LLM API rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('LLM service is temporarily unavailable. Please try again later.');
    }
    
    throw error;
  }
};

// Chatbot response generation
export const generateChatResponse = async (patientId, userMessage, conversationHistory = []) => {
  try {
    // Ensure OpenAI ready unless demo mode
    const ready = await ensureOpenAIReady();
    // Fetch patient context
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    // Fetch recent BP readings
    const recentReadings = await BPReading.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(10);

    // Fetch active medications
    const medications = await MedicalRecord.find({
      patientId,
      type: 'medication',
      status: { $in: ['active', 'ongoing'] }
    });

    // Fetch conditions
    const conditions = await MedicalRecord.find({
      patientId,
      type: 'condition',
      status: { $in: ['active', 'ongoing'] }
    });

    // Fetch allergies
    const allergies = await MedicalRecord.find({
      patientId,
      type: 'allergy',
      status: { $in: ['active', 'ongoing'] }
    });

    // Build patient context
    const latestBP = recentReadings[0];
    const bpContext = latestBP 
      ? `Latest BP: ${latestBP.systolic}/${latestBP.diastolic} mmHg (${new Date(latestBP.timestamp).toLocaleDateString()})`
      : 'No BP readings available';
    const recentSummary = recentReadings.length
      ? `Recent BP (last ${recentReadings.length}): ${recentReadings.slice(0,5).reverse().map(r => `${r.systolic}/${r.diastolic} on ${new Date(r.timestamp).toLocaleDateString()}`).join('; ')}`
      : '';

    const medicationsContext = medications.length > 0
      ? `Current medications: ${medications.map(m => `${m.title} ${m.dosage || ''}`).join(', ')}`
      : 'No current medications';

    const conditionsContext = conditions.length > 0
      ? `Current conditions: ${conditions.map(c => c.title).join(', ')}`
      : 'No active conditions';

    const allergiesContext = allergies.length > 0
      ? `Allergies: ${allergies.map(a => a.title).join(', ')}`
      : 'No known allergies';

    const regionContext = `Region: ${[patient.city, patient.state, patient.country].filter(Boolean).join(', ') || 'Not specified'}`;

    // If OpenAI not configured or demo mode, use contextual fallback
    if (!ready || DEMO_MODE) {
      return generateContextualFallbackResponse({
        latestBPText: bpContext,
        medsText: medicationsContext,
        conditionsText: conditionsContext,
      }, userMessage);
    }

    // Create system prompt
    const systemPrompt = `You are HealthAI Assistant, a helpful and empathetic AI health assistant for a blood pressure management app. 
    
Patient Context:
- ${bpContext}
- ${recentSummary}
- ${medicationsContext}
- ${conditionsContext}
- ${allergiesContext}
- ${regionContext}

Guidelines:
- Provide helpful, accurate health information about blood pressure management
- Answer questions about medications, lifestyle, diet, and symptoms
- Be empathetic and supportive
- Always recommend consulting a doctor for medical advice
- Never diagnose or prescribe medications
- Keep responses concise but informative
- If asked about specific medical conditions, provide general information only`;

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Call Gemini via REST (matches curl usage)
    const historyText = conversationHistory.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const chatPrompt = `${systemPrompt}\n\nRecent Conversation:\n${historyText}\n\nUSER: ${userMessage}`.trim();
    const chatOut = await geminiGenerateTextREST(CHAT_MODEL, chatPrompt, { temperature: 0.7, maxOutputTokens: 500 });
    return chatOut;
  } catch (error) {
    lastLLMError = error?.response?.data ? JSON.stringify(error.response.data) : (error?.message || String(error));
    console.error('Error generating chat response:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid LLM API key. Please check your .env configuration.');
    } else if (error.status === 429) {
      throw new Error('LLM API rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('LLM service is temporarily unavailable. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to generate chatbot response');
  }
};

// Public AI status helper for diagnostics
export const getAIStatus = () => {
  return {
    openaiConfigured: !!GEMINI_API_KEY,
    openaiReady: !!GEMINI_API_KEY,
    demoMode: DEMO_MODE,
    recModel: REC_MODEL,
    chatModel: CHAT_MODEL,
    transport: 'rest',
    baseURL: `${GEMINI_BASE_URL}/${GEMINI_API_VERSION}`,
    provider: 'gemini',
    lastError: lastLLMError
  };
};

// Lightweight self-test that attempts a minimal completion
export const testOpenAI = async () => {
  try {
    if (!GEMINI_API_KEY) return { ok: false, reason: 'GEMINI_API_KEY missing' };
    const content = await geminiGenerateTextREST(CHAT_MODEL, 'ping', { temperature: 0, maxOutputTokens: 8 });
    return { ok: true, transport: 'rest', content };
  } catch (e) {
    const detail = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || String(e));
    lastLLMError = detail;
    return { ok: false, reason: detail };
  }
};

// Reset and reinitialize OpenAI client (used by /api/chatbot/reinit)
export const resetOpenAI = async () => {
  genAI = null;
  lastLLMError = '';
  return ensureOpenAIReady();
};