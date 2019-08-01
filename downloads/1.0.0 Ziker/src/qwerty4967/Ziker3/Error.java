package qwerty4967.Ziker3;
public class Error 
{
	/*
	 *  this class is just to separate errors from the main class.
	 *  I don't feel comments are too necessary here.
	 */
	public static void internalError( int errorCode )
	{
		switch ( errorCode )
		{
			
			case 0:
				shell.printStandard("Generic Internal Error. This probably shouldn't ever happen." );
				break;
			case -1:
				shell.printStandard("Internal Error (code -1): Variables are not yet implemented." );
				break;
			case -2:
				shell.printStandard("Internal Error (code -2): Multi-line commands are not yet implemented." );
				break;
			case -3:
				shell.printStandard("Internal Error (code -3): Variable conflict. " );
				break;
			
		}
	}
	
	public static void invalidTokenError( int errorCode, String errorInvoker )
	{
		switch ( errorCode )
		{
			
			case 0:
				shell.printStandard("Syntax Error (code 000): invalid token \" " + errorInvoker + "\"" );
				break;
			case 1:
				shell.printStandard("Syntax Error (code 001): invalid token, String unclear \" " + errorInvoker + "\"" );
				break;
			case 2:
				shell.printStandard("Syntax Error (code 002): invalid token, String unfinished \" " + errorInvoker + "\"" );
				break;
		}
		
	}
	
	public static void invalidSyntaxError( int errorCode, String errorInvoker )
	{
		
		switch ( errorCode )
		{
			
			case 0:
				shell.printStandard("Syntax Error (code 100): invalid Syntax on token: \"" + errorInvoker + "\"" );
				break;
			case 1:
				shell.printStandard("Syntax Error (code 101): Invalid Syntax on undefined variable: \" " + errorInvoker + "\"" );
				break;
			case 2:
				shell.printStandard("Syntax Error (code 102): Invalid Syntax. Token \" " + errorInvoker + " \" is invalid in this context. " );
				break;
			case 3:
				shell.printStandard("Syntax Error (code 103): Invalid Syntax. Values may only be assigned to variables." );
				break;
			case 4:
				shell.printStandard("Syntax Error (code 104): Invalid Syntax. Input Invalid." );
				break;
			case 5:
				shell.printStandard("Syntax Error (code 105): Invalid Syntax. Expected argument of type "+errorInvoker+"." );
				break;
			case 6:
				shell.printStandard("Syntax Error (code 106): Invalid Syntax. Unexpected token end." );
				break;
		}
	}
	
	public static void invalidTypeError( int errorCode, String errorInvoker, String errorInvoker2 )
	{
		
		switch ( errorCode )
		{
			
			case 0:
				shell.printStandard("Syntax Error (code 200): Type Mismatch: Types " + errorInvoker + " and "+ errorInvoker2 +" cannot be used in this context." );
				break;
			case 1:
				shell.printStandard("Syntax Error (code 201): Type Mismatch: Type " + errorInvoker + " cannot preform operation "+ errorInvoker2 +"." );
				break;
			case 2:
				shell.printStandard("Syntax Error (code 202): Type Mismatch: Variable " + errorInvoker + " is not of type "+ errorInvoker2 +"." );
				break;
		}
	}
}
