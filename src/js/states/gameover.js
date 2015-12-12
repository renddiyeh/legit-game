/*global require, module*/
var _ = require('lodash');
var obstacles = require('../json/obstacle');
var Gameover = function () {
  this.deathId = null;
  this.texts = {};
  this.asset = {};
  this.button = {};
};

module.exports = Gameover;

Gameover.prototype = {
  init: function(id) {
    this.deathId = id;
  },

  create: function () {
    var titleGroup = this.game.add.group();
    if(this.deathId === 0) {

      this.asset.deathPic = this.game.add.sprite(this.game.width / 2, 150, 'win-pic');
      this.asset.deathPic.animations.add('hit');
      this.asset.deathPic.animations.play('hit', 3, true);
      this.asset.titlePic = this.game.add.sprite(this.game.width / 2, 20, 'win-title');
      titleGroup.add(this.asset.titlePic);

    } else {

      this.asset.titlePic = this.game.add.sprite(this.game.width / 2, 20, 'gameover-title');
      this.asset.titleText = this.game.add.sprite(this.game.width / 2, 80, 'gameover-text-' + this.deathId);
      titleGroup.add(this.asset.titlePic);
      titleGroup.add(this.asset.titleText);
      this.asset.deathPic = this.game.add.sprite(this.game.width / 2, 150, 'gameover-death-' + this.deathId);
      
    }
    
    this.game.add.tween(this.asset.deathPic).from({
      alpha: 0
    }, 1500, Phaser.Easing.Quadratic.Out, true);

    this.game.add.tween(titleGroup).from({
      alpha: 0
    }, 1500, Phaser.Easing.Quadratic.Out, true, 750);

    var titleStyle = { font: 'bold 30px sans-serif', fill: '#000', align: 'center' };
    var descStyle = { font: '22px sans-serif', fill: '#000', align: 'center' };
    if(this.deathId === 0) {
      this.texts.subtitle = this.game.add.text(this.game.width / 2, 460, '「凡殺不死你的，必使你更強大」', titleStyle);
      this.texts.desc = this.game.add.text(this.game.width / 2, 510, '台灣的未來\n就靠你繼續監督立法院啦～', descStyle);  
    } else {
      this.texts.subtitle = this.game.add.text(this.game.width / 2, 460, obstacles[this.deathId - 1].subtitle, titleStyle);
      this.texts.desc = this.game.add.text(this.game.width / 2, 510, obstacles[this.deathId - 1].desc, descStyle);
    
    }
    
    this.game.add.tween(this.texts.subtitle).from({
      alpha: 0
    }, 1000, Phaser.Easing.Quadratic.Out, true, 1200);
    this.game.add.tween(this.texts.desc).from({
      alpha: 0
    }, 1000, Phaser.Easing.Quadratic.Out, true, 1900);

    this.button.restart = this.game.add.button(this.game.width / 2, 650, 'again', window.restart, this, 1, 0, 1);
    this.button.share = this.game.add.button(this.game.width / 2, 750, 'share', this.share, this, 1, 0, 1);
    this.button.more = this.game.add.button(this.game.width / 2, 820, 'more', this.more, this, 1, 0, 1);
    
    this.game.add.tween(this.button.restart).from({
      alpha: 0
    }, 1000, Phaser.Easing.Quadratic.Out, true, 2400);
    this.game.add.tween(this.button.share).from({
      alpha: 0
    }, 1000, Phaser.Easing.Quadratic.Out, true, 3400);
    this.game.add.tween(this.button.more).from({
      alpha: 0
    }, 1000, Phaser.Easing.Quadratic.Out, true, 3800);

    if (this.game.device.desktop && this.deathId !== 0) {
      this.button.down = this.game.add.sprite(this.game.width / 2, 910, 'down');
      this.game.add.tween(this.button.down).from({
        alpha: 0
      }, 800, Phaser.Easing.Quadratic.Out, true, 4500);
      /*this.game.add.tween(this.button.down).to({
        x: this.x + 5
      }, 500, Phaser.Easing.Quadratic.Out, true, 4000, -1, true);*/
      this.game.time.events.add(4500, function() {
        window.gameover(this.deathId);
      }, this);
    }

    _.forEach(this.asset, function(asset) {
      asset.anchor.set(0.5, 0);
    });
    _.forEach(this.texts, function(text) {
      text.anchor.set(0.5, 0);
    });
    _.forEach(this.button, function(button) {
      button.anchor.set(0.5, 0);
    });
  },

  update: function () {
  },

  share: function () {
    console.log('share');
  },

  more: function () {
    console.log('more');
  }
};
