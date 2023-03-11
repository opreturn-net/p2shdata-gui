import {
    QWidget, QPushButton, QLabel, QLineEdit, QTextEdit, Direction,
    QFileDialog, QMessageBox, ButtonRole, FileMode, QBoxLayout,
    QScrollArea
} from '@nodegui/nodegui';
import { decodeP2SHDATA } from './decode_p2shdata.js';
import textLanguages from './textLanguages.json' assert { type: "json" };
let text = textLanguages['english'];

async function startDownloadTab(downloadTab) {
    const downloadTabLayout = new QBoxLayout(Direction.TopToBottom);
    const scrollArea = new QScrollArea();
    const scrollAreaWidget = new QWidget();
    const innerLayout = new QBoxLayout(Direction.TopToBottom);
    const inputLabel = new QLabel();
    const inputBox = new QLineEdit();
    const downloadButton = new QPushButton();
    const outputText = new QTextEdit();
    
    inputLabel.setText(text.input_txid_label);
    inputBox.setPlaceholderText(text.input_txid_placeholder);
    downloadButton.setText(text.downloadButton);
    outputText.setReadOnly(true);

    scrollArea.setWidgetResizable(true);
    scrollArea.setWidget(scrollAreaWidget);
    scrollAreaWidget.setLayout(innerLayout);
    innerLayout.addWidget(inputLabel);
    innerLayout.addWidget(inputBox);
    innerLayout.addWidget(downloadButton);
    innerLayout.addWidget(outputText);
    
    downloadTabLayout.addWidget(scrollArea);
    downloadTab.setLayout(downloadTabLayout);

    // Connect a function to the button's clicked signal to append the input text to the output
    downloadButton.addEventListener('clicked', async () => {
        if (inputBox.text()) {
            const selectedFolder = selectFolder();
            if (selectedFolder) {
                let txid = inputBox.text();
                await getP2SHDATA(txid, selectedFolder);
            }
        } else {
            warningWindow(text.enter_txid_warning);
        }
    });

    inputBox.addEventListener('returnPressed', async () => {
        if (inputBox.text()) {
            const selectedFolder = selectFolder();
            if (selectedFolder) {
                let txid = inputBox.text();
                await getP2SHDATA(txid, selectedFolder);
            }
        } else {
            warningWindow(text.enter_txid_warning);
        }
    });

    async function getP2SHDATA(txid, selectedFolder) {
        outputText.append('\nTXID: ' + txid);
        let p2shdata = await decodeP2SHDATA(txid, selectedFolder);
        if (p2shdata.error) {
            outputText.append(p2shdata.error);
            return;
        } else {
            outputText.append('Saved file: ' + p2shdata.file_location);
            outputText.append('P2SHDATA:\n' + JSON.stringify(p2shdata.title, undefined, 4));
            inputBox.clear();
        }
    }

    function selectFolder() {
        const fileDialog = new QFileDialog();
        fileDialog.setWindowTitle(text.select_folder_to_save_file)
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