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


firebase.database().ref(`leaderboard/${localStorage.getItem("CCDName")}`).set(localStorage.getItem("CCDScore"));
document.querySelector("#scoreinfo").innerText = "Score: " + localStorage.getItem("CCDScore");