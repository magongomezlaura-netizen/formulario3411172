import { SurveyResponse } from '../types/survey';

export const SHEET_COLUMNS = [
  'Marca Temporal',
  'ID Usuario',
  'Nombre Usuario / Investigador',
  'Nombre de la Entidad',
  'Tipo de Entidad',
  'Municipio (Valle del Cauca)',
  'Cargo / Rol',
  'Pregunta 1: Causa Principal de Incumplimiento',
  'Pregunta 2: Mayor Obstáculo Operativo',
  'Pregunta 3: Causa Prioritaria de Intervención',
  'Nivel Estimado de Cumplimiento (%)',
  'Observaciones y Diagnóstico Adicional'
];

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export async function createGoogleSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<CreateSheetResult> {
  const title = customTitle || `Diagnóstico Gestión Documental Ley 594 - Valle del Cauca (${new Date().toLocaleDateString('es-CO')})`;
  
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: 'Respuestas Ley 594',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    if (errorText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || createRes.status === 403) {
      throw new Error(
        'Permisos insuficientes de Google Sheets. Cierre sesión e inicie sesión de nuevo, asegurándose de autorizar los permisos para gestionar hojas de cálculo en la ventana de Google.'
      );
    }
    throw new Error(`Error al crear la hoja de cálculo (${createRes.status}): ${errorText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row
  await appendRowsToSpreadsheet(accessToken, spreadsheetId, [SHEET_COLUMNS], 'Respuestas Ley 594');

  // Format header row (Emerald styling)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets?.[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.05, green: 0.45, blue: 0.35 }, // Emerald green
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 10
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetData.sheets?.[0]?.properties?.sheetId || 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: SHEET_COLUMNS.length
              }
            }
          }
        ]
      })
    });
  } catch (fmtError) {
    console.warn('No se pudo aplicar formato enriquecido a la hoja, pero la cabecera fue creada con éxito:', fmtError);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title
  };
}

export function formatResponseRow(r: SurveyResponse): string[] {
  return [
    r.timestamp,
    r.userId,
    r.userFullName,
    r.entityName,
    r.entityType === 'publica' ? 'Pública' : 'Privada con funciones públicas',
    r.municipality,
    r.respondentRole,
    r.q1Cause,
    r.q2Cause,
    r.q3Cause,
    `${r.complianceLevel}%`,
    r.observations || 'Sin observaciones adicionales'
  ];
}

export async function appendRowsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  rows: (string | number)[][],
  sheetTab = 'Respuestas Ley 594'
): Promise<any> {
  // First, verify tab name by checking spreadsheet metadata or fallback to default
  const encodedTab = encodeURIComponent(sheetTab);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTab}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: `${sheetTab}!A1`,
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (err.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || response.status === 403) {
      throw new Error(
        'Permisos insuficientes de Google Sheets. Cierre sesión y vuelva a iniciar sesión con Google para conceder permisos.'
      );
    }
    // If the specific tab name failed, attempt appending to default first sheet
    if (response.status === 400 || response.status === 404) {
      const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: rows
        })
      });
      if (!fallbackRes.ok) {
        const fallbackErr = await fallbackRes.text();
        throw new Error(`Error al enviar datos a Google Sheets: ${fallbackErr}`);
      }
      return await fallbackRes.json();
    }
    throw new Error(`Error al enviar datos a Google Sheets: ${err}`);
  }

  return await response.json();
}

export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheets: string[] }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`No se pudo verificar la hoja de cálculo (${res.status})`);
  }

  const data = await res.json();
  const title = data.properties?.title || 'Hoja de cálculo';
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title);
  return { title, sheets };
}
