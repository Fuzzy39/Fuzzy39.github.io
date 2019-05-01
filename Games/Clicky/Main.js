/*####### ON START ########*/

console.log(Cookies.get('Gold'));
if(Cookies.get('Gold')==undefined)
{
	Cookies.set('Gold',0),{ expires: 1 };
}
var gold=0; //The current gold the user has at any given time. this will be replaced by a cookie...
var goldIncome=0; //how much money you make from Autos each second.

var clickLevel=1; // the pickaxe level
var pickCost=10; // the cost of the pickaxe

var autolAmount=0; // Amount of miners you have.
var autolCost=15; // How much those miners cost.
var autolStrength=1; // the GPS of an autoMiner, can be increased by an effeciency upgrade.

var autolUpLevel=0;// how effecient an autominer is.
var autolUpCost=400; // cost of auto effecency.


setInterval( update,250); //update every QUARTER SECOND < remember!




/*######## Functions ########*/


function clickMain() // increments gold when central button is clicked.
{
	gold=gold+clickLevel;
}


function pickUp() // when clicking the pickaxe upgrade
{
	if(gold>=pickCost) // can the player aford it?
	{
		gold=gold-pickCost;
		clickLevel++;
		
		
		
	}
	else // inadequte funds.
	{
		document.getElementById("pickCost").style.color="#ee1111"; //A  red warning to alert the player to their fault.
		setTimeout(fixCosts,750);
	}
}



function autolUp()  // when trying to get  an 'auto miner' upgrade.
{
	if(gold>=autolCost)
	{
		//make the changes.
		gold=gold-autolCost;
		autolAmount++;
		
		
	}
	else // inadequte funds.
	{
		document.getElementById("autolCost").style.color="#ee1111"; //A  red warning to alert the player to their fault.
		setTimeout(fixCosts,750);
	}
}


function autolUp2()  // when trying to get  an 'auto miner effecientcy' upgrade.
{
	if(gold>=autolUpCost)
	{
		//make the changes.
		gold=gold-autolUpCost;
		autolUpLevel++;
		autolStrength=autolUpLevel+1;
		
		
	}
	else // inadequte funds.
	{
		document.getElementById("autolUpCost").style.color="#ee1111"; //A  red warning to alert the player to their fault.
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
		if(! document.getElementById("pickUpgrade").classList.contains("upgradeOn"))
		{
			document.getElementById("pickUpgrade").classList.add("upgradeOn");
			document.getElementById("pickUpgrade").classList.remove("upgradeOff");
		}
		
	}
	else
	{
		document.getElementById("pickBar").style.width=(gold/pickCost)*100+"%";
		if(document.getElementById("pickUpgrade").classList.contains("upgradeOn"))
		{
			document.getElementById("pickUpgrade").classList.remove("upgradeOn");
			document.getElementById("pickUpgrade").classList.add("upgradeOff");
		}
	}
	
	if((gold/autolCost)*100>=100) // this goverens the 'auto miner' progress bar
	{
		document.getElementById("autolBar").style.width="100%";	
		document.getElementById("autolUpgrade").classList.add("upgradeOn");
		document.getElementById("autolUpgrade").classList.remove("upgradeOff");
		
	}
	else
	{
		document.getElementById("autolBar").style.width=(gold/autolCost)*100+"%";
		document.getElementById("autolUpgrade").classList.remove("upgradeOn");
		document.getElementById("autolUpgrade").classList.add("upgradeOff");
	}
	
	
	if((gold/autolUpCost)*100>=100) // this goverens the 'auto miner' progress bar
	{
		document.getElementById("autolUpBar").style.width="100%";	
		document.getElementById("autolUpgrade2").classList.add("upgradeOn");
		document.getElementById("autolUpgrade2").classList.remove("upgradeOff");
		
	}
	else
	{
		document.getElementById("autolUpBar").style.width=(gold/autolUpCost)*100+"%";
		document.getElementById("autolUpgrade2").classList.remove("upgradeOn");
		document.getElementById("autolUpgrade2").classList.add("upgradeOff");
	}
	
	
	if(autolAmount>=5)
	{
		document.getElementById("autolUpgrade2").classList.remove("upgradeLocked");
		document.getElementById("autolUpgrade2").classList.add("upgradeOff"); // temporary.
	}
	
	
	
	// update the things under the hood.
	goldIncome=autolAmount*autolStrength; //find GPS
	autolCost=Math.round(15*Math.pow(autolAmount+1,1.7));
	autolUpCost=Math.round(400*Math.pow(autolUpLevel+1,1.3));
	pickCost=Math.round(10*Math.pow(clickLevel,2)); 
	
	
	//Update the things the player sees.
	document.getElementById("goldCount").innerHTML="Gold: "+Math.round(gold * 100) / 100 ;
	document.getElementById("gps").innerHTML="Gold/sec: "+goldIncome; 
	
	document.getElementById("pickLevel").innerHTML="Level: "+ clickLevel ;
	document.getElementById("pickCost").innerHTML="Cost: "+ pickCost;

	document.getElementById("autolUpLevel").innerHTML="Count: "+ autolUpLevel ;
	document.getElementById("autolUpCost").innerHTML="Cost: "+ autolUpCost;
	
	document.getElementById("autolAmmount").innerHTML="Count: "+ autolAmount ;
	document.getElementById("autolCost").innerHTML="Cost: "+ autolCost;
	document.getElementById("autolDesc").innerHTML=autolStrength+" gold per second.";
	
	
	
	
	
}

function fixCosts()
{
	//this resets the red cost text.
	
	document.getElementById("pickCost").style.color="#e0e0e0";
	document.getElementById("autolUpCost").style.color="#e0e0e0";
	document.getElementById("autolCost").style.color="#e0e0e0";
}

