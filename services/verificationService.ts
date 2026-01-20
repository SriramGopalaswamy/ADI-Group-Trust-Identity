import { VerificationResult, BatchData } from '../types';

// Mock database matching the requirements
const BATCH_DATABASE: Record<string, BatchData> = {
  'ADIF5HW825': {
    code: 'ADIF5HW825',
    productName: 'Tomato Pulp',
    reportUrl: '#', // In production, this comes from GCS Signed URL
    testDate: '2025-10-12'
  },
  'ADIT28WS25': {
    code: 'ADIT28WS25',
    productName: 'Wheat Processed',
    reportUrl: '#',
    testDate: '2025-10-15'
  }
};

export const verifyBatch = async (
  batchCode: string,
  mobile: string,
  email: string
): Promise<VerificationResult> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 1. Validation Logic
  const mobileRegex = /^[6-9]\d{9}$/; // Basic India mobile validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!mobileRegex.test(mobile)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // 2. Batch Lookup
  const normalizedCode = batchCode.trim().toUpperCase();
  const batchData = BATCH_DATABASE[normalizedCode];

  if (!batchData) {
    return { success: false, error: 'Batch code not found. Please check the packaging.' };
  }

  // 3. Success
  return {
    success: true,
    data: batchData
  };
};