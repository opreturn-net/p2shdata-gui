import {
    QWidget, QPushButton, QLabel, QLineEdit, QTextEdit,
    Direction, QBoxLayout, QScrollArea, QComboBox, QApplication
} from '@nodegui/nodegui';
import textLanguages from './textLanguages.json' assert { type: "json" };
import garlicore from 'bitcore-lib-grlc';
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

    innerLayout.addLayout(destinationAddressLayout);

    // Encoding
    const encodingLayout = new QBoxLayout(Direction.LeftToRight);
    const encodingLabel = new QLabel();
    encodingLabel.setText(text.select_encoding);
    const encodingBox = new QComboBox();
    encodingBox.addItems(['Base64', 'HEX', 'Base10', 'UTF-8', 'ASCII']);
    encodingLayout.addWidget(encodingLabel);
    encodingLayout.addWidget(encodingBox);

    innerLayout.addLayout(encodingLayout);

    // Salt
    const saltLayout = new QBoxLayout(Direction.LeftToRight);
    const saltLabel = new QLabel();
    const saltInputBox = new QLineEdit();
    saltLabel.setText(text.input_salt);
    saltInputBox.setPlaceholderText(text.input_salt_placeholder);
    saltLayout.addWidget(saltLabel);
    saltLayout.addWidget(saltInputBox);

    innerLayout.addLayout(saltLayout);

    // Select File
    const selectFileLayout = new QBoxLayout(Direction.LeftToRight);
    const selectFileButton = new QPushButton();
    selectFileButton.setText(text.select_file_button);
    const fileNameLabel = new QLabel();
    fileNameLabel.setText(text.file_selected + ' NONE'); // MODIFY THIS LINE
    selectFileLayout.addWidget(selectFileButton);
    selectFileLayout.addWidget(fileNameLabel);

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
    fileInfoLayout.addLayout(filenameLayout);
    const filetypeExtensionLayout = new QBoxLayout(Direction.LeftToRight);
    const filetypeExtensionLabel = new QLabel();
    const filetypeExtensionInputBox = new QLineEdit();
    filetypeExtensionLabel.setText(text.input_filetype_extension);
    filetypeExtensionInputBox.setPlaceholderText(text.input_filetype_extension_placeholder);
    filetypeExtensionLayout.addWidget(filetypeExtensionLabel);
    filetypeExtensionLayout.addWidget(filetypeExtensionInputBox);
    fileInfoLayout.addLayout(filetypeExtensionLayout);
    const websiteLayout = new QBoxLayout(Direction.LeftToRight);
    const websiteLabel = new QLabel();
    const websiteInputBox = new QLineEdit();
    websiteLabel.setText(text.input_website);
    websiteInputBox.setPlaceholderText(text.input_website_placeholder);
    websiteLayout.addWidget(websiteLabel);
    websiteLayout.addWidget(websiteInputBox);
    fileInfoLayout.addLayout(websiteLayout);
    const versionLayout = new QBoxLayout(Direction.LeftToRight);
    const versionLabel = new QLabel();
    const versionInputBox = new QLineEdit();
    versionLabel.setText(text.input_version);
    versionInputBox.setPlaceholderText(text.input_version_placeholder);
    versionLayout.addWidget(versionLabel);
    versionLayout.addWidget(versionInputBox);
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
        const privateKey = new garlicore.PrivateKey(
            garlicore.crypto.BN.fromBuffer(
                garlicore.crypto.Hash.sha256(
                    Buffer.from(password)
                )
            )
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
            garlicore.Address.fromString(destAddrBox.text());
            checkAddressValidLabel.setText(text.address_valid);
        } catch (err) {
            checkAddressValidLabel.setText(text.address_invalid);
        }
    });

    saltInputBox.addEventListener('textChanged', (salt) => {
        // TODO: Check if salt is lower than maximum
    });

    selectFileButton.addEventListener('clicked', () => {
        // TODO: Select file
    });

    filenameInputBox.addEventListener('textChanged', (filename) => {
        // TODO: Check if filename is lower than maximum length
    });

    filetypeExtensionInputBox.addEventListener('textChanged', (filetypeExtension) => {
        // TODO: Check if filetypeExtension is lower than maximum length
    });

    websiteInputBox.addEventListener('textChanged', (website) => {
        // TODO: Check if website is lower than maximum length
    });

    versionInputBox.addEventListener('textChanged', (version) => {
        // TODO: Check if version is number lower than maximum
    });

    sendButton.addEventListener('clicked', async () => {
        // TODO: Send file
    });

}


export { startSendTab };