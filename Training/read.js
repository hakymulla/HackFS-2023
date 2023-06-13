const { Database } = require('@tableland/sdk');
const { Wallet } = require('ethers');
const { getDefaultProvider } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();


const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey);
const provider = getDefaultProvider('https://api.calibration.node.glif.io/rpc/v0');
const signer = wallet.connect(provider);
// Connect to the database
const db = new Database({ signer });

// const tableName = "fraud_detect_314159_96";
const tableName = "fraud_detect_314159_100";

async function main() {
    const { results, error } = await db.prepare(`SELECT * FROM ${tableName} ;`).all();
    console.log(results);

}

main();


