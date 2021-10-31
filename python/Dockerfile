FROM python:3

ARG PYTHON_FLAG
RUN echo FLAG{$PYTHON_FLAG} > /flag.txt

WORKDIR /app
COPY ./requirements.txt ./
RUN pip install -r /app/requirements.txt

CMD ["bash", "/app/loop.sh"]
