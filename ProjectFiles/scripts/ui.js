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
		
		Game.waterCan = !Game.waterCan;
		Game.tendSoil = false;
		
		document.getElementById('water-btn').className = 'button' +
			((Game.waterCan)? ' down': '');
		document.getElementById('tender-btn').className = '';
	},
	
	toggleTend: function() {
		if(this.menuOpen) {
			this.disableWaterTend();
			return;
		}
		
		Game.tendSoil = !Game.tendSoil;
		Game.waterCan = false;
		
		document.getElementById('tender-btn').className = 'button' +
			((Game.tendSoil)? ' down': '');
		document.getElementById('water-btn').className = '';
	},
	
	disableWaterTend: function() {
		Game.waterCan = false;
		Game.tendSoil = false;
		
		document.getElementById('water-btn').className = '';
		document.getElementById('tender-btn').className = '';
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
