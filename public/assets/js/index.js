import {
  getIndexedTransactions,
  indexTransaction,
  postIndexedTransactions,
} from "./indexedDB.js";
import { getTransactions, postTransaction } from "./api.js";
import { populateTotal, populateTable, populateChart } from "./populate.js";
import { sendTransaction } from "./form.js";

let transactions = [];
let myChart;

window.addEventListener("load", function () {
  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
  }

  // Add event listeners
  document.querySelector("#add-btn").onclick = function () {
    sendTransaction(true, transactions, myChart);
  };
  document.querySelector("#sub-btn").onclick = function () {
    sendTransaction(false, transactions, myChart);
  };
  window.addEventListener("online", postIndexedTransactions);

  // Get data and load page
  getTransactions().then(data => {
    // save db data on global variable
    transactions = data;

    if (!navigator.onLine) {
      getIndexedTransactions().then(transactionData => {
        if (transactionData.length > 0) {
          transactionData.forEach(result => {
            transactions.unshift(result);
          });
        }

        populateTotal(transactions);
        populateTable(transactions);
        populateChart(transactions, myChart);
      });
    } else {
      postIndexedTransactions();
      populateTotal(transactions);
      populateTable(transactions);
      populateChart(transactions, myChart);
    }
  });
});
