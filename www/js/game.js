var game
var layer;
var scoreText;
var score;
var player;
var players;
var ennemies;

function init()
{
    if (game) game.physics.destroy();
    setTimeout(function() {
    
        game = new Phaser.Game(460, 320, Phaser.CANVAS, 'phaser-example', {
            preload: preload,
            create: create, update: update,
            render: render
        });

        score = 0;
        players = {};
        ennemies = {};

        console.log("game init");
    }, 1000);
}

function preload()
{
    game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
    game.load.image('star', 'assets/star.png');

    // Player
    game.load.spritesheet('player', 'assets/dude.png', 32, 48);
    game.load.image('playerLifeBarFrame', 'assets/players/playerLifeBarFrame.png');
    game.load.image('playerLifeBar', 'assets/players/playerLifeBar.png');
    game.load.image('missile', 'assets/games/invaders/enemy-bullet.png');

    // Controls
    game.load.image('control-left', 'assets/controls/left.png');
    game.load.image('control-right', 'assets/controls/right.png');
    game.load.image('control-up', 'assets/controls/up.png');

    // Monsters
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
    game.load.spritesheet('dragon', 'assets/dragon.png', 96, 64);
    game.load.spritesheet('shroom', 'assets/shroom.png', 38, 38);

    //Life Bar
    game.load.image('lifeBarFrame', 'assets/lifeBarFrame.png');
    game.load.image('ennemyLifeBar', 'assets/ennemyLifeBar.png');
    game.load.image('allyLifeBar', 'assets/allyLifeBar.png');
}

function create()
{

    if (this.game.device.desktop)
    {
        $('#restart').show();
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);
    } else {
        this.stage.scale.forceLandscape = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 480;
        this.scale.minHeight = 260;
        this.scale.maxWidth = 1024;
        this.scale.maxHeight = 768;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.forceOrientation(true, false);
        this.scale.setScreenSize(true);
    }

    //MAP
    var mapInstance = map.init();

    //PHYSICS
    physics.init(mapInstance);

    //SPRITES
    player = new Player(null,null,true);

    //SCORE
    scoreText = game.add.text(16, 46, 'score: 0', { fontSize: '32px', fill: '#000' });

    //CAMERA
    game.camera.follow(player.sprite);
    scoreText.fixedToCamera = true;

    //CONTROl
    control.initMoveButton();   
   
    //SOCKET
    socket.init();

    // Single Player
    if (typeof io != "undefined") players[1] = player;
}

function update()
{    
    physics.update();
    player.update();

    for (var ennemyId in ennemies) {
		ennemies[ennemyId].update();
	}

    if (socket.io && player.doSync())
    {
        socket.sync(player);
    }    
}

function render()
{
    // game.debug.body(player);
    //
    //game.debug.bodyInfo(player, 32, 320);
}
