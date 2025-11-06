import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { generateChatResponse, getAIStatus, testOpenAI, ensureOpenAIReady, resetOpenAI } from '../services/aiService.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/chatbot/message
// @desc    Send a message to the chatbot and get AI response
// @access  Private (Patient only)
router.post('/message', [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can use the chatbot'
      });
    }

    const { message } = req.body;

    // Save user message
    const userMessage = await ChatMessage.create({
      patientId: req.user._id,
      role: 'user',
      content: message
    });

    // Get conversation history (last 20 messages)
    const conversationHistory = await ChatMessage.find({
      patientId: req.user._id
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .then(messages => messages.reverse().map(msg => ({
        role: msg.role,
        content: msg.content
      })));

    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateChatResponse(
        req.user._id,
        message,
        conversationHistory
      );
    } catch (error) {
      // If AI service fails, provide a helpful fallback response
      aiResponse = `I apologize, but I'm having trouble connecting to the AI service right now. ${error.message || 'Please try again later or contact support.'} For urgent medical questions, please consult with your doctor immediately.`;
    }

    // Save AI response
    const assistantMessage = await ChatMessage.create({
      patientId: req.user._id,
      role: 'assistant',
      content: aiResponse
    });

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate chatbot response'
    });
  }
});

// @route   GET /api/chatbot/history
// @desc    Get chat history for current patient
// @access  Private (Patient only)
router.get('/history', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can view chat history'
      });
    }

    const limit = parseInt(req.query.limit) || 50;

    const messages = await ChatMessage.find({
      patientId: req.user._id
    })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Reverse to show chronological order
    messages.reverse();

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/chatbot/history
// @desc    Clear chat history
// @access  Private (Patient only)
router.delete('/history', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can clear chat history'
      });
    }

    await ChatMessage.deleteMany({
      patientId: req.user._id
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

// Diagnostics: Check AI configuration and readiness
router.get('/diagnostics', (req, res) => {
  try {
    const status = getAIStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to read AI status' });
  }
});

// Self-test: perform a tiny live chat completion
router.get('/self-test', async (req, res) => {
  try {
    await ensureOpenAIReady();
    const result = await testOpenAI();
    res.json({ success: result.ok, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message || 'Self-test failed' });
  }
});

// Reinitialize OpenAI client after updating API key
router.post('/reinit', async (req, res) => {
  try {
    const ok = await resetOpenAI();
    const status = getAIStatus();
    res.json({ success: ok, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message || 'Reinit failed' });
  }
});

