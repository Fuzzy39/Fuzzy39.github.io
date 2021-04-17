"use strict";

let skinDir = "Assets/Skins/";
let code=-1;
let cheat = "";
let version=2; // for version updates menu
let keyboard=false; // spacebar to click?
let luckyBreak = false; 
let legacyBonus = 0.00;
let potentialLegacyBonus=0.0;
let progression = 0; // Increases as the player hits various Legacy related milestones.
let locked = false; // is the game on lockdown?
let skinIDs = {gold:0,iron:1,crab:2};

let skins = 
[
	[skinDir+"Gold/gold0.png",skinDir+"Gold/gold1.png",skinDir+"Gold/gold2.png",skinDir+"Stone.png"],
	[skinDir+"Iron/gold0.png",skinDir+"Iron/gold1.png",skinDir+"Iron/gold2.png",skinDir+"Stone.png"],
	[skinDir+"Crab/Crab0.png",skinDir+"Crab/Crab1.png",skinDir+"Crab/Crab2.png",skinDir+"Stone.png"]
]
let skinParticles =
[
	 skinDir+"Gold/goldFrag.png",
	 skinDir+"Iron/goldFrag.png",
	 skinDir+"Crab/CrabFrag.png"
]

let skinGlows =
[
	skinDir+"Gold/Glow.png",
	skinDir+"Iron/Glow.png",
	skinDir+"Crab/Glow.png"
]

let currentSkin = skinIDs.gold;

let skinNames = ["Gold","Iron","Crabs"];
let internalSkinNames = ["Gold","Iron","Crab"];
	
// Select Background image
ClickyDrive.background='Assets/Background.png';

// set ui
ClickyDrive.ui='UI.html';

// enable Saving
ClickyDrive.gameID="Clicky 4 saveCompatVer 0";

// let's attempt to add a new resource, gold
let gold = new ClickyDrive.resource("gold", 5000, true);



if(ClickyDrive.save.getItem(ClickyDrive.gameID+".skin") != null)
{
	currentSkin = parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".skin"));
	
}

let inlineIcon =" <img class=\"inline\" src=\""+skinDir+internalSkinNames[currentSkin]+"/goldIcon.png\">";

let goldNode =new ClickyDrive.node("gold",800,450, skins[currentSkin]);

goldNode.size=320;

// set up fragments.
goldNode.fragment=skinParticles[currentSkin];
goldNode.depletedFragment=skinDir+"stoneFrag.png";
goldNode.fragmentScale=.2;

// set up glow
goldNode.glow.texture=skinGlows[currentSkin];
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
	Victory:'false',
	error:'false',
	ascend:"false",
	luckyBreak:"false"
}


function onPurchaseFail(i)
{
	
	
	let j = document.getElementById(i);
	j.classList.add('purchaseFailed');
	let k = document.getElementById(i+"Cost");
	k.classList.add('red');
	setTimeout(function(){j.classList.remove('purchaseFailed'); k.classList.remove('red');},400);
}


let upgradeLevels=["Base","Stone","Tin","Copper","Bronze","Iron","Cast Iron","Steel","Stainless Steel","Tungsten","Titanium","Composite","Carbon Fiber", "Pure Electrum","Devine Gold"];

let upgrades =
{
	PickUp:new ClickyDrive.item('PickUp', {'gold':50}, 2.7,{"gold":0}),
	MinerUp:new ClickyDrive.item('MinerUp', {'gold':500}, 1.5, {"gold":0}),
	DrillUp:new ClickyDrive.item('DrillUp', {'gold':5000}, 1.46, {"gold":0}),
	LazerUp:new ClickyDrive.item('LazerUp', {'gold':200000}, 1.42, {"gold":0})
	 
}

// Define upgrade properties
upgrades.PickUp.onPurchase=function(){ gold.perClick*=2; purchaseUpdate(); };
upgrades.MinerUp.onPurchase=function(){ miners.Miner.basePerSecond.gold+=1; purchaseUpdate();};
upgrades.DrillUp.onPurchase=function(){ miners.Drill.basePerSecond.gold+=10; purchaseUpdate();};
upgrades.LazerUp.onPurchase=function(){ miners.Lazer.basePerSecond.gold+=100; purchaseUpdate(); };


