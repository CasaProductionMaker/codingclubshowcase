// SINGLEPLAYER VERSION

//Mouse Info
let mousePos = {x: undefined, y: undefined};
let screenDim = {x: window.innerWidth, y: window.innerHeight};
let gameWindowDimensions = {x: window.innerWidth * 0.75, y: window.innerHeight * 0.96};
let mouseNonRelativePosition = {x: undefined, y: undefined};
let mouseDown = false;

//Player
let myPlayer = {};
let yVel = 0;
let xVel = 0;
let isD;
let isA;
let isW;
let isS;
let isRight;
let isLeft;
let isUp;
let isDown;
let bulletID = 0;
let score = 0;

//Time
let startTime = new Date();
let startTick = startTime.getTime();
let currentTick = startTick;

//Game
let gameHost = "";
let tickRate = 40;
let mapSize = 500;
let enemyID = 0;
let enemySpawnRate = 5000; //ms

//Misc
let isDebug = false;
let gameCode = localStorage.getItem("AtomixGame");

function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
	return `${x}x${y}`;
}
function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
    "UNCOOL",
    "GODLY",
    "OP",
    "POOR",
    "THE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
    "MONKEY",
    "DRAGON",
    "ANT",
    "SNAKE",
  ]);
  return `${prefix} ${animal}`;
}
function distanceBetween(x1, y1, x2, y2) {
  return Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));
}

function resetMousePressCode() {
    const defaultCode = `  let p = myPlayer;
  SpawnBullet(p.x, p.y, p.angle);`;
    document.querySelector("#onshoot").value = defaultCode;
}
function resetBulletTickCode() {
    const defaultCode = `
  MoveBulletInDegreeAngle(bulletID, bullets[bulletID].angle, 20);

  BulletCollideWithEnemies(bulletID);`;
    document.querySelector("#ontick").value = defaultCode;
}

