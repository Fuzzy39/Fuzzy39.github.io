package qwerty4967.Ziker3;
import java.util.Scanner; // Used to gather input from console.
import java.util.Arrays; // The next few are used for better manipulation of arrays, and more broadly, data.
import java.util.ArrayList; 
import java.util.List;
import java.util.Random;
public class shell 
{
	
	// Global variables that multiple parts of the shell use.
	static String version = "v1.0.0";
	static int debugLevel = 0; // Prevalence of debug messages written to shell. goes from 0 to 3.
	static boolean error = false; // whether the program has encountered a user error.
	static List<String> tokens = new ArrayList<String>(); //  The tokens of the user's input, some of which may be invalid. includes strings, operators, and all other tokens.
	
	final static String[] validOperators = {"==","!=",">=","<=",">","<","=","+","-","*","/","%" }; // list of all operators in the language.
	final static String[] helpTopics = {"About","Report a Bug","Getting Started","Data Types","Integer","Boolean","String","Keyword","Read","ReadInt","Variable", "Complex Statement","Rand"};
	
	final static String[] keywords = {"help","if","while","end","read","readInt","debug","vars","rand"}; // list of keywords the program uses.
	static List<variable> declaredVariables = new ArrayList<variable>(); // list of all variables declared by the user.
	static List<String> tokenType= new ArrayList<String>(); // type of every token.
	static Node root; // The root of a multi-line piece of code. proper syntax should determine it as a boolean.
	static Leaf currentLeaf = null; // the leaf being added to.
	static Node currentNode = root; // the node being looked at while writing/processing commplex statements.
	
	static int depth = 0; // How 'deep' the code the user is writing is. checking how many ends are required to fully terminate the code.
	static boolean isProcessing = false; // whether the shell is busy processing code.
	static boolean isHelpModeActive = false; // whether the shell is in interactive help mode
	static boolean userOutput = false; // whether line to be printed is user made.
	
	
	
	
	
	public static void main( String[] args ) 
	{
		
		
		/*
		 * What's This?
		 * ----------------------------------
		 * This is clearly the main function of the program, and it contains the main loop which does all of the things.
		 * Specifically, the main loop has for possible actions, which it will need to do one of on any given iteration.
		 * 	1: Read and process a single line from the user. This is the default action of the main loop.
		 *  2: Accept and lightly process a single line of code. This is used when the user is writing an if or loop.
		 *  3: process an already accepted line of code. This is used after the user writes an if or loop.
		 *  4: process help commands. This is used when the user is in the interactive help system.
		 * 
		 *  Which of these actions the main loop takes on any given iteration is governed by these variables:
		 *  depth (int) 
		 *  isProcessing (boolean)
		 *  isHelpModeActive (boolean)
		 *  for more information on these, see above.
		 *  
		 */  
		
		
		// Initialization: get everybody ready to function
		Scanner inputScanner = new Scanner( System.in ); // Setup the Scanner for gathering user input. 
		
		// Add some beginning text when the shell starts.
		System.out.println( "Ziker Shell | "+version );
		System.out.println( "Interactive programing shell. Type help for help." );
		
		
		
		// The main loop. The core and glory of it all. get ready for... something. hopefully everything is clear and understandable. ( HAH )
		while( true ) 
		{
		
			
			// As said earlier, There are four modes of operation on any given iteration.
			
			// I would've loved to do a switch here, but I can't with more that one variable. 
			if( depth >= 1 )
			{
				// in this case, during the a previous iteration, we determined the user is writing a multi-line piece of code.
				
				// This is the symbol that relies on depth while typing.
				for(int counter=0; counter< depth; counter++)
				{
					System.out.print(":   ");
				}
				System.out.print("> ");
				
				String userInput = inputScanner.nextLine( ); // collect user input.
				printDebug( "main: Input recived: " + userInput, 3 ); // give feedback to me when everything falls apart, though this part probably won't.
				
				deepProcessing( userInput ); // This does the things.
				
				continue;
			}
			else
			{
				
				if( isProcessing )
				{
					// In this case, the main loop is processing a tree of lines of code.
					
					batchProcessing(); // batch processing isn't really necessary, but meh.
					continue;
					
				}
				else
				{
					
					if( isHelpModeActive )
					{
						
						// In this case, as it may be determined, interactive help mode is active.
						
						System.out.print("Help> "); // input symbol for help mode.
						String userInput = inputScanner.nextLine( ); // collect user input.
						printDebug( "main: Input recived: " + userInput, 3 ); // give feedback to me when everything falls apart, though this part probably won't.
						helpProcessing( userInput ); // helpPocessing is very light. It dosen't need to do any real work.
						continue;
						
					}
					else
					{
						
						// By now, all 3 other cases have been activated.
						// This is the default case of 1 line, standard processing.
						
						System.out.print("> ");  // This is the standard input symbol.
						String userInput = inputScanner.nextLine( ); // Collect user input as userInput. duh.
						printDebug( "main: Input recived: " + userInput, 3 ); // Repeat what the user says. This is for testing.
						standardProcessing( userInput ); // all of the substantive code is in here.
						continue;
						
					}
				}
			}
		}
	}
	
	
	
	
	
	public static boolean standardProcessing( String input )
	{
		
		
		/* What's This?
		 * --------------------------
		 * standardProcessing is the, guess, standard processing and interpretation of a single line of code, 
		 * as the string input. This is where the computer figures out what the hell you just typed.
		 * 
		 * 
		 * How Does it Work?
		 * -------------------------
		 * 
		 * Standard Processing puts the string input through a variety of methods in order to interpret it.
		 * First up is lexicalProcess, which turns the string into a list of tokens and gives them a type.
		 * It however, cannot tell if a variable is declared.
		 * TODO explain this.
		 * 
		 */
		
		
		
		printDebug( "main: Begining lexicalProcess.", 2);
		lexicalProcess( input );
					
		
		// check for an error.
		printDebug( "main: checking for errors...", 3 );
		if( error )
		{
			
			printDebug( "main: Error detected. resetting.", 2);
			tokens.clear();
			tokenType.clear();
			error=false;
			isProcessing=false;
			return false;
			
		}
		
		
		printDebug( "main: starting semanticProcess. ", 2);
		semanticProcess();
		
		printDebug( "main: starting pragmaticProcess. ", 2);
		boolean bool = pragmaticProcess();
		
		printDebug( "main: checking for errors...", 3 );
		if( error )
		{
			
			printDebug( "main: Error detected. resetting.", 2);
			tokens.clear();
			tokenType.clear();
			error=false;
			isProcessing=false;
			return false;
			
		}
		
		// After the line is processed, we don't need the tokens anymore.
		tokens.clear();
		tokenType.clear();
		printDebug( "main: resetting.", 2);
		error=false;
		return bool;
	}
	
