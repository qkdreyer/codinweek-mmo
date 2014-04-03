
var control =
{

    moveButton: '',
    buttons: null,

    initMoveButton: function()
    {
        const CONTROL_BUTTON_X = 20;
        const CONTROL_BUTTON_Y = game.height-20;

        var self = this;

        // Create action buttons
        this.buttons = game.add.group(); // Create group placed on 10/10 in the world.
        this.buttons.fixedToCamera = true;
        this.buttons.enableBody = false;
        this.buttons.x = CONTROL_BUTTON_X;
        this.buttons.y = CONTROL_BUTTON_Y;
        var upButton = this.buttons.create(this.buttons.x+25, this.buttons.y-50, 'control-up');
        var leftButton = this.buttons.create(this.buttons.x, this.buttons.y-25, 'control-left');
        var rightButton = this.buttons.create(this.buttons.x+50, this.buttons.y-25, 'control-right');
        upButton.inputEnabled = true;
        upButton.events.onInputDown.add(function(){
            self.moveButton = 'up';
        });
        leftButton.inputEnabled = true;
        leftButton.events.onInputDown.add(function(){
            self.moveButton = 'left';
        });
        rightButton.inputEnabled = true;
        rightButton.events.onInputDown.add(function(){
            self.moveButton = 'right';
        });
        leftButton.events.onInputUp.add(function(){
            self.moveButton = '';
        });
        rightButton.events.onInputUp.add(function(){
            self.moveButton = '';
        });
        upButton.events.onInputUp.add(function(){
            self.moveButton = '';
        });
    }
};