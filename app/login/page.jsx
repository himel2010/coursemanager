"use client"
import { useState } from "react"
import { login, signup } from "./actions"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function LoginForm() {
  return (
    <div className=" w-screen h-full flex flex-col justify-center items-center">
      <form className="w-[25%]">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@email.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className={"font-mono"}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button formAction={login} type="submit">
            Log in
          </Button>
        </div>
      </form>
    </div>
  )
}
function SignUpForm() {
  const [role, setRole] = useState("STUDENT")
  return (
    <div className=" w-screen h-full flex flex-col justify-center items-center">
      <form className="w-[25%]">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" type="text" placeholder="Your name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="email@email.com" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <select
                id="role"
                name="role"
                className="w-full rounded-md border px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty (@bracu.ac.bd)</option>
              </select>
            </Field>
            {role === "STUDENT" && (
              <Field>
                <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                <Input id="studentId" name="studentId" type="text" placeholder="Student ID" />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="dept">Department</FieldLabel>
              <Input id="dept" name="dept" type="text" placeholder="CSE" />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className={"font-mono"}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button formAction={signup} type="submit">
            Sign up
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className=" w-screen h-screen flex flex-col justify-center items-center">
      <Tabs defaultValue="login" className="items-center">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">SignUp</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
