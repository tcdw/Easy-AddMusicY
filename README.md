# AddMusicY Made Easy for Porters

Recently I want to try porting music with AddMusicY, but the way to get your SPC is too awkward. So, I wrote my own script to make things automatic.

As you can see, I can build the mml.bin and SPC file, then open the SPC player automatically with an single command. If you load previous commend **with up arrow key**, you would get AddMusicK's porter mode like experience when porting stuff.

![it works smoothly](https://i.loli.net/2019/03/24/5c966492b7db9.png)

## Usage

1. Get [Node.js](https://nodejs.org)
2. Get [AddMusicY beta](https://dl.dropbox.com/s/oqsnu42mg76runs/AddMusicY%20Beta.zip)
3. Clone this repository, and copy `template.spc` and `template.spc` into your AddMusicY directory
4. Open terminal, and change your working directory to your AddMusicY directory. If you using Windows, you can actually hold Shift key and right click in the directory, then you can simply launch the terminal from your directory [via something like "Open Powershell here"](https://i.loli.net/2019/03/23/5c96566f9471c.png).
5. Run command:

```bash
node porter.js MML File Name of Your Song
```

For example, if your song is located in your AddMusicY directory, and called "derp.mml", your commend world be

```bash
node porter.js derp.mml
```

Then, all of things will be handled automatically, and your generated SPC will be opened with your preferred SPC player.


You can also define your SPC ID666 tags with these special syntax:

```
;@@title        song title, 32 characters max
;@@game         game title, 32 characters max
;@@artist       artist's name, 32 characters max
;@@dumper       dumper's name, 16 characters max
;@@comments     comments, 32 characters max
```

Happy porting!

[Something I ported with the help of my script](https://bin.smwcentral.net/u/17572/Oriental%2BMountain.zip)
