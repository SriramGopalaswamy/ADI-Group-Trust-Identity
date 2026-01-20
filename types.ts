export interface BatchTraceability {
  l1_producer: string; // e.g., "Adi Bharat E-Tech - Plant A"
  l2_product: string;  // e.g., "Tomato Pulp - 400gm"
  l3_source: string;   // e.g., "Farmer Code 02 / Supplier Pandian"
  l4_lab: string;      // e.g., "BARC / Report #0456"
}

export interface BatchData {
  code: string;
  productName: string;
  reportUrl: string; // The GCS signed URL or Drive Link
  testDate: string;
  labName: string;   // e.g. "Bangalore Analytical Research Centre"
  reportNumber: string; // e.g. "BARC/FD/25/09/0456"
  traceability?: BatchTraceability;
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
  location?: string;
}

export enum AppView {
  VERIFY = 'VERIFY',
  AI_STUDIO = 'AI_STUDIO'
}