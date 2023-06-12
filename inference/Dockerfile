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
