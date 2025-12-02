"use client"
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
