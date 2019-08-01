package qwerty4967.Ziker3;
import java.util.ArrayList; 
import java.util.List;
public class Node extends objectWithID
{

	/* What's this?
	 * 
	 * The node class works with the Leaf class to help form
	 * a tree data structure.
	 * 
	 * This is useful to this project because:
	 *  Having a tree data structure is  nesecary to understand the code, because
	 *  even if it is generally parsed linearly, it...
	 *  uh...
	 *  okay, the tree concept is used to understand conditionals.
	 *  nodes repersent conditionals themselves, and leaves represent 
	 *  blocks of code governed by those conditionals.
	 *  Got it?
	 *  no?
	 *  whatever.
	 *  no comments in the rest of this, so, you're on your own.
	 */
	
	ArrayList<objectWithID> children = new ArrayList<objectWithID>(); // children of the Node. should be Instances of node or leaf
	String condition; // should result in boolean.
	String conditionType; // should in all cases be "while" or "if"
	int index=0;
	Node parent;
	
	// this constructor should be used for root only.
	public Node( String condition, String conditionType)
	{
		this.condition = condition;
		this.conditionType = conditionType;
		//okay, am I done?
	}
	
	public Node( String condition, String conditionType, Node parent)
	{
		this.condition = condition;
		this.conditionType = conditionType;
		this.parent = parent;
		parent.addToNode(this);
		//okay, am I done?
	}
	
	public void addToNode(objectWithID toAdd )
	{
		children.add(toAdd);
		toAdd.ID=children.indexOf(toAdd);
	}
	
	public int getSize()
	{
		return children.size();
	}
	
	public objectWithID getChild(int index)
	{
		return children.get(index);
	}
	
	
	public void remove()
	{
		ID=-1;
		children.clear(); 
	}
	
	
}
