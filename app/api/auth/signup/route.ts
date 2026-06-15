import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';
import { DEFAULT_MATERIALS, DEFAULT_OPTIONS } from '@/lib/roofCalc';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName } = await req.json();

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Generate a unique slug
    let slug = generateSlug(companyName);
    let suffix = 0;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${generateSlug(companyName)}-${suffix}`;
    }

    const passwordHash = await hashPassword(password);

    // Create org + user + default pricing atomically
    const org = await prisma.organization.create({
      data: {
        slug,
        name: companyName,
        users: {
          create: {
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: 'ADMIN',
          },
        },
        pricing: {
          create: {
            name: 'default',
            materials: DEFAULT_MATERIALS as unknown as never,
            options: DEFAULT_OPTIONS as unknown as never,
          },
        },
      },
      include: { users: true },
    });

    const user = org.users[0];
    const token = await createSession({
      userId: user.id,
      organizationId: org.id,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, slug: org.slug });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[POST /api/auth/signup]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
