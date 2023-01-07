# Nomie Stopwatch

## Current Status
This project is very much in alpha. Currently, the stopwatch plugin works as intended, though there may be refactorings to occur later on. ***Nomiev6 is Open Sourced at https://github.com/open-nomie/nomie6-oss. I will continue working on this as a plugin and may later on bring it up to be included in the official application, specifically when major redesigns and refactorings are complete.***

## Motivation
This plug-in is designed to augment the current timer system in Nomie v6. I created this to make it easier to associate specific timer events to other trackers. For example: 
1. I can use this to track how long I take to shower and then prompt a list tracker when the timer is stopped to get information about the temperature of the water and what soaps I used.
2. I can track how long I exercise and at the end pick from a list of exercises I did.
3. I can track how long I sleep and then prompt a combo tracker for the quality of sleep.

## Stages:
* Working stage (make it work):
  - [x] Create stopwatch
  - [x] Pause/Resume stopwatch
  - [x] Clear stopwatch
  - [x] Save stopwatch
  - [x] List all stopwatches
  - [x] Allow timer includes (automatically prompt when saving stopwatch, i.e. if "#exercise_timer" has items in the Also include section [e.g. "#exercise_intensity"], it will ask the user to input a value for each included tracker before saving).
* Accurate stage (make it correct):
  - [ ] Refactor to use TypeScript (catch some general bugs)
  - [ ] Add contribution to make it easier for others to work on this project
* Release stage (make it fast/customizable):
  - [ ] Allow theming
  - [ ] Fix any performance issues
