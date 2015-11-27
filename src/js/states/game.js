var Obstacle = require('../entities/obstacle');
var Game = function () {
  this.setting = [{
    player: {
      speed: 200
    },
    obstacle: {
      speed: 300,
      gap: 2500
    }
  }, {
    player: {
      speed: 200,
    },
    obstacle: {
      speed: 400,
      gap: 2000,
    }
  }, {
    player: {
      speed: 250,
    },
    obstacle: {
      speed: 600,
      gap: 1500, 
    }
  }, {
    player: {
      speed: 300
    },
    obstacle: {
      speed:  800,
      gap: 1000
    }
  }];
  this.curSetting = this.setting[0];
  this.curDifficulty = 0;
  this.overlay = null;
  this.runway = {
    width: 180,
    height: 805,
    lane: []
  };
  this.startLine = null;
  this.control = {};
  this.guy = null;
  this.player = {
    lane: 0,
    canMove: true
  };
  this.leftKey = null;
  this.rightKey = null;
  this.obstacleGroup = null;
};

module.exports = Game;

Game.prototype = {

  create: function () {
    console.log(this.curSetting);
    this.game.stage.backgroundColor = '#f8eccf';
    this.drawRunway(); 
    this.drawStartLine();
    this.drawPlayer();
    this.drawControl();
    this.setObstacles();
    this.drawOverlay();
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.game.time.events.repeat(Phaser.Timer.SECOND * 10, 3, this.addDifficulty, this);
  },

  update: function () {
    if (this.leftKey.isDown) {
      this.movePlayer('left');
    } else if (this.rightKey.isDown) {
      this.movePlayer('right');
    }

    this.game.physics.arcade.collide(this.guy, this.obstacleGroup, function(){
      this.game.state.start('Menu');     
    }, null, this);
 
  },

  addDifficulty: function() {
    this.curDifficulty += 1;
    this.curSetting = this.setting[this.curDifficulty];

  },

  setObstacles: function() {
    this.obstacleGroup = this.game.add.group();
    this.game.time.events.loop(this.curSetting.obstacle.gap, function(){
      var n = this.game.rnd.between(1, 8);
      var obstacle = new Obstacle(this.game, this.curSetting.obstacle.speed, this.runway.lane, n);
      this.game.add.existing(obstacle);
      this.obstacleGroup.add(obstacle);
    }, this);
  },

  drawStartLine: function() {
    this.startLine = this.game.add.sprite(38,622, 'game-start');
  },

  drawPlayer: function() {
    this.guy = this.game.add.sprite(this.game.width / 2, this.game.height - 100, 'game-player');
    this.guy.anchor.set(0.5, 1);
    this.game.physics.enable(this.guy, Phaser.Physics.ARCADE);
    this.guy.body.allowRotation = false;
    this.guy.body.moves = false;
  },

  movePlayer: function(direction) {
    var targetLane = this.player.lane;
    if(direction === 'left') {
      targetLane -= 1;
    } else {
      targetLane += 1;
    }
    if(this.player.canMove && Math.abs(targetLane) <= 1){
      this.player.canMove = false;
      var moveTween = this.game.add.tween(this.guy).to({ 
        x: this.runway.lane[targetLane + 1]
      }, this.curSetting.player.speed, Phaser.Easing.Quadratic.Out, true);
      moveTween.onComplete.add(function(){
        this.player.canMove = true;
        this.player.lane = targetLane;
      }, this);
    }
  },

  drawControl: function() {
    this.control.left = this.game.add.sprite(138, 522, 'game-left');
    this.control.right = this.game.add.sprite(354, 522, 'game-right');
    var leftTween = this.game.add.tween(this.control.left).to({ 
      alpha: 0
    }, 500, Phaser.Easing.Quadratic.Out, true, 3000);
    var rightTween = this.game.add.tween(this.control.right).to({ 
      alpha: 0
    }, 500, Phaser.Easing.Quadratic.Out, true, 3000);
  },

  drawRunway: function() {
    this.runway.graphic = this.game.add.graphics(0,0);
    this.runway.graphic.beginFill('0xffffff');
    (function() {
      var gap = (this.game.width - this.runway.width * 3) / 4;
      for (var i = 0; i < 3; i++) {
        var start = gap * (i + 1) + this.runway.width * i;
        this.runway.lane[i] = start + this.runway.width / 2;  
        this.runway.graphic.drawRect(start, 120, this.runway.width, this.runway.height);
      };
    }).call(this);

    this.runway.texture = this.game.add.tileSprite(0, 120, this.game.width, 805, 'game-runway');
    this.runway.texture.mask = this.runway.graphic;
  },

  drawOverlay: function() {
    this.overlay = this.game.add.graphics(0,0);
    this.overlay.beginFill('0x9b2a0b');
    this.overlay.drawRect(0, 0, this.game.width, 120);
    this.overlay.drawRect(0, this.game.height - 20, this.game.width, 20);
  }
};
