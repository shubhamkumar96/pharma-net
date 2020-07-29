"use strict";

const manufacturercontract = require("./manufacturer.js");
const distributorcontract = require("./distributor.js");
const retailercontract = require("./retailer.js");
const consumercontract = require("./consumer.js");
const transportercontract = require("./transporter.js");

module.exports.contracts = [
  manufacturercontract,
  distributorcontract,
  retailercontract,
  consumercontract,
  transportercontract,
];
