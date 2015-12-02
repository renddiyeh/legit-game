var Gameover = function () {
  this.id = null;
};

module.exports = Gameover;

Gameover.prototype = {
  init: function(id) {
    this.id = id;
  },

  create: function () {
    var gameoverJson = require('../json/gameover');
    var obstacleJson = require('../json/obstacle');
    for (var i = 0; i < gameoverJson.layers.length; i++) {
      var layer = gameoverJson.layers[i];
      if(layer.id) {
        this.game.add.sprite(layer.x, layer.y, 'gameover-' + layer.name + '-' + this.id);
      } else {
        if(layer.spritesheet) {
          this.game.add.button(layer.x, layer.y, 'gameover-' + layer.name, this.onDown, this, 1, 0, 1);
        } else {
          this.game.add.sprite(layer.x, layer.y, 'gameover-' + layer.name);
        }
      }
    };
    var subtitleStyle = { font: 'bold 30px sans-serif', fill: '#000', align: 'center' };
    var subtitle = this.game.add.text(this.game.width / 2, 455, obstacleJson[this.id - 1].subtitle, descStyle);
    subtitle.anchor.set(0.5, 0);
    var descStyle = { font: '24px sans-serif', fill: '#000', align: 'center' };
    var desc = this.game.add.text(this.game.width / 2, 500, obstacleJson[this.id - 1].desc, descStyle);
    desc.anchor.set(0.5, 0);
    this.game.stage.backgroundColor = '#f8eccf';
  },

  update: function () {
    
  },

  onDown: function() {
    this.game.state.start(playerState.currentLevel);
  }
};
