import { populateChart, populateTable, populateTotal } from "./populate.js";
import { postTransaction } from "./api.js";
import { indexTransaction } from "./indexedDB.js";

export function sendTransaction(isAdding, transactions, myChart) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString(),
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart(transactions, myChart);
  populateTable(transactions);
  populateTotal(transactions);

  // also send to server
  postTransaction(transaction)
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      } else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(err => {
      // fetch failed, so save in indexed db
      indexTransaction(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}
