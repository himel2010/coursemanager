import { login, signup } from "./actions";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="font-bold text-2xl mb-10">Login / Signup</h1>
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
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4 mt-6">
          <Button formAction={login} type="submit">
            Log in
          </Button>
          <Button formAction={signup} type="submit">
            Sign up
          </Button>
        </div>
      </form>
    </div>
  );
}