	public static void deepProcessing( String input )
	{
		
		
		input=input.trim();
		if( input.length()>=2)
		{
			if(input.substring(0,2).equals("if") )
			{
				
				
				// okay...
				depth++;
				currentLeaf=null;
				currentNode=new Node(input.substring(2),"if",currentNode);
				
				return;
				
			}
		}
		
		if( input.length()==3)
		{
			if(input.equals("end") )
			{
				// this probably works...
				depth--;
				currentLeaf=null;
				if(currentNode==root)
				{
					// we are exiting the thing and will now be processing...
					currentNode=null;
					isProcessing=true;
					return;
				}
				else
				{
					currentNode=currentNode.parent;
					return;
				}
			}
		}
		
		if( input.length()>=5)
		{
			if(input.substring(0,5).equals("while") )
			{
				
				depth++;
				currentLeaf=null;
				currentNode=new Node(input.substring(5),"while",currentNode);
				
				return;
				
			}
		}
		
		if(currentLeaf == null)
		{
			currentLeaf= new Leaf( currentNode );
		}
		
		currentLeaf.addData(input);
	}
	
	public static void batchProcessing()
	{
		// for debug pruposes.
		//treeRead();
		
		// we should start at the beginning.
		int currentIndex = 0;
		currentNode=root;
		
		// as long as the root is true.
		boolean rootTruth = standardProcessing(currentNode.condition);
		if(error || !rootTruth)
		{
			root=null;
			currentNode=null;
			currentLeaf=null;
			isProcessing=false;
			error=false;
			return;
		}
		
		
		// And then we begin.
		while ( true )
		{
			// if we need to go up.
			if( currentIndex >= currentNode.getSize() )
			{
				
				
				
				if(currentNode.conditionType.equals("if"))
				{
					
					if(currentNode == root)
					{
						//we're done...
						root=null;
						currentNode=null;
						currentLeaf=null;
						isProcessing=false;
						return;
								
					}
					
					 
					currentNode=currentNode.parent;
					currentIndex=currentNode.index++;
					currentLeaf=null;
					continue;
				}
				else
				{ //while...
					
					if(standardProcessing(currentNode.condition))
					{
						currentIndex=0;
						currentLeaf=null;
						continue;
					}
					else
					{
						if(currentNode == root)
						{
							//we're done...
							root=null;
							currentNode=null;
							currentLeaf=null;
							isProcessing=false;
							return;
									
						}
						
						
						currentNode=currentNode.parent;
						currentIndex=currentNode.index++;
						currentLeaf=null;
						continue;
					}
				}
			}
			
			
				
				

			
			if(currentNode.getChild(currentIndex) instanceof Node)
			{
				
				// I just learned about type casting to do this.
				
				if(standardProcessing(((Node)currentNode.getChild(currentIndex)).condition))
				{
					
					currentNode.index=currentIndex+1;
					
					currentNode=((Node)currentNode.getChild(currentIndex));
					
					// it took a half hour.
					//god.
					
					currentIndex=0;
					currentLeaf=null;
					continue;
				}
				else
				{
					if(error)
					{
						root=null;
						currentNode=null;
						currentLeaf=null;
						isProcessing=false;
						error=false;
						return;
					}
				}
			}
			else
			{ // it's a Leaf.
				currentLeaf= ((Leaf)currentNode.getChild(currentIndex));
				isProcessing=false;
				for( int counter = 0; counter < currentLeaf.getDatalength(); counter++ )
				{
					standardProcessing(currentLeaf.getData(counter));
					if(error)
					{
						root=null;
						currentNode=null;
						currentLeaf=null;
						isProcessing=false;
						error=false;
						return;
					}
				}
				isProcessing=true;
			}
			
			currentIndex++;
			
		}		
	}
	
	
	
	
	
	public static void treeRead()
	{
		// Before we process multiple lines at once, it would be helpful if the tree structure could be read in case something goes wrong.
		
		currentNode=root; // we should probably start at the beginning.
		if(currentNode.children.size() == 0)
		{
			return;
		}
		depth=1;
		printDebug( "Main: Node at root: Depth now: "+ depth, 1);
		printDebug("Main: Node condition: "+ currentNode.condition, 2);
		// Then we need to cycle through the children.
		// and then find whether it is a root or node.
		
		int counter=0;
		while(true) // Didn't work properly as a for loop? weird...
		{
			printDebug( "main: Reading index: "+ counter, 3);
			if(currentNode.getChild(counter) instanceof Node)
			{
				// If it is a node, we need to go deeper.
				// right?
				depth++;
				printDebug( "main: Node at index: " + counter + " Depth now: "+ depth, 1);
				
				
				currentNode.index=counter;
				currentNode=((Node)currentNode.getChild(counter));
				printDebug("main: Node condition: "+ currentNode.condition ,2);
				counter=0;
				continue;
			}
			else
			{
				// if it is a leaf, we need to list code.
				 printDebug( "main: Leaf at index: " + counter + " Data: ", 1); // if debug is only 1, the 'Data:' part won't make sense, but I think it's fine, it can be clunky if it's debug.
				for ( int counter2=0;  counter2<((Leaf)currentNode.getChild(counter)).getDatalength( ); counter2++ ) 
				{
								
				   printDebug( "    :"+((Leaf)currentNode.getChild(counter)).getData(counter2), 2 );
						  
				}
			}
			
			if(counter+1 == currentNode.children.size())
			{
				if (depth>1)
				{
					
					depth--;
					printDebug( "main: Node fully read. Depth now: "+depth, 2 );
					currentNode=currentNode.parent;
					counter=currentNode.index ;
				}
				else
				{
					printDebug( "main: Node fully read. All done.", 1 );
					depth=0; 
					break;
				}
			}
			
			counter++;
		}
		  
	}
	
	
	
	

