import SignupForm from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>
        <p className="text-gray-500 text-center mb-8">Join our matrimony platform to find your perfect match</p>
        <SignupForm />
      </div>
    </div>
  )
}
