#include <string.h>
#include "fee_system.h"

static void swap(
    Student *a,
    Student *b
) {
    Student temp = *a;
    *a = *b;
    *b = temp;
}

static int partition(
    Student students[],
    int low,
    int high
) {
    char pivot[20];

    strcpy(
        pivot,
        students[high].studentId
    );

    int i = low - 1;

    for (int j = low; j < high; j++) {

        if (
            strcmp(
                students[j].studentId,
                pivot
            ) <= 0
        ) {
            i++;
            swap(
                &students[i],
                &students[j]
            );
        }
    }

    swap(
        &students[i + 1],
        &students[high]
    );

    return i + 1;
}

void quickSort(
    Student students[],
    int low,
    int high
) {
    if (low < high) {

        int pivot =
            partition(
                students,
                low,
                high
            );

        quickSort(
            students,
            low,
            pivot - 1
        );

        quickSort(
            students,
            pivot + 1,
            high
        );
    }
}