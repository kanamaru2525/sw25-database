import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// 許可するDiscordサーバーID（.envから取得）
const ALLOWED_GUILD_ID = process.env.DISCORD_GUILD_ID!

// Discord APIでサーバーメンバーシップとロールを確認する関数
async function checkDiscordMembership(accessToken: string, userId: string) {
  try {
    // ユーザーが所属するサーバーを取得
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!guildsResponse.ok) {
      console.error("Failed to fetch guilds")
      return { isMember: false, isGM: false }
    }
    
    const guilds = await guildsResponse.json()
    const isMember = guilds.some((guild: any) => guild.id === ALLOWED_GUILD_ID)
    
    if (!isMember) {
      return { isMember: false, isGM: false }
    }
    
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
      console.error("Failed to fetch member details")
      return { isMember: true, isGM: false }
    }
    
    const member = await memberResponse.json()
    
    // GMロールIDを確認（.envから取得）
    const GM_ROLE_ID = process.env.DISCORD_GM_ROLE_ID!
    const isGM = member.roles.includes(GM_ROLE_ID)
    
    return { isMember: true, isGM }
  } catch (error) {
    console.error("Error checking Discord membership:", error)
    return { isMember: false, isGM: false }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
      if (!account?.access_token || !account?.providerAccountId) {
        return false
      }
      
      // Discordメンバーシップとロールを確認
      const { isMember, isGM } = await checkDiscordMembership(
        account.access_token,
        account.providerAccountId
      )
      
      if (!isMember) {
        console.log(`User ${user.email} is not a member of the allowed Discord server`)
        return false
      }
      
      // ユーザー情報を更新（GMロールの情報を保存）
      // upsertを使用してレコードが存在しない場合は作成、存在する場合は更新
      try {
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
      } catch (error) {
        console.error('Error upserting user:', error)
        // エラーが発生してもサインインは続行
      }
      
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.isAdmin = user.isAdmin || false
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
