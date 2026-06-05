/**
 * 💳 SISTEMA DE PAGOS INTEGRADO
 * Soporta: Yape, Plin, Transferencia, BCP, Interbank
 */

class PaymentService {
  // Configuración de métodos de pago
  static PAYMENT_METHODS = {
    yape: {
      name: 'Yape',
      icon: '📱',
      description: 'Transferencia instantánea',
      requirements: ['Teléfono', 'Código de operación'],
      timeout: 15 // minutos
    },
    plin: {
      name: 'Plin',
      icon: '📲',
      description: 'Billetera digital',
      requirements: ['Teléfono/Email', 'Código de operación'],
      timeout: 20
    },
    bcp: {
      name: 'BCP',
      icon: '🏦',
      description: 'Banco de Crédito del Perú',
      requirements: ['Número de operación', 'Comprobante'],
      timeout: 30
    },
    interbank: {
      name: 'Interbank',
      icon: '🏦',
      description: 'Interbank',
      requirements: ['Número de operación', 'Comprobante'],
      timeout: 30
    },
    transfer: {
      name: 'Transferencia',
      icon: '💰',
      description: 'Transferencia bancaria',
      requirements: ['Número de operación', 'Comprobante'],
      timeout: 60
    }
  };

  // Cuentas receptoras (EJEMPLO - actualizar con datos reales)
  static PAYMENT_ACCOUNTS = {
    yape: {
      phone: '987654321',
      owner: 'FQ INGENIEROS'
    },
    plin: {
      email: 'pagos@fqingenieros.com',
      phone: '987654321',
      owner: 'FQ INGENIEROS'
    },
    bcp: {
      account: '000-0000-0000-0000',
      owner: 'FQ INGENIEROS E.I.R.L.',
      cci: '002000000000000000000'
    },
    interbank: {
      account: '00-00000-0',
      owner: 'FQ INGENIEROS E.I.R.L.',
      cci: '003000000000000000000'
    },
    transfer: {
      account: '000-000-000',
      owner: 'FQ INGENIEROS E.I.R.L.',
      bank: 'Banco de tu elección'
    }
  };

