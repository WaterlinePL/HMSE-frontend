FROM python:3.8-slim-buster
RUN apt-get update
RUN apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt requirements.txt
RUN python3 -m pip install -r requirements.txt
COPY . .
EXPOSE 8080
WORKDIR /server
ENV PYTHONPATH /
CMD ["python3", "main.py"]
