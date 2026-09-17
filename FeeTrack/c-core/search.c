#include <string.h>
#include "fee_system.h"

int hashFunction(const char id[]) {

    unsigned long hash = 5381;

    int c;

    while ((c = *id++)) {
        hash =
            ((hash << 5) + hash) + c;
    }

    return hash % HASH_SIZE;
}

void insertHash(
    HashEntry table[],
    Student *student
) {
    int index =
        hashFunction(student->studentId);

    while (table[index].occupied) {
        index = (index + 1) % HASH_SIZE;
    }

    table[index].student = student;
    table[index].occupied = 1;
}

Student *searchHash(
    HashEntry table[],
    const char id[]
) {
    int index = hashFunction(id);

    int start = index;

    while (table[index].occupied) {

        if (
            strcmp(
                table[index].student->studentId,
                id
            ) == 0
        ) {
            return table[index].student;
        }

        index = (index + 1) % HASH_SIZE;

        if (index == start)
            break;
    }

    return NULL;
}