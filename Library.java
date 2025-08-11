import java.io.*;
import java.util.*;

/**
 * Core library management: books, users, persistence, search, borrow/return,
 * recommendations (via DP edit distance), shortest path (graph).
 */
public class Library implements Serializable {
    private static final long serialVersionUID = 1L;

    // primary stores
    private Map<String, Book> booksByIsbn = new HashMap<>(); // ISBN -> Book
    private Map<String, User> usersByName = new HashMap<>(); // name -> User
    private LibraryGraph graph = new LibraryGraph();
    private CategoryNode categoryRoot = new CategoryNode("ROOT");

    // persistence file
    private static final String SAVE_FILE = "library_data.ser";

    // ====== CRUD ======
    public void addBook(Book b) {
        booksByIsbn.put(b.isbn, b);
    }

    public void addUser(User u) {
        usersByName.put(u.name, u);
    }

    public Book getBookByIsbn(String isbn) {
        return booksByIsbn.get(isbn);
    }

    public User getUserByName(String name) {
        return usersByName.get(name);
    }

    // ====== Borrowing ======
    public synchronized String borrowBook(String userName, String isbn) {
        User user = usersByName.get(userName);
        Book book = booksByIsbn.get(isbn);
        if (user == null) return "User not found";
        if (book == null) return "Book not found";

        if (book.isAvailable()) {
            book.setAvailable(false);
            user.addToHistory(book.title);
            return String.format("SUCCESS: %s issued to %s", book.title, user.name);
        } else {
            // add to waiting queue only if not already present
            if (!book.waitingQueue.contains(user.name)) {
                book.waitingQueue.add(user.name);
                return String.format("Placed %s in waiting list for %s", user.name, book.title);
            } else {
                return "Already in waiting list";
            }
        }
    }

    public synchronized String returnBook(String isbn) {
        Book book = booksByIsbn.get(isbn);
        if (book == null) return "Book not found";

        if (!book.waitingQueue.isEmpty()) {
            String nextUserName = book.waitingQueue.poll();
            User nextUser = usersByName.get(nextUserName);
            if (nextUser != null) {
                nextUser.addToHistory(book.title);
                // book remains not available because reissued immediately
                book.setAvailable(false);
                return String.format("Book %s returned and issued to %s", book.title, nextUser.name);
            } else {
                // if user deleted, try next recursively (rare)
                return returnBook(isbn);
            }
        } else {
            book.setAvailable(true);
            return String.format("Book %s returned and now available", book.title);
        }
    }

    // ====== Search (binary search on sorted array of titles) ======
    public Book searchByTitleBinary(String title) {
        List<Book> list = new ArrayList<>(booksByIsbn.values());
        list.sort(Comparator.comparing(b -> b.title.toLowerCase()));
        int l = 0, r = list.size() - 1;
        title = title.toLowerCase();
        while (l <= r) {
            int m = (l + r) >>> 1;
            int cmp = title.compareTo(list.get(m).title.toLowerCase());
            if (cmp == 0) return list.get(m);
            if (cmp < 0) r = m - 1; else l = m + 1;
        }
        return null;
    }

    // ====== Display ======
    public void displayAllBooks() {
        System.out.println("=== All Books ===");
        List<Book> list = new ArrayList<>(booksByIsbn.values());
        list.sort(Comparator.comparing(b -> b.title.toLowerCase()));
        for (Book b : list) System.out.println(b);
    }

    public void displayAvailableBooks() {
        System.out.println("=== Available Books ===");
        booksByIsbn.values().stream()
                .filter(Book::isAvailable)
                .sorted(Comparator.comparing(b -> b.title.toLowerCase()))
                .forEach(System.out::println);
    }

    public void displayWaitingList(String isbn) {
        Book b = booksByIsbn.get(isbn);
        if (b == null) {
            System.out.println("Book not found");
            return;
        }
        System.out.println("Waiting list for " + b.title + ":");
        if (b.waitingQueue.isEmpty()) System.out.println("No one waiting");
        else b.waitingQueue.forEach(System.out::println);
    }

    // ====== Graph operations ======
    public LibraryGraph getGraph() {
        return graph;
    }

    // ====== Category tree operations (basic) ======
    public CategoryNode getCategoryRoot() { return categoryRoot; }

    // ====== Recommendations (DP: Levenshtein distance) ======
    /**
     * Recommend up to k books similar to user's last borrowed book using edit distance (DP)
     */
    public List<Book> recommendByLastBorrow(String userName, int k) {
        User u = usersByName.get(userName);
        if (u == null) return Collections.emptyList();
        String last = u.lastBorrowed();
        if (last == null) return Collections.emptyList();

        // compute edit distance to all other book titles
        PriorityQueue<Map.Entry<Book, Integer>> pq = new PriorityQueue<>(Map.Entry.comparingByValue());
        for (Book b : booksByIsbn.values()) {
            if (b.title.equalsIgnoreCase(last)) continue;
            int dist = levenshteinDP(last.toLowerCase(), b.title.toLowerCase());
            pq.add(new AbstractMap.SimpleEntry<>(b, dist));
        }
        List<Book> rec = new ArrayList<>();
        while (!pq.isEmpty() && rec.size() < k) rec.add(pq.poll().getKey());
        return rec;
    }

    // DP edit distance
    private int levenshteinDP(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n+1][m+1];
        for (int i=0;i<=n;i++) dp[i][0]=i;
        for (int j=0;j<=m;j++) dp[0][j]=j;
        for (int i=1;i<=n;i++){
            for (int j=1;j<=m;j++){
                if (a.charAt(i-1)==b.charAt(j-1)) dp[i][j]=dp[i-1][j-1];
                else dp[i][j]=1+Math.min(Math.min(dp[i-1][j], dp[i][j-1]), dp[i-1][j-1]);
            }
        }
        return dp[n][m];
    }

    // ====== Persistence ======
    public void saveState() throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(SAVE_FILE))) {
            oos.writeObject(this);
        }
    }

    public static Library loadState() {
        File f = new File(SAVE_FILE);
        if (!f.exists()) return null;
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(f))) {
            return (Library) ois.readObject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ====== Utilities ======
    public Set<String> listAllUsers() { return usersByName.keySet(); }
    public Collection<Book> allBooks() { return booksByIsbn.values(); }
}
