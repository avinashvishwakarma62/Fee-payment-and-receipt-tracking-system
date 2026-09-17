#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "fee_system.h"

int main(void) {

    Student students[MAX_STUDENTS];

    int studentCount = 0;

    Payment *paymentList = NULL;

    PaymentQueue queue = {
        .front = 0,
        .rear = 0
    };

    Activity *activityStack = NULL;

    HashEntry hashTable[HASH_SIZE] = {0};

    Student s1 = {
        "STU1001",
        "Rahul Sharma",
        "Computer Science",
        "4th",
        "9876543210",
        85000
    };

    Student s2 = {
        "STU1002",
        "Ankit Verma",
        "Information Technology",
        "4th",
        "9876501234",
        78000
    };

    addStudent(
        students,
        &studentCount,
        s1
    );

    addStudent(
        students,
        &studentCount,
        s2
    );

    insertHash(
        hashTable,
        &students[0]
    );

    insertHash(
        hashTable,
        &students[1]
    );

    Payment payment = {
        "PAY10001",
        "REC-2026-0001",
        "STU1001",
        25000,
        "UPI",
        "2026-09-15",
        "Paid",
        NULL
    };

    addPayment(
        &paymentList,
        payment
    );

    enqueuePayment(
        &queue,
        paymentList
    );

    pushActivity(
        &activityStack,
        "Payment recorded"
    );

    Student *found =
        searchHash(
            hashTable,
            "STU1001"
        );

    if (found != NULL) {

        printf(
            "\nStudent Found: %s\n",
            found->name
        );

    }

    Payment *verified =
        dequeuePayment(&queue);

    if (verified != NULL) {

        printf(
            "Payment verified: %s\n",
            verified->paymentId
        );

    }

    free(paymentList);

    return 0;
}
