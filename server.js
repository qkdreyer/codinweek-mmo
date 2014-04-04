var express = require('express.io');
var uuid = require('node-uuid');
var util = require('util');
var _ = require('underscore');

var app = express();
var port = 8200;
var server = app.http().io().listen(port);

var clients = {};
var clients_count = 0;
var log_level = 1;

app.get(/^(?!.*\.map$)/, function(req, res) {
	res.sendfile(__dirname + '/www/' + req.url);
}),
console.log('Server listening at localhost:' + port);

app.io.route('connection', function (req) {
	// generate unique userid
	var userid = uuid();
	req.userid = userid;
	clients_count++;
     
    //assigning client to userid
    req.io.emit('connection', {userid: userid, clients: clients});
	console.log('client connected', userid, clients_count);

    //notifying other clients of client connection
    req.io.broadcast('client_connected', {userid: userid});

	req.io.route('client_moved', function (player_data) {
		clients[player_data.id] = player_data;
		req.broadcast.emit('client_moved', player_data);
	});

	req.io.route('disconnect', function () {
		console.log('client disconnected', req.userid, clients_count);
		delete clients[req.userid];
		clients_count--;
		io.reqs.emit('client_disconnected', {userid: req.userid});
	});

	req.io.route('missileHit', handle_ennemy_hit);
	req.io.route('playerHit', handle_ennemy_collision.bind(req, 1));
	req.io.route('ennemyHit', handle_ennemy_collision.bind(req, 2));
	req.io.route('obstacleHit', handle_ennemy_collision.bind(req, 3));

	//req.set("heartbeat timeout", 10);
	//req.set("heartbeat interval", 5);
});

/*
req.io.join(room) - The client for the request joins room.
req.io.leave(room) - The client for the request leaves room.
req.io.room(room).broadcast(event, data) - Broadcast to all client in the room except for the current one.
app.io.room(room).broadcast(event, data) - Broadcast to all clients in the room.
*/

app.io.broadcast("server_start");

app.io.set('log level', log_level);

var game_loop = 0;
var ennemies_data = {}
var other_data = [];

var add_ennemy = function(key, x, y, hp, dir) {
	var ennemy_id = uuid();

	ennemies_data[ennemy_id] = {
		"id": ennemy_id,
		"x": x,
		"y": y,
		"hp": hp,
		"key": key,
        "dir": dir
	}
}

//add_ennemy('dragon', 50, 145, 200, -1);
add_ennemy('shroom', 350, 172, 150, 1);
//add_ennemy('baddie', 100, 175, 100, 1);

var handle_ennemy_collision = function(collision_type, collision_data) {
	var ennemy_id = collision_data.ennemy_id;
	var angle = collision_data.angle;

	console.log('EVENT handle_ennemy_collision', ennemy_id, angle, collision_type, collision_data);

    if (!ennemies_data[ennemy_id]) {
		console.warn('handle_ennemy_collision ennemy_id undefined');
		return;
    }

    ennemies_data[ennemy_id].dir *= -1;
};

var handle_ennemy_hit = function(hit_data) {
	var ennemy_id = hit_data.ennemy_id;
	var damage = hit_data.damage;

	console.log('EVENT handle_ennemy_hit', ennemy_id, damage);

	if (!ennemies_data[ennemy_id]) {
		console.warn('handle_ennemy_hit ennemy_id undefined');
		return;
	}

	ennemies_data[ennemy_id].hp -= damage;
};

var update_generate_data = function(ennemy_data) {
	if (ennemy_data.dir == 1) {
		ennemy_data.x += 1;
	} else {
		ennemy_data.x -= 1;
	}

	if (ennemy_data.x < 0) {
		ennemy_data.dir = 1;
	} else if (ennemy_data.x > 400) {
		ennemy_data.dir = -1;
	}

	if (ennemy_data.hp <= 0) {
		delete ennemies_data[ennemy_data.id];
	}

	return ennemy_data.hp > 0 ? ennemy_data : null;
}
	
var generate_server_data = function() {

	var ennemy_count = 0;
	_.each(ennemies_data, function(ennemy_data, ennemy_id) {
		var new_ennemy_data = update_generate_data(ennemy_data);
		if (new_ennemy_data) {
			ennemies_data[ennemy_id] = new_ennemy_data;
			ennemy_count++;
		}
	});

	if (ennemy_count < 3) {
		var x_rnd = parseInt(100 * Math.random(), 10);
		add_ennemy('baddie', x_rnd, 175, 100, 'left');
	}

	var server_data = {};
	server_data[0] = ennemies_data;
	server_data[1] = other_data;

	app.io.broadcast('server_data', server_data);
}

setInterval(generate_server_data, 50);