// prospecting options
let alaska = new ClickyDrive.item("Alaska", {'gold':1000}, 1,{"gold":0});
alaska.isOneTime=true;
alaska.onPurchase=function(){ luckyBreak=false; gold.add(10000);};

let california = new ClickyDrive.item("California", {'gold':100000}, 1,{"gold":0});
california.isOneTime=true;
california.onPurchase=function(){luckyBreak=false; gold.add(1100000)};


let Prospector=new  ClickyDrive.item('Prospector', {'gold':1000000}, 1.5,{"gold":0});
let prospectorBonus=0;


let miners =
{
	Miner:new ClickyDrive.item('Miner', {'gold':10}, 1.075,{"gold":1}),
	Drill:new ClickyDrive.item('Drill', {'gold':2000}, 1.075,{"gold":10}),
	Lazer:new ClickyDrive.item('Lazer', {'gold':25000}, 1.075,{"gold":100})
}


miners.Miner.onPurchase=function(){ purchaseUpdate();};
miners.Drill.onPurchase=function(){ purchaseUpdate();};
miners.Lazer.onPurchase=function(){ purchaseUpdate(); };


// Main function, effectively
ClickyDrive.hookins.update = function(tickCounter)
{
	
	goldNode.glow.scale=2+(Math.log(gold.amountAllTime)/Math.log(500));
	
	
	updateStats();
	updateUnlocked();
	updateDepleted();
	updateEvents();
	updateSecrets();
	saveGame(tickCounter);
	
	if(tickCounter%60 == 2 ) // the 2, shockingly, is not arbitrary, but is also stupid.                        
	{
		updateLit();	
		purchaseUpdate();
	}
	
	
	updateLegacy();
	

	
	gold.perSecondMultiplier=1+(Math.round(prospectorBonus*(legacyBonus+1)* 100) / 100)+legacyBonus;
	
	// Cap the gold.
	if(gold.amount>999990000000000000) // 999.99 quadrillion
	{
		gold.amount=999990000000000000;
	}
	
}


// efffectively just loading events.
ClickyDrive.hookins.create = function()
{
	let lastVersion;
	// we are just loading things here.
	if(ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Welcome")!=null)
	{
	
		// I'm being lazy, yeah.
		eventIDs.Welcome = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Welcome");
		eventIDs.Goal = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Goal");
		eventIDs.Victory = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.Victory");
		eventIDs.Error = ClickyDrive.save.getItem(ClickyDrive.gameID+".Event.error");
		lastVersion =  parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".version"));
		progression =  parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".progress"));
		legacyBonus =  parseFloat(ClickyDrive.save.getItem(ClickyDrive.gameID+".LegacyBonus"));
		
		if(eventIDs.Victory=="true")
		{
			document.getElementById("legacyButton").classList.remove("hidden");
		}
		purchaseUpdate();
		
		// open "what's new" screen
		if( lastVersion < version || isNaN(lastVersion) )
		{
			triggerEvent("Welcome");
		}
		
		if( isNaN(progression))
		{
			progression=0
		}
		
		if(legacyBonus>0 & gold.amount==0)
		{
			calcProgress();
			onAscend();
			triggerEvent("ascend");
		}
	
		
	}
	
	// staple animations to things.
	for( let i in upgrades)
	{
		upgrades[i].graphicOnPurchaseFail=function(){ onPurchaseFail(i)}; 
		
	}
	for( let i in miners)
	{
		miners[i].graphicOnPurchaseFail=function(){ onPurchaseFail(i)}; 
	}
	
	Prospector.graphicOnPurchaseFail=function(){ onPurchaseFail("Prospector")}; 
	



	
	

}

function calcProgress()
{
	
	if(legacyBonus>=10)
	{
		progression=2;
	}
	else if(legacyBonus>=3)
	{
		progression=1;
	}
	else
	{
		progression=0;
	}
	ClickyDrive.save.setItem(ClickyDrive.gameID+".progress", progression);
		
}
function onAscend()
{
	// update the ascend event pannel:
	switch(progression)
	{
		case 0:
			document.getElementById("ascend1").innerHTML="You feel a bit light-headed...";
			document.getElementById("ascend2").innerHTML="It feels like you've been at this for a while, even though you just started...";
			document.getElementById("ascendGoal").innerHTML="You wonder if you'll feel satisfied at 300% Legacy?";
			break;
		case 1:
			document.getElementById("ascend1").innerHTML="You feel a bit dizzy...";
			document.getElementById("ascend2").innerHTML="You've unlocked the ability to change the game's skin in settings!...";
			document.getElementById("ascendGoal").innerHTML="You feel a growing need for more... 1,000%?";
			break;
		case 2:
			document.getElementById("ascend1").innerHTML="You feel a bit light-headed...";
			document.getElementById("ascend2").innerHTML="It feels like you've been doing this for a century, even though you just started...";
			document.getElementById("ascendGoal").innerHTML="It's never enough... Is it?";
			break;
	}
}

