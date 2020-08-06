"use strict";

const { Contract } = require("fabric-contract-api");

class PharmaContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("org.pharma-net.pharmanet");
  }

  /* ****** All custom functions are defined below ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Pharmanet Smart Contract Instantiated");
  }

  /**
   * To Return the Organisational Role of the Company
   * @param ctx - The transaction context object
   * @param companyCRN - Company Registration Number of the Company
   * @returns
   */
  async getCompanyRole(ctx, companyCRN) {
    // Create a composite key for the company
    const companyKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.company",
      [companyCRN] // , companyName] //  Name of the company is not being used here as it will be difficult to retrieve the key in later functions.
    );

    // OR we can also do this using "ctx.clientIdentity.getID()"
    // const companyKey = ctx.clientIdentity.getID();

    // Return details of Company from blockchain
    let companyBuffer = await ctx.stub
      .getState(companyKey)
      .catch((err) => console.log(err));

    let companyObject = JSON.parse(companyBuffer.toString());

    // Return organisationRole of the company to user
    return companyObject.organisationRole;
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
    //    As this method is not valid for "Consumer".
    if (organisationRole === "Consumer") {
      return "Not Allowed to Invoke this Function";
    }

    //  Assigning Hierarchy Key for different Organizations.
    let hierarchyKey = null;
    if (organisationRole === "Manufacturer") {
      hierarchyKey = "1";
    } else if (organisationRole === "Distributor") {
      hierarchyKey = "2";
    } else if (organisationRole === "Retailer") {
      hierarchyKey = "3";
    }

    // Create a composite key for the new company
    const companyKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.company",
      [companyCRN] // , companyName] //  Name of the company is not being used here as it will be difficult to retrieve the key in later functions.
    );

    // To Validate if the Asset is already Present or not.
    let companyBuffer = await ctx.stub
      .getState(companyKey)
      .catch((err) => console.log(err));

    if (companyBuffer.length > 0 ) {
      return "Company already Registered";
    }

    // Create a Company object to be stored in blockchain
    let newCompanyObject = {
      companyID: companyKey,
      name: companyName,
      location: Location,
      organisationRole: organisationRole,
      hierarchyKey: hierarchyKey,
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
    //    As this method is only valid for "Manufacturer".
    let organisationRole = await getCompanyRole(ctx, companyCRN);
    if (organisationRole !== "Manufacturer") {
      return "Not Allowed to Invoke this Function";
    }

    // Create a composite key for the new Drug
    const drugKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.drug",
      [drugName, serialNo]
    );

    // To Validate if the Asset is already Present or not.
    let drugBuffer = await ctx.stub
      .getState(drugKey)
      .catch((err) => console.log(err));

    let drugObject = JSON.parse(drugBuffer.toString());
    if (drugObject !== null) {
      return "Drug already Registered";
    }

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
   * Create a Purchase Order(PO)
   * @param ctx - The transaction context object
   * @param buyerCRN - CRN of the Buyer
   * @param sellerCRN - CRN of the Seller
   * @param drugName - Name of the Drug
   * @param quantity - Quantity of Drugs for which Purchase Order is Created
   * @returns
   */
  async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
    //    As this method is only valid for "Distributor" & "Retailer".
    let organisationRole = await getCompanyRole(ctx, companyCRN);
    if (organisationRole === "Distributor" || organisationRole === "Retailer") {
    } else {
      return "Not Allowed to Invoke this Function";
    }

    // Create a composite key for the new PO
    const poKey = ctx.stub.createCompositeKey("org.pharma-net.pharmanet.po", [
      buyerCRN,
      drugName,
    ]);

    // Create a composite key for Seller of this PO
    const sellerKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.company",
      [sellerCRN]
    );

    // Create a PO object to be stored in blockchain
    let newPOObject = {
      poID: poKey,
      drugName: drugName,
      quantity: quantity,
      buyer: ctx.clientIdentity.getID(), // Here, Buyer will be the Distributor.
      seller: sellerKey, // Here, Seller will be the Manufacturer.
      createdAt: new Date(),
    };

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(newPOObject));
    await ctx.stub.putState(poKey, dataBuffer);

    // Return value of new PO Object created to user
    return newPOObject;
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
    //    As this method is only valid for "Manufacturer" & "Distributor".
    let organisationRole = await getCompanyRole(ctx, companyCRN);
    if (
      organisationRole === "Manufacturer" ||
      organisationRole === "Distributor"
    ) {
    } else {
      return "Not Allowed to Invoke this Function";
    }

    // Create a composite key for the new Shipment
    const shipmentKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.shipment",
      [buyerCRN, drugName]
    );

    // Create a composite key for the Transporter
    const transporterKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.company",
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
   * Update a Shipment
   * @param ctx - The transaction context object
   * @param buyerCRN - CRN of the Buyer
   * @param drugName - Name of the Drug
   * @param transporterCRN - CRN of Transporter
   * @returns
   */
  async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
    //    As this method is only valid for "Transporter".
    let organisationRole = await getCompanyRole(ctx, companyCRN);
    if (organisationRole !== "Transporter") {
      return "Not Allowed to Invoke this Function";
    }

    // Create a composite key for the new Shipment
    const shipmentKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.shipment",
      [buyerCRN, drugName]
    );

    // Create a composite key for the Buyer
    const buyerKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.company",
      [buyerCRN]
    );

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
   * Sell Drug to Consumer
   * @param ctx - The transaction context object
   * @param drugName - Name of the Drug
   * @param serialNo - serialNo of the Drug
   * @param retailerCRN - CRN of the Retailer
   * @param customerAadhar - Aadhar Number of the Customer
   * @returns
   */
  async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
    //    As this method is only valid for "Retailer".
    let organisationRole = await getCompanyRole(ctx, companyCRN);
    if (organisationRole !== "Retailer") {
      return "Not Allowed to Invoke this Function";
    }

    // Create a composite key for the Drug
    const drugKey = ctx.stub.createCompositeKey(
      "org.pharma-net.pharmanet.drug",
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
      "org.pharma-net.pharmanet.drug",
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
      "org.pharma-net.pharmanet.drug",
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

module.exports = PharmaContract;
