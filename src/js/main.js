/* global require, $ */
'use strict';

window.jQuery = window.$ = require('jquery');
$.velocity = require('velocity-animate');
var scrollReveal = require('scrollreveal');

var obstacleJson = require('./json/obstacle');
var game = new Phaser.Game(600, 945, Phaser.AUTO, 'legi-game');

window.playerState = {
	currentLevel: 'Game',
	missedObstacles: 0
};

game.state.add('Boot', require('./states/boot'));
game.state.add('Splash', require('./states/splash'));
game.state.add('Preloader', require('./states/preloader'));
game.state.add('Menu', require('./states/menu'));
game.state.add('Game', require('./states/game'));
game.state.add('Gameover', require('./states/gameover'));

game.state.start('Boot');


window.gameover = function (id) {
	var path = 'assets/gameover/'
	for (var i = 1; i <= 2; i++) {
		var div = $('<div>').attr('data-sr', 'enter bottom, move 20px, over 1s').addClass('margin-large law');
		var law = new Image();
		law.src = path + 'law-' + id + '-' + i + '.png';
		var text = $('<p>').text(obstacleJson[id - 1].law[i - 1]);
		div.append(law).append(text);
		$('#law').append(div);
	}

	$('#info').show();
	window.sr = new scrollReveal();
};

window.restart = function() {
	// restart game
	game.state.start(playerState.currentLevel);

	$('#info').hide();
	$('#law').empty();

	playerState.missedObstacles = 0;
};

window.changeBg = function (color1, color2) {
	var bg = document.getElementsByTagName('body')[0];
    bg.classList.remove('bg-' + color1);
    bg.classList.add('bg-' + color2);
};

$(function() {

	$('.btn-again').click(window.restart);

});
