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

	/* ...existing code... */

	return {
		generateConstancia: generateConstancia,
		generateCertificado: generateCertificado
	};

})();
