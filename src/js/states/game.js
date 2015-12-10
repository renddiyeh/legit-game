/*global require, module*/
var _ = require('lodash');
var Obstacle = require('../entities/obstacle');
var Grass = require('../entities/grass');
var Stone = require('../entities/stone');
var Game = function () {
  this.setting = [{
    duration: 10,
    player: {
      speed: 200,
    },
    obstacle: {
      rate: 4,
      speed: 600,
      gap: 2000
    }
  }, {
    duration: 15,
    player: {
      speed: 250,
    },
    obstacle: {
      rate: 5,
      speed: 750,
      gap: 1500
    }
  }, {
    duration: 20,
    player: {
      speed: 300
    },
    obstacle: {
      rate: 6,
      speed:  900,
      gap: 1200
    }
  }];
  this.curSetting = null;
  this.curLevel = 0;
  this.overlay = null;
  this.overlayLayer = null;
  this.runway = {
    width: 180,
    lane: []
  };
  this.startLine = null;
  this.guy = null;
  this.player = {};
  this.playerLayer = null;
  this.leftKey = null;
  this.rightKey = null;
  this.obstacleGroup = null;
  this.obstacleTimer = null;
  this.obstacleList = [[1, 7], [2, 3], [4], [5, 6, 8]];
  this.stoneGroup = null;
  this.grassGroup = null;
  this.grassTimer = null;
  this.stoneTimer = null;
  this.levelInfo = [];
  this.levelTextSource = ['程序委員會', '一 讀', '審查委員會'];
  this.levelText = [];
  this.overlayHeight = 100;
  this.levelSetting = {
    top: 10,
    margin: 15,
    gap: 24,
    scale: 2
  };
  this.tutorial = {};
  this.tutorialGroup = null;
  this.timerText = 0;
};

module.exports = Game;

