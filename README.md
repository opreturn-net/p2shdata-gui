<p align="center">
  <img src="./assets/logo.png" alt="P2SHDATA-GUI logo" width="69" height="69">
</p>

<h1 align="center">P2SHDATA-GUI</h1>

A GUI for the [p2shdata](https://github.com/MaxPuig/p2shdata) protocol to extract/publish data from/to the blockchain.

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704586-daf31196-85f1-4c41-943d-9b033bf702ea.png"></td>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704668-9089c163-c7ba-4c23-9752-d9f2058cd218.png"></td>
    <td><img src="https://user-images.githubusercontent.com/45133421/225704757-3a49bc7f-ffbc-4031-96fe-c1df351facc1.png"></td>
  </tr>
</table>

## HOW TO DOWNLOAD/BUILD
> You should keep the .exe (Windows) and .AppImage (Linux) files in the folder. That folder you CAN move anywhere. You could also create a shortcut to the executable and move it wherever you want.

> On macOS, open the .dmg and drag the app to wherever you want.

> To create an .AppImage on Linux, see Option 2 below.

> The app icon has the default logo. You can manually change it if you want. Look it up on the internet, or ask chatGPT :P


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
## HOW TO CONTRIBUTE
- If you want to contribute and/or add a language, you can do so by forking the repository and submitting a pull request.
- If you add a language (textLanguages.json), copy the `"english"` structure and translate the strings. Then, add the language to the `languages` array. Any missing strings will be replaced with the english ones.
- If you want to add a feature, please open an issue first to discuss it.
