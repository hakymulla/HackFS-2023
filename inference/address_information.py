import requests
import csv
import numpy as np
from datetime import datetime
from statistics import mean

from constants import *

ETH_IN_WEI = 1000000000000000000


def get_features_from_address(address):
    url = (
        "http://api.etherscan.com/api?module=account&action=txlist&address={address}"
        "&startblock=0&endblock=999999999&sort=asc&apikey={api_key}".format(
            address=address, api_key=API_KEY
        )
    )
    r = requests.get(url)
    data = r.json()

    timestamp = []
    timestampSent = []
    timestampRec = []

    timeDiffSent = []
    timeDiffReceive = []

    receivedFromAddresses = []
    sentToAddresses = []

    valuesTx = []
    valueSent = []
    valueReceived = []
    valueSentContracts = []

    receivedTransactions = 0
    sentTransactions = 0
    createdContracts = 0

    if data["status"] == "0":
        print("Address " + address + " status zero.")
        return []

    address = address.lower()
    prev_ts = 0

    for tx in data["result"]:
        if tx["isError"] == 1:
            continue

        tx_value = int(tx["value"]) / ETH_IN_WEI
        tx_from = tx["from"].lower()
        tx_to = tx["to"].lower()
        tx_contract = tx["contractAddress"]
        tx_timestamp = int(tx["timeStamp"])

        timestamp.append(tx_timestamp)

        valuesTx.append(tx_value if tx_to == address else tx_value * -1)

        if tx_from == address:
            sentTransactions += 1
            sentToAddresses.append(tx_to)
            valueSent.append(tx_value)
            timeDiffSent.append(tx_timestamp - prev_ts)

        if tx_to == address:
            receivedTransactions += 1
            receivedFromAddresses.append(tx_from)
            valueReceived.append(tx_value)
            timeDiffReceive.append(tx_timestamp - prev_ts)

        if tx_contract != "":
            createdContracts += 1
            valueSentContracts.append(tx_value)

        prev_ts = tx_timestamp

    totalTransactions = sentTransactions + receivedTransactions + createdContracts

    totalEtherReceived = sum(valueReceived)
    totalEtherSent = sum(valueSent)
    totalEtherSentContracts = sum(valueSentContracts)
    totalEtherBalance = totalEtherReceived - totalEtherSent - totalEtherSentContracts

    (
        minTimeBetweenSentTnx,
        maxTimeBetweenSentTnx,
        avgTimeBetweenSentTnx,
    ) = min_max_avg_time(timeDiffSent)
    minTimeBetweenRecTnx, maxTimeBetweenRecTnx, avgTimeBetweenRecTnx = min_max_avg_time(
        timeDiffReceive
    )

    numUniqSentAddress, numUniqRecAddress = uniq_addresses(
        sentToAddresses, receivedFromAddresses
    )

    minValReceived, maxValReceived, avgValReceived = min_max_avg(valueReceived)
    minValSent, maxValSent, avgValSent = min_max_avg(valueSent)
    minValSentContract, maxValSentContract, avgValSentContract = min_max_avg(
        valueSentContracts
    )

    lifetime = lifetime_days(timestamp)
    activityDays, dailyMax = activity_days_and_daily_max(timestamp)
    ratioRecSent = receivedTransactions / (sentTransactions + 1)
    ratioSentTotal = sentTransactions / (totalTransactions + 1)
    ratioRecTotal = receivedTransactions / (totalTransactions + 1)

    giniSent = gini(valueSent)
    giniRec = gini(valueReceived)

    txFreq = totalTransactions / lifetime

    stdBalanceEth = std_balance_eth(valuesTx)

    addr_normal_features = [
        address,
        minTimeBetweenSentTnx,
        maxTimeBetweenSentTnx,
        avgTimeBetweenSentTnx,
        minTimeBetweenRecTnx,
        maxTimeBetweenRecTnx,
        avgTimeBetweenRecTnx,
        lifetime,
        sentTransactions,
        receivedTransactions,
        createdContracts,
        numUniqSentAddress,
        numUniqRecAddress,
        minValSent,
        maxValSent,
        avgValSent,
        minValReceived,
        maxValReceived,
        avgValReceived,
        totalTransactions,
        totalEtherSent,
        totalEtherReceived,
        totalEtherSentContracts,
        totalEtherBalance,
        activityDays,
        dailyMax,
        ratioRecSent,
        ratioSentTotal,
        ratioRecTotal,
        giniSent,
        giniRec,
        txFreq,
        stdBalanceEth,
    ]

    return addr_normal_features


