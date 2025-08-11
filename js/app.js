// Library Management System Frontend - Enhanced Version
class LibraryUI {
    constructor() {
        this.apiBase = 'http://localhost:8080/api';
        this.isServerRunning = false;
        this.init();
        this.checkServerConnection();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupModals();
        this.setupRealTimeUpdates();
        this.setupKeyboardShortcuts();
        this.setupAutoSave();
    }

    async checkServerConnection() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (response.ok) {
                this.isServerRunning = true;
                this.showNotification('✅ Connected to Java backend server', 'success');
                this.loadDashboardData();
            }
        } catch (error) {
            this.isServerRunning = false;
            this.showNotification('⚠️ Using demo mode - Java server not running. Run "java LibraryWebServer" to enable full functionality.', 'warning');
            this.loadDemoData();
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.querySelector('.page-title');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items and sections
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked nav item
                item.classList.add('active');
                
                // Show corresponding section
                const targetSection = item.dataset.section;
                const section = document.getElementById(targetSection);
                if (section) {
                    section.classList.add('active');
                    pageTitle.textContent = this.getSectionTitle(targetSection);
                }
                
                // Load section specific data
                this.loadSectionData(targetSection);
                
                // Update URL hash
                window.location.hash = targetSection;
            });
        });

        // Handle direct URL navigation
        this.handleHashNavigation();
        window.addEventListener('hashchange', () => this.handleHashNavigation());

        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    handleHashNavigation() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const navItem = document.querySelector(`[data-section="${hash}"]`);
            if (navItem) {
                navItem.click();
            }
        }
    }

    getSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'books': 'Books Management',
            'users': 'Users Management',
            'borrow': 'Borrow/Return Books',
            'search': 'Search Books',
            'navigation': 'Shelf Navigation',
            'recommendations': 'Book Recommendations'
        };
        return titles[section] || 'Dashboard';
    }

    setupEventListeners() {
        // Form submissions
        const addBookForm = document.getElementById('add-book-form');
        const addUserForm = document.getElementById('add-user-form');

        if (addBookForm) {
            addBookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBook();
            });
        }

        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }

        // Real-time search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.trim().length > 2) {
                        this.searchBooks();
                    } else if (e.target.value.trim().length === 0) {
                        document.getElementById('search-results').innerHTML = '';
                    }
                }, 300);
            });
        }

        // Form validation
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Auto-focus first input in modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('show', () => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
            });
        });
    }

    setupRealTimeUpdates() {
        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.loadDashboardData(true); // Silent update
            }
        }, 30000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for quick search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector('[data-section="search"]').click();
                document.getElementById('search-input').focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }

    setupAutoSave() {
        // Save form data to localStorage as user types
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                const key = `autosave_${input.id}`;
                localStorage.setItem(key, input.value);
            });
        });

        // Restore form data on page load
        document.querySelectorAll('input, textarea').forEach(input => {
            const key = `autosave_${input.id}`;
            const saved = localStorage.getItem(key);
            if (saved && input.type !== 'password') {
                input.value = saved;
            }
        });
    }

    setupModals() {
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    async loadDashboardData(silent = false) {
        if (!silent) this.showLoading('dashboard');
        
        try {
            if (this.isServerRunning) {
                // Real API calls
                const [statsResponse, booksResponse, usersResponse] = await Promise.all([
                    fetch(`${this.apiBase}/stats`),
                    fetch(`${this.apiBase}/books`),
                    fetch(`${this.apiBase}/users`)
                ]);

                const stats = await statsResponse.json();
                const books = await booksResponse.json();
                const users = await usersResponse.json();

                this.updateStats(stats);
                this.loadRecentActivityFromData(books, users);
                this.loadCategoryChartFromData(books);
            } else {
                this.loadDemoData();
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showNotification('Error loading dashboard data', 'error');
            this.loadDemoData();
        } finally {
            if (!silent) this.hideLoading('dashboard');
        }
    }

    loadDemoData() {
        // Enhanced demo data with more realistic information
        const stats = {
            totalBooks: 15,
            availableBooks: 8,
            totalUsers: 7,
            borrowedBooks: 7
        };
        this.updateStats(stats);
        this.loadRecentActivity();
        this.loadCategoryChart();
    }

    updateStats(stats) {
        // Animate number changes
        this.animateNumber('total-books', stats.totalBooks);
        this.animateNumber('available-books', stats.availableBooks);
        this.animateNumber('total-users', stats.totalUsers);
        this.animateNumber('borrowed-books', stats.borrowedBooks);

        // Update progress indicators
        this.updateProgressIndicators(stats);
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 1000;
        const stepTime = Math.abs(Math.floor(duration / (targetValue - currentValue)));

        if (currentValue !== targetValue) {
            const timer = setInterval(() => {
                const current = parseInt(element.textContent);
                if (current !== targetValue) {
                    element.textContent = current + increment;
                } else {
                    clearInterval(timer);
                }
            }, stepTime);
        }
    }

    updateProgressIndicators(stats) {
        // Add progress bars to stat cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            let progressBar = card.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                card.appendChild(progressBar);
            }
            
            let percentage;
            switch (index) {
                case 0: percentage = (stats.totalBooks / 20) * 100; break;
                case 1: percentage = (stats.availableBooks / stats.totalBooks) * 100; break;
                case 2: percentage = (stats.totalUsers / 10) * 100; break;
                case 3: percentage = (stats.borrowedBooks / stats.totalBooks) * 100; break;
                default: percentage = 0;
            }
            
            progressBar.style.width = Math.min(percentage, 100) + '%';
        });
    }

    loadRecentActivity() {
        const activities = [
            { icon: 'fas fa-book', text: 'Amit Sharma borrowed "Data Structures in Java"', time: '2 hours ago', type: 'borrow' },
            { icon: 'fas fa-user-plus', text: 'New user Priya Singh registered', time: '4 hours ago', type: 'user' },
            { icon: 'fas fa-undo', text: 'Book "Algorithms Unlocked" returned by Rohan Kumar', time: '6 hours ago', type: 'return' },
            { icon: 'fas fa-search', text: 'Popular search: "Machine Learning"', time: '8 hours ago', type: 'search' },
            { icon: 'fas fa-star', text: 'Recommendation generated for Neha Verma', time: '1 day ago', type: 'recommend' },
            { icon: 'fas fa-route', text: 'Path found: Shelf-1 to Shelf-5', time: '1 day ago', type: 'navigation' }
        ];

        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
                <div class="activity-status">
                    <span class="status-dot ${activity.type}"></span>
                </div>
            </div>
        `).join('');
    }

    loadCategoryChart() {
        const categories = [
            { name: 'Computer Science', count: 8, percentage: 53 },
            { name: 'Mathematics', count: 4, percentage: 27 },
            { name: 'Physics', count: 2, percentage: 13 },
            { name: 'Other', count: 1, percentage: 7 }
        ];

        const categoryChart = document.getElementById('category-chart');
        categoryChart.innerHTML = categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="category-percentage">${category.percentage}%</span>
                </div>
                <div class="category-bar">
                    <div class="category-progress" style="width: ${category.percentage}%"></div>
                </div>
                <span class="category-count">${category.count}</span>
            </div>
        `).join('');
    }

    loadSectionData(section) {
        switch (section) {
            case 'books':
                this.loadBooksData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
        }
    }

    async loadBooksData() {
        this.showLoading('books-table');
        
        try {
            let books;
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/books`);
                books = await response.json();
            } else {
                // Enhanced demo data
                books = [
                    { isbn: 'INB001', title: 'Data Structures in Java', author: 'Prof. Rajesh Kumar', category: 'CS', shelf: 'Shelf-3', status: 'Borrowed', borrowedBy: 'Amit Sharma', dueDate: '2024-08-18' },
                    { isbn: 'INB002', title: 'Algorithms Unlocked', author: 'Dr. Suresh Verma', category: 'CS', shelf: 'Shelf-2', status: 'Available', rating: 4.5 },
                    { isbn: 'INB003', title: 'Operating System Concepts', author: 'Amitabh Tiwari', category: 'CS', shelf: 'Shelf-4', status: 'Available', rating: 4.8 },
                    { isbn: 'INB004', title: 'Computer Networks', author: 'Neha Gupta', category: 'CS', shelf: 'Shelf-3', status: 'Borrowed', borrowedBy: 'Priya Singh', dueDate: '2024-08-20' },
                    { isbn: 'INB005', title: 'Database System Concepts', author: 'Deepak Joshi', category: 'CS', shelf: 'Shelf-5', status: 'Available', rating: 4.7 },
                    { isbn: 'INB006', title: 'Introduction to AI', author: 'Priya Reddy', category: 'CS', shelf: 'Shelf-1', status: 'Available', rating: 4.3 },
                    { isbn: 'INB007', title: 'Discrete Mathematics', author: 'Sanjay Yadav', category: 'Math', shelf: 'Shelf-2', status: 'Available', rating: 4.1 },
                    { isbn: 'INB008', title: 'Design Patterns in Java', author: 'Rohit Malhotra', category: 'CS', shelf: 'Shelf-4', status: 'Borrowed', borrowedBy: 'Rohan Kumar', dueDate: '2024-08-15' }
                ];
            }

            const booksTable = document.getElementById('books-table');
            booksTable.innerHTML = books.map(book => `
                <tr class="book-row ${book.status.toLowerCase()}" data-isbn="${book.isbn}">
                    <td class="isbn-cell">
                        <strong>${book.isbn}</strong>
                        ${book.rating ? `<div class="rating">${'⭐'.repeat(Math.floor(book.rating))} ${book.rating}</div>` : ''}
                    </td>
                    <td class="title-cell">
                        <div class="book-title">${book.title}</div>
                        ${book.borrowedBy ? `<small class="borrower">Borrowed by: ${book.borrowedBy}</small>` : ''}
                    </td>
                    <td>${book.author}</td>
                    <td>
                        <span class="category-tag ${book.category.toLowerCase()}">${book.category}</span>
                    </td>
                    <td>
                        <span class="shelf-location">${book.shelf}</span>
                    </td>
                    <td>
                        <span class="status-badge ${book.status.toLowerCase()}">
                            <i class="fas ${book.status === 'Available' ? 'fa-check-circle' : 'fa-clock'}"></i>
                            ${book.status}
                        </span>
                        ${book.dueDate ? `<div class="due-date">Due: ${book.dueDate}</div>` : ''}
                    </td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="viewBookDetails('${book.isbn}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="editBook('${book.isbn}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${book.status === 'Available' ? 
                                `<button class="btn btn-sm btn-success" onclick="quickBorrow('${book.isbn}')" title="Quick Borrow">
                                    <i class="fas fa-hand-holding"></i>
                                </button>` :
                                `<button class="btn btn-sm btn-warning" onclick="returnBook('${book.isbn}')" title="Return">
                                    <i class="fas fa-undo"></i>
                                </button>`
                            }
                            <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.isbn}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Add table sorting
            this.setupTableSorting('books-table');
            
        } catch (error) {
            console.error('Error loading books:', error);
            this.showNotification('Error loading books data', 'error');
        } finally {
            this.hideLoading('books-table');
        }
    }

    async loadUsersData() {
        this.showLoading('users-table');
        
        try {
            let users;
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/users`);
                users = await response.json();
            } else {
                // Enhanced demo data
                users = [
                    { name: 'Amit Sharma', contact: '9876543210', booksCount: 1, joinDate: '2024-01-15', status: 'Active', totalBorrowed: 5 },
                    { name: 'Priya Singh', contact: '9876501234', booksCount: 1, joinDate: '2024-02-20', status: 'Active', totalBorrowed: 3 },
                    { name: 'Rohan Kumar', contact: '9812345678', booksCount: 1, joinDate: '2024-03-10', status: 'Active', totalBorrowed: 8 },
                    { name: 'Neha Verma', contact: '9900112233', booksCount: 0, joinDate: '2024-04-05', status: 'Active', totalBorrowed: 2 },
                    { name: 'Sandeep Joshi', contact: '9887766554', booksCount: 0, joinDate: '2024-05-12', status: 'Active', totalBorrowed: 1 },
                    { name: 'Anita Patel', contact: '9765432108', booksCount: 0, joinDate: '2024-06-18', status: 'Inactive', totalBorrowed: 0 },
                    { name: 'Vikram Singh', contact: '9654321097', booksCount: 2, joinDate: '2024-07-22', status: 'Active', totalBorrowed: 4 }
                ];
            }

            const usersTable = document.getElementById('users-table');
            usersTable.innerHTML = users.map(user => `
                <tr class="user-row ${user.status.toLowerCase()}" data-user="${user.name}">
                    <td class="user-cell">
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <small class="join-date">Joined: ${user.joinDate}</small>
                        </div>
                        <span class="user-status ${user.status.toLowerCase()}">${user.status}</span>
                    </td>
                    <td class="contact-cell">
                        <i class="fas fa-phone"></i> ${user.contact}
                    </td>
                    <td class="books-cell">
                        <div class="books-info">
                            <span class="current-books">${user.booksCount} current</span>
                            <small class="total-borrowed">${user.totalBorrowed} total borrowed</small>
                        </div>
                    </td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="viewUserProfile('${user.name}')" title="View Profile">
                                <i class="fas fa-user"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="editUser('${user.name}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="showBorrowModal('${user.name}')" title="Borrow Book">
                                <i class="fas fa-book"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="viewUserHistory('${user.name}')" title="History">
                                <i class="fas fa-history"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.name}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Add table sorting
            this.setupTableSorting('users-table');

        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Error loading users data', 'error');
        } finally {
            this.hideLoading('users-table');
        }
    }

    async addBook() {
        const isbn = document.getElementById('new-isbn').value.trim();
        const title = document.getElementById('new-title').value.trim();
        const author = document.getElementById('new-author').value.trim();
        const category = document.getElementById('new-category').value.trim();
        const shelf = document.getElementById('new-shelf').value.trim();

        // Enhanced validation
        if (!this.validateBookForm(isbn, title, author, category, shelf)) {
            return;
        }

        this.showLoading('add-book-form');

        try {
            const bookData = { isbn, title, author, category, shelf };
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/books`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add book');
                }
            }

            this.showNotification(`✅ Book "${title}" added successfully!`, 'success');
            this.closeModal('add-book-modal');
            this.loadBooksData();
            this.loadDashboardData(true);
            
            // Clear form and autosave
            document.getElementById('add-book-form').reset();
            this.clearAutoSave(['new-isbn', 'new-title', 'new-author', 'new-category', 'new-shelf']);
            
        } catch (error) {
            console.error('Error adding book:', error);
            this.showNotification('❌ Failed to add book: ' + error.message, 'error');
        } finally {
            this.hideLoading('add-book-form');
        }
    }

    async addUser() {
        const name = document.getElementById('new-user-name').value.trim();
        const contact = document.getElementById('new-user-phone').value.trim();

        // Enhanced validation
        if (!this.validateUserForm(name, contact)) {
            return;
        }

        this.showLoading('add-user-form');

        try {
            const userData = { name, contact };
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add user');
                }
            }

            this.showNotification(`✅ User "${name}" registered successfully!`, 'success');
            this.closeModal('add-user-modal');
            this.loadUsersData();
            this.loadDashboardData(true);
            
            // Clear form and autosave
            document.getElementById('add-user-form').reset();
            this.clearAutoSave(['new-user-name', 'new-user-phone']);
            
        } catch (error) {
            console.error('Error adding user:', error);
            this.showNotification('❌ Failed to add user: ' + error.message, 'error');
        } finally {
            this.hideLoading('add-user-form');
        }
    }

    validateBookForm(isbn, title, author, category, shelf) {
        const errors = [];
        
        if (!isbn || isbn.length < 3) errors.push('ISBN must be at least 3 characters');
        if (!title || title.length < 2) errors.push('Title must be at least 2 characters');
        if (!author || author.length < 2) errors.push('Author must be at least 2 characters');
        if (!category) errors.push('Category is required');
        if (!shelf) errors.push('Shelf location is required');
        
        // Check ISBN format
        if (isbn && !/^[A-Z]{2,3}\d{3,}$/.test(isbn)) {
            errors.push('ISBN format should be like: INB001');
        }
        
        if (errors.length > 0) {
            this.showNotification('❌ ' + errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }

    validateUserForm(name, contact) {
        const errors = [];
        
        if (!name || name.length < 2) errors.push('Name must be at least 2 characters');
        if (!contact || !/^\d{10}$/.test(contact)) errors.push('Contact must be 10 digits');
        
        if (errors.length > 0) {
            this.showNotification('❌ ' + errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }

    async searchBooks() {
        const searchTerm = document.getElementById('search-input').value.trim();
        const searchType = document.getElementById('search-type')?.value || 'all';
        
        if (!searchTerm) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        this.showLoading('search-results');

        try {
            let results = [];
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/search?query=${encodeURIComponent(searchTerm)}&type=${searchType}`);
                if (response.ok) {
                    results = await response.json();
                }
            } else {
                // Enhanced demo search with better matching
                results = this.performDemoSearch(searchTerm, searchType);
            }

            this.displaySearchResults(results, searchTerm, searchType);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('❌ Search failed: ' + error.message, 'error');
        } finally {
            this.hideLoading('search-results');
        }
    }

    performDemoSearch(searchTerm, searchType) {
        const query = searchTerm.toLowerCase();
        const demoBooks = [
            { isbn: 'INB001', title: 'Data Structures in Java', author: 'Prof. Rajesh Kumar', category: 'Computer Science', shelf: 'Shelf-3', available: true, borrower: null, rating: 4.5 },
            { isbn: 'INB002', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', shelf: 'Shelf-1', available: false, borrower: 'Amit Sharma', dueDate: '2024-01-15', rating: 4.8 },
            { isbn: 'INB003', title: 'System Design Interview', author: 'Alex Xu', category: 'Computer Science', shelf: 'Shelf-2', available: true, borrower: null, rating: 4.6 },
            { isbn: 'INB004', title: 'Machine Learning Basics', author: 'Vikram Patel', category: 'AI/ML', shelf: 'Shelf-1', available: true, borrower: null, rating: 4.3 },
            { isbn: 'INB005', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Programming', shelf: 'Shelf-4', available: false, borrower: 'Priya Singh', dueDate: '2024-01-20', rating: 4.4 },
            { isbn: 'INB006', title: 'Algorithms Unlocked', author: 'Thomas H. Cormen', category: 'Computer Science', shelf: 'Shelf-2', available: true, borrower: null, rating: 4.7 },
            { isbn: 'INB007', title: 'Design Patterns', author: 'Gang of Four', category: 'Programming', shelf: 'Shelf-3', available: true, borrower: null, rating: 4.5 },
            { isbn: 'INB008', title: 'Deep Learning', author: 'Ian Goodfellow', category: 'AI/ML', shelf: 'Shelf-1', available: false, borrower: 'Rohan Kumar', dueDate: '2024-01-18', rating: 4.6 }
        ];

        return demoBooks.filter(book => {
            switch (searchType) {
                case 'title':
                    return book.title.toLowerCase().includes(query);
                case 'author':
                    return book.author.toLowerCase().includes(query);
                case 'isbn':
                    return book.isbn.toLowerCase().includes(query);
                case 'category':
                    return book.category.toLowerCase().includes(query);
                default:
                    return book.title.toLowerCase().includes(query) ||
                           book.author.toLowerCase().includes(query) ||
                           book.isbn.toLowerCase().includes(query) ||
                           book.category.toLowerCase().includes(query);
            }
        });
    }

    displaySearchResults(results, searchTerm, searchType) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No Results Found</h3>
                    <p>No books found for "<strong>${searchTerm}</strong>" in ${searchType === 'all' ? 'all fields' : searchType}</p>
                    <div class="no-results-actions">
                        <button onclick="libraryUI.clearSearch()" class="btn btn-primary">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                        <button onclick="libraryUI.showSection('books')" class="btn btn-outline">
                            <i class="fas fa-book"></i> Browse All Books
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = `
            <div class="search-header">
                <div class="search-title">
                    <h3><i class="fas fa-search"></i> Search Results</h3>
                    <div class="search-meta">
                        Found <span class="result-count">${results.length}</span> result${results.length !== 1 ? 's' : ''} 
                        for "<strong>${searchTerm}</strong>"
                        ${searchType !== 'all' ? ` in <em>${searchType}</em>` : ''}
                    </div>
                </div>
                <div class="search-actions">
                    <button onclick="libraryUI.clearSearch()" class="btn btn-outline btn-sm">
                        <i class="fas fa-times"></i> Clear
                    </button>
                    <button onclick="libraryUI.exportSearchResults()" class="btn btn-outline btn-sm">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            <div class="search-results-grid">
                ${results.map(book => this.createEnhancedBookCard(book)).join('')}
            </div>
        `;
    }

    createEnhancedBookCard(book) {
        const isAvailable = book.available !== false;
        const statusClass = isAvailable ? 'available' : 'borrowed';
        const statusIcon = isAvailable ? 'fas fa-check-circle' : 'fas fa-clock';
        const rating = book.rating || 0;
        const stars = this.generateStarRating(rating);
        
        return `
            <div class="enhanced-book-card ${statusClass}">
                <div class="book-card-header">
                    <div class="book-title-section">
                        <h4 class="book-title">${book.title}</h4>
                        <span class="book-isbn">${book.isbn}</span>
                    </div>
                    <div class="book-rating">
                        ${stars}
                        <span class="rating-value">${rating}</span>
                    </div>
                </div>
                
                <div class="book-card-body">
                    <div class="book-info">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span><strong>Author:</strong> ${book.author}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span><strong>Category:</strong> ${book.category}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Shelf:</strong> ${book.shelf}</span>
                        </div>
                    </div>
                </div>

                <div class="book-card-footer">
                    <div class="book-status">
                        <span class="status-badge ${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${isAvailable ? 'Available' : 'Borrowed'}
                        </span>
                        ${!isAvailable ? `
                            <div class="borrower-details">
                                <small><i class="fas fa-user"></i> ${book.borrower}</small>
                                ${book.dueDate ? `<small><i class="fas fa-calendar"></i> Due: ${new Date(book.dueDate).toLocaleDateString()}</small>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="book-actions">
                        ${isAvailable ? `
                            <button onclick="libraryUI.quickBorrow('${book.isbn}')" class="btn btn-primary btn-sm">
                                <i class="fas fa-hand-holding"></i> Quick Borrow
                            </button>
                        ` : `
                            <button onclick="libraryUI.returnBook('${book.isbn}')" class="btn btn-success btn-sm">
                                <i class="fas fa-undo"></i> Return
                            </button>
                        `}
                        <button onclick="libraryUI.viewBookDetails('${book.isbn}')" class="btn btn-outline btn-sm">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button onclick="libraryUI.addToWishlist('${book.isbn}')" class="btn btn-outline btn-sm">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
        this.showNotification('Search cleared', 'info');
    }

    exportSearchResults() {
        // Implementation for exporting search results
        this.showNotification('Export feature coming soon!', 'info');
    }

    async borrowBook() {
        const userName = document.getElementById('borrow-user').value.trim();
        const isbn = document.getElementById('borrow-isbn').value.trim();

        if (!userName || !isbn) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showLoading('borrow-form');

        try {
            const borrowData = { userName, isbn };
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/borrow`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(borrowData)
                });
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to borrow book');
                }
            }

            this.showNotification(`✅ Book ${isbn} borrowed by ${userName} successfully!`, 'success');
            this.closeModal('borrow-modal');
            this.loadBooksData();
            this.loadUsersData();
            this.loadDashboardData(true);
            
            // Clear form
            document.getElementById('borrow-user').value = '';
            document.getElementById('borrow-isbn').value = '';
            
        } catch (error) {
            console.error('Error borrowing book:', error);
            this.showNotification('❌ Failed to borrow book: ' + error.message, 'error');
        } finally {
            this.hideLoading('borrow-form');
        }
    }

    async returnBook() {
        const isbn = document.getElementById('return-isbn').value.trim();

        if (!isbn) {
            this.showNotification('Please enter ISBN', 'error');
            return;
        }

        this.showLoading('return-form');

        try {
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/return`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isbn })
                });
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to return book');
                }
            }

            this.showNotification(`✅ Book ${isbn} returned successfully!`, 'success');
            this.closeModal('return-modal');
            this.loadBooksData();
            this.loadUsersData();
            this.loadDashboardData(true);
            
            // Clear form
            document.getElementById('return-isbn').value = '';
            
        } catch (error) {
            console.error('Error returning book:', error);
            this.showNotification('❌ Failed to return book: ' + error.message, 'error');
        } finally {
            this.hideLoading('return-form');
        }
    }

    // Quick actions for search results
    async quickBorrow(isbn) {
        const userName = prompt('Enter your name to borrow this book:');
        if (!userName || !userName.trim()) {
            this.showNotification('Borrow cancelled', 'info');
            return;
        }

        this.showLoading(`book-${isbn}`);

        try {
            const borrowData = { userName: userName.trim(), isbn };
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/borrow`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(borrowData)
                });
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to borrow book');
                }
            }

            this.showNotification(`✅ Book borrowed successfully by ${userName}!`, 'success');
            this.searchBooks(); // Refresh search results
            this.loadDashboardData(true);
            
        } catch (error) {
            console.error('Error borrowing book:', error);
            this.showNotification('❌ Failed to borrow book: ' + error.message, 'error');
        } finally {
            this.hideLoading(`book-${isbn}`);
        }
    }

    async viewBookDetails(isbn) {
        try {
            let bookDetails = null;
            
            if (this.isServerRunning) {
                const response = await fetch(`${this.apiBase}/books/${isbn}`);
                if (response.ok) {
                    bookDetails = await response.json();
                }
            } else {
                // Demo book details
                bookDetails = {
                    isbn: isbn,
                    title: 'Sample Book Title',
                    author: 'Sample Author',
                    category: 'Computer Science',
                    shelf: 'A1',
                    available: true,
                    borrowHistory: [
                        { user: 'John Doe', borrowedDate: '2023-12-01', returnedDate: '2023-12-15' },
                        { user: 'Jane Smith', borrowedDate: '2023-11-10', returnedDate: '2023-11-25' }
                    ],
                    rating: 4.5,
                    reviews: 12
                };
            }

            this.showBookDetailsModal(bookDetails);
            
        } catch (error) {
            console.error('Error fetching book details:', error);
            this.showNotification('❌ Failed to load book details', 'error');
        }
    }

    addToWishlist(isbn) {
        // Implementation for wishlist functionality
        this.showNotification('Added to wishlist! (Feature coming soon)', 'info');
    }

    showBookDetailsModal(book) {
        // Create and show book details modal
        const modalHtml = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal book-details-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-book"></i> Book Details</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="book-detail-card">
                            <h4>${book.title}</h4>
                            <p><strong>ISBN:</strong> ${book.isbn}</p>
                            <p><strong>Author:</strong> ${book.author}</p>
                            <p><strong>Category:</strong> ${book.category}</p>
                            <p><strong>Shelf:</strong> ${book.shelf}</p>
                            <p><strong>Status:</strong> ${book.available ? 'Available' : 'Borrowed'}</p>
                            ${book.rating ? `<p><strong>Rating:</strong> ${this.generateStarRating(book.rating)} ${book.rating}/5</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    findPath() {
        const startShelf = document.getElementById('start-shelf').value.trim();
        const endShelf = document.getElementById('end-shelf').value.trim();

        if (!startShelf || !endShelf) {
            this.showNotification('Please enter both shelves', 'error');
            return;
        }

        // Mock path finding
        const pathResult = document.getElementById('path-result');
        pathResult.innerHTML = `
            <h3>Shortest Path Found</h3>
            <div class="path-info">
                <p><strong>Distance:</strong> 9 meters</p>
                <p><strong>Path:</strong> ${startShelf} → Shelf-2 → ${endShelf}</p>
            </div>
            <div class="path-visualization">
                <div class="path-step">🏢 ${startShelf}</div>
                <div class="path-arrow">→</div>
                <div class="path-step">🏢 Shelf-2</div>
                <div class="path-arrow">→</div>
                <div class="path-step">🏢 ${endShelf}</div>
            </div>
        `;
    }

    getRecommendations() {
        const userName = document.getElementById('recommend-user').value.trim();

        if (!userName) {
            this.showNotification('Please enter user name', 'error');
            return;
        }

        // Mock recommendations
        const recommendations = [
            { title: 'Advanced Algorithms', author: 'Dr. Kumar Singh', category: 'CS' },
            { title: 'Machine Learning Advanced', author: 'Prof. Amit Patel', category: 'CS' },
            { title: 'Data Mining Concepts', author: 'Neha Sharma', category: 'CS' }
        ];

        const recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = `
            <h3>Recommendations for ${userName}</h3>
            <div class="recommendations-grid">
                ${recommendations.map(book => `
                    <div class="recommendation-card">
                        <h4>${book.title}</h4>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category}</p>
                        <button class="btn btn-primary btn-sm">
                            <i class="fas fa-hand-holding"></i> Borrow
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadingSpinner.id = `loading-${elementId}`;
            
            element.style.position = 'relative';
            element.appendChild(loadingSpinner);
            element.style.pointerEvents = 'none';
        }
    }

    hideLoading(elementId) {
        const loadingSpinner = document.getElementById(`loading-${elementId}`);
        if (loadingSpinner) {
            loadingSpinner.remove();
            const element = document.getElementById(elementId);
            if (element) {
                element.style.pointerEvents = 'auto';
            }
        }
    }

    clearAutoSave(fieldIds) {
        fieldIds.forEach(id => {
            localStorage.removeItem(`autosave_${id}`);
        });
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.toast-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `toast-notification toast-${type}`;
        
        let icon;
        switch (type) {
            case 'success': icon = 'fas fa-check-circle'; break;
            case 'error': icon = 'fas fa-exclamation-circle'; break;
            case 'warning': icon = 'fas fa-exclamation-triangle'; break;
            case 'info': icon = 'fas fa-info-circle'; break;
            default: icon = 'fas fa-bell';
        }

        notification.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.closest('.toast-notification').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            padding: 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Set colors based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #f44336, #e53935)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
                break;
            case 'info':
                notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
                break;
        }

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// Global functions for button clicks
function showAddBookModal() {
    app.showModal('add-book-modal');
}

function showAddUserModal() {
    app.showModal('add-user-modal');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function searchBooks() {
    app.searchBooks();
}

function borrowBook() {
    app.borrowBook();
}

function returnBook() {
    app.returnBook();
}

function findPath() {
    app.findPath();
}

function getRecommendations() {
    app.getRecommendations();
}

function viewBook(isbn) {
    app.showNotification(`Viewing book ${isbn}`, 'info');
}

function deleteBook(isbn) {
    if (confirm(`Are you sure you want to delete book ${isbn}?`)) {
        app.showNotification(`Book ${isbn} deleted`, 'success');
        app.loadBooksData();
    }
}

function viewUser(name) {
    app.showNotification(`Viewing user ${name}`, 'info');
}

function deleteUser(name) {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
        app.showNotification(`User ${name} deleted`, 'success');
        app.loadUsersData();
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LibraryUI();
});

// Add CSS for search results and other components
const additionalCSS = `
.search-result {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.search-results-list {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

.search-result-item {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #2a5298;
}

.search-result-item h4 {
    color: #2a5298;
    margin-bottom: 0.5rem;
}

.path-info {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

.path-visualization {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.path-step {
    background: linear-gradient(45deg, #64b5f6, #81c784);
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
}

.path-arrow {
    font-size: 1.5rem;
    color: #2a5298;
}

.recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.recommendation-card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-top: 4px solid #2a5298;
}

.recommendation-card h4 {
    color: #2a5298;
    margin-bottom: 0.5rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.available {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-badge.borrowed {
    background: #fff3e0;
    color: #f57c00;
}

.btn-sm {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
