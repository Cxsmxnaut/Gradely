import { groqAPI, GroqMessage } from './groq';
import { Course, AttendanceRecord } from '@/types';

export interface UserData {
  courses: Course[];
  attendance: AttendanceRecord[];
  gpaResult: {
    weightedGPA: number;
    unweightedGPA: number;
    totalCredits: number;
  };
}

export interface GradusResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

export class GradusAPI {
  private static instance: GradusAPI;

  static getInstance(): GradusAPI {
    if (!GradusAPI.instance) {
      GradusAPI.instance = new GradusAPI();
    }
    return GradusAPI.instance;
  }

  async sendMessage(message: string, userData?: UserData): Promise<GradusResponse> {
    try {
      console.log('GradusAPI: Processing message:', message);
      
      // Prepare user data context if available
      let userDataString = '';
      if (userData) {
        userDataString = `
USER_DATA:
Courses: ${userData.courses.map(c => `${c.name}: ${c.currentGrade}% (${c.letterGrade})`).join(', ')}
GPA: ${userData.gpaResult.weightedGPA} (weighted), ${userData.gpaResult.unweightedGPA} (unweighted)
Attendance: ${userData.attendance.length} records
Recent Attendance: ${userData.attendance.slice(-5).map(a => `${a.date}: ${a.status}`).join(', ')}

MESSAGE: ${message}
        `;
      }

      const messages: GroqMessage[] = [
        {
          role: 'user',
          content: userDataString || message
        }
      ];

      console.log('GradusAPI: Sending to Groq with user data:', !!userData);
      
      const response = await groqAPI.chatCompletion(messages);
      
      console.log('GradusAPI: Received response:', response);

      // Parse response for suggestions and actions
      const suggestions = this.extractSuggestions(response);
      const actions = this.extractActions(response);

      return {
        message: response,
        suggestions,
        actions
      };

    } catch (error) {
      console.error('GradusAPI: Error processing message:', error);
      throw error;
    }
  }

  async streamMessage(
    message: string, 
    onChunk: (chunk: string) => void,
    userData?: UserData
  ): Promise<void> {
    try {
      console.log('GradusAPI: Starting stream for message:', message);
      
      // Prepare user data context if available
      let userDataString = '';
      if (userData) {
        userDataString = `
USER_DATA:
Courses: ${userData.courses.map(c => `${c.name}: ${c.currentGrade}% (${c.letterGrade})`).join(', ')}
GPA: ${userData.gpaResult.weightedGPA} (weighted), ${userData.gpaResult.unweightedGPA} (unweighted)
Attendance: ${userData.attendance.length} records
Recent Attendance: ${userData.attendance.slice(-5).map(a => `${a.date}: ${a.status}`).join(', ')}

MESSAGE: ${message}
        `;
      }

      const messages: GroqMessage[] = [
        {
          role: 'user',
          content: userDataString || message
        }
      ];

      await groqAPI.streamChatCompletion(messages, onChunk);
      
    } catch (error) {
      console.error('GradusAPI: Error streaming message:', error);
      throw error;
    }
  }

  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for suggestion patterns
    const suggestionPatterns = [
      /suggestion:\s*(.+?)(?:\n|$)/gi,
      /try:\s*(.+?)(?:\n|$)/gi,
      /consider:\s*(.+?)(?:\n|$)/gi
    ];

    for (const pattern of suggestionPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        suggestions.push(...matches.map(m => m.replace(/^(suggestion|try|consider):\s*/i, '').trim()));
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  private extractActions(response: string): Array<{ label: string; action: string }> {
    const actions: Array<{ label: string; action: string }> = [];
    
    // Look for action patterns
    const actionPatterns = [
      /action:\s*(.+?)(?:\n|$)/gi,
      /click here to:\s*(.+?)(?:\n|$)/gi
    ];

    for (const pattern of actionPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        actions.push(...matches.map(m => {
          const actionText = m.replace(/^(action|click here to):\s*/i, '').trim();
          return {
            label: actionText,
            action: actionText.toLowerCase().replace(/\s+/g, '-')
          };
        }));
      }
    }

    return actions.slice(0, 3); // Limit to 3 actions
  }
}

export const gradusAPI = GradusAPI.getInstance();
