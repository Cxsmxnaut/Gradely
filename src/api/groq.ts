export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GroqAPI {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Groq API key not found in environment variables');
    }
  }

  async chatCompletion(messages: GroqMessage[]): Promise<string> {
    try {
      console.log('Groq API: Starting chat completion with messages:', messages);
      
      // Extract user data from the last message if available
      const lastMessage = messages[messages.length - 1];
      let userDataPrompt = '';
      
      // Check if there's user data in the conversation context
      if (lastMessage && lastMessage.content.includes('USER_DATA:')) {
        // Extract user data from the message (this will be added by GradusAPI)
        const userDataMatch = lastMessage.content.match(/USER_DATA:(.*?)(?=MESSAGE:|$)/s);
        if (userDataMatch) {
          userDataPrompt = userDataMatch[1];
        }
      }

      const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Gradus, an AI academic assistant for the Gradely app. You help students with:
- Grade analysis and GPA calculations
- Attendance tracking and patterns
- Study tips and academic guidance
- Gradely app navigation and features
- StudentVUE integration help

${userDataPrompt ? `CURRENT USER DATA:
${userDataPrompt}

IMPORTANT: Use this data to provide personalized, accurate responses. Reference specific grades, attendance rates, and trends when relevant. If the user asks about their performance, use the actual data provided.` : 'No user data available. Provide general guidance and suggest linking StudentVUE for personalized insights.'}

Be helpful, concise, and educational. Always reference actual data when available. If you don't have access to specific data, provide general guidance and suggest linking StudentVUE.`
          },
          ...messages.filter(msg => !msg.content.includes('USER_DATA:')) // Filter out user data messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      };

      console.log('Groq API: Request body:', requestBody);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Groq API: Response status:', response.status);
      console.log('Groq API: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API: Error response:', errorText);
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      console.log('Groq API: Response data:', data);
      
      const content = data.choices[0]?.message?.content;
      console.log('Groq API: Generated content:', content);
      
      if (!content) {
        console.error('Groq API: No content in response');
        throw new Error('No content in Groq API response');
      }
      
      return content;
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async streamChatCompletion(messages: GroqMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors for SSE
            }
          }
        }
      }
    } catch (error) {
      console.error('Groq streaming error:', error);
      throw error;
    }
  }
}

export const groqAPI = new GroqAPI();
