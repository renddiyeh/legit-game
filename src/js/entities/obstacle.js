var Obstacle = function (game, speed, lane, n) {
	this.speed = speed;
  if(n === 1 || n === 2 || n === 6) {
    var position = lane[game.rnd.between(0, 1)] + (lane[1] - lane[0]) / 2;
  } else {
    var position = lane[game.rnd.between(0, 2)];
  }
  
  // after called sprite function, this obstacle function also extended phaser
  Phaser.Sprite.call(this, game, position, -100, 'obstacle-' + n);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5);

  this.id = n;
  this.animations.add('move');
  this.animations.play('move', 4, true);
};
 
Obstacle.prototype = Object.create(Phaser.Sprite.prototype);

Obstacle.prototype.constructor = Obstacle;
 
Obstacle.prototype.update = function() {
  this.body.velocity.y = this.speed;
  if(this.y > this.game.height + 100){
    this.destroy();
    window.playerState.missedObstacles += 1;
  }
};

module.exports = Obstacle;
