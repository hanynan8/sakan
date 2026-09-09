import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── DB Connection ──
const MONGO_URI = process.env.MONGO_URI;

async function connectToMongo() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}

const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.Model_users || mongoose.model('Model_users', schema, 'users');

// ── Generate unique referral code ──
function generateReferralCode(firstName) {
  const prefix = firstName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`; // e.g. HAN-X7K2
}

async function getUniqueReferralCode(firstName) {
  let code, exists;
  do {
    code = generateReferralCode(firstName);
    exists = await User.findOne({ referralCode: code });
  } while (exists);
  return code;
}

// ── Auth Options ──
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password:   { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        try {
          await connectToMongo();

          const isEmail = /\S+@\S+\.\S+/.test(credentials.identifier);
          const query   = isEmail
            ? { email: credentials.identifier.toLowerCase().trim() }
            : { phone: credentials.identifier.trim() };

          const user = await User.findOne(query).lean();
          if (!user) return null;

          // bcrypt أو plain text fallback
          let valid = false;
          if (user.password?.startsWith('$2')) {
            valid = await bcrypt.compare(credentials.password, user.password);
          } else {
            valid = credentials.password === user.password;
            if (valid) {
              const hashed = await bcrypt.hash(credentials.password, 10);
              await User.updateOne({ _id: user._id }, { password: hashed });
            }
          }

          if (!valid) return null;

          return {
            id:               user._id.toString(),
            name:             `${user.firstName} ${user.lastName}`,
            email:            user.email || '',
            phone:            user.phone || '',
            referralCode:     user.referralCode     || '',
            referralCount:    user.referralCount    || 0,
            referralEarnings: user.referralEarnings || 0,
          };
        } catch (err) {
          console.error('authorize error:', err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/',
    error:  '/',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id               = user.id;
        token.name             = user.name;
        token.email            = user.email;
        token.phone            = user.phone;
        token.referralCode     = user.referralCode;
        token.referralCount    = user.referralCount;
        token.referralEarnings = user.referralEarnings;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id               = token.id;
        session.user.name             = token.name;
        session.user.email            = token.email;
        session.user.phone            = token.phone;
        session.user.referralCode     = token.referralCode;
        session.user.referralCount    = token.referralCount;
        session.user.referralEarnings = token.referralEarnings;
      }
      return session;
    },
  },
};

// ── Register Handler ──
async function handleRegister(request) {
  try {
    await connectToMongo();
    const body = await request.json();
    const { firstName, lastName, password, email, phone, referralCode: usedCode } = body;

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

    // Check duplicate
    const existing = await User.findOne(email ? { email } : { phone });
    if (existing) {
      return Response.json(
        { message: email ? 'Email already registered' : 'Phone already registered' },
        { status: 409 }
      );
    }

    // Handle referral code
    let referredBy = null;
    if (usedCode) {
      const referrer = await User.findOne({ referralCode: usedCode.trim().toUpperCase() });
      if (referrer) {
        referredBy = usedCode.trim().toUpperCase();
        // زوّد عداد الـ referrer
        await User.updateOne(
          { referralCode: referredBy },
          { $inc: { referralCount: 1, referralEarnings: 50 } }
        );
      }
    }

    // توليد كود خاص بالمستخدم الجديد
    const newReferralCode = await getUniqueReferralCode(firstName);

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      firstName,
      lastName,
      password: hashed,
      ...(email ? { email } : { phone }),
      referralCode:     newReferralCode,
      referredBy:       referredBy,
      referralCount:    0,
      referralEarnings: 0,
    });

    return Response.json({ message: 'User created', id: user._id }, { status: 201 });
  } catch (err) {
    console.error('register error:', err);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// ── NextAuth Handlers ──
const { handlers } = NextAuth(authOptions);

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