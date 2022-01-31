"use strict";
// utils
function getRndInteger( min, max ) {  return Math.floor( Math.random( ) * ( max - min ) ) + min;  }
function prettyPrint(num) // format a large number nicely
{
	if (isNaN(num)|| num==Infinity || num==undefined)
	{
		return "ERROR";
	}
	
	let toPrint = Math.floor(num);
	if(toPrint < 1000)
	{
		return toPrint.toString(); // just toss back the number
	}
	
	if(toPrint < 10000)
	{
		let string = toPrint.toString();
		return string.charAt(0)+","+string.substring(1,4); // add a comma.
	}
	
	if(toPrint < 1000000 ) // 1 mil
	{
		return (toPrint/1000.0).toFixed(2)+"K"; // k, like, 33.36K = 33,3600
	}
	
	if(toPrint < 1000000000) // 1 billion
	{
		return (toPrint/1000000.0).toFixed(2)+"M";
	}
	
	if(toPrint < 1000000000000) // 1 trillion
	{
		return (toPrint/1000000000.0).toFixed(2)+"B";
	}
	if(toPrint < 1000000000000000) // 1 quadrillion
	{
		return (toPrint/1000000000000.0).toFixed(2)+"T";
	}
	
	return (toPrint/1000000000000000.0).toFixed(2)+"Qa";
	
}

