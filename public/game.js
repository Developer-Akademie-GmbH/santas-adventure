addMap('./img/background.png', 20);
startHighscore();
moveMap(8);
let santa = new GameObject('./img/santa/santa0.png', 200, 500, 200);
santa.animate(0, 5);


let grinch = new GameObject('./img/grinch/grinch0.png', 40, 500, 200);
grinch.animate(0, 5);


addObstacle();
function addObstacle(){
    placeObstacle('./img/obstacles/A.png', 1000 + Math.random() * 1000, 650, 70, 70);

    setInterval(function() {
        addObstacle();
    }, 5000);
}

santa.isColliding(function() {
    stopGame();
    sendScore('', currentHighscore);

}, 80, 30);


function spaceKeyPressed() {
    santa.img = './img/santa-jump/santa-jump0.png';
    santa.animate(0, 3);   
    santa.jump();
}

function spaceKeyReleased() {
    santa.img = './img/santa/santa0.png';
    santa.animate(0, 5);   
    santa.cancelJump();  
}