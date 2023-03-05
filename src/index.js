import { QMainWindow, QTabWidget, QIcon, QWidget } from '@nodegui/nodegui';
import { startDownloadTab } from './downloadTab.js';
import textLanguages from './textLanguages.json' assert { type: "json" };
let text = textLanguages['english'];

const win = new QMainWindow();
win.setWindowTitle(text.windowTitle);
win.resize(800, 600);

const tabWidget = new QTabWidget();
win.setCentralWidget(tabWidget);

// Create tabs
const sendTab = new QWidget();
const downloadTab = new QWidget();
const settingsTab = new QWidget();

// Add tabs to tab widget
// tabWidget.addTab(sendTab, new QIcon(), text.sendTabTitle);
tabWidget.addTab(downloadTab, new QIcon(), text.downloadTabTitle);
// tabWidget.addTab(settingsTab, new QIcon(), text.settingsTabTitle);

startDownloadTab(downloadTab);

win.show();
global.win = win;