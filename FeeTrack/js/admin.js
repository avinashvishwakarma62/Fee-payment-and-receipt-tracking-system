const adminSession = requireAuth("admin");

if (adminSession) {

const db = loadDB();

const navItems = document.querySelectorAll(".nav[data-section]");
const pages = document.querySelectorAll(".page");

const titles = {
  dashboard: ["Dashboard","Welcome back! Here's what's happening today."],
  students: ["Students","Manage student records and fee information."],
  payments: ["Payments","Track and verify payment transactions."],
  receipts: ["Receipts","Search, view and print payment receipts."],
  fees: ["Fee Structure","Configure fees and payment deadlines."],
  reports: ["Reports","Analyze payment and collection records."],
  activity: ["Activity Logs","Track recent system activity."],
  notifications: ["Notifications","Payment and fee-related alerts."],
  settings: ["Settings","Manage account and system preferences."]
};

navItems.forEach(btn => {

  btn.addEventListener("click", () => {
    navigateTo(btn.dataset.section);
  });

});

window.navigateTo = function(section) {

  pages.forEach(p => p.classList.remove("active"));

  const target = document.getElementById(section);

  if (target) target.classList.add("active");

  navItems.forEach(n => {
    n.classList.toggle(
      "active",
      n.dataset.section === section
    );
  });

  if (titles[section]) {
    document.getElementById("pageTitle").textContent =
      titles[section][0];

    document.getElementById("pageSubtitle").textContent =
      titles[section][1];
  }

  renderAll();
};

document.getElementById("menuBtn").onclick = () => {
  document.getElementById("sidebar").classList.toggle("open");
};

document.getElementById("logoutBtn").onclick = logout;


/* DASHBOARD */

function renderDashboard() {

  const db = loadDB();

  const collected = db.payments
    .filter(p => p.status === "Paid")
    .reduce((sum,p) => sum + Number(p.amount),0);

  const pending = db.students
    .reduce((sum,s) => sum + studentDue(s),0);

  const today = new Date().toISOString().split("T")[0];

  const todayCount = db.payments
    .filter(p => p.date === today)
    .length;

  document.getElementById("totalStudents").textContent =
    db.students.length;

  document.getElementById("totalCollection").textContent =
    money(collected);

  document.getElementById("totalPending").textContent =
    money(pending);

  document.getElementById("todayPayments").textContent =
    todayCount;

  const recent = [...db.payments]
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0,5);

  document.getElementById("recentPayments").innerHTML =
    recent.map(p => {

      const s = getStudent(p.studentId);

      return `
      <tr>
        <td>${p.receipt || "-"}</td>
        <td>${s ? s.name : "Unknown"}</td>
        <td>${money(p.amount)}</td>
        <td>${p.mode}</td>
        <td>
          <span class="status ${p.status.toLowerCase()}">
            ${p.status}
          </span>
        </td>
      </tr>
      `;

    }).join("") || emptyRow(5);

  const paidStudents = db.students.filter(
    s => studentDue(s) <= 0
  ).length;

  const total = db.students.length;
  const percent = total
    ? Math.round((paidStudents / total) * 100)
    : 0;

  document.getElementById("paidPercentage").textContent =
    percent + "%";

  document.querySelector(".donut").style.background =
    `conic-gradient(#5b5ce2 ${percent * 3.6}deg,#eceef4 0deg)`;

  document.getElementById("paidCount").textContent =
    paidStudents;

  document.getElementById("pendingCount").textContent =
    total - paidStudents;

  document.getElementById("pendingBadge").textContent =
    db.payments.filter(p => p.status === "Pending").length;
}


/* STUDENTS */

