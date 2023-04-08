import {
    QBoxLayout, Direction, QLabel, QComboBox,
    QScrollArea, QWidget, QLineEdit, QPushButton, QCheckBox
} from '@nodegui/nodegui';
import { writeFileSync } from 'fs';
import { warningWindow } from './utils.js';
import { ElectrumClient } from '@samouraiwallet/electrum-client';
import { getLanguagesJSON } from './readLanguages.js';
let textLanguages = await getLanguagesJSON();
let text = textLanguages[textLanguages.settings.selected_language];

async function startSettingsTab(settingsTab) {
    const settingsTabLayout = new QBoxLayout(Direction.TopToBottom);
    const scrollArea = new QScrollArea();
    const scrollAreaWidget = new QWidget();
    const innerLayout = new QBoxLayout(Direction.TopToBottom);

    // Scroll Bar
    scrollArea.setWidgetResizable(true);
    scrollArea.setWidget(scrollAreaWidget);
    scrollAreaWidget.setLayout(innerLayout);
    settingsTabLayout.addWidget(scrollArea);

    // Language
    const languageSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const languageLabel = new QLabel();
    languageLabel.setText(text.select_language_settings);
    languageSettingsLayout.addWidget(languageLabel);
    const languageComboBox = new QComboBox();
    languageComboBox.addItems(textLanguages.languages);
    languageSettingsLayout.addWidget(languageComboBox);

    innerLayout.addLayout(languageSettingsLayout);

    // Server
    const serverSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const serverLabel = new QLabel();
    serverLabel.setText(text.input_server_settings);
    serverSettingsLayout.addWidget(serverLabel);
    const inputServerSettings = new QLineEdit();
    inputServerSettings.setText(textLanguages.settings.server);
    inputServerSettings.setPlaceholderText(text.input_server_settings_placeholder);
    serverSettingsLayout.addWidget(inputServerSettings);
    const connectToServerButton = new QPushButton();
    connectToServerButton.setText(text.check_connection_button);
    serverSettingsLayout.addWidget(connectToServerButton);

    innerLayout.addLayout(serverSettingsLayout);

    // Advanced TXID checkbox
    const advancedTXIDSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const advancedTXIDLabel = new QLabel();
    advancedTXIDLabel.setText(text.advanced_txid_settings);
    advancedTXIDSettingsLayout.addWidget(advancedTXIDLabel);
    advancedTXIDLabel.setToolTip(text.advanced_txid_settings_tooltip);
    advancedTXIDSettingsLayout.addStretch(1);
    const advancedTXIDCheckbox = new QCheckBox();
    advancedTXIDCheckbox.setChecked(textLanguages.settings.show_advanced_txid);
    advancedTXIDSettingsLayout.addWidget(advancedTXIDCheckbox);
    advancedTXIDCheckbox.setToolTip(text.advanced_txid_settings_tooltip);

    innerLayout.addLayout(advancedTXIDSettingsLayout);

    // Save
    const saveSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const saveSettingsButton = new QPushButton();
    saveSettingsButton.setText(text.save_settings_button);
    saveSettingsLayout.addWidget(saveSettingsButton);

    innerLayout.addLayout(saveSettingsLayout);

    connectToServerButton.addEventListener('clicked', async () => {
        let { success } = await connectToElectrum(inputServerSettings.text());
        if (success) {
            warningWindow(text.connected_to_server);
        } else {
            warningWindow(text.could_not_connect_to_server);
        }
    });

    saveSettingsButton.addEventListener('clicked', () => {
        textLanguages.settings.selected_language = languageComboBox.currentText();
        textLanguages.settings.server = inputServerSettings.text();
        textLanguages.settings.show_advanced_txid = advancedTXIDCheckbox.isChecked();
        saveSettingsButton.setText(text.save_settings_button);
        // save to file
        writeFileSync('./textLanguages.json', JSON.stringify(textLanguages));
        warningWindow(text.restart_to_apply_warning);
    });

    innerLayout.addStretch(1);
    settingsTab.setLayout(settingsTabLayout);

    async function connectToElectrum(server) {
        const client = new ElectrumClient(50002, server, 'ssl');
        let error;
        await client.initElectrum(
            { client: 'electrum-client-js', version: ['1.2', '1.4'] },
            { retryPeriod: 5000, maxRetry: 10, pingPeriod: 5000 }
        ).catch(e => error = e);
        client.close();
        if (error) return { error, success: false }
        else return { success: true };
    }
}

export { startSettingsTab };