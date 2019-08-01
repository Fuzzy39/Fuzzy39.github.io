package qwerty4967.Ziker3;

public class bool extends variable 
{
	// this is an boolean or something
	
	
	
	
	// Constructors. woo.
	
	public bool( String name, boolean  value)
	{
		super( name );
		this.value=Boolean.toString(value);
		this.type ="boolean";
	}
	
	
	public void setValue( boolean value)
	{
		 this.value=Boolean.toString(value);
	}
	
	// I know, I know, but I'm tired and this will probably work.
	public void setValue( int value)
	{}
	public void setValue( String value)
	{}
}
