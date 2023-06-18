const { create } = require('ipfs-http-client');
const LitJsSdk = require("lit-js-sdk/build/index.node.js");
const u8a = require("uint8arrays");
const ethers = require("ethers");
const siwe = require("siwe");
const fs = require('fs');
const { hrtime } = require('process');
var JSZip = require('jszip');
const client = new LitJsSdk.LitNodeClient();
const chain = "mumbai";
require("dotenv").config({ path: ".env" });

const userAddress = '0x6066484DE209A9db68d09Ce6241C38E27Baa9143'
const contractAddress = '0x883b3b399fc4eb846c5cb3655F96f277F3B657B8';


const evmContractConditions = [
    {
        contractAddress: contractAddress,
        functionName: "isExistdaceAccess",
        functionParams: [userAddress, ":userAddress"],
        functionAbi: {
            inputs: [
                {
                    "internalType": "address",
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_other",
                    "type": "address"
                }
            ],
            name: "isExistdaceAccess",
            outputs: [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        chain: "mumbai",
        returnValueTest: {
            key: "",
            comparator: "=",
            value: "true",
        },
    },
];

async function SignAuth(privKey) {
    const privKeyBuffer = u8a.fromString(privKey, "base16");
    const wallet = new ethers.Wallet(privKeyBuffer);

    const domain = "localhost";
    const origin = "https://localhost/login";
    const statement =
        "This is a test statement.  You can put anything you want here.";
    const siweMessage = new siwe.SiweMessage({
        domain,
        address: wallet.address,
        statement,
        uri: origin,
        version: "1",
        chainId: "80001",
    });

    const messageToSign = siweMessage.prepareMessage();

    const signature = await wallet.signMessage(messageToSign);


    const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
    console.log("**************** Address **************** :", recoveredAddress)

    const authSig = {
        sig: signature,
        derivedVia: "web3.eth.personal.sign",
        signedMessage: messageToSign,
        address: recoveredAddress,
    };

    return authSig;
}

async function blobToBase64(blob) {
    let buffer = Buffer.from(await blob.text());
    return buffer.toString('base64');
}

async function encodeb64(uintarray) {
    const b64 = Buffer.from(uintarray).toString("base64");
    return b64;
}

class Lit {
    litNodeClient

    async connect() {
        await client.connect()
        this.litNodeClient = client
    }

    async encryptString(data, privKey) {
        if (!this.litNodeClient) {
            await this.connect()
        }
        const authSig = await SignAuth(privKey);
        const data_stringify = await JSON.stringify(data)
        const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(data_stringify)
        const encryptedString = await LitJsSdk.blobToBase64String(encryptedZip)

        const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
            evmContractConditions: evmContractConditions,
            symmetricKey,
            authSig,
            chain,
        })

        return {
            encryptedFile: encryptedString,
            encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
        }
    }

    async decryptString(encryptedStr, encryptedSymmetricKey) {
        if (!this.litNodeClient) {
            await this.connect()
        }
        const authSig = await signAuthMessage();
        // console.log(typeof (encryptedSymmetricKey))
        // console.log(encryptedSymmetricKey)
        const toDecrypt = encryptedSymmetricKey;

        const symmetricKey = await this.litNodeClient.getEncryptionKey({
            accessControlConditions: accessControlConditionsNFT,
            toDecrypt: encryptedSymmetricKey,
            chain,
            authSig
        })
        const decryptedFile = await LitJsSdk.decryptZip(
            LitJsSdk.base64StringToBlob(encryptedStr),
            symmetricKey
        );
        const decryptedString = await decryptedFile["string.txt"].async("text");
        // console.log((decryptedString))
        // console.log("type pf decryptedFile", typeof (decryptedString))

        return { decryptedString }
    }

    async decryptImage(encryptedStr, encryptedSymmetricKey, privKey) {
        if (!this.litNodeClient) {
            await this.connect()
        }
        const authSig = await SignAuth(privKey);
        // console.log(typeof (encryptedSymmetricKey))
        // console.log(encryptedSymmetricKey)
        const toDecrypt = encryptedSymmetricKey;

        const symmetricKey = await this.litNodeClient.getEncryptionKey({
            evmContractConditions: evmContractConditions,
            toDecrypt: encryptedSymmetricKey,
            chain,
            authSig
        })
        const decryptedFile = await LitJsSdk.decryptZip(
            LitJsSdk.base64StringToBlob(encryptedStr),
            symmetricKey
        );

        const decryptedString = await decryptedFile["string.txt"].async("text");
        const decrypted_json = JSON.parse(decryptedString)


        return { decrypted_json }
    }
}

class Ipfs {
    ipfsNodeClient
    async ipfs_client() {
        const ipfs = await create();
        this.ipfsNodeClient = ipfs;
    }

    async store(data) {
        if (!this.ipfsNodeClient) {
            await this.ipfs_client()
        }
        let output = await this.ipfsNodeClient.add(data);
        return output.cid
    }

    async getData(hash) {
        if (!this.ipfsNodeClient) {
            await this.ipfs_client()
        }
        let output = await this.ipfsNodeClient.cat(hash);
        let returned_string = ''
        for await (const x of output) {
            let data = Buffer.from(x).toString()
            returned_string = returned_string.concat("", data)
        }
        return returned_string
    }
}

function FileReader(path) {
    let data = fs.readFileSync(path)
    try {
        const obj = JSON.parse(data)
        return obj
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            return data
        }
        else {
            throw (e)
        }
    }
}

async function callLit() {
    var lit = new Lit()
    await lit.connect()

    var ipfs = new Ipfs()
    await ipfs.ipfs_client()

    // const data = FileReader('./Data/test.json')
    // const data = FileReader('EmployeeData.json')
    // const data = FileReader('./Data/sample2.json')
    data = {
        "name": "test",
        "age": 20
    }
    console.log(data)

    var result = await lit.encryptString(data);
    console.log("encryptedFile:", result.encryptedFile)
    console.log("encryptedSymmetricKey:", result.encryptedSymmetricKey)


    let cid = await ipfs.store(result.encryptedFile);
    console.log('encrypted data cid:', cid)

    let saved_encrypted = await ipfs.getData(cid);
    console.log("saved_encrypted:", saved_encrypted)
    console.log(saved_encrypted == result.encryptedFile)

    var decrypted_file = await lit.decryptImage(saved_encrypted, result.encryptedSymmetricKey)

    if ((Object.keys(decrypted_file.decrypted_json)[0] == 'type') & (Object.keys(decrypted_file.decrypted_json)[1] == 'data')) {
        console.log('Image Type')
        let array = new Uint8Array(decrypted_file.decrypted_json.data);
        fs.writeFileSync("data.jpeg", Buffer.from(array))
    }
    else {
        console.log('JSON File')
        console.log("Decrypted File:", decrypted_file.decrypted_json)
    }


}


module.exports = {
    Lit,
    Ipfs,
    FileReader,
    encodeb64,
    blobToBase64
}