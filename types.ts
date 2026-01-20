export interface BatchData {
  code: string;
  productName: string;
  reportUrl: string; // In a real app, this would be the GCS signed URL
  testDate: string;
}

export interface VerificationResult {
  success: boolean;
  data?: BatchData;
  error?: string;
}

export interface UserFormData {
  fullName: string;
  mobile: string;
  email: string;
  batchCode: string;
}

export enum AppView {
  VERIFY = 'VERIFY',
  AI_STUDIO = 'AI_STUDIO'
}