	public static void helpProcessing( String input )
	{
		/*What's This?
		 * 
		 * helpProcessing is almost entirely responsible for interactive help mode.
		 * It is little more that a switch statement.
		 * 
		 */
		
		for( int counter = 0; counter < helpTopics.length; counter ++)
		{
			
			if(helpTopics[counter].equalsIgnoreCase(input))
			{
				
				switch( helpTopics[counter] )
				{
				
					case "About":
						String[] toPrint2= {"Ziker Shell mk 3",version,"Made by Mason Hill using Java 1.8.0"};
						printArray(toPrint2);
						break;
					
					case "Report a Bug":
						String[] toPrint5= {"Think you found a bug?","Email JMcraft126@gmail.com with version and steps to reproduce."};
						printArray(toPrint5);
						break;
						
					case "Getting Started":	
						String[] toPrint3= {"New Around Here?","","Check out examples.txt to get a feel of what Ziker can do.",
							"You can check out the readme for specifics."};
						printArray(toPrint3);
						break;
					
					case "Data Types":
						String[] toPrint4 = {"Data Types are the different forms of information that the Ziker shell understands.",
								"There are currently 3: Integers, Booleans and Strings.","See more in the type's respective topics."};
						printArray(toPrint4);
						break;
						
					case "Integer":
						printStandard("An integer is a whole number, either positive or negative. Most operations can be performed on them. ");
						break;
					
					case "Boolean":
						printStandard("A boolean is a value of true or false. They are the result of comparisons.");
						break;
						
					case "String":
						printStandard("A string is any text with a \" at the ends. You can attach other values on to the end of them with +.");
						break;
					case "Keyword":
						
						String[] toPrint6 = {"Ziker has keywords that are used to tell the shell something imporant.",
								"Current keywords are: read, readInt, rand, if and while.","See more in the type's respective topics."};
						printArray(toPrint6);
						break;
					case "Read":
						printStandard("Read gives a string value to a variable.");
						break;
					case "ReadInt":
						printStandard("ReadInt gives a integer value to a variable.");
						break;
					case "Variable":
						printStandard("A variable can be declared ex: ( name=12 ) They can also be redefined and used: (name+5) >: 17");
						break;
					case "Complex Statement":
						String[] toPrint7 = {"A complex statement starts with: (if/while Condition ) has more code inside, and ends with (end)",
								"if: if runs the code inside only if Condition is initially 2.", "while: while continues to exicute the code inside while the condition remains true."};
						
						printArray(toPrint7);
						break;
					case "Rand":
						printStandard("Rand INT INT returns a random integer between argumant one and two.");
						
						break;
					default:
						printStandard("hush now, not yet.");
						break;
						
				}
				
				return;
			}
		}
		
		if("horcrux".equalsIgnoreCase(input)||"dark arts".equalsIgnoreCase(input))
		{
			printStandard("Hush now, you're too young.");
		}
		else
		{
			if("Topics".equalsIgnoreCase(input))
			{
				//does this work?
				// Arguably.
				List<String> toPrint = new ArrayList<String>();
				toPrint.add("Help system topics:");
				for( int counter2= 0; counter2 < helpTopics.length/5; counter2++)
				{
					
					 toPrint.add(helpTopics[counter2*5]+"   "+helpTopics[counter2*5+1]+"   "+helpTopics[counter2*5+2]+"   "+helpTopics[counter2*5+3]+"   "+helpTopics[counter2*5+4]);
					
				}
				
				if(helpTopics.length % 5 >= 0)
				{
					String toAdd="";
					for(int counter2=0; counter2<(helpTopics.length % 5); counter2++)
					{
						
						toAdd=toAdd+helpTopics[((helpTopics.length/5)*5)+counter2]+"   ";
					}
					toPrint.add(toAdd);
				}
				
				String[] stockArr = new String[toPrint.size()];
				stockArr = toPrint.toArray(stockArr);
				
				printArray(stockArr);
			}
			else
			{
				if("Quit".equalsIgnoreCase(input))
				{
					
					printStandard("Goodbye.");
					isHelpModeActive=false;	
					
				}
				else
				{	
					printStandard("\""+input+"\" isn't a recognized topic.");
				}
			}
		}
		
		
	}
	
	
	
	
	
