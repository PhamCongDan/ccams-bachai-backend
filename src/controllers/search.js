var sql = require('mssql');
const { dbConfig } = require('../helpers/constants');
const { getScholastic } = require('./attendance');

const filterStudent = async (name, scholasticId) => {
  try {
    const poolPromise = new sql.ConnectionPool(dbConfig);
    const connect = await poolPromise.connect();
    const query = poolPromise.request();
    const data = await query.query(`
    SELECT hv.MAHOCVIEN, hv.TENTHANH as hvHoly, hv.HOCANHAN as hvLast, hv.TENCANHAN as hvFirst, hv.HOTENPHCHA, hv.HOTENPHME,
      glv.TENTHANH, glv.HOCANHAN, glv.TENCANHAN, hv.SODIENTHOAI as hvPhone1, hv.SODIENTHOAI2 as hvPhone2 , glv.SODIENTHOAI, lh.TENLOPHOC, k.TENKHOI, gh.TENGIAOHO
    FROM HOCVIEN hv
      left outer join KHONGCONHOC kch on kch.MAHOCVIEN = hv.MAHOCVIEN
      join THEOHOC th on hv.MAHOCVIEN = th.MAHOCVIEN
      join LOPHOC lh on th.MALOPHOC = lh.MALOPHOC
      join DAY_LOP dl on lh.MALOPHOC = dl.MALOPHOC
      join GIAOLYVIEN glv on dl.MAGLV  = glv.MAGLV
      join GIAOHO gh on hv.MAGIAOHO = gh.MAGIAOHO
      join KHOI k on k.MAKHOI = lh.MAKHOI
    WHERE (UPPER(hv.LNAME + ' ' + hv.FNAME)) like UPPER('%${name}%')
      and th.MANIENHOC = '${scholasticId}'
      and dl.VAITRO != 'GLV1'
			and th.NGAYXOA IS NULL
    `);
    connect.close();
    return data.recordset.map(item => {
      const studentPhone = [item?.hvPhone1 ?? null, item?.hvPhone2 ?? null];
      return {
        diocese: item.TENGIAOHO,
        father: item.HOTENPHCHA,
        fullName: `${item.hvHoly} ${item.hvLast} ${item.hvFirst}`,
        grade: item.TENLOPHOC,
        id: item.MAHOCVIEN,
        mother: item.HOTENPHME,
        phoneNumber: studentPhone.filter(item => item).join(' - '),
        teacher: `${item.TENTHANH} ${item.HOCANHAN} ${item.TENCANHAN}`,
        teacherPhoneNumber: item.SODIENTHOAI,
        unit: item.TENKHOI,
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
} 

const searchStudent = async (req, res, next) => {
  const { body: { name } } = req;
  if (name) {
    const scholastic = await getScholastic();
    const result = await filterStudent(name, scholastic);
    return res.status(200).json(result)
  }
  return res.status(200).json([])
}

module.exports = { searchStudent }
