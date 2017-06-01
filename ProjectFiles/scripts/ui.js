var UI = {
	// Pointer related
	isPointerDown: false,

	// Visual elements
	menuOpen: false,
	sandwichOpen: false,
	
	filterButtonHue: function(degrees) {
		var filter = 'hue-rotate(' + degrees + 'deg)';
		document.getElementById('sandwich-btn').style.filter
			= filter;
		document.getElementById('settings-btn').style.filter
			= filter;
		document.getElementById('revoke-btn').style.filter
			= filter;
	},
	
	toggleRevokeConsent: function(toggle) {
		document.getElementById('revoke-btn').className = 
			'button' + ((toggle)? ' active': '');
	},
	
	toggleSandwich: function() {
		// Toggle the flag
		this.sandwichOpen = !this.sandwichOpen;
		
		// Toggle the elements
		document.getElementById('sandwich-btn').className = 'button' +
			((this.sandwichOpen)? ' down': '');
		document.getElementById('sandwich-container').className = 
			((this.sandwichOpen)? 'active': '');
	},
	
	toggleWater: function() {
		if(this.menuOpen || Game.enableGestures) {
			this.disableWaterTend();
			return;
		}
		
		if (Game.waterCan) {
			this.disableWater();
		} else {
			this.enableWater();
		}
		
		this.disableTend();
	},
	
	toggleTend: function() {
		if(this.menuOpen || Game.enableGestures) {
			this.disableWaterTend();
			return;
		}
		
		if (Game.tendSoil) {
			this.disableTend();
		} else {
			this.enableTend();
		}
		
		this.disableWater();
	},
	
	enableWater: function() {
		if (Game.enableGestures) return;
		// Add a mesh outline
		if (!Game.waterCan) {
			for (var i = 0; i < Flower.interactable.length; ++i) {
				Game.addOutlineMesh(Flower.interactable[i]);
			}
		}
		
		Game.waterCan = true;
		document.getElementById('water-btn').className = 'button down';
	},
	
	disableWater: function() {
		// Remove the mesh outline
		if (Game.waterCan) {
			for (var i = 0; i < Flower.interactable.length; ++i) {
				Game.removeOutlineMesh(Flower.interactable[i]);
			}
		}
		
		Game.waterCan = false;
		document.getElementById('water-btn').className = 'button';
	},
	
	enableTend: function() {
		if (Game.enableGestures) return;
		
		// Add a mesh outline
		if(!Game.tendSoil) {
			for (var i = 0; i < Flower.pot.length; ++i) {
				Game.addOutlineMesh(Flower.pot[i]);
			}
		}
		
		Game.tendSoil = true;
		document.getElementById('tender-btn').className = 'button down';
	},
	
	disableTend: function() {
		// Remove the mesh outline
		if (Game.tendSoil) {
			for (var i = 0; i < Flower.pot.length; ++i) {
				Game.removeOutlineMesh(Flower.pot[i]);
			}
		}
		
		Game.tendSoil = false;
		document.getElementById('tender-btn').className = 'button';
	},
	
	disableWaterTend: function() {
		this.disableWater();
		this.disableTend();
	},
	
	toggleMenu: function() {
		// Toggle the flag
		this.menuOpen = !this.menuOpen;
		
		// Disable watering can and soil tending
		this.disableWaterTend();
		
		// Toggle the elements
		document.getElementById('settings-btn').className = 'button' +
			((this.menuOpen)? ' down': '');
		document.getElementById('ingame-menu-container').className =
			((this.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((this.menuOpen)? 'menuActive': '');
		
		if (this.menuOpen) {
			this.switchMenu('ingame-menu');
		} else {
			this.hideMenus();
		}
	},
	
	closeMenu: function() {
		this.menuOpen = false;
		this.hideMenus();
		
		// Toggle the elements
		document.getElementById('settings-btn').className = 'button' +
			((this.menuOpen)? ' down': '');
		document.getElementById('ingame-menu-container').className =
			((this.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((this.menuOpen)? 'menuActive': '');
	},
	
	hideMenus: function() {
		document.getElementById('ingame-menu').className = 'menu-ctnr';
		document.getElementById('about-menu').className = 'menu-ctnr';
		document.getElementById('settings-menu').className = 'menu-ctnr';
		document.getElementById('credits-menu').className = 'menu-ctnr';
		document.getElementById('tutorial-prompt').className = 'menu-ctnr';
	},
	
	switchMenu: function(id) {
		this.hideMenus();
		document.getElementById(id).className = 'menu-ctnr curr-menu';
	},
	
	returnToMenu: function() {
		this.switchMenu('ingame-menu');
	},
	
	aboutMenu: function() {
		this.switchMenu('about-menu');
	},
	
	settingsMenu: function() {
		this.switchMenu('settings-menu');
	},
	
	creditsMenu: function() {
		this.switchMenu('credits-menu');
	},
	
	// Trust bar
	adjustTrustBar: function(change) {
		Game.trust += change;
		Game.trust = (Game.trust < 0)? 0: ((Game.trust > 100)?
			100: Game.trust);
		document.getElementById('trust-bar-inner').style.width =
			Game.trust + '%';
		
		this.adjustTrustBarColor();
			
		/*Flower.adjustStandPose();
		Flower.decideOnPlayingAnimation();*/
	},
	
	adjustTrustBarColor: function() {
		var percent = Game.trust;
		var a = [200,0,0];
		var b = [200,200,0];
		var c = [0,0,0];
		if (percent > 50) {
			percent -= 50;
			a[1] = 200;
			b[0] = 0;
		}
		
		// Put it on a scale from 0-1
		percent = (percent * 2) / 100;
		for (var i = 0; i < 3; ++i) {
			c[i] = Math.round(a[i] - ((a[i] - b[i]) * percent));
		}
		var rgb = c[0] + ',' + c[1] + ',' + c[2];
		var ele = document.getElementById('trust-bar-inner-color');
		ele.style.background = 'rgba(' + rgb + ',0.5)';
	}
};
