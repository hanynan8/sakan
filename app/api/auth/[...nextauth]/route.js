import { handlers, connectToMongo, UserModel, getUniqueReferralCode } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const VALID_SIGNUP_ROLES = ['student', 'owner'];

// ── Register Handler ──
async function handleRegister(request) {
  try {
    await connectToMongo();
    const body = await request.json();
    const { firstName, lastName, password, email, phone, referralCode: usedCode, role } = body;

    if (!firstName || !lastName || !password || (!email && !phone)) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Password validation
    if (password.length < 8) {
      return Response.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return Response.json({ message: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return Response.json({ message: 'Password must contain at least one number' }, { status: 400 });
    }

    // Role: طالب أو مالك بس مسموح من فورم التسجيل (الأدمن بيتحدد يدوي في الداتابيز)
    const finalRole = VALID_SIGNUP_ROLES.includes(role) ? role : 'student';

    // Check duplicate
    const existing = await UserModel.findOne(email ? { email } : { phone });
    if (existing) {
      return Response.json(
        { message: email ? 'Email already registered' : 'Phone already registered' },
        { status: 409 }
      );
    }

    // Handle referral code
    let referredBy = null;
    if (usedCode) {
      const referrer = await UserModel.findOne({ referralCode: usedCode.trim().toUpperCase() });
      if (referrer) {
        referredBy = usedCode.trim().toUpperCase();
        // زوّد عداد الـ referrer
        await UserModel.updateOne(
          { referralCode: referredBy },
          { $inc: { referralCount: 1, referralEarnings: 50 } }
        );
      }
    }

    // توليد كود خاص بالمستخدم الجديد
    const newReferralCode = await getUniqueReferralCode(firstName);

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      firstName,
      lastName,
      password: hashed,
      ...(email ? { email } : { phone }),
      role: finalRole,
      referralCode: newReferralCode,
      referredBy: referredBy,
      referralCount: 0,
      referralEarnings: 0,
    });

    return Response.json({ message: 'User created', id: user._id }, { status: 201 });
  } catch (err) {
    console.error('register error:', err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// ── NextAuth Handlers ──
export async function GET(request) {
  return handlers.GET(request);
}

export async function POST(request, context) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/register')) {
    return handleRegister(request);
  }
  return handlers.POST(request, context);
}