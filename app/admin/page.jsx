import TableView from "@/components/TableView"
import { getAllInfo } from "@/lib/getAllInfo"

import axios from "axios"
import { cookies } from "next/headers"
import QuickDisplay from "./QuickDisplay"
import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"

const Admin = async () => {
  const data = await getAllInfo()

  return (
    <div className="relative">
      <Header className="mb-5" />
      <QuickDisplay
        faculty={data.faculty}
        users={data.users}
        courses={data.courses}
      />
    </div>
  )
}

export default Admin
