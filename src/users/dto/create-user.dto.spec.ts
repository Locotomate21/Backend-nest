import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../../common/roles.enum';

describe('CreateUserDto', () => {
  it('❌ debería fallar si role=representative y no tiene floor', async () => {
    const dto = new CreateUserDto();
    dto.fullName = 'Laura Gómez';
    dto.email = 'laura@example.com';
    dto.password = 'secret123';
    dto.role = Role.Representative;
    dto.active = true;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('✅ debería pasar si role=representative y manda floor', async () => {
    const dto = new CreateUserDto();
    dto.fullName = 'Laura Gómez';
    dto.email = 'laura@example.com';
    dto.password = 'secret123';
    dto.role = Role.Representative;
    dto.active = true;
    dto.floor = 3;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('✅ debería pasar si role=resident (sin floor)', async () => {
    const dto = new CreateUserDto();
    dto.fullName = 'Pedro Pérez';
    dto.email = 'pedro@example.com';
    dto.password = 'clave123';
    dto.role = Role.Resident;
    dto.active = true;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
