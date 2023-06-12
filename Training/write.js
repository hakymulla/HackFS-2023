const fs = require('fs');
const csv = require('csv-parser');
const { Database } = require('@tableland/sdk');
const { Wallet } = require('ethers');
const { getDefaultProvider } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey);
const provider = getDefaultProvider('https://filecoin-calibration.chainup.net/rpc/v1');
const signer = wallet.connect(provider);
// Connect to the database
const db = new Database({ signer });

const tableName = "eth_fraud_314159_25";

async function processCSV() {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream('../dataset/Eth_fraud_data.csv')
            .pipe(csv())
            .on('data', (data) => {
                // Process each row here
                results.push(data);
            })
            .on('end', () => {
                // CSV parsing is complete
                resolve(results);
            })
            .on('error', (error) => {
                // Error occurred while reading the CSV file
                reject(error);
            });
    });
}

// Usage
async function main() {
    try {
        const rows = await processCSV();
        // Loop through each row
        for (const [i, data] of rows.entries()) {
            console.log(data);
            console.log(i + 1)
            console.log('***')
            // Do something with each row

            const { meta: insert } = await db
                .prepare(`INSERT INTO ${tableName}  (id, address, flag, minTimeBetweenSentTnx,
                maxTimeBetweenSentTnx, avgTimeBetweenSentTnx,
                minTimeBetweenRecTnx, maxTimeBetweenRecTnx, avgTimeBetweenRecTnx,
                sentTransactions, receivedTransactions, createdContracts,
                numUniqSentAddress, numUniqRecAddress, minValSent, maxValSent,
                avgValSent, minValReceived, maxValReceived, avgValReceived,
                totalTransactions, totalEtherSent, totalEtherReceived,
                totalEtherSentContracts ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);`)
                .bind(data["id"] + 1, data["address"], data["flag"], data["minTimeBetweenSentTnx"], data["maxTimeBetweenSentTnx"],
                    data["avgTimeBetweenSentTnx"], data["minTimeBetweenRecTnx"], data["maxTimeBetweenRecTnx"],
                    data["avgTimeBetweenRecTnx"], data["sentTransactions"], data["receivedTransactions"], data["createdContracts"],
                    data["numUniqSentAddress"], data["numUniqRecAddress"], data["minValSent"], data["maxValSent"],
                    data["avgValSent"], data["minValReceived"], data["maxValReceived"], data["avgValReceived"],
                    data["totalTransactions"], data["totalEtherSent"], data["totalEtherReceived"], data["totalEtherSentContracts"],
                )
                .run();

            await insert.txn.wait();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
