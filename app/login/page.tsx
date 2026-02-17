import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from '@/components/login-button'
import { Bookmark, Zap, Shield, RefreshCw } from 'lucide-react'

export default async function LoginPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Redirect to home if already logged in
    if (user) {
        redirect('/')
    }

    const features = [
        {
            icon: Zap,
            title: 'Real-time sync',
            desc: 'Bookmarks update instantly across all your devices',
        },
        {
            icon: Shield,
            title: 'Private & secure',
            desc: 'Your bookmarks are only visible to you',
        },
        {
            icon: RefreshCw,
            title: 'Always in sync',
            desc: 'Changes reflect everywhere, no refresh needed',
        },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-md text-center">
                    <div className="rounded-3xl border bg-card p-8 shadow-lg sm:p-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                            <Bookmark className="h-8 w-8 text-primary-foreground" />
                        </div>

                        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Your bookmarks,
                            <br />
                            always in reach.
                        </h1>
                        <p className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-muted-foreground">
                            Save, organize, and access your favorite links in real-time across
                            all your devices.
                        </p>

                        <LoginButton />

                        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <span>Secure authentication with Google</span>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-3">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3.5 rounded-2xl border bg-card p-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                                    <f.icon className="h-[18px] w-[18px] text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{f.title}</h3>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                Built with Supabase Realtime • Private & Secure
            </footer>
        </div>
    )
}
