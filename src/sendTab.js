import {
    QWidget, QPushButton, QLabel, QLineEdit, QTextEdit, FileMode, QFileDialog,
    Direction, QBoxLayout, QScrollArea, QComboBox, QApplication
} from '@nodegui/nodegui';
import textLanguages from './textLanguages.json' assert { type: "json" };
import { Address, PrivateKey, } from 'bitcore-lib-grlc';
import { BN } from 'bitcore-lib-grlc/lib/crypto/bn';
import { sha256 } from 'bitcore-lib-grlc/lib/crypto/hash';
import { getBalance } from './utils.js';

let text = textLanguages['english'];

async function startSendTab(sendTab) {
    const sendTabLayout = new QBoxLayout(Direction.TopToBottom);
    const scrollArea = new QScrollArea();
    const scrollAreaWidget = new QWidget();
    const innerLayout = new QBoxLayout(Direction.TopToBottom);

    // Scroll Bar
    scrollArea.setWidgetResizable(true);
    scrollArea.setWidget(scrollAreaWidget);
    scrollAreaWidget.setLayout(innerLayout);
    sendTabLayout.addWidget(scrollArea);

    // Password Input
    const passwordLayout = new QBoxLayout(Direction.LeftToRight);
    const enterPasswordLabel = new QLabel();
    const passwordInputBox = new QLineEdit();
    passwordInputBox.setPlaceholderText(text.input_password_placeholder);
    enterPasswordLabel.setText(text.input_password);
    passwordLayout.addWidget(enterPasswordLabel);
    passwordLayout.addWidget(passwordInputBox);
    enterPasswordLabel.setToolTip(text.password_tooltip);
    passwordInputBox.setToolTip(text.password_tooltip);

    innerLayout.addLayout(passwordLayout);

    // Address from Password
    const addressFromPasswordLayout = new QBoxLayout(Direction.LeftToRight);
    const fundLabel = new QLabel();
    fundLabel.setText(text.fund_this_address);
    const addressFromPasswordLabel = new QLineEdit();
    addressFromPasswordLabel.setReadOnly(true);
    const balanceLabel = new QLabel();
    const checkBalanceButton = new QPushButton();
    checkBalanceButton.setText(text.check_balance_button);
    const copyAddressButton = new QPushButton();
    copyAddressButton.setText(text.copy_address_button);
    addressFromPasswordLayout.addWidget(fundLabel);
    addressFromPasswordLayout.addWidget(addressFromPasswordLabel);
    addressFromPasswordLayout.addWidget(balanceLabel);
    addressFromPasswordLayout.addWidget(checkBalanceButton);
    addressFromPasswordLayout.addWidget(copyAddressButton);
    fundLabel.setToolTip(text.fund_tooltip);
    addressFromPasswordLabel.setToolTip(text.fund_tooltip);

    innerLayout.addLayout(addressFromPasswordLayout);

    // Destination Address
    const destinationAddressLayout = new QBoxLayout(Direction.LeftToRight);
    const destAddrLabel = new QLabel();
    destAddrLabel.setText(text.input_destination_address);
    const destAddrBox = new QLineEdit();
    destAddrBox.setPlaceholderText(text.input_destination_address_placeholder);
    const checkAddressValidLabel = new QLabel();
    const checkAddressButton = new QPushButton();
    checkAddressButton.setText(text.check_address_button);
    destinationAddressLayout.addWidget(destAddrLabel);
    destinationAddressLayout.addWidget(destAddrBox);
    destinationAddressLayout.addWidget(checkAddressValidLabel);
    destinationAddressLayout.addWidget(checkAddressButton);
    destAddrLabel.setToolTip(text.destination_address_tooltip);
    destAddrBox.setToolTip(text.destination_address_tooltip);

    innerLayout.addLayout(destinationAddressLayout);

    // Encoding
    const encodingLayout = new QBoxLayout(Direction.LeftToRight);
    const encodingLabel = new QLabel();
    encodingLabel.setText(text.select_encoding);
    const encodingBox = new QComboBox();
    encodingBox.addItems(['Base64', 'HEX', 'Base10', 'UTF-8', 'ASCII']);
    encodingLayout.addWidget(encodingLabel);
    encodingLayout.addWidget(encodingBox);
    encodingLabel.setToolTip(text.encoding_tooltip);
    encodingBox.setToolTip(text.encoding_tooltip);

    innerLayout.addLayout(encodingLayout);

    // Salt
    const saltLayout = new QBoxLayout(Direction.LeftToRight);
    const saltLabel = new QLabel();
    const saltInputBox = new QLineEdit();
    saltLabel.setText(text.input_salt);
    saltInputBox.setPlaceholderText(text.input_salt_placeholder);
    saltLayout.addWidget(saltLabel);
    saltLayout.addWidget(saltInputBox);
    saltLabel.setToolTip(text.salt_tooltip);
    saltInputBox.setToolTip(text.salt_tooltip);

    innerLayout.addLayout(saltLayout);

    // Select File
    const selectFileLayout = new QBoxLayout(Direction.LeftToRight);
    const selectFileButton = new QPushButton();
    selectFileButton.setText(text.select_file_button);
    const fileNameTitleLabel = new QLabel();
    const fileNameLabel = new QLabel();
    fileNameTitleLabel.setText(text.file_selected);
    fileNameLabel.setText('NONE');
    selectFileLayout.addWidget(selectFileButton);
    selectFileLayout.addWidget(fileNameTitleLabel);
    selectFileLayout.addWidget(fileNameLabel);
    selectFileButton.setToolTip(text.select_file_tooltip);
    fileNameTitleLabel.setToolTip(text.select_file_tooltip);

    innerLayout.addLayout(selectFileLayout);

    // Filename, filetypeExtension, website, version
    const fileInfoLayout = new QBoxLayout(Direction.TopToBottom);

    const filenameLayout = new QBoxLayout(Direction.LeftToRight);
    const filenameLabel = new QLabel();
    const filenameInputBox = new QLineEdit();
    filenameLabel.setText(text.input_filename);
    filenameInputBox.setPlaceholderText(text.input_filename_placeholder);
    filenameLayout.addWidget(filenameLabel);
    filenameLayout.addWidget(filenameInputBox);
    filenameLabel.setToolTip(text.filename_tooltip);
    filenameInputBox.setToolTip(text.filename_tooltip);
    fileInfoLayout.addLayout(filenameLayout);

    const filetypeExtensionLayout = new QBoxLayout(Direction.LeftToRight);
    const filetypeExtensionLabel = new QLabel();
    const filetypeExtensionInputBox = new QLineEdit();
    filetypeExtensionLabel.setText(text.input_filetype_extension);
    filetypeExtensionInputBox.setPlaceholderText(text.input_filetype_extension_placeholder);
    filetypeExtensionLayout.addWidget(filetypeExtensionLabel);
    filetypeExtensionLayout.addWidget(filetypeExtensionInputBox);
    filetypeExtensionLabel.setToolTip(text.filetype_extension_tooltip);
    filetypeExtensionInputBox.setToolTip(text.filetype_extension_tooltip);
    fileInfoLayout.addLayout(filetypeExtensionLayout);

    const websiteLayout = new QBoxLayout(Direction.LeftToRight);
    const websiteLabel = new QLabel();
    const websiteInputBox = new QLineEdit();
    websiteLabel.setText(text.input_website);
    websiteInputBox.setPlaceholderText(text.input_website_placeholder);
    websiteLayout.addWidget(websiteLabel);
    websiteLayout.addWidget(websiteInputBox);
    websiteLabel.setToolTip(text.website_tooltip);
    websiteInputBox.setToolTip(text.website_tooltip);
    fileInfoLayout.addLayout(websiteLayout);

    const versionLayout = new QBoxLayout(Direction.LeftToRight);
    const versionLabel = new QLabel();
    const versionInputBox = new QLineEdit();
    versionLabel.setText(text.input_version);
    versionInputBox.setPlaceholderText(text.input_version_placeholder);
    versionLayout.addWidget(versionLabel);
    versionLayout.addWidget(versionInputBox);
    versionLabel.setToolTip(text.version_tooltip);
    versionInputBox.setToolTip(text.version_tooltip);
    fileInfoLayout.addLayout(versionLayout);

    innerLayout.addLayout(fileInfoLayout);

    // Send Button and Output
    const sendLayout = new QBoxLayout(Direction.TopToBottom);
    const sendButton = new QPushButton();
    sendButton.setText(text.send_button);
    const output = new QTextEdit();
    output.setReadOnly(true);
    sendLayout.addWidget(sendButton);
    sendLayout.addWidget(output);

    innerLayout.addLayout(sendLayout);

    sendTab.setLayout(sendTabLayout);

    passwordInputBox.addEventListener('textChanged', (password) => {
        const privateKey = new PrivateKey(
            BN.fromBuffer(sha256(Buffer.from(password)))
        );
        addressFromPasswordLabel.setText(privateKey.toAddress().toString())
    });

    checkBalanceButton.addEventListener('clicked', async () => {
        if (addressFromPasswordLabel.text() === '') return;
        let balance = await getBalance(addressFromPasswordLabel.text());
        balanceLabel.setText(balance);
    });

    copyAddressButton.addEventListener('clicked', () => {
        const clipboard = QApplication.clipboard();
        clipboard.setText(addressFromPasswordLabel.text());
    });

    checkAddressButton.addEventListener('clicked', () => {
        try {
            Address.fromString(destAddrBox.text());
            checkAddressValidLabel.setText(text.address_valid);
        } catch (err) {
            checkAddressValidLabel.setText(text.address_invalid);
        }
    });

    saltInputBox.addEventListener('textChanged', (salt) => {
        // Allow only numeric characters
        salt = salt.replace(/\D/g, '');
        saltInputBox.setText(salt);
        if (BigInt(saltInputBox.text()) > 18_446_744_073_709_551_615n) { // maximum value ff*8
            saltInputBox.setText('18446744073709551615');
        }
    });

    selectFileButton.addEventListener('clicked', () => {
        const fileDialog = new QFileDialog();
        fileDialog.setWindowTitle(text.select_file_to_upload_window_title)
        fileDialog.setFileMode(FileMode.ExistingFile);
        if (fileDialog.exec() == 0) return;
        const selectedFolder = fileDialog.selectedFiles()[0];
        fileNameLabel.setText(selectedFolder);
    });

    filenameInputBox.addEventListener('textChanged', (filename) => {
        // Allow only alphanumeric characters and some special characters
        filename = filename.replace(/[^a-zA-Z0-9-_\.]/g, '');
        filename = filename.slice(0, 16); // maximum 16 hex bytes
        filenameInputBox.setText(filename);
    });

    filetypeExtensionInputBox.addEventListener('textChanged', (filetypeExtension) => {
        // Allow only alphanumeric characters length 4
        filetypeExtension = filetypeExtension.replace(/[^a-zA-Z0-9]/g, '');
        filetypeExtension = filetypeExtension.slice(0, 4); // maximum 4 hex bytes
        filetypeExtensionInputBox.setText(filetypeExtension);
    });

    websiteInputBox.addEventListener('textChanged', (website) => {
        // Allow only alphanumeric characters and some special characters that are allowed in a URL
        website = website.replace(/[^a-zA-Z0-9-_\.:/]/g, '');
        website = website.slice(0, 12); // maximum 12 hex bytes
        websiteInputBox.setText(website);
    });

    versionInputBox.addEventListener('textChanged', (version) => {
        // Allow only numbers
        version = version.replace(/[^0-9]/g, '');
        if (Number(version) > 65535) version = '1'; // maximum 2 bytes hex
        versionInputBox.setText(version);
    });

    sendButton.addEventListener('clicked', async () => {
        // TODO: Send file
    });

}


export { startSendTab };