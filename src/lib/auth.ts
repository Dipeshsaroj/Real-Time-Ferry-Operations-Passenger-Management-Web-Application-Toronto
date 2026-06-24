import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import prisma from './prisma';

export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, language: true, notificationPrefs: true },
  });

  return user;
}