Game.prototype = {
  init: function () {
    window.changeBg('orange', 'pale');
  },

  create: function () {
    this.curSetting = this.setting[0];
    this.curLevel = 0;
    this.game.stage.backgroundColor = '#f8eccf';
    this.drawRunway();
    this.stoneGroup = this.game.add.group();
    this.grassGroup = this.game.add.group();
    this.obstacleGroup = this.game.add.group();
    this.playerLayer = this.game.add.group();
    this.overlayLayer = this.game.add.group();
    this.drawPlayer();
    this.drawOverlay();
    if(this.tutorial.done) {
      this.gameStart();
    } else {
      this.showTutorial();
    }
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  },

  update: function () {
    if (this.leftKey.isDown) {
      this.movePlayer('left');
    } else if (this.rightKey.isDown) {
      this.movePlayer('right');
    }

    this.game.physics.arcade.collide(this.guy, this.obstacleGroup, function(obj1, obj2) {
      this.game.paused = true;
      setTimeout(function() {
        window.gameover(obj2.id);
      }, 300);
    }, null, this);

    if(this.game.input.mousePointer.isDown) {
      // this.mouseIndicator(this.game.input.mousePointer.x, this.game.input.mousePointer.y);
      if(this.game.input.mousePointer.x < this.game.width / 2) {
        this.movePlayer('left');
      } else {
        this.movePlayer('right');
      }
    }

    if(this.game.input.pointer1.isDown) {
      // this.mouseIndicator(this.game.input.pointer1.x, this.game.input.pointer1.y);
      if(this.game.input.pointer1.x < this.game.width / 2) {
        this.movePlayer('left');
      } else {
        this.movePlayer('right');
      }
    }
    //this.missed.text = window.playerState.missedObstacles;

  },

  render: function () {
    this.game.debug.body(this.guy);
  },

  winGame: function() {
    this.player.canMove = false;
    var playerGoToFinish = this.game.add.tween(this.guy).to({
      y: -200
    }, 1000, Phaser.Easing.Quadratic.In, true);
    playerGoToFinish.onComplete.add(function(){
      this.game.paused = true;
    }, this);
    window.gameover(0);
  },

  gameStart: function() {
    this.tutorial.active = false;
    this.moveBg();
    this.setObstacles();
    this.setGrassStone();
    this.tutorialGroup.visible = false;
    this.drawLevelInfo();
    this.drawTimer();
    this.startTimer(this.setting[this.curLevel].duration);

    /*this.curLevel = 2;
    this.nextLevel();*/
    this.game.time.events.add(Phaser.Timer.SECOND * this.setting[this.curLevel].duration, this.nextLevel, this);
  },

  nextLevel: function() {

    // stop all spawns
    this.game.time.events.remove(this.obstacleTimer);
    this.game.time.events.remove(this.grassTimer);
    this.game.time.events.remove(this.stoneTimer);
    if(this.curLevel === 2) {
      this.runway.tween.stop();
      this.winGame();
    } else {
      // a little pause before level getting harder
      this.game.time.events.add(500, function () {
        this.curLevel += 1;
        this.startTimer(this.setting[this.curLevel].duration);
        this.curSetting = this.setting[this.curLevel];
        this.setObstacles();
        this.setGrassStone();
        this.updateLevelInfo(this.curLevel);
        this.runway.tween.stop();
        this.moveBg();
        this.game.time.events.add(Phaser.Timer.SECOND * this.setting[this.curLevel].duration, this.nextLevel, this);
      }, this);
    }
  },

  setObstacles: function() {
    this.obstacleTimer = this.game.time.events.loop(this.curSetting.obstacle.gap, function(){
      var list = this.obstacleList[0].concat(this.obstacleList[this.curLevel + 1]);
      var n = _.sample(list);
      var obstacle = new Obstacle(this.game, this.curSetting.obstacle.speed, this.runway.lane, n);
      this.game.add.existing(obstacle);
      this.obstacleGroup.add(obstacle);
      if(!(n === 1 || n === 2 || n === 6) && (this.game.rnd.between(1, 10) < this.curSetting.obstacle.rate)) {
        var obstacle2 = new Obstacle(this.game, this.curSetting.obstacle.speed, this.runway.lane, n);
        this.game.add.existing(obstacle2);
        this.obstacleGroup.add(obstacle2);
      }
    }, this);
  },

  setGrassStone: function() {
    var gapGrass = this.game.rnd.between(500, 2500);
    this.grassTimer = this.game.time.events.loop(gapGrass, function(){
      var grass = new Grass(this.game, this.curSetting.obstacle.speed);
      this.game.add.existing(grass);
      this.grassGroup.add(grass);
    }, this);
    var gapStone = this.game.rnd.between(500, 2500);
    this.stoneTimer = this.game.time.events.loop(gapStone, function(){
      var stone = new Stone(this.game, this.curSetting.obstacle.speed);
      this.game.add.existing(stone);
      this.stoneGroup.add(stone);
    }, this);
  },

  drawStartLine: function() {
    this.startLine = this.game.add.sprite(38, 622, 'game-start');
    this.game.physics.enable(this.startLine, Phaser.Physics.ARCADE);
  },

  drawPlayer: function() {
    this.player = {
      lane: 0,
      canMove: true
    };
    this.guy = new Phaser.Sprite(this.game, this.game.width / 2, this.game.height - 130, 'game-player');
    this.guy.anchor.set(0.5, 1);
    this.guy.scale.setTo(1.5, 1.5);
    this.game.physics.enable(this.guy, Phaser.Physics.ARCADE);
    this.guy.body.allowRotation = false;
    this.guy.body.moves = false;
    this.guy.body.setSize(60, 80, 0, -60);
    this.guy.animations.add('forward', [0, 4], 4, true);
    this.guy.animations.play('forward');
    this.playerLayer.add(this.guy);
  },

  movePlayer: function(direction) {
    var targetLane, moveTween;
    if(this.tutorial.active) {
      targetLane = this.tutorial.playerStats.lane;
      if(direction === 'left') {
        targetLane -= 1;
      } else {
        targetLane += 1;
      }
      if(this.tutorial.playerStats.canMove && Math.abs(targetLane) <= 1){
        this.tutorial.playerStats.canMove = false;
        moveTween = this.game.add.tween(this.tutorial.player).to({
          x: this.tutorial.lane[targetLane + 1]
        }, this.curSetting.player.speed, Phaser.Easing.Quadratic.Out, true);
        moveTween.onComplete.add(function(){
          this.tutorial.playerStats.canMove = true;
          this.tutorial.playerStats.lane = targetLane;
        }, this);
        this.tutorial.player.animations.add('move', [1, 2, 0], 6, false);
        this.tutorial.player.animations.play('move');
      }
    } else {
      targetLane = this.player.lane;
      if(direction === 'left') {
        targetLane -= 1;
      } else {
        targetLane += 1;
      }
      if(this.player.canMove && Math.abs(targetLane) <= 1){
        this.player.canMove = false;
        moveTween = this.game.add.tween(this.guy).to({
          x: this.runway.lane[targetLane + 1]
        }, this.curSetting.player.speed, Phaser.Easing.Quadratic.Out, true);
        moveTween.onComplete.add(function(){
          this.player.canMove = true;
          this.player.lane = targetLane;
        }, this);
        var anim = this.guy.animations.add('move', [1, 2, 0], 6, false);
        this.guy.animations.play('move');
        anim.onComplete.add(function() {
          this.guy.animations.play('forward');
        }, this);
      }
    }
  },

  drawRunway: function() {
    this.runway.graphic = this.game.add.graphics(0,0);
    this.runway.graphic.beginFill('0xffffff');
    (function() {
      var gap = (this.game.width - this.runway.width * 3) / 4;
      for (var i = 0; i < 3; i++) {
        var start = gap * (i + 1) + this.runway.width * i;
        this.runway.lane[i] = start + this.runway.width / 2;
        this.runway.graphic.drawRect(start, 0, this.runway.width, this.game.height);
      }
    }).call(this);

    this.runway.texture = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'game-runway');
    this.runway.texture.mask = this.runway.graphic;
  },

  moveBg: function() {
    this.runway.tween = this.game.add.tween(this.runway.texture.tilePosition).to({y: this.curSetting.obstacle.speed}, 1000, Phaser.Easing.Linear.None, true, 0, -1);
  },

  drawOverlay: function() {
    this.overlay = this.game.add.graphics(0,0);
    this.overlay.beginFill('0x9b2a0b');
    // this.overlay.drawRect(0, 0, this.game.width, this.overlayHeight);
    this.overlay.drawRect(0, this.game.height - 20, this.game.width, 20);
    this.overlayLayer.add(this.overlay);
  },

  drawLevelInfo: function() {
    var w = (600 - this.levelSetting.margin * 2 - this.levelSetting.gap * 2) / (2 + this.levelSetting.scale);
    var gap = (600 - this.levelSetting.margin * 2 - w * 3) / 2;
    for (var i = 0; i < 3; i++) {
      this.levelInfo[i] = this.game.add.graphics(this.levelSetting.margin + gap * i + w * i, this.levelSetting.top);
      this.levelInfo[i].beginFill('0x561a0b');
      this.levelInfo[i].drawRect(0, 0, w, this.overlayHeight - this.levelSetting.margin * 2);
    }
    this.updateLevelInfo(0);
  },

  updateLevelInfo: function(n) {
    var style;
    var w = (600 - this.levelSetting.margin * 2 - this.levelSetting.gap * 2) / (2 + this.levelSetting.scale);
    var h = this.overlayHeight - this.levelSetting.margin * 2;
    for (var i = 0; i < 3; i++) {
      if(i === n) {
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * i;
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0xcd451d');
        this.levelInfo[i].drawRect(0, 0, w * 2, h);
        style = { font: 'bold 30px sans-serif', fill: '#fff', align: 'center' };
      } else if(i < n) {
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * i;
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0x561a0b');
        this.levelInfo[i].drawRect(0, 0, w, h);
        style = { font: '22px sans-serif', fill: '#fff', align: 'center' };
      } else {
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * (i + 1);
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0x561a0b');
        style = { font: '22px sans-serif', fill: '#fff', align: 'center' };
        this.levelInfo[i].drawRect(0, 0, w, h);
      }
      if(this.levelText[i]) {
        this.levelText[i].destroy();
      }
      this.levelText[i] = this.game.add.text(this.levelInfo[i].x + this.levelInfo[i].width / 2, this.levelInfo[i].y + this.levelInfo[i].height / 2 + 3  , this.levelTextSource[i], style);
      this.levelText[i].anchor.set(0.5);
    }
  },

  drawTimer: function() {
    var style = { font: 'bold 36px sans-serif', fill: '#222', align: 'center' };
    this.timerText = this.game.add.text(this.game.width - 40, this.levelInfo[2].y + this.levelInfo[2].height + 30, '10', style);
    this.timerText.anchor.set(0.5);
  },

  startTimer: function(sec) {
    var count = sec;
    this.game.time.events.repeat(Phaser.Timer.SECOND, sec + 1, function(){
      this.timerText.text = count--;
    }, this);
  },

  showTutorial: function() {
    this.tutorial.active = true;
    this.tutorialGroup = this.game.add.group();
    this.tutorial.overlay = this.game.add.graphics(0,0);
    this.tutorial.overlay.beginFill('0x000000');
    this.tutorial.overlay.drawRect(0, 0, this.game.width, this.game.height);
    this.tutorial.overlay.alpha = 0.5;
    this.tutorialGroup.add(this.tutorial.overlay);
    this.tutorial.bg = this.game.add.sprite(30, 117, 'tutorial-bg');
    this.tutorialGroup.add(this.tutorial.bg);
    this.tutorial.ok = this.game.add.button(30, 707, 'tutorial-ok', this.gameStart, this, 1, 0, 1);
    this.tutorialGroup.add(this.tutorial.ok);
    var titleStyle = { font: 'bold 26px sans-serif', fill: '#fff', align: 'center' };
    this.tutorial.title = this.game.add.text(54, 145, '你是一名新科立委，正要帶著手邊剛出爐的\n新法案，前往立法院突破阻礙過三讀⋯', titleStyle);
    this.tutorial.title.lineSpacing = 10;
    this.tutorialGroup.add(this.tutorial.title);
    var descStyle = { font: '30px sans-serif', fill: '#fff', align: 'center' };
    if(this.game.device.desktop) {
      this.tutorial.desc = this.game.add.text(165, 280, '請使用← →鍵\n切換跑道閃避障礙物', descStyle);
    } else {
      this.tutorial.desc = this.game.add.text(165, 280, '請輕觸螢幕左或右\n切換跑道閃避障礙物', descStyle);
    }
    this.tutorialGroup.add(this.tutorial.desc);
    this.tutorial.player = this.game.add.sprite(this.game.width / 2, 360, 'game-player');
    this.tutorial.player.anchor.set(0.5, 0);
    this.tutorial.player.scale.setTo(1.5, 1.5);
    this.tutorialGroup.add(this.tutorial.player);
    this.tutorial.lane = [130, 300, 470];
    this.tutorial.playerStats = {
      lane: 0,
      canMove: true
    };
    this.tutorial.done = true;
  },

  mouseIndicator: function(x, y) {
    var canvas = this.add.graphics(x, y);
    canvas.beginFill('0xffffff');
    canvas.drawCircle(0, 0, 30);
    canvas.alpha = 0.5;
    this.game.add.tween(canvas.scale).to({
      x: 2,
      y: 2
    }, 500, Phaser.Easing.Quadratic.Out, true);
    this.game.add.tween(canvas).to({
      alpha: 0
    }, 500, Phaser.Easing.Quadratic.Out, true);
  }
};
