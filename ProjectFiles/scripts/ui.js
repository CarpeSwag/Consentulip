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
		if(this.menuOpen) {
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
		if(this.menuOpen) {
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
		// Add a mesh outline
		if(!Game.tendSoil)
			Game.addOutlineMesh(Flower.pot);
		
		Game.tendSoil = true;
		document.getElementById('tender-btn').className = 'button down';
	},
	
	disableTend: function() {
		// Remove the mesh outline
		if (Game.tendSoil)
			Game.removeOutlineMesh(Flower.pot);
		
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
	}
};
