export interface SurveyResponse {
  id: string;
  timestamp: string;
  userId: string;
  userFullName: string;
  entityName: string;
  entityType: 'publica' | 'privada_funciones_publicas';
  municipality: string;
  respondentRole: string;
  q1Cause: string;
  q2Cause: string;
  q3Cause: string;
  complianceLevel: number; // 0 to 100 %
  observations: string;
  syncedToSheets: boolean;
  sheetsRowIndex?: number;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  spreadsheetUrl: string | null;
  lastSyncTimestamp: string | null;
}
