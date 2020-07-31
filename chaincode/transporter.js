"use strict";

const { Contract } = require("fabric-contract-api");

class TransporterContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("org.pharma-net.transporter");
  }

  /* ****** All custom functions are defined below ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Transporter Smart Contract Instantiated");
  }
}

module.exports = TransporterContract;
