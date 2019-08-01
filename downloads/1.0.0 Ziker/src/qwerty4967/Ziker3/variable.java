package qwerty4967.Ziker3;

public abstract class variable 
{
	// this is the class for a declared variable.
	protected String name=""; // name of the variable.
	protected String type;
	protected String value;
	
	
	public variable( String name ) // set the name, my god.
	{
		
		this.name=name;
		for(int counter = 0; counter < shell.declaredVariables.size(); counter++)
		{
			
			if(this.name.equals(shell.declaredVariables.get(counter).getName()))
			{
				Error.internalError(-3);
				return;
			}
		}
		shell.declaredVariables.add(this); // add the variable to declared variables.
		
	}
	
	
	public String getType()
	{
		return type;
	}
	
	
	public String getName()
	{
		return name;
	}
	
	public String getValue()
	{
		return value;
	}
	
	abstract public void setValue( String value );
	abstract public void setValue( int value);
	abstract public void setValue( boolean value);
	
}
