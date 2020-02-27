FROM python:3.6

ENV PYTHONUNBUFFERED 1

RUN mkdir /inmt

WORKDIR /inmt

ADD . /inmt

RUN pip install -r requirements.txt

