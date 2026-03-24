"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import client from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const { error: authError } = await client.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        router.push("/dashboard");
        router.refresh()
        setLoading(false)
    }
    return (
        <div>
            <div className="flex justify-center items-center h-screen w-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>CRM Pro</CardTitle>
                        <CardDescription>Login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4" >
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button className="w-full" type="submit">Login</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

