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

  /**
   * To View the History
   * @param ctx - The transaction context object
   * @param drugName - Name of the Drug
   * @param serialNo - serialNo of the Drug
   * @returns
   */
  async viewHistory(ctx, drugName, serialNo) {
    // Create a composite key for the Drug
    const drugKey = ctx.stub.createCompositeKey(
      "org.pharma-net.manufacturer.drug",
      [drugName, serialNo]
    );

    // Return details of Drug from blockchain
    let drugBuffer = await ctx.stub
      .getState(drugKey)
      .catch((err) => console.log(err));

    let drugObject = JSON.parse(drugBuffer.toString());

    // Return value of updated Drug Object created to user
    return drugObject.shipment;
  }

  /**
   * To View the History
   * @param ctx - The transaction context object
   * @param drugName - Name of the Drug
   * @param serialNo - serialNo of the Drug
   * @returns
   */
  async viewDrugCurrentState(ctx, drugName, serialNo) {
    // Create a composite key for the Drug
    const drugKey = ctx.stub.createCompositeKey(
      "org.pharma-net.manufacturer.drug",
      [drugName, serialNo]
    );

    // Return details of Drug from blockchain
    let drugBuffer = await ctx.stub
      .getState(drugKey)
      .catch((err) => console.log(err));

    let drugObject = JSON.parse(drugBuffer.toString());

    // Return value of updated Drug Object created to user
    return drugObject;
  }
}

module.exports = ConsumerContract;
