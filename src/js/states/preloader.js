/*global require, module*/
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
    this.load.spritesheet('game-player', 'assets/game/player.png', 92, 164);
    this.load.image('game-runway', 'assets/game/runway.png');
    var obstacleJson = require('../json/obstacle');
    for (var i = 1; i <= 8; i++) {
      var path = 'assets/game/obstacle-' + i + '.png';
      this.load.spritesheet('obstacle-' + i, path, Math.floor(obstacleJson[i-1].width / 2), obstacleJson[i-1].height);
    };
    this.load.image('stone', 'assets/game/stone.png');
    this.load.image('grass', 'assets/game/grass.png');

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
    this.load.image('gameover-title', 'assets/gameover/gameover.png');
    this.load.image('win-title', 'assets/win/title.png');
    this.load.spritesheet('win-pic', 'assets/win/pic.png', 453, 284);

    this.load.image('down', 'assets/gameover/down.png');
    this.load.spritesheet('again', 'assets/gameover/again.png', 178, 49);
    this.load.spritesheet('share', 'assets/gameover/share.png', 395, 56);
    this.load.spritesheet('more', 'assets/overview/more.png', 395, 63);

    // load music
    this.game.load.audio('bgm', 'assets/audio/bgm.mp3');
    this.game.load.audio('death', 'assets/audio/death.mp3');
    this.game.load.audio('win', 'assets/audio/win.mp3');

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
