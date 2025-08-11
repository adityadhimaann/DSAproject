# University Library Management System

A Java-based library management system implementing various data structures and algorithms for managing books, users, and library operations.

## Features

- **Book Management**: Add, search, and manage books with binary search functionality
- **User Management**: Register and manage library users
- **Borrowing System**: Borrow and return books with waiting list support
- **Graph-based Navigation**: Find shortest paths between library shelves using Dijkstra's algorithm
- **Recommendation System**: Book recommendations based on user borrowing history
- **Data Persistence**: Save and load library state using serialization

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

## How to Run

1. Compile all Java files:
   ```bash
   javac *.java
   ```

2. Run the main program:
   ```bash
   java Main
   ```

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
