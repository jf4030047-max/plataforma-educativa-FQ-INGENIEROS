// script-inicializar-topografia.js
// Inicializa el curso "Topografía en Civil 3D" con las 5 evaluaciones progresivas
// Cada tema = 20%, Evaluación final = 20%

const TOPOGRAFIA_COURSE_ID = 'topografia-civil-3d';

// Estructura de evaluaciones
const TOPOGRAFIA_EXAMS = [
  {
    id: 'topo-eval-tema-1',
    courseId: TOPOGRAFIA_COURSE_ID,
    name: 'Evaluación Tema 1',
    type: 'tema',
    tema: 'Tema 1: Conceptos Básicos de Topografía',
    percentage: 20,  // 20% del total
    requiredFor: null,  // Se puede hacer desde el principio
    unlockedAfter: null,
    description: 'Evaluación sobre los conceptos básicos de topografía'
  },
  {
    id: 'topo-eval-tema-2',
    courseId: TOPOGRAFIA_COURSE_ID,
    name: 'Evaluación Tema 2',
    type: 'tema',
    tema: 'Tema 2: Medición y Equipos Topográficos',
    percentage: 20,  // 20% del total
    requiredFor: null,
    unlockedAfter: null,
    description: 'Evaluación sobre medición y equipos topográficos'
  },
  {
    id: 'topo-eval-tema-3',
    courseId: TOPOGRAFIA_COURSE_ID,
    name: 'Evaluación Tema 3',
    type: 'tema',
    tema: 'Tema 3: Cálculos y Proyecciones',
    percentage: 20,  // 20% del total
    requiredFor: null,
    unlockedAfter: null,
    description: 'Evaluación sobre cálculos y proyecciones topográficas'
  },
  {
    id: 'topo-eval-tema-4',
    courseId: TOPOGRAFIA_COURSE_ID,
    name: 'Evaluación Tema 4',
    type: 'tema',
    tema: 'Tema 4: Aplicaciones en Civil 3D',
    percentage: 20,  // 20% del total
    requiredFor: null,
    unlockedAfter: null,
    description: 'Evaluación sobre aplicaciones en Civil 3D'
  },
  {
    id: 'topo-eval-final',
    courseId: TOPOGRAFIA_COURSE_ID,
    name: 'Evaluación Final',
    type: 'final',
    tema: 'Examen Final Integrador',
    percentage: 20,  // 20% del total
    requiredFor: 'topo-eval-tema-4',  // Se desbloquea SOLO después de hacer tema 4
    unlockedAfter: 'topo-eval-tema-4',
    description: 'Examen final integrador (se desbloquea después de completar evaluación del Tema 4)'
  }
];

// Función para inicializar el curso
async function initializeTopografiaCourse() {
  try {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    
    if (!user) {
      console.error('Usuario no autenticado');
      return;
    }

    // Crear documento del curso si no existe
    const courseRef = db.collection('courses').doc(TOPOGRAFIA_COURSE_ID);
    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      // Crear el curso
      await courseRef.set({
        id: TOPOGRAFIA_COURSE_ID,
        name: 'Topografía en Civil 3D',
        description: 'Curso completo de topografía aplicada en Civil 3D',
        duration: '8 horas',
        sessions: 4,
        temario: [
          { titulo: 'Tema 1: Conceptos Básicos de Topografía', temas: ['Fundamentos', 'Historia', 'Aplicaciones'] },
          { titulo: 'Tema 2: Medición y Equipos Topográficos', temas: ['Equipos', 'Técnicas', 'Precisión'] },
          { titulo: 'Tema 3: Cálculos y Proyecciones', temas: ['Matemática', 'Proyecciones', 'Coordenadas'] },
          { titulo: 'Tema 4: Aplicaciones en Civil 3D', temas: ['Modelado 3D', 'Importación de datos', 'Análisis'] }
        ],
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Curso Topografía creado');
    }

    // Crear evaluaciones si no existen
    for (const exam of TOPOGRAFIA_EXAMS) {
      const examRef = db.collection('exams').doc(exam.id);
      const examSnap = await examRef.get();

      if (!examSnap.exists) {
        await examRef.set({
          ...exam,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Evaluación ${exam.name} creada`);
      }
    }

    console.log('✅ Curso de Topografía inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando curso:', error);
  }
}

// Calcular progreso basado en evaluaciones completadas
async function calculateCourseProgress(userId, courseId) {
  try {
    const db = firebase.firestore();
    
    // Obtener todas las evaluaciones del curso
    const examsSnap = await db.collection('exams')
      .where('courseId', '==', courseId)
      .get();

    let completedPercentage = 0;
    const examsMap = {};

    // Mapear todas las evaluaciones
    examsSnap.forEach(doc => {
      examsMap[doc.id] = doc.data();
    });

    // Obtener exámenes completados por el usuario
    const userExamsSnap = await db.collection('exams')
      .where('courseId', '==', courseId)
      .where('userId', '==', userId)
      .get();

    const completedExams = {};
    userExamsSnap.forEach(doc => {
      const data = doc.data();
      if (data.percentage && data.percentage >= 70) {  // Consideramos 70% como aprobado
        completedExams[doc.id] = true;
        completedPercentage += data.percentage_value || 20;  // Cada evaluación suma su porcentaje
      }
    });

    return {
      totalProgress: Math.min(completedPercentage, 100),
      completedExams: completedExams,
      allExams: examsMap
    };
  } catch (error) {
    console.error('Error calculando progreso:', error);
    return { totalProgress: 0, completedExams: {}, allExams: {} };
  }
}

// Verificar si una evaluación está desbloqueada
function isExamUnlocked(examId, examData, completedExams) {
  // Si requiere otra evaluación completada
  if (examData.requiredFor) {
    return completedExams[examData.requiredFor] === true;
  }
  // Si no tiene requisitos, está desbloqueada
  return true;
}

// Obtener mensaje de desbloqueado
function getExamLockMessage(examData) {
  if (examData.type === 'final' && examData.requiredFor) {
    return `🔒 Se desbloquea después de completar: ${examData.requiredFor}`;
  }
  return null;
}

// Exportar funciones
if (typeof window !== 'undefined') {
  window.initializeTopografiaCourse = initializeTopografiaCourse;
  window.calculateCourseProgress = calculateCourseProgress;
  window.isExamUnlocked = isExamUnlocked;
  window.getExamLockMessage = getExamLockMessage;
}
