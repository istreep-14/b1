
import { Shift, Coworker, Position } from '../types';
import { SPREADSHEET_ID, SHEET_NAMES } from '../config';

// Type assertion for gapi
declare const gapi: any;

// --- UTILITY FUNCTIONS ---

const getSheetData = async (sheetName: string, range?: string) => {
  const finalRange = range ? `${sheetName}!${range}` : sheetName;
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: finalRange,
  });
  return response.result.values || [];
};

const findRowIndexById = (id: string, data: any[][]): number => {
    // `data` from getSheetData includes the header row at index 0.
    // `findIndex` returns the 0-based index in the array.
    // Sheet rows are 1-based. So, sheet_row = array_index + 1.
    const index = data.findIndex(row => row[0] === id);
    return index + 1; // Convert 0-based array index to 1-based sheet row index.
};


// --- SHIFT MAPPERS ---

const mapRowToShift = (row: any[]): Shift => {
  const tips = parseFloat(row[3]);
  const tipsPerHour = parseFloat(row[5]);

  return {
    id: row[0],
    date: row[0],
    startTime: row[1],
    endTime: row[2],
    tips: isNaN(tips) ? undefined : tips,
    duration: parseFloat(row[4]) || 0,
    tipsPerHour: isNaN(tipsPerHour) ? undefined : tipsPerHour,
    notes: row[6] || '',
    tipOut: parseFloat(row[7]) || 0,
    cashTips: parseFloat(row[8]) || 0,
    creditTips: parseFloat(row[9]) || 0,
    teamOnShift: row[10] && row[10] !== '{}' ? JSON.parse(row[10]) : undefined,
    parties: row[11] && row[11] !== '[]' ? JSON.parse(row[11]) : [],
    hourlyRate: parseFloat(row[12]) || 0,
    wage: parseFloat(row[13]) || 0,
    differential: parseFloat(row[14]) || 0,
    chump: parseFloat(row[15]) || 0,
    chumpGame: row[16] && row[16] !== '[]' ? JSON.parse(row[16]) : undefined,
    wageStartTime: row[17] || undefined,
    wageEndTime: row[18] || undefined,
    differentials: row[19] && row[19] !== '{}' ? JSON.parse(row[19]) : undefined,
  };
};

const mapShiftToRow = (shift: Shift): any[] => [
  shift.date, // Also used as ID
  shift.startTime,
  shift.endTime,
  shift.tips ?? '',
  shift.duration,
  shift.tipsPerHour ?? '',
  shift.notes || '',
  shift.tipOut || 0,
  shift.cashTips || 0,
  shift.creditTips || 0,
  shift.teamOnShift ? JSON.stringify(shift.teamOnShift) : '{}',
  shift.parties ? JSON.stringify(shift.parties) : '[]',
  shift.hourlyRate || 0,
  shift.wage || 0,
  shift.differential || 0,
  shift.chump || 0,
  shift.chumpGame ? JSON.stringify(shift.chumpGame) : '[]',
  shift.wageStartTime || '',
  shift.wageEndTime || '',
  shift.differentials ? JSON.stringify(shift.differentials) : '{}',
];

// --- SHIFT API FUNCTIONS ---

export const getShifts = async (): Promise<Shift[]> => {
  console.log("API: Fetching shifts from Google Sheet");
  const data = await getSheetData(SHEET_NAMES.SHIFTS);
  if (data.length <= 1) return []; // Only header exists
  // Slice(1) to skip header row
  const shifts: Shift[] = data.slice(1).map(mapRowToShift);
  // Sort by date descending
  return shifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addShift = async (newShift: Shift): Promise<Shift> => {
  console.log("API: Adding shift", newShift);
  const range = SHEET_NAMES.SHIFTS;
  const valueRange = {
    majorDimension: 'ROWS',
    values: [mapShiftToRow(newShift)],
  };
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: valueRange,
  });
  return newShift;
};

