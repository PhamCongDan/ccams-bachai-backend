var sql = require('mssql');
const { dbConfig } = require('../helpers/constants');
const { getScholastic } = require('./attendance');

const getClassFromGradeId = async (gradeIds, scholasticId) => {
  if (!gradeIds.length) return null;
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig);
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query(`SELECT [MALOPHOC], [MANIENHOC], [TENLOPHOC], [MAKHOI], [CHUNHIEM], [GLV1] FROM LOPHOC WHERE MAKHOI IN (${gradeIds}) AND MANIENHOC IN (${scholasticId})`);
    connect.close();
    return data.recordset.map(item => {
      return {
        id: item.MALOPHOC,
        name: item.TENLOPHOC,
        scholasticId: item.MANIENHOC,
        teacher: item.CHUNHIEM,
        tutor: item.GLV1,
        unitId: item.MAKHOI,
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
} 

const getClass = async (req, res, next) => {
  const { params, body, query } = req;
  const { unitIds } = query;
  // const lstUnitIds = unitIds.split(',')
  const currentScholastic = await getScholastic();
  getClassFromGradeId(unitIds, currentScholastic).then(response => res.send(response));
}

module.exports = { getClass }