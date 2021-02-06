"use strict";
let inlineIcon = " <img class=\"inline\" src=\"Assets/Gui/Icons/goldIcon.png\">";
let cheat = "";
let luckyBreak = false;
let legacyBonus = 0.00;
let potentialLegacyBonus=0.0;

// Select Background image
ClickyDrive.background='Assets/Background.png';

// set ui
ClickyDrive.ui='UI.html';

// enable Saving
ClickyDrive.gameID="Clicky 4 saveCompatVer 0";

// let's attempt to add a new resource, gold
let gold = new ClickyDrive.resource("gold", 5000, true);

// define a node to go along with it.
let goldNode =new ClickyDrive.node("gold",800,450, ["Assets/gold0.png","Assets/gold1.png","Assets/gold2.png","Assets/gold3.png"]);
goldNode.size=320;

// set up fragments.
goldNode.fragment="Assets/goldFrag.png";
goldNode.depletedFragment="Assets/stoneFrag.png";
goldNode.fragmentScale=.2;

// set up glow
goldNode.glow.texture="Assets/Glow.png";
goldNode.glow.scale=3;

// Set enums for all of the buttons
// ""Enums""
// Whatever.
let unlockIDs =
{ 
    	// So this only counts for the buttons that need unlocked, 
	//and has only the button IDs, not the children, there will be an update one, okay?
	PickUp:0,
	MinerUp:1,
	DrillUp:2,
	LazerUp:3,
	Prospect:4,
	Prospector:5,
	Miner:6,
	Drill:7,
	Lazer:8,
	
}


let eventIDs = 
{
	Welcome: 'false',
	Goal:'false',
	Victory:'false'
}
saveGame(0);

let upgradeLevels=["Base","Stone","Tin","Copper","Bronze","Iron","Cast Iron","Steel","Stainless Steel","Tungsten","Titanium","Composite","Carbon Fiber", "Pure Electrum","Devine Gold"];

let upgrades =
{
	PickUp:new ClickyDrive.item('PickUp', {'gold':50}, 2.75,{"gold":0}),
	MinerUp:new ClickyDrive.item('MinerUp', {'gold':500}, 1.70, {"gold":0}),
	DrillUp:new ClickyDrive.item('DrillUp', {'gold':5000}, 1.6, {"gold":0}),
	LazerUp:new ClickyDrive.item('LazerUp', {'gold':100000}, 1.5, {"gold":0})
	 
}

// Define upgrade properties
upgrades.PickUp.onPurchase=function(){ gold.perClick*=2; };
upgrades.MinerUp.onPurchase=function(){ miners.Miner.basePerSecond.gold+=1; };
upgrades.DrillUp.onPurchase=function(){ miners.Drill.basePerSecond.gold+=10; };
upgrades.LazerUp.onPurchase=function(){ miners.Lazer.basePerSecond.gold+=100; };

// prospecting options
let alaska = new ClickyDrive.item("Alaska", {'gold':1000}, 1,{"gold":0});
alaska.isOneTime=true;
alaska.onPurchase=function(){ luckyBreak=false; gold.add(10000);};

let california = new ClickyDrive.item("California", {'gold':100000}, 1,{"gold":0});
california.isOneTime=true;
california.onPurchase=function(){luckyBreak=false; gold.add(1100000)};


let Prospector=new  ClickyDrive.item('prospector', {'gold':1000000}, 3,{"gold":100});
let prospectorBonus=0;


let miners =
{
	Miner:new ClickyDrive.item('Miner', {'gold':10}, 1.2,{"gold":1}),
	Drill:new ClickyDrive.item('Drill', {'gold':2000}, 1.1,{"gold":10}),
	Lazer:new ClickyDrive.item('Lazer', {'gold':30000}, 1.05,{"gold":100})
}




