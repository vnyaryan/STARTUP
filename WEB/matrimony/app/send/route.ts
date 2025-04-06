import { EmailTemplate } from "@/components/EmailTemplate"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    // You can get data from the request if needed
    // const { email, name } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Matrimony <onboarding@resend.dev>",
      to: ["vny.aryan@gmail.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "John" }),
    })

    if (error) {
      console.error("Error sending email:", error)
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error("Send email error:", error)
    return Response.json({ error: "Failed to send email" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <onboarding@resend.dev>",
      to: ["vny.aryan@gmail.com"],
      subject: "Test Email from GET Request",
      react: EmailTemplate({ firstName: "Test User" }),
    })

    if (error) {
      console.error("Error sending email:", error)
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error("Send email error:", error)
    return Response.json({ error: "Failed to send email" }, { status: 500 })
  }
}

