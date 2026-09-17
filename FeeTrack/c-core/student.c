#include <stdio.h>
#include <string.h>
#include "fee_system.h"

void addStudent(
    Student students[],
    int *count,
    Student student
) {
    if (*count >= MAX_STUDENTS) {
        printf("Student storage is full.\n");
        return;
    }

    students[*count] = student;
    (*count)++;

    printf(
        "Student %s added successfully.\n",
        student.studentId
    );
}

int linearSearch(
    Student students[],
    int count,
    const char id[]
) {
    for (int i = 0; i < count; i++) {

        if (strcmp(
            students[i].studentId,
            id
        ) == 0) {
            return i;
        }
    }

    return -1;
}

int binarySearch(
    Student students[],
    int count,
    const char id[]
) {
    int left = 0;
    int right = count - 1;

    while (left <= right) {

        int mid = left + (right - left) / 2;

        int result =
            strcmp(
                students[mid].studentId,
                id
            );

        if (result == 0)
            return mid;

        if (result < 0)
            left = mid + 1;
        else
            right = mid - 1;
    }

    return -1;
}