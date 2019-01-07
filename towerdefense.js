const MAP_HEIGHT = 30;
const MAP_WIDTH = 30;
const CELL_SIZE = 20;
const ENEMY_COUNT = 5;
const ENEMY_LIFE = 180;
const DIRECTION_DOWN = 0;
const DIRECTION_RIGHT = 1;

var intervalId = null;
var gameStarts = false;
var enemyWins = false;
var enemyCount = ENEMY_COUNT;
var enemyObjects = [];
var cellObjects = [];

function createMap() {
    // Create map
    for (var y = 0; y < MAP_HEIGHT; y++) {
        for (var x = 0; x < MAP_WIDTH; x++) {
            var cellId = "mapCell_" + x + "_" + y;
            var cellIndex = x + y * MAP_WIDTH;
            var cellObject = { id: cellId, index: cellIndex, x: CELL_SIZE * x, y: CELL_SIZE * y};
            cellObjects[cellIndex] = cellObject;
            var mapCell = document.createElement("div");
            mapCell.setAttribute("id", cellId);
            mapCell.setAttribute("class", "mapCell");
            mapCell.style.left = cellObject.x + "px";
            mapCell.style.top = cellObject.y + "px";
            if (y == MAP_HEIGHT - 1 && x == MAP_WIDTH - 1) {
                mapCell.innerHTML = "<img src='home.gif'>";
            }
            else {
                mapCell.addEventListener("dragover", function (event) {
                    event.preventDefault();
                }, false);
                mapCell.addEventListener("drop", function (event) {
                    event.preventDefault();
                    if (gameStarts == true) {
                        var data = event.dataTransfer.getData("text");
                        event.target.style.backgroundImage = "url('turret.png')";
                    }
                }, false);
            }
            document.body.appendChild(mapCell);
        }
    }

    // Create control panel
    var controlPanel = document.createElement("div");
    controlPanel.setAttribute("id", "controlPanel");
    controlPanel.setAttribute("class", "controlPanel");
    controlPanel.style.left = MAP_WIDTH * CELL_SIZE + 10 + "px";
    document.body.appendChild(controlPanel);


    // Turret
    var turretImage = document.createElement("img");
    turretImage.setAttribute("src", "turret.png");
    turretImage.setAttribute("class", "panelImage");
    turretImage.addEventListener("dragstart", function (event) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text", "turret");
    }, false);
    controlPanel.appendChild(turretImage);

    var turretText = document.createElement("span");
    turretText.innerText = "  Drag this image to the map to create a turret.";
    controlPanel.appendChild(turretText);
    controlPanel.appendChild(document.createElement("br"));
    controlPanel.appendChild(document.createElement("br"));

    // Start button
    var startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.setAttribute("class", "panelButton");
    startButton.innerHTML = "Start";
    startButton.addEventListener("click", function (event) {
        if (gameStarts == false) {
            event.target.innerHTML = "Pause";
            gameStarts = true;
            start();
        }
        else {
            event.target.innerHTML = "Start";
            gameStarts = false;
            clearInterval(intervalId);
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

    // Create enemies
    for (var i = 0; i < ENEMY_COUNT; i++) {
        var enemy = document.createElement("div");
        enemy.setAttribute("id", "enemy_" + i);
        enemy.setAttribute("class", "enemy");
        document.body.appendChild(enemy);
        var randomNumber = Math.floor((Math.random() * 200) + 1);
        var enemyObject = { id: "enemy_" + i, index: i, life: ENEMY_LIFE, x: 0, y: 0, direction: randomNumber % 2, turnCountDown: randomNumber };
        enemyObjects[i] = enemyObject;
    }
}

function start() {
    intervalId = setInterval(function () {
        // Clear all lines of fire
        for (var z = 0; z < cellObjects.length; z++) {
            var mapCell = document.getElementById(cellObjects[z].id);
            mapCell.style.backgroundColor = "#e8e3e3";
        }
        // Enemies move
        for (var i = 0; i < ENEMY_COUNT; i++) {
            if (enemyObjects[i].life > 0) {
                var enemy = document.getElementById("enemy_" + i);
                enemyObjects[i].turnCountDown = enemyObjects[i].turnCountDown - 1;
                if (enemyObjects[i].turnCountDown == 0) {
                    changeEnemyDirection(i);
                }
                switch (enemyObjects[i].direction) {
                    case DIRECTION_DOWN:
                        if (enemyObjects[i].y >= (MAP_HEIGHT * CELL_SIZE) - CELL_SIZE - 1) {
                            changeEnemyDirection(i);
                        }
                        enemyObjects[i].y = enemyObjects[i].y + 1;
                        enemy.style.top = enemyObjects[i].y + "px";
                        break;
                    case DIRECTION_RIGHT:
                        if (enemyObjects[i].x >= (MAP_WIDTH * CELL_SIZE) - CELL_SIZE - 1) {
                            changeEnemyDirection(i);
                        }
                        enemyObjects[i].x = enemyObjects[i].x + 1;
                        enemy.style.left = enemyObjects[i].x + "px";
                        break;
                }
                // Is any on fire?
                for (var j = 0; j < cellObjects.length; j++) {
                    var mapCell = document.getElementById(cellObjects[j].id);
                    if (mapCell.style.backgroundImage != "") {
                        if (fireEnemy(enemyObjects[i], cellObjects[j]) == true) {
                            enemyObjects[i].life = enemyObjects[i].life - 1;
                            if (enemyObjects[i].life == 0) {
                                var enemy = document.getElementById(enemyObjects[i].id);
                                enemy.style.display = "none";
                                enemyCount = enemyCount - 1;
                            }
                        }
                    }
                }
                // Does enemy win?
                if (enemyObjects[i].x + CELL_SIZE > cellObjects[MAP_HEIGHT * MAP_WIDTH - 1].x &&
                    enemyObjects[i].y + CELL_SIZE > cellObjects[MAP_HEIGHT * MAP_WIDTH - 1].y) {
                    enemyWins = true;
                }
            }
        }
        // Game over?
        if (enemyWins == true) {
            gameOver("Game Over!");
        }
        if (enemyCount == 0) {
            gameOver("You Win!");
        }
    }, 20);
}

function changeEnemyDirection(index) {
    if (enemyObjects[index].direction == DIRECTION_DOWN) {
        enemyObjects[index].direction = DIRECTION_RIGHT;
    }
    else {
        enemyObjects[index].direction = DIRECTION_DOWN;
    }
    enemyObjects[index].turnCountDown = Math.floor((Math.random() * 200) + 1);
}

function fireEnemy(enemyObject, turretCellObject) {
    if (enemyObject.x >= turretCellObject.x && enemyObject.x <= turretCellObject.x + CELL_SIZE ||
        enemyObject.x + CELL_SIZE >= turretCellObject.x && enemyObject.x + CELL_SIZE <= turretCellObject.x + CELL_SIZE) {
        if (enemyObject.y > turretCellObject.y + CELL_SIZE) {
            var rows = (enemyObject.y - turretCellObject.y) / CELL_SIZE;
            for (var i = 1; i <= rows; i++) {
                var firedCellIndex = turretCellObject.index + (i * MAP_WIDTH);
                if (createLineOfFire(firedCellIndex) == false) {
                    return false;
                }
            }
            return true;
        }
        if (enemyObject.y + CELL_SIZE < turretCellObject.y) {
            var rows = (turretCellObject.y - enemyObject.y) / CELL_SIZE;
            for (var i = 1; i <= rows; i++) {
                var firedCellIndex = turretCellObject.index - (i * MAP_WIDTH);
                if (createLineOfFire(firedCellIndex) == false) {
                    return false;
                }
            }
            return true;
        }
    }
    if (enemyObject.y >= turretCellObject.y && enemyObject.y <= turretCellObject.y + CELL_SIZE ||
        enemyObject.y + CELL_SIZE >= turretCellObject.y && enemyObject.y + CELL_SIZE <= turretCellObject.y + CELL_SIZE) {
        if (enemyObject.x > turretCellObject.x + CELL_SIZE) {
            var cols = (enemyObject.x - turretCellObject.x) / CELL_SIZE;
            for (var i = 1; i <= cols; i++) {
                var firedCellIndex = turretCellObject.index + i;
                if (createLineOfFire(firedCellIndex) == false) {
                    return false;
                }
            }
            return true;
        }
        if (enemyObject.x + CELL_SIZE < turretCellObject.x) {
            var cols = (turretCellObject.x - enemyObject.x) / CELL_SIZE;
            for (var i = 1; i <= cols; i++) {
                var firedCellIndex = turretCellObject.index - i;
                if (createLineOfFire(firedCellIndex) == false) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

function createLineOfFire(firedCellIndex) {
    var firedCell = document.getElementById(cellObjects[firedCellIndex].id);
    firedCell.style.backgroundColor = "#e0d0f8";
    return true;
}

function gameOver(text) {
    gameStarts = false;
    clearInterval(intervalId);
    var startButton = document.getElementById("startButton");
    startButton.disabled = true;
    var result = document.createElement("div");
    result.setAttribute("class", "gameOver");
    result.innerText = text;
    document.body.appendChild(result);

}

window.onload = function () {
    createMap();
}
