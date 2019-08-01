package qwerty4967.Ziker3;

import java.util.ArrayList;

public class Leaf extends objectWithID 
{
	
	/* For an explanation of what this is, see 
	 * the Node class.
	 * Cool? 
	 * cool.
	 */
	
	Node parent;
	private ArrayList<String> data = new ArrayList<String>();
	
	public Leaf( Node parent )
	{
		this.parent = parent;
		parent.addToNode(this);
		
	}
	
	public void addData( String data)
	{
		//yeah.
		this.data.add(data);
	}
	
	public String getData ( int index )
	{
		return data.get(index);
	}
	
	public int getDatalength( )
	{
		return data.size();
	}
	
	
}
