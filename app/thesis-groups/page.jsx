"use client";

import React, { useEffect, useState } from "react";
import ThesisFacultyViewer from "@/components/ThesisFacultyViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/AuthContext";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinRequestsModal from "@/components/JoinRequestsModal";
import JoinGroupModal from "@/components/JoinGroupModal";

export default function ThesisGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFacultyViewer, setShowFacultyViewer] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState(null);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    const interval = setInterval(fetchGroups, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/thesis-groups?limit=50");
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);

      // Filter groups where current user is a member
      if (user?.id) {
        const userGroups = data.filter((group) =>
          group.members?.some((m) => m.userId === user.id)
        );
        setMyGroups(userGroups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleJoinGroup = async (groupId, message) => {
    try {
      const response = await fetch("/api/thesis-groups/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          userId: user?.id,
          message,
        }),
      });

      if (response.ok) {
        setSelectedGroupForJoin(null);
        fetchGroups();
      }
    } catch (error) {
      console.error("Error requesting to join:", error);
    }
  };

  const canManageGroup = (group) => group.creator?.id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Thesis Groups
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Collaborate with peers on thesis projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              + Create Group
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowFacultyViewer(true)}>
              Preview Supervisors
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Groups ({groups.length})</TabsTrigger>
            <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
          </TabsList>

          {/* All Groups Tab */}
          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    No thesis groups available yet. Be the first to create one!
                  </p>
                </CardContent>
              </Card>
            ) : (
              groups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{group.title}</CardTitle>
                        <CardDescription className="mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Created by: {group.creator?.name || "Unknown"}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-500">
                        {group.members?.length || 0} / {group.maxMembers} Members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.description && (
                      <p className="text-slate-700 dark:text-slate-300">{group.description}</p>
                    )}

                    {group.topic && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Topic
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">{group.topic}</p>
                      </div>
                    )}

                    {group.members && group.members.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Members
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.members.map((member) => (
                            <Badge key={member.id} variant="secondary">
                              {member.user?.name}
                              {member.role === "CREATOR" && " (Creator)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {group.supervisor && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Supervisor
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          {group.supervisor?.name}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                      {myGroups.find((g) => g.id === group.id) ? (
                        <Badge className="bg-green-500">Member</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setSelectedGroupForJoin(group)}
                          disabled={group.members?.length >= group.maxMembers}
                        >
                          Request to Join
                        </Button>
                      )}

                      {canManageGroup(group) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowJoinRequestsModal(true);
                          }}
                        >
                          Manage Requests ({group.joinRequests?.length || 0})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : myGroups.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    You are not a member of any group yet. Create or join one!
                  </p>
                </CardContent>
              </Card>
            ) : (
              myGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{group.title}</CardTitle>
                        <CardDescription className="mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Created by: {group.creator?.name}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-500">
                        {group.members?.length || 0} / {group.maxMembers} Members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.description && (
                      <p className="text-slate-700 dark:text-slate-300">{group.description}</p>
                    )}

                    {group.members && group.members.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Group Members
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.members.map((member) => (
                            <Badge key={member.id} variant="secondary">
                              {member.user?.name}
                              {member.role === "CREATOR" && " (Creator)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {canManageGroup(group) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowJoinRequestsModal(true);
                        }}
                        className="w-full"
                      >
                        Manage Join Requests ({group.joinRequests?.length || 0})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showFacultyViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 w-[95%] max-w-5xl h-[85%] overflow-auto rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Thesis Faculty Preview</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowFacultyViewer(false)}>
                Close
              </Button>
            </div>
            <ThesisFacultyViewer />
          </div>
        </div>
      )}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateGroup}
          creatorId={user?.id}
        />
      )}

      {selectedGroupForJoin && (
        <JoinGroupModal
          group={selectedGroupForJoin}
          onClose={() => setSelectedGroupForJoin(null)}
          onSuccess={() => {
            setSelectedGroupForJoin(null);
            fetchGroups();
          }}
          onJoin={handleJoinGroup}
        />
      )}

      {showJoinRequestsModal && selectedGroup && (
        <JoinRequestsModal
          group={selectedGroup}
          onClose={() => {
            setShowJoinRequestsModal(false);
            setSelectedGroup(null);
          }}
          onSuccess={fetchGroups}
        />
      )}
    </div>
  );
}
