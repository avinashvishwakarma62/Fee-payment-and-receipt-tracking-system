function renderReports() {

    const db = loadDB();

    const paidPayments =
        db.payments.filter(
            payment =>
                payment.status === "Paid"
        );

    const collected =
        paidPayments.reduce(
            (total, payment) =>
                total + Number(payment.amount),
            0
        );

    const totalFee =
        db.students.reduce(
            (total, student) =>
                total + Number(student.totalFee),
            0
        );

    const pending =
        db.students.reduce(
            (total, student) =>
                total + studentDue(student),
            0
        );

    const collectionRate =
        totalFee > 0
        ? Math.round(
            (collected / totalFee) * 100
        )
        : 0;

    setReportText(
        "reportTransactions",
        db.payments.length
    );

    setReportText(
        "reportCollected",
        money(collected)
    );

    setReportText(
        "reportPending",
        money(pending)
    );

    setReportText(
        "reportRate",
        collectionRate + "%"
    );

    renderModeReport(
        db,
        collected
    );

    renderFeeStatusReport(
        db
    );

    renderSummaryReport(
        db
    );
}


function renderModeReport(db, totalCollected) {

    const container =
        document.getElementById(
            "modeReport"
        );

    if (!container) return;

    const modes = [
        "UPI",
        "Cash",
        "Card",
        "Bank Transfer"
    ];

    container.innerHTML =
        modes.map(mode => {

            const amount =
                db.payments
                .filter(
                    payment =>
                        payment.mode === mode &&
                        payment.status === "Paid"
                )
                .reduce(
                    (total, payment) =>
                        total +
                        Number(payment.amount),
                    0
                );

            const percent =
                totalCollected > 0
                ? Math.round(
                    amount /
                    totalCollected *
                    100
                )
                : 0;

            return `
                <div class="report-row">

                    <div class="report-row-top">

                        <span>
                            ${mode}
                        </span>

                        <strong>
                            ${money(amount)}
                        </strong>

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
}


function renderFeeStatusReport(db) {

    const container =
        document.getElementById(
            "feeStatusReport"
        );

    if (!container) return;

    const fullyPaid =
        db.students.filter(
            student =>
                studentDue(student) <= 0
        ).length;

    const partiallyPaid =
        db.students.filter(
            student =>
                studentPaid(student.id) > 0 &&
                studentDue(student) > 0
        ).length;

    const pending =
        db.students.filter(
            student =>
                studentPaid(student.id) === 0
        ).length;

    const total =
        db.students.length;

    container.innerHTML =

        createReportRow(
            "Fully Paid",
            fullyPaid,
            total
        ) +

        createReportRow(
            "Partially Paid",
            partiallyPaid,
            total
        ) +

        createReportRow(
            "Pending",
            pending,
            total
        );
}


function createReportRow(
    title,
    value,
    total
) {

    const percent =
        total > 0
        ? Math.round(
            value / total * 100
        )
        : 0;

    return `
        <div class="report-row">

            <div class="report-row-top">

                <span>
                    ${title}
                </span>

                <strong>
                    ${value}
                </strong>

            </div>

            <div class="progress">

                <div
                    class="progress-bar"
                    style="width:${percent}%">
                </div>

            </div>

        </div>
    `;
}


function renderSummaryReport(db) {

    const container =
        document.getElementById(
            "summaryReport"
        );

    if (!container) return;

    const totalStudents =
        db.students.length;

    const paidStudents =
        db.students.filter(
            student =>
                studentDue(student) <= 0
        ).length;

    const partialStudents =
        db.students.filter(
            student =>
                studentPaid(student.id) > 0 &&
                studentDue(student) > 0
        ).length;

    const pendingStudents =
        totalStudents -
        paidStudents -
        partialStudents;

    const totalPayments =
        db.payments.length;

    const paidPayments =
        db.payments.filter(
            payment =>
                payment.status === "Paid"
        ).length;

    const pendingPayments =
        db.payments.filter(
            payment =>
                payment.status === "Pending"
        ).length;

    container.innerHTML = `

        <div class="report-row">

            <div class="report-row-top">
                <span>Registered Students</span>
                <strong>${totalStudents}</strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="width:100%">
                </div>
            </div>

        </div>


        <div class="report-row">

            <div class="report-row-top">
                <span>Fully Paid Students</span>
                <strong>${paidStudents}</strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="
                    width:${
                        totalStudents
                        ? Math.round(
                            paidStudents /
                            totalStudents *
                            100
                        )
                        : 0
                    }%">
                </div>
            </div>

        </div>


        <div class="report-row">

            <div class="report-row-top">
                <span>Partially Paid Students</span>
                <strong>${partialStudents}</strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="
                    width:${
                        totalStudents
                        ? Math.round(
                            partialStudents /
                            totalStudents *
                            100
                        )
                        : 0
                    }%">
                </div>
            </div>

        </div>


        <div class="report-row">

            <div class="report-row-top">
                <span>Students With Outstanding Fees</span>
                <strong>${pendingStudents}</strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="
                    width:${
                        totalStudents
                        ? Math.round(
                            pendingStudents /
                            totalStudents *
                            100
                        )
                        : 0
                    }%">
                </div>
            </div>

        </div>


        <div class="report-row">

            <div class="report-row-top">
                <span>Successful Transactions</span>
                <strong>
                    ${paidPayments} / ${totalPayments}
                </strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="
                    width:${
                        totalPayments
                        ? Math.round(
                            paidPayments /
                            totalPayments *
                            100
                        )
                        : 0
                    }%">
                </div>
            </div>

        </div>


        <div class="report-row">

            <div class="report-row-top">
                <span>Pending Transactions</span>
                <strong>
                    ${pendingPayments}
                </strong>
            </div>

            <div class="progress">
                <div
                    class="progress-bar"
                    style="
                    width:${
                        totalPayments
                        ? Math.round(
                            pendingPayments /
                            totalPayments *
                            100
                        )
                        : 0
                    }%">
                </div>
            </div>

        </div>
    `;
}


function setReportText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function printReport() {
    window.print();
}