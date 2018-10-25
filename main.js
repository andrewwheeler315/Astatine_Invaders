var Alien = function(aType, aLine, aCol) {
    this.type = aType;
    this.points = 40 - 10 * aType;
    this.line = aLine;
    this.column = aCol;
    this.alive = true;
    this.height = 20;
    this.width = 28;
    this.positionX = 100 + this.width * this.column;
    this.positionY = 100 + 30 * this.line;
    this.direction = 1;
    this.state = 0;

    this.changeState = function() {
        this.state = !this.state ? 20 : 0;
    };

    this.down = function() {
        this.positionY = this.positionY + 10;
    };

    this.move = function() {
        if (this.positionY >= Game.height - 50) {
            Game.over();
        }
        this.positionX = this.positionX + 5 * Game.direction;
        this.changeState();
        if (this.alive) this.draw();
    };
    this.checkCollision = function() {
        if (Gun.ray.active == true && this.alive == true) {
            if (
                Gun.ray.positionX >= this.positionX &&
                Gun.ray.positionX <= this.positionX + this.width &&
                (Gun.ray.positionY >= this.positionY &&
                    Gun.ray.positionY <= this.positionY + this.height)
            ) {
                this.kill();
                Gun.ray.destroy();
            }
        }
    };

    this.draw = function() {
        if (this.alive) {
            canvas.drawImage(
                pic,
                this.width * (this.type - 1),
                this.state,
                this.width,
                this.height,
                this.positionX,
                this.positionY,
                this.width,
                this.height
            );
        } else if (this.alive == null) {
            canvas.drawImage(
                pic,
                85,
                20,
                28,
                20,
                this.positionX,
                this.positionY,
                this.width,
                this.height
            );
            this.alive = false;
        }
    };

    this.kill = function() {
        this.alive = null;
        canvas.clearRect(
            this.positionX,
            this.positionY,
            this.width,
            this.height
        );
        Game.refreshScore(this.points);
    };
};

Gun = {
    position: 220,
    to_left: false,
    to_right: false,

    init: function() {
        this.draw();
        this.to_Left();
        this.to_Right();
        setInterval("Gun.to_Left()", 30);
        setInterval("Gun.to_Right()", 30);
    },

    draw: function() {
        canvas.drawImage(pic, 85, 0, 28, 20, this.position, 470, 28, 20);
    },

    fire: function() {
        this.ray.create();
    },

    to_Left: function() {
        if (this.to_left) {
            if (this.position - 5 > 0) {
                canvas.clearRect(0, 472, Game.width, 28);
                this.position -= 5;
                this.draw();
            }
        }
    },

    to_Right: function() {
        if (this.to_right) {
            if (this.position + 30 < Game.width) {
                canvas.clearRect(0, 472, Game.width, 28);
                this.position += 5;
                this.draw();
            }
        }
    },

    ray: {
        positionX: 0,
        positionY: 465,
        length: 5,
        speed: 15,
        animation: null,
        active: false,
        create: function() {
            if (!this.active) {
                this.positionX = Gun.position + 14;
                this.active = true;
                this.animation = setInterval("Gun.ray.animate()", this.speed);
            }
        },
        animate: function() {
            this.positionY -= this.length;
            if (this.positionY <= 5) this.destroy();
            else {
                Game.drawAliens();
                this.draw();
            }
        },
        draw: function() {
            if (this.active) {
                canvas.beginPath();
                canvas.strokeStyle = "white";
                canvas.lineWidth = 2;
                canvas.moveTo(this.positionX, this.positionY);
                canvas.lineTo(this.positionX, this.positionY + this.length);
                canvas.stroke();

                for (i = 0; i < 5; i++) {
                    for (j = 0; j < 11; j++) {
                        Game.aliens[i][j].checkCollision();
                    }
                }
            }
        },
        destroy: function() {
            this.positionY = 465;
            this.active = false;
            clearInterval(this.animation);
            this.animation = null;
            Game.drawAliens();
        }
    }
};

