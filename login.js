const users = [
  { username: "sahil", password: "1234" },
  { username: "admin", password: "admin123" }
];

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  const user = users.find(u => u.username === uname && u.password === pass);

  if (user) {
    localStorage.setItem("loggedInUser", uname);
    window.location.href = "dashboard.html";
  } else {
    errorBox.textContent = "❌ Invalid credentials!";
    errorBox.style.color = "red";
  }
});
