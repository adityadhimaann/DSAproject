// Library Management System Frontend
class LibraryUI {
    constructor() {
        this.init();
        this.loadDashboardData();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupModals();
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
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
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
    }

    setupModals() {
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    loadDashboardData() {
        // Simulate loading dashboard statistics
        this.updateStats();
        this.loadRecentActivity();
        this.loadCategoryChart();
    }

    updateStats() {
        // Mock data - in real implementation, this would come from Java backend
        const stats = {
            totalBooks: 10,
            availableBooks: 7,
            totalUsers: 5,
            borrowedBooks: 3
        };

        document.getElementById('total-books').textContent = stats.totalBooks;
        document.getElementById('available-books').textContent = stats.availableBooks;
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('borrowed-books').textContent = stats.borrowedBooks;
    }

    loadRecentActivity() {
        const activities = [
            { icon: 'fas fa-book', text: 'Amit Sharma borrowed "Data Structures in Java"', time: '2 hours ago' },
            { icon: 'fas fa-user-plus', text: 'New user Priya Singh registered', time: '4 hours ago' },
            { icon: 'fas fa-undo', text: 'Book "Algorithms Unlocked" returned', time: '6 hours ago' },
            { icon: 'fas fa-search', text: 'Search performed for "Machine Learning"', time: '1 day ago' }
        ];

        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    loadCategoryChart() {
        const categories = [
            { name: 'Computer Science', count: 7 },
            { name: 'Mathematics', count: 2 },
            { name: 'Physics', count: 1 }
        ];

        const categoryChart = document.getElementById('category-chart');
        categoryChart.innerHTML = categories.map(category => `
            <div class="category-item">
                <span class="category-name">${category.name}</span>
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

    loadBooksData() {
        // Mock books data
        const books = [
            { isbn: 'INB001', title: 'Data Structures in Java', author: 'Prof. Rajesh Kumar', category: 'CS', shelf: 'Shelf-3', status: 'Borrowed' },
            { isbn: 'INB002', title: 'Algorithms Unlocked', author: 'Dr. Suresh Verma', category: 'CS', shelf: 'Shelf-2', status: 'Available' },
            { isbn: 'INB003', title: 'Operating System Concepts', author: 'Amitabh Tiwari', category: 'CS', shelf: 'Shelf-4', status: 'Available' },
            { isbn: 'INB004', title: 'Computer Networks', author: 'Neha Gupta', category: 'CS', shelf: 'Shelf-3', status: 'Borrowed' },
            { isbn: 'INB005', title: 'Database System Concepts', author: 'Deepak Joshi', category: 'CS', shelf: 'Shelf-5', status: 'Available' }
        ];

        const booksTable = document.getElementById('books-table');
        booksTable.innerHTML = books.map(book => `
            <tr>
                <td>${book.isbn}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.shelf}</td>
                <td>
                    <span class="status-badge ${book.status.toLowerCase()}">
                        ${book.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewBook('${book.isbn}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.isbn}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadUsersData() {
        // Mock users data
        const users = [
            { name: 'Amit Sharma', phone: '9876543210', booksCount: 1 },
            { name: 'Priya Singh', phone: '9876501234', booksCount: 1 },
            { name: 'Rohan Kumar', phone: '9812345678', booksCount: 1 },
            { name: 'Neha Verma', phone: '9900112233', booksCount: 0 },
            { name: 'Sandeep Joshi', phone: '9887766554', booksCount: 0 }
        ];

        const usersTable = document.getElementById('users-table');
        usersTable.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.booksCount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewUser('${user.name}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addBook() {
        const isbn = document.getElementById('new-isbn').value;
        const title = document.getElementById('new-title').value;
        const author = document.getElementById('new-author').value;
        const category = document.getElementById('new-category').value;
        const shelf = document.getElementById('new-shelf').value;

        if (!isbn || !title || !author || !category || !shelf) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // In real implementation, send this data to Java backend
        console.log('Adding book:', { isbn, title, author, category, shelf });
        
        this.showNotification('Book added successfully!', 'success');
        this.closeModal('add-book-modal');
        this.loadBooksData();
        
        // Clear form
        document.getElementById('add-book-form').reset();
    }

    addUser() {
        const name = document.getElementById('new-user-name').value;
        const phone = document.getElementById('new-user-phone').value;

        if (!name || !phone) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // In real implementation, send this data to Java backend
        console.log('Adding user:', { name, phone });
        
        this.showNotification('User added successfully!', 'success');
        this.closeModal('add-user-modal');
        this.loadUsersData();
        
        // Clear form
        document.getElementById('add-user-form').reset();
    }

    searchBooks() {
        const searchTerm = document.getElementById('search-input').value.trim();
        
        if (!searchTerm) {
            this.showNotification('Please enter a search term', 'error');
            return;
        }

        // Mock search results
        const results = [
            { isbn: 'INB001', title: 'Data Structures in Java', author: 'Prof. Rajesh Kumar', shelf: 'Shelf-3' },
            { isbn: 'INB010', title: 'Machine Learning Basics', author: 'Vikram Patel', shelf: 'Shelf-1' }
        ].filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()));

        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result">
                    <h3>No books found</h3>
                    <p>No books matching "${searchTerm}" were found.</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = `
                <h3>Search Results (${results.length} found)</h3>
                <div class="search-results-list">
                    ${results.map(book => `
                        <div class="search-result-item">
                            <h4>${book.title}</h4>
                            <p><strong>ISBN:</strong> ${book.isbn}</p>
                            <p><strong>Author:</strong> ${book.author}</p>
                            <p><strong>Shelf:</strong> ${book.shelf}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    borrowBook() {
        const userName = document.getElementById('borrow-user').value.trim();
        const isbn = document.getElementById('borrow-isbn').value.trim();

        if (!userName || !isbn) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Mock borrow operation
        console.log('Borrowing book:', { userName, isbn });
        this.showNotification(`Book ${isbn} borrowed by ${userName}`, 'success');
        
        // Clear form
        document.getElementById('borrow-user').value = '';
        document.getElementById('borrow-isbn').value = '';
    }

    returnBook() {
        const isbn = document.getElementById('return-isbn').value.trim();

        if (!isbn) {
            this.showNotification('Please enter ISBN', 'error');
            return;
        }

        // Mock return operation
        console.log('Returning book:', { isbn });
        this.showNotification(`Book ${isbn} returned successfully`, 'success');
        
        // Clear form
        document.getElementById('return-isbn').value = '';
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

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
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
