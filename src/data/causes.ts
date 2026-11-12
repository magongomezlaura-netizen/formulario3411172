import { SurveyResponse } from '../types/survey';

export const SURVEY_CAUSES = [
  {
    id: 'personal_poco_calificado',
    label: 'Personal poco calificado para desarrollar la función archivística',
    shortLabel: 'Personal poco calificado',
    description: 'Falta de formación técnica profesional en archivística, alta rotación de personal o asignación de tareas a personal sin competencias en gestión documental.',
    iconName: 'Users'
  },
  {
    id: 'poca_disponibilidad_materiales',
    label: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
    shortLabel: 'Escasez de materiales',
    description: 'Carencia de insumos archivísticos normativos: carpetas desacidificadas cuatro aletas, ganchos plásticos, cajas de archivo X-200 / X-300, marbetes y rótulos.',
    iconName: 'Package'
  },
  {
    id: 'equipos_obsoletos_inexistentes',
    label: 'Equipos obsoletos desactualizados o inexistentes para agilizar las tareas archivísticas',
    shortLabel: 'Equipos obsoletos / inexistentes',
    description: 'Falta de escáneres de alta producción, servidores adecuados, sistemas SGDEA (Sistema de Gestión de Documentos Electrónicos de Archivo) o computadores lentos.',
    iconName: 'MonitorX'
  },
  {
    id: 'procedimientos_inexistentes_no_claros',
    label: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
    shortLabel: 'Procedimientos inexistentes o difusos',
    description: 'Ausencia o desactualización del Programa de Gestión Documental (PGD), Tablas de Retención Documental (TRD) no convalidadas por el AGN o falta de manuales de procesos.',
    iconName: 'FileQuestion'
  },
  {
    id: 'poco_seguimiento_procesos',
    label: 'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    shortLabel: 'Poco o nulo seguimiento',
    description: 'Inexistencia de auditorías de control interno a la gestión documental, comités de archivo inoperantes y falta de indicadores de desempeño archivístico.',
    iconName: 'TrendingDown'
  },
  {
    id: 'instalaciones_poco_adecuadas',
    label: 'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
    shortLabel: 'Instalaciones inadecuadas',
    description: 'Espacios sin control de temperatura ni humedad relativa, problemas de humedad, plagas, roedores, falta de estantería rodante o bodegas de archivo improvisadas en sótanos.',
    iconName: 'Building2'
  }
];

export const VALLE_MUNICIPALITIES = [
  'Cali (Distrito Especial)',
  'Buenaventura (Distrito Especial)',
  'Palmira',
  'Tuluá',
  'Guadalajara de Buga',
  'Cartago',
  'Yumbo',
  'Jamundí',
  'Candelaria',
  'Florida',
  'Pradera',
  'Sevilla',
  'Zarzal',
  'Roldanillo',
  'Caicedonia',
  'El Cerrito',
  'Ginebra',
  'Guacarí',
  'Dagua',
  'La Cumbre',
  'Restrepo',
  'Vijes',
  'Andalucía',
  'Ansermanuevo',
  'Bolívar',
  'Bugalagrande',
  'Calima - El Darién',
  'El Águila',
  'El Cairo',
  'El Dovio',
  'La Unión',
  'Obando',
  'Riofrío',
  'San Pedro',
  'Toro',
  'Trujillo',
  'Ulloa',
  'Versalles',
  'Yotoco'
];

export const INITIAL_RESPONSES: SurveyResponse[] = [
  {
    id: 'resp-001',
    timestamp: '2026-11-10 09:30:15',
    userId: '13172327',
    userFullName: 'Usuario 13172327 (Investigador)',
    entityName: 'Alcaldía de Santiago de Cali - Secretaría General',
    entityType: 'publica',
    municipality: 'Cali (Distrito Especial)',
    respondentRole: 'Líder de Archivo y Gestión Documental',
    q1Cause: 'Personal poco calificado para desarrollar la función archivística',
    q2Cause: 'Equipos obsoletos desactualizados o inexistentes para agilizar las tareas archivísticas',
    q3Cause: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
    complianceLevel: 45,
    observations: 'La rotación de personal por contratos de prestación de servicios sin perfil técnico retrasa la convalidación de TRD ante el AGN.',
    syncedToSheets: true,
    sheetsRowIndex: 2
  },
  {
    id: 'resp-002',
    timestamp: '2026-11-10 11:15:40',
    userId: '13172327',
    userFullName: 'Usuario 13172327 (Investigador)',
    entityName: 'Hospital Universitario del Valle E.S.E. Evaristo García',
    entityType: 'publica',
    municipality: 'Cali (Distrito Especial)',
    respondentRole: 'Coordinador de Historias Clínicas y Archivo Central',
    q1Cause: 'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
    q2Cause: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
    q3Cause: 'Equipos obsoletos desactualizados o inexistentes para agilizar las tareas archivísticas',
    complianceLevel: 35,
    observations: 'El depósito de historias clínicas pasivas tiene limitaciones de espacio físico y control bioclimático exigido por el Acuerdo 049 de 2000.',
    syncedToSheets: true,
    sheetsRowIndex: 3
  },
  {
    id: 'resp-003',
    timestamp: '2026-11-11 14:05:22',
    userId: '13172327',
    userFullName: 'Usuario 13172327 (Investigador)',
    entityName: 'Cámara de Comercio de Palmira',
    entityType: 'privada_funciones_publicas',
    municipality: 'Palmira',
    respondentRole: 'Director Jurídico y Registros Públicos',
    q1Cause: 'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    q2Cause: 'Personal poco calificado para desarrollar la función archivística',
    q3Cause: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
    complianceLevel: 60,
    observations: 'A pesar de cumplir con digitalización de registros mercantiles, hace falta auditoría periódica del Comité Interno de Archivo.',
    syncedToSheets: true,
    sheetsRowIndex: 4
  },
  {
    id: 'resp-004',
    timestamp: '2026-11-11 16:45:10',
    userId: '13172327',
    userFullName: 'Usuario 13172327 (Investigador)',
    entityName: 'Notaría Primera de Buenaventura',
    entityType: 'privada_funciones_publicas',
    municipality: 'Buenaventura (Distrito Especial)',
    respondentRole: 'Oficial Mayor / Encargado de Protocolos Notariales',
    q1Cause: 'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
    q2Cause: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
    q3Cause: 'Personal poco calificado para desarrollar la función archivística',
    complianceLevel: 40,
    observations: 'La humedad y salinidad costera deterioran los tomos notariales sin que se cuente con deshumidificadores ni cajas de archivo normativas.',
    syncedToSheets: true,
    sheetsRowIndex: 5
  },
  {
    id: 'resp-005',
    timestamp: '2026-11-12 08:20:30',
    userId: '13172327',
    userFullName: 'Usuario 13172327 (Investigador)',
    entityName: 'Empresas Municipales de Cartago (EMCARTAGO E.S.P.)',
    entityType: 'publica',
    municipality: 'Cartago',
    respondentRole: 'Jefe de Control Interno',
    q1Cause: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
    q2Cause: 'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    q3Cause: 'Equipos obsoletos desactualizados o inexistentes para agilizar las tareas archivísticas',
    complianceLevel: 30,
    observations: 'Falta articulación entre las dependencias y el archivo central; no se realizan transferencias documentales primarias según calendario.',
    syncedToSheets: true,
    sheetsRowIndex: 6
  }
];