function updateSecrets()
{
	if(cheat!="")
	{
		switch(cheat)
		{
			case "opensesame":
					unlockAll();
					console.log(" A whole new world opens before you!")
				break;
				
			case "billy":
				console.log("hmm, need a different pick for your job?");
				if(code<0 || code>500)
				{
					console.log("That's not gonna work... (code is set to an improper value)");
				}
				else
				{
					let p = upgrades.PickUp
					p.amount=0;
					gold.perClick=1;
					for(let i = 0; i<code; i++)
					{
						p.add();
					}
					document.getElementById("versionText").innerHTML= document.getElementById("versionText").textContent.replace(/v/g, "c");
				}
				break;
			case "jacob":
				console.log("Clicking? not for me!");
				keyboard=true;
				break;
			case "burningflame":
				console.log("They work for a different master.");
				console.log("Miners now work against you...");
				miners.Miner.basePerSecond.gold*=-1;
				document.getElementById("burningLAME").innerHTML="Vickash's Minions";
				break;
			
			case "dylanpalmer":
				console.log("(AKA Cosmic__Turtle) Follow him on Twitch!");
				break;
			case "windfall":
				console.log("A small gift, from a wealthy uncle who passed in curious circumstances...");
				gold.amount+=gold.perSecond*600;
				document.getElementById("versionText").innerHTML= document.getElementById("versionText").textContent.replace(/v/g, "c");
				break;
			
			
		}
		
		cheat="";
		code=-1;
	}
}

function setSkin( num )
{
	ClickyDrive.save.setItem(ClickyDrive.gameID+".skin", num);
	location.reload();
}

function updateLit()
{

	// go through each object in the game...
	// and light it up if it's purchasable
	for( let i in upgrades )
	{
		
		determineLit(upgrades[i]);
	}
	
	for(let i in miners )
	{
		
		determineLit(miners[i]);
	}
	
	determineLit(Prospector);

	
}

function determineLit(item)
{
	let itemIcon = document.getElementById(item.name+"Icon");
	
	if( gold.amount >= item.costs.gold)
	{
		
		itemIcon.classList.add('lit');
	}
	else
	{
		itemIcon.classList.remove('lit');
	}
	
}


function saveGame(tickCounter)
{
	
	if(tickCounter%60==0 && tickCounter!=0) // don't ask, I have NO clue.
	{	
	
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Welcome",eventIDs.Welcome);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Goal",eventIDs.Goal);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.Victory",eventIDs.Victory);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".Event.error",eventIDs.error);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".LegacyBonus", legacyBonus);
		ClickyDrive.save.setItem(ClickyDrive.gameID+".version", version);
		
	}
}

function wipeSave()
{
	ClickyDrive.gameID="Hey, you found this hidden message, and I wanted to congragulate you. if you find it, tell me!";
	ClickyDrive.newSave();
	location.reload();
}

function checkError()
{	
	
	
	if(gold.amount == Infinity || isNaN(gold.amount)|| gold.amount == undefined 
	   || gold.perSecond == Infinity || isNaN(gold.perSecond) || gold.perSecond == undefined 
	   || legacyBonus== Infinity || isNaN(legacyBonus) || legacyBonus == undefined)
	{
		console.log("Oh No...")
		lockdown();
		return true;
	}
	return false;
	
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
					
					triggerEvent(i);
					break;
				case "Goal":
					if(upgrades.LazerUp.amount>=1 && Math.random()<=.005){triggerEvent(i);}
					break;
				case "Victory":
					if(upgrades.LazerUp.amount>=14 && upgrades.PickUp.amount >= 14 && upgrades.MinerUp.amount >= 14 && upgrades.DrillUp.amount >= 14)
					{
						triggerEvent(i);
						document.getElementById("legacyButton").classList.remove("hidden");
					}
					break;
				case "error":
					if(checkError())
					{
						
						triggerEvent(i);
					}
					break;
				// other events triggered elsewhere
			}
		}
	}
}

