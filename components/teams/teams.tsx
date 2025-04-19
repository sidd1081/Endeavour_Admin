"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

interface Team {
  _id: string;
  teamName: string;
  eventId: {
    name: string;
    slug: string;
  };
  leaderId: string;
  members: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      college: string;
      collegeId: string;
    };
  }[];
  paymentScreenshot: string;
  paymentTransactionId: string;
  isVerified?: boolean;
  teamCode: string;
}

export default function AllTeamsTable() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/all_teams`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data?.success) {
          setTeams(res.data.data.teams);
          setFilteredTeams(res.data.data.teams);
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };

    fetchTeams();
  }, []);
  useEffect(() => {
    const disableShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
  
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
  
    const detectDevTools = () => {
      const threshold = 160;
      const check = () => {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        if (end - start > threshold) {
          alert("DevTools are not allowed.");
          window.close(); // or redirect to a safe page
        }
      };
      setInterval(check, 1000);
    };
  
    document.addEventListener("keydown", disableShortcuts);
    document.addEventListener("contextmenu", disableContextMenu);
    detectDevTools();
  
    return () => {
      document.removeEventListener("keydown", disableShortcuts);
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  useEffect(() => {
    const filtered = teams.filter((team) => {
      const matchesEvent =
        selectedEvent === "all" || team.eventId.slug === selectedEvent;
      const matchesSearch = team.teamName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesEvent && matchesSearch;
    });
    setFilteredTeams(filtered);
  }, [searchTerm, selectedEvent, teams]);

  const handleShowSS = (team: Team) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  };

  const handleVerifyPayment = async () => {
    if (!selectedTeam) return;

    const confirmVerify = window.confirm(
      `Are you sure you want to verify the payment for "${selectedTeam.teamName}"?`
    );
    if (!confirmVerify) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/verify/${selectedTeam.teamCode}`,
        { isVerified: "true" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast({
          title: "Verified!",
          description: `${selectedTeam.teamName} has been marked as verified.`,
        });

        const updated = teams.map((t) =>
          t.teamCode === selectedTeam.teamCode
            ? { ...t, isVerified: true }
            : t
        );
        setTeams(updated);
        setFilteredTeams(updated);
        setSelectedTeam({ ...selectedTeam, isVerified: true });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description:
          err?.response?.data?.message ||
          "An error occurred while verifying.",
        variant: "destructive",
      });
    }
  };

  const handleOpenMemberDialog = (team: Team) => {
    setSelectedTeam(team);
    setMemberDialogOpen(true);
  };

  const uniqueEvents = Array.from(
    new Map(teams.map((t) => [t.eventId.slug, t.eventId])).values()
  );

  // Export to Excel including leader and member emails
  const exportToExcel = () => {
    const data = filteredTeams.map((team) => {
      const leader = team.members.find(
        (m) => m.userId._id === team.leaderId
      );
      const memberNames = team.members.map((m) => m.userId.name).join(", ");
      const memberPhones = team.members
        .map((m) => m.userId.phone)
        .join(", ");
      const memberEmails = team.members
        .map((m) => m.userId.email)
        .join(", ");

      return {
        "Team Name": team.teamName,
        "Event Name": team.eventId.name,
        "Leader Name": leader?.userId.name || "N/A",
        "Leader Email": leader?.userId.email || "N/A",
        "Leader Phone": leader?.userId.phone || "N/A",
        "Members Names": memberNames,
        "Members Phones": memberPhones,
        "Members Emails": memberEmails,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teams");
    XLSX.writeFile(wb, "teams.xlsx");
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">All Teams</h2>

      {/* Export Button */}
      <Button onClick={exportToExcel} className="mb-4">
        Export to Excel
      </Button>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Input
          placeholder="Search by team name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          onValueChange={(value) => setSelectedEvent(value)}
          defaultValue="all"
        >
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {uniqueEvents.map((event) => (
              <SelectItem key={event.slug} value={event.slug}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teams Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeams.map((team) => {
            const leader = team.members.find(
              (m) => m.userId._id === team.leaderId
            );
            const members = team.members.map((m) => m.userId.name).join(", ");
            return (
              <TableRow key={team._id}>
                <TableCell>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleOpenMemberDialog(team)}
                  >
                    {team.teamName}
                  </button>
                </TableCell>
                <TableCell>{team.eventId.name}</TableCell>
                <TableCell>{leader?.userId.name || "N/A"}</TableCell>
                <TableCell>{members}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleShowSS(team)}>
                    Show SS
                  </Button>
                </TableCell>
                <TableCell>
                  {team.isVerified ? (
                    <span className="text-green-600 font-semibold">Verified</span>
                  ) : (
                    <span className="text-yellow-500 font-semibold">Not Verified</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Dialog for Payment Screenshot */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div>
                <strong>Transaction ID:</strong> {selectedTeam.paymentTransactionId}
              </div>
              <img
                src={selectedTeam.paymentScreenshot}
                alt="Payment Screenshot"
                className="rounded-lg w-full max-h-[70vh] object-contain border shadow"
              />
              {!selectedTeam.isVerified ? (
                <Button onClick={handleVerifyPayment} className="mt-4">
                  ✅ Verify Payment
                </Button>
              ) : (
                <p className="text-green-600 font-medium text-center mt-4">
                  This payment has already been verified.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Team Members */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              {selectedTeam.members.map((m, idx) => {
                const isLeader = m.userId._id === selectedTeam.leaderId;
                return (
                  <div key={m._id} className="border-b pb-2">
                    <p>
                      <strong>{isLeader ? "Leader" : `Member ${idx + 1}`}</strong>: {m.userId.name}
                    </p>
                    <p>Email: {m.userId.email}</p>
                    <p>Phone: {m.userId.phone}</p>
                    <p>College: {m.userId.college}</p>
                    <p>College ID: {m.userId.collegeId}</p>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
