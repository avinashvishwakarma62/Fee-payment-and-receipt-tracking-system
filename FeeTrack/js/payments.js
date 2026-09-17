function renderPayments() {
    const db = loadDB();

    const search = (
        document.getElementById("paymentSearch")?.value || ""
    ).toLowerCase();

    const status = document.getElementById("paymentStatusFilter")?.value || "";
    const mode = document.getElementById("paymentModeFilter")?.value || "";

    const filtered = db.payments.filter(payment => {
        const student = db.students.find(s => s.id === payment.studentId);

        const text = `
            ${payment.id}
            ${payment.receipt}
            ${student?.name || ""}
            ${student?.id || ""}
        `.toLowerCase();

        return (
            text.includes(search) &&
            (!status || payment.status === status) &&
            (!mode || payment.mode === mode)
        );
    });

    const table = document.getElementById("paymentsTable");

    if (!table) return;

    table.innerHTML = filtered.map(payment => {
        const student = db.students.find(
            s => s.id === payment.studentId
        );

        return `
            <tr>
                <td>${payment.id}</td>

                <td>
                    ${payment.receipt || "-"}
                </td>

                <td>
                    ${student?.name || "Unknown"}
                    <small style="display:block;color:#9298a8">
                        ${student?.id || ""}
                    </small>
                </td>

                <td>${money(payment.amount)}</td>

                <td>${payment.mode}</td>

                <td>${formatDate(payment.date)}</td>

                <td>
                    <span class="status ${payment.status.toLowerCase()}">
                        ${payment.status}
                    </span>
                </td>

                <td>
                    ${
                        payment.status === "Pending"
                        ? `
                            <button
                                class="action-btn"
                                onclick="verifyPayment('${payment.id}','Paid')">
                                Approve
                            </button>

                            <button
                                class="action-btn"
                                onclick="verifyPayment('${payment.id}','Rejected')">
                                Reject
                            </button>
                        `
                        : ""
                    }

                    <button
                        class="action-btn"
                        onclick="viewPaymentReceipt('${payment.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join("") || emptyRow(8);
}


function openPaymentModal() {

    const modal = document.getElementById("paymentModal");

    if (!modal) return;

    const db = loadDB();

    const select = document.getElementById("paymentStudent");

    if (select) {
        select.innerHTML = `
            <option value="">Select student</option>
            ${db.students.map(student => `
                <option value="${student.id}">
                    ${student.id} — ${student.name}
                </option>
            `).join("")}
        `;
    }

    document.getElementById("paymentForm")?.reset();

    const date = document.getElementById("paymentDate");

    if (date) {
        date.value = new Date().toISOString().split("T")[0];
    }

    modal.classList.add("show");
}


function verifyPayment(id, newStatus) {

    const db = loadDB();

    const payment = db.payments.find(
        p => p.id === id
    );

    if (!payment) return;

    payment.status = newStatus;

    if (newStatus === "Paid" && !payment.receipt) {
        payment.receipt = generateReceiptNumber();
    }

    saveDB(db);

    const student = db.students.find(
        s => s.id === payment.studentId
    );

    addActivity(
        `Payment ${newStatus.toLowerCase()}`,
        `${student?.name || "Student"} — ${money(payment.amount)}`
    );

    addNotification(
        `Payment ${newStatus}`,
        `${student?.name || "Student"} — ${money(payment.amount)}`
    );

    showToast(
        `Payment ${newStatus} successfully.`
    );

    renderPayments();

    if (typeof renderDashboard === "function") {
        renderDashboard();
    }

    if (typeof renderReceipts === "function") {
        renderReceipts();
    }
}


const paymentForm = document.getElementById("paymentForm");

if (paymentForm) {

    paymentForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const db = loadDB();

        const studentId =
            document.getElementById("paymentStudent").value;

        const amount =
            Number(
                document.getElementById("paymentAmount").value
            );

        const student =
            db.students.find(
                s => s.id === studentId
            );

        if (!student) {
            showToast("Please select a student.");
            return;
        }

        if (!amount || amount <= 0) {
            showToast("Enter a valid payment amount.");
            return;
        }

        const payment = {

            id: uid("PAY"),

            receipt: "",

            studentId: studentId,

            amount: amount,

            mode:
                document.getElementById("paymentMode").value,

            date:
                document.getElementById("paymentDate").value,

            status:
                document.getElementById("paymentStatus").value,

            remarks:
                document.getElementById("paymentRemarks").value.trim()
        };

        if (payment.status === "Paid") {
            payment.receipt = generateReceiptNumber();
        }

        db.payments.unshift(payment);

        saveDB(db);

        addActivity(
            "Payment recorded",
            `${student.name} — ${money(amount)}`
        );

        addNotification(
            "New payment recorded",
            `${student.name} — ${money(amount)}`
        );

        closeModal("paymentModal");

        showToast("Payment recorded successfully.");

        renderPayments();

        if (typeof renderDashboard === "function") {
            renderDashboard();
        }
    });
}


document
    .getElementById("paymentSearch")
    ?.addEventListener("input", renderPayments);

document
    .getElementById("paymentStatusFilter")
    ?.addEventListener("change", renderPayments);

document
    .getElementById("paymentModeFilter")
    ?.addEventListener("change", renderPayments);