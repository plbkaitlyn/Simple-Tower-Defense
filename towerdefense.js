const MAP_HEIGHT = 400;
const MAP_WIDTH = 400;
const OBJECT_SIZE = 20;
const BULLET_SIZE = 4;
const ENEMY_COUNT = 5;
const ENEMY_LIFE = 50;
const TURRET_DAMAGE = 50;
const BULLET_SPEED = 5;
const DIRECTION_UP = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_RIGHT = 4;
const OBJECT_HOME = "h";
const OBJECT_TURRET = "t";

var gameStarted = false;
var enemyWins = false;
var enemyCount = ENEMY_COUNT;
var enemyLife = ENEMY_LIFE;
var enemyObjects = [];
var staticObjects = [];
var bulletObjects = [];

function cellObject(x, y, type) {
    this.type = type;
    this.image = new Image();
    if (this.type == OBJECT_TURRET) {
        this.image.src = "turret.png";
    }
    else {
        this.image.src = "home.gif";
    }
    this.width = OBJECT_SIZE;
    this.height = OBJECT_SIZE;
    this.x = x;
    this.y = y;
    this.update = function () {
        var context = gameArea.context;
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function enemyObject(direction, directionChangeInterval) {
    this.image = new Image();
    this.image.src = "enemy.gif";
    this.width = OBJECT_SIZE;
    this.height = OBJECT_SIZE;
    this.x = 0;
    this.y = 0;
    this.life = enemyLife;
    this.direction = direction;
    this.directionChangeInterval = directionChangeInterval;
    this.update = function () {
        if (this.life > 0) {
            var context = gameArea.context;
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

function bulletObject(x, y, direction) {
    this.image = new Image();
    this.image.src = "bullet.png";
    this.speed = BULLET_SPEED;
    this.width = BULLET_SIZE;
    this.height = BULLET_SIZE;
    this.x = x;
    this.y = y;
    this.isAlive = true;
    this.direction = direction;
    this.update = function () {
        if (this.isAlive == true) {
            var context = gameArea.context;
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

var gameArea = {
    canvas: document.createElement("canvas"),
    init: function () {
        this.context = this.canvas.getContext("2d");
        this.canvas.width = MAP_WIDTH;
        this.canvas.height = MAP_HEIGHT;
        this.canvas.style.backgroundColor = "#e8e3e3";
        this.canvas.style.border = "1px solid black";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);        
    },
    start: function () {
        gameStarted = true;
        this.interval = setInterval(updateGame, 20);
    },
    stop: function () {
        gameStarted = false;
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGame() {
    gameArea.clear();
    // Draw turrets and home
    for (var i = 0; i < staticObjects.length; i++) {
        staticObjects[i].update();
    }
    // Move enemies
    for (var i = 0; i < enemyObjects.length; i++) {
        if (enemyObjects[i].life > 0) {
            enemyObjects[i].directionChangeInterval -= 1;
            if (enemyObjects[i].directionChangeInterval == 0) {
                changeEnemyDirection(i);
            }
            switch (enemyObjects[i].direction) {
                case DIRECTION_DOWN:
                    if (enemyObjects[i].y + OBJECT_SIZE < MAP_HEIGHT) {
                        enemyObjects[i].y += 1;
                    }
                    else {
                        changeEnemyDirection(i);
                    }
                    break;
                case DIRECTION_RIGHT:
                    if (enemyObjects[i].x + OBJECT_SIZE < MAP_WIDTH) {
                        enemyObjects[i].x += 1;
                    }
                    else {
                        changeEnemyDirection(i);
                    }
                    break;
            }
            // Is on fire?
            for (var j = 0; j < staticObjects.length; j++) {
                if (staticObjects[j].type == OBJECT_TURRET) {
                    openFire(enemyObjects[i], staticObjects[j], staticObjects[j].type);
                }
            }
            // Does enemy win?
            if (enemyObjects[i].x + OBJECT_SIZE >= MAP_WIDTH && enemyObjects[i].y + OBJECT_SIZE >= MAP_HEIGHT) {
                enemyWins = true;
            }
            enemyObjects[i].update();
        }
    }
    // Shoot bullets
    for (var k = 0; k < bulletObjects.length; k++) {
        if (bulletObjects[k].isAlive == true) {
            switch (bulletObjects[k].direction) {
                case DIRECTION_UP:
                    bulletObjects[k].y -= bulletObjects[k].speed;
                    break;
                case DIRECTION_DOWN:
                    bulletObjects[k].y += bulletObjects[k].speed;
                    break;
                case DIRECTION_LEFT:
                    bulletObjects[k].x -= bulletObjects[k].speed;
                    break;
                case DIRECTION_RIGHT:
                    bulletObjects[k].x += bulletObjects[k].speed;
                    break;
            }
            if (hitSomething(bulletObjects[k]) == true) {
                bulletObjects[k].isAlive = false;
            }
            bulletObjects[k].update();
        }
    }
    // Game over?
    if (enemyWins == true) {
        gameOver("Game Over!", "#8a0c0c");
    }
    if (enemyCount <= 0) {
        gameOver("You Win!", "#0d4f18");
    }
}

function openFire(enemyObject, turretObject) {    
    if (enemyObject.x + (OBJECT_SIZE / 2) == turretObject.x) {
        // Up
        if (enemyObject.y + OBJECT_SIZE < turretObject.y) {
            bulletObjects[bulletObjects.length] = new bulletObject(turretObject.x + (OBJECT_SIZE / 2), turretObject.y, DIRECTION_UP);
        }
        // Down
        if (enemyObject.y > turretObject.y + OBJECT_SIZE) {
            bulletObjects[bulletObjects.length] = new bulletObject(turretObject.x + (OBJECT_SIZE / 2), turretObject.y + OBJECT_SIZE, DIRECTION_DOWN);
        }
    }
    if (enemyObject.y + (OBJECT_SIZE / 2) == turretObject.y) {
        // Left
        if (enemyObject.x + OBJECT_SIZE < turretObject.x) {
            bulletObjects[bulletObjects.length] = new bulletObject(turretObject.x, turretObject.y + (OBJECT_SIZE / 2), DIRECTION_LEFT);
        }
        // Right
        if (enemyObject.x > turretObject.x + OBJECT_SIZE) {
            bulletObjects[bulletObjects.length] = new bulletObject(turretObject.x + OBJECT_SIZE, turretObject.y + (OBJECT_SIZE / 2), DIRECTION_RIGHT);
        }
    }
}

function hitSomething(bulletObject) {
    for (var j = 0; j < enemyObjects.length; j++) {
        if (enemyObjects[j].life > 0) {
            // Hit an enemy?
            if (bulletObject.x >= enemyObjects[j].x && bulletObject.x <= enemyObjects[j].x + enemyObjects[j].width &&
                bulletObject.y >= enemyObjects[j].y && bulletObject.y <= enemyObjects[j].y + enemyObjects[j].height) {
                enemyObjects[j].life -= TURRET_DAMAGE;
                // The enemy is killed?
                if (enemyObjects[j].life <= 0) {
                    enemyCount = enemyCount - 1;
                }
                return true;
            }
        }
    }
    // Hit map's boundary?
    if (bulletObject.x <= 0 || bulletObject.x + OBJECT_SIZE >= MAP_WIDTH ||
        bulletObject.y <= 0 || bulletObject.y + OBJECT_SIZE >= MAP_HEIGHT) {
        return true;
    }
    return false;
}

function changeEnemyDirection(index) {
    if (enemyObjects[index].direction == DIRECTION_DOWN) {
        if (enemyObjects[index].x + OBJECT_SIZE < MAP_WIDTH) {
            enemyObjects[index].direction = DIRECTION_RIGHT;
        }
    }
    else {
        if (enemyObjects[index].y + OBJECT_SIZE < MAP_HEIGHT) {
            enemyObjects[index].direction = DIRECTION_DOWN;
        }
    }
    enemyObjects[index].directionChangeInterval = Math.floor((Math.random() * 200) + 1);
}

function gameOver(text, color) {    
    gameArea.stop();
    var startButton = document.getElementById("startButton");
    startButton.disabled = true;
    var result = document.createElement("div");
    result.setAttribute("class", "gameOver");
    result.style.backgroundColor = color;
    result.innerText = text;
    document.body.appendChild(result);
}

function createGame() {
    // Create control panel
    var controlPanel = document.createElement("div");
    controlPanel.setAttribute("id", "controlPanel");
    controlPanel.setAttribute("class", "controlPanel");
    controlPanel.style.left = MAP_WIDTH + 20 + "px";
    document.body.appendChild(controlPanel);

    // Start button
    var startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.setAttribute("class", "panelButton");
    startButton.innerHTML = "Start";
    startButton.addEventListener("click", function (event) {
        if (gameStarted == false) {
            event.target.innerHTML = "Pause";            
            gameArea.start();
        }
        else {
            event.target.innerHTML = "Start";            
            gameArea.stop();
        }
    }, false);
    controlPanel.appendChild(startButton);
    controlPanel.appendChild(document.createElement("br"));

    // Reload button
    var reloadButton = document.createElement("button");
    reloadButton.setAttribute("class", "panelButton");
    reloadButton.innerHTML = "Reload";
    reloadButton.addEventListener("click", function (event) {
        document.location.reload();
    }, false);
    controlPanel.appendChild(reloadButton);
    controlPanel.appendChild(document.createElement("br"));

    // Create enemy
    enemyObjects = [];
    enemyLife = ENEMY_LIFE;
    enemyCount = ENEMY_COUNT;
    for (var i = 0; i < enemyCount; i++) {
        var randomNumber = Math.floor((Math.random() * 200) + 1);
        enemyObjects[i] = new enemyObject(randomNumber % 2, randomNumber);
    }

    // Create turret & home
    staticObjects[staticObjects.length] = new cellObject((MAP_WIDTH - OBJECT_SIZE) / 2, (MAP_HEIGHT - OBJECT_SIZE) / 2, OBJECT_TURRET);
    staticObjects[staticObjects.length] = new cellObject(MAP_WIDTH - OBJECT_SIZE, MAP_HEIGHT - OBJECT_SIZE, OBJECT_HOME);
}

window.onload = function () {
    gameArea.init();
    createGame();
}
