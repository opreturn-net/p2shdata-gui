import {
    QBoxLayout, Direction, QLabel, QComboBox,
    QScrollArea, QWidget, QLineEdit, QPushButton, QCheckBox
} from '@nodegui/nodegui';
import { warningWindow } from './utils.js';
import { writeFileSync, unlinkSync } from 'fs';
import { getLanguagesJSON } from './readLanguages.js';
import { ElectrumClient } from '@samouraiwallet/electrum-client';
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
    languageLabel.setToolTip(text.select_language_settings_tooltip);
    const languageComboBox = new QComboBox();
    languageComboBox.addItems(textLanguages.languages);
    languageSettingsLayout.addWidget(languageComboBox);
    languageComboBox.setToolTip(text.select_language_settings_tooltip);

    innerLayout.addLayout(languageSettingsLayout);

    // Server
    const serverSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const serverLabel = new QLabel();
    serverLabel.setText(text.input_server_settings);
    serverSettingsLayout.addWidget(serverLabel);
    serverLabel.setToolTip(text.input_server_settings_tooltip);
    const inputServerSettings = new QLineEdit();
    inputServerSettings.setText(textLanguages.settings.server);
    inputServerSettings.setPlaceholderText(text.input_server_settings_placeholder);
    serverSettingsLayout.addWidget(inputServerSettings);
    inputServerSettings.setToolTip(text.input_server_settings_tooltip);
    const connectToServerButton = new QPushButton();
    connectToServerButton.setText(text.check_connection_button);
    serverSettingsLayout.addWidget(connectToServerButton);

    innerLayout.addLayout(serverSettingsLayout);

    // Time between transactions
    const timeBetweenTxSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const timeBetweenTxLabel = new QLabel();
    timeBetweenTxLabel.setText(text.input_time_between_txs_settings);
    timeBetweenTxSettingsLayout.addWidget(timeBetweenTxLabel);
    timeBetweenTxLabel.setToolTip(text.input_time_between_txs_settings_tooltip);
    const inputTimeBetweenTxSettings = new QLineEdit();
    inputTimeBetweenTxSettings.setText(textLanguages.settings.time_between_txs_seconds);
    inputTimeBetweenTxSettings.setPlaceholderText(text.input_time_between_txs_settings_placeholder);
    timeBetweenTxSettingsLayout.addWidget(inputTimeBetweenTxSettings);
    inputTimeBetweenTxSettings.setToolTip(text.input_time_between_txs_settings_tooltip);

    innerLayout.addLayout(timeBetweenTxSettingsLayout);

    // Origin address fee
    const originAddressFeeSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const originAddressFeeLabel = new QLabel();
    originAddressFeeLabel.setText(text.origin_address_fee_settings);
    originAddressFeeSettingsLayout.addWidget(originAddressFeeLabel);
    originAddressFeeLabel.setToolTip(text.origin_address_fee_settings_tooltip);
    const inputOriginAddressFeeSettings = new QLineEdit();
    inputOriginAddressFeeSettings.setText(textLanguages.settings.origin_address_fee);
    inputOriginAddressFeeSettings.setPlaceholderText(text.origin_address_fee_settings_placeholder);
    originAddressFeeSettingsLayout.addWidget(inputOriginAddressFeeSettings);
    inputOriginAddressFeeSettings.setToolTip(text.origin_address_fee_settings_tooltip);

    innerLayout.addLayout(originAddressFeeSettingsLayout);

    // Destination address fee
    const destinationAddressFeeSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const destinationAddressFeeLabel = new QLabel();
    destinationAddressFeeLabel.setText(text.destination_address_fee_settings);
    destinationAddressFeeSettingsLayout.addWidget(destinationAddressFeeLabel);
    destinationAddressFeeLabel.setToolTip(text.destination_address_fee_settings_tooltip);
    const inputDestinationAddressFeeSettings = new QLineEdit();
    inputDestinationAddressFeeSettings.setText(textLanguages.settings.destination_address_fee);
    inputDestinationAddressFeeSettings.setPlaceholderText(text.destination_address_fee_settings_placeholder);
    destinationAddressFeeSettingsLayout.addWidget(inputDestinationAddressFeeSettings);
    inputDestinationAddressFeeSettings.setToolTip(text.destination_address_fee_settings_tooltip);

    innerLayout.addLayout(destinationAddressFeeSettingsLayout);

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

    // Return to default settings
    const returnToDefaultSettingsLayout = new QBoxLayout(Direction.LeftToRight);
    const returnToDefaultSettingsButton = new QPushButton();
    returnToDefaultSettingsButton.setText(text.return_to_default_settings_button);
    returnToDefaultSettingsLayout.addWidget(returnToDefaultSettingsButton);
    returnToDefaultSettingsButton.setToolTip(text.return_to_default_settings_button_tooltip);

    innerLayout.addLayout(returnToDefaultSettingsLayout);

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

    inputTimeBetweenTxSettings.addEventListener('textChanged', () => {
        inputTimeBetweenTxSettings.setText(inputTimeBetweenTxSettings.text().replace(/[^0-9]/g, ""));
    });

    inputOriginAddressFeeSettings.addEventListener('textChanged', () => {
        inputOriginAddressFeeSettings.setText(inputOriginAddressFeeSettings.text().replace(/[^0-9]/g, ""));
    });

    inputDestinationAddressFeeSettings.addEventListener('textChanged', () => {
        inputDestinationAddressFeeSettings.setText(inputDestinationAddressFeeSettings.text().replace(/[^0-9]/g, ""));
    });

    returnToDefaultSettingsButton.addEventListener('clicked', () => {
        try {
            unlinkSync('./textLanguages.json');
        } catch (e) {
            // File already deleted
        }
        warningWindow(text.restart_to_apply_warning);
    });

    saveSettingsButton.addEventListener('clicked', () => {
        textLanguages.settings.selected_language = languageComboBox.currentText();
        textLanguages.settings.server = inputServerSettings.text();
        textLanguages.settings.time_between_txs_seconds = Number(inputTimeBetweenTxSettings.text());
        textLanguages.settings.origin_address_fee = Number(inputOriginAddressFeeSettings.text());
        textLanguages.settings.destination_address_fee = Number(inputDestinationAddressFeeSettings.text());
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