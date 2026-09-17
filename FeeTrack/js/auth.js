const ADMIN_ACCOUNT = {
    username: "admin",
    password: "admin123"
};

const STUDENT_ACCOUNTS = {
    STU1001: "student123",
    STU1002: "student123",
    STU1003: "student123"
};


/* =========================
   SESSION
========================= */

function createSession(type, user) {

    localStorage.setItem(
        "feeTrackSession",
        JSON.stringify({
            type: type,
            user: user,
            loginAt: new Date().toISOString()
        })
    );
}


function getSession() {

    const session =
        localStorage.getItem("feeTrackSession");

    if (!session) {
        return null;
    }

    try {
        return JSON.parse(session);
    } catch (error) {
        return null;
    }
}


function logout() {

    localStorage.removeItem("feeTrackSession");

    window.location.href = "login.html";
}


function requireAuth(type) {

    const session = getSession();

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    if (type && session.type !== type) {

        if (session.type === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "student.html";
        }

        return null;
    }

    return session;
}


/* =========================
   LOGIN
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }


    let loginType = "admin";


    const adminTab =
        document.getElementById("adminTab");

    const studentTab =
        document.getElementById("studentTab");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    const message =
        document.getElementById("loginMessage");

    const demoInfo =
        document.getElementById("demoInfo");


    /* =========================
       ADMIN TAB
    ========================= */

    if (adminTab) {

        adminTab.addEventListener(
            "click",
            function () {

                loginType = "admin";

                adminTab.classList.add("active");

                if (studentTab) {
                    studentTab.classList.remove("active");
                }

                if (username) {
                    username.placeholder =
                        "Enter admin username";

                    username.value = "";
                }

                if (password) {
                    password.value = "";
                }

                if (demoInfo) {

                    demoInfo.innerHTML = `
                        <strong>Demo Admin</strong>
                        <code>admin</code>
                        <code>admin123</code>
                    `;
                }

                if (message) {
                    message.textContent = "";
                }
            }
        );
    }


    /* =========================
       STUDENT TAB
    ========================= */

    if (studentTab) {

        studentTab.addEventListener(
            "click",
            function () {

                loginType = "student";

                studentTab.classList.add("active");

                if (adminTab) {
                    adminTab.classList.remove("active");
                }

                if (username) {
                    username.placeholder =
                        "Enter Student ID";

                    username.value = "";
                }

                if (password) {
                    password.value = "";
                }

                if (demoInfo) {

                    demoInfo.innerHTML = `
                        <strong>Demo Student</strong>
                        <code>STU1001</code>
                        <code>student123</code>
                    `;
                }

                if (message) {
                    message.textContent = "";
                }
            }
        );
    }


    /* =========================
       PASSWORD TOGGLE
    ========================= */

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (
                    password.type ===
                    "password"
                ) {

                    password.type = "text";

                    togglePassword.textContent =
                        "Hide";

                } else {

                    password.type = "password";

                    togglePassword.textContent =
                        "Show";
                }
            }
        );
    }


    /* =========================
       LOGIN SUBMIT
    ========================= */

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const user =
                username.value.trim();

            const pass =
                password.value;


            if (!user || !pass) {

                if (message) {

                    message.style.color =
                        "#d64e4e";

                    message.textContent =
                        "Please enter your credentials.";
                }

                return;
            }


            /* =========================
               ADMIN LOGIN
            ========================= */

            if (loginType === "admin") {

                if (
                    user === ADMIN_ACCOUNT.username &&
                    pass === ADMIN_ACCOUNT.password
                ) {

                    createSession(
                        "admin",
                        {
                            username: user
                        }
                    );


                    if (message) {

                        message.style.color =
                            "#159a68";

                        message.textContent =
                            "Login successful...";
                    }


                    setTimeout(
                        function () {

                            window.location.href =
                                "admin.html";

                        },
                        300
                    );

                } else {

                    if (message) {

                        message.style.color =
                            "#d64e4e";

                        message.textContent =
                            "Invalid administrator credentials.";
                    }
                }

                return;
            }


            /* =========================
               STUDENT LOGIN
            ========================= */

            const studentId =
                Object.keys(
                    STUDENT_ACCOUNTS
                ).find(
                    function (id) {

                        return (
                            id.toLowerCase() ===
                            user.toLowerCase()
                        );

                    }
                );


            if (
                studentId &&
                STUDENT_ACCOUNTS[studentId] === pass
            ) {


                /*
                 * Get student directly from database.
                 * storage.js must be loaded before auth.js.
                 */

                const db =
                    typeof loadDB === "function"
                    ? loadDB()
                    : null;


                const student =
                    db
                    ? db.students.find(
                        function (item) {
                            return (
                                item.id ===
                                studentId
                            );
                        }
                    )
                    : null;


                createSession(
                    "student",
                    {
                        id: studentId,

                        name:
                            student
                            ? student.name
                            : studentId
                    }
                );


                if (message) {

                    message.style.color =
                        "#159a68";

                    message.textContent =
                        "Login successful...";
                }


                setTimeout(
                    function () {

                        window.location.href =
                            "student.html";

                    },
                    300
                );


            } else {

                if (message) {

                    message.style.color =
                        "#d64e4e";

                    message.textContent =
                        "Invalid Student ID or password.";
                }
            }

        }
    );

});