export const updateShift = async (updatedShift: Shift): Promise<Shift> => {
  console.log("API: Updating shift", updatedShift);
  const allData = await getSheetData(SHEET_NAMES.SHIFTS);
  const rowIndex = findRowIndexById(updatedShift.id, allData);
  if (rowIndex < 2) throw new Error("Shift not found to update.");

  const range = `${SHEET_NAMES.SHIFTS}!A${rowIndex}`;
  const valueRange = {
    majorDimension: 'ROWS',
    values: [mapShiftToRow(updatedShift)],
  };
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: valueRange,
  });
  return updatedShift;
};

export const deleteShift = async (shiftId: string): Promise<{ id: string }> => {
  console.log("API: Deleting shift", shiftId);
  const allData = await getSheetData(SHEET_NAMES.SHIFTS);
  const rowIndex = findRowIndexById(shiftId, allData);
   if (rowIndex < 2) throw new Error("Shift not found to delete.");

  const sheetIdResponse = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = sheetIdResponse.result.sheets.find((s: any) => s.properties.title === SHEET_NAMES.SHIFTS);
  if (!sheet) throw new Error(`Sheet with name ${SHEET_NAMES.SHIFTS} not found`);
  const sheetId = sheet.properties.sheetId;

  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });
  return { id: shiftId };
};


// --- COWORKER MAPPERS ---

const mapRowToCoworker = (row: any[]): Coworker => ({
    id: row[0],
    name: row[1],
    firstName: row[2],
    lastName: row[3],
    positions: row[4] ? row[4].split(',').map((p: string) => p.trim() as Position) : [],
    manager: row[5] === 'TRUE',
    isUser: row[6] === 'TRUE',
    avatarUrl: row[7] || undefined,
});

const mapCoworkerToRow = (coworker: Coworker): any[] => [
    coworker.id,
    coworker.name,
    coworker.firstName,
    coworker.lastName,
    coworker.positions.join(', '),
    coworker.manager,
    coworker.isUser || false,
    coworker.avatarUrl || '',
];

// --- COWORKER API FUNCTIONS ---

export const getCoworkers = async (): Promise<Coworker[]> => {
  console.log("API: Fetching coworkers from Google Sheet");
  const data = await getSheetData(SHEET_NAMES.COWORKERS);
  if (data.length <= 1) return [];
  const coworkers: Coworker[] = data.slice(1).map(mapRowToCoworker);
  return coworkers.sort((a, b) => a.firstName.localeCompare(b.firstName));
};

export const addCoworker = async (newCoworker: Coworker): Promise<Coworker> => {
  console.log("API: Adding coworker", newCoworker);
  // Check for duplicate ID before adding
  const allData = await getSheetData(SHEET_NAMES.COWORKERS);
  if (allData.slice(1).some(row => row[0] === newCoworker.id)) {
    throw new Error("A coworker with this ID already exists.");
  }

  const valueRange = { values: [mapCoworkerToRow(newCoworker)] };
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAMES.COWORKERS,
    valueInputOption: 'USER_ENTERED',
    resource: valueRange,
  });
  return newCoworker;
};

export const updateCoworker = async (updatedCoworker: Coworker): Promise<Coworker> => {
    console.log("API: Updating coworker", updatedCoworker);
    const allData = await getSheetData(SHEET_NAMES.COWORKERS);
    const rowIndex = findRowIndexById(updatedCoworker.id, allData);
    if (rowIndex < 2) throw new Error("Coworker not found to update.");

    const range = `${SHEET_NAMES.COWORKERS}!A${rowIndex}`;
    const valueRange = { values: [mapCoworkerToRow(updatedCoworker)] };
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: valueRange,
    });
    return updatedCoworker;
};

export const deleteCoworker = async (coworkerId: string): Promise<{ id: string }> => {
    console.log("API: Deleting coworker", coworkerId);
    const allData = await getSheetData(SHEET_NAMES.COWORKERS);
    const rowIndex = findRowIndexById(coworkerId, allData);
    if (rowIndex < 2) throw new Error("Coworker not found to delete.");

    const sheetIdResponse = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = sheetIdResponse.result.sheets.find((s: any) => s.properties.title === SHEET_NAMES.COWORKERS);
    if (!sheet) throw new Error(`Sheet with name ${SHEET_NAMES.COWORKERS} not found`);
    const sheetId = sheet.properties.sheetId;

    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex,
                    },
                },
            }],
        },
    });
    return { id: coworkerId };
};