function renderStudents() {

  const db = loadDB();

  const search =
    (document.getElementById("studentSearch")?.value || "")
      .toLowerCase();

  const course =
    document.getElementById("courseFilter")?.value || "";

  const filtered = db.students.filter(s => {

    const matchesSearch =
      s.name.toLowerCase().includes(search) ||
      s.id.toLowerCase().includes(search) ||
      s.course.toLowerCase().includes(search);

    const matchesCourse =
      !course || s.course === course;

    return matchesSearch && matchesCourse;
  });

  document.getElementById("studentsTable").innerHTML =
    filtered.map(s => {

      const paid = studentPaid(s.id);
      const due = studentDue(s);

      let status = "Pending";

      if (paid >= s.totalFee) status = "Paid";
      else if (paid > 0) status = "Partial";

      return `
      <tr>

        <td>
          <div class="student-cell">
            <div class="student-avatar">
              ${s.name.charAt(0)}
            </div>

            <div>
              <strong>${s.name}</strong>
              <small>${s.contact}</small>
            </div>
          </div>
        </td>

        <td>${s.id}</td>
        <td>${s.course}</td>
        <td>${s.semester}</td>
        <td>${money(s.totalFee)}</td>
        <td>${money(paid)}</td>
        <td>${money(due)}</td>

        <td>
          <span class="status ${status.toLowerCase()}">
            ${status}
          </span>
        </td>

        <td>
          <button class="action-btn"
            onclick="editStudent('${s.id}')">Edit</button>

          <button class="action-btn"
            onclick="deleteStudent('${s.id}')">Delete</button>
        </td>

      </tr>
      `;

    }).join("") || emptyRow(9);
}

document.getElementById("studentSearch")
?.addEventListener("input", renderStudents);

document.getElementById("courseFilter")
?.addEventListener("change", renderStudents);

window.resetStudentFilters = function() {

  document.getElementById("studentSearch").value = "";
  document.getElementById("courseFilter").value = "";

  renderStudents();
};


/* STUDENT MODAL */

window.openStudentModal = function(id = null) {

  document.getElementById("studentModal").classList.add("show");

  document.getElementById("studentForm").reset();

  document.getElementById("editStudentId").value = "";

  document.getElementById("studentId").disabled = false;

  document.getElementById("studentModalTitle").textContent =
    id ? "Edit Student" : "Add Student";

  if (id) {

    const s = getStudent(id);

    if (!s) return;

    document.getElementById("editStudentId").value = s.id;
    document.getElementById("studentId").value = s.id;
    document.getElementById("studentName").value = s.name;
    document.getElementById("studentCourse").value = s.course;
    document.getElementById("studentSemester").value = s.semester;
    document.getElementById("studentContact").value = s.contact;
    document.getElementById("studentFee").value = s.totalFee;

    document.getElementById("studentId").disabled = true;
  }
};

window.editStudent = id => openStudentModal(id);

document.getElementById("studentForm").onsubmit = e => {

  e.preventDefault();

  const db = loadDB();

  const editId =
    document.getElementById("editStudentId").value;

  const student = {
    id: document.getElementById("studentId").value.trim(),
    name: document.getElementById("studentName").value.trim(),
    course: document.getElementById("studentCourse").value,
    semester: document.getElementById("studentSemester").value,
    contact: document.getElementById("studentContact").value.trim(),
    totalFee: Number(document.getElementById("studentFee").value)
  };

  if (editId) {

    const index = db.students.findIndex(s => s.id === editId);

    if (index !== -1) {
      db.students[index] = student;
    }

    addActivity(
      "Student updated",
      `${student.name} (${student.id}) was updated`
    );

    showToast("Student updated successfully.");

  } else {

    if (db.students.some(s => s.id === student.id)) {
      showToast("Student ID already exists.");
      return;
    }

    db.students.push(student);

    addActivity(
      "Student added",
      `${student.name} (${student.id}) was added`
    );

    showToast("Student added successfully.");
  }

  saveDB(db);

  closeModal("studentModal");

  renderAll();
};

window.deleteStudent = id => {

  const db = loadDB();

  const student = db.students.find(s => s.id === id);

  if (!student) return;

  if (!confirm(`Delete ${student.name}?`)) return;

  db.students = db.students.filter(s => s.id !== id);

  db.payments = db.payments.filter(
    p => p.studentId !== id
  );

  saveDB(db);

  addActivity(
    "Student deleted",
    `${student.name} (${student.id}) was removed`
  );

  showToast("Student deleted.");

  renderAll();
};


/* PAYMENTS */

