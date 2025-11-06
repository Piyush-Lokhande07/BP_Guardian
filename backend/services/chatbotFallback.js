/**
 * Fallback responses for chatbot when OpenAI API is not available
 * These are simple pattern-based responses for common health questions
 */

const fallbackResponses = {
  'blood pressure': {
    keywords: ['blood pressure', 'bp', 'hypertension', 'hypotension'],
    response: 'Blood pressure is the force of blood pushing against the walls of your arteries. Normal blood pressure is typically below 120/80 mmHg. High blood pressure (hypertension) is 130/80 mmHg or higher. If you have concerns about your blood pressure, please consult with your doctor.'
  },
  'medication': {
    keywords: ['medication', 'medicine', 'drug', 'prescription', 'pill'],
    response: 'It\'s important to take medications exactly as prescribed by your doctor. Never stop taking medications without consulting your healthcare provider first. If you have questions about your medications, their side effects, or interactions, please discuss them with your doctor or pharmacist.'
  },
  'side effect': {
    keywords: ['side effect', 'side effects', 'adverse', 'reaction'],
    response: 'Common side effects of blood pressure medications may include dizziness, fatigue, headache, or dry cough. If you experience severe side effects like difficulty breathing, chest pain, or severe allergic reactions, seek immediate medical attention. Always report side effects to your doctor.'
  },
  'diet': {
    keywords: ['diet', 'food', 'eat', 'nutrition', 'dash'],
    response: 'The DASH (Dietary Approaches to Stop Hypertension) diet is excellent for blood pressure management. It emphasizes fruits, vegetables, whole grains, lean proteins, and low-fat dairy while limiting sodium, saturated fats, and added sugars. Aim for less than 2,300mg of sodium per day.'
  },
  'exercise': {
    keywords: ['exercise', 'workout', 'physical activity', 'fitness'],
    response: 'Regular exercise is important for blood pressure management. Aim for at least 150 minutes of moderate-intensity exercise per week, such as brisk walking, swimming, or cycling. Always consult your doctor before starting a new exercise program, especially if you have health concerns.'
  },
  'emergency': {
    keywords: ['emergency', 'urgent', 'severe', 'chest pain', 'difficulty breathing'],
    response: 'If you are experiencing a medical emergency, such as chest pain, difficulty breathing, severe headache, or blood pressure above 180/120 mmHg, please call emergency services (911) immediately. Do not delay seeking medical attention for serious symptoms.'
  },
  'lifestyle': {
    keywords: ['lifestyle', 'lifestyle changes', 'healthy living'],
    response: 'Lifestyle changes that can help manage blood pressure include: maintaining a healthy weight, eating a balanced diet low in sodium, exercising regularly, limiting alcohol consumption, managing stress, getting adequate sleep, and avoiding tobacco products.'
  }
};

/**
 * Generate a fallback response based on user message
 */
export const generateFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for keywords in the message
  for (const [category, data] of Object.entries(fallbackResponses)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }
  
  // Default fallback response
  return `I understand you're asking about "${userMessage}". While I can provide general health information, I recommend discussing specific concerns with your doctor. For personalized medical advice, please consult with your healthcare provider. Is there anything else I can help you with regarding your blood pressure monitoring or medications?`;
};

/**
 * Contextual fallback using patient data
 */
export const generateContextualFallbackResponse = ({ latestBPText, medsText, conditionsText }, userMessage) => {
  const intro = 'Here\'s what I can tell based on your recent data:';
  const lines = [
    latestBPText ? `- ${latestBPText}` : null,
    medsText ? `- ${medsText}` : null,
    conditionsText ? `- ${conditionsText}` : null,
  ].filter(Boolean).join('\n');

  const generic = generateFallbackResponse(userMessage);
  return `${generic}\n\n${intro}\n${lines}`.trim();
};

/**
 * Check if OpenAI is configured
 */
export const isOpenAIConfigured = () => {
  return process.env.OPENAI_API_KEY && 
         process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
         process.env.OPENAI_API_KEY.trim() !== '';
};

