/**
 * 📜 MÓDULO DE GENERACIÓN DE CERTIFICADOS
 * Genera certificados PDF de constancia y certificación
 * Requiere: jsPDF, html2canvas
 */

class CertificateGenerator {
  /**
   * Generar certificado de constancia (asistencia)
   */
  static async generateConstancia(studentName, courseName, completionDate) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Fondo de color
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, width, height, 'F');

    // Borde decorativo
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20);

    // Decoración interna
    doc.setDrawColor(118, 75, 162);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, width - 24, height - 24);

    // Logo/Encabezado
    doc.setFontSize(32);
    doc.setTextColor(102, 126, 234);
    doc.setFont(undefined, 'bold');
    doc.text('FQ INGENIEROS', width / 2, 35, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(118, 75, 162);
    doc.setFont(undefined, 'normal');
    doc.text('Plataforma Educativa', width / 2, 42, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(30, 48, width - 30, 48);

    // Título del certificado
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('CONSTANCIA DE PARTICIPACIÓN', width / 2, 62, { align: 'center' });

    // Texto introductorio
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Por este medio se certifica que:', width / 2, 72, { align: 'center' });

    // Nombre del estudiante
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(studentName.toUpperCase(), width / 2, 85, { align: 'center' });

    // Texto de participación
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('ha participado satisfactoriamente en el curso:', width / 2, 95, { align: 'center' });

    // Nombre del curso
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    const courseLines = doc.splitTextToSize(courseName, width - 40);
    doc.text(courseLines, width / 2, 105, { align: 'center' });

    // Información de finalización
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const formattedDate = this.formatDate(completionDate);
    doc.text(`Completado el: ${formattedDate}`, width / 2, 125, { align: 'center' });

    // Firma visual
    doc.setFontSize(10);
    doc.setTextColor(118, 75, 162);
    doc.setFont(undefined, 'bold');
    doc.text('____________________________', 30, 155);
    doc.text('____________________________', width - 50, 155);

    // Nombres de firmantes
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Director Académico', 30, 160);
    doc.text('Coordinador de Cursos', width - 50, 160);

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado digitalmente por FQ INGENIEROS - ${new Date().getFullYear()}`, width / 2, height - 10, { align: 'center' });

    return doc;
  }

  /**
   * Generar certificado de certificación (examen aprobado)
   */
  static async generateCertificado(studentName, courseName, score, completionDate) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Fondo con gradiente (simulado)
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, width, height, 'F');

    // Borde principal
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(3);
    doc.rect(8, 8, width - 16, height - 16);

    // Borde interno
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1);
    doc.rect(12, 12, width - 24, height - 24);

    // Decoración de esquinas
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(2);
    doc.circle(15, 15, 3);
    doc.circle(width - 15, 15, 3);
    doc.circle(15, height - 15, 3);
    doc.circle(width - 15, height - 15, 3);

    // Logo/Encabezado
    doc.setFontSize(32);
    doc.setTextColor(16, 185, 129);
    doc.setFont(undefined, 'bold');
    doc.text('FQ INGENIEROS', width / 2, 32, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.setFont(undefined, 'normal');
    doc.text('Plataforma Educativa - Certificado de Aprobación', width / 2, 38, { align: 'center' });

    // Ícono de aprobación
    doc.setFontSize(16);
    doc.text('✓', width / 2 - 8, 47);

    // Línea separadora
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(25, 52, width - 25, 52);

    // Título
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICADO DE APROBACIÓN', width / 2, 65, { align: 'center' });

    // Texto introductorio
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Por este medio se certifica que:', width / 2, 75, { align: 'center' });

    // Nombre del estudiante
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(studentName.toUpperCase(), width / 2, 87, { align: 'center' });

    // Texto de aprobación
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('ha aprobado satisfactoriamente el curso:', width / 2, 97, { align: 'center' });

    // Nombre del curso
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    const courseLines = doc.splitTextToSize(courseName, width - 40);
    doc.text(courseLines, width / 2, 107, { align: 'center' });

    // Información de desempeño
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const formattedDate = this.formatDate(completionDate);
    doc.text(`Calificación: ${score}% - Completado el: ${formattedDate}`, width / 2, 120, { align: 'center' });

    // Código de verificación
    const verificationCode = this.generateVerificationCode(studentName, courseName);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Código de verificación: ${verificationCode}`, width / 2, 127, { align: 'center' });

    // Firma digital
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.setFont(undefined, 'bold');
    doc.text('____________________________', 30, 150);
    doc.text('____________________________', width - 50, 150);

    // Nombres de firmantes
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Director Académico', 30, 155);
    doc.text('Coordinador de Exámenes', width - 50, 155);

    // Sello (simulado)
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.circle(width - 35, 140, 8);
    doc.text('OFICIAL', width - 38, 142, { align: 'center' });

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Este certificado es válido como comprobante de aprobación - Generado: ${new Date().toLocaleDateString('es-ES')}`, width / 2, height - 10, { align: 'center' });

    return doc;
  }

  /**
   * Descargar PDF
   */
  static downloadPDF(doc, filename) {
    doc.save(filename);
  }

  /**
   * Enviar PDF a Firebase Storage
   */
  static async uploadPDFToStorage(doc, courseId, userId, certificateType) {
    try {
      const filename = `${certificateType}_${userId}_${courseId}_${Date.now()}.pdf`;
      const pdfData = doc.output('dataurlstring');
      
      // Convertir a blob
      const arr = pdfData.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      const blob = new Blob([u8arr], { type: mime });

      // Subir a Firebase Storage
      const storage = firebase.storage();
      const ref = storage.ref(`certificates/${courseId}/${filename}`);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL();

      return {
        url: url,
        filename: filename,
        size: blob.size,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  /**
   * Generar y guardar certificado automáticamente
   */
  static async generateAndSave(studentData, courseData, examResult, certificateType) {
    try {
      let doc;
      
      if (certificateType === 'constancia') {
        doc = await this.generateConstancia(
          studentData.name,
          courseData.name,
          new Date()
        );
      } else if (certificateType === 'certificado') {
        doc = await this.generateCertificado(
          studentData.name,
          courseData.name,
          examResult.percentage,
          new Date()
        );
      }

      // Subir a Firebase Storage
      const uploadResult = await this.uploadPDFToStorage(
        doc,
        courseData.id,
        studentData.uid,
        certificateType
      );

      // Guardar en Firestore
      const certData = {
        id: `cert_${studentData.uid}_${courseData.id}_${Date.now()}`,
        userId: studentData.uid,
        userEmail: studentData.email,
        courseId: courseData.id,
        courseName: courseData.name,
        type: certificateType,
        certificateUrl: uploadResult.url,
        certificateFilename: uploadResult.filename,
        score: examResult ? examResult.percentage : 0,
        issuedAt: new Date(),
        verificationCode: this.generateVerificationCode(studentData.name, courseData.name)
      };

      await firebase.firestore()
        .collection('certificates')
        .doc(certData.id)
        .set(certData);

      return certData;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  /**
   * Utilidades
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/\b\w/g, l => l.toUpperCase());
  }

  static generateVerificationCode(name, courseName) {
    const hash = (name + courseName + Date.now()).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString(36).substring(0, 10).toUpperCase();
  }
}

// Exportar para uso global
window.CertificateGenerator = CertificateGenerator;
