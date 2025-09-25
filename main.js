document.querySelector("#username").value = localStorage.getItem("CCDName") || "";

function updateUsername() {
    localStorage.setItem('CCDName', document.querySelector("#username").value);
}