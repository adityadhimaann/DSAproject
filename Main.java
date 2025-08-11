import java.io.IOException;
import java.util.List;
import java.util.Scanner;

public class Main {
    private static Library lib;
    private static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        // load or create
        lib = Library.loadState();
        if (lib == null) {
            lib = new Library();
            populateSampleData(lib);
            System.out.println("Initialized new library with sample data (Indian names).");
        } else {
            System.out.println("Loaded saved library state.");
        }

        loopMenu();

        // on exit save
        try {
            lib.saveState();
            System.out.println("Library state saved.");
        } catch (IOException e) {
            System.err.println("Error saving state: " + e.getMessage());
        }
    }

    private static void loopMenu() {
        while (true) {
            System.out.println("\n========== University Library System ==========");
            System.out.println("1. Display all books");
            System.out.println("2. Display available books");
            System.out.println("3. Search book by title (binary search)");
            System.out.println("4. Borrow book");
            System.out.println("5. Return book");
            System.out.println("6. Show waiting list for a book");
            System.out.println("7. Find shortest path to shelf");
            System.out.println("8. Recommend books for a user");
            System.out.println("9. List users");
            System.out.println("0. Exit");
            System.out.print("Choose: ");
            String opt = sc.nextLine().trim();
            switch (opt) {
                case "1": lib.displayAllBooks(); break;
                case "2": lib.displayAvailableBooks(); break;
                case "3": handleSearch(); break;
                case "4": handleBorrow(); break;
                case "5": handleReturn(); break;
                case "6": handleWaitingList(); break;
                case "7": handleShortestPath(); break;
                case "8": handleRecommend(); break;
                case "9": lib.listAllUsers().forEach(System.out::println); break;
                case "0": return;
                default: System.out.println("Invalid option");
            }
        }
    }

    private static void handleSearch() {
        System.out.print("Enter title to search: ");
        String t = sc.nextLine().trim();
        Book b = lib.searchByTitleBinary(t);
        if (b == null) System.out.println("Not found");
        else System.out.println("Found -> " + b + " | Shelf: " + b.shelf);
    }

    private static void handleBorrow() {
        System.out.print("Enter user name: ");
        String u = sc.nextLine().trim();
        System.out.print("Enter ISBN: ");
        String isbn = sc.nextLine().trim();
        String res = lib.borrowBook(u, isbn);
        System.out.println(res);
    }

    private static void handleReturn() {
        System.out.print("Enter ISBN to return: ");
        String isbn = sc.nextLine().trim();
        String res = lib.returnBook(isbn);
        System.out.println(res);
    }

    private static void handleWaitingList() {
        System.out.print("Enter ISBN: ");
        String isbn = sc.nextLine().trim();
        lib.displayWaitingList(isbn);
    }

    private static void handleShortestPath() {
        System.out.print("Enter start shelf (e.g., Shelf-1): ");
        String a = sc.nextLine().trim();
        System.out.print("Enter target shelf: ");
        String b = sc.nextLine().trim();
        LibraryGraph.Pair<Integer, java.util.List<String>> ans = lib.getGraph().shortestPath(a, b);
        if (ans.first == Integer.MAX_VALUE) System.out.println("No path");
        else {
            System.out.println("Distance: " + ans.first + " meters");
            System.out.println("Path: " + String.join(" -> ", ans.second));
        }
    }

    private static void handleRecommend() {
        System.out.print("Enter user name: ");
        String u = sc.nextLine().trim();
        List<Book> rec = lib.recommendByLastBorrow(u, 5);
        if (rec.isEmpty()) System.out.println("No recommendations (no history or not enough books)");
        else {
            System.out.println("Recommendations:");
            for (Book b : rec) System.out.println(b);
        }
    }

    // sample data - Indian names and common CS books
    private static void populateSampleData(Library lib) {
        // Graph shelves
        lib.getGraph().addPath("Shelf-1", "Shelf-2", 5);
        lib.getGraph().addPath("Shelf-2", "Shelf-3", 4);
        lib.getGraph().addPath("Shelf-2", "Shelf-4", 7);
        lib.getGraph().addPath("Shelf-3", "Shelf-5", 3);

        // Books
        lib.addBook(new Book("INB001", "Data Structures in Java", "Prof. Rajesh Kumar", "CS", "Shelf-3"));
        lib.addBook(new Book("INB002", "Algorithms Unlocked", "Dr. Suresh Verma", "CS", "Shelf-2"));
        lib.addBook(new Book("INB003", "Operating System Concepts", "Amitabh Tiwari", "CS", "Shelf-4"));
        lib.addBook(new Book("INB004", "Computer Networks", "Neha Gupta", "CS", "Shelf-3"));
        lib.addBook(new Book("INB005", "Database System Concepts", "Deepak Joshi", "CS", "Shelf-5"));
        lib.addBook(new Book("INB006", "Introduction to AI", "Priya Reddy", "CS", "Shelf-1"));
        lib.addBook(new Book("INB007", "Discrete Mathematics", "Sanjay Yadav", "Math", "Shelf-2"));
        lib.addBook(new Book("INB008", "Design Patterns in Java", "Rohit Malhotra", "CS", "Shelf-4"));
        lib.addBook(new Book("INB009", "Compiler Design", "Anita Singh", "CS", "Shelf-5"));
        lib.addBook(new Book("INB010", "Machine Learning Basics", "Vikram Patel", "CS", "Shelf-1"));

        // Users (Indian names)
        lib.addUser(new User("Amit Sharma", "9876543210"));
        lib.addUser(new User("Priya Singh", "9876501234"));
        lib.addUser(new User("Rohan Kumar", "9812345678"));
        lib.addUser(new User("Neha Verma", "9900112233"));
        lib.addUser(new User("Sandeep Joshi", "9887766554"));

        // Some initial borrow actions to create history
        lib.borrowBook("Amit Sharma", "INB001"); // Amit borrows Data Structures
        lib.borrowBook("Priya Singh", "INB002");
        lib.borrowBook("Rohan Kumar", "INB004");
        // Rohan tries to borrow INB001 which is with Amit -> waiting
        lib.borrowBook("Rohan Kumar", "INB001");
    }
}
