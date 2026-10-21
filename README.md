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

## Settings

All timings live in `CONFIG` at the top of the script in `index.html`
(talk time, when the cat gets angry, rain and storm thresholds, playback speed, …).

## Browser support

The clips are VP9 WebM with an alpha channel: Chrome, Edge and Firefox work.
Safari does not support transparent VP9.