	public static void lexicalProcess( String input)
	{
		
		
		/*
		 * What's This?
		 * -----------------------------
		 * 
		 * The goal of lexical Process is to turn the string input into tokens.
		 * it hunts out Strings and operators, and separates everything else by spaces.
		 * while doing this, it gives context in the tokenType ArrayList.
		 * the tokens themselves are stored in the tokens ArrayList.
		 * 
		 * Some small notes:
		 * 
		 * lexical process gives an error if you type a string without proper clearance.
		 * for example:
		 *  valid: 	  if "foo" = bar then
		 *  invalid:  if"foo" = bar then
		 *  valid:    if " foo " = bar then
		 *  invalid:  if " foo "= bar then
		 * 
		 * also, 2 character operators should always be put in before single char operators.
		 * If this is not the case, operators may not be reconized correctly.
		 * 
		 * 
		 * How Does it Work?
		 * -------------------------------
		 * very VERY good question.
		 * I'll need to find that out.
		 * good luck. 
		 * very broken as of 0.2.3?
		 */
		
		// We need to do some initialization to get input ready for processing.
		if(input.trim().equals("")) // check for nothing.
		{
			error=true;
			return;
		}
		
		String [] tmpRawTokens = input.split(" "); // tmpRaw   Tokens has to exist because String.split returns String[] and not ArrayList <String>.
		ArrayList<String> rawTokens = new ArrayList<String>(); // turn rawTokens into an array list to make it easier\
		
		// give the arrayList the array's contents.
		for( int i=0; i < tmpRawTokens.length; i++ )
		{
			tmpRawTokens[ i ].trim(); // obsessive trimming.
			rawTokens.add(tmpRawTokens[ i ]);
		}
		
		
		// and debug for safe measure.
		printDebug( "lexicalProcess: rawTokens: " + Arrays.toString( tmpRawTokens ), 2 ); // Leave a testing message of the raw tokens.
		
		
		
		
		//process the raw tokens into tokens (strings, operators, and others )
		// This is the main loop of the method.
		for( int counter = 0; counter < rawTokens.size(); counter++ )
		{
			// print out the finished tokens, for testing.
			printDebugOneLine( "lexicalProcess: Tokens: " , 1);
			for ( String token : tokens ) 
			{
			    printDebugOneLine( token+",", 1 );
			}
			printDebug("",1);
			
			
			/*
			 * here's the plan. 
			 * We have input from user as a series of space separated tokens,  
			 * and we want to separate strings and operators out, as strings can pass spaces, and 
			 * operators don't need spaces to separate them from other tokens.
			 * Strings need to be found first, as we don't want to detect operators in them.
			 * ready?
			 */
			
			
			
			/* Strings
			 * 
			 * To find Strings, we need to look for quote marks.
			 * if There are more than 2 in any token, it is certainly invalid syntax.
			 * If there are two, there is a string in a single token, and we must determine weather it is valid.
			 * if there is one, we must find it's match.
			 * cool?
			 * cool.
			 */
			
			// this finds the ammount of quotes in the token
			int quotes = findQuotes( rawTokens.get(counter) );
			printDebug( "lexicalProcess: quotes in token " + rawTokens.get( counter ) + ": " + quotes , 3 ); 
			
			
			
			// if there are more than two quotes in a token, we know it's invalid
			if( quotes > 2 )
			{
				
				Error.invalidTokenError( 1, rawTokens.get( counter ) );
				error = true;
				printDebug("lexicalProcess: handing control to main.", 2);
				return;
				
			}
			
			
			// if  there are two quotes, there is a full string in the token. we just need to find it.
			if( quotes == 2 )
			{
				
				// if there is no outlying text, we have succeeded, and nothing needs to be done.
				if( rawTokens.get( counter ).charAt(0)=='\"' & rawTokens.get( counter ).charAt(rawTokens.get( counter ).length()-1)=='\"')
				{
					
					printDebug( "lexicalProcess: Found String: " + rawTokens.get( counter ), 2 );
					tokens.add( rawTokens.get( counter ));
					rawTokens.set( counter, "" ); // set this to empty- it'll be important that we don't check as string for synatax.
					continue;
					
				}
				else // otherwise, the user has done something that cannot be allowed.
				{
					
					Error.invalidTokenError( 1, rawTokens.get( counter ) );
					error = true;
					printDebug("lexicalProcess: handing control to main.", 2);
					return;
					
				}
			}
			
			// If there is one quote in the token, we need to find the other quote.
			// I wouldn't try to understand this, it is a bit of a mess.
			if( quotes == 1 )
			{
				
				// first check that the string is clear. e.g. who "is this" and not who"is this"
				if(  rawTokens.get( counter ).charAt( 0 ) == '\"' )
				{
					
					//vars for the loop that finds the string.
					String nextString = rawTokens.get( counter ); // what will become the full string.
					boolean succcessful = false; // whether the code has found the second quote.
					
					
					
					counter ++; // don't want to count over something twice.
					
					// this loop finds the end of the string. by checking each token for quote.
					// Counter is set to increment by one at the begining of the loop so the loop does not recheck the first quote.
					for( ; counter < rawTokens.size(); counter ++ )
					{
						
						// get the quotes in token.
						quotes = findQuotes( rawTokens.get( counter ));
						printDebug( "lexicalProcess: quotes in token " + rawTokens.get( counter ) + ": " + quotes, 3 );
						
						// in this case, the quote is unstable ( "it is amazing"truly"it is")
						if(quotes >  1)
						{
							
							Error.invalidTokenError( 1, rawTokens.get( counter ) );
							error = true;
							return;
							
						}
						else
						{
							
							// in this case, the end of the string has been found.
							if(quotes == 1 )
							{
								
				  				// check that the quote is stable.
								if( rawTokens.get( counter ).charAt(rawTokens.get( counter ).length()-1)=='\"')
								{
									// we're all good
									nextString=nextString+" "+rawTokens.get( counter );
									rawTokens.set( counter, "" );
									succcessful= true;
									break;
									
								}	
								else
								{
									
									// The quote is unstable,   and we make an error
									Error.invalidTokenError( 1, rawTokens.get( counter ) );
									error = true;
									return;
									
								}
								
							}
							else
							{
								
								nextString=nextString+" "+rawTokens.get( counter );
								rawTokens.set( counter, "" );
								
							}
						}
					}
					if( succcessful )
					{
						printDebug("lexicalProcess: Found String: "+ nextString, 2);
						nextString.trim();
						tokens.add(nextString);
						continue;
					}
					else
					{
						Error.invalidTokenError( 2, nextString );
						error = true;
						return;
					}
					
				}
				else
				{
					// string is not clear.
					Error.invalidTokenError( 1, rawTokens.get( counter ) );
					error = true;
					return;
					
				}
			}
			
			// Operators
			
			/*
			 * Right. okay.
			 * Operators can be found inside tokens, and there could be a potentially unlimited aount of ooerators in a token so...
			 * uhhh.... I need to figure this out.
			 * 
			 * ( 1 day later)
			 * 
			 * Okay. Oookay.
			 * There are four scenarios here.
			 * 1: the token is one operator.
			 * > Do nothing
			 * 2: The operator is the first part of a token
			 * > Separate the oporator from the token. continue as normal.
			 * 3: the operator is in the middle / end of a token
			 * > cut up the token into 2: the part before the operator, and everything after. Continue on the main loop and subtract the counter by two ( to offset the ++)
			 * So? let's begin 
			 */
			
			
			printDebug( "lexicalProcess: looking for operators in token: "+rawTokens.get( counter ), 3 );
			
			// loop using each operator. 
			operatorLoop: for( int operatorCounter = 0; operatorCounter < validOperators.length; operatorCounter++ )
			{
				
				
				int possibleOperatorLocations = rawTokens.get( counter ).length( ) - ( validOperators[ operatorCounter ].length( ) - 1 );
				
				// and we look through each possible place that the token could be ( better ways to do this but there is a reason. if there are multiple of the same operator, we want to find them in order.
				for( int operatorIndexCounter = 0; operatorIndexCounter < possibleOperatorLocations ; operatorIndexCounter++)
				{
					
					if( rawTokens.get( counter ).substring( operatorIndexCounter, operatorIndexCounter + validOperators[ operatorCounter ].length() ).equals( validOperators[ operatorCounter ] ) )
					{
						
						
						
						if(operatorIndexCounter == 0)
						{
							
							// in this case, ( the easiest case ) we split the string, put it in the token, and continue.
							printDebug("lexicalProcess: found operator: "+ validOperators[ operatorCounter ] + " in token: "+ rawTokens.get( counter ), 2);		
							
							rawTokens.set( counter, rawTokens.get( counter ).substring(validOperators [ operatorCounter ].length()) );
							tokens.add(validOperators [ operatorCounter ]);
							// reset for next round.
							possibleOperatorLocations = rawTokens.get( counter ).length( ) - ( validOperators[ operatorCounter ].length( ) - 1 );
							operatorIndexCounter=0;
							continue;
							
						}
						else
						{
							
							// and this (should be) the other case, which shouldn't be to hard to handle. (probably)
							// we want to do two substrings.
							
							rawTokens.add( counter + 1, rawTokens.get( counter ).substring( operatorIndexCounter ) );
							rawTokens.set( counter, rawTokens.get( counter ).substring( 0, operatorIndexCounter ) );
							
							// we're done here.
							printDebug("lexicalProcess: split token into: "+rawTokens.get(counter)+" and: " + rawTokens.get(counter + 1)+ " size now: " + rawTokens.size(), 3);
							continue operatorLoop;
							
						}
					}
				}
				
			}
			
			//grab all of the tokens which don't need to be changed.
			if( !rawTokens.get( counter ).equals(""))
				tokens.add( rawTokens.get( counter ) );
			
		}
		
		
		
		
		
		// print out the finished tokens, for testing.
		printDebugOneLine( "lexicalProcess: Tokens: " , 1);
		for ( String token : tokens ) 
		{
		    printDebugOneLine( token+",", 1 );
		}
		printDebug("",1);
		printDebug("lexicalProcess: handing control to main.", 2);
		
	}
	
	
	//finds ammount of quotes in string.
	public static int findQuotes( String toFind)
	{
		
		int quotes = 0;
		for( int quoteCounter = 0; quoteCounter < toFind.length( ); quoteCounter++ )
		{
			if( toFind.charAt( quoteCounter ) == '\"' )
				quotes++;
		}
		return quotes;
		
	}
	
	
	