// Main function, effectively
ClickyDrive.hookins.update = function(tickCounter)
{
	
	goldNode.glow.scale=2+(Math.log(gold.amountAllTime)/Math.log(500));
	
	updateStats();
	updateUnlocked();
	updateUpgrades();
	updateMiners();
	updateProspector();
	updateDepleted();
	updateEvents();
	saveGame(tickCounter);
	updateLegacy();
	
	// cheats?
	unlockAll();
	
	gold.perSecondMultiplier=1+prospectorBonus+legacyBonus;
	
}

// efffectively just loading events.
ClickyDrive.hookins.create = function()
{
	// we are just loading things here.
	if(ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Welcome")!=null)
	{
	
		eventIDs.Welcome = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Welcome");
		eventIDs.Goal = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Goal");
		eventIDs.Victory = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Victory");
		legacyBonus =  parseFloat(ClickyDrive.save.getItem(ClickyDrive.gameID+".LegacyBonus"));
		
		if(eventIDs.Victory=="true")
		{
			document.getElementById("legacyButton").classList.remove("hidden");
		}
		
	}
	
}

function saveGame(tickCounter)
{
	
	if(tickCounter%60==0 && tickCounter!=0) // don't ask, I have NO clue.
	{	
	
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Welcome",eventIDs.Welcome);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Goal",eventIDs.Goal);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Victory",eventIDs.Victory);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".LegacyBonus", legacyBonus);
		
	}
}

function wipeSave()
{
	ClickyDrive.gameID="Hey, you found this hidden message, and I wanted to congragulate you. if you find it, tell me!";
	ClickyDrive.newSave();
	location.reload();
}

function updateEvents()
{
	for( let i in eventIDs )
	{
		
		if(eventIDs[i]=="false")
		{
			
			switch(i)
			{
				case "Welcome":
					// always will trigger asap
					console.log(eventIDs);
					triggerEvent(i);
					break;
				case "Goal":
					if(upgrades.LazerUp.amount>=1 && Math.random()<=.005){triggerEvent(i);}
					break;
				case "Victory":
					if(upgrades.LazerUp.amount>=14 && upgrades.PickUp.amount >= 14 && upgrades.MinerUp.amount >= 14 && upgrades.PickUp.amount >= 14 && Math.random()<=.005)
					{
						triggerEvent(i);
						document.getElementById("legacyButton").classList.remove("hidden");
					}
					break;
			}
		}
	}
}

function triggerEvent(Event)
{
	eventIDs[Event]="true";
	openPanel(Event);
}

function updateLegacy()
{
	
		
	potentialLegacyBonus=((Math.log(gold.amountAllTime/10000000000)/Math.log(1.1))+100)/100;
	
	if(potentialLegacyBonus<=0)
	{
		potentialLegacyBonus=0;
	}
	document.getElementById("legacy1").innerHTML="You will lose <em>ALL</em> of your gold, upgrades, and miners, but you will recive "+prettyPrint(potentialLegacyBonus*100)+"% bonus to GPS.";
	document.getElementById("legacy2").innerHTML="Are you sure you want to ascend and have a total "+prettyPrint((legacyBonus+potentialLegacyBonus)*100)+"% legacy bonus?";
}

// updates upgrade buttons
function updateUpgrades()
{
	for( let i in upgrades)
	{
		//get the cost Element
		//console.log(upgrades[i].costs.gold+inlineIcon);
		document.getElementById(i+"Cost").innerHTML= "Cost: "+prettyPrint(upgrades[i].costs.gold)+inlineIcon;
		let owned="Level: ("+upgrades[i].amount+"/"+(upgradeLevels.length-1)+") "+(upgrades[i].amount>=upgradeLevels.length?upgradeLevels[upgradeLevels.length-1]:upgradeLevels[upgrades[i].amount]);
		document.getElementById(i+"Owned").innerHTML=owned;
		
		// for now
		switch(i)
		{
			case "PickUp":
				document.getElementById(i+"Effect").innerHTML="Effect: "+prettyPrint(gold.perClick)+" Gold per click";
				break;

			
		}
		
	}
	
}

// now for miners


