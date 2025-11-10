import { GoogleGenerativeAI } from '@google/generative-ai';
import BPReading from '../models/BPReading.js';
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import { generateFallbackResponse, generateContextualFallbackResponse } from './chatbotFallback.js';
import 'dotenv/config';

// Initialize Gemini client
let gemini = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_REC_MODEL = process.env.GEMINI_REC_MODEL || 'gemini-2.5-flash';
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
let lastGeminiError = '';

if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  try {
    gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
    lastGeminiError = error.message || String(error);
  }
}

const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && GEMINI_API_KEY !== 'your-gemini-api-key-here';
};

const DEMO_MODE = (process.env.DEMO_MODE || '').toString().toLowerCase() === 'true';

// Ensure Gemini is initialized
export const ensureGeminiReady = async () => {
  if (gemini) return true;
  if (!isGeminiConfigured()) {
    lastGeminiError = 'API key missing or invalid';
    return false;
  }
  try {
    gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
    return true;
  } catch (e) {
    lastGeminiError = `Init: ${e?.message || String(e)}`;
    return false;
  }
};

// Generate medication recommendations based on patient data
export const generateRecommendation = async (patientId) => {
  try {
    // Ensure Gemini is ready
    await ensureGeminiReady();
    
    // Use Gemini if configured, otherwise fallback to heuristic
    const useGemini = isGeminiConfigured() && gemini && !DEMO_MODE;
    const useHeuristic = !useGemini;

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

      return {
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
    }

    // Create AI prompt for Gemini
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
- Confidence should reflect certainty level (0-100)
- Output ONLY valid JSON, no additional text or markdown`;

    // Call Gemini API
    const model = gemini.getGenerativeModel({ model: GEMINI_REC_MODEL });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
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
      console.error('Error parsing Gemini response:', parseError);
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

    return {
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
      aiModel: GEMINI_REC_MODEL,
      aiPrompt: prompt
    };
  } catch (error) {
    console.error('Error generating recommendation:', error);
    
    // Handle specific Gemini errors
    if (error.message?.includes('API key') || error.message?.includes('quota')) {
      throw new Error('Gemini API error. Please check your API key and quota.');
    }
    
    throw error;
  }
};

// Chatbot response generation
export const generateChatResponse = async (patientId, userMessage, conversationHistory = []) => {
  try {
    // Ensure Gemini is ready
    await ensureGeminiReady();
    
    // Use Gemini if configured, otherwise fallback
    const useGemini = isGeminiConfigured() && gemini && !DEMO_MODE;
    
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

    // If no AI service configured or demo mode, use contextual fallback
    if (!useGemini || DEMO_MODE) {
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
- NEVER diagnose or prescribe medications
- Keep responses concise but informative
- If asked about specific medical conditions, provide general information only
- Focus on lifestyle guidance: exercise, diet, stress management, sleep hygiene
- Never provide specific medication dosages or prescriptions`;

    // Build conversation history
    const conversationText = conversationHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    
    // Build prompt with context
    const chatPrompt = `${systemPrompt}

Conversation History:
${conversationText || 'No previous conversation'}

User: ${userMessage}

Assistant:`;

    // Call Gemini API
    const model = gemini.getGenerativeModel({ model: GEMINI_CHAT_MODEL });
    const result = await model.generateContent(chatPrompt);
    return result.response.text();
  } catch (error) {
    lastGeminiError = error?.message || String(error);
    console.error('Error generating chat response:', error);
    
    // Handle specific Gemini errors
    if (error.message?.includes('API key') || error.message?.includes('quota')) {
      throw new Error('Gemini API error. Please check your API key and quota.');
    }
    
    throw new Error(error.message || 'Failed to generate chatbot response');
  }
};

// Public AI status helper for diagnostics
export const getAIStatus = () => {
  return {
    geminiConfigured: isGeminiConfigured(),
    geminiReady: !!gemini,
    geminiRecModel: GEMINI_REC_MODEL,
    geminiChatModel: GEMINI_CHAT_MODEL,
    demoMode: DEMO_MODE,
    lastError: lastGeminiError
  };
};

// Lightweight self-test that attempts a minimal completion
export const testOpenAI = async () => {
  try {
    if (!isGeminiConfigured()) return { ok: false, reason: 'API key missing' };
    await ensureGeminiReady();
    const model = gemini.getGenerativeModel({ model: GEMINI_CHAT_MODEL });
    const result = await model.generateContent('ping');
    return { ok: true, transport: 'gemini', content: result.response.text() };
  } catch (e) {
    const detail = e?.message || String(e);
    lastGeminiError = detail;
    return { ok: false, reason: detail };
  }
};

// Reset and reinitialize Gemini client
export const resetOpenAI = async () => {
  gemini = null;
  lastGeminiError = '';
  return ensureGeminiReady();
};

// For backward compatibility
export const ensureOpenAIReady = ensureGeminiReady;
