const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db"
);
//destructure String type from Sequelize
const { STRING, UUID, UUIDV4 } = Sequelize;

//CREATE MODELS / DATA TABLES
const Department = db.define("department", {
  name: {
    type: STRING(20),
  },
});
const Employee = db.define("employee", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: STRING(20),
  },
});

//SET ASSOCIATION FROM DEPARTMENTS TO EMPLOYEE, WITH ALIAS OF "MANAGER ID" AS FOREIGN KEY
Department.belongsTo(Employee, { as: "manager" });
//SET ASSOCIATION FROM EMPLOYEE TO DEPARTMENTS (One - Many) with FKEY of "managerId" as set previously
Employee.hasMany(Department, { foreignKey: "managerId" });
//SET UP SUPERVISOR ASSOCIATION WITHIN EMPLOYEE TABLE
Employee.belongsTo(Employee, { as: "supervisor" });
Employee.hasMany(Employee, { foreignKey: "supervisorId" });

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [moe, lucy, larry, hr, engineering] = await Promise.all([
    Employee.create({ name: "moe" }),
    Employee.create({ name: "lucy" }),
    Employee.create({ name: "larry" }),
    Department.create({ name: "hr" }),
    Department.create({ name: "engineering" }),
  ]);

  hr.managerId = lucy.id;
  await hr.save();
  moe.supervisorId = lucy.id;
  larry.supervisorId = lucy.id;
  await Promise.all([moe.save(), larry.save()]);
};

module.exports = {
  db,
  syncAndSeed,
  models: {
    Department,
    Employee,
  },
};