  /**
   * Crear registro de pago en Firestore
   */
  static async createPayment(userId, courseId, courseName, amount, method) {
    try {
      const paymentId = `pay_${userId}_${courseId}_${Date.now()}`;
      const user = firebase.auth().currentUser;

      const payment = {
        id: paymentId,
        userId,
        userEmail: user.email,
        courseId,
        courseName,
        amount,
        method,
        status: 'pending', // pending, uploaded, verified, rejected
        voucherUrl: null,
        voucherFilename: null,
        transactionId: null,
        operationCode: null,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedBy: null,
        verifiedAt: null
      };

      await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .set(payment);

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Subir comprobante de pago a Firebase Storage
   */
  static async uploadVoucher(paymentId, file, fileType) {
    try {
      if (!file) throw new Error('No file provided');
      if (file.size > 10 * 1024 * 1024) throw new Error('File too large (max 10MB)');

      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type');

      const filename = `voucher_${paymentId}_${Date.now()}.${file.name.split('.').pop()}`;
      const storage = firebase.storage();
      const ref = storage.ref(`payment-vouchers/${filename}`);

      const snapshot = await ref.put(file);
      const url = await snapshot.ref.getDownloadURL();

      // Actualizar documento de pago
      await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .update({
          voucherUrl: url,
          voucherFilename: filename,
          status: 'uploaded',
          updatedAt: new Date()
        });

      return {
        url,
        filename,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading voucher:', error);
      throw error;
    }
  }

  /**
   * Obtener pagos de un usuario
   */
  static async getUserPayments(userId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  /**
   * Obtener pagos pendientes de verificación (ADMIN)
   */
  static async getPendingPayments() {
    try {
      const snapshot = await firebase.firestore()
        .collection('payments')
        .where('status', 'in', ['uploaded', 'pending'])
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  }

  /**
   * Verificar y aprobar pago (ADMIN)
   */
  static async approvePayment(paymentId, notes = '') {
    try {
      const paymentSnap = await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .get();

      const payment = paymentSnap.data();

      // Actualizar estado de pago
      await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .update({
          status: 'verified',
          notes,
          verifiedBy: firebase.auth().currentUser.uid,
          verifiedAt: new Date()
        });

      // Permitir matrícula automáticamente
      const enrollmentId = `${payment.userId}_${payment.courseId}`;
      const enrollmentSnap = await firebase.firestore()
        .collection('enrollments')
        .doc(enrollmentId)
        .get();

      if (!enrollmentSnap.exists) {
        // Crear matrícula automáticamente
        await firebase.firestore()
          .collection('enrollments')
          .doc(enrollmentId)
          .set({
            userId: payment.userId,
            courseId: payment.courseId,
            courseName: payment.courseName,
            status: 'active',
            enrolledAt: new Date(),
            progress: 0,
            schedule: 'Por definir'
          });
      } else {
        // Activar si estaba deshabilitada
        await enrollmentSnap.ref.update({
          status: 'active'
        });
      }

      // Notificar usuario
      await NotificationService.notifyPaymentApproved(
        payment.userId,
        payment.userEmail,
        payment.courseName,
        payment.amount,
        paymentId
      );

      return true;
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  }

  /**
   * Rechazar pago (ADMIN)
   */
  static async rejectPayment(paymentId, reason = '') {
    try {
      const paymentSnap = await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .get();

      const payment = paymentSnap.data();

      // Actualizar estado
      await firebase.firestore()
        .collection('payments')
        .doc(paymentId)
        .update({
          status: 'rejected',
          notes: reason,
          verifiedBy: firebase.auth().currentUser.uid,
          verifiedAt: new Date()
        });

      // Notificar usuario
      await NotificationService.createNotification(
        payment.userId,
        'payment_rejected',
        {
          email: payment.userEmail,
          courseName: payment.courseName,
          reason: reason || 'Comprobante inválido',
          contactLink: '/empresa/about.html'
        }
      );

      return true;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  }

  /**
   * Validar que el pago esté aprobado antes de permitir matrícula
   */
  static async hasApprovedPayment(userId, courseId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('payments')
        .where('userId', '==', userId)
        .where('courseId', '==', courseId)
        .where('status', '==', 'verified')
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking payment:', error);
      return false;
    }
  }

  /**
   * Obtener método de pago información
   */
  static getMethodInfo(method) {
    return this.PAYMENT_METHODS[method] || null;
  }

  /**
   * Obtener cuenta receptora
   */
  static getPaymentAccount(method) {
    return this.PAYMENT_ACCOUNTS[method] || null;
  }

  /**
   * Generar instrucciones de pago
   */
  static getPaymentInstructions(method, amount) {
    const methodInfo = this.getMethodInfo(method);
    const account = this.getPaymentAccount(method);

    if (!methodInfo || !account) return '';

    let instructions = `
      <h3>${methodInfo.name}</h3>
      <p><strong>Monto a pagar:</strong> S/ ${amount.toFixed(2)}</p>
    `;

    switch (method) {
      case 'yape':
        instructions += `
          <p><strong>Teléfono:</strong> ${account.phone}</p>
          <p>1. Abre tu app de Yape</p>
          <p>2. Busca a ${account.owner}</p>
          <p>3. Envía S/ ${amount.toFixed(2)}</p>
          <p>4. Guarda el comprobante y súbelo aquí</p>
        `;
        break;
      case 'plin':
        instructions += `
          <p><strong>Email/Teléfono:</strong> ${account.email} / ${account.phone}</p>
          <p>1. Abre tu app de Plin</p>
          <p>2. Busca por teléfono: ${account.phone}</p>
          <p>3. Envía S/ ${amount.toFixed(2)}</p>
          <p>4. Guarda el comprobante</p>
        `;
        break;
      case 'bcp':
      case 'interbank':
        instructions += `
          <p><strong>Cuenta:</strong> ${account.account}</p>
          <p><strong>CCI:</strong> ${account.cci}</p>
          <p><strong>Titular:</strong> ${account.owner}</p>
          <p>1. Realiza la transferencia desde tu banco</p>
          <p>2. Obtén el comprobante de la operación</p>
          <p>3. Sube el comprobante aquí con el número de operación</p>
        `;
        break;
      case 'transfer':
        instructions += `
          <p><strong>Consulta con nuestro equipo para los datos bancarios</strong></p>
          <p><a href="/empresa/about.html">Contacta aquí →</a></p>
        `;
        break;
    }

    return instructions;
  }
}

window.PaymentService = PaymentService;
