let GAMELOOPJS_SPEED = 1000 / 60;
let GAMELOOPJS_SPACE_TIMEOUT = 100;
let GAMELOOPJS_INTERVALS = [];
let currentHighscore = 0;
let MAP_X = 0;
let GAME_OBSTACLES = [];
let gameOver = false;
const GAMELOOPJS_KEY = {};
let gameStarted = false;

document.addEventListener('keydown', e => GAMELOOPJS_KEY[e.keyCode] = true);
document.addEventListener('keyup', e => {
    GAMELOOPJS_KEY[e.keyCode] = false;
    if (e.keyCode === 32) { // 32 ist der Keycode für die Leertaste (Space)
        spaceKeyReleased();
    }
});

function leftKeyPressed() {
    console.log('Please implement the function leftKeyPressed()');
}

function rightKeyPressed() {
    console.log('Please implement the function rightKeyPressed()');
}

function upKeyPressed() {
    console.log('Please implement the function upKeyPressed()');
}

function downKeyPressed() {
    console.log('Please implement the function downKeyPressed()');
}

function spaceKeyPressed() {
    console.log('Please implement the function spaceKeyPressed()');
}

function spaceKeyReleased() {
    console.log('Please implement the function spaceKeyReleased()');
}

function addMap(src, parts = 10) {
    document.head.innerHTML += `
    <style>
        .moving-map {
            height: 100vh;
            position: absolute;
            left: 0;
            bottom: 100px;
        }
    </style>`;
    for (let i = 0; i < parts; i++) {
        const map = document.createElement('img');
        map.src = src;
        map.id = 'map' + i;
        map.classList.add('moving-map');
        document.body.appendChild(map);

        map.onload = () => {
            setTimeout(() => {
                document.querySelectorAll('.moving-map').forEach((map, i) => {
                    map.style.left = (i * map.getBoundingClientRect().width) + 'px';
                    gameStarted = true;
                });
            }, 100);
        }

    }


}

function moveMap(speed = 1) {
    const interval = setInterval(() => {
        if(!gameStarted) return;
        document.querySelectorAll('.moving-map').forEach(part => {
            MAP_X = 0 - (part.getBoundingClientRect().x - speed);
            part.style.left = (part.getBoundingClientRect().x - speed) + 'px';
        });

        GAME_OBSTACLES.forEach(obstacle => {
            obstacle.style.left = (obstacle.getBoundingClientRect().x - speed) + 'px';
        });
    }, 1000 / 60);

    GAMELOOPJS_INTERVALS.push(interval);
}

function placeObstacle(src, x, y, width = 100, height = 100) {
    let obstacle = document.createElement('img');
    obstacle.src = src;
    obstacle.style.zIndex = 1;
    obstacle.style.position = 'absolute';
    obstacle.style.left = x + 'px';
    obstacle.style.top = y + 'px';
    obstacle.style.width = width + 'px';
    obstacle.style.height = height + 'px';
    obstacle.classList.add('game-obstacle');
    document.body.appendChild(obstacle);
    GAME_OBSTACLES.push(obstacle);
}


function startHighscore(x = 50, y = 50) {
    document.body.innerHTML += `
        <h1 id="currentHighScoreCount" style="text-shadow: 2px 2px 2px rgba(0,0,0,0.5); font-size: 40px; position: absolute; top: ${y}px; left: ${x}px; margin-block-start: 0;"></h1>
    `;
    const interval = setInterval(() => {
        currentHighscore += 1;
        currentHighScoreCount.innerHTML = currentHighscore;
    }, 50);

    GAMELOOPJS_INTERVALS.push(interval);
}

class GameObject {

    img;
    x;
    y;
    groundLevel;
    height;
    imgElement;
    zIndex = 2;
    animationInterval;

