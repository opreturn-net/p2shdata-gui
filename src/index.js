import { QMainWindow, QTabWidget, QIcon, QWidget } from '@nodegui/nodegui';
import { setLanguagesJson } from './readLanguages.js';
let textLanguages = await setLanguagesJson();
let text = textLanguages[textLanguages.settings.selected_language];
// Using dynamic import to load tabs asynchronously so the textLanguages.json file can be loaded first
const { startDownloadTab } = await import('./downloadTab.js');
const { startSendTab } = await import('./sendTab.js');
const { startSettingsTab } = await import('./settingsTab.js');
import logo from '../assets/logo.png';

const win = new QMainWindow();
const appIcon = new QIcon(logo);
win.setWindowIcon(appIcon);
win.setWindowTitle(text.windowTitle);
win.resize(800, 600);

const tabWidget = new QTabWidget();
win.setCentralWidget(tabWidget);

// Create tabs
const sendTab = new QWidget();
const downloadTab = new QWidget();
const settingsTab = new QWidget();

// Add tabs to tab widget
tabWidget.addTab(sendTab, new QIcon(), text.sendTabTitle);
tabWidget.addTab(downloadTab, new QIcon(), text.downloadTabTitle);
tabWidget.addTab(settingsTab, new QIcon(), text.settingsTabTitle);

startDownloadTab(downloadTab);
startSendTab(sendTab);
startSettingsTab(settingsTab);

win.show();
global.win = win;