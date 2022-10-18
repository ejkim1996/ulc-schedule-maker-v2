# ULC Schedule Maker v2

## Project Description

The ULC Schedule Maker is a web app designed to streamline schedule creation at the [University Learning Center](https://www.nyu.edu/students/academic-services/undergraduate-advisement/academic-resource-center/tutoring-and-learning.html) at New York University. It takes a Google Calendar containing information about staff availability and translates it to a human-readable format to be posted on the university website. For more background, see the [design document](https://docs.google.com/document/d/1bi2ZLGn0HfFEMszNzCsU4cFlJxKnIqvQ_unJqpelSVI/edit?usp=sharing).

## Stack Description

The ULC Schedule Maker runs on a MERN stack. The database is hosted with MongoDB Atlas, and the app itself is not yet hosted.

## Runbook

To run in a dev environment:

0. Make sure you have Yarn installed. Find more information [here](https://classic.yarnpkg.com/lang/en/docs/install/). 
1. `git clone` the repository
2. In the local repository, run `yarn install`.
3. Run `cd ./client` and run `yarn install` again.
4. Run `cd ..` and run `yarn dev` to launch.
