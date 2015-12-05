/* global require, $ */
'use strict';

window.jQuery = window.$ = require('jquery');
$.velocity = require('velocity-animate');
var _ = require('lodash');
var scrollReveal = require('scrollreveal');
var obstacleJson = require('./json/obstacle');
var game = new Phaser.Game(600, 945, Phaser.AUTO, 'legi-game');

window.Utils = require('./utils');
window.playerState = {
	currentLevel: 'Game',
	missedObstacles: 0
};

game.state.add('Boot', require('./states/boot'));
game.state.add('Splash', require('./states/splash'));
game.state.add('Preloader', require('./states/preloader'));
game.state.add('Menu', require('./states/menu'));
game.state.add('Game', require('./states/game'));

game.state.start('Boot');

window.gameover = function (id) {
	$('#game-over').show();
	var path = 'assets/gameover/';
	if(id === 0) {
		$('#death-pic').empty().addClass('win');
		$('#gameover-pic').attr('src', 'assets/win/title.png');
		(function hit (n) {
			if(n > 0) {
				$('#death-pic').toggleClass('hit');
				if(n % 2 === 1) {
					setTimeout(function() {
						hit(--n);
					}, 1000);
				} else {
					setTimeout(function() {
						hit(--n);
					}, 500);
				}
			}
		})(6);
	} else {
		$('#gameover-pic').attr('src', path + 'gameover.png');
		$('#gameover-title').attr('src', path + 'text-' + id + '.png');
		var deathPic = new Image();
		deathPic.src = path + 'death-' + id + '.png';
		$('#death-pic').removeClass('win').empty().append(deathPic);
	}

	var setOverview = function() {
		var path = 'assets/overview/';
		_.forEach(obstacleJson, function(ele) {
			var death = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s').addClass('margin-medium');
			var icon = new Image();
			icon.src = path + 'death-0' + ele.id + '.png';
			var name = $('<p>').addClass('name').text(ele.name);
			death.append(icon).append(name);
			$('#overview [data-stage=' + ele.stage + '] .death').append(death);
		});
	};
	
	var setInfoContent = function() {
		if(id !== 0) {
			for (var i = 1; i <= 2; i++) {
				var div = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s').addClass('margin-large');
				var law = new Image();
				law.src = path + 'law-' + id + '-' + i + '.png';
				var text = $('<p>').text(obstacleJson[id - 1].law[i - 1]);
				div.append(law).append(text);
				$('#law').append(div);
			}
		}
	};

	var showGameoverButton = function() {
		$('#game-over .btn').velocity({
			top: '+=20px'
		}).velocity({
			top: '-=20px',
			opacity: 1
		}, {
			duration: 1000
		});
	};

	var showGameoverDesc = function() {
		var subtitle, desc;
		if(id === 0) {
			subtitle = '「凡殺不死你的，必使你更強大」';
			desc = '台灣的未來\n就靠你繼續監督立法院啦～';
		} else {
			subtitle = obstacleJson[id - 1].subtitle;
			desc = obstacleJson[id - 1].desc;
		}
		
		$('#gameover-subtitle').html('<p>' + subtitle).velocity({
			opacity: 1
		}, {
			duration: 1000
		});
		$('#gameover-desc').html('<p>' + desc).velocity({opacity: 1}, {
			duration: 1000,
			delay: 800
		});
		$('#game-missed').velocity({opacity: 1}, {
			duration: 1000,
			delay: 1600,
			complete: function() {
				showGameoverButton();
				$('#info').show();
				window.sr = new scrollReveal();
			}
		}).find('[data-missed]').text(playerState.missedObstacles);
	};

	var showGameoverTitle = function() {
		$('#game-over .static-container').css({opacity: 1});
		if(id !== 0) {
			$.velocity.hook($('#gameover-title'), 'translateX', '-50%');
			$('#gameover-title').velocity({
				opacity: 1
			}, {
				duration: 1000
			});
		}

		$.velocity.hook($('#gameover-pic'), 'translateX', '-50%');
		$('#gameover-pic').velocity({
			opacity: 1
		}, {
			duration: 1000,
			complete: function() {
				showGameoverDesc();
			}
		});
	};

	$('#gameover-bg').velocity({
		opacity: 1
	}, {
		duration: 1500,
		complete: function() {
			showGameoverTitle();
			setInfoContent();
			setOverview();
			$('#legi-game').css({opacity: 0});
		}
	});

	$.velocity.hook($('#death-pic'), 'translateX', '-50%');
	$('#death-pic').velocity({
		opacity: 1
	}, {
		duration: 1000
	});
};

window.setGameoverDiv = function(scale) {
	// adjust gamover info based on current game scale
	var setting = {
		transform: 'translateX(-50%) scale(' + scale.x + ', ' + scale.y + ')'
	};
	$('#game-over').css(setting);
	$('#info').css(setting);
};

$('#game-over .btn-again').click(function() {
	// restart game
	$('#legi-game').css({opacity: 1});
	game.paused = false;
	game.state.start(playerState.currentLevel);
	$('#game-over').hide().children().each(function() {
		$(this).css({opacity: 0});
	});
	$('#game-over .static-container').children().each(function() {
		$(this).css({opacity: 0});
	});
	$('#info').hide();
	$('#law').empty();
	// reset counter
	playerState.missedObstacles = 0;
});
