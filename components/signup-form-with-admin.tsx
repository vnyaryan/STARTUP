import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

// Add this to your existing signup form component
// Note: This is for development only and should be removed in production

interface SignupFormProps {
  form: any // Replace 'any' with the actual type of your form if available
}

const SignupFormWithAdmin = ({ form }: SignupFormProps) => {
  return (
    <FormField
      control={form.control}
      name="isAdmin"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Admin User</FormLabel>
            <FormDescription>Make this user an administrator (development only)</FormDescription>
          </div>
        </FormItem>
      )}
    />
  )
}

export default SignupFormWithAdmin

// Then in your onSubmit function:
// if (data.isAdmin) {
//   await setUserAsAdmin(result.userId)
// }
