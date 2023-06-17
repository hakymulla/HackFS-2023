const ethers = require("ethers");
const fs = require('fs');
const Lit = require('./utils').Lit;
const Ipfs = require('./utils').Ipfs;
const key2 = process.env.PRIVATE_KEY_2;

const { getDefaultProvider } = require('ethers');

const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "cid",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symmetricKey",
                "type": "string"
            }
        ],
        "name": "addSymmetricKey",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "adddaceAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "daceAccess",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "deldaceAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "encryptedSymmetricKey",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_other",
                "type": "address"
            }
        ],
        "name": "isExistdaceAccess",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "showdaceAccess",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
let contractAddress = "0xec59DAFF6A78e09BA6fC9A257BAb82F3D7C3D116"
const provider = getDefaultProvider('https://api.calibration.node.glif.io/rpc/v0');

const daceContract = new ethers.Contract(contractAddress, abi, provider)

cid = "QmQYdFRX5Z99R5e1BbyGUtruUp9xuiS1wnRm4ETvrpVWrt"

async function DView(cid) {

    let encryptedSymmetricKey = await daceContract.encryptedSymmetricKey(cid)
    var lit = new Lit()
    await lit.connect()

    var ipfs = new Ipfs()
    await ipfs.ipfs_client()


    let saved_encrypted = await ipfs.getData(cid);
    // console.log("saved_encrypted:", saved_encrypted)

    var decrypted_file = await lit.decryptImage(saved_encrypted, encryptedSymmetricKey, key2)

    if ((Object.keys(decrypted_file.decrypted_json)[0] == 'type') & (Object.keys(decrypted_file.decrypted_json)[1] == 'data')) {
        console.log('Other Type')
        let array = new Uint8Array(decrypted_file.decrypted_json.data);
        fs.writeFileSync("data.csv", Buffer.from(array))
    }
    else {
        console.log('JSON File')
        console.log("Decrypted File:", decrypted_file.decrypted_json)
    }

}

DView(cid)