import java.io.Serializable;
import java.util.*;

public class LibraryGraph implements Serializable {
    private static final long serialVersionUID = 1L;

    private Map<String, Map<String, Integer>> adj = new HashMap<>();

    public void addShelf(String shelf) {
        adj.putIfAbsent(shelf, new HashMap<>());
    }

    public void addPath(String a, String b, int distance) {
        addShelf(a);
        addShelf(b);
        adj.get(a).put(b, distance);
        adj.get(b).put(a, distance);
    }

    /**
     * Dijkstra returns pair: (distance, path list). If unreachable, distance = Integer.MAX_VALUE
     */
    public Pair<Integer, List<String>> shortestPath(String start, String end) {
        if (!adj.containsKey(start) || !adj.containsKey(end)) return new Pair<>(Integer.MAX_VALUE, Collections.emptyList());

        Map<String, Integer> dist = new HashMap<>();
        Map<String, String> parent = new HashMap<>();
        for (String node : adj.keySet()) dist.put(node, Integer.MAX_VALUE);
        dist.put(start, 0);

        PriorityQueue<Map.Entry<String, Integer>> pq = new PriorityQueue<>(Map.Entry.comparingByValue());
        pq.add(new AbstractMap.SimpleEntry<>(start, 0));
        Set<String> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            String cur = pq.poll().getKey();
            if (!visited.add(cur)) continue;
            if (cur.equals(end)) break;

            for (Map.Entry<String, Integer> nb : adj.get(cur).entrySet()) {
                int nd = dist.get(cur) + nb.getValue();
                if (nd < dist.get(nb.getKey())) {
                    dist.put(nb.getKey(), nd);
                    parent.put(nb.getKey(), cur);
                    pq.add(new AbstractMap.SimpleEntry<>(nb.getKey(), nd));
                }
            }
        }

        if (dist.get(end) == Integer.MAX_VALUE) return new Pair<>(Integer.MAX_VALUE, Collections.emptyList());

        // reconstruct path
        LinkedList<String> path = new LinkedList<>();
        String cur = end;
        while (cur != null) {
            path.addFirst(cur);
            cur = parent.get(cur);
        }
        return new Pair<>(dist.get(end), path);
    }

    // Simple Pair helper
    public static class Pair<A,B> implements Serializable {
        private static final long serialVersionUID = 1L;
        public A first; public B second;
        public Pair(A a, B b){first=a; second=b;}
    }
}
