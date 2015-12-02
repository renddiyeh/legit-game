var Menu = function () {
  this.text = null;
  this.button = null;
};

module.exports = Menu;

Menu.prototype = {

  create: function () {
    this.button = this.game.add.button(117.5, 740, 'menu-button', this.onDown, this, 2, 1, 0);
    var menuJson = require('../json/menu');
    for (var i = 0; i < menuJson.layers.length; i++) {
      var layer = menuJson.layers[i];
      var thisSprite = this.game.add.sprite(layer.x, layer.y, 'menu-' + layer.name);
      if(layer.name === 'hand') {
        this.game.add.tween(thisSprite).to({ 
          x: layer.x - 20,
          y: layer.y - 16
        }, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);
      }
    };
    this.game.stage.backgroundColor = '#cd451d';
  },

  update: function () {
  },

  onDown: function () {
    this.game.state.start(playerState.currentLevel);
  }
};
