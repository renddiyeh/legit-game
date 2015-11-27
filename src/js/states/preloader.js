var _ = require('lodash');
var Preloader = function (game) {
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    var menuJson = require('../json/menu');
    for (var i = 0; i < menuJson.layers.length; i++) {
      var path = 'assets/menu/' + menuJson.layers[i].filename;
      this.load.image('menu-' + menuJson.layers[i].name, path);
    }
    this.game.load.spritesheet('menu-button', 'assets/menu/buttonsprite.png', 358, 80);

    var gameJson = require('../json/game');
    for (var i = 0; i < gameJson.layers.length; i++) {
      var path = 'assets/game/' + gameJson.layers[i].filename;
      this.load.image('game-' + gameJson.layers[i].name, path);
    }
    this.load.image('game-runway', 'assets/game/runway.png');
    for (var i = 1; i <= 8; i++) {
      var path = 'assets/game/obstacle-' + i + '.png';
      this.load.image('obstacle-' + i, path);
    };

    this.asset = this.add.sprite(320, 240, 'preloader');
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
