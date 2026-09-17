#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "fee_system.h"

void addPayment(
    Payment **head,
    Payment payment
) {
    Payment *newPayment =
        malloc(sizeof(Payment));

    if (newPayment == NULL) {
        printf("Memory allocation failed.\n");
        return;
    }

    *newPayment = payment;
    newPayment->next = NULL;

    if (*head == NULL) {
        *head = newPayment;
        return;
    }

    Payment *current = *head;

    while (current->next != NULL)
        current = current->next;

    current->next = newPayment;
}

void enqueuePayment(
    PaymentQueue *queue,
    Payment *payment
) {
    if (queue->rear >= MAX_STUDENTS) {
        printf("Verification queue is full.\n");
        return;
    }

    queue->items[queue->rear++] = payment;
}

Payment *dequeuePayment(
    PaymentQueue *queue
) {
    if (queue->front >= queue->rear) {
        return NULL;
    }

    return queue->items[queue->front++];
}