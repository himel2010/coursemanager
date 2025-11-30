import TableView from "@/components/TableView"
import { prisma } from "@/lib/prisma"

async function getAllInfo() {
  try {
    const data = await prisma.faculty.findMany({
      include: {
        theoryCourses: {
          include: {
            course: {
              select: { code: true },
            },
          },
        },
      },
    })
    console.log(data[0].theoryCourses)
    return data
  } catch (error) {
    throw error
  }
}

const Admin = async () => {
  const data = await getAllInfo()
  return (
    <div className="p-5 flex gap-2 flex-col justify-center items-center">
      <TableView adminData={data} />
    </div>
  )
}

export default Admin
