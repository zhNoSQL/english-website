PLACE YOUR AUDIO HERE
=====================

1. Record your dialogue (Wilson & Dave) and export it as an MP3.
2. Name the file exactly:  dialogue.mp3
3. Put it in this folder:  public/dialogue.mp3

Then adjust the timeline in  src/data/energy.js  (the "tourTimeline"
array) so each moment matches your recording. The time is in seconds.

Example:
  { time: 10, section: 'numbers', label: 'The numbers' }
  -> at 10 seconds into the audio, the page scrolls to "The numbers".
