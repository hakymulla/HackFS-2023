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
const prefix = "eth_fraud";

async function main() {
    const { meta: create } = await db
        .prepare(`CREATE TABLE ${prefix} 
        (id integer primary key, address text, flag integer, minTimeBetweenSentTnx integer,
        maxTimeBetweenSentTnx integer, avgTimeBetweenSentTnx integer ,
        minTimeBetweenRecTnx integer, maxTimeBetweenRecTnx integer ,
        avgTimeBetweenRecTnx integer, sentTransactions integer, receivedTransactions integer, createdContracts integer,
        numUniqSentAddress integer, numUniqRecAddress integer, minValSent integer, maxValSent integer,
        avgValSent integer, minValReceived integer, maxValReceived integer, avgValReceived integer,
        totalTransactions integer, totalEtherSent integer, totalEtherReceived integer, totalEtherSentContracts integer
        );`)
        .run();

    console.log(create.txn.name); // 
}

main();