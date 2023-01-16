# ULC Schedule Maker v2

## Project Description

The ULC Schedule Maker is a web app designed to streamline schedule creation at the [University Learning Center](https://www.nyu.edu/students/academic-services/undergraduate-advisement/academic-resource-center/tutoring-and-learning.html) at New York University. It takes a Google Calendar containing information about staff availability and translates it to a human-readable format to be posted on the university website. For more background, see the [design document](https://docs.google.com/document/d/1bi2ZLGn0HfFEMszNzCsU4cFlJxKnIqvQ_unJqpelSVI/edit?usp=sharing).

## Administrator Runbook

If you are an administrator at the ULC, start with these steps.

1. Navigate to [https://ulc-schedule-maker-v2-production.up.railway.app/login](https://ulc-schedule-maker-v2-production.up.railway.app/login).
2. Click the "Login with Google" button.
3. If you are met with a Google login page, login to your NYU-affiliated Google account.

If you would like to generate the schedules to be posted on the ULC website:

1. Navigate to the [scheduler page](http://localhost:3000/scheduler).
2. Make sure that the Google calendars containing the schedules for each location is shared with the Google account that is currently logged into the site.
3. Under the ARC dropdown, select the calendar that contains the schedule for the ARC. It should be named "ARC".
4. Do the same for UHall. It should be named "UHall".
5. Under the Staging Week date selector, select the Sunday that marks the start of the staging week that contains the semester's schedule.
    * For example, if the staging week goes from Sunday, August 21 to Saturday, August 27, select Sunday, August 21.
6. Click on the "Go" button.
    * The schedules are generated for all ULC supported courses. See below for more information.
7. Search for particular courses by their GCal abbreviation in the search bar.
8. Copy the scheduling blurb for any course to the clipboard with the copy button and paste it to the ULC website.

The scheduler creates schedules for all courses that the ULC supports. The supported courses are given by [this spreadsheet](https://docs.google.com/spreadsheets/d/17Q-wLIOTDlD3ulZ5izbdfJqt170VjWw9opQluhq9khE/edit#gid=0) but the USM gives options to modify which courses the ULC supports. Note that whether or not a course is supported by the ULC also dictates if it is available as a course on the LA Dashboard.

To remove support for a course:

1. Navigate to the [course dashboard](http://localhost:3000/course-dashboard).
2. Search for the official name of the course in the search bar.
3. In the row corresponding with the course to remove support from, uncheck the box in the "Offered" column.
    * The row should disappear from the table.

To add support for a course:

1. Navigate to the [course dashboard](http://localhost:3000/course-dashboard).
2. Click on the "Add Course" button in the top right.
3. Search for the course using its official name on Albert.
4. Check the box in the course's corresponding row in the "Offered" column.

If the course did not show up after searching, this means that it was not made publicly available through Albert in either spring or fall semester of 2022. To create the course:

1. Navigate to the [course dashboard](http://localhost:3000/course-dashboard).
2. Click on the "Add Course" button in the top right.
3. Click on the "Create Course" button in the top right.
4. Fill in the relevant information into the fields. See below for more information about what each field means.
5. Click "Create". The course should be automatically supported by the ULC and appear in the table on the main page.

To modify the existing information for a supported course:

1. Navigate to the [course dashboard](http://localhost:3000/course-dashboard).
2. Click the edit icon on the right hand side of the row of the corresponding class.
3. From the menu, update any of the relevant information. See below for more information about what each field means.
4. Click the "Save" button when finished.

When creating or modifying the information for a course, keep the following in mind:

* The class name should match the name given by Albert. Different schools and departments may offer courses of the same name.
* The ULC name corresponds to the GCal abbreviation given in [this spreadsheet](https://docs.google.com/spreadsheets/d/17Q-wLIOTDlD3ulZ5izbdfJqt170VjWw9opQluhq9khE/edit#gid=0).
* The school code corresponds to the school that offers the course. For example, CAS's school code is UA, Tandon's is UY, Stern's is UB, etc.
* The department corresponds to the department abbreviation within the school.
* The course ID is number that follows the school code and department in the official course identifier.
* If Albert lists a course as CSCI-UA 101 Intro to Computer Science, the school code will be "UA", the department "CSCI", the course ID "101", and the class name "Intro to Computer Science". At administrator discretion, the ULC name will be "Intro to Comp Sci".

## Learning Assistant Runbook

If you are a Learning Assistant at the ULC, use USM to create the blurb to be copied into Google Calendar when creating your schedule.

1. Navigate to the [LA Dashboard](http://localhost:3000/la-dashboard).
2. On the right hand side, enter your first and last name.
3. In the table on the left hand side, if you tutor a certain course, check the left-hand checkbox on the row corresponding to that course.
4. To search for a specific course you tutor, search for its name or department in the search bar.
5. If you are unable to find a course that you tutor and still want to add that course into your blurb:
    1. Click the "Add Course" button on the right hand side.
    2. Enter the course name.
    3. Click "Save".
6. When you are done with your blurb, click the copy icon to the right of the "Blurb" section and paste the blurb into your Google Calendar.

## Developer Runbook

To run in a dev environment:

0. Make sure you have Yarn installed. Find more information [here](https://classic.yarnpkg.com/lang/en/docs/install/).
1. `git clone` the repository
2. In the local repository, run `yarn install`.
3. Run `cd ./client` and run `yarn install` again.
4. Run `cd ..` and run `yarn dev` to launch.

## Stack Description

The ULC Schedule Maker runs on a MERN stack. The database is hosted with MongoDB Atlas, and the app itself is hosted on Railway.
