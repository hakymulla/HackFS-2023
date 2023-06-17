# 🕵🏾 Ethereum Account Fraud Detection (EFD)

EFD also know as Ethereum Account Fraud Detection is a smart contract on Filecoin that allows users to check if a particular Account is Fraudulent or not which is powered by Machine Learning.

## 💻 Tech Stack
- Solidity
- Python
- JavaScript
- Bacalhau
- LilyPad
- Machine Learning
- Docker
- TableLand
- LitProtocol

## Smart Contract
    - Address: 0x6767F769741c975a3FF5718BC56C4d73eEB08660
    - Network: Filecoin - Calibration testnet
    - TableLand Table Name - fraud_detect_314159_115

    DACE for LitProtocol
     - Mumbai : 0x46de762fe5A3bbC73918B8c3cFe466d18Dd58903
     - Caliberation : 0xec59DAFF6A78e09BA6fC9A257BAb82F3D7C3D116

## Dataset
 - https://www.kaggle.com/datasets/gescobero/ethereum-fraud-dataset

 This project uses Bacalhau for Machine Learning Training and Inference (Compute) by calling a docker container, Lilypad  for calling Bacalhau jobs from smart contracts and TableLand table for storing the results of the Machine Learning model which can be used to monitor the model perfomance.

1. Enctypt and Decrpyt data with LitProtocol

2. The FVM smart contract deployed on the caliberation testnet. The user interacts with the IsFraudDetector payable function which takes as input an Ethereum Account, the fee payment is used to cover gas cost of the callback from the bridge.

3. IsFraudDetector then calls the  the bridge runLilypadJob payable function sending the gas fee and a constructed bacalhau prompt.

4. Bacalhau starts the job based on the prompt from the smart contract. (However bacalhau runs a docker container which has already been deployed).

5. The docker container contains a python script and and RandomForest Model, the python script takes the argument (The Ethereum Address in this case), and retrieves the address information using the etherscan api which are then used as features for the Machine Learning Model. The RandomForest model is then used to predict if the Account is Fraudulent or not.

6. When the job is done, the bridge calls the lilypadFulfilled function(this is where the gas fee is needed) and send the result to the smart contract.

7. During contract deployment, a tableland table is created. The bridge while calling the lilypadFulfilled also saves the results to the table which can be used to monitor the model perfomance.