function updateMiners()
{
	for( let i in miners )
	{
		//get the cost Element
		
		document.getElementById(i+"Cost").innerHTML= "Cost: "+prettyPrint(miners[i].costs.gold)+inlineIcon;
		let owned="Owned: "+miners[i].amount+" Total GPS: "+prettyPrint(miners[i].perSecond.gold);
		document.getElementById(i+"Owned").innerHTML=owned;
		document.getElementById(i+"GPS").innerHTML="GPS: "+prettyPrint(miners[i].basePerSecond.gold);
		
	
		
	}
}



Prospector.onPurchase=function()
{
	
	if(Prospector.amount==1)
	{
		prospectorBonus=-.1;
		gold.totalAmountAvailable=Infinity;
		gold.amountAvailable=Infinity;
		document.getElementById("prospectorName").innerHTML="Prospector";
		document.getElementById("prospectorDesc").innerHTML="You no longer need to Prospect!";
		document.getElementById("prospectorQuip").innerHTML="Need some help makin' gold?";
		document.getElementById("prospectorIcon").src="Assets/Gui/Icons/Autos/iconProspector.png"
		luckyBreak=false; 	
	}
	else if (Prospector.amount>1)
	{
		prospectorBonus+=.05;
		prospectorBonus=Math.round(prospectorBonus * 100) / 100;
	}

}

function updateProspector()
{
	document.getElementById("prospectorCost").innerHTML="Cost: "+prettyPrint(Prospector.costs.gold)+inlineIcon;
	if(Prospector.amount>=1)
	{	
		document.getElementById("prospectorEffect").innerHTML=(prospectorBonus>=0?"+":"-")+Math.abs(prospectorBonus)*100+"% of GPS. (+5% per level)"
	}
}

function ascend()
{
		for ( let i in miners)
		{
			miners[i].amount=0;
		}
		for ( let i in upgrades)
		{
			upgrades[i].amount=0;
		}
		
		Prospector.amount=0;
		
		gold.amount=0;
		gold.amountAllTime=0;
		gold.totalAmountAvailable=5000;
		gold.amountAvailable=5000;
		eventIDs.Goal="false";
		eventIDs.Victory="false";
		legacyBonus+=potentialLegacyBonus;
		
		saveGame(60);
		console.log(ClickyDrive.save);
		ClickyDrive.saveGame();
		
		
		location.reload(); 
		
		// NOTE TO SELF:
		// you need to make sure legacy button unlocked is saved, as well as
}

