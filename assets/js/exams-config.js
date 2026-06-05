/**
 * 📋 CONFIGURACIÓN DE EXÁMENES - FQ INGENIEROS
 * Contiene todos los exámenes y preguntas por curso
 */

const EXAMS_CONFIG = {
  // ═══════════════════════════════════════════════════════
  // CURSO: Seguridad en Obras Civiles
  // ═══════════════════════════════════════════════════════
  'sst-obras-civiles': {
    name: 'Seguridad y Salud en el Trabajo en Obras Civiles',
    description: 'Examen final del curso SST',
    duration: 30, // minutos
    passingScore: 70, // porcentaje mínimo para aprobar
    totalQuestions: 20,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: '¿Cuál es el principal objetivo de la Seguridad y Salud en el Trabajo (SST)?',
        options: [
          { text: 'Aumentar la productividad de la empresa', correct: false },
          { text: 'Prevenir accidentes y enfermedades ocupacionales', correct: true },
          { text: 'Reducir costos de operación', correct: false },
          { text: 'Mejorar la imagen corporativa', correct: false }
        ]
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: '¿Cuáles son las tres causas principales de accidentes en construcción?',
        options: [
          { text: 'Equipos defectuosos, operarios sin experiencia, falta de supervisión', correct: true },
          { text: 'Clima adverso, materiales de baja calidad, presupuesto insuficiente', correct: false },
          { text: 'Horarios largos, salarios bajos, falta de recursos', correct: false },
          { text: 'Tecnología antigua, competencia, mercado difícil', correct: false }
        ]
      },
      {
        id: 'q3',
        type: 'true-false',
        text: 'El Equipo de Protección Personal (EPP) es responsabilidad solo del empleador.',
        correct: false
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        text: '¿Qué significa el acrónimo IPER?',
        options: [
          { text: 'Identificación, Probabilidad, Exposición, Riesgo', correct: false },
          { text: 'Identificación de Peligros, Evaluación de Riesgos', correct: true },
          { text: 'Implementación, Prueba, Evaluación, Reporte', correct: false },
          { text: 'Inspección, Personal, Equipos, Registros', correct: false }
        ]
      },
      {
        id: 'q5',
        type: 'true-false',
        text: 'Los trabajadores deben reportar solo accidentes graves, no incidentes menores.',
        correct: false
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        text: '¿Cuál es la altura mínima desde la que se requiere protección contra caídas?',
        options: [
          { text: '1 metro', correct: false },
          { text: '1.5 metros', correct: false },
          { text: '2 metros', correct: true },
          { text: '3 metros', correct: false }
        ]
      },
      {
        id: 'q7',
        type: 'multiple-choice',
        text: '¿Quién es responsable de implementar las medidas de SST en una obra?',
        options: [
          { text: 'Solo los obreros', correct: false },
          { text: 'Solo el supervisor de seguridad', correct: false },
          { text: 'La gerencia y todos los empleados', correct: true },
          { text: 'El cliente de la obra', correct: false }
        ]
      },
      {
        id: 'q8',
        type: 'true-false',
        text: 'Un incidente es un evento no planeado que podría haber causado lesión o enfermedad.',
        correct: true
      },
      {
        id: 'q9',
        type: 'multiple-choice',
        text: '¿Cuál es el protocolo correcto ante un accidente en obra?',
        options: [
          { text: 'Trasladar inmediatamente al lesionado al hospital', correct: false },
          { text: 'Notificar al supervisor, brindar primeros auxilios, documentar', correct: true },
          { text: 'Continuar con el trabajo y reportar después', correct: false },
          { text: 'Investigar la causa primero', correct: false }
        ]
      },
      {
        id: 'q10',
        type: 'multiple-choice',
        text: '¿Cada cuánto tiempo debe realizarse una capacitación en SST?',
        options: [
          { text: 'Una vez al año', correct: false },
          { text: 'Cada 6 meses', correct: false },
          { text: 'Trimestralmente', correct: false },
          { text: 'Anualmente como mínimo, más charlas mensuales o semanales', correct: true }
        ]
      },
      {
        id: 'q11',
        type: 'true-false',
        text: 'El EPP es la primera línea de defensa contra accidentes en construcción.',
        correct: false
      },
      {
        id: 'q12',
        type: 'multiple-choice',
        text: '¿Cuál es la jerarquía correcta de controles de riesgo?',
        options: [
          { text: 'EPP, Administración, Ingeniería', correct: false },
          { text: 'Eliminación, Sustitución, Ingeniería, Administrativa, EPP', correct: true },
          { text: 'Ingeniería, Administrativa, Eliminación', correct: false },
          { text: 'EPP, Sustitución, Eliminación', correct: false }
        ]
      },
      {
        id: 'q13',
        type: 'multiple-choice',
        text: '¿Cuándo debe inspeccionarse el andamio antes de usarlo?',
        options: [
          { text: 'Una vez al mes', correct: false },
          { text: 'Diariamente antes de iniciar labores', correct: true },
          { text: 'Semanalmente', correct: false },
          { text: 'Solo después de tormentas', correct: false }
        ]
      },
      {
        id: 'q14',
        type: 'true-false',
        text: 'Un trabajador puede usar EPP de otro trabajador si le queda bien.',
        correct: false
      },
      {
        id: 'q15',
        type: 'multiple-choice',
        text: '¿Cuál es el objetivo de un Programa de Rehabilitación de Trabajadores Lesionados?',
        options: [
          { text: 'Reintegrar al trabajador a sus labores de forma segura', correct: true },
          { text: 'Transferir al trabajador a otro puesto', correct: false },
          { text: 'Prescindir de los servicios del trabajador', correct: false },
          { text: 'Reducir los costos de seguros', correct: false }
        ]
      },
      {
        id: 'q16',
        type: 'true-false',
        text: 'Los peligros psicosociales (estrés, acoso) no son parte del alcance de SST.',
        correct: false
      },
      {
        id: 'q17',
        type: 'multiple-choice',
        text: '¿Quién debe aprobar cambios importantes en los procedimientos de SST?',
        options: [
          { text: 'El supervisor de seguridad solo', correct: false },
          { text: 'La gerencia con participación de trabajadores', correct: true },
          { text: 'Los trabajadores sin consultar a gerencia', correct: false },
          { text: 'El cliente de la obra', correct: false }
        ]
      },
      {
        id: 'q18',
        type: 'true-false',
        text: 'Las auditorías internas de SST deben realizarse periódicamente para verificar cumplimiento.',
        correct: true
      },
      {
        id: 'q19',
        type: 'multiple-choice',
        text: '¿Cuál es el rol principal del Comité de SST en una empresa?',
        options: [
          { text: 'Investigar accidentes y proponer mejoras', correct: true },
          { text: 'Reemplazar al departamento de RRHH', correct: false },
          { text: 'Tomar decisiones finales sobre disciplina', correct: false },
          { text: 'Realizar todas las capacitaciones', correct: false }
        ]
      },
      {
        id: 'q20',
        type: 'true-false',
        text: 'Un trabajador puede negarse a trabajar si considera que hay peligro inminente sin represalia.',
        correct: true
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CURSO: Topografía Civil 3D
  // ═══════════════════════════════════════════════════════
  'topografia-civil-3d': {
    name: 'Topografía en Civil 3D',
    description: 'Examen final del curso de Topografía',
    duration: 45,
    passingScore: 70,
    totalQuestions: 20,
    questions: [
      {
        id: 'topo_q1',
        type: 'multiple-choice',
        text: '¿Cuál es el propósito principal de la topografía?',
        options: [
          { text: 'Dibujar mapas decorativos', correct: false },
          { text: 'Medir, representar y analizar características del terreno', correct: true },
          { text: 'Planificar caminos', correct: false },
          { text: 'Estudiar geología', correct: false }
        ]
      },
      {
        id: 'topo_q2',
        type: 'multiple-choice',
        text: '¿Qué instrumento se utiliza para medir ángulos horizontales?',
        options: [
          { text: 'Teodolito o Estación Total', correct: true },
          { text: 'Nivel', correct: false },
          { text: 'Brújula', correct: false },
          { text: 'Cinta métrica', correct: false }
        ]
      },
      {
        id: 'topo_q3',
        type: 'true-false',
        text: 'Civil 3D es un software que permite crear y modificar diseños 3D de proyectos de ingeniería civil.',
        correct: true
      },
      {
        id: 'topo_q4',
        type: 'multiple-choice',
        text: '¿Cuál es la diferencia entre un levantamiento taquimétrico y uno planimétrico?',
        options: [
          { text: 'No hay diferencia, son sinónimos', correct: false },
          { text: 'Taquimétrico incluye elevaciones, planimétrico solo posiciones horizontales', correct: true },
          { text: 'Taquimétrico usa cinta, planimétrico usa Estación Total', correct: false },
          { text: 'Taquimétrico es más antiguo', correct: false }
        ]
      },
      {
        id: 'topo_q5',
        type: 'true-false',
        text: 'El GPS puede reemplazar completamente los levantamientos topográficos tradicionales.',
        correct: false
      },
      {
        id: 'topo_q6',
        type: 'multiple-choice',
        text: '¿Qué representa una curva de nivel en un mapa topográfico?',
        options: [
          { text: 'Una línea que conecta puntos de igual elevación', correct: true },
          { text: 'Una ruta de viaje', correct: false },
          { text: 'Un límite administrativo', correct: false },
          { text: 'Una red de servicios', correct: false }
        ]
      },
      {
        id: 'topo_q7',
        type: 'multiple-choice',
        text: '¿Cuál es el primer paso al iniciar un levantamiento topográfico?',
        options: [
          { text: 'Identificar y materializar puntos de control', correct: true },
          { text: 'Comenzar mediciones sin planificación', correct: false },
          { text: 'Crear el modelo 3D', correct: false },
          { text: 'Calcular áreas y volúmenes', correct: false }
        ]
      },
      {
        id: 'topo_q8',
        type: 'true-false',
        text: 'Un Punto de Control debe ser permanente y visible desde múltiples ubicaciones.',
        correct: true
      },
      {
        id: 'topo_q9',
        type: 'multiple-choice',
        text: '¿Cuál es la ventaja principal de usar Civil 3D versus autocad 2D?',
        options: [
          { text: 'Es más barato', correct: false },
          { text: 'Permite visualizar proyectos en 3D y calcular volúmenes automáticamente', correct: true },
          { text: 'Usa menos memoria', correct: false },
          { text: 'Es más fácil de aprender', correct: false }
        ]
      },
      {
        id: 'topo_q10',
        type: 'multiple-choice',
        text: '¿Cuándo es necesario realizar poligonales cerradas en topografía?',
        options: [
          { text: 'Siempre', correct: false },
          { text: 'Cuando se requiere mayor precisión y cierre de control', correct: true },
          { text: 'Nunca', correct: false },
          { text: 'Solo en proyectos grandes', correct: false }
        ]
      },
      {
        id: 'topo_q11',
        type: 'true-false',
        text: 'El error de cierre en una poligonal debe ser eliminado, no ajustado.',
        correct: false
      },
      {
        id: 'topo_q12',
        type: 'multiple-choice',
        text: '¿Qué es una Estación Total?',
        options: [
          { text: 'Un equipamiento antiguo de topografía', correct: false },
          { text: 'Instrumento que combina teodolito, distanciómetro y computadora', correct: true },
          { text: 'Un tipo de nivel de precisión', correct: false },
          { text: 'Una marca de GPS', correct: false }
        ]
      },
      {
        id: 'topo_q13',
        type: 'multiple-choice',
        text: '¿Cuál es el formato de exportación más común de Civil 3D hacia otros softwares?',
        options: [
          { text: 'PDF', correct: false },
          { text: 'DWG/DXF', correct: true },
          { text: 'JPG', correct: false },
          { text: 'Excel', correct: false }
        ]
      },
      {
        id: 'topo_q14',
        type: 'true-false',
        text: 'Las coordenadas UTM son absolutas y validas globalmente en cualquier ubicación.',
        correct: false
      },
      {
        id: 'topo_q15',
        type: 'multiple-choice',
        text: '¿Cuál es el propósito de las "rasantes" en Civil 3D?',
        options: [
          { text: 'Mostrar perfiles de elevación del terreno', correct: false },
          { text: 'Definir la altura del proyecto (carreteras, ferrocarriles)', correct: true },
          { text: 'Calcular volúmenes de excavación', correct: false },
          { text: 'Medir distancias horizontales', correct: false }
        ]
      },
      {
        id: 'topo_q16',
        type: 'true-false',
        text: 'Un modelo Digital de Elevación (DEM) es una representación 3D continua del terreno.',
        correct: true
      },
      {
        id: 'topo_q17',
        type: 'multiple-choice',
        text: '¿Qué significa ajuste de mínimos cuadrados en una poligonal?',
        options: [
          { text: 'Usar la menor cantidad de puntos posibles', correct: false },
          { text: 'Distribuir el error de cierre de forma proporcional a todos los puntos', correct: true },
          { text: 'Ignorar el error de cierre', correct: false },
          { text: 'Duplicar todos los puntos', correct: false }
        ]
      },
      {
        id: 'topo_q18',
        type: 'true-false',
        text: 'Los perfiles (secciones transversales) en Civil 3D se generan manualmente, no automáticamente.',
        correct: false
      },
      {
        id: 'topo_q19',
        type: 'multiple-choice',
        text: '¿Cuál es el propósito de las "superficies" en Civil 3D?',
        options: [
          { text: 'Representar áreas decorativas', correct: false },
          { text: 'Interpolar elevaciones entre puntos de levantamiento', correct: true },
          { text: 'Crear límites administrativos', correct: false },
          { text: 'Dibjar líneas de construcción', correct: false }
        ]
      },
      {
        id: 'topo_q20',
        type: 'true-false',
        text: 'Un levantamiento LiDAR utiliza tecnología de láser y es más preciso que levantamientos tradicionales.',
        correct: true
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CURSO: Supervisión de Obras
  // ═══════════════════════════════════════════════════════
  'supervision-obra': {
    name: 'Supervisión de Obras Civiles',
    description: 'Examen final del curso de Supervisión',
    duration: 40,
    passingScore: 70,
    totalQuestions: 20,
    questions: [
      {
        id: 'sup_q1',
        type: 'multiple-choice',
        text: '¿Cuál es la responsabilidad principal de un supervisor de obras?',
        options: [
          { text: 'Cobrar salarios', correct: false },
          { text: 'Garantizar que el proyecto se ejecute conforme a especificaciones, plazo y presupuesto', correct: true },
          { text: 'Solo inspeccionar al final', correct: false },
          { text: 'Comprar materiales', correct: false }
        ]
      },
      {
        id: 'sup_q2',
        type: 'true-false',
        text: 'Un supervisor debe tener sólo experiencia en construcción, no necesita conocimientos administrativos.',
        correct: false
      },
      {
        id: 'sup_q3',
        type: 'multiple-choice',
        text: '¿Cuáles son los tres aspectos principales del Triángulo de Restricción en proyectos?',
        options: [
          { text: 'Costo, Calidad, Seguridad', correct: false },
          { text: 'Alcance, Tiempo, Costo', correct: true },
          { text: 'Personal, Equipo, Materiales', correct: false },
          { text: 'Diseño, Ejecución, Entrega', correct: false }
        ]
      },
      {
        id: 'sup_q4',
        type: 'true-false',
        text: 'El Libro de Obra es un documento legal donde se registran todos los eventos durante la construcción.',
        correct: true
      },
      {
        id: 'sup_q5',
        type: 'multiple-choice',
        text: '¿Cuándo debe revisarse el Expediente Técnico antes de iniciar obra?',
        options: [
          { text: 'Después de empezar para no retrasar', correct: false },
          { text: 'Completamente antes de iniciar trabajos', correct: true },
          { text: 'Solo si hay problemas', correct: false },
          { text: 'El contratista lo revisa, no el supervisor', correct: false }
        ]
      },
      {
        id: 'sup_q6',
        type: 'multiple-choice',
        text: '¿Qué es una Orden de Cambio (Change Order)?',
        options: [
          { text: 'Una instrucción para cambiar trabajadores', correct: false },
          { text: 'Documento que autoriza modificaciones al proyecto original', correct: true },
          { text: 'Un reclamo de pago', correct: false },
          { text: 'Una multa', correct: false }
        ]
      },
      {
        id: 'sup_q7',
        type: 'true-false',
        text: 'El supervisor puede autorizar cambios sin consultar con el ingeniero proyectista o propietario.',
        correct: false
      },
      {
        id: 'sup_q8',
        type: 'multiple-choice',
        text: '¿Cuál es la frecuencia recomendada de inspecciones en una obra?',
        options: [
          { text: 'Semanalmente', correct: false },
          { text: 'Mensualmente', correct: false },
          { text: 'Diariamente o según lo requiera la importancia de trabajos', correct: true },
          { text: 'Una vez al proyecto', correct: false }
        ]
      },
      {
        id: 'sup_q9',
        type: 'true-false',
        text: 'Los incumplimientos menores del contrato no necesitan documentarse.',
        correct: false
      },
      {
        id: 'sup_q10',
        type: 'multiple-choice',
        text: '¿Qué debe incluir un reporte diario de supervisión?',
        options: [
          { text: 'Solo el clima', correct: false },
          { text: 'Trabajo realizado, personal, equipo utilizado, incidencias', correct: true },
          { text: 'Gastos personales del supervisor', correct: false },
          { text: 'Chismes de obra', correct: false }
        ]
      }
    ]
  }
};

/**
 * Obtener configuración de examen para un curso
 */
function getExamConfig(courseId) {
  return EXAMS_CONFIG[courseId] || null;
}

/**
 * Verificar respuesta de una pregunta
 */
function checkAnswer(courseId, questionId, answer) {
  const config = getExamConfig(courseId);
  if (!config) return null;

  const question = config.questions.find(q => q.id === questionId);
  if (!question) return null;

  if (question.type === 'true-false') {
    return answer === question.correct;
  } else if (question.type === 'multiple-choice') {
    const selectedOption = question.options[answer];
    return selectedOption ? selectedOption.correct : false;
  }

  return false;
}

/**
 * Calcular puntuación final
 */
function calculateScore(courseId, answers) {
  const config = getExamConfig(courseId);
  if (!config) return 0;

  let correct = 0;
  config.questions.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined && checkAnswer(courseId, question.id, answer)) {
      correct++;
    }
  });

  const percentage = Math.round((correct / config.questions.length) * 100);
  return {
    correct,
    total: config.questions.length,
    percentage,
    passed: percentage >= config.passingScore
  };
}
