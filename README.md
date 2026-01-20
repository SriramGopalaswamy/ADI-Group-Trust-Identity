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

## 3. Deployment
1. **Frontend**: Deploy the React app to Firebase Hosting or Vercel.
2. **Backend**: Deploy the code in `backend/cloud_function.js` to Google Cloud Functions.
3. **Connect**: Update `services/verificationService.ts` to call your real Cloud Function URL instead of the mock logic.

## 4. Gemini Feature
Ensure `process.env.API_KEY` is set in your frontend environment variables with a valid Google Gemini API key that has access to `gemini-2.5-flash-image`.
