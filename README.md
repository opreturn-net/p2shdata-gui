# P2SHDATA-GUI

A GUI for the p2shdata protocol to extract/publish data from/to the blockchain.

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704586-daf31196-85f1-4c41-943d-9b033bf702ea.png"></td>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704668-9089c163-c7ba-4c23-9752-d9f2058cd218.png"></td>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704757-3a49bc7f-ffbc-4031-96fe-c1df351facc1.png"></td>
  </tr>
</table>

## To Use

### Option 1
You can download the app from the [releases page](https://github.com/MaxPuig/p2shdata-gui/releases).

### Option 2
Build the app yourself.

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
