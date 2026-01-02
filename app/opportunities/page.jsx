"use client";

import React, { useEffect, useState } from "react";
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ThesisApplicationModal from "@/components/ThesisApplicationModal";
import InternshipApplicationModal from "@/components/InternshipApplicationModal";

export default function OpportunitiesPage() {
  const [thesisSlots, setThesisSlots] = useState([]);
  const [internshipSlots, setInternshipSlots] = useState([]);
  const [researchSlots, setResearchSlots] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");

  useEffect(() => {
    fetchOpportunities();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchOpportunities, 30000);
    return () => clearInterval(interval);
  }, [filterDept]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const thesisFromCsv = [];
      const researchFromCsv = [];
      const internshipFromCsv = [];
      const params = new URLSearchParams();
      if (filterDept) params.append("department", filterDept);

        const endpoints = [
          fetch(`/api/thesis?${params}`),
          fetch(`/api/internship?${params}`),
          fetch(`/api/research?${params}`),
          fetch(`/api/supervisor?${params}`),
        ];

        const results = await Promise.allSettled(endpoints);

        // Helper to safely extract JSON or return empty array
        const safeJson = async (resResult) => {
          if (resResult.status !== "fulfilled") return [];
          const res = resResult.value;
          try {
            if (!res || !res.ok) return [];
            const j = await res.json();
            return Array.isArray(j) ? j : [];
          } catch (e) {
            return [];
          }
        };

        const [thesis, internship, research, supervisor] = await Promise.all(
          results.map((r) => safeJson(r))
        );

        setThesisSlots(thesis);
        setInternshipSlots(internship);
        setResearchSlots(research);
        setSupervisors(supervisor);

        // If backend endpoints are not returning data, fallback to CSV
        const isEmpty = thesis.length === 0 && internship.length === 0 && research.length === 0;
        if (isEmpty) {
          try {
            const csvRes = await fetch('/JobOffer.csv');
            if (csvRes.ok) {
              const csvTxt = await csvRes.text();
              const parsed = Papa.parse(csvTxt, { header: true }).data || [];

              parsed.forEach((row, idx) => {
                const oppType = (row['Opportunity Type'] || '').toLowerCase();
                const title = (row['Role/Track'] || row['Opportunity Type'] || row['Organization']).trim();
                const company = (row['Organization'] || '').trim();
                const description = [(row['Key Tech/Focus']||'').trim(), (row['Perks/Offer']||'').trim()].filter(Boolean).join(' • ');
                const skills = (row['Key Tech/Focus'] || '').split(',').map(s=>s.trim()).filter(Boolean);
                const base = {
                  id: `csv-${idx}`,
                  title,
                  description,
                  company,
                  requiredSkills: skills,
                  availableSlots: 1,
                  totalApplications: 0,
                  availableTo: new Date().toISOString(),
                  supervisor: { name: company, email: null }
                };

                if (oppType.includes('thesis')) thesisFromCsv.push(base);
                if (oppType.includes('research')) researchFromCsv.push(base);
                if (oppType.includes('intern')) internshipFromCsv.push(base);

                // some rows like 'Internship/Thesis' should appear in both
                if (!oppType.includes('thesis') && !oppType.includes('research') && !oppType.includes('intern')) {
                  // fallback: classify Research Lab as research, others as internship
                  if ((row['Category']||'').toLowerCase().includes('research')) researchFromCsv.push(base);
                  else internshipFromCsv.push(base);
                }
              });

              // Merge parsed CSV results if APIs returned empty
              if (thesis.length === 0) setThesisSlots(thesisFromCsv);
              if (research.length === 0) setResearchSlots(researchFromCsv);
              if (internship.length === 0) setInternshipSlots(internshipFromCsv);
            }
          } catch (e) {
            console.error('CSV fallback failed', e);
          }
        }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setThesisSlots([]);
      setInternshipSlots([]);
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredThesis = (Array.isArray(thesisSlots) ? thesisSlots : []).filter(
    (slot) =>
      slot?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInternship = (Array.isArray(internshipSlots) ? internshipSlots : []).filter(
    (slot) =>
      slot?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResearch = (Array.isArray(researchSlots) ? researchSlots : []).filter(
    (slot) =>
      slot?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (available) => {
    if (available > 2) return "bg-green-500";
    if (available > 0) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Thesis & Internship Opportunities
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Explore available opportunities and apply to supervisors
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input
            placeholder="Search by title, company, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Filter by department..."
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full"
          />
          <Button onClick={fetchOpportunities} variant="outline" className="w-full">
            Refresh Updates
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="thesis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="thesis">Thesis ({thesisSlots.length})</TabsTrigger>
            <TabsTrigger value="research">Research ({researchSlots.length})</TabsTrigger>
            <TabsTrigger value="internship">Internship ({internshipSlots.length})</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisors ({supervisors.length})</TabsTrigger>
          </TabsList>

          {/* Thesis Tab */}
          <TabsContent value="thesis" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredThesis.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    No thesis opportunities available at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredThesis.map((slot) => (
                <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{slot.title}</CardTitle>
                        <CardDescription className="mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {slot.supervisor?.name || "Unknown Supervisor"}
                          </span>
                          {" • "}
                          <span>{slot.supervisor?.department || "N/A"}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(slot.availableSlots)} text-white`}>
                        {slot.availableSlots > 0
                          ? `${slot.availableSlots} Available`
                          : "Full"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300">{slot.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {slot.requiredSkills?.map((skill, i) => (
                            <Badge key={i} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Deadline
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">
                          {new Date(slot.availableTo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total Applications: {slot.totalApplications}
                          </p>
                          <p className="text-sm font-semibold">
                            Email: {slot.supervisor?.email || "N/A"}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedThesis(slot)}
                          disabled={slot.availableSlots === 0}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredResearch.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    No research opportunities available at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredResearch.map((slot) => (
                <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{slot.title}</CardTitle>
                        <CardDescription className="mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {slot.lead?.name || "Unknown Lead"}
                          </span>
                          {" • "}
                          <span>{slot.lead?.department || "N/A"}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(slot.availableSlots)} text-white`}>
                        {slot.availableSlots > 0 ? `${slot.availableSlots} Available` : "Full"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300">{slot.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Research Area
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">{slot.area}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Deadline
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">
                          {new Date(slot.availableTo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total Applications: {slot.totalApplications}
                          </p>
                          <p className="text-sm font-semibold">Email: {slot.lead?.email || "N/A"}</p>
                        </div>
                        <Button onClick={() => setSelectedThesis(slot)} disabled={slot.availableSlots === 0}>
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Internship Tab */}
          <TabsContent value="internship" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredInternship.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    No internship opportunities available at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInternship.map((slot) => (
                <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{slot.title}</CardTitle>
                        <CardDescription className="mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {slot.company}
                          </span>
                          {" • "}
                          <span>{slot.supervisor?.name || "Unknown Supervisor"}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(slot.availableSlots)} text-white`}>
                        {slot.availableSlots > 0
                          ? `${slot.availableSlots} Available`
                          : "Full"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300">{slot.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Duration
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">
                          {slot.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Stipend
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">
                          {slot.stipend || "TBD"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {slot.requiredSkills?.map((skill, i) => (
                            <Badge key={i} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Deadline
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-2">
                          {new Date(slot.availableTo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Total Applications: {slot.totalApplications}
                          </p>
                          <p className="text-sm font-semibold">
                            Email: {slot.supervisor?.email || "N/A"}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedInternship(slot)}
                          disabled={slot.availableSlots === 0}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Supervisors Tab */}
          <TabsContent value="supervisors" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : supervisors.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    No supervisors available at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              supervisors.map((supervisor) => (
                <Card key={supervisor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{supervisor.name}</CardTitle>
                        <CardDescription className="mb-2">
                          <span>{supervisor.department}</span>
                          {supervisor.phoneNumber && (
                            <>
                              {" • "}
                              <span>{supervisor.phoneNumber}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {supervisor.bio && (
                      <p className="text-slate-700 dark:text-slate-300">{supervisor.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Thesis Opportunities
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {supervisor.openThesisCount}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {supervisor.availableThesisSlots} slots available
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Internship Opportunities
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {supervisor.openInternshipCount}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {supervisor.availableInternshipSlots} slots available
                        </p>
                      </div>
                    </div>

                    {supervisor.expertise && supervisor.expertise.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Expertise
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {supervisor.expertise.map((expertise, i) => (
                            <Badge key={i} variant="secondary">
                              {expertise}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {supervisor.email}
                      </p>
                      {supervisor.office && (
                        <p className="text-sm mt-1">
                          <span className="font-semibold">Office:</span> {supervisor.office}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Modals */}
      {selectedThesis && (
        <ThesisApplicationModal
          thesisSlot={selectedThesis}
          onClose={() => setSelectedThesis(null)}
          onSuccess={() => {
            setSelectedThesis(null);
            fetchOpportunities();
          }}
        />
      )}

      {selectedInternship && (
        <InternshipApplicationModal
          internshipSlot={selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onSuccess={() => {
            setSelectedInternship(null);
            fetchOpportunities();
          }}
        />
      )}
    </div>
  );
}
