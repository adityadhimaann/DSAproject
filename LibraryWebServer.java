import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.Executors;
import com.sun.net.httpserver.*;

/**
 * Simple HTTP Server to serve the frontend and handle API requests
 * for the Library Management System
 */
public class LibraryWebServer {
    private static final int PORT = 8080;
    private static final String FRONTEND_DIR = "frontend";
    private static Library library;
    private HttpServer server;

    public LibraryWebServer() throws IOException {
        // Initialize library
        library = Library.loadState();
        if (library == null) {
            library = new Library();
            populateSampleData();
        }

        // Create HTTP server
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // Set up routes
        setupRoutes();
        
        // Set executor
        server.setExecutor(Executors.newFixedThreadPool(10));
    }

    private void setupRoutes() {
        // Serve static files
        server.createContext("/", new StaticFileHandler());
        
        // API routes
        server.createContext("/api/books", new BooksHandler());
        server.createContext("/api/users", new UsersHandler());
        server.createContext("/api/borrow", new BorrowHandler());
        server.createContext("/api/return", new ReturnHandler());
        server.createContext("/api/search", new SearchHandler());
        server.createContext("/api/path", new PathHandler());
        server.createContext("/api/recommend", new RecommendHandler());
        server.createContext("/api/stats", new StatsHandler());
    }

    public void start() {
        server.start();
        System.out.println("🚀 Library Management System Web Server started!");
        System.out.println("📱 Open your browser and visit: http://localhost:" + PORT);
        System.out.println("🛑 Press Ctrl+C to stop the server");
    }

    public void stop() {
        server.stop(0);
        try {
            library.saveState();
            System.out.println("💾 Library state saved successfully!");
        } catch (IOException e) {
            System.err.println("❌ Error saving state: " + e.getMessage());
        }
    }

    // Static file handler for serving HTML, CSS, JS files
    class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            
            // Default to index.html
            if (path.equals("/")) {
                path = "/index.html";
            }
            
            File file = new File(FRONTEND_DIR + path);
            
