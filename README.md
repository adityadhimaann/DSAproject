# University Library Management System

A comprehensive Java-based library management system with both console and web interfaces, implementing various data structures and algorithms for managing books, users, and library operations.

## 🌟 Features

- **📚 Book Management**: Add, search, and manage books with binary search functionality
- **👥 User Management**: Register and manage library users
- **📖 Borrowing System**: Borrow and return books with waiting list support
- **🗺️ Graph-based Navigation**: Find shortest paths between library shelves using Dijkstra's algorithm
- **🎯 Recommendation System**: Book recommendations based on user borrowing history using dynamic programming
- **💾 Data Persistence**: Save and load library state using serialization
- **🌐 Modern Web Interface**: Beautiful, responsive dashboard for easy management
- **📱 Mobile-Friendly**: Works perfectly on desktop, tablet, and mobile devices

## 🎨 Web Interface

The system now includes a stunning web dashboard with:
- **Real-time Statistics**: Overview of books, users, and borrowing activity
- **Interactive Navigation**: Easy-to-use sidebar navigation
- **Book Management**: Add, view, and manage books through the web interface
- **User Management**: Handle user registration and view user details
- **Search Functionality**: Fast book search with instant results
- **Path Finding**: Visual representation of shortest paths between shelves
- **Recommendations**: Get personalized book recommendations for users

## 🛠️ Technology Stack

- **Backend**: Java with HTTP Server
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Data Structures Used

- **Binary Search**: For efficient book searching by title
- **Queue**: For managing waiting lists when books are unavailable
- **Graph**: For representing library layout and finding shortest paths
- **ArrayList**: For storing books, users, and various collections
- **HashMap**: For efficient data lookups and mappings

## Classes

- `Main.java`: Entry point with user interface and menu system
- `Library.java`: Core library management functionality
- `Book.java`: Book entity with properties and methods
- `User.java`: User entity for library members
- `LibraryGraph.java`: Graph implementation for shelf navigation
- `CategoryNode.java`: Node structure for book categorization

## 🚀 How to Run

### Option 1: Web Interface (Recommended)
1. **Quick Start**:
   ```bash
   ./start-web.sh
   ```

2. **Manual Start**:
   ```bash
   # Compile all Java files
   javac *.java
   
   # Start the web server
   java LibraryWebServer
   ```

3. **Access the Dashboard**:
   - Open your browser and visit: `http://localhost:8080`
   - Enjoy the modern, responsive interface!

### Option 2: Console Interface
1. **Compile and Run**:
   ```bash
   javac *.java
   java Main
   ```

2. **Use the Text Menu**:
   - Follow the console prompts to interact with the system

## 📱 Web Interface Features

### 🏠 Dashboard
- Real-time statistics and metrics
- Recent activity feed
- Popular categories overview
- Beautiful gradient design with smooth animations

### 📚 Books Management
- View all books in a sortable table
- Add new books with a modal form
- Search books with instant results
- Visual status indicators (Available/Borrowed)

### 👥 Users Management
- User registration and management
- View borrowing history
- Contact information tracking

### 🔄 Borrow/Return Operations
- Easy book borrowing interface
- Quick return functionality
- Real-time status updates

### 🧭 Navigation System
- Visual path finder between shelves
- Distance calculation display
- Interactive shelf mapping

### ⭐ Recommendations
- Personalized book suggestions
- Based on borrowing history
- Advanced algorithm using edit distance

## 📊 Screenshots

The web interface features:
- **Modern Design**: Clean, professional look with gradient backgrounds
- **Responsive Layout**: Works on all device sizes
- **Smooth Animations**: Engaging user experience with CSS transitions
- **Intuitive Navigation**: Easy-to-use sidebar and clear sections
- **Visual Feedback**: Toast notifications and loading states

## Sample Data

The system comes pre-populated with:
- 10 sample books (Computer Science and Mathematics)
- 5 sample users with Indian names
- Sample shelf connections for navigation
- Initial borrowing history for testing recommendations

## Menu Options

1. Display all books
2. Display available books
3. Search book by title (binary search)
4. Borrow book
5. Return book
6. Show waiting list for a book
7. Find shortest path to shelf
8. Recommend books for a user
9. List users
0. Exit

## Author

Developed as a Data Structures and Algorithms project.
