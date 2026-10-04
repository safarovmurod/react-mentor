export interface TutorSource {
  questionId: string;
  topicId: string;
  title: string;
  file: string;
  sourceId: string;
}

export function isDeepFollowUp(text: string): boolean {
  return /^(?:ч[уқукӯ]+ур(?:тар)?\s*(?:фаҳмон|фахмон)?|глубже|подробнее|объясни подробнее|deeper|explain more|expand)[.!?\s]*$/i.test(text.trim())
    || /^саволи пешинаро(?:\s|$)/i.test(text.trim());
}

export function wantsDeepExplanation(text: string): boolean {
  return /ч[уқукӯ]+ур|муфассал|подробн|глубже|in depth|deeper|explain more/i.test(text);
}
