# FriendBot

[![Build Status](https://travis-ci.org/Awkewainze/FriendBot.svg?branch=main)](https://travis-ci.org/Awkewainze/FriendBot)

A discord bot for meme purposes and for helping out with some stuff on our server!

## Required external setup

* [Discord Login Token](https://discord.com/developers)
* If on Windows, [Windows Build Tools](https://www.npmjs.com/package/windows-build-tools),
    if you have Visual Studio installed, that should also work.
* (Recommended) VSCode setup makes Typescript development much easier.
* (Recommended) VScode extensions. VSCode will asks to install them on launching this project.

## NPM Commands

* Lint with `npm run lint`
    * Installing the ESLint and Prettier extensions for VSCode will show and fix errors on save.
* Run with `npm run start`
* Test with `npm run test`

## Discord Commands

Voice commands at this point require $ prefix to make sure they aren't accidentally triggered, that may change in the future.

* `$ding (start|stop)`
    * The Drifter from Destiny 2 plays the song of his people.
* `$villager (start|stop)`
    * Play some villager noises for ambience.
* `$goldwatch`
    * Christopher Walken makes says his most famous voice line.
* `$disconnect`
    * Disconnect the bot from current voice channel.
* `inspect @User`
    * Get some useful info about a user.
* `sus` in the same sentence as a few user mentions.
    * ex. `I am sus of @Person1 and @Person2`
    * Starts a vote on who to eject!
