
export const Blockchains = {
    EOS:'eos',
    ETH:'eth',
    TLOS:'tlos'
};

export const BlockchainsArray =
    Object.keys(Blockchains).map(key => ({key, value:Blockchains[key]}));

export const blockchainName = x => {
    switch(x){
        case Blockchains.EOS: return 'EOS';
        case Blockchains.ETH: return 'Ethereum';
        case Blockchains.TLOS: return 'Telos';
    }
}