function renderPayments() {

  const db = loadDB();

  const search =
    (document.getElementById("paymentSearch")?.value || "")
      .toLowerCase();

  const status =
    document.getElementById("paymentStatusFilter")?.value || "";

  const mode =
    document.getElementById("paymentModeFilter")?.value || "";

  const filtered = db.payments.filter(p => {

    const s = getStudent(p.studentId);

    const text =
      `${p.id} ${p.receipt} ${s?.name || ""}`
        .toLowerCase();

    return (
      text.includes(search) &&
      (!status || p.status === status) &&
      (!mode || p.mode === mode)
    );

  });

  document.getElementById("paymentsTable").innerHTML =
    filtered.map(p => {

      const s = getStudent(p.studentId);

      return `
      <tr>

        <td>${p.id}</td>
        <td>${p.receipt || "-"}</td>
        <td>${s?.name || "Unknown"}</td>
        <td>${money(p.amount)}</td>
        <td>${p.mode}</td>
        <td>${formatDate(p.date)}</td>

        <td>
          <span class="status ${p.status.toLowerCase()}">
            ${p.status}
          </span>
        </td>

        <td>

          ${
            p.status === "Pending"
            ? `
            <button class="action-btn"
              onclick="verifyPayment('${p.id}','Paid')">
              Approve
            </button>

            <button class="action-btn"
              onclick="verifyPayment('${p.id}','Rejected')">
              Reject
            </button>
            `
            : ""
          }

          <button class="action-btn"
            onclick="viewReceipt('${p.id}')">
            View
          </button>

        </td>

      </tr>
      `;

    }).join("") || emptyRow(8);
}

document.getElementById("paymentSearch")
?.addEventListener("input", renderPayments);

document.getElementById("paymentStatusFilter")
?.addEventListener("change", renderPayments);

document.getElementById("paymentModeFilter")
?.addEventListener("change", renderPayments);

window.openPaymentModal = function() {

  document.getElementById("paymentModal").classList.add("show");

  const select =
    document.getElementById("paymentStudent");

  const db = loadDB();

  select.innerHTML =
    `<option value="">Select student</option>` +
    db.students.map(s =>
      `<option value="${s.id}">
        ${s.id} — ${s.name}
      </option>`
    ).join("");

  document.getElementById("paymentForm").reset();

  document.getElementById("paymentDate").value =
    new Date().toISOString().split("T")[0];
};

document.getElementById("paymentForm").onsubmit = e => {

  e.preventDefault();

  const db = loadDB();

  const studentId =
    document.getElementById("paymentStudent").value;

  const student = getStudent(studentId);

  if (!student) {
    showToast("Select a valid student.");
    return;
  }

  const amount =
    Number(document.getElementById("paymentAmount").value);

  const payment = {
    id: uid("PAY"),
    receipt: "",
    studentId,
    amount,
    mode: document.getElementById("paymentMode").value,
    date: document.getElementById("paymentDate").value,
    status: document.getElementById("paymentStatus").value,
    remarks: document.getElementById("paymentRemarks").value
  };

  if (payment.status === "Paid") {
    payment.receipt = generateReceiptNumber();
  }

  db.payments.unshift(payment);

  saveDB(db);

  addActivity(
    "Payment recorded",
    `${money(amount)} received from ${student.name}`
  );

  addNotification(
    "New payment recorded",
    `${student.name} — ${money(amount)}`
  );

  closeModal("paymentModal");

  showToast("Payment recorded successfully.");

  renderAll();
};

window.verifyPayment = function(id,status) {

  const db = loadDB();

  const payment = db.payments.find(p => p.id === id);

  if (!payment) return;

  payment.status = status;

  if (status === "Paid" && !payment.receipt) {
    payment.receipt = generateReceiptNumber();
  }

  saveDB(db);

  const student = getStudent(payment.studentId);

  addActivity(
    `Payment ${status.toLowerCase()}`,
    `${payment.id} for ${student?.name || ""}`
  );

  addNotification(
    `Payment ${status}`,
    `${student?.name || ""} — ${money(payment.amount)}`
  );

  showToast(`Payment ${status}.`);

  renderAll();
};


/* RECEIPTS */

function renderReceipts() {

  const db = loadDB();

  const search =
    (document.getElementById("receiptSearch")?.value || "")
      .toLowerCase();

  const payments = db.payments.filter(
    p => p.receipt
  );

  const filtered = payments.filter(p => {

    const s = getStudent(p.studentId);

    const text =
      `${p.receipt} ${p.id} ${s?.name || ""}`
        .toLowerCase();

    return text.includes(search);
  });

  document.getElementById("receiptsTable").innerHTML =
    filtered.map(p => {

      const s = getStudent(p.studentId);

      return `
      <tr>
        <td>${p.receipt}</td>
        <td>${s?.name || "-"}</td>
        <td>${p.id}</td>
        <td>${money(p.amount)}</td>
        <td>${formatDate(p.date)}</td>
        <td>
          <span class="status ${p.status.toLowerCase()}">
            ${p.status}
          </span>
        </td>
        <td>
          <button class="action-btn"
            onclick="viewReceipt('${p.id}')">
            View
          </button>
        </td>
      </tr>
      `;

    }).join("") || emptyRow(7);
}

