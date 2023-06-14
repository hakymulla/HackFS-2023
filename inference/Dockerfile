FROM python:3.8-slim

COPY address_information.py /app/address_information.py
COPY constants.py /app/constants.py
COPY predict.py /app/predict.py

COPY  rf.pkl /app/rf.pkl

WORKDIR /app

COPY requirements.txt /app

RUN pip3 install -r requirements.txt

ADD address_information.py .
ADD constants.py .
ADD predict.py .
ADD rf.pkl .

CMD ["python3", "predict.py"]


#  bacalhau docker --network=http --domain=api.etherscan.com run  --cpu 1 hakymulla/testdata:ml_test -- python  predict.py --address "0x427aE6048C7d2DEd45a07Ea46F2873d0F9ddDb35"


#  bacalhau docker --network=http --domain=api.etherscan.com run hakymulla/testdata:ml_test -- python  predict.py --address "0x427aE6048C7d2DEd45a07Ea46F2873d0F9ddDb35"

# bacalhau list --id-filter

#  bacalhau docker --network=http --domain=api.etherscan.com run curlimages/curl:8.1.0 -- curl "http://api.etherscan.com"
# Docker:
#       Entrypoint:
#       - python
#       - predict.py
#       - --address
#       - 0x427aE6048C7d2DEd45a07Ea46F2873d0F9ddDb35
#       Image: hakymulla/testdata:ml_test


#  '"Docker": {'
#         '"Image": "ghcr.io/bacalhau-project/examples/stable-diffusion-gpu:0.0.1",'
#         '"Entrypoint": ["python", "main.py", "--o", "./outputs", "--p", "';
# Network:
#       Domains:
#       - api.etherscan.com
#       Type: HTTP

#  '"Network": {'
#         '"Type": "HTTP",'
#         '"Domains": ["api.etherscan.com"];