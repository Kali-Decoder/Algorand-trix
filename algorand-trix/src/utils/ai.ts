import OpenAI from 'openai';

const HYPERBOLIC_API_KEY = process.env.HYPERBOLIC_API_KEY;

export const aiClient = new OpenAI({
  apiKey: HYPERBOLIC_API_KEY,
  baseURL: 'https://api.hyperbolic.xyz/v1',
});

export async function queryLLM(prompt: string) {
  try {
    if (!HYPERBOLIC_API_KEY) {
      console.error('Error: Hyperbolic API key is missing.');
      throw new Error('Hyperbolic API key is missing. Please set HYPERBOLIC_API_KEY in your environment variables.');
    }

    console.log(prompt)
    const response = await aiClient.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3-70B-Instruct',
      messages: [{ role: 'system', content: 'You are a DeFi assistant.' }, { role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() || 'No response';
  } catch (error: any) {
    console.error('LLM Query Error:', error);
    
    // Handle specific HTTP status codes
    if (error?.status === 402) {
      throw new Error('Payment required: Your Hyperbolic API account may need billing setup or has insufficient credits. Please check your account status.');
    } else if (error?.status === 401) {
      throw new Error('Unauthorized: Invalid API key. Please check your HYPERBOLIC_API_KEY environment variable.');
    } else if (error?.status === 429) {
      throw new Error('Rate limit exceeded: Too many requests. Please try again later.');
    } else if (error?.message) {
      throw new Error(`AI processing failed: ${error.message}`);
    } else {
      throw new Error('AI processing failed. Please check your API configuration and try again.');
    }
  }
}