var ClickyDrive =
{

	game:undefined,
    versionString:"Clicky Drive v0.2.1 .381 ",
	versionID:"Alpha_7",
	gameID:undefined,
	versionAppend:"",
	versionWatermark:undefined,
	WatermarkX:0, // in 'pixels'
	WatermarkY:0,
	WatermarkStyle:{ fontFamily: '"Arial"', fontSize:'20pt', color:'white', strokeThickness:.5 },
    aspectRatio:16/9,
	save:window.localStorage,
	lastUpdated:Date.now(), // when the game was last updated.
	tickCounter:0,
	tickCounterLimit:60*60*10, // 10 minutes at 60 tps.
	inactiveLimit:30*60, // 30 minutes of inactive production.
	inactiveMultiplier:.33, //1/3 production while inactive
	
	background:undefined,
	ui:undefined,

	fragments:[],

	resources:
	{
		//user defined
	},
	
	nodes:
	{
		// user defined.
	},
	
	items:
	{
		//user defined.
	},
	
	hookins:
	{
		update:function(tickCounter){},
		create:function(){},
		preload:function(){}
	},
	
	
	
	
	// saves the game to save
	saveGame: function()
	{
		// load the amount and amountleft of all resources.
		if ( ClickyDrive.gameID == undefined)
		{
			return false;
		}
		
		for  ( let i in ClickyDrive.resources)
		{	
		
			// get the amount.
			ClickyDrive.save.setItem( ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amount", Math.round(ClickyDrive.resources[i].amount) );
			ClickyDrive.save.setItem( ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amountAllTime", Math.round(ClickyDrive.resources[i].amountAllTime) );
			//get the amount availiable and left.
		    ClickyDrive.save.setItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amountAvailable", 	Math.round(ClickyDrive.resources[i].amountAvailable) );
			
			ClickyDrive.save.setItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".totalAmountAvailable", Math.round(ClickyDrive.resources[i].totalAmountAvailable) );
			
			ClickyDrive.save.setItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".clicks", Math.round(ClickyDrive.resources[i].clicks) );
			
			
		}
		
		// and items.
		for ( let i in ClickyDrive.items)
		{
			
			ClickyDrive.save.setItem(ClickyDrive.gameID+".items."+ClickyDrive.items[i].name+".amount", ClickyDrive.items[i].amount );
		}
		return true;
		
	},
	
	
	newSave: function()
	{
		ClickyDrive.save.clear();
		ClickyDrive.save.setItem("Version", ClickyDrive.versionID);
		ClickyDrive.save.setItem("gameVersion", ClickyDrive.gameID);
	},
	
	loadGame: function()
	{
		// to insure there is no accidental windfall.
		ClickyDrive.lastUpdated = Date.now();
				
		// check for correct engine version.
		if(ClickyDrive.save.getItem('Version')==ClickyDrive.versionID)
		{
			// make sure this is the correct version of the game as well.
			if(ClickyDrive.gameID!=undefined & ClickyDrive.save.getItem('gameVersion')==ClickyDrive.gameID)
			{
				
				
				
				// load the amount and amountleft of all resources.
				for  ( let i in ClickyDrive.resources)
				{	
		
					// get the amount.
					ClickyDrive.resources[i].amount = parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amount"));
					ClickyDrive.resources[i].amountAllTime = parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amountAllTime"));
					
					//get the amount availiable and left.
					ClickyDrive.resources[i].amountAvailable=parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".amountAvailable"));
					
					ClickyDrive.resources[i].totalAmountAvailable=parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".totalAmountAvailable"));
					
					ClickyDrive.resources[i].clicks=parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".resources."+ClickyDrive.resources[i].name+".clicks"));
					
					
				}
				
				// and items.
				for ( let i in ClickyDrive.items)
				{
					let goal =parseInt(ClickyDrive.save.getItem(ClickyDrive.gameID+".items."+ClickyDrive.items[i].name+".amount"));
					if(!ClickyDrive.items[i].isOneTime )
					{
						for( ; ClickyDrive.items[i].amount<goal;)
						{
							ClickyDrive.items[i].amount++;
							ClickyDrive.items[i].onPurchase();
						}
					}
					else
					{
						ClickyDrive.items[i].amount=goal;
					}
				}
				
				return true;
			}
			else
			{
				ClickyDrive.newSave();
				return false;
			}
			
		}
		else
		{
			ClickyDrive.newSave();
			return false;
		}
		
	},
	
	preload: function()
	{ 
		
		if(ClickyDrive.background!=undefined)
		{
			this.load.image('bg',ClickyDrive.background ); 
		}
		
		if(ClickyDrive.ui!=undefined)
		{
			this.load.html('ui', ClickyDrive.ui);
		}
		
		
		for(let i in ClickyDrive.nodes )
		{
			for( let j in ClickyDrive.nodes[i].textures)
			{
				this.load.image( ClickyDrive.nodes[i].name+''+j, ClickyDrive.nodes[i].textures[j] ); 
				
			}
			
			if(ClickyDrive.nodes[i].fragment!=undefined)
			{
				this.load.image( ClickyDrive.nodes[i].fragment, ClickyDrive.nodes[i].fragment); 
			}
			
			if(ClickyDrive.nodes[i].depletedFragment!=undefined)
			{
				this.load.image( ClickyDrive.nodes[i].depletedFragment, ClickyDrive.nodes[i].depletedFragment);
			}
			
			if(ClickyDrive.nodes[i].glow.texture!=undefined)
			{
				// so for future reference, just use the texture's path for name, who cares.
				this.load.image( ClickyDrive.nodes[i].glow.texture,  ClickyDrive.nodes[i].glow.texture);
			}
			
		}
		ClickyDrive.hookins.preload();
		
	},
		

	create:function()
	{
		// this needs to be cleaned up!
		
		//background
		if(ClickyDrive.background!=undefined)
		{
			ClickyDrive.background = this.add.image(800,450, 'bg'); // must be in 16:9 aspect ratio.
			
			if (ClickyDrive.aspectRatio != ClickyDrive.background.width/ClickyDrive.background.height)
			{
			   throw "Background Aspect Ratio MUST be " + ClickyDive.aspectRatio +" width/height!"
			}
			// resize the background.
			ClickyDrive.background.setScale(config.scale.height/ClickyDrive.background.height);
		}
		
		
		
		// add in a dom
		if(ClickyDrive.ui!=undefined)
		{
						 
			ClickyDrive.ui=this.add.dom(0,0).createFromHTML(this.cache.html.get('ui'));
		}
		
		// Watermark things properly.
		ClickyDrive.versionWatermark = this.add.text(ClickyDrive.WatermarkX, ClickyDrive.WatermarkY, ClickyDrive.versionString+ClickyDrive.versionAppend, ClickyDrive.WatermarkStyle);
    	ClickyDrive.versionWatermark.originX=-.5; // make it easier to deal with
		ClickyDrive.versionWatermark.originY=-.5;
		
		
		// go through all nodes, and create them!
		for(let i in ClickyDrive.nodes )
		{
			
			// add glows for the nodes, first, because they are behind.
			if(ClickyDrive.nodes[i].glow.texture !=undefined)
			{
				ClickyDrive.nodes[i].glow.texture = this.add.image(ClickyDrive.nodes[i].location[0] ,ClickyDrive.nodes[i].location[1], ClickyDrive.nodes[i].glow.texture);
				ClickyDrive.nodes[i].glow.texture.setScale(ClickyDrive.nodes[i].glow.scale);
			}
			
			ClickyDrive.nodes[i].currentTexture = this.add.image(ClickyDrive.nodes[i].location[0] ,ClickyDrive.nodes[i].location[1], ClickyDrive.nodes[i].name+'0').setInteractive();
			// and set its scale.
			ClickyDrive.nodes[i].currentTexture.setScale(ClickyDrive.nodes[i].size/ClickyDrive.nodes[i].currentTexture.height);
			ClickyDrive.nodes[i].currentTexture.inputEnabled = true;
			ClickyDrive.nodes[i].currentTexture.setTint(0xfafafa);
			//set input things, animation, etc.
			
			// set stuff, animations in particular.

    		ClickyDrive.nodes[i].currentTexture.on('pointerdown', function (pointer)
			{
				this.setTint(0xdddddd);
				ClickyDrive.nodes[i].scale=1;
				ClickyDrive.resources[ClickyDrive.nodes[i].name].mine(pointer.x,pointer.y); // simple, right?
			});

			ClickyDrive.nodes[i].currentTexture.on('pointerout', function (pointer)
			{
				this.setTint(0xfafafa);
				ClickyDrive.nodes[i].hovered=false;
			});

			ClickyDrive.nodes[i].currentTexture.on('pointerup', function (pointer)
			{
				this.setTint(0xffffff);
				ClickyDrive.nodes[i].hovered=true;
			});

			ClickyDrive.nodes[i].currentTexture.on('pointerover', function (pointer)
			{
				this.setTint(0xffffff);
				ClickyDrive.nodes[i].hovered=true;
			});
			
			

		}
		
		
		
		// Attempt to load the save.
		ClickyDrive.loadGame()
		
		
		// if it cannot be loaded it will be worried about later.
		// never, actually.
		ClickyDrive.hookins.create();


	},
	
	
	
	
	
	
	update:function()
	{
		// update tick counter, this is for things that repeat every tick.
		ClickyDrive.tickCounter+=1;
		
		// these will only be signifigantly different when the game is out of focus.
		let now = (Date.now()/1000);
		let before = (ClickyDrive.lastUpdated/1000);
		
		// Getting resources per second. Simple!
		for  ( let i in ClickyDrive.resources)
		{	
	
			// Determine perSecond and add it.
			ClickyDrive.resources[i].update();
			if(!(ClickyDrive.resources[i].perSecondMultiplier===undefined))
			{
				
				ClickyDrive.resources[i].make((ClickyDrive.resources[i].perSecond*ClickyDrive.resources[i].perSecondMultiplier)/60);
			}
			
	
			
			// and make some cash money from inactivity, if needbe.
			if(now-before>=1)
			{
				if(now-before<=ClickyDrive.inactiveLimit)
				{
					ClickyDrive.resources[i].make(ClickyDrive.resources[i].perSecond*ClickyDrive.resources[i].perSecondMultiplier*Math.round(now-before)*ClickyDrive.inactiveMultiplier);
				}
				else
				{
					ClickyDrive.resources[i].make(ClickyDrive.resources[i].perSecond*ClickyDrive.resources[i].perSecondMultiplier*ClickyDrive.inactiveLimit*ClickyDrive.inactiveMultiplier);
				}
			}
	
		}

		
		
		
		
		
		// Making nodes do some animation
		// this feels like bad code, but I don't know what to do about it.
		for(let i in ClickyDrive.nodes )
		{	
	
			// figure out node depletion
			ClickyDrive.nodes[i].determineDepletionState();
			ClickyDrive.nodes[i].animate();
	
			
					
		}
		 
		for (let i in ClickyDrive.items)
		{
				ClickyDrive.items[i].update();
				ClickyDrive.items[i].onUpdate();
		}
		
		for(let i in ClickyDrive.fragments)
		{
			if(ClickyDrive.fragments[i].animate!=undefined)
			{
				ClickyDrive.fragments[i].animate();
			}
		}
		
		
		
		// save the game, once a second.
		if(ClickyDrive.tickCounter%60 == 0)
		{
			ClickyDrive.saveGame();
		}
		
		ClickyDrive.hookins.update(ClickyDrive.tickCounter);
			 



		// If the tick counter exceeds its limit, return it to 0.
		if(ClickyDrive.tickCounter>=ClickyDrive.tickCounterLimit)
		{
			ClickyDrive.tickCounter = 0;
		}
			
		// update now.
		ClickyDrive.lastUpdated=Date.now();	
		
	},
	
	
	
	
	
	
	
	// constructor
	resource:function( name, left, enabled)
	{
		this.name = name;
		
		this.totalAmountAvailable=left;
		this.amountAvailable=left;
		ClickyDrive.resources[name]=this;
		this.enabled=enabled;
		this.amount=0;
		this.amountAllTime=0;
		this.perSecond=0;
		this.perSecondMultipler=1;
		this.perClick=1;
		this.clicks=0;
		
		// adds to availaible, not to current count.
		this.add=function(toAdd)
		{
			this.amountAvailable+=toAdd;
			
			this.totalAmountAvailable=this.amountAvailable;
		},

		this.mine = function(x,y)
		{
			if( !this.enabled)
			{
				return;
			}
			
			this.clicks++;
			
			// mining is just clicking a node to get a resource.
			let mined= this.make(this.perClick)
			
			for(let i = 0; i<Math.floor(Math.log(this.perClick) / Math.log(10))+1; i++)
			{
				if(mined)
				{
					//and also making a fragment.
					ClickyDrive.fragments.push(new ClickyDrive.fragment(ClickyDrive.nodes[this.name].fragment, x,y, ClickyDrive.nodes[this.name].fragmentScale));
					
				}
				
				if(mined==false)
				{
				
					ClickyDrive.fragments.push(new ClickyDrive.fragment(ClickyDrive.nodes[this.name].depletedFragment, x,y, ClickyDrive.nodes[this.name].fragmentScale));
				}
			}
			
		},
		
		// get x amount of the resource
		this.make = function(toAdd)
		{
			
			if(!this.enabled)
			{
				
				ClickyDrive.nodes[this.name].currentTexture.setTint(0xdddddd);
				
			}
			
			
			if(this.amountAvailable===0)
			{ 
				
				//ClickyDrive.nodes[this.name].currentTexture.setTint(0xdddddd);
				return false; // nothing left, just leave.
				
			}

			// we can get everything?
			if( toAdd <= this.amountAvailable)
			{
				this.amount+= toAdd; // take all that's due
				this.amountAllTime+=toAdd;
				this.amountAvailable-=toAdd // and remove it from the stache.
			}
			else
			{
				// exaust whatever is remaining.
				this.amount+=this.amountAvailable;
				this.amountAllTime+=this.amountAvailable;
				this.amountAvailable=0;	
				// if a resource is disabled.
				
				ClickyDrive.nodes[this.name].currentTexture.setTint(0xdddddd);
			}
			
			return true;
			
		},
		
		this.update = function()
		{
			// calculate per second.
			
			this.perSecond=0;
			for(let i in ClickyDrive.items)
			{
			
				for(let j in ClickyDrive.items[i].perSecond)
				{
					if(j==this.name)
					{
						this.perSecond+=ClickyDrive.items[i].perSecond[j];
					}
				}
			}
			
			
			// per second Claculated, add to this.
			
			
		}
	},
	
	
	
	
	
	
	node:function(name, locationX, locationY, textures)
	{

		this.name = name;
		this.hovered=false;
		this.location = [locationX,locationY];
		this.size = 300; // might just never change...
		this.scale=1; // ranges between 1 and 1.1.
		this.scaleLimits=[1,1.1];
		this.scaleSpeed=.02;
		this.textures=textures;
	
		this.fragmentScale=undefined;
		this.fragment=undefined;
		this.depletedFragment=undefined;
		
		ClickyDrive.nodes[name]=this;
		this.glow =
		{
			resource:name,
			texture:undefined,
			scale:1,
			rotationSpeed:1,
			animate:function()
			{
						
				if(this.texture!= undefined)
				{
					this.texture.angle+=this.rotationSpeed;
				
				
					if(ClickyDrive.resources[this.resource].amountAvailable!=0)
					{
						this.texture.setScale(this.scale);
					}
					else
					{
						this.texture.setScale(0);
					}
				}
				
			}
		}
		
		
		this.determineDepletionState = function()
		{
			if(ClickyDrive.resources[this.name].amountAvailable===Infinity)
			{
					ClickyDrive.nodes[this.name].currentTexture.setTexture(this.name+''+0);
					return;
			}
			
			if(ClickyDrive.resources[this.name].amountAvailable===0)
			{
				// this line of code is so long that it's a sin of some kind.
				this.currentTexture.setTexture(this.name+''+(this.textures.length-1));
			
			}
			else
			{
				
				// We need to descover the threshold size, this will determine how much to deplete. 
				// this code ought to be considered arcane
				let thresholdSize = ClickyDrive.resources[this.name].totalAmountAvailable/(this.textures.length-1);
				
				for(let i =0; i<this.textures.length; i++)
				{
					
					// check if it is higher than threshold, then set it
					if(ClickyDrive.resources[this.name].amountAvailable <= (this.textures.length-1-i)*thresholdSize)
					{
					
						ClickyDrive.nodes[this.name].currentTexture.setTexture(this.name+''+(i));
					
					}
					else
					{
						break;
					}
					
				}
				
			}
			
			
			
		},
		
		
		// Controls things like hovering effecs.
		this.animate = function()
		{
			let i = this.name;
			if( !ClickyDrive.resources[i].enabled )
			{
				this.scale=this.scaleLimits[0];
				
			}
			else
			{
				// make node larger, if needbe.
				if( this.hovered && this.scale < this.scaleLimits[1])
				{
					this.scale+=this.scaleSpeed;
					
				}
				if( !this.hovered && this.scale > this.scaleLimits[0])
				{
					this.scale-=this.scaleSpeed;
					
				}
			}
			this.currentTexture.setScale((this.size/this.currentTexture.height)*this.scale);
			// animate glow.
			this.glow.animate();
			
		}
	},
	
	
	
	fragment:function( fragment, positionX, positionY, scale)
	{
		if(fragment===undefined|| fragment===null)
		{
			return;
		}
		this.texture=ClickyDrive.game.scene.getAt(0).add.image(positionX,positionY,fragment);

		this.texture.setScale(scale);
		this.texture.angle = getRndInteger(-180,180);
		this.velX=getRndInteger(-12,12);
		this.velY=getRndInteger(-2,-15);
		this.velAngle=this.velX;
		this.animate = function()
		{
			let gravity = 2;
			this.texture.x+=this.velX;
			this.texture.y+=this.velY;
			this.texture.angle+=this.velAngle;
			this.velY+=gravity;
			
		}
		
		
	},
	
	item:function(name, baseCosts, costExponent, basePerSecond)
	{
		this.name = name;
		ClickyDrive.items[name]=this;
		this.maxAmount=Infinity;
		this.baseCosts=baseCosts; // formatted like  {gold:20,crab:10}
		this.costExponent=costExponent;
		this.basePerSecond=basePerSecond; // formatted like costs
		this.perSecondMultiplier = 1;
		this.isOneTime=false; // wheather the upgrade is 
		
		this.amount=0;
		this.costs= {};
		this.perSecond= {};
		
		

		this.update=function()
		{
			
			for( let i in this.basePerSecond)
			{	
				
				this.perSecond[i] = this.basePerSecond[i]*this.amount*this.perSecondMultiplier;
				
			}
			
			for( let i in this.baseCosts)
			{
				
				this.costs[i]=Math.floor((this.costExponent**this.amount)*this.baseCosts[i]);
				
				
			}
			
			
			
		}
		
		this.onUpdate=function() //  can be user defined.
		{
			
		} 
		
		this.purchase=function()
		{
			if(this.amount===this.maxAmount)
			{
				this.graphicOnPurchaseFail();
				return false;
			}
			
			for(let i in this.costs)
			{
				
				if(ClickyDrive.resources[i].amount < this.costs[i] )
				{
					this.graphicOnPurchaseFail();
					return false;
				}
			}
			
			for(let i in this.costs)
			{
				
				ClickyDrive.resources[i].amount -=this.costs[i];
				
			}
			
			
			this.add();
			this.graphicOnPurchase();
			return true;
		}
		
		this.add = function()
		{
			this.amount++;
			this.update();
			this.onPurchase();
		}
		
		this.onPurchase=function(){}; // user defined.
		
		// graphics related.
		this.graphicOnPurchase= function(){};
		this.graphicOnPurchaseFail=function(){}; // user defined
		
	}
}



// config is last because the functions are defined in an object
let config =
{
   type: Phaser.AUTO,
   autoCenter: true,
   dom:{createContainer: true},
   parent: 'phaser-parent',
   scale: 
   {
  	// this would have taken a lot of work to get working, but phaser did it for me!
	// How kind.
	// not like I already did most of that work.
	// nope.
   	mode: Phaser.Scale.FIT,
	parent: 'phaser-parent',
   	width: 1600,
   	height: 900,
   },
	
   scene: 
   {
		preload: ClickyDrive.preload,
        create: ClickyDrive.create,
        update: ClickyDrive.update
   }
	
	
}