# Stand-Up Zombie Cat

A stand-up meeting timer with a zombie cat in a graveyard. Every speaker gets 50 seconds –
after that the cat grows impatient.

**Live:** https://thojaw.github.io/standup-zombie-cat/

## Usage

| Input | Effect |
|---|---|
| Left click | Start the timer – or restart it at 0:50 while it runs |
| Right click | The cat crawls back into its grave |
| `F` | Toggle fullscreen |

## What happens

- **Hidden:** the cat peeks out of the grave, the title "Stand-Up Cat" is shown.
- **0:50 → 0:00:** the cat climbs up and drifts between neutral and happy.
- **From 0:00:** not amused, the timer runs into overtime.
- **From −0:30:** angry, with a lightning flash, and the picture slowly turns red.
- **From −0:45:** rain. **From −1:00:** random lightning.
- **Restart:** the timer spins back to 0:50 while the cat calms down in a hurry.

## Player

`player/` shows the cat without the timer: switch moods with the buttons or keys `1`–`4`,
try other backgrounds, playback speed and bobbing. URL options: `?ui=0`, `?bg=transparent`,
`?speed=2`, `?bob=0.5`, `?mood=angry`.

## Code

`cat.js` holds what app and player share: the clip list (`CLIPS`, with random variants per
loop or transition), the mood machine, the graveyard scene and the bobbing. `index.html` adds
the timer, the weather and the input; `player/index.html` adds the player controls.

## Settings

All timings live in `CONFIG` at the top of the script in `index.html`
(talk time, when the cat gets angry, rain and storm thresholds, playback speed, …).

## Browser support

The clips are VP9 WebM with an alpha channel: Chrome, Edge and Firefox work.
Safari does not support transparent VP9.
