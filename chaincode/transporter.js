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
      hierarchyKey: null, // Value of this for Transporter will be "null"
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
    await ctx.stub.putState(companyKey, dataBuffer);

    // Return value of new Company Object created to user
    return newCompanyObject;
  }

  /**
   * Update a Shipment
   * @param ctx - The transaction context object
   * @param buyerCRN - CRN of the Buyer
   * @param drugName - Name of the Drug
   * @param transporterCRN - CRN of Transporter
   * @returns
   */
  async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
    // Create a composite key for the new Shipment
    const shipmentKey = ctx.stub.createCompositeKey(
      "org.pharma-net.manufacturer.shipment",
      [buyerCRN, drugName]
    );

    // Create a composite key for the Buyer
    const buyerKey = ctx.stub.createCompositeKey("org.pharma-net.company", [
      buyerCRN,
    ]);

    // Return details of Shipment from blockchain
    let shipmentBuffer = await ctx.stub
      .getState(shipmentKey)
      .catch((err) => console.log(err));

    let shipmentObject = JSON.parse(shipmentBuffer.toString());
    shipmentObject.status = "delivered";

    let listOfAssets = shipmentObject.assets;
    listOfAssets.forEach((asset) => {
      asset.shipment.push(shipmentKey);
      asset.owner = buyerKey;
    });

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(shipmentObject));
    await ctx.stub.putState(shipmentKey, dataBuffer);

    // Return value of updated Shipment Object created to user
    return shipmentObject;
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

module.exports = TransporterContract;
