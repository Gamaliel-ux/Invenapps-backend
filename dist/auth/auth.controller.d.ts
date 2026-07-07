import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        expires_in: number;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
}