	public static void semanticProcess()
	{
		
		/*
		 * Okay.
		 * Our plan here is to give some meaning to each token.
		 * just assign it a meaning.
		 *  plan is we will detect:
		 *  boolean
		 *  String
		 *  int
		 *  keyword
		 *  variable
		 *  int, boolean, should be easy enough: if the string toint/ tobool returns true, that is what it is.
		 */
		
		semanticLoop: for( int counter= 0; counter<tokens.size(); counter++ )
		{
			
			// First, we look for literals, Namely, Ints, booleans, and Strings.
			
			// Finding booleans:  just look for true/false
			if( tokens.get(counter).equals("true") || tokens.get(counter).equals("false") )
			{
				
				printDebug( "semanticProcess: " + tokens.get(counter)+" is a boolean.", 2);
				tokenType.add(counter, "boolean");
				continue;
				
			}
			
			
			// next, find ints.
			// harder than I thought, so I took something from stackoverflow. oh well.
			
			try 
			{
				
				Integer.parseInt( tokens.get( counter ) );
				printDebug( "semanticProcess: " + tokens.get(counter)+" is an int.", 2);
				tokenType.add( counter, "int" );
				continue;
				
			}
			catch( Exception e ) 
			{
				// Not an int, nothing needs to be done.
			}
			
			
			// Finding strings should be easy. just check if charAt: 0 == "
			
			
			if( tokens.get( counter ).charAt(0)=='\"' )
			{
				printDebug( "semanticProcess: " + tokens.get(counter)+" is a string.", 3);
				tokenType.add( "string" );
				tokens.set( counter, tokens.get(counter).replaceAll("\"",""));
				
				// Lazy fix for a very weird bug.
				// extra spaces are added when adding strings (???), so we remove them.
				// don't ask.
				
				int tmp= tokens.get(counter).indexOf(' ')+1;
				if(tokens.get(counter).indexOf(' ')!= tokens.get(counter).length()-1)
				{
					if(tokens.get(counter).indexOf(' ')!= -1 && tokens.get(counter).charAt(tmp)==(' ')) // check if there are spaces.
					{
						if(tokens.get( counter ).charAt(0)==' ')
						{
							tokens.set( counter, tokens.get(counter).substring(2));
						}
						else
						{
								
								String str1=tokens.get(counter).substring(0,tokens.get(counter).indexOf(' '));
								String str2=tokens.get(counter).substring(tokens.get(counter).indexOf(' ')+2);
								tokens.set(counter, str1+str2);
							
						}
					}	
				}
				continue;
				
			}
			
			// look for operator
			for ( int operatorCounter = 0; operatorCounter<validOperators.length; operatorCounter++ )
			{
				
				if( tokens.get(counter).equals(validOperators[ operatorCounter ] ))
				{
					printDebug( "semanticProcess: " + tokens.get(counter)+" is an operator.", 3);
					tokenType.add( "operator" );
					continue semanticLoop;
					
				}
			}
			
			// Now we check for keywords with a loop.
			for ( int keywordCounter = 0; keywordCounter<keywords.length; keywordCounter++ )
			{
				
				if( tokens.get(counter).equals(keywords[ keywordCounter ] ))
				{
					
					printDebug( "semanticProcess: " + tokens.get(counter)+" is a keyword.", 2);
					tokenType.add( "keyword" );
					continue semanticLoop;
					
				}
				
			}
			
			// if all else fails, we asume the token is a variable. Later, we check if this is true.
			printDebug( "semanticProcess: " + tokens.get(counter)+" is a variable.", 2);
			tokenType.add( "variable" );
			continue;
		}
		
		// print out the finished tokens, for testing.
		printDebugOneLine( "semanticProcess: Tokenstypes: " , 1);
		for ( String token : tokenType ) 
		{
			  printDebugOneLine( token+", ", 1 );
		}
		printDebug("",1);
		
			
		printDebug( "semanticProcess: handing control to main.", 2);
		
	}
	
	
	public static boolean   pragmaticProcess()
	{
		
		/*
		 *  What's This?
		 *  --------------------
		 *  WIP
		 */ 
		
		
		
		// First, let's check for things that we know are invalid.
		
		printDebug("pragmaticProcess: Looking for simple errors.", 3);
		
		// now if you type "help" ( Which should be valid ) it will throw an error...
		if( tokens.size() == 1 )
		{
			// if it's a variable, give an undefined variable error.
			switch( tokenType.get( 0 ) )
			{
				case "variable":
					pragmaticVariableHelper(0);
					if(error)
					{
						
						return false;
					}
					break;
					
				case "keyword":
					
					
					// checking for help mode:
					switch (tokens.get(0))
					{
						case "help":
							activateHelpMode();
							printDebug("pragmaticProcess: Help mode active. handing control to main.", 2);
							return false;
						case "vars":
							String[] toPrint = new String[declaredVariables.size()+1];
							toPrint[0]="Variables:";
							for(int counter = 0; counter < declaredVariables.size(); counter++)
							{
								toPrint[counter+1]=declaredVariables.get(counter).getName()+": "+declaredVariables.get(counter).getType()+", "+declaredVariables.get(counter).getValue();
							}
							printArray(toPrint);
							return false;
							
						
						case "end":
							//we're doing these down a bit.
							break;
							
						default:
							Error.invalidSyntaxError( 0, tokens.get( 0 ) );
							error=true;
							printDebug("pragmaticProcess: handing control to main.", 2);
							return false;
						
					}
					break;
				default:
					if(!isProcessing)
					{
					userOutput=true;
					printStandard(tokens.get(0));
					}
					if(tokenType.get(0).equals("boolean") && tokens.get(0).equals("true"))
					{
						return true;
					}
					return false;
					
			}
		}
		else
		{
			
			// check for situations in which help is un-allowed.
			for(int counter = 0 ; counter < tokens.size(); counter ++ )
			{
				
				if( tokens.get( counter ).equals( keywords[ 0 ] ) )
				{
					Error.invalidSyntaxError(2, tokens.get(counter));
					error=true;
					printDebug("pragmaticProcess: handing control to main.", 2);
					return false;
				}
			}
		}
		
		printDebug("pragmaticProcess: No simple errors found.", 2);
		
		//complex commands here.
		if(tokenType.get(0).equals("keyword"))
		{
			switch (tokens.get(0))
			{
				
				case "if":
					printDebug("pragmaticProcess: Multi-line mode initiated...", 1);
					tokens.remove(0);
					String tmp="";
					for(int counter=0; counter<tokens.size() ; counter++)
					{
						tmp=tmp+" "+tokens.get(counter);
					}
					root=new Node(tmp,"if");
					currentNode = root;
					printDebug("pragmaticProcess: Root's Determiner: \""+root.condition+"\" Root's type: \""+root.conditionType+"\"", 3);
					depth++;
					printDebug("pragmaticProcess: handing control to main.", 2);
					return false;
					
				case "while":
					printDebug("pragmaticProcess: Multi-line mode initiated...", 1);
					tokens.remove(0);
					tmp = "";
					for(int counter=0; counter<tokens.size() ; counter++)
					{
						tmp=tmp+" "+tokens.get(counter);
					}
					root=new Node(tmp,"while");
					currentNode = root;
					printDebug("pragmaticProcess: Root's Determiner: \""+root.condition+"\" Root's type: \""+root.conditionType+"\"", 3);
					depth++;
					printDebug("pragmaticProcess: handing control to main.", 2);
					return false;
					
				case "end":
					Error.invalidSyntaxError( 6,"meh." );
					error=true;
					printDebug("pragmaticProcess: handing control to main.", 2);
					return false;
				
				
			}
		}
		
		
		
		
		// now look for patterns.  
		
		
		//...
		
	
		// how?
		
		/* (several weeks later...) Ah!
		 * 
		 * okay, okay.
		 * We have a loop.
		 * within that loop, we look for patterns ( with a loop ).
		 * if we find none, Escape both.
		 * Yeah? lets try.
		 * 
		*/
		
		printDebug("pragmaticProcess: looking for patterns...", 1);
		
		if( tokens.size() >= 3 )
		{
			for(int counter = 0; counter < tokens.size()-2; counter++)
			{
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"keyword","int","int"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String keyword= tokensAnalyzed[0];
					int int1=Integer.parseInt(tokensAnalyzed[1]);
					int int2=Integer.parseInt(tokensAnalyzed[2]);
					if(keyword.equals("rand"))
					{
						pragmaticRecognitionHelper(compareAgainst,counter);
						tokens.add(counter,Integer.toString(getRandomNumberInRange(int1,int2)));
						tokenType.add(counter,"int");
						pragmaticRecognitionReport( );
					    continue;
					}
				}
			}
		}
		
