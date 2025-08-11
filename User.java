import java.io.Serializable;
import java.util.Stack;

public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    public String name;
    public String contact;
    public Stack<String> borrowHistory; // store titles

    public User(String name, String contact) {
        this.name = name;
        this.contact = contact;
        this.borrowHistory = new Stack<>();
    }

    public void addToHistory(String title) {
        borrowHistory.push(title);
    }

    public String lastBorrowed() {
        return borrowHistory.isEmpty() ? null : borrowHistory.peek();
    }

    @Override
    public String toString() {
        return String.format("%s (%s)", name, contact);
    }
}
