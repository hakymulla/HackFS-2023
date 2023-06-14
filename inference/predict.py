import argparse
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn import preprocessing
import pickle
import os
from constants import *
from address_information import get_features_from_address


def preprocessing(address):
    columns = [
        "minTimeBetweenSentTnx",
        "maxTimeBetweenSentTnx",
        "avgTimeBetweenSentTnx",
        "minTimeBetweenRecTnx",
        "maxTimeBetweenRecTnx",
        "avgTimeBetweenRecTnx",
        "lifetime",
        "sentTransactions",
        "receivedTransactions",
        "createdContracts",
        "numUniqSentAddress",
        "numUniqRecAddress",
        "minValSent",
        "maxValSent",
        "avgValSent",
        "minValReceived",
        "maxValReceived",
        "avgValReceived",
        "totalTransactions",
        "totalEtherSent",
        "totalEtherReceived",
        "totalEtherSentContracts",
        "totalEtherBalance",
        "activityDays",
        "dailyMax",
        "ratioRecSent",
        "ratioSentTotal",
        "ratioRecTotal",
        "giniSent",
        "giniRec",
        "txFreq",
        "stdBalanceEth",
    ]

    address_data = get_features_from_address(address=address)[1:]
    data = np.array(address_data).astype("float64").reshape(1, 32)
    test_data = pd.DataFrame(data, columns=columns)

    return test_data, address


def predict(data, address):
    prediction_data, address = preprocessing(address=address)
    model = pickle.load(open("rf.pkl", "rb",))
    result = model.predict(prediction_data)
    return result, address


parser = argparse.ArgumentParser(description="Ethereum Fraud Description")
parser.add_argument("--address", dest="address", type=str, help="Ethereum Address")

args = parser.parse_args()
address = args.address

result, address = predict(*preprocessing(address=address))
mapper = {0: "Non Fraud", 1: "Fraud"}

print(f"Is Address: {address }Fraudulent? {mapper[result[0]]}.")

# bacalhau docker run --id-only --cpu 1 hakymulla/testdata:ml -- python  predict.py --address "0x427aE6048C7d2DEd45a07Ea46F2873d0F9ddDb35"
#  bacalhau list --id-filter
