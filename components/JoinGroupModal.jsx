"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JoinGroupModal({ group, onClose, onSuccess, onJoin }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onJoin(group.id, message);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <CardHeader>
          <CardTitle>Join Thesis Group</CardTitle>
          <CardDescription>{group.title}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded text-center">
              <p className="font-semibold">Request submitted successfully!</p>
              <p className="text-sm mt-1">The group creator will review your request.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Info */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Created by
                  </p>
                  <p className="text-slate-900 dark:text-white">
                    {group.creator?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Members
                  </p>
                  <p className="text-slate-900 dark:text-white">
                    {group.members?.length || 0} / {group.maxMembers}
                  </p>
                </div>
                {group.topic && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Topic
                    </p>
                    <p className="text-slate-900 dark:text-white">{group.topic}</p>
                  </div>
                )}
              </div>

              {/* Current Members */}
              {group.members && group.members.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Current Members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member) => (
                      <Badge key={member.id} variant="secondary">
                        {member.user?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Message (Optional)
                </label>
                <Textarea
                  placeholder="Tell the group why you want to join..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Submitting..." : "Request to Join"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
