import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  predictPrice,
  generateDescription,
  getRecommendations,
  chatbot,
  analyzeSentiment,
  recognizeToy,
} from '../lib/ai';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Predict toy price
app.post('/predict-price', authMiddleware, async (c) => {
  try {
    const toyData = await c.req.json();

    const result = await predictPrice(toyData);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Predict price API error', error);
    return c.json({
      error: 'Failed to predict price',
      message: error.message,
    }, 500);
  }
});

// Generate toy description
app.post('/generate-description', authMiddleware, async (c) => {
  try {
    const toyData = await c.req.json();

    const result = await generateDescription(toyData);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Generate description API error', error);
    return c.json({
      error: 'Failed to generate description',
      message: error.message,
    }, 500);
  }
});

// Get personalized recommendations
app.post('/recommendations', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userData = await c.req.json();

    const result = await getRecommendations({
      ...userData,
      userId: user.id,
    });

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Recommendations API error', error);
    return c.json({
      error: 'Failed to get recommendations',
      message: error.message,
    }, 500);
  }
});

// Chatbot endpoint
app.post('/chatbot', async (c) => {
  try {
    const { message, conversationHistory } = await c.req.json();

    const result = await chatbot(message, conversationHistory);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Chatbot API error', error);
    return c.json({
      error: 'Failed to get chatbot response',
      message: error.message,
    }, 500);
  }
});

// Analyze review sentiment
app.post('/analyze-sentiment', authMiddleware, async (c) => {
  try {
    const { review } = await c.req.json();

    const result = await analyzeSentiment(review);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Analyze sentiment API error', error);
    return c.json({
      error: 'Failed to analyze sentiment',
      message: error.message,
    }, 500);
  }
});

// Recognize toy from image
app.post('/recognize-toy', authMiddleware, async (c) => {
  try {
    const { imageUrl } = await c.req.json();

    const result = await recognizeToy(imageUrl);

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    logError('Recognize toy API error', error);
    return c.json({
      error: 'Failed to recognize toy',
      message: error.message,
    }, 500);
  }
});

export { app as aiRoutes };
