"use strict";

const { Contract } = require("fabric-contract-api");

class RetailerContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("org.pharma-net.retailer");
  }

  /* ****** All custom functions are defined below ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Retailer Smart Contract Instantiated");
  }

  /**
   * Create a Request for new Company on the network
   * @param ctx - The transaction context object
   * @param companyCRN - Company Registration Number of the Company
   * @param companyName - Name of the Company
   * @param Location - Location of the Company
   * @param organisationRole - Organisation Role of the Company
   * @returns
   */
  async registerCompany(
    ctx,
    companyCRN,
    companyName,
    Location,
    organisationRole
  ) {
    // Create a composite key for the new company
    const companyKey = ctx.stub.createCompositeKey(
      "org.pharma-net.company",
      [companyCRN] // , companyName] //  Name of the company is not being used here as it will be difficult to retrieve the key in later functions.
    );

    // Create a Company object to be stored in blockchain
    let newCompanyObject = {
      companyID: companyKey,
      name: companyName,
      location: Location,
      organisationRole: organisationRole,
      hierarchyKey: "3", // Value of this for Retailer will be "3"
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
    await ctx.stub.putState(companyKey, dataBuffer);

    // Return value of new Company Object created to user
    return newCompanyObject;
  }

  /**
   * Create a Purchase Order(PO)
   * @param ctx - The transaction context object
   * @param buyerCRN - CRN of the Buyer
   * @param sellerCRN - CRN of the Seller
   * @param drugName - Name of the Drug
   * @param quantity - Quantity of Drugs for which Purchase Order is Created
   * @returns
   */
  async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
    // Create a composite key for the new PO
    const poKey = ctx.stub.createCompositeKey("org.pharma-net.retailer.po", [
      buyerCRN,
      drugName,
    ]);

    // Create a composite key for Seller of this PO
    const sellerKey = ctx.stub.createCompositeKey("org.pharma-net.company", [
      sellerCRN,
    ]);

    // Create a PO object to be stored in blockchain
    let newPOObject = {
      poID: poKey,
      drugName: drugName,
      quantity: quantity,
      buyer: ctx.clientIdentity.getID(), // Here, Buyer will be the Retailer.
      seller: sellerKey, // Here, Seller will be the Distributor.
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newPOObject));
    await ctx.stub.putState(poKey, dataBuffer);

    // Return value of new PO Object created to user
    return newPOObject;
  }

  /**
   * Sell Drug to Consumer
   * @param ctx - The transaction context object
   * @param drugName - Name of the Drug
   * @param serialNo - serialNo of the Drug
   * @param retailerCRN - CRN of the Retailer
   * @param customerAadhar - Aadhar Number of the Customer
   * @returns
   */
  async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
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
    drugObject.owner = customerAadhar;

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(drugObject));
    await ctx.stub.putState(drugKey, dataBuffer);

    // Return value of updated Drug Object created to user
    return drugObject;
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

module.exports = RetailerContract;
