import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { config } from '../config';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Email or phone is required',
      });
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        error: 'User account is inactive',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
      }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      error: 'Login failed',
    });
  }
};