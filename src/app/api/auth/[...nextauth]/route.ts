import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// 許可するDiscordサーバーID（.envから取得）
const ALLOWED_GUILD_ID = process.env.DISCORD_GUILD_ID!

// Discord APIでサーバーメンバーシップとロールを確認する関数
async function checkDiscordMembership(accessToken: string, userId: string) {
  try {
    console.log('[Discord] Checking membership for user:', userId)
    
    // ユーザーが所属するサーバーを取得
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!guildsResponse.ok) {
      console.error("[Discord] Failed to fetch guilds, status:", guildsResponse.status)
      return { isMember: false, isGM: false }
    }
    
    const guilds = await guildsResponse.json()
    console.log('[Discord] User guilds:', guilds.map((g: any) => ({ id: g.id, name: g.name })))
    console.log('[Discord] Allowed guild ID:', ALLOWED_GUILD_ID)
    
    const isMember = guilds.some((guild: any) => guild.id === ALLOWED_GUILD_ID)
    
    if (!isMember) {
      console.log('[Discord] User is not a member of the allowed guild')
      return { isMember: false, isGM: false }
    }
    
    console.log('[Discord] User is a member, checking roles...')
    
    // サーバー内のロールを確認
    const memberResponse = await fetch(
      `https://discord.com/api/guilds/${ALLOWED_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    )
    
    if (!memberResponse.ok) {
      console.error("[Discord] Failed to fetch member details, status:", memberResponse.status)
      return { isMember: true, isGM: false }
    }
    
    const member = await memberResponse.json()
    console.log('[Discord] Member roles:', member.roles)
    
    // GMロールIDを確認（.envから取得）
    const GM_ROLE_ID = process.env.DISCORD_GM_ROLE_ID!
    console.log('[Discord] GM role ID:', GM_ROLE_ID)
    
    const isGM = member.roles.includes(GM_ROLE_ID)
    console.log('[Discord] Is GM:', isGM)
    
    return { isMember: true, isGM }
  } catch (error) {
    console.error("[Discord] Error checking Discord membership:", error)
    return { isMember: false, isGM: false }
  }
}

export const authOptions: NextAuthOptions = {
  // データベース接続問題を回避するため、アダプターを一時的に無効化
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[Auth] signIn callback started', { 
        userId: user?.id, 
        email: user?.email,
        hasAccount: !!account,
        hasAccessToken: !!account?.access_token 
      })
      
      if (!account?.access_token || !account?.providerAccountId) {
        console.error('[Auth] Missing account data')
        return false
      }
      
      // Discordメンバーシップとロールを確認
      const { isMember, isGM } = await checkDiscordMembership(
        account.access_token,
        account.providerAccountId
      )
      
      console.log('[Auth] Discord membership check:', { isMember, isGM })
      
      if (!isMember) {
        console.log(`[Auth] User ${user.email} is not a member of the allowed Discord server`)
        return false
      }
      
      // ユーザー情報をJWTに保存（データベース不使用）
      // データベース接続が回復したら、以下のコードを再度有効化してください
      /*
      try {
        console.log('[Auth] Upserting user to database...')
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            isAdmin: isGM,
            discordId: account.providerAccountId,
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin: isGM,
            discordId: account.providerAccountId,
          },
        })
        console.log('[Auth] User upsert successful')
      } catch (error) {
        console.error('[Auth] Error upserting user:', error)
        // エラーが発生してもサインインは続行
      }
      */
      
      // JWT戦略のため、ユーザー情報をuserオブジェクトに追加
      user.isAdmin = isGM
      user.discordId = account.providerAccountId
      
      console.log('[Auth] signIn callback completed successfully')
      return true
    },
    async jwt({ token, user, account }) {
      // 初回サインイン時はuserオブジェクトが利用可能
      if (user) {
        token.isAdmin = user.isAdmin
        token.discordId = user.discordId || account?.providerAccountId
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.isAdmin = (token.isAdmin as boolean) || false
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
