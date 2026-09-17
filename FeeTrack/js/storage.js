const DB_KEY = "feetrack_database";

const DEFAULT_DB = {
    students: [
        {
            id: "STU1001",
            name: "Rahul Sharma",
            course: "Computer Science",
            semester: "4th",
            contact: "9876543210",
            totalFee: 85000
        },
        {
            id: "STU1002",
            name: "Ankit Verma",
            course: "Information Technology",
            semester: "4th",
            contact: "9876501234",
            totalFee: 78000
        },
        {
            id: "STU1003",
            name: "Priya Singh",
            course: "Computer Science",
            semester: "4th",
            contact: "9812345678",
            totalFee: 85000
        }
    ],

    payments: [
        {
            id: "PAY10001",
            receipt: "REC-2026-0001",
            studentId: "STU1001",
            amount: 25000,
            mode: "UPI",
            date: "2026-09-15",
            status: "Paid",
            remarks: "Semester fee"
        },
        {
            id: "PAY10002",
            receipt: "",
            studentId: "STU1002",
            amount: 15000,
            mode: "Cash",
            date: "2026-09-14",
            status: "Pending",
            remarks: "Partial payment"
        },
        {
            id: "PAY10003",
            receipt: "REC-2026-0003",
            studentId: "STU1003",
            amount: 30000,
            mode: "Card",
            date: "2026-09-12",
            status: "Paid",
            remarks: "Semester fee"
        }
    ],

    fees: [
        {
            id: "FEE001",
            name: "Tuition Fee",
            amount: 60000,
            dueDate: "2026-10-15"
        },
        {
            id: "FEE002",
            name: "Hostel Fee",
            amount: 18000,
            dueDate: "2026-10-20"
        },
        {
            id: "FEE003",
            name: "Examination Fee",
            amount: 7000,
            dueDate: "2026-11-05"
        }
    ],

    activities: [
        {
            text: "System initialized",
            detail: "FeeTrack database loaded",
            time: new Date().toISOString()
        }
    ],

    notifications: []
};

function loadDB(){

    const data = localStorage.getItem(DB_KEY);

    if(!data){
        saveDB(DEFAULT_DB);
        return JSON.parse(JSON.stringify(DEFAULT_DB));
    }

    try{
        return JSON.parse(data);
    }catch{
        saveDB(DEFAULT_DB);
        return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
}

function saveDB(db){
    localStorage.setItem(DB_KEY,JSON.stringify(db));
}

function resetDatabase(){
    localStorage.removeItem(DB_KEY);
    location.reload();
}

function uid(prefix){
    return prefix + Date.now().toString().slice(-8);
}

function money(value){
    return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function formatDate(date){

    if(!date) return "-";

    return new Date(date + "T00:00:00")
        .toLocaleDateString("en-IN",{
            day:"2-digit",
            month:"short",
            year:"numeric"
        });
}

function getStudent(id){

    const db = loadDB();

    return db.students.find(
        student => student.id === id
    );
}

function getStudentPayments(id){

    const db = loadDB();

    return db.payments.filter(
        payment => payment.studentId === id
    );
}

function studentPaid(id){

    return getStudentPayments(id)
        .filter(payment => payment.status === "Paid")
        .reduce(
            (total,payment) =>
                total + Number(payment.amount),
            0
        );
}

function studentDue(student){

    return Math.max(
        0,
        Number(student.totalFee) -
        studentPaid(student.id)
    );
}

function generateReceiptNumber(){

    const db = loadDB();

    const year = new Date().getFullYear();

    const number =
        String(
            db.payments.filter(p => p.receipt).length + 1
        ).padStart(4,"0");

    return `REC-${year}-${number}`;
}

function addActivity(text,detail=""){

    const db = loadDB();

    db.activities.unshift({
        text,
        detail,
        time:new Date().toISOString()
    });

    db.activities =
        db.activities.slice(0,100);

    saveDB(db);
}

function addNotification(text,detail=""){

    const db = loadDB();

    db.notifications.unshift({
        text,
        detail,
        time:new Date().toISOString(),
        read:false
    });

    db.notifications =
        db.notifications.slice(0,50);

    saveDB(db);
}

function timeAgo(date){

    const seconds =
        Math.floor(
            (Date.now() -
            new Date(date).getTime()) / 1000
        );

    if(seconds < 60) return "Just now";

    if(seconds < 3600)
        return Math.floor(seconds/60) + " min ago";

    if(seconds < 86400)
        return Math.floor(seconds/3600) + " hours ago";

    return Math.floor(seconds/86400) + " days ago";
}