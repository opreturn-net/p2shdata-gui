import { QWidget, QPushButton, FlexLayout, QLabel, QLineEdit, QTextEdit, QFileDialog, QMessageBox, ButtonRole, FileMode, QSizePolicyPolicy, QScrollArea } from '@nodegui/nodegui';
import { decodeP2SHDATA } from './decode_p2shdata.js';
import textLanguages from './textLanguages.json' assert { type: "json" };
let text = textLanguages['english'];

async function startDownloadTab(downloadTab) {
    // Create a QPushButton widget and add it to a QWidget container
    const downloadButton = new QPushButton();
    downloadButton.setText(text.downloadButton);
    const buttonContainer = new QWidget();
    const buttonLayout = new FlexLayout();
    buttonContainer.setLayout(buttonLayout);
    buttonLayout.setFlexNode(buttonContainer.getFlexNode());
    buttonLayout.addWidget(downloadButton);

    // Create a QLabel widget and add it to a QWidget container
    const label = new QLabel();
    label.setText(text.input_txid_label);
    const labelContainer = new QWidget();
    const labelLayout = new FlexLayout();
    labelContainer.setLayout(labelLayout);
    labelLayout.setFlexNode(labelContainer.getFlexNode());
    labelLayout.addWidget(label);

    // Create a QLineEdit widget and add it to a QWidget container
    const input = new QLineEdit();
    input.setPlaceholderText(text.input_txid_placeholder);
    const inputContainer = new QWidget();
    const inputLayout = new FlexLayout();
    inputContainer.setLayout(inputLayout);
    inputLayout.setFlexNode(inputContainer.getFlexNode());
    inputLayout.addWidget(input);

    // Create a QTextEdit widget and add it to a QWidget container
    const output = new QTextEdit();
    output.setReadOnly(true);
    output.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Expanding);
    const outputContainer = new QWidget();
    const outputLayout = new FlexLayout();
    outputContainer.setLayout(outputLayout);
    outputLayout.setFlexNode(outputContainer.getFlexNode());
    outputLayout.addWidget(output);

    // Add the button container to the download tab's layout
    const downloadLayout = new FlexLayout();
    downloadLayout.setFlexNode(downloadTab.getFlexNode());
    downloadLayout.addWidget(labelContainer);
    downloadLayout.addWidget(inputContainer);
    downloadLayout.addWidget(buttonContainer);
    downloadLayout.addWidget(outputContainer);
    downloadTab.setLayout(downloadLayout);

    // Connect a function to the button's clicked signal to append the input text to the output
    downloadButton.addEventListener('clicked', async () => {
        if (input.text()) {
            const selectedFolder = selectFolder();
            if (selectedFolder) {
                let txid = input.text();
                txid = '714e6617bc1ff393b3bb0c4be858831b66a633a537a9363796375852cacbd9bb';
                await getP2SHDATA(txid, selectedFolder);
            }
        } else {
            warningWindow(text.enter_txid_warning);
        }
    });

    input.addEventListener('returnPressed', async () => {
        if (input.text()) {
            const selectedFolder = selectFolder();
            if (selectedFolder) {
                let txid = input.text();
                txid = '714e6617bc1ff393b3bb0c4be858831b66a633a537a9363796375852cacbd9bb';
                await getP2SHDATA(txid, selectedFolder);
            }
        } else {
            warningWindow(text.enter_txid_warning);
        }
    });

    async function getP2SHDATA(txid, selectedFolder) {
        output.append('TXID: ' + txid);
        let p2shdata = await decodeP2SHDATA(txid, selectedFolder);
        if (p2shdata.error) {
            output.append(p2shdata.error);
            return;
        } else {
            output.append('Saved file: ' + p2shdata.file_location);
            input.clear();
            output.append('P2SHDATA:\n' + JSON.stringify(p2shdata.title, undefined, 4));
        }
    }

    function selectFolder() {
        const fileDialog = new QFileDialog();
        fileDialog.setFileMode(FileMode.Directory);
        if (fileDialog.exec() == 0) return;
        const selectedFolder = fileDialog.selectedFiles()[0];
        return selectedFolder;
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
}

export { startDownloadTab };