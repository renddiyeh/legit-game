var _ = require('lodash');
var Preloader = function (game) {
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    // menu loader
    var menuJson = require('../json/menu');
    for (var i = 0; i < menuJson.layers.length; i++) {
      var path = 'assets/menu/' + menuJson.layers[i].filename;
      this.load.image('menu-' + menuJson.layers[i].name, path);
    }
    this.load.spritesheet('menu-button', 'assets/menu/buttonsprite.png', 358, 80);

    // tutorial loader
    this.load.image('tutorial-bg', 'assets/tutorial/bg.png');
    this.load.image('tutorial-circle', 'assets/tutorial/circle.png');
    this.load.spritesheet('tutorial-ok', 'assets/tutorial/ok.png', 541, 122);

    // game loader
    this.load.image('game-start', 'assets/game/start.png');
    this.load.spritesheet('game-player', 'assets/game/player.png', 166, 298);
    this.load.image('game-runway', 'assets/game/runway.png');
    var obstacleJson = require('../json/obstacle');
    for (var i = 1; i <= 8; i++) {
      var path = 'assets/game/obstacle-' + i + '.png';
      this.load.spritesheet('obstacle-' + i, path, obstacleJson[i-1].width / 2, obstacleJson[i-1].height);
    };
    this.load.image('stone', 'assets/game/stone.png');
    this.load.image('grass', 'assets/game/grass.png');

    // gameover loader
    var gameoverJson = require('../json/gameover');
    for (var i = 0; i < gameoverJson.layers.length; i++) {
      if(gameoverJson.layers[i].visible) {
        var path = 'assets/gameover/' + gameoverJson.layers[i].filename;
        if(gameoverJson.layers[i].spritesheet) {
          this.load.spritesheet('gameover-' + gameoverJson.layers[i].name, path, gameoverJson.layers[i].width, gameoverJson.layers[i].height);
        } else {
          this.load.image('gameover-' + gameoverJson.layers[i].name, path);
        }
      }
    }
    for (var i = 1; i <= 8; i++) {
      var text = 'assets/gameover/text-' + i + '.png';
      this.load.image('gameover-text-' + i, text);
      var death = 'assets/gameover/death-' + i + '.png';
      this.load.image('gameover-death-' + i, death);
      for (var j = 1; j <= 2; j++) {
        var law = 'assets/gameover/law-' + i + '-' + j + '.png';
        this.load.image('gameover-law-' + i + '-' + j, law);
      };
    };

    this.asset = this.add.sprite(this.game.width / 2, this.game.height / 2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('Menu');
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
