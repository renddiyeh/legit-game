/*global require, module*/
var _ = require('lodash');
var Obstacle = require('../entities/obstacle');
var Grass = require('../entities/grass');
var Stone = require('../entities/stone');

var Game = function () {
  this.setting = [{
    duration: 5,
    player: {
      speed: 200,
    },
    obstacle: {
      rate: 4,
      speed: 600,
      gap: 2000
    }
  }, {
    duration: 6,
    player: {
      speed: 170,
    },
    obstacle: {
      rate: 5,
      speed: 750,
      gap: 1500
    }
  }, {
    duration: 12,
    player: {
      speed: 150
    },
    obstacle: {
      rate: 6,
      speed:  900,
      gap: 1200
    }
  },{
    duration: 12,
    player: {
      speed: 150,
    },
    obstacle: {
      rate: 6,
      speed:  900,
      gap: 1200
    }
  }, {
    duration: 5,
    player: {
      speed: 200,
    },
    obstacle: {
      rate: 5,
      speed: 750,
      gap: 1500
    }
  }, {
    duration: 5,
    player: {
      speed: 200
    },
    obstacle: {
      rate: 5,
      speed:  750,
      gap: 1500
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
  this.enterKey = null;
  this.spaceKey = null;
  this.obstacleGroup = null;
  this.obstacleTimer = null;
  this.obstacleList = [[1, 7], [3, 4, 6], [2, 4, 6, 8], [5], [3, 4, 6], [3, 4, 6], [3, 4, 6]];
  this.stoneGroup = null;
  this.grassGroup = null;
  this.grassTimer = null;
  this.stoneTimer = null;
  this.levelInfo = [];
  this.levelTextSource = ['程序委員會', '一 讀', '委員會', '黨團協商', '二 讀', '三 讀'];
  this.levelText = null;
  this.overlayHeight = 100;
  this.levelSetting = {
    top: 10,
    margin: 15,
    gap: 5,
    scale: 5,
    corner: 20,
    baseW: 0
  };
  this.tutorial = {};
  this.tutorialGroup = null;
  this.timer = null;
  this.timerSetting = {};
  this.audio = {};
  this.gameover = null;
  this.gameStarted = null;
};

module.exports = Game;

Game.prototype = {
  init: function () {
    window.changeBg('orange', 'pale');
  },

  create: function () {
    this.gameover = false;
    this.gameStarted = false;
    this.audio.death = this.game.add.audio('death');
    this.audio.win = this.game.add.audio('win');
    this.audio.bgm = this.game.add.audio('bgm');
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
    this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  },

  update: function () {
    if (this.leftKey.isDown) {
      this.movePlayer('left');
    } else if (this.rightKey.isDown) {
      this.movePlayer('right');
    }

    this.game.physics.arcade.collide(this.guy, this.obstacleGroup, function(obj1, obj2) {
      if(typeof this.player.moveTween !== 'undefined') {
        this.player.moveTween.stop();
      }
      
      this.player.canMove = false;
      obj1.body.velocity = 0;
      obj2.body.velocity = 0;
      obj2.body.immovable = true;
      if(!this.gameover) {
        this.gameover = true;
        this.runway.tween.stop();
        this.audio.bgm.stop();
        this.grassGroup.forEach(function(grass) {
          grass.body.velocity = 0;
        });
        this.stoneGroup.forEach(function(stone) {
          stone.body.velocity = 0;
        });
        // this.game.paused = true;
        this.audio.death.play();
        var game = this.game;
        setTimeout(function() {
          game.state.start('Gameover', true, false, obj2.id);
          // window.gameover(obj2.id);
        }, 300);
      }
      
    }, null, this);

    if((this.enterKey.isDown || this.spaceKey.isDown) && !this.gameStarted) {
      this.gameStart();
    }

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
    // this.game.debug.body(this.guy);
  },

  winGame: function() {
    this.player.canMove = false;
    var playerGoToFinish = this.game.add.tween(this.guy).to({
      y: -200
    }, 1000, Phaser.Easing.Quadratic.In, true);
    playerGoToFinish.onComplete.add(function(){
      this.game.state.start('Gameover', true, false, 0);
    }, this);
    this.audio.bgm.stop();

    this.audio.win.play();
  },

  gameStart: function() {
    this.gameStarted = true;
    this.audio.bgm.play();
    this.tutorial.active = false;
    this.moveBg();
    this.setObstacles();
    this.setGrassStone();
    this.tutorialGroup.visible = false;
    this.drawTimer();
    this.setupLevelInfo();

    // this.curLevel = 2;
    // this.nextLevel();
    this.game.time.events.add(Phaser.Timer.SECOND * this.setting[this.curLevel].duration, this.nextLevel, this);
  },

  nextLevel: function() {

    // stop all spawns
    this.game.time.events.remove(this.obstacleTimer);
    this.game.time.events.remove(this.grassTimer);
    this.game.time.events.remove(this.stoneTimer);
    if(this.curLevel === this.levelTextSource.length - 1) {
      this.runway.tween.stop();
      this.winGame();
    } else {
      // a little pause before level getting harder
      this.game.time.events.add(500, function () {
        this.curLevel += 1;
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
    var targetLane;
    if(this.tutorial.active) {
      targetLane = this.tutorial.playerStats.lane;
      if(direction === 'left') {
        targetLane -= 1;
      } else {
        targetLane += 1;
      }
      if(this.tutorial.playerStats.canMove && Math.abs(targetLane) <= 1){
        this.tutorial.playerStats.canMove = false;
        this.tutorial.playerStats.moveTween = this.game.add.tween(this.tutorial.player).to({
          x: this.tutorial.lane[targetLane + 1]
        }, this.curSetting.player.speed, Phaser.Easing.Quadratic.Out, true);
        this.tutorial.playerStats.moveTween.onComplete.add(function(){
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
        this.player.moveTween = this.game.add.tween(this.guy).to({
          x: this.runway.lane[targetLane + 1]
        }, this.curSetting.player.speed, Phaser.Easing.Quadratic.Out, true);
        this.player.moveTween.onComplete.add(function(){
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

  setupLevelInfo: function() {
    var count = this.levelTextSource.length - 1;
    this.levelSetting.baseW = (600 - this.levelSetting.margin * 2 - this.levelSetting.gap * count - this.levelSetting.corner) / (count + this.levelSetting.scale);
    for (var i = 0; i < this.levelTextSource.length; i++) {
      this.levelInfo[i] = this.game.add.graphics(0, this.levelSetting.top);
    }
    this.updateLevelInfo(0);
  },

  updateLevelInfo: function(n) {
    var style;
    var w = this.levelSetting.baseW;
    var h = this.overlayHeight - this.levelSetting.margin * 2;
    if(this.levelText) {
      this.levelText.destroy();
    }
    for (var i = 0; i < this.levelTextSource.length; i++) {
      if(i === n) {
        var polyAdd = new Phaser.Polygon([
          new Phaser.Point(0, 0),
          new Phaser.Point(this.levelSetting.corner, h / 2),
          new Phaser.Point(0, h),
          new Phaser.Point(w * this.levelSetting.scale, h),
          new Phaser.Point(w * this.levelSetting.scale + this.levelSetting.corner, h / 2),
          new Phaser.Point(w * this.levelSetting.scale, 0)
        ]);
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * i;
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0xcd451d');
        this.levelInfo[i].drawPolygon(polyAdd.points);
        style = { font: 'bold 30px sans-serif', fill: '#fff', align: 'center' };
        this.timer.beginFill('0xcd451d');
        this.timer.drawRect();
        this.updateTimer(this.levelInfo[i].x, this.levelInfo[i].y + h + 5, w * this.levelSetting.scale, this.setting[this.curLevel].duration);
        this.levelText = this.game.add.text(this.levelInfo[i].x + this.levelInfo[i].width / 2, this.levelInfo[i].y + this.levelInfo[i].height / 2 + 3, this.levelTextSource[i], style);
        this.levelText.anchor.set(0.5);
      } else if(i < n) {
        var polyAdd = new Phaser.Polygon([
          new Phaser.Point(0, 0),
          new Phaser.Point(this.levelSetting.corner, h / 2),
          new Phaser.Point(0, h),
          new Phaser.Point(w, h),
          new Phaser.Point(w + this.levelSetting.corner, h / 2),
          new Phaser.Point(w, 0)
        ]);
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * i;
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0xcd451d');
        this.levelInfo[i].drawPolygon(polyAdd.points);
        // style = { font: '22px sans-serif', fill: '#fff', align: 'center' };
      } else {
        var polyAdd = new Phaser.Polygon([
          new Phaser.Point(0, 0),
          new Phaser.Point(this.levelSetting.corner, h / 2),
          new Phaser.Point(0, h),
          new Phaser.Point(w, h),
          new Phaser.Point(w + this.levelSetting.corner, h / 2),
          new Phaser.Point(w, 0)
        ]);
        this.levelInfo[i].x = this.levelSetting.margin + this.levelSetting.gap * i + w * (i + this.levelSetting.scale - 1);
        this.levelInfo[i].clear();
        this.levelInfo[i].beginFill('0x561a0b');
        // style = { font: '22px sans-serif', fill: '#fff', align: 'center' };
        this.levelInfo[i].drawPolygon(polyAdd.points);
      }
    }
  },

  drawTimer: function() {
    this.timer = this.game.add.graphics(0, 0);
  },

  updateTimer: function(x, y, width, sec) {
    this.timerSetting.count = 0;
    this.timerSetting.sub = width / 10 / sec;
    this.timerSetting.x = x;
    this.timerSetting.y = y;
    this.timerSetting.width = width;
    this.game.time.events.repeat(Phaser.Timer.SECOND / 10, sec * 10, this.timerCountdown, this);
  },

  timerCountdown: function() {
    this.timer.clear();
    this.timer.beginFill('0xcd451d');
    this.timer.drawRect(this.timerSetting.x, this.timerSetting.y, this.timerSetting.sub * this.timerSetting.count, 10);
    this.timerSetting.count++;
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
