(function(exports) {
    exports.socket = {
        io: null,
        debug: false,
        log: function() {
            if (this.debug) console.log.apply(console, arguments);
        },
        init: function() {
            if (typeof exports.io === "undefined") return false;
            
            var self = this;
            
            this.io = io.connect();
            this.log('Connecting to Server');

            // When current client is connected

            this.io.on('connection', function (data) {
                player.userid = data.userid;
                players[data.userid] = player;

                // data.clients = hash of connected players
                var connected_players = data.clients;
                for (var id in connected_players) {
                    var coordinates = connected_players[id];
                    players[id] = new Player(coordinates.x, coordinates.y);
                }

                self.log('Client Connected');
            });

            // When another client is connected
            this.io.on('client_connected', function (player_data) {
                self.log('client_connected', player_data);
            });

            // When current client id disconnected
            this.io.on('client_disconnected', function (player_data) {
                var player_id = player_data.userid;
                self.log('client_disconnected', player_id, player_data);

                if (players[player_id]) {
                    players[player_id].kill();
                    delete players[player_id];
                }
            });

            this.io.on('client_moved', function(player_data) {
                var player_id = player_data.id;
                self.log('client_moved', player_id, player_data);

                if (!players[player_id]) {
                    players[player_id] = new Player(player_data.x, player_data.y);
                }
                players[player_id].render(player_data);
                
            });

            this.io.on('server_data', function(server_data) {
                var ennemies_data = server_data[0];
                var items_data = server_data[1];
                
                Ennemy.handle_server_data(ennemies_data);
            });

            this.io.on('server_start', function() {
                /*console.log("ss");
                for (var p in players) {
                    if (p != players[p]) {
                        players[p].kill();
                    }
                }*/
            });
            
            return true;
        },

        sync: function(player) {
            var player_data = player.serialize();
            this.io.emit('client_moved', player_data);
            this.log("player_moved", player_data);
        }
    };
})(window);