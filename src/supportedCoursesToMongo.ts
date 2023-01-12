import * as path from 'path'
import * as fs from 'fs'
import csvParser, { Options } from 'csv-parser'
import { CourseModel } from './db'

interface supportedCourseInfo {
  officialName: string
  gcalAbbreviation: string | undefined
}

const onSupportedCourses = (callback: (sci: supportedCourseInfo) => void): void => {
  const csvPath = path.join(__dirname, '../../ulc_courses.csv')
  const options: Options = {
  }
  fs.createReadStream(csvPath)
    .pipe(csvParser(options))
    .on('data', (data) => {
      let officialName = data['OFFICIAL ALBERT COURSE NAME'].trim()
      let gcalAbbreviation = data['GCAL Abbreviation'].trim()

      // check if the course has any valid name
      if (officialName === '' && gcalAbbreviation === '') {
        return
      }

      // check if one of them doesn't exist. if so, fill with the other
      if (gcalAbbreviation === '' && officialName !== '') {
        gcalAbbreviation = undefined
      } else if (officialName === '' && gcalAbbreviation !== '') {
        officialName = gcalAbbreviation
      }

      const sci: supportedCourseInfo = { officialName, gcalAbbreviation }

      callback(sci)
    })
    .on('end', () => {
      console.log('Finished parsing csv')
    })
}

const addSupportedCourse = (sci: supportedCourseInfo): void => {
  void (async (sci: supportedCourseInfo) => {
    await CourseModel.findOneAndUpdate({
      name: sci.officialName
    }, {
      supported: true,
      abbreviation: sci.gcalAbbreviation
    })

    // in case there are courses that have the real names mixed up
    await CourseModel.findOneAndUpdate({
      name: sci.gcalAbbreviation
    }, {
      supported: true,
      abbreviation: sci.gcalAbbreviation
    })
  })(sci)
}

onSupportedCourses(addSupportedCourse)
