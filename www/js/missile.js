
Missile.attack_delay = 200;

function Missile(parent)
{
    this.missiles = game.add.group();
    this.missiles.enableBody = true;
    this.missiles.physicsBodyType = Phaser.Physics.ARCADE;
    this.missiles.createMultiple(1, 'missile');
    this.sprite = null;

    this.isActiveMissile = false;
    this.parent = parent;
    this.attackTimer = false;
    this.velocity = 300;
    this.can_attack = true;
}

Missile.prototype.kill = function()
{
    this.sprite.kill();
    this.isMissileActive = false;
    this.can_attack = false;

    var self = this;
    setTimeout(function() {
        self.can_attack = true;
    }, Missile.attack_delay);
}

Missile.prototype.update = function()
{
    var self = this;
    game.physics.arcade.collide(this.sprite, layer);

    for (var e in ennemies) {
        var self = this;
        game.physics.arcade.collide(ennemies[e].sprite, this.sprite, function(){
            socket.io.emit('missileHit', {ennemy_id: e, damage: self.parent.stats.missileDamage});
            self.kill();
        });
    }

    if (this.can_attack && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) == true)
    {
        this.startMissileAttack();
    }

    if (this.isMissileActive)
    {
        this.attackMissileHandling();
    }
};

Missile.prototype.render = function(missile_data)
{
    if (!this.sprite) {
        this.sprite = this.missiles.getFirstExists(false);
    } else {
        this.sprite.reset(missile_data.x, missile_data.y);
    }
};

Missile.prototype.doSync = function()
{
    return this.sprite != null && has_moved(this.sprite);
}

Missile.prototype.serialize = function()
{
    if (!this.sprite) return null;

    return {
        x: this.sprite.x,
        y: this.sprite.y
    };
}

Missile.prototype.setAttackTimer = function()
{
    var self = this;
    this.attackTimer = true;
    setInterval(function(){
        self.attackTimer = false;
    },3000);
};

Missile.prototype.startMissileAttack = function()
{
    //On ne peut lancer un nouveau missile que si aucun autre n'est en cours de déplacement
    if (!this.isMissileActive)
    {
        var missileVelocity;
        var missileStartX;
        var missileStartY;

        if (this.parent.direction == 'left')
        {
            missileVelocity = this.velocity*-1;
            missileStartX = this.parent.sprite.x-10;
        }
        else if (this.parent.direction == 'right')
        {
            missileVelocity = this.velocity;
            missileStartX = this.parent.sprite.x+10;
        }
        missileStartY = this.parent.sprite.y+20;

        this.sprite = this.missiles.getFirstExists(false);
        if (!this.sprite) alert();
        //Coordonnées du missile par rapport au joueur qui le lance
        this.sprite.reset(missileStartX, missileStartY);
        //Rebonds
        this.sprite.body.bounce.y = 0.7;
        this.sprite.body.bounce.x = 0.6;
        //Vitesse
        this.sprite.body.velocity.x = missileVelocity;
        //Gravité
        this.sprite.body.gravity.y = 100;

        this.isMissileActive = true;
    }
};

//Gère la vitesse du missile
Missile.prototype.attackMissileHandling = function()
{
    if (this.sprite.body.velocity.x > 0)
    {
        this.sprite.body.velocity.x = parseInt(--this.sprite.body.velocity.x, 10);
    }
    else if (this.sprite.body.velocity.x < 0)
    {
        this.sprite.body.velocity.x = parseInt(++this.sprite.body.velocity.x, 10);
    }
    else
    {
        //Fin du déplacement : le missile disparait et on peut à nouveau en lancer un
        this.kill();
    }

    if (this.isInvisible()) {
        this.kill();
    }
};

Missile.prototype.isInvisible = function()
{
    var missile = this.sprite.body;
    var game_padding = 100;

    var left_bound = 0 - game_padding + game.camera.view.x;
    var right_bound = game.width + game_padding + game.camera.view.x;
    var top_bound = 0 - game_padding + game.camera.view.y;
    var bot_bound = game.height + game_padding + game.camera.view.y;

    var is_left = missile.x < left_bound;
    var is_right = missile.x > right_bound;
    var is_top = missile.y < top_bound;
    var is_bot = missile.y > bot_bound;

    return is_left || is_right || is_top || is_bot;
};
