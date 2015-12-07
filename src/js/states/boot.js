/*global module*/
var Boot = function () {
  this.orientated = false;
};

module.exports = Boot;

Boot.prototype = {

    init: function () {

        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(320, 504, 600, 945);
            this.scale.pageAlignHorizontally = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(320, 504, 600, 945);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }
        this.scale.setResizeCallback(this.gameResized, this);

    },

    preload: function() {
        this.load.image('preloader', 'assets/preloader.gif');
    },

    create: function () {

        this.state.start('Preloader');
        this.game.stage.backgroundColor = '#cd451d';
        document.getElementById('legi-game').style.display = 'block';
        window.gameoverResize(this.scale.height, this.scale.width);
        window.gameoverButtonResize(this.scale.scaleFactorInversed);

    },

    gameResized: function () {
        if (this.game.device.desktop) {
            window.gameoverButtonResize(this.scale.scaleFactorInversed);
            window.gameoverResize(this.scale.height, this.scale.width);
        }
    },

    enterIncorrectOrientation: function () {

        this.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        this.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }
};
