import React from "react"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldContent,
} from "../ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { TagsInputField } from "@/components/tags-input-field"
import { useForm, FormProvider } from "react-hook-form"
import { Input } from "../ui/input"
import { Minus, Plus } from "lucide-react"

const QuizEventForm = ({
  course,
  setCourse,
  courses,
  description,
  setDescription,
  form,
  rubric,
  setRubric,
}) => {
  const updateRubricItem = (id, field, value) => {
    setRubric((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "mark" ? Number(value) : value }
          : item
      ),
    }))
  }

  const addRubricItem = () => {
    const newId = Math.max(...rubric.items.map((i) => i.id), 0) + 1
    const marksPerQuestion = rubric.totalMarks / (rubric.items.length + 1)

    setRubric((prev) => ({
      totalMarks: prev.totalMarks,
      items: [
        ...prev.items.map((item) => ({ ...item, mark: marksPerQuestion })),
        { id: newId, item: `Question ${newId}`, mark: marksPerQuestion },
      ],
    }))
  }

  const removeRubricItem = (id) => {
    const remainingItems = rubric.items.filter((item) => item.id !== id)
    const marksPerQuestion = rubric.totalMarks / remainingItems.length

    setRubric({
      totalMarks: rubric.totalMarks,
      items: remainingItems.map((item) => ({
        ...item,
        mark: marksPerQuestion,
      })),
    })
  }

  const updateTotalMarks = (newTotal) => {
    const marksPerQuestion = newTotal / rubric.items.length

    setRubric({
      totalMarks: Number(newTotal),
      items: rubric.items.map((item) => ({ ...item, mark: marksPerQuestion })),
    })
  }
  return (
    <FieldSet>
      <Field>
        <FieldLabel htmlFor="username">Description</FieldLabel>
        <Input
          id="username"
          autoComplete="off"
          aria-invalid
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="syllabus">Syllabus</FieldLabel>
        <FormProvider
          {...form}
          value={"asd"}
          onValueChange={(v) => console.log(v)}
          onChange={() => console.log(form?.getValues("tags"))}
        >
          <TagsInputField
            name="tags"
            placeholder="Add topics"
            onOpenChange={() => console.log(form?.getValues("tags"))}
          />
        </FormProvider>
      </Field>
      <Field>
        <FieldLabel htmlFor="syllabus">Rubric</FieldLabel>
        {/* Total Marks Row */}
        <div className="grid grid-cols-[3fr_1fr_auto] gap-2 w-full items-center mb-4 border-b pb-2">
          <Input value="Total Marks" disabled className="font-semibold" />
          <Input
            type="number"
            value={rubric.totalMarks}
            onChange={(e) => updateTotalMarks(e.target.value)}
            className="font-semibold"
          />
          <Plus
            className="text-muted-foreground shrink-0 hover:cursor-pointer hover:bg-primary/20 hover:rounded-full transition-all p-1"
            onClick={addRubricItem}
          />
        </div>

        {/* Question Items */}
        <div className="space-y-2">
          {rubric.items.length > 1 &&
            rubric.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[3fr_1fr_auto] gap-2 w-full items-center"
              >
                <Input
                  placeholder="Item name"
                  value={item.item}
                  onChange={(e) =>
                    updateRubricItem(item.id, "item", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  value={item.mark}
                  onChange={(e) =>
                    updateRubricItem(item.id, "mark", e.target.value)
                  }
                />
                <Minus
                  className="text-muted-foreground shrink-0 hover:cursor-pointer hover:bg-primary/20 hover:rounded-full transition-all p-1"
                  onClick={() => removeRubricItem(item.id)}
                />
              </div>
            ))}
        </div>

        {/* Validation message */}
        {Math.abs(
          rubric.items.reduce((sum, item) => sum + item.mark, 0) -
            rubric.totalMarks
        ) > 0.01 && (
          <p className="text-sm text-destructive mt-2">
            Warning: Items don't sum to total mark
          </p>
        )}
      </Field>
    </FieldSet>
  )
}

export default QuizEventForm
