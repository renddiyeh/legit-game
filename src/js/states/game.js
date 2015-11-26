
var Game = function () {
  this.rect = null;
  this.runway = null;
  this.runwayTexture = null;
  this.control = {};
  this.palyer = null;
};

module.exports = Game;

Game.prototype = {

  create: function () {
    var gw = this.game.width,gh = this.game.height;
    this.rect = this.game.add.graphics(0,0);
    this.rect.beginFill('0x9b2a0b');
    this.rect.drawRect(0, 0, gw, 120);
    this.rect.drawRect(0, gh - 20, gw, 20);

    this.runway = this.game.add.graphics(0,0);
    this.runway.beginFill('0xffffff');
    (function() {
      var width = 180, height = 805;
      var gap = (gw - 180 * 3) / 4;
      for (var i = 0; i < 3; i++) {
        var start = gap * (i + 1) + width * i;
        this.runway.drawRect(start, 120, width, height);
      };
    }).call(this);

    this.runwayTexture = this.game.add.tileSprite(0, 120, gw, 805, 'game-runway');
    this.runwayTexture.mask = this.runway;

    this.game.add.sprite(38,622, 'game-start');

    this.control.left = this.game.add.sprite(138, 522, 'game-left');
    this.control.right = this.game.add.sprite(354, 522, 'game-right');
    this.player = this.game.add.sprite(222, 534, 'game-player');

    this.input.onDown.add(this.onInputDown, this);
    this.game.stage.backgroundColor = '#f8eccf';
  },

  update: function () {

  },

  onInputDown: function () {
    this.game.state.start('Menu');
  }
};
