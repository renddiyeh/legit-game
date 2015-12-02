var Stone = function (game, speed) {
	this.speed = speed;
  var position = game.rnd.between(20, 580);
  // after called sprite function, this obstacle function also extended phaser
  Phaser.Sprite.call(this, game, position, -50, 'stone');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5);
};
 
Stone.prototype = Object.create(Phaser.Sprite.prototype);

Stone.prototype.constructor = Stone;
 
Stone.prototype.update = function() {
  this.body.velocity.y = this.speed;
  if(this.y > this.game.height + 100) {
    this.destroy();
  }
};

module.exports = Stone;
