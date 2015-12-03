'use strict';

window.jQuery = window.$ = require('jquery');
$.velocity = require('velocity-animate');
var scrollReveal = require('scrollreveal');
var obstacleJson = require('./json/obstacle');
var game = new Phaser.Game(600, 945, Phaser.AUTO, 'legi-game');

window.Utils = require('./utils');
window.playerState = {
    currentLevel: 'Game'
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
	$('#gameover-title').attr('src', path + 'text-' + id + '.png');
	$('#death-pic').attr('src', path + 'death-' + id + '.png');

	var setInfoContent = function() {
		for (var i = 1; i <= 2; i++) {
			var div = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s').addClass('margin-medium');
			var law = new Image();
			law.src = path + 'law-' + id + '-' + i + '.png';
			var text = $('<p>').text(obstacleJson[id - 1].law[i - 1]);
			div.append(law).append(text);
			$('#law').append(div);
		};
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
	    var subtitle = obstacleJson[id - 1].subtitle;
	    var desc = obstacleJson[id - 1].desc;
	    $('#gameover-subtitle').html('<p>' + subtitle).velocity({
			opacity: 1
		}, {
	    	duration: 1000
	    });
	    $('#gameover-desc').html('<p>' + desc).velocity({opacity: 1}, {
	    	complete: function() {
	    		showGameoverButton();
				$('#info').show();
				window.sr = new scrollReveal();
	    	},
	    	duration: 1000,
			delay: 500
	    });
	};

	var showGameoverTitle = function() {
		$('#game-over .static-container').css({opacity: 1});
		$('#gameover-title').velocity({
			opacity: 1,
			translateX: '-50%'
		}, {
			duration: 1000
		});
		$('#gameover-pic').velocity({
			opacity: 1,
			translateX: '-50%'
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
		}
	});

	$('#death-pic').velocity({
		opacity: 1,
		translateX: '-50%'
	}, {
	    duration: 1000
	});
};

window.setGameoverDiv = function(scale) {
	var setting = {
		transform: 'translate(-50%, 0) scale(' + scale.x + ', ' + scale.y + ')'
	};
	$('#game-over').css(setting);
	$('#info').css(setting);
};

$('#game-over .btn-again').click(function() {
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
});
