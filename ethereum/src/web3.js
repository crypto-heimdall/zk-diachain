import { connect } from 'tls';

const Web3 = require('web3');

export default {
    connection() {
        return this.web3;
    },

    connect() {
        if (this.web3) return this.web3.currentProvider;
        console.log('connection the testnet...');

        const provider = new Web3.providers.WebsocketProvider('http://localhost:9545');
        provider.on('error', console.error);
        provider.on('connect', () => console.log('Blockchain Connected...'));
        provider.on('end', console.error);

        this.web3 = new Web3(provider);
        return provider;

    },

    isConnect() {
        if(this.web3) {
            return this.web3.eth.net.isListening();
        }
        return false;
    },
};