# Sources

Add every source to `sources/source-register.json` before creating claims from it.

Suggested layout for a video source:

```text
sources/youtube/<video-id>/
  raw/       Transcript, metadata, and comment exports
  reviewed/  Validated claims, chapters, contradictions, and notes
```

Do not commit copyrighted full transcripts unless there is a clear permission and retention decision. Store excerpts needed to substantiate an extracted claim, plus timecodes.
