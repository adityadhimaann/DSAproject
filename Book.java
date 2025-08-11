import java.io.Serializable;
import java.util.LinkedList;
import java.util.Queue;

public class Book implements Serializable {
    private static final long serialVersionUID = 1L;

    public String isbn;
    public String title;
    public String author;
    public String category;
    public String shelf; // e.g., "Shelf-4"
    private boolean available;
    public Queue<String> waitingQueue; // store userNames waiting

    public Book(String isbn, String title, String author, String category, String shelf) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.category = category;
        this.shelf = shelf;
        this.available = true;
        this.waitingQueue = new LinkedList<>();
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean val) {
        this.available = val;
    }

    @Override
    public String toString() {
        return String.format("%s | %s | %s | %s | %s", isbn, title, author, category, (available ? "Available" : "Issued"));
    }
}
