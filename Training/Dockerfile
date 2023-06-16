FROM python:3.8-slim

COPY train.py /app/train.py
COPY data.csv /app/data.csv


WORKDIR /app

COPY requirements.txt /app

RUN pip3 install -r requirements.txt

ADD train.py .
ADD data.csv .

CMD ["python3", "train.py", "/outputs"]