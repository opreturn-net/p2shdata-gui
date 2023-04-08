import { ElectrumClient } from '@samouraiwallet/electrum-client';
import { Transaction } from 'bitcore-lib-grlc';
import { writeFileSync } from 'fs';
import { getLanguagesJSON } from './readLanguages.js';
let textLanguages = await getLanguagesJSON();
let text = textLanguages[textLanguages.settings.selected_language];
const client = new ElectrumClient(50002, textLanguages.settings.server, 'ssl');

/* Return location and info of file */
async function decodeP2SHDATA(txid, folder) {
    const connect = await connectToElectrum();
    if (connect.error) return { error: JSON.stringify(connect.error, undefined, 4) };
    let rawTx = await client.blockchainTransaction_get(txid).catch((err) => { return { error: JSON.stringify(err, undefined, 4) } });
    client.close();
    if (rawTx.error) return { error: rawTx.error };
    let tx = Transaction(rawTx).toObject();
    let op_returns = tx.outputs.filter((vout) => { return vout.script.startsWith('6a') })[0] || { script: '' };
    if (hexToAscii(op_returns.script.slice(30, 50)).replace(/\x00/g, '') != '/p2shdata') return { error: text.not_p2shdata_txid };
    let title = tx.outputs.filter((vout) => { return vout.satoshis == 0 })[0].script;
    let data_array = tx.inputs.map((vin) => { return vin.script });
    let data = '';
    for (let chunk of data_array) {
        data += cutScript(cutScript(chunk));
    }
    let decodedTitle = decodeTitle(title);
    writeFileSync(folder + '/' + decodedTitle.filename + '.' + decodedTitle.filetype, Buffer.from(data, "hex"));
    return { file_location: `${folder}/${decodedTitle.filename}.${decodedTitle.filetype}`, title: decodedTitle };
}

function decodeTitle(vout_string) {
    let hex = vout_string.slice(6); // remove the first 3 bytes (OP_CODES)
    let site = hexToAscii(hex.slice(0, 24)).replace(/\x00/g, '');
    let protocol = hexToAscii(hex.slice(24, 44)).replace(/\x00/g, '');
    let version = hexToDecimal(hex.slice(44, 48));
    let filename = hexToAscii(hex.slice(48, 80)).replace(/\x00/g, '');
    let filetype = hexToAscii(hex.slice(80, 88)).replace(/\x00/g, '');
    let filesize = hexToDecimal(hex.slice(88, 96));
    let assembly_script = hex.slice(96, 120);
    let datahash160 = hex.slice(120, 160);
    let info = { site, protocol, version, filename, filetype, filesize, assembly_script, datahash160 };
    info.assembly_script = decodeAssemblyScript(assembly_script);
    return info;
}

function decodeAssemblyScript(entire_assembly_script) {
    let assembly_script_length = hexToDecimal(entire_assembly_script.slice(0, 2));
    let script = entire_assembly_script.slice(2, assembly_script_length * 2 + 2);
    let data_location = script.slice(0, 6);
    let first_vin = hexToDecimal(script.slice(2, 4));
    let last_vin = hexToDecimal(script.slice(4, 6));
    let encoding_type = 'ASCII';
    let encoding;
    if (script.includes('ec')) {
        encoding = script.slice(6, 10);
        encoding_type = encoding.slice(2, 4);
        if (encoding_type == '64') {
            encoding_type = 'Base64';
        } else if (encoding_type == '16') {
            encoding_type = 'HEX';
        } else if (encoding_type == '10') {
            encoding_type = 'Base10';
        } else if (encoding_type == 'f8') {
            encoding_type = 'UTF-8';
        } else {
            encoding_type = 'ASCII';
        }
    }
    let info = { entire_assembly_script, assembly_script_length, script, data_location, first_vin, last_vin, encoding_type };
    if (encoding) info.encoding = encoding;
    return info;
}

function hexToAscii(hex) { return Buffer.from(hex, 'hex').toString(); }

function hexToDecimal(hex) { return parseInt(hex, 16); }

function littleEndianToDecimal(hex) { return parseInt(hex.match(/.{2}/g).reverse().join(''), 16); }

function cutScript(chunk) {
    let data = '';
    if (chunk.startsWith('4d')) { // OP_PUSHDATA2 + 2 bytes little endian length
        let length = littleEndianToDecimal(chunk.slice(2, 6)) * 2;
        data += chunk.slice(6, length + 6);
    } else if (chunk.startsWith('4c')) { // OP_PUSHDATA1 + 1 byte length
        let length = hexToDecimal(chunk.slice(2, 4)) * 2;
        data += chunk.slice(4, length + 4);
    } else { // Pushdata Bytelengh 1-75
        let length = hexToDecimal(chunk.slice(0, 2)) * 2;
        data += chunk.slice(2, length + 2);
    }
    return data;
}

async function connectToElectrum() {
    let error;
    await client.initElectrum(
        { client: 'electrum-client-js', version: ['1.2', '1.4'] },
        { retryPeriod: 5000, maxRetry: 10, pingPeriod: 5000 }
    ).catch(e => error = e);
    if (error) return { error, success: false }
    else return { success: true };
}

export { decodeP2SHDATA };