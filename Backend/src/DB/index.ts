
import { EmployerInfo } from "../modules/auth/auth.model";
import { hashPassword } from "../utils/hashManager";

const admin = {
  name: "Bienvenue",
  email: "abcd@gmail.com",
  phone:"+8801712345678",
  secondaryPhoneNumber:"",
  address:"abcd address",
  profilePic:"../../public/profile picture/person.png",
  profilePic_src:"../../public/profile picture/person.png",
  position:"Chair person",
  employer_id:"1",
  role: "superAdmin",
  password: "1qazxsw2",
  //isDeleted: false,
};
const admin2 = {
  name: "md abid sarkar",
  email: "abidsarker.61@gmail.com",
  phone:"+8801712345677",
  secondaryPhoneNumber:"",
  role: "superAdmin",
  address:"abcd address",
  profilePic:"../../public/profile picture/person.png",
  profilePic_src:"../../public/profile picture/person.png",
  position:"Chair person",
  employer_id:"2",
  password: "1qazxsw2",
  //isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const admins = [admin, admin2];

  for (const adminData of admins) {
    const isAdminExists = await EmployerInfo.findOne({ email: adminData.email });

    if (!isAdminExists) {
      const hashedPassword = await hashPassword(adminData.password);
      const adminWithHashedPassword = {
        ...adminData,
        password: hashedPassword,
      };

      await EmployerInfo.create(adminWithHashedPassword);
      console.log(`Admin created: ${adminData.email}`);
    } else {
      console.log(`Admin already exists: ${adminData.email}`);
    }
  }
};
export default seedSuperAdmin;
