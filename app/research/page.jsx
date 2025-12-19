"use client";

import React, { useEffect, useState } from "react";
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
import ThesisApplicationModal from "@/components/ThesisApplicationModal";
import InternshipApplicationModal from "@/components/InternshipApplicationModal";

export default function ResearchPage() {
  const { user } = useAuth();

  // Thesis Groups state
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState(null);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);

  // Opportunities state
  const [thesisSlots, setThesisSlots] = useState([]);
  const [internshipSlots, setInternshipSlots] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // Fetch thesis groups
  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
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
      setGroupsLoading(false);
    }
  };

  // Fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setOpportunitiesLoading(true);
      const params = new URLSearchParams();
      if (filterDept) params.append("department", filterDept);

      const [thesisRes, internshipRes, supervisorRes] = await Promise.all([
        fetch(`/api/thesis?${params}`),
        fetch(`/api/internship?${params}`),
        fetch(`/api/supervisor?${params}`),
      ]);

      const thesis = await thesisRes.json();
      const internship = await internshipRes.json();
      const supervisor = await supervisorRes.json();

      setThesisSlots(Array.isArray(thesis) ? thesis : []);
      setInternshipSlots(Array.isArray(internship) ? internship : []);
      setSupervisors(Array.isArray(supervisor) ? supervisor : []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setThesisSlots([]);
      setInternshipSlots([]);
      setSupervisors([]);
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchOpportunities();

    // Refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchGroups();
      fetchOpportunities();
    }, 30000);

    return () => clearInterval(interval);
  }, [filterDept]);

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

  const getSlotBadgeColor = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return "bg-green-500";
    if (ratio > 0.2) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredThesisSlots = thesisSlots.filter((slot) =>
    slot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.supervisor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInternshipSlots = internshipSlots.filter((slot) =>
    slot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.supervisor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSupervisors = supervisors.filter((supervisor) =>
    supervisor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Research Hub
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Collaborate on thesis projects and explore research opportunities
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Thesis Groups</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          {/* Thesis Groups Tab */}
          <TabsContent value="groups" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Thesis Groups
              </h2>
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                + Create Group
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Groups ({groups.length})</TabsTrigger>
                <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
              </TabsList>

              {/* All Groups Tab */}
              <TabsContent value="all" className="space-y-4 mt-6">
                {groupsLoading ? (
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
                {groupsLoading ? (
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
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Research Opportunities
              </h2>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Departments</option>
                <option value="CSE">Computer Science</option>
                <option value="EEE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
              </select>
            </div>

            <Tabs defaultValue="thesis" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="thesis">Thesis ({filteredThesisSlots.length})</TabsTrigger>
                <TabsTrigger value="internship">Internship ({filteredInternshipSlots.length})</TabsTrigger>
                <TabsTrigger value="supervisors">Supervisors ({filteredSupervisors.length})</TabsTrigger>
              </TabsList>

              {/* Thesis Opportunities */}
              <TabsContent value="thesis" className="space-y-4 mt-6">
                {opportunitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredThesisSlots.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-slate-600 dark:text-slate-400">
                        No thesis opportunities available.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredThesisSlots.map((slot) => (
                    <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{slot.title}</CardTitle>
                            <CardDescription>
                              Supervisor: {slot.supervisor?.name || "Unknown"}
                            </CardDescription>
                          </div>
                          <Badge className={getSlotBadgeColor(slot.currentStudents || 0, slot.maxStudents || 5)}>
                            {slot.currentStudents || 0} / {slot.maxStudents || 5} Students
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {slot.description && (
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            {slot.description}
                          </p>
                        )}

                        {slot.requiredSkills && slot.requiredSkills.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Required Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {slot.requiredSkills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Deadline: {slot.availableTo ? new Date(slot.availableTo).toLocaleDateString() : "Open"}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedThesis(slot)}
                            disabled={(slot.currentStudents || 0) >= (slot.maxStudents || 5)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Internship Opportunities */}
              <TabsContent value="internship" className="space-y-4 mt-6">
                {opportunitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredInternshipSlots.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-slate-600 dark:text-slate-400">
                        No internship opportunities available.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredInternshipSlots.map((slot) => (
                    <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{slot.title}</CardTitle>
                            <CardDescription>
                              {slot.company} • Supervisor: {slot.supervisor?.name || "Unknown"}
                            </CardDescription>
                          </div>
                          <Badge className={getSlotBadgeColor(slot.currentStudents || 0, slot.maxStudents || 3)}>
                            {slot.currentStudents || 0} / {slot.maxStudents || 3} Students
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {slot.description && (
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            {slot.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">Duration</p>
                            <p className="text-slate-700 dark:text-slate-300">{slot.duration || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">Stipend</p>
                            <p className="text-slate-700 dark:text-slate-300">{slot.stipend || "Not specified"}</p>
                          </div>
                        </div>

                        {slot.requiredSkills && slot.requiredSkills.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Required Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {slot.requiredSkills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Deadline: {slot.availableTo ? new Date(slot.availableTo).toLocaleDateString() : "Open"}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedInternship(slot)}
                            disabled={(slot.currentStudents || 0) >= (slot.maxStudents || 3)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Supervisors */}
              <TabsContent value="supervisors" className="space-y-4 mt-6">
                {opportunitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredSupervisors.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-slate-600 dark:text-slate-400">
                        No supervisors found.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSupervisors.map((supervisor) => (
                    <Card key={supervisor.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{supervisor.name}</CardTitle>
                            <CardDescription>
                              {supervisor.department} • {supervisor.designation || "Supervisor"}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-500">
                              {supervisor.currentThesis || 0} / {supervisor.maxThesisSlots || 5} Thesis
                            </Badge>
                            <Badge className="bg-green-500 ml-2">
                              {supervisor.currentInternship || 0} / {supervisor.maxInternshipSlots || 3} Internship
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {supervisor.bio && (
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            {supervisor.bio}
                          </p>
                        )}

                        {supervisor.expertise && supervisor.expertise.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Expertise
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {supervisor.expertise.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">Email</p>
                            <p className="text-slate-700 dark:text-slate-300">{supervisor.email || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">Office</p>
                            <p className="text-slate-700 dark:text-slate-300">{supervisor.office || "Not provided"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Modals */}
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

        {selectedThesis && (
          <ThesisApplicationModal
            thesis={selectedThesis}
            onClose={() => setSelectedThesis(null)}
            onSuccess={() => {
              setSelectedThesis(null);
              fetchOpportunities();
            }}
          />
        )}

        {selectedInternship && (
          <InternshipApplicationModal
            internship={selectedInternship}
            onClose={() => setSelectedInternship(null)}
            onSuccess={() => {
              setSelectedInternship(null);
              fetchOpportunities();
            }}
          />
        )}
      </div>
    </div>
  );
}