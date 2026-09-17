// js/receipts.js

function renderReceipts() {
    const db = loadDB();

    const searchInput =
        document.getElementById("receiptSearch");

    const search =
        (searchInput?.value || "").toLowerCase().trim();

    const table =
        document.getElementById("receiptsTable");

    if (!table) return;

    const receipts = db.payments.filter(payment => {
        return (
            payment.receipt &&
            payment.status === "Paid"
        );
    });

    const filtered = receipts.filter(payment => {

        const student =
            db.students.find(
                student =>
                    student.id === payment.studentId
            );

        const searchableText = `
            ${payment.receipt}
            ${payment.id}
            ${payment.studentId}
            ${student?.name || ""}
            ${student?.course || ""}
            ${payment.mode}
        `.toLowerCase();

        return searchableText.includes(search);
    });

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                    text-align:center;
                    padding:40px;
                    color:#9298a8;
                    ">
                    No receipts found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = filtered.map(payment => {

        const student =
            db.students.find(
                student =>
                    student.id === payment.studentId
            );

        return `
            <tr>

                <td>
                    <strong>
                        ${payment.receipt}
                    </strong>
                </td>

                <td>
                    <div class="student-cell">

                        <div class="student-avatar">
                            ${(student?.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                ${student?.name || "Unknown"}
                            </strong>

                            <small>
                                ${student?.id || "-"}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${payment.id}
                </td>

                <td>
                    <strong>
                        ${money(payment.amount)}
                    </strong>
                </td>

                <td>
                    ${formatDate(payment.date)}
                </td>

                <td>
                    <span class="status paid">
                        Paid
                    </span>
                </td>

                <td>

                    <button
                        class="action-btn"
                        onclick="
                            viewPaymentReceipt(
                                '${payment.id}'
                            )
                        ">
                        View
                    </button>

                    <button
                        class="action-btn"
                        onclick="
                            printSpecificReceipt(
                                '${payment.id}'
                            )
                        ">
                        Print
                    </button>

                </td>

            </tr>
        `;

    }).join("");
}


/* ================================
   VIEW RECEIPT
================================ */

function viewPaymentReceipt(paymentId) {

    const db = loadDB();

    const payment =
        db.payments.find(
            payment =>
                payment.id === paymentId
        );

    if (!payment) {
        showToast("Receipt not found.");
        return;
    }

    const student =
        db.students.find(
            student =>
                student.id === payment.studentId
        );

    const content =
        document.getElementById(
            "receiptContent"
        );

    const modal =
        document.getElementById(
            "receiptModal"
        );

    if (!content || !modal) return;

    content.innerHTML =
        createReceiptHTML(
            payment,
            student
        );

    modal.classList.add("show");
}


/* ================================
   RECEIPT HTML
================================ */

