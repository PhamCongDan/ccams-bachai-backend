var sql = require('mssql');
const { units, dbConfig } = require('../helpers/constants');

const getScholastic = async () => {
  let result = -1;
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig)
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query("SELECT [DEFAULTNAME], [DEFAULTVALUE] FROM LOOK_UP_DATA");
    const getScholasticField = data.recordset.find(item => item.DEFAULTNAME === 'NIENHOCHIENTAI');
    connect.close();
    result = getScholasticField.DEFAULTVALUE;
  } catch (err) {
    console.log(err);
  }
  return result;
}

const getGradeFromUnit = async (unit) => {
  const unitId = units.find(item => item.key === unit)
  if (!unitId) return null;
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig);
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query(`SELECT [MAKHOI], [TENKHOI] FROM KHOI WHERE CODE LIKE N'%${unitId.value}%'`);
    connect.close();
    return data.recordset.map(item => {
      return {
        id: item.MAKHOI,
        name: item.TENKHOI
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
}

const getStudentListFromGradeId = async ({ gradeIds, scholastic }) => {
  if (!gradeIds.length || !scholastic) return null;
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig);
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query(`
      SELECT
      [HOCVIEN].MAHOCVIEN,
      [HOCVIEN].TENTHANH,
      [HOCVIEN].HOCANHAN,
      [HOCVIEN].TENCANHAN,
      [THEOHOC].MALOPHOC,
      [LOPHOC].TENLOPHOC,
      [GIAOLYVIEN].TENTHANH AS TENTHANHGLV,
      [GIAOLYVIEN].HOCANHAN AS HOGLV,
      [GIAOLYVIEN].TENCANHAN AS TENGLV

      FROM [HOCVIEN]
      LEFT OUTER JOIN [THEOHOC] ON [HOCVIEN].MAHOCVIEN = [THEOHOC].MAHOCVIEN
      LEFT OUTER JOIN [LOPHOC] ON [THEOHOC].MALOPHOC = [LOPHOC].MALOPHOC
      LEFT OUTER JOIN [DAY_LOP] ON [DAY_LOP].MALOPHOC = [LOPHOC].MALOPHOC
      LEFT OUTER JOIN [GIAOLYVIEN] ON [GIAOLYVIEN].MAGLV = [DAY_LOP].MAGLV

      WHERE [LOPHOC].MALOPHOC IN (${gradeIds})
      AND [THEOHOC].MANIENHOC='${scholastic}'
      AND [THEOHOC].NGAYXOA IS NULL
      ORDER BY [HOCVIEN].TENCANHAN`);
    connect.close();
    return data.recordset.map(item => {
      return {
        id: item.MAHOCVIEN,
        holyName: item.TENTHANH,
        lastName: item.HOCANHAN,
        firstName: item.TENCANHAN,
        gradeName: item.TENLOPHOC,
        weekDay: 0,
        sunday: 0,
        attendClass: 0,
        teacher: `${item.TENTHANHGLV} ${item.HOGLV} ${item.TENGLV}`,
        fullName: `${item.HOCANHAN} ${item.TENCANHAN}`
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
}

const getAttendanceByTime = async ({ gradeIds, startDate, endDate, scholastic }) => {
  if (!(gradeIds && startDate && endDate && scholastic && gradeIds)) return null;
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig);
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query(`
    SELECT DISTINCT
    [DIEM_DANH].MAHOCVIEN,
    [DIEM_DANH].NGAYDIEMDANH,
    [DIEM_DANH].MALOPHOC,
    [DIEM_DANH].LOAI
  
    FROM [CCAMS_GXBACHAI].[dbo].[DIEM_DANH]
  
    WHERE
    NGAYDIEMDANH >= '${startDate}'
    AND NGAYDIEMDANH <= '${endDate}'
    AND MALOPHOC IN (${gradeIds})
    ORDER BY [DIEM_DANH].MAHOCVIEN
    `);
    connect.close();
    return data.recordset.map(item => {
      return {
        id: item.MAHOCVIEN,
        type: item.LOAI,
        attendanceTime: new Date(item.NGAYDIEMDANH).getTime()
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
}

const countData = (attendanceData, studentId) => {
  const result = attendanceData.reduce((res, item, index) => {
    if (item.id === studentId) {
      const isSunday = (new Date(item.attendanceTime).getDay() === 0);
      if (item.type === 1) {
        if (isSunday) {
          res.sunday += 1
        } else {
          res.weekDay += 1
        }
      } else if (item.type === 2) {
        res.attendClass += 1
      }
    }
    return res
  }, {
    weekDay: 0,
    sunday: 0,
    attendClass: 0
  });
  return result;
}

const countAttendanceData = (studentList, attendanceData) => {
  return studentList.map((item) => {
    const { weekDay, sunday, attendClass } = countData(attendanceData, item.id);
    return {
      ...item,
      weekDay,
      sunday,
      attendClass,
    }
  })
}

const getAttendanceData = async (req, res, next) => {
  const { body: { endDate, startDate, gradeIds } } = req;
  if (endDate && startDate && gradeIds && gradeIds.length) {
    // handle query
    console.log(endDate, startDate, gradeIds);
    const scholastic = await getScholastic();
    const studentList = await getStudentListFromGradeId({ gradeIds, scholastic });
    const attendanceData = await getAttendanceByTime({ gradeIds, startDate, endDate, scholastic });
    const result = countAttendanceData(studentList, attendanceData);
    return res.status(200).json(result)
  }
  // return error
  return res.status(200).json([])
}

module.exports = { getAttendanceData }