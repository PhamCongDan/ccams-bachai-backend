const units = [
  {
    key: 'chien',
    value: 'KT',
  },
  {
    key: 'au',
    value: 'XT'
  },
  {
    key: 'thieu',
    value: 'TS'
  },
  {
    key: 'nghia',
    value: 'SĐ'
  },
  {
    key: 'hiep',
    value: 'VĐ'
  },
];

const dbConfig = {
  server: process.env.SERVER_NAME, 
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  trustServerCertificate: true,
  options: {
    encrypt: true,
  }
};

module.exports = { units, dbConfig }