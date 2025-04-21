import { AuthProvider } from '@prisma/client';

export class CreateUserDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  provider: AuthProvider;
  picture: string | null;
  emailVerified?: boolean;
}
