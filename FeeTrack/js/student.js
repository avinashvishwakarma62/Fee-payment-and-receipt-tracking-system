const studentSession = requireAuth("student");

if (studentSession) {

const student = getStudent(studentSession.user.id);

if (!student) {
  logout();
}

const nav = document.querySelectorAll(
  ".nav[data-section]"
);

const pages = document.querySelectorAll(".page");

nav.forEach(btn => {

  btn.onclick = () => {

    pages.forEach(p => p.classList.remove("active"));

    document.getElementById(
      btn.dataset.section
    ).classList.add("active");

    nav.forEach(n => n.classList.remove("active"));

    btn.classList.add("active");

    const titles = {
      studentOverview: "Overview",
      studentPayments: "Payment History",
      studentReceipts: "My Receipts",
      studentProfile: "My Profile"
    };

    document.getElementById("studentPageTitle")
      .textContent = titles[btn.dataset.section];

    renderStudent();
  };

});

document.getElementById("menuBtn").onclick = () => {

  document.querySelector(".sidebar")
    .classList.toggle("open");

};

function renderStudent() {

  const current = getStudent(student.id);

  if (!current) return;

  const payments = getStudentPayments(current.id);

  const paid = studentPaid(current.id);
  const due = studentDue(current);

  document.getElementById("studentNameTitle").textContent =
    current.name;

  document.getElementById("studentSideName").textContent =
    current.name;

  document.getElementById("studentAvatar").textContent =
    current.name.charAt(0);

  document.getElementById("studentTopAvatar").textContent =
    current.name.charAt(0);

  document.getElementById("studentTotalFee").textContent =
    money(current.totalFee);

  document.getElementById("studentPaid").textContent =
    money(paid);

  document.getElementById("studentDue").textContent =
    money(due);

  document.getElementById("studentPaymentCount").textContent =
    payments.length;

  document.getElementById("profileName").textContent =
    current.name;

  document.getElementById("profileId").textContent =
    current.id;

  document.getElementById("profileCourse").textContent =
    current.course;

  document.getElementById("profileSemester").textContent =
    current.semester;

  document.getElementById("profileContact").textContent =
    current.contact;

  document.getElementById("profileFee").textContent =
    money(current.totalFee);

  document.getElementById("profileAvatar").textContent =
    current.name.charAt(0);

  renderStudentPayments(payments);

  renderStudentReceipts(payments);

}

function renderStudentPayments(payments) {

  const html = payments
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(p => `

      <tr>

        <td>${p.id}</td>

        <td>${p.receipt || "-"}</td>

        <td>${money(p.amount)}</td>

        <td>${p.mode}</td>

        <td>${formatDate(p.date)}</td>

        <td>
          <span class="status ${p.status.toLowerCase()}">
            ${p.status}
          </span>
        </td>

      </tr>

    `).join("");

  document.getElementById(
    "studentPaymentsTable"
  ).innerHTML = html || emptyStudentRow(6);

  document.getElementById(
    "studentRecentPayments"
  ).innerHTML =
    payments.slice(0,5).map(p => `

      <tr>
        <td>${p.receipt || "-"}</td>
        <td>${money(p.amount)}</td>
        <td>${p.mode}</td>
        <td>${formatDate(p.date)}</td>
        <td>
          <span class="status ${p.status.toLowerCase()}">
            ${p.status}
          </span>
        </td>
      </tr>

    `).join("") || emptyStudentRow(5);
}

function renderStudentReceipts(payments) {

  const receipts = payments.filter(
    p => p.receipt
  );

  document.getElementById(
    "studentReceiptsTable"
  ).innerHTML =

    receipts.map(p => `

      <tr>

        <td>${p.receipt}</td>
        <td>${p.id}</td>
        <td>${money(p.amount)}</td>
        <td>${formatDate(p.date)}</td>

        <td>
          <button class="action-btn"
            onclick="viewStudentReceipt('${p.id}')">
            View
          </button>
        </td>

      </tr>

    `).join("") || emptyStudentRow(5);
}

window.viewStudentReceipt = function(id) {

  const db = loadDB();

  const payment = db.payments.find(
    p => p.id === id
  );

  if (!payment) return;

  document.getElementById(
    "studentReceiptContent"
  ).innerHTML =
    receiptHTML(payment,student);

  document.getElementById(
    "studentReceiptModal"
  ).classList.add("show");
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
        <strong>${p.receipt}</strong>
      </div>

    </div>

    <div class="receipt-info">

      <div>
        <small>Student Name</small>
        <strong>${s.name}</strong>
      </div>

      <div>
        <small>Student ID</small>
        <strong>${s.id}</strong>
      </div>

      <div>
        <small>Course</small>
        <strong>${s.course}</strong>
      </div>

      <div>
        <small>Semester</small>
        <strong>${s.semester}</strong>
      </div>

      <div>
        <small>Payment Date</small>
        <strong>${formatDate(p.date)}</strong>
      </div>

      <div>
        <small>Payment Mode</small>
        <strong>${p.mode}</strong>
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

window.printStudentReceipt = function() {
  window.print();
};

function emptyStudentRow(cols) {

  return `
  <tr>
    <td colspan="${cols}"
      style="text-align:center;padding:30px;color:#9298a8">
      No records found
    </td>
  </tr>
  `;
}

renderStudent();

}