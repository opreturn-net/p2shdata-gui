# P2SHDATA-GUI

A GUI for the p2shdata protocol to extract/publish data from/to the blockchain.

> This is a work in progress. It is not ready.

## To Use

- Have nodejs installed
- If using linux, install fuse and libfuse2
  - `sudo apt-get install fuse libfuse2 `

From your command line:

```bash
# Clone this repository
git clone https://github.com/MaxPuig/p2shdata-gui.git

# Go into the repository
cd p2shdata-gui

# Install dependencies
npm install

# If you just want to run the app
npm start

# If you want to build the app
npm run build
# You will find the executable in the ./deploy/{platform}/build folder.
# Windows: .exe, Linux: .AppImage, Mac: .dmg
```