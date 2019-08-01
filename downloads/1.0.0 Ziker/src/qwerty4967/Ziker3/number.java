package qwerty4967.Ziker3;

public class number extends variable 
{
	// this is an int or something
	
	//int value;
	

	// Constructors. woo.
	
	public number( String name, int  value)
	{
		super( name );
		this.value=Integer.toString(value);
		this.type="int";
	}
	
	
	public void setValue( int value)
	{
		 this.value= Integer.toString(value);
	}
	public void setValue( String value)
	{}
	public void setValue( boolean value)
	{}
}
