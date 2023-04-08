import { readFileSync } from 'fs';
import { Address, PrivateKey, Transaction, Script } from 'bitcore-lib-grlc';
import { BN } from 'bitcore-lib-grlc/lib/crypto/bn';
import { sha256, sha256ripemd160 } from 'bitcore-lib-grlc/lib/crypto/hash';
import { ElectrumClient } from '@samouraiwallet/electrum-client';
import { getBalance, convertToScripthash } from './utils.js';
import { getLanguagesJSON } from './readLanguages.js';
let textLanguages = await getLanguagesJSON();
let text = textLanguages[textLanguages.settings.selected_language];
const client = new ElectrumClient(50002, textLanguages.settings.server, 'ssl');

const destination_address_fee = textLanguages.settings.destination_address_fee;
const origin_address_fee = textLanguages.settings.origin_address_fee;

async function sendP2SHDATA(password, encoding, website, protocol, version, filename, filetype, filepath,
    salt_decimal, destination_address, first_txid, outputBox) {
    try {
        outputBox.append(text.starting);
        const privateKey = new PrivateKey(BN.fromBuffer(sha256(Buffer.from(password))));
        const origin_address = privateKey.toAddress();
        const origin_address_string = origin_address.toString();
        if (!first_txid) {
            let origin_address_balance = await getBalance(origin_address_string);
            if (origin_address_balance === 'Electrum error') throw new Error('Electrum error "getBalance"');
            if (origin_address_balance < origin_address_fee / 100_000_000) throw new Error(text.needs_more_funds);
        }
        const file = readFileSync(filepath, 'hex');
        const chunks = file.match(/.{1,1000}/g); // 500 byte chunks
        if (chunks.length > 176) throw new Error(text.file_too_large);
        const assembly_script = { vin_start: 0, vin_end: chunks.length - 1, encoding };
        const op_return = createOpReturn(website, protocol, version, filename, filetype, file, assembly_script);
        const address_and_redeemscript = getAddressesAndRedeemScripts(chunks, salt_decimal);
        await encodeP2SHDATA(origin_address_string, origin_address, origin_address_fee,
            address_and_redeemscript, privateKey, destination_address, op_return, first_txid, outputBox);
        return { success: true };
    } catch (error) {
        return { error: JSON.stringify(error) };
    }
}

async function encodeP2SHDATA(origin_address_string, origin_address, origin_address_fee,
    address_and_redeemscript, privateKey, destination_address, op_return, first_txid, outputBox) {
    try {
        if (first_txid) { // if first txid is given, it means that the first tx was already broadcasted
            outputBox.append(text.first_txid_provided);
            await multipleAddressesFunded(first_txid, address_and_redeemscript,
                destination_address, destination_address_fee, op_return, outputBox);
            return;
        }
        const origin_address_scripthash = convertToScripthash(origin_address_string);
        let connect = await connectToElectrum();
        if (connect.error) throw new Error(connect.error);
        let utxos_temp = await client.blockchainScripthash_listunspent(origin_address_scripthash)
            .catch((err) => { throw new Error(err) });
        let total_amount_temp = 0;
        utxos_temp = utxos_temp.map(utxo => {
            total_amount_temp += utxo.value;
            return new Transaction.UnspentOutput({
                "txId": utxo.tx_hash,
                "outputIndex": utxo.tx_pos,
                "address": origin_address_string,
                "script": new Script(origin_address),
                "satoshis": utxo.value,
            })
        });
        if (total_amount_temp < origin_address_fee) throw new Error(text.needs_more_funds);
        total_amount_temp -= origin_address_fee; // fee
        let tx_temp = new Transaction();
        tx_temp.from(utxos_temp);
        for (let pair of address_and_redeemscript) {
            tx_temp.to(pair.address, Math.round(total_amount_temp / address_and_redeemscript.length));
        }
        tx_temp.change(destination_address);
        tx_temp.sign(privateKey);
        let serialized_tx_temp = tx_temp.toString();
        outputBox.append(text.broadcast_first_tx);
        let multiple_addresses_funded_txid = await client.blockchainTransaction_broadcast(serialized_tx_temp);
        if (multiple_addresses_funded_txid.message) throw new Error(multiple_addresses_funded_txid.message);
        client.close();
        outputBox.append(text.txid_all_addresses + ' ' + multiple_addresses_funded_txid);
        outputBox.append(text.waiting + ' ' + textLanguages.settings.time_between_txs_seconds + ' ' + text.wait_seconds_confirm);
        await sleep(Number(textLanguages.settings.time_between_txs_seconds) * 1000);
        await multipleAddressesFunded(multiple_addresses_funded_txid, address_and_redeemscript,
            destination_address, destination_address_fee, op_return, outputBox);
        return;
    } catch (e) {
        client.close();
        throw new Error(JSON.stringify(e));
    }
}

