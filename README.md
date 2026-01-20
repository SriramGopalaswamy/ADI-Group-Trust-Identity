# ADI Bharat System Setup

## 1. Google Cloud Storage Structure
Create a bucket named `adi-bharat-reports`.

**Folder Structure:**
```
/adi-bharat-reports
  /batch-index.json
  /products
    /tomato-pulp
      /ADIF5HW825_Analysis.pdf
    /wheat-processed
      /ADIT28WS25_Analysis.pdf
```

## 2. Batch Index Mapping (`batch-index.json`)
Upload this file to the root of your bucket.

```json
{
  "ADIF5HW825": {
    "code": "ADIF5HW825",
    "productName": "Tomato Pulp",
    "testDate": "2025-10-12",
    "reportPath": "products/tomato-pulp/ADIF5HW825_Analysis.pdf"
  },
  "ADIT28WS25": {
    "code": "ADIT28WS25",
    "productName": "Wheat Processed",
    "testDate": "2025-10-15",
    "reportPath": "products/wheat-processed/ADIT28WS25_Analysis.pdf"
  }
}
```

## 3. Storage CORS Configuration (MANDATORY)
**CRITICAL:** To allow browsers to download files via signed URLs, you MUST apply this CORS policy to your bucket. Without this, the download button may fail silently.

1. Create a file named `cors.json`:
```json
[
    {
      "origin": ["*"],
      "method": ["GET", "HEAD", "OPTIONS"],
      "responseHeader": ["Content-Type", "Content-Disposition"],
      "maxAgeSeconds": 3600
    }
]
```
2. Run this command in Google Cloud Shell:
```bash
gcloud storage buckets update gs://adi-bharat-reports --cors-file=cors.json
```

## 4. Deployment
1. **Frontend**: Deploy the React app to Firebase Hosting or Vercel.
2. **Backend**: Deploy the code in `backend/cloud_function.js` to Google Cloud Functions.
3. **Connect**: Update `services/verificationService.ts` to call your real Cloud Function URL instead of the mock logic.

## 5. Gemini Feature
Ensure `process.env.API_KEY` is set in your frontend environment variables with a valid Google Gemini API key that has access to `gemini-2.5-flash-image`.
