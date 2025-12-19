import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Help & Support</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Find answers to common questions and learn how to use Course Manager effectively.
          </p>
        </div>

        {/* Getting Started Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Getting Started</CardTitle>
            <CardDescription>Learn the basics of Course Manager</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="signup">
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To create an account, follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Click the <span className="font-semibold">Sign Up</span> button on the login page</li>
                      <li>Enter a valid email address</li>
                      <li>Create a strong password (at least 8 characters recommended)</li>
                      <li>Click <span className="font-semibold">Sign Up</span></li>
                      <li>Check your email for a confirmation link and verify your account</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="login">
                <AccordionTrigger>How do I log in?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To log in to your account:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the login page</li>
                      <li>Enter your registered email address</li>
                      <li>Enter your password</li>
                      <li>Click <span className="font-semibold">Log In</span></li>
                      <li>You will be redirected to your dashboard</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="forgot-password">
                <AccordionTrigger>I forgot my password. What should I do?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>If you forgot your password:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Click <span className="font-semibold">Forgot Password?</span> on the login page</li>
                      <li>Enter your registered email address</li>
                      <li>Check your email for a password reset link</li>
                      <li>Click the link and create a new password</li>
                      <li>Log in with your new password</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Courses</CardTitle>
            <CardDescription>Manage and navigate your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="enroll">
                <AccordionTrigger>How do I enroll in a course?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To enroll in a course:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Navigate to the <span className="font-semibold">Courses</span> section</li>
                      <li>Browse available courses</li>
                      <li>Click on a course to view details</li>
                      <li>Click the <span className="font-semibold">Enroll</span> button</li>
                      <li>Confirm your enrollment</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="view-grades">
                <AccordionTrigger>Where can I view my grades?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To view your grades:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to your <span className="font-semibold">Dashboard</span></li>
                      <li>Select the course from your enrolled courses list</li>
                      <li>Click the <span className="font-semibold">Grades</span> tab</li>
                      <li>Your current grade and assignments will be displayed</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="resources">
                <AccordionTrigger>How do I access course materials and resources?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To access course materials:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Open the course from your dashboard</li>
                      <li>Look for the <span className="font-semibold">Resources</span> or <span className="font-semibold">Materials</span> section</li>
                      <li>Browse available documents, videos, and slides</li>
                      <li>Download or view materials directly</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Assignments & Quizzes Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Assignments & Quizzes</CardTitle>
            <CardDescription>Submit work and take assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="submit-assignment">
                <AccordionTrigger>How do I submit an assignment?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To submit an assignment:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the course and find the <span className="font-semibold">Assignments</span> section</li>
                      <li>Click on the assignment you want to submit</li>
                      <li>Read the requirements and due date</li>
                      <li>Click <span className="font-semibold">Upload</span> or <span className="font-semibold">Submit</span></li>
                      <li>Attach your file and add any comments</li>
                      <li>Click <span className="font-semibold">Submit</span> to finalize</li>
                    </ol>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Note: Make sure to submit before the deadline. Late submissions may not be accepted.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="take-quiz">
                <AccordionTrigger>How do I take a quiz?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To take a quiz:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the course and find the <span className="font-semibold">Quizzes</span> section</li>
                      <li>Click on the quiz you want to take</li>
                      <li>Review the instructions and time limit</li>
                      <li>Click <span className="font-semibold">Start Quiz</span></li>
                      <li>Answer all questions</li>
                      <li>Review your answers and click <span className="font-semibold">Submit</span></li>
                    </ol>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Note: Once submitted, quizzes cannot be retaken unless allowed by your instructor.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Communication Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Communication</CardTitle>
            <CardDescription>Connect with instructors and classmates</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="messaging">
                <AccordionTrigger>How do I send messages to instructors?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To send a message:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Navigate to the <span className="font-semibold">Community</span> section</li>
                      <li>Find <span className="font-semibold">Direct Messages</span></li>
                      <li>Click the <span className="font-semibold">New Message</span> button</li>
                      <li>Select the recipient (instructor or classmate)</li>
                      <li>Type your message and click <span className="font-semibold">Send</span></li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="discussion">
                <AccordionTrigger>How do I participate in course discussions?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>To participate in discussions:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the course and find the <span className="font-semibold">Discussion</span> or <span className="font-semibold">Forum</span> section</li>
                      <li>Browse existing discussions</li>
                      <li>Click on a discussion to view posts</li>
                      <li>Click <span className="font-semibold">Reply</span> to respond to a post</li>
                      <li>Or click <span className="font-semibold">New Discussion</span> to start one</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Troubleshooting Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cannot-login">
                <AccordionTrigger>I cannot log in to my account</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>If you're having trouble logging in, try the following:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Make sure you're using the correct email address</li>
                      <li>Verify your password is correct (check for CAPS LOCK)</li>
                      <li>Clear your browser cache and cookies</li>
                      <li>Try a different browser or device</li>
                      <li>Use the password reset option if you forgot your password</li>
                      <li>Contact support if the issue persists</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cannot-submit">
                <AccordionTrigger>I cannot submit my assignment</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>If you're unable to submit an assignment:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Check if the submission deadline has passed</li>
                      <li>Ensure your file size is within the allowed limit</li>
                      <li>Try a different file format if needed</li>
                      <li>Check your internet connection</li>
                      <li>Refresh the page and try again</li>
                      <li>Contact your instructor if the issue continues</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="page-not-loading">
                <AccordionTrigger>A page is not loading properly</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>If a page is not loading:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Refresh the page (F5 or Cmd+R)</li>
                      <li>Clear your browser cache</li>
                      <li>Disable browser extensions temporarily</li>
                      <li>Try incognito/private browsing mode</li>
                      <li>Use a different browser</li>
                      <li>Check if your internet connection is stable</li>
                      <li>Contact support if the problem persists</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="other-issue">
                <AccordionTrigger>I have a different issue not listed here</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>If your issue is not covered above:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Check the FAQ section on the main website</li>
                      <li>Review your course announcements for known issues</li>
                      <li>Contact your instructor or course support team</li>
                      <li>Email the technical support team with details about your issue</li>
                      <li>Include error messages, browser type, and device information</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Still Need Help?</CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                If you couldn't find the answer you were looking for, please reach out to us:
              </p>
              <div className="space-y-2">
                <p><span className="font-semibold">Email:</span> support@coursemanager.edu</p>
                <p><span className="font-semibold">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-semibold">Hours:</span> Monday - Friday, 9 AM - 5 PM EST</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We'll get back to you as soon as possible. Thank you for using Course Manager!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HelpPage
