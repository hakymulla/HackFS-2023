import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn import preprocessing
import pickle
import glob, os, sys


def main(output_dir):
    data = "./data.csv"

    print("Loading Dataset")
    df = pd.read_csv(data)

    print("Preprocessing Dataset")

    X = df.drop(["address", "flag"], axis=1)
    print(X.shape)
    print(X.columns)

    y = df.loc[:, "flag"]

    print("Training Model")
    rf = RandomForestClassifier()
    rf.fit(X, y)

    print("Saving Model")
    pickle.dump(rf, open(f"{output_dir}/rf.pkl", "wb"))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Must pass arguments. Format: [command] input output_dir")
        sys.exit()
    main(sys.argv[1])


# python3 Training/train.py dataset/ .
