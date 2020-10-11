const SHA256 = require('crypto-js/sha256')

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
}

class Block {
    constructor(timestamp, transactions, previousHash) {
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash() {
        return SHA256(this.transactions + this.previousHash + this.nonce).toString()
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce ++
            this.hash = this.calculateHash()
        }
        console.log(`Block mined! Hash: ${this.hash}`)
    }
}

class Blockchain {
    constructor() {
       this.chain = [this.createGenesisBlock()]
       this.pendingTransactions = []
       this.difficulty = 3
       this.minerReward = 50
    }

    createGenesisBlock() {
        return new Block(Date.now(), [], '')
    }

    addBlock(minerAddress) {
        const newBlock = new Block(Date.now(), this.pendingTransactions)
        newBlock.previousHash = this.getLatestBlock().hash
        console.log(`Mining block ${this.chain.length}...`)
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)

        this.pendingTransactions = []
        this.pendingTransactions.push(new Transaction(null, minerAddress, this.minerReward))
    }

    addTransaction(transaction) {
        if (transaction.fromAddress === null || this.getAddressBalance(transaction.fromAddress) >= transaction.amount) {
            this.pendingTransactions.push(transaction)
        } else {
            console.log(`[ INVALID TRANSACTION ] - ${JSON.stringify(transaction)}`)
        }
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    getAddressBalance(address) {
        let balance = 0
        for (let block of this.chain) {
            for (let trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount
                }
                if (trans.toAddress === address) {
                    balance += trans.amount
                }
            }
        }
        return balance
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false
            }
        }

        return true
    }
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction
