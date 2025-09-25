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

function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
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

document.querySelector("#username").value = localStorage.getItem("CCDName") || "";
if (localStorage.getItem("CCDName") == null) {
    let newuser = createName();
    document.querySelector("#username").value = newuser;
    localStorage.setItem("CCDName", newuser);
}

function updateUsername() {
    localStorage.setItem('CCDName', document.querySelector("#username").value);
}
function submitScore(score) {
  const username = document.querySelector("#username").value || "Anonymous";
  firebase.database().ref("leaderboard/" + username).set(score);
}

// update leaderboard
//get top 5
// Fetch once at beginning
firebase.database().ref("leaderboard")
    .orderByValue()
    .limitToLast(5)
    .once("value")
    .then(updateLeaderboard);

// Also listen for future updates
firebase.database().ref("leaderboard")
    .orderByValue()
    .limitToLast(5)
    .on("value", updateLeaderboard);

function updateLeaderboard(snapshot) {
    const data = snapshot.val();
    if (!data) return;

    const scoresArray = Object.entries(data).sort((a, b) => b[1] - a[1]);

    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "";

    scoresArray.forEach(([name, score]) => {
        const li = document.createElement("li");
        li.textContent = `${name} - ${score}`;
        list.appendChild(li);
    });
}