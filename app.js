
const firebaseConfig = {
  apiKey: "AIzaSyA-wFARHP2a5kGhZgqnDXsFEjOYpvpDFuc",
  authDomain: "codingclubshowcase.firebaseapp.com",
  databaseURL: "https://codingclubshowcase-default-rtdb.firebaseio.com",
  projectId: "codingclubshowcase",
  storageBucket: "codingclubshowcase.firebasestorage.app",
  messagingSenderId: "286973552526",
  appId: "1:286973552526:web:6b80775fca0780320d66df"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

//Mouse Info
let mousePos = {x: undefined, y: undefined};
let screenDim = {x: window.innerWidth, y: window.innerHeight};
let gameWindowDimensions = {x: window.innerWidth * 0.75, y: window.innerHeight * 0.96};
let mouseNonRelativePosition = {x: undefined, y: undefined};
let mouseDown = false;

//Player
let myX = 0;
let myY = 0;
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

//Time
let startTime = new Date();
let startTick = startTime.getTime();
let currentTick = startTick;

//Game
let gameHost = "";
let tickRate = 40;
let mapSize = 500;

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

(function() {
	let playerId;
	let playerRef;
    let players = {};
    let playerElements = {};
    let bullets = {};
    let bulletElements = {};

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
            playerRef.update({angle});
            if(players[playerId] != null) {
                playerElements[playerId].querySelector(".Character_sprite").style.transform = `rotate(${angle}deg)`;
            }
        }

        for(let bulletKey in bullets) {
            if(bullets[bulletKey].owner != playerId) continue;
            if(currentTick - bullets[bulletKey].time > 3000 || Math.abs(bullets[bulletKey].x) > mapSize || Math.abs(bullets[bulletKey].y) > mapSize) {
                firebase.database().ref(`/bullets/${bulletKey}`).remove();
            } else {
                let angleRad = (bullets[bulletKey].angle - 90) * (Math.PI / 180);
                let bulletXVel = Math.cos(angleRad) * 20;
                let bulletYVel = Math.sin(angleRad) * 20;
                firebase.database().ref(`/bullets/${bulletKey}`).update({
                    x: bullets[bulletKey].x + bulletXVel,
                    y: bullets[bulletKey].y + bulletYVel
                })

                //Check for hits
                Object.keys(players).forEach((key) => {
                    const characterState = players[key];
                    if(characterState.id != playerId && !characterState.isDead && distanceBetween(bullets[bulletKey].x, bullets[bulletKey].y, characterState.x, characterState.y) < 48)
                    {
                        firebase.database().ref(`/players/${characterState.id}`).update({
                            isDead: true
                        })
                        firebase.database().ref(`/bullets/${bulletKey}`).remove();
                    }
                })
            }
        }

        // Movement
        if(players[playerId] != null) {
            if (players[playerId].isDead) { window.location.reload(); }

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
        document.querySelector("#rightWall").style.transform = `translate3d(${((-myX + mapSize) + (gameWindowDimensions.x/2)) - 10}px, ${(-myY - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#rightWall").style.height = (2 * mapSize) + "px";

        document.querySelector("#leftWall").style.transform = `translate3d(${(-myX - mapSize) + (gameWindowDimensions.x/2)}px, ${(-myY - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#leftWall").style.height = (2 * mapSize) + "px";

        document.querySelector("#topWall").style.transform = `translate3d(${(-myX - mapSize) + (gameWindowDimensions.x/2)}px, ${(-myY - (mapSize)) + (gameWindowDimensions.y/2)}px, 0)`;
        document.querySelector("#topWall").style.width = (2 * mapSize) + "px";

        document.querySelector("#bottomWall").style.transform = `translate3d(${(-myX - mapSize) + (gameWindowDimensions.x/2)}px, ${((-myY + mapSize) + (gameWindowDimensions.y/2)) - 10}px, 0)`;
        document.querySelector("#bottomWall").style.width = (2 * mapSize) + "px";

        //repeat
        setTimeout(() => {
            renderLoop();
        }, tickRate);
    }

    function handleMovement(xChange=0, yChange=0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;
        const oldX = players[playerId].x;
        const oldY = players[playerId].y;

        if (!players[playerId].isDead) {
            //move to the next space
            players[playerId].x = newX;
            players[playerId].y = newY;
            myX = players[playerId].x;
            myY = players[playerId].y;

            let isCollision = false;
            if(Math.abs(myX) > mapSize || Math.abs(myY) > mapSize) isCollision = true;
            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                if(characterState.id != playerId && distanceBetween(myX, myY, characterState.x, characterState.y) < 28)
                {
                    xVel = ((myX - characterState.x) / 28) * 2;
                    yVel = ((myY - characterState.y) / 28) * 2;
                }
            })
            if(isCollision)
            {
                players[playerId].x = oldX;
                players[playerId].y = oldY;
                myX = players[playerId].x;
                myY = players[playerId].y;
            }

            playerRef.update({
                x: players[playerId].x, 
                y: players[playerId].y
            });
        }
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

        const allPlayersRef = firebase.database().ref(`/players`);
        const allBulletsRef = firebase.database().ref(`/bullets`);

        allPlayersRef.on("value", (snapshot) => {
            //change
            players = snapshot.val() || {};
            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                let el = playerElements[key];
                el.querySelector(".Character_name").innerText = characterState.name;
                let left = ((characterState.x - myX) + ((gameWindowDimensions.x / 2) - 16)) + "px";
                let top = ((characterState.y - myY) + ((gameWindowDimensions.y / 2) - 16)) + "px";
                if(characterState.id === playerId)
                {
                    left = ((gameWindowDimensions.x / 2) - 16) + "px";
                    top = ((gameWindowDimensions.y / 2) - 24) + "px";
                    if(characterState.health < 0) characterState.health = 0;
                }
                el.querySelector(".Character_sprite").style.transform = `rotate(${characterState.angle}deg)`;
                el.style.transform = `translate3d(${left}, ${top}, 0)`;
            })
        })
        allPlayersRef.on("child_added", (snapshot) => {
            //new nodes
            const addedPlayer = snapshot.val();
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character");
            if(addedPlayer.id === playerId)
            {
                characterElement.classList.add("you");
            }
            characterElement.innerHTML = (`
                <div class="Character_sprite"></div>
                <div class="Character_name-container">
                    <span class="Character_name"></span>
                </div>
            `);

            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            let left = ((addedPlayer.x - myX) + ((gameWindowDimensions.x / 2) - 16)) + "px";
            let top = ((addedPlayer.y - myY) + ((gameWindowDimensions.y / 2) - 16)) + "px";
            if(addedPlayer.id === playerId)
            {
                left = ((gameWindowDimensions.x / 2) - 16) + "px";
                top = ((gameWindowDimensions.y / 2) - 24) + "px";
            }
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            //Add
            playerElements[addedPlayer.id] = characterElement;
            gameContainer.appendChild(characterElement);
        })
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removedKey]);
            delete playerElements[removedKey];
        })

        allBulletsRef.on("value", (snapshot) => {
            //change
            bullets = snapshot.val() || {};
            console.log(bullets);
            Object.keys(bullets).forEach((key) => {
                const bulletState = bullets[key];
                let el = bulletElements[key];
                let left = ((bulletState.x - myX) + ((gameWindowDimensions.x / 2) - 16)) + "px";
                let top = ((bulletState.y - myY) + ((gameWindowDimensions.y / 2) - 16)) + "px";
                el.style.transform = `translate3d(${left}, ${top}, 0)`;
            })
        })
        allBulletsRef.on("child_added", (snapshot) => {
            //new nodes
            const addedBullet = snapshot.val();
            const bulletElement = document.createElement("div");
            bulletElement.classList.add("Bullet");
            bulletElement.innerHTML = (`
                <div class="Bullet_sprite"></div>
            `);

            let left = ((addedBullet.x - myX) + ((gameWindowDimensions.x / 2) - 16)) + "px";
            let top = ((addedBullet.y - myY) + ((gameWindowDimensions.y / 2) - 16)) + "px";
            bulletElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            //Add
            bulletElements[addedBullet.id] = bulletElement;
            gameContainer.appendChild(bulletElement);
        })
        allBulletsRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(bulletElements[removedKey]);
            delete bulletElements[removedKey];
        })

        window.addEventListener('mousemove', (event) => {
            mousePos = {x: event.clientX, y: event.clientY};
            let margin = {x: (gameWindowDimensions.x - 720) / 2, y: (gameWindowDimensions.y - 624) / 2};
            const left = mousePos.x - (gameWindowDimensions.x/2);
            const top = mousePos.y - (gameWindowDimensions.y/2);
            //1919, 977
        });
        window.onmousedown = () => {
            mouseDown = true;
            firebase.database().ref(`/bullets/${playerId}-${currentTick}`).set({
                x: players[playerId].x + 8,
                y: players[playerId].y,
                angle: players[playerId].angle,
                owner: playerId,
                id: `${playerId}-${currentTick}`,
                time: currentTick
            })
        }
        window.onmouseup = () => {
            mouseDown = false;
        }
        setTimeout(() => tickLoop(), 500);
        setTimeout(() => renderLoop(), 500);
    }
    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            //You're logged in!
            playerId = user.uid;
            playerRef = firebase.database().ref(`/players/${playerId}`);

            let name;
            if(localStorage.getItem("AtomixName") != null)
            {
                name = localStorage.getItem("AtomixName");
            } else {
                name = createName();
            }
            const x = Math.round(Math.random() * mapSize * 2) - mapSize;
            const y = Math.round(Math.random() * mapSize * 2) - mapSize;

            playerRef.set({
                id: playerId,
                name,
                x: 0,
                y: 0,
                angle: 0,
                isDead: false,
                op: false
            })

            //Remove me from Firebase when I diconnect
            playerRef.onDisconnect().remove();

            //Begin the game now that we are signed in
            initGame();
        } else {
            //You're logged out.
        }
    })
	firebase.auth().signInAnonymously().catch((error) => {
	    var errorCode = error.code;
	    var errorMessage = error.message;
	    // ...
	    console.log(errorCode, errorMessage);
	});
})();