/* global require, $ */
'use strict';

window.jQuery = window.$ = require('jquery');
$.velocity = require('velocity-animate');
$.scrolltofixed = require('scrolltofixed');
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

var hit = false;
window.gameover = function (id) {
	var path = 'assets/gameover/';
	var deathPic = new Image();
	if(id === 0) {
		hit = true;
		deathPic.src = 'assets/win/pic.png';
		$('#death-pic').append(deathPic).addClass('win');
		$('#gameover-pic img').attr('src', 'assets/win/title.png');
		(function hit (n) {
			if(!hit) {
				return false;
			}
			$('#death-pic').toggleClass('hit');
			if(n % 2 === 1) {
				hit = setTimeout(function() {
					hit(++n);
				}, 1000);
			} else {
				hit = setTimeout(function() {
					hit(++n);
				}, 500);
			}
		})(0);
		$('#game-wrapper').addClass('win');
	} else {
		$('#game-wrapper').removeClass('win');

		$('#gameover-pic img').attr('src', path + 'gameover.png');
		$('#gameover-title img').attr('src', path + 'text-' + id + '.png');
		
		deathPic.src = path + 'death-' + id + '.png';
		$('#death-pic').removeClass('win').empty().append(deathPic);
	}

	var setOverview = function() {
		var path = 'assets/overview/';
		$('#overview .death').empty();
		_.forEach(obstacleJson, function(ele) {
			var death = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s')
				.addClass('margin-small item col-xs-6');
			if(ele.stage !== 0) {
				death.addClass('col-sm-12');
			}
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
				var div = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s').addClass('margin-large law');
				var law = new Image();
				law.src = path + 'law-' + id + '-' + i + '.png';
				var text = $('<p>').text(obstacleJson[id - 1].law[i - 1]);
				div.append(law).append(text);
				$('#law').append(div);
			}
		}
	};

	var showGameoverButton = function() {
		$.velocity.hook($('.btn'), 'translateX', '-50%');
		$('.btn').velocity({
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
			delay: 800,
			complete: function() {
				showGameoverButton();
				$('#info').show();
				window.sr = new scrollReveal();
			}
		});
	};

	var showGameoverTitle = function() {
		$('#gameover-static').css({opacity: 1});
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
			$(this).css('z-index', '-1');
		}
	});

	$.velocity.hook($('#death-pic'), 'translateX', '-50%');
	$('#death-pic').velocity({
		opacity: 1
	}, {
		duration: 1000
	});
	$('#gameoverlay').show();
	$('#gameover-header').show();
	$('#section-title').scrollToFixed({
		marginTop: 10,
		limit: $($('.section')[3]).offset().top
	});
};

window.gameoverResize = function(height, width) {
	$('#gameover-header').height(height * 0.55);
	$('#gameover-wrapper').css('max-width', width);
	$('body').removeClass();
	if(width >= 480 && width < 600) {
		$('body').addClass('md');
	} else if(width >= 600) {
		$('body').addClass('lg');
	}
};

window.gameoverButtonResize = function(scale) {
	$('.buttons').css({
		transform: 'scale(' + scale.x + ',' + scale.y + ')'
	});
};

$('.btn-again').click(function() {
	// restart game
	$('#legi-game').css({opacity: 1});
	game.paused = false;
	game.state.start(playerState.currentLevel);
	$('#gameover-header').hide().children().each(function() {
		$(this).css({opacity: 0});
	});
	$('#gameover-static').children().each(function() {
		$(this).css({opacity: 0});
	});
	$('#info').hide();
	$('#law').empty();
	$('#gameoverlay').hide();
	$('#gameover-bg').css({
		'z-index': '0',
		opacity: 0
	});
	$('.btn').css({opacity: 0});
	hit = false;
	// reset counter
	playerState.missedObstacles = 0;
});
var posY;
$(document).scroll(function() {
	posY = document.all? iebody.scrollTop : pageYOffset;
	if($('.section').eq(0).offset().top < posY && $('.section').eq(1).offset().top >= posY) {
		$('.title').removeClass('active').eq(0).addClass('active');
	}
	if($('.section').eq(1).offset().top < posY && $('.section').eq(2).offset().top >= posY) {
		$('.title').removeClass('active').eq(1).addClass('active');
	}
	if($('.section').eq(2).offset().top < posY) {
		$('.title').removeClass('active').eq(2).addClass('active');
	}
});
