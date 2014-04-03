/* MANAGE COLLISIONS FOR PLAYER */

//Generic function for hit comestible objects
function hitComestibleObject(sprite, tile, score) {

    //Seulement pour le joueur
    if (sprite.key == "player")
    {
        tile.index = 1;
        scoreText.text = 'Score: ' + score;
    }

}

function hitMushroom(sprite, tile) {
    score += 40;
    return hitComestibleObject(sprite, tile, score);
}

function hitCoin(sprite, tile) {
    score += 10;
    return hitComestibleObject(sprite, tile, score);
}

var physics =
{
    init: function(mapInstance) {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#787878';
        game.physics.arcade.gravity.y = 250;

        //COLLISIONS
        mapInstance.setCollisionBetween(15, 16);
        mapInstance.setCollisionBetween(20, 25);
        mapInstance.setCollisionBetween(27, 29);
        //Ground collision
        mapInstance.setCollision(40);
        //"?" blocks
        mapInstance.setCollision(14);
        // Overlap functions
        mapInstance.setTileIndexCallback(11, hitCoin, this);
        mapInstance.setTileIndexCallback(12, hitMushroom, this);      
        mapInstance.setTileIndexCallback(18, hitMushroom, this);     
    },

    update: function() {
        
        game.physics.arcade.collide(player.sprite, layer);
        player.sprite.body.velocity.x = 0;        

    }
};
