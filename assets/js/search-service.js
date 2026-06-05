/**
 * 🔍 SEARCH & FILTER SERVICE
 * Gestiona: Búsqueda de cursos, Filtros, Ordenamiento
 */

class SearchService {
  constructor() {
    this.allCourses = [];
    this.filteredCourses = [];
    this.currentFilters = {
      search: '',
      difficulty: null,
      priceRange: { min: 0, max: 10000 },
      instructor: null,
      status: 'all', // all, active, completed, coming_soon
      sortBy: 'name' // name, price, rating, newest, students
    };
  }

  /**
   * Cargar todos los cursos
   */
  async loadAllCourses() {
    try {
      const snapshot = await firebase.firestore()
        .collection('courses')
        .get();

      this.allCourses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Aplicar filtros iniciales
      await this.applyFilters();
      return this.allCourses;
    } catch (error) {
      console.error('Error cargando cursos:', error);
      return [];
    }
  }

  /**
   * Buscar por texto
   */
  searchByText(query) {
    this.currentFilters.search = query.toLowerCase();
    return this.applyFilters();
  }

  /**
   * Filtrar por dificultad
   */
  filterByDifficulty(difficulty) {
    this.currentFilters.difficulty = difficulty;
    return this.applyFilters();
  }

  /**
   * Filtrar por rango de precio
   */
  filterByPrice(min, max) {
    this.currentFilters.priceRange = { min, max };
    return this.applyFilters();
  }

  /**
   * Filtrar por instructor
   */
  filterByInstructor(instructorId) {
    this.currentFilters.instructor = instructorId;
    return this.applyFilters();
  }

  /**
   * Filtrar por estatus
   */
  filterByStatus(status) {
    this.currentFilters.status = status;
    return this.applyFilters();
  }

  /**
   * Ordenar resultados
   */
  sortResults(sortBy) {
    this.currentFilters.sortBy = sortBy;
    return this.applyFilters();
  }

  /**
   * Aplicar todos los filtros
   */
  applyFilters() {
    let results = [...this.allCourses];

    // Búsqueda de texto
    if (this.currentFilters.search) {
      const query = this.currentFilters.search;
      results = results.filter(course => 
        course.name.toLowerCase().includes(query) ||
        (course.description && course.description.toLowerCase().includes(query)) ||
        (course.instructor && course.instructor.toLowerCase().includes(query))
      );
    }

    // Filtrar por dificultad
    if (this.currentFilters.difficulty) {
      results = results.filter(course => course.difficulty === this.currentFilters.difficulty);
    }

    // Filtrar por precio
    const { min, max } = this.currentFilters.priceRange;
    results = results.filter(course => {
      const price = course.price || 0;
      return price >= min && price <= max;
    });

    // Filtrar por instructor
    if (this.currentFilters.instructor) {
      results = results.filter(course => course.professor === this.currentFilters.instructor);
    }

    // Filtrar por estatus
    if (this.currentFilters.status !== 'all') {
      results = results.filter(course => course.status === this.currentFilters.status);
    }

    // Ordenar
    results = this.sortCourses(results, this.currentFilters.sortBy);

    this.filteredCourses = results;
    return results;
  }

  /**
   * Ordenar cursos
   */
  sortCourses(courses, sortBy) {
    const sorted = [...courses];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'price_asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

      case 'price_desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      case 'newest':
        return sorted.sort((a, b) => 
          (b.createdAt?.toDate?.() || new Date(b.createdAt || 0)) - 
          (a.createdAt?.toDate?.() || new Date(a.createdAt || 0))
        );

      case 'students':
        return sorted.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0));

      default:
        return sorted;
    }
  }

  /**
   * Obtener cursos filtrados
   */
  getFilteredCourses() {
    return this.filteredCourses;
  }

  /**
   * Obtener opciones de dificultad únicas
   */
  getDifficultyOptions() {
    const difficulties = new Set(this.allCourses.map(c => c.difficulty).filter(Boolean));
    return Array.from(difficulties).sort();
  }

  /**
   * Obtener instructores únicos
   */
  getInstructors() {
    const instructors = new Set(this.allCourses.map(c => c.professor).filter(Boolean));
    return Array.from(instructors).sort();
  }

  /**
   * Obtener rango de precios
   */
  getPriceRange() {
    const prices = this.allCourses.map(c => c.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  /**
   * Obtener estadísticas de cursos
   */
  getStatistics() {
    return {
      total: this.allCourses.length,
      filtered: this.filteredCourses.length,
      avgPrice: this.allCourses.length > 0 
        ? Math.round(this.allCourses.reduce((sum, c) => sum + (c.price || 0), 0) / this.allCourses.length)
        : 0,
      avgRating: this.allCourses.length > 0
        ? Math.round(this.allCourses.reduce((sum, c) => sum + (c.rating || 5), 0) / this.allCourses.length * 10) / 10
        : 0,
      mostPopular: this.allCourses.reduce((max, c) => 
        (c.enrolledStudents || 0) > (max.enrolledStudents || 0) ? c : max, 
        this.allCourses[0] || {}
      )
    };
  }

  /**
   * Limpiar filtros
   */
  clearFilters() {
    this.currentFilters = {
      search: '',
      difficulty: null,
      priceRange: { min: 0, max: 10000 },
      instructor: null,
      status: 'all',
      sortBy: 'name'
    };
    return this.applyFilters();
  }

  /**
   * Obtener filtros actuales
   */
  getCurrentFilters() {
    return { ...this.currentFilters };
  }
}

window.SearchService = SearchService;
