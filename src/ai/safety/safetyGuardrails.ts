import { AISafetyReport } from '../../types';

export interface SafetyCheckResult {
  safe: boolean;
  flaggedReason?: 'harassment' | 'sexual' | 'threat' | 'impersonation_claim' | 'private_info' | 'other';
  sanitizedText?: string;
  enforceAiDisclosure?: boolean;
}

export class SafetyGuardrails {
  private safetyReports: AISafetyReport[] = [];

  /**
   * Scans fan input before processing
   */
  public scanFanInput(input: string): SafetyCheckResult {
    const text = input.toLowerCase();

    // Sexual / Threat / Harassment keywords check
    const prohibitedKeywords = ['kill', 'threat', 'nude', 'exploit', 'hacker', 'ssn', 'credit card'];
    for (const kw of prohibitedKeywords) {
      if (text.includes(kw)) {
        return {
          safe: false,
          flaggedReason: 'harassment',
          sanitizedText: 'I cannot respond to inappropriate or unsafe content.'
        };
      }
    }

    // Asking for private contact info
    if (text.includes('home address') || text.includes('phone number') || text.includes('ssn')) {
      return {
        safe: false,
        flaggedReason: 'private_info',
        sanitizedText: 'I am unable to share or process private personal contact details.'
      };
    }

    return { safe: true };
  }

  /**
   * Scans AI response output before speaking/rendering to enforce guardrails
   */
  public enforceResponseGuardrails(aiText: string): string {
    let text = aiText;

    // Guardrail: Never claim to be the real human Shemar Moore
    if (text.toLowerCase().includes('i am the real shemar') || text.toLowerCase().includes("i'm the real shemar")) {
      text = text.replace(/i am the real shemar/gi, "You're chatting with Shemar AI, an AI-powered representation");
      text = text.replace(/i'm the real shemar/gi, "You're chatting with Shemar AI, an AI-powered representation");
    }

    // Force disclosure response if fan asks "are you real?"
    if (text.toLowerCase().includes('are you real')) {
      return "You're chatting with Shemar AI, an AI-powered representation of Shemar Moore created with authorized digital avatar technology.";
    }

    return text;
  }

  public reportAbuse(report: Omit<AISafetyReport, 'id' | 'createdAt' | 'status'>): AISafetyReport {
    const newReport: AISafetyReport = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.safetyReports.push(newReport);
    return newReport;
  }

  public getReports(): AISafetyReport[] {
    return [...this.safetyReports];
  }
}

export const safetyGuardrails = new SafetyGuardrails();
