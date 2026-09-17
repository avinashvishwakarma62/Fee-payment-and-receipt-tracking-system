#ifndef FEE_SYSTEM_H
#define FEE_SYSTEM_H

#define MAX_STUDENTS 100
#define MAX_FEES 100
#define HASH_SIZE 101

typedef struct {
    char studentId[20];
    char name[100];
    char course[80];
    char semester[20];
    char contact[20];
    double totalFee;
} Student;

typedef struct Payment {
    char paymentId[20];
    char receiptNumber[30];
    char studentId[20];
    double amount;
    char paymentMode[30];
    char date[20];
    char status[20];
    struct Payment *next;
} Payment;

typedef struct {
    Payment *items[MAX_STUDENTS];
    int front;
    int rear;
} PaymentQueue;

typedef struct Activity {
    char message[200];
    struct Activity *next;
} Activity;

typedef struct {
    Student *student;
    int occupied;
} HashEntry;

void addStudent(Student students[], int *count, Student student);
int linearSearch(Student students[], int count, const char id[]);
int binarySearch(Student students[], int count, const char id[]);
void quickSort(Student students[], int low, int high);

void addPayment(Payment **head, Payment payment);
void enqueuePayment(PaymentQueue *queue, Payment *payment);
Payment *dequeuePayment(PaymentQueue *queue);

void pushActivity(Activity **top, const char message[]);
char *popActivity(Activity **top);

int hashFunction(const char id[]);
void insertHash(HashEntry table[], Student *student);
Student *searchHash(HashEntry table[], const char id[]);

#endif