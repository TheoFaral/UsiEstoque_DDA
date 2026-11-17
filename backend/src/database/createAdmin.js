const bcrypt = require("bcryptjs");
const env = require("../config/env");
const sequelize = require("../config/database");
const { Usuario } = require("../models");

async function main() {
  if (!env.seedAdminPassword)
    throw new Error("Defina SEED_ADMIN_PASSWORD no arquivo backend/.env.");
  const senhaHash = await bcrypt.hash(env.seedAdminPassword, 12);
  const [usuario, criado] = await Usuario.findOrCreate({
    where: { email: env.seedAdminEmail },
    defaults: {
      nome: env.seedAdminName,
      senhaHash,
      perfil: "administrador",
      ativo: true,
    },
  });
  console.log(
    criado
      ? `Administrador criado: ${usuario.email}`
      : `Administrador já existe: ${usuario.email}`,
  );
  await sequelize.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
