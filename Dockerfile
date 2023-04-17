FROM ubuntu:20.04
RUN apt-get dist-upgrade
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt install gcc-7 g++-7 ffmpeg libsm6 libxext6 gfortran-7 gfortran python3 python3-pip -y
RUN DEBIAN_FRONTEND=noninteractive apt install apt-transport-https ca-certificates curl software-properties-common -y
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
RUN apt-cache policy docker-ce
RUN apt install docker-ce -y
COPY requirements.txt requirements.txt
RUN python3 -m pip install -r requirements.txt
COPY ./ ./
EXPOSE 8080
WORKDIR /server
ENV PYTHONPATH /
# CMD ["ls"]
CMD ["python3", "main.py"]
