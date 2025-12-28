import Anthropic from '@anthropic-ai/sdk';
import { logInfo, logError } from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Price prediction using AI
export async function predictPrice(toyData: {
  title: string;
  description: string;
  category: string;
  brand: string;
  condition: string;
  ageRange: string;
  originalPrice?: number;
}) {
  try {
    const prompt = `You are a toy pricing expert. Based on the following toy details, predict a fair market price in Indian Rupees (₹).

Toy Details:
- Title: ${toyData.title}
- Description: ${toyData.description}
- Category: ${toyData.category}
- Brand: ${toyData.brand}
- Condition: ${toyData.condition}
- Age Range: ${toyData.ageRange}
${toyData.originalPrice ? `- Original Price: ₹${toyData.originalPrice}` : ''}

Consider factors like:
1. Brand reputation
2. Toy condition
3. Market demand
4. Age appropriateness
5. Original price (if available)
6. Similar toys in the market

Provide:
1. Recommended selling price
2. Price range (min-max)
3. Brief reasoning

Format your response as JSON:
{
  "recommendedPrice": number,
  "minPrice": number,
  "maxPrice": number,
  "reasoning": "string"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      
      logInfo('Price predicted', {
        toyTitle: toyData.title,
        recommendedPrice: result.recommendedPrice,
      });

      return { success: true, data: result };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Price prediction error', error);
    return { success: false, error: error.message };
  }
}

// Generate toy description
export async function generateDescription(toyData: {
  title: string;
  category: string;
  brand: string;
  ageRange: string;
  features?: string[];
}) {
  try {
    const prompt = `Generate an engaging and detailed product description for this toy:

Toy Details:
- Title: ${toyData.title}
- Category: ${toyData.category}
- Brand: ${toyData.brand}
- Age Range: ${toyData.ageRange}
${toyData.features ? `- Features: ${toyData.features.join(', ')}` : ''}

Write a compelling description that:
1. Highlights key features and benefits
2. Explains educational value
3. Describes what makes it special
4. Appeals to Indian parents
5. Is 100-150 words long

Write in a friendly, engaging tone.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      logInfo('Description generated', { toyTitle: toyData.title });
      return { success: true, data: content.text };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Description generation error', error);
    return { success: false, error: error.message };
  }
}

// Smart toy recommendations
export async function getRecommendations(userData: {
  recentViews: string[];
  recentPurchases: string[];
  wishlist: string[];
  preferences?: {
    categories?: string[];
    brands?: string[];
    priceRange?: { min: number; max: number };
  };
}) {
  try {
    const prompt = `Based on the user's activity, recommend 10 toys they might like:

User Activity:
- Recently Viewed: ${userData.recentViews.join(', ')}
- Recent Purchases: ${userData.recentPurchases.join(', ')}
- Wishlist: ${userData.wishlist.join(', ')}
${userData.preferences ? `- Preferences: ${JSON.stringify(userData.preferences)}` : ''}

Provide recommendations considering:
1. User's browsing history
2. Purchase patterns
3. Wishlist items
4. Similar products
5. Trending toys
6. Age-appropriate options

Return as JSON array of toy IDs with reasoning:
[
  {
    "toyId": "string",
    "reason": "string",
    "confidence": number (0-1)
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const recommendations = JSON.parse(content.text);
      
      logInfo('Recommendations generated', {
        count: recommendations.length,
      });

      return { success: true, data: recommendations };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Recommendations error', error);
    return { success: false, error: error.message };
  }
}

// Chatbot for customer support
export async function chatbot(message: string, conversationHistory: any[] = []) {
  try {
    const systemPrompt = `You are a helpful customer support assistant for Toy Marketplace India, a platform for buying and selling pre-loved toys.

Your role:
1. Answer questions about the platform
2. Help with orders, payments, and shipping
3. Provide toy recommendations
4. Assist with account issues
5. Be friendly and professional
6. Use simple language
7. Be culturally sensitive to Indian context

Platform features:
- Buy and sell pre-loved toys
- Secure payments via Razorpay
- Cash on Delivery available
- Shipping across India
- Quality verified toys
- Safe and trusted platform

Always be helpful, concise, and friendly.`;

    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as any,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      logInfo('Chatbot response generated');
      return { success: true, data: content.text };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Chatbot error', error);
    return { success: false, error: error.message };
  }
}

// Sentiment analysis for reviews
export async function analyzeSentiment(review: string) {
  try {
    const prompt = `Analyze the sentiment of this product review:

Review: "${review}"

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Sentiment score (-1 to 1)
3. Key aspects mentioned (quality, value, shipping, etc.)
4. Brief summary

Format as JSON:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number,
  "aspects": {
    "quality": number,
    "value": number,
    "shipping": number
  },
  "summary": "string"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      
      logInfo('Sentiment analyzed', {
        sentiment: result.sentiment,
        score: result.score,
      });

      return { success: true, data: result };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Sentiment analysis error', error);
    return { success: false, error: error.message };
  }
}

// Image recognition for toy categorization
export async function recognizeToy(imageUrl: string) {
  try {
    const prompt = `Analyze this toy image and provide:

1. Toy type/category
2. Estimated age range
3. Possible brand (if recognizable)
4. Condition assessment
5. Key features visible
6. Suggested title
7. Suggested description

Format as JSON:
{
  "category": "string",
  "ageRange": "string",
  "brand": "string",
  "condition": "string",
  "features": ["string"],
  "suggestedTitle": "string",
  "suggestedDescription": "string"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      
      logInfo('Toy recognized', {
        category: result.category,
        brand: result.brand,
      });

      return { success: true, data: result };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: any) {
    logError('Toy recognition error', error);
    return { success: false, error: error.message };
  }
}
