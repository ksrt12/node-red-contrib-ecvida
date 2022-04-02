"use strict";
const hosts = {
    legion: 'legion',
    ecvida: 'ecvida',
    kama: 'kama',
    pskDom: 'pskDom',
    'pro.wellsoft.smartzhk': 'pro.wellsoft.smartzhk',
    ukng21: 'ukng21',
    tolmachevskiy: 'tolmachevskiy',
    urban: 'urban',
    meridian: 'meridian',
    cds: 'cds.lk2',
    alternativa: 'alternativa',
    zhilservis: 'zhilservis',
    ten: 'ten',
    etalon: 'etalon',
    perspectiva: 'perspectiva',
    loftfm: 'loftfm',
    rif: 'rif',
    regionalUk: 'regionalUk',
    aSystem: 'aSystem',
    edelveis: 'edelveis',
    asto: 'asto',
    ukNew74: 'ukNew74',
    altsever: 'altsever',
    service: 'service',
    bravo: 'bravo',
    cvet_bulvar: 'cvet_bulvar',
    co_loft: 'co_loft',
    navigator: 'navigator',
    soho: 'soho',
    kamenki: 'kamenki',
    efes: 'efes',
    eurodom: 'eurodom',
    sputnik: 'sputnik',
    kitEsteit: 'kitEsteit',
    ekapark: 'ekapark',
    esperclub: 'esperclub',
    evservis: 'evservis',
    vb_group: 'vb_group',
    liderplus: 'liderplus',
    converse: 'converse',
    newton: 'newton',
    smartpro: 'smartpro',
    chpuzhk: 'chpuzhk',
    prichal: 'prichal'
};

/**
 * 
 * @param {string} uk 
 * @returns {string} host
 */
module.exports = (uk) => "https://" + hosts[uk] + ".wellsoft.pro";