FROM python:3.10-slim-buster
COPY requirements.txt requirements.txt
RUN python3 -m pip install -r requirements.txt
COPY config config
COPY hmse_simulations hmse_simulations
COPY server server
EXPOSE 8080
WORKDIR /server
ENV PYTHONPATH /
CMD ["python3", "main.py"]
