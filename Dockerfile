FROM python:3.6
ENV PYTHONUNBUFFERED 1
RUN mkdir /inmt
WORKDIR /inmt
COPY requirements.txt /inmt/
RUN pip install -r requirements.txt
COPY . /inmt/

