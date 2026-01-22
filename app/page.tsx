import { KwhCalculator } from "@/components/kwh-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-start justify-center p-4 py-8">
      <KwhCalculator />
    </main>
  )
}
