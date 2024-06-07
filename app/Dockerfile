FROM python:3.10.10

RUN apt-get update && apt-get install -y postgresql-client libgeos-dev

ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code

COPY requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /code/

RUN rm Dockerfile


RUN chmod 777 ./scripts/entrypoint.sh