Game = {
    types: [1, 2, 2, 3, 3],
    aliens: [[11], [11], [11], [11], [11]],
    height: 0,
    width: 0,
    interval: 0,
    intervalDefault: 1000,
    direction: 1,
    animation: null,
    alives: 1,
    score: 0,
    level: 1,

    init: function(aWidth, aHeight) {
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j] = new Alien(this.types[i], i, j);
                this.alives++;
                this.aliens[i][j].draw();
            }
        }
        this.width = aWidth;
        this.height = aHeight;
        this.play();
        Gun.init();
        this.refreshScore(0);
        document.getElementById("level").innerHTML = this.level;
        document.getElementById("inter").innerHTML = this.interval;
    },

    changeDirection: function() {
        if (this.direction == 1) {
            this.direction = -1;
        } else {
            this.direction = 1;
        }
    },
    clearCanvas: function() {
        canvas.clearRect(0, 0, this.width, this.height - 28);
    },
    closeTo_Left: function() {
        return this.aliens[0][0].positionX - 10 < 0 ? true : false;
    },
    closeTo_Right: function() {
        return this.aliens[4][10].positionX + 35 > this.width ? true : false;
    },
    drawAliens: function() {
        this.clearCanvas();
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].draw();
            }
        }
    },
    animate: function() {
        this.clearCanvas();
        Gun.ray.draw();
        this.checkAliens();
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].move();
            }
        }
        if (this.closeTo_Left() || this.closeTo_Right()) {
            this.changeDirection();
            for (i = 0; i < 5; i++) {
                for (j = 0; j < 11; j++) {
                    this.aliens[i][j].down();
                }
            }
            this.increaseSpeed();
        }
    },
    play: function() {
        this.interval = this.intervalDefault;
        this.interval = this.interval - this.level * 20;
        this.animation = setInterval("Game.animate()", this.interval);
    },
    increaseSpeed: function(newInterval) {
        clearInterval(this.animation);
        if (newInterval === undefined) this.interval = this.interval - 10;
        else this.interval = newInterval;

        this.animation = setInterval("Game.animate()", this.interval);
        document.getElementById("inter").innerHTML = this.interval;
    },
    onkeydown: function(ev) {
        if (ev.keyCode == 37) Gun.to_left = true;
        else if (ev.keyCode == 39) Gun.to_right = true;
        else if (ev.keyCode == 32) Gun.fire();
        else return;
    },
    onkeyup: function(ev) {
        if (ev.keyCode == 37) Gun.to_left = false;
        else if (ev.keyCode == 39) Gun.to_right = false;
        else return;
    },
    over: function() {
        clearInterval(this.animation);
        canvas.clearRect(0, 0, this.width, this.height);
        canvas.font = "40pt Calibri,Geneva,Arial";
        canvas.strokeStyle = "rgb(FF,0,0)";
        canvas.fillStyle = "rgb(0,20,180)";
        canvas.strokeText(
            "Game Over",
            this.width / 2 - 150,
            this.height / 2 - 10
        );
    },
    checkAliens: function() {
        if (this.alives == 0) this.nextLevel();
        else if (this.alives <= 10) this.increaseSpeed(100 - this.level * 10);
        else if (this.alives <= 15) this.increaseSpeed(150 - this.level * 10);
        else if (this.alives <= 20) this.increaseSpeed(200 - this.level * 10);
        else if (this.alives <= 25) this.increaseSpeed(250 - this.level * 10);
        else if (this.alives <= 30) this.increaseSpeed(300 - this.level * 10);
        else if (this.alives <= 35) this.increaseSpeed(350 - this.level * 10);
        else if (this.alives <= 40) this.increaseSpeed(400 - this.level * 10);
        else if (this.alives <= 45) this.increaseSpeed(500 - this.level * 10);
        else if (this.alives <= 50) this.increaseSpeed(600 - this.level * 10);
    },
    refreshScore: function(points) {
        this.alives--;
        this.score += points;
        document.getElementById("score").innerHTML = this.score;
        document.getElementById("alives").innerHTML = this.alives;
    },
    nextLevel: function() {
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].alive = true;
                this.alives++;
            }
        }
        clearInterval(this.animation);
        this.level++;
        document.getElementById("level").innerHTML = this.level;
        this.play();
        this.increaseSpeed(this.interval);
        document.getElementById("inter").innerHTML = this.interval;
    }
};

var element = document.getElementById("aliensCanvas");
if (element.getContext) {
    var canvas = element.getContext("2d");
    canvas

    var pic = new Image();
    pic.src = "sprite.png";

    Game.init(530, 500);

    document.body.onkeydown = function(event) {
        Game.onkeydown(event);
    };
    document.body.onkeyup = function(event) {
        Game.onkeyup(event);
    };
}
