import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-charcoal">
      <div className="w-full max-w-sm">
        <Card className="bg-charcoal-light border-gold/20">
          <CardHeader>
            <CardTitle className="text-2xl text-gold">Check Your Email</CardTitle>
            <CardDescription className="text-gray-400">We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Please check your email and click the confirmation link to activate your account.
            </p>
            <p className="text-sm text-gray-400">
              After confirming, you can{" "}
              <Link href="/auth/login" className="text-gold hover:underline">
                log in to your account
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
