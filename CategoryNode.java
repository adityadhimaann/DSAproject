import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Simple category tree node:
 * Example: ROOT -> [Fiction, Non-Fiction] -> [Science, Technology]
 */
public class CategoryNode implements Serializable {
    private static final long serialVersionUID = 1L;

    public String name;
    public List<CategoryNode> children;

    public CategoryNode(String name) {
        this.name = name;
        this.children = new ArrayList<>();
    }

    public void addChild(CategoryNode child) {
        children.add(child);
    }
}
