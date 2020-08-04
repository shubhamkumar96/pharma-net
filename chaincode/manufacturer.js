"use strict";

const { Contract } = require("fabric-contract-api");

class ManufacturerContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("org.pharma-net.manufacturer");
  }

  /* ****** All custom functions are defined below ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Manufacturer Smart Contract Instantiated");
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
      hierarchyKey: "1", // Value of this for Manufacturer will be "1"
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
    await ctx.stub.putState(companyKey, dataBuffer);

    // Return value of new Company Object created to user
    return newCompanyObject;
  }

  /**
   * Create a Request for new Drug on the network
   * @param ctx - The transaction context object
   * @param drugName - Name of the Drug
   * @param serialNo - Serial Number of the Drug
   * @param mfgDate - Manufacture Date of the Drug
   * @param expDate - Expiry Date of the Drug
   * @param companyCRN - Company Registration Number of the Company
   * @returns
   */
  async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
    // Create a composite key for the new Drug
    const drugKey = ctx.stub.createCompositeKey(
      "org.pharma-net.manufacturer.drug",
      [drugName, serialNo]
    );

    // Create a Drug object to be stored in blockchain
    let newDrugObject = {
      productID: drugKey,
      name: drugName,
      manufacturer: ctx.clientIdentity.getID(),
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      owner: ctx.clientIdentity.getID(),
      shipment: [],
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newDrugObject));
    await ctx.stub.putState(drugKey, dataBuffer);

    // Return value of new Drug Object created to user
    return newDrugObject;
  }

  /**
   * Create a Shipment
   * @param ctx - The transaction context object
   * @param buyerCRN - CRN of the Buyer
   * @param drugName - Name of the Drug
   * @param listOfAssets - A list of the composite keys of all the Drugs that are being shipped in this consignment
   * @param transporterCRN - CRN of Transporter
   * @returns
   */
  async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
    // Create a composite key for the new Shipment
    const shipmentKey = ctx.stub.createCompositeKey(
      "org.pharma-net.manufacturer.shipment",
      [buyerCRN, drugName]
    );

    // Create a composite key for the Transporter
    const transporterKey = ctx.stub.createCompositeKey(
      "org.pharma-net.company",
      [transporterCRN]
    );

    // Create a Shipment object to be stored in blockchain
    let newShipmentObject = {
      shipmentID: shipmentKey,
      creator: ctx.clientIdentity.getID(),
      assets: listOfAssets,
      transporter: transporterKey,
      status: "in-transit",
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newShipmentObject));
    await ctx.stub.putState(shipmentKey, dataBuffer);

    // Return value of new Shipment Object created to user
    return newShipmentObject;
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

module.exports = ManufacturerContract;
