"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function JoinRequestsModal({ group, onClose, onSuccess }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchJoinRequests();
  }, [group.id]);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/thesis-groups/join-requests?groupId=${group.id}&status=PENDING`
      );
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    setProcessing(requestId);

    try {
      const response = await fetch(
        `/api/thesis-groups/join-requests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        setRequests(requests.filter((r) => r.id !== requestId));
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <CardHeader>
          <CardTitle>Join Requests</CardTitle>
          <CardDescription>{group.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400">
              No pending join requests.
            </p>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="border-slate-200 dark:border-slate-700">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {request.user?.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {request.user?.email}
                        </p>
                        {request.user?.studentId && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            ID: {request.user?.studentId}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">Requested</Badge>
                    </div>

                    {request.message && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Message
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                          {request.message}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequest(request.id, "REJECT")}
                        disabled={processing === request.id}
                        className="flex-1"
                      >
                        {processing === request.id ? "Processing..." : "Reject"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, "ACCEPT")}
                        disabled={processing === request.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === request.id ? "Processing..." : "Accept"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
