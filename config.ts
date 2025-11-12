// IMPORTANT: Replace these placeholder values with your actual Google Cloud project credentials.

// 1. Get your API Key:
//    - Go to https://console.cloud.google.com/apis/credentials
//    - Click "CREATE CREDENTIALS" -> "API key"
export const API_KEY = 'AIzaSyB3iMcfWmxEnIxi6pITwuJMyk2AR8ld2fs';

// 2. Get your Client ID:
//    - Go to https://console.cloud.google.com/apis/credentials
//    - Click "CREATE CREDENTIALS" -> "OAuth client ID"
//    - Select "Web application"
//    - Add your app's origin to "Authorized JavaScript origins" (e.g., http://localhost:3000)
export const CLIENT_ID = '902909672541-as7i48k2v61jr05j9h3q6s226d6ik0jo.apps.googleusercontent.com';

// 3. Get your Spreadsheet ID:
//    - Create a new Google Sheet.
//    - The ID is in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
export const SPREADSHEET_ID = '1eeSV0xt6b9I1Tezn0McHsB1jZa6qXctQFFK-tL6m56E';

// 4. Set the scopes for the Google Sheets API.
export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// 5. Define the names of the sheets (tabs) in your spreadsheet.
//    Make sure these exactly match the names in your Google Sheet.
export const SHEET_NAMES = {
  SHIFTS: 'Shifts',
  COWORKERS: 'Coworkers',
};
