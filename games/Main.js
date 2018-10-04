var gold=0; //The current gold the user has at any given time. this will be replaced by a cookie...
var goldIncome=0; //how much money you make from Autos each second.

var clickLevel=1; // the pickaxe level
var pickCost=10; // the cost of the pickaxe

var autolAmount=0; // Amount of miners you have.
var autolCost=15; // How much those miners cost.

/*####### ON START ########*/

syncAll();
setInterval( update,250); //update every QUARTER SECOND < remember!





/*######## Functions ########*/


function clickMain() // increments gold when central button is clicked.
{
	gold=gold+clickLevel;
	syncAll(); // let the user know their gold has gone up.
}

function syncAll() // updates all current variables to the HTML elements.
{
	document.getElementById("goldCount").innerHTML="Gold: "+Math.round(gold * 100) / 100 ;
	document.getElementById("gps").innerHTML="Gold/sec: "+autolAmount;
	
	document.getElementById("pickLevel").innerHTML="Level: "+ clickLevel ;
	document.getElementById("pickCost").innerHTML="Cost: "+ pickCost;

	document.getElementById("autolAmmount").innerHTML="Count: "+ autolAmount ;
	document.getElementById("autolCost").innerHTML="Cost: "+ autolCost;

	
}


function pickUp() // when clicking the pickaxe upgrade
{
	if(gold>=pickCost) // can the player aford it?
	{
		gold=gold-pickCost;
		clickLevel++;
		pickCost=Math.round(10*Math.pow(clickLevel,2)); // I'm too lazy to use powers right now, i plan to fix that.
		syncAll(); // whenever variables change, syncAll must be used.
		
	}
	else // inadequte funds.
	{
		document.getElementById("pickCost").style.color="#ee1111"; //A  red warning to alert the player to their fault.
		setTimeout(fixCosts,750);
	}
}

function autolUp()
{
	if(gold>=autolCost)
	{
		gold=gold-autolCost;
		autolAmount++;
		goldIncome=autolAmount;
		autolCost=Math.round(15*Math.pow(autolAmount+1,1.7));
		syncAll();
	}
	else // inadequte funds.
	{
		document.getElementById("autolCost").style.color="#ee1111"; //A  red warning to alert the player to their fault.
		setTimeout(fixCosts,750);
	}
}

function update()
{
	//code that needs constant updating... progress bars, qualifications, gold/sec, and so on.
	
	gold=gold+(goldIncome/4);
	
	if((gold/pickCost)*100>=100) // this goverens the 'pickaxe upgrade' progress bar
	{
		document.getElementById("pickBar").style.width="100%";	
		document.getElementById("pickUpgrade").style.backgroundColor="#dd1111";
	}
	else
	{
		document.getElementById("pickBar").style.width=(gold/pickCost)*100+"%";
		document.getElementById("pickUpgrade").style.backgroundColor="#aa1111";
	}
	
	if((gold/autolCost)*100>=100) // this goverens the 'auto miner' progress bar
	{
		document.getElementById("autolBar").style.width="100%";	
		document.getElementById("autolUpgrade").style.backgroundColor="#dd1111";
	}
	else
	{
		document.getElementById("autolBar").style.width=(gold/autolCost)*100+"%";
		document.getElementById("autolUpgrade").style.backgroundColor="#aa1111";
	}
	syncAll();
	
}

function fixCosts()
{
	//this resets the red cost text.
	
	document.getElementById("pickCost").style.color="#e0e0e0";
	document.getElementById("autolCost").style.color="#e0e0e0";
}

