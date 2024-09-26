import { Shell } from "@/components/shell"
import { TricksTable } from "@/components/tricks-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function IndexPage() {
  return (
    <Shell>
      <div className="flex justify-center space-x-4 mb-6">
        <Button asChild>
          <Link href="/Data2">CSV MANAGER</Link>
        </Button>
        <Button asChild>
          <Link href="/Database">DATABASE</Link>
        </Button>
        <Button asChild>
          <Link href="/DatabaseCharts">SEARCH DATABASE with Charts</Link>
        </Button>
        <Button asChild>
          <Link href="/Storage">Storage</Link>
        </Button>
      </div>
      <TricksTable />
    </Shell>
  )
}