(function() {
    let playerElements = {};
    let bullets = {};
    let bulletElements = {};
    let enemies = {};
    let enemyElements = {};

    const gameContainer = document.querySelector(".game-container");

    function tickLoop() {
        // Get ticks and stuff
        let tempTime = new Date();
        currentTick = tempTime.getTime() - startTick;
        screenDim = {x: window.innerWidth, y: window.innerHeight};

        // Angle (face to mouse)
        if(mousePos.x != undefined && mousePos.y != undefined) {
            mouseNonRelativePosition = {x: mousePos.x - (gameWindowDimensions.x/2), y: mousePos.y - (gameWindowDimensions.y/2)};
            let angle = (Math.atan2(mouseNonRelativePosition.y - 8, mouseNonRelativePosition.x - 16) * (180 / Math.PI)) + 90;
            myPlayer.angle = angle;
            playerElements.querySelector(".Character_sprite").style.transform = `rotate(${angle}deg)`;
        }

        // bullet stuffs
        for(let bulletKey in bullets) {
            const bulletState = bullets[bulletKey];
            let el = bulletElements[bulletKey];
            let left = ((bulletState.x - myPlayer.x) + ((gameWindowDimensions.x / 2) - 16)) + "px";
            let top = ((bulletState.y - myPlayer.y) + ((gameWindowDimensions.y / 2) - 16)) + "px";
            el.style.transform = `translate3d(${left}, ${top}, 0)`;

            if(currentTick - bullets[bulletKey].time > 3000 || Math.abs(bullets[bulletKey].x) > mapSize || Math.abs(bullets[bulletKey].y) > mapSize) {
                delete bullets[bulletKey];
                el.remove();
            } else {
                OnBulletTick(bulletKey);
            }
        }

        // enemy stuffs
        for(let enemyKey in enemies) {
            const enemyState = enemies[enemyKey];
            let el = enemyElements[enemyKey];
            let left = ((enemyState.x - myPlayer.x) + ((gameWindowDimensions.x / 2) - 16)) + "px";
            let top = ((enemyState.y - myPlayer.y) + ((gameWindowDimensions.y / 2) - 16)) + "px";
            el.querySelector(".Enemy_sprite").style.transform = `rotate(${enemies[enemyKey].angle}deg)`;
            el.style.transform = `translate3d(${left}, ${top}, 0)`;

            // point towards player
            let angle = (Math.atan2((myPlayer.y - enemyState.y), (myPlayer.x - enemyState.x)) * (180 / Math.PI)) - 90;
            enemies[enemyKey].angle = angle;

            // move towards player
            let angleRad = (enemies[enemyKey].angle - 90) * (Math.PI / 180);
            let enemyXVel = Math.cos(angleRad) * -2 * (score > 300 ? 4 : score > 200 ? 3 : score > 100 ? 2 : 1 );
            let enemyYVel = Math.sin(angleRad) * -2 * (score > 300 ? 4 : score > 200 ? 3 : score > 100 ? 2 : 1 );
            enemies[enemyKey].x += enemyXVel;
            enemies[enemyKey].y += enemyYVel;

            // check if hit player
            if(distanceBetween(enemyState.x, enemyState.y, myPlayer.x, myPlayer.y) < 40) {
                myPlayer.isDead = true;
            }
            
            // check if dead
            if(enemies[enemyKey].health <= 0) {
                delete enemies[enemyKey];
                el.remove();
                score += 10;
                document.querySelector("#scoredisplay").innerText = "Score: " + score;
            }
        }

        // Movement
        if(myPlayer != null) {
            if (myPlayer.isDead) {
                localStorage.setItem("CCDScore", score);
                window.location = "gameover.html";
            }

            //Move player
            if(isD || isRight)
            {
                xVel += 1;
            }
            if(isA || isLeft)
            {
                xVel -= 1;
            }
            if(isW || isUp)
            {
                yVel -= 1;
            }
            if(isS || isDown)
            {
                yVel += 1;
            }
            xVel *= 0.85;
            yVel *= 0.85;

            handleMovement(xVel, 0);
            handleMovement(0, yVel);
        }

        //repeat
        setTimeout(() => {
            tickLoop();
        }, tickRate);
    }

    function renderLoop() {
        // x calc: ((player starts at 0) - mapsize) + half of game window
        document.querySelector("#rightWall").style.transform = `translate3d(${((-myPlayer.x + mapSize) + (gameWindowDimensions.x/2)) - 10}px, ${(-myPlayer.y - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#rightWall").style.height = (2 * mapSize) + "px";

        document.querySelector("#leftWall").style.transform = `translate3d(${(-myPlayer.x - mapSize) + (gameWindowDimensions.x/2)}px, ${(-myPlayer.y - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#leftWall").style.height = (2 * mapSize) + "px";

        document.querySelector("#topWall").style.transform = `translate3d(${(-myPlayer.x - mapSize) + (gameWindowDimensions.x/2)}px, ${(-myPlayer.y - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#topWall").style.width = (2 * mapSize) + "px";

        document.querySelector("#bottomWall").style.transform = `translate3d(${(-myPlayer.x - mapSize) + (gameWindowDimensions.x/2)}px, ${((-myPlayer.y + mapSize) + (gameWindowDimensions.y/2)) - 10}px, 0)`;
        document.querySelector("#bottomWall").style.width = (2 * mapSize) + "px";

        //repeat
        setTimeout(() => {
            renderLoop();
        }, tickRate);
    }

    function handleMovement(xChange=0, yChange=0) {
        const newX = myPlayer.x + xChange;
        const newY = myPlayer.y + yChange;
        const oldX = myPlayer.x;
        const oldY = myPlayer.y;

        if (!myPlayer.isDead) {
            //move to the next space
            myPlayer.x = newX;
            myPlayer.y = newY;

            let isCollision = false;
            if(Math.abs(myPlayer.x) > mapSize || Math.abs(myPlayer.y) > mapSize) isCollision = true;
            if(isCollision)
            {
                myPlayer.x = oldX;
                myPlayer.y = oldY;
            }
        }
    }

    function SpawnBullet(x, y, angle) {
        bullets[bulletID] = {
            x: x + 8,
            y,
            angle,
            id: bulletID,
            time: currentTick
        };
        //new nodes
        const addedBullet = bullets[bulletID];
        const bulletElement = document.createElement("div");
        bulletElement.classList.add("Bullet");
        bulletElement.innerHTML = (`
            <div class="Bullet_sprite"></div>
        `);

        let left = ((addedBullet.x - myPlayer.x) + ((gameWindowDimensions.x / 2) - 16)) + "px";
        let top = ((addedBullet.y - myPlayer.y) + ((gameWindowDimensions.y / 2) - 16)) + "px";
        bulletElement.style.transform = `translate3d(${left}, ${top}, 0)`;

        //Add
        bulletElements[addedBullet.id] = bulletElement;
        gameContainer.appendChild(bulletElement);

        bulletID++;
    }

    function spawnEnemyLoop() {
        SpawnEnemy();
        enemySpawnRate -= 50;
        if(enemySpawnRate < 500) enemySpawnRate = 500;

        setTimeout(() => {
            spawnEnemyLoop();
        }, enemySpawnRate);
    }

    function SpawnEnemy() {
        const enemyElement = document.createElement("div");
        enemyElement.classList.add("Enemy");
        enemyElement.innerHTML = (`
            <div class="Enemy_sprite"></div>
        `);

        let enemyX = Math.round(Math.random() * mapSize * 2) - mapSize;
        let enemyY = Math.round(Math.random() * mapSize * 2) - mapSize;
        while(distanceBetween(enemyX, enemyY, myPlayer.x, myPlayer.y) < 300) {
            enemyX = Math.round(Math.random() * mapSize * 2) - mapSize;
            enemyY = Math.round(Math.random() * mapSize * 2) - mapSize;
        }
        let left = ((enemyX - myPlayer.x) + ((gameWindowDimensions.x / 2) - 16)) + "px";
        let top = ((enemyY - myPlayer.y) + ((gameWindowDimensions.y / 2) - 16)) + "px";
        enemyElement.style.transform = `translate3d(${left}, ${top}, 0)`;

        //Add
        gameContainer.appendChild(enemyElement);
        
        enemies[enemyID] = {
            x: enemyX,
            y: enemyY,
            id: enemyID,
            angle: 0,
            health: 1
        };
        enemyElements[enemyID] = enemyElement;
        enemyID++;
    }

    function OnMousePress() {
        let code = document.querySelector("#onshoot").value;
        try {
            eval(code);
        } catch (err) {
            console.error("Error:", err);
        }
    }

    function OnBulletTick(bulletID) {
        let code = document.querySelector("#ontick").value;
        try {
            eval(code);
        } catch (err) {
            console.error("Error:", err);
        }
    }

    function MoveBulletInDegreeAngle(bulletID, angle, speed) {
        let angleRad = (angle - 90) * (Math.PI / 180);
        let bulletXVel = Math.cos(angleRad) * speed;
        let bulletYVel = Math.sin(angleRad) * speed;
        bullets[bulletID].x += bulletXVel;
        bullets[bulletID].y += bulletYVel;
    }

    function BulletCollideWithEnemies(bulletID) {
        for(let enemyKey in enemies) {
            const enemyState = enemies[enemyKey];
            console.log(bullets);
            if(bullets[bulletID] != null && distanceBetween(bullets[bulletID].x, bullets[bulletID].y, enemyState.x, enemyState.y) < 30) {
                DeleteBullet(bulletID);
                enemies[enemyKey].health -= 1;
            }
        }
    }

    function DeleteBullet(bulletID) {
        delete bullets[bulletID];
        let el = bulletElements[bulletID];
        el.remove();
    }

    function initGame() {
        //Key Registers
        new KeyPressListener("ArrowUp", () => {isUp = true;}, () => {isUp = false;})
        new KeyPressListener("ArrowDown", () => {isDown = true;}, () => {isDown = false;})
        new KeyPressListener("ArrowLeft", () => {isLeft = true;}, () => {isLeft = false;})
        new KeyPressListener("ArrowRight", () => {isRight = true;}, () => {isRight = false})
        new KeyPressListener("KeyW", () => {isW = true;}, () => {isW = false;})
        new KeyPressListener("KeyA", () => {isA = true;}, () => {isA = false;})
        new KeyPressListener("KeyS", () => {isS = true;}, () => {isS = false;})
        new KeyPressListener("KeyD", () => {isD = true;}, () => {isD = false;})

        // create player
        const characterElement = document.createElement("div");
        characterElement.classList.add("Character");
        characterElement.classList.add("you");
        characterElement.innerHTML = (`
            <div class="Character_sprite"></div>
            <div class="Character_name-container">
                <span class="Character_name"></span>
            </div>
        `);

        characterElement.querySelector(".Character_name").innerText = myPlayer.name;
        let left = ((gameWindowDimensions.x / 2) - 16) + "px";
        let top = ((gameWindowDimensions.y / 2) - 24) + "px";
        characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;

        //Add
        playerElements = characterElement;
        gameContainer.appendChild(characterElement);


        window.addEventListener('mousemove', (event) => {
            mousePos = {x: event.clientX, y: event.clientY};
            let margin = {x: (gameWindowDimensions.x - 720) / 2, y: (gameWindowDimensions.y - 624) / 2};
            const left = mousePos.x - (gameWindowDimensions.x/2);
            const top = mousePos.y - (gameWindowDimensions.y/2);
            //1919, 977
        });
        window.onmousedown = () => {
            if (mousePos.x > (screenDim.x * 0.75)) return;
            mouseDown = true;
            OnMousePress();
        }
        window.onmouseup = () => {
            mouseDown = false;
        }
        tickLoop();
        renderLoop();
        spawnEnemyLoop();
    }

    let name;
    if(localStorage.getItem("CCDName") != null)
    {
        name = localStorage.getItem("CCDName");
    } else {
        name = createName();
    }
    const x = Math.round(Math.random() * mapSize * 2) - mapSize;
    const y = Math.round(Math.random() * mapSize * 2) - mapSize;

    myPlayer = {
        name,
        x: 0,
        y: 0,
        angle: 0,
        isDead: false,
        op: false
    };

    //Begin the game now that we are signed in
    initGame();
})();