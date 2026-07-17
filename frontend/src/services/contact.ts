import apiClient from '@/services/api';
import type { ContactRequest, ContactResponse } from '@/types/contact';

export async function submitContactMessage(input: ContactRequest): Promise<ContactResponse> {
  const response = await apiClient.post<ContactResponse>('/contact', input);
  return response.data;
}
