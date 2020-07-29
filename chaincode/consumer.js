"use strict";

const { Contract } = require("fabric-contract-api");

class ConsumerContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("org.pharma-net.consumer");
  }

  /* ****** All custom functions are defined below ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Consumer Smart Contract Instantiated");
  }
}
