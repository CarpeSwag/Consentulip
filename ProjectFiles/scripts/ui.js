var UI = {
	// Pointer related
	isPointerDown: false,

	// Visual elements
	menuOpen: false,
	sandwichOpen: true,
	
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
		UI.sandwichOpen = !UI.sandwichOpen;
		
		// Toggle the elements
		document.getElementById('sandwich-btn').className = 'button' +
			((UI.sandwichOpen)? ' down': '');
		document.getElementById('sandwich-container').className = 
			((UI.sandwichOpen)? 'active': '');
	},
	
	toggleWater: function() {
		if(UI.menuOpen || Game.enableGestures) {
			UI.disableWaterTend();
			return;
		}
		
		if (Game.waterCan) {
			UI.disableWater();
		} else {
			UI.enableWater();
		}
		
		UI.disableTend();
	},
	
	toggleTend: function() {
		if(UI.menuOpen || Game.enableGestures) {
			UI.disableWaterTend();
			return;
		}
		
		if (Game.tendSoil) {
			UI.disableTend();
		} else {
			UI.enableTend();
		}
		
		UI.disableWater();
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
		UI.disableWater();
		UI.disableTend();
	},
	
	toggleMenu: function() {
		// Toggle the flag
		UI.menuOpen = !UI.menuOpen;
		
		// Disable watering can and soil tending
		UI.disableWaterTend();
		
		// Toggle the elements
		document.getElementById('settings-btn').className = 'button' +
			((UI.menuOpen)? ' down': '');
		document.getElementById('ingame-menu-container').className =
			((UI.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((UI.menuOpen)? 'menuActive': '');
		
		if (UI.menuOpen) {
			UI.switchMenu('ingame-menu');
		} else {
			UI.hideMenus();
		}
	},
	
	closeMenu: function() {
		UI.menuOpen = false;
		UI.hideMenus();
		
		// Toggle the elements
		document.getElementById('settings-btn').className = 'button' +
			((UI.menuOpen)? ' down': '');
		document.getElementById('ingame-menu-container').className =
			((UI.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((UI.menuOpen)? 'menuActive': '');
	},
	
	hideMenus: function() {
		document.getElementById('ingame-menu').className = 'menu-ctnr';
		document.getElementById('about-menu').className = 'menu-ctnr';
		document.getElementById('settings-menu').className = 'menu-ctnr';
		document.getElementById('credits-menu').className = 'menu-ctnr';
		document.getElementById('tutorial-prompt').className = 'menu-ctnr';
	},
	
	switchMenu: function(id) {
		UI.hideMenus();
		document.getElementById(id).className = 'menu-ctnr curr-menu';
	},
	
	returnToMenu: function() {
		UI.switchMenu('ingame-menu');
	},
	
	aboutMenu: function() {
		UI.switchMenu('about-menu');
	},
	
	settingsMenu: function() {
		UI.switchMenu('settings-menu');
	},
	
	creditsMenu: function() {
		UI.switchMenu('credits-menu');
	},
	
	// Trust bar
	adjustTrustBar: function(change) {
		Game.trust += change;
		Game.trust = (Game.trust < 0)? 0: ((Game.trust > 100)?
			100: Game.trust);
		document.getElementById('trust-bar-inner').style.width =
			Game.trust + '%';
		
		UI.adjustTrustBarColor();
		
		UI.adjustMusic();
		
		Flower.adjustAnimation();
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
	},
	
	adjustMusic: function(old) {
		var sad = 0;
		var neu = 0;
		var hap = 0;
		if (Game.trust < 40) {
			sad = 1;
		} else if (Game.trust < 70) {
			neu = 1;
		} else {
			hap = 1;
		}
		Game.volumeTargets = [sad, neu, hap];
	},
	
	menuBtn: function(func) {
		var rand = Math.floor(Math.random() * Game.soundBtn.length);
		Game.soundBtn[rand].play();
		func();
	}
};
