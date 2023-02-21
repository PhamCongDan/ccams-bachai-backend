var sql = require('mssql');
const { units, dbConfig } = require('../helpers/constants');

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

const getUnit = async (req, res, next) => {
  const { params } = req;
  getGradeFromUnit(params.unit).then(response => res.send(response))
}

module.exports = { getUnit }