export type ContactRole = 'farmer' | 'partner' | 'investor_press' | 'feedback' | 'other';

export interface ContactRequest {
  name: string;
  email: string;
  role: ContactRole;
  message: string;
}

export interface ContactResponse {
  id: number;
  received: boolean;
}