function triggerEvent(Event)
{
	if(eventIDs[Event]=="false")
	{
		
		eventIDs[Event]="true";
		openPanel(Event);
		lockdown();
	    return true;
	}
	return false;
}

function updateLegacy()
{
	
	let maxing=false;
	potentialLegacyBonus=gold.amountAllTime/200000000; //1% = 2 million
	
	if(potentialLegacyBonus<=0)
	{
		potentialLegacyBonus=0;
	}
	
	if(potentialLegacyBonus+legacyBonus>=1000000) // Capping legacy to 100M%
	{
		potentialLegacyBonus=1000000-legacyBonus;
		maxing=true;
	}
	
	document.getElementById("legacy1").innerHTML="You will lose <em>ALL</em> of your "+skinNames[currentSkin]+", upgrades, and miners, but you will recive "+prettyPrint(potentialLegacyBonus*100)+"% bonus to GPS.";
	document.getElementById("legacy2").innerHTML="Are you sure you want to ascend and have a total "+prettyPrint((legacyBonus+potentialLegacyBonus)*100)+"%"+(maxing?" (MAXED)":"")+" legacy bonus?";
}

// updates upgrade buttons
function updateUpgrades()
{
	for( let i in upgrades)
	{
		//get the cost Element
		
		document.getElementById(i+"Cost").innerHTML= "Cost: "+prettyPrint(upgrades[i].costs.gold)+inlineIcon;
		let owned="Level: ("+upgrades[i].amount+"/"+(upgradeLevels.length-1)+") "+(upgrades[i].amount>=upgradeLevels.length?upgradeLevels[upgradeLevels.length-1]:upgradeLevels[upgrades[i].amount]);
		document.getElementById(i+"Owned").innerHTML=owned;
		
		// for now
		switch(i)
		{
			case "PickUp":
				document.getElementById(i+"Effect").innerHTML="Effect: "+prettyPrint(gold.perClick)+" "+skinNames[currentSkin]+" per click";
				break;
			case "MinerUp":
				document.getElementById(i+"Effect").innerHTML="Effect: +"+prettyPrint(gold.perSecondMultiplier)+" GPS per Miner";
				break;
			case "DrillUp":
				document.getElementById(i+"Effect").innerHTML="Effect: +"+prettyPrint(10*gold.perSecondMultiplier)+" GPS per Drill";
				break;
			case "LazerUp":
				document.getElementById(i+"Effect").innerHTML="Effect: +"+prettyPrint(100*gold.perSecondMultiplier)+" GPS per Lazer";
				break;

			
		}
		
		
		
	}
	
}

function purchaseUpdate()
{
	
	updateUpgrades();
	updateMiners();
	updateProspector();
	updateLit();
	
	document.getElementById("ProspectName").innerHTML="Buy more land and get " +skinNames[currentSkin]+"."		
	document.getElementById("ProspectQuip").innerHTML="Thar be "+skinNames[currentSkin]+ " in 'dem hills!";
	document.getElementById("list0").innerHTML="Current " +skinNames[currentSkin]+":"		
	document.getElementById("list1").innerHTML="All Time "+skinNames[currentSkin]+ ":";
	document.getElementById("prospect1").innerHTML="Cost: 1,000 " +inlineIcon;		
	document.getElementById("prospect3").innerHTML="Cost: 100K "+inlineIcon;
}
// now for miners


function updateMiners()
{
	for( let i in miners )
	{
		//get the cost Element
		
		document.getElementById(i+"Cost").innerHTML= "Cost: "+prettyPrint(miners[i].costs.gold)+inlineIcon;
		let owned="Owned: "+miners[i].amount+" Total GPS: "+prettyPrint(miners[i].perSecond.gold*gold.perSecondMultiplier);
		document.getElementById(i+"Owned").innerHTML=owned;
		document.getElementById(i+"GPS").innerHTML="GPS: "+prettyPrint(miners[i].basePerSecond.gold*gold.perSecondMultiplier);
		
	
		
	}
}



