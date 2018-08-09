
export const Blockchains = {
    EOS:'eos',
    ETH:'eth'
};

export const BlockchainsArray =
    Object.keys(Blockchains).map(key => ({key, value:Blockchains[key]}));

export const blockchainName = x => {
    switch(x){
        case Blockchains.EOS: return 'EOS';
        case Blockchains.ETH: return 'Ethereum';
    }
}