def std_balance_eth(valuesTx):
    if len(valuesTx) < 2:
        return 0

    balances = []
    balances.append(valuesTx[0])

    for index in range(1, len(valuesTx)):
        balances.append(valuesTx[index] + balances[index - 1])

    return np.std(balances)


def lifetime_days(timestamp):
    if len(timestamp) < 2:
        return 1

    DAY_SECONDS = 24 * 60 * 60
    time_diff = timestamp[-1] - timestamp[0]
    time_diff = (time_diff // DAY_SECONDS) + 1

    return time_diff


def activity_days_and_daily_max(timestamp):
    DAY_SECONDS = 24 * 60 * 60
    activityDays = 0
    dailyMax = 0

    if len(timestamp) > 0:
        first_day = timestamp[0]
        localMax = 0
        for x in timestamp:
            if x >= first_day:
                dailyMax = max(dailyMax, localMax)
                localMax = 1
                activityDays += 1
                first_day += DAY_SECONDS
            else:
                localMax += 1

        dailyMax = max(dailyMax, localMax)

    return activityDays, dailyMax


def gini(x):
    """Calculate the Gini coefficient of a numpy array."""
    # based on bottom eq:
    # http://www.statsdirect.com/help/generatedimages/equations/equation154.svg
    # from:
    # http://www.statsdirect.com/help/default.htm#nonparametric_methods/gini.htm

    if len(x) < 2:
        return 0

    array = np.array(x)

    # All values are treated equally, arrays must be 1d:
    array = array.flatten()
    if np.amin(array) < 0:
        # Values cannot be negative:
        array -= np.amin(array)
    # Values cannot be 0:
    array += 0.0000001
    # Values must be sorted:
    array = np.sort(array)
    # Index per array element:
    index = np.arange(1, array.shape[0] + 1)
    # Number of array elements:
    n = array.shape[0]
    # Gini coefficient:
    return (np.sum((2 * index - n - 1) * array)) / (n * np.sum(array))


def avg_time(time_diff):
    time_difference = 0
    if len(time_diff) > 1:
        time_difference = "{0:.2f}".format(mean(time_diff))
    return time_difference


def min_max_avg_time(time_diff):
    if len(time_diff) <= 1:
        return 0, 0, 0

    return min_max_avg(time_diff)


def min_max_avg(arr):
    min_val, max_val, avg_val = 0, 0, 0
    if arr:
        min_val = min(arr)
        max_val = max(arr)
        avg_val = mean(arr)
    return (
        "{0:.6f}".format(min_val),
        "{0:.6f}".format(max_val),
        "{0:.6f}".format(avg_val),
    )


def uniq_addresses(sent_addresses, received_addresses):
    uniqSent, uniqRec = 0, 0
    if sent_addresses:
        uniqSent = len(set(sent_addresses))

    if received_addresses:
        uniqRec = len(set(received_addresses))

    return uniqSent, uniqRec

    address_blacklist = get_address_blacklist()
    print(str(len(address_blacklist)) + " fraud addresses loaded.")

    address_whitelist = get_address_whitelist()
    print(str(len(address_whitelist)) + " non-fraud addresses loaded.")

    # Make sure there are no addresses in both lists
    for address in address_whitelist:
        if address in address_blacklist:
            address_whitelist.remove(address)

    f = open(DATASET_FILE, "w")
    write = csv.writer(f)

    write.writerow(get_feature_names())

    for idx, address in enumerate(address_whitelist):
        print("Processing non-fraud address #" + str(idx) + " - addr: " + address)
        features = get_features_from_address(address, 0)
        write.writerows(features)

    for idx, address in enumerate(address_blacklist):
        print("Processing fraud address #" + str(idx) + " - addr: " + address)
        features = get_features_from_address(address, 1)
        write.writerows(features)

    f.close()
