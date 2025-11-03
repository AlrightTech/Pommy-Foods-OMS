import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6 max-w-2xl animate-fade-in">
        <div className="inline-block mb-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold-lg mx-auto">
            <span className="text-5xl font-bold text-white">P</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gradient-gold mb-4">
          Pommy Foods
        </h1>
        <p className="text-xl text-foreground/70 mb-8">
          Digital Distribution System
        </p>
        <p className="text-foreground/60 mb-8">
          Smart Order Management System for seamless food distribution
        </p>
        <Link href="/dashboard">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold glow-gold-lg px-8 py-6 text-lg font-semibold"
          >
            Enter Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </main>
  )
}