function createReceiptHTML(
    payment,
    student
) {

    const totalFee =
        Number(
            student?.totalFee || 0
        );

    const totalPaid =
        student
            ? studentPaid(student.id)
            : Number(payment.amount);

    const outstanding =
        Math.max(
            0,
            totalFee - totalPaid
        );

    return `
        <div class="receipt-paper">

            <div class="receipt-head">

                <div class="receipt-brand">

                    <strong>
                        FeeTrack
                    </strong>

                    <p>
                        Fee Management System
                    </p>

                </div>

                <div class="receipt-number">

                    <span>
                        RECEIPT NUMBER
                    </span>

                    <strong>
                        ${payment.receipt || "-"}
                    </strong>

                </div>

            </div>


            <div class="receipt-info">

                <div>
                    <small>
                        Student Name
                    </small>

                    <strong>
                        ${student?.name || "-"}
                    </strong>
                </div>


                <div>
                    <small>
                        Student ID
                    </small>

                    <strong>
                        ${student?.id || "-"}
                    </strong>
                </div>


                <div>
                    <small>
                        Course
                    </small>

                    <strong>
                        ${student?.course || "-"}
                    </strong>
                </div>


                <div>
                    <small>
                        Semester
                    </small>

                    <strong>
                        ${student?.semester || "-"}
                    </strong>
                </div>


                <div>
                    <small>
                        Payment ID
                    </small>

                    <strong>
                        ${payment.id}
                    </strong>
                </div>


                <div>
                    <small>
                        Payment Date
                    </small>

                    <strong>
                        ${formatDate(payment.date)}
                    </strong>
                </div>


                <div>
                    <small>
                        Payment Mode
                    </small>

                    <strong>
                        ${payment.mode}
                    </strong>
                </div>


                <div>
                    <small>
                        Payment Status
                    </small>

                    <strong>
                        ${payment.status}
                    </strong>
                </div>

            </div>


            <div
                style="
                margin-top:5px;
                border:1px solid #e5e6eb;
                border-radius:8px;
                overflow:hidden;
                "
            >

                <div
                    style="
                    display:grid;
                    grid-template-columns:2fr 1fr;
                    padding:12px;
                    background:#f8f8fa;
                    font-size:9px;
                    font-weight:700;
                    "
                >

                    <span>
                        Description
                    </span>

                    <span>
                        Amount
                    </span>

                </div>


                <div
                    style="
                    display:grid;
                    grid-template-columns:2fr 1fr;
                    padding:15px 12px;
                    font-size:10px;
                    "
                >

                    <span>
                        ${
                            payment.remarks ||
                            "Fee Payment"
                        }
                    </span>

                    <strong>
                        ${money(payment.amount)}
                    </strong>

                </div>

            </div>


            <div
                style="
                display:flex;
                justify-content:flex-end;
                margin-top:15px;
                "
            >

                <div
                    style="
                    min-width:230px;
                    "
                >

                    <div
                        style="
                        display:flex;
                        justify-content:space-between;
                        padding:7px 0;
                        font-size:9px;
                        color:#646b7c;
                        "
                    >

                        <span>
                            Amount Paid
                        </span>

                        <strong>
                            ${money(payment.amount)}
                        </strong>

                    </div>


                    <div
                        style="
                        display:flex;
                        justify-content:space-between;
                        padding:9px 0;
                        border-top:1px solid #ddd;
                        font-size:11px;
                        "
                    >

                        <strong>
                            Outstanding Balance
                        </strong>

                        <strong>
                            ${money(outstanding)}
                        </strong>

                    </div>

                </div>

            </div>


            ${
                payment.remarks
                ? `
                    <div
                        style="
                        margin-top:15px;
                        padding:11px;
                        background:#f8f8fa;
                        border-radius:7px;
                        font-size:9px;
                        "
                    >

                        <strong>
                            Remarks:
                        </strong>

                        ${payment.remarks}

                    </div>
                `
                : ""
            }


            <div class="receipt-footer">

                <p>
                    This is a digitally generated
                    payment receipt.
                </p>

                <p>
                    Please retain this receipt
                    for future reference.
                </p>

            </div>

        </div>
    `;
}


/* ================================
   PRINT RECEIPT
================================ */

function printSpecificReceipt(paymentId) {

    viewPaymentReceipt(paymentId);

    setTimeout(() => {
        window.print();
    }, 300);
}


function printReceipt() {
    window.print();
}


/* ================================
   DOWNLOAD RECEIPT AS PDF
================================ */

function downloadReceipt(paymentId) {

    viewPaymentReceipt(paymentId);

    setTimeout(() => {

        window.print();

    }, 300);
}


/* ================================
   SEARCH
================================ */

const receiptSearch =
    document.getElementById(
        "receiptSearch"
    );

if (receiptSearch) {

    receiptSearch.addEventListener(
        "input",
        renderReceipts
    );
}


/* ================================
   INITIAL LOAD
================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "receiptsTable"
            )
        ) {
            renderReceipts();
        }

    }
);