document.getElementById("receiptSearch")
?.addEventListener("input", renderReceipts);

window.viewReceipt = function(paymentId) {

  const db = loadDB();

  const p = db.payments.find(
    x => x.id === paymentId
  );

  if (!p) return;

  const s = getStudent(p.studentId);

  document.getElementById("receiptContent").innerHTML =
    receiptHTML(p,s);

  document.getElementById("receiptModal")
    .classList.add("show");
};

function receiptHTML(p,s) {

  return `
  <div class="receipt-paper">

    <div class="receipt-head">

      <div class="receipt-brand">
        <strong>FeeTrack</strong>
        <p>Fee Management System</p>
      </div>

      <div class="receipt-number">
        <span>RECEIPT NUMBER</span>
        <strong>${p.receipt || "PENDING"}</strong>
      </div>

    </div>

    <div class="receipt-info">

      <div>
        <small>Student Name</small>
        <strong>${s?.name || "-"}</strong>
      </div>

      <div>
        <small>Student ID</small>
        <strong>${s?.id || "-"}</strong>
      </div>

      <div>
        <small>Course</small>
        <strong>${s?.course || "-"}</strong>
      </div>

      <div>
        <small>Payment Date</small>
        <strong>${formatDate(p.date)}</strong>
      </div>

      <div>
        <small>Payment Mode</small>
        <strong>${p.mode}</strong>
      </div>

      <div>
        <small>Payment ID</small>
        <strong>${p.id}</strong>
      </div>

    </div>

    <div class="receipt-total">
      <span>Amount Paid</span>
      <strong>${money(p.amount)}</strong>
    </div>

    <div class="receipt-footer">
      This is a digitally generated payment receipt.
      Please retain this receipt for future reference.
    </div>

  </div>
  `;
}

window.printReceipt = function() {
  window.print();
};


/* FEES */

function renderFees() {

  const db = loadDB();

  document.getElementById("feeGrid").innerHTML =
    db.fees.map(f => `

      <div class="fee-card">

        <div class="fee-card-top">

          <div>
            <h3>${f.name}</h3>
            <p>Fee category</p>
          </div>

          <button class="delete-fee"
            onclick="deleteFee('${f.id}')">
            ×
          </button>

        </div>

        <div class="fee-amount">
          ${money(f.amount)}
        </div>

        <div class="fee-meta">
          <span>Due Date</span>
          <strong>${formatDate(f.dueDate)}</strong>
        </div>

      </div>

    `).join("");
}

window.openFeeModal = function() {

  document.getElementById("feeForm").reset();

  document.getElementById("feeModal")
    .classList.add("show");
};

document.getElementById("feeForm").onsubmit = e => {

  e.preventDefault();

  const db = loadDB();

  const fee = {
    id: uid("FEE"),
    name: document.getElementById("feeName").value,
    amount: Number(document.getElementById("feeAmount").value),
    dueDate: document.getElementById("feeDueDate").value
  };

  db.fees.push(fee);

  saveDB(db);

  addActivity(
    "Fee structure updated",
    `${fee.name} was added`
  );

  closeModal("feeModal");

  showToast("Fee type added.");

  renderAll();
};

window.deleteFee = id => {

  const db = loadDB();

  db.fees = db.fees.filter(f => f.id !== id);

  saveDB(db);

  addActivity(
    "Fee removed",
    `Fee ${id} was deleted`
  );

  showToast("Fee removed.");

  renderAll();
};


/* REPORTS */

