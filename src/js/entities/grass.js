var Grass = function (game, speed) {
	this.speed = speed;
  var position = game.rnd.between(20, 580);
  // after called sprite function, this obstacle function also extended phaser
  Phaser.Sprite.call(this, game, position, -50, 'grass');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5);
};
 
Grass.prototype = Object.create(Phaser.Sprite.prototype);

Grass.prototype.constructor = Grass;
 
Grass.prototype.update = function() {
  this.body.velocity.y = this.speed;
  if(this.y > this.game.height + 100){
    this.destroy();
  }
};

module.exports = Grass;
