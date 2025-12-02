"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InternshipApplicationModal({
  internshipSlot,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    message: "",
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/applications/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorId: internshipSlot.supervisor.id,
          internshipSlotId: internshipSlot.id,
          message: formData.message,
          resume: formData.resume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <CardHeader>
          <CardTitle>Apply for Internship Opportunity</CardTitle>
          <CardDescription>{internshipSlot.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Internship Details */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Company
                </p>
                <p className="text-slate-900 dark:text-white">
                  {internshipSlot.company}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Supervisor
                </p>
                <p className="text-slate-900 dark:text-white">
                  {internshipSlot.supervisor.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Duration & Stipend
                </p>
                <p className="text-slate-900 dark:text-white">
                  {internshipSlot.duration}
                  {internshipSlot.stipend && ` • ${internshipSlot.stipend}`}
                </p>
              </div>
            </div>

            {/* Application Message */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Cover Letter / Message *
              </label>
              <Textarea
                placeholder="Tell the supervisor why you're interested in this internship and what you can contribute..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="min-h-32"
                required
              />
            </div>

            {/* Resume URL */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Resume URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/resume.pdf"
                value={formData.resume || ""}
                onChange={(e) =>
                  setFormData({ ...formData, resume: e.target.value })
                }
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide a link to your resume or CV
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-3 rounded">
                Application submitted successfully! Redirecting...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || success}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || success} className="flex-1">
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
