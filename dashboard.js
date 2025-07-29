// 🧠 Semester-based record storage
const data = {};
let currentSemester = "Sem 1";

// 🧠 Load from localStorage
const savedData = localStorage.getItem("data");
if (savedData) {
  Object.assign(data, JSON.parse(savedData));
}

if (!data[currentSemester]) data[currentSemester] = [];

function saveToStorage() {
  localStorage.setItem("data", JSON.stringify(data));
}

function addRecord() {
  const subject = document.getElementById("subject").value.trim();
  const internal = parseInt(document.getElementById("internal").value);
  const final = parseInt(document.getElementById("final").value);
  const attendance = parseInt(document.getElementById("attendance").value);

  if (!subject || isNaN(internal) || isNaN(final) || isNaN(attendance) ||
      internal < 0 || internal > 40 || final < 0 || final > 60 || attendance < 0 || attendance > 100) {
    showAlert("Invalid input. Please check ranges and all fields.");
    return;
  }

  const total = internal + final;
  const grade = getGrade(total);
  data[currentSemester].push({ subject, internal, final, total, grade, attendance });
  saveToStorage();
  clearInputs();
  renderTable();
  updateGPA();
  hideAlert();
}

function getGrade(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  return "F";
}

function clearInputs() {
  document.getElementById("subject").value = "";
  document.getElementById("internal").value = "";
  document.getElementById("final").value = "";
  document.getElementById("attendance").value = "";
}

function renderTable() {
  const tbody = document.querySelector("#recordsTable tbody");
  tbody.innerHTML = "";
  const records = data[currentSemester] || [];
  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.subject}</td>
      <td>${record.internal}</td>
      <td>${record.final}</td>
      <td>${record.total}</td>
      <td>${record.grade}</td>
      <td style="color: ${record.attendance >= 75 ? 'green' : 'red'}">${record.attendance}%</td>
      <td>
        <button onclick="editRecord(${index})">✏️</button>
        <button onclick="deleteRecord(${index})">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function deleteRecord(index) {
  if (confirm("Are you sure you want to delete this record?")) {
    data[currentSemester].splice(index, 1);
    saveToStorage();
    renderTable();
    updateGPA();
  }
}

function editRecord(index) {
  const record = data[currentSemester][index];
  document.getElementById("subject").value = record.subject;
  document.getElementById("internal").value = record.internal;
  document.getElementById("final").value = record.final;
  document.getElementById("attendance").value = record.attendance;
  deleteRecord(index);
}

function updateGPA() {
  const records = data[currentSemester] || [];
  if (records.length === 0) {
    document.getElementById("gpaBox").textContent = "GPA: 0.00";
    return;
  }
  let totalPoints = 0;
  records.forEach(r => {
    totalPoints += r.total;
  });
  const gpa = (totalPoints / (records.length * 100)) * 10;
  document.getElementById("gpaBox").textContent = `GPA: ${gpa.toFixed(2)}`;
}

function showAlert(msg) {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = msg;
}

function hideAlert() {
  document.getElementById("alertBox").textContent = "";
}

function logout() {
  window.location.href = "index.html";
}

document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = document.getElementById("darkToggle");
  icon.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
});

document.getElementById("avatarUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById("avatarPreview").src = evt.target.result;
      localStorage.setItem("avatar", evt.target.result);
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("🎓 Student Performance Report", 20, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);

  const barChartCanvas = document.getElementById("myChart");
  const pieChartCanvas = document.getElementById("pieChart");

  const barImage = barChartCanvas.toDataURL("image/png", 1.0);
  const pieImage = pieChartCanvas.toDataURL("image/png", 1.0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Performance Charts", 20, 40);

  doc.setFont("helvetica", "normal");
  doc.text("Bar Chart", 20, 50);
  doc.addImage(barImage, "PNG", 20, 55, 170, 90);

  doc.text("Pie Chart", 20, 160);
  doc.addImage(pieImage, "PNG", 60, 175, 90, 90);

  // Start new page for data
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Student Records (All Semesters)", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 30;

  // Loop through each semester
  for (let sem in data) {
    const semRecords = data[sem];

    if (!semRecords || semRecords.length === 0) continue;

    // Semester heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${sem}`, 20, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("No", 20, y);
    doc.text("Subject", 30, y);
    doc.text("Total", 90, y);
    doc.text("Grade", 120, y);
    doc.text("Attendance", 150, y);
    y += 8;

    doc.setLineWidth(0.1);
    doc.line(20, y - 5, 190, y - 5);
    doc.setFont("helvetica", "normal");

    semRecords.forEach((r, i) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(`${i + 1}`, 20, y);
      doc.text(`${r.subject}`, 30, y);
      doc.text(`${r.total}`, 90, y);
      doc.text(`${r.grade}`, 120, y);
      doc.text(`${r.attendance}%`, 150, y);
      y += 8;
    });

    y += 10; // extra spacing between semesters
  }

  doc.save("Student_Performance_Report.pdf");
});


window.addEventListener("load", () => {
  renderTable();
  updateGPA();
  const savedAvatar = localStorage.getItem("avatar");
  if (savedAvatar) {
    document.getElementById("avatarPreview").src = savedAvatar;
  }
});

function sortTable(colIndex) {
  const keys = ["subject", "internal", "final", "total", "grade", "attendance"];
  const key = keys[colIndex];
  const records = data[currentSemester] || [];
  records.sort((a, b) => {
    if (key === "grade") {
      const gradeMap = { "A+": 6, A: 5, "B+": 4, B: 3, C: 2, F: 1 };
      return gradeMap[b.grade] - gradeMap[a.grade];
    } else if (typeof a[key] === "string") {
      return a[key].localeCompare(b[key]);
    } else {
      return b[key] - a[key];
    }
  });
  saveToStorage();
  renderTable();
}

function toggleChart() {
  const chartSection = document.getElementById("chartSection");
  if (chartSection.style.display === "none" || chartSection.style.display === "") {
    chartSection.style.display = "block";
    setTimeout(() => {
      drawChart();
    }, 100);
  } else {
    chartSection.style.display = "none";
  }
}

let myChartInstance = null;
let myPieInstance = null;

function drawChart() {
  const barCtx = document.getElementById("myChart").getContext("2d");
  const pieCtx = document.getElementById("pieChart").getContext("2d");

  const records = data[currentSemester] || [];
  const subjects = records.map(r => r.subject);
  const scores = records.map(r => r.total);
  const grades = records.map(r => r.grade);

  if (myChartInstance) myChartInstance.destroy();
  if (myPieInstance) myPieInstance.destroy();

  const chartColor = document.body.classList.contains("dark") ? "#f1f5f9" : "#1e293b";
  Chart.defaults.color = chartColor;

  myChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{
        label: "Total Marks",
        data: scores,
        backgroundColor: "#60a5fa",
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });

  const gradeCounts = {};
  grades.forEach(g => gradeCounts[g] = (gradeCounts[g] || 0) + 1);

  myPieInstance = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(gradeCounts),
      datasets: [{
        label: "Grades",
        data: Object.values(gradeCounts),
        backgroundColor: [
          "#60a5fa", "#34d399", "#facc15", "#f87171", "#a78bfa", "#fbbf24"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function changeSemester(sem) {
  currentSemester = sem;
  if (!data[currentSemester]) data[currentSemester] = [];
  renderTable();
  updateGPA();
}