Prospector.onPurchase=function()
{
	
	if(Prospector.amount==1)
	{
		prospectorBonus=-.1;
		gold.totalAmountAvailable=Infinity;
		gold.amountAvailable=Infinity;
		document.getElementById("ProspectorName").innerHTML="Prospector";
		document.getElementById("ProspectorDesc").innerHTML="You no longer need to Prospect!";
		document.getElementById("ProspectorQuip").innerHTML="Need some help makin' "+skinNames[currentSkin]+"?";
		document.getElementById("ProspectorIcon").src="Assets/Gui/Icons/Autos/iconProspector.png"
		luckyBreak=false; 	
	}
	else if (Prospector.amount>1)
	{
	
		prospectorBonus+=.05;
		prospectorBonus=Math.round(prospectorBonus*100)/100;
		
	}
	purchaseUpdate();

}

function updateProspector()
{
	document.getElementById("ProspectorCost").innerHTML="Cost: "+prettyPrint(Prospector.costs.gold)+inlineIcon;
	if(Prospector.amount>=1)
	{	
		document.getElementById("ProspectorEffect").innerHTML=(prospectorBonus>=0?"+":"-")+Math.abs(prospectorBonus)*100+"% of GPS. (+5% per level)"
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
		alaska.amount=0;
		california.amount=0;
		
		gold.amount=0;
		gold.amountAllTime=0;
		gold.totalAmountAvailable=5000;
		gold.amountAvailable=5000;
		eventIDs.Goal="false";
		eventIDs.Victory="false";
		legacyBonus+=potentialLegacyBonus;
		
		saveGame(60);
		
		ClickyDrive.saveGame();
		
		
		location.reload(); 
		
		// NOTE TO SELF:
		// you need to make sure legacy button unlocked is saved, as well as
}

function updateUnlocked()
{
	if(locked)
	{
		return;
	}
	for( let i in unlockIDs )
	{
		//console.log(isUnlocked(unlockIDs[i]));
		if(!isUnlocked(unlockIDs[i]))
		{
			
			switch(unlockIDs[i])
			{
				
				case unlockIDs.PickUp:
					if(gold.amountAllTime>=upgrades.PickUp.baseCosts.gold||upgrades.PickUp.amount>=1){unlock(unlockIDs[i]);}
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
					if(gold.amountAllTime>=miners.Miner.costs.gold||miners.Miner.amount>=1){unlock(unlockIDs[i]); purchaseUpdate();}
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
	
	
	// nonsense.
	if(document.getElementById(Object.keys(unlockIDs)[unlockID])==null)
	{
		// seems bizare, but whatever
		return true;
	}

	if(!document.getElementById(Object.keys(unlockIDs)[unlockID]).classList.contains('hidden'))
	{
		return true;
	}
	else
	{
		return false;
	}
		
}


function unlock(unlockID)
{
	let element = document.getElementById(Object.keys(unlockIDs)[unlockID]);

	element.classList.remove('hidden');

	setTimeout(() => { element.classList.add('unlocked'); }, 50);
	
}

function unlockAll() // this was a debug method, but 
{	
	
	for( let i in unlockIDs )
	{
		unlock(unlockIDs[i]);
	}
	document.getElementById("legacyButton").classList.remove("hidden");
	
}

function lockdown() // when an error is detected, make sure the user can't interact with anything
{
	for( let i in unlockIDs )
	{
		
		
		document.getElementById(i).classList.add('hidden');
	}
	document.getElementById("legacyButton").classList.add("hidden");
	document.getElementById("settingsButton").classList.add("hidden");
	locked=true;
}

function unlockdown()
{

	locked=false;
	// this is exceptionally shitty code, but I've scewed up here, and clicky is basically done...
	if(upgrades.LazerUp.amount>=14 && upgrades.PickUp.amount >= 14 && upgrades.MinerUp.amount >= 14 && upgrades.DrillUp.amount >= 14 )
	{
		document.getElementById("legacyButton").classList.remove("hidden");
	}
	document.getElementById("settingsButton").classList.remove("hidden");

}


// panel system
let panelIDs =["settings","prospect","prospect2","wipeSave","Goal","Victory","legacy","Welcome","error","ascend","skins","luckyBreak","settings2"];

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
		unlockdown();
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
	if(currentPanel==""||currentPanel=="prospect"||currentPanel=="prospect2"||currentPanel=="legacy")
	{
		if(progression==0)
		{
			openPanel("settings");
		}
		else
		{
			openPanel("settings2");
		}
	}
	else if (currentPanel=="settings"||currentPanel=="settings2")
	{ 
		closeAllPanels();
	}
}

function toggleProspect()
{
	if(currentPanel==""||currentPanel=="settings"||currentPanel=="legacy"||currentPanel=="settings2")
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

function toggleLegacy()
{
	if(currentPanel==""||currentPanel=="prospect"||currentPanel=="prospect2"||currentPanel=="settings"||currentPanel=="settings2")
	{
		openPanel("legacy");
	}
	else if (currentPanel=="legacy")
	{ 
		closeAllPanels();
	}
}






function updateStats()
{
	if( gold.amountAllTime==0)
	{
		ClickyDrive.ui.getChildByID("gold").innerHTML="Mine for "+skinNames[currentSkin]+"!";
		ClickyDrive.ui.getChildByID("gps").innerHTML="What could go wrong?";
	}
	else
	{
		ClickyDrive.ui.getChildByID("gold").innerHTML=skinNames[currentSkin]+": "+prettyPrint(gold.amount);
		ClickyDrive.ui.getChildByID("gps").innerHTML=prettyPrint(gold.perSecond*gold.perSecondMultiplier)+" GPS";
	}
	
	ClickyDrive.ui.getChildByID("listGold").innerHTML=prettyPrint(gold.amount)+inlineIcon;
	ClickyDrive.ui.getChildByID("listAllTime").innerHTML=prettyPrint(gold.amountAllTime)+inlineIcon;
	ClickyDrive.ui.getChildByID("listLegacy").innerHTML=prettyPrint(Math.round(legacyBonus*100))+"%";
	ClickyDrive.ui.getChildByID("listModifier").innerHTML=prettyPrint(Math.round(gold.perSecondMultiplier*100))+"%";
	ClickyDrive.ui.getChildByID("listGPS").innerHTML=prettyPrint(gold.perSecond*gold.perSecondMultiplier)+inlineIcon+"/Sec";
	// bad code, yeah, I know.
	// I'm lazy though, so...
	ClickyDrive.ui.getChildByID("listGold2").innerHTML=prettyPrint(gold.amount)+inlineIcon;
	ClickyDrive.ui.getChildByID("listAllTime2").innerHTML=prettyPrint(gold.amountAllTime)+inlineIcon;
	ClickyDrive.ui.getChildByID("listLegacy2").innerHTML=prettyPrint(Math.round(legacyBonus*100))+"%";
	ClickyDrive.ui.getChildByID("listModifier2").innerHTML=prettyPrint(Math.round(gold.perSecondMultiplier*100))+"%";
	ClickyDrive.ui.getChildByID("listGPS2").innerHTML=prettyPrint(gold.perSecond*gold.perSecondMultiplier)+inlineIcon+"/Sec";
	
	ClickyDrive.ui.getChildByID("reserves").innerHTML=prettyPrint(gold.amountAvailable)+inlineIcon;
	ClickyDrive.ui.getChildByID("reservesBar").style.width=((gold.amountAvailable/gold.totalAmountAvailable)*100)+"%";
	
	if( currentPanel=="prospect"& Prospector.amount>=1)
	{
		openPanel("prospect2");
	}
	
	
	
}

function updateDepleted()
{
	if(locked)
	{
		document.getElementById("depleted").classList.add("hidden");
		return;
	}

	if( gold.amountAvailable==0 )
	{
		document.getElementById("depletedText").innerHTML="Depleted!";
		document.getElementById("depleted").classList.remove("hidden");
		
		if(gold.clicks>=11)
		{
			gold.clicks=0;
			
		}

		if(gold.amount<alaska.costs.gold)
		{
			triggerEvent("luckyBreak"); // this is a hint, not the full thing.
		}
		
		if( gold.clicks>=10 && !luckyBreak && gold.amount<alaska.costs.gold )
		{
			luckyBreak=true;
			document.getElementById("depletedText").innerHTML="Lucky Break!";
			gold.add(1000.4-gold.amount);
		}
	}
	else
	{
		if((!luckyBreak))
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
	  if( keyboard)
	  {
		gold.mine(800,450);
	  }
  }
})
