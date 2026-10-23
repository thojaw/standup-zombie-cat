# Stand-Up Zombie Cat

A stand-up meeting timer with a zombie cat in a graveyard. Every speaker gets 50 seconds –
after that the cat grows impatient.

**Live:** https://thojaw.github.io/standup-zombie-cat/

## Usage

| Input | Effect |
|---|---|
| Left click | Start the timer – or restart it at 0:50 while it runs |
| Right click | The cat crawls back into its grave |
| `B` | Lightning flash (counts like the automatic ones, so every second one is haunted) |
| `F` | Toggle fullscreen |

## What happens

- **Hidden:** the cat peeks out of the grave, the title "Stand-Up Cat" is shown.
- **0:50 → 0:00:** the cat climbs up, now and then turns happy or looks around.
- **From 0:06:** the cat heads for not amused, so no happy face is left once the digits turn red.
- **From 0:00:** not amused (three variants), the timer runs into overtime.
- **From −0:25:** rain.
- **From −0:30:** angry, with a lightning flash, and the picture slowly turns red.
- **From −1:00:** random lightning.
- **Did you see that?** The first flash of a round and every second one after it briefly reveal
  an evil moon, a crow skeleton and a skull with glowing eyes – gone once the light fades.
- **Restart:** the timer spins back to 0:50 while the cat calms down in a hurry.

## Player

`player/` shows the cat without the timer: switch moods with the buttons or keys `1`–`4`,
try other backgrounds, playback speed and bobbing. URL options: `?ui=0`, `?bg=transparent`,
`?speed=2`, `?bob=0.5`, `?mood=angry`.

## Code

`cat.js` holds what app and player share: the clip list (`CLIPS`, with variants per loop or
transition drawn from a shuffle bag, plus extra clips played on request), the mood machine, the
graveyard scene and the bobbing. `index.html` adds
the timer, the weather and the input; `player/index.html` adds the player controls.

## Settings

All timings live in `CONFIG` at the top of the script in `index.html`
(talk time, when the cat gets angry, rain and storm thresholds, playback speed, …).

## Browser support

The clips are VP9 WebM with an alpha channel: Chrome, Edge and Firefox work.
Safari does not support transparent VP9.
