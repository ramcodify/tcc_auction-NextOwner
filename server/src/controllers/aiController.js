import { processAIChat } from '../services/aiAssistantService.js';

export const handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message is required.' });
    }

    const response = await processAIChat({
      message,
      user: req.user || null
    });

    return res.status(200).json({
      status: 'success',
      ...response
    });
  } catch (error) {
    console.error('[handleAIChat Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