    constructor(img, x, y, height = 100) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.groundLevel = y;
        this.height = height;
        this.spawn();
    }

    spawn() {
        this.imgElement = document.createElement('img');
        this.imgElement.src = this.img;
        this.imgElement.style.position = 'absolute';
        this.imgElement.style.left = this.x + 'px';
        this.imgElement.style.top = this.y + 'px';
        this.imgElement.style.height = this.height + 'px';
        this.imgElement.style.zIndex = this.zIndex;
        document.body.appendChild(this.imgElement);
    }

    animate(first, last, animationSpeed = 100) {
        if (gameOver) return;
        let current = first;
        clearInterval(this.animationInterval);
        this.animationInterval = setInterval(() => {
            // Frame hochzählen
            current++;

            // Wenn Limit erreicht, wieder zurück auf first (z.B. 0)
            if (current > last) {
                current = first;
            }

            // Endung der Datei ermitteln
            const extensionMatch = this.img.match(/\.\w+$/);
            const extension = extensionMatch ? extensionMatch[0] : '';

            // Bildpfad anpassen, z.B. './img/sata/santa0.png' -> './img/sata/santa1.png'
            const basePath = this.img.replace(/\d+\.\w+$/, '');

            // src des Bildes aktualisieren
            this.imgElement.src = `${basePath}${current}${extension}`;;
            this.imgElement.style.top = `${this.y}px`;;
            this.imgElement.style.left = `${this.x}px`;;

        }, animationSpeed);
        GAMELOOPJS_INTERVALS.push(this.animationInterval);
    }

    jump(maxHeight = 150, speed = 5) {
        if (this.isJumping) return; // Kein neuer Sprung, wenn bereits springend
        if (gameOver) return;

        this.isJumping = true;
        let direction = -1; // Nach oben
        let maxReached = false;

        this.jumpInterval = setInterval(() => {
            // Sprung nach oben
            if (!maxReached) {
                this.y += direction * speed;
                if (this.y <= this.groundLevel - maxHeight) {
                    maxReached = true; // Maximum erreicht
                    direction = 1; // Nach unten
                }
            } else {
                // Fall zurück zum Boden
                this.y += direction * speed;
                if (this.y >= this.groundLevel) {
                    this.y = this.groundLevel; // Auf Boden zurücksetzen
                    this.endJump();
                }
            }

            // Position des Objekts aktualisieren
            this.imgElement.style.top = `${this.y}px`;
        }, 1000 / 60); // 60 FPS
    }


    cancelJump() {
        if (this.gameOver) return;
        if (this.isJumping) {
            clearInterval(this.jumpInterval);
            this.jumpInterval = null;
            this.isJumping = false;

            // Fall zurück zum Boden
            this.fallToGround()

        }
    }


    fallToGround(speed = 5) {
        const fallInterval = setInterval(() => {
            this.y += speed;
            if (this.y >= this.groundLevel) {
                this.y = this.groundLevel;
                clearInterval(fallInterval); // Stopp bei Boden
            }
            this.imgElement.style.top = `${this.y}px`;
        }, 1000 / 60);
    }

    endJump() {
        clearInterval(this.jumpInterval);
        this.jumpInterval = null;
        this.isJumping = false;
    }


    isColliding(callback, offsetLeft = 0, offsetRight = 0) {
        gameInterval(() => {
            const rect1 = this.imgElement.getBoundingClientRect();

            // Passe den Kollisionsbereich an
            const adjustedRect1 = {
                left: rect1.left + offsetLeft,
                right: rect1.right - offsetRight,
                top: rect1.top,
                bottom: rect1.bottom
            };

            for (let obstacle of GAME_OBSTACLES) {
                const rect2 = obstacle.getBoundingClientRect();
                if (this._intersectRect(adjustedRect1, rect2)) {
                    callback(obstacle);
                }
            }
        }, 50);
    }


    _intersectRect(r1, r2) {
        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    }
}



function flyUp(gameObject, speed = 10, repeat = 2000) {
    let i = 0;
    let interval = gameInterval(() => {
        gameObject.y -= speed;
        if (++i >= repeat) {
            clearInterval(interval);
        }
    }, GAMELOOPJS_SPEED);
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function flyDown(gameObject, speed = 10, repeat = 2000) {
    let i = 0;
    let interval = gameInterval(() => {
        gameObject.y += speed;
        if (++i >= repeat) {
            clearInterval(interval);
        }
    }, GAMELOOPJS_SPEED);
}


GAMELOOPJS_START();
function GAMELOOPJS_START() {
    let spaceKeyLocked = false;
    gameInterval(() => {
        if (GAMELOOPJS_KEY[37]) leftKeyPressed();
        if (GAMELOOPJS_KEY[39]) rightKeyPressed();
        if (GAMELOOPJS_KEY[38]) upKeyPressed();
        if (GAMELOOPJS_KEY[40]) downKeyPressed();
        if (GAMELOOPJS_KEY[32]) {
            if (!spaceKeyLocked) {
                spaceKeyPressed();
                spaceKeyLocked = true;
                setTimeout(() => {
                    spaceKeyLocked = false;
                }, GAMELOOPJS_SPACE_TIMEOUT);
            }
        }
    }, GAMELOOPJS_SPEED);
}


function waitForCollision(object1, object2) {
    return new Promise((resolve) => {
        gameInterval(() => {
            if (object2 instanceof Array) {
                object2.forEach((gameObject) => {
                    if (isColliding(object1, gameObject)) {
                        resolve([object1, gameObject]);
                    }
                });
            } else {
                if (isColliding(object1, object2)) {
                    resolve([object1, object2]);
                }
            }
        }, 50);
    });
}


function isColliding(object1, object2) {
    let children = typeof rocket !== 'undefined' ? app.stage.children : [];
    if (children.includes(object1) && children.includes(object2)) {

        const bounds1 = object1.getBounds();
        const bounds2 = object2.getBounds();

        return bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y;
    }
    return false;
}


function stopGame() {
    gameOver = true;
    GAMELOOPJS_INTERVALS.forEach(clearInterval);
}

function gameInterval(fun, time) {
    let interval = setInterval(fun, time);
    GAMELOOPJS_INTERVALS.push(interval);
    return interval;
}