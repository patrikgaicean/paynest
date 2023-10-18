import { DeepPartial } from "typeorm";
import { User } from "../../users/entities/user.entity";
import Decimal from "decimal.js";
import * as bcrypt from 'bcryptjs';

type UserData = DeepPartial<User>;

export const usersData: UserData[] = [
  {
    email: "bob@gmail.com",
    password: "bobbob",
    balance: 140000,
  },
  {
    email: "mark@gmail.com",
    password: "markmark",
    balance: 500000,
  },
  {
    email: "nick@gmail.com",
    password: "nicknick",
    balance: 1234.55,
  },
  {
    email: "emily@gmail.com",
    password: "emilyemily",
    balance: 99999,
  },
  {
    email: "nicole@gmail.com",
    password: "nicolenicole",
    balance: 14790.42,
  },
  {
    email: "theprimeagen@gmail.com",
    password: "primetime",
    balance: 69420.69,
  }
]

type UserEntity = DeepPartial<User>[];

export async function createTestUsers(usersData: UserData[]): Promise<UserEntity> {
  const userEntities = await Promise.all(usersData.map(async u => {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const decimalBalance = new Decimal(u.balance as number);

    const newUser: DeepPartial<User> = {
      email: u.email,
      password: hashedPassword,
      balance: decimalBalance,
    };

    return newUser;
  }));
  
  return userEntities;
}
