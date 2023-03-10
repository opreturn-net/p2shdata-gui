import {
    QWidget, QPushButton, QLabel, QLineEdit, QTextEdit,
    Direction, QBoxLayout, QScrollArea, QComboBox
} from '@nodegui/nodegui';
import textLanguages from './textLanguages.json' assert { type: "json" };
let text = textLanguages['english'];

async function startSendTab(sendTab) {
    const sendTabLayout = new QBoxLayout(Direction.TopToBottom);
    const scrollArea = new QScrollArea();
    const scrollAreaWidget = new QWidget();
    const innerLayout = new QBoxLayout(Direction.TopToBottom);
    scrollArea.setWidgetResizable(true);
    scrollArea.setWidget(scrollAreaWidget);
    scrollAreaWidget.setLayout(innerLayout);
    sendTabLayout.addWidget(scrollArea);

    const passwordLayout = new QBoxLayout(Direction.LeftToRight);
    const enterPasswordLabel = new QLabel();
    const passwordInputBox = new QLineEdit();
    passwordInputBox.setPlaceholderText(text.input_password_placeholder);
    enterPasswordLabel.setText(text.input_password);
    passwordLayout.addWidget(enterPasswordLabel);
    passwordLayout.addWidget(passwordInputBox);

    innerLayout.addLayout(passwordLayout);

    const addressFromPasswordLayout = new QBoxLayout(Direction.LeftToRight);
    const fundLabel = new QLabel();
    fundLabel.setText(text.fund_this_address);
    const addressFromPasswordLabel = new QLineEdit();
    addressFromPasswordLabel.setText('Address...'); // DELETE THIS LINE
    addressFromPasswordLabel.setReadOnly(true);
    const balanceLabel = new QLabel();
    balanceLabel.setText('123 GRLC'); // DELETE THIS LINE
    const refreshButton = new QPushButton();
    refreshButton.setText(text.refresh_balance_button);
    const copyAddressButton = new QPushButton();
    copyAddressButton.setText(text.copy_address_button);
    addressFromPasswordLayout.addWidget(fundLabel);
    addressFromPasswordLayout.addWidget(addressFromPasswordLabel);
    addressFromPasswordLayout.addWidget(balanceLabel);
    addressFromPasswordLayout.addWidget(refreshButton);
    addressFromPasswordLayout.addWidget(copyAddressButton);

    innerLayout.addLayout(addressFromPasswordLayout);

    const destinationAddressLayout = new QBoxLayout(Direction.LeftToRight);
    const destAddrLabel = new QLabel();
    destAddrLabel.setText(text.input_destination_address);
    const destAddrBox = new QLineEdit();
    destAddrBox.setPlaceholderText(text.input_destination_address_placeholder);
    const checkAddressButton = new QPushButton();
    checkAddressButton.setText(text.check_address_button);
    destinationAddressLayout.addWidget(destAddrLabel);
    destinationAddressLayout.addWidget(destAddrBox);
    destinationAddressLayout.addWidget(checkAddressButton);

    innerLayout.addLayout(destinationAddressLayout);

    const encodingLayout = new QBoxLayout(Direction.LeftToRight);
    const encodingLabel = new QLabel();
    encodingLabel.setText(text.select_encoding);
    const encodingBox = new QComboBox();
    encodingBox.addItems(['Base64', 'HEX', 'Base10', 'UTF-8', 'ASCII']);
    encodingLayout.addWidget(encodingLabel);
    encodingLayout.addWidget(encodingBox);

    innerLayout.addLayout(encodingLayout);

    const nonceLayout = new QBoxLayout(Direction.LeftToRight);
    const nonceLabel = new QLabel();
    const nonceBox = new QLineEdit();
    nonceLabel.setText(text.input_nonce);
    nonceBox.setPlaceholderText(text.input_nonce_placeholder);
    nonceLayout.addWidget(nonceLabel);
    nonceLayout.addWidget(nonceBox);

    innerLayout.addLayout(nonceLayout);

    const selectFileLayout = new QBoxLayout(Direction.LeftToRight);
    const selectFileButton = new QPushButton();
    selectFileButton.setText(text.select_file_button);
    const fileNameLabel = new QLabel();
    fileNameLabel.setText(text.file_selected + ' ' + 'NONE'); // MODIFY THIS LINE
    selectFileLayout.addWidget(selectFileButton);
    selectFileLayout.addWidget(fileNameLabel);

    innerLayout.addLayout(selectFileLayout);

    const sendLayout = new QBoxLayout(Direction.TopToBottom);
    const sendButton = new QPushButton();
    sendButton.setText(text.send_button);
    const output = new QTextEdit();
    output.setReadOnly(true);
    sendLayout.addWidget(sendButton);
    sendLayout.addWidget(output);

    innerLayout.addLayout(sendLayout);

    sendTab.setLayout(sendTabLayout);
}

export { startSendTab };