import { postBulkTransactions } from "./api.js";

// set up the indexedDB 'budget' database
export function getBudgetIDBConnection() {
  return new Promise((resolve, reject) => {
    let db;
    if ("indexedDB" in window) {
      const request = indexedDB.open("budget", 1);

      // handles any errors when opening indexedDB database
      request.onerror = function (event) {
        reject(request.error);
      };

      // indexedDB successfully opened
      // set result to db global variable
      request.onsuccess = function (event) {
        db = request.result;
        resolve(db);
      };

      // when upgraded, create 'transactions' store
      request.onupgradeneeded = function (event) {
        const db = request.result;
        db.onerror = function (event) {
          reject(db.error);
        };

        db.createObjectStore("transactions", {
          autoIncrement: true,
        });
      };
    } else {
      reject(new Error("IndexedDB is not supported by this browser."));
    }
  });
}

export function indexTransaction(transactionData) {
  return new Promise((resolve, reject) => {
    getBudgetIDBConnection()
      .then(db => {
        if (db) {
          const transaction = db.transaction(["transactions"], "readwrite");
          const store = transaction.objectStore("transactions");
          store.add(transactionData);
          resolve(transactionData);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getIndexedTransactions() {
  return new Promise((resolve, reject) => {
    getBudgetIDBConnection()
      .then(db => {
        if (db) {
          const transaction = db.transaction(["transactions"], "readonly");
          const store = transaction.objectStore("transactions");
          const getAll = store.getAll();
          getAll.onsuccess = function () {
            resolve(getAll.result);
          };
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function clearIndexedTransactions() {
  getBudgetIDBConnection()
    .then(db => {
      if (db) {
        const transaction = db.transaction(["transactions"], "readwrite");
        const store = transaction.objectStore("transactions");
        store.clear();
      }
    })
    .catch(err => {
      console.log(err);
    });
}

export function postIndexedTransactions() {
  getIndexedTransactions()
    .then(transactions => {
      if (transactions.length > 0) {
        postBulkTransactions(transactions).then(() => {
          clearIndexedTransactions();
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}