function renderReports() {

  const db = loadDB();

  const collected = db.payments
    .filter(p => p.status === "Paid")
    .reduce((sum,p) => sum + Number(p.amount),0);

  const pending = db.students
    .reduce((sum,s) => sum + studentDue(s),0);

  const totalFee =
    db.students.reduce(
      (sum,s) => sum + Number(s.totalFee),
      0
    );

  const rate = totalFee
    ? Math.round((collected / totalFee) * 100)
    : 0;

  document.getElementById("reportTransactions").textContent =
    db.payments.length;

  document.getElementById("reportCollected").textContent =
    money(collected);

  document.getElementById("reportPending").textContent =
    money(pending);

  document.getElementById("reportRate").textContent =
    rate + "%";

  const modes = [
    "UPI",
    "Cash",
    "Card",
    "Bank Transfer"
  ];

  document.getElementById("modeReport").innerHTML =
    modes.map(mode => {

      const amount = db.payments
        .filter(p => p.mode === mode && p.status === "Paid")
        .reduce((sum,p) => sum + Number(p.amount),0);

      const percent = collected
        ? Math.round(amount / collected * 100)
        : 0;

      return `
      <div class="report-row">

        <div class="report-row-top">
          <span>${mode}</span>
          <span>${money(amount)}</span>
        </div>

        <div class="progress">
          <div
            class="progress-bar"
            style="width:${percent}%">
          </div>
        </div>

      </div>
      `;

    }).join("");

  const paid =
    db.students.filter(s => studentDue(s) <= 0).length;

  const partial =
    db.students.filter(s =>
      studentPaid(s.id) > 0 &&
      studentDue(s) > 0
    ).length;

  const pendingStudents =
    db.students.length - paid - partial;

  document.getElementById("feeStatusReport").innerHTML = `
    ${reportRow("Fully Paid",paid,db.students.length)}
    ${reportRow("Partially Paid",partial,db.students.length)}
    ${reportRow("Pending",pendingStudents,db.students.length)}
  `;
}

function reportRow(name,value,total) {

  const percent =
    total ? Math.round(value / total * 100) : 0;

  return `
  <div class="report-row">

    <div class="report-row-top">
      <span>${name}</span>
      <span>${value}</span>
    </div>

    <div class="progress">
      <div class="progress-bar" style="width:${percent}%"></div>
    </div>

  </div>
  `;
}


/* ACTIVITY */

function renderActivity() {

  const db = loadDB();

  document.getElementById("activityList").innerHTML =
    db.activities.map(a => `

      <div class="activity-item">

        <div class="activity-icon">✓</div>

        <div>
          <strong>${a.text}</strong>
          <p>${a.detail}</p>
          <small>${timeAgo(a.time)}</small>
        </div>

      </div>

    `).join("");
}

window.clearActivityLogs = function() {

  const db = loadDB();

  db.activities = [];

  saveDB(db);

  showToast("Activity logs cleared.");

  renderActivity();
};


/* NOTIFICATIONS */

function renderNotifications() {

  const db = loadDB();

  document.getElementById("notificationList").innerHTML =
    db.notifications.map(n => `

      <div class="notification-item">

        <div class="activity-icon">♢</div>

        <div>
          <strong>${n.text}</strong>
          <p>${n.detail}</p>
          <small>${timeAgo(n.time)}</small>
        </div>

      </div>

    `).join("") ||
    `
      <div class="notification-item">
        <div class="activity-icon">✓</div>
        <div>
          <strong>No notifications</strong>
          <p>You're all caught up.</p>
        </div>
      </div>
    `;
}


/* SETTINGS */

window.saveSettings = function() {

  addActivity(
    "Profile settings updated",
    "Administrator profile was updated"
  );

  showToast("Settings saved.");
};


/* HELPERS */

function generateReceiptNumber() {

  const db = loadDB();

  const year = new Date().getFullYear();

  const number =
    String(db.payments.length + 1).padStart(4,"0");

  return `REC-${year}-${number}`;
}

function closeModal(id) {

  document.getElementById(id)
    ?.classList.remove("show");
}

window.closeModal = closeModal;

document.querySelectorAll(".modal-bg")
.forEach(bg => {

  bg.addEventListener("click",e => {

    if (e.target === bg) {
      bg.classList.remove("show");
    }

  });

});

function showToast(text) {

  const toast = document.getElementById("toast");

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  },2500);
}

function emptyRow(cols) {

  return `
  <tr>
    <td colspan="${cols}"
      style="text-align:center;padding:30px;color:#9298a8">
      No records found
    </td>
  </tr>
  `;
}

function timeAgo(date) {

  const diff =
    Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;

  return `${Math.floor(diff/86400)} days ago`;
}

function renderAll() {

  renderDashboard();
  renderStudents();
  renderPayments();
  renderReceipts();
  renderFees();
  renderReports();
  renderActivity();
  renderNotifications();
}

renderAll();

}