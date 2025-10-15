
import { User } from "../modules/user/user.model";
import { hashPassword } from "../utils/hashManager";

const admin = {
  name: "Bienvenue",
  email: "abcd@gmail.com",
  password: "1qazxsw2",
  role: "admin",
  isDeleted: false,
};
const admin2 = {
  name: "admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  role: "admin",
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const admins = [admin, admin2];

  for (const adminData of admins) {
    const isAdminExists = await User.findOne({ email: adminData.email });

    if (!isAdminExists) {
      const hashedPassword = await hashPassword(adminData.password);
      const adminWithHashedPassword = {
        ...adminData,
        password: hashedPassword,
      };

      await User.create(adminWithHashedPassword);
      console.log(`Admin created: ${adminData.email}`);
    } else {
      console.log(`Admin already exists: ${adminData.email}`);
    }
  }
};
export default seedSuperAdmin;
