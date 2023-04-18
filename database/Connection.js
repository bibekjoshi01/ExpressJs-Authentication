const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

// sequelize.sync()

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection established successfully !");
  })
  .catch(() => {
    console.error("unable to connect");
  });

module.exports = sequelize;
