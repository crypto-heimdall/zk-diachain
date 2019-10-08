# 1. base image - ubuntu 18.04
FROM		ubuntu:18.04
MAINTAINER 	crypto.heimdall@gmail.com
# -- use bash always
RUN		rm /bin/sh && ln -s /bin/bash /bin/sh

RUN		apt-get update
RUN		apt-get -y upgrade

# 1.5 Basic utilities
RUN		apt -y install git
RUN		apt -y install vim
RUN		apt -y install make
RUN		apt -y install python3-pip
RUN	ln -s	/usr/bin/python3 /usr/bin/python & \
	ln -s 	/usr/bin/pip3 /usr/bin/pip

# 2. nvm / node 
# 3. Dev Environment for Ethereum Smart Contract
ENV	NODE_VERSION	10.16.3

RUN		apt-get -y  install curl
RUN		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash	\
		&& source /root/.nvm/nvm.sh	\
		&& nvm install $NODE_VERSION	\
		&& npm config set user 0	\
		&& npm config set unsafe-perm true	\
		&& npm install -g ganache-cli	\
		&& npm install -g truffle


# 4. Eth-miximus
RUN		mkdir /data

WORKDIR		/data
RUN		git clone https://github.com/crypto-heimdall/ethsnarks-miximus.git
WORKDIR		./ethsnarks-miximus

RUN		make git-submodules
RUN		make -C ethsnarks ubuntu-dependencies
RUN		make -C ethsnarks python-dependencies
#RUN		make