            if (file.exists() && !file.isDirectory()) {
                // Determine content type
                String contentType = getContentType(path);
                
                // Read file content
                byte[] content = Files.readAllBytes(file.toPath());
                
                // Send response
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, content.length);
                
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(content);
                }
            } else {
                // File not found
                String response = "404 - File Not Found";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }
        
        private String getContentType(String path) {
            if (path.endsWith(".html")) return "text/html";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            if (path.endsWith(".json")) return "application/json";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            if (path.endsWith(".gif")) return "image/gif";
            if (path.endsWith(".svg")) return "image/svg+xml";
            return "text/plain";
        }
    }

    // API Handlers
    class BooksHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            
            if ("GET".equals(method)) {
                // Get all books
                Collection<Book> books = library.allBooks();
                String json = booksToJson(new ArrayList<>(books));
                sendJsonResponse(exchange, json);
            } else if ("POST".equals(method)) {
                // Add new book
                // For demo purposes, we'll just return success
                sendJsonResponse(exchange, "{\"success\": true, \"message\": \"Book added\"}");
            }
        }
    }

    class UsersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("GET".equals(exchange.getRequestMethod())) {
                Set<String> userNames = library.listAllUsers();
                String json = userNamesToJson(userNames);
                sendJsonResponse(exchange, json);
            }
        }
    }

    class BorrowHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                // For demo purposes, using mock data
                String result = library.borrowBook("Test User", "INB001");
                String json = "{\"success\": true, \"message\": \"" + result + "\"}";
                sendJsonResponse(exchange, json);
            }
        }
    }

    class ReturnHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                // For demo purposes, using mock ISBN
                String result = library.returnBook("INB001");
                String json = "{\"success\": true, \"message\": \"" + result + "\"}";
                sendJsonResponse(exchange, json);
            }
        }
    }

    class SearchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String query = getQueryParam(exchange, "q");
            if (query != null) {
                Book book = library.searchByTitleBinary(query);
                String json = book != null ? bookToJson(book) : "{\"found\": false}";
                sendJsonResponse(exchange, json);
            } else {
                sendJsonResponse(exchange, "{\"error\": \"Query parameter required\"}");
            }
        }
    }

    class PathHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String from = getQueryParam(exchange, "from");
            String to = getQueryParam(exchange, "to");
            
            if (from != null && to != null) {
                LibraryGraph.Pair<Integer, List<String>> result = 
                    library.getGraph().shortestPath(from, to);
                String json = pathToJson(result);
                sendJsonResponse(exchange, json);
            } else {
                sendJsonResponse(exchange, "{\"error\": \"From and to parameters required\"}");
            }
        }
    }

    class RecommendHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String user = getQueryParam(exchange, "user");
            if (user != null) {
                List<Book> recommendations = library.recommendByLastBorrow(user, 5);
                String json = booksToJson(recommendations);
                sendJsonResponse(exchange, json);
            } else {
                sendJsonResponse(exchange, "{\"error\": \"User parameter required\"}");
            }
        }
    }

    class StatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Collection<Book> allBooks = library.allBooks();
            Set<String> userNames = library.listAllUsers();
            
            int totalBooks = allBooks.size();
            int availableBooks = (int) allBooks.stream().filter(Book::isAvailable).count();
            int borrowedBooks = totalBooks - availableBooks;
            int totalUsers = userNames.size();
            
            String json = String.format(
                "{\"totalBooks\": %d, \"availableBooks\": %d, \"borrowedBooks\": %d, \"totalUsers\": %d}",
                totalBooks, availableBooks, borrowedBooks, totalUsers
            );
            
            sendJsonResponse(exchange, json);
        }
    }

    // Utility methods
    private void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(200, json.length());
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(json.getBytes());
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody()))) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
            return body.toString();
        }
    }

    private String getQueryParam(HttpExchange exchange, String param) {
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2 && keyValue[0].equals(param)) {
                    try {
                        return URLDecoder.decode(keyValue[1], "UTF-8");
                    } catch (UnsupportedEncodingException e) {
                        return keyValue[1];
                    }
                }
            }
        }
        return null;
    }

    // JSON conversion methods (simplified)
    private String booksToJson(List<Book> books) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < books.size(); i++) {
            if (i > 0) json.append(",");
            json.append(bookToJson(books.get(i)));
        }
        json.append("]");
        return json.toString();
    }

    private String bookToJson(Book book) {
        return String.format(
            "{\"isbn\":\"%s\",\"title\":\"%s\",\"author\":\"%s\",\"category\":\"%s\",\"shelf\":\"%s\",\"status\":\"%s\"}",
            book.isbn, book.title, book.author, book.category, book.shelf,
            book.isAvailable() ? "Available" : "Borrowed"
        );
    }

    private String userNamesToJson(Set<String> userNames) {
        StringBuilder json = new StringBuilder("[");
        int i = 0;
        for (String userName : userNames) {
            if (i > 0) json.append(",");
            User user = library.getUserByName(userName);
            if (user != null) {
                json.append(String.format(
                    "{\"name\":\"%s\",\"contact\":\"%s\",\"booksCount\":%d}",
                    user.name, user.contact, user.borrowHistory.size()
                ));
            }
            i++;
        }
        json.append("]");
        return json.toString();
    }

    private String pathToJson(LibraryGraph.Pair<Integer, List<String>> result) {
        if (result.first == Integer.MAX_VALUE) {
            return "{\"found\": false}";
        }
        
        StringBuilder pathJson = new StringBuilder("[");
        List<String> path = result.second;
        for (int i = 0; i < path.size(); i++) {
            if (i > 0) pathJson.append(",");
            pathJson.append("\"").append(path.get(i)).append("\"");
        }
        pathJson.append("]");
        
        return String.format(
            "{\"found\": true, \"distance\": %d, \"path\": %s}",
            result.first, pathJson.toString()
        );
    }

    private static void populateSampleData() {
        // Same sample data as in Main.java
        library.getGraph().addPath("Shelf-1", "Shelf-2", 5);
        library.getGraph().addPath("Shelf-2", "Shelf-3", 4);
        library.getGraph().addPath("Shelf-2", "Shelf-4", 7);
        library.getGraph().addPath("Shelf-3", "Shelf-5", 3);

        library.addBook(new Book("INB001", "Data Structures in Java", "Prof. Rajesh Kumar", "CS", "Shelf-3"));
        library.addBook(new Book("INB002", "Algorithms Unlocked", "Dr. Suresh Verma", "CS", "Shelf-2"));
        library.addBook(new Book("INB003", "Operating System Concepts", "Amitabh Tiwari", "CS", "Shelf-4"));
        library.addBook(new Book("INB004", "Computer Networks", "Neha Gupta", "CS", "Shelf-3"));
        library.addBook(new Book("INB005", "Database System Concepts", "Deepak Joshi", "CS", "Shelf-5"));
        library.addBook(new Book("INB006", "Introduction to AI", "Priya Reddy", "CS", "Shelf-1"));
        library.addBook(new Book("INB007", "Discrete Mathematics", "Sanjay Yadav", "Math", "Shelf-2"));
        library.addBook(new Book("INB008", "Design Patterns in Java", "Rohit Malhotra", "CS", "Shelf-4"));
        library.addBook(new Book("INB009", "Compiler Design", "Anita Singh", "CS", "Shelf-5"));
        library.addBook(new Book("INB010", "Machine Learning Basics", "Vikram Patel", "CS", "Shelf-1"));

        library.addUser(new User("Amit Sharma", "9876543210"));
        library.addUser(new User("Priya Singh", "9876501234"));
        library.addUser(new User("Rohan Kumar", "9812345678"));
        library.addUser(new User("Neha Verma", "9900112233"));
        library.addUser(new User("Sandeep Joshi", "9887766554"));

        library.borrowBook("Amit Sharma", "INB001");
        library.borrowBook("Priya Singh", "INB002");
        library.borrowBook("Rohan Kumar", "INB004");
        library.borrowBook("Rohan Kumar", "INB001");
    }

    public static void main(String[] args) {
        try {
            LibraryWebServer webServer = new LibraryWebServer();
            
            // Add shutdown hook to save state
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n🛑 Shutting down server...");
                webServer.stop();
            }));
            
            webServer.start();
            
            // Keep the server running
            Thread.currentThread().join();
            
        } catch (Exception e) {
            System.err.println("❌ Error starting web server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
