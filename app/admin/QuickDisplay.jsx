"use client"
import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const QuickDisplay = ({ faculty, users, courses }) => {
  return (
    <div className="flex items-left justify-start w-screen h-screen ml-20">
      <Tabs defaultValue="faculty" className="h-100vh">
        <TabsList>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>

          <TabsTrigger value="course">Course</TabsTrigger>
        </TabsList>
        <TabsContent value="faculty">
          <FacultyDisplay faculty={faculty} />
        </TabsContent>
        <TabsContent value="user">
          <UserDisplay users={users} />
        </TabsContent>{" "}
        <TabsContent value="course">
          <CourseDisplay courses={courses} />
        </TabsContent>
        <TabsContent value="course">
          <CourseDisplay courses={courses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QuickDisplay

function CourseDisplay({ courses }) {
  return (
    <Table>
      <TableCaption>A list courses.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Code</TableHead>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.code}>
            <TableCell>{course.code}</TableCell>
            <TableCell>{course.title}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FacultyDisplay({ faculty }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <>
      <Table>
        <TableCaption>A list of faculties.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Initial</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mail</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faculty.map((fac) => (
            <TableRow key={fac.initial}>
              <TableCell className="font-medium">{fac.initial}</TableCell>
              <TableCell>{fac.name}</TableCell>
              <TableCell>{fac.email}</TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setSelected(fac)
                    setOpen(true)
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Preview
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name ?? selected?.initial}</DialogTitle>
            <DialogDescription>Faculty details</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <p>
              <strong>Initial:</strong> {selected?.initial}
            </p>
            <p>
              <strong>Name:</strong> {selected?.name}
            </p>
            <p>
              <strong>Email:</strong> {selected?.email}
            </p>
            <p>
              <strong>Designation:</strong> {selected?.designation}
            </p>
            <p>
              <strong>Room:</strong> {selected?.room}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function UserDisplay({ users }) {
  console.log(users)
  return (
    <Table>
      <TableCaption>A list of users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Mail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.studentId}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
