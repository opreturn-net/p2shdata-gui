import { ElectrumClient } from '@samouraiwallet/electrum-client';
import { sha256 } from 'garlicoinjs-lib/src/crypto.js';
import { toOutputScript } from 'garlicoinjs-lib/src/address.js';
import { QPushButton, QMessageBox, ButtonRole } from '@nodegui/nodegui';
import { getLanguagesJSON } from './readLanguages.js';
let textLanguages = await getLanguagesJSON();
const client = new ElectrumClient(50002, textLanguages.server, 'ssl');


async function getBalance(address) {
    await connectToElectrum();
    let scripthash = convertToScripthash(address)
    let error;
    let balance = await client.blockchainScripthash_getBalance(scripthash)
        .catch((err) => { error = err; });
    client.close();
    if (error) return 'Electrum error';
    return ((balance.confirmed + balance.unconfirmed) / 100_000_000);
}


function convertToScripthash(address) {
    return Buffer.from(sha256(toOutputScript(address)).reverse()).toString('hex');
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


function warningWindow(message) {
    const msgBox = new QMessageBox();
    msgBox.setText(message);
    msgBox.setWindowTitle('Warning');
    const accept = new QPushButton();
    accept.setText('Ok');
    msgBox.addButton(accept, ButtonRole.AcceptRole);
    msgBox.exec();
}


export { getBalance, warningWindow, convertToScripthash }