async function multipleAddressesFunded(multiple_addresses_funded_txid, address_and_redeemscript,
    destination_address, destination_address_fee, op_return, outputBox) {
    try {
        let connect = await connectToElectrum();
        if (connect.error) throw new Error(connect.error);
        let utxos_addresses = await client.blockchainTransaction_get(multiple_addresses_funded_txid)
            .catch((err) => { throw new Error(err) });
        utxos_addresses = Transaction(utxos_addresses).toObject().outputs;
        let tx = new Transaction();
        let total_amount = 0;
        for (let i = 0; i < address_and_redeemscript.length; i++) {
            total_amount += utxos_addresses[i].satoshis;
            let utxo = new Transaction.UnspentOutput({
                "txId": multiple_addresses_funded_txid,
                "outputIndex": i,
                "address": address_and_redeemscript[i].address,
                "script": utxos_addresses[i].script,
                "satoshis": utxos_addresses[i].satoshis,
            });
            tx.from(utxo);
        }
        tx.to(destination_address, total_amount - destination_address_fee);
        tx.addData(op_return);
        tx.uncheckedSerialize();
        for (let i = 0; i < tx.inputs.length; i++) {
            tx.inputs[i].setScript(address_and_redeemscript[i].unlockingScript);
        }
        let serialized_tx = tx.toString();
        outputBox.append(text.broadcast_final_tx);
        let txid = await client.blockchainTransaction_broadcast(serialized_tx);
        if (txid.message) throw new Error(txid.message);
        outputBox.append(text.txid_is + ' ' + txid);
        client.close();
        return;
    } catch (e) {
        client.close();
        throw new Error(JSON.stringify(e));
    }
}

function getAddressesAndRedeemScripts(chunks, salt) {
    let info = [];
    for (let chunk of chunks) {
        let op_codes_start;
        let unlockingScript;
        if (chunk.length < 76 * 2) {
            op_codes_start = (chunk.length / 2).toString(16).padStart(2, '0'); // OP_PUSH(1-75)
        } else if (chunk.length < 256 * 2) {
            op_codes_start = '4c' + (chunk.length / 2).toString(16).padStart(2, '0'); // OP_PUSHDATA1 + (75-255)
        } else {
            op_codes_start = '4d' + decimalToHexLittleEndian(chunk.length / 2); // OP_PUSHDATA2 + (256-500) (little endian)
        }
        const saltHex = salt.toString(16).padStart(16, '0'); // convert salt to hex and pad it to 8 bytes
        if (saltHex.length > 16) throw new Error(text.salt_error_bytes);
        const op_codes_end = '08' + saltHex + '6d51'; // OP_PUSH8 + salt + OP_2DROP OP_1
        const redeemscript = Buffer.from(op_codes_start + chunk + op_codes_end, 'hex');
        const hash160 = sha256ripemd160(redeemscript);
        const address = Address.fromScriptHash(hash160).toString();
        if (redeemscript.length < 76) {
            unlockingScript = new Script(redeemscript.length.toString(16).padStart(2, '0') + redeemscript.toString('hex'));
        } else if (redeemscript.length < 255) {
            unlockingScript = new Script(Buffer.from('4c' + redeemscript.length.toString(16).padStart(2, '0') + redeemscript.toString('hex'), 'hex'));
        } else {
            unlockingScript = new Script('4d' + decimalToHexLittleEndian(redeemscript.length) + redeemscript.toString('hex'));
        }
        info.push({ address, redeemscript, unlockingScript });
    }
    return info;
}

function createOpReturn(site, protocol, version, filename, filetype, data, assembly_script) {
    // OP_RETURN <site> <protocol> <version> <filename> <filetype> <filesize> <assembly_script> <datahash160>
    site = asciiToHex(site).padStart(24, '0');
    if (site.length > 12 * 2) throw new Error(text.website_error_bytes);
    protocol = asciiToHex(protocol).padEnd(20, '0');
    if (protocol.length > 10 * 2) throw new Error(text.protocol_error_bytes);
    version = version.toString(16).padStart(4, '0');
    if (version.length > 2 * 2) throw new Error(text.version_error_bytes);
    filename = asciiToHex(filename).padStart(32, '0');
    if (filename.length > 16 * 2) throw new Error(text.filename_error_bytes);
    filetype = asciiToHex(filetype).padStart(8, '0');
    if (filetype.length > 4 * 2) throw new Error(text.filetype_error_bytes);
    let filesize = (data.length / 2).toString(16).padStart(8, '0');
    if ((filesize.length / 2) > 4 * 2) throw new Error(text.filesize_error_bytes);
    let final_assembly_script = '05'; // length of assembly script
    final_assembly_script += 'dc' + assembly_script.vin_start.toString(16).padStart(2, '0') + assembly_script.vin_end.toString(16).padStart(2, '0'); // data location
    if (assembly_script.vin_start > assembly_script.vin_end) throw new Error(text.vins_vine_error_order);
    if (assembly_script.vin_start < 0 || assembly_script.vin_start > 255) throw new Error(text.vins_error_0_255);
    if (assembly_script.vin_end < 0 || assembly_script.vin_end > 255) throw new Error(text.vine_error_0_255);
    if (assembly_script.encoding) final_assembly_script += 'ec' + assembly_script.encoding;
    final_assembly_script = final_assembly_script.padEnd(24, '0');
    let datahash160 = sha256ripemd160(Buffer.from(data, 'hex')).toString('hex');
    let opreturn_string = site + protocol + version + filename + filetype + filesize + final_assembly_script + datahash160;
    let opreturn_buffer = Buffer.from(opreturn_string, 'hex');
    return opreturn_buffer;
}

function asciiToHex(str) { return Buffer.from(str).toString('hex'); }

function decimalToHexLittleEndian(decimal) {
    let hexString = decimal.toString(16).padStart(4, "0");
    let bytes = hexString.match(/.{1,2}/g);
    bytes.reverse();
    let newHexString = bytes.join('');
    return newHexString;
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

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export { sendP2SHDATA };