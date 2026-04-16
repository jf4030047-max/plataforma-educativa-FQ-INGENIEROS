/**
 * FQ INGENIEROS — Certificate PDF Generator
 * Uses jsPDF to generate professional PDF certificates.
 * Requires: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
 *
 * Usage:
 *   FQCertificate.generateConstancia({ studentName, courseName, date, certId, docNumber })
 *   FQCertificate.generateCertificado({ studentName, courseName, date, certId, examScore, docNumber })
 */
var FQCertificate = (function () {

  function getJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;
    return null;
  }

  /* ── Shared helpers ── */
  function drawBorder(doc, w, h, color) {
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(2.5);
    doc.rect(8, 8, w - 16, h - 16);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, w - 24, h - 24);
    /* Corner decorations */
    var s = 18;
    [[14, 14], [w - 14 - s, 14], [14, h - 14 - s], [w - 14 - s, h - 14 - s]].forEach(function (p) {
      doc.setLineWidth(1.2);
      doc.line(p[0], p[1], p[0] + s, p[1]);
      doc.line(p[0], p[1], p[0], p[1] + s);
    });
  }

  function drawHeader(doc, w, color) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text('FQ INGENIEROS E.I.R.L.', w / 2, 32, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Plataforma Educativa', w / 2, 39, { align: 'center' });

    /* Divider */
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.8);
    doc.line(w / 2 - 40, 44, w / 2 + 40, 44);
  }

  function drawFooter(doc, w, h, certId) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    if (certId) {
      doc.text('Código de verificación: ' + certId, w / 2, h - 24, { align: 'center' });
    }
    doc.setFontSize(9);
    doc.text('FQ INGENIEROS E.I.R.L. — Plataforma Educativa — Lima, Perú', w / 2, h - 18, { align: 'center' });
  }

  /* ══════════════════════════════════════════
     CONSTANCIA DE PARTICIPACIÓN (gratuita)
     ══════════════════════════════════════════ */
  function generateConstancia(data) {
    var PDF = getJsPDF();
    if (!PDF) { alert('Error: la librería jsPDF no está cargada.'); return; }

    var doc = new PDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    var w = 297, h = 210;
    var blue = { r: 21, g: 101, b: 192 };

    drawBorder(doc, w, h, blue);
    drawHeader(doc, w, blue);

    /* Title */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text('CONSTANCIA', w / 2, 62, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('DE PARTICIPACIÓN', w / 2, 71, { align: 'center' });

    /* Body */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Se otorga la presente constancia a:', w / 2, 90, { align: 'center' });

    /* Student name */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(21, 101, 192);
    doc.text(data.studentName || 'Estudiante', w / 2, 108, { align: 'center' });

    /* Document number */
    if (data.docNumber) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Documento: ' + data.docNumber, w / 2, 116, { align: 'center' });
    }

    /* Course */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Por su participación en el curso:', w / 2, 130, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    var courseText = '\u201C' + (data.courseName || 'Curso') + '\u201D';
    doc.text(courseText, w / 2, 142, { align: 'center' });

    /* Duration if provided */
    if (data.duration) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('Duración: ' + data.duration, w / 2, 152, { align: 'center' });
    }

    /* Date */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Emitido el ' + (data.date || new Date().toLocaleDateString('es-PE')), w / 2, 166, { align: 'center' });

    /* Signature line */
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.4);
    doc.line(w / 2 - 35, 180, w / 2 + 35, 180);
    doc.setFontSize(9);
    doc.text('FQ INGENIEROS E.I.R.L.', w / 2, 186, { align: 'center' });

    drawFooter(doc, w, h, data.certId);

    var fileName = 'Constancia_' + (data.courseName || 'curso').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_') + '.pdf';
    doc.save(fileName);
  }

  /* ══════════════════════════════════════════
     CERTIFICADO DE APROBACIÓN (con pago)
     ══════════════════════════════════════════ */
  function generateCertificado(data) {
    var PDF = getJsPDF();
    if (!PDF) { alert('Error: la librería jsPDF no está cargada.'); return; }

    var doc = new PDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    var w = 297, h = 210;
    var gold = { r: 180, g: 140, b: 20 };

    drawBorder(doc, w, h, gold);

    /* Header in gold */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(gold.r, gold.g, gold.b);
    doc.text('FQ INGENIEROS E.I.R.L.', w / 2, 32, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Plataforma Educativa', w / 2, 39, { align: 'center' });

    doc.setDrawColor(gold.r, gold.g, gold.b);
    doc.setLineWidth(0.8);
    doc.line(w / 2 - 40, 44, w / 2 + 40, 44);

    /* Title */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text('CERTIFICADO', w / 2, 62, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(gold.r, gold.g, gold.b);
    doc.text('DE APROBACIÓN', w / 2, 71, { align: 'center' });

    /* Body */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Se certifica que:', w / 2, 88, { align: 'center' });

    /* Student name */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text(data.studentName || 'Estudiante', w / 2, 104, { align: 'center' });

    /* Document number */
    if (data.docNumber) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Documento: ' + data.docNumber, w / 2, 112, { align: 'center' });
    }

    /* Course */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('Ha aprobado satisfactoriamente el curso:', w / 2, 125, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('\u201C' + (data.courseName || 'Curso') + '\u201D', w / 2, 137, { align: 'center' });

    /* Exam score */
    if (data.examScore) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(22, 163, 74);
      doc.text('Calificación obtenida: ' + data.examScore + '%', w / 2, 148, { align: 'center' });
    }

    /* Duration */
    if (data.duration) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Duración: ' + data.duration, w / 2, 156, { align: 'center' });
    }

    /* Date */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Emitido el ' + (data.date || new Date().toLocaleDateString('es-PE')), w / 2, 168, { align: 'center' });

    /* Signature line */
    doc.setDrawColor(gold.r, gold.g, gold.b);
    doc.setLineWidth(0.4);
    doc.line(w / 2 - 35, 180, w / 2 + 35, 180);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('FQ INGENIEROS E.I.R.L.', w / 2, 186, { align: 'center' });

    drawFooter(doc, w, h, data.certId);

    var fileName = 'Certificado_' + (data.courseName || 'curso').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_') + '.pdf';
    doc.save(fileName);
  }

  return {
    generateConstancia: generateConstancia,
    generateCertificado: generateCertificado
  };

})();
