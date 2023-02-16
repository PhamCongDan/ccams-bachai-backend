var sql = require('mssql');
const { units } = require('../helpers/constants');

const config = {
  server: process.env.SERVER_NAME, 
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  trustServerCertificate: true,
  options: {
    encrypt: true,
  }
};

const getScholastic = async () => {
  const poolPromise = new sql.ConnectionPool(config)
  let result = -1;
  try {
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
  const poolPromise = new sql.ConnectionPool(config);
  const unitId = units.find(item => item.key === unit)
  if (!unitId) return null;
  try {
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

const getGrade = async (req, res, next) => {
  const { params, body } = req;
  // const scholastic = await getScholastic();
  // console.log(params, scholastic);
  getGradeFromUnit(params.grade).then(response => res.send(response))
  // const grades = await getGradeFromUnit(params.grade)
  // return res.status(200).json(grades)
}

module.exports = { getGrade }