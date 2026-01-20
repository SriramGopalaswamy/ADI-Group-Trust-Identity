/**
 * REFERENCE ONLY: This is the Backend Logic for Google Cloud Functions.
 * 
 * To deploy:
 * 1. Create a Cloud Function (Node.js 20).
 * 2. Set entry point to `verifyBatch`.
 * 3. Add environment variables: STORAGE_BUCKET_NAME.
 * 4. Create `batch-index.json` in your bucket root.
 */

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

// Validation Helpers
const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.verifyBatch = async (req, res) => {
  // 1. CORS Headers
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const { fullName, mobile, email, batchCode, location } = req.body;

    // 2. Input Validation
    if (!fullName || !mobile || !batchCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ error: 'Invalid Indian mobile number' });
    }

    // Email is optional, but check validity if provided
    if (email && email.trim() !== '' && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 3. Log Request (Structured Logging)
    const entry = {
      timestamp: new Date().toISOString(),
      batchCode,
      email: email || 'NOT_PROVIDED',
      mobile, // PII: In production, consider hashing this
      location: location || 'NOT_PROVIDED',
      userAgent: req.get('user-agent'),
    };
    console.log(JSON.stringify(entry));

    const bucketName = process.env.STORAGE_BUCKET_NAME || 'adi-bharat-reports';
    const bucket = storage.bucket(bucketName);

    // 4. Fetch Batch Index
    const file = bucket.file('batch-index.json');
    const [content] = await file.download();
    const batchIndex = JSON.parse(content.toString());

    const normalizedCode = batchCode.trim().toUpperCase();
    const batchData = batchIndex[normalizedCode];

    if (!batchData) {
      return res.status(404).json({ error: 'Batch code not found' });
    }

    // 5. Generate Signed URL
    const reportFile = bucket.file(batchData.reportPath);
    const [exists] = await reportFile.exists();
    
    if (!exists) {
      console.error(`File missing: ${batchData.reportPath}`);
      return res.status(500).json({ error: 'Report file missing from system' });
    }

    // Configuration for V4 Signed URL
    // MANDATORY FIX: Force download via Content-Disposition
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      responseDisposition: 'attachment; filename="ADI_Bharat_Test_Report.pdf"',
      responseType: 'application/pdf',
    };

    const [url] = await reportFile.getSignedUrl(options);

    // 6. Return Success
    // 'downloadUrl' matches the prompt requirements, mapped to 'reportUrl' for frontend compatibility
    return res.status(200).json({
      success: true,
      downloadUrl: url, 
      data: {
        code: batchData.code,
        productName: batchData.productName,
        testDate: batchData.testDate,
        reportUrl: url
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};