		// The main bit. WOW...
		processing:while( true )
		{
			
			if( tokens.size() < 3)
			{
				
				break;
				
			}
			
			// yeah, sheesh. this is the first order loop.
			highestPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"int","operator","variable"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						default:
							//should work??
							pragmaticVariableHelper(counter+2);
							if(error)
								return false;
							break;
					}
				}
				compareAgainst[0]="boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						default:
							//error out, in a similar way.
							pragmaticVariableHelper(counter+2);
							if(error)
								return false;
							break;
					}
				}
				compareAgainst[0]="string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						default:
							//error out, in a similar way.
							     
							pragmaticVariableHelper(counter+2);
							if(error)
								return false;
							break;
					}
				}
				compareAgainst[0]="variable";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					//Error out. ( copy and paste, be lazy with the comments. ) 
					pragmaticVariableHelper(counter+2);
					if(error)
						return false;
					//works if I do this. 
					continue processing;
				}
				compareAgainst[2]="int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							break;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
				
				compareAgainst[2]="boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							break;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
				compareAgainst[2]="string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							break;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
				
			}
			
			higherPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"variable","operator","variable"};
				
			}
			highPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"int","operator","int"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					int int1 = Integer.parseInt(tokensAnalyzed[0]);
					int int2 = Integer.parseInt(tokensAnalyzed[2]);
					String Operator = tokensAnalyzed[1]; 
					
					
					
					// now we look through each operator.
					switch ( Operator )
					{
					
						// I'm so sorry about this... ( actually it's a bit better now. )
					
						    
						case "=":
							
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
							
						    
						case "*":
							
							pragmaticRecognitionHelper(compareAgainst,counter);
							  
							tokenType.add(counter, "int");
							tokens.add(counter, Integer.toString( int1 * int2 ) );
							pragmaticRecognitionReport( );
							continue processing;
						    
						case "/":
							
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, Integer.toString( int1 / int2 ) );
							tokenType.add(counter, "int");
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						case "%":
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, Integer.toString( int1 % int2 ) );
							tokenType.add(counter, "int");
							
							pragmaticRecognitionReport( );
							continue processing;
						 
						default:
						    break;
					}
				}
				
				compareAgainst[2] = "boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					
					if(Operator.equals("="))
					{
						
						//Error out.
						Error.invalidSyntaxError( 3, "Not used for this error." );
						error = true;
						printDebug("PragmaticProcess: handing control to main.", 2);
						return false;
						
					}
					
				}
				compareAgainst[2] = "string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "+":
							break;
						default:
							//error out, in a similar way.
							Error.invalidTypeError( 0, "int", "string" );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				
				compareAgainst[0] = "boolean";
				compareAgainst[2] = "int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						default:
							break;
					}
				}
				compareAgainst[2] = "boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					String Operator = tokensAnalyzed[1]; 
					
					
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "==":
							break;
						case "!=":
							break;
						default:
							//error out, in a similar way.
							Error.invalidTypeError( 1, "boolean", Operator );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				compareAgainst[2] = "string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					String Operator = tokensAnalyzed[1]; 
					
					
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "+":
							break;
						default:
							//error out, in a similar way.
							Error.invalidTypeError( 0, "boolean", "string" );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				
				compareAgainst[0] = "string";
				compareAgainst[2] = "int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "+":
							break;
						default:
							//error out, in a similar way.
							     
							Error.invalidTypeError( 0, "string", "int" );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				compareAgainst[2] = "boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "+":
							break;
						default:
							//error out, in a similar way.
							     
							Error.invalidTypeError( 0, "string", "boolean" );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				compareAgainst[2] = "string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							//Error out.
							Error.invalidSyntaxError( 3, "Not used for this error." );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
						case "+":
						case "==":
						case "!=":
							break;
						default:
							//error out, in a similar way.
							     
							Error.invalidTypeError( 0, "string", "string" );
							error = true;
							printDebug("PragmaticProcess: handing control to main.", 2);
							return false;
					}
				}
				
				
				
				
				
			}
			
			mediumHighPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"int","operator","int"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					int int1 = Integer.parseInt(tokensAnalyzed[0]);
					int int2 = Integer.parseInt(tokensAnalyzed[2]);
					String Operator = tokensAnalyzed[1]; 
					
					
					
					// now we look through each operator.
					switch ( Operator )
					{
						
						case "+":
							
							pragmaticRecognitionHelper(compareAgainst,counter);
							pragmaticRecognitionReport( );
							tokens.add(counter, Integer.toString( int1 + int2 ) );
							tokenType.add(counter, "int");
							
							pragmaticRecognitionReport( );
						    continue processing;
						    
						case "-":
							
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, Integer.toString( int1 - int2 ) );
							tokenType.add(counter, "int");
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						default:
							break;
					    
					}
				}
			}
			
			mediumPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"int","operator","int"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					int int1 = Integer.parseInt(tokensAnalyzed[0]);
					int int2 = Integer.parseInt(tokensAnalyzed[2]);
					String Operator = tokensAnalyzed[1]; 
					
				
					
					// now we look through each operator.
					switch ( Operator )
					{
						
						case "==":
							pragmaticRecognitionHelper(compareAgainst,counter);
							if(int1==int2)
							{
								
								
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
								
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
							}
							
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						case "!=":
							pragmaticRecognitionHelper(compareAgainst,counter);
							if(int1!=int2)
							{
								
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
							}
							
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						case ">=":
							pragmaticRecognitionHelper(compareAgainst,counter);
							if(int1>=int2)
							{
								
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
							}
							
							
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						case "<=":
							pragmaticRecognitionHelper(compareAgainst,counter);
							if(int1<=int2)
							{
							
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
								
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
								
							}
							
							
							pragmaticRecognitionReport( );
							continue processing;
						    
						case ">":
							pragmaticRecognitionHelper(compareAgainst,counter);
							if(int1>int2)
							{
								
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
								
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
							}
							
							
							pragmaticRecognitionReport( );
						    continue processing;
						    
						case "<":
							pragmaticRecognitionHelper(compareAgainst,counter);
							
							if(int1<int2)
							{
								
								tokens.add(counter,"true");
								tokenType.add(counter,"boolean");
							}
							else
							{
								
								tokens.add(counter,"false");
								tokenType.add(counter,"boolean");
							}
							
							
							pragmaticRecognitionReport( );
						    continue processing;
						    
						 
					    
					}
					
				}
				
			}
			
			mediumLowPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"boolean","operator","boolean"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					boolean boolean1 = Boolean.parseBoolean(tokensAnalyzed[0]);
					String Operator = tokensAnalyzed[1]; 
					boolean boolean2 = Boolean.parseBoolean(tokensAnalyzed[2]);
					
					switch(Operator)
					{
						case "==":
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, Boolean.toString( boolean1 == boolean2 ) );
							tokenType.add(counter, "boolean");
							
							pragmaticRecognitionReport( );
							continue processing;
						case "!=":
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, Boolean.toString( boolean1 != boolean2 ) );
							tokenType.add(counter, "boolean");
							
							pragmaticRecognitionReport( );
							continue processing;
					}
				}
			}
			
			
			lowPriority:for( int counter = 0; counter < tokens.size()-2; counter ++)
			
			
			{
				
				// i'm not sure if 2 length patterns are going to be used, so I shall ignore it until the issue may or may not present it self.
				String[] tokensAnalyzed = { tokens.get( counter ), tokens.get( counter + 1 ), tokens.get( counter + 2 ) } ;
				   String[] tokenTypesAnalyzed = { tokenType.get( counter ), tokenType.get( counter + 1 ), tokenType.get( counter + 2 ) } ; 
				
				String[] compareAgainst = {"int","operator","string"};
				
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					
					String int1= tokensAnalyzed[0];
					String Operator = tokensAnalyzed[1]; 
					String string= tokensAnalyzed[2];
					
					
					// now we look through each operator.
					if(Operator.equals("+"))
					{
						
						pragmaticRecognitionHelper(compareAgainst,counter);
						tokens.add(counter, int1+string);
						tokenType.add(counter,"string");
						
						pragmaticRecognitionReport( );
					    continue processing;
					    
					}
				}
				compareAgainst[2]="boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					//error out, in a similar way.
					Error.invalidTypeError( 0, "int", "boolean" );
					error = true;
					printDebug("PragmaticProcess: handing control to main.", 2);
					return false;
				}
				compareAgainst[0]="boolean";
				compareAgainst[2]="int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					//error out, in a similar way.
					Error.invalidTypeError( 0, "boolean", "int" );
					error = true;
					printDebug("PragmaticProcess: handing control to main.", 2);
					return false;
				}
				
				compareAgainst[2] = "string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String boolean1= tokensAnalyzed[0];
					String Operator = tokensAnalyzed[1]; 
					String string= tokensAnalyzed[2];
					
					if(Operator.equals("+"))
					{
						
						pragmaticRecognitionHelper(compareAgainst,counter);
						tokens.add(counter, boolean1+string);
						tokenType.add(counter,"string");
						
						pragmaticRecognitionReport( );
					    continue processing;
					    
					}
					
				}
				compareAgainst[0] = "string";
				compareAgainst[2] = "int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String str = tokensAnalyzed[0];
					String int1 = tokensAnalyzed[2];
					
					pragmaticRecognitionHelper(compareAgainst,counter);
					tokens.add(counter, str+int1);
					tokenType.add(counter,"string");
					
					pragmaticRecognitionReport( );
				    continue processing;
				}
				compareAgainst[2] = "boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String str = tokensAnalyzed[0];
					String int1 = tokensAnalyzed[2];
					
					pragmaticRecognitionHelper(compareAgainst,counter);
					tokens.add(counter, str+int1);
					tokenType.add(counter,"string");
					
					pragmaticRecognitionReport( );
				    continue processing;
				}
				compareAgainst[2] = "string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					String str = tokensAnalyzed[0];
					String Operator=tokensAnalyzed[1];
					String str2 = tokensAnalyzed[2];
					switch(Operator)
					{
						case "+":
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter, str+str2);
							tokenType.add(counter,"string");
							
							pragmaticRecognitionReport( );
						    continue processing;
						case "==":
						pragmaticRecognitionHelper(compareAgainst,counter);
						tokens.add(counter, Boolean.toString(str.equalsIgnoreCase(str2)));
						tokenType.add(counter,"boolean");
						
						pragmaticRecognitionReport( );
					    continue processing;
						case "!=":
							pragmaticRecognitionHelper(compareAgainst,counter);
							tokens.add(counter,Boolean.toString(! str.equalsIgnoreCase(str2)));
							tokenType.add(counter,"boolean");
							
							pragmaticRecognitionReport( );
						    continue processing;
					}
				}
				compareAgainst[0] = "variable";
				compareAgainst[2] = "variable";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					//Error out. ( copy and paste, be lazy with the comments. ) 
					pragmaticVariableHelper(counter+2);
					if(error)
						return false;
					//works if I do this. 
					continue processing;
				}
				compareAgainst[2]="int";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							if(! declareVariable(tokensAnalyzed[0],"int",tokensAnalyzed[2]))
							{
								Error.invalidTypeError( 2, tokensAnalyzed[0], "int"  );
								error=true;
								printDebug("pragmaticProcess: handing control to main.", 2);
								return false;
							
							}
							return false;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
				
				compareAgainst[2]="boolean";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							if(! declareVariable(tokensAnalyzed[0],"boolean",tokensAnalyzed[2]))
							{
								Error.invalidTypeError( 2, tokensAnalyzed[0], "boolean"  );
								error=true;
								printDebug("pragmaticProcess: handing control to main.", 2);
								
							}
							return false;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
				compareAgainst[2]="string";
				if(Arrays.equals( tokenTypesAnalyzed, compareAgainst ))
				{
					
					String Operator = tokensAnalyzed[1]; 
					switch(Operator)
					{
						case "=":
							if(! declareVariable(tokensAnalyzed[0],"string",tokensAnalyzed[2]))
							{
								Error.invalidTypeError( 2, tokensAnalyzed[0], "string"  );
								error=true;
								printDebug("pragmaticProcess: handing control to main.", 2);
								
							}
							return false;
						default:
							pragmaticVariableHelper(counter);
							if(error)
								return false;
							break;
							
					}
				}
			}
			break processing;
		}
		
	    printDebug("pragmaticProcess: All Patterns Detected. Results:",1);
		// print out the finished tokens, for testing.
		printDebugOneLine( "  Tokens: " , 1);
		for ( String token : tokens ) 
		{
					
			 printDebugOneLine( token+", ", 1 );
				   
		}
	    printDebug("",1);
				
				
		// print out the finished tokens, for testing.
	    printDebugOneLine( "  Tokenstypes: " , 1);
		for ( String token : tokenType ) 
		{
					
			  printDebugOneLine( token+", ", 1 );
			  
		}
		printDebug("",1);

		if(!isProcessing)
		{
			if(tokens.size()==2)
			{
				// basic commands here!
				if( tokenType.get(0).equals("keyword"))
				{
					if(tokens.get(0).equals("read")) // Read. pointless comment, but meh.
					{
						if(tokenType.get(1).equals("variable"))
						{
							Scanner Scanner = new Scanner( System.in );
							// yeah, only strings... (for now?)\
							System.out.print("? ");
							if(! declareVariable(tokens.get(1),"string",Scanner.nextLine( )))
							{
								Error.invalidTypeError( 2, tokens.get(1), "string"  );
								error=true;
								printDebug("pragmaticProcess: handing control to main.", 2);
								return false;
							}
							return false;
						}
					}
					
					if(tokens.get(0).equals("readInt")) // Read int.
					{
						Scanner Scanner= new Scanner( System.in );
						while(true)
						{
							System.out.print("? ");
							int int1;
							try
							{
								int1=Integer.parseInt( Scanner.nextLine());
							}
							catch( Exception e )
							{
								printStandard("Expected Integer.");
								continue;
							}
							
							// This occurs when var is not a int.
							if(! declareVariable(tokens.get(1),"int", Integer.toString(int1)))
							{
								Error.invalidTypeError( 2, tokens.get(1), "int"  );
								error=true;
								printDebug("pragmaticProcess: handing control to main.", 2);
								return false;
							}
							
							break;
						
						}
						
					}
				}
				
			}
		
			for( int counter = 0; counter < tokens.size(); counter ++)
			{
				if(tokenType.get(counter).equals("variable"))
				{
					
					pragmaticVariableHelper(counter);
					if(error)
					{
						return false;
					}
				}
			}
			
			
			
			if( tokens.size() == 1 )
			{
				// my brain is fried.
				
				userOutput=true;
				printStandard(tokens.get(0));
				return false;
				
			}
			if(tokens.size()==2)
			{
				// basic commands here!
				if( tokenType.get(0).equals("keyword"))
				{
					printDebug( "pragmaticProcess: Simple command detected.", 2 );
					
					
					switch(tokens.get(0))
					{
						case "print":
								userOutput=true;
								printStandard(tokens.get(1));
								printDebug("pragmaticProcess: handing control to main.", 2);
							break;
							
						case "debug":
							if(tokenType.get(1).equals("int"))
							{
								int int1= Integer.parseInt(tokens.get(1));
								if(int1 >= 0 && int1 <= 3)
								{
									debugLevel=int1;
									declaredVariables.clear();
									System.out.println("\n");
									System.out.println( "Ziker Shell | "+version+" | debug: " + debugLevel );
									System.out.println( "Interactive programing shell. Type help for help." );
									printDebug("pragmaticProcess: handing control to main.", 2);
									return false;
								}
								else
								{
									printStandard("Out of expected range. (0-3) ");
									printDebug("pragmaticProcess: handing control to main.", 2);
									return false;
								}
							}
							else
							{
								Error.invalidSyntaxError( 5, "int" );
								error = true;
								printDebug("PragmaticProcess: handing control to main.", 2);
								return false;
							}
							
							
					
							
							
					}
				}
				else
				{
					
					Error.invalidSyntaxError( 4, "" );
					error = true;
					printDebug("PragmaticProcess: handing control to main.", 2);
					return false;
					
				}
				return false;
			}
			else
			{
				
				Error.invalidSyntaxError( 4, "" );
				error = true;
				printDebug("PragmaticProcess: handing control to main.", 2);
				return false;
			}
		}
		else
		{
			for( int counter = 0; counter < tokens.size(); counter ++)
			{
				if(tokenType.get(counter).equals("variable"))
				{
					
					pragmaticVariableHelper(counter);
					if(error)
					{
						return false;
					}
				}
			}
			
			if(tokens.size() == 1 && tokenType.get(0).equals("boolean") )
			{
				if(tokens.get(0).equals("true"))
					return true;
				else
					return false;
			}
			else
			{
				error=true;
				printStandard("Error: conditional did not result in boolean.");
				return false;
			}
		}
		
	}
	
	
	
	public static void pragmaticRecognitionHelper(String[] pattern, int counter)
	{
		//what does this do???
		// it helps!
		//tokens.get(counter)
		printDebug("pragmaticProcess: Discovered pattern:"+pattern[0]+","+pattern[1]+","+pattern[2], 2);
		for( int counter2 = 0; counter2<3; counter2 ++)
		{
			
			tokens.remove(counter);
			tokenType.remove(counter);
			
		}
	}
	
	public static void pragmaticVariableHelper(int index)
	{
		if(tokenType.get(index).equals("variable"))
		{
			if(variableID(tokens.get(index))!=-1)
			{
				String newtoken = declaredVariables.get(variableID(tokens.get(index))).getValue();
				String newtokentype = declaredVariables.get(variableID(tokens.get(index))).getType();
				tokens.remove(index);
				tokenType.remove(index);
				tokens.add(index, newtoken);
				tokenType.add(index, newtokentype);
			}
			else
			{
				Error.invalidSyntaxError( 1, tokens.get(index) );
				error=true;
				printDebug("pragmaticProcess: handing control to main.", 2);
				return;
			}
			
		}
		else
		{
			//UH-OH.
			Error.internalError( 0 );
			error = true;
			return;
		}
	}
	
	public static void pragmaticRecognitionReport( )
	{
		
		// This method runs after pragmaticProcess has discovered a pattern, and has adjusted accordingly.
		// Doesn't do much unless debug is 3.
		
		
		
		printDebug("pragmaticProcess: pattern computed. Results of change:", 3);
		
		// print out the finished tokens, for testing.
		printDebugOneLine( "  Tokens: " , 1);
		for ( String token : tokens ) 
		{
			
		    printDebugOneLine( token+", ", 1 );
		    
		}
		printDebug("",1);
		
		
		// print out the finished tokens, for testing.
		printDebugOneLine( "  Tokenstypes: " , 1);
		for ( String token : tokenType ) 
		{
			
			  printDebugOneLine( token+", ", 1 );
			  
		}
		printDebug("",1);
		
	}
	
	
	
	
	
	public static void printDebug(  String debugMessage , int messageDebugLevel  )
	{
		// all testing or debug messages are printed with this message.
		// This way, they can be turned off.
		
		if(	debugLevel >= messageDebugLevel )
		{
			
			System.out.println( debugMessage );
			
		}
	}
	
	
	
	
	
	public static void printDebugOneLine(  String debugMessage , int messageDebugLevel  )
	{
		// all testing or debug messages are printed with this message.
		// This way, they can be turned off.
		
		if(	debugLevel >= messageDebugLevel )
		{
			
			System.out.print( debugMessage );
			
		}
	}
	
	
	
	
	
	public static void printStandard( String message )
	{
		
		// The shell should, in most cases, use this instead of System.out.println() .
		
		if(userOutput)
		{
			System.out.println( ">: " + message );
			userOutput=false;
		}
		else
		{
			if( isHelpModeActive )
			{
				
				System.out.println( "Help: " + message );
				
			}
			else
			{
				
				System.out.println( "Ziker3: " + message );
				
			} 
		}
	}
	
	
	public static void printArray( String[] message)
	{
		
		if( isHelpModeActive )
		{
			
			System.out.print( "Help: " );
			
		}
		else
		{
			
			System.out.print( "Ziker3: " );
			
		} 
		
		System.out.println(message[0]);
		
		for( int counter = 1; counter <= message.length-1; counter++   )
		{
			System.out.println("    : "+message[counter]);
		}
		
	}
	
	
	
	public static void activateHelpMode( )
	{
		
		isHelpModeActive=true;
		String[] toPrint= {"Welcome to interactive help mode.","Type \'topics\' for a list, Type \'quit\' to exit."};
		printArray(toPrint);
	}
	
	
	public static int variableID(String check)
	{
		for(int counter = 0; counter < declaredVariables.size(); counter++)
		{
			if(declaredVariables.get(counter).getName().equals(check))
			{
				return counter;
			}
		}
		
		return -1;
		
	}
	
	public static boolean declareVariable( String var, String type, String value)
	{
		if(variableID(var)==-1)
		{
			switch(type)
			{
				case "int":
					new number(var,Integer.parseInt( value ));
					return true;
				case "boolean":
					new bool(var,Boolean.parseBoolean( value ));
					return true;
				case "string":
					new text(var, value);
					return true;
			}
		}
		else
		{
			
			if( declaredVariables.get(variableID(var)).getType().equals(type))
			{
				switch(type)
				{
					case "int":
						declaredVariables.get(variableID(var)).setValue(Integer.parseInt( value ));
						return true;
					case "boolean":
						declaredVariables.get(variableID(var)).setValue(Boolean.parseBoolean( value ));
						return true;
					case "string":
						declaredVariables.get(variableID(var)).setValue( value );
						return true;
				}
			}
			
		}
		return false;
	}
	//copied from a random website...
	private static int getRandomNumberInRange(int min, int max) {

		if (min >= max) {
			throw new IllegalArgumentException("max must be greater than min");
		}

		Random r = new Random();
		return r.nextInt((max - min) + 1) + min;
	}
} 					