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
  return (
    <Table>
      <TableCaption>A list of faculties.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Initial</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Mail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {faculty.map((fac) => (
          <TableRow key={fac.initial}>
            <TableCell className="font-medium">{fac.initial}</TableCell>
            <TableCell>{fac.name}</TableCell>
            <TableCell>{fac.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