function updateUnlocked()
{
	for( let i in unlockIDs )
	{
		if(!isUnlocked(unlockIDs[i]))
		{
			
			switch(unlockIDs[i])
			{
				
				case unlockIDs.PickUp:
					if(gold.amount>=upgrades.PickUp.baseCosts.gold){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.MinerUp:
					if(miners.Miner.amount>=10){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.DrillUp:
					if(miners.Drill.amount>=5){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.LazerUp:
					if(miners.Lazer.amount>=5){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.Miner:
					if(gold.amount>=miners.Miner.costs.gold){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.Drill:
					if(miners.Miner.amount>=25){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.Lazer:
					if(miners.Drill.amount>=20){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.Prospector:
					if(upgrades.LazerUp.amount>=2){unlock(unlockIDs[i]);}
					break;
				case unlockIDs.Prospect:
					if(gold.amountAvailable/gold.totalAmountAvailable<=.65||alaska.amount>0||california.amount>0||gold.amountAvailable==Infinity){unlock(unlockIDs[i]);}
					break;
					
					
			}
			
			
				
		}

	}
}

// returns boolean.
function isUnlocked( unlockID )
{
	for( let i in unlockIDs )
	{
		if(unlockID==i)
		{	
			// nonsense.
			if(document.getElementById(Object.keys(unlockIDs)[i])==null)
			{
				// seems bizare, but whatever
				return true;
			}

			if(!document.getElementById(Object.keys(unlockIDs)[i]).classList.contains('hidden'))
			{
				return true;
			}
			else
			{
				return false;
			}
				
		}
	}
	return false;
}


function unlock(unlockID)
{
	let element = document.getElementById(Object.keys(unlockIDs)[unlockID]);
	
	element.classList.remove('hidden');
	
	setTimeout(() => { element.classList.add('unlocked'); }, 50);
}

function unlockAll() // this was a debug method, but 
{	
	if(cheat=="fuzzy")
	{
		for( let i in unlockIDs )
		{
			unlock(unlockIDs[i]);
		}
	}
}




// panel system
let panelIDs =["settings","prospect","prospect2","wipeSave","Goal","Victory","legacy","Welcome"];

let currentPanel = "";


function closeAllPanels()
{
	for (let i in panelIDs)
	{
		if(i!="")
		{
			
			let element = document.getElementById(panelIDs[i]);
			element.classList.add('hidden');
		}
		
		currentPanel="";
		gold.enabled=true;
	}
	
}

function openPanel(panel)
{
	closeAllPanels();

	let element = document.getElementById(panel);
	element.classList.remove('hidden');
	currentPanel=panel;
	gold.enabled=false;
}



function toggleSettings()
{
	if(currentPanel==""||currentPanel=="prospect"||currentPanel=="prospect2")
	{
		openPanel("settings");
	}
	else if (currentPanel=="settings")
	{ 
		closeAllPanels();
	}
}

function toggleProspect()
{
	if(currentPanel==""||currentPanel=="settings")
	{
		if(Prospector.amount==0)
		{
			openPanel("prospect");
		}
		else
		{
			openPanel("prospect2");
		}
	}
	else if (currentPanel=="prospect"|| currentPanel=="prospect2")
	{ 
		closeAllPanels();
	}
}






function updateStats()
{
	if( gold.amountAllTime==0)
	{
		ClickyDrive.ui.getChildByID("gold").innerHTML="Mine for gold!";
		ClickyDrive.ui.getChildByID("gps").innerHTML="What could go wrong?";
	}
	else
	{
		ClickyDrive.ui.getChildByID("gold").innerHTML="Gold: "+prettyPrint(gold.amount);
		ClickyDrive.ui.getChildByID("gps").innerHTML=prettyPrint(gold.perSecond*gold.perSecondMultiplier)+" GPS";
	}
	
	ClickyDrive.ui.getChildByID("listGold").innerHTML=prettyPrint(gold.amount)+inlineIcon;
	ClickyDrive.ui.getChildByID("listAllTime").innerHTML=prettyPrint(gold.amountAllTime)+inlineIcon;
	ClickyDrive.ui.getChildByID("listLegacy").innerHTML=Math.round(legacyBonus*100)+"%";
	ClickyDrive.ui.getChildByID("listModifier").innerHTML=Math.round(gold.perSecondMultiplier*100)+"%";
	ClickyDrive.ui.getChildByID("listGPS").innerHTML=prettyPrint(gold.perSecond*gold.perSecondMultiplier)+inlineIcon+"/Sec";
	
	
	ClickyDrive.ui.getChildByID("reserves").innerHTML=prettyPrint(gold.amountAvailable)+inlineIcon;
	ClickyDrive.ui.getChildByID("reservesBar").style.width=((gold.amountAvailable/gold.totalAmountAvailable)*100)+"%";
	
	
	
}

function updateDepleted()
{
	if( gold.amountAvailable==0)
	{
		 document.getElementById("depletedText").innerHTML="Depleted!";
		 document.getElementById("depleted").classList.remove("hidden");
		 gold.clicks=0;
		
		 if( gold.clicks>=10 && !luckyBreak && gold.amount<alaska.costs.gold )
		 {
			luckyBreak=true;
			document.getElementById("depletedText").innerHTML="Lucky Break!";
			gold.add(1000);
		 }
	}
	else
	{
		if(!luckyBreak)
		{
			document.getElementById("depleted").classList.add("hidden");
		}
		
	}
}



// start the game	
ClickyDrive.game = new Phaser.Game(config);

// fine, jacob.
document.addEventListener('keyup', event => 
{
  if (event.code === 'Space') 
  {
	  if( cheat == "jacob")
	  {
		gold.mine(800,450